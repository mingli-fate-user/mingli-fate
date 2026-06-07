import { useState, useEffect } from 'react';
import { Scale, Info } from 'lucide-react';
import AIParser from '@/components/AIParser';
import SaveRecordButton from '@/components/SaveRecordButton';
import DateInput from '@/components/DateInput';
import { useRestoreRecord } from '@/hooks/useRestoreRecord';
import {
  YEAR_WEIGHT, MONTH_WEIGHT, DAY_WEIGHT, HOUR_WEIGHT,
  getShiChenName, formatWeight, weightToNumber, findPoem,
} from '@/data/chengGuData';

// 动态加载 lunar-javascript
let LunarLoaded: any = null;

function loadLunarJS(): Promise<any> {
  if (LunarLoaded) return Promise.resolve(LunarLoaded);
  return new Promise((resolve, reject) => {
    // 如果其他页面已经加载过，直接复用
    const existing = document.querySelector('script[src*="lunar-javascript"]');
    if (existing && (window as any).Lunar) {
      LunarLoaded = (window as any).Lunar;
      resolve(LunarLoaded);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/lunar-javascript@1.7.2/lunar.min.js';
    script.onload = () => {
      LunarLoaded = (window as any).Lunar;
      if (!LunarLoaded) {
        reject(new Error('历法库加载失败：Lunar 未挂载'));
        return;
      }
      resolve(LunarLoaded);
    };
    script.onerror = () => reject(new Error('无法加载历法库'));
    document.head.appendChild(script);
  });
}

interface ChengGuResult {
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  hourGanZhi: string;
  lunarMonth: number;
  lunarDay: number;
  lunarMonthName: string;
  lunarDayName: string;
  shichenName: string;
  yearWeight: number;
  monthWeight: number;
  dayWeight: number;
  hourWeight: number;
  totalWeight: number;
  weightStr: string;
  weightNum: string;
  gender: '男' | '女';
}

export default function ChengGuTool() {
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [birthHour, setBirthHour] = useState(12);
  const [gender, setGender] = useState<'男' | '女'>('男');
  const [result, setResult] = useState<ChengGuResult | null>(null);
  const [libReady, setLibReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [loadError, setLoadError] = useState('');
  const pendingData = useRestoreRecord('chenggu');

  useEffect(() => {
    if (pendingData) {
      setResult(pendingData as unknown as ChengGuResult);
      if ((pendingData as unknown as ChengGuResult).gender) setGender((pendingData as unknown as ChengGuResult).gender);
    }
  }, [pendingData]);

  useEffect(() => {
    loadLunarJS()
      .then(() => setLibReady(true))
      .catch((e) => { setLibReady(false); setLoadError(e.message || '历法库加载失败'); });
  }, []);

  async function handleCalculate() {
    if (!libReady || !LunarLoaded) { alert('正在加载排盘库，请稍后再试'); return; }
    setLoading(true);

    try {
      const [y, m, d] = birthDate.split('-').map(Number);
      if (!y || !m || !d) { alert('请输入完整的出生日期'); setLoading(false); return; }

      // 公历转农历：Lunar.fromDate 方式（不依赖 Solar）
      const lunar = LunarLoaded.fromDate(new Date(y, m - 1, d, birthHour));
      console.log('[称骨] lunar:', lunar.getYearInGanZhi(), lunar.getMonthInChinese(), lunar.getDayInChinese());

      const yearGanZhi = lunar.getYearInGanZhi();
      const shichenName = getShiChenName(birthHour);
      const lunarMonth = lunar.getMonth();
      const lunarDay = lunar.getDay();

      // 获取正确的时柱（用八字排盘方法）
      const bz = lunar.getEightChar();
      const hourGan = bz.getTimeGan();
      const hourZhi = bz.getTimeZhi();

      // 查重量表
      const yearWeight = YEAR_WEIGHT[yearGanZhi] || 0;
      const monthWeight = MONTH_WEIGHT[lunarMonth] || 0;
      const dayWeight = DAY_WEIGHT[lunarDay] || 0;
      const hourWeight = HOUR_WEIGHT[shichenName] || 0;
      const totalWeight = yearWeight + monthWeight + dayWeight + hourWeight;

      setResult({
        yearGanZhi,
        monthGanZhi: lunar.getMonthInGanZhi(),
        dayGanZhi: lunar.getDayInGanZhi(),
        hourGanZhi: hourGan + hourZhi,
        lunarMonth,
        lunarDay,
        lunarMonthName: lunar.getMonthInChinese() + '月',
        lunarDayName: lunar.getDayInChinese(),
        shichenName: shichenName + '时',
        yearWeight,
        monthWeight,
        dayWeight,
        hourWeight,
        totalWeight,
        weightStr: formatWeight(totalWeight),
        weightNum: weightToNumber(totalWeight),
        gender,
      });
    } catch (e: any) {
      console.error('[称骨] 排盘错误:', e);
      alert('排盘出错: ' + (e?.message || e));
    }
    setLoading(false);
  }

  const poem = result ? findPoem(result.weightNum, result.gender) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">袁天罡称骨法</h1>
        <p className="text-white/60">输入生辰八字，称出命中骨重，解读一生运势</p>
        {!libReady && !loadError && <p className="text-xs text-orange-400 mt-2">正在加载历法库...</p>}
      {loadError && <p className="text-xs text-red-400 mt-2">加载失败：{loadError}</p>}
      </div>

      {/* Input */}
      <div className="p-6 border border-blue-100 rounded-lg bg-black/20 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <DateInput
            label="出生日期（公历）"
            value={birthDate}
            onChange={setBirthDate}
            placeholder="例如: 1990-05-15"
            hint="格式: yyyy-mm-dd"
          />
          <div>
            <label className="block text-sm text-white/60 mb-2">性别</label>
            <div className="flex gap-2">
              {(['男', '女'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium border transition-all ${
                    gender === g
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-black/50 text-white/60 border-blue-200 hover:border-blue-300'
                  }`}
                >{g}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">出生时辰</label>
            <select
              value={birthHour}
              onChange={e => setBirthHour(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-black/50 border border-blue-200 rounded-md text-white"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i}:00 - {i}:59</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCalculate}
              disabled={!libReady || loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Scale className="w-4 h-4" />{loading ? '计算中...' : '称骨'}
            </button>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="px-3 py-2 border border-blue-200 text-blue-600 rounded-md hover:bg-blue-500/10"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showHelp && (
          <div className="mt-4 p-4 bg-blue-500/5 border border-blue-100 rounded text-sm text-white/60 space-y-2">
            <p>袁天罡称骨法是唐代著名星象预测家袁天罡所创。将人的生辰八字（年、月、日、时）分别对应重量，</p>
            <p>四项相加得出总骨重，再对照称骨歌诀即可推算一生运势。</p>
            <p className="text-blue-600">注意：年份使用六十甲子干支，月日使用农历，时辰使用十二时辰。</p>
          </div>
        )}
      </div>

      {/* Result */}
      {result && poem && (
        <div className="space-y-6">
          {/* 四柱与农历 */}
          <div className="p-4 border border-blue-100 rounded-lg bg-black/15">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-white/75">年柱</p>
                <p className="text-lg font-bold text-blue-600">{result.yearGanZhi}</p>
              </div>
              <div>
                <p className="text-xs text-white/75">月柱</p>
                <p className="text-lg font-bold text-blue-600">{result.monthGanZhi}</p>
              </div>
              <div>
                <p className="text-xs text-white/75">日柱</p>
                <p className="text-lg font-bold text-blue-600">{result.dayGanZhi}</p>
              </div>
              <div>
                <p className="text-xs text-white/75">时柱</p>
                <p className="text-lg font-bold text-blue-600">{result.hourGanZhi}</p>
              </div>
            </div>
            <p className="text-center text-xs text-white/60 mt-3">
              农历：{result.lunarMonthName} {result.lunarDayName} · {result.shichenName} · 性别：{result.gender}
            </p>
          </div>

          {/* 重量明细 */}
          <div className="p-4 border border-blue-100 rounded-lg bg-black/15">
            <h3 className="text-blue-600 font-bold mb-4 text-center">骨重明细</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: '年柱', value: result.yearWeight, detail: result.yearGanZhi },
                { label: '月柱', value: result.monthWeight, detail: result.lunarMonthName },
                { label: '日柱', value: result.dayWeight, detail: result.lunarDayName },
                { label: '时柱', value: result.hourWeight, detail: result.shichenName },
              ].map((item, i) => (
                <div key={i} className="text-center p-3 border border-blue-100 rounded-lg bg-black/50/50">
                  <p className="text-xs text-white/60 mb-1">{item.label}</p>
                  <p className="text-xs text-white/75 mb-1">{item.detail}</p>
                  <p className="text-xl font-bold text-blue-600">{Math.floor(item.value / 10)}两{item.value % 10}钱</p>
                </div>
              ))}
            </div>
            {/* 总重 */}
            <div className="mt-4 text-center p-4 border-2 border-blue-300 rounded-lg bg-gradient-to-r from-blue-100 to-transparent">
              <p className="text-sm text-white/60 mb-1">总骨重</p>
              <p className="text-4xl font-bold text-blue-600">{result.weightStr}</p>
            </div>
          </div>

          {/* 称骨歌诀 */}
          <div className="p-6 border border-blue-200 rounded-lg bg-black/20">
            <div className="text-center mb-4">
              <h3 className="text-blue-600 font-bold text-lg">{poem.title}</h3>
              <p className="text-xs text-white/75 mt-1">{result.gender}命 · {result.weightStr}</p>
            </div>
            <div className="p-4 border border-blue-100 rounded-lg bg-black/50/50 text-center">
              <p className="text-lg text-white leading-loose font-medium" style={{ fontFamily: 'serif' }}>
                {poem.poem}
              </p>
            </div>
            <p className="text-sm text-white/60 mt-4 leading-relaxed text-center">{poem.note}</p>
          </div>

          {/* AI 解析 */}
          <div className="flex flex-wrap justify-center gap-3 py-4">
            <SaveRecordButton type="chenggu" typeLabel="袁天罡称骨" data={result as unknown as Record<string, unknown>} />
            <AIParser type="chenggu" data={{
              ...result,
              poemTitle: poem.title,
              poem: poem.poem,
              poemNote: poem.note,
            }} />
          </div>

          <p className="text-center text-xs text-white/75">
            袁天罡称骨法仅供学习参考，命运掌握在自己手中
          </p>
        </div>
      )}
    </div>
  );
}
