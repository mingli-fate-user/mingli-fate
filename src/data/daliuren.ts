// ============================================================
// 大六壬排盘核心算法 - 人事之王，三式之最
// 参考: kentang2017/kinliuren (GitHub开源项目)
// ============================================================

// 十二地支
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

// 六十甲子
export function generateJiaZi(): string[] {
  const result: string[] = [];
  for (let i = 0; i < 60; i++) {
    result.push(TIAN_GAN[i % 10] + DI_ZHI[i % 12]);
  }
  return result;
}
export const JIA_ZI = generateJiaZi();

// 十干寄宫
export const GAN_JI_GONG: Record<string, string> = {
  '甲': '寅', '乙': '辰', '丙': '巳', '戊': '巳',
  '丁': '未', '己': '未', '庚': '申', '辛': '戌',
  '壬': '亥', '癸': '丑',
};

// 十二月将
export const YUE_JIANGS = [
  { name: '登明', zhi: '亥', months: [1, 2], jieQi: '大寒-雨水' },
  { name: '河魁', zhi: '戌', months: [2, 3], jieQi: '雨水-春分' },
  { name: '从魁', zhi: '酉', months: [3, 4], jieQi: '春分-谷雨' },
  { name: '传送', zhi: '申', months: [4, 5], jieQi: '谷雨-小满' },
  { name: '小吉', zhi: '未', months: [5, 6], jieQi: '小满-夏至' },
  { name: '胜光', zhi: '午', months: [6, 7], jieQi: '夏至-大暑' },
  { name: '太乙', zhi: '巳', months: [7, 8], jieQi: '大暑-处暑' },
  { name: '天罡', zhi: '辰', months: [8, 9], jieQi: '处暑-秋分' },
  { name: '太冲', zhi: '卯', months: [9, 10], jieQi: '秋分-霜降' },
  { name: '功曹', zhi: '寅', months: [10, 11], jieQi: '霜降-小雪' },
  { name: '大吉', zhi: '丑', months: [11, 12], jieQi: '小雪-冬至' },
  { name: '神后', zhi: '子', months: [12, 1], jieQi: '冬至-大寒' },
] as const;

// 十二天将
export const TIAN_JIANGS = [
  { name: '贵人', wuxing: '土', desc: '众神之主，解危扶困', nature: '吉' },
  { name: '螣蛇', wuxing: '火', desc: '虚惊怪异，缠绕不宁', nature: '凶' },
  { name: '朱雀', wuxing: '火', desc: '口舌文书，是非诉讼', nature: '平' },
  { name: '六合', wuxing: '木', desc: '和合婚姻，中介合作', nature: '吉' },
  { name: '勾陈', wuxing: '土', desc: '阻滞田土，牵连斗讼', nature: '凶' },
  { name: '青龙', wuxing: '木', desc: '喜庆财帛，官贵福德', nature: '大吉' },
  { name: '天空', wuxing: '土', desc: '虚伪空亡，奏书之神', nature: '凶' },
  { name: '白虎', wuxing: '金', desc: '凶丧兵戈，血光疾病', nature: '大凶' },
  { name: '太常', wuxing: '土', desc: '衣禄酒食，文章印绶', nature: '吉' },
  { name: '玄武', wuxing: '水', desc: '盗贼暗昧，阴谋狡诈', nature: '凶' },
  { name: '太阴', wuxing: '金', desc: '阴私蔽匿，暗中助力', nature: '平' },
  { name: '天后', wuxing: '水', desc: '妇女阴私，恩泽庇护', nature: '吉' },
] as const;

// 贵人诀
export const GUI_REN_JUE: Record<string, [string, string]> = {
  '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
  '乙': ['子', '申'], '己': ['子', '申'],
  '丙': ['亥', '酉'], '丁': ['亥', '酉'],
  '壬': ['卯', '巳'], '癸': ['卯', '巳'],
  '辛': ['午', '寅'],
};

// 六亲关系
export function getLiuQin(dayGan: string, targetGan: string): string {
  const ganWuxing: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  };
  const wxSheng: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const wxKe: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };

  const dayWx = ganWuxing[dayGan];
  const targetWx = ganWuxing[targetGan];
  if (!dayWx || !targetWx) return '比肩';

  if (targetWx === dayWx) return '比肩';
  if (wxSheng[dayWx] === targetWx) return '子孙';
  if (wxSheng[targetWx] === dayWx) return '父母';
  if (wxKe[dayWx] === targetWx) return '妻财';
  if (wxKe[targetWx] === dayWx) return '官鬼';
  return '比肩';
}

