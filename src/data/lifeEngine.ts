// 命理人生模拟器 v4 - 核心引擎
// AI先剖析八字基调 → 基于命格生成6个选择

export interface SixAttrs {
  wealth: number; career: number; health: number;
  love: number; study: number; social: number; karma: number;
}

export interface LifeTone {
  pattern: string;       // 格局
  wuxing: string;        // 五行
  tone: string;          // 人生基调描述
  strengths: string[];   // 优势方向
  weaknesses: string[];  // 劣势方向
  luckyAges: number[];   // 顺风年龄段
  toughAges: number[];   // 逆风年龄段
  suitablePaths: string[]; // 适合的道路
  avoidPaths: string[];  // 应避免的道路
  deathRiskAges: number[]; // 高风险死亡年份
}

export interface ChoiceOption {
  text: string;
  label: string;
  style: 'destiny' | 'virtue' | 'ambition' | 'steady' | 'free' | 'gamble';
  result: {
    type: 'continue' | 'death';
    deathTitle?: string;
    deathReason?: string;
    attrEffect: Partial<SixAttrs>;
  };
}

export interface LifeEvent {
  age: number;
  title: string;
  story: string;
  choices: ChoiceOption[]; // 6个选择
  type: 'normal' | 'deadly' | 'lucky' | 'crisis' | 'turning';
}

// 八字转格局
export function analyzePattern(dayGan: string): { pattern: string; wuxing: string } {
  const wxMap: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  };
  let pat = '杂气格';
  if (['甲', '乙'].includes(dayGan)) pat = '建禄格';
  else if (['丙', '丁'].includes(dayGan)) pat = '食伤生财';
  else if (['戊', '己'].includes(dayGan)) pat = '正官格';
  else if (['庚', '辛'].includes(dayGan)) pat = '伤官配印';
  else if (['壬', '癸'].includes(dayGan)) pat = '从财格';
  return { pattern: pat, wuxing: wxMap[dayGan] || '土' };
}

// 获取基础属性
export function getBaseAttrs(pattern: string): SixAttrs {
  const map: Record<string, SixAttrs> = {
    '食伤生财': { wealth: 65, career: 50, health: 55, love: 45, study: 60, social: 70, karma: 0 },
    '伤官配印': { wealth: 45, career: 55, health: 60, love: 40, study: 80, social: 50, karma: 0 },
    '正官格': { wealth: 55, career: 70, health: 60, love: 55, study: 65, social: 60, karma: 0 },
    '七杀格': { wealth: 50, career: 60, health: 45, love: 40, study: 50, social: 55, karma: 0 },
    '从财格': { wealth: 80, career: 50, health: 55, love: 50, study: 45, social: 60, karma: 0 },
    '从杀格': { wealth: 45, career: 65, health: 50, love: 35, study: 40, social: 70, karma: 0 },
    '印绶格': { wealth: 40, career: 50, health: 65, love: 45, study: 75, social: 45, karma: 0 },
    '建禄格': { wealth: 45, career: 55, health: 70, love: 50, study: 55, social: 50, karma: 0 },
    '杂气格': { wealth: 50, career: 50, health: 50, love: 50, study: 50, social: 50, karma: 0 },
  };
  return map[pattern] || map['杂气格'];
}

