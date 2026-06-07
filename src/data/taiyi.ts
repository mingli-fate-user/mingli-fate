// ============================================================
// 太乙神数排盘核心算法 - 三式之首，占国运天文
// 参考: kentang2017/kintaiyi (GitHub开源项目)
// ============================================================

// 十六神名称
export const SIXTEEN_GODS = [
  '和德', '毗乔', '从卑', '嵩众',
  '高丛', '凑', '曳蜀', '轩项',
  '进', '阳道', '灵辰', '浩罡',
  '刑罡', '大炅', '启辰', '少昊',
] as const;

// 十二地支
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

// 十天干
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

// 太乙九宫八卦对应
export const GONG_TO_BAGUA: Record<number, string> = {
  1: '坎', 2: '坤', 3: '震', 4: '巽',
  6: '乾', 7: '兑', 8: '艮', 9: '离',
};

export const GONG_NAME: Record<number, string> = {
  1: '一宫坎水', 2: '二宫坤土', 3: '三宫震木', 4: '四宫巽木',
  5: '五中宫', 6: '六宫乾金', 7: '七宫兑金', 8: '八宫艮土', 9: '九宫离火',
};

// 九宫方位名
export const GONG_DIRECTION: Record<number, string> = {
  1: '北', 2: '西南', 3: '东', 4: '东南',
  5: '中', 6: '西北', 7: '西', 8: '东北', 9: '南',
};

// 九宫五行色
export const GONG_COLOR: Record<number, string> = {
  1: '#3b82f6', 2: '#92400e', 3: '#22c55e', 4: '#22c55e',
  5: '#f59e0b', 6: '#f8fafc', 7: '#f8fafc', 8: '#92400e', 9: '#ef4444',
};

// 阳遁太乙宫序（从局数1-72对应的太乙落宫）
// 阳遁顺行：一宫→二宫→三宫→四宫→六宫→七宫→八宫→九宫→循环（跳过中宫）
const YANG_GONG_SEQUENCE = [1, 2, 3, 4, 6, 7, 8, 9]; // 8宫循环

// 阴遁太乙宫序（逆行）
const YIN_GONG_SEQUENCE = [9, 8, 7, 6, 4, 3, 2, 1]; // 8宫循环

// 阳遁文昌起始位和顺序
const YANG_SKY_EYES_START = '武德'; // 阳遁文昌从武德起
const YIN_SKY_EYES_START = '吕申';  // 阴遁文昌从吕申起

// 十六神在地支上的分布（用于文昌推算）
const GOD_ZHI_MAP: Record<string, string> = {
  '子': '和德', '丑': '从卑', '寅': '毗乔', '卯': '嵩众',
  '辰': '高丛', '巳': '凑', '午': '曳蜀', '未': '轩项',
  '申': '阳道', '酉': '进', '戌': '灵辰', '亥': '浩罡',
};

// 生成六十甲子
export function generateJiaZi(): string[] {
  const result: string[] = [];
  for (let i = 0; i < 60; i++) {
    result.push(TIAN_GAN[i % 10] + DI_ZHI[i % 12]);
  }
  return result;
}

const JIA_ZI = generateJiaZi();

// ============================================================
// 太乙积年计算
// ============================================================

// 不同流派的积年起始数
const ACC_YEAR_BASE: Record<number, number> = {
  0: 10153917,  // 黄帝术
  1: 1936557,   // 上元术
  2: 10154193,  // 续统术
  3: 10153917,  // 浑天术
};

/**
 * 计算太乙积年数（年计）
 * @param year 农历年
 * @param style 积年流派 (0=黄帝术, 1=上元术, 2=续统术, 3=浑天术)
 */
export function calculateAccumulatedYear(year: number, style: number = 0): number {
  const base = ACC_YEAR_BASE[style] || ACC_YEAR_BASE[0];
  return base + year;
}

// ============================================================
// 太乙局数计算
// ============================================================

/**
 * 计算太乙局数
 * @param accYear 积年数
 * @returns 局数 (1-72)
 */
export function calculateKook(accYear: number): number {
  const k = accYear % 72;
  return k === 0 ? 72 : k;
}

/**
 * 判断阳遁/阴遁
 * @param kook 局数
 * @param month 农历月（用于判断节气）
 * @returns '阳遁' | '阴遁'
 */
export function determineYinYang(kook: number, month: number = 1): '阳遁' | '阴遁' {
  // 简化判断：夏至后阴遁，冬至后阳遁
  // 年计默认阳遁，月计根据月份判断
  if (month >= 5 && month <= 10) {
    return '阴遁';
  }
  return '阳遁';
}

