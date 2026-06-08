/**
 * 择日通胜数据工具
 * 基于 lunar-javascript 库
 */

// ==================== 类型定义 ====================

export interface DayAlmanac {
  solarDate: string;
  lunarDate: string;
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  zodiac: string;
  jieQi: string;
  nextJieQi: string;
  daysToNextJieQi: number;
  weekDay: string;
  naYin: string;
  xiu: string;
  xiuLuck: string;
  pengZuGan: string;
  pengZuZhi: string;
  xiShen: string;
  fuShen: string;
  caiShen: string;
  yangGui: string;
  yinGui: string;
  taiShen: string;
  chong: string;
  sha: string;
  jianChu: string;
  huangDao: string;
  yi: string[];
  ji: string[];
  jiShen: string[];
  xiongShen: string[];
  isGoodDay: boolean;
  luckLevel: number;
  wuXing: string;
  dayGan: string;
  dayZhi: string;
}

export const SHI_CHEN = [
  { name: '子时', time: '23:00-01:00', alias: '夜半' },
  { name: '丑时', time: '01:00-03:00', alias: '鸡鸣' },
  { name: '寅时', time: '03:00-05:00', alias: '平旦' },
  { name: '卯时', time: '05:00-07:00', alias: '日出' },
  { name: '辰时', time: '07:00-09:00', alias: '食时' },
  { name: '巳时', time: '09:00-11:00', alias: '隅中' },
  { name: '午时', time: '11:00-13:00', alias: '日中' },
  { name: '未时', time: '13:00-15:00', alias: '日昳' },
  { name: '申时', time: '15:00-17:00', alias: '晡时' },
  { name: '酉时', time: '17:00-19:00', alias: '日入' },
  { name: '戌时', time: '19:00-21:00', alias: '黄昏' },
  { name: '亥时', time: '21:00-23:00', alias: '人定' },
];

export const LUCK_COLORS: Record<number, { bg: string; text: string; glow: string; label: string }> = {
  5: { bg: 'rgba(74,222,128,0.15)', text: '#4ade80', glow: 'rgba(74,222,128,0.3)', label: '大吉' },
  4: { bg: 'rgba(74,222,128,0.08)', text: '#86efac', glow: 'rgba(74,222,128,0.15)', label: '吉' },
  3: { bg: 'rgba(251,191,36,0.08)', text: '#fbbf24', glow: 'rgba(251,191,36,0.15)', label: '平' },
  2: { bg: 'rgba(248,113,113,0.08)', text: '#fca5a5', glow: 'rgba(248,113,113,0.15)', label: '凶' },
  1: { bg: 'rgba(248,113,113,0.15)', text: '#f87171', glow: 'rgba(248,113,113,0.3)', label: '大凶' },
};
