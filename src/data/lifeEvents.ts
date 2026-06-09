// 命理人生模拟器 - 庞大事件库（支持死亡、转折、分支）
// 本地预制90%内容，AI只生成个性化总结 → 秒开

export interface LifeEvent {
  age: number;
  title: string;
  story: string;
  choices: [Choice, Choice];
  type: 'normal' | 'deadly' | 'turning' | 'lucky' | 'disaster';
  daYun: string;
}

export interface Choice {
  text: string;
  label: string;
  // 结果可以是：继续下一段、死亡、跳转到特定段、属性变化
  result: {
    type: 'continue' | 'death' | 'jump' | 'branch';
    deathTitle?: string;       // 死亡时显示
    deathReason?: string;      // 死亡原因
    jumpToAge?: number;        // 跳转到的年龄
    branchEvents?: LifeEvent[]; // 分支剧情
    attrEffect?: Partial<SixAttrs>;
    karma?: number; // 因果值 (+顺 -逆)
  };
}

export interface SixAttrs {
  wealth: number;
  career: number;
  health: number;
  love: number;
  study: number;
  social: number;
  karma: number; // 因果值：正值积德，负值损德
}

export const AGE_KEYS = [1, 10, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80] as const;

// 事件库：每个年龄段有多个可能事件，随机抽取
export const EVENT_POOL: Record<number, LifeEvent[]> = {
  1: [
    {
      age: 1, title: '呱呱坠地', type: 'normal', daYun: '早年运',
      story: '你出生了。产房外的父亲焦急地等待着第一声啼哭。八字排开，命盘既定。父母给你取了一个寄予厚望的名字。',
      choices: [
        { text: '在父母的呵护下健康成长，性格温和', label: '顺', result: { type: 'continue', attrEffect: { health: 5, love: 5 }, karma: 1 } },
        { text: '体弱多病但意志坚强，从小就知道要靠自己', label: '逆', result: { type: 'continue', attrEffect: { health: -3, study: 5 }, karma: 0 } },
      ],
    },
    {
      age: 1, title: '天降异象', type: 'lucky', daYun: '早年运',
      story: '你出生的那天，家中来了位云游道士。他看了你的八字后大为惊叹，说此子命带贵人，将来必成大器。父母大喜，但也因此对你期望极高。',
      choices: [
        { text: '接受了这份"天命"，从小努力不负众望', label: '顺', result: { type: 'continue', attrEffect: { study: 8, social: 3 }, karma: 1 } },
        { text: '厌倦了被"神化"的压力，偏要走自己的路', label: '逆', result: { type: 'continue', attrEffect: { study: -2, career: 5 }, karma: 0 } },
      ],
    },
  ],
  10: [
    {
      age: 10, title: '启蒙读书', type: 'normal', daYun: '少年运',
      story: '你背起书包走进学堂。老师是个严厉的老学究，第一天就告诉你："书中自有黄金屋。"同桌是个调皮的男孩，总拉着你去掏鸟窝。',
      choices: [
        { text: '听老师的话，认真读书，成绩优异', label: '顺', result: { type: 'continue', attrEffect: { study: 10, wealth: 2 }, karma: 1 } },
        { text: '跟同桌调皮捣蛋，成绩一般但学会了察言观色', label: '逆', result: { type: 'continue', attrEffect: { study: -3, social: 8, health: 2 }, karma: 0 } },
      ],
    },
    {
      age: 10, title: '家道中落', type: 'disaster', daYun: '少年运',
      story: '父亲生意失败，家里一夜之间从小康跌入困顿。你不得不从私立学校转到公立学校。曾经的朋友开始疏远你，你第一次尝到了世态炎凉。',
      choices: [
        { text: '默默承受，更加发奋读书，发誓要改变命运', label: '顺', result: { type: 'continue', attrEffect: { study: 10, wealth: -5, health: -2 }, karma: 2 } },
        { text: '愤世嫉俗，开始叛逆，跟不良少年混在一起', label: '逆', result: { type: 'continue', attrEffect: { study: -5, social: 5, health: -3 }, karma: -1 } },
      ],
    },
    {
      age: 10, title: '溺水之劫', type: 'deadly', daYun: '少年运',
      story: '夏日午后，你跟几个小伙伴偷偷去河边游泳。河水看似平静，实则暗流涌动。一个猛子扎下去，你被水草缠住了脚踝...',
      choices: [
        { text: '拼命挣扎，抓住了漂来的浮木', label: '死里逃生', result: { type: 'continue', attrEffect: { health: -5 }, karma: 0 } },
        { text: '越挣扎缠得越紧...', label: '殒命', result: { type: 'death', deathTitle: '少年夭折', deathReason: '10岁那年，你在河边游泳时被水草缠住，再也没能浮出水面。你的八字水旺忌水，命中此一劫，未能度过。' } },
      ],
    },
  ],
  20: [
    {
      age: 20, title: '初入社会', type: 'normal', daYun: '青年运',
      story: '大学毕业，你站在人生的十字路口。左边是一份稳定的公务员工作，右边是一家初创公司的高风险offer。父母希望你安稳，朋友劝你闯一闯。',
      choices: [
        { text: '听从父母，考了公务员，端起铁饭碗', label: '顺', result: { type: 'continue', attrEffect: { career: 5, wealth: 5, health: 2 }, karma: 0 } },
        { text: '加入创业公司，all in自己的青春', label: '逆', result: { type: 'continue', attrEffect: { career: 12, wealth: -3, health: -5 }, karma: 0 } },
      ],
    },
    {
      age: 20, title: '车祸横祸', type: 'deadly', daYun: '青年运',
      story: '深夜加班完回家的路上，一辆闯红灯的货车朝你冲来。时间仿佛凝固了。你看到了司机惊恐的脸，也看到了自己来不及实现的梦想。',
      choices: [
        { text: '千钧一发之际向旁边扑去', label: '九死一生', result: { type: 'continue', attrEffect: { health: -15, career: 3 }, karma: 1 } },
        { text: '来不及反应...', label: '殒命', result: { type: 'death', deathTitle: '英年早逝', deathReason: '20岁那年，一场突如其来的车祸夺走了你的生命。你的八字显示此年有冲克，命中该有此劫。来不及看完这个世界，你悄然离去。' } },
      ],
    },
    {
      age: 20, title: '贵人相助', type: 'lucky', daYun: '青年运',
      story: '你在一次偶然的机会中结识了一位行业大佬。他看好你的潜力，提出收你为徒。这是无数人求之不得的机会，但也是一条不能回头的路。',
      choices: [
        { text: '拜入师门，从此平步青云', label: '顺', result: { type: 'continue', attrEffect: { career: 15, social: 10, wealth: 5 }, karma: 1 } },
        { text: '婉拒好意，想靠自己打拼', label: '逆', result: { type: 'continue', attrEffect: { career: 3, social: -3 }, karma: -1 } },
      ],
    },
    {
      age: 20, title: '误入歧途', type: 'turning', daYun: '青年运',
      story: '你交了一群"朋友"，他们带你出入赌场夜店。一开始只是玩玩，后来越陷越深。直到有一天，你欠下了高利贷...',
      choices: [
        { text: '及时收手，向家人坦白，重新做人', label: '回头是岸', result: { type: 'continue', attrEffect: { wealth: -10, health: -5, love: -3 }, karma: 1 } },
        { text: '越陷越深，借钱翻本', label: '继续堕落', result: { type: 'continue', attrEffect: { wealth: -20, health: -10, career: -5, love: -5 }, karma: -3 } },
      ],
    },
  ],
  25: [
    {
      age: 25, title: '情窦初开', type: 'normal', daYun: '青年运',
      story: '你在一次聚会上遇到了那个让你心动的人。TA的笑容像春天的阳光。但你的事业刚刚起步，两边都需要时间和精力。',
      choices: [
        { text: '勇敢表白，携手共度', label: '顺', result: { type: 'continue', attrEffect: { love: 15, career: -3, wealth: -2 }, karma: 1 } },
        { text: '以事业为重，暂时放下感情', label: '逆', result: { type: 'continue', attrEffect: { career: 10, love: -5, social: -2 }, karma: 0 } },
      ],
    },
    {
      age: 25, title: '创业失败', type: 'disaster', daYun: '青年运',
      story: '你的创业公司资金链断裂，合伙人卷钱跑路。你欠了一屁股债，连房租都交不起。深夜你坐在天桥上，看着车来车往...',
      choices: [
        { text: '擦干眼泪，找份工作从头再来', label: '东山再起', result: { type: 'continue', attrEffect: { wealth: -15, career: 5, health: -5 }, karma: 2 } },
        { text: '心灰意冷，从天桥一跃而下', label: '殒命', result: { type: 'death', deathTitle: '壮志未酬', deathReason: '25岁那年，创业失败负债累累的你从天桥上一跃而下。你的八字财星过旺而身弱，扛不住大运的折腾。这一跃，结束了一切。' } },
      ],
    },
  ],
  30: [
    {
      age: 30, title: '而立之年', type: 'normal', daYun: '壮年运',
      story: '三十岁了，父母的白发越来越多。他们开始催婚，七大姑八大姨给你介绍了一个条件不错的对象。你自己心里却还有未完成的梦想。',
      choices: [
        { text: '听从安排，成家立业', label: '顺', result: { type: 'continue', attrEffect: { love: 10, wealth: 3, career: -2 }, karma: 0 } },
        { text: '继续追梦，不成不归', label: '逆', result: { type: 'continue', attrEffect: { career: 10, love: -5, health: -3 }, karma: 0 } },
      ],
    },
    {
      age: 30, title: '重病缠身', type: 'disaster', daYun: '壮年运',
      story: '长期熬夜加班终于拖垮了身体。一纸诊断书：恶性肿瘤。医生说你最多还有两年时间。你需要做出人生最重要的决定。',
      choices: [
        { text: '积极治疗，调整心态，与病魔抗争', label: '抗争', result: { type: 'continue', attrEffect: { health: -20, wealth: -10, love: 10 }, karma: 3 } },
        { text: '放弃治疗，用最后的时间去看世界', label: '逆', result: { type: 'continue', attrEffect: { health: -30, wealth: -15, love: 5, social: 5 }, karma: 1 } },
      ],
    },
    {
      age: 30, title: '飞来横祸', type: 'deadly', daYun: '壮年运',
      story: '你在国外出差时遇到了恐怖袭击。枪声、尖叫、玻璃碎裂的声音。你在混乱中倒地，鲜血从胸口涌出...',
      choices: [
        { text: '被救援队及时发现，送往医院', label: '大难不死', result: { type: 'continue', attrEffect: { health: -20, wealth: -5 }, karma: 2 } },
        { text: '失血过多...', label: '殒命', result: { type: 'death', deathTitle: '客死他乡', deathReason: '30岁那年，你在海外出差时遭遇恐怖袭击，身中数弹，抢救无效。你的八字显示此年驿马逢冲，不宜远行。这一去，再也没能回来。' } },
      ],
    },
  ],
  35: [
    {
      age: 35, title: '中年危机', type: 'turning', daYun: '壮年运',
      story: '35岁，公司裁员名单上有你。房贷还没还完，孩子刚上幼儿园。你看着镜子里日渐油腻的自己，第一次感到了深深的无力。',
      choices: [
        { text: '放下身段，从基层重新做起', label: '能屈能伸', result: { type: 'continue', attrEffect: { career: -5, wealth: -5, health: -3 }, karma: 2 } },
        { text: '破釜沉舟，创业当老板', label: '背水一战', result: { type: 'continue', attrEffect: { career: 15, wealth: -10, health: -8 }, karma: 0 } },
      ],
    },
    {
      age: 35, title: '桃花劫', type: 'deadly', daYun: '壮年运',
      story: '你遇到了一个让你神魂颠倒的人，明知对方已婚还是无法自拔。对方的配偶发现了你们的关系，带着人找上门来...',
      choices: [
        { text: '跪地求饶，承诺断了联系', label: '苟活', result: { type: 'continue', attrEffect: { love: -10, health: -10, social: -10 }, karma: -2 } },
        { text: '冲突中被打中头部...', label: '殒命', result: { type: 'death', deathTitle: '死于非命', deathReason: '35岁那年，你卷入了一场感情纠纷，在冲突中被击中头部，当场身亡。你的八字桃花带煞，此劫命中注定。色字头上一把刀，你终究没能躲过。' } },
      ],
    },
  ],
  40: [
    {
      age: 40, title: '不惑之年', type: 'normal', daYun: '中年运',
      story: '四十岁，你开始真正理解这个世界。父母在渐渐老去，孩子在慢慢长大。你站在人生最强壮的时期，面前有一条分岔路。',
      choices: [
        { text: '安分守己，把精力都放在家庭', label: '顺', result: { type: 'continue', attrEffect: { love: 8, health: 3, wealth: 2 }, karma: 1 } },
        { text: '抓住最后的机会搏一把', label: '逆', result: { type: 'continue', attrEffect: { career: 12, wealth: -5, health: -8, love: -3 }, karma: 0 } },
      ],
    },
    {
      age: 40, title: '大病一场', type: 'disaster', daYun: '中年运',
      story: '心肌梗死。你倒在公司会议室里，同事们手忙脚乱地拨打120。抢救室里，你看到了刺眼的白光和匆忙的人影。',
      choices: [
        { text: '抢救及时，捡回一条命', label: '死里逃生', result: { type: 'continue', attrEffect: { health: -25, wealth: -10, career: -5 }, karma: 2 } },
        { text: '抢救无效', label: '殒命', result: { type: 'death', deathTitle: '过劳死', deathReason: '40岁那年，你倒在了公司的会议室里，心肌梗死，抢救无效。你的八字官杀混杂而身弱，长期透支身体。这一生你为别人活了很多年，唯独忘了为自己活。' } },
      ],
    },
    {
      age: 40, title: '一夜暴富', type: 'lucky', daYun: '中年运',
      story: '多年前买的一套房被划入了拆迁范围，补偿款是原价的十倍。一夜之间你成了千万富翁。亲戚们开始频繁登门，借钱的人络绎不绝。',
      choices: [
        { text: '理性投资，低调生活', label: '守财', result: { type: 'continue', attrEffect: { wealth: 30, social: -5 }, karma: 1 } },
        { text: '挥金如土，豪车豪宅', label: '挥霍', result: { type: 'continue', attrEffect: { wealth: 10, health: -5, social: 10 }, karma: -2 } },
      ],
    },
  ],
  45: [
    {
      age: 45, title: '婚姻破裂', type: 'turning', daYun: '中年运',
      story: '结婚十五年，柴米油盐磨平了所有激情。你们开始为每一件小事争吵。今天，TA提出了离婚。孩子还在读高中。',
      choices: [
        { text: '尽力挽回，为了孩子和家庭', label: '顺', result: { type: 'continue', attrEffect: { love: -5, health: -3, career: -3 }, karma: 1 } },
        { text: '好聚好散，各自寻找幸福', label: '逆', result: { type: 'continue', attrEffect: { love: -15, wealth: -10, health: -5 }, karma: 0 } },
      ],
    },
    {
      age: 45, title: '朋友背叛', type: 'disaster', daYun: '中年运',
      story: '你最信任的生意伙伴卷走了公司所有的钱，还把你的房产抵押了。一夜之间，你从老板变成了被执行人。',
      choices: [
        { text: '走法律程序，东山再起', label: '维权', result: { type: 'continue', attrEffect: { wealth: -25, career: -10, social: -10 }, karma: 1 } },
        { text: '报复对方，以暴制暴', label: '复仇', result: { type: 'continue', attrEffect: { wealth: -15, career: -15, social: -15, health: -10 }, karma: -3 } },
      ],
    },
  ],
  50: [
    {
      age: 50, title: '知天命', type: 'normal', daYun: '盛年运',
      story: '五十岁了，头发开始花白。你回头看自己走过的路——有高峰也有低谷，有欢笑也有泪水。你开始思考：这辈子到底想要什么？',
      choices: [
        { text: '看淡一切，安享余生', label: '顺', result: { type: 'continue', attrEffect: { health: 5, love: 5, wealth: 2 }, karma: 1 } },
        { text: '不服老，再拼一把', label: '逆', result: { type: 'continue', attrEffect: { career: 8, health: -10, wealth: -3 }, karma: 0 } },
      ],
    },
    {
      age: 50, title: '绝症晚期', type: 'deadly', daYun: '盛年运',
      story: '体检报告出来了：癌症晚期，扩散到全身。医生说最多三个月。你还有太多事情没做，太多话没说。',
      choices: [
        { text: '积极化疗，争取奇迹', label: '抗争', result: { type: 'continue', attrEffect: { health: -40, wealth: -20, love: 10 }, karma: 3 } },
        { text: '放弃治疗，平静离去', label: '放下', result: { type: 'death', deathTitle: '含笑九泉', deathReason: '50岁那年，癌症夺走了你的生命。在生命的最后时光里，你放下了所有的执念，和家人度过了一段平静的日子。你走得很安详，嘴角带着微笑。' } },
      ],
    },
  ],
  55: [
    {
      age: 55, title: '空巢之寂', type: 'normal', daYun: '盛年运',
      story: '孩子出国了，家里突然安静得可怕。你和老伴面面相觑，不知道该说什么。奋斗了大半辈子，突然发现彼此已经变成了陌生人。',
      choices: [
        { text: '培养共同爱好，重新认识彼此', label: '顺', result: { type: 'continue', attrEffect: { love: 10, health: 3 }, karma: 1 } },
        { text: '各过各的，找自己的生活', label: '逆', result: { type: 'continue', attrEffect: { love: -10, social: 5 }, karma: -1 } },
      ],
    },
    {
      age: 55, title: '意外之灾', type: 'deadly', daYun: '盛年运',
      story: '你去爬山散心，脚下一滑，从悬崖边坠落。风在耳边呼啸，你看到了远处的云海，那么美，那么近...',
      choices: [
        { text: '抓住了岩壁上的树枝', label: '绝处逢生', result: { type: 'continue', attrEffect: { health: -15, wealth: -5 }, karma: 2 } },
        { text: '坠落深渊', label: '殒命', result: { type: 'death', deathTitle: '坠崖而亡', deathReason: '55岁那年，你在一次登山中失足坠崖。你的八字显示此年有高处之险。本想一览众山小，却成了最后一次眺望。' } },
      ],
    },
  ],
  60: [
    {
      age: 60, title: '花甲之年', type: 'normal', daYun: '晚年运',
      story: '退休了。最后一天走出办公楼时，你回头看了看那栋大楼——你在这里度过了人生最重要的四十年。现在，一切都结束了。',
      choices: [
        { text: '开启第二人生，旅游、读书、养生', label: '顺', result: { type: 'continue', attrEffect: { health: 8, love: 5, study: 3 }, karma: 1 } },
        { text: '返聘或创业，闲不住', label: '逆', result: { type: 'continue', attrEffect: { career: 5, health: -8, wealth: 3 }, karma: 0 } },
      ],
    },
    {
      age: 60, title: '丧偶之痛', type: 'disaster', daYun: '晚年运',
      story: '老伴走了。那个陪你走过四十年风雨的人，今天早上再也没有醒来。你握着TA渐渐冰冷的手，觉得自己的心也被掏空了。',
      choices: [
        { text: '振作起来，带着TA的那份好好活下去', label: '坚强', result: { type: 'continue', attrEffect: { love: -20, health: -5, study: 5 }, karma: 2 } },
        { text: '一蹶不振，身体迅速垮掉', label: '崩溃', result: { type: 'continue', attrEffect: { love: -20, health: -20, career: -5 }, karma: -1 } },
      ],
    },
  ],
  65: [
    {
      age: 65, title: '含饴弄孙', type: 'normal', daYun: '晚年运',
      story: '孙子出生了。你抱着那个小小的生命，仿佛看到了当年的自己。你决定要把自己这一生的经验都教给他。',
      choices: [
        { text: '悉心教导，把最好的都给孙辈', label: '顺', result: { type: 'continue', attrEffect: { love: 10, health: 3, social: 3 }, karma: 1 } },
        { text: '适度关爱，不干涉子女教育', label: '逆', result: { type: 'continue', attrEffect: { love: 5, social: 5 }, karma: 0 } },
      ],
    },
  ],
  70: [
    {
      age: 70, title: '古稀之年', type: 'normal', daYun: '暮年运',
      story: '七十岁了。你的老朋友们一个接一个地离开。每次接到电话，你都害怕听到不好的消息。时间变得弥足珍贵。',
      choices: [
        { text: '写回忆录，把一生记录下来', label: '顺', result: { type: 'continue', attrEffect: { study: 10, love: 5, social: 3 }, karma: 2 } },
        { text: '什么都不想，过一天算一天', label: '逆', result: { type: 'continue', attrEffect: { health: -3 }, karma: -1 } },
      ],
    },
  ],
  75: [
    {
      age: 75, title: '风烛残年', type: 'normal', daYun: '暮年运',
      story: '身体越来越不行了。每天要吃一大把药，走路都要拄拐杖。你开始认真地思考：死亡是什么？这辈子值不值？',
      choices: [
        { text: '坦然面对，与死亡和解', label: '顺', result: { type: 'continue', attrEffect: { health: -10, love: 5 }, karma: 2 } },
        { text: '恐惧、不甘、挣扎着想要多活', label: '逆', result: { type: 'continue', attrEffect: { health: -15, wealth: -10 }, karma: -1 } },
      ],
    },
    {
      age: 75, title: '寿终正寝', type: 'deadly', daYun: '暮年运',
      story: '你在睡梦中离开了。没有痛苦，没有挣扎，就像一片叶子从树上自然飘落。家人发现时，你的脸上还带着微笑。',
      choices: [
        { text: '...', label: '善终', result: { type: 'death', deathTitle: '寿终正寝', deathReason: '75岁那年，你在睡梦中安详离世。无病无痛，无牵无挂，走完了这一生。你的八字寿元至此，功德圆满。家人们围在你身边，送了你最后一程。' } },
      ],
    },
  ],
  80: [
    {
      age: 80, title: '人生回望', type: 'normal', daYun: '归元运',
      story: '你活到了80岁。这一生经历过的风风雨雨，此刻都变成了眼角的皱纹和嘴角的微笑。你坐在院子里晒太阳，回忆这一生的点点滴滴...',
      choices: [
        { text: '此生无悔，含笑离去', label: '圆满', result: { type: 'continue', attrEffect: { karma: 3 } } },
        { text: '带着遗憾，但已释然', label: '释然', result: { type: 'continue', attrEffect: { karma: 1 } } },
      ],
    },
  ],
};

