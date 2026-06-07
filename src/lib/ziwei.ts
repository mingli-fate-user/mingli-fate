// 紫微斗数排盘核心算法（简化版）

export const ZHU_XING = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];
export const JI_XING = ['文昌', '文曲', '左辅', '右弼', '天魁', '天钺', '禄存'];
export const SHA_XING = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫'];
export const GONG_WEI = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母'];

const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 安命宫：从寅宫起正月，顺数到生月，再逆数到生时
export function getMingGong(month: number, hour: number): number {
  // 寅=2, 正月从寅开始
  const start = 2; // 寅
  const monthPos = (start + month - 1) % 12;
  const mingPos = (monthPos - hour + 12) % 12;
  return mingPos;
}

// 安身宫：从寅宫起正月，顺数到生月，再顺数到生时
export function getShenGong(month: number, hour: number): number {
  const start = 2; // 寅
  const monthPos = (start + month - 1) % 12;
  const shenPos = (monthPos + hour) % 12;
  return shenPos;
}

// 五行局
export function getWuXingJu(mingGongZhi: string): { name: string; num: number } {
  const juMap: Record<string, { name: string; num: number }> = {
    '子': { name: '水二局', num: 2 }, '丑': { name: '土五局', num: 5 },
    '寅': { name: '火六局', num: 6 }, '卯': { name: '木三局', num: 3 },
    '辰': { name: '金四局', num: 4 }, '巳': { name: '水二局', num: 2 },
    '午': { name: '火六局', num: 6 }, '未': { name: '土五局', num: 5 },
    '申': { name: '金四局', num: 4 }, '酉': { name: '木三局', num: 3 },
    '戌': { name: '火六局', num: 6 }, '亥': { name: '水二局', num: 2 },
  };
  return juMap[mingGongZhi] || { name: '未知', num: 5 };
}

// 安紫微星
export function getZiWei(nianGanIdx: number, mingGongIdx: number): number {
  // 简化：紫微在命宫的位置根据年干和命宫地支来确定
  const wuxingJu = getWuXingJu(DI_ZHI[mingGongIdx]);
  // 用年干和五行局确定紫微位置
  const offset = (nianGanIdx + wuxingJu.num) % 12;
  return offset;
}

// 安十四主星
export function getZhuXingPositions(ziWeiPos: number): Record<string, number> {
  const positions: Record<string, number> = {};
  positions['紫微'] = ziWeiPos;
  positions['天机'] = (ziWeiPos + 11) % 12; // 紫微前一宫
  positions['太阳'] = (ziWeiPos + 9) % 12;  // 紫微前三宫
  positions['武曲'] = (ziWeiPos + 8) % 12;  // 紫微前四宫
  positions['天同'] = (ziWeiPos + 7) % 12;  // 紫微前五宫
  positions['廉贞'] = (ziWeiPos + 4) % 12;  // 紫微前八宫

  // 天府星系（与紫微相对）
  const tianFuPos = (ziWeiPos + 6) % 12;
  positions['天府'] = tianFuPos;
  positions['太阴'] = (tianFuPos + 1) % 12;
  positions['贪狼'] = (tianFuPos + 2) % 12;
  positions['巨门'] = (tianFuPos + 3) % 12;
  positions['天相'] = (tianFuPos + 4) % 12;
  positions['天梁'] = (tianFuPos + 5) % 12;
  positions['七杀'] = (tianFuPos + 6) % 12;
  positions['破军'] = (tianFuPos + 10) % 12;

  return positions;
}

// 四化
export function getSiHua(nianGan: string): Record<string, string> {
  const siHuaMap: Record<string, Record<string, string>> = {
    '甲': { '廉贞': '禄', '破军': '权', '武曲': '科', '太阳': '忌' },
    '乙': { '天机': '禄', '天梁': '权', '紫微': '科', '太阴': '忌' },
    '丙': { '天同': '禄', '天机': '权', '文昌': '科', '廉贞': '忌' },
    '丁': { '太阴': '禄', '天同': '权', '天机': '科', '巨门': '忌' },
    '戊': { '贪狼': '禄', '太阴': '权', '右弼': '科', '天机': '忌' },
    '己': { '武曲': '禄', '贪狼': '权', '天梁': '科', '文曲': '忌' },
    '庚': { '太阳': '禄', '武曲': '权', '太阴': '科', '天同': '忌' },
    '辛': { '巨门': '禄', '太阳': '权', '文曲': '科', '文昌': '忌' },
    '壬': { '天梁': '禄', '紫微': '权', '左辅': '科', '武曲': '忌' },
    '癸': { '破军': '禄', '巨门': '权', '太阴': '科', '贪狼': '忌' },
  };
  return siHuaMap[nianGan] || {};
}

// 安六吉星
export function getJiXingPositions(nianGanIdx: number, nianZhiIdx: number): Record<string, number> {
  const positions: Record<string, number> = {};
  // 文昌：从戌起子逆数到生年支
  positions['文昌'] = (9 - nianZhiIdx + 12) % 12;
  // 文曲：从辰起子顺数到生年支
  positions['文曲'] = (4 + nianZhiIdx) % 12;
  // 左辅：从辰起正月顺数到生月
  // 简化：根据年干定
  positions['左辅'] = (4 + nianGanIdx) % 12;
  // 右弼：从戌起正月逆数到生月
  positions['右弼'] = (9 - nianGanIdx + 12) % 12;
  // 天魁天钺根据年干
  const kuiPositions = [6, 5, 3, 2, 0, 11, 9, 8, 6, 5]; // 甲-癸
  const yuePositions = [2, 3, 5, 6, 8, 9, 11, 0, 2, 3];
  positions['天魁'] = kuiPositions[nianGanIdx] ?? 0;
  positions['天钺'] = yuePositions[nianGanIdx] ?? 0;
  positions['禄存'] = (2 + nianGanIdx) % 12; // 寅起甲
  return positions;
}

export interface ZiWeiResult {
  mingGong: number;
  shenGong: number;
  mingGongZhi: string;
  wuXingJu: { name: string; num: number };
  zhuXing: Record<string, number>;
  jiXing: Record<string, number>;
  shaXing: Record<string, number>;
  siHua: Record<string, string>;
  nianGan: string;
  nianZhi: string;
}

export function getZiWeiPan(nianGan: string, nianZhi: string, month: number, hour: number): ZiWeiResult {
  const nianGanIdx = TIAN_GAN.indexOf(nianGan);
  const nianZhiIdx = DI_ZHI.indexOf(nianZhi);

  const mingGong = getMingGong(month, hour);
  const shenGong = getShenGong(month, hour);
  const mingGongZhi = DI_ZHI[mingGong];

  const wuXingJu = getWuXingJu(mingGongZhi);
  const ziWeiPos = getZiWei(nianGanIdx, mingGong);
  const zhuXing = getZhuXingPositions(ziWeiPos);
  const jiXing = getJiXingPositions(nianGanIdx, nianZhiIdx);
  const siHua = getSiHua(nianGan);

  // 六煞星简化
  const shaXing: Record<string, number> = {
    '擎羊': (mingGong + 1) % 12,
    '陀罗': (mingGong + 11) % 12,
    '火星': (mingGong + 3) % 12,
    '铃星': (mingGong + 9) % 12,
    '地空': (mingGong + 10) % 12,
    '地劫': (mingGong + 2) % 12,
  };

  return {
    mingGong,
    shenGong,
    mingGongZhi,
    wuXingJu,
    zhuXing,
    jiXing,
    shaXing,
    siHua,
    nianGan,
    nianZhi,
  };
}

export { DI_ZHI, TIAN_GAN };
