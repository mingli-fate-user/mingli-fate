import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, MessageSquare, User, ChevronRight, Gamepad2 } from 'lucide-react';

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
  { icon: Gamepad2, title: '命理小游戏', desc: '命理人生模拟器、我是大师考核，边玩边学', link: '/games', c: T.orange },
  { icon: MessageSquare, title: '命理社区', desc: '与志同道合的朋友一起探讨命理知识', link: '/community', c: T.fuchsia },
  { icon: User, title: '个人中心', desc: '查看保存记录、管理API密钥', link: '/me', c: T.pink },
];

const specialtyTags = [
  { text: '六爻解卦', c: T.amber },
  { text: '紫微斗数', c: T.purple },
  { text: '江氏小六壬', c: T.cyan },
  { text: '面相学', c: T.emerald },
];

export default function Home() {

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className={`transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>


      {/* Hero Section - 深色高级荧光UI */}
      <section className="relative overflow-hidden" style={{ minHeight: '85vh' }}>
        {/* 多层渐变背景 */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(251,191,36,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(168,85,247,0.06) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(59,130,246,0.05) 0%, transparent 50%), linear-gradient(180deg, #0c0704 0%, #0d0805 40%, #0a0705 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(251,191,36,0.03) 0%, transparent 50%)', animation: 'heroGlow 8s ease-in-out infinite alternate' }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(251,191,36,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <style>{`
          @keyframes heroGlow { from { opacity: 0.5 } to { opacity: 1 } }
          @keyframes float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
          @keyframes shimmer { 0% { background-position: -200% center } 100% { background-position: 200% center } }
          @keyframes borderGlow { 0%, 100% { border-color: rgba(251,191,36,0.15) } 50% { border-color: rgba(168,85,247,0.25) } }
          .float-anim { animation: float 6s ease-in-out infinite }
          .shimmer-text { background: linear-gradient(90deg, rgba(251,191,36,0.4) 0%, #fbbf24 25%, #fff 50%, #fbbf24 75%, rgba(251,191,36,0.4) 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 6s linear infinite }
        `}</style>

        <div className="relative z-10 px-4 sm:px-6 pt-20 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-8">

              {/* 顶部标签 */}
              <div className="animate-fade-in">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)', color: '#fbbf24' }}>
                  <Sparkles className="w-3 h-3" />
                  传统命理 · 数术传承
                </span>
              </div>

              {/* Avatar */}
              <div className="relative animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="absolute -inset-4 rounded-full opacity-40" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, rgba(168,85,247,0.08) 40%, transparent 70%)', filter: 'blur(12px)', animation: 'heroGlow 4s ease-in-out infinite alternate' }} />
                <div className="absolute -inset-1 rounded-full" style={{ border: '1px solid rgba(251,191,36,0.15)', animation: 'borderGlow 4s ease-in-out infinite' }} />
                <div className="relative w-28 h-28 rounded-full overflow-hidden float-anim" style={{ boxShadow: '0 0 30px rgba(251,191,36,0.1), 0 0 60px rgba(168,85,247,0.05)' }}>
                  <img src="./cat-avatar.jpg" alt="黄师傅" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* 名字 — 荧光楷体 */}
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight shimmer-text" style={{ fontFamily: "'KaiTi','STKaiti','Noto Serif SC',serif" }}>
                  黄师傅
                </h1>
              </div>

              {/* 副标题 — 紫色荧光 */}
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <p className="text-base sm:text-lg tracking-[0.3em]" style={{ fontFamily: "'KaiTi','STKaiti',serif", color: 'rgba(168,85,247,0.7)' }}>
                  野生命理科普博主
                </p>
              </div>

              {/* 介绍 — 玻璃态卡片 */}
              <div className="animate-fade-in max-w-2xl" style={{ animationDelay: '0.4s' }}>
                <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.06)', animation: 'borderGlow 6s ease-in-out infinite' }}>
                  <p className="text-lg sm:text-xl leading-relaxed tracking-wider" style={{ fontFamily: "'KaiTi','STKaiti','Noto Serif SC',serif", color: 'rgba(232,220,200,0.85)' }}>
                    精通六爻解卦、紫微斗数、江氏小六壬、面相学
                  </p>
                  <div className="h-px w-24 mx-auto my-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.3), transparent)' }} />
                  <p className="text-sm" style={{ fontFamily: "'Noto Serif SC',serif", color: 'rgba(232,220,200,0.35)', letterSpacing: '0.15em' }}>
                    致力于传统命理文化的科普与传承
                  </p>
                </div>
              </div>

              {/* 特长标签 */}
              <div className="animate-fade-in flex flex-wrap justify-center gap-2" style={{ animationDelay: '0.5s' }}>
                {specialtyTags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-medium" style={{
                    background: tag.c.b, border: `1px solid ${tag.c.bd}`, color: tag.c.t,
                    boxShadow: `0 0 12px ${tag.c.s}`,
                  }}>
                    {tag.text}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <Link to="/tools" className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-medium transition-all duration-300 hover:-translate-y-0.5" style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))',
                  border: '1px solid rgba(251,191,36,0.25)',
                  color: '#fbbf24',
                  boxShadow: '0 4px 20px rgba(251,191,36,0.1)',
                }}>
                  <Sparkles className="w-5 h-5" />开始排盘
                </Link>
                <Link to="/study" className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-medium transition-all duration-300 hover:-translate-y-0.5" style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(232,220,200,0.7)',
                }}>
                  <BookOpen className="w-5 h-5" />学习资料
                </Link>
              </div>
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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


    </div>
  );
}