// 获取地支索引
function zhiIdx(zhi: string): number { return DI_ZHI.indexOf(zhi); }

// 获取地支（带循环）
function zhiAt(idx: number): string { return DI_ZHI[(idx % 12 + 12) % 12]; }

// ============================================================
// 月将计算
// ============================================================
export function getYueJiang(month: number, day: number): { name: string; zhi: string } {
  // 简化版：根据月份直接取月将（以中气为界）
  const jiangMap: Record<number, string> = {
    1: '丑', 2: '子', 3: '亥', 4: '戌', 5: '酉', 6: '申',
    7: '未', 8: '午', 9: '巳', 10: '辰', 11: '卯', 12: '寅',
  };
  const zhi = jiangMap[month] || '子';
  const jiang = YUE_JIANGS.find(y => y.zhi === zhi);
  return { name: jiang?.name || '神后', zhi };
}

// ============================================================
// 排天地盘
// ============================================================
export interface TianDiPan {
  diPan: string[];      // 地盘（固定）
  tianPan: string[];    // 天盘（月将加时）
  yueJiang: string;     // 月将地支
  zhanShi: string;      // 占时地支
}

export function createTianDiPan(
  yueJiangZhi: string,
  zhanShiZhi: string,
): TianDiPan {
  // 地盘固定：子丑寅卯辰巳午未申酉戌亥
  const diPan = [...DI_ZHI];

  // 天盘：月将加在占时之上，然后顺排
  const tianPan: string[] = new Array(12);
  const yjIdx = zhiIdx(yueJiangZhi);
  const zsIdx = zhiIdx(zhanShiZhi);

  // 将月将放在占时的位置，然后依次顺排
  for (let i = 0; i < 12; i++) {
    // 天盘第zsIdx位置 = 月将
    // 然后顺时针依次排
    const tianPanZhi = zhiAt(yjIdx + i);
    const position = (zsIdx + i) % 12;
    tianPan[position] = tianPanZhi;
  }

  return { diPan, tianPan, yueJiang: yueJiangZhi, zhanShi: zhanShiZhi };
}

// ============================================================
// 排四课
// ============================================================
export interface SiKe {
  ke1: [string, string]; // 第一课：日干 + 干上神（天盘）
  ke2: [string, string]; // 第二课：干上神 + 神上神
  ke3: [string, string]; // 第三课：日支 + 支上神
  ke4: [string, string]; // 第四课：支上神 + 神上神
}

export function createSiKe(
  dayGan: string,
  dayZhi: string,
  tianDiPan: TianDiPan,
): SiKe {
  // 日干寄宫
  const ganGong = GAN_JI_GONG[dayGan] || '寅';
  const ganGongIdx = zhiIdx(ganGong);

  // 第一课：日干 + 干寄宫上的天盘
  const ke1Lower = dayGan;
  const ke1Upper = tianDiPan.tianPan[ganGongIdx];

  // 第二课：干上神所在宫的天盘
  const ke1UpperIdx = zhiIdx(ke1Upper);
  const ke2Upper = tianDiPan.tianPan[ke1UpperIdx];

  // 第三课：日支 + 支上神
  const dayZhiIdx = zhiIdx(dayZhi);
  const ke3Upper = tianDiPan.tianPan[dayZhiIdx];

  // 第四课：支上神所在宫的天盘
  const ke3UpperIdx = zhiIdx(ke3Upper);
  const ke4Upper = tianDiPan.tianPan[ke3UpperIdx];

  return {
    ke1: [ke1Upper, ke1Lower],
    ke2: [ke2Upper, ke1Upper],
    ke3: [ke3Upper, dayZhi],
    ke4: [ke4Upper, ke3Upper],
  };
}

// ============================================================
// 起贵人排十二天将
// ============================================================
export interface ShiErJiang {
  guiRen: string;       // 贵人所在地支
  isShun: boolean;      // 顺行/逆行
  jiangs: Array<{ name: string; zhi: string; wuxing: string; nature: string }>;
}

