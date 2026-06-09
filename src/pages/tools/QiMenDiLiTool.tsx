import { useState, useCallback, useEffect } from 'react';
import {
  Sparkles, ArrowRight, Mountain, Home, Star, Loader2,
} from 'lucide-react';
import SaveRecordButton from '@/components/SaveRecordButton';
import { Link, useSearchParams } from 'react-router-dom';
import { GONG_NAMES, type HouseLayout } from '@/data/xuankong';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';
import IntroModal from '@/components/IntroModal';
import { getToolIntro } from '@/data/toolIntros';

const API_KEY_PARTS = ['sk-exbzhkdd', 'usywrlknvkg', 'dzcgjraluip', 'qxhvquzeuw', 'byekdikl'];

// 奇门遁甲占风水地理的九星含义
const QMDL_STAR_MEANING: Record<string, { env: string; house: string; advice: string }> = {
  '天蓬': { env: '靠近水域、湖泊、河流', house: '旺则有大作为，衰则易盗', advice: '适合靠近水源，注意防盗' },
  '天任': { env: '山地、丘陵地带', house: '勤劳踏实，但易积劳', advice: '适合靠山而居，注意健康' },
  '天冲': { env: '交通要道、军事设施附近', house: '旺则一鸣惊人，衰则伤灾', advice: '适合动中求财，注意意外' },
  '天辅': { env: '学校、文化场所附近', house: '旺出人才学者，衰则优柔', advice: '适合文教区，利学业' },
  '天英': { env: '电子、通讯、美容场所', house: '旺则出名，衰则劳碌', advice: '适合繁华地段，注意防火' },
  '天芮': { env: '医院、农田、养殖场', house: '旺则救死扶伤，衰则病', advice: '注意健康，适合种植' },
  '天柱': { env: '演艺、法律场所', house: '旺为栋梁，衰则口舌', advice: '适合文艺行业，防口舌' },
  '天心': { env: '政府机关、金融中心', house: '天心得地才华国栋', advice: '适合权威地段，利事业' },
  '天禽': { env: '名门正派、有影响之地', house: '旺出影响之人', advice: '中心位置，稳定为上' },
};

// 八门在风水中的含义
const QMDL_DOOR_MEANING: Record<string, { meaning: string; advice: string }> = {
  '休门': { meaning: '休养生息，宜安睡休息', advice: '适合卧室、休息区' },
  '生门': { meaning: '生机勃勃，旺财养命', advice: '最佳方位，适合大门、客厅' },
  '伤门': { meaning: '损伤竞争，宜出猎捕', advice: '不宜安床，可设运动区' },
  '杜门': { meaning: '堵塞隐匿，宜藏避', advice: '适合储藏室、密室' },
  '景门': { meaning: '文书考试，宜献策', advice: '适合书房、创意区' },
  '死门': { meaning: '死丧殡葬，宜行刑', advice: '大凶，不宜设置重要房间' },
  '惊门': { meaning: '惊恐是非，宜辩论', advice: '不宜卧室，可设会议室' },
  '开门': { meaning: '开业开工，宜远行', advice: '大吉，适合大门、办公室' },
};

// 八卦九宫
const GONGS = [
  { num: 1, name: '坎', direction: '北', wuxing: '水' },
  { num: 2, name: '坤', direction: '西南', wuxing: '土' },
  { num: 3, name: '震', direction: '东', wuxing: '木' },
  { num: 4, name: '巽', direction: '东南', wuxing: '木' },
  { num: 5, name: '中', direction: '中', wuxing: '土' },
  { num: 6, name: '乾', direction: '西北', wuxing: '金' },
  { num: 7, name: '兑', direction: '西', wuxing: '金' },
  { num: 8, name: '艮', direction: '东北', wuxing: '土' },
  { num: 9, name: '离', direction: '南', wuxing: '火' },
];

interface QiMenDiLiResult {
  year: number;
  month: number;
  day: number;
  hour: number;
  gongs: Array<{
    gong: number;
    name: string;
    direction: string;
    star: string;
    door: string;
    gan: string;
    zhi: string;
    analysis: string;
  }>;
  shengMenGong: number;
    valueFu: string;
    valueShi: string;
    overallAdvice: string;
}

