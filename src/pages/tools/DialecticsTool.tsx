import { useState, useCallback } from 'react';
import {
  Flame, Sparkles, Send, BookOpen, Swords, Eye, Globe,
  Zap, TrendingUp, ArrowRight, Loader2, Copy, Check,
  Lightbulb, Target, Layers, AlertTriangle
} from 'lucide-react';
import { streamSiliconAPI } from '@/utils/apiClient';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';
import { MARXIST_FRAMEWORK, ANALYSIS_COLORS, type DialecticsAnalysis } from '@/data/dialectics';
import HighlightText from '@/components/HighlightText';
import IntroModal from '@/components/IntroModal';

const INTRO_DATA = {
  title: '唯物辩证法分析',
  what: '运用马克思主义辩证唯物主义和历史唯物主义的科学方法论，对现实问题进行系统性、结构化分析。通过矛盾分析法、量变质变规律、否定之否定规律等核心工具，透过现象看本质，找到问题的根源和解决路径。',
  history: '唯物辩证法由马克思和恩格斯在批判继承黑格尔辩证法的基础上创立，后经列宁和教员进一步发展。教员在《矛盾论》《实践论》中系统阐述了矛盾分析法，成为认识世界和改造世界的强大思想武器。',
  how: '详细描述您面临的问题（越详细越好），AI将运用唯物辩证法进行结构化剖析，生成起因/经过/结果分析图，识别主要矛盾和次要矛盾，并给出基于马克思主义哲学的深度解析和行动建议。',
  color: '#ef4444',
};

