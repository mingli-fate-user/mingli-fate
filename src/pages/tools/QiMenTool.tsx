import { useState, useEffect, useCallback } from 'react';
import { Grid3X3, Info } from 'lucide-react';
import AIParser from '@/components/AIParser';
import SaveRecordButton from '@/components/SaveRecordButton';
import DateInput from '@/components/DateInput';
import { useRestoreRecord } from '@/hooks/useRestoreRecord';

// 动态import CJS模块
type TaobiType = any;
let taobiModule: TaobiType = null;

async function getTaobi(): Promise<TaobiType> {
  if (taobiModule) return taobiModule;
  const mod = await import('taobi');
  taobiModule = mod;
  return mod;
}

// 24节气名称（按during数组顺序）
const SOLAR_TERMS = [
  '小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨',
  '立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑',
  '白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至',
];

// 宫位名称和方向（按3x3数组位置）
const PALACE_INFO = [
  { name: '巽四', dir: '东南', idx: 3 },
  { name: '离九', dir: '南', idx: 8 },
  { name: '坤二', dir: '西南', idx: 1 },
  { name: '震三', dir: '东', idx: 2 },
  { name: '中五', dir: '中', idx: 4 },
  { name: '兑七', dir: '西', idx: 6 },
  { name: '艮八', dir: '东北', idx: 7 },
  { name: '坎一', dir: '北', idx: 0 },
  { name: '乾六', dir: '西北', idx: 5 },
];

// 九星名称
const STAR_NAMES = ['天蓬','天任','天冲','天辅','天英','天芮','天柱','天心'];
const DOOR_NAMES = ['休门','生门','伤门','杜门','景门','死门','惊门','开门'];

interface PalaceData {
  god: string;      // 八神
  star: string;     // 九星
  door: string;     // 八门
  tianPan: string;  // 天盘干
  palace: string;   // 宫位名
  diPan: string;    // 地盘干
  row: number;
  col: number;
}

interface QimenResult {
  ju: number;
  yinYang: string;
  jieQi: string;
  sanYuan: string;
  yearZhu: string;
  monthZhu: string;
  dayZhu: string;
  hourZhu: string;
  zhiFu: string;
  zhiShi: string;
  xunShou: string;
  kongWang: string;
  palaces: PalaceData[];
}

function getGan(idx: number): string {
  return ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'][idx] || '';
}
function getZhi(idx: number): string {
  return ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][idx] || '';
}

