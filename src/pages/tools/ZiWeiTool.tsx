import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import AIParser from '@/components/AIParser';
import SaveRecordButton from '@/components/SaveRecordButton';
import DateInput from '@/components/DateInput';
import { useRestoreRecord } from '@/hooks/useRestoreRecord';

const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const XING_COLOR: Record<string, string> = {
  '紫微': 'text-purple-400 font-bold', '天府': 'text-yellow-400 font-bold',
  '太阳': 'text-orange-400', '太阴': 'text-blue-300',
  '天机': 'text-green-400', '武曲': 'text-gray-300',
  '天同': 'text-pink-400', '廉贞': 'text-red-400',
  '贪狼': 'text-pink-500', '巨门': 'text-yellow-600',
  '天相': 'text-teal-400', '天梁': 'text-indigo-400',
  '七杀': 'text-red-500 font-bold', '破军': 'text-red-600 font-bold',
  '文昌': 'text-green-300', '文曲': 'text-blue-300',
  '左辅': 'text-green-400', '右弼': 'text-purple-300',
  '天魁': 'text-yellow-300', '天钺': 'text-yellow-400',
  '禄存': 'text-yellow-500 font-bold',
  '擎羊': 'text-red-400', '陀罗': 'text-white/75',
  '火星': 'text-red-500', '铃星': 'text-orange-500',
  '地空': 'text-white/60', '地劫': 'text-white/60',
  '天马': 'text-blue-400',
};

// 紫微斗数十二宫标准排列（从寅开始逆时针）
// 排布位置：[row, col]
const PALACE_LAYOUT: { diZhiIdx: number; name: string }[] = [
  { diZhiIdx: 3, name: '巳' }, { diZhiIdx: 4, name: '午' }, { diZhiIdx: 5, name: '未' }, { diZhiIdx: 6, name: '申' },
  { diZhiIdx: 2, name: '辰' }, { diZhiIdx: 7, name: '酉' },
  { diZhiIdx: 1, name: '卯' }, { diZhiIdx: 8, name: '戌' },
  { diZhiIdx: 0, name: '寅' }, { diZhiIdx: 11, name: '丑' }, { diZhiIdx: 10, name: '子' }, { diZhiIdx: 9, name: '亥' },
];



let iztroLib: any = null;