// 根据年龄和当前因果值抽取一个事件
export function drawEvent(age: number, karma: number): LifeEvent | null {
  const pool = EVENT_POOL[age];
  if (!pool || pool.length === 0) return null;

  // 因果值高时降低死亡概率，因果值低时提高死亡概率
  const filtered = pool.filter(e => {
    if (e.type === 'deadly') {
      const deathChance = Math.max(0.05, Math.min(0.4, 0.25 - karma * 0.05));
      return Math.random() < deathChance;
    }
    return true;
  });

  // 如果没有匹配到（比如死亡事件被过滤掉了），返回非死亡事件
  const safePool = pool.filter(e => e.type !== 'deadly');
  if (filtered.length === 0 && safePool.length > 0) {
    return safePool[Math.floor(Math.random() * safePool.length)];
  }

  const source = filtered.length > 0 ? filtered : pool;
  return source[Math.floor(Math.random() * source.length)];
}

// 生成完整的人生路径
export function generateLifePath(): number[] {
  // 15个阶段随机抽取12-15个（有些人活不到80岁就死了）
  const allAges = [...AGE_KEYS];
  // 可能随机跳过某些年龄段（表示平安无事度过）
  return allAges.filter(() => Math.random() > 0.15); // 约85%的概率保留每个阶段
}