export default function QiMenTool() {
  const [date, setDate] = useState(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  const [result, setResult] = useState<QimenResult | null>(null);
  const [libReady, setLibReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'all' | 'diPan' | 'tianPan' | 'door' | 'star' | 'god'>('all');
  const [loadError, setLoadError] = useState('');
  const pendingData = useRestoreRecord('qimen');

  useEffect(() => {
    if (pendingData) setResult(pendingData as unknown as QimenResult);
  }, [pendingData]);

  useEffect(() => {
    getTaobi()
      .then(() => setLibReady(true))
      .catch((e: any) => { setLibReady(false); setLoadError(e?.message || '加载失败'); });
  }, []);

  const handleCalculate = useCallback(async () => {
    if (!libReady) { alert('正在加载排盘库'); return; }
    setLoading(true);
    setLoadError('');

    try {
      const mod = await getTaobi();
      const { TheArtOfBecomingInvisible } = mod;

      const normalizedDate = date.trim().replace(' ', 'T');
      const d = new Date(normalizedDate);
      if (isNaN(d.getTime())) { alert('日期格式不正确'); setLoading(false); return; }

      const taobi = new TheArtOfBecomingInvisible(d);
      const canvas = taobi.getCanvas() as any[][][];

      // 解析canvas九宫格
      const palaces: PalaceData[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const cell = canvas[r][c];
          const info = PALACE_INFO[r * 3 + c];
          palaces.push({
            god: cell[0][0] || '',
            door: cell[1][0] || '',
            tianPan: cell[1][2] || '',
            star: cell[2][0] || '',
            palace: cell[2][1] || info.name,
            diPan: '',
            row: r,
            col: c,
          });
        }
      }

      // 获取地盘干
      const diPanMap: Record<string, string> = {};
      const nums = ['one','two','three','four','five','six','seven','eight','nine'];
      const nameMap = ['坎一','坤二','震三','巽四','中五','乾六','兑七','艮八','离九'];
      for (let i = 0; i < nums.length; i++) {
        const obj = taobi[nums[i]];
        if (obj) {
          const gz = getGan(obj.logos) + getZhi(obj.phases);
          diPanMap[nameMap[i]] = gz;
        }
      }
      palaces.forEach(p => { p.diPan = diPanMap[p.palace] || ''; });

      // 获取四柱
      const getGZ = (obj: any) => {
        if (!obj || !obj.x) return '';
        return getGan(obj.x.index) + getZhi(obj.y?.index ?? 0);
      };

      // 获取阴阳遁
      const during = taobi.calendar?.during || [];
      const time = new Date(taobi.time);
      let isYin = false;
      if (during.length >= 24) {
        const xiaZhi = new Date(during[11]); // 夏至
        const dongZhi = new Date(during[22]); // 冬至
        isYin = (time >= xiaZhi && time < dongZhi);
      }

      // 获取节气
      let jieQi = '';
      for (let i = 0; i < during.length - 1; i++) {
        if (time >= new Date(during[i]) && time < new Date(during[i + 1])) {
          jieQi = SOLAR_TERMS[i] || '';
          break;
        }
      }

      // 三元
      const element = taobi.OPTIONS?.element;
      const sanYuan = element === 0 ? '上元' : element === 1 ? '中元' : element === 2 ? '下元' : '';

      // 值符值使
      const zhiFu = STAR_NAMES[taobi.mandate] || '';
      const zhiShi = DOOR_NAMES[taobi.symbol] || '';

      setResult({
        ju: taobi.round || 0,
        yinYang: isYin ? '阴' : '阳',
        jieQi,
        sanYuan,
        yearZhu: getGZ(taobi.year),
        monthZhu: getGZ(taobi.month),
        dayZhu: getGZ(taobi.date),
        hourZhu: getGZ(taobi.hour),
        zhiFu,
        zhiShi,
        xunShou: '',
        kongWang: '',
        palaces,
      });
    } catch (e: any) {
      console.error('[奇门] 排盘错误:', e);
      setLoadError(e?.message || String(e));
    }
    setLoading(false);
  }, [libReady, date]);

  // 渲染单个宫位
  function renderPalace(p: PalaceData) {
    const isCenter = p.palace === '中五';
    return (
      <div
        key={`${p.row}-${p.col}`}
        className={`relative border rounded-lg p-2 sm:p-3 transition-all ${
          isCenter
            ? 'border-blue-500/60 bg-gradient-to-br from-blue-100 to-blue-50'
            : 'border-blue-200 bg-black/50/60 hover:border-blue-300'
        }`}
      >
        <div className="flex justify-between items-center mb-1.5">
          <span className={`text-[10px] sm:text-xs font-bold ${isCenter ? 'text-blue-600' : 'text-white/75'}`}>{p.palace}</span>
          <span className="text-[9px] text-white/75">{p.diPan}</span>
        </div>

        {(activeLayer === 'all' || activeLayer === 'god') && p.god && (
          <div className="text-center mb-0.5">
            <span className="text-[9px] sm:text-[10px] px-1 py-0.5 rounded bg-purple-900/30 text-purple-300">{p.god}</span>
          </div>
        )}

        {(activeLayer === 'all' || activeLayer === 'star') && p.star && (
          <div className="text-center mb-0.5">
            <span className="text-[10px] sm:text-xs text-blue-300 font-medium">{p.star}</span>
          </div>
        )}

        {(activeLayer === 'all' || activeLayer === 'door') && p.door && (
          <div className="text-center mb-0.5">
            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-green-900/30 text-green-300 font-medium">{p.door}</span>
          </div>
        )}

        {(activeLayer === 'all' || activeLayer === 'tianPan') && p.tianPan && (
          <div className="text-center">
            <span className="text-base sm:text-lg font-bold text-white">{p.tianPan}</span>
          </div>
        )}

        {(activeLayer === 'all' || activeLayer === 'diPan') && p.diPan && (
          <div className="text-center mt-1 pt-1 border-t border-blue-100">
            <span className="text-xs text-white/60">{p.diPan}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">奇门遁甲排盘</h1>
        <p className="text-white/60">时家奇门，天文算法精确节气，九宫格展示天地人神四层盘</p>
        {!libReady && !loadError && <p className="text-xs text-orange-400 mt-2">正在加载排盘库...</p>}
        {loadError && <p className="text-xs text-red-400 mt-2">加载失败：{loadError}</p>}
      </div>

      {/* Input */}
      <div className="p-6 border border-blue-100 rounded-lg bg-black/20 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <DateInput label="选择日期时间（自动定局）" value={date} onChange={setDate} placeholder="例如: 2026-05-28 14:30" hint="格式: yyyy-mm-dd hh:mm" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCalculate} disabled={loading || !libReady}
              className="px-6 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap">
              {loading ? '排盘中...' : <><Grid3X3 className="w-4 h-4 inline mr-1" />排盘</>}
            </button>
            <button onClick={() => setShowHelp(!showHelp)} className="px-3 py-2 border border-blue-200 text-blue-600 rounded-md hover:bg-blue-500/10">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
        {showHelp && (
          <div className="mt-4 p-4 bg-blue-500/5 border border-blue-100 rounded text-sm text-white/60 space-y-2">
            <p>奇门遁甲以时间起局，排出地盘、天盘、八门、九星、八神五层信息。采用天文VSOP87D算法精确计算二十四节气。</p>
            <p>九宫格中，从上到下依次为：八神、九星、八门、天盘干、地盘干。</p>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="p-4 border border-blue-100 rounded-lg bg-black/15">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-white/75">四柱</p>
                <p className="text-sm text-blue-600">{result.yearZhu} {result.monthZhu}</p>
                <p className="text-sm text-blue-600">{result.dayZhu} {result.hourZhu}</p>
              </div>
              <div>
                <p className="text-xs text-white/75">节气 · 三元</p>
                <p className="text-sm text-white">{result.jieQi}</p>
                <p className="text-sm text-blue-600">{result.sanYuan}</p>
              </div>
              <div>
                <p className="text-xs text-white/75">阴阳遁 · 局数</p>
                <p className="text-sm text-white">{result.yinYang}遁</p>
                <p className="text-2xl font-bold text-blue-600">{result.ju}局</p>
              </div>
              <div>
                <p className="text-xs text-white/75">值符 · 值使</p>
                <p className="text-sm text-white">{result.zhiFu}</p>
                <p className="text-sm text-blue-600">{result.zhiShi}</p>
              </div>
            </div>
          </div>

          {/* 层叠切换 */}
          <div className="flex flex-wrap justify-center gap-2">
            {[{key:'all',label:'全览'},{key:'diPan',label:'地盘'},{key:'tianPan',label:'天盘'},{key:'door',label:'八门'},{key:'star',label:'九星'},{key:'god',label:'八神'}].map(l => (
              <button key={l.key} onClick={() => setActiveLayer(l.key as typeof activeLayer)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${activeLayer === l.key ? 'bg-blue-500 text-white border-blue-500' : 'bg-black/50 text-white/60 border-blue-200 hover:border-blue-300'}`}>
                {l.label}
              </button>
            ))}
          </div>

          {/* 九宫格 */}
          <div>
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-blue-600">{result.yinYang}遁{result.ju}局 · {result.jieQi} · {result.sanYuan}</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
              {result.palaces.map(p => renderPalace(p))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-900/60"></span>八神</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-900/60"></span>九星</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-900/60"></span>八门</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/40"></span>天盘干</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span>地盘干</span>
            </div>
          </div>

          {/* AI */}
          <div className="flex flex-wrap justify-center gap-3 py-4">
            <SaveRecordButton type="qimen" typeLabel="奇门遁甲" data={result as unknown as Record<string, unknown>} />
            <AIParser type="qimen" data={result as unknown as Record<string, unknown>} />
          </div>
          <p className="text-center text-xs text-white/75">奇门遁甲排盘仅供学习参考</p>
        </div>
      )}
    </div>
  );
}
