import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, RotateCcw, ArrowLeft, Send, Loader2, Award, BookOpen,
  Star, Target, User, Users, Heart, Briefcase, Home, Crown,
  ChevronRight, CheckCircle2, Lightbulb, ScrollText,
  FlaskConical, Orbit, Hexagon, Flower, Info
} from 'lucide-react';
import { callSiliconAPIWithRetry } from '@/utils/apiClient';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';
import HighlightText from '@/components/HighlightText';
import {
  type GameMode, type BaziInfo, type GuaInfo, type AIAnswer, type ScoreResult, type LiuYaoAnswer,
  generateRandomBazi, generateRandomGua,
  makeBaziAnswerPrompt, makeScorePrompt,
  makeLiuYaoAnswerPrompt, makeLiuYaoScorePrompt,
  makeMeiHuaAnswerPrompt, makeMeiHuaScorePrompt,
  parseScoreJSON, parseAIAnswerJSON, parseLiuYaoAnswerJSON, parseGuaScoreJSON,
} from '@/data/masterGame';
import {
  getGuaLines, getGuaComponents, getBianGua, getHuGua,
  GUA_WUXING, getLiuShen, NA_JIA, DI_ZHI_WX, getGuaUnicode,
} from '@/data/guaGraphics';

declare global { interface Window { Lunar: any; } }

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

// ===== 卦画渲染组件 =====
function YaoLine({ isYang, isMoving, isHighlighted }: { isYang: boolean; isMoving: boolean; isHighlighted: boolean }) {
  return (
    <div className="flex items-center justify-center py-[3px]">
      <div className="relative h-[3px] rounded-full transition-all" style={{
        width: isYang ? '48px' : '48px',
        background: isMoving ? '#fbbf24' : isHighlighted ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)',
        boxShadow: isMoving ? '0 0 8px rgba(251,191,36,0.4)' : 'none',
      }}>
        {!isYang && (
          <>
            <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: '20px', background: isMoving ? '#fbbf24' : isHighlighted ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)', boxShadow: isMoving ? '0 0 8px rgba(251,191,36,0.4)' : 'none' }} />
            <div className="absolute right-0 top-0 h-full rounded-full" style={{ width: '20px', background: isMoving ? '#fbbf24' : isHighlighted ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)', boxShadow: isMoving ? '0 0 8px rgba(251,191,36,0.4)' : 'none' }} />
          </>
        )}
      </div>
    </div>
  );
}

function GuaGraphic({ guaName, movingYao, size = 'normal' }: { guaName: string; movingYao?: number[]; size?: 'small' | 'normal' | 'large' }) {
  const lines = getGuaLines(guaName);
  const comp = getGuaComponents(guaName);
  const w = size === 'small' ? 'w-8' : size === 'large' ? 'w-14' : 'w-11';
  const unicode = getGuaUnicode(guaName);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`${w} text-center font-bold tabular-nums`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: size === 'small' ? '10px' : size === 'large' ? '16px' : '13px' }}>
        {unicode}
      </span>
      <span className={`${w} text-center text-[9px]`} style={{ color: 'rgba(255,255,255,0.3)' }}>{guaName}</span>
      <div className="flex flex-col-reverse">
        {lines.map((line, i) => (
          <YaoLine key={i} isYang={line === 1} isMoving={movingYao?.includes(i + 1) || false} isHighlighted={false} />
        ))}
      </div>
      <span className={`${w} text-center text-[8px] mt-0.5`} style={{ color: 'rgba(255,255,255,0.2)' }}>
        上{comp.upper}下{comp.lower}
      </span>
    </div>
  );
}