// 获取格局基础属性
export function getBaseAttrs(pattern: string): SixAttrs {
  const base: Record<string, SixAttrs> = {
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
  return base[pattern] || base['杂气格'];
}

// 称号系统
export const TITLE_BADGES = [
  { name: '天选之子', desc: '天赋异禀', condition: (a: SixAttrs) => a.wealth > 70 && a.career > 70, icon: '👑', color: '#fbbf24' },
  { name: '商界巨子', desc: '富甲一方', condition: (a: SixAttrs) => a.wealth > 80, icon: '💰', color: '#f59e0b' },
  { name: '一代宗师', desc: '登峰造极', condition: (a: SixAttrs) => a.career > 80, icon: '⭐', color: '#fbbf24' },
  { name: '桃李满天', desc: '学富五车', condition: (a: SixAttrs) => a.study > 70, icon: '🎓', color: '#60a5fa' },
  { name: '松柏长青', desc: '健康长寿', condition: (a: SixAttrs) => a.health > 70, icon: '🌲', color: '#4ade80' },
  { name: '情场高手', desc: '感情顺利', condition: (a: SixAttrs) => a.love > 70, icon: '❤️', color: '#f472b6' },
  { name: '白手起家', desc: '从无到有', condition: (a: SixAttrs) => a.wealth > 60 && a.career > 60, icon: '💪', color: '#fb923c' },
  { name: '大器晚成', desc: '后来居上', condition: (a: SixAttrs) => a.career > 60 && a.study > 50, icon: '🌅', color: '#a78bfa' },
  { name: '逆风翻盘', desc: '改变命运', condition: (a: SixAttrs) => a.karma > 3, icon: '🔥', color: '#ef4444' },
  { name: '积德行善', desc: '福报深厚', condition: (a: SixAttrs) => a.karma > 5, icon: '☯️', color: '#22d3ee' },
  { name: '命硬如铁', desc: '死里逃生', condition: (a: SixAttrs) => a.health < 30 && a.career > 40, icon: '🛡️', color: '#94a3b8' },
  { name: '圆满人生', desc: '均衡发展', condition: (a: SixAttrs) => (a.wealth + a.career + a.health + a.love + a.study + a.social) / 6 > 55, icon: '☯️', color: '#d4d4d8' },
];

export function getTitles(attrs: SixAttrs) {
  return TITLE_BADGES.filter(t => t.condition(attrs));
}

// 结局评级
export function getEndingGrade(attrs: SixAttrs, died: boolean, deathAge?: number): { grade: string; title: string; desc: string } {
  const avg = (attrs.wealth + attrs.career + attrs.health + attrs.love + attrs.study + attrs.social) / 6;
  if (died) {
    if (deathAge && deathAge < 20) return { grade: '殇', title: '少年夭折', desc: '来也匆匆，去也匆匆。你的生命如流星般短暂，但也在夜空留下了一道光。' };
    if (deathAge && deathAge < 40) return { grade: '殇', title: '英年早逝', desc: '壮志未酬身先死。你带走了太多未完成的梦想，但也把最好的年华留在了人间。' };
    if (deathAge && deathAge < 60) return { grade: 'C', title: '中道崩殂', desc: '你走过了人生最重要的一半，却没能看到最后的风景。' };
    if (avg >= 60) return { grade: 'B', title: '善终', desc: '你度过了充实的一生，虽然没能走到最后，但每一步都走得踏实。' };
    return { grade: 'C', title: '遗憾离场', desc: '你的一生充满挑战，最终在并不算老的时候离开了这个世界。' };
  }
  if (avg >= 75) return { grade: 'S', title: '传奇人生', desc: '你的一生堪称传奇。活到了高寿，各方面都达到了令人艳羡的高度。' };
  if (avg >= 60) return { grade: 'A', title: '精彩人生', desc: '你的一生精彩纷呈。虽然有波折但收获满满，儿孙满堂，寿终正寝。' };
  if (avg >= 45) return { grade: 'B', title: '平凡人生', desc: '你的一生平淡而真实。有欢笑也有泪水，最终安详地离开了这个世界。' };
  return { grade: 'C', title: '坎坷人生', desc: '你的一生充满艰辛，但你的坚韧令人敬佩。最终走到了终点，已是不易。' };
}
