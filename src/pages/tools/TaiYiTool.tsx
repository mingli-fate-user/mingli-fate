import { useState, useCallback, useEffect } from 'react';
import {
  Crown, Sparkles, Send, X, Copy, Check, Loader2,
  RotateCcw, Save, ChevronDown, Info, Globe, Shield,
  AlertTriangle, Swords, Scale, BookOpen, Star,
} from 'lucide-react';
import SaveRecordButton from '@/components/SaveRecordButton';
import HighlightText from '@/components/HighlightText';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';
import IntroModal from '@/components/IntroModal';
import { getToolIntro } from '@/data/toolIntros';
import {
  calculateTaiYi,
  checkNationalFortuneQuestion,
  GONG_NAME,
  GONG_DIRECTION,
  GONG_COLOR,
  type TaiYiResult,
} from '@/data/taiyi';

// ============================================================
// 太乙神数排盘工具 - 三式之首，占国运天文
// ============================================================

const JI_STYLES = [
  { value: 0, label: '年计', desc: '君王之算，占一年国运' },
  { value: 1, label: '月计', desc: '公卿之算，占一月吉凶' },
  { value: 2, label: '日计', desc: '师尹之算，占一日变化' },
  { value: 3, label: '时计', desc: '庶民之算，占一时之机' },
];

const API_KEY_PARTS = ['sk-exbzhkdd', 'usywrlknvkg', 'dzcgjraluip', 'qxhvquzeuw', 'byekdikl'];

