/**
 * 七政四余排盘算法
 * 参考：GitHub开源项目 qizheng-tool 及《星学大成》《果老星宗》
 * 
 * 七政：日、月、金、木、水、火、土（7颗实体星）
 * 四余：罗喉、计都、紫气、月孛（4颗虚星）
 * 共11曜
 * 
 * 排盘结构（从外到内）：
 * 1. 七政四余星圈（11曜位置）
 * 2. 二十八宿圈
 * 3. 后天十二宫
 * 4. 十二地支
 * 5. 命度中心
 */

// ==================== 常量定义 ====================

/** 七政名称 */
export const SEVEN_PLANETS = ['日', '月', '金', '木', '水', '火', '土'] as const;

/** 四余名称 */
export const FOUR_REMNANTS = ['罗喉', '计都', '紫气', '月孛'] as const;

/** 全部十一曜 */
export const ALL_STARS = [...SEVEN_PLANETS, ...FOUR_REMNANTS] as const;

/** 七政对应的颜色（荧光效果） */
export const PLANET_COLORS: Record<string, string> = {
  '日': '#FFD700', // 金黄
  '月': '#C0C0C0', // 银白
  '金': '#FF69B4', // 粉红（太白）
  '木': '#00FF7F', // 春绿（岁星）
  '水': '#87CEEB', // 天蓝（辰星）
  '火': '#FF4500', // 火红（荧惑）
  '土': '#DAA520', // 土黄（镇星）
};

/** 四余对应的颜色 */
export const REMNANT_COLORS: Record<string, string> = {
  '罗喉': '#8B0000', // 暗红
  '计都': '#4B0082', // 靛蓝
  '紫气': '#9400D3', // 紫
  '月孛': '#1E90FF', // 蓝
};

/** 二十八宿 */
export const MANSIONS28 = [
  '角', '亢', '氐', '房', '心', '尾', '箕',  // 东方青龙
  '斗', '牛', '女', '虚', '危', '室', '壁',  // 北方玄武
  '奎', '娄', '胃', '昴', '毕', '觜', '参',  // 西方白虎
  '井', '鬼', '柳', '星', '张', '翼', '轸',  // 南方朱雀
] as const;

/** 二十八宿起始黄经（古度，从角宿起算） */
export const MANSION_STARTS: number[] = [
  0, 12.87, 22.43, 38.83, 44.31, 50.58, 68.53,    // 东方
  78.12, 101.59, 108.49, 119.61, 128.62, 144.57, 162.89, // 北方
  172.23, 190.10, 202.46, 218.27, 229.35, 245.85, 245.90, // 西方
  258.08, 289.11, 291.22, 304.22, 310.53, 328.32, 348.41, // 南方
];

/** 后天十二宫名称 */
export const TWELVE_HOUSES = [
  '命宫', '财帛宫', '兄弟宫', '田宅宫', '男女宫', '奴仆宫',
  '夫妻宫', '疾厄宫', '迁移宫', '官禄宫', '福德宫', '相貌宫',
] as const;

/** 十二地支 */
export const BRANCHES12 = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/** 地支对应的黄经起始角度 */
export const BRANCH_DEGREES: Record<string, number> = {
  '子': 0, '丑': 30, '寅': 60, '卯': 90, '辰': 120, '巳': 150,
  '午': 180, '未': 210, '申': 240, '酉': 270, '戌': 300, '亥': 330,
};

/** 七政的周期（会合周期，天） */
const PLANET_PERIODS: Record<string, number> = {
  'sun': 365.25,
  'moon': 27.32,
  'mercury': 115.88, // 水星
  'venus': 583.92,   // 金星
  'mars': 779.94,    // 火星
  'jupiter': 398.88, // 木星
  'saturn': 378.09,  // 土星
};

/** 七政在J2000历元的基准黄经（2000年1月1日12:00 UTC） */
const PLANET_BASE_LONGITUDE: Record<string, number> = {
  'sun': 280.46,     // 太阳在冬至附近
  'moon': 218.32,    // 月亮
  'mercury': 252.25, // 水星
  'venus': 181.98,   // 金星
  'mars': 355.45,    // 火星
  'jupiter': 34.35,  // 木星
  'saturn': 50.08,   // 土星
};

/** 紫炁基准 */
const ZIQI_EPOCH_JD = 2188918.5622222223; // 1280年12月14日
const ZIQI_EPOCH_POS = 108.49 + 2; // 女宿2度 ≈ 110.49度
const ZIQI_YEAR_MOVE = 13.050460; // 每年移动度数

// ==================== 工具函数 ====================

/** 将日期转为儒略日（简化版） */
function toJulianDay(year: number, month: number, day: number, hour: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y
    + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
    + (hour - 12) / 24;
}

