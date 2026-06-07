// 每个命理工具的独特颜色主题 - 五颜六色风格
export interface ToolColorTheme {
  name: string;
  // 导航条颜色
  navBg: string;
  navText: string;
  navTextActive: string;
  navBorder: string;
  // 页面背景 - 深色渐变
  pageBg: string;
  // 卡片强调色
  accent: string;
  accentLight: string;
  accentGlow: string;
  // 按钮
  btnBg: string;
  btnText: string;
  // 标签/徽章
  badgeBg: string;
  badgeText: string;
  // 输入框焦点
  inputFocus: string;
  // 图标色
  iconColor: string;
}

export const TOOL_COLORS: Record<string, ToolColorTheme> = {
  bazi: {
    name: '八字排盘',
    navBg: 'bg-amber-500/10',
    navText: 'text-amber-200/70',
    navTextActive: 'text-amber-400',
    navBorder: 'border-amber-400/20',
    pageBg: 'bg-gradient-to-br from-amber-950 via-orange-950 to-amber-950',
    accent: 'amber-400',
    accentLight: 'amber-400/20',
    accentGlow: 'shadow-amber-400/20',
    btnBg: 'bg-amber-500',
    btnText: 'text-amber-950',
    badgeBg: 'bg-amber-400/15',
    badgeText: 'text-amber-300',
    inputFocus: 'focus:border-amber-400 focus:ring-amber-400/20',
    iconColor: 'text-amber-400',
  },
  ziwei: {
    name: '紫微斗数',
    navBg: 'bg-purple-500/10',
    navText: 'text-purple-200/70',
    navTextActive: 'text-purple-400',
    navBorder: 'border-purple-400/20',
    pageBg: 'bg-gradient-to-br from-purple-950 via-violet-950 to-purple-950',
    accent: 'purple-400',
    accentLight: 'purple-400/20',
    accentGlow: 'shadow-purple-400/20',
    btnBg: 'bg-purple-500',
    btnText: 'text-white',
    badgeBg: 'bg-purple-400/15',
    badgeText: 'text-purple-300',
    inputFocus: 'focus:border-purple-400 focus:ring-purple-400/20',
    iconColor: 'text-purple-400',
  },
  meihua: {
    name: '梅花易数',
    navBg: 'bg-emerald-500/10',
    navText: 'text-emerald-200/70',
    navTextActive: 'text-emerald-400',
    navBorder: 'border-emerald-400/20',
    pageBg: 'bg-gradient-to-br from-emerald-950 via-green-950 to-emerald-950',
    accent: 'emerald-400',
    accentLight: 'emerald-400/20',
    accentGlow: 'shadow-emerald-400/20',
    btnBg: 'bg-emerald-500',
    btnText: 'text-white',
    badgeBg: 'bg-emerald-400/15',
    badgeText: 'text-emerald-300',
    inputFocus: 'focus:border-emerald-400 focus:ring-emerald-400/20',
    iconColor: 'text-emerald-400',
  },
  liuyao: {
    name: '六爻起卦',
    navBg: 'bg-blue-500/10',
    navText: 'text-blue-200/70',
    navTextActive: 'text-blue-400',
    navBorder: 'border-blue-400/20',
    pageBg: 'bg-gradient-to-br from-blue-950 via-indigo-950 to-blue-950',
    accent: 'blue-400',
    accentLight: 'blue-400/20',
    accentGlow: 'shadow-blue-400/20',
    btnBg: 'bg-blue-500',
    btnText: 'text-white',
    badgeBg: 'bg-blue-400/15',
    badgeText: 'text-blue-300',
    inputFocus: 'focus:border-blue-400 focus:ring-blue-400/20',
    iconColor: 'text-blue-400',
  },
  xiaoliuren: {
    name: '小六壬',
    navBg: 'bg-pink-500/10',
    navText: 'text-pink-200/70',
    navTextActive: 'text-pink-400',
    navBorder: 'border-pink-400/20',
    pageBg: 'bg-gradient-to-br from-pink-950 via-rose-950 to-pink-950',
    accent: 'pink-400',
    accentLight: 'pink-400/20',
    accentGlow: 'shadow-pink-400/20',
    btnBg: 'bg-pink-500',
    btnText: 'text-white',
    badgeBg: 'bg-pink-400/15',
    badgeText: 'text-pink-300',
    inputFocus: 'focus:border-pink-400 focus:ring-pink-400/20',
    iconColor: 'text-pink-400',
  },
  qimen: {
    name: '奇门遁甲',
    navBg: 'bg-orange-500/10',
    navText: 'text-orange-200/70',
    navTextActive: 'text-orange-400',
    navBorder: 'border-orange-400/20',
    pageBg: 'bg-gradient-to-br from-orange-950 via-red-950 to-orange-950',
    accent: 'orange-400',
    accentLight: 'orange-400/20',
    accentGlow: 'shadow-orange-400/20',
    btnBg: 'bg-orange-500',
    btnText: 'text-white',
    badgeBg: 'bg-orange-400/15',
    badgeText: 'text-orange-300',
    inputFocus: 'focus:border-orange-400 focus:ring-orange-400/20',
    iconColor: 'text-orange-400',
  },
  chenggu: {
    name: '称骨',
    navBg: 'bg-teal-500/10',
    navText: 'text-teal-200/70',
    navTextActive: 'text-teal-400',
    navBorder: 'border-teal-400/20',
    pageBg: 'bg-gradient-to-br from-teal-950 via-cyan-950 to-teal-950',
    accent: 'teal-400',
    accentLight: 'teal-400/20',
    accentGlow: 'shadow-teal-400/20',
    btnBg: 'bg-teal-500',
    btnText: 'text-white',
    badgeBg: 'bg-teal-400/15',
    badgeText: 'text-teal-300',
    inputFocus: 'focus:border-teal-400 focus:ring-teal-400/20',
    iconColor: 'text-teal-400',
  },
  jinqian: {
    name: '金钱卦',
    navBg: 'bg-yellow-500/10',
    navText: 'text-yellow-200/70',
    navTextActive: 'text-yellow-400',
    navBorder: 'border-yellow-400/20',
    pageBg: 'bg-gradient-to-br from-yellow-950 via-amber-950 to-yellow-950',
    accent: 'yellow-400',
    accentLight: 'yellow-400/20',
    accentGlow: 'shadow-yellow-400/20',
    btnBg: 'bg-yellow-500',
    btnText: 'text-amber-950',
    badgeBg: 'bg-yellow-400/15',
    badgeText: 'text-yellow-300',
    inputFocus: 'focus:border-yellow-400 focus:ring-yellow-400/20',
    iconColor: 'text-yellow-400',
  },
  mianxiang: {
    name: '面相分析',
    navBg: 'bg-indigo-500/10',
    navText: 'text-indigo-200/70',
    navTextActive: 'text-indigo-400',
    navBorder: 'border-indigo-400/20',
    pageBg: 'bg-gradient-to-br from-indigo-950 via-blue-950 to-indigo-950',
    accent: 'indigo-400',
    accentLight: 'indigo-400/20',
    accentGlow: 'shadow-indigo-400/20',
    btnBg: 'bg-indigo-500',
    btnText: 'text-white',
    badgeBg: 'bg-indigo-400/15',
    badgeText: 'text-indigo-300',
    inputFocus: 'focus:border-indigo-400 focus:ring-indigo-400/20',
    iconColor: 'text-indigo-400',
  },
  tarot: {
    name: '塔罗牌占卜',
    navBg: 'bg-fuchsia-500/10',
    navText: 'text-fuchsia-200/70',
    navTextActive: 'text-fuchsia-400',
    navBorder: 'border-fuchsia-400/20',
    pageBg: 'bg-gradient-to-br from-fuchsia-950 via-purple-950 to-fuchsia-950',
    accent: 'fuchsia-400',
    accentLight: 'fuchsia-400/20',
    accentGlow: 'shadow-fuchsia-400/20',
    btnBg: 'bg-fuchsia-500',
    btnText: 'text-white',
    badgeBg: 'bg-fuchsia-400/15',
    badgeText: 'text-fuchsia-300',
    inputFocus: 'focus:border-fuchsia-400 focus:ring-fuchsia-400/20',
    iconColor: 'text-fuchsia-400',
  },
  astro: {
    name: '西方星盘',
    navBg: 'bg-sky-500/10',
    navText: 'text-sky-200/70',
    navTextActive: 'text-sky-400',
    navBorder: 'border-sky-400/20',
    pageBg: 'bg-gradient-to-br from-sky-950 via-blue-950 to-sky-950',
    accent: 'sky-400',
    accentLight: 'sky-400/20',
    accentGlow: 'shadow-sky-400/20',
    btnBg: 'bg-sky-500',
    btnText: 'text-white',
    badgeBg: 'bg-sky-400/15',
    badgeText: 'text-sky-300',
    inputFocus: 'focus:border-sky-400 focus:ring-sky-400/20',
    iconColor: 'text-sky-400',
  },
  taiyi: {
    name: '太乙神数',
    navBg: 'bg-amber-500/10',
    navText: 'text-amber-200/70',
    navTextActive: 'text-amber-400',
    navBorder: 'border-amber-400/20',
    pageBg: 'bg-gradient-to-br from-amber-950 via-yellow-950 to-amber-950',
    accent: 'amber-400',
    accentLight: 'amber-400/20',
    accentGlow: 'shadow-amber-400/20',
    btnBg: 'bg-amber-600',
    btnText: 'text-amber-950',
    badgeBg: 'bg-amber-400/15',
    badgeText: 'text-amber-300',
    inputFocus: 'focus:border-amber-400 focus:ring-amber-400/20',
    iconColor: 'text-amber-400',
  },
};

