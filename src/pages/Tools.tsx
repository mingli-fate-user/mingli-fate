import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb, Target, Compass, Sparkles, Home, User, Star } from 'lucide-react';

const toolGroups = [
  {
    title: '上古三式',
    tagline: '太乙明天道 · 大六壬断人事 · 奇门晓地理',
    items: [
      { name: '太乙神数', path: '/tools/taiyi', icon: '\ud83d\udc51', desc: '三式之首，占国运天文，推阳九百六之数', bg: '/bg-chinese.jpg' },
      { name: '大六壬', path: '/tools/daliuren', icon: '\u2696\ufe0f', desc: '六壬神课，人事之王，四课三传断吉凶', bg: '/bg-chinese.jpg' },
      { name: '奇门遁甲', path: '/tools/qimen', icon: '\ud83c\udf00', desc: '八门九星，遁甲玄机，看局势排兵布阵', bg: '/bg-chinese.jpg' },
    ],
  },
  {
    title: '命盘区',
    tagline: '观命定格局 · 知运察流年',
    items: [
      { name: '八字排盘', path: '/tools/bazi', icon: '\ud83c\udfaf', desc: '四柱八字，十神格局，大运流年', bg: '/bg-chinese.jpg' },
      { name: '紫微斗数', path: '/tools/ziwei', icon: '\u2728', desc: '十二宫位，星曜飞化，四化飞星', bg: '/ziwei.jpg' },
      { name: '袁天罡称骨', path: '/tools/chenggu', icon: '\u2696\ufe0f', desc: '年月日时，骨重计算，称骨歌诀', bg: '/bg-chinese.jpg' },
    ],
  },
  {
    title: '术数区',
    tagline: '卜筮知天机 · 卦象明吉凶',
    items: [
      { name: '小六壬（马前课）', path: '/tools/xiaoliuren', icon: '\ud83e\udd1a', desc: '江氏小六壬（马前课），六神掌诀，时辰起课', bg: '/xiaoliuren.jpg' },
      { name: '六爻起卦', path: '/tools/liuyao', icon: '\ud83e\ude99', desc: '金钱卦，六十四卦，爻辞解析', bg: '/liuyao.jpg' },
      { name: '金钱卦', path: '/tools/jinqiangua', icon: '\ud83c\udfb2', desc: '三枚铜钱，六十四卦，AI解卦', bg: '/yijing64.json' },
      { name: '梅花易数', path: '/tools/meihua', icon: '\u26a1', desc: '时间起卦，数字起卦，万物类象', bg: '/bg-chinese.jpg' },
    ],
  },
  {
    title: '风水理气',
    tagline: '理气察方位 · 飞星断吉凶',
    items: [
      { name: '风水户型设计', path: '/tools/fengshui', icon: '\ud83c\udfe0', desc: '拖拽式房型建模，旋转罗盘调整方位', bg: '/bg-chinese.jpg' },
      { name: '玄空飞星排盘', path: '/tools/xuankong', icon: '\ud83e\udded', desc: '三元九运，二十四山，挨星下卦', bg: '/bg-chinese.jpg' },
      { name: '奇门地理排盘', path: '/tools/qimendifa', icon: '\ud83d\uddfa\ufe0f', desc: '奇门晓地理，九星八门察方位', bg: '/bg-chinese.jpg' },
    ],
  },
  {
    title: '谈相理命',
    tagline: '观相识人 · 相由心生',
    items: [
      { name: '相法AI解析', path: '/tools/mianxiang', icon: '\ud83d\udc64', desc: '上传照片，AI面相分析，运势解读', bg: '/face-reading.jpg' },
    ],
  },
  {
    title: '西方命理',
    tagline: '星盘塔罗 · 东西合璧',
    items: [
      { name: '塔罗牌占卜', path: '/tools/tarot', icon: '\ud83c\udf19', desc: '韦特塔罗，六种牌阵，AI牌意解读', bg: '/bg-tarot.jpg' },
      { name: '西方星盘', path: '/tools/astro', icon: '\u2b50', desc: '本命星盘，十大行星，相位分析', bg: '/bg-astro.jpg' },
    ],
  },
  {
    title: '杂占',
    tagline: '象数推演 · 万物可占',
    items: [
      { name: '皇极经世', path: '/tools/huangji', icon: '\ud83d\udc51', desc: '元会运世，声音律吕，推算历史兴衰', bg: '/bg-chinese.jpg' },
      { name: '灵棋经', path: '/tools/lingqijing', icon: '\ud83c\udfb2', desc: '十二棋子投掷，一百二十五卦断吉凶', bg: '/bg-chinese.jpg' },
      { name: '解梦', path: '/tools/jiemeng', icon: '\ud83c\udf19', desc: '周公解梦结合心理学，详细描述梦境AI解读', bg: '/bg-chinese.jpg' },
      { name: '测字', path: '/tools/cezi', icon: '\u270d\ufe0f', desc: '拆字相字，笔画五行，一字一世界', bg: '/bg-chinese.jpg' },
    ],
  },
  {
    title: '择日通胜',
    tagline: '择吉避凶 · 老黄历',
    items: [
      { name: '择日通胜', path: '/tongsheng', icon: '\ud83d\udcc5', desc: '建除十二神、黄道黑道、每日宜忌', bg: '/bg-chinese.jpg' },
    ],
  },
  {
    title: '哲学分析',
    tagline: '唯物辩证 · 矛盾分析',
    items: [
      { name: '唯物辩证法', path: '/tools/dialectics', icon: '\u2696\ufe0f', desc: '以马克思主义矛盾分析法深度剖析事物', bg: '/bg-chinese.jpg' },
    ],
  },
];

