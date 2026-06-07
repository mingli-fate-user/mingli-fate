// 八字排盘核心算法

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 五行
const GAN_WUXING = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
const ZHI_WUXING = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];

// 阴阳
const GAN_YINYANG = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴'];

// 地支六合
const ZHI_LIU_HE = [['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未']] as [string, string][];

// 地支三合
const ZHI_SAN_HE = [['申', '子', '辰'], ['寅', '午', '戌'], ['巳', '酉', '丑'], ['亥', '卯', '未']] as string[][];

// 地支六冲
const ZHI_CHONG: Record<string, string> = {
  '子': '午', '午': '子', '丑': '未', '未': '丑',
  '寅': '申', '申': '寅', '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳',
};

// 地支藏干
const ZHI_CANG_GAN: Record<string, string[]> = {
  '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
  '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
  '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲'],
};



// 1900-01-31是庚子日（已知参考点）
const BASE_DATE = new Date(1900, 0, 31); // 1900年1月31日
const BASE_DAY_GAN = 6; // 庚=6
const BASE_DAY_ZHI = 0; // 子=0

function getDaysDiff(date1: Date, date2: Date): number {
  return Math.floor((date1.getTime() - date2.getTime()) / (24 * 60 * 60 * 1000));
}

// 获取年柱
export function getYearPillar(year: number): { gan: string; zhi: string; year: number } {
  // 以立春为界，简化处理：2月4日前算上一年
  const ganIdx = (year - 4) % 10;
  const zhiIdx = (year - 4) % 12;
  return {
    gan: TIAN_GAN[(ganIdx + 10) % 10],
    zhi: DI_ZHI[(zhiIdx + 12) % 12],
    year,
  };
}

// 获取月柱（简化版：按农历月份）
export function getMonthPillar(yearGan: string, month: number): { gan: string; zhi: string } {
  // 年干定月干
  const ganIdx = TIAN_GAN.indexOf(yearGan);
  // 甲己之年丙作首，乙庚之岁戊为头，丙辛之岁寻庚起，丁壬壬位顺行流，若问戊癸何方发，甲寅之上好追求
  const startGanMap: Record<number, number> = { 0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0 };
  const monthGanStart = startGanMap[ganIdx];
  const actualMonthZhi = (2 + month - 1) % 12; // 寅开始
  const gan = TIAN_GAN[(monthGanStart + month - 1) % 10];
  return { gan, zhi: DI_ZHI[actualMonthZhi] };
}

// 获取日柱
export function getDayPillar(date: Date): { gan: string; zhi: string } {
  const days = getDaysDiff(date, BASE_DATE);
  const ganIdx = ((days + BASE_DAY_GAN) % 10 + 10) % 10;
  const zhiIdx = ((days + BASE_DAY_ZHI) % 12 + 12) % 12;
  return { gan: TIAN_GAN[ganIdx], zhi: DI_ZHI[zhiIdx] };
}

// 获取时柱
export function getHourPillar(dayGan: string, hour: number): { gan: string; zhi: string } {
  // 时辰地支
  const zhiIdx = Math.floor((hour + 1) / 2) % 12;
  // 日干定时干
  const ganIdx = TIAN_GAN.indexOf(dayGan);
  const startGanMap: Record<number, number> = { 0: 0, 5: 0, 1: 2, 6: 2, 2: 4, 7: 4, 3: 6, 8: 6, 4: 8, 9: 8 };
  const hourGanStart = startGanMap[ganIdx];
  const gan = TIAN_GAN[(hourGanStart + zhiIdx) % 10];
  return { gan, zhi: DI_ZHI[zhiIdx] };
}

// 计算十神
export function getShiShen(dayGan: string, targetGan: string): string {
  const dayIdx = TIAN_GAN.indexOf(dayGan);
  const targetIdx = TIAN_GAN.indexOf(targetGan);
  const diff = ((targetIdx - dayIdx) % 10 + 10) % 10;
  const dayYinYang = GAN_YINYANG[dayIdx];
  const targetYinYang = GAN_YINYANG[targetIdx];
  const sameYinYang = dayYinYang === targetYinYang;
  const map: Record<number, [string, string]> = {
    0: ['比肩', '劫财'], 2: ['食神', '伤官'], 4: ['偏财', '正财'],
    6: ['七杀', '正官'], 8: ['偏印', '正印'],
  };
  const result = map[diff];
  if (!result) return '';
  return sameYinYang ? result[0] : result[1];
}

