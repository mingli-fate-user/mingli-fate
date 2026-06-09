// 我是大师 - 命理师考核游戏引擎
// AI随机出命/卦，用户分析，AI评分纠错

export type GameMode = 'bazi' | 'ziwei' | 'liuyao' | 'meihua';

export interface BaziInfo {
  year: number; month: number; day: number; hour: number;
  gender: 'male' | 'female';
  pillar: string; // 四柱
  pattern: string; // 格局
  daYun: string[]; // 大运
}

export interface ZiWeiInfo {
  year: number; month: number; day: number; hour: number;
  gender: 'male' | 'female';
  mingZhu: string; // 命宫主星
  mingGong: string; // 命宫位置
  shenGong: string; // 身宫
  majorStars: string[]; // 主星分布
  minorStars: string[]; // 辅星
}

export interface GuaInfo {
  benGua: string; // 本卦
  bianGua: string; // 变卦
  huGua: string; // 互卦
  yaoCi: string[]; // 动爻
  shiYing: string; // 世应
  liuQin: string[]; // 六亲持世
  voids: string[]; // 旬空
  question: string; // 所占之事
  questioner: string; // 问卦人背景
}

export interface AIAnswer {
  overallPattern: string; // 一生格局走向 40分
  wealth: string; // 财运 10分
  marriage: string; // 婚姻 10分
  friendship: string; // 交友 10分
  career: string; // 事业 10分
  family: string; // 家庭 10分
  parents: string; // 父母 10分
}

export interface ScoreResult {
  overallPattern: { score: number; maxScore: number; feedback: string };
  wealth: { score: number; maxScore: number; feedback: string };
  marriage: { score: number; maxScore: number; feedback: string };
  friendship: { score: number; maxScore: number; feedback: string };
  career: { score: number; maxScore: number; feedback: string };
  family: { score: number; maxScore: number; feedback: string };
  parents: { score: number; maxScore: number; feedback: string };
  total: number;
  maxTotal: number;
  grade: string;
  summary: string;
  studyAdvice: string;
}

export interface LiuYaoAnswer {
  analysis: string; // AI的断卦分析
  result: string; // 最终断语
}

// ===== 随机生成 =====

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomGender(): 'male' | 'female' {
  return Math.random() > 0.5 ? 'male' : 'female';
}

export function generateRandomBazi(): BaziInfo {
  const year = randInt(1950, 2005);
  const month = randInt(1, 12);
  const day = randInt(1, 28);
  const hour = randInt(0, 23);
  const gender = randomGender();
  return { year, month, day, hour, gender, pillar: '', pattern: '', daYun: [] };
}

export function generateRandomZiWei(): ZiWeiInfo {
  const year = randInt(1950, 2005);
  const month = randInt(1, 12);
  const day = randInt(1, 28);
  const hour = randInt(0, 23);
  const gender = randomGender();
  return { year, month, day, hour, gender, mingZhu: '', mingGong: '', shenGong: '', majorStars: [], minorStars: [] };
}

export function generateRandomGua(): GuaInfo {
  const guaNames = ['乾','坤','屯','蒙','需','讼','师','比','小畜','履','泰','否','同人','大有','谦','豫','随','蛊','临','观','噬嗑','贲','剥','复','无妄','大畜','颐','大过','坎','离','咸','恒','遁','大壮','晋','明夷','家人','睽','蹇','解','损','益','夬','姤','萃','升','困','井','革','鼎','震','艮','渐','归妹','丰','旅','巽','兑','涣','节','中孚','小过','既济','未济'];
  const questions = [
    '占问此行求财可否得利',
    '占问此桩生意能否谈成',
    '占问与某人合作是否顺利',
    '占问此次考试能否高中',
    '占问遗失之物能否寻回',
    '占问此病何时能愈',
    '占问外出远行是否平安',
    '占问这段感情能否修成正果',
    '占问这份工作是否适合长久做',
    '占问搬家迁居是否吉利',
    '占问买房置业是否合适',
    '占问与他人纠纷能否化解',
    '占问求官升迁有无希望',
    '占问投资股票能否获利',
    '占问此次诉讼结果如何',
  ];
  const questioners = [
    '一位三十余岁的商人，神色焦虑，衣着华贵但略有风尘之色',
    '一位二十岁出头的青年书生，手持书卷，眼神中带着对未来的期许',
    '一位四十多岁的妇人，衣着朴素，面带愁容，似有家庭烦忧',
    '一位五十来岁的老者，神态沉稳，但眉宇间隐隐有不安之色',
    '一位年轻女子，约二十五六岁，神色忐忑，似有感情困惑',
    '一位中年男子，身着工装，双手粗糙，似是工匠或体力劳动者',
    '一位锦衣玉带的贵公子，约三十出头，面带傲气但眼中藏着疑虑',
  ];
  return {
    benGua: guaNames[randInt(0, guaNames.length - 1)],
    bianGua: guaNames[randInt(0, guaNames.length - 1)],
    huGua: guaNames[randInt(0, guaNames.length - 1)],
    yaoCi: [`第${randInt(1,6)}爻动`],
    shiYing: ['世','应'][randInt(0,1)] + '在' + ['初','二','三','四','五','上'][randInt(0,5)] + '爻',
    liuQin: ['父母持世','官鬼持世','妻财持世','子孙持世','兄弟持世'],
    voids: ['日空','旬空'],
    question: questions[randInt(0, questions.length - 1)],
    questioner: questioners[randInt(0, questioners.length - 1)],
  };
}

