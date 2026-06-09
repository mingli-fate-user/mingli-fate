// 命理人生模拟器 v5 - 流式AI驱动引擎
// 核心：AI实时生成剧情+6选项，流式输出优先显示

export interface StreamChoice {
  text: string;
  label: string;
  style: string;
}

export interface StreamStage {
  age: number;
  title: string;
  story: string;
  choices: StreamChoice[];
}

export interface StreamDeath {
  title: string;
  reason: string;
  age: number;
}

// ===== System Prompts =====

// 1. 八字基调分析
export const TONE_PROMPT = `你是黄师傅，精通八字命理。请分析以下八字，输出JSON格式的人生基调：
{"tone":"人生基调一句话描述","pattern":"格局名称","strengths":["优势1","优势2"],"weaknesses":["劣势1","劣势2"],"luckyAges":[顺风年龄],"toughAges":[逆风年龄],"suitablePaths":["适合道路1","适合道路2"],"avoidPaths":["应避免1","应避免2"],"deathRiskAges":[高风险死亡年龄]}
只输出JSON。`;

// 2. 剧情+6选项生成
export function makeStagePrompt(age: number, gender: string, pattern: string, tone: string, strengths: string[], weaknesses: string[], suitablePaths: string[], previousChoices: string[], isLucky: boolean, isTough: boolean): string {
  const prevText = previousChoices.length > 0 ? `\n之前的选择：${previousChoices.join(' → ')}` : '';
  const luckText = isLucky ? '此时大运走到吉位，应该有好的机遇出现。' : isTough ? '此时流年不利，应该出现挑战或危机。' : '';

  return `你是黄师傅，命理人生模拟器大师。为${age}岁的${gender}命人编写人生剧情。

【八字信息】
格局：${pattern}
基调：${tone}
优势：${strengths.join('、')}
劣势：${weaknesses.join('、')}
适合道路：${suitablePaths.join('、')}${prevText}

【年龄段特征】${getAgeDesc(age)}
${luckText}

【输出规则 - 严格遵守】
1. 先输出【剧情】标记，然后写2-3句剧情
2. 再输出【选项】标记，然后输出6个选项的JSON
3. 6个选项必须差异明显，风格迥异：

   - 甲·顺应天命：最符合八字格局的安全选择
   - 乙·积德行善：帮助他人，积累福报
   - 丙·锐意进取：全力拼搏，追求事业/学业
   - 丁·守成稳进：保守稳妥，保住现有成果
   - 戊·随心而行：听从内心，不循常规
   - 己·孤注一掷：高风险高回报，可能改变命运也可能万劫不复

4. 剧情要贴合${pattern}的格局特征
5. 选项文字要有文学性，不要空洞
6. 如果${age}岁是高风险死亡年龄，可以在"己"选项中设置死亡结局

【输出格式示例】
【剧情】
（2-3句贴合命格的剧情描述）

【选项】
[{"text":"...","label":"...","style":"destiny"},...6个]

style字段只能是：destiny(顺应),virtue(积德),ambition(进取),steady(守成),free(随心),gamble(孤注)`;
}

// 3. 选择后果+下一段剧情
export function makeConsequencePrompt(age: number, choiceLabel: string, choiceText: string, pattern: string, tone: string, previousStory: string): string {
  return `你是黄师傅。玩家在当前剧情中选择了"${choiceLabel}"："${choiceText}"。

【当前剧情】
${previousStory}

【八字格局】${pattern}，${tone}

【输出规则】
1. 先输出【后果】标记，写2-3句选择后的结果描述（必须贴合选择内容，有具体细节）
2. 再输出【属性】标记，然后输出JSON：{"wealth":变化,"career":变化,"health":变化,"love":变化,"study":变化,"social":变化,"karma":变化}
   每个属性变化范围-15到+15，数字，正负号都要写
3. 如果这是死亡选择，直接输出【死亡】标记+死亡描述+死亡原因

【格式示例】
【后果】
（2-3句具体后果描述）

【属性】
{"wealth":+5,"career":-3,"health":+2,"love":0,"study":+8,"social":-2,"karma":+1}`;
}

function getAgeDesc(age: number): string {
  const descs: Record<number, string> = {
    1: '幼年时期，命运的种子刚刚种下。',
    10: '少年时期，性格开始显现，第一次面对世界的考验。',
    20: '青年时期，初入社会，面临事业和感情的选择。',
    30: '而立之年，成家立业的关键节点。',
    40: '不惑之年，中年危机或事业高峰。',
    50: '知天命，人生下半场开始。',
    60: '花甲之年，退休或继续奋斗。',
    70: '古稀之年，回顾一生。',
    80: '耄耋之年，人生终章。',
  };
  return descs[age] || '人生的重要阶段。';
}

// ===== 流式解析器 =====

// 从流式输出中提取剧情
export function extractStory(text: string): string | null {
  const match = text.match(/【剧情】\s*\n?\s*([\s\S]*?)(?=\n?\s*【选项】|$)/);
  if (match && match[1].trim().length > 10) {
    return match[1].trim();
  }
  return null;
}