/** 角度归一化到0-360 */
function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/** 黄经转二十八宿名称 */
export function longitudeToMansion(deg: number): { name: string; du: number } {
  const d = normalizeDeg(deg);
  for (let i = 0; i < 28; i++) {
    const start = MANSION_STARTS[i];
    const end = i < 27 ? MANSION_STARTS[i + 1] : 360;
    if (d >= start && d < end) {
      return { name: MANSIONS28[i], du: Math.floor(d - start) };
    }
  }
  return { name: MANSIONS28[0], du: 0 };
}

/** 黄经转十二地支 */
export function longitudeToBranch(deg: number): string {
  const d = normalizeDeg(deg);
  const index = Math.floor(d / 30) % 12;
  // 子从0度开始
  return BRANCHES12[index];
}

/** 黄经转后天十二宫（以命宫为起点） */
export function longitudeToHouse(deg: number, mingDeg: number): string {
  const d = normalizeDeg(deg - mingDeg);
  const index = Math.floor(d / 30) % 12;
  return TWELVE_HOUSES[index];
}

// ==================== 七政计算（简化天文算法） ====================

/**
 * 计算七政黄经位置
 * 使用简化轨道模型（圆形轨道近似）
 */
function calculateSevenPlanets(jd: number): Record<string, number> {
  const daysSince2000 = jd - 2451545.0;
  const results: Record<string, number> = {};

  // 太阳：地球绕日轨道
  results['日'] = normalizeDeg(280.46 + 0.9856474 * daysSince2000);

  // 月亮：绕地轨道
  results['月'] = normalizeDeg(218.32 + 13.176396 * daysSince2000);

  // 水星
  results['水'] = normalizeDeg(252.25 + 4.0923388 * daysSince2000);

  // 金星
  results['金'] = normalizeDeg(181.98 + 1.6021302 * daysSince2000);

  // 火星
  results['火'] = normalizeDeg(355.45 + 0.524032 * daysSince2000);

  // 木星
  results['木'] = normalizeDeg(34.35 + 0.0830912 * daysSince2000);

  // 土星
  results['土'] = normalizeDeg(50.08 + 0.033444 * daysSince2000);

  return results;
}

// ==================== 四余计算 ====================

/**
 * 计算四余黄经位置
 */
function calculateFourRemnants(jd: number): Record<string, number> {
  const results: Record<string, number> = {};
  const daysSince2000 = jd - 2451545.0;

  // 罗喉 = 月亮升交点（周期约18.6年逆行一周）
  results['罗喉'] = normalizeDeg(125.08 - 0.0529538 * daysSince2000);

  // 计都 = 罗喉 + 180°
  results['计都'] = normalizeDeg(results['罗喉'] + 180);

  // 紫炁 = 授时历28年周期
  const yearsSince1280 = (jd - ZIQI_EPOCH_JD) / 365.25;
  results['紫气'] = normalizeDeg(ZIQI_EPOCH_POS + ZIQI_YEAR_MOVE * yearsSince1280);

  // 月孛 = 月亮远地点
  results['月孛'] = normalizeDeg(83.0 + 0.111404 * daysSince2000);

  return results;
}

// ==================== 命宫计算 ====================

/**
 * 计算命宫
 * 古法：看太阳在何宫，以生时加太阳宫起顺数至卯
 * @param sunDeg 太阳黄经
 * @param hour 出生时辰（0-23）
 * @returns 命宫黄经
 */
function calculateMingPalace(sunDeg: number, hour: number): number {
  // 太阳所在的地支宫
  const sunBranchIndex = Math.floor(normalizeDeg(sunDeg) / 30);
  // 时辰对应的地支索引
  const hourBranchIndex = Math.floor(((hour + 1) % 24) / 2); // 子时=0, 丑时=1, ...
  // 从太阳宫 + 时辰，顺数至卯（索引3）
  const mingBranchIndex = (sunBranchIndex + hourBranchIndex) % 12;
  // 卯对应的地支索引差
  const offset = (mingBranchIndex - 3 + 12) % 12;
  // 命宫黄经
  return normalizeDeg(sunDeg + offset * 30);
}

// ==================== 排盘结果类型 ====================

export interface QiZhengResult {
  /** 出生年 */
  year: number;
  /** 出生月 */
  month: number;
  /** 出生日 */
  day: number;
  /** 出生时 */
  hour: number;
  /** 儒略日 */
  julianDay: number;
  /** 七政位置 {星名: 黄经} */
  planets: Record<string, number>;
  /** 四余位置 {星名: 黄经} */
  remnants: Record<string, number>;
  /** 命宫黄经 */
  mingPalace: number;
  /** 命宫地支 */
  mingBranch: string;
  /** 命宫二十八宿 */
  mingMansion: string;
  /** 命度（命宫的精确度数） */
  mingDegree: number;
  /** 各星在十二宫中的分布 */
  houseDistribution: Record<string, string>; // 星名 -> 宫位
  /** 二十八宿分布 */
  mansionDistribution: Record<string, { mansion: string; du: number }>; // 星名 -> {宿名, 宿度}
  /** 十二宫信息 */
  houses: Array<{
    name: string;
    branch: string;
    startDeg: number;
    endDeg: number;
    planets: string[]; // 落入此宫的星
  }>;
}