// 根据路径获取当前工具颜色
export function getToolColorFromPath(pathname: string): ToolColorTheme | null {
  if (pathname.startsWith('/tools/bazi')) return TOOL_COLORS.bazi;
  if (pathname.startsWith('/tools/ziwei')) return TOOL_COLORS.ziwei;
  if (pathname.startsWith('/tools/meihua')) return TOOL_COLORS.meihua;
  if (pathname.startsWith('/tools/liuyao')) return TOOL_COLORS.liuyao;
  if (pathname.startsWith('/tools/xiaoliuren')) return TOOL_COLORS.xiaoliuren;
  if (pathname.startsWith('/tools/qimen')) return TOOL_COLORS.qimen;
  if (pathname.startsWith('/tools/chenggu')) return TOOL_COLORS.chenggu;
  if (pathname.startsWith('/tools/jinqian')) return TOOL_COLORS.jinqian;
  if (pathname.startsWith('/tools/mianxiang')) return TOOL_COLORS.mianxiang;
  if (pathname.startsWith('/tools/tarot')) return TOOL_COLORS.tarot;
  if (pathname.startsWith('/tools/astro')) return TOOL_COLORS.astro;
  if (pathname.startsWith('/tools/taiyi')) return TOOL_COLORS.taiyi;
  if (pathname.startsWith('/tools/fengshui')) return TOOL_COLORS.fengshui;
  if (pathname.startsWith('/tools/xuankong')) return TOOL_COLORS.xuankong;
  if (pathname.startsWith('/tools/qimendifa')) return TOOL_COLORS.qimendifa;
  if (pathname.startsWith('/tools/daliuren')) return TOOL_COLORS.daliuren;
  return null;
}

