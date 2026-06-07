import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, MessageSquare, User, ChevronRight, LogIn, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// 工具颜色配置 - 每个工具有独特的鲜艳颜色
const T = {
  amber: { t: '#fcd34d', b: 'rgba(245,158,11,0.15)', bh: 'rgba(245,158,11,0.25)', bd: 'rgba(245,158,11,0.2)', bdh: 'rgba(245,158,11,0.4)', s: 'rgba(245,158,11,0.08)' },
  purple: { t: '#c4b5fd', b: 'rgba(168,85,247,0.15)', bh: 'rgba(168,85,247,0.25)', bd: 'rgba(168,85,247,0.2)', bdh: 'rgba(168,85,247,0.4)', s: 'rgba(168,85,247,0.08)' },
  orange: { t: '#fdba74', b: 'rgba(249,115,22,0.15)', bh: 'rgba(249,115,22,0.25)', bd: 'rgba(249,115,22,0.2)', bdh: 'rgba(249,115,22,0.4)', s: 'rgba(249,115,22,0.08)' },
  fuchsia: { t: '#f0abfc', b: 'rgba(232,121,249,0.15)', bh: 'rgba(232,121,249,0.25)', bd: 'rgba(232,121,249,0.2)', bdh: 'rgba(232,121,249,0.4)', s: 'rgba(232,121,249,0.08)' },
  sky: { t: '#7dd3fc', b: 'rgba(56,189,248,0.15)', bh: 'rgba(56,189,248,0.25)', bd: 'rgba(56,189,248,0.2)', bdh: 'rgba(56,189,248,0.4)', s: 'rgba(56,189,248,0.08)' },
  indigo: { t: '#a5b4fc', b: 'rgba(129,140,248,0.15)', bh: 'rgba(129,140,248,0.25)', bd: 'rgba(129,140,248,0.2)', bdh: 'rgba(129,140,248,0.4)', s: 'rgba(129,140,248,0.08)' },
  emerald: { t: '#6ee7b7', b: 'rgba(52,211,153,0.15)', bh: 'rgba(52,211,153,0.25)', bd: 'rgba(52,211,153,0.2)', bdh: 'rgba(52,211,153,0.4)', s: 'rgba(52,211,153,0.08)' },
  pink: { t: '#f9a8d4', b: 'rgba(244,114,182,0.15)', bh: 'rgba(244,114,182,0.25)', bd: 'rgba(244,114,182,0.2)', bdh: 'rgba(244,114,182,0.4)', s: 'rgba(244,114,182,0.08)' },
  cyan: { t: '#67e8f9', b: 'rgba(34,211,238,0.15)', bh: 'rgba(34,211,238,0.25)', bd: 'rgba(34,211,238,0.2)', bdh: 'rgba(34,211,238,0.4)', s: 'rgba(34,211,238,0.08)' },
  gold: { t: '#fbbf24', b: 'rgba(251,191,36,0.15)', bh: 'rgba(251,191,36,0.25)', bd: 'rgba(251,191,36,0.2)', bdh: 'rgba(251,191,36,0.4)', s: 'rgba(251,191,36,0.08)' },
};

const tools = [
  { name: '大六壬', icon: '\u2696\ufe0f', path: '/tools/daliuren', desc: '六壬神课，人事之王', c: T.indigo },
  { name: '太乙神数', icon: '\ud83d\udc51', path: '/tools/taiyi', desc: '三式之首，占国运天文', c: T.gold },
  { name: '奇门遁甲', icon: '\ud83c\udf00', path: '/tools/qimen', desc: '八门九星，遁甲玄机', c: T.orange },
  { name: '八字排盘', icon: '\ud83c\udfaf', path: '/tools/bazi', desc: '四柱八字，解读命运密码', c: T.amber },
  { name: '紫微斗数', icon: '\u2728', path: '/tools/ziwei', desc: '十二宫位，星曜飞化', c: T.purple },
  { name: '风水户型', icon: '\ud83c\udfe0', path: '/tools/fengshui', desc: '拖拽建模，理气风水', c: T.emerald },
  { name: '玄空飞星', icon: '\ud83e\udded', path: '/tools/xuankong', desc: '三元九运，挨星下卦', c: T.cyan },
  { name: '塔罗牌占卜', icon: '\ud83c\udf19', path: '/tools/tarot', desc: '78张牌，映照内心', c: T.fuchsia },
  { name: '西方星盘', icon: '\u2b50', path: '/tools/astro', desc: '十大行星，本命星图', c: T.sky },
  { name: '面相分析', icon: '\ud83d\udc64', path: '/tools/mianxiang', desc: '苏民峰相法，观相识人', c: T.pink },
];

