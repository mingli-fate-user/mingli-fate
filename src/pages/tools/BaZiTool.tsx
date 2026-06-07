import { useState, useEffect } from 'react';
import { Calculator, Info } from 'lucide-react';
import AIParser from '@/components/AIParser';
import SaveRecordButton from '@/components/SaveRecordButton';
import DateInput from '@/components/DateInput';
import { useRestoreRecord } from '@/hooks/useRestoreRecord';

const WUXING_COLORS: Record<string, string> = {
  '木': 'text-green-400', '火': 'text-red-400', '土': 'text-yellow-400',
  '金': 'text-gray-300', '水': 'text-blue-400',
};

const SHI_SHEN_COLORS: Record<string, string> = {
  '比肩': 'text-blue-600', '劫财': 'text-orange-400', '食神': 'text-green-400',
  '伤官': 'text-red-400', '偏财': 'text-yellow-400', '正财': 'text-yellow-300',
  '七杀': 'text-red-500', '正官': 'text-gray-300', '偏印': 'text-blue-400', '正印': 'text-blue-300',
};

interface BaZiResult {
  year: { gan: string; zhi: string };
  month: { gan: string; zhi: string };
  day: { gan: string; zhi: string };
  hour: { gan: string; zhi: string };
  dayGan: string;
  dayYinYang: string;
  dayWuxing: string;
  zodiacAnimal: string;
  naYin: string[];
  shiShen: Record<string, string>;
  gender: '男' | '女';
  daYunDirection: string;
  [key: string]: unknown;
}

// 动态加载 lunar-javascript
let Lunar: any = null;