/**
 * 计算三才（理天/理地/理人）
 * @param kook 局数
 */
export function calculateSanCai(kook: number): string {
  const map: Record<number, string> = { 0: '理天', 1: '理地', 2: '理人' };
  return map[(kook - 1) % 3] || '理天';
}

// ============================================================
// 太乙落宫计算
// ============================================================

/**
 * 计算太乙所在宫位
 * @param kook 局数 (1-72)
 * @param dun 阳遁/阴遁
 * @returns 宫位 (1-9, 中宫为5)
 */
export function calculateTaiYiPosition(kook: number, dun: '阳遁' | '阴遁'): number {
  const seq = dun === '阳遁' ? YANG_GONG_SEQUENCE : YIN_GONG_SEQUENCE;
  // 太乙每局移动一次，周期为8（跳过中宫）
  const idx = ((kook - 1) % 8);
  return seq[idx];
}

/**
 * 计算文昌（天目）所在
 * @param kook 局数
 * @param dun 阳遁/阴遁
 */
export function calculateSkyEyes(kook: number, dun: '阳遁' | '阴遁'): { god: string; gong: number } {
  // 文昌入局之数除以18，余数顺行十六神
  const remainder = kook % 18;
  const startIdx = dun === '阳遁'
    ? SIXTEEN_GODS.indexOf('武德')
    : SIXTEEN_GODS.indexOf('吕申');

  const godIdx = (startIdx + remainder) % 16;
  const god = SIXTEEN_GODS[godIdx];

  // 十六神对应九宫（简化映射）
  const godToGong: Record<string, number> = {
    '和德': 1, '毗乔': 2, '从卑': 3, '嵩众': 4,
    '高丛': 6, '凑': 7, '曳蜀': 8, '轩项': 9,
    '进': 1, '阳道': 2, '灵辰': 3, '浩罡': 4,
    '刑罡': 6, '大炅': 7, '启辰': 8, '少昊': 9,
  };

  return { god, gong: godToGong[god] || 1 };
}

// ============================================================
// 计神计算
// ============================================================

/**
 * 计算计神所在
 * @param kook 局数
 * @param dun 阳遁/阴遁
 * @param taiSuiZhi 太岁地支
 */
export function calculateJiGod(
  kook: number,
  dun: '阳遁' | '阴遁',
  taiSuiZhi: string,
): { god: string; zhi: string } {
  // 计神：阳遁从寅逆数，阴遁从申顺数
  const zhiIdx = DI_ZHI.indexOf(taiSuiZhi);
  let jiIdx: number;

  if (dun === '阳遁') {
    // 阳遁起吕申寅，逆行十二支
    const startIdx = DI_ZHI.indexOf('寅');
    jiIdx = (startIdx - zhiIdx + 12) % 12;
  } else {
    // 阴遁起申，顺行十二支
    const startIdx = DI_ZHI.indexOf('申');
    jiIdx = (startIdx + zhiIdx) % 12;
  }

  const resultZhi = DI_ZHI[jiIdx];
  return { god: '计神', zhi: resultZhi };
}

// ============================================================
// 始击（客目）计算
// ============================================================

/**
 * 计算始击（客目/地目）所在
 * @param jiGodZhi 计神地支
 */
export function calculateShiJi(jiGodZhi: string): { god: string; zhi: string } {
  // 以计神加于和德艮上，顺行十六神
  const zhiIdx = DI_ZHI.indexOf(jiGodZhi);
  const resultIdx = (zhiIdx + 3) % 12; // 加3位（艮位）
  return { god: '始击', zhi: DI_ZHI[resultIdx] };
}

// ============================================================
// 太乙五将计算
// ============================================================

/**
 * 计算太乙五将位置
 * @param kook 局数
 * @param dun 阳遁/阴遁
 */