export function createShiErJiang(
  dayGan: string,
  zhanShiZhi: string,
  tianPan: string[],
): ShiErJiang {
  const gr = GUI_REN_JUE[dayGan];
  if (!gr) return { guiRen: '丑', isShun: true, jiangs: [] };

  // 判断昼夜贵人（简化：根据占时地支，卯酉分昼夜）
  const zsIdx = zhiIdx(zhanShiZhi);
  const isDay = zsIdx >= 2 && zsIdx <= 7; // 寅到申为昼
  const guiRenZhi = isDay ? gr[0] : gr[1];
  const guiRenIdx = zhiIdx(guiRenZhi);

  // 判断贵人顺逆：从卯到申为顺，酉到寅为逆
  const isShun = zsIdx >= 2 && zsIdx <= 7;

  // 排十二天将
  const jiangs: Array<{ name: string; zhi: string; wuxing: string; nature: string }> = [];
  for (let i = 0; i < 12; i++) {
    const tj = TIAN_JIANGS[i];
    let zhi: string;
    if (isShun) {
      zhi = tianPan[(guiRenIdx + i) % 12];
    } else {
      zhi = tianPan[(guiRenIdx - i + 12) % 12];
    }
    jiangs.push({ name: tj.name, zhi, wuxing: tj.wuxing, nature: tj.nature });
  }

  return { guiRen: guiRenZhi, isShun, jiangs };
}

// ============================================================
// 三传推导（简化版 - 贼克法为主）
// ============================================================
export interface SanChuan {
  chu: { zhi: string; jiang: string; liuQin: string; desc: string };   // 初传
  zhong: { zhi: string; jiang: string; liuQin: string; desc: string };  // 中传
  mo: { zhi: string; jiang: string; liuQin: string; desc: string };     // 末传
  method: string; // 起传方法
}

export function createSanChuan(
  siKe: SiKe,
  tianDiPan: TianDiPan,
  shiErJiang: ShiErJiang,
  dayGan: string,
): SanChuan {
  // 提取四课的上神
  const shangShens = [siKe.ke1[0], siKe.ke2[0], siKe.ke3[0], siKe.ke4[0]];

  // 贼克法：找下克上（贼）或上克下（克）
  let chuZhi = '';
  let method = '';

  // 先找下克上（贼）
  const kePairs = [
    [siKe.ke1[1], siKe.ke1[0]], // 下, 上
    [siKe.ke2[1], siKe.ke2[0]],
    [siKe.ke3[1], siKe.ke3[0]],
    [siKe.ke4[1], siKe.ke4[0]],
  ];

  const wxKe: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
  const ganWx: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  };
  const zhiWx: Record<string, string> = {
    '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水', '子': '水', '丑': '土',
  };

  function isKe(a: string, b: string): boolean {
    const aWx = ganWx[a] || zhiWx[a];
    const bWx = ganWx[b] || zhiWx[b];
    return aWx && bWx && wxKe[aWx] === bWx;
  }

  // 下克上
  for (let i = 0; i < 4; i++) {
    const lower = kePairs[i][0];
    const upper = kePairs[i][1];
    if (isKe(lower, upper)) {
      chuZhi = upper;
      method = '贼克法（下克上）';
      break;
    }
  }

  // 上克下
  if (!chuZhi) {
    for (let i = 0; i < 4; i++) {
      const lower = kePairs[i][0];
      const upper = kePairs[i][1];
      if (isKe(upper, lower)) {
        chuZhi = lower;
        method = '贼克法（上克下）';
        break;
      }
    }
  }

  // 如果都没有，用比用法（简化）
  if (!chuZhi) {
    chuZhi = shangShens[0];
    method = '比用法（简化）';
  }

  // 中传：初传地支所在宫位的上神
  const chuIdx = zhiIdx(chuZhi);
  const zhongZhi = tianDiPan.tianPan[chuIdx];

  // 末传：中传地支所在宫位的上神
  const zhongIdx = zhiIdx(zhongZhi);
  const moZhi = tianDiPan.tianPan[zhongIdx];

  // 查天将
  function getJiang(zhi: string): string {
    const j = shiErJiang.jiangs.find(j => j.zhi === zhi);
    return j?.name || '';
  }

  return {
    chu: { zhi: chuZhi, jiang: getJiang(chuZhi), liuQin: getLiuQin(dayGan, chuZhi), desc: '初传（发端）' },
    zhong: { zhi: zhongZhi, jiang: getJiang(zhongZhi), liuQin: getLiuQin(dayGan, zhongZhi), desc: '中传（移易）' },
    mo: { zhi: moZhi, jiang: getJiang(moZhi), liuQin: getLiuQin(dayGan, moZhi), desc: '末传（归计）' },
    method,
  };
}

