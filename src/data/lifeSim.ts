// 命理人生模拟器 - 数据与类型

export interface LifeChoice {
  text: string;
  label: string;
}

export interface LifeStage {
  age: number;
  label: string;
  title: string;
  story: string;
  choices: LifeChoice[];
  consequenceA: string;
  consequenceB: string;
  playerChoice?: 'A' | 'B';
}

export interface LifeReport {
  overview: string;
  stages: LifeStage[];
  fateVsChoice: string;
  finalScore: number;
  highlight: string;
  regret: string;
}

// 年龄段配置
export const AGE_STAGES = [
  { age: 1, label: '幼年', title: '呱呱坠地' },
  { age: 10, label: '少年', title: '启蒙读书' },
  { age: 20, label: '青年', title: '初入社会' },
  { age: 30, label: '而立', title: '成家立业' },
  { age: 40, label: '不惑', title: '人到中年' },
  { age: 50, label: '知命', title: '历尽沧桑' },
  { age: 60, label: '花甲', title: '退休归隐' },
  { age: 70, label: '古稀', title: '颐养天年' },
  { age: 80, label: '耄耋', title: '人生回望' },
];

// 八字格局描述库
export const GUA_JU: Record<string, { name: string; desc: string; strength: string }> = {
  '食伤生财': { name: '食伤生财格', desc: '聪明机敏，善于发现机会，靠才华和创意赚钱。', strength: '创意、表达、商业嗅觉' },
  '伤官配印': { name: '伤官配印格', desc: '才华出众但有规矩约束，适合文化、艺术、学术道路。', strength: '才华、学识、创造力' },
  '正官格': { name: '正官格', desc: '正直守规矩，适合体制内、管理岗位，贵人运好。', strength: '正直、领导力、贵人运' },
  '七杀格': { name: '七杀格', desc: '有魄力、敢冒险，压力越大动力越强，容易大起大落。', strength: '魄力、执行力、抗压' },
  '从财格': { name: '从财格', desc: '对金钱敏感，善于理财投资，一生与财富有缘。', strength: '财运、商业头脑' },
  '从杀格': { name: '从杀格', desc: '性格刚强，适合军警、外科医生等高压职业。', strength: '果断、执行力' },
  '印绶格': { name: '印绶格', desc: '好学深思，有贵人相助，适合学术、教育、研究。', strength: '学识、贵人、思考力' },
  '建禄格': { name: '建禄格', desc: '身强体壮，勤劳肯干，靠自己打拼出一番事业。', strength: '勤劳、毅力、独立' },
  '杂气格': { name: '杂气格', desc: '八字驳杂，命运多变，但也因此经历丰富，见多识广。', strength: '适应力、阅历丰富' },
};

// 五行颜色映射
export const WUXING_COLORS: Record<string, { primary: string; glow: string; bg: string }> = {
  '金': { primary: '#fbbf24', glow: 'rgba(251,191,36,0.4)', bg: 'from-amber-900/30' },
  '木': { primary: '#4ade80', glow: 'rgba(74,222,128,0.4)', bg: 'from-emerald-900/30' },
  '水': { primary: '#60a5fa', glow: 'rgba(96,165,250,0.4)', bg: 'from-blue-900/30' },
  '火': { primary: '#f87171', glow: 'rgba(248,113,113,0.4)', bg: 'from-red-900/30' },
  '土': { primary: '#d4a373', glow: 'rgba(212,163,115,0.4)', bg: 'from-yellow-900/30' },
};

// 获取五行颜色
export function getWuxingColor(wuxing: string) {
  return WUXING_COLORS[wuxing] || { primary: '#fbbf24', glow: 'rgba(251,191,36,0.4)', bg: 'from-amber-900/30' };
}

// 根据八字格局推断五行
export function inferWuxing(pillar: string): string {
  const ganMap: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  };
  const firstChar = pillar[0] || '';
  return ganMap[firstChar] || '土';
}

// 获取大运标签
export function getDaYunLabel(startAge: number): string {
  if (startAge <= 10) return '早年运';
  if (startAge <= 20) return '少年运';
  if (startAge <= 30) return '青年运';
  if (startAge <= 40) return '壮年运';
  if (startAge <= 50) return '中年运';
  if (startAge <= 60) return '盛年运';
  if (startAge <= 70) return '晚年运';
  return '暮年运';
}
