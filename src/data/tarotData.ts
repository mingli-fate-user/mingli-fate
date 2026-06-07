// 塔罗牌78张完整数据（韦特塔罗）
// 大阿尔卡纳22张 + 小阿尔卡纳56张

export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  type: 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
  typeName: string;
  number: number; // 0-21 for major, 1-14 for minor
  element: string;
  keywords: string[];
  upright: string;
  reversed: string;
  image: string; // 符号描述
}

// 大阿尔卡纳（22张）
const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0, name: '愚者', nameEn: 'The Fool', type: 'major', typeName: '大阿尔卡纳',
    number: 0, element: '风', keywords: ['新开始', '冒险', '自由', '天真'],
    upright: '新的旅程即将开始，带着天真和信任踏上未知之路。放下恐惧，拥抱可能性，像孩子一样对世界充满好奇。这是冒险的时刻，命运在召唤你跳出舒适圈。',
    reversed: '盲目冲动，缺乏计划，不切实际。警告你不要在没有准备的情况下贸然行动，或者因恐惧而错失良机。',
    image: '悬崖边的旅人，肩上扛着行囊，脚边小狗陪伴，抬头望向天空'
  },
  {
    id: 1, name: '魔术师', nameEn: 'The Magician', type: 'major', typeName: '大阿尔卡纳',
    number: 1, element: '风', keywords: ['显化', '创造力', '自信', '能力'],
    upright: '你拥有实现目标所需的一切资源。意志力强，创意涌现，是将想法变为现实的最佳时机。相信自己，你比你想象的更有能力。',
    reversed: '操控，欺骗，能力被浪费，缺乏自信。或者有人在利用你，警惕虚假的承诺。',
    image: '桌前的术士，一手指天一手指地，桌上摆放着权杖圣杯宝剑星币'
  },
  {
    id: 2, name: '女祭司', nameEn: 'The High Priestess', type: 'major', typeName: '大阿尔卡纳',
    number: 2, element: '水', keywords: ['直觉', '内在智慧', '秘密', '灵性'],
    upright: '静听内心的声音，答案不在外界而在你心底。直觉正变得敏锐，梦境可能带有讯息。这是一个向内探索、灵性成长的时期。',
    reversed: '忽视直觉，表面化，秘密被隐藏。你可能在压抑自己的感受，或者有人在对你隐瞒真相。',
    image: '两柱之间的神秘女子，头戴月冠，膝上放着卷轴，脚下新月'
  },
  {
    id: 3, name: '女皇', nameEn: 'The Empress', type: 'major', typeName: '大阿尔卡纳',
    number: 3, element: '土', keywords: ['丰饶', '母性', '创造', '感官'],
    upright: '丰盛与滋养的能量环绕着你。事业开花结果，感情温暖滋润，创造力爆棚。亲近大自然，享受生活中的美好事物。',
    reversed: '缺乏安全感，过度依赖，创造力受阻，忽视自我照顾。或者物质上的损失。',
    image: '坐在丰收麦田中的女皇，手持权杖，周围是金黄的谷物和果树'
  },
  {
    id: 4, name: '皇帝', nameEn: 'The Emperor', type: 'major', typeName: '大阿尔卡纳',
    number: 4, element: '火', keywords: ['权威', '结构', '控制', '父性'],
    upright: '建立秩序和规则的时候到了。用理性和纪律来管理局面，展现领导力。在事业或家庭中承担起责任，稳固根基。',
    reversed: '专制，控制欲过强，僵化，滥用权力。或者缺乏自信，无法承担责任。',
    image: '端坐王座上的威严君主，手持权杖和球，身后是雄鹰旗帜'
  },
  {
    id: 5, name: '教皇', nameEn: 'The Hierophant', type: 'major', typeName: '大阿尔卡纳',
    number: 5, element: '土', keywords: ['传统', '信仰', '教导', '制度'],
    upright: '遵循传统智慧，向有经验的人请教。适合学习、拜师、参加仪式或团体活动。正统道路现在对你有益。',
    reversed: '打破传统，质疑权威，非正统方法。或者盲目遵循规则而失去了自己的判断。',
    image: '两根石柱间的教皇，头戴三重冠，手持权杖，面前跪着两位信徒'
  },
  {
    id: 6, name: '恋人', nameEn: 'The Lovers', type: 'major', typeName: '大阿尔卡纳',
    number: 6, element: '风', keywords: ['爱情', '选择', '和谐', '价值观'],
    upright: '重要的关系进入新阶段，或面临重大选择。跟随你的心，但要确保价值观一致。爱情、合作、灵魂伴侣的征兆。',
    reversed: '关系失衡，价值观冲突，错误的选择。或者逃避承诺，犹豫不决。',
    image: '夏娃与亚当在伊甸园，中间是天使拉斐尔，背后是知识树和生命树'
  },
  {
    id: 7, name: '战车', nameEn: 'The Chariot', type: 'major', typeName: '大阿尔卡纳',
    number: 7, element: '水', keywords: ['意志力', '胜利', '控制', '前进'],
    upright: '意志驱动你向前，克服一切障碍。目标明确，动力十足，胜利在望。驾驭对立的力量，让它们共同推动你前进。',
    reversed: '失控，方向不明，用力过猛导致疲惫。或者因内部冲突而停滞不前。',
    image: '勇猛的战车御者，驾驭着一黑一白两只狮身人面兽，头顶星冠'
  },
  {
    id: 8, name: '力量', nameEn: 'Strength', type: 'major', typeName: '大阿尔卡纳',
    number: 8, element: '火', keywords: ['勇气', '耐心', '内在力量', '温柔'],
    upright: '真正的力量来自内心的平静与耐心，而非暴力。用温柔和坚韧去面对挑战，驯服内心的野兽。你有足够的勇气去克服任何困难。',
    reversed: '软弱，失去耐心，被欲望控制，滥用力量。或者压抑自己的情绪导致爆发。',
    image: '温柔的女子轻抚狮子的额头，狮子伸出舌头舔她的手，头顶是无限符号'
  },
  {
    id: 9, name: '隐者', nameEn: 'The Hermit', type: 'major', typeName: '大阿尔卡纳',
    number: 9, element: '土', keywords: ['独处', '内省', '智慧', '指引'],
    upright: '退后一步，独自思考。在静默中寻找答案，智慧来自内在的探索。你可能需要一段时间的独处来理清思路。',
    reversed: '孤立，逃避，过度隐居，拒绝建议。或者害怕独处而不断寻求外界的刺激。',
    image: '雪山之巅的隐者，手持灯笼，拄着拐杖，独自前行'
  },
  {
    id: 10, name: '命运之轮', nameEn: 'Wheel of Fortune', type: 'major', typeName: '大阿尔卡纳',
    number: 10, element: '火', keywords: ['变化', '命运', '周期', '转机'],
    upright: '命运之轮正在转动，好运降临。把握这个转折点，顺应变化而非抗拒。人生的周期进入上升阶段，意想不到的好事正在发生。',
    reversed: '厄运，阻碍，不顺的周期，抗拒改变。但记住，轮子总会继续转，低谷之后必有回升。',
    image: '巨大的命运之轮，四个角落是四活物，轮上坐着狮身人面兽和蛇'
  },
  {
    id: 11, name: '正义', nameEn: 'Justice', type: 'major', typeName: '大阿尔卡纳',
    number: 11, element: '风', keywords: ['公正', '因果', '平衡', '法律'],
    upright: '因果报应，公正裁决。你种什么因就得什么果。面临重要决定时，保持客观和理性，权衡利弊。法律事务会有公正结果。',
    reversed: '不公正，逃避责任，因果失衡，法律纠纷。或者对自己过于苛刻。',
    image: '端坐王座的女法官，手持天平和宝剑，帷幕后是两根石柱'
  },
  {
    id: 12, name: '倒吊人', nameEn: 'The Hanged Man', type: 'major', typeName: '大阿尔卡纳',
    number: 12, element: '水', keywords: ['牺牲', '暂停', '新视角', '放下'],
    upright: '换一个角度看世界。暂时的停顿不是失败，而是为了更深的领悟。放下执着，顺其自然，牺牲小我完成大我。',
    reversed: '固执，抗拒改变，无意义的牺牲，被困住。或者逃避现实不愿面对。',
    image: '倒吊在T形树上的男子，一条腿弯曲，双手背后，头上有光环'
  },
  {
    id: 13, name: '死神', nameEn: 'Death', type: 'major', typeName: '大阿尔卡纳',
    number: 13, element: '水', keywords: ['转变', '结束', '新生', '放下'],
    upright: '旧的篇章必须结束，新的才能开始。这不是肉体的死亡，而是重大转变。放下不再适合你的人事物，蜕变重生的时刻到了。',
    reversed: '抗拒结束，停滞不前，害怕改变，拖延。或者结束来得太突然无法接受。',
    image: '骑着白马的骷髅骑士，手持黑旗，国王平民孩童都倒在他面前'
  },
  {
    id: 14, name: '节制', nameEn: 'Temperance', type: 'major', typeName: '大阿尔卡纳',
    number: 14, element: '火', keywords: ['平衡', '调和', '耐心', '中庸'],
    upright: '找到生活的平衡点，调和 extremes。耐心是金，事情需要时间来成熟。保持中庸之道，不走极端，万物正在融合。',
    reversed: '失衡，极端，过度放纵或过度压抑，缺乏耐心。或者关系中的不协调。',
    image: '天使正将两个杯中的水互相倒换，一只脚在水中一只在岸上，身后是鸢尾花'
  },
  {
    id: 15, name: '恶魔', nameEn: 'The Devil', type: 'major', typeName: '大阿尔卡纳',
    number: 15, element: '土', keywords: ['束缚', '欲望', '物质主义', '阴影'],
    upright: '你被自己的欲望、恐惧或坏习惯束缚着。看清这些锁链其实是自己套上的，你有能力挣脱。物质诱惑在考验你。',
    reversed: '挣脱束缚，打破成瘾，重获自由，面对阴影。或者意识到限制并开始改变。',
    image: '羊头人身的恶魔坐在祭坛上，男女被锁链束缚但锁链是松的'
  },
  {
    id: 16, name: '高塔', nameEn: 'The Tower', type: 'major', typeName: '大阿尔卡纳',
    number: 16, element: '火', keywords: ['突变', '崩塌', '觉醒', '真相'],
    upright: '突如其来的剧变，旧结构崩塌。虽然痛苦，但这是必要的清理。建立在虚假之上的东西必须倒下，之后你会更加自由。',
    reversed: '逃避崩解，延迟的灾难，小规模的崩溃。或者从毁灭中开始重建。',
    image: '被闪电击中的高塔，火海中两个人从塔顶坠落，周围是火花和碎石'
  },
  {
    id: 17, name: '星星', nameEn: 'The Star', type: 'major', typeName: '大阿尔卡纳',
    number: 17, element: '风', keywords: ['希望', '灵感', '宁静', '疗愈'],
    upright: '风暴过后的宁静，希望重现。你的愿望被宇宙听见，保持信念。这是一个疗愈心灵、重新连接内在光明的时刻。',
    reversed: '失去希望，绝望，缺乏灵感，不相信自己。或者拒绝接受疗愈。',
    image: ' naked女子跪在池边，一只脚在水中，将水从两个壶中倒入池中和大地上，头顶是八角星'
  },
  {
    id: 18, name: '月亮', nameEn: 'The Moon', type: 'major', typeName: '大阿尔卡纳',
    number: 18, element: '水', keywords: ['幻象', '潜意识', '恐惧', '直觉'],
    upright: '事情并非表面所见，潜入潜意识寻找真相。恐惧和幻象在困扰你，但走过这段黑暗的路，答案就在前方。相信直觉。',
    reversed: '恐惧消散，真相大白，走出迷雾。或者更深的幻觉，被欺骗，情绪失控。',
    image: '月光下的两只狗和一只狼对着月亮嚎叫，小龙虾从水中爬出，远处是双塔'
  },
  {
    id: 19, name: '太阳', nameEn: 'The Sun', type: 'major', typeName: '大阿尔卡纳',
    number: 19, element: '火', keywords: ['快乐', '成功', '活力', '天真'],
    upright: '最光明正大的好运！成功、快乐、活力四射。一切顺利，像孩子一样享受生活的每一刻。这是塔罗中最吉祥的牌之一。',
    reversed: '暂时的阴霾，快乐被遮蔽，自我怀疑。或者过度乐观忽视细节。（注：太阳逆位仍多为正面）',
    image: '巨大的金色太阳下，一个快乐的孩子骑在白马上，向日葵盛开，墙上挂着旗帜'
  },
  {
    id: 20, name: '审判', nameEn: 'Judgement', type: 'major', typeName: '大阿尔卡纳',
    number: 20, element: '火', keywords: ['重生', '召唤', '觉醒', '评价'],
    upright: '内在的召唤唤醒了你。过去的经历造就了今天的你，是时候重新审视人生方向了。宽恕自己与他人，迎接精神上的重生。',
    reversed: '自我怀疑，逃避召唤，过度自责，未能从过去中学习。或者错误的判断。',
    image: '天使加百列吹号，下方人们从棺木中升起，张开双臂迎接新生'
  },
  {
    id: 21, name: '世界', nameEn: 'The World', type: 'major', typeName: '大阿尔卡纳',
    number: 21, element: '土', keywords: ['完成', '圆满', '成就', '合一'],
    upright: '一个完整的循环圆满完成，收获成果。你已达到一个重要里程碑，准备进入新的阶段。与宇宙和谐合一，一切皆有可能。',
    reversed: '未完成的循环，延迟的成功，最后一公里的困难。或者害怕完成而自我设限。',
    image: '舞女在月桂花环中翩翩起舞，手持两根权杖，四角是四活物'
  }
];