function loadIztro(): Promise<any> {
  if (iztroLib) return Promise.resolve(iztroLib);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/iztro@2.0.5/dist/iztro.min.js';
    script.onload = () => {
      iztroLib = (window as any).iztro;
      resolve(iztroLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function isValidDate(str: string): boolean {
  if (!str) return false;
  const d = new Date(str);
  return !isNaN(d.getTime());
}

export default function ZiWeiTool() {
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [birthHour, setBirthHour] = useState(12);
  const [gender, setGender] = useState<'男' | '女'>('男');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [libReady, setLibReady] = useState(false);
  const pendingData = useRestoreRecord('ziwei');

  useEffect(() => {
    if (pendingData) setResult(pendingData);
  }, [pendingData]);

  useEffect(() => {
    loadIztro().then(() => setLibReady(true)).catch(() => setLibReady(false));
  }, []);

  async function handleCalc() {
    if (!libReady) { alert('正在加载排盘库'); return; }
    if (!isValidDate(birthDate)) { alert('请输入有效的日期'); return; }
    setLoading(true);
    try {
      const iz = await loadIztro();
      const hourIdx = Math.floor(birthHour / 2) % 12;
      const astrolabe = iz.astro.bySolar(birthDate, hourIdx, gender, true, 'zh-CN');
      setResult(astrolabe);
    } catch (e: any) {
      alert('排盘出错: ' + e.message);
    }
    setLoading(false);
  }

  // 解析palaces按十二地支顺序排列
  function getOrderedPalaces() {
    if (!result?.palaces) return [];
    const ordered: any[] = [];
    for (const layout of PALACE_LAYOUT) {
      const p = result.palaces[layout.diZhiIdx];
      if (p) {
        ordered.push({ ...p, diZhiName: layout.name, diZhiIdx: layout.diZhiIdx });
      }
    }
    return ordered;
  }

  // 渲染单个宫位卡片
  function renderPalaceCard(palace: any, layoutIdx: number) {
    const soul = result?.soul || '';
    const body = result?.body || '';
    const isMing = palace.name === soul;
    const isShen = palace.name === body;
    const majorStars = palace.majorStars || [];
    const minorStars = palace.minorStars || [];
    return (
      <div
        key={layoutIdx}
        className={`relative border rounded-lg p-2 overflow-hidden ${
          isMing
            ? 'border-blue-500/80 bg-gradient-to-br from-blue-100 to-blue-50'
            : isShen
            ? 'border-blue-500/50 bg-gradient-to-br from-blue-900/15 to-blue-900/5'
            : 'border-blue-200 bg-black/50/40'
        }`}
        style={{ minHeight: '100px' }}
      >
        {/* 宫头信息 */}
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-1">
            <span className={`text-[10px] font-bold ${isMing ? 'text-blue-600' : isShen ? 'text-blue-400' : 'text-white/60'}`}>
              {palace.diZhiName}{palace.name}
            </span>
            {isMing && <span className="text-[8px] px-1 py-0.5 bg-blue-500/30 text-blue-600 rounded">命</span>}
            {isShen && <span className="text-[8px] px-1 py-0.5 bg-blue-500/30 text-blue-300 rounded">身</span>}
          </div>
          {palace.decadal?.range && (
            <span className="text-[9px] text-white/75">{palace.decadal.range[0]}-{palace.decadal.range[1]}岁</span>
          )}
        </div>

        {/* 地支天干 */}
        <div className="text-[9px] text-white/75 mb-1">
          {palace.earthlyBranch}{palace.heavenlyStem || ''}
        </div>

        {/* 主星 */}
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mb-1">
          {majorStars.map((star: any) => (
            <span key={star.name} className={`text-[10px] sm:text-xs ${XING_COLOR[star.name] || 'text-white'}`}>
              {star.name}
              {star.mutagen && <span className="text-[8px] ml-0.5 text-blue-600">{star.mutagen}</span>}
              {star.brightness && (
                <span className={`text-[8px] ml-0.5 ${
                  star.brightness === '庙' || star.brightness === '旺' ? 'text-green-400' :
                  star.brightness === '陷' || star.brightness === '不' ? 'text-red-400' : 'text-white/75'
                }`}>
                  {star.brightness}
                </span>
              )}
            </span>
          ))}
        </div>

        {/* 辅星 */}
        {minorStars.length > 0 && (
          <div className="flex flex-wrap gap-x-1 gap-y-0.5">
            {minorStars.slice(0, 6).map((star: any) => (
              <span key={typeof star === 'string' ? star : star.name} className={`text-[9px] ${XING_COLOR[typeof star === 'string' ? star : star.name] || 'text-white/75'}`}>
                {typeof star === 'string' ? star : star.name}
              </span>
            ))}
          </div>
        )}

        {/* 空宫标记 */}
        {majorStars.length === 0 && minorStars.length === 0 && (
          <span className="text-[10px] text-[#3a352f]">空宫</span>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">紫微斗数排盘</h1>
        <p className="text-white/60">基于 iztro 开源库，十二宫排盘，精确星曜庙旺</p>
        {!libReady && <p className="text-xs text-orange-400 mt-2">正在加载排盘库...</p>}
      </div>

      {/* Input */}
      <div className="p-6 border border-blue-100 rounded-lg bg-black/20 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <DateInput label="出生日期（阳历）" value={birthDate} onChange={setBirthDate} placeholder="例如: 1990-05-15" hint="格式: yyyy-mm-dd" />
          <div>
            <label className="block text-sm text-white/60 mb-2">出生时辰</label>
            <select value={birthHour} onChange={e => setBirthHour(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-black/50 border border-blue-200 rounded-md text-white">
              {DI_ZHI.map((z, i) => (
                <option key={i} value={i * 2}>{z}时 ({String(i*2).padStart(2,'0')}:00-{String(i*2+1).padStart(2,'0')}:59)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">性别</label>
            <div className="flex gap-2">
              {(['男', '女'] as const).map(g => (
                <button key={g} onClick={() => setGender(g)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    gender === g ? 'bg-blue-500 text-white border-blue-500' : 'bg-black/50 text-white/60 border-blue-200 hover:border-blue-300'
                  }`}>{g}</button>
              ))}
            </div>
          </div>
          <button onClick={handleCalc} disabled={!libReady || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:opacity-50">
            <Star className="w-4 h-4 inline mr-1" />{loading ? '排盘中...' : '排盘'}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* 命盘头部信息 */}
          <div className="text-center p-4 bg-blue-500/5 border border-blue-200 rounded-lg">
            <p className="text-lg text-blue-600 font-bold">
              {result.chineseDate || ''} · {result.zodiac || ''} · 五行局：{result.fiveElementsClass || ''}
            </p>
            <p className="text-sm text-white/60 mt-1">
              命宫在{result.soul || ''} · 身宫在{result.body || ''}
            </p>
          </div>

          {/* === 十二宫高级排盘 === */}
          <div className="border border-blue-200 rounded-xl p-3 sm:p-4 bg-black/15">
            <h3 className="text-blue-600 font-bold text-center mb-3 text-sm">十二宫命盘</h3>

            {/* 紫微斗数标准十二宫布局 */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {/* 第一行: 巳 午 未 申 */}
              {renderPalaceCard(getOrderedPalaces()[0], 0)}
              {renderPalaceCard(getOrderedPalaces()[1], 1)}
              {renderPalaceCard(getOrderedPalaces()[2], 2)}
              {renderPalaceCard(getOrderedPalaces()[3], 3)}

              {/* 第二行: 辰 [命盘中心信息] 酉 */}
              {renderPalaceCard(getOrderedPalaces()[4], 4)}
              {/* 中心区域 - 显示命盘基本信息 */}
              <div className="col-span-2 row-span-2 border border-blue-300 rounded-lg bg-gradient-to-br from-blue-100 to-slate-50/50 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#3b82f6_1px,transparent_1px)] bg-[length:12px_12px]" />
                <p className="text-blue-600 font-bold text-sm sm:text-base mb-1 relative z-10">紫微斗数命盘</p>
                <p className="text-white/60 text-[10px] sm:text-xs mb-2 relative z-10">{result.chineseDate}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] sm:text-xs relative z-10">
                  <span className="text-white/75">命宫:</span><span className="text-blue-600">{result.soul}</span>
                  <span className="text-white/75">身宫:</span><span className="text-blue-400">{result.body}</span>
                  <span className="text-white/75">生肖:</span><span className="text-white">{result.zodiac}</span>
                  <span className="text-white/75">五行:</span><span className="text-white">{result.fiveElementsClass}</span>
                </div>
                {/* 命主身主 */}
                {(result.soulStar || result.bodyStar) && (
                  <div className="mt-2 flex gap-3 text-[10px] relative z-10">
                    {result.soulStar && <span className="text-white/75">命主:<span className="text-purple-400 ml-1">{result.soulStar}</span></span>}
                    {result.bodyStar && <span className="text-white/75">身主:<span className="text-blue-400 ml-1">{result.bodyStar}</span></span>}
                  </div>
                )}
              </div>
              {renderPalaceCard(getOrderedPalaces()[5], 5)}

              {/* 第三行: 卯 [中心继续] 戌 */}
              {renderPalaceCard(getOrderedPalaces()[6], 6)}
              {renderPalaceCard(getOrderedPalaces()[7], 7)}

              {/* 第四行: 寅 丑 子 亥 */}
              {renderPalaceCard(getOrderedPalaces()[8], 8)}
              {renderPalaceCard(getOrderedPalaces()[9], 9)}
              {renderPalaceCard(getOrderedPalaces()[10], 10)}
              {renderPalaceCard(getOrderedPalaces()[11], 11)}
            </div>
          </div>

          {/* 四化飞星总览 */}
          {result.mutagens && Object.keys(result.mutagens).length > 0 && (
            <div className="p-4 border border-blue-100 rounded-lg bg-black/15">
              <h3 className="text-blue-600 font-bold text-center mb-3 text-sm">四化飞星</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                {Object.entries(result.mutagens).map(([gan, changes]: [string, any]) => (
                  <div key={gan} className="p-2 border border-blue-100 rounded bg-black/50/50">
                    <p className="text-xs text-white/60 mb-1">{gan}干四化</p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {Object.entries(changes).map(([type, star]: [string, any]) => (
                        <span key={type} className="text-[10px] text-blue-600">
                          {star}<span className="text-white/75">·{type}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI */}
          <div className="flex flex-wrap justify-center gap-3 py-4">
            <SaveRecordButton type="ziwei" typeLabel="紫微斗数" data={result as unknown as Record<string, unknown>} />
            <AIParser type="ziwei" data={{
              zodiac: result.zodiac || '',
              fiveElements: result.fiveElementsClass || '',
              chineseDate: result.chineseDate || '',
              soul: result.soul || '',
              body: result.body || '',
              palaces: (result.palaces || []).map((p: any) => ({
                name: p.name,
                earthlyBranch: p.earthlyBranch,
                majorStars: (p.majorStars || []).map((s: any) => ({ name: s.name || s, mutagen: s.mutagen || '' })),
                minorStars: (p.minorStars || []).filter(Boolean).map((s: any) => typeof s === 'string' ? s : s.name),
              })),
            }} />
          </div>
          <p className="text-center text-xs text-white/75">基于 iztro 开源库排盘，仅供学习参考</p>
        </div>
      )}
    </div>
  );
}
