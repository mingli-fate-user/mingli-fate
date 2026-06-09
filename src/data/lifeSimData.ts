// 命理人生模拟器 - 宏大版数据系统
// 参考：life-kline 人生K线的结构化分析框架 + Chinese Parents 的RPG属性系统

export interface LifeEvent {
  age: number;
  title: string;
  story: string;
  choices: [string, string]; // [顺应, 抗争]
  consequenceA: string; // 顺应后果
  consequenceB: string; // 抗争后果
  attrEffectA: Partial<SixAttrs>; // 顺应对属性的影响
  attrEffectB: Partial<SixAttrs>; // 抗争对属性的影响
  daYun: string; // 大运名称
}

export interface SixAttrs {
  wealth: number;    // 财运 0-100
  career: number;    // 事业 0-100
  health: number;    // 健康 0-100
  love: number;      // 感情 0-100
  study: number;     // 学业 0-100
  social: number;    // 人际 0-100
}

export interface TitleBadge {
  name: string;
  desc: string;
  condition: string;
  icon: string;
  color: string;
}

export interface NPC {
  name: string;
  relation: string;
  story: string;
  icon: string;
}

export interface LifeTurningPoint {
  age: number;
  title: string;
  desc: string;
}

// 六维属性初始值（根据八字格局设定基础值）
export function getBaseAttrs(pattern: string): SixAttrs {
  const base: Record<string, SixAttrs> = {
    '食伤生财': { wealth: 65, career: 50, health: 55, love: 45, study: 60, social: 70 },
    '伤官配印': { wealth: 45, career: 55, health: 60, love: 40, study: 80, social: 50 },
    '正官格': { wealth: 55, career: 70, health: 60, love: 55, study: 65, social: 60 },
    '七杀格': { wealth: 50, career: 60, health: 45, love: 40, study: 50, social: 55 },
    '从财格': { wealth: 80, career: 50, health: 55, love: 50, study: 45, social: 60 },
    '从杀格': { wealth: 45, career: 65, health: 50, love: 35, study: 40, social: 70 },
    '印绶格': { wealth: 40, career: 50, health: 65, love: 45, study: 75, social: 45 },
    '建禄格': { wealth: 45, career: 55, health: 70, love: 50, study: 55, social: 50 },
    '杂气格': { wealth: 50, career: 50, health: 50, love: 50, study: 50, social: 50 },
  };
  return base[pattern] || base['杂气格'];
}

// 大运列表
export const DA_YUN_LIST = [
  { age: 1, name: '早年运', gan: '', zhi: '' },
  { age: 10, name: '少年运', gan: '', zhi: '' },
  { age: 20, name: '青年运', gan: '', zhi: '' },
  { age: 30, name: '壮年运', gan: '', zhi: '' },
  { age: 40, name: '中年运', gan: '', zhi: '' },
  { age: 50, name: '盛年运', gan: '', zhi: '' },
  { age: 60, name: '晚年运', gan: '', zhi: '' },
  { age: 70, name: '暮年运', gan: '', zhi: '' },
  { age: 80, name: '归元运', gan: '', zhi: '' },
];

// 称号系统
export const TITLE_BADGES: TitleBadge[] = [
  { name: '天选之子', desc: '出生时辰极佳，天赋异禀', condition: 'wealth>70', icon: '👑', color: '#fbbf24' },
  { name: '少年天才', desc: '幼年时便展现出过人智慧', condition: 'study>70', icon: '📚', color: '#60a5fa' },
  { name: '社交达人', desc: '人缘极佳，朋友遍天下', condition: 'social>70', icon: '🤝', color: '#4ade80' },
  { name: '情场高手', desc: '感情路上顺风顺水', condition: 'love>70', icon: '❤️', color: '#f472b6' },
  { name: '白手起家', desc: '从无到有，靠双手打拼', condition: 'wealth>60&&career>60', icon: '💪', color: '#fb923c' },
  { name: '大器晚成', desc: '中年转运，后来居上', condition: 'career>60', icon: '🌅', color: '#a78bfa' },
  { name: '桃李满天下', desc: '学识渊博，影响深远', condition: 'study>70', icon: '🎓', color: '#34d399' },
  { name: '松柏长青', desc: '健康长寿，精神矍铄', condition: 'health>70', icon: '🌲', color: '#22d3ee' },
  { name: '商界巨子', desc: '财运亨通，富甲一方', condition: 'wealth>80', icon: '💰', color: '#fbbf24' },
  { name: '一代宗师', desc: '登峰造极，名垂青史', condition: 'career>80', icon: '⭐', color: '#f59e0b' },
  { name: '逆风翻盘', desc: '在逆境中改变命运', condition: 'career>50', icon: '🔥', color: '#ef4444' },
  { name: '圆满人生', desc: '各方面均衡发展', condition: '', icon: '☯️', color: '#a3a3a3' },
];