export function calculateFiveGenerals(
  kook: number,
  dun: '阳遁' | '阴遁',
): {
  taiYi: { name: string; gong: number };
  zhuDa: { name: string; gong: number };
  zhuCan: { name: string; gong: number };
  keDa: { name: string; gong: number };
  keCan: { name: string; gong: number };
  dingJi: { name: string; gong: number };
} {
  const taiYiGong = calculateTaiYiPosition(kook, dun);

  // 主大将在太乙后一位
  const seq = dun === '阳遁' ? YANG_GONG_SEQUENCE : YIN_GONG_SEQUENCE;
  const tyIdx = seq.indexOf(taiYiGong);
  const zhuDaIdx = (tyIdx + 1) % 8;
  const zhuCanIdx = (tyIdx + 2) % 8;
  const keDaIdx = (tyIdx + 3) % 8;
  const keCanIdx = (tyIdx + 4) % 8;
  const dingJiIdx = (tyIdx + 5) % 8;

  return {
    taiYi: { name: '太乙', gong: taiYiGong },
    zhuDa: { name: '主大将', gong: seq[zhuDaIdx] },
    zhuCan: { name: '主参将', gong: seq[zhuCanIdx] },
    keDa: { name: '客大将', gong: seq[keDaIdx] },
    keCan: { name: '客参将', gong: seq[keCanIdx] },
    dingJi: { name: '定计将', gong: seq[dingJiIdx] },
  };
}

// ============================================================
// 阳九百六计算
// ============================================================

/**
 * 判断是否为阳九/百六灾年
 * @param year 年份
 */
export function calculateYangJiuBaiLiu(year: number): {
  isYangJiu: boolean;
  isBaiLiu: boolean;
  yangJiuInfo: string;
  baiLiuInfo: string;
  warning: string;
} {
  // 阳九：456年为一周期，百六：288年为一周期
  const YANG_JIU_CYCLE = 456;
  const BAI_LIU_CYCLE = 288;

  // 以甲子年为基准
  const BASE_YEAR = 4; // 甲子年（公元前4年约为一个甲子）
  const offset = (year - BASE_YEAR) % YANG_JIU_CYCLE;
  const offset2 = (year - BASE_YEAR) % BAI_LIU_CYCLE;

  const isYangJiu = offset === 0 || offset === YANG_JIU_CYCLE - 1;
  const isBaiLiu = offset2 === 0 || offset2 === BAI_LIU_CYCLE - 1;

  // 判断距离下次灾年
  const nextYangJiu = YANG_JIU_CYCLE - ((year - BASE_YEAR) % YANG_JIU_CYCLE);
  const nextBaiLiu = BAI_LIU_CYCLE - ((year - BASE_YEAR) % BAI_LIU_CYCLE);

  return {
    isYangJiu,
    isBaiLiu,
    yangJiuInfo: isYangJiu ? '⚠️ 阳九灾年' : `距下次阳九约${nextYangJiu}年`,
    baiLiuInfo: isBaiLiu ? '⚠️ 百六厄年' : `距下次百六约${nextBaiLiu}年`,
    warning: isYangJiu || isBaiLiu
      ? '太乙经云：阳九，奇数也，为阳数之穷；百六，偶数也，为阴数之穷。岁运值之，终有厄会。'
      : '非灾厄之年，国运平稳。',
  };
}

// ============================================================
// 主客胜负判断
// ============================================================

/**
 * 判断主客胜负
 * @param zhuDaGong 主大将宫
 * @param keDaGong 客大将宫
 * @param taiYiGong 太乙宫
 */
export function determineZhuKeOutcome(
  zhuDaGong: number,
  keDaGong: number,
  taiYiGong: number,
): {
  outcome: string;
  detail: string;
  advantage: '主' | '客' | '平';
} {
  // 根据主客大将与太乙的位置关系判断
  const zhuDiff = Math.abs(zhuDaGong - taiYiGong);
  const keDiff = Math.abs(keDaGong - taiYiGong);

  if (zhuDiff < keDiff) {
    return {
      outcome: '主方有利',
      detail: '主大将近太乙，得主位之势，宜守不宜攻。',
      advantage: '主',
    };
  } else if (keDiff < zhuDiff) {
    return {
      outcome: '客方有利',
      detail: '客大将近太乙，得客位之势，宜进击。',
      advantage: '客',
    };
  } else {
    return {
      outcome: '主客相当',
      detail: '主客大将与太乙等距，势均力敌，宜和谈。',
      advantage: '平',
    };
  }
}

// ============================================================
// 吉凶格局判断
// ============================================================

export interface TaiYiPattern {
  name: string;
  description: string;
  level: '吉' | '凶' | '平';
}

/**
 * 判断太乙格局
 */
