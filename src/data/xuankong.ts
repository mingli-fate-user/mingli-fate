// ============================================================
// 玄空飞星排盘核心算法
// 参考: 无常派玄空飞星排盘法
// ============================================================

// 九星名称
export const NINE_STARS = [
  { num: 1, name: '一白', wuxing: '水', type: '吉', nature: '贪狼', desc: '官星，主智慧、文章、功名' },
  { num: 2, name: '二黑', wuxing: '土', type: '凶', nature: '巨门', desc: '病符，主疾病、是非、破财' },
  { num: 3, name: '三碧', wuxing: '木', type: '凶', nature: '禄存', desc: '蚩尤，主刑伤、官非、口舌' },
  { num: 4, name: '四绿', wuxing: '木', type: '平', nature: '文曲', desc: '文昌，主科名、文艺、桃花' },
  { num: 5, name: '五黄', wuxing: '土', type: '凶', nature: '廉贞', desc: '大煞，主灾祸、重病、破财' },
  { num: 6, name: '六白', wuxing: '金', type: '吉', nature: '武曲', desc: '财星，主偏财、权力、贵人' },
  { num: 7, name: '七赤', wuxing: '金', type: '凶', nature: '破军', desc: '贼星，主盗抢、口舌、刀光' },
  { num: 8, name: '八白', wuxing: '土', type: '吉', nature: '左辅', desc: '当运财星，主正财、富贵、地产' },
  { num: 9, name: '九紫', wuxing: '火', type: '吉', nature: '右弼', desc: '喜星，主喜庆、桃花、名声' },
] as const;

// 二十四山
export const TWENTY_FOUR_MOUNTAINS = [
  // 坎卦（北）
  { name: '壬', gong: 1, trigram: '坎', direction: '北', yuanLong: '地元龙', yinYang: '阳' },
  { name: '子', gong: 1, trigram: '坎', direction: '北', yuanLong: '天元龙', yinYang: '阴' },
  { name: '癸', gong: 1, trigram: '坎', direction: '北', yuanLong: '人元龙', yinYang: '阴' },
  // 艮卦（东北）
  { name: '丑', gong: 8, trigram: '艮', direction: '东北', yuanLong: '地元龙', yinYang: '阴' },
  { name: '艮', gong: 8, trigram: '艮', direction: '东北', yuanLong: '天元龙', yinYang: '阳' },
  { name: '寅', gong: 8, trigram: '艮', direction: '东北', yuanLong: '人元龙', yinYang: '阳' },
  // 震卦（东）
  { name: '甲', gong: 3, trigram: '震', direction: '东', yuanLong: '地元龙', yinYang: '阳' },
  { name: '卯', gong: 3, trigram: '震', direction: '东', yuanLong: '天元龙', yinYang: '阴' },
  { name: '乙', gong: 3, trigram: '震', direction: '东', yuanLong: '人元龙', yinYang: '阴' },
  // 巽卦（东南）
  { name: '辰', gong: 4, trigram: '巽', direction: '东南', yuanLong: '地元龙', yinYang: '阴' },
  { name: '巽', gong: 4, trigram: '巽', direction: '东南', yuanLong: '天元龙', yinYang: '阳' },
  { name: '巳', gong: 4, trigram: '巽', direction: '东南', yuanLong: '人元龙', yinYang: '阳' },
  // 离卦（南）
  { name: '丙', gong: 9, trigram: '离', direction: '南', yuanLong: '地元龙', yinYang: '阳' },
  { name: '午', gong: 9, trigram: '离', direction: '南', yuanLong: '天元龙', yinYang: '阴' },
  { name: '丁', gong: 9, trigram: '离', direction: '南', yuanLong: '人元龙', yinYang: '阴' },
  // 坤卦（西南）
  { name: '未', gong: 2, trigram: '坤', direction: '西南', yuanLong: '地元龙', yinYang: '阴' },
  { name: '坤', gong: 2, trigram: '坤', direction: '西南', yuanLong: '天元龙', yinYang: '阳' },
  { name: '申', gong: 2, trigram: '坤', direction: '西南', yuanLong: '人元龙', yinYang: '阳' },
  // 兑卦（西）
  { name: '庚', gong: 7, trigram: '兑', direction: '西', yuanLong: '地元龙', yinYang: '阳' },
  { name: '酉', gong: 7, trigram: '兑', direction: '西', yuanLong: '天元龙', yinYang: '阴' },
  { name: '辛', gong: 7, trigram: '兑', direction: '西', yuanLong: '人元龙', yinYang: '阴' },
  // 乾卦（西北）
  { name: '戌', gong: 6, trigram: '乾', direction: '西北', yuanLong: '地元龙', yinYang: '阴' },
  { name: '乾', gong: 6, trigram: '乾', direction: '西北', yuanLong: '天元龙', yinYang: '阳' },
  { name: '亥', gong: 6, trigram: '乾', direction: '西北', yuanLong: '人元龙', yinYang: '阳' },
] as const;