// ===== AI Prompts =====

export const NO_MD = '不要markdown，不要编号，纯文本输出。';

// 八字排盘 prompt
export function makeBaziPrompt(info: BaziInfo): string {
  const genderText = info.gender === 'male' ? '男' : '女';
  return `你是黄师傅，精通八字命理。请为以下八字排盘并输出详细信息。
【重要：只排盘，不分析！不判断格局好坏，不预测运势，不给出任何吉凶断语！只列出排盘结果】

【生辰】公历 ${info.year}年${info.month}月${info.day}日 ${info.hour}时
【性别】${genderText}

请输出以下内容（纯文本，不要markdown）：
1. 四柱八字（年柱、月柱、日柱、时柱），注明天干地支的五行属性
2. 日主及五行属性
3. 十神分布（只列出十神名称，不做解读）
4. 格局判断（只说出格局名称如"正官格"，不解释好坏）
5. 大运排列（起运年龄及每步大运干支）
6. 当前所处大运

【严禁】
- 不写"此命"、"格局不错"、"运势"等分析性语句
- 不做任何吉凶判断
- 不给出任何运势预测
- 只列出排盘事实数据`;
}

// AI分析八字答案 prompt
export function makeBaziAnswerPrompt(pillar: string, pattern: string, gender: string): string {
  return `你是黄师傅，八字命理宗师。请严格分析以下八字，输出JSON格式的标准答案。

【八字】${pillar}
【性别】${gender}
【格局】${pattern}

请输出以下7个维度的标准答案（JSON格式）：
{
  "overallPattern": "此命一生格局走向的总评，200字左右，从格局高低、五行平衡、大运走势来论断",
  "wealth": "财运分析，80字左右，包括财源、守财能力、发财时机",
  "marriage": "婚姻分析，80字左右，包括配偶特征、婚姻时机、婚姻质量",
  "friendship": "交友分析，80字左右，包括朋友类型、贵人运、防小人",
  "career": "事业分析，80字左右，包括适合行业、事业高低、转职时机",
  "family": "家庭分析，80字左右，包括家庭氛围、子女缘、家宅运势",
  "parents": "父母分析，80字左右，包括父母缘深浅、父母健康、与父母关系"
}

要求：
1. 必须是严格的JSON格式
2. 每个字段都要具体、有依据，不能泛泛而谈
3. 分析要有命理依据（十神、五行、宫位等）
4. 只输出JSON，不要有其他文字`;
}

// 评分 prompt
export function makeScorePrompt(
  mode: 'bazi' | 'ziwei',
  pillar: string, pattern: string, gender: string,
  userAnswers: Record<string, string>,
  aiAnswers: AIAnswer
): string {
  const dimensions = [
    { key: 'overallPattern', name: '一生格局走向', score: 40 },
    { key: 'wealth', name: '财运', score: 10 },
    { key: 'marriage', name: '婚姻', score: 10 },
    { key: 'friendship', name: '交友', score: 10 },
    { key: 'career', name: '事业', score: 10 },
    { key: 'family', name: '家庭', score: 10 },
    { key: 'parents', name: '父母', score: 10 },
  ];

  let userText = '';
  let aiText = '';
  for (const d of dimensions) {
    userText += `\n【${d.name}】\n用户：${userAnswers[d.key] || '未填写'}\n`;
    aiText += `\n【${d.name}】\n标准：${(aiAnswers as any)[d.key] || ''}\n`;
  }

  const isZiWei = mode === 'ziwei';
  const title = isZiWei ? '紫微斗数' : '八字命理';
  const panType = isZiWei ? '紫微命盘' : '八字';
  const basisNote = isZiWei ? '评分要关注主星庙旺、三方四正、四化飞星、宫位吉凶' : '评分要关注五行旺衰、格局成败、大运配合、十神宫位';

  return `你是黄师傅，${title}宗师兼温柔导师。请对用户提交的${title}分析进行合理评分，既要肯定用户的努力，也要指出不足之处。

【命盘信息】
${panType}：${pillar}
性别：${gender}
格局：${pattern}

【用户答案】${userText}

【标准答案】${aiText}

请输出以下格式的JSON评分结果：
{
  "overallPattern": { "score": 0-40, "feedback": "具体评价，多鼓励，指出对在哪里、哪里可以改进" },
  "wealth": { "score": 0-10, "feedback": "具体评价，多鼓励" },
  "marriage": { "score": 0-10, "feedback": "具体评价，多鼓励" },
  "friendship": { "score": 0-10, "feedback": "具体评价，多鼓励" },
  "career": { "score": 0-10, "feedback": "具体评价，多鼓励" },
  "family": { "score": 0-10, "feedback": "具体评价，多鼓励" },
  "parents": { "score": 0-10, "feedback": "具体评价，多鼓励" },
  "total": 总分,
  "grade": "评级文字（命理小白/初学入门/略有小成/登堂入室/一代宗师之一）",
  "summary": "200字左右的总体评价，以鼓励为主",
  "studyAdvice": "针对用户薄弱环节给出温和的学习建议，鼓励用户继续学习"
}

评分原则：
1. 鼓励为主，但也不能盲目给满分
2. 说对了关键点给较高分，方向对但不够深入给中等分
3. 说错了温和指出并解释正确答案
4. 即使分析不够全面，只要方向对也要给一定分数（最低给满分的30%）
5. ${basisNote}
6. 各分项要关注对应宫位和星曜/十神
7. 整体格局分析（40分）要宽松一些，鼓励用户大胆分析
8. 只输出JSON，不要其他文字`;
}