// 完整的八字排盘
export interface BaZiResult {
  year: { gan: string; zhi: string; text: string };
  month: { gan: string; zhi: string; text: string };
  day: { gan: string; zhi: string; text: string };
  hour: { gan: string; zhi: string; text: string };
  dayGan: string;
  dayZhi: string;
  shiShen: {
  yearGan: string; monthGan: string; hourGan: string;
    yearZhi: string; monthZhi: string; dayZhi: string; hourZhi: string;
  };
  zodiac: string;
  wuxing: string[];
  cangGan: Record<string, string[]>;
  zodiacAnimal: string;
  liuHe: string[];
  sanHe: string[];
  chong: string[];
}

export function getBaZi(birthDate: Date): BaZiResult {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const hour = birthDate.getHours();

  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(yearPillar.gan, month);
  const dayPillar = getDayPillar(birthDate);
  const hourPillar = getHourPillar(dayPillar.gan, hour);

  const zodiacIdx = (year - 4) % 12;
  const zodiacAnimal = ZODIAC[(zodiacIdx + 12) % 12];

  // 十神
  const dayGan = dayPillar.gan;
  const shiShen = {
    yearGan: getShiShen(dayGan, yearPillar.gan),
    monthGan: getShiShen(dayGan, monthPillar.gan),
    hourGan: getShiShen(dayGan, hourPillar.gan),
    yearZhi: DI_ZHI.includes(yearPillar.zhi) ? '藏干见下' : '',
    monthZhi: '',
    dayZhi: '日主',
    hourZhi: '',
  };

  // 六合
  const liuHe: string[] = [];
  const allZhi = [yearPillar.zhi, monthPillar.zhi, dayPillar.zhi, hourPillar.zhi];
  for (const pair of ZHI_LIU_HE) {
    if (allZhi.includes(pair[0]) && allZhi.includes(pair[1])) {
      liuHe.push(`${pair[0]}${pair[1]}六合`);
    }
  }

  // 三合
  const sanHe: string[] = [];
  for (const group of ZHI_SAN_HE) {
    const match = group.filter(z => allZhi.includes(z));
    if (match.length >= 2) {
      sanHe.push(`${group.join('')}三合${match.length >= 3 ? '（全）' : '（缺）'}`);
    }
  }

  // 六冲
  const chong: string[] = [];
  for (let i = 0; i < allZhi.length; i++) {
    for (let j = i + 1; j < allZhi.length; j++) {
      if (ZHI_CHONG[allZhi[i]] === allZhi[j]) {
        chong.push(`${allZhi[i]}${allZhi[j]}相冲`);
      }
    }
  }

  return {
    year: { ...yearPillar, text: `${yearPillar.gan}${yearPillar.zhi}` },
    month: { ...monthPillar, text: `${monthPillar.gan}${monthPillar.zhi}` },
    day: { ...dayPillar, text: `${dayPillar.gan}${dayPillar.zhi}` },
    hour: { ...hourPillar, text: `${hourPillar.gan}${hourPillar.zhi}` },
    dayGan: dayPillar.gan,
    dayZhi: dayPillar.zhi,
    shiShen,
    zodiac: `${yearPillar.gan}${yearPillar.zhi}年`,
    wuxing: [GAN_WUXING[TIAN_GAN.indexOf(yearPillar.gan)], GAN_WUXING[TIAN_GAN.indexOf(dayPillar.gan)]],
    cangGan: {
      [yearPillar.zhi]: ZHI_CANG_GAN[yearPillar.zhi] || [],
      [monthPillar.zhi]: ZHI_CANG_GAN[monthPillar.zhi] || [],
      [dayPillar.zhi]: ZHI_CANG_GAN[dayPillar.zhi] || [],
      [hourPillar.zhi]: ZHI_CANG_GAN[hourPillar.zhi] || [],
    },
    zodiacAnimal,
    liuHe,
    sanHe,
    chong,
  };
}

export { TIAN_GAN, DI_ZHI, GAN_WUXING, ZHI_WUXING, ZHI_CANG_GAN, getShiShen as getShiShenLabel };