// 九宫飞星轨迹（洛书顺序）
const GONG_ORDER = [5, 6, 7, 8, 9, 1, 2, 3, 4]; // 中→乾→兑→艮→离→坎→坤→震→巽

// 九宫方位名
export const GONG_NAMES: Record<number, { name: string; direction: string; wuxing: string }> = {
  1: { name: '坎宫', direction: '北', wuxing: '水' },
  2: { name: '坤宫', direction: '西南', wuxing: '土' },
  3: { name: '震宫', direction: '东', wuxing: '木' },
  4: { name: '巽宫', direction: '东南', wuxing: '木' },
  5: { name: '中宫', direction: '中', wuxing: '土' },
  6: { name: '乾宫', direction: '西北', wuxing: '金' },
  7: { name: '兑宫', direction: '西', wuxing: '金' },
  8: { name: '艮宫', direction: '东北', wuxing: '土' },
  9: { name: '离宫', direction: '南', wuxing: '火' },
};

// 三元九运
export const YUAN_YUN = {
  upper: { name: '上元', yuns: [1, 2, 3] },
  middle: { name: '中元', yuns: [4, 5, 6] },
  lower: { name: '下元', yuns: [7, 8, 9] },
};

// 运期年份映射
export function getYunByYear(year: number): number {
  const yunMap: Record<number, [number, number][]> = {
    1: [[1864, 1883]],
    2: [[1884, 1903]],
    3: [[1904, 1923]],
    4: [[1924, 1943]],
    5: [[1944, 1963]],
    6: [[1964, 1983]],
    7: [[1984, 2003]],
    8: [[2004, 2023]],
    9: [[2024, 2043]],
  };
  for (const [yun, ranges] of Object.entries(yunMap)) {
    for (const [start, end] of ranges) {
      if (year >= start && year <= end) return Number(yun);
    }
  }
  // 超过2043年的循环
  const cycleYear = ((year - 1864) % 180);
  if (cycleYear < 60) return Math.floor(cycleYear / 20) + 1;
  if (cycleYear < 120) return Math.floor((cycleYear - 60) / 20) + 4;
  return Math.floor((cycleYear - 120) / 20) + 7;
}

export function getYuanByYun(yun: number): string {
  if (yun <= 3) return '上元';
  if (yun <= 6) return '中元';
  return '下元';
}

// 获取运期名称
export function getYunName(yun: number): string {
  const names: Record<number, string> = {
    1: '一运', 2: '二运', 3: '三运', 4: '四运', 5: '五运',
    6: '六运', 7: '七运', 8: '八运', 9: '九运',
  };
  return names[yun] || `${yun}运`;
}

// ============================================================
// 顺飞 / 逆飞
// ============================================================

/**
 * 顺飞九宫
 * @param startStar 入中宫的星数
 */
export function flyForward(startStar: number): Record<number, number> {
  const result: Record<number, number> = {};
  for (let i = 0; i < 9; i++) {
    const star = ((startStar - 1 + i) % 9) + 1;
    result[GONG_ORDER[i]] = star;
  }
  return result;
}

/**
 * 逆飞九宫
 * @param startStar 入中宫的星数
 */