const featureCards = [
  { icon: BookOpen, title: '系统学习', desc: '从零基础到进阶的完整命理学习体系', link: '/study', c: T.emerald },
  { icon: MessageSquare, title: '命理社区', desc: '与志同道合的朋友一起探讨命理知识', link: '/community', c: T.fuchsia },
  { icon: User, title: '个人中心', desc: '保存排盘记录，管理你的命理档案', link: '/me', c: T.pink },
];

const specialtyTags = [
  { text: '六爻解卦', c: T.amber },
  { text: '紫微斗数', c: T.purple },
  { text: '江氏小六壬', c: T.cyan },
  { text: '面相学', c: T.emerald },
];

export default function Home() {
  const { isLoggedIn } = useAuth();
  const [showBanner, setShowBanner] = useState(!isLoggedIn);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className={`transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Login Banner */}
      {showBanner && !isLoggedIn && (
        <div className="bg-blue-500/10 backdrop-blur-md border-b border-blue-400/20 px-4 py-3 animate-fade-in">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm">
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-blue-200/70">登录即可使用十大排盘工具，云端保存记录</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to="/login" className="px-4 py-1.5 rounded-full bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/20">登录</Link>
              <button onClick={() => setShowBanner(false)} className="p-1 text-white/40 hover:text-white/60"><X className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - 彩色大字体 */}
      <section className="px-4 sm:px-6 pt-20 pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col items-center text-center space-y-10">
            {/* Avatar */}
            <div className="relative animate-fade-in">
              <div className="absolute inset-0 rounded-full bg-blue-400/30 blur-2xl animate-pulse" />
              <div className="relative w-32 h-32 rounded-full overflow-hidden ring-2 ring-white/40 ring-offset-4 ring-offset-transparent shadow-2xl">
                <img src="./cat-avatar.jpg" alt="黄师傅" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Title - 彩色楷体大字 */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight" style={{ fontFamily: "'Noto Serif SC', 'KaiTi', serif", textShadow: '0 0 40px rgba(255,255,255,0.2)' }}>黄师傅</h1>
              <p className="text-lg sm:text-xl text-amber-300/80 tracking-widest" style={{ fontFamily: "'Noto Serif SC', serif" }}>野生命理科普博主</p>
            </div>

            {/* Description - 白色文字 */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <p className="text-xl sm:text-2xl md:text-3xl text-white/90 leading-loose tracking-wider" style={{ fontFamily: "'Noto Serif SC', 'KaiTi', serif", textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                精通六爻解卦、紫微斗数、江氏小六壬、面相学
              </p>
              <p className="text-sm text-white/40 mt-4 tracking-wider">致力于传统命理文化的科普与传承</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/tools" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-500 text-white text-base font-medium hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5">
                <Sparkles className="w-5 h-5" />开始排盘
              </Link>
              <Link to="/study" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/15 backdrop-blur text-white/90 text-base font-medium border border-white/20 hover:bg-white/25 transition-all hover:-translate-y-0.5">
                <BookOpen className="w-5 h-5" />学习资料
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid - 五颜六色 */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl text-white font-bold" style={{ fontFamily: "'Noto Serif SC', serif", textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>十大排盘工具</h2>
              <p className="text-base text-white/30 mt-2">融合东西方命理精华</p>
            </div>
            <Link to="/tools" className="text-sm text-blue-300 hover:text-blue-200 flex items-center gap-1 transition-colors backdrop-blur-sm bg-white/10 px-3 py-1.5 rounded-full">全部工具 <ChevronRight className="w-4 h-4" /></Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {tools.map((tool, i) => (
              <Link key={tool.name} to={tool.path}
                className="group bg-white/10 backdrop-blur-md border transition-all duration-500 hover:-translate-y-1 p-5 flex flex-col items-center text-center gap-3 animate-fade-in-scale"
                style={{ animationDelay: `${0.06 * i}s`, borderRadius: '1.25rem', borderColor: tool.c.bd, boxShadow: `0 4px 20px ${tool.c.s}, inset 0 1px 0 rgba(255,255,255,0.1)` }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = tool.c.bh; e.currentTarget.style.borderColor = tool.c.bdh; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = tool.c.bd; }}>
                <div className="w-14 h-14 rounded-2xl backdrop-blur flex items-center justify-center text-3xl shadow-inner transition-all group-hover:scale-110" style={{ backgroundColor: tool.c.b, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)', border: `1px solid ${tool.c.bd}` }}>
                  {tool.icon}
                </div>
                <div>
                  <p className="text-base font-medium transition-colors" style={{ color: tool.c.t }}>{tool.name}</p>
                  <p className="text-sm text-white/30 mt-1 leading-tight group-hover:text-white/50 transition-colors">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards - 彩色 */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {featureCards.map((card, i) => (
            <Link key={card.title} to={card.link}
              className="group bg-white/10 backdrop-blur-md border transition-all duration-500 hover:-translate-y-1 p-7 space-y-5 animate-fade-in"
              style={{ animationDelay: `${0.12 * i}s`, borderRadius: '1.25rem', borderColor: card.c.bd, boxShadow: `0 4px 20px ${card.c.s}, inset 0 1px 0 rgba(255,255,255,0.1)` }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = card.c.bh; e.currentTarget.style.borderColor = card.c.bdh; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = card.c.bd; }}>
              <div className="w-12 h-12 rounded-xl backdrop-blur flex items-center justify-center ring-1 transition-all group-hover:scale-110" style={{ backgroundColor: card.c.b, borderColor: card.c.bd }}>
                <card.icon className="w-6 h-6" style={{ color: card.c.t }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: card.c.t }}>{card.title}</h3>
                <p className="text-base text-white/30 mt-2 leading-relaxed group-hover:text-white/45 transition-colors">{card.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-sm transition-colors group-hover:opacity-100" style={{ color: card.c.t, opacity: 0.6 }}>了解更多 <ChevronRight className="w-4 h-4" /></div>
            </Link>
          ))}
        </div>
      </section>

      {/* Specialty Tags - 彩色 */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-8 sm:p-10" style={{ borderRadius: '1.5rem', boxShadow: '0 4px 20px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <h2 className="text-2xl text-white font-bold mb-8 text-center" style={{ fontFamily: "'Noto Serif SC', serif", textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>擅长领域</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {specialtyTags.map((s, i) => (
                <span key={s.text} className="px-5 py-2 rounded-full text-base font-medium animate-fade-in transition-all hover:-translate-y-0.5 cursor-default"
                  style={{ animationDelay: `${0.06 * i}s`, backgroundColor: s.c.b, border: `1px solid ${s.c.bd}`, color: s.c.t }}>
                  {s.text}
                </span>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2">
              <p className="text-sm" style={{ color: T.purple.t, opacity: 0.6 }}>紫微体系：刘金府先生体系</p>
              <p className="text-sm" style={{ color: T.emerald.t, opacity: 0.6 }}>面相体系：苏民峰先生体系</p>
            </div>
          </div>
        </div>
      </section>

      {/* Login CTA */}
      {!isLoggedIn && (
        <section className="px-4 sm:px-6 py-16">
          <div className="max-w-6xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-md border border-blue-400/20 p-10 sm:p-14 space-y-6 animate-fade-in"
              style={{ borderRadius: '1.5rem', boxShadow: '0 4px 30px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
              <div className="w-16 h-16 rounded-full bg-blue-500/20 backdrop-blur flex items-center justify-center mx-auto ring-1 ring-blue-400/30 animate-pulse-glow">
                <LogIn className="w-7 h-7 text-blue-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Noto Serif SC', serif", textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>开启你的命理之旅</h2>
              <p className="text-base text-white/30 max-w-lg mx-auto leading-relaxed">注册账号后，可使用所有排盘工具，AI智能解析，云端保存记录，换设备不丢失</p>
              <Link to="/login" className="inline-flex items-center gap-2 px-10 py-3.5 rounded-full bg-blue-500 text-white text-base font-medium hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5">立即注册</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
