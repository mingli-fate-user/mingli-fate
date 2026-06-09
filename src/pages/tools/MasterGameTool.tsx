import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, RotateCcw, ArrowLeft, Send, Loader2, Award, BookOpen,
  Star, Target, User, Users, Heart, Briefcase, Home, Crown,
  ChevronRight, CheckCircle2, XCircle, Lightbulb, ScrollText,
  FlaskConical, Orbit, Hexagon, Flower
} from 'lucide-react';
import { callSiliconAPIWithRetry } from '@/utils/apiClient';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';
import HighlightText from '@/components/HighlightText';
import {
  type GameMode, type BaziInfo, type GuaInfo, type AIAnswer, type ScoreResult, type LiuYaoAnswer,
  generateRandomBazi, generateRandomGua,
  makeBaziPrompt, makeBaziAnswerPrompt, makeScorePrompt,
  makeLiuYaoPrompt, makeLiuYaoAnswerPrompt, makeLiuYaoScorePrompt,
  makeMeiHuaPrompt, makeMeiHuaAnswerPrompt, makeMeiHuaScorePrompt,
  parseScoreJSON, parseAIAnswerJSON, parseLiuYaoAnswerJSON, parseGuaScoreJSON,
} from '@/data/masterGame';

declare global { interface Window { Lunar: any; } }

// ===== 模式配置 =====
const MODES: { key: GameMode; label: string; sub: string; icon: any; color: string; desc: string }[] = [
  { key: 'bazi', label: '八字命理', sub: '四柱推命', icon: Orbit, color: '#fbbf24', desc: 'AI随机生成八字，你根据排盘分析一生格局' },
  { key: 'ziwei', label: '紫微斗数', sub: '星曜推命', icon: Star, color: '#a78bfa', desc: 'AI随机生成命盘，你根据星曜分布分析命运' },
  { key: 'liuyao', label: '六爻断卦', sub: '纳甲筮法', icon: Hexagon, color: '#60a5fa', desc: 'AI生成虚拟占卦，你根据卦象断吉凶' },
  { key: 'meihua', label: '梅花易数', sub: '心易神断', icon: Flower, color: '#4ade80', desc: 'AI生成虚拟占卦，你用梅花心法断结果' },
];

const DIM_CONFIG = [
  { key: 'overallPattern', label: '一生格局走向', score: 40, icon: Crown, placeholder: '请分析此命的整体格局高低、五行平衡、一生大运走势...' },
  { key: 'wealth', label: '财运', score: 10, icon: Target, placeholder: '请分析此命的财运好坏、财源类型、发财时机...' },
  { key: 'marriage', label: '婚姻', score: 10, icon: Heart, placeholder: '请分析此命的婚姻状况、配偶特征、婚姻时机...' },
  { key: 'friendship', label: '交友', score: 10, icon: Users, placeholder: '请分析此命的交友运势、贵人运、需防的小人...' },
  { key: 'career', label: '事业', score: 10, icon: Briefcase, placeholder: '请分析此命的事业方向、职业适合度、事业高低...' },
  { key: 'family', label: '家庭', score: 10, icon: Home, placeholder: '请分析此命的家庭氛围、子女缘、家宅运势...' },
  { key: 'parents', label: '父母', score: 10, icon: User, placeholder: '请分析此命与父母的关系、父母健康、父母助力...' },
];

const GRADE_COLORS: Record<string, string> = {
  '命理小白': '#ef4444',
  '初学入门': '#f97316',
  '略有小成': '#fbbf24',
  '登堂入室': '#4ade80',
  '一代宗师': '#a78bfa',
  '一代宗师之一': '#a78bfa',
};