// 根据基调生成6个选择
export function generateChoices(
  age: number, tone: LifeTone, currentAttrs: SixAttrs, eventType: string
): ChoiceOption[] {
  const isLucky = tone.luckyAges.includes(age);
  const isTough = tone.toughAges.includes(age);
  const isDeadly = eventType === 'deadly' || tone.deathRiskAges.includes(age);
  const pat = tone.pattern;

  // 6种选择风格的基础效果模板
  const choices: ChoiceOption[] = [
    // 1. 顺应天命 - 最安全，走八字最顺的路
    {
      text: generateDestinyText(age, pat, isLucky),
      label: '顺应天命',
      style: 'destiny',
      result: {
        type: 'continue',
        attrEffect: {
          wealth: r(2, 6), career: r(2, 5), health: r(1, 4),
          love: r(1, 3), study: r(0, 3), social: r(1, 3), karma: 1,
        },
      },
    },
    // 2. 积德行善 - 增加福报
    {
      text: generateVirtueText(age, pat),
      label: '积德行善',
      style: 'virtue',
      result: {
        type: 'continue',
        attrEffect: {
          wealth: r(-2, 2), career: r(0, 3), health: r(2, 5),
          love: r(3, 6), study: r(1, 3), social: r(3, 7), karma: 3,
        },
      },
    },
    // 3. 进取拼搏 - 事业学业为主
    {
      text: generateAmbitionText(age, pat, tone.strengths),
      label: '进取拼搏',
      style: 'ambition',
      result: {
        type: 'continue',
        attrEffect: {
          wealth: r(0, 5), career: r(5, 12), health: r(-5, -1),
          love: r(-3, 0), study: r(3, 8), social: r(1, 4), karma: 0,
        },
      },
    },
    // 4. 守成稳进 - 保守稳妥
    {
      text: generateSteadyText(age, pat),
      label: '守成稳进',
      style: 'steady',
      result: {
        type: 'continue',
        attrEffect: {
          wealth: r(1, 4), career: r(1, 3), health: r(2, 5),
          love: r(1, 3), study: r(0, 2), social: r(0, 2), karma: 0,
        },
      },
    },
    // 5. 随性自然 - 听从内心
    {
      text: generateFreeText(age, pat),
      label: '随性自然',
      style: 'free',
      result: {
        type: 'continue',
        attrEffect: {
          wealth: r(-3, 5), career: r(-2, 6), health: r(-2, 6),
          love: r(-2, 7), study: r(-2, 5), social: r(-1, 6), karma: r(-1, 2),
        },
      },
    },
  ];

  // 6. 冒险一搏 / 生死抉择 - 高风险
  if (isDeadly) {
    choices.push({
      text: generateGambleDeadlyText(age, pat),
      label: '命悬一线',
      style: 'gamble',
      result: {
        type: 'death',
        deathTitle: getDeathTitle(age),
        deathReason: generateDeathReason(age, pat, tone.wuxing),
        attrEffect: {},
      },
    });
  } else if (isTough) {
    choices.push({
      text: generateGambleToughText(age, pat),
      label: '背水一战',
      style: 'gamble',
      result: {
        type: 'continue',
        attrEffect: {
          wealth: r(-8, 15), career: r(-5, 18), health: r(-10, 3),
          love: r(-8, 5), study: r(-3, 10), social: r(-5, 8), karma: r(-2, 3),
        },
      },
    });
  } else {
    choices.push({
      text: generateGambleText(age, pat, tone.suitablePaths),
      label: '冒险一搏',
      style: 'gamble',
      result: {
        type: 'continue',
        attrEffect: {
          wealth: r(-5, 18), career: r(-3, 15), health: r(-8, 2),
          love: r(-5, 10), study: r(-2, 8), social: r(-3, 12), karma: r(-1, 2),
        },
      },
    });
  }

  return choices;
}