// 六爻排盘 prompt
export function makeLiuYaoPrompt(info: GuaInfo): string {
  return `你是六爻大师。请为以下占卦排盘。
【重要：只排卦，不断卦！不分析吉凶，不判断结果，不给出任何断语！只列出排卦数据】

【占卦人】${info.questioner}
【所占之事】${info.question}
【本卦】${info.benGua}
【变卦】${info.bianGua}
【互卦】${info.huGua}
【动爻】${info.yaoCi.join('、')}
【世应】${info.shiYing}

请输出：
1. 完整的六爻排盘（本卦六亲、六神、五行）— 只列数据
2. 用神取法 — 只说取什么为用神，不解释原因
3. 世应关系 — 只写世爻应爻位置，不做吉凶判断
4. 动爻变化 — 只写动爻变为什么，不做结果推断
5. 旬空、月破、日冲等神煞 — 只列出来，不解读

【严禁】
- 不写"此卦"、"大吉"、"不利"、"结果"等断语
- 不推断任何事情的结果
- 不给出任何吉凶判断
- 只列出排卦客观数据`;
}

// AI断卦答案 prompt
export function makeLiuYaoAnswerPrompt(info: GuaInfo): string {
  return `你是六爻大师。请对以下卦象进行断卦分析，输出JSON格式：

【占卦人】${info.questioner}
【所占之事】${info.question}
【本卦】${info.benGua}
【变卦】${info.bianGua}
【互卦】${info.huGua}
【动爻】${info.yaoCi.join('、')}
【世应】${info.shiYing}

输出JSON：
{
  "analysis": "详细的断卦分析过程，300字左右，包括用神旺衰、世应关系、动爻影响、结果推断",
  "result": "最终断语，80字左右，明确给出吉凶判断和具体建议"
}

只输出JSON`;
}

// 六爻评分 prompt
export function makeLiuYaoScorePrompt(info: GuaInfo, userAnalysis: string, userResult: string, aiAnswer: LiuYaoAnswer): string {
  return `你是六爻宗师兼温柔导师。请对用户提交的断卦进行合理评分，鼓励为主。

【卦象信息】
占卦人：${info.questioner}
所占之事：${info.question}
本卦：${info.benGua}
变卦：${info.bianGua}
动爻：${info.yaoCi.join('、')}

【用户断卦】
分析过程：${userAnalysis}
最终断语：${userResult}

【标准断卦】
分析过程：${aiAnswer.analysis}
最终断语：${aiAnswer.result}

请输出JSON评分：
{
  "analysisScore": 0-50,
  "analysisFeedback": "多鼓励，指出对在哪里、哪里可以改进",
  "resultScore": 0-30,
  "resultFeedback": "以鼓励为主",
  "logicScore": 0-20,
  "logicFeedback": "多肯定推理思路",
  "total": 总分,
  "grade": "评级（六爻小白/初学入门/略有小成/登堂入室/一代宗师之一）",
  "summary": "以鼓励为主的总体评价",
  "studyAdvice": "温和的学习建议"
}

评分原则：
1. 鼓励为主，方向对就给较高分
2. 即使不全面，方向正确就给一定分数（最低给满分的30%）
3. 说错了温和指出
4. 只输出JSON`;
}