export function determinePatterns(
  taiYiGong: number,
  skyEyesGong: number,
  shiJiGong: number,
  zhuDaGong: number,
  keDaGong: number,
): TaiYiPattern[] {
  const patterns: TaiYiPattern[] = [];

  // 掩 - 太乙在某一宫，客目/始击也在同一宫
  if (taiYiGong === shiJiGong) {
    patterns.push({
      name: '掩',
      description: '太乙与始击同宫，臣掩其君，不祥之兆。主国有内乱，君臣相忌。',
      level: '凶',
    });
  }

  // 击 - 太乙与始击对宫
  const opposite = { 1: 9, 9: 1, 2: 8, 8: 2, 3: 7, 7: 3, 4: 6, 6: 4 };
  if (opposite[taiYiGong as keyof typeof opposite] === shiJiGong) {
    patterns.push({
      name: '击',
      description: '太乙与始击对宫，将相相伐，兵戎相见。',
      level: '凶',
    });
  }

  // 迫 - 文昌/天目在太乙前一宫
  if (Math.abs(skyEyesGong - taiYiGong) === 1) {
    patterns.push({
      name: '迫',
      description: '天目迫太乙，君王需谨慎，谋臣在侧。',
      level: '凶',
    });
  }

  // 囚 - 太乙在不动之宫（四维宫：2,4,6,8）
  if ([2, 4, 6, 8].includes(taiYiGong)) {
    patterns.push({
      name: '囚',
      description: '太乙居四维之宫，如囚牢之中，谋算不成，诸事受阻。',
      level: '凶',
    });
  }

  // 关 - 主客大将同宫
  if (zhuDaGong === keDaGong) {
    patterns.push({
      name: '关',
      description: '主客大将同宫，将相相忌，权力相争。',
      level: '凶',
    });
  }

  // 格 - 主客大将对宫
  if (opposite[zhuDaGong as keyof typeof opposite] === keDaGong) {
    patterns.push({
      name: '格',
      description: '主客大将对宫，臣侮其君，以下犯上。',
      level: '凶',
    });
  }

  // 如果无凶格，则为吉
  if (patterns.length === 0) {
    patterns.push({
      name: '三才具备',
      description: '太乙居正宫，三才具备，天地人和，国运昌隆。',
      level: '吉',
    });
  }

  return patterns;
}

// ============================================================
// 二十八宿计算
// ============================================================

const TWENTY_EIGHT_STARS = [
  '角', '亢', '氐', '房', '心', '尾', '箕',
  '斗', '牛', '女', '虚', '危', '室', '壁',
  '奎', '娄', '胃', '昴', '毕', '觜', '参',
  '井', '鬼', '柳', '星', '张', '翼', '轸',
] as const;

/**
 * 计算值日二十八宿
 * @param year 年
 * @param month 月
 * @param day 日
 */
export function calculateTwentyEightStar(year: number, month: number, day: number): string {
  // 简化算法：基于日期偏移
  const date = new Date(year, month - 1, day);
  const baseDate = new Date(2000, 0, 7); // 2000年1月7日角宿值日
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const idx = ((diffDays % 28) + 28) % 28;
  return TWENTY_EIGHT_STARS[idx];
}

// ============================================================
// 纪三元计算
// ============================================================

/**
 * 计算太乙纪元
 * @param accYear 积年数
 */
export function calculateEpoch(accYear: number): {
  epoch: number;
  yuan: number;
  cycle: number;
  epochName: string;
  yuanName: string;
} {
  // 五元六纪，4560年一循环
  const CYCLE = 4560;
  const EPOCH = 360;  // 一纪
  const YUAN = 72;    // 一元

  const cycle = Math.floor(accYear / CYCLE) + 1;
  const remainder = accYear % CYCLE;
  const epoch = Math.floor((remainder % EPOCH) / 60) + 1;
  const yuan = Math.floor((remainder % YUAN) / 12) + 1;

  const epochNames = ['甲子', '丙子', '戊子', '庚子', '壬子'];
  const yuanNames = ['上元', '中元', '下元'];

  return {
    epoch,
    yuan,
    cycle,
    epochName: epochNames[(epoch - 1) % 5] || '甲子',
    yuanName: yuanNames[(yuan - 1) % 3] || '上元',
  };
}

// ============================================================
// 核心排盘入口
// ============================================================

export interface TaiYiResult {
  // 基本信息
  year: number;
  month: number;
  day: number;
  hour: number;

  // 太乙四计
  jiStyle: number;
  jiStyleName: string;

  // 积年与局数
  accYear: number;
  kook: number;
  kookText: string;

  // 阴阳遁
  dun: '阳遁' | '阴遁';

  // 三才
  sanCai: string;

  // 纪元
  epoch: { epoch: number; yuan: number; cycle: number; epochName: string; yuanName: string };

