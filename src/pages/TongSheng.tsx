import { useState, useEffect, useCallback, useMemo } from 'react';
import { SHI_CHEN, LUCK_COLORS } from '@/data/tongsheng';
import { streamSiliconAPI } from '@/utils/apiClient';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';
import {
  ChevronLeft, ChevronRight, Clock, Calendar, Star,
  Sparkles, X, Loader2, Send, Compass, CheckCircle, AlertTriangle, Sun,
} from 'lucide-react';
import IntroModal from '@/components/IntroModal';
import { getToolIntro } from '@/data/toolIntros';

// ==================== 类型 ====================
interface DayData {
  solarDate: string;
  lunarDate: string;
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  zodiac: string;
  xiu: string;
  xiuLuck: string;
  naYin: string;
  pengZuGan: string;
  pengZuZhi: string;
  xiShen: string;
  fuShen: string;
  caiShen: string;
  yangGui: string;
  taiShen: string;
  chong: string;
  sha: string;
  jianChu: string;
  huangDao: string;
  yi: string[];
  ji: string[];
  jiShen: string[];
  xiongShen: string[];
  luckLevel: number;
  weekDay: string;
}

// ==================== 样式 ====================
const styleCSS = `
@keyframes flowGrad { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes pulseGlow { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes tick { 0%{opacity:1} 50%{opacity:0.3} 100%{opacity:1} }
.flow { background-size:400% 400%; animation:flowGrad 18s ease infinite }
.pulse-glow { animation:pulseGlow 4s ease-in-out infinite }
.float { animation:float 5s ease-in-out infinite }
.tick { animation:tick 1s ease-in-out infinite }
`;

// 十二地支
const ZHI_LIST = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
// 建除十二神
const JIAN_CHU = ['建','除','满','平','定','执','破','危','成','收','开','闭'];

/** 计算建除十二神：以月支为基准，日支偏移 */
function calcJianChu(monthZhi: string, dayZhi: string): string {
  const m = ZHI_LIST.indexOf(monthZhi);
  const d = ZHI_LIST.indexOf(dayZhi);
  if (m < 0 || d < 0) return '建';
  return JIAN_CHU[(d - m + 12) % 12];
}

// ==================== 真数据：用 window.Solar / window.Lunar ====================
function getRealDayData(date: Date): DayData {
  const w = window as any;
  const Solar = w.Solar;
  
  if (!Solar) {
    return {
      solarDate: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,
      lunarDate: '加载中...', yearGanZhi: '', monthGanZhi: '', dayGanZhi: '',
      zodiac: '', xiu: '', xiuLuck: '', naYin: '', pengZuGan: '', pengZuZhi: '',
      xiShen: '', fuShen: '', caiShen: '', yangGui: '', taiShen: '',
      chong: '', sha: '', jianChu: '', huangDao: '', yi: [], ji: [],
      jiShen: [], xiongShen: [], luckLevel: 3,
      weekDay: ['日','一','二','三','四','五','六'][date.getDay()],
    };
  }

  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  const yi = lunar.getDayYi() || [];
  const ji = lunar.getDayJi() || [];
  
  // 计算吉凶等级
  let luckLevel = 3;
  if (yi.length > 5 && ji.length < 3) luckLevel = 5;
  else if (yi.length > 3 && ji.length < 3) luckLevel = 4;
  else if (ji.length > 5) luckLevel = 2;
  else if (ji.length > 3 && yi.length < 2) luckLevel = 1;

  // 建除十二神
  const monthZhi = lunar.getMonthZhi();
  const dayZhi = lunar.getDayZhi();
  const jianChu = calcJianChu(monthZhi, dayZhi);

  return {
    solarDate: `${solar.getYear()}-${String(solar.getMonth()).padStart(2,'0')}-${String(solar.getDay()).padStart(2,'0')}`,
    lunarDate: lunar.toString(),
    yearGanZhi: lunar.getYearInGanZhi(),
    monthGanZhi: lunar.getMonthInGanZhi(),
    dayGanZhi: lunar.getDayInGanZhi(),
    zodiac: lunar.getYearShengXiao(),
    xiu: lunar.getXiu(),
    xiuLuck: lunar.getXiuLuck(),
    naYin: lunar.getDayNaYin(),
    pengZuGan: lunar.getPengZuGan(),
    pengZuZhi: lunar.getPengZuZhi(),
    xiShen: lunar.getDayPositionXi(),
    fuShen: lunar.getDayPositionFu(),
    caiShen: lunar.getDayPositionCai(),
    yangGui: lunar.getDayPositionYangGui(),
    taiShen: lunar.getDayPositionTai(),
    chong: lunar.getDayChongDesc(),
    sha: lunar.getDaySha(),
    jianChu,
    huangDao: lunar.getDayTianShenType(),
    yi,
    ji,
    jiShen: lunar.getDayJiShen() || [],
    xiongShen: [], // lunar-javascript 无此 API
    luckLevel,
    weekDay: ['日','一','二','三','四','五','六'][date.getDay()],
  };
}