export default function TaiYiTool() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const [hour, setHour] = useState(12);
  const [jiStyle, setJiStyle] = useState(0);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<TaiYiResult | null>(null);
  const [loading, setLoading] = useState(false);

  // AI聊天
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string; id: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [rejectedReason, setRejectedReason] = useState('');

  // 排盘
  const handleCalculate = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const res = calculateTaiYi(year, month, day, hour, jiStyle, question);
      setResult(res);
      setLoading(false);
      setAiMessages([]);
      setRejectedReason('');
    }, 800);
  }, [year, month, day, hour, jiStyle, question]);

  // AI解析
  const handleAIAsk = useCallback(async () => {
    const userQuestion = aiInput.trim() || question;
    if (!userQuestion) {
      alert('请输入您要咨询的国运问题');
      return;
    }

    // 国运问题检查
    const check = checkNationalFortuneQuestion(userQuestion);
    if (!check.allowed) {
      setRejectedReason(check.reason);
      setAiMessages(prev => [...prev, {
        role: 'user',
        content: userQuestion,
        id: 'u_' + Date.now(),
      }, {
        role: 'assistant',
        content: check.reason,
        id: 'a_reject_' + Date.now(),
      }]);
      setAiInput('');
      return;
    }

    setRejectedReason('');
    setAiLoading(true);

    const userMsg = { role: 'user', content: userQuestion, id: 'u_' + Date.now() };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');

    try {
      const apiKey = API_KEY_PARTS.join('');
      const prompt = buildTaiYiPrompt(result!, userQuestion);

      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V4-Flash',
          messages: [
            {
              role: 'system',
              content: `你是黄师傅，精通太乙神数（三式之首）的命理大师。

【身份定位】
太乙神数乃上古帝王之术，《太乙金镜式经》云：「太乙者，天帝之神也，主司国运，统摄万方。」此术专用于占天文异象、察国运人事、断战争兵阵。

【核心规则 - 你必须自行判断】
1. 仔细阅读用户的问题，自行判断是否与国运、天下大势、国际关系、战争和平、政权更迭、天灾人祸、经济兴衰等相关
2. 如果是国运相关问题：结合排盘结果详细分析，使用半文半白的古典语言风格，引用古籍增强权威感
3. 如果是个人问题（婚姻、事业、健康、财运等）：严正拒绝，说明太乙神数只测国运
4. 如果问题比较模糊但偏向宏观/社会/国际层面：可以回答
5. 如果问题涉及预测具体国家或地区：可以结合排盘分析

【分析框架】
1. 先述当前太乙局数与阴阳遁
2. 分析太乙所在宫位的国运含义
3. 结合主客胜负判断国际力量对比
4. 检视阳九百六等灾厄之兆
5. 综合格局给出国运走势判断
6. 最后以勉励或警示结尾

【语言风格】半文半白，铁口直断，引用《太乙金镜式经》《太乙统宗宝鉴》等古籍。严禁使用任何markdown格式符号（#和*），所有输出必须是纯文本。` + NO_MARKDOWN_RULE + ` `,
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      // 检查HTTP状态
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API HTTP error:', response.status, errorText);
        setAiMessages(prev => [...prev, {
          role: 'assistant',
          content: `【黄师傅】天机暂隐，API异常（状态码: ${response.status}）。请稍后再试。`,
          id: 'a_err_' + Date.now(),
        }]);
        return;
      }

      const data = await response.json();

      // 检查API返回的错误
      if (data.error) {
        console.error('AI API error:', data.error);
        setAiMessages(prev => [...prev, {
          role: 'assistant',
          content: `【黄师傅】天机暂隐，请稍后再试。（${data.error.message || '服务繁忙'}）`,
          id: 'a_err_' + Date.now(),
        }]);
        return;
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        console.error('AI API empty response:', data);
        setAiMessages(prev => [...prev, {
          role: 'assistant',
          content: '【黄师傅】天机未明，返回为空。请换个问题再试。',
          id: 'a_err_' + Date.now(),
        }]);
        return;
      }

      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content,
        id: 'a_' + Date.now(),
      }]);
    } catch (err) {
      console.error('AI API fetch error:', err);
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: '【黄师傅】天机暂隐，网络异常。请检查网络连接后重试。',
        id: 'a_err_' + Date.now(),
      }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiInput, question, result]);

  function buildTaiYiPrompt(res: TaiYiResult, q: string): string {
    return `[太乙神数 · 国运排盘]

${res.jiStyleName}：${res.year}年${res.month}月${res.day}日

【太乙局数】${res.kookText} · ${res.sanCai}
【阴阳遁】${res.dun}
【太乙纪元】第${res.epoch.cycle}周期 · 第${res.epoch.epoch}纪 · ${res.epoch.epochName} · ${res.epoch.yuanName}

【太乙所在】${GONG_NAME[res.taiYi.gong]}（${GONG_DIRECTION[res.taiYi.gong]}方）
【文昌/天目】${res.skyEyes.god} · 落${GONG_NAME[res.skyEyes.gong]}
【计神】${res.jiGod.zhi}位
【始击/客目】${res.shiJi.zhi}位

【五将分布】
- 太乙：${GONG_NAME[res.fiveGenerals.taiYi.gong]}
- 主大将：${GONG_NAME[res.fiveGenerals.zhuDa.gong]}
- 主参将：${GONG_NAME[res.fiveGenerals.zhuCan.gong]}
- 客大将：${GONG_NAME[res.fiveGenerals.keDa.gong]}
- 客参将：${GONG_NAME[res.fiveGenerals.keCan.gong]}
- 定计将：${GONG_NAME[res.fiveGenerals.dingJi.gong]}

【主客胜负】${res.zhuKe.outcome}
${res.zhuKe.detail}

【阳九百六】
${res.yangJiuBaiLiu.yangJiuInfo}
${res.yangJiuBaiLiu.baiLiuInfo}
${res.yangJiuBaiLiu.warning}

【吉凶格局】
${res.patterns.map(p => `${p.level === '吉' ? '✦' : '✦'} [${p.level}]${p.name}：${p.description}`).join('\n')}

【二十八宿值日】${res.twentyEightStar}

【所问之事】${q}

请黄师傅根据以上太乙神数排盘，详细分析此问。`;
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    }).catch(() => {});
  }

  // 九宫格组件
  const NineGong = ({ data }: { data: TaiYiResult }) => {
    const gongOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6]; // 洛书九宫顺序

    return (
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {gongOrder.map((gong) => {
          const gods = data.gongDistribution[gong] || [];
          const isTaiYi = gong === data.taiYi.gong;
          const isSkyEyes = gong === data.skyEyes.gong;
          const isZhuDa = gong === data.fiveGenerals.zhuDa.gong;
          const isKeDa = gong === data.fiveGenerals.keDa.gong;

          return (
            <div
              key={gong}
              className={`relative rounded-xl p-3 text-center transition-all duration-500 ${
                isTaiYi
                  ? 'bg-amber-500/30 border-2 border-amber-400 shadow-lg shadow-amber-500/30 scale-105'
                  : isSkyEyes
                  ? 'bg-blue-500/20 border border-blue-400/50'
                  : isZhuDa
                  ? 'bg-red-500/15 border border-red-400/40'
                  : isKeDa
                  ? 'bg-emerald-500/15 border border-emerald-400/40'
                  : 'bg-white/5 border border-white/10'
              }`}
              style={{ minHeight: '90px' }}
            >
              {/* 宫位数 */}
              <div className="absolute top-1 left-2 text-xs font-bold" style={{ color: GONG_COLOR[gong] }}>
                {gong}
              </div>
              {/* 宫位名 */}
              <div className="text-xs text-white/60 mt-3 mb-1">
                {GONG_NAME[gong]?.split('宫')[1] || '中'}
              </div>
              {/* 神将 */}
              <div className="flex flex-wrap justify-center gap-0.5">
                {gods.map((god) => (
                  <span
                    key={god}
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      god === '太乙'
                        ? 'bg-amber-500/40 text-amber-200 border border-amber-400/50'
                        : god === '文昌'
                        ? 'bg-blue-500/40 text-blue-200 border border-blue-400/50'
                        : god.includes('主')
                        ? 'bg-red-500/30 text-red-200 border border-red-400/40'
                        : god.includes('客')
                        ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                        : 'bg-white/10 text-white/70 border border-white/20'
                    }`}
                  >
                    {god}
                  </span>
                ))}
              </div>
              {/* 方向 */}
              <div className="text-[10px] text-white/30 mt-1">{GONG_DIRECTION[gong]}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/30 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-sm animate-pulse">
            <Crown className="w-4 h-4" />
            三式之首 · 占国运天文
          </div>
          <h1
            className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-tight"
            style={{ fontFamily: "'Noto Serif SC', 'KaiTi', serif", textShadow: '0 0 40px rgba(245,158,11,0.3)' }}
          >
            太乙神数
          </h1>
          <div className="mt-2 mb-4"><IntroModal {...getToolIntro('taiyi')}/></div>
          <p className="text-amber-200/60 text-lg max-w-2xl mx-auto leading-relaxed">
            《太乙金镜式经》云：太乙者，天帝之神也，主司国运，统摄万方。
            以积年入局，推阴阳七十二局，考阳九百六之数。
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* 输入区域 */}
        <div className="relative bg-gradient-to-br from-amber-950/20 via-yellow-950/10 to-amber-950/20 backdrop-blur-xl border border-amber-400/20 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-amber-900/20">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-yellow-500/5 rounded-2xl pointer-events-none" />

          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm text-amber-300/80 font-medium flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />年
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-4 py-3 bg-black/40 border border-amber-400/30 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-amber-300/80 font-medium flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />月
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-4 py-3 bg-black/40 border border-amber-400/30 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-amber-300/80 font-medium flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />日
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full px-4 py-3 bg-black/40 border border-amber-400/30 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-amber-300/80 font-medium flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />时
              </label>
              <input
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full px-4 py-3 bg-black/40 border border-amber-400/30 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>
          </div>

          {/* 四计选择 */}
          <div className="relative mb-6">
            <label className="text-sm text-amber-300/80 font-medium mb-3 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />太乙四计
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {JI_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setJiStyle(style.value)}
                  className={`relative px-4 py-3 rounded-xl border text-left transition-all duration-300 ${
                    jiStyle === style.value
                      ? 'bg-amber-500/20 border-amber-400/60 shadow-lg shadow-amber-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`text-sm font-semibold ${jiStyle === style.value ? 'text-amber-300' : 'text-white/70'}`}>
                    {style.label}
                  </div>
                  <div className="text-xs text-white/50 mt-1">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 问题输入 */}
          <div className="space-y-2 mb-6">
            <label className="text-sm text-amber-300/80 font-medium flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />所问国运大事（可选）
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例如：当前世界局势走向如何？中美关系将如何发展？..."
              rows={3}
              className="w-full px-4 py-3 bg-black/40 border border-amber-400/30 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
            />
            <p className="text-xs text-amber-400/50 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              太乙神数只测国运大事，不问个人私事
            </p>
          </div>

          {/* 排盘按钮 */}
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="relative w-full py-4 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 text-white font-bold text-lg rounded-xl shadow-xl shadow-amber-900/40 hover:shadow-amber-700/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crown className="w-5 h-5" />}
              {loading ? '推演中...' : '开始太乙排盘'}
            </span>
          </button>
        </div>

        {/* 排盘结果 */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* 基本信息卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 局数 */}
              <div className="relative bg-gradient-to-br from-amber-500/15 to-yellow-500/10 backdrop-blur-xl border border-amber-400/30 rounded-2xl p-6 text-center overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/10 via-transparent to-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3 border border-amber-400/30">
                    <BookOpen className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300 mb-1">
                    {result.kook}
                  </div>
                  <div className="text-sm text-amber-200/70">{result.kookText}</div>
                  <div className="text-xs text-amber-400/50 mt-1">{result.sanCai}</div>
                </div>
              </div>

              {/* 阴阳遁 */}
              <div className={`relative backdrop-blur-xl border rounded-2xl p-6 text-center overflow-hidden group hover:scale-[1.02] transition-all duration-500 ${
                result.dun === '阳遁'
                  ? 'bg-gradient-to-br from-orange-500/15 to-red-500/10 border-orange-400/30'
                  : 'bg-gradient-to-br from-blue-500/15 to-indigo-500/10 border-blue-400/30'
              }`}>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border ${
                    result.dun === '阳遁'
                      ? 'bg-orange-500/20 border-orange-400/30'
                      : 'bg-blue-500/20 border-blue-400/30'
                  }`}>
                    <Swords className={`w-6 h-6 ${result.dun === '阳遁' ? 'text-orange-400' : 'text-blue-400'}`} />
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${result.dun === '阳遁' ? 'text-orange-300' : 'text-blue-300'}`}>
                    {result.dun}
                  </div>
                  <div className="text-sm text-white/60">
                    {result.dun === '阳遁' ? '阳气上升，万物生长' : '阴气主事，潜藏收敛'}
                  </div>
                </div>
              </div>

              {/* 阳九百六 */}
              <div className={`relative backdrop-blur-xl border rounded-2xl p-6 text-center overflow-hidden group hover:scale-[1.02] transition-all duration-500 ${
                result.yangJiuBaiLiu.isYangJiu || result.yangJiuBaiLiu.isBaiLiu
                  ? 'bg-gradient-to-br from-red-500/20 to-rose-500/10 border-red-400/40'
                  : 'bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-400/20'
              }`}>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border ${
                    result.yangJiuBaiLiu.isYangJiu || result.yangJiuBaiLiu.isBaiLiu
                      ? 'bg-red-500/20 border-red-400/30'
                      : 'bg-emerald-500/20 border-emerald-400/30'
                  }`}>
                    <AlertTriangle className={`w-6 h-6 ${
                      result.yangJiuBaiLiu.isYangJiu || result.yangJiuBaiLiu.isBaiLiu
                        ? 'text-red-400'
                        : 'text-emerald-400'
                    }`} />
                  </div>
                  <div className={`text-lg font-bold mb-1 ${
                    result.yangJiuBaiLiu.isYangJiu || result.yangJiuBaiLiu.isBaiLiu
                      ? 'text-red-300'
                      : 'text-emerald-300'
                  }`}>
                    {result.yangJiuBaiLiu.isYangJiu ? '阳九灾年' : result.yangJiuBaiLiu.isBaiLiu ? '百六厄年' : '国运平稳'}
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    {result.yangJiuBaiLiu.yangJiuInfo}
                  </div>
                </div>
              </div>
            </div>

            {/* 九宫格排盘 */}
            <div className="relative bg-gradient-to-br from-amber-950/20 via-transparent to-amber-950/20 backdrop-blur-xl border border-amber-400/20 rounded-2xl p-6 sm:p-8">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
              <h3 className="text-xl font-bold text-amber-300 mb-6 text-center flex items-center justify-center gap-2">
                <Crown className="w-5 h-5" />
                太乙九宫排盘
              </h3>
              <NineGong data={result} />

              {/* 图例 */}
              <div className="flex flex-wrap justify-center gap-3 mt-6 text-xs">
                <span className="flex items-center gap-1 text-amber-300/70">
                  <span className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-400" />太乙
                </span>
                <span className="flex items-center gap-1 text-blue-300/70">
                  <span className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-400" />文昌
                </span>
                <span className="flex items-center gap-1 text-red-300/70">
                  <span className="w-3 h-3 rounded-full bg-red-500/25 border border-red-400" />主大将
                </span>
                <span className="flex items-center gap-1 text-emerald-300/70">
                  <span className="w-3 h-3 rounded-full bg-emerald-500/25 border border-emerald-400" />客大将
                </span>
              </div>
            </div>

            {/* 详细信息 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 五将 */}
              <div className="bg-white/5 backdrop-blur-xl border border-amber-400/15 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
                  <Swords className="w-5 h-5" />太乙五将
                </h4>
                <div className="space-y-3">
                  {[
                    result.fiveGenerals.taiYi,
                    result.fiveGenerals.zhuDa,
                    result.fiveGenerals.zhuCan,
                    result.fiveGenerals.keDa,
                    result.fiveGenerals.keCan,
                    result.fiveGenerals.dingJi,
                  ].map((general) => (
                    <div key={general.name} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-white/80">{general.name}</span>
                      <span className="text-amber-300/80 font-medium">{GONG_NAME[general.gong]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 吉凶格局 */}
              <div className="bg-white/5 backdrop-blur-xl border border-amber-400/15 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5" />吉凶格局
                </h4>
                <div className="space-y-3">
                  {result.patterns.map((p, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border ${
                        p.level === '吉'
                          ? 'bg-emerald-500/10 border-emerald-400/30'
                          : p.level === '凶'
                          ? 'bg-red-500/10 border-red-400/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          p.level === '吉'
                            ? 'bg-emerald-500/30 text-emerald-300'
                            : p.level === '凶'
                            ? 'bg-red-500/30 text-red-300'
                            : 'bg-white/10 text-white/60'
                        }`}>
                          {p.level}
                        </span>
                        <span className="text-white font-medium">{p.name}</span>
                      </div>
                      <p className="text-sm text-white/60">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 主客胜负 */}
            <div className={`bg-gradient-to-r ${
              result.zhuKe.advantage === '主'
                ? 'from-red-950/30 to-orange-950/20 border-red-400/30'
                : result.zhuKe.advantage === '客'
                ? 'from-emerald-950/30 to-green-950/20 border-emerald-400/30'
                : 'from-blue-950/30 to-indigo-950/20 border-blue-400/30'
            } backdrop-blur-xl border rounded-2xl p-6`}>
              <h4 className="text-lg font-bold mb-3 flex items-center gap-2" style={{
                color: result.zhuKe.advantage === '主' ? '#fca5a5' : result.zhuKe.advantage === '客' ? '#6ee7b7' : '#93c5fd',
              }}>
                <Swords className="w-5 h-5" />
                主客胜负：{result.zhuKe.outcome}
              </h4>
              <p className="text-white/70">{result.zhuKe.detail}</p>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  setAiOpen(true);
                  // 如果有question，自动填入并延迟触发发送
                  if (question.trim()) {
                    setTimeout(() => {
                      setAiInput(question);
                      // 延迟触发handleAIAsk
                      setTimeout(() => {
                        const btn = document.getElementById('taiyi-ai-send');
                        if (btn) btn.click();
                      }, 100);
                    }, 300);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-medium shadow-lg shadow-amber-900/30 hover:shadow-amber-700/40 hover:scale-105 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                AI国运解析
              </button>
              <SaveRecordButton
                type="taiyi"
                typeLabel="太乙神数"
                data={result as unknown as Record<string, unknown>}
              />
              <button
                onClick={handleCalculate}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white/80 rounded-xl hover:bg-white/15 transition-all"
              >
                <RotateCcw className="w-4 h-4" />重新排盘
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI 聊天面板 */}
      {aiOpen && result && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl h-[85vh] bg-gradient-to-b from-[#1a1209] to-[#0f0c08] border border-amber-400/30 rounded-2xl shadow-2xl shadow-amber-900/40 flex flex-col overflow-hidden animate-fade-in-scale">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-amber-400/20 bg-amber-950/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-400/30">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-amber-300 font-bold">太乙神数 · AI国运解析</h3>
                  <p className="text-xs text-amber-400/50">三式之首，专占国运大事</p>
                </div>
              </div>
              <button onClick={() => setAiOpen(false)} className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 提示 */}
            <div className="px-6 py-3 bg-amber-500/5 border-b border-amber-400/10">
              <p className="text-xs text-amber-400/60 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" />
                太乙神数只测国运大事（国际关系、战争和平、政权更迭等），不回答个人问题
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
              {aiMessages.length === 0 && (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-400/20">
                    <Globe className="w-8 h-8 text-amber-400/50" />
                  </div>
                  <p className="text-amber-300/50 text-sm">请输入国运大事相关的问题</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['中美关系走向如何？', '世界格局将如何演变？', '明年国际经济形势如何？'].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setAiInput(q); }}
                        className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300/70 hover:bg-amber-500/20 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-amber-600/30 border border-amber-400/30 text-amber-100'
                      : msg.content.includes('【太乙神数 · 国运专占】')
                      ? 'bg-red-500/10 border border-red-400/30 text-red-200'
                      : 'bg-white/5 border border-white/10 text-white/90'
                  }`}>
                    {msg.role === 'assistant' && !msg.content.includes('【太乙神数 · 国运专占】') && (
                      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs text-amber-400/70 font-medium">黄师傅</span>
                      </div>
                    )}
                    <div className="text-sm leading-relaxed"><HighlightText text={msg.content} /></div>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => copyText(msg.content, msg.id)}
                        className="mt-2 flex items-center gap-1 text-xs text-white/40 hover:text-amber-400 transition-colors"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedId === msg.id ? '已复制' : '复制'}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-amber-400/70">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      黄师傅正在推演天机...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 输入 */}
            <div className="px-4 py-4 border-t border-amber-400/20 bg-amber-950/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIAsk()}
                  placeholder="问国运大事..."
                  className="flex-1 px-4 py-3 bg-black/40 border border-amber-400/30 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 transition-all"
                />
                <button
                  id="taiyi-ai-send"
                  onClick={handleAIAsk}
                  disabled={aiLoading}
                  className="px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-500 transition-colors disabled:opacity-50 shadow-lg shadow-amber-900/30"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {result && (
        <div className="max-w-6xl mx-auto px-4 mt-8 text-center">
          <p className="text-xs text-amber-400/40">
            太乙神数排盘仅供学习参考 · 本网站所有内容不构成任何建议
          </p>
        </div>
      )}
    </div>
  );
}