function r(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ===== 选择文本生成 =====
function generateDestinyText(age: number, pat: string, isLucky: boolean): string {
  if (isLucky) {
    const texts: Record<string, string> = {
      '食伤生财': '顺应天时，把才华变现为财富。你感觉到命运之轮正在向你转动，机会来了就要抓住。',
      '伤官配印': '顺应命运的安排，用才华去积累声望。你的创意会在这个阶段得到认可，不必刻意强求。',
      '正官格': '按规矩办事，贵人自然会来。你的正直和守礼会为你赢得意想不到的支持。',
      '七杀格': '顺应内心的冲劲，但也懂得审时度势。该出手时就出手，该收手时就收手。',
      '从财格': '顺着财运走，该投资就投资，该理财就理财。你对金钱的敏感是天生的优势。',
      '从杀格': '顺应命运的召唤，去掌控局面。你的决断力在这个时候会发挥到极致。',
      '印绶格': '顺应学问之路，继续深造。知识是你最大的财富，这个阶段学习什么都会事半功倍。',
      '建禄格': '脚踏实地，一步一个脚印。勤劳肯干就是你的天命，付出终会有回报。',
      '杂气格': '顺其自然，随遇而安。你的适应力是你最大的优势，随波逐流反而能找到自己的方向。',
    };
    return texts[pat] || '顺应命运的安排，走好眼前的每一步。';
  }
  const texts: Record<string, string> = {
    '食伤生财': '暂时收敛锋芒，等待更好的时机。现在不是冒进的时候，韬光养晦才是上策。',
    '伤官配印': '放下执念，接受现状。有时候退一步反而能看到更广阔的天地。',
    '正官格': '守规矩，不越雷池。稳扎稳打才是你在这个阶段的生存之道。',
    '七杀格': '收敛杀气，静待时机。冲动是魔鬼，现在需要的是冷静和耐心。',
    '从财格': '保住现有的财富，不要冒险投资。留得青山在，不怕没柴烧。',
    '从杀格': '暂时退让，保存实力。权力斗争不是你这个阶段该参与的。',
    '印绶格': '专心读书，不问窗外事。知识是最安全的避风港。',
    '建禄格': '加倍努力，用汗水弥补天时。天道酬勤，你的努力不会白费。',
    '杂气格': '随遇而安，不强求。命运的波浪总有起伏，静待风平浪静。',
  };
  return texts[pat] || '顺应天命，接受当下的处境。';
}

function generateVirtueText(age: number, pat: string): string {
  return age < 30
    ? '帮助他人，积累福报。你在帮助别人的过程中，也在为自己铺设未来的路。'
    : age < 60
    ? '行善积德，回报社会。你的善举会在未来的某一天以意想不到的方式回报你。'
    : '把经验传授给后辈，留德不留财。你的智慧是这个时代最宝贵的财富。';
}

function generateAmbitionText(age: number, pat: string, strengths: string[]): string {
  const strength = strengths[0] || '拼搏';
  return age < 25
    ? `全力追求学业和事业，发挥你的${strength}优势。青春就是用来拼搏的，不要留下遗憾。`
    : age < 45
    ? `抓住事业黄金期，用${strength}打开局面。这是你人生最关键的阶段，一鼓作气再而衰。`
    : `老骥伏枥，志在千里。你的${strength}不会因为年龄增长而消退。`;
}

function generateSteadyText(age: number, pat: string): string {
  return age < 30
    ? '稳扎稳打，不冒不必要的风险。稳扎稳打才能走得更远。'
    : age < 55
    ? '巩固现有成果，不急于求成。慢就是快，稳才能赢。'
    : '安享太平，不再折腾。到了这个年纪，平稳就是最大的幸福。';
}

function generateFreeText(age: number, pat: string): string {
  const texts = [
    '听从内心的声音，做自己真正想做的事。人生苦短，何必委屈自己。',
    '不被世俗束缚，走一条属于自己的路。别人的眼光不重要，重要的是你自己开心。',
    '随性而为，让命运带你去该去的地方。有时候不计划反而是最好的计划。',
  ];
  return texts[Math.floor(Math.random() * texts.length)];
}

function generateGambleText(age: number, pat: string, paths: string[]): string {
  const path = paths[Math.floor(Math.random() * paths.length)] || '冒险';
  return `孤注一掷，${path}。成败在此一举，要么一飞冲天，要么万劫不复。你敢赌吗？`;
}

function generateGambleToughText(age: number, pat: string): string {
  return '破釜沉舟，绝地反击。你已经没有什么可失去的了，不如放手一搏。命运的转机往往就在最黑暗的时刻。';
}

function generateGambleDeadlyText(age: number, pat: string): string {
  return '明知山有虎，偏向虎山行。这一步走出去，可能就是万劫不复。但你别无选择。';
}

// ===== 死亡相关 =====
function getDeathTitle(age: number): string {
  if (age < 10) return '夭折';
  if (age < 20) return '英年早逝';
  if (age < 35) return '壮志未酬';
  if (age < 50) return '中道崩殂';
  if (age < 65) return '未能善终';
  return '寿终正寝';
}

function generateDeathReason(age: number, pat: string, wx: string): string {
  const reasons: Record<string, string[]> = {
    '木': ['从高处坠落，树枝断裂。木命之人忌高处，此劫命中注定。', '疾病缠身，医药无效。木旺则折，命数至此。'],
    '火': ['火灾之中，未能逃生。火命之人遇火劫，阴阳相消。', '急病发作，抢救无效。火旺则焚，寿元耗尽。'],
    '土': ['山崩地裂，埋于黄土。土命之人归尘土，此为大归。', '长期积劳，土崩瓦解。土厚德载，终有尽时。'],
    '金': ['利器所伤，血光之灾。金命之人遇金劫，锋锐反噬。', '车祸意外，金属相撞。金性刚烈，过刚则折。'],
    '水': ['溺水而亡，水鬼索命。水命之人忌深水，此劫难逃。', '突发洪水，随波逐流。水性无常，载舟覆舟。'],
  };
  const list = reasons[wx] || reasons['土'];
  return list[Math.floor(Math.random() * list.length)];
}

// ===== 事件生成 =====
export function generateEvent(age: number, tone: LifeTone, attrs: SixAttrs): LifeEvent {
  const isLucky = tone.luckyAges.includes(age);
  const isTough = tone.toughAges.includes(age);
  const isDeadly = tone.deathRiskAges.includes(age);

  // 生成剧情
  const story = generateStory(age, tone, isLucky, isTough, isDeadly);
  const title = generateTitle(age, tone, isLucky, isTough, isDeadly);
  const type = isDeadly ? 'deadly' : isLucky ? 'lucky' : isTough ? 'crisis' : 'normal';

  // 生成6个选择
  const choices = generateChoices(age, tone, attrs, type);

  return { age, title, story, choices, type };
}

function generateStory(age: number, tone: LifeTone, lucky: boolean, tough: boolean, deadly: boolean): string {
  const pat = tone.pattern;
  const wx = tone.wuxing;

  // 根据年龄段和格局生成剧情
  const ageStories: Record<number, string[]> = {
    1: [`你出生了。${tone.tone}。父母给你取了一个寄予厚望的名字，从此一段${pat}的命途正式开启。`, `产房外，父亲焦急地等待着第一声啼哭。你的八字${pat}，${wx}命，注定了一生的基调。`],
    10: [`进入学堂的第一天。老师严厉地告诉你"书中自有黄金屋"，而同桌总在拉你去掏鸟窝。你的${pat}特质开始显现。`, `家道中落，你从私立学校转到公立学校。曾经的朋友开始疏远你，你第一次尝到了世态炎凉。你的八字显示这个阶段有考验。`],
    20: [`大学毕业，站在人生的十字路口。左边是稳定的公务员工作，右边是一家初创公司的高风险offer。你的${pat}命格，适合${tone.suitablePaths[0] || '拼搏'}。`, `初入社会，你遇到了改变命运的贵人。他看好你的${tone.strengths[0] || '才华'}，提出收你为徒。这是千载难逢的机会。`],
    30: [`而立之年，感情和事业都到了关键节点。父母的催婚、事业的机会、内心的梦想，三方面拉扯着你。${pat}之人在30岁会面临重要抉择。`, `婚姻出现危机。柴米油盐磨平了激情，你们开始为每一件小事争吵。今天，TA提出了离婚。你的八字显示此年感情有变。`],
    40: [`不惑之年，事业到了瓶颈期，身体也开始发出信号。一次意外事件让你重新审视人生方向。${pat}之人在40岁有一次重大转折。`, `体检报告出来了：恶性肿瘤。医生说你最多还有两年。你的八字显示${wx}命在此年有大劫。`],
    50: [`知天命。半百之年，经历了人生的起起落落。身体在发出警告，提醒你要注意健康。${pat}之人50岁后进入人生下半场。`, `工作上出现了重大变故。公司裁员，你的名字在名单上。房贷还没还完，孩子还在读书。`],
    60: [`花甲之年，正式退休。最后一天走出办公楼时，你回头看了看那栋大楼——你在这里度过了四十年。`, `老伴走了。那个陪你走过四十年风雨的人，再也没有醒来。你握着TA渐渐冰冷的手，觉得自己的心也被掏空了。`],
    70: [`古稀之年，老朋友们一个接一个地离开。每次接到电话，你都害怕听到不好的消息。`, `孙子出生了。你抱着那个小小的生命，仿佛看到了当年的自己。你决定把一生的经验都教给他。`],
    80: [`耄耋之年，坐在院子里晒太阳。这一生经历过的风风雨雨，此刻都变成了眼角的皱纹和嘴角的微笑。`, '你活到了80岁。这一生的欢笑、泪水、成功、失败，都变成了珍贵的回忆。'],
  };

  const stories = ageStories[age];
  if (stories) {
    return lucky ? stories[1] || stories[0] : tough ? stories[0] : stories[Math.floor(Math.random() * stories.length)];
  }

  // 默认剧情
  if (deadly) return `这一年，你的八字显示${wx}命有冲克，是大凶之年。一场意外正在悄然逼近...`;
  if (lucky) return `这一年，大运走到吉位，你的${tone.strengths[0]}开始发光发热。机会来了，你准备好了吗？`;
  if (tough) return `这一年，流年不利，${tone.weaknesses[0]}开始显现。考验你的时候到了。`;
  return `你走到了${age}岁。${tone.tone}。这个阶段，你的${pat}特质会引导你做出重要的选择。`;
}

function generateTitle(age: number, tone: LifeTone, lucky: boolean, tough: boolean, deadly: boolean): string {
  const titles: Record<number, string[]> = {
    1: ['呱呱坠地', '天降异象', '命运启程'],
    10: ['启蒙读书', '家道中落', '少年初长成'],
    20: ['初入社会', '贵人相助', '误入歧途'],
    30: ['成家立业', '婚姻危机', '事业抉择'],
    40: ['不惑之年', '重病缠身', '中年转折'],
    50: ['知天命', '事业变故', '空巢之寂'],
    60: ['花甲之年', '丧偶之痛', '退休归隐'],
    70: ['古稀之年', '含饴弄孙', '老友离散'],
    80: ['耄耋之年', '人生回望', '寿终正寝'],
  };
  const list = titles[age] || [`${age}岁的抉择`];
  if (deadly) return list[1] || list[0];
  if (lucky) return list[2] || list[0];
  return list[0];
}

// ===== 结局评级 =====
export function getEndingGrade(attrs: SixAttrs, died: boolean, deathAge?: number) {
  const avg = (attrs.wealth + attrs.career + attrs.health + attrs.love + attrs.study + attrs.social) / 6;
  if (died) {
    if ((deathAge || 0) < 20) return { grade: '殇', title: '少年夭折', desc: '来也匆匆，去也匆匆。如流星划过夜空。' };
    if ((deathAge || 0) < 40) return { grade: '殇', title: '英年早逝', desc: '壮志未酬身先死，长使英雄泪满襟。' };
    if ((deathAge || 0) < 60) return { grade: 'C', title: '中道崩殂', desc: '走过了半程，却没能看到终点的风景。' };
    if (avg >= 55) return { grade: 'B', title: '善终', desc: '度过了充实的一生，安详离去。' };
    return { grade: 'C', title: '遗憾离场', desc: '一生艰辛，最终未能走到最后。' };
  }
  if (avg >= 75) return { grade: 'S', title: '传奇人生', desc: '各方面都达到令人艳羡的高度，堪称传奇。' };
  if (avg >= 60) return { grade: 'A', title: '精彩人生', desc: '精彩纷呈，虽有波折但收获满满。' };
  if (avg >= 45) return { grade: 'B', title: '平凡人生', desc: '平淡而真实，有欢笑也有泪水。' };
  return { grade: 'C', title: '坎坷人生', desc: '充满艰辛，但坚韧令人敬佩。' };
}

// ===== 称号系统 =====
export const TITLE_BADGES = [
  { name: '天选之子', condition: (a: SixAttrs) => a.wealth > 70 && a.career > 70, icon: '👑', color: '#fbbf24' },
  { name: '商界巨子', condition: (a: SixAttrs) => a.wealth > 80, icon: '💰', color: '#f59e0b' },
  { name: '一代宗师', condition: (a: SixAttrs) => a.career > 80, icon: '⭐', color: '#fbbf24' },
  { name: '桃李满天', condition: (a: SixAttrs) => a.study > 70, icon: '🎓', color: '#60a5fa' },
  { name: '松柏长青', condition: (a: SixAttrs) => a.health > 70, icon: '🌲', color: '#4ade80' },
  { name: '情圣', condition: (a: SixAttrs) => a.love > 70, icon: '❤️', color: '#f472b6' },
  { name: '白手起家', condition: (a: SixAttrs) => a.wealth > 60 && a.career > 60, icon: '💪', color: '#fb923c' },
  { name: '大器晚成', condition: (a: SixAttrs) => a.career > 60 && a.study > 50, icon: '🌅', color: '#a78bfa' },
  { name: '逆风翻盘', condition: (a: SixAttrs) => a.karma > 3, icon: '🔥', color: '#ef4444' },
  { name: '厚德载物', condition: (a: SixAttrs) => a.karma > 5, icon: '☯️', color: '#22d3ee' },
  { name: '命硬如铁', condition: (a: SixAttrs) => a.health < 30 && a.career > 40, icon: '🛡️', color: '#94a3b8' },
];

export function getTitles(attrs: SixAttrs) {
  return TITLE_BADGES.filter(t => t.condition(attrs));
}

// ===== K线数据 =====
export function calcScore(a: SixAttrs) {
  return Math.round((a.wealth + a.career + a.health + a.love + a.study + a.social) / 6);
}

// 获取选择颜色
export function getChoiceColor(choiceStyle: string): string {
  const map: Record<string, string> = {
    destiny: '#fbbf24', virtue: '#4ade80', ambition: '#f472b6',
    steady: '#60a5fa', free: '#a78bfa', gamble: '#ef4444',
  };
  return map[choiceStyle] || '#fbbf24';
}
