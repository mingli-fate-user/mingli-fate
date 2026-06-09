// 卦象图形渲染数据
// 八卦三条线（从下到上：第1条在最下面）
// 1=阳爻，0=阴爻

export const BAGUA_LINES: Record<string, number[]> = {
  '乾': [1,1,1], '兑': [1,1,0], '离': [1,0,1], '震': [1,0,0],
  '巽': [0,1,1], '坎': [0,1,0], '艮': [0,0,1], '坤': [0,0,0],
};

// 六十四卦 = [上卦, 下卦]
const GUA64: Record<string, [string, string]> = {
  '乾': ['乾','乾'], '坤': ['坤','坤'], '屯': ['坎','震'], '蒙': ['艮','坎'],
  '需': ['坎','乾'], '讼': ['乾','坎'], '师': ['坤','坎'], '比': ['坎','坤'],
  '小畜': ['巽','乾'], '履': ['乾','兑'], '泰': ['坤','乾'], '否': ['乾','坤'],
  '同人': ['乾','离'], '大有': ['离','乾'], '谦': ['坤','艮'], '豫': ['震','坤'],
  '随': ['兑','震'], '蛊': ['艮','巽'], '临': ['坤','兑'], '观': ['巽','坤'],
  '噬嗑': ['离','震'], '贲': ['艮','离'], '剥': ['艮','坤'], '复': ['坤','震'],
  '无妄': ['乾','震'], '大畜': ['艮','乾'], '颐': ['艮','震'], '大过': ['兑','巽'],
  '坎': ['坎','坎'], '离': ['离','离'], '咸': ['兑','艮'], '恒': ['震','巽'],
  '遁': ['乾','艮'], '大壮': ['震','乾'], '晋': ['离','坤'], '明夷': ['坤','离'],
  '家人': ['巽','离'], '睽': ['离','兑'], '蹇': ['坎','艮'], '解': ['震','坎'],
  '损': ['艮','兑'], '益': ['巽','震'], '夬': ['兑','乾'], '姤': ['乾','巽'],
  '萃': ['兑','坤'], '升': ['坤','巽'], '困': ['兑','坎'], '井': ['坎','巽'],
  '革': ['兑','离'], '鼎': ['离','巽'], '震': ['震','震'], '艮': ['艮','艮'],
  '渐': ['巽','艮'], '归妹': ['震','兑'], '丰': ['震','离'], '旅': ['离','艮'],
  '巽': ['巽','巽'], '兑': ['兑','兑'], '涣': ['巽','坎'], '节': ['坎','兑'],
  '中孚': ['巽','兑'], '小过': ['震','艮'], '既济': ['坎','离'], '未济': ['离','坎'],
};

// 卦的五行属性
export const GUA_WUXING: Record<string, string> = {
  '乾': '金', '兑': '金', '离': '火', '震': '木',
  '巽': '木', '坎': '水', '艮': '土', '坤': '土',
};

// 卦的卦象符号（Unicode）
export const GUA_SYMBOL: Record<string, string> = {
  '乾': '☰', '兑': '☱', '离': '☲', '震': '☳',
  '巽': '☴', '坎': '☵', '艮': '☶', '坤': '☷',
};

// 六十四卦Unicode（U+4DC0起）
const GUA_UNICODE_START = 0x4DC0;

// 获取六十四卦的Unicode字符
export function getGuaUnicode(guaName: string): string {
  const gua64Names = [
    '乾','坤','屯','蒙','需','讼','师','比','小畜','履','泰','否',
    '同人','大有','谦','豫','随','蛊','临','观','噬嗑','贲','剥','复',
    '无妄','大畜','颐','大过','坎','离','咸','恒','遁','大壮','晋','明夷',
    '家人','睽','蹇','解','损','益','夬','姤','萃','升','困','井',
    '革','鼎','震','艮','渐','归妹','丰','旅','巽','兑','涣','节',
    '中孚','小过','既济','未济'
  ];
  const idx = gua64Names.indexOf(guaName);
  if (idx >= 0) return String.fromCodePoint(GUA_UNICODE_START + idx);
  return guaName;
}

// 获取六十四卦的六条线（从下到上）
export function getGuaLines(guaName: string): number[] {
  const pair = GUA64[guaName];
  if (!pair) return [1,1,1,1,1,1]; // 默认乾卦
  const [upper, lower] = pair;
  const upperLines = BAGUA_LINES[upper] || [1,1,1];
  const lowerLines = BAGUA_LINES[lower] || [1,1,1];
  // 六条线：上卦的3条在上面，下卦的3条在下面
  // 从下到上的顺序：下卦第1条、下卦第2条、下卦第3条、上卦第1条、上卦第2条、上卦第3条
  return [lowerLines[0], lowerLines[1], lowerLines[2], upperLines[0], upperLines[1], upperLines[2]];
}

// 获取六十四卦的上卦下卦名称
export function getGuaComponents(guaName: string): { upper: string; lower: string } {
  const pair = GUA64[guaName] || ['乾', '乾'];
  return { upper: pair[0], lower: pair[1] };
}

