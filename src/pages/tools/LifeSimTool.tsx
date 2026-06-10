import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, RotateCcw, ChevronRight, Crown, Loader2, Zap, Clock, ArrowLeft, Calendar, TrendingUp, Users, GraduationCap, Banknote, Activity, Target, Award, Heart, Skull, Gem } from 'lucide-react';
import { streamSiliconAPI } from '@/utils/apiClient';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';
import HighlightText from '@/components/HighlightText';
import SaveRecordButton from '@/components/SaveRecordButton';
import {
  TONE_PROMPT, makeStagePrompt, makeConsequencePrompt,
  extractStory, extractChoices, extractConsequence, extractAttrChanges, extractDeath,
  applyAttrChanges, calcScore, getEnding, CHOICE_STYLES,
  type SixAttrs, type StreamChoice, type StreamStage,
} from '@/data/lifeStream';

declare global { interface Window { Lunar: any; echarts: any; } }

const GUA_JU: Record<string, { name: string; desc: string }> = {
  '食伤生财': { name: '食伤生财格', desc: '聪明机敏，靠才华和创意赚钱。' },
  '伤官配印': { name: '伤官配印格', desc: '才华出众，适合文化、艺术、学术。' },
  '正官格': { name: '正官格', desc: '正直守规矩，适合体制内、管理岗。' },
  '七杀格': { name: '七杀格', desc: '有魄力敢冒险，大起大落。' },
  '从财格': { name: '从财格', desc: '对金钱敏感，善于理财投资。' },
  '从杀格': { name: '从杀格', desc: '性格刚强，适合高压职业。' },
  '印绶格': { name: '印绶格', desc: '好学深思，适合学术教育。' },
  '建禄格': { name: '建禄格', desc: '勤劳肯干，靠自己打拼。' },
  '杂气格': { name: '杂气格', desc: '命运多变，经历丰富。' },
};

const AGES = [1, 10, 20, 30, 40, 50, 60, 70, 80];
const DA_YUN = ['早年运','少年运','青年运','壮年运','中年运','盛年运','晚年运','暮年运','归元运'];
const GAN_LABELS = ['甲','乙','丙','丁','戊','己'];

