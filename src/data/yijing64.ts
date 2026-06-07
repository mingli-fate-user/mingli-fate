// 静态导入64卦数据（避免运行时 fetch）
import guaJson from '../../public/yijing64.json';
export { guaJson as YI_JING_64 };

// 八卦爻象（从下到上：初爻、二爻、三爻）
export const BA_GUA_YAO: Record<string, boolean[]> = {
  '乾': [true, true, true],      // 天 ☰ 三阳
  '坤': [false, false, false],   // 地 ☷ 三阴
  '震': [true, false, false],    // 雷 ☳ 一阳在下
  '艮': [false, false, true],    // 山 ☶ 一阳在上
  '坎': [false, true, false],    // 水 ☵ 一阳在中
  '离': [true, false, true],     // 火 ☲ 一阴在中
  '兑': [true, true, false],     // 泽 ☱ 一阴在上
  '巽': [false, true, true],     // 风 ☴ 一阴在下
};

// 自然名到八卦名的映射
const NATURAL_TO_BAGUA: Record<string, string> = {
  '天': '乾', '地': '坤', '水': '坎', '火': '离',
  '雷': '震', '风': '巽', '山': '艮', '泽': '兑',
};

// 64卦的上下卦定义（卦号 → [上卦, 下卦]）
const GUA_TRIGRAMS: Record<number, [string, string]> = {
  1: ['乾', '乾'], 2: ['坤', '坤'], 3: ['坎', '震'], 4: ['艮', '坎'],
  5: ['坎', '乾'], 6: ['乾', '坎'], 7: ['坤', '坎'], 8: ['坎', '坤'],
  9: ['巽', '乾'], 10: ['乾', '兑'], 11: ['坤', '乾'], 12: ['乾', '坤'],
  13: ['乾', '离'], 14: ['离', '乾'], 15: ['坤', '艮'], 16: ['震', '坤'],
  17: ['兑', '震'], 18: ['艮', '巽'], 19: ['坤', '兑'], 20: ['巽', '坤'],
  21: ['离', '震'], 22: ['艮', '离'], 23: ['艮', '坤'], 24: ['坤', '震'],
  25: ['乾', '震'], 26: ['艮', '乾'], 27: ['艮', '震'], 28: ['兑', '巽'],
  29: ['坎', '坎'], 30: ['离', '离'], 31: ['兑', '艮'], 32: ['震', '巽'],
  33: ['乾', '艮'], 34: ['震', '乾'], 35: ['离', '坤'], 36: ['坤', '离'],
  37: ['巽', '离'], 38: ['离', '兑'], 39: ['坎', '艮'], 40: ['震', '坎'],
  41: ['艮', '兑'], 42: ['巽', '震'], 43: ['兑', '乾'], 44: ['乾', '巽'],
  45: ['兑', '坤'], 46: ['坤', '巽'], 47: ['兑', '坎'], 48: ['坎', '巽'],
  49: ['兑', '离'], 50: ['离', '巽'], 51: ['震', '震'], 52: ['艮', '艮'],
  53: ['巽', '艮'], 54: ['震', '兑'], 55: ['震', '离'], 56: ['离', '艮'],
  57: ['巽', '巽'], 58: ['兑', '兑'], 59: ['巽', '坎'], 60: ['坎', '兑'],
  61: ['巽', '兑'], 62: ['震', '艮'], 63: ['坎', '离'], 64: ['离', '坎'],
};

// 从卦号生成六爻（从下到上：初、二、三、四、五、上）
export function getYaoFromGuaNum(num: number): boolean[] {
  const trigrams = GUA_TRIGRAMS[num];
  if (!trigrams) return [true, true, true, true, true, true];
  const [upper, lower] = trigrams;
  const upperYao = BA_GUA_YAO[upper];  // 上卦：四、五、上爻
  const lowerYao = BA_GUA_YAO[lower];  // 下卦：初、二、三爻
  return [...lowerYao, ...upperYao];   // [初,二,三,四,五,上]
}

// 从卦名解析上下卦（备用方法）
export function parseGuaName(name: string): { upper: string; lower: string } {
  // 格式 "X为Y"
  const match = name.match(/(.+?)为(.+)/);
  if (match) {
    const _upperNat = match[1];
    const _lowerNat = match[2];
    void _upperNat; void _lowerNat;
    // 格式"X为Y"的上卦X下卦Y解析，当前通过卦号查表已实现
  }
  
  // 逐字解析：在卦名中找天地水火雷风山泽
  const chars = name.split('');
  const guaChars: string[] = [];
  for (const c of chars) {
    if (NATURAL_TO_BAGUA[c]) {
      guaChars.push(NATURAL_TO_BAGUA[c]);
    }
  }
  if (guaChars.length >= 2) {
    return { upper: guaChars[0], lower: guaChars[1] };
  }
  return { upper: '乾', lower: '乾' };
}

// 六爻名称
export const YAO_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