// ============================================================
// 格局判断
// ============================================================
export function determineGeJu(siKe: SiKe, sanChuan: SanChuan): Array<{ name: string; desc: string; level: '吉' | '凶' | '平' }> {
  const patterns: Array<{ name: string; desc: string; level: '吉' | '凶' | '平' }> = [];

  // 元首课：一下贼上
  patterns.push({
    name: '元首课',
    desc: '以下犯上，事多主动，占事多成。',
    level: '吉',
  });

  //  check伏吟
  if (sanChuan.chu.zhi === sanChuan.zhong.zhi) {
    patterns.push({
      name: '伏吟',
      desc: '伏吟课，事多凝滞，进退两难。',
      level: '凶',
    });
  }

  // check反吟
  const chong: Record<string, string> = { '子': '午', '午': '子', '丑': '未', '未': '丑', '寅': '申', '申': '寅', '卯': '酉', '酉': '卯', '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳' };
  if (chong[sanChuan.chu.zhi] === sanChuan.zhong.zhi) {
    patterns.push({
      name: '反吟',
      desc: '反吟课，事多反复，来去不定。',
      level: '平',
    });
  }

  // 三传递进
  if (sanChuan.chu.zhi !== sanChuan.zhong.zhi && sanChuan.zhong.zhi !== sanChuan.mo.zhi) {
    patterns.push({
      name: '进递课',
      desc: '三传递进，事有发展，逐步推进。',
      level: '吉',
    });
  }

  // 贵人分析
  if (sanChuan.chu.jiang === '贵人' || sanChuan.zhong.jiang === '贵人') {
    patterns.push({
      name: '贵人临传',
      desc: '贵人降临三传，逢凶化吉，有人相助。',
      level: '吉',
    });
  }

  // 青龙
  if (sanChuan.chu.jiang === '青龙' || sanChuan.zhong.jiang === '青龙') {
    patterns.push({
      name: '青龙驾临',
      desc: '青龙临传，主财喜之事，占财大吉。',
      level: '吉',
    });
  }

  // 白虎
  if (sanChuan.chu.jiang === '白虎' || sanChuan.zhong.jiang === '白虎') {
    patterns.push({
      name: '白虎当道',
      desc: '白虎临传，主凶丧血光，宜谨慎。',
      level: '凶',
    });
  }

  return patterns;
}

// ============================================================
// 核心排盘入口
// ============================================================
export interface DaLiuRenResult {
  year: number; month: number; day: number; hour: number;
  jieQi: string;
  dayGanZhi: string; hourGanZhi: string;
  yueJiang: { name: string; zhi: string };
  tianDiPan: TianDiPan;
  siKe: SiKe;
  sanChuan: SanChuan;
  shiErJiang: ShiErJiang;
  geJu: Array<{ name: string; desc: string; level: '吉' | '凶' | '平' }>;
  question: string;
}

export function calculateDaLiuRen(
  year: number, month: number, day: number, hour: number,
  dayGanZhi: string, hourGanZhi: string,
  question: string = '',
): DaLiuRenResult {
  const dayGan = dayGanZhi[0];
  const dayZhi = dayGanZhi[1];
  const hourGan = hourGanZhi[0];
  const hourZhi = hourGanZhi[1];

  // 节气（简化）
  const jieQiMap: Record<number, string> = {
    1: '大寒', 2: '雨水', 3: '春分', 4: '谷雨', 5: '小满', 6: '夏至',
    7: '大暑', 8: '处暑', 9: '秋分', 10: '霜降', 11: '小雪', 12: '冬至',
  };
  const jieQi = jieQiMap[month] || '冬至';

  // 月将
  const yueJiang = getYueJiang(month, day);

  // 天地盘
  const tianDiPan = createTianDiPan(yueJiang.zhi, hourZhi);

  // 十二天将
  const shiErJiang = createShiErJiang(dayGan, hourZhi, tianDiPan.tianPan);

  // 四课
  const siKe = createSiKe(dayGan, dayZhi, tianDiPan);

  // 三传
  const sanChuan = createSanChuan(siKe, tianDiPan, shiErJiang, dayGan);

  // 格局
  const geJu = determineGeJu(siKe, sanChuan);

  return {
    year, month, day, hour,
    jieQi,
    dayGanZhi, hourGanZhi,
    yueJiang,
    tianDiPan,
    siKe,
    sanChuan,
    shiErJiang,
    geJu,
    question,
  };
}