// ==================== 主组件 ====================
export default function TongSheng() {
  const [now, setNow] = useState(new Date());
  const [data, setData] = useState<DayData | null>(null);
  const [libReady, setLibReady] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<DayData | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{role:string;content:string;id:string}[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // 实时时钟
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 检查 lunar-javascript 是否加载完成
  useEffect(() => {
    const check = () => {
      const w = window as any;
      if (w.Solar && w.Lunar) {
        setLibReady(true);
        setData(getRealDayData(new Date()));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  }, []);

  // 月历数据 —— 全部真数据
  const monthDays = useMemo(() => {
    if (!libReady) return [];
    const days: DayData[] = [];
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      days.push(getRealDayData(new Date(year, month, d)));
    }
    return days;
  }, [viewMonth, libReady]);

  const monthOffset = useMemo(() => {
    return new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();
  }, [viewMonth]);

  const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
  const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  // AI解析
  const handleAI = () => {
    if (!data) return;
    const q = aiInput.trim() || '今日运势如何？';
    setAiLoading(true);
    setAiMessages(prev => [...prev, { role: 'user', content: q, id: 'u_' + Date.now() }]);
    setAiInput('');
    const id = 'a_' + Date.now();
    setAiMessages(prev => [...prev, { role: 'assistant', content: '', id }]);

    const prompt = `【择日通胜 · ${data.solarDate}】

公历：${data.solarDate} 星期${data.weekDay}
农历：${data.lunarDate}
干支：${data.yearGanZhi}年 ${data.monthGanZhi}月 ${data.dayGanZhi}日
生肖：${data.zodiac}年
纳音：${data.naYin}
星宿：${data.xiu}（${data.xiuLuck}）

彭祖百忌：
${data.pengZuGan}
${data.pengZuZhi}

宜：${data.yi.join('、')}
忌：${data.ji.join('、')}

吉神：${data.jiShen.join('、')}
凶神：${data.xiongShen.join('、')}

喜神${data.xiShen} · 福神${data.fuShen} · 财神${data.caiShen}
阳贵${data.yangGui} · 胎神${data.taiShen}

冲${data.chong} · 煞${data.sha}
建除：${data.jianChu}日 · ${data.huangDao}

【所问之事】${q}

请黄师傅以通胜角度分析。`;

    let full = '';
    streamSiliconAPI([
      { role: 'system', content: `你是黄师傅，精通择日通胜、老黄历学的命理大师。

【身份定位】
择日通胜乃华夏数千年来择吉避凶的智慧结晶。《协纪辨方书》云：「择日之法，以事为经，以神为纬。」

【核心规则】
1. 以建除十二神定日之吉凶
2. 以黄道黑道分日之善恶
3. 以二十八宿值日辨星辰吉凶
4. 以宜忌指导日常行事
5. 以吉神方位趋吉避凶

【分析框架】
1. 先述今日干支与建除
2. 分析黄道黑道与吉凶等级
3. 解读宜忌事项
4. 指引吉神方位
5. 综合给出今日行事建议

半文半白，铁口直断。严禁使用任何markdown格式符号（#和*），所有输出必须是纯文本。` + NO_MARKDOWN_RULE },
      { role: 'user', content: prompt },
    ], {
      onChunk: (d: string) => { full += d; setAiMessages(prev => prev.map(m => m.id === id ? { ...m, content: full } : m)); },
      onDone: () => setAiLoading(false),
      onError: (err: string) => { setAiLoading(false); setAiMessages(prev => prev.map(m => m.id === id ? { ...m, content: `【黄师傅】${err}。` } : m)); },
    }, { maxTokens: 2000 });
  };

  // 加载中
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#06060f' }}>
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#fbbf24' }} />
          <p style={{ color: 'rgba(251,191,36,0.5)' }}>加载黄历数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ background: '#06060f' }}>
      <style>{styleCSS}</style>
      {/* 背景 */}
      <div className="fixed inset-0 flow pointer-events-none" style={{ background: 'linear-gradient(-45deg, #0a0418, #180d28, #0f0a02, #120820, #0a0418)', backgroundSize: '400% 400%' }} />
      <div className="fixed top-[-15%] right-[-5%] w-[55vw] h-[55vw] rounded-full pointer-events-none pulse-glow" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)' }} />
      <div className="fixed bottom-[-15%] left-[-5%] w-[50vw] h-[50vw] rounded-full pointer-events-none pulse-glow" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', animationDelay: '2s' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        {/* 标题 + 实时时钟 */}
        <div className="pt-8 pb-6 text-center">
          <h1 className="text-4xl font-bold tracking-[0.3em] mb-2 float" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500, #fbbf24, #FFD700)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 16px rgba(255,165,0,0.4))' }}>择日通胜</h1>
          <div className="flex justify-center">
            <IntroModal {...getToolIntro('tongsheng')!} />
          </div>
          <p className="text-sm tracking-[0.2em] mb-4" style={{ color: 'rgba(251,191,36,0.45)' }}>仰观天文 · 俯察地理 · 趋吉避凶</p>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(245,158,11,0.2)', backdropFilter: 'blur(10px)' }}>
            <Clock className="w-5 h-5" style={{ color: '#fbbf24' }} />
            <span className="text-3xl font-bold font-mono tracking-wider" style={{ color: '#FFD700' }}>
              {timeStr.split(':').map((part, i) => (<span key={i}>{part}{i < 2 && <span className="tick mx-0.5">:</span>}</span>))}
            </span>
            <span className="text-sm ml-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{dateStr}</span>
          </div>
        </div>

        {/* 三列基本信息 — 真数据 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center justify-center gap-2 mb-2"><Calendar className="w-4 h-4" style={{ color: '#fbbf24' }} /><span className="text-xs" style={{ color: 'rgba(251,191,36,0.5)' }}>农历</span></div>
            <p className="text-2xl font-bold" style={{ color: '#FFD700' }}>{data.lunarDate.replace(/.*?年/, '')}</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{data.yearGanZhi}年 · {data.zodiac}年</p>
          </div>
          <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center justify-center gap-2 mb-2"><Star className="w-4 h-4" style={{ color: '#a78bfa' }} /><span className="text-xs" style={{ color: 'rgba(167,139,250,0.5)' }}>日柱</span></div>
            <p className="text-3xl font-bold" style={{ color: '#c4b5fd' }}>{data.dayGanZhi}</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{data.monthGanZhi}月 · {data.naYin}</p>
          </div>
          <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center justify-center gap-2 mb-2"><Compass className="w-4 h-4" style={{ color: '#38bdf8' }} /><span className="text-xs" style={{ color: 'rgba(56,189,248,0.5)' }}>星宿</span></div>
            <p className="text-2xl font-bold" style={{ color: '#7dd3fc' }}>{data.xiu}</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{data.xiuLuck} · {data.huangDao}</p>
          </div>
        </div>

        {/* 宜忌 — 真数据 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.2)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5" style={{ color: '#4ade80' }} /><span className="text-lg font-bold" style={{ color: '#4ade80' }}>今日宜</span></div>
            <div className="flex flex-wrap gap-2">{data.yi.length > 0 ? data.yi.map((item, i) => (<span key={i} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(74,222,128,0.12)', color: '#86efac', border: '1px solid rgba(74,222,128,0.2)' }}>{item}</span>)) : (<span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>诸事不宜</span>)}</div>
          </div>
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.2)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5" style={{ color: '#f87171' }} /><span className="text-lg font-bold" style={{ color: '#f87171' }}>今日忌</span></div>
            <div className="flex flex-wrap gap-2">{data.ji.length > 0 ? data.ji.map((item, i) => (<span key={i} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(248,113,113,0.12)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.2)' }}>{item}</span>)) : (<span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>诸事不忌</span>)}</div>
          </div>
        </div>

        {/* 吉神方位 — 真数据 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: '喜神', value: data.xiShen, icon: Sparkles, color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
            { label: '福神', value: data.fuShen, icon: Sun, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
            { label: '财神', value: data.caiShen, icon: Star, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { label: '阳贵', value: data.yangGui, icon: Compass, color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
            { label: '胎神', value: data.taiShen, icon: Calendar, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-xl text-center" style={{ background: item.bg, border: `1px solid ${item.color}25`, backdropFilter: 'blur(10px)' }}>
              <item.icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: item.color }} />
              <p className="text-xs mb-0.5" style={{ color: item.color + '90' }}>{item.label}</p>
              <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* 建除 + 黄道 + 冲煞 — 真数据 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>建除十二神</p>
            <p className="text-2xl font-bold" style={{ color: '#fbbf24' }}>{data.jianChu}日</p>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>黄道黑道</p>
            <p className="text-2xl font-bold" style={{ color: data.huangDao === '黄道' ? '#4ade80' : '#f87171' }}>{data.huangDao}</p>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>冲煞</p>
            <p className="text-lg font-bold" style={{ color: '#f87171' }}>{data.chong}</p>
            <p className="text-xs" style={{ color: 'rgba(248,113,113,0.6)' }}>煞{data.sha}</p>
          </div>
        </div>

        {/* 彭祖百忌 — 真数据 */}
        <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>彭祖百忌：</p>
          <p className="text-sm" style={{ color: '#fbbf24' }}>{data.pengZuGan}</p>
          <p className="text-sm" style={{ color: '#fbbf24' }}>{data.pengZuZhi}</p>
        </div>

        {/* 时辰吉凶 */}
        <div className="p-5 rounded-2xl mb-6" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
          <h3 className="text-base font-bold mb-4 tracking-wider" style={{ color: 'rgba(251,191,36,0.7)' }}><Clock className="w-5 h-5 inline mr-2" />时辰吉凶</h3>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {SHI_CHEN.map((sc, i) => {
              const isGood = [0,2,4,6,8,10].includes(i);
              return (
                <div key={sc.name} className="p-2.5 rounded-lg text-center" style={{ background: isGood ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)', border: `1px solid ${isGood ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}` }}>
                  <p className="text-sm font-bold" style={{ color: isGood ? '#86efac' : '#fca5a5' }}>{sc.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{sc.time}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{sc.alias}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 月历 — 全部真数据 */}
        <div className="p-5 rounded-2xl mb-6" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth()-1, 1))} className="p-2 rounded-lg hover:bg-white/10 transition-all"><ChevronLeft className="w-5 h-5" style={{ color: '#fbbf24' }} /></button>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: '#FFD700' }}>{viewMonth.getFullYear()}年{viewMonth.getMonth()+1}月</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>点击日期查看详情</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setViewMonth(new Date())} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>今</button>
              <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth()+1, 1))} className="p-2 rounded-lg hover:bg-white/10 transition-all"><ChevronRight className="w-5 h-5" style={{ color: '#fbbf24' }} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日','一','二','三','四','五','六'].map(d => (<div key={d} className="text-center py-2 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>{d}</div>))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length: monthOffset}, (_, i) => (<div key={`e${i}`} className="aspect-square" />))}
            {monthDays.map((day, i) => {
              const isToday = i+1 === now.getDate() && viewMonth.getMonth() === now.getMonth() && viewMonth.getFullYear() === now.getFullYear();
              const luck = LUCK_COLORS[day.luckLevel];
              return (
                <button key={i} onClick={() => { setDetailData(day); setShowDetail(true); }} className="aspect-square rounded-xl p-1 flex flex-col items-center justify-center transition-all hover:scale-105" style={{ background: isToday ? 'rgba(245,158,11,0.2)' : luck.bg, border: isToday ? '2px solid rgba(245,158,11,0.5)' : `1px solid ${luck.glow}`, boxShadow: isToday ? '0 0 15px rgba(245,158,11,0.3)' : 'none' }}>
                  <span className="text-sm font-bold" style={{ color: isToday ? '#FFD700' : luck.text }}>{i+1}</span>
                  <span className="text-xs scale-75" style={{ color: luck.text + '80' }}>{luck.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI按钮 */}
        <button onClick={() => setAiOpen(true)} className="w-full py-3.5 rounded-xl font-bold text-sm tracking-[0.5em] mb-8 transition-all" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(124,58,237,0.15))', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', boxShadow: '0 0 25px rgba(139,92,246,0.15)' }}>
          <Sparkles className="w-5 h-5 inline mr-2" />AI 运势解析
        </button>
      </div>

      {/* 详情弹窗 — 真数据 */}
      {showDetail && detailData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowDetail(false); }}>
          <div className="w-full max-w-lg rounded-2xl p-6 max-h-[85vh] overflow-auto" style={{ background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#FFD700' }}>{detailData.solarDate}</h3>
              <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>农历：{detailData.lunarDate}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>干支：{detailData.yearGanZhi}年 {detailData.monthGanZhi}月 {detailData.dayGanZhi}日</p>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>纳音：{detailData.naYin}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>星宿：{detailData.xiu}（{detailData.xiuLuck}）</p>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>建除：{detailData.jianChu}日 · {detailData.huangDao}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>冲煞：{detailData.chong} · 煞{detailData.sha}</p>
              <div className="pt-2"><p className="font-bold mb-1" style={{ color: '#4ade80' }}>宜</p><div className="flex flex-wrap gap-1">{detailData.yi.map((item,i) => (<span key={i} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(74,222,128,0.15)', color: '#86efac' }}>{item}</span>))}</div></div>
              <div className="pt-2"><p className="font-bold mb-1" style={{ color: '#f87171' }}>忌</p><div className="flex flex-wrap gap-1">{detailData.ji.map((item,i) => (<span key={i} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(248,113,113,0.15)', color: '#fca5a5' }}>{item}</span>))}</div></div>
            </div>
          </div>
        </div>
      )}

      {/* AI面板 */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col" onClick={e => { if (e.target === e.currentTarget) setAiOpen(false); }}>
          <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full" style={{ background: 'rgba(10,10,18,0.98)' }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
              <div className="flex items-center gap-2"><Sparkles className="w-5 h-5" style={{ color: '#a78bfa' }} /><span className="font-bold" style={{ color: '#c4b5fd' }}>黄师傅AI运势解析</span></div>
              <button onClick={() => setAiOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {aiMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed mr-8" style={{ background: msg.role === 'user' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)', color: msg.role === 'user' ? '#c4b5fd' : 'rgba(255,255,255,0.8)', border: `1px solid ${msg.role === 'user' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)'}` }}>{msg.content}</div>
                </div>
              ))}
              {aiLoading && <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}><Loader2 className="w-3 h-3 animate-spin" /> 天机推演中...</div>}
            </div>
            <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex gap-2">
                <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAI()} placeholder="请问今日运势..." className="flex-1 px-4 py-3 rounded-xl text-sm outline-none" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <button onClick={handleAI} disabled={aiLoading} className="px-4 py-3 rounded-xl transition-all disabled:opacity-30" style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}><Send className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