// ==================== 主排盘函数 ====================

/**
 * 七政四余排盘主函数
 */
export function calculateQiZhengSiYu(
  year: number,
  month: number,
  day: number,
  hour: number,
): QiZhengResult {
  // 1. 计算儒略日
  const jd = toJulianDay(year, month, day, hour);

  // 2. 计算七政位置
  const planets = calculateSevenPlanets(jd);

  // 3. 计算四余位置
  const remnants = calculateFourRemnants(jd);

  // 4. 计算命宫
  const mingPalace = calculateMingPalace(planets['日'], hour);
  const mingBranch = longitudeToBranch(mingPalace);
  const mingMansionInfo = longitudeToMansion(mingPalace);

  // 5. 计算十二宫
  const houses = TWELVE_HOUSES.map((name, i) => {
    const startDeg = normalizeDeg(mingPalace + i * 30);
    const endDeg = normalizeDeg(startDeg + 30);
    return {
      name,
      branch: longitudeToBranch(startDeg),
      startDeg,
      endDeg,
      planets: [] as string[],
    };
  });

  // 6. 分配星到各宫
  const houseDistribution: Record<string, string> = {};
  const mansionDistribution: Record<string, { mansion: string; du: number }> = {};

  // 七政
  for (const [star, deg] of Object.entries(planets)) {
    const houseName = longitudeToHouse(deg, mingPalace);
    houseDistribution[star] = houseName;
    mansionDistribution[star] = longitudeToMansion(deg);
    const house = houses.find(h => h.name === houseName);
    if (house) house.planets.push(star);
  }

  // 四余
  for (const [star, deg] of Object.entries(remnants)) {
    const houseName = longitudeToHouse(deg, mingPalace);
    houseDistribution[star] = houseName;
    mansionDistribution[star] = longitudeToMansion(deg);
    const house = houses.find(h => h.name === houseName);
    if (house) house.planets.push(star);
  }

  return {
    year,
    month,
    day,
    hour,
    julianDay: jd,
    planets,
    remnants,
    mingPalace,
    mingBranch,
    mingMansion: mingMansionInfo.name,
    mingDegree: mingPalace,
    houseDistribution,
    mansionDistribution,
    houses,
  };
}

// ==================== 星情描述 ====================

/** 七政星情（用于AI提示词） */
export const PLANET_DESCRIPTIONS: Record<string, string> = {
  '日': '太阳，万星之主，代表君王、父亲、权威、光明、福寿',
  '月': '太阴，后妃之母，代表母亲、妻子、温柔、财帛、变化',
  '金': '太白金星，西方白虎之精，代表义气、决断、武勇、音乐',
  '木': '岁星，东方青龙之精，代表仁德、生长、学问、官禄',
  '水': '辰星，北方玄武之精，代表智慧、谋略、口才、技艺',
  '火': '荧惑，南方朱雀之精，代表礼法、急躁、兵戈、血光',
  '土': '镇星，中央戊己之精，代表道德、诚信、田宅、稳重',
};

/** 四余星情 */
export const REMNANT_DESCRIPTIONS: Record<string, string> = {
  '罗喉': '天首，暗曜之首，性猛烈，主灾祸、劫难、意外',
  '计都': '天尾，与罗喉相对，主阴暗、小人、口舌是非',
  '紫气': '木之余气，性仁慈，主福德、贵人、祥瑞',
  '月孛': '水之余气，性淫邪，主桃花、欲望、情感纠葛',
};

/** 宫位含义 */
export const HOUSE_MEANINGS: Record<string, string> = {
  '命宫': '命主自身、性格、命运、寿夭',
  '财帛宫': '财富、收入、理财能力',
  '兄弟宫': '兄弟姐妹、朋友、同事',
  '田宅宫': '不动产、家宅、祖业',
  '男女宫': '子女、后代、创造力',
  '奴仆宫': '下属、佣人、合作关系',
  '夫妻宫': '婚姻、配偶、感情',
  '疾厄宫': '健康、疾病、灾厄',
  '迁移宫': '外出、旅行、变迁',
  '官禄宫': '事业、功名、社会地位',
  '福德宫': '福气、精神、修为',
  '相貌宫': '外貌、仪表、气质',
};

/** 二十八宿吉凶 */
export const MANSION_LUCK: Record<string, '吉' | '凶' | '平'> = {
  '角': '吉', '亢': '凶', '氐': '平', '房': '吉', '心': '凶', '尾': '吉', '箕': '吉',
  '斗': '平', '牛': '凶', '女': '吉', '虚': '凶', '危': '凶', '室': '吉', '壁': '吉',
  '奎': '平', '娄': '吉', '胃': '凶', '昴': '凶', '毕': '吉', '觜': '凶', '参': '吉',
  '井': '凶', '鬼': '凶', '柳': '吉', '星': '吉', '张': '吉', '翼': '平', '轸': '吉',
};