// 从流式输出中提取选项JSON
export function extractChoices(text: string): StreamChoice[] | null {
  const match = text.match(/【选项】\s*\n?\s*(\[[\s\S]*\])/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed) && parsed.length >= 4) {
        return parsed.map((c: any) => ({
          text: String(c.text || ''),
          label: String(c.label || ''),
          style: String(c.style || 'destiny'),
        })).filter((c: StreamChoice) => c.text.length > 0);
      }
    } catch { /* not complete yet */ }
  }
  return null;
}

// 从流式输出中提取后果
export function extractConsequence(text: string): string | null {
  const match = text.match(/【后果】\s*\n?\s*([\s\S]*?)(?=\n?\s*【属性】|$)/);
  if (match && match[1].trim().length > 5) {
    return match[1].trim();
  }
  return null;
}

// 从流式输出中提取属性变化
export function extractAttrChanges(text: string): Partial<Record<string, number>> | null {
  const match = text.match(/【属性】\s*\n?\s*(\{[\s\S]*\})/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch { /* not complete */ }
  }
  return null;
}

// 检查是否死亡
export function extractDeath(text: string): { title: string; reason: string } | null {
  const match = text.match(/【死亡】\s*\n?\s*([\s\S]*)/);
  if (match) {
    const lines = match[1].trim().split('\n').filter(l => l.trim());
    return {
      title: lines[0]?.replace(/^[^：]*：/, '').trim() || '英年早逝',
      reason: lines.slice(1).join('\n').trim() || '命运到此为止。',
    };
  }
  return null;
}

// 六维属性类型
export interface SixAttrs {
  wealth: number; career: number; health: number;
  love: number; study: number; social: number; karma: number;
}

export function applyAttrChanges(current: SixAttrs, changes: Partial<Record<string, number>>): SixAttrs {
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  return {
    wealth: clamp(current.wealth + (changes.wealth || 0)),
    career: clamp(current.career + (changes.career || 0)),
    health: clamp(current.health + (changes.health || 0)),
    love: clamp(current.love + (changes.love || 0)),
    study: clamp(current.study + (changes.study || 0)),
    social: clamp(current.social + (changes.social || 0)),
    karma: current.karma + (changes.karma || 0),
  };
}

// 结局评级
export function getEnding(avg: number, died: boolean, deathAge?: number): { grade: string; title: string; desc: string } {
  if (died) {
    if ((deathAge || 0) < 20) return { grade: '殇', title: '少年夭折', desc: '来也匆匆，去也匆匆。如流星划过夜空。' };
    if ((deathAge || 0) < 40) return { grade: '殇', title: '英年早逝', desc: '壮志未酬身先死。' };
    if ((deathAge || 0) < 60) return { grade: 'C', title: '中道崩殂', desc: '走过了半程，没能看到终点。' };
    return { grade: 'B', title: '善终', desc: '度过了充实的一生，安详离去。' };
  }
  if (avg >= 75) return { grade: 'S', title: '传奇人生', desc: '各方面达到令人艳羡的高度。' };
  if (avg >= 60) return { grade: 'A', title: '精彩人生', desc: '精彩纷呈，虽有波折但收获满满。' };
  if (avg >= 45) return { grade: 'B', title: '平凡人生', desc: '平淡而真实，有欢笑也有泪水。' };
  return { grade: 'C', title: '坎坷人生', desc: '充满艰辛，但坚韧令人敬佩。' };
}

// K线分数
export function calcScore(a: SixAttrs): number {
  return Math.round((a.wealth + a.career + a.health + a.love + a.study + a.social) / 6);
}

// 选择样式颜色
export const CHOICE_STYLES: Record<string, { color: string; glow: string; bg: string; border: string; icon: string }> = {
  destiny:  { color: '#fbbf24', glow: 'rgba(251,191,36,0.3)', bg: 'rgba(251,191,36,0.04)', border: 'rgba(251,191,36,0.15)', icon: '甲' },
  virtue:   { color: '#4ade80', glow: 'rgba(74,222,128,0.3)', bg: 'rgba(74,222,128,0.04)', border: 'rgba(74,222,128,0.15)', icon: '乙' },
  ambition: { color: '#f472b6', glow: 'rgba(244,114,182,0.3)', bg: 'rgba(244,114,182,0.04)', border: 'rgba(244,114,182,0.15)', icon: '丙' },
  steady:   { color: '#60a5fa', glow: 'rgba(96,165,250,0.3)', bg: 'rgba(96,165,250,0.04)', border: 'rgba(96,165,250,0.15)', icon: '丁' },
  free:     { color: '#a78bfa', glow: 'rgba(167,139,250,0.3)', bg: 'rgba(167,139,250,0.04)', border: 'rgba(167,139,250,0.15)', icon: '戊' },
  gamble:   { color: '#ef4444', glow: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.04)', border: 'rgba(239,68,68,0.15)', icon: '己' },
};