// 首页默认主题
export const HOME_THEME: ToolColorTheme = {
  name: '首页',
  navBg: 'bg-white/10',
  navText: 'text-white/70',
  navTextActive: 'text-blue-400',
  navBorder: 'border-white/20',
  pageBg: 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900',
  accent: 'blue-400',
  accentLight: 'blue-400/20',
  accentGlow: 'shadow-blue-400/20',
  btnBg: 'bg-blue-500',
  btnText: 'text-white',
  badgeBg: 'bg-blue-400/15',
  badgeText: 'text-blue-300',
  inputFocus: 'focus:border-blue-400 focus:ring-blue-400/20',
  iconColor: 'text-blue-400',
};

// 彩色导航文字配置 - 每个导航项的独特颜色
export const NAV_COLORS: Record<string, string> = {
  '学习区': 'text-emerald-400',
  '排盘工具': 'text-amber-400',
  '命理社区': 'text-fuchsia-400',
  '我的': 'text-pink-400',
  '关于黄师傅': 'text-purple-400',
  '联系咨询': 'text-sky-400',
};

// 彩色hover颜色
export const NAV_HOVER_COLORS: Record<string, string> = {
  '学习区': 'hover:text-emerald-300',
  '排盘工具': 'hover:text-amber-300',
  '命理社区': 'hover:text-fuchsia-300',
  '我的': 'hover:text-pink-300',
  '关于黄师傅': 'hover:text-purple-300',
  '联系咨询': 'hover:text-sky-300',
};