// 小阿尔卡纳 - 权杖（火元素）
const WANDS: TarotCard[] = [
  { id: 22, name: '权杖首牌', nameEn: 'Ace of Wands', type: 'wands', typeName: '权杖', number: 1, element: '火', keywords: ['新动力', '创意', '激情', '机会'], upright: '新的创意火花，激情被点燃，一个令人兴奋的机会出现。这是行动的信号，抓住这股能量勇往直前。', reversed: '动力不足，创意受阻，机会被错过，激情消退。', image: '云中伸出的一只手紧握着发芽的权杖，下方是城堡和河流' },
  { id: 23, name: '权杖二', nameEn: 'Two of Wands', type: 'wands', typeName: '权杖', number: 2, element: '火', keywords: ['规划', '决策', '远见', '探索'], upright: '站在十字路口展望未来，手握地球仪，世界在你脚下。做长远规划，大胆探索未知的领域。', reversed: '害怕走出舒适圈，计划不周，短视，犹豫不决。', image: '城堡垛口上的男子手持地球仪和权杖，望向远方的海域和商船' },
  { id: 24, name: '权杖三', nameEn: 'Three of Wands', type: 'wands', typeName: '权杖', number: 3, element: '火', keywords: ['扩展', '前进', '领导', '合作'], upright: '你的船队正在归来，前期的努力开始见到成果。继续扩展视野，与他人合作共创更大成就。', reversed: '延误，合作不顺，扩展过快导致问题，孤立无援。', image: '悬崖边的男子眺望远方海面上的三艘商船，手中握着一根权杖' },
  { id: 25, name: '权杖四', nameEn: 'Four of Wands', type: 'wands', typeName: '权杖', number: 4, element: '火', keywords: ['庆祝', '稳定', '家庭', '和谐'], upright: '值得庆祝的时刻！家庭和谐，事业稳定，婚礼或聚会的吉兆。享受成果，与亲朋好友分享快乐。', reversed: '表面的和谐，家庭纷争，缺乏归属感，庆祝被推迟。', image: '欢庆的人群在城堡前跳舞，四根权杖搭成花环门廊，果实累累' },
  { id: 26, name: '权杖五', nameEn: 'Five of Wands', type: 'wands', typeName: '权杖', number: 5, element: '火', keywords: ['冲突', '竞争', '挑战', '活力'], upright: '竞争和冲突出现，但这不一定是坏事。健康的竞争能激发潜力，在挑战中证明自己的实力。', reversed: '避免冲突，内部矛盾，不公平的竞争，精力分散。', image: '五名男子手持权杖互相打斗，场面混乱但无人真正受伤' },
  { id: 27, name: '权杖六', nameEn: 'Six of Wands', type: 'wands', typeName: '权杖', number: 6, element: '火', keywords: ['胜利', '认可', '自信', '好消息'], upright: '胜利归来！你的努力得到认可，众人为你欢呼。自信满满，好消息正在路上，享受属于你的荣耀时刻。', reversed: '骄傲自满，虚名无实，延迟的认可，或胜利后松懈。', image: '骑马凯旋的将军，头顶戴着胜利的桂冠，周围人群高举权杖欢呼' },
  { id: 28, name: '权杖七', nameEn: 'Seven of Wands', type: 'wands', typeName: '权杖', number: 7, element: '火', keywords: ['防御', '坚持', '勇气', '立场'], upright: '高处不胜寒，但你必须坚持立场。面对挑战不退缩，为自己的信念而战。你的优势在于占据有利位置。', reversed: '不堪重负，放弃抵抗， overwhelmed，无法坚持自己的立场。', image: '山顶上的男子手持一根权杖，抵御从下方袭来的六根权杖' },
  { id: 29, name: '权杖八', nameEn: 'Eight of Wands', type: 'wands', typeName: '权杖', number: 8, element: '火', keywords: ['速度', '行动', '消息', '前进'], upright: '事情突然加速，箭在弦上。好消息即将到达，拖延的事情会有突破性进展。抓住这个快节奏的时机。', reversed: '延误，阻力，混乱的快速，消息被阻塞，方向错误。', image: '八根权杖在空中飞速穿梭，划过绿色的山丘和河流' },
  { id: 30, name: '权杖九', nameEn: 'Nine of Wands', type: 'wands', typeName: '权杖', number: 9, element: '火', keywords: ['韧性', '警觉', '疲惫', '坚持'], upright: '战斗到最后，虽然疲惫但绝不放弃。你已经经历了很多，现在是最后一道防线。坚持下去，胜利就在眼前。', reversed: '精疲力竭，偏执，无法放松，固执地坚持错误的方向。', image: '疲惫的战士拄着一根权杖，头上缠着绷带，身后是八根插在地上的权杖' },
  { id: 31, name: '权杖十', nameEn: 'Ten of Wands', type: 'wands', typeName: '权杖', number: 10, element: '火', keywords: ['负担', '责任', '压力', '过劳'], upright: '承担了太多责任，压力山大。虽然你有能力处理，但需要学会分担和放手。不要让工作压垮了自己。', reversed: '放下负担，delegation，从压力中解脱，拒绝过多责任。', image: '弯腰前行的男子肩上扛着十根权杖，遮住了他的视线，远处是村庄' },
  { id: 32, name: '权杖侍从', nameEn: 'Page of Wands', type: 'wands', typeName: '权杖', number: 11, element: '火', keywords: ['热情', '探索', '新想法', '冒险'], upright: '一个充满热情和好奇心的人出现，带来新想法和冒险精神。勇敢尝试新事物，你的热情会感染他人。', reversed: '冲动，缺乏方向，坏消息，想法不成熟，急躁。', image: '身穿华丽服饰的年轻侍从手持权杖，望着权杖顶端的嫩芽' },
  { id: 33, name: '权杖骑士', nameEn: 'Knight of Wands', type: 'wands', typeName: '权杖', number: 12, element: '火', keywords: ['冲劲', '冒险', '魅力', '行动'], upright: '充满魅力和行动力的人，或者你正充满冲劲追求目标。大胆冒险，但要注意不要太过鲁莽。', reversed: '冲动鲁莽，急躁，做事半途而废，缺乏耐心，易怒。', image: '身披盔甲的骑士骑着骏马，手持权杖，马匹扬起前蹄' },
  { id: 34, name: '权杖王后', nameEn: 'Queen of Wands', type: 'wands', typeName: '权杖', number: 13, element: '火', keywords: ['自信', '热情', '独立', '魅力'], upright: '自信独立的女性能量，充满魅力和热情。她照亮周围的人，善于社交，独立而坚强。相信自己的力量。', reversed: '专横，嫉妒，过度自信变为自负，控制欲强，善妒。', image: '端坐王座的女王，手持权杖和向日葵，一只黑猫蹲坐在她脚边' },
  { id: 35, name: '权杖国王', nameEn: 'King of Wands', type: 'wands', typeName: '权杖', number: 14, element: '火', keywords: ['领导力', '远见', '企业家', '魅力'], upright: '天生的领导者，有远见卓识，能够激励他人追随。创业精神旺盛，大胆追求梦想，同时保持冷静和理性。', reversed: '专横，冲动，暴君式领导，急躁，霸道，不顾他人感受。', image: '威严的国王端坐王座，手持权杖，身披狮子图案的披风， Salamander在他身边' }
];