// ===== 分数条组件 =====
function ScoreBar({ label, score, maxScore, color, feedback }: { label: string; score: number; maxScore: number; color: string; feedback: string }) {
  const pct = (score / maxScore) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50 font-medium">{label}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}<span className="text-white/20">/{maxScore}</span></span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}30, ${color})` }}>
          <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 8px ${color}40` }} />
        </div>
      </div>
      {feedback && <p className="text-[11px] text-white/30 leading-relaxed pl-1">{feedback}</p>}
    </div>
  );
}

// ===== 主组件 =====
export default function MasterGameTool() {
  const [phase, setPhase] = useState<'select' | 'loading' | 'display' | 'answer' | 'scoring' | 'result'>('select');
  const [mode, setMode] = useState<GameMode | null>(null);
  const [panDisplay, setPanDisplay] = useState('');
  const [gender, setGender] = useState('');
  const [pillar, setPillar] = useState('');
  const [pattern, setPattern] = useState('');
  const [guaInfo, setGuaInfo] = useState<GuaInfo | null>(null);

  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [userGuaAnalysis, setUserGuaAnalysis] = useState('');
  const [userGuaResult, setUserGuaResult] = useState('');

  const [aiAnswer, setAiAnswer] = useState<AIAnswer | null>(null);
  const [aiGuaAnswer, setAiGuaAnswer] = useState<LiuYaoAnswer | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [guaScoreResult, setGuaScoreResult] = useState<any>(null);
  const [loadingText, setLoadingText] = useState('');

  const bufferRef = useRef('');

  // 选择模式开始
  const startGame = useCallback(async (selectedMode: GameMode) => {
    setMode(selectedMode);
    setPhase('loading');
    setPanDisplay('');
    setUserAnswers({});
    setUserGuaAnalysis('');
    setUserGuaResult('');
    setAiAnswer(null);
    setAiGuaAnswer(null);
    setScoreResult(null);
    setGuaScoreResult(null);
    bufferRef.current = '';

    try {
      if (selectedMode === 'bazi' || selectedMode === 'ziwei') {
        await startBaziZiWei(selectedMode);
      } else {
        await startGua(selectedMode);
      }
    } catch {
      setPhase('select');
    }
  }, []);

  // 八字/紫微
  async function startBaziZiWei(gameMode: GameMode) {
    const info = generateRandomBazi();
    const genderText = info.gender === 'male' ? '男' : '女';
    setGender(genderText);

    // 用 lunar-javascript 排盘
    let pillarText = '';
    let patternText = '杂气格';
    try {
      const L = window.Lunar;
      if (L) {
        const lunar = L.fromYmdHms(info.year, info.month, info.day, info.hour, 0, 0);
        const bz = lunar.getEightChar();
        pillarText = `${bz.getYear()} ${bz.getMonth()} ${bz.getDay()} ${bz.getTime()}`;
        setPillar(pillarText);
        const dg = bz.getDay()[0];
        if (['甲','乙'].includes(dg)) patternText = '建禄格';
        else if (['丙','丁'].includes(dg)) patternText = '食伤生财';
        else if (['戊','己'].includes(dg)) patternText = '正官格';
        else if (['庚','辛'].includes(dg)) patternText = '伤官配印';
        else if (['壬','癸'].includes(dg)) patternText = '从财格';
        setPattern(patternText);
      }
    } catch {
      pillarText = '甲子 丙寅 戊辰 庚午';
      setPillar(pillarText);
    }

    setLoadingText('AI正在排盘...');

    // AI排盘显示
    const panPrompt = makeBaziPrompt(info);
    const panResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: '你是黄师傅，专业八字排盘师。请详细排盘。' + NO_MARKDOWN_RULE },
      { role: 'user', content: panPrompt },
    ], { maxTokens: 1200, temperature: 0.5 });
    setPanDisplay(panResponse);

    setLoadingText('AI正在隐藏答案...');

    // AI生成隐藏答案
    const answerPrompt = makeBaziAnswerPrompt(pillarText, patternText, genderText);
    const answerResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: '你是黄师傅，八字命理宗师。请严格分析输出JSON。' + NO_MARKDOWN_RULE },
      { role: 'user', content: answerPrompt },
    ], { maxTokens: 2000, temperature: 0.3 });
    const parsed = parseAIAnswerJSON(answerResponse);
    setAiAnswer(parsed || {
      overallPattern: 'AI分析中...', wealth: '', marriage: '', friendship: '', career: '', family: '', parents: '',
    });

    setPhase('display');
  }

  // 六爻/梅花
  async function startGua(gameMode: GameMode) {
    const info = generateRandomGua();
    setGuaInfo(info);

    setLoadingText('AI正在生成占卦场景...');

    // AI排盘
    const panPrompt = gameMode === 'liuyao' ? makeLiuYaoPrompt(info) : makeMeiHuaPrompt(info);
    const panResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: `你是${gameMode === 'liuyao' ? '六爻' : '梅花易数'}大师。请详细排盘。` + NO_MARKDOWN_RULE },
      { role: 'user', content: panPrompt },
    ], { maxTokens: 1200, temperature: 0.5 });
    setPanDisplay(panResponse);

    setLoadingText('AI正在断卦（隐藏答案）...');

    // AI隐藏断卦
    const answerPrompt = gameMode === 'liuyao' ? makeLiuYaoAnswerPrompt(info) : makeMeiHuaAnswerPrompt(info);
    const answerResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: `你是${gameMode === 'liuyao' ? '六爻' : '梅花易数'}宗师。请严格断卦输出JSON。` + NO_MARKDOWN_RULE },
      { role: 'user', content: answerPrompt },
    ], { maxTokens: 1500, temperature: 0.3 });
    const parsed = parseLiuYaoAnswerJSON(answerResponse);
    setAiGuaAnswer(parsed || { analysis: 'AI分析中...', result: '' });

    setPhase('display');
  }

  // 提交答案
  async function submitAnswers() {
    if (!mode) return;
    setPhase('scoring');

    try {
      if (mode === 'bazi' || mode === 'ziwei') {
        await scoreBazi();
      } else {
        await scoreGua();
      }
    } catch {
      setPhase('answer');
    }
  }

  async function scoreBazi() {
    if (!aiAnswer) return;
    const scorePrompt = makeScorePrompt(mode as 'bazi' | 'ziwei', pillar, pattern, gender, userAnswers, aiAnswer);
    const scoreResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: '你是黄师傅，严格公正的命理考官。' + NO_MARKDOWN_RULE },
      { role: 'user', content: scorePrompt },
    ], { maxTokens: 2500, temperature: 0.3 });
    const parsed = parseScoreJSON(scoreResponse);
    setScoreResult(parsed);
    setPhase('result');
  }

  async function scoreGua() {
    if (!aiGuaAnswer || !guaInfo) return;
    const scorePrompt = mode === 'liuyao'
      ? makeLiuYaoScorePrompt(guaInfo, userGuaAnalysis, userGuaResult, aiGuaAnswer)
      : makeMeiHuaScorePrompt(guaInfo, userGuaAnalysis, userGuaResult, aiGuaAnswer);
    const scoreResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: `你是${mode === 'liuyao' ? '六爻' : '梅花易数'}宗师兼严师。` + NO_MARKDOWN_RULE },
      { role: 'user', content: scorePrompt },
    ], { maxTokens: 2000, temperature: 0.3 });
    const parsed = parseGuaScoreJSON(scoreResponse);
    setGuaScoreResult(parsed);
    setPhase('result');
  }

  function restart() {
    setPhase('select');
    setMode(null);
    setPanDisplay('');
    setUserAnswers({});
    setUserGuaAnalysis('');
    setUserGuaResult('');
    setAiAnswer(null);
    setAiGuaAnswer(null);
    setScoreResult(null);
    setGuaScoreResult(null);
  }

  const currentMode = MODES.find(m => m.key === mode);

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 px-4">
      <style>{`
        @keyframes fU { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fI { from{opacity:0}to{opacity:1} }
        @keyframes br { 0%,100%{transform:scale(1)}50%{transform:scale(1.05)} }
        @keyframes sh { 0%{background-position:-200%0}100%{background-position:200%0} }
        @keyframes dn { from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)} }
        .aFU { animation: fU 0.6s ease forwards }
        .aFI { animation: fI 0.4s ease forwards }
        .aDN { animation: dn 0.5s ease forwards }
        .shTxt { background: linear-gradient(90deg,#78350f 0%,#fbbf24 40%,#fff 50%,#fbbf24 60%,#78350f 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: sh 4s linear infinite }
        .shTxtP { background: linear-gradient(90deg,#4c1d95 0%,#a78bfa 40%,#fff 50%,#a78bfa 60%,#4c1d95 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: sh 4s linear infinite }
        .shTxtB { background: linear-gradient(90deg,#1e3a5f 0%,#60a5fa 40%,#fff 50%,#60a5fa 60%,#1e3a5f 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: sh 4s linear infinite }
        .shTxtG { background: linear-gradient(90deg,#14532d 0%,#4ade80 40%,#fff 50%,#4ade80 60%,#14532d 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: sh 4s linear infinite }
        textarea { resize: vertical; min-height: 80px; }
      `}</style>

      {/* 返回 */}
      <Link to="/games" className="inline-flex items-center gap-1 text-xs text-white/20 hover:text-white/50 transition-colors pt-4">
        <ArrowLeft className="w-3.5 h-3.5" />返回小游戏
      </Link>

      {/* 标题 */}
      <div className="relative text-center space-y-2 py-8 overflow-hidden rounded-3xl aFU"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.08), rgba(10,5,2,0.98))', border: '1px solid rgba(168,85,247,0.08)' }}>
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 25% 50%, rgba(168,85,247,0.08), transparent 50%), radial-gradient(circle at 75% 50%, rgba(96,165,250,0.05), transparent 50%)' }} />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)', color: '#8b5cf6' }}>
            <FlaskConical className="w-3 h-3" />AI考官 · 严师把关
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight shTxtP" style={{ fontFamily: "'Noto Serif SC','KaiTi',serif" }}>我是大师</h1>
          <p className="text-[10px] text-white/20">AI随机出题，你来做命理师，看你能算准几分</p>
        </div>
      </div>

      {/* ===== 选择模式 ===== */}
      {phase === 'select' && (
        <div className="aFU space-y-4">
          <div className="text-center">
            <p className="text-xs text-white/40 mb-1">选择你想考核的命理技能</p>
            <p className="text-[10px] text-white/15">AI将随机生成命盘或卦象，你需要根据所学进行分析</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODES.map((m, i) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => startGame(m.key)}
                  className="group relative text-left rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${m.color}06, rgba(0,0,0,0.3))`,
                    borderColor: `${m.color}15`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${m.color}12, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${m.color}30, transparent)` }} />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${m.color}10`, border: `1px solid ${m.color}20` }}>
                        <Icon className="w-5 h-5" style={{ color: m.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{m.label}</h3>
                        <p className="text-[9px]" style={{ color: `${m.color}80` }}>{m.sub}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/35 leading-relaxed">{m.desc}</p>
                    <div className="flex items-center gap-1 text-[10px] transition-colors" style={{ color: `${m.color}60` }}>
                      <Sparkles className="w-3 h-3" />开始考核<ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 加载中 ===== */}
      {phase === 'loading' && (
        <div className="aFU flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full animate-spin" style={{ border: '2px solid rgba(168,85,247,0.1)', borderTopColor: '#a78bfa' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400/50" />
            </div>
          </div>
          <p className="text-sm text-white/40">{loadingText}</p>
          <p className="text-[10px] text-white/15">AI考官正在准备题目...</p>
        </div>
      )}

      {/* ===== 排盘展示 ===== */}
      {phase === 'display' && currentMode && (
        <div className="aFU space-y-4">
          {/* 提示 */}
          <div className="rounded-xl border p-4 flex items-start gap-3" style={{ background: 'rgba(168,85,247,0.03)', borderColor: 'rgba(168,85,247,0.1)' }}>
            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: currentMode.color }} />
            <div className="space-y-1">
              <p className="text-xs font-medium" style={{ color: currentMode.color }}>考题已生成，AI考官已隐藏答案</p>
              <p className="text-[10px] text-white/30">
                {mode === 'bazi' || mode === 'ziwei'
                  ? '请仔细分析以下排盘信息，在下一页依次输入你对7个维度的判断'
                  : '请仔细分析以下卦象，在下一页输入你的断卦分析和最终断语'}
              </p>
            </div>
          </div>

          {/* 排盘卡片 */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(5,3,2,0.99))', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <ScrollText className="w-4 h-4" style={{ color: currentMode.color, opacity: 0.5 }} />
              <span className="text-xs font-bold text-white/40">
                {mode === 'bazi' ? '八字排盘' : mode === 'ziwei' ? '紫微命盘' : mode === 'liuyao' ? '六爻排盘' : '梅花卦象'}
              </span>
            </div>
            <div className="px-4 pb-4">
              <div className="rounded-lg p-4 border whitespace-pre-wrap leading-relaxed" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.03)', fontFamily: "'Noto Serif SC',serif" }}>
                <HighlightText text={panDisplay} />
              </div>
            </div>
          </div>

          {/* 卦象额外信息 */}
          {guaInfo && (mode === 'liuyao' || mode === 'meihua') && (
            <div className="rounded-xl border p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-white/30" />
                <span className="text-xs text-white/40">占卦人</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed" style={{ fontFamily: "'Noto Serif SC',serif" }}>{guaInfo.questioner}</p>
              <div className="h-px bg-white/3" />
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-white/30" />
                <span className="text-xs text-white/40">所占之事</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed" style={{ fontFamily: "'Noto Serif SC',serif" }}>{guaInfo.question}</p>
            </div>
          )}

          {/* 开始作答按钮 */}
          <button
            onClick={() => setPhase('answer')}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 aFU"
            style={{ background: `linear-gradient(135deg, ${currentMode.color}20, ${currentMode.color}05)`, boxShadow: `0 6px 30px ${currentMode.color}15`, border: `1px solid ${currentMode.color}20`, color: currentMode.color }}
          >
            <Sparkles className="w-5 h-5" />
            我已仔细分析，开始作答
          </button>
        </div>
      )}

      {/* ===== 用户作答 ===== */}
      {phase === 'answer' && currentMode && (
        <div className="aFU space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-white/40">请根据排盘信息，输入你的分析判断</p>
            <p className="text-[10px] text-white/15">越详细、越有依据，得分越高</p>
          </div>

          {/* 八字/紫微：7维度输入 */}
          {(mode === 'bazi' || mode === 'ziwei') && (
            <div className="space-y-3">
              {DIM_CONFIG.map((dim, i) => {
                const Icon = dim.icon;
                return (
                  <div key={dim.key} className="rounded-xl border overflow-hidden aFU" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.04)', animationDelay: `${i * 0.05}s` }}>
                    <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentMode.color, opacity: 0.5 }} />
                      <span className="text-xs font-medium text-white/50">{dim.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: `${currentMode.color}10`, color: `${currentMode.color}70` }}>{dim.score}分</span>
                    </div>
                    <div className="px-4 pb-3">
                      <textarea
                        value={userAnswers[dim.key] || ''}
                        onChange={e => setUserAnswers(prev => ({ ...prev, [dim.key]: e.target.value }))}
                        placeholder={dim.placeholder}
                        className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-white/60 placeholder:text-white/10 focus:outline-none focus:border-purple-400/30 transition-all leading-relaxed"
                        style={{ fontFamily: "'Noto Serif SC',serif", minHeight: dim.key === 'overallPattern' ? 120 : 80 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 六爻/梅花：断卦输入 */}
          {(mode === 'liuyao' || mode === 'meihua') && (
            <div className="space-y-3">
              <div className="rounded-xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <ScrollText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentMode.color, opacity: 0.5 }} />
                  <span className="text-xs font-medium text-white/50">断卦分析过程</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: `${currentMode.color}10`, color: `${currentMode.color}70` }}>50分</span>
                </div>
                <div className="px-4 pb-3">
                  <textarea
                    value={userGuaAnalysis}
                    onChange={e => setUserGuaAnalysis(e.target.value)}
                    placeholder={`请详细写出你的${mode === 'liuyao' ? '六爻' : '梅花'}分析过程，包括用神判断、旺衰分析、动爻影响、吉凶推断...`}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-white/60 placeholder:text-white/10 focus:outline-none focus:border-blue-400/30 transition-all leading-relaxed"
                    style={{ fontFamily: "'Noto Serif SC',serif", minHeight: 150 }}
                  />
                </div>
              </div>

              <div className="rounded-xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentMode.color, opacity: 0.5 }} />
                  <span className="text-xs font-medium text-white/50">最终断语</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: `${currentMode.color}10`, color: `${currentMode.color}70` }}>30分</span>
                </div>
                <div className="px-4 pb-3">
                  <textarea
                    value={userGuaResult}
                    onChange={e => setUserGuaResult(e.target.value)}
                    placeholder={`请给出明确的最终断语：所占之事吉凶如何？结果怎样？有何建议？`}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-white/60 placeholder:text-white/10 focus:outline-none focus:border-blue-400/30 transition-all leading-relaxed"
                    style={{ fontFamily: "'Noto Serif SC',serif", minHeight: 80 }}
                  />
                </div>
              </div>

              <div className="rounded-lg px-3 py-2 border" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-3 h-3 text-white/20" />
                  <span className="text-[10px] text-white/20">推理逻辑分 20分（自动评估）</span>
                </div>
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <button
            onClick={submitAnswers}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${currentMode.color}30, ${currentMode.color}10)`, boxShadow: `0 6px 30px ${currentMode.color}15`, border: `1px solid ${currentMode.color}25`, color: currentMode.color }}
          >
            <Send className="w-5 h-5" />
            提交答案，请求AI评分
          </button>
        </div>
      )}

      {/* ===== 评分中 ===== */}
      {phase === 'scoring' && (
        <div className="aFU flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full animate-spin" style={{ border: '2px solid rgba(168,85,247,0.1)', borderTopColor: '#a78bfa' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-400/50" />
            </div>
          </div>
          <p className="text-sm text-white/40">AI考官正在严格评分...</p>
          <p className="text-[10px] text-white/15">客观公正，以命理为依据</p>
        </div>
      )}

      {/* ===== 结果展示 ===== */}
      {phase === 'result' && currentMode && (
        <div className="aFU space-y-5">
          {/* 总分卡片 */}
          {(scoreResult || guaScoreResult) && (
            <div className="relative rounded-3xl border overflow-hidden text-center py-8 space-y-4"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${currentMode.color}10, rgba(10,5,2,0.98))`,
                borderColor: `${currentMode.color}15`,
              }}>
              <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 30% 40%, ${currentMode.color}10, transparent 50%)` }} />
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full" style={{ background: `linear-gradient(135deg, ${currentMode.color}15, ${currentMode.color}05)`, border: `1px solid ${currentColor(currentMode.color)}`, boxShadow: `0 0 40px ${currentMode.color}10` }}>
                  <span className="text-4xl font-black" style={{ color: currentMode.color, fontFamily: "'Noto Serif SC',serif" }}>
                    {scoreResult ? scoreResult.total : guaScoreResult ? guaScoreResult.total : 0}
                  </span>
                </div>
                <div>
                  <span className="text-lg font-bold" style={{ color: currentMode.color, fontFamily: "'Noto Serif SC',serif" }}>
                    {scoreResult?.grade || guaScoreResult?.grade || '未评级'}
                  </span>
                </div>
                <p className="text-xs text-white/30 px-6">
                  {scoreResult?.summary || guaScoreResult?.summary || ''}
                </p>
              </div>
            </div>
          )}

          {/* 分项得分 - 八字/紫微 */}
          {scoreResult && (mode === 'bazi' || mode === 'ziwei') && (
            <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-white/30" />
                <span className="text-xs font-bold text-white/40">分项得分</span>
              </div>
              <ScoreBar label="一生格局走向" score={scoreResult.overallPattern.score} maxScore={40} color={currentMode.color} feedback={scoreResult.overallPattern.feedback} />
              <ScoreBar label="财运" score={scoreResult.wealth.score} maxScore={10} color={currentMode.color} feedback={scoreResult.wealth.feedback} />
              <ScoreBar label="婚姻" score={scoreResult.marriage.score} maxScore={10} color={currentMode.color} feedback={scoreResult.marriage.feedback} />
              <ScoreBar label="交友" score={scoreResult.friendship.score} maxScore={10} color={currentMode.color} feedback={scoreResult.friendship.feedback} />
              <ScoreBar label="事业" score={scoreResult.career.score} maxScore={10} color={currentMode.color} feedback={scoreResult.career.feedback} />
              <ScoreBar label="家庭" score={scoreResult.family.score} maxScore={10} color={currentMode.color} feedback={scoreResult.family.feedback} />
              <ScoreBar label="父母" score={scoreResult.parents.score} maxScore={10} color={currentMode.color} feedback={scoreResult.parents.feedback} />
            </div>
          )}

          {/* 分项得分 - 六爻/梅花 */}
          {guaScoreResult && (mode === 'liuyao' || mode === 'meihua') && (
            <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-white/30" />
                <span className="text-xs font-bold text-white/40">分项得分</span>
              </div>
              <ScoreBar label="断卦分析" score={guaScoreResult.analysisScore || 0} maxScore={50} color={currentMode.color} feedback={guaScoreResult.analysisFeedback || ''} />
              <ScoreBar label="最终断语" score={guaScoreResult.resultScore || 0} maxScore={30} color={currentMode.color} feedback={guaScoreResult.resultFeedback || ''} />
              <ScoreBar label="推理逻辑" score={guaScoreResult.logicScore || 0} maxScore={20} color={currentMode.color} feedback={guaScoreResult.logicFeedback || ''} />
            </div>
          )}

          {/* 学习指导 */}
          {(scoreResult?.studyAdvice || guaScoreResult?.studyAdvice) && (
            <div className="rounded-2xl border p-5 space-y-3 aDN" style={{ background: `linear-gradient(180deg, ${currentMode.color}05, rgba(5,3,2,0.99))`, borderColor: `${currentMode.color}12` }}>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: currentMode.color, opacity: 0.5 }} />
                <span className="text-xs font-bold" style={{ color: `${currentMode.color}90` }}>学习指导</span>
              </div>
              <div className="text-xs text-white/40 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Noto Serif SC',serif" }}>
                <HighlightText text={scoreResult?.studyAdvice || guaScoreResult?.studyAdvice || ''} />
              </div>
            </div>
          )}

          {/* 标准答案对比 */}
          {aiAnswer && (mode === 'bazi' || mode === 'ziwei') && (
            <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'rgba(0,0,0,0.15)', borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400/40" />
                <span className="text-xs font-bold text-white/30">AI标准答案（供参考学习）</span>
              </div>
              {DIM_CONFIG.map(dim => (
                <div key={dim.key} className="space-y-1">
                  <span className="text-[10px] font-medium" style={{ color: currentMode.color, opacity: 0.5 }}>{dim.label}</span>
                  <p className="text-[11px] text-white/25 leading-relaxed" style={{ fontFamily: "'Noto Serif SC',serif" }}>
                    {(aiAnswer as any)[dim.key] || ''}
                  </p>
                </div>
              ))}
            </div>
          )}

          {aiGuaAnswer && (mode === 'liuyao' || mode === 'meihua') && (
            <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'rgba(0,0,0,0.15)', borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400/40" />
                <span className="text-xs font-bold text-white/30">AI标准断卦（供参考学习）</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-medium" style={{ color: currentMode.color, opacity: 0.5 }}>分析过程</span>
                <p className="text-[11px] text-white/25 leading-relaxed" style={{ fontFamily: "'Noto Serif SC',serif" }}>{aiGuaAnswer.analysis}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-medium" style={{ color: currentMode.color, opacity: 0.5 }}>最终断语</span>
                <p className="text-[11px] text-white/25 leading-relaxed" style={{ fontFamily: "'Noto Serif SC',serif" }}>{aiGuaAnswer.result}</p>
              </div>
            </div>
          )}

          {/* 再来一局 */}
          <div className="flex gap-3">
            <button
              onClick={restart}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
            >
              <RotateCcw className="w-4 h-4" />换一题
            </button>
            {mode && (
              <button
                onClick={() => startGame(mode)}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                style={{ background: `${currentMode.color}10`, border: `1px solid ${currentMode.color}20`, color: currentMode.color }}
              >
                <Sparkles className="w-4 h-4" />再来一局
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function currentColor(base: string): string {
  return base + '40';
}