export function flyBackward(startStar: number): Record<number, number> {
  const result: Record<number, number> = {};
  for (let i = 0; i < 9; i++) {
    const star = ((startStar - 1 - i + 9) % 9) + 1;
    result[GONG_ORDER[i]] = star;
  }
  return result;
}

// ============================================================
// 运盘排法
// ============================================================

/**
 * 排运盘（当运之星入中宫顺飞）
 * @param yun 运数 (1-9)
 */
export function createYunPan(yun: number): Record<number, number> {
  return flyForward(yun);
}

// ============================================================
// 山盘排法
// ============================================================

/**
 * 排山盘
 * @param yunPan 运盘
 * @param zuoShan 坐山（二十四山之一）
 */
export function createShanPan(
  yunPan: Record<number, number>,
  zuoShan: string,
): Record<number, number> {
  const mountain = TWENTY_FOUR_MOUNTAINS.find(m => m.name === zuoShan);
  if (!mountain) throw new Error(`未知坐山: ${zuoShan}`);

  // 1. 找到坐山所在宫位的运盘星数
  const yunStar = yunPan[mountain.gong];

  // 2. 根据坐山的三元龙阴阳决定顺逆
  const isYang = mountain.yinYang === '阳';

  // 3. 以运盘星数入中宫，按坐山阴阳顺逆飞
  return isYang ? flyForward(yunStar) : flyBackward(yunStar);
}

// ============================================================
// 向盘排法
// ============================================================

/**
 * 排向盘
 * @param yunPan 运盘
 * @param xiang 朝向（二十四山之一）
 */
export function createXiangPan(
  yunPan: Record<number, number>,
  xiang: string,
): Record<number, number> {
  const direction = TWENTY_FOUR_MOUNTAINS.find(m => m.name === xiang);
  if (!direction) throw new Error(`未知向方: ${xiang}`);

  // 1. 找到向方所在宫位的运盘星数
  const yunStar = yunPan[direction.gong];

  // 2. 根据向方的三元龙阴阳决定顺逆
  const isYang = direction.yinYang === '阳';

  // 3. 以运盘星数入中宫，按向方阴阳顺逆飞
  return isYang ? flyForward(yunStar) : flyBackward(yunStar);
}

// ============================================================
// 完整排盘
// ============================================================

export interface XuanKongResult {
  year: number;
  yun: number;
  yunName: string;
  yuan: string;
  zuoShan: string;
  xiang: string;
  zuoShanGong: number;
  xiangGong: number;
  yunPan: Record<number, number>;
  shanPan: Record<number, number>;
  xiangPan: Record<number, number>;
  combinedPan: Record<number, { yun: number; shan: number; xiang: number }>;
  isDaoShanDaoXiang: boolean;
  isShangShanXiaShui: boolean;
  isFuYin: boolean;
  patterns: Array<{ name: string; desc: string; level: '吉' | '凶' | '平' }>;
  starAnalysis: Record<number, string>;
}

/**
 * 玄空飞星完整排盘
 */