// 小阿尔卡纳 - 圣杯（水元素）
const CUPS: TarotCard[] = [
  { id: 36, name: '圣杯首牌', nameEn: 'Ace of Cups', type: 'cups', typeName: '圣杯', number: 1, element: '水', keywords: ['新感情', '爱', '直觉', '灵性'], upright: '爱的源泉正在涌现，新的感情开始，心灵被触动。这是情感和精神上的新开始，接受这份馈赠。', reversed: '情感阻塞，爱被压抑，情感的浪费，失望。', image: '云中伸出的一只手托着溢水的圣杯，五道水流倾泻而下，周围是莲花和鸽子' },
  { id: 37, name: '圣杯二', nameEn: 'Two of Cups', type: 'cups', typeName: '圣杯', number: 2, element: '水', keywords: ['爱情', '伴侣', '和谐', '结合'], upright: '灵魂伴侣的相遇，两颗心真诚相连。合作关系和谐，爱情美满，友谊深厚。平等互惠的结合。', reversed: '关系失衡，分手，不平等的关系，合作破裂。', image: '一对男女手持圣杯互相敬献，上方是赫尔墨斯双蛇杖，上方有狮头' },
  { id: 38, name: '圣杯三', nameEn: 'Three of Cups', type: 'cups', typeName: '圣杯', number: 3, element: '水', keywords: ['庆祝', '友谊', '欢乐', '团聚'], upright: '与好友欢聚庆祝，共享喜悦。婚礼、生日或其他喜庆场合。三个女人举杯欢庆，友谊的温暖包围着你。', reversed: '表面的欢乐，第三者插足，社交过度，gossip。', image: '三位女子手举圣杯，在丰收的果园中跳舞庆祝，周围是瓜果' },
  { id: 39, name: '圣杯四', nameEn: 'Four of Cups', type: 'cups', typeName: '圣杯', number: 4, element: '水', keywords: ['不满足', '冷漠', '沉思', '错过'], upright: '对现状感到厌倦和不满，沉浸在自我的世界中。机会正在递给你，但你可能因冷漠而错过。睁开双眼看看周围。', reversed: '走出阴霾，新的觉醒，接受新的机会，重新开始。', image: '树下静坐的男子双臂交叉，面前三个圣杯，云中手递来第四个圣杯' },
  { id: 40, name: '圣杯五', nameEn: 'Five of Cups', type: 'cups', typeName: '圣杯', number: 5, element: '水', keywords: ['失落', '悲伤', '遗憾', '接受'], upright: '沉浸在失落和悲伤中，为打翻的三个圣杯哭泣。但身后还有两个圣杯依然站立。是时候转过身来，看看还拥有的东西。', reversed: '走出悲伤，接受失去，重新开始，找到希望，旧人回归。', image: '黑衣人低头哀悼三个倒下的圣杯，身后两个圣杯依然站立，远处是桥梁' },
  { id: 41, name: '圣杯六', nameEn: 'Six of Cups', type: 'cups', typeName: '圣杯', number: 6, element: '水', keywords: ['回忆', '童年', '纯真', '怀旧'], upright: '童年回忆涌上心头，旧友重逢，纯真的美好时光。过去的人事物再次出现，带来温暖和疗愈。', reversed: '沉溺过去，逃避现实，旧伤复发，童年的阴影，过于天真。', image: '花园中两个孩童交换着装满鲜花的圣杯，背景是宁静的村庄和花园' },
  { id: 42, name: '圣杯七', nameEn: 'Seven of Cups', type: 'cups', typeName: '圣杯', number: 7, element: '水', keywords: ['幻想', '选择', '欲望', '幻觉'], upright: '眼前有太多的选择和幻想，云雾中的七个圣杯各代表着不同的诱惑。需要清醒地面对，分辨哪些是真实的，哪些是幻象。', reversed: '看清现实，做出选择，摆脱幻觉，脚踏实地，觉醒。', image: '云雾中浮现七个圣杯，里面装满各种幻象：珠宝、城堡、蛇、花环等' },
  { id: 43, name: '圣杯八', nameEn: 'Eight of Cups', type: 'cups', typeName: '圣杯', number: 8, element: '水', keywords: ['离开', '寻找', '放下', '追求'], upright: '放下不再满足你的人事物，独自踏上寻找真我的旅程。虽然孤独，但这是必要的成长。追求更深层的意义。', reversed: '害怕孤独，逃避问题，无法放下，重复同样的错误，恐惧改变。', image: '红衣人转身离开排列整齐的八个圣杯，手持权杖踏上山路，月亮高悬' },
  { id: 44, name: '圣杯九', nameEn: 'Nine of Cups', type: 'cups', typeName: '圣杯', number: 9, element: '水', keywords: ['满足', '愿望', '幸福', '享受'], upright: '愿望成真！情感满足，生活幸福，坐在九个圣杯前露出满意的微笑。享受当下，感恩已经拥有的一切。', reversed: '内心的空虚，物质丰富但精神匮乏，过度放纵，虚假的满足。', image: '心满意足的男子坐在九个整齐排列的圣杯前，双臂交叉，面带微笑' },
  { id: 45, name: '圣杯十', nameEn: 'Ten of Cups', type: 'cups', typeName: '圣杯', number: 10, element: '水', keywords: ['圆满', '家庭', '和谐', '幸福'], upright: '家庭的极致幸福，情感圆满， rainbow横跨天际。家人和睦，爱情美满，这是情感生活最美好的状态。', reversed: '家庭纷争，表面和谐下的问题，价值观冲突，幸福有瑕疵。', image: '一对夫妇张开双臂，上方是十个圣杯排列成彩虹弧，下方是孩童和花园' },
  { id: 46, name: '圣杯侍从', nameEn: 'Page of Cups', type: 'cups', typeName: '圣杯', number: 11, element: '水', keywords: ['情感', '直觉', '创造力', '消息'], upright: '一个温柔敏感的人带来情感上的消息。直觉敏锐，创意涌现，可能是爱情的消息或一个浪漫的邀请。', reversed: '情感 immature，过度敏感，坏消息，逃避现实，情绪化。', image: '身着蓝色服饰的年轻侍从手持圣杯，杯中有条小鱼跃出，他望着鱼' },
  { id: 47, name: '圣杯骑士', nameEn: 'Knight of Cups', type: 'cups', typeName: '圣杯', number: 12, element: '水', keywords: ['浪漫', '追求者', '理想', '邀约'], upright: '浪漫的骑士骑着白马而来，带来爱情的邀约或一个充满魅力的提案。追随你的心，但要保持清醒。', reversed: '不成熟的感情，逃避承诺，情绪化，不可靠，暧昧不清。', image: '身披盔甲的骑士手持圣杯，骑着白马缓缓前行，鸽子在旁飞舞' },
  { id: 48, name: '圣杯王后', nameEn: 'Queen of Cups', type: 'cups', typeName: '圣杯', number: 13, element: '水', keywords: ['同理心', '直觉', '温柔', '倾听'], upright: '充满同理心和直觉力的女性。善于倾听他人的心声，温柔而有智慧。信任你的感受，直觉会指引你。', reversed: '情绪不稳定，过度敏感，被情感淹没，不切实际的幻想，依赖。', image: '端坐王座的王后手持华丽的圣杯，头戴贝壳皇冠，脚下是五彩斑斓的鱼儿' },
  { id: 49, name: '圣杯国王', nameEn: 'King of Cups', type: 'cups', typeName: '圣杯', number: 14, element: '水', keywords: ['情感控制', '智慧', '慈悲', '平衡'], upright: '情感成熟的男人，能够在风暴中保持冷静。慈悲而有智慧，善于理解他人的情感。成为他人的依靠。', reversed: '情绪操控，冷漠，压抑情感，情绪爆发，不诚实。', image: '端坐宝座的国王手持圣杯和权杖，身后是汹涌的大海，但他保持镇定' }
];