// 获取符合条件的称号
export function getTitles(attrs: SixAttrs): TitleBadge[] {
  return TITLE_BADGES.filter(t => {
    if (!t.condition) return false;
    const parts = t.condition.split('&&');
    return parts.every(part => {
      const [key, op, val] = part.match(/(\w+)([><=]+)(\d+)/) || [];
      if (!key) return false;
      const attrVal = attrs[key as keyof SixAttrs] || 0;
      if (op === '>') return attrVal > Number(val);
      if (op === '>=') return attrVal >= Number(val);
      if (op === '<') return attrVal < Number(val);
      return false;
    });
  });
}

// 生成人生K线数据
export function generateKLineData(baseAttrs: SixAttrs, choices: Record<number, 'A' | 'B'>): number[] {
  // 生成1-80岁的运势数据，结合属性和选择
  const data: number[] = [];
  let trend = 50;
  const choiceValues = Object.values(choices);
  const shunCount = choiceValues.filter(c => c === 'A').length;
  const niCount = choiceValues.filter(c => c === 'B').length;

  for (let age = 1; age <= 80; age++) {
    // 基础趋势：根据八字格局的基础属性
    const baseScore = (baseAttrs.wealth + baseAttrs.career + baseAttrs.health + baseAttrs.love + baseAttrs.study + baseAttrs.social) / 6;

    // 年龄波动：每10年一个周期
    const ageCycle = Math.sin((age / 10) * Math.PI) * 15;

    // 选择影响：顺应让运势更平稳，抗争增加波动性
    const choiceEffect = (shunCount > niCount) ? 5 : (niCount > shunCount) ? -3 + Math.random() * 10 : 0;

    // 大运交替效应（30、40、50岁等关键节点）
    const daYunEffect = (age % 10 === 0) ? (Math.random() > 0.5 ? 10 : -8) : 0;

    // 随机波动
    const randomFluctuation = (Math.random() - 0.5) * 12;

    trend = Math.max(10, Math.min(95, baseScore + ageCycle + choiceEffect + daYunEffect + randomFluctuation));
    data.push(Math.round(trend));
  }
  return data;
}

// 结局评级
export function getEndingGrade(attrs: SixAttrs): { grade: string; title: string; desc: string } {
  const avg = (attrs.wealth + attrs.career + attrs.health + attrs.love + attrs.study + attrs.social) / 6;
  if (avg >= 80) return { grade: 'S', title: '传奇人生', desc: '你的一生堪称传奇，各方面都达到了令人艳羡的高度。' };
  if (avg >= 65) return { grade: 'A', title: '精彩人生', desc: '你的一生精彩纷呈，虽有波折但收获满满。' };
  if (avg >= 50) return { grade: 'B', title: '平凡人生', desc: '你的一生平淡而真实，有欢笑也有泪水。' };
  if (avg >= 35) return { grade: 'C', title: '坎坷人生', desc: '你的一生充满挑战，但你的坚韧令人敬佩。' };
  return { grade: 'D', title: '磨难人生', desc: '你的一生历经磨难，但每一次跌倒都让你更加强大。' };
}

// 关系NPC库
export const NPC_TEMPLATES: NPC[] = [
  { name: '严父', relation: '父亲', story: '沉默寡言，但总是在关键时刻给你最坚实的支持。', icon: '👨' },
  { name: '慈母', relation: '母亲', story: '温柔体贴，是你心灵的港湾。', icon: '👩' },
  { name: '知己', relation: '挚友', story: '从小学就认识的朋友，懂你胜过懂自己。', icon: '🧑‍🤝‍🧑' },
  { name: '恩师', relation: '老师', story: '改变你命运轨迹的人，一句话点醒梦中人。', icon: '👨‍🏫' },
  { name: '贵人', relation: '伯乐', story: '在你最迷茫时出现，给了你一个机会。', icon: '🤵' },
  { name: '对手', relation: '竞争', story: '亦敌亦友，他的存在让你不敢懈怠。', icon: '⚔️' },
  { name: '伴侣', relation: '爱人', story: '命中注定的缘分，与你携手走过人生。', icon: '💑' },
  { name: '子女', relation: '后代', story: '你的骄傲，也是你生命的延续。', icon: '👶' },
];