export function calculateXuanKong(
  year: number,
  zuoShan: string,
  xiang: string,
): XuanKongResult {
  const yun = getYunByYear(year);
  const yuan = getYuanByYun(yun);
  const yunName = getYunName(yun);

  // 排三盘
  const yunPan = createYunPan(yun);
  const shanPan = createShanPan(yunPan, zuoShan);
  const xiangPan = createXiangPan(yunPan, xiang);

  // 获取坐山和向方的宫位
  const zuoShanData = TWENTY_FOUR_MOUNTAINS.find(m => m.name === zuoShan)!;
  const xiangData = TWENTY_FOUR_MOUNTAINS.find(m => m.name === xiang)!;
  const zuoShanGong = zuoShanData.gong;
  const xiangGong = xiangData.gong;

  // 合并三盘
  const combinedPan: Record<number, { yun: number; shan: number; xiang: number }> = {};
  for (const g of GONG_ORDER) {
    combinedPan[g] = { yun: yunPan[g], shan: shanPan[g], xiang: xiangPan[g] };
  }

  // 判断格局
  const isDaoShanDaoXiang = shanPan[zuoShanGong] === yun && xiangPan[xiangGong] === yun;
  const isShangShanXiaShui = shanPan[xiangGong] === yun && xiangPan[zuoShanGong] === yun;
  const isFuYin = Object.entries(shanPan).every(([g, s]) => s === yunPan[Number(g)]);

  // 分析格局
  const patterns: Array<{ name: string; desc: string; level: '吉' | '凶' | '平' }> = [];

  if (isDaoShanDaoXiang) {
    patterns.push({
      name: '到山到向',
      desc: '当运旺星飞到坐山和向方本位，主丁财两旺，大吉之局。',
      level: '吉',
    });
  }

  if (isShangShanXiaShui) {
    patterns.push({
      name: '上山下水',
      desc: '当运旺星反处，山星到向、向星到山，主损丁破财，大凶之局。',
      level: '凶',
    });
  }

  if (isFuYin) {
    patterns.push({
      name: '伏吟',
      desc: '山盘与运盘星数完全相同，主凡事不利，不宜妄动。',
      level: '凶',
    });
  }

  // 双星到山/向分析
  const shanAtZuo = shanPan[zuoShanGong];
  const xiangAtZuo = xiangPan[zuoShanGong];
  const shanAtXiang = shanPan[xiangGong];
  const xiangAtXiang = xiangPan[xiangGong];

  if (shanAtZuo === xiangAtZuo && shanAtZuo === yun) {
    patterns.push({
      name: '双星到山',
      desc: '当运旺星齐聚坐山，主人丁大旺但财运稍弱。',
      level: '平',
    });
  }

  if (xiangAtXiang === shanPan[xiangGong] && xiangAtXiang === yun) {
    patterns.push({
      name: '双星到向',
      desc: '当运旺星齐聚向方，主财运大旺但人丁稍弱。',
      level: '平',
    });
  }

  // 五黄分析
  for (const g of GONG_ORDER) {
    if (shanPan[g] === 5) {
      patterns.push({
        name: `五黄到${GONG_NAMES[g]?.name || ''}`,
        desc: '五黄大煞临山盘，主灾祸、重病，宜化解。',
        level: '凶',
      });
    }
    if (xiangPan[g] === 5) {
      patterns.push({
        name: `五黄到${GONG_NAMES[g]?.name || ''}向`,
        desc: '五黄大煞临向盘，主破财、灾祸，宜化解。',
        level: '凶',
      });
    }
  }

  // 各宫星曜分析
  const starAnalysis: Record<number, string> = {};
  for (const g of GONG_ORDER) {
    const s = shanPan[g];
    const x = xiangPan[g];
    const y = yunPan[g];
    const starS = NINE_STARS.find(ns => ns.num === s)!;
    const starX = NINE_STARS.find(ns => ns.num === x)!;

    let analysis = '';
    // 山星分析（人丁）
    if (s === yun) analysis += '山星当运旺丁；';
    else if (starS.type === '吉') analysis += '山星吉星照临；';
    else if (starS.num === 5) analysis += '⚠五黄煞临山；';

    // 向星分析（财运）
    if (x === yun) analysis += '向星当运旺财；';
    else if (starX.type === '吉') analysis += '向星吉星照临；';
    else if (starX.num === 5) analysis += '⚠五黄煞临向；';

    starAnalysis[g] = analysis || '星曜平和，无大起大落';
  }

  return {
    year,
    yun,
    yunName,
    yuan,
    zuoShan,
    xiang,
    zuoShanGong,
    xiangGong,
    yunPan,
    shanPan,
    xiangPan,
    combinedPan,
    isDaoShanDaoXiang,
    isShangShanXiaShui,
    isFuYin,
    patterns,
    starAnalysis,
  };
}

// ============================================================
// 户型房间类型与风水分析映射
// ============================================================

