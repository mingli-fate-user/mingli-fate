import { Link } from 'react-router-dom';
import { Gamepad2, ChevronRight, Sparkles, BookOpen } from 'lucide-react';

const T = {
  amber: { t: '#fcd34d', b: 'rgba(245,158,11,0.15)', bh: 'rgba(245,158,11,0.25)', bd: 'rgba(245,158,11,0.2)', bdh: 'rgba(245,158,11,0.4)', s: 'rgba(245,158,11,0.08)' },
  purple: { t: '#c4b5fd', b: 'rgba(168,85,247,0.15)', bh: 'rgba(168,85,247,0.25)', bd: 'rgba(168,85,247,0.2)', bdh: 'rgba(168,85,247,0.4)', s: 'rgba(168,85,247,0.08)' },
  orange: { t: '#fdba74', b: 'rgba(249,115,22,0.15)', bh: 'rgba(249,115,22,0.25)', bd: 'rgba(249,115,22,0.2)', bdh: 'rgba(249,115,22,0.4)', s: 'rgba(249,115,22,0.08)' },
  red: { t: '#fca5a5', b: 'rgba(239,68,68,0.15)', bh: 'rgba(239,68,68,0.25)', bd: 'rgba(239,68,68,0.2)', bdh: 'rgba(239,68,68,0.4)', s: 'rgba(239,68,68,0.08)' },
  cyan: { t: '#67e8f9', b: 'rgba(34,211,238,0.15)', bh: 'rgba(34,211,238,0.25)', bd: 'rgba(34,211,238,0.2)', bdh: 'rgba(34,211,238,0.4)', s: 'rgba(34,211,238,0.08)' },
  green: { t: '#6ee7b7', b: 'rgba(52,211,153,0.15)', bh: 'rgba(52,211,153,0.25)', bd: 'rgba(52,211,153,0.2)', bdh: 'rgba(52,211,153,0.4)', s: 'rgba(52,211,153,0.08)' },
  pink: { t: '#f9a8d4', b: 'rgba(244,114,182,0.15)', bh: 'rgba(244,114,182,0.25)', bd: 'rgba(244,114,182,0.2)', bdh: 'rgba(244,114,182,0.4)', s: 'rgba(244,114,182,0.08)' },
};

const games = [
  {
    name: '命理人生模拟器',
    path: '/games/lifesim',
    icon: '\ud83c\udfae',
    desc: '输入八字，从1岁到80岁的养成之旅，命运与选择的博弈',
    c: T.amber,
    badge: '命运养成',
    detail: 'AI根据你的八字格局推演9个人生阶段，每个关键节点都有选择题。你的选择+八字格局+大运流年=最终结局。探讨命运天定还是选择至上。',
  },
  {
    name: '我是大师',
    path: '/games/master',
    icon: '\ud83c\udff0',
    desc: 'AI随机出题，你来做命理师，测试你的命理水平',
    c: T.purple,
    badge: '命理考核',
    detail: 'AI随机生成八字或卦象，先自己分析并隐藏答案。你根据排盘信息进行7维度分析，AI严格评分（满分100），给出详细纠错和学习指导。支持八字、紫微、六爻、梅花四大门派。',
  },
];

export default function Games() {
  return (
    <div className="px-4 sm:px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c4b5fd' }}>
            <Gamepad2 className="w-4 h-4" />
            命理小游戏
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white text-shadow-glow" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            命理小游戏
          </h1>
          <p className="text-lg text-white/60 max-w-lg mx-auto">
            以游戏的方式体验命理，在娱乐中领悟命运与选择的奥秘
          </p>
        </div>

        {/* Games List */}
        <div className="space-y-4">
          {games.map((game, i) => (
            <Link
              key={game.name}
              to={game.path}
              className="group block relative rounded-2xl border p-6 sm:p-8 transition-all duration-500 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderColor: game.c.bd,
                boxShadow: `0 4px 20px ${game.c.s}, inset 0 1px 0 rgba(255,255,255,0.05)`,
                animationDelay: `${0.1 * i}s`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = game.c.bh;
                e.currentTarget.style.borderColor = game.c.bdh;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = game.c.bd;
              }}
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl transition-all group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${game.c.b}, ${game.c.bh})`,
                      border: `1px solid ${game.c.bd}`,
                      boxShadow: `0 0 20px ${game.c.s}`,
                    }}
                  >
                    {game.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-white group-hover:text-white transition-colors" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                      {game.name}
                    </h2>
                    <span
                      className="px-3 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: game.c.b, border: `1px solid ${game.c.bd}`, color: game.c.t }}
                    >
                      {game.badge}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{game.detail}</p>
                  <div className="flex items-center gap-2 text-sm transition-colors" style={{ color: game.c.t, opacity: 0.7 }}>
                    <Sparkles className="w-4 h-4" />
                    <span>立即体验</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="text-center space-y-4 pt-8">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="text-sm text-white/20">
            更多命理小游戏即将上线...
          </p>
          <div className="flex justify-center gap-4">
            {['八字PK对战', '摇签筒', 'AI剧本杀'].map((name) => (
              <span
                key={name}
                className="px-4 py-2 rounded-full text-xs text-white/30 bg-white/5 border border-white/5"
              >
                {name} · 开发中
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