  // 太乙位置
  taiYi: { name: string; gong: number };

  // 文昌/天目
  skyEyes: { god: string; gong: number };

  // 计神
  jiGod: { god: string; zhi: string };

  // 始击/客目
  shiJi: { god: string; zhi: string };

  // 五将
  fiveGenerals: ReturnType<typeof calculateFiveGenerals>;

  // 阳九百六
  yangJiuBaiLiu: ReturnType<typeof calculateYangJiuBaiLiu>;

  // 主客胜负
  zhuKe: ReturnType<typeof determineZhuKeOutcome>;

  // 吉凶格局
  patterns: TaiYiPattern[];

  // 二十八宿
  twentyEightStar: string;

  // 宫位神将分布
  gongDistribution: Record<number, string[]>;

  // 提问
  question: string;
}

/**
 * 太乙神数核心排盘函数
 */
export function calculateTaiYi(
  year: number,
  month: number,
  day: number,
  hour: number = 12,
  jiStyle: number = 0, // 0=年计, 1=月计, 2=日计, 3=时计
  question: string = '',
): TaiYiResult {
  const jiStyleNames = ['年计', '月计', '日计', '时计'];
  const taiSuiZhi = DI_ZHI[(year - 4) % 12]; // 简化太岁计算

  // 1. 积年
  const accYear = calculateAccumulatedYear(year, 0);

  // 2. 局数
  const kook = calculateKook(accYear);

  // 3. 阴阳遁
  const dun = determineYinYang(kook, month);

  // 4. 三才
  const sanCai = calculateSanCai(kook);

  // 5. 纪元
  const epoch = calculateEpoch(accYear);

  // 6. 太乙位置
  const taiYiGong = calculateTaiYiPosition(kook, dun);

  // 7. 文昌
  const skyEyes = calculateSkyEyes(kook, dun);

  // 8. 计神
  const jiGod = calculateJiGod(kook, dun, taiSuiZhi);

  // 9. 始击
  const shiJi = calculateShiJi(jiGod.zhi);

  // 10. 五将
  const fiveGenerals = calculateFiveGenerals(kook, dun);

  // 11. 阳九百六
  const yangJiuBaiLiu = calculateYangJiuBaiLiu(year);

  // 12. 主客胜负
  const zhuKe = determineZhuKeOutcome(
    fiveGenerals.zhuDa.gong,
    fiveGenerals.keDa.gong,
    taiYiGong,
  );

  // 13. 吉凶格局
  const patterns = determinePatterns(
    taiYiGong,
    skyEyes.gong,
    fiveGenerals.keDa.gong, // 用客大将宫代替始击宫做简化
    fiveGenerals.zhuDa.gong,
    fiveGenerals.keDa.gong,
  );

  // 14. 二十八宿
  const twentyEightStar = calculateTwentyEightStar(year, month, day);

  // 15. 宫位神将分布
  const gongDistribution: Record<number, string[]> = {};
  for (let g = 1; g <= 9; g++) {
    gongDistribution[g] = [];
  }

  // 太乙
  gongDistribution[taiYiGong]?.push('太乙');
  // 文昌
  gongDistribution[skyEyes.gong]?.push('文昌');
  // 五将
  gongDistribution[fiveGenerals.zhuDa.gong]?.push('主大将');
  gongDistribution[fiveGenerals.zhuCan.gong]?.push('主参将');
  gongDistribution[fiveGenerals.keDa.gong]?.push('客大将');
  gongDistribution[fiveGenerals.keCan.gong]?.push('客参将');
  gongDistribution[fiveGenerals.dingJi.gong]?.push('定计将');

  return {
    year,
    month,
    day,
    hour,
    jiStyle,
    jiStyleName: jiStyleNames[jiStyle] || '年计',
    accYear,
    kook,
    kookText: `${dun}第${kook}局`,
    dun,
    sanCai,
    epoch,
    taiYi: fiveGenerals.taiYi,
    skyEyes,
    jiGod,
    shiJi,
    fiveGenerals,
    yangJiuBaiLiu,
    zhuKe,
    patterns,
    twentyEightStar,
    gongDistribution,
    question,
  };
}

// ============================================================
// AI国运查询限制 - 只允许国际大事
// ============================================================