function loadLunarJS(): Promise<any> {
  if (Lunar) return Promise.resolve(Lunar);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/lunar-javascript@1.7.2/lunar.min.js';
    script.onload = () => {
      Lunar = (window as any).Lunar;
      resolve(Lunar);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function BaZiTool() {
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [birthHour, setBirthHour] = useState(12);
  const [gender, setGender] = useState<'男' | '女'>('男');
  const [result, setResult] = useState<BaZiResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [libReady, setLibReady] = useState(false);
  const pendingData = useRestoreRecord('bazi');

  // 从保存记录恢复
  useEffect(() => {
    if (pendingData) {
      setResult(pendingData as BaZiResult);
      if (pendingData.gender) setGender(pendingData.gender as '男' | '女');
    }
  }, [pendingData]);

  useEffect(() => {
    loadLunarJS().then(() => setLibReady(true)).catch(() => setLibReady(false));
  }, []);

  async function handleCalculate() {
    if (!libReady) {
      alert('正在加载排盘库，请稍后再试');
      return;
    }
    setLoading(true);
    try {
      const LunarLib = await loadLunarJS();
      const [y, m, d] = birthDate.split('-').map(Number);
      const lunar = LunarLib.fromDate(new Date(y, m - 1, d, birthHour));
      const bz = lunar.getEightChar();

      const dayGan = bz.getDayGan();
      const yearGan = bz.getYearGan();

      // 日元阴阳与五行
      const dayGanMap: Record<string, string> = {
        '甲': '阳木', '乙': '阴木', '丙': '阳火', '丁': '阴火',
        '戊': '阳土', '己': '阴土', '庚': '阳金', '辛': '阴金',
        '壬': '阳水', '癸': '阴水',
      };
      const dayYinYang = dayGanMap[dayGan] || '';

      // 大运走向：阳年男/阴年女顺行，阴年男/阳年女逆行
      const yangGan = ['甲', '丙', '戊', '庚', '壬'];
      const isYearYang = yangGan.includes(yearGan);
      const daYunDirection = (isYearYang && gender === '男') || (!isYearYang && gender === '女')
        ? '顺行（从月柱向后顺排）'
        : '逆行（从月柱向前逆排）';

      setResult({
        year: { gan: yearGan, zhi: bz.getYearZhi() },
        month: { gan: bz.getMonthGan(), zhi: bz.getMonthZhi() },
        day: { gan: dayGan, zhi: bz.getDayZhi() },
        hour: { gan: bz.getTimeGan(), zhi: bz.getTimeZhi() },
        dayGan,
        dayYinYang,
        dayWuxing: dayYinYang,
        zodiacAnimal: lunar.getYearShengXiao(),
        naYin: [bz.getYearNaYin(), bz.getMonthNaYin(), bz.getDayNaYin(), bz.getTimeNaYin()],
        shiShen: {
          yearGan: getShiShen(dayGan, yearGan),
          monthGan: getShiShen(dayGan, bz.getMonthGan()),
          hourGan: getShiShen(dayGan, bz.getTimeGan()),
        },
        gender,
        daYunDirection,
      });
    } catch (e) {
      alert('排盘出错: ' + e);
    }
    setLoading(false);
  }

  function getWX(gan: string) {
    const map: Record<string, string> = {
      '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
      '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
    };
    return WUXING_COLORS[map[gan] || ''] || '';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">八字排盘</h1>
        <p className="text-white/60">基于 lunar-javascript 开源库，精确排盘</p>
        {!libReady && <p className="text-xs text-orange-400 mt-2">正在加载排盘库...</p>}
      </div>

      <div className="p-6 border border-blue-100 rounded-lg bg-black/20 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <DateInput
            label="出生日期"
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
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">出生时辰</label>
            <select value={birthHour} onChange={e => setBirthHour(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-black/50 border border-blue-200 rounded-md text-white">
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i}:00 - {i}:59</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCalculate} disabled={!libReady || loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2">
              <Calculator className="w-4 h-4" />{loading ? '排盘中...' : '排盘'}
            </button>
            <button onClick={() => setShowHelp(!showHelp)}
              className="px-3 py-2 border border-blue-200 text-blue-600 rounded-md hover:bg-blue-500/10">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
        {showHelp && (
          <div className="mt-4 p-4 bg-blue-500/5 border border-blue-100 rounded text-sm text-white/60">
            <p>基于 lunar-javascript 开源库，精确到节气的八字排盘。</p>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          <div className="text-center p-4 bg-blue-500/5 border border-blue-200 rounded-lg space-y-2">
            <p className="text-lg text-blue-600 font-bold">
              {result.year.gan}{result.year.zhi}{result.month.gan}{result.month.zhi}{result.day.gan}{result.day.zhi}{result.hour.gan}{result.hour.zhi}
            </p>
            <p className="text-sm text-white/60">{result.zodiacAnimal}年 · 纳音：{result.naYin.join('、')}</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-white/75">
              <span>性别：{result.gender}</span>
              <span>日主：{result.dayGan}（{result.dayYinYang}）</span>
              <span>大运：{result.daYunDirection}</span>
            </div>
          </div>

          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-5 bg-blue-500/10">
              <div className="px-4 py-3 border-r border-blue-100"></div>
              {['年柱', '月柱', '日柱', '时柱'].map(h => (
                <div key={h} className={`px-4 py-3 text-center font-bold ${h === '日柱' ? 'text-blue-600' : 'text-white/60'}`}>{h}</div>
              ))}
            </div>
            <div className="grid grid-cols-5 border-t border-blue-100">
              <div className="px-4 py-3 text-white/60 text-sm border-r border-blue-100 flex items-center">天干</div>
              {[
                { gan: result.year.gan, shen: result.shiShen.yearGan },
                { gan: result.month.gan, shen: result.shiShen.monthGan },
                { gan: result.day.gan, shen: '日主' },
                { gan: result.hour.gan, shen: result.shiShen.hourGan },
              ].map((item, i) => (
                <div key={i} className="px-4 py-3 text-center border-r border-blue-50 last:border-r-0">
                  <span className={`text-2xl font-bold ${getWX(item.gan)}`}>{item.gan}</span>
                  <span className={`block text-xs mt-1 ${SHI_SHEN_COLORS[item.shen] || 'text-white/75'}`}>{item.shen}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 border-t border-blue-100">
              <div className="px-4 py-3 text-white/60 text-sm border-r border-blue-100 flex items-center">地支</div>
              {[result.year.zhi, result.month.zhi, result.day.zhi, result.hour.zhi].map((z, i) => (
                <div key={i} className="px-4 py-3 text-center border-r border-blue-50 last:border-r-0">
                  <span className="text-2xl font-bold text-white">{z}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 py-4">
            <SaveRecordButton type="bazi" typeLabel="八字排盘" data={result as unknown as Record<string, unknown>} />
            <AIParser type="bazi" data={result} />
          </div>

          <p className="text-center text-xs text-white/75">基于 lunar-javascript 开源库排盘，仅供学习参考</p>
        </div>
      )}
    </div>
  );
}

function getShiShen(dayGan: string, targetGan: string): string {
  const gans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const dayIdx = gans.indexOf(dayGan);
  const targetIdx = gans.indexOf(targetGan);
  const diff = ((targetIdx - dayIdx) % 10 + 10) % 10;
  const dayYinYang = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴'][dayIdx];
  const targetYinYang = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴'][targetIdx];
  const sameYinYang = dayYinYang === targetYinYang;
  const map: Record<number, [string, string]> = {
    0: ['比肩', '劫财'], 2: ['食神', '伤官'], 4: ['偏财', '正财'],
    6: ['七杀', '正官'], 8: ['偏印', '正印'],
  };
  const result = map[diff];
  if (!result) return '';
  return sameYinYang ? result[0] : result[1];
}