// 小阿尔卡纳 - 宝剑（风元素）
const SWORDS: TarotCard[] = [
  { id: 50, name: '宝剑首牌', nameEn: 'Ace of Swords', type: 'swords', typeName: '宝剑', number: 1, element: '风', keywords: [' clarity', '真相', '突破', '新想法'], upright: '思想的突破，真相大白，清晰的想法如利剑般穿透迷雾。一个新的开始，用理性和智慧去面对。', reversed: '混乱，错误信息，思维不清晰，欺骗，判断力差。', image: '云中伸出的一只手高举宝剑，剑尖顶着皇冠，两侧是枝叶' },
  { id: 51, name: '宝剑二', nameEn: 'Two of Swords', type: 'swords', typeName: '宝剑', number: 2, element: '风', keywords: ['僵局', '选择', '逃避', '平衡'], upright: '面临两难选择，蒙着眼睛的女子双手各持一剑，交叉在胸前。暂时僵局，需要平衡理性与情感来打破困局。', reversed: '僵局被打破，做出选择，摘下眼罩看清真相，信息泄露。', image: '蒙眼的女子坐在海边石凳上，双臂交叉各持一剑，身后是新月下的海面' },
  { id: 52, name: '宝剑三', nameEn: 'Three of Swords', type: 'swords', typeName: '宝剑', number: 3, element: '风', keywords: ['心碎', '悲伤', '痛苦', '背叛'], upright: '心碎的时刻，情感上的痛苦难以避免。虽然难受，但经历这段痛苦后你会变得更坚强。允许自己悲伤。', reversed: '从痛苦中恢复，原谅，释怀，旧伤开始愈合，走出阴霾。', image: '三把宝剑刺穿一颗红色的心，背景是灰暗的暴风雨天空' },
  { id: 53, name: '宝剑四', nameEn: 'Four of Swords', type: 'swords', typeName: '宝剑', number: 4, element: '风', keywords: ['休息', '恢复', '冥想', '疗愈'], upright: '暂停下来休息和恢复，教堂中静卧的骑士。从忙碌和压力中抽身，给自己时间充电和冥想。这是必要的停顿。', reversed: '无法休息，焦虑， restless，过早恢复行动，缺乏耐心。', image: '教堂中的骑士石棺上静卧，双手交叉胸前，上方悬挂三把宝剑，彩色玻璃窗透进光' },
  { id: 54, name: '宝剑五', nameEn: 'Five of Swords', type: 'swords', typeName: '宝剑', number: 5, element: '风', keywords: ['冲突', '胜利', '不择手段', 'pyrrhic'], upright: '一场不愉快的胜利，虽然赢了但付出了代价。可能伤害了他人或自己。反思一下这场胜利是否值得，或者是否可以更圆融地处理。', reversed: '和解，放下争执，过去的冲突被解决，学会合作，不再有胜者心态。', image: '一名男子手持三把宝剑，地上有两把，远处两个 defeated的人低着头' },
  { id: 55, name: '宝剑六', nameEn: 'Six of Swords', type: 'swords', typeName: '宝剑', number: 6, element: '风', keywords: ['过渡', '离开', '疗愈', '前进'], upright: '离开困境，驶向更平静的水域。虽然带着过去的伤痛，但正在前往更好的地方。这是一个疗愈性的过渡时期。', reversed: '无法前进，滞留，逃避问题，过渡困难，回到旧环境。', image: '小船载着母子驶向平静的水域，船夫撑着六把宝剑做桨，远处是新的陆地' },
  { id: 56, name: '宝剑七', nameEn: 'Seven of Swords', type: 'swords', typeName: '宝剑', number: 7, element: '风', keywords: ['欺骗', '策略', ' sneakiness', '狡诈'], upright: '需要策略和计谋，但警告你可能在欺骗他人或被欺骗。偷偷摸摸不是长久之计，考虑用更诚实的方式达成目标。', reversed: '秘密被揭露，意识到被骗，改变策略，诚实面对，阴谋被识破。', image: '男子偷偷摸摸地拿着五把宝剑，回头看向营地中剩下的两把宝剑' },
  { id: 57, name: '宝剑八', nameEn: 'Eight of Swords', type: 'swords', typeName: '宝剑', number: 8, element: '风', keywords: ['束缚', '受限', '恐惧', '无力'], upright: '被自己的恐惧和想法困住，女子被蒙眼绑在插满宝剑的圈子里。但仔细看，束缚很松，你可以自己挣脱。这是自我设限。', reversed: '挣脱束缚，获得自由，看清真相，摆脱恐惧，新视角。', image: '蒙眼绑手的女子站在八把宝剑围成的圈子里，脚下是水洼，远处是城堡' },
  { id: 58, name: '宝剑九', nameEn: 'Nine of Swords', type: 'swords', typeName: '宝剑', number: 9, element: '风', keywords: ['焦虑', '噩梦', ' guilt', '痛苦'], upright: '深夜的焦虑和恐惧折磨着你，噩梦惊醒。这些痛苦更多存在于你的脑海中，实际情况可能没那么糟。寻求帮助，不要独自承受。', reversed: '希望出现，焦虑减轻，噩梦结束，学会释放压力，走出 dark thoughts。', image: '深夜中惊醒的女子坐在床上抱头痛哭，墙上悬挂着九把宝剑，被子上有玫瑰图案' },
  { id: 59, name: '宝剑十', nameEn: 'Ten of Swords', type: 'swords', typeName: '宝剑', number: 10, element: '风', keywords: ['终结', '背叛', ' rock bottom', '新开始'], upright: '痛苦的终结，一切已经跌到谷底。虽然看起来很惨，但这意味着最坏的情况已经过去。黎明前的黑暗，新的循环即将开始。', reversed: '从谷底爬起，最坏的情况已经过去，开始复苏，survival，rebirth。', image: '一名男子俯卧在地，背上插着十把宝剑，天空是黑暗的但远方有曙光' },
  { id: 60, name: '宝剑侍从', nameEn: 'Page of Swords', type: 'swords', typeName: '宝剑', number: 11, element: '风', keywords: ['好奇', '警觉', '新想法', '沟通'], upright: '一个好奇而警觉的年轻人，充满新想法和求知欲。保持警觉但不要太 paranoid，新的消息或信息即将到来。', reversed: ' gossip，刺探隐私，说话不经大脑，deception，过于批评。', image: '年轻侍从手持宝剑，站在风中，头发和衣服被风吹起，头顶有飞鸟' },
  { id: 61, name: '宝剑骑士', nameEn: 'Knight of Swords', type: 'swords', typeName: '宝剑', number: 12, element: '风', keywords: ['行动', '果断', '激进', '冲动'], upright: '雷厉风行的行动派，目标明确后毫不犹豫地冲向前。虽然效率高，但要注意不要伤害沿途的人。快速解决问题。', reversed: '鲁莽，暴力，不考虑后果，冲动行事，言语伤人， chaos。', image: '骑士高举宝剑，骑着骏马在风中疾驰，盔甲和披风在风中猎猎作响' },
  { id: 62, name: '宝剑王后', nameEn: 'Queen of Swords', type: 'swords', typeName: '宝剑', number: 13, element: '风', keywords: ['独立', '清晰', '诚实', '理智'], upright: '理智而独立的女性，思维清晰，说一不二。她经历过痛苦所以懂得同理，但不会让情感影响判断。寻求真相。', reversed: '冷酷，刻薄，过于 critical，心怀怨恨， emotional coldness， manipulation。', image: '端坐王座的王后手持宝剑，一只手伸出，天空中有飞鸟，王座上有蝴蝶天使' },
  { id: 63, name: '宝剑国王', nameEn: 'King of Swords', type: 'swords', typeName: '宝剑', number: 14, element: '风', keywords: ['权威', '公正', '智慧', '纪律'], upright: '理智而公正的权威人物，善于分析和判断。用头脑而非情感来做决定，追求真理和正义。值得信赖的顾问。', reversed: '暴君，滥用权力，冷酷无情， manipulate with intellect，不公正的判决。', image: '威严的国王端坐王座，手持宝剑，身披蓝色披风，身后是蓝天白云和飞鸟' }
];