export const ROOM_TYPES = [
  { id: 'bedroom', name: '卧室', icon: '🛏️', wuxing: '木', color: '#4ade80' },
  { id: 'living', name: '客厅', icon: '🛋️', wuxing: '火', color: '#f472b6' },
  { id: 'kitchen', name: '厨房', icon: '🍳', wuxing: '火', color: '#f97316' },
  { id: 'bathroom', name: '卫生间', icon: '🚿', wuxing: '水', color: '#3b82f6' },
  { id: 'balcony', name: '阳台', icon: '🌿', wuxing: '木', color: '#22c55e' },
  { id: 'study', name: '书房', icon: '📚', wuxing: '木', color: '#a78bfa' },
  { id: 'door', name: '大门', icon: '🚪', wuxing: '金', color: '#fbbf24' },
  { id: 'window', name: '窗户', icon: '🪟', wuxing: '金', color: '#67e8f9' },
  { id: 'storage', name: '储物间', icon: '📦', wuxing: '土', color: '#a8a29e' },
  { id: 'dining', name: '餐厅', icon: '🍽️', wuxing: '土', color: '#fb923c' },
  { id: 'stairs', name: '楼梯', icon: '📶', wuxing: '土', color: '#d97706' },
] as const;

// 宫位对应的风水建议
export function getFengShuiAdvice(gong: number, shanStar: number, xiangStar: number): string {
  const advices: Record<number, string> = {
    1: '坎宫属水，宜摆放金属摆件以金生水，忌土性过重。',
    2: '坤宫属土，宜摆放陶瓷、玉石等土性物品，忌木性过重。',
    3: '震宫属木，宜摆放绿植、木质家具，忌金性过重。',
    4: '巽宫属木，宜摆放文竹、书画，忌金性过重。',
    5: '中宫属土，宜保持整洁空旷，忌堆放杂物。',
    6: '乾宫属金，宜摆放金属摆件、白色装饰，忌火性过重。',
    7: '兑宫属金，宜摆放金属、白色物品，忌火性过重。',
    8: '艮宫属土，宜摆放山石、陶瓷，忌木性过重。',
    9: '离宫属火，宜摆放红色装饰、灯具，忌水性过重。',
  };
  return advices[gong] || '';
}

// 根据户型数据生成风水分析报告数据
export interface RoomLayout {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  gong?: number; // 所在的宫位
}

export interface HouseLayout {
  id: string;
  name: string;
  rooms: RoomLayout[];
  compassRotation: number; // 罗盘旋转角度（0-360）
  createdAt: string;
}

/**
 * 根据房间位置和户型中心，计算房间所在的宫位
 */
export function calculateRoomGong(
  room: RoomLayout,
  centerX: number,
  centerY: number,
): number {
  const dx = (room.x + room.width / 2) - centerX;
  const dy = (room.y + room.height / 2) - centerY;

  // 计算角度（度数）
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle < 0) angle += 360;

  // 将角度映射到九宫（按后天八卦方位）
  // 0°=东, 90°=南, 180°=西, 270°=北
  // 九宫方位划分（每个宫45°，从东北开始）
  // 艮(东北): 337.5-22.5 → 8
  // 震(东): 22.5-67.5 → 3
  // 巽(东南): 67.5-112.5 → 4
  // 离(南): 112.5-157.5 → 9
  // 坤(西南): 157.5-202.5 → 2
  // 兑(西): 202.5-247.5 → 7
  // 乾(西北): 247.5-292.5 → 6
  // 坎(北): 292.5-337.5 → 1

  const gongMap: Array<[number, number, number]> = [
    [337.5, 22.5, 8],   // 艮（东北）
    [22.5, 67.5, 3],    // 震（东）
    [67.5, 112.5, 4],   // 巽（东南）
    [112.5, 157.5, 9],  // 离（南）
    [157.5, 202.5, 2],  // 坤（西南）
    [202.5, 247.5, 7],  // 兑（西）
    [247.5, 292.5, 6],  // 乾（西北）
    [292.5, 337.5, 1],  // 坎（北）
  ];

  for (const [start, end, gong] of gongMap) {
    if (start > end) {
      // 跨越0°的情况（艮宫）
      if (angle >= start || angle < end) return gong;
    } else {
      if (angle >= start && angle < end) return gong;
    }
  }

  return 5; // 默认中宫
}