function calculateQiMenDiLi(year: number, month: number, day: number, hour: number): QiMenDiLiResult {
  // 简化版奇门地理排盘 - 基于时间生成伪随机但确定性的排盘
  const seed = year * 10000 + month * 100 + day + hour;

  const stars = ['天蓬', '天任', '天冲', '天辅', '天英', '天芮', '天柱', '天心', '天禽'];
  const doors = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门'];
  const gans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhis = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  const gongs = GONGS.map((g, i) => {
    const sIdx = (seed + i * 7) % stars.length;
    const dIdx = (seed + i * 13 + 3) % doors.length;
    const gIdx = (seed + i * 17) % gans.length;
    const zIdx = (seed + i * 11) % zhis.length;

    const star = stars[sIdx];
    const door = doors[dIdx];
    const starInfo = QMDL_STAR_MEANING[star] || { env: '', house: '', advice: '' };
    const doorInfo = QMDL_DOOR_MEANING[door] || { meaning: '', advice: '' };

    const analysis = `${star}临${g.direction}：${starInfo.env}。${door}主${doorInfo.meaning}。${doorInfo.advice}。`;

    return {
      gong: g.num,
      name: g.name,
      direction: g.direction,
      star,
      door,
      gan: gans[gIdx],
      zhi: zhis[zIdx],
      analysis,
    };
  });

  // 找出生门所在宫
  const shengMenGong = gongs.find(g => g.door === '生门')?.gong || 8;
  const valueFu = gongs[4].star; // 值符在中宫
  const valueShi = gongs[4].door; // 值使在中宫

  // 整体建议
  const overallAdvice = generateOverallAdvice(gongs, shengMenGong);

  return {
    year, month, day, hour,
    gongs,
    shengMenGong,
    valueFu,
    valueShi,
    overallAdvice,
  };
}

function generateOverallAdvice(gongs: QiMenDiLiResult['gongs'], shengMenGong: number): string {
  const shengMen = gongs.find(g => g.gong === shengMenGong);
  const goodGongs = gongs.filter(g => ['生门', '开门', '休门'].includes(g.door));
  const badGongs = gongs.filter(g => ['死门', '惊门', '伤门'].includes(g.door));

  let advice = `值符${gongs[4].star}主事，值使${gongs[4].door}用事。`;
  advice += `生门落${shengMen?.direction || '东北'}方（${shengMenGong}宫），${QMDL_DOOR_MEANING[shengMen?.door || '生门']?.advice || ''}`;

  if (goodGongs.length >= 3) {
    advice += '吉门较多，整体风水格局尚可。';
  } else if (badGongs.length >= 3) {
    advice += '凶门较多，需多加注意调理。';
  } else {
    advice += '吉凶参半，宜因地制宜调整。';
  }

  return advice;
}