// 六爻完整排盘
function LiuYaoPan({ guaInfo }: { guaInfo: GuaInfo }) {
  const lines = getGuaLines(guaInfo.benGua);
  const comp = getGuaComponents(guaInfo.benGua);
  const benWX = GUA_WUXING[comp.upper] || '';
  const liuShens = getLiuShen('甲'); // 简化，用甲日
  const naJia = NA_JIA[comp.lower] || NA_JIA['乾'];
  const yaoNum = guaInfo.yaoCi[0]?.match(/\d+/)?.[0] ? parseInt(guaInfo.yaoCi[0].match(/\d+/)![0]) : 1;

  return (
    <div className="space-y-4">
      {/* 占卦信息 */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-lg p-2 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/30">占卦人：</span>
          <span className="text-white/50">{guaInfo.questioner}</span>
        </div>
        <div className="rounded-lg p-2 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/30">所占之事：</span>
          <span className="text-white/50">{guaInfo.question}</span>
        </div>
      </div>

      {/* 卦画 + 六亲六神 */}
      <div className="flex gap-4 justify-center">
        {/* 本卦 */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold mb-2" style={{ color: '#60a5fa' }}>本卦 · {guaInfo.benGua}</span>
          <div className="flex flex-col-reverse">
            {lines.map((line, i) => {
              const isMoving = (i + 1) === yaoNum;
              const diZhi = naJia[i] || '';
              const dzWX = DI_ZHI_WX[diZhi] || '';
              return (
                <div key={i} className="flex items-center gap-2 py-[2px]">
                  <span className="text-[9px] w-8 text-right" style={{ color: isMoving ? '#fbbf24' : 'rgba(255,255,255,0.25)' }}>
                    {diZhi}{dzWX}
                  </span>
                  <YaoLine isYang={line === 1} isMoving={isMoving} isHighlighted={false} />
                  <span className="text-[9px] w-10" style={{ color: isMoving ? '#fbbf24' : 'rgba(255,255,255,0.25)' }}>
                    {liuShens[5 - i]}
                  </span>
                  <span className="text-[9px] w-6" style={{ color: isMoving ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}>
                    {isMoving ? '◆动' : `${i + 1}爻`}
                  </span>
                </div>
              );
            })}
          </div>
          <span className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>{guaInfo.shiYing}</span>
        </div>

        {/* 变卦 */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>变卦 · {guaInfo.bianGua}</span>
          <GuaGraphic guaName={guaInfo.bianGua} size="normal" />
        </div>
      </div>

      {/* 卦象信息 */}
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="rounded-lg p-2 border text-center" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/20 block">五行</span>
          <span className="text-white/50">{benWX}</span>
        </div>
        <div className="rounded-lg p-2 border text-center" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/20 block">动爻</span>
          <span className="text-amber-400/70">第{yaoNum}爻</span>
        </div>
        <div className="rounded-lg p-2 border text-center" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/20 block">世应</span>
          <span className="text-white/50">{guaInfo.shiYing}</span>
        </div>
      </div>
    </div>
  );
}

// 梅花三卦
function MeiHuaPan({ guaInfo }: { guaInfo: GuaInfo }) {
  const yaoNum = guaInfo.yaoCi[0]?.match(/\d+/)?.[0] ? parseInt(guaInfo.yaoCi[0].match(/\d+/)![0]) : 1;
  const huGua = getHuGua(guaInfo.benGua);

  return (
    <div className="space-y-4">
      {/* 占卦信息 */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-lg p-2 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/30">占卦人：</span>
          <span className="text-white/50">{guaInfo.questioner}</span>
        </div>
        <div className="rounded-lg p-2 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/30">所占之事：</span>
          <span className="text-white/50">{guaInfo.question}</span>
        </div>
      </div>

      {/* 三卦并排 */}
      <div className="flex gap-6 justify-center items-start">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold" style={{ color: '#4ade80' }}>本卦</span>
          <GuaGraphic guaName={guaInfo.benGua} movingYao={[yaoNum]} size="large" />
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>上{getGuaComponents(guaInfo.benGua).upper}下{getGuaComponents(guaInfo.benGua).lower}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>互卦</span>
          <GuaGraphic guaName={huGua} size="large" />
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>取234/345爻</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold" style={{ color: '#60a5fa' }}>变卦</span>
          <GuaGraphic guaName={guaInfo.bianGua} size="large" />
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>第{yaoNum}爻动</span>
        </div>
      </div>

      {/* 体用分析 */}
      <div className="rounded-lg p-3 border text-[11px]" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
        <span className="text-white/30">体用分析：</span>
        <span className="text-white/50">上卦{getGuaComponents(guaInfo.benGua).upper}（{GUA_WUXING[getGuaComponents(guaInfo.benGua).upper]}）为体，下卦{getGuaComponents(guaInfo.benGua).lower}（{GUA_WUXING[getGuaComponents(guaInfo.benGua).lower]}）为用</span>
      </div>
    </div>
  );
}

// 八字四柱
function BaZiPan({ info, result }: { info: BaziInfo; result: any }) {
  if (!result) return null;
  const gz = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const colors: Record<string, string> = { '金': '#fbbf24', '木': '#4ade80', '火': '#ef4444', '水': '#60a5fa', '土': '#f97316' };
  const wxMap: Record<string, string> = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  return (
    <div className="space-y-3">
      <div className="text-center text-[11px] text-white/40 mb-2">
        公历 {info.year}年{info.month}月{info.day}日 {info.hour}时 · {info.gender === 'male' ? '男' : '女'}命
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: '年柱', gan: result.year.gan, zhi: result.year.zhi },
          { label: '月柱', gan: result.month.gan, zhi: result.month.zhi },
          { label: '日柱', gan: result.day.gan, zhi: result.day.zhi },
          { label: '时柱', gan: result.hour.gan, zhi: result.hour.zhi },
        ].map((p) => {
          const gwx = wxMap[p.gan] || '';
          const c = colors[gwx] || 'rgba(255,255,255,0.3)';
          return (
            <div key={p.label} className="rounded-lg border p-2 text-center" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <span className="text-[9px] block mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.label}</span>
              <span className="text-lg font-bold block" style={{ color: c }}>{p.gan}</span>
              <span className="text-sm block" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.zhi}</span>
              <span className="text-[8px]" style={{ color: c, opacity: 0.5 }}>{gwx}</span>
            </div>
          );
        })}
      </div>
      <div className="text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
        日主：<span className="font-bold" style={{ color: colors[wxMap[result.dayGan] || ''] || 'rgba(255,255,255,0.5)' }}>{result.dayGan}</span>（{wxMap[result.dayGan] || ''}）
      </div>
    </div>
  );
}

// 紫微12宫
function ZiWeiPan({ info, palaces }: { info: BaziInfo; palaces: any[] }) {
  if (!palaces.length) {
    return (
      <div className="text-center text-[11px] text-white/30 py-8">
        <Info className="w-5 h-5 mx-auto mb-2 opacity-30" />
        紫微斗数排盘库加载中...<br/>
        生辰：{info.year}年{info.month}月{info.day}日 {info.hour}时 · {info.gender === 'male' ? '男' : '女'}
      </div>
    );
  }

  const palaceNames = ['命宫','父母','福德','田宅','事业','交友','迁移','疾厄','财帛','子女','夫妻','兄弟'];
  const palaceColor = (name: string) => {
    if (name === '命宫') return '#fbbf24';
    if (['财帛','事业'].includes(name)) return '#4ade80';
    if (['夫妻','子女'].includes(name)) return '#f472b6';
    return 'rgba(255,255,255,0.35)';
  };

  return (
    <div className="space-y-3">
      <div className="text-center text-[11px] text-white/40">
        公历 {info.year}年{info.month}月{info.day}日 {info.hour}时 · {info.gender === 'male' ? '男' : '女'}命
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {palaces.map((p, i) => (
          <div key={i} className="rounded-lg border p-2" style={{
            background: p.name === '命宫' ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.02)',
            borderColor: p.name === '命宫' ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
          }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold" style={{ color: palaceColor(p.name || palaceNames[i]) }}>{p.name || palaceNames[i]}</span>
              <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{p.position || ''}</span>
            </div>
            <div className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {(p.majorStars || []).slice(0, 3).join('、') || <span style={{ color: 'rgba(255,255,255,0.15)' }}>无主星</span>}
            </div>
            {(p.minorStars || []).length > 0 && (
              <div className="text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {(p.minorStars || []).slice(0, 3).join(' ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 分数条 =====
function ScoreBar({ label, score, maxScore, color, feedback }: { label: string; score: number; maxScore: number; color: string; feedback: string }) {
  const pct = (score / maxScore) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50 font-medium">{label}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}<span className="text-white/20">/{maxScore}</span></span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}30, ${color})` }} />
      </div>
      {feedback && <p className="text-[11px] text-white/30 leading-relaxed pl-1">{feedback}</p>}
    </div>
  );
}

export default function MasterGameTool() {
  const [phase, setPhase] = useState<'select' | 'loading' | 'display' | 'answer' | 'scoring' | 'result'>('select');
  const [mode, setMode] = useState<GameMode | null>(null);
  const [gender, setGender] = useState('');
  const [pillar, setPillar] = useState('');
  const [pattern, setPattern] = useState('');
  const [guaInfo, setGuaInfo] = useState<GuaInfo | null>(null);
  const [baziResult, setBaziResult] = useState<any>(null);
  const [baziInfo, setBaziInfo] = useState<BaziInfo | null>(null);
  const [ziweiPalaces, setZiweiPalaces] = useState<any[]>([]);

  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [userGuaAnalysis, setUserGuaAnalysis] = useState('');
  const [userGuaResult, setUserGuaResult] = useState('');

  const [aiAnswer, setAiAnswer] = useState<AIAnswer | null>(null);
  const [aiGuaAnswer, setAiGuaAnswer] = useState<LiuYaoAnswer | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [guaScoreResult, setGuaScoreResult] = useState<any>(null);
  const [loadingText, setLoadingText] = useState('');

  const gameIdRef = useRef<string>('');

  // 加载iztro
  function loadIztro(): Promise<any> {
    return new Promise((resolve, reject) => {
      const w = window as any;
      if (w.iztro) { resolve(w.iztro); return; }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/iztro@2.0.5/dist/iztro.min.js';
      s.onload = () => resolve(w.iztro);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const startGame = useCallback(async (selectedMode: GameMode) => {
    setMode(selectedMode);
    setPhase('loading');
    setUserAnswers({});
    setUserGuaAnalysis('');
    setUserGuaResult('');
    setAiAnswer(null);
    setAiGuaAnswer(null);
    setScoreResult(null);
    setGuaScoreResult(null);
    setBaziResult(null);
    setZiweiPalaces([]);
    setGuaInfo(null);
    gameIdRef.current = '';

    try {
      if (selectedMode === 'bazi') await startBazi();
      else if (selectedMode === 'ziwei') await startZiWei();
      else await startGua(selectedMode);
    } catch { setPhase('select'); }
  }, []);

  // ===== 八字：代码排四柱 + AI只分析格局 =====
  async function startBazi() {
    const info = generateRandomBazi();
    setBaziInfo(info);
    const genderText = info.gender === 'male' ? '男' : '女';
    setGender(genderText);
    gameIdRef.current = `bazi_${info.year}_${info.month}_${info.day}_${info.hour}_${info.gender}`;

    let pillarText = '';
    let patternText = '杂气格';
    let bzResult: any = null;

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
        bzResult = {
          year: { gan: bz.getYear()[0], zhi: bz.getYear()[1] },
          month: { gan: bz.getMonth()[0], zhi: bz.getMonth()[1] },
          day: { gan: bz.getDay()[0], zhi: bz.getDay()[1] },
          hour: { gan: bz.getTime()[0], zhi: bz.getTime()[1] },
          dayGan: dg,
        };
      }
    } catch {
      pillarText = '甲子 丙寅 戊辰 庚午';
      setPillar(pillarText);
      bzResult = { year: { gan: '甲', zhi: '子' }, month: { gan: '丙', zhi: '寅' }, day: { gan: '戊', zhi: '辰' }, hour: { gan: '庚', zhi: '午' }, dayGan: '戊' };
    }
    setBaziResult(bzResult);

    setLoadingText('AI正在隐藏标准答案...');
    const answerPrompt = makeBaziAnswerPrompt(pillarText, patternText, genderText);
    const answerResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: '你是黄师傅，八字命理宗师。请严格分析输出JSON。只输出JSON，不分析其他。' + NO_MARKDOWN_RULE },
      { role: 'user', content: answerPrompt },
    ], { maxTokens: 2000, temperature: 0.3 });
    setAiAnswer(parseAIAnswerJSON(answerResponse) || { overallPattern: 'AI分析中...', wealth: '', marriage: '', friendship: '', career: '', family: '', parents: '' });
    setPhase('display');
  }

  // ===== 紫微：优先iztro，失败则用AI排盘 =====
  async function startZiWei() {
    const info = generateRandomBazi();
    setBaziInfo(info);
    const genderText = info.gender === 'male' ? '男' : '女';
    setGender(genderText);
    gameIdRef.current = `ziwei_${info.year}_${info.month}_${info.day}_${info.hour}_${info.gender}`;

    setLoadingText('正在排紫微命盘...');

    // 先用八字算日主
    let dayGan = '戊';
    try {
      const L = window.Lunar;
      if (L) {
        const lunar = L.fromYmdHms(info.year, info.month, info.day, info.hour, 0, 0);
        dayGan = lunar.getEightChar().getDay()[0];
      }
    } catch { /* default */ }

    let palaces: any[] = [];

    // 尝试iztro（3秒超时）
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
      const astro: any = await Promise.race([loadIztro(), timeoutPromise]);
      if (astro && astro.astrolabeBySolarDate) {
        const a = astro.astrolabeBySolarDate(`${info.year}-${String(info.month).padStart(2,'0')}-${String(info.day).padStart(2,'0')}`, info.hour, genderText);
        palaces = (a.palaces || []).map((p: any) => ({
          name: p.name || '', position: p.earthBranch || '',
          majorStars: (p.majorStars || []).map((s: any) => s.name || s),
          minorStars: (p.minorStars || []).map((s: any) => s.name || s),
          score: p.score,
        }));
      }
    } catch { /* fallback */ }

    // iztro失败 → AI排盘
    if (palaces.length === 0) {
      setLoadingText('AI正在排紫微命盘...');
      try {
        const aiPanResponse = await callSiliconAPIWithRetry([
          { role: 'system', content: '你是黄师傅，精通紫微斗数排盘。请为以下生辰排出完整的紫微斗数十二宫命盘。' + NO_MARKDOWN_RULE },
          { role: 'user', content: `请为以下生辰排紫微斗数命盘：
公历 ${info.year}年${info.month}月${info.day}日 ${info.hour}时
性别：${genderText}
日主：${dayGan}

请输出以下格式的十二宫数据（纯文本，每行一个宫位）：
命宫：[主星1]、[主星2] |位置[地支]
父母：[主星] |位置[地支]
福德：[主星] |位置[地支]
田宅：[主星] |位置[地支]
事业：[主星] |位置[地支]
交友：[主星] |位置[地支]
迁移：[主星] |位置[地支]
疾厄：[主星] |位置[地支]
财帛：[主星] |位置[地支]
子女：[主星] |位置[地支]
夫妻：[主星] |位置[地支]
兄弟：[主星] |位置[地支]

每个宫位至少填一个主星，不能为空。` },
        ], { maxTokens: 1500, temperature: 0.3 });

        // 解析AI返回
        const nameMap: Record<string, string> = {
          '命宫': '命宫', '父母': '父母', '福德': '福德', '田宅': '田宅',
          '事业': '事业', '交友': '交友', '迁移': '迁移', '疾厄': '疾厄',
          '财帛': '财帛', '子女': '子女', '夫妻': '夫妻', '兄弟': '兄弟',
        };
        for (const line of aiPanResponse.split('\n')) {
          for (const [key, name] of Object.entries(nameMap)) {
            if (line.includes(key)) {
              const content = line.split(/[：:]/)[1] || '';
              const parts = content.split('|');
              const starsText = parts[0] || '';
              const posText = parts[1] || '';
              const starList = starsText.split(/[、,，]/).map(s => s.trim()).filter(s => s && s !== '无主星');
              const posMatch = posText.match(/[子丑寅卯辰巳午未申酉戌亥]/);
              palaces.push({ name, position: posMatch ? posMatch[0] : '', majorStars: starList.length > 0 ? starList : ['天机'], minorStars: [] });
              break;
            }
          }
        }
      } catch { /* use default */ }
    }

    // 兜底默认值
    if (palaces.length === 0) {
      const defaults: Record<string, string[]> = {
        '命宫': ['紫微', '天府'], '父母': ['太阳'], '福德': ['天同'], '田宅': ['武曲'],
        '事业': ['廉贞', '天相'], '交友': ['天机'], '迁移': ['贪狼'], '疾厄': ['巨门'],
        '财帛': ['太阴'], '子女': ['天梁'], '夫妻': ['七杀'], '兄弟': ['破军'],
      };
      palaces = Object.entries(defaults).map(([name, stars]) => ({ name, position: '', majorStars: stars, minorStars: [] }));
    }

    setPillar(`紫微命，${genderText}命`);
    setPattern('紫微斗数');
    setZiweiPalaces(palaces);

    setLoadingText('AI正在隐藏标准答案...');
    const panDesc = palaces.map(p => `${p.name}：${(p.majorStars || []).join('、')}`).join('\n');

    const answerPrompt = `你是黄师傅，紫微斗数宗师。请严格分析以下紫微命盘，输出JSON：

【生辰】${info.year}年${info.month}月${info.day}日 ${info.hour}时
【性别】${genderText}
【命盘】${panDesc}

输出JSON格式：
{
  "overallPattern": "此命紫微格局总评，200字左右，从命宫主星、三方四正来论断",
  "wealth": "财运分析，80字左右",
  "marriage": "婚姻分析，80字左右",
  "friendship": "交友分析，80字左右",
  "career": "事业分析，80字左右",
  "family": "家庭分析，80字左右",
  "parents": "父母分析，80字左右"
}
只输出JSON。`;

    const answerResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: '你是黄师傅，紫微斗数宗师。请严格分析输出JSON。只输出JSON。' + NO_MARKDOWN_RULE },
      { role: 'user', content: answerPrompt },
    ], { maxTokens: 2000, temperature: 0.3 });
    setAiAnswer(parseAIAnswerJSON(answerResponse) || { overallPattern: 'AI分析中...', wealth: '', marriage: '', friendship: '', career: '', family: '', parents: '' });
    setPhase('display');
  }

  // ===== 六爻/梅花：代码排卦画 + AI只分析 =====
  async function startGua(gameMode: GameMode) {
    const info = generateRandomGua();
    setGuaInfo(info);
    gameIdRef.current = `${gameMode}_${info.benGua}_${info.bianGua}_${info.yaoCi.join('_')}`;

    // 确保变卦和互卦由代码计算（不是随机）
    const yaoNum = info.yaoCi[0]?.match(/\d+/)?.[0] ? parseInt(info.yaoCi[0].match(/\d+/)![0]) : 1;
    const computedBianGua = getBianGua(info.benGua, yaoNum);
    info.bianGua = computedBianGua; // 覆盖随机值，确保一致性

    setLoadingText('AI正在隐藏标准答案...');

    // AI生成标准答案（基于同一个卦信息）
    const answerPrompt = gameMode === 'liuyao'
      ? `你是六爻宗师。请对以下卦象严格断卦，输出JSON。
【占卦人】${info.questioner}
【所占之事】${info.question}
【本卦】${info.benGua}（上${getGuaComponents(info.benGua).upper}下${getGuaComponents(info.benGua).lower}）
【变卦】${info.bianGua}
【动爻】第${yaoNum}爻动
【世应】${info.shiYing}

输出JSON：
{
  "analysis": "详细断卦分析过程，300字左右，包括用神旺衰、世应关系、动爻影响、结果推断。必须基于上面给出的卦象来分析。",
  "result": "最终断语，80字左右，明确给出吉凶判断"
}
只输出JSON。`
      : `你是梅花易数宗师。请对以下卦象严格断卦，输出JSON。
【占卦人】${info.questioner}
【所占之事】${info.question}
【本卦】${info.benGua}（上${getGuaComponents(info.benGua).upper}下${getGuaComponents(info.benGua).lower}）
【互卦】${getHuGua(info.benGua)}
【变卦】${info.bianGua}
【动爻】第${yaoNum}爻动

输出JSON：
{
  "analysis": "详细断卦分析，300字左右，包括体用生克、卦象类象、动变影响。必须基于上面给出的卦象来分析。",
  "result": "最终断语，80字左右"
}
只输出JSON。`;

    const answerResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: `你是${gameMode === 'liuyao' ? '六爻' : '梅花易数'}宗师。请严格断卦输出JSON。只输出JSON。` + NO_MARKDOWN_RULE },
      { role: 'user', content: answerPrompt },
    ], { maxTokens: 1500, temperature: 0.3 });
    setAiGuaAnswer(parseLiuYaoAnswerJSON(answerResponse) || { analysis: 'AI分析中...', result: '' });
    setPhase('display');
  }

  // ===== 提交评分 =====
  async function submitAnswers() {
    if (!mode) return;
    setPhase('scoring');
    try {
      if (mode === 'bazi' || mode === 'ziwei') await scoreBazi();
      else await scoreGua();
    } catch { setPhase('answer'); }
  }

  async function scoreBazi() {
    if (!aiAnswer) return;
    const scorePrompt = makeScorePrompt(mode as 'bazi' | 'ziwei', pillar, pattern, gender, userAnswers, aiAnswer);
    const scoreResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: '你是黄师傅，严格公正的命理考官。' + NO_MARKDOWN_RULE },
      { role: 'user', content: scorePrompt },
    ], { maxTokens: 2500, temperature: 0.3 });
    setScoreResult(parseScoreJSON(scoreResponse));
    setPhase('result');
  }

  async function scoreGua() {
    if (!aiGuaAnswer || !guaInfo) return;
    const scorePrompt = mode === 'liuyao'
      ? makeLiuYaoScorePrompt(guaInfo, userGuaAnalysis, userGuaResult, aiGuaAnswer)
      : `你是梅花易数宗师兼严师。请对用户断卦评分。
【卦象】
占卦人：${guaInfo.questioner}
所占之事：${guaInfo.question}
本卦：${guaInfo.benGua}（上${getGuaComponents(guaInfo.benGua).upper}下${getGuaComponents(guaInfo.benGua).lower}）
互卦：${getHuGua(guaInfo.benGua)}
变卦：${guaInfo.bianGua}
动爻：${guaInfo.yaoCi.join('、')}

【用户断卦】
分析：${userGuaAnalysis}
断语：${userGuaResult}

【标准断卦】
分析：${aiGuaAnswer.analysis}
断语：${aiGuaAnswer.result}

输出JSON：
{
  "analysisScore": 0-50,
  "analysisFeedback": "对体用分析、类象运用、生克判断的评价",
  "resultScore": 0-30,
  "resultFeedback": "对最终断语的评价",
  "logicScore": 0-20,
  "logicFeedback": "对推理逻辑的评价",
  "total": 总分,
  "grade": "评级",
  "summary": "总体评价",
  "studyAdvice": "具体学习建议"
}
严格客观，只输出JSON`;
    const scoreResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: `你是${mode === 'liuyao' ? '六爻' : '梅花易数'}宗师兼严师。` + NO_MARKDOWN_RULE },
      { role: 'user', content: scorePrompt },
    ], { maxTokens: 2000, temperature: 0.3 });
    setGuaScoreResult(parseGuaScoreJSON(scoreResponse));
    setPhase('result');
  }

  function restart() {
    setPhase('select');
    setMode(null);
    setGuaInfo(null);
    setBaziResult(null);
    setZiweiPalaces([]);
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
        @keyframes dn { from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)} }
        .aFU { animation: fU 0.6s ease forwards }
        .aDN { animation: dn 0.5s ease forwards }
        .shTxtP { background: linear-gradient(90deg,#4c1d95 0%,#a78bfa 40%,#fff 50%,#a78bfa 60%,#4c1d95 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: sh 4s linear infinite }
        @keyframes sh { 0%{background-position:-200%0}100%{background-position:200%0} }
        textarea { resize: vertical; min-height: 80px; }
      `}</style>

      <Link to="/games" className="inline-flex items-center gap-1 text-xs text-white/20 hover:text-white/50 transition-colors pt-4">
        <ArrowLeft className="w-3.5 h-3.5" />返回小游戏
      </Link>

      {/* 标题 */}
      <div className="relative text-center space-y-2 py-8 overflow-hidden rounded-3xl aFU"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.08), rgba(10,5,2,0.98))', border: '1px solid rgba(168,85,247,0.08)' }}>
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
                <button key={m.key} onClick={() => startGame(m.key)}
                  className="group relative text-left rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${m.color}06, rgba(0,0,0,0.3))`, borderColor: `${m.color}15`, animationDelay: `${i * 0.1}s` }}>
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
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: `${m.color}60` }}>
                      <Sparkles className="w-3 h-3" />开始考核<ChevronRight className="w-3 h-3" />
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
            <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-5 h-5 text-purple-400/50" /></div>
          </div>
          <p className="text-sm text-white/40">{loadingText}</p>
        </div>
      )}

      {/* ===== 排盘展示 ===== */}
      {phase === 'display' && currentMode && (
        <div className="aFU space-y-4">
          <div className="rounded-xl border p-4 flex items-start gap-3" style={{ background: 'rgba(168,85,247,0.03)', borderColor: 'rgba(168,85,247,0.1)' }}>
            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: currentMode.color }} />
            <div>
              <p className="text-xs font-medium" style={{ color: currentMode.color }}>考题已生成，AI考官已隐藏答案</p>
              <p className="text-[10px] text-white/30">请仔细分析以下排盘信息，点击开始作答</p>
            </div>
          </div>

          {/* 排盘显示 */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(5,3,2,0.99))', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <ScrollText className="w-4 h-4" style={{ color: currentMode.color, opacity: 0.5 }} />
              <span className="text-xs font-bold text-white/40">
                {mode === 'bazi' ? '八字排盘' : mode === 'ziwei' ? '紫微命盘' : mode === 'liuyao' ? '六爻排盘' : '梅花卦象'}
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full ml-auto" style={{ background: `${currentMode.color}10`, color: `${currentMode.color}60`, border: `1px solid ${currentMode.color}15` }}>AI已隐藏答案</span>
            </div>
            <div className="px-4 pb-4">
              <div className="rounded-lg p-4 border" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.03)' }}>
                {/* 八字：代码排四柱 */}
                {mode === 'bazi' && baziInfo && baziResult && <BaZiPan info={baziInfo} result={baziResult} />}
                {/* 紫微：代码排12宫 */}
                {mode === 'ziwei' && baziInfo && <ZiWeiPan info={baziInfo} palaces={ziweiPalaces} />}
                {/* 六爻：代码排卦画 */}
                {mode === 'liuyao' && guaInfo && <LiuYaoPan guaInfo={guaInfo} />}
                {/* 梅花：代码排三卦 */}
                {mode === 'meihua' && guaInfo && <MeiHuaPan guaInfo={guaInfo} />}
              </div>
            </div>
          </div>

          <button onClick={() => setPhase('answer')}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 aFU"
            style={{ background: `linear-gradient(135deg, ${currentMode.color}20, ${currentMode.color}05)`, boxShadow: `0 6px 30px ${currentMode.color}15`, border: `1px solid ${currentMode.color}20`, color: currentMode.color }}>
            <Sparkles className="w-5 h-5" />我已仔细分析，开始作答
          </button>
        </div>
      )}

      {/* ===== 用户作答（带排盘信息） ===== */}
      {phase === 'answer' && currentMode && (
        <div className="aFU space-y-4">
          {/* 排盘信息持续显示 */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(5,3,2,0.99))', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="px-4 pt-3 pb-1 flex items-center gap-2">
              <ScrollText className="w-4 h-4" style={{ color: currentMode.color, opacity: 0.5 }} />
              <span className="text-xs font-bold text-white/40">{mode === 'bazi' ? '八字排盘' : mode === 'ziwei' ? '紫微命盘' : mode === 'liuyao' ? '六爻排盘' : '梅花卦象'}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full ml-auto" style={{ background: `${currentMode.color}10`, color: `${currentMode.color}60`, border: `1px solid ${currentMode.color}15` }}>参考信息</span>
            </div>
            <div className="px-4 pb-3">
              <div className="rounded-lg p-3 border" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.03)' }}>
                {mode === 'bazi' && baziInfo && baziResult && <BaZiPan info={baziInfo} result={baziResult} />}
                {mode === 'ziwei' && baziInfo && <ZiWeiPan info={baziInfo} palaces={ziweiPalaces} />}
                {mode === 'liuyao' && guaInfo && <LiuYaoPan guaInfo={guaInfo} />}
                {mode === 'meihua' && guaInfo && <MeiHuaPan guaInfo={guaInfo} />}
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />
          <div className="text-center space-y-1">
            <p className="text-xs text-white/40">请根据上方排盘信息，输入你的分析判断</p>
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
                      <textarea value={userAnswers[dim.key] || ''} onChange={e => setUserAnswers(prev => ({ ...prev, [dim.key]: e.target.value }))}
                        placeholder={dim.placeholder}
                        className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-white/60 placeholder:text-white/10 focus:outline-none focus:border-purple-400/30 transition-all leading-relaxed"
                        style={{ fontFamily: "'Noto Serif SC',serif", minHeight: dim.key === 'overallPattern' ? 120 : 80 }} />
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
                  <textarea value={userGuaAnalysis} onChange={e => setUserGuaAnalysis(e.target.value)}
                    placeholder={`请详细写出你的${mode === 'liuyao' ? '六爻' : '梅花'}分析过程...`}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-white/60 placeholder:text-white/10 focus:outline-none focus:border-blue-400/30 transition-all leading-relaxed"
                    style={{ fontFamily: "'Noto Serif SC',serif", minHeight: 150 }} />
                </div>
              </div>
              <div className="rounded-xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentMode.color, opacity: 0.5 }} />
                  <span className="text-xs font-medium text-white/50">最终断语</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: `${currentMode.color}10`, color: `${currentMode.color}70` }}>30分</span>
                </div>
                <div className="px-4 pb-3">
                  <textarea value={userGuaResult} onChange={e => setUserGuaResult(e.target.value)}
                    placeholder="请给出明确的最终断语：所占之事吉凶如何？结果怎样？"
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-white/60 placeholder:text-white/10 focus:outline-none focus:border-blue-400/30 transition-all leading-relaxed"
                    style={{ fontFamily: "'Noto Serif SC',serif", minHeight: 80 }} />
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

          <button onClick={submitAnswers}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${currentMode.color}30, ${currentMode.color}10)`, boxShadow: `0 6px 30px ${currentMode.color}15`, border: `1px solid ${currentMode.color}25`, color: currentMode.color }}>
            <Send className="w-5 h-5" />提交答案，请求AI评分
          </button>
        </div>
      )}

      {/* ===== 评分中 ===== */}
      {phase === 'scoring' && (
        <div className="aFU flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full animate-spin" style={{ border: '2px solid rgba(168,85,247,0.1)', borderTopColor: '#a78bfa' }} />
            <div className="absolute inset-0 flex items-center justify-center"><Award className="w-5 h-5 text-purple-400/50" /></div>
          </div>
          <p className="text-sm text-white/40">AI考官正在严格评分...</p>
        </div>
      )}

      {/* ===== 结果展示 ===== */}
      {phase === 'result' && currentMode && (
        <div className="aFU space-y-5">
          {(scoreResult || guaScoreResult) && (
            <div className="relative rounded-3xl border overflow-hidden text-center py-8 space-y-4"
              style={{ background: `radial-gradient(ellipse at 50% 0%, ${currentMode.color}10, rgba(10,5,2,0.98))`, borderColor: `${currentMode.color}15` }}>
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full" style={{ background: `linear-gradient(135deg, ${currentMode.color}15, ${currentMode.color}05)`, border: `1px solid ${currentMode.color}30`, boxShadow: `0 0 40px ${currentMode.color}10` }}>
                  <span className="text-4xl font-black" style={{ color: currentMode.color, fontFamily: "'Noto Serif SC',serif" }}>
                    {scoreResult ? scoreResult.total : guaScoreResult ? guaScoreResult.total : 0}
                  </span>
                </div>
                <div>
                  <span className="text-lg font-bold" style={{ color: currentMode.color, fontFamily: "'Noto Serif SC',serif" }}>
                    {scoreResult?.grade || guaScoreResult?.grade || '未评级'}
                  </span>
                </div>
                <p className="text-xs text-white/30 px-6">{scoreResult?.summary || guaScoreResult?.summary || ''}</p>
              </div>
            </div>
          )}

          {scoreResult && (mode === 'bazi' || mode === 'ziwei') && (
            <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2"><Award className="w-4 h-4 text-white/30" /><span className="text-xs font-bold text-white/40">分项得分</span></div>
              <ScoreBar label="一生格局走向" score={scoreResult.overallPattern.score} maxScore={40} color={currentMode.color} feedback={scoreResult.overallPattern.feedback} />
              <ScoreBar label="财运" score={scoreResult.wealth.score} maxScore={10} color={currentMode.color} feedback={scoreResult.wealth.feedback} />
              <ScoreBar label="婚姻" score={scoreResult.marriage.score} maxScore={10} color={currentMode.color} feedback={scoreResult.marriage.feedback} />
              <ScoreBar label="交友" score={scoreResult.friendship.score} maxScore={10} color={currentMode.color} feedback={scoreResult.friendship.feedback} />
              <ScoreBar label="事业" score={scoreResult.career.score} maxScore={10} color={currentMode.color} feedback={scoreResult.career.feedback} />
              <ScoreBar label="家庭" score={scoreResult.family.score} maxScore={10} color={currentMode.color} feedback={scoreResult.family.feedback} />
              <ScoreBar label="父母" score={scoreResult.parents.score} maxScore={10} color={currentMode.color} feedback={scoreResult.parents.feedback} />
            </div>
          )}

          {guaScoreResult && (mode === 'liuyao' || mode === 'meihua') && (
            <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2"><Award className="w-4 h-4 text-white/30" /><span className="text-xs font-bold text-white/40">分项得分</span></div>
              <ScoreBar label="断卦分析" score={guaScoreResult.analysisScore || 0} maxScore={50} color={currentMode.color} feedback={guaScoreResult.analysisFeedback || ''} />
              <ScoreBar label="最终断语" score={guaScoreResult.resultScore || 0} maxScore={30} color={currentMode.color} feedback={guaScoreResult.resultFeedback || ''} />
              <ScoreBar label="推理逻辑" score={guaScoreResult.logicScore || 0} maxScore={20} color={currentMode.color} feedback={guaScoreResult.logicFeedback || ''} />
            </div>
          )}

          {(scoreResult?.studyAdvice || guaScoreResult?.studyAdvice) && (
            <div className="rounded-2xl border p-5 space-y-3 aDN" style={{ background: `linear-gradient(180deg, ${currentMode.color}05, rgba(5,3,2,0.99))`, borderColor: `${currentMode.color}12` }}>
              <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: currentMode.color, opacity: 0.5 }} /><span className="text-xs font-bold" style={{ color: `${currentMode.color}90` }}>学习指导</span></div>
              <div className="text-xs text-white/40 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Noto Serif SC',serif" }}><HighlightText text={scoreResult?.studyAdvice || guaScoreResult?.studyAdvice || ''} /></div>
            </div>
          )}

          {aiGuaAnswer && (mode === 'liuyao' || mode === 'meihua') && (
            <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'rgba(0,0,0,0.15)', borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400/40" /><span className="text-xs font-bold text-white/30">AI标准断卦（供参考学习）</span></div>
              <div className="space-y-1"><span className="text-[10px] font-medium" style={{ color: currentMode.color, opacity: 0.5 }}>分析过程</span><p className="text-[11px] text-white/25 leading-relaxed" style={{ fontFamily: "'Noto Serif SC',serif" }}>{aiGuaAnswer.analysis}</p></div>
              <div className="space-y-1"><span className="text-[10px] font-medium" style={{ color: currentMode.color, opacity: 0.5 }}>最终断语</span><p className="text-[11px] text-white/25 leading-relaxed" style={{ fontFamily: "'Noto Serif SC',serif" }}>{aiGuaAnswer.result}</p></div>
            </div>
          )}

          {aiAnswer && (mode === 'bazi' || mode === 'ziwei') && (
            <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'rgba(0,0,0,0.15)', borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400/40" /><span className="text-xs font-bold text-white/30">AI标准答案（供参考学习）</span></div>
              {DIM_CONFIG.map(dim => (
                <div key={dim.key} className="space-y-1">
                  <span className="text-[10px] font-medium" style={{ color: currentMode.color, opacity: 0.5 }}>{dim.label}</span>
                  <p className="text-[11px] text-white/25 leading-relaxed" style={{ fontFamily: "'Noto Serif SC',serif" }}>{(aiAnswer as any)[dim.key] || ''}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={restart} className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
              <RotateCcw className="w-4 h-4" />换一题
            </button>
            {mode && (
              <button onClick={() => startGame(mode)} className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2" style={{ background: `${currentMode.color}10`, border: `1px solid ${currentMode.color}20`, color: currentMode.color }}>
                <Sparkles className="w-4 h-4" />再来一局
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