const INTERNATIONAL_KEYWORDS = [
  '国运', '国家', '国际', '世界', '天下', '大国', '战争',
  '和平', '外交', '军事', '经济', '政治', '危机', '灾难',
  '疫情', '气候', '天灾', '兵戈', '战乱', '盛世', '兴衰',
  '朝代', '政权', '统治', '革命', '动乱', '恐慌', '饥荒',
  '瘟疫', '洪水', '地震', '干旱', '战乱', '入侵', '征服',
  ' America', 'China', 'Russia', 'war', 'peace', 'world',
  'global', 'nation', 'country', 'military', 'economy',
  'politics', 'crisis', 'disaster', 'climate', 'conflict',
  '中美', '中俄', '中欧', '中东', '亚太', '东亚', '北约',
  '联合国', '贸易战', '制裁', '联盟', '条约', '协定',
  '航母', '导弹', '核武', '军演', '冲突', '对峙', '谈判',
  '美元', '欧元', '日元', '人民币', '汇率', '通胀', '衰退',
  '石油', '能源', '芯片', '科技', '航天', '卫星', '网络',
  '选举', '总统', '首相', '议会', '政变', '革命', '独立',
  '分裂', '统一', '合并', '解体', '冷战', '热战', '代理人',
];

const PERSONAL_KEYWORDS = [
  '我', '我的', '本人', '自己', '家里', '家庭', '婚姻',
  '爱情', '感情', '对象', '男朋友', '女朋友', '老公', '老婆',
  '工作', '事业', '职业', '公司', '老板', '同事', '下属',
  '健康', '身体', '病', '医院', '医生', '考试', '学业',
  '学校', '孩子', '儿子', '女儿', '父母', '父亲', '母亲',
  '财运', '财富', '赚钱', '投资', '股票', '买房', '买车',
  '搬家', '旅游', '出行', '搬家', '装修', '求职', '面试',
  '创业', '合伙', '开店', '生意', '买卖', '交易', '合同',
  'I ', 'my', 'me', 'myself', 'job', 'career', 'marriage',
  'love', 'health', 'money', 'wealth', 'business', 'study',
];

/**
 * 判断问题是否与国际大事/国运相关
 * 策略：只拦截明显是个人问题的，其他都交给AI自行判断
 * @param question 用户问题
 * @returns { allowed: boolean; reason: string }
 */
export function checkNationalFortuneQuestion(question: string): {
  allowed: boolean;
  reason: string;
} {
  if (!question || question.trim().length < 2) {
    return {
      allowed: false,
      reason: '请输入您要咨询的问题。太乙神数乃三式之首，专测国家大运、天下兴衰。',
    };
  }

  const q = question.toLowerCase();

  // 只拦截明显的个人问题关键词
  const personalMatches = PERSONAL_KEYWORDS.filter(k => q.includes(k.toLowerCase()));
  if (personalMatches.length > 0) {
    return {
      allowed: false,
      reason: `【太乙神数 · 国运专占】\n\n抱歉，您的问题涉及个人隐私（"${personalMatches[0]}"），太乙神数岂能用于私事？\n\n太乙神数乃上古帝王之术，《太乙金镜式经》云：「太乙者，天帝之神也，主司国运，统摄万方。」此术专为君王设，以占天文异象、察国运人事、断战争兵阵。\n\n✦ 可问：天下大势、国际关系、战争和平、政权更迭、天灾人祸、经济兴衰\n✦ 不可问：个人命运、婚姻家庭、事业财运、身体健康\n\n请以天下为怀，重新提问。`,
    };
  }

  // 其他问题全部交给AI自行判断，不再做关键词匹配
  return { allowed: true, reason: '' };
}

// ============================================================
// 工具函数
// ============================================================

/**
 * 获取宫位对应的干支
 */
export function getGongGanZhi(gong: number): string {
  const map: Record<number, string> = {
    1: '子', 2: '未', 3: '卯', 4: '巳',
    5: '戊', 6: '亥', 7: '酉', 8: '寅', 9: '午',
  };
  return map[gong] || '';
}

/**
 * 获取宫位五行
 */
export function getGongWuxing(gong: number): string {
  const map: Record<number, string> = {
    1: '水', 2: '土', 3: '木', 4: '木',
    5: '土', 6: '金', 7: '金', 8: '土', 9: '火',
  };
  return map[gong] || '';
}

/**
 * 获取宫位吉凶
 */
export function getGongJiXiong(gong: number): string {
  const map: Record<number, string> = {
    1: '吉', 2: '凶', 3: '吉', 4: '平',
    5: '中', 6: '凶', 7: '吉', 8: '平', 9: '吉',
  };
  return map[gong] || '平';
}