// 梅花易数 prompt
export function makeMeiHuaPrompt(info: GuaInfo): string {
  return `你是梅花易数大师。请为以下占卦排盘。
【重要：只排卦，不断卦！不分析吉凶，不判断结果，不给出任何断语！只列出排卦数据】

【占卦人】${info.questioner}
【所占之事】${info.question}
【本卦】${info.benGua}
【变卦】${info.bianGua}
【互卦】${info.huGua}
【动爻】${info.yaoCi.join('、')}

请输出：
1. 梅花易数排盘（本卦、变卦、互卦的卦象排列）
2. 体用关系 — 只写哪个是体卦哪个是用卦，不解释吉凶
3. 八卦类象 — 只列出每个卦对应的基本类象，不做事情推断
4. 生克关系 — 只写五行生克链（如金克木），不推断结果

【严禁】
- 不写"大吉"、"不利"、"成败"、"结果"等断语
- 不推断所占之事的吉凶
- 不给出任何结论性判断
- 只列出排卦客观数据`;
}

export function makeMeiHuaAnswerPrompt(info: GuaInfo): string {
  return `你是梅花易数大师。请对以下卦象进行断卦，输出JSON：

【占卦人】${info.questioner}
【所占之事】${info.question}
【本卦】${info.benGua}
【变卦】${info.bianGua}
【互卦】${info.huGua}
【动爻】${info.yaoCi.join('、')}

输出JSON：
{
  "analysis": "详细断卦分析，300字左右，包括体用生克、卦象类象、动变影响",
  "result": "最终断语，80字左右"
}
只输出JSON`;
}

export function makeMeiHuaScorePrompt(info: GuaInfo, userAnalysis: string, userResult: string, aiAnswer: LiuYaoAnswer): string {
  return `你是梅花易数宗师兼严师。请对用户断卦评分。

【卦象】
占卦人：${info.questioner}
所占之事：${info.question}
本卦：${info.benGua}
变卦：${info.bianGua}
动爻：${info.yaoCi.join('、')}

【用户断卦】
分析：${userAnalysis}
断语：${userResult}

【标准断卦】
分析：${aiAnswer.analysis}
断语：${aiAnswer.result}

输出JSON：
{
  "analysisScore": 0-50,
  "analysisFeedback": "对体用分析、类象运用、生克判断的评价",
  "resultScore": 0-30,
  "resultFeedback": "对最终断语的评价",
  "logicScore": 0-20,
  "logicFeedback": "对推理逻辑的评价",
  "total": 总分,
  "grade": "评级",
  "summary": "总体评价",
  "studyAdvice": "具体学习建议"
}
严格客观，只输出JSON`;
}

// 评分解析
export function parseScoreJSON(jsonText: string): ScoreResult | null {
  try {
    const m = jsonText.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const d = JSON.parse(m[0]);
    return {
      overallPattern: { score: d.overallPattern?.score || 0, maxScore: 40, feedback: d.overallPattern?.feedback || '' },
      wealth: { score: d.wealth?.score || 0, maxScore: 10, feedback: d.wealth?.feedback || '' },
      marriage: { score: d.marriage?.score || 0, maxScore: 10, feedback: d.marriage?.feedback || '' },
      friendship: { score: d.friendship?.score || 0, maxScore: 10, feedback: d.friendship?.feedback || '' },
      career: { score: d.career?.score || 0, maxScore: 10, feedback: d.career?.feedback || '' },
      family: { score: d.family?.score || 0, maxScore: 10, feedback: d.family?.feedback || '' },
      parents: { score: d.parents?.score || 0, maxScore: 10, feedback: d.parents?.feedback || '' },
      total: d.total || 0,
      maxTotal: 100,
      grade: d.grade || '未评级',
      summary: d.summary || '',
      studyAdvice: d.studyAdvice || '',
    };
  } catch { return null; }
}

export function parseGuaScoreJSON(jsonText: string): any {
  try {
    const m = jsonText.match(/\{[\s\S]*\}/);
    if (!m) return null;
    return JSON.parse(m[0]);
  } catch { return null; }
}

export function parseAIAnswerJSON(jsonText: string): AIAnswer | null {
  try {
    const m = jsonText.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const d = JSON.parse(m[0]);
    return {
      overallPattern: d.overallPattern || d.overall || '',
      wealth: d.wealth || '',
      marriage: d.marriage || '',
      friendship: d.friendship || '',
      career: d.career || '',
      family: d.family || '',
      parents: d.parents || '',
    };
  } catch { return null; }
}

export function parseLiuYaoAnswerJSON(jsonText: string): LiuYaoAnswer | null {
  try {
    const m = jsonText.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const d = JSON.parse(m[0]);
    return { analysis: d.analysis || '', result: d.result || '' };
  } catch { return null; }
}