export default function Tools() {
  return (
    <div className="px-4 sm:px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-14">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-white text-shadow-glow" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            排盘工具
          </h1>
          <p className="text-lg text-white/60 max-w-lg mx-auto">
            融汇上古三式与东西方命理精华，在线排盘，AI智能解析
          </p>
        </div>

        {/* 使用指导卡片 */}
        <div className="rounded-2xl border border-white/[0.06] p-5 sm:p-6 space-y-4 animate-fade-in" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.03), rgba(168,85,247,0.02))' }}>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400/60" />
            <h2 className="text-sm font-semibold text-white/70" style={{ fontFamily: "'Noto Serif SC', serif" }}>不知道用哪个工具？</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: Target, q: '想看一生格局、大运走势', a: '八字排盘 / 紫微斗数', paths: ['/tools/bazi', '/tools/ziwei'], color: '#f59e0b' },
              { icon: Compass, q: '有具体事情想问吉凶', a: '六爻起卦 / 梅花易数 / 小六壬', paths: ['/tools/liuyao', '/tools/meihua', '/tools/xiaoliuren'], color: '#06b6d4' },
              { icon: Home, q: '买房装修看风水', a: '风水户型 / 玄空飞星', paths: ['/tools/fengshui', '/tools/xuankong'], color: '#10b981' },
              { icon: User, q: '想了解面相运势', a: '相法AI解析', paths: ['/tools/mianxiang'], color: '#f97316' },
              { icon: Star, q: '看西方占星', a: '西方星盘 / 塔罗牌', paths: ['/tools/astro', '/tools/tarot'], color: '#8b5cf6' },
              { icon: Sparkles, q: '占国运、大事', a: '太乙神数 / 大六壬', paths: ['/tools/taiyi', '/tools/daliuren'], color: '#fbbf24' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-white/[0.04] p-3 space-y-1.5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-1.5">
                  <item.icon className="w-3 h-3" style={{ color: item.color, opacity: 0.6 }} />
                  <span className="text-[11px] text-white/30">{item.q}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.paths.map((p, j) => (
                    <Link key={j} to={p} className="text-[11px] px-2 py-0.5 rounded-full transition-colors hover:opacity-100" style={{ background: `${item.color}10`, color: `${item.color}90`, border: `1px solid ${item.color}20` }}>
                      {item.a.split(' / ')[j] || item.a}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Groups */}
        {toolGroups.map((group, gi) => (
          <div key={group.title} className="space-y-4 animate-fade-in" style={{ animationDelay: `${0.1 * gi}s` }}>
            <div className="flex items-end gap-3 pl-1">
              <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                {group.title}
              </h2>
              <span className="text-xs text-white/30 mb-1">{group.tagline}</span>
            </div>
            <div className="h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent mb-2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.items.map((tool) => (
                <Link
                  key={tool.name}
                  to={tool.path}
                  className="group p-4 flex items-center gap-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03] transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-white/[0.1] transition-colors">
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-white/40 mt-0.5">{tool.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom */}
        <div className="text-center pt-6">
          <p className="text-sm text-white/30">
            共 {toolGroups.reduce((acc, g) => acc + g.items.length, 0)} 种排盘方式
          </p>
        </div>
      </div>
    </div>
  );
}
