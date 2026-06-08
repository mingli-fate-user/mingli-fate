import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const toolGroups = [
  {
    title: '择日通胜',
    tagline: '仰观天文 · 俯察地理 · 趋吉避凶',
    items: [
      { name: '择日通胜', path: '/tools/tongsheng', icon: '\ud83d\udcc5', desc: '老黄历每日宜忌、吉神方位、时辰吉凶、黄道黑道', bg: '/bg-chinese.jpg' },
    ],
  },
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
      { name: '七政四余', path: '/tools/qizheng', icon: '\ud83d\ude80', desc: '紫微斗数、八字等数术的源头，十一曜飞布十二宫', bg: '/bg-chinese.jpg' },
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