export default function QiMenDiLiTool() {
  const [searchParams] = useSearchParams();
  const layoutId = searchParams.get('layoutId');

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(now.getHours());
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<QiMenDiLiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const [importedLayout, setImportedLayout] = useState<HouseLayout | null>(null);

  useEffect(() => {
    if (layoutId) {
      try {
        const raw = localStorage.getItem('fengshui_layouts');
        if (raw) {
          const layouts: HouseLayout[] = JSON.parse(raw);
          const layout = layouts.find(l => l.id === layoutId);
          if (layout) {
            setImportedLayout(layout);
            // 读取转录数据
            const tRaw = localStorage.getItem('fengshui_transcript_' + layoutId);
            if (tRaw) {
              const t = JSON.parse(tRaw);
              if (t.zuoShan) setZuoShan(t.zuoShan);
              if (t.xiang) setXiang(t.xiang);
            }
          }
        }
      } catch { /* ignore */ }
    }
  }, [layoutId]);

  const handleCalculate = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const res = calculateQiMenDiLi(year, month, day, hour);
      setResult(res);
      setLoading(false);
    }, 500);
  }, [year, month, day, hour]);

  // AI
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string; id: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  const handleAI = useCallback(async () => {
    const q = aiInput.trim() || question.trim();
    if (!q || !result) return;

    setAiLoading(true);
    setAiMessages(prev => [...prev, { role: 'user', content: q, id: 'u_' + Date.now() }]);
    setAiInput('');

    try {
      const apiKey = API_KEY_PARTS.join('');
      let prompt = `[奇门遁甲 · 风水地理排盘]\n\n${result.year}年${result.month}月${result.day}日 ${result.hour}时\n\n值符：${result.valueFu}\n值使：${result.valueShi}\n生门：${result.shengMenGong}宫\n\n九宫分布：\n`;
      for (const g of result.gongs) {
        prompt += `${g.direction}（${g.name}宫）：${g.star} · ${g.door} · ${g.gan}${g.zhi}\n`;
      }
      prompt += `\n整体：${result.overallAdvice}\n`;

      if (importedLayout) {
        prompt += `\n【户型数据】\n${importedLayout.name}\n`;
        for (const room of importedLayout.rooms) {
          prompt += `- ${room.name}位于${GONG_NAMES[room.gong || 5]?.direction || '中'}方\n`;
        }
      }

      prompt += `\n【问题】${q}\n\n请黄师傅以奇门遁甲风水学角度分析。`;

      const resp = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V4-Flash',
          messages: [
            {
              role: 'system',
              content: `你是黄师傅，精通奇门遁甲风水地理学。

【身份定位】
自古就有"太乙明天道，奇门晓地理"的说法。你运用奇门遁甲模型解析风水地理。

【分析规则】
1. 以日干为人，时干为住宅
2. 生门代表房子，时干代表房子状态
3. 值符代表大环境
4. 八宫代表房屋各方位
5. 结合九星性质判断旺衰

【语言风格】
半文半白，铁口直断，引用奇门遁甲术语。严禁使用任何markdown格式符号（#和*），所有输出必须是纯文本。` + NO_MARKDOWN_RULE + ` `,
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || '解析失败';

      setAiMessages(prev => [...prev, { role: 'assistant', content, id: 'a_' + Date.now() }]);
    } catch {
      setAiMessages(prev => [...prev, { role: 'assistant', content: '【黄师傅】天机暂隐，请稍后再试。', id: 'a_err_' + Date.now() }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiInput, result, importedLayout, question]);

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    }).catch(() => {});
  }

  // 九宫格
  const NineGrid = ({ result }: { result: QiMenDiLiResult }) => {
    const gongOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
    return (
      <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
        {gongOrder.map(gongNum => {
          const g = result.gongs.find(x => x.gong === gongNum);
          if (!g) return null;
          const isShengMen = g.door === '生门';
          const isGood = ['生门', '开门', '休门'].includes(g.door);
          const isBad = ['死门', '惊门', '伤门'].includes(g.door);

          return (
            <div key={gongNum}
              className={`rounded-xl p-2.5 text-center border transition-all ${
                isShengMen ? 'ring-2 ring-emerald-400/50 bg-emerald-500/15 border-emerald-400/30' :
                isGood ? 'bg-green-500/10 border-green-400/20' :
                isBad ? 'bg-red-500/10 border-red-400/20' :
                'bg-white/5 border-white/10'
              }`}>
              <div className="text-[10px] text-white/40">{g.direction}</div>
              <div className="text-sm font-bold text-amber-300 my-0.5">{g.star}</div>
              <div className={`text-xs font-medium ${isShengMen ? 'text-emerald-300' : isGood ? 'text-green-300' : isBad ? 'text-red-300' : 'text-white/60'}`}>
                {g.door}
              </div>
              <div className="text-[10px] text-white/30 mt-0.5">{g.gan}{g.zhi}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="relative overflow-hidden py-12 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="relative max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-sm">
            <Mountain className="w-4 h-4" />
            奇门晓地理 · 太乙明天道
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-violet-200 to-purple-400" style={{ fontFamily: "'Noto Serif SC', 'KaiTi', serif" }}>
            奇门地理排盘
          </h1>
          <div className="mt-2 mb-4"><IntroModal {...getToolIntro('qimendifa')}/></div>
          <p className="text-purple-200/60 text-lg max-w-2xl mx-auto">
            运用奇门遁甲模型解析风水地理，以九星八门察方位吉凶
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* 导入户型提示 */}
        {importedLayout && (
          <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-emerald-300 text-sm font-medium">已导入户型：{importedLayout.name}</span>
                <span className="text-emerald-400/50 text-xs ml-2">{importedLayout.rooms.length} 个房间</span>
              </div>
            </div>
            <Link to="/tools/fengshui" className="text-xs text-emerald-400 hover:text-emerald-300">更换户型 →</Link>
          </div>
        )}

        {/* 输入 */}
        <div className="bg-gradient-to-br from-purple-950/20 via-violet-950/10 to-purple-950/20 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              { label: '年', value: year, set: setYear },
              { label: '月', value: month, set: setMonth, min: 1, max: 12 },
              { label: '日', value: day, set: setDay, min: 1, max: 31 },
              { label: '时', value: hour, set: setHour, min: 0, max: 23 },
            ].map(f => (
              <div key={f.label} className="space-y-2">
                <label className="text-sm text-purple-300/80">{f.label}</label>
                <input type="number" min={f.min} max={f.max} value={f.value}
                  onChange={e => f.set(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-black/40 border border-purple-400/30 rounded-xl text-white focus:outline-none focus:border-purple-400" />
              </div>
            ))}
          </div>
          {/* 问题输入 */}
          <div className="mb-4">
            <label className="block text-sm text-purple-300/80 mb-2 font-medium">所问之事（选填，用于AI解析）</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)}
              placeholder="例如：这个户型的风水格局如何？事业运在哪个方位？"
              rows={2}
              className="w-full px-4 py-3 bg-black/40 border border-purple-400/30 rounded-xl text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-purple-400" />
          </div>
          <button onClick={handleCalculate} disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-xl shadow-xl hover:shadow-purple-700/30 transition-all">
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />排盘中...</span> : '开始奇门地理排盘'}
          </button>
        </div>

        {/* 结果 */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* 总体 */}
            <div className="bg-gradient-to-r from-purple-950/30 to-violet-950/20 border border-purple-400/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-2">总体分析</h3>
              <p className="text-white/70">{result.overallAdvice}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <span className="text-purple-300/70">值符：{result.valueFu}</span>
                <span className="text-purple-300/70">值使：{result.valueShi}</span>
                <span className="text-emerald-300/70">生门：{result.shengMenGong}宫</span>
              </div>
            </div>

            {/* 九宫 */}
            <div className="bg-white/5 backdrop-blur-xl border border-purple-400/15 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-6 text-center">奇门九宫</h3>
              <NineGrid result={result} />
              <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs">
                <span className="flex items-center gap-1 text-emerald-400/60"><span className="w-2 h-2 rounded-full bg-emerald-400" />生门</span>
                <span className="flex items-center gap-1 text-green-400/60"><span className="w-2 h-2 rounded-full bg-green-400" />吉门</span>
                <span className="flex items-center gap-1 text-red-400/60"><span className="w-2 h-2 rounded-full bg-red-400" />凶门</span>
              </div>
            </div>

            {/* 各宫分析 */}
            <div className="bg-white/5 backdrop-blur-xl border border-purple-400/15 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-4">各宫风水分析</h3>
              <div className="space-y-3">
                {result.gongs.map(g => (
                  <div key={g.gong} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0 border border-purple-400/20">
                      <span className="text-sm font-bold text-purple-300">{g.name}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white/80">{g.direction}方</span>
                        <span className="text-xs text-amber-400/60">{g.star}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          ['生门', '开门', '休门'].includes(g.door) ? 'bg-emerald-500/20 text-emerald-300' :
                          ['死门', '惊门', '伤门'].includes(g.door) ? 'bg-red-500/20 text-red-300' :
                          'bg-white/10 text-white/50'
                        }`}>{g.door}</span>
                      </div>
                      <p className="text-xs text-white/50">{g.analysis}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button onClick={() => {
                setAiOpen(true);
                if (question.trim()) {
                  setTimeout(() => {
                    setAiInput(question);
                    setTimeout(() => {
                      const btn = document.querySelector('[data-qimendi-ai-send]');
                      if (btn) (btn as HTMLButtonElement).click();
                    }, 100);
                  }, 300);
                }
              }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-medium shadow-lg">
                <Sparkles className="w-5 h-5" />AI风水解析
              </button>
              <SaveRecordButton type="xuankong" typeLabel="奇门地理" data={result as unknown as Record<string, unknown>} />
            </div>
          </div>
        )}
      </div>

      {/* AI面板 */}
      {aiOpen && result && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl h-[85vh] bg-gradient-to-b from-[#1a0a1a] to-[#0f080f] border border-purple-400/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-purple-400/20">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-purple-400" />
                <h3 className="text-purple-300 font-bold">奇门地理 · AI解析</h3>
              </div>
              <button onClick={() => setAiOpen(false)} className="text-white/50 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
              {aiMessages.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-purple-300/50 text-sm">输入问题，黄师傅为您解析</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {['这个户型风水如何？', '财位在哪个方位？', '如何调理风水？'].map(q => (
                      <button key={q} onClick={() => setAiInput(q)}
                        className="text-xs px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300/70 hover:bg-purple-500/20">{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {aiMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' ? 'bg-purple-600/30 border border-purple-400/30 text-purple-100' : 'bg-white/5 border border-white/10 text-white/90'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    {msg.role === 'assistant' && (
                      <button onClick={() => copyText(msg.content, msg.id)}
                        className="mt-2 text-xs text-white/40 hover:text-purple-400">
                        {copiedId === msg.id ? '✓ 已复制' : '复制'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-purple-400/70">
                      <Loader2 className="w-4 h-4 animate-spin" />推演中...
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-4 border-t border-purple-400/20">
              <div className="flex gap-2">
                <input type="text" value={aiInput} onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAI()}
                  placeholder="问风水..."
                  className="flex-1 px-4 py-3 bg-black/40 border border-purple-400/30 rounded-xl text-white placeholder:text-white/40 focus:outline-none" />
                <button data-qimendi-ai-send onClick={handleAI} disabled={aiLoading}
                  className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 disabled:opacity-50">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