// 小阿尔卡纳 - 星币（土元素）
const PENTACLES: TarotCard[] = [
  { id: 64, name: '星币首牌', nameEn: 'Ace of Pentacles', type: 'pentacles', typeName: '星币', number: 1, element: '土', keywords: ['新机会', '财富', '物质', 'manifestation'], upright: '物质世界的新机会，财富、事业或健康方面的好消息。一个实际可行的计划即将落地，抓住这个 concrete 的机会。', reversed: '错失机会，财务损失，贪婪， materialism，计划不切实际。', image: '云中伸出的一只手托着星币，下方是花园和拱门，通往远方的山峰' },
  { id: 65, name: '星币二', nameEn: 'Two of Pentacles', type: 'pentacles', typeName: '星币', number: 2, element: '土', keywords: ['平衡', ' juggling', '适应', '灵活'], upright: '在两个 priorities 之间 juggling，但你处理得很好。保持灵活和适应能力，像杂耍一样优雅地管理多重任务。', reversed: ' overwhelmed，失去平衡，财务管理混乱，无法兼顾， overloaded。', image: '杂耍艺人在海边玩两个星币，身后是起伏的波涛和帆船，形成无限符号' },
  { id: 66, name: '星币三', nameEn: 'Three of Pentacles', type: 'pentacles', typeName: '星币', number: 3, element: '土', keywords: ['合作', '技能', ' craftsmanship', '团队'], upright: '团队合作带来成功，你的技能得到认可。在工作或项目中与他人协作，专业的 craftsmanship 会被赏识。', reversed: '团队不和，技能不足，缺乏合作精神，工作质量差，不被认可。', image: '教堂中的工匠向两位修士展示他的作品，手中工具表明他是一名石匠' },
  { id: 67, name: '星币四', nameEn: 'Four of Pentacles', type: 'pentacles', typeName: '星币', number: 4, element: '土', keywords: ['控制', '保守', '稳定', '占有欲'], upright: '紧握你所拥有的，财务稳定但也可能过于保守。安全感很重要，但不要因过度控制而错失机会。适度的节俭是明智的。', reversed: '放手，慷慨，财务损失，放开控制，过度消费， material insecurity。', image: '紧坐宝座的男子双手各抱一个星币，脚下踩着两个，头顶还顶着一个' },
  { id: 68, name: '星币五', nameEn: 'Five of Pentacles', type: 'pentacles', typeName: '星币', number: 5, element: '土', keywords: ['困难', '损失', '贫穷', '孤立'], upright: '物质上的困难时期，感到被冷落或孤立。虽然处境艰难，但帮助就在身边（教堂的窗户就在附近），你只是需要抬头看见它。', reversed: '困境结束，恢复，找到帮助，走出匮乏， new opportunities， spiritual growth。', image: '大雪中两个衣衫褴褛的人走过教堂 stained glass window，但似乎没有看见身后的温暖' },
  { id: 69, name: '星币六', nameEn: 'Six of Pentacles', type: 'pentacles', typeName: '星币', number: 6, element: '土', keywords: ['给予', '接受', '慷慨', '平衡'], upright: '施与受的平衡，慷慨地给予他人，或接受别人的帮助。财务上的互惠， charity 和 kindness 的能量流动。', reversed: ' strings attached，不平等的交易，过度依赖，吝啬，被利用，债务。', image: '商人手持天平，向 beggars施舍星币，身后是他的商店和财富' },
  { id: 70, name: '星币七', nameEn: 'Seven of Pentacles', type: 'pentacles', typeName: '星币', number: 7, element: '土', keywords: ['耐心', '评估', '等待', '成长'], upright: '辛勤耕耘后等待收获的时刻。停下来评估你的 progress，耐心是成功的关键。之前的投资即将见到成果，但还需要一点时间。', reversed: '焦虑，impatience，投资失败，缺乏回报， frustration， bad investment。', image: '农夫倚着锄头，站在藤蔓前沉思，藤蔓上挂着七个星币果实' },
  { id: 71, name: '星币八', nameEn: 'Eight of Pentacles', type: 'pentacles', typeName: '星币', number: 8, element: '土', keywords: ['勤奋', '技能', '专注', '精益求精'], upright: '专注投入工作，精益求精， craftsmanship 不断提升。通过勤奋和专注，你的技能正在达到新的高度。努力工作会有回报。', reversed: '完美主义，工作狂，缺乏激情， mediocre work， no progress， burnout。', image: '工匠专注地在工作台上雕刻星币，周围是已完成的七个星币，墙上挂着工具' },
  { id: 72, name: '星币九', nameEn: 'Nine of Pentacles', type: 'pentacles', typeName: '星币', number: 9, element: '土', keywords: ['独立', '享受', '自给自足', '优雅'], upright: '享受独立和自给自足的成果，优雅地生活。财务独立带来的自由，你可以享受劳动的果实而不依赖他人。', reversed: '依赖他人， superficial，工作与生活失衡，缺乏独立性， materialism。', image: '优雅的女子站在葡萄园中，头戴猎鹰，身后是九个星币，远处是庄园' },
  { id: 73, name: '星币十', nameEn: 'Ten of Pentacles', type: 'pentacles', typeName: '星币', number: 10, element: '土', keywords: ['传承', '财富', '家庭', 'legacy'], upright: '家族的财富和传承， long-term security，物质上的极大丰富。三代同堂的和谐画面， legacy 和 inheritance 的 blessings。', reversed: '家庭财务纠纷， loss of wealth， short-term thinking，家族冲突， financial instability。', image: '祖孙三代在拱门下，上方是十个星币排列成生命之树图案，远处是城市和花园' },
  { id: 74, name: '星币侍从', nameEn: 'Page of Pentacles', type: 'pentacles', typeName: '星币', number: 11, element: '土', keywords: ['学习', '机会', '野心', '务实'], upright: '一个务实的年轻人带来新的学习机会或财务消息。对知识和物质成功的渴望，愿意脚踏实地去实现目标。', reversed: '缺乏 progress，bad news， laziness， missed opportunity， lack of ambition。', image: '年轻侍从站在花园中，双手捧着星币，专注地凝视着它，背景是耕地和树林' },
  { id: 75, name: '星币骑士', nameEn: 'Knight of Pentacles', type: 'pentacles', typeName: '星币', number: 12, element: '土', keywords: ['勤奋', '可靠', '耐心', '务实'], upright: '最勤奋可靠的骑士，一步一个脚印地朝着目标前进。虽然慢但稳，持之以恒的努力终将带来成功。值得信赖。', reversed: '停滞不前， stubbornness， boredom，过于保守， lack of progress， stuck in routine。', image: '骑士端坐马背，手持星币，马匹稳步行进，周围是耕作的农田' },
  { id: 76, name: '星币王后', nameEn: 'Queen of Pentacles', type: 'pentacles', typeName: '星币', number: 14, element: '土', keywords: ['滋养', '实际', '慷慨', '母性'], upright: '实际而慷慨的女性，善于管理资源，照顾他人。将爱和滋养落地到日常生活中，让家成为温暖的港湾。脚踏实地。', reversed: '过度 materialism， work-life imbalance， smothering， financial insecurity， neglecting self-care。', image: '王座上的王后手持星币，身边是兔子，脚下是玫瑰和瓜果，背景是金色麦田' },
  { id: 77, name: '星币国王', nameEn: 'King of Pentacles', type: 'pentacles', typeName: '星币', number: 14, element: '土', keywords: ['成功', '财富', '领导力', '稳重'], upright: '物质世界的成功人士，稳重而有远见。善于管理财富和资源，是可靠的领导者和提供者。享受但也懂得珍惜。', reversed: '贪婪， materialism， stubbornness， financial loss， corruption， overindulgence。', image: '威严的国王端坐华丽王座，手持权杖和星币，身披牛纹披风，周围是葡萄和城堡' }
];