// 计算变卦（动爻阴阳互换）
export function getBianGua(benGuaName: string, yaoIndex: number): string {
  // yaoIndex: 1-6, 从下往上
  const lines = getGuaLines(benGuaName);
  const newLines = [...lines];
  if (yaoIndex >= 1 && yaoIndex <= 6) {
    newLines[yaoIndex - 1] = newLines[yaoIndex - 1] === 1 ? 0 : 1;
  }
  return findGuaByLines(newLines);
}

// 计算互卦（取234爻为下互卦，345爻为上互卦）
export function getHuGua(benGuaName: string): string {
  const lines = getGuaLines(benGuaName);
  // 互卦：下互卦 = 234爻，上互卦 = 345爻
  const huLines = [lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]];
  return findGuaByLines(huLines);
}

// 根据六条线找卦名
function findGuaByLines(lines: number[]): string {
  for (const [name, pair] of Object.entries(GUA64)) {
    const upperLines = BAGUA_LINES[pair[0]] || [];
    const lowerLines = BAGUA_LINES[pair[1]] || [];
    const expected = [lowerLines[0], lowerLines[1], lowerLines[2], upperLines[0], upperLines[1], upperLines[2]];
    if (expected.every((v, i) => v === lines[i])) return name;
  }
  return '乾';
}

// 获取卦的五行
export function getGuaWuxing(guaName: string): string {
  const comp = getGuaComponents(guaName);
  return GUA_WUXING[comp.upper] || '';
}

// 六亲关系
export function getLiuQin(guaWuxing: string, yaoWuxing: string): string {
  const wxOrder = ['金','水','木','火','土'];
  const idx1 = wxOrder.indexOf(guaWuxing);
  const idx2 = wxOrder.indexOf(yaoWuxing);
  if (idx1 === -1 || idx2 === -1) return '兄弟';
  const diff = ((idx2 - idx1) % 5 + 5) % 5;
  const liuQinMap: Record<number, string> = {
    0: '兄弟', 1: '子孙', 2: '妻财', 3: '官鬼', 4: '父母'
  };
  return liuQinMap[diff] || '兄弟';
}

// 地支
export const DI_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
export const DI_ZHI_WX: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 纳甲（六爻纳甲法）
export const NA_JIA: Record<string, string[]> = {
  '乾': ['子','寅','辰','午','申','戌'],
  '兑': ['巳','卯','丑','亥','酉','未'],
  '离': ['卯','丑','亥','酉','未','巳'],
  '震': ['子','寅','辰','午','申','戌'],
  '巽': ['丑','亥','酉','未','巳','卯'],
  '坎': ['寅','辰','午','申','戌','子'],
  '艮': ['辰','午','申','戌','子','寅'],
  '坤': ['未','巳','卯','丑','亥','酉'],
};

// 六神（根据日干）
export function getLiuShen(dayGan: string): string[] {
  const liuShenMap: Record<string, string[]> = {
    '甲': ['青龙','朱雀','勾陈','螣蛇','白虎','玄武'],
    '乙': ['青龙','朱雀','勾陈','螣蛇','白虎','玄武'],
    '丙': ['朱雀','勾陈','螣蛇','白虎','玄武','青龙'],
    '丁': ['朱雀','勾陈','螣蛇','白虎','玄武','青龙'],
    '戊': ['勾陈','螣蛇','白虎','玄武','青龙','朱雀'],
    '己': ['勾陈','螣蛇','白虎','玄武','青龙','朱雀'],
    '庚': ['白虎','玄武','青龙','朱雀','勾陈','螣蛇'],
    '辛': ['白虎','玄武','青龙','朱雀','勾陈','螣蛇'],
    '壬': ['玄武','青龙','朱雀','勾陈','螣蛇','白虎'],
    '癸': ['玄武','青龙','朱雀','勾陈','螣蛇','白虎'],
  };
  return liuShenMap[dayGan] || ['青龙','朱雀','勾陈','螣蛇','白虎','玄武'];
}

// 根据年月日时起卦（梅花易数用）
export function getDateGua(year: number, month: number, day: number, hour: number): { benGua: string; bianGua: string; yao: number } {
  // 上卦 = (年+月+日) % 8，取余数对应八卦
  // 下卦 = (年+月+日+时) % 8
  // 动爻 = (年+月+日+时) % 6
  const bgNames = ['乾','兑','离','震','巽','坎','艮','坤'];
  const upperIdx = (year + month + day) % 8;
  const lowerIdx = (year + month + day + hour) % 8;
  const yaoIdx = (year + month + day + hour) % 6;
  
  const upper = bgNames[upperIdx] || '乾';
  const lower = bgNames[lowerIdx] || '乾';
  
  // 找卦名
  let benGua = '乾';
  for (const [name, pair] of Object.entries(GUA64)) {
    if (pair[0] === upper && pair[1] === lower) {
      benGua = name;
      break;
    }
  }
  
  const yao = yaoIdx === 0 ? 6 : yaoIdx; // 1-6
  const bianGua = getBianGua(benGua, yao);
  
  return { benGua, bianGua, yao };
}
