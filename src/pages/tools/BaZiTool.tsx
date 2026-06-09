import { useState, useEffect } from 'react';
import { Calculator, Info, Baby, Search } from 'lucide-react';
import AIParser from '@/components/AIParser';
import SaveRecordButton from '@/components/SaveRecordButton';
import DateInput from '@/components/DateInput';
import { useRestoreRecord } from '@/hooks/useRestoreRecord';
import IntroModal from '@/components/IntroModal';
import { getToolIntro } from '@/data/toolIntros';
import { callSiliconAPIWithRetry } from '@/utils/apiClient';
import HighlightText from '@/components/HighlightText';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';

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

  // 起名与名字解析
  const [nameInput, setNameInput] = useState('');
  const [nameResult, setNameResult] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameTab, setNameTab] = useState<'qiming' | 'jiexi'>('qiming');

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

  // 八字起名：根据五行缺失给出起名建议
  async function handleNameAnalyze() {
    if (!result) return;
    setNameLoading(true);
    const pillar = `${result.year.gan}${result.year.zhi} ${result.month.gan}${result.month.zhi} ${result.day.gan}${result.day.zhi} ${result.hour.gan}${result.hour.zhi}`;
    const prompt = `你是黄师傅，精通八字起名学。八字为${pillar}，日主${result.dayGan}，性别${result.gender}。
请从以下角度分析：
1. 八字五行旺衰分析
2. 喜用神（起名应补的五行）
3. 起名建议：推荐适合的字（带五行属性），说明为什么
4. 推荐5组好名字（两个字），解释每个名字与八字的配合
像聊天一样自然说，不要编号。${NO_MARKDOWN_RULE}`;
    try {
      const res = await callSiliconAPIWithRetry([
        { role: 'system', content: '你是黄师傅，八字起名专家。' + NO_MARKDOWN_RULE },
        { role: 'user', content: prompt },
      ], { maxTokens: 1500 });
      setNameResult(res);
    } catch {
      setNameResult('分析服务暂时不可用，请稍后重试。');
    }
    setNameLoading(false);
  }

  // 名字解析
  async function handleNameParse() {
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      alert('请输入至少两个汉字的名字');
      return;
    }
    setNameLoading(true);
    const prompt = `你是黄师傅，精通姓名学。请解析名字"${nameInput.trim()}"：
1. 每个字的笔画数和五行属性
2. 三才五格分析（天格、人格、地格、外格、总格）
3. 名字的音韵分析
4. 综合评分和建议
像聊天一样自然说，不要编号。${NO_MARKDOWN_RULE}`;
    try {
      const res = await callSiliconAPIWithRetry([
        { role: 'system', content: '你是黄师傅，姓名学专家。' + NO_MARKDOWN_RULE },
        { role: 'user', content: prompt },
      ], { maxTokens: 1500 });
      setNameResult(res);
    } catch {
      setNameResult('分析服务暂时不可用，请稍后重试。');
    }
    setNameLoading(false);
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
          <div className="mt-2 mb-4"><IntroModal {...getToolIntro('bazi')}/></div>
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

          {/* 八字起名 + 名字解析 */}
          <div className="border border-amber-200/30 rounded-lg overflow-hidden">
            <div className="flex border-b border-amber-200/20">
              {[
                { key: 'qiming' as const, label: '八字起名', icon: Baby },
                { key: 'jiexi' as const, label: '名字解析', icon: Search },
              ].map(t => (
                <button key={t.key} onClick={() => setNameTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all ${nameTab === t.key ? 'text-amber-400 bg-amber-400/10' : 'text-white/40 hover:text-white/60'}`}>
                  <t.icon className="w-3.5 h-3.5" />{t.label}
                </button>
              ))}
            </div>
            <div className="p-4 space-y-3">
              {nameTab === 'qiming' && (
                <div className="space-y-3">
                  <p className="text-xs text-white/40">AI根据八字五行为您推荐适合的名字</p>
                  <button onClick={handleNameAnalyze} disabled={nameLoading}
                    className="w-full px-4 py-2.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/30 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                    <Baby className="w-4 h-4" />{nameLoading ? '分析中...' : '获取起名建议'}
                  </button>
                </div>
              )}
              {nameTab === 'jiexi' && (
                <div className="space-y-3">
                  <p className="text-xs text-white/40">输入名字，AI从姓名学角度为您解析</p>
                  <div className="flex gap-2">
                    <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                      placeholder="输入名字（两个汉字以上）" maxLength={4}
                      className="flex-1 px-3 py-2 bg-black/50 border border-amber-200/20 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-400/30" />
                    <button onClick={handleNameParse} disabled={nameLoading}
                      className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 disabled:opacity-50 flex items-center gap-1.5 transition-all">
                      <Search className="w-3.5 h-3.5" />{nameLoading ? '解析中...' : '解析'}
                    </button>
                  </div>
                </div>
              )}
              {nameResult && (
                <div className="p-3 bg-black/30 rounded-lg border border-amber-200/10">
                  <p className="text-xs text-white/60 leading-relaxed"><HighlightText text={nameResult} /></p>
                </div>
              )}
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