// 完整牌组
export const FULL_DECK: TarotCard[] = [...MAJOR_ARCANA, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES];

// 按ID获取单张牌
export function getCardById(id: number): TarotCard | undefined {
  return FULL_DECK.find(c => c.id === id);
}

// 按名称获取牌
export function getCardByName(name: string): TarotCard | undefined {
  return FULL_DECK.find(c => c.name === name || c.nameEn === name);
}

// 洗牌算法（Fisher-Yates）
export function shuffleDeck(): TarotCard[] {
  const deck = [...FULL_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// 抽牌（指定数量，每张牌有正逆位）
export interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
  position: string;
}

export function drawCards(count: number, positions?: string[]): DrawnCard[] {
  const deck = shuffleDeck();
  const result: DrawnCard[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      card: deck[i],
      reversed: Math.random() > 0.5,
      position: positions?.[i] || `第${i + 1}张`,
    });
  }
  return result;
}

// 牌阵定义
export interface SpreadType {
  name: string;
  positions: string[];
  description: string;
  count: number;
}

export const SPREAD_TYPES: SpreadType[] = [
  {
    name: '单张牌',
    positions: ['此刻指引'],
    description: '最简单直接的指引，适合每日抽牌或快速询问',
    count: 1
  },
  {
    name: '三张牌',
    positions: ['过去', '现在', '未来'],
    description: '经典的时间之流牌阵，揭示事情的来龙去脉',
    count: 3
  },
  {
    name: '问题与建议',
    positions: ['问题核心', '障碍', '建议', '结果'],
    description: '针对具体问题分析现状、障碍和解决方向',
    count: 4
  },
  {
    name: '凯尔特十字',
    positions: ['现状', '挑战', '过去', '未来', '目标', '潜意识', '建议', '环境', '希望', '结果'],
    description: '最经典的塔罗牌阵，全方位分析问题的各个层面',
    count: 10
  },
  {
    name: '关系牌阵',
    positions: ['你', '对方', '关系现状', '共同挑战', '关系潜力'],
    description: '分析两个人之间的关系动态和发展方向',
    count: 5
  },
  {
    name: '选择牌阵',
    positions: ['现状', '选择A的优势', '选择A的劣势', '选择B的优势', '选择B的劣势', '建议'],
    description: '面临两难选择时，对比分析各选项的利弊',
    count: 6
  }
];