// ===== ECharts =====
function EChartKLine({ data, idx }: { data: number[]; idx?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);
  useState(() => {
    if (!ref.current || !data.length || !window.echarts || initRef.current) return;
    initRef.current = true;
    const chart = window.echarts.init(ref.current, 'dark');
    const refresh = () => {
      const ages = data.map((_, i) => AGES[i]);
      chart.setOption({
        backgroundColor: 'transparent', grid: { top: 15, right: 10, bottom: 20, left: 35 },
        xAxis: { type: 'category', data: ages, axisLabel: { color: 'rgba(255,255,255,0.25)', fontSize: 9, interval: 1 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
        yAxis: { type: 'value', min: 0, max: 100, axisLabel: { color: 'rgba(255,255,255,0.15)', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.02)' } } },
        series: [{
          type: 'line', data, smooth: 0.4, symbol: 'circle', symbolSize: 4,
          lineStyle: { width: 2, color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#78350f' }, { offset: 0.5, color: '#fbbf24' }, { offset: 1, color: '#92400e' }] } },
          itemStyle: { color: '#fbbf24' },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(251,191,36,0.12)' }, { offset: 1, color: 'rgba(251,191,36,0)' }] } },
          markLine: idx !== undefined ? { silent: true, symbol: 'none', data: [{ xAxis: idx, lineStyle: { color: '#ef4444', type: 'dashed', width: 1 } }] } : undefined,
        }],
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,15,26,0.95)', borderColor: 'rgba(251,191,36,0.15)', textStyle: { color: '#fff', fontSize: 11 } },
      });
    };
    refresh();
    const h = () => chart.resize(); window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  });
  return <div ref={ref} style={{ width: '100%', height: 180 }} />;
}

function EChartRadar({ attrs }: { attrs: SixAttrs }) {
  const ref = useRef<HTMLDivElement>(null);
  useState(() => {
    if (!ref.current || !window.echarts) return;
    const chart = window.echarts.init(ref.current, 'dark');
    chart.setOption({
      backgroundColor: 'transparent',
      radar: { indicator: [{ name: '财运', max: 100 }, { name: '事业', max: 100 }, { name: '健康', max: 100 }, { name: '感情', max: 100 }, { name: '学业', max: 100 }, { name: '人际', max: 100 }], axisName: { color: 'rgba(255,255,255,0.4)', fontSize: 10 }, splitArea: { areaStyle: { color: ['rgba(251,191,36,0.02)', 'rgba(251,191,36,0.04)'] } }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
      series: [{ type: 'radar', data: [{ value: [attrs.wealth, attrs.career, attrs.health, attrs.love, attrs.study, attrs.social], areaStyle: { color: 'rgba(251,191,36,0.12)' }, lineStyle: { color: '#fbbf24', width: 2 }, itemStyle: { color: '#fbbf24' } }] }],
    });
    return () => chart.dispose();
  });
  return <div ref={ref} style={{ width: '100%', height: 200 }} />;
}

function AttrBar({ name, value, color, icon: Icon }: { name: string; value: number; color: string; icon: any }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/25 flex items-center gap-1"><Icon className="w-2.5 h-2.5" style={{ color }} />{name}</span>
        <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{value}</span>
      </div>
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color, opacity: 0.5 }} />
      </div>
    </div>
  );
}

// ===== 主组件 =====
export default function LifeSimTool() {
  const [gameState, setGameState] = useState<'input' | 'playing' | 'death' | 'report'>('input');
  const [year, setYear] = useState(1995); const [month, setMonth] = useState(6);
  const [day, setDay] = useState(15); const [hour, setHour] = useState(12);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [pillar, setPillar] = useState(''); const [pattern, setPattern] = useState('杂气格');

  // 基调
  const [tone, setTone] = useState('');
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [suitablePaths, setSuitablePaths] = useState<string[]>([]);
  const [deathRiskAges, setDeathRiskAges] = useState<number[]>([]);

  // 游戏状态
  const [currentAgeIdx, setCurrentAgeIdx] = useState(0);
  const [attrs, setAttrs] = useState<SixAttrs>({ wealth: 50, career: 50, health: 50, love: 50, study: 50, social: 50, karma: 0 });
  const [kline, setKline] = useState<number[]>([]);

  // 流式内容
  const [streamStory, setStreamStory] = useState('');
  const [streamChoices, setStreamChoices] = useState<StreamChoice[] | null>(null);
  const [streamConsequence, setStreamConsequence] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [deathInfo, setDeathInfo] = useState<{ title: string; reason: string } | null>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const bufferRef = useRef('');

  function calcBazi() {
    try {
      const L = window.Lunar; if (!L) return false;
      const lunar = L.fromYmdHms(Number(year), Number(month), Number(day), Number(hour), 0, 0);
      const bz = lunar.getEightChar();
      const p = `${bz.getYear()} ${bz.getMonth()} ${bz.getDay()} ${bz.getTime()}`;
      setPillar(p);
      const dg = bz.getDay()[0];
      let pat = '杂气格';
      if (['甲','乙'].includes(dg)) pat = '建禄格';
      else if (['丙','丁'].includes(dg)) pat = '食伤生财';
      else if (['戊','己'].includes(dg)) pat = '正官格';
      else if (['庚','辛'].includes(dg)) pat = '伤官配印';
      else if (['壬','癸'].includes(dg)) pat = '从财格';
      setPattern(pat);
      return true;
    } catch { return false; }
  }

  // 分析八字基调
  async function startGame() {
    if (!calcBazi()) return;
    setGameState('playing');
    setIsStreaming(true);
    setStreamStory('');
    setStreamChoices(null);
    setStreamConsequence('');
    setKline([]);
    setCurrentAgeIdx(0);
    setDeathInfo(null);
    setAiSummary('');
    bufferRef.current = '';

    const gua = GUA_JU[pattern] || GUA_JU['杂气格'];

    // 第一步：AI分析基调
    let toneText = '';
    try {
      await new Promise<void>((resolve) => {
        let full = '';
        streamSiliconAPI([
          { role: 'system', content: TONE_PROMPT + NO_MARKDOWN_RULE },
          { role: 'user', content: `八字：${pillar}，性别：${gender === 'male' ? '男' : '女'}，格局：${gua.name}（${gua.desc}）。请分析一生基调。` },
        ], {
          onChunk: (d) => { full += d; },
          onDone: () => { toneText = full; resolve(); },
          onError: () => resolve(),
        }, { maxTokens: 600 });
      });

      // 解析基调JSON
      try {
        const m = toneText.match(/\{[\s\S]*\}/);
        if (m) {
          const parsed = JSON.parse(m[0]);
          setTone(parsed.tone || `${gua.name}，${gua.desc}`);
          setStrengths(parsed.strengths || ['才华', '努力']);
          setWeaknesses(parsed.weaknesses || ['冲动']);
          setSuitablePaths(parsed.suitablePaths || ['稳健发展']);
          setDeathRiskAges(parsed.deathRiskAges || []);
        } else {
          throw new Error('no json');
        }
      } catch {
        setTone(`${gua.name}，${gua.desc}`);
        setStrengths(['才华', '努力']);
        setWeaknesses(['冲动']);
        setSuitablePaths(['稳健发展']);
        setDeathRiskAges([]);
      }
    } catch {
      setTone(`${gua.name}，${gua.desc}`);
      setStrengths(['才华', '努力']);
      setWeaknesses(['冲动']);
      setSuitablePaths(['稳健发展']);
      setDeathRiskAges([]);
    }

    // 第二步：流式生成第1段剧情
    fetchStage(0);
  }

  // 流式获取某年龄段剧情
  function fetchStage(ageIdx: number) {
    setIsStreaming(true);
    setStreamStory('');
    setStreamChoices(null);
    setStreamConsequence('');
    bufferRef.current = '';

    const age = AGES[ageIdx];
    const isLucky = false; // 可由基调控制
    const isTough = false;

    const prompt = makeStagePrompt(
      age, gender === 'male' ? '乾造' : '坤造',
      (GUA_JU[pattern] || GUA_JU['杂气格']).name,
      tone, strengths, weaknesses, suitablePaths,
      [], isLucky, isTough
    );

    let storyShown = false;

    streamSiliconAPI([
      { role: 'system', content: `你是黄师傅，命理人生模拟器大师。根据用户八字格局，为${age}岁生成剧情和6个差异化选择。` + NO_MARKDOWN_RULE },
      { role: 'user', content: prompt },
    ], {
      onChunk: (delta) => {
        bufferRef.current += delta;
        const buf = bufferRef.current;

        // 实时提取剧情显示
        const story = extractStory(buf);
        if (story && !storyShown) {
          setStreamStory(story);
          storyShown = true;
        } else if (story && storyShown) {
          setStreamStory(story); // 更新更完整的版本
        }

        // 实时提取选项
        const choices = extractChoices(buf);
        if (choices && choices.length >= 4) {
          setStreamChoices(choices.slice(0, 6));
        }
      },
      onDone: () => {
        setIsStreaming(false);
        // 确保最终内容
        const buf = bufferRef.current;
        const finalStory = extractStory(buf);
        if (finalStory) setStreamStory(finalStory);
        const finalChoices = extractChoices(buf);
        if (finalChoices) setStreamChoices(finalChoices.slice(0, 6));
      },
      onError: () => {
        setIsStreaming(false);
        // fallback
        setStreamStory(`你来到了${age}岁。人生的路还很长，每一步选择都在塑造你的命运。`);
        setStreamChoices([
          { text: '顺应天命，走最稳妥的路', label: '顺应天命', style: 'destiny' },
          { text: '积德行善，帮助他人', label: '积德行善', style: 'virtue' },
          { text: '全力拼搏，追求事业', label: '锐意进取', style: 'ambition' },
          { text: '保守稳妥，保住成果', label: '守成稳进', style: 'steady' },
          { text: '听从内心，不循常规', label: '随心而行', style: 'free' },
          { text: '孤注一掷，改变命运', label: '孤注一掷', style: 'gamble' },
        ]);
      },
    }, { maxTokens: 1200 });
  }

  // 做选择
  function choose(choiceIdx: number) {
    if (!streamChoices || !streamChoices[choiceIdx]) return;
    const ch = streamChoices[choiceIdx];
    const prevStory = streamStory;

    setIsStreaming(true);
    setStreamConsequence('');
    bufferRef.current = '';

    const prompt = makeConsequencePrompt(
      AGES[currentAgeIdx], ch.label, ch.text,
      (GUA_JU[pattern] || GUA_JU['杂气格']).name, tone, prevStory
    );

    let consequenceShown = false;

    streamSiliconAPI([
      { role: 'system', content: `你是黄师傅。根据玩家的选择，写2-3句具体后果，然后输出属性变化JSON。` + NO_MARKDOWN_RULE },
      { role: 'user', content: prompt },
    ], {
      onChunk: (delta) => {
        bufferRef.current += delta;
        const buf = bufferRef.current;

        // 检查死亡
        const death = extractDeath(buf);
        if (death) {
          setDeathInfo({ title: death.title, reason: death.reason });
          setIsStreaming(false);
          return;
        }

        // 实时显示后果
        const cons = extractConsequence(buf);
        if (cons && !consequenceShown) {
          setStreamConsequence(cons);
          consequenceShown = true;
        } else if (cons) {
          setStreamConsequence(cons);
        }

        // 实时应用属性变化
        const changes = extractAttrChanges(buf);
        if (changes) {
          setAttrs(prev => {
            const next = applyAttrChanges(prev, changes);
            return next;
          });
        }
      },
      onDone: () => {
        setIsStreaming(false);
        const buf = bufferRef.current;

        // 检查死亡
        const death = extractDeath(buf);
        if (death) {
          setDeathInfo({ title: death.title, reason: death.reason });
          return;
        }

        const finalCons = extractConsequence(buf);
        if (finalCons) setStreamConsequence(finalCons);

        const finalChanges = extractAttrChanges(buf);
        if (finalChanges) {
          setAttrs(prev => {
            const next = applyAttrChanges(prev, finalChanges);
            // 更新K线
            setKline(prevK => {
              const nk = [...prevK];
              nk[currentAgeIdx] = calcScore(next);
              return nk;
            });
            return next;
          });
        } else {
          // 没有属性变化也要更新K线
          setKline(prevK => {
            const nk = [...prevK];
            nk[currentAgeIdx] = calcScore(attrs);
            return nk;
          });
        }
      },
      onError: () => {
        setIsStreaming(false);
        setStreamConsequence('命运之轮继续转动...');
      },
    }, { maxTokens: 600 });
  }

  // 进入下一年龄段
  function nextAge() {
    if (deathInfo) {
      setGameState('death');
      fetchAISummary(true);
      return;
    }
    if (currentAgeIdx < AGES.length - 1) {
      const nextIdx = currentAgeIdx + 1;
      setCurrentAgeIdx(nextIdx);
      setStreamStory('');
      setStreamChoices(null);
      setStreamConsequence('');
      fetchStage(nextIdx);
    } else {
      setGameState('report');
      fetchAISummary(false);
    }
  }

  function fetchAISummary(died: boolean) {
    setAiLoading(true);
    const gua = GUA_JU[pattern] || GUA_JU['杂气格'];
    let full = '';
    streamSiliconAPI([
      { role: 'system', content: `你是黄师傅。根据用户的人生写200字总结+命运vs选择哲理。不要编号。` + NO_MARKDOWN_RULE },
      { role: 'user', content: `八字${pillar}，${gua.name}，${tone}。${died ? '中途离世' : '活到80岁'}。六维：财${attrs.wealth}业${attrs.career}健${attrs.health}情${attrs.love}学${attrs.study}人${attrs.social}。写总结。` },
    ], {
      onChunk: (d) => { full += d; setAiSummary(full); },
      onDone: () => setAiLoading(false),
      onError: () => { setAiLoading(false); setAiSummary(`八字${pillar}，${gua.name}。${tone}。命运给了起点，选择写了过程。`); },
    }, { maxTokens: 600 });
  }

  function restart() {
    setGameState('input');
    setTone(''); setStrengths([]); setWeaknesses([]); setSuitablePaths([]); setDeathRiskAges([]);
    setCurrentAgeIdx(0); setKline([]); setDeathInfo(null); setAiSummary('');
    setStreamStory(''); setStreamChoices(null); setStreamConsequence('');
    setAttrs({ wealth: 50, career: 50, health: 50, love: 50, study: 50, social: 50, karma: 0 });
  }

  const ending = deathInfo
    ? getEnding(calcScore(attrs), true, AGES[currentAgeIdx])
    : getEnding(calcScore(attrs), false);

  const attrCfg = [
    { key: 'wealth', name: '财运', color: '#fbbf24', icon: Banknote },
    { key: 'career', name: '事业', color: '#f472b6', icon: Target },
    { key: 'health', name: '健康', color: '#4ade80', icon: Activity },
    { key: 'love', name: '感情', color: '#f87171', icon: Heart },
    { key: 'study', name: '学业', color: '#60a5fa', icon: GraduationCap },
    { key: 'social', name: '人际', color: '#a78bfa', icon: Users },
  ];

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-12">
      <style>{`
        @keyframes fU { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fI { from{opacity:0}to{opacity:1} }
        @keyframes br { 0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.08);opacity:1} }
        @keyframes sh { 0%{background-position:-200%0}100%{background-position:200%0} }
        @keyframes dn { from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)} }
        @keyframes type { from{width:0}to{width:100%} }
        .aFU { animation: fU 0.6s ease forwards }
        .aFI { animation: fI 0.4s ease forwards }
        .shTxt { background: linear-gradient(90deg,#78350f 0%,#fbbf24 40%,#fff 50%,#fbbf24 60%,#78350f 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: sh 4s linear infinite }
        input[type=number] { background: #0f0f1a; color: #fff }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { opacity: 0.3 }
      `}</style>

      <Link to="/games" className="inline-flex items-center gap-1 text-xs text-white/20 hover:text-white/50 transition-colors pt-2">
        <ArrowLeft className="w-3.5 h-3.5" />返回小游戏
      </Link>

      {/* TITLE */}
      <div className="relative text-center space-y-2 py-8 overflow-hidden rounded-3xl"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(180,83,9,0.1), rgba(10,5,2,0.98))', border: '1px solid rgba(251,191,36,0.06)' }}>
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 25% 50%, rgba(245,158,11,0.08), transparent 50%), radial-gradient(circle at 75% 50%, rgba(220,38,38,0.05), transparent 50%)' }} />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)', color: '#b45309' }}>
            <Sparkles className="w-3 h-3" />AI实时推演 · 流式命运
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight shTxt" style={{ fontFamily: "'Noto Serif SC','KaiTi',serif" }}>命理人生模拟器</h1>
          <p className="text-[10px] text-white/20">黄师傅实时为你编写命运 · 边生成边游玩</p>
        </div>
      </div>

      {/* INPUT */}
      {gameState === 'input' && (
        <div className="aFU space-y-5">
          <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'linear-gradient(180deg, rgba(251,191,36,0.015), rgba(10,5,2,0.98))', borderColor: 'rgba(251,191,36,0.08)' }}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400/60" />
              <span className="text-sm font-bold text-white/70" style={{ fontFamily: "'Noto Serif SC',serif" }}>出生信息</span>
              <span className="text-[9px] text-white/15">公历</span>
            </div>
            <div className="h-px bg-gradient-to-r from-amber-400/10 to-transparent" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[{l:'年',v:year,s:setYear,mn:1900,mx:2025},{l:'月',v:month,s:setMonth,mn:1,mx:12},{l:'日',v:day,s:setDay,mn:1,mx:31},{l:'时',v:hour,s:setHour,mn:0,mx:23}].map(f=> (
                <div key={f.l} className="space-y-1">
                  <label className="text-[9px] text-white/20 font-medium">{f.l}</label>
                  <input type="number" value={f.v} min={f.mn} max={f.mx} onChange={e=>{const v=e.target.value;f.s(v===''?0:Number(v))}} className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-lg font-bold focus:outline-none focus:border-amber-400/30 text-center transition-all" style={{fontFamily:"'Noto Serif SC',serif"}} />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {[{v:'male' as const,l:'男',sub:'乾造'},{v:'female' as const,l:'女',sub:'坤造'}].map(g=> (
                <button key={g.v} onClick={()=>setGender(g.v)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${gender===g.v?'bg-amber-500/[0.08] border-amber-400/30 text-amber-300':'bg-white/[0.015] border-white/[0.06] text-white/30 hover:text-white/50'}`}>
                  {g.l}<span className="text-[9px] opacity-40 ml-1">{g.sub}</span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={startGame} className="w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2" style={{background:'linear-gradient(135deg,#78350f,#451a03)',boxShadow:'0 6px 30px rgba(120,53,15,0.35),inset 0 1px 0 rgba(255,255,255,0.08)',border:'1px solid rgba(251,191,36,0.12)'}}>
            <Sparkles className="w-5 h-5 text-amber-400" />开启命运之门
          </button>
        </div>
      )}

      {/* PLAYING */}
      {gameState === 'playing' && (
        <div className="aFU space-y-4">
          {/* 基调 */}
          {tone && (
            <div className="rounded-lg px-3 py-2 border" style={{ background: 'rgba(251,191,36,0.03)', borderColor: 'rgba(251,191,36,0.08)' }}>
              <p className="text-[10px] text-amber-400/50" style={{ fontFamily: "'Noto Serif SC',serif" }}>{(GUA_JU[pattern]||GUA_JU['杂气格']).name} · {tone}</p>
            </div>
          )}

          {/* 六维 */}
          <div className="rounded-xl border p-3.5 space-y-2" style={{ background: 'rgba(255,255,255,0.008)', borderColor: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-white/15 font-bold tracking-wider">六维</span>
              <span className="text-[9px] text-white/10">因果 {attrs.karma}</span>
            </div>
            <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
              {attrCfg.map(a=> <AttrBar key={a.key} name={a.name} value={attrs[a.key as keyof SixAttrs] as number} color={a.color} icon={a.icon} />)}
            </div>
          </div>

          {/* K线 */}
          {kline.length > 0 && (
            <div className="rounded-xl border p-2.5" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center justify-between px-1 mb-0.5">
                <span className="text-[9px] text-white/15 flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" />运势</span>
                <span className="text-[9px] text-amber-400/30">{AGES[currentAgeIdx]}岁</span>
              </div>
              <EChartKLine data={kline} idx={currentAgeIdx} />
            </div>
          )}

          {/* 进度 */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${((currentAgeIdx+1)/9)*100}%`, background: 'linear-gradient(90deg,#451a03,#fbbf24)' }} />
            </div>
            <span className="text-[9px] text-white/15 font-mono">{currentAgeIdx+1}/9</span>
          </div>

          {/* 事件卡 - 流式内容 */}
          <div className="relative rounded-2xl border overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(251,191,36,0.015), rgba(5,3,2,0.99))', borderColor: 'rgba(251,191,191,0.08)' }}>
            {/* 头部 */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(120,53,15,0.35), rgba(69,26,3,0.25))', border: '1px solid rgba(251,191,36,0.12)' }}>
                  <span className="text-base font-bold leading-none" style={{ color: '#fbbf24', fontFamily: "'Noto Serif SC',serif" }}>{AGES[currentAgeIdx]}</span>
                  <span className="text-[7px] text-amber-400/30">岁</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Noto Serif SC',serif" }}>{DA_YUN[currentAgeIdx]}</h3>
                  <p className="text-[9px] text-white/15">{AGES[currentAgeIdx]}岁 · 第{currentAgeIdx+1}章</p>
                </div>
                {isStreaming && !streamChoices && (
                  <span className="ml-auto flex items-center gap-1 text-[9px] text-amber-400/40">
                    <Loader2 className="w-3 h-3 animate-spin" />推演中
                  </span>
                )}
              </div>
            </div>

            {/* 剧情 - 流式显示 */}
            <div className="px-4 pb-3">
              <div className="rounded-lg p-3.5 border min-h-[60px]" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.03)' }}>
                {streamStory ? (
                  <p className="text-xs text-white/60 leading-relaxed aFI">
                    <HighlightText text={streamStory} />
                  </p>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-white/20">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400/40" />
                    黄师傅正在推演{AGES[currentAgeIdx]}岁的命运...
                  </div>
                )}
              </div>
            </div>

            {/* 6选择 - 流式显示 */}
            {streamChoices && !streamConsequence && (
              <div className="px-4 pb-4 aFI">
                <div className="flex items-center gap-1.5 mb-3">
                  <Gem className="w-3.5 h-3.5 text-amber-400/70" />
                  <span className="text-xs font-bold text-amber-300/80" style={{ fontFamily: "'Noto Serif SC',serif" }}>六条道路</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {streamChoices.map((ch, idx) => {
                    const style = CHOICE_STYLES[ch.style] || CHOICE_STYLES.destiny;
                    return (
                      <button
                        key={idx}
                        onClick={() => choose(idx)}
                        disabled={isStreaming}
                        className="group relative w-full text-left transition-all duration-300 rounded-xl overflow-hidden hover:scale-[1.02] hover:-translate-y-0.5"
                        style={{
                          background: `linear-gradient(135deg, ${style.bg}, rgba(0,0,0,0.3))`,
                          border: `1px solid ${style.border}`,
                          opacity: isStreaming ? 0.6 : 1,
                        }}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${style.glow}, transparent 70%)` }} />
                        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${style.color}40, transparent)` }} />
                        <div className="relative p-3.5 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: `${style.color}15`, border: `1px solid ${style.color}25`, color: style.color, fontFamily: "'Noto Serif SC',serif" }}>
                              {GAN_LABELS[idx]}
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${style.color}10`, color: `${style.color}90` }}>{ch.label}</span>
                          </div>
                          <p className="text-[11px] text-white/55 group-hover:text-white/75 transition-colors leading-relaxed">{ch.text}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 后果 - 流式显示 */}
            {streamConsequence && (
              <div className="px-4 pb-4 aFU">
                <div className="rounded-lg p-3.5 border mb-3" style={{ background: 'rgba(251,191,36,0.015)', borderColor: 'rgba(251,191,36,0.08)' }}>
                  <p className="text-xs text-white/50 leading-relaxed">
                    <HighlightText text={streamConsequence} />
                  </p>
                </div>
                <button onClick={nextAge}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #78350f, #451a03)', boxShadow: '0 4px 15px rgba(120,53,15,0.25)', color: '#fff' }}>
                  {deathInfo ? <><Skull className="w-4 h-4" />查看结局</> : currentAgeIdx < 8 ? <><ChevronRight className="w-4 h-4" />{AGES[currentAgeIdx+1]}岁</> : <><Crown className="w-4 h-4" />查看结局</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEATH */}
      {gameState === 'death' && deathInfo && (
        <div className="aFU space-y-5">
          <div className="text-center py-6 space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(127,29,29,0.15))', border: '1px solid rgba(239,68,68,0.15)' }}>
              <Skull className="w-8 h-8 text-red-400/50" />
            </div>
            <h2 className="text-2xl font-bold text-red-300/70" style={{ fontFamily: "'Noto Serif SC',serif" }}>{deathInfo.title}</h2>
            <p className="text-xs text-white/30">{pillar} · 享年 {AGES[currentAgeIdx]} 岁</p>
          </div>
          <div className="rounded-xl border border-red-400/10 p-4" style={{ background: 'rgba(239,68,68,0.02)' }}>
            <p className="text-xs text-white/40 leading-relaxed">{deathInfo.reason}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ background: 'linear-gradient(135deg, rgba(120,53,15,0.03), rgba(10,5,2,0.98))', borderColor: 'rgba(251,191,36,0.08)' }}>
            {aiLoading && !aiSummary && <div className="flex items-center gap-2 text-xs text-white/20"><Loader2 className="w-3.5 h-3.5 animate-spin" />黄师傅正在写总结...</div>}
            {aiSummary && <div className="text-xs text-white/50 leading-relaxed whitespace-pre-wrap"><HighlightText text={aiSummary} /></div>}
          </div>
          <button onClick={restart} className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
            <RotateCcw className="w-4 h-4" />投胎转世
          </button>
        </div>
      )}

      {/* REPORT */}
      {gameState === 'report' && (
        <div className="aFU space-y-5">
          <div className="text-center py-6 space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(120,53,15,0.2))', border: '1px solid rgba(251,191,36,0.15)', boxShadow: '0 0 30px rgba(251,191,36,0.08)' }}>
              <span className="text-3xl font-black" style={{ color: '#fbbf24', fontFamily: "'Noto Serif SC',serif" }}>{ending.grade}</span>
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Noto Serif SC',serif" }}>{ending.title}</h2>
            <p className="text-xs text-white/30">{ending.desc}</p>
            <p className="text-sm text-amber-300/60 font-medium">{pillar}</p>
          </div>
          <div className="rounded-xl border p-3.5 space-y-2" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.03)' }}>
            <span className="text-[9px] text-white/15">六维</span>
            <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
              {attrCfg.map(a=> <AttrBar key={a.key} name={a.name} value={attrs[a.key as keyof SixAttrs] as number} color={a.color} icon={a.icon} />)}
            </div>
          </div>
          {kline.length > 0 && <div className="rounded-xl border p-2.5" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.03)' }}><EChartKLine data={kline} /></div>}
          <div className="rounded-xl border p-4" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.03)' }}><EChartRadar attrs={attrs} /></div>
          <div className="rounded-xl border p-4" style={{ background: 'linear-gradient(135deg, rgba(120,53,15,0.03), rgba(10,5,2,0.98))', borderColor: 'rgba(251,191,36,0.08)' }}>
            {aiLoading && !aiSummary && <div className="flex items-center gap-2 text-xs text-white/20"><Loader2 className="w-3.5 h-3.5 animate-spin" />黄师傅总结中...</div>}
            {aiSummary && <div className="text-xs text-white/50 leading-relaxed whitespace-pre-wrap"><HighlightText text={aiSummary} /></div>}
          </div>

          {/* 保存人生报告 */}
          <div className="flex justify-center">
            <SaveRecordButton
              type="lifesim"
              typeLabel="命理人生模拟"
              data={{
                pillar,
                birthday,
                gender,
                attrs,
                ending,
                aiSummary,
                ageDied: ageDied || undefined,
              } as unknown as Record<string, unknown>}
            />
          </div>

          <button onClick={restart} className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
            <RotateCcw className="w-4 h-4" />投胎转世
          </button>
        </div>
      )}
    </div>
  );
}