export default function DialecticsTool() {
  const [problem, setProblem] = useState('');
  const [analysis, setAnalysis] = useState<DialecticsAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // AI解析
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string; id: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  // 剖析分析
  const handleAnalyze = useCallback(async () => {
    const q = problem.trim();
    if (q.length < 10) {
      alert('请详细描述您的问题（至少10个字），越详细分析越精准');
      return;
    }
    setAnalyzing(true);
    setAnalysis(null);

    let full = '';
    const id = Date.now().toString();

    await new Promise<void>((resolve) => {
      streamSiliconAPI([
        {
          role: 'system',
          content: `你是辩证唯物主义分析专家。请对用户的问题进行结构化剖析，严格按照以下JSON格式输出（只输出JSON，不要其他内容）：

{
  "cause": "事情的起因分析，追溯问题产生的根源（2-3句）",
  "process": "事情的发展经过，分析量变到质变的过程（2-3句）",
  "result": "当前的结果状态，以及对未来的预判（2-3句）",
  "mainContradiction": "主要矛盾是什么，矛盾的主要方面和次要方面（2-3句）",
  "secondaryContradiction": "次要矛盾有哪些，它们与主要矛盾的关系（2-3句）",
  "environment": "大环境是怎样的，社会存在如何影响了这个问题（2-3句）",
  "synthesis": "综合分析的一句话总结"
}

要求：
- 严格使用矛盾分析法
- 分析要深刻、犀利、直击要害
- 每段2-3句话，简明扼要
- 只输出JSON格式，不要任何其他文字`,
        },
        { role: 'user', content: `请对以下问题进行唯物辩证法结构化剖析：\n\n${q}` },
      ], {
        onChunk: (delta) => {
          full += delta;
        },
        onDone: () => {
          try {
            // Extract JSON from response
            const jsonMatch = full.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]) as DialecticsAnalysis;
              setAnalysis(parsed);
            }
          } catch {
            // Fallback: create analysis from raw text
            setAnalysis({
              cause: full.slice(0, 100) || '分析中...',
              process: '请查看下方AI深度解析',
              result: '请查看下方AI深度解析',
              mainContradiction: '请查看下方AI深度解析',
              secondaryContradiction: '请查看下方AI深度解析',
              environment: '请查看下方AI深度解析',
              synthesis: full.slice(0, 150) || '分析生成中...',
            });
          }
          setAnalyzing(false);
          resolve();
        },
        onError: () => {
          setAnalyzing(false);
          resolve();
        },
      }, { maxTokens: 1500 });
    });
  }, [problem]);

  // AI深度解析
  function handleAIAsk() {
    const q = aiInput.trim();
    if (!q) return;
    setAiOpen(true);
    setAiLoading(true);

    const userMsg = { role: 'user', content: q, id: Date.now().toString() };
    const id = (Date.now() + 1).toString();
    const assistantMsg = { role: 'assistant', content: '', id };
    setAiMessages(prev => [...prev, userMsg, assistantMsg]);
    setAiInput('');

    const context = analysis
      ? `【唯物辩证法结构化剖析】
起因：${analysis.cause}
经过：${analysis.process}
结果：${analysis.result}
主要矛盾：${analysis.mainContradiction}
次要矛盾：${analysis.secondaryContradiction}
大环境：${analysis.environment}
综合：${analysis.synthesis}
`
      : '';

    let full = '';
    streamSiliconAPI([
      { role: 'system', content: MARXIST_FRAMEWORK + NO_MARKDOWN_RULE },
      {
        role: 'user',
        content: `【用户问题】\n${problem}\n\n${context}【追问】\n${q}`,
      },
    ], {
      onChunk: (delta) => {
        full += delta;
        setAiMessages(prev => prev.map(m => m.id === id ? { ...m, content: full } : m));
      },
      onDone: () => setAiLoading(false),
      onError: (err) => {
        setAiLoading(false);
        setAiMessages(prev => prev.map(m => m.id === id ? { ...m, content: `【导师】${err}。` } : m));
      },
    }, { maxTokens: 3000 });
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    }).catch(() => {});
  }

  // 剖析卡片组件
  const AnalysisCard = ({
    title, icon, content, colorKey, delay,
  }: {
    title: string; icon: React.ReactNode; content: string; colorKey: keyof typeof ANALYSIS_COLORS; delay: number;
  }) => {
    const c = ANALYSIS_COLORS[colorKey];
    return (
      <div
        className={`relative rounded-2xl border bg-gradient-to-br ${c.bg} ${c.border} ${c.glow} shadow-lg p-5 backdrop-blur-sm`}
        style={{
          animation: `fadeInUp 0.6s ease-out ${delay}s both`,
          boxShadow: `0 0 30px ${c.accent}20, inset 0 1px 0 ${c.accent}30`,
        }}
      >
        {/* 荧光角标 */}
        <div className="absolute -top-px -left-px w-8 h-8 rounded-tl-2xl" style={{ background: `linear-gradient(135deg, ${c.accent}60, transparent)` }} />
        <div className="absolute -bottom-px -right-px w-8 h-8 rounded-br-2xl" style={{ background: `linear-gradient(315deg, ${c.accent}60, transparent)` }} />

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.accent}30` }}>
            {icon}
          </div>
          <h3 className="text-base font-bold" style={{ color: c.title, fontFamily: "'Noto Serif SC', serif" }}>
            {title}
          </h3>
        </div>
        <p className="text-sm text-white/80 leading-relaxed">{content}</p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* CSS动画 */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.3); }
          50% { box-shadow: 0 0 40px rgba(239,68,68,0.5), 0 0 60px rgba(245,158,11,0.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>

      {/* 标题区 - 豪华版 */}
      <div className="relative text-center space-y-4 py-8 overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(60,10,10,0.8), rgba(30,5,5,0.9), rgba(50,15,5,0.8))',
          border: '1px solid rgba(239,68,68,0.2)',
          animation: 'pulseGlow 4s ease-in-out infinite',
        }}>
        {/* 装饰光晕 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.4), rgba(245,158,11,0.2), transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.5), transparent 70%)', filter: 'blur(30px)' }} />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-3"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            <Flame className="w-4 h-4" />
            辩证唯物主义 · 矛盾分析法
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight"
            style={{
              fontFamily: "'Noto Serif SC', 'KaiTi', serif",
              background: 'linear-gradient(135deg, #fca5a5, #fbbf24, #f87171, #fde68a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 60px rgba(239,68,68,0.4)',
            }}>
            唯物辩证法分析
          </h1>
          <div className="flex justify-center mt-3">
            <IntroModal {...INTRO_DATA} />
          </div>
          <p className="text-red-200/50 text-base max-w-xl mx-auto mt-3 leading-relaxed">
            运用矛盾论与实践论，透过现象看本质，在纷繁复杂中抓住主要矛盾
          </p>
        </div>
      </div>

      {/* 输入区域 */}
      <div className="relative rounded-2xl border p-5 space-y-4"
        style={{
          background: 'linear-gradient(135deg, rgba(20,5,5,0.95), rgba(15,5,5,0.95))',
          borderColor: 'rgba(239,68,68,0.15)',
          boxShadow: '0 0 30px rgba(239,68,68,0.08)',
        }}>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white/90" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            描述您的问题
          </h2>
          <span className="text-xs text-white/30">越详细越好</span>
        </div>
        <div className="h-px bg-gradient-to-r from-red-400/20 via-amber-400/20 to-transparent mb-2" />

        <textarea
          value={problem}
          onChange={e => setProblem(e.target.value)}
          placeholder={`请详细描述您面临的问题：

• 您当前处于什么环境/处境？
• 面临什么样的困境或难题？
• 这件事是怎么开始的？发展过程如何？
• 现在最让您头疼的是什么？
• 您尝试过什么解决方法？效果如何？
• 涉及哪些人或因素？
• 您希望达到什么样的结果？

（描述越详细，分析越精准）`}
          rows={10}
          className="w-full bg-black/40 border border-red-400/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-400/50 focus:ring-1 focus:ring-red-400/20 resize-none leading-relaxed placeholder:text-white/20"
          style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/30">{problem.length} 字{problem.length < 10 ? '（至少10字）' : ''}</p>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || problem.length < 10}
            className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 disabled:opacity-40 flex items-center gap-2"
            style={{
              background: analyzing
                ? 'linear-gradient(135deg, rgba(100,50,50,0.8), rgba(80,40,40,0.8))'
                : 'linear-gradient(135deg, #dc2626, #b91c1c)',
              boxShadow: analyzing ? 'none' : '0 0 20px rgba(220,38,38,0.4), 0 4px 15px rgba(0,0,0,0.3)',
              color: '#fff',
            }}
          >
            {analyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" />辩证剖析中...</>
            ) : (
              <><Zap className="w-4 h-4" />开始剖析</>
            )}
          </button>
        </div>
      </div>

      {/* 剖析图 - 高大上可视化 */}
      {analysis && (
        <div className="space-y-6">
          {/* 标题 */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <Target className="w-4 h-4" />
              唯物辩证法结构化剖析
            </div>
          </div>

          {/* 起因-经过-结果 流程 */}
          <div className="relative">
            {/* 连接线 */}
            <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
              style={{
                background: 'linear-gradient(90deg, rgba(239,68,68,0.5), rgba(251,191,36,0.5), rgba(249,115,22,0.5))',
                boxShadow: '0 0 10px rgba(239,68,68,0.3)',
              }} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
              <AnalysisCard
                title="起因"
                icon={<Flame className="w-4 h-4" style={{ color: ANALYSIS_COLORS.cause.accent }} />}
                content={analysis.cause}
                colorKey="cause"
                delay={0}
              />
              <AnalysisCard
                title="经过"
                icon={<TrendingUp className="w-4 h-4" style={{ color: ANALYSIS_COLORS.process.accent }} />}
                content={analysis.process}
                colorKey="process"
                delay={0.15}
              />
              <AnalysisCard
                title="结果"
                icon={<AlertTriangle className="w-4 h-4" style={{ color: ANALYSIS_COLORS.result.accent }} />}
                content={analysis.result}
                colorKey="result"
                delay={0.3}
              />
            </div>
          </div>

          {/* 矛盾分析 */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm"
              style={{ color: 'rgba(252,165,165,0.6)' }}>
              <Swords className="w-4 h-4" />
              <span style={{ fontFamily: "'Noto Serif SC', serif" }}>矛盾分析</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-red-400/20 to-transparent mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AnalysisCard
              title="主要矛盾"
              icon={<Swords className="w-4 h-4" style={{ color: ANALYSIS_COLORS.mainContradiction.accent }} />}
              content={analysis.mainContradiction}
              colorKey="mainContradiction"
              delay={0.4}
            />
            <AnalysisCard
              title="次要矛盾"
              icon={<Layers className="w-4 h-4" style={{ color: ANALYSIS_COLORS.secondaryContradiction.accent }} />}
              content={analysis.secondaryContradiction}
              colorKey="secondaryContradiction"
              delay={0.55}
            />
            <AnalysisCard
              title="大环境"
              icon={<Globe className="w-4 h-4" style={{ color: ANALYSIS_COLORS.environment.accent }} />}
              content={analysis.environment}
              colorKey="environment"
              delay={0.7}
            />
          </div>

          {/* 综合分析 */}
          <div className="relative rounded-2xl border p-5 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(245,158,11,0.1), rgba(239,68,68,0.05))',
              borderColor: 'rgba(239,68,68,0.25)',
              boxShadow: '0 0 30px rgba(239,68,68,0.15), inset 0 1px 0 rgba(251,191,36,0.2)',
            }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff' }}>
              综合
            </div>
            <p className="text-sm text-white/80 leading-relaxed mt-2 italic" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              {analysis.synthesis}
            </p>
          </div>
        </div>
      )}

      {/* AI深度解析 - 马克思主义导师 */}
      <div className="relative rounded-2xl border p-5 space-y-4"
        style={{
          background: 'linear-gradient(135deg, rgba(20,5,5,0.95), rgba(10,3,3,0.98))',
          borderColor: 'rgba(220,38,38,0.2)',
          boxShadow: '0 0 40px rgba(220,38,38,0.1)',
        }}>
        {/* 标题 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', boxShadow: '0 0 15px rgba(220,38,38,0.4)' }}>
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              导师深度解析
            </h2>
            <p className="text-xs text-red-300/40">运用矛盾论、实践论、唯物史观进行深度分析</p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-red-400/20 via-amber-400/20 to-transparent" />

        {/* 输入 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAIAsk()}
            placeholder={analysis ? "追问导师..." : "请先点击\"开始剖析\"生成分析"}
            disabled={!analysis}
            className="flex-1 bg-black/40 border border-red-400/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-400/50 placeholder:text-white/20 disabled:opacity-30"
          />
          <button
            onClick={handleAIAsk}
            disabled={aiLoading || !aiInput.trim() || !analysis}
            className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-30 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              boxShadow: '0 0 15px rgba(220,38,38,0.3)',
              color: '#fff',
            }}
          >
            <Sparkles className="w-4 h-4" />
            {aiLoading ? '思考中...' : '解析'}
          </button>
        </div>

        {/* AI对话 */}
        {aiOpen && aiMessages.length > 0 && (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`relative rounded-xl p-4 ${
                  msg.role === 'user'
                    ? 'ml-6 bg-red-500/5 border border-red-400/15'
                    : 'mr-6 bg-amber-500/5 border border-amber-400/15'
                }`}
                style={{
                  boxShadow: msg.role === 'assistant' ? '0 0 20px rgba(245,158,11,0.05), inset 0 1px 0 rgba(251,191,36,0.1)' : 'none',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      msg.role === 'user' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {msg.role === 'user' ? '问' : '导'}
                    </div>
                    <span className="text-xs text-white/40">
                      {msg.role === 'user' ? '您的问题' : '导师解析'}
                    </span>
                  </div>
                  {msg.content && (
                    <button
                      onClick={() => copyText(msg.content, msg.id)}
                      className="text-xs text-white/20 hover:text-white/50 transition-colors flex items-center gap-1"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedId === msg.id ? '已复制' : '复制'}
                    </button>
                  )}
                </div>
                {msg.content ? (
                  <div className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
                    <HighlightText text={msg.content} />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-amber-400/60">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    导师正在运用唯物辩证法深入分析...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
