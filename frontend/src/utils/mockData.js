export const mockPartners = [
  {
    id: 'pub_tongqu',
    type: 'publisher',
    name: '童趣出版社',
    logo: '📚',
    status: 'partnered',
    statusLabel: '已合作',
    statusColor: 'green',
    collaborator: '签约编辑：张老师',
    description: '专注 3-12 岁儿童原创绘本出版，已开放绘本投稿绿色通道。',
    benefit: '投稿转化率提升 40%',
    highlight: '提供绘本排版辅导与版权答疑',
    stageNote: '2026 年 1 月完成首轮签约'
  },
  {
    id: 'pub_kuaile',
    type: 'publisher',
    name: '快乐童书',
    logo: '📖',
    status: 'partnered',
    statusLabel: '已合作',
    statusColor: 'green',
    collaborator: '版权经理：李经理',
    description: '擅长少儿故事合集与桥梁书策划，支持系列化孵化。',
    benefit: '版权收益分成 30%',
    highlight: '每月一次线上选题会',
    stageNote: '2026 年 2 月开通专属投稿池'
  },
  {
    id: 'pub_xingchen',
    type: 'publisher',
    name: '星辰工作室',
    logo: '🎬',
    status: 'negotiating',
    statusLabel: '意向中',
    statusColor: 'amber',
    collaborator: '制片人：王导演',
    description: '聚焦儿童短动画与音频故事改编，正在评估 IP 孵化合作。',
    benefit: '动画改编保底授权合作',
    highlight: '优先筛选具有连续剧情的作品',
    stageNote: '预计 2026 年 Q2 完成试点签约'
  },
  {
    id: 'school_sunshine',
    type: 'school',
    name: '阳光小学',
    logo: '🏫',
    status: 'partnered',
    statusLabel: '已合作',
    statusColor: 'green',
    collaborator: '对接教师：刘老师',
    description: '美育课程试点学校，已覆盖 3 个班级、126 名学生。',
    benefit: '教师端深度适配',
    highlight: '每周作品墙和班级创作报告',
    stageNote: '首批试点教师已完成培训'
  },
  {
    id: 'school_star',
    type: 'school',
    name: '星辰国际学校',
    logo: '🎓',
    status: 'partnered',
    statusLabel: '已合作',
    statusColor: 'green',
    collaborator: '教研主任：王老师',
    description: '将创意写作与绘画表达结合，支持双语绘本展示。',
    benefit: '课堂成果可视化分析',
    highlight: '支持班级主题创作赛',
    stageNote: '已完成 5 个班级覆盖'
  },
  {
    id: 'school_future',
    type: 'school',
    name: '未来幼儿园',
    logo: '🧸',
    status: 'negotiating',
    statusLabel: '意向中',
    statusColor: 'amber',
    collaborator: '园长：陈老师',
    description: '针对 3-6 岁儿童开展创意启蒙项目，正在讨论课程适配。',
    benefit: '低龄启蒙内容模板包',
    highlight: '将开放亲子共创活动专区',
    stageNote: '预计下月启动体验营'
  }
];

export const mockPublishedWorks = [
  {
    id: 'work_rainbow_bridge',
    title: '彩虹桥的秘密',
    author: '李小明（8岁）',
    school: '阳光小学',
    publisher: '快乐童书',
    publishDate: '2026-01-15',
    coverImage: '🌈',
    category: '绘本',
    status: 'published',
    sales: '5,000 册',
    revenue: '¥12,500',
    rating: '4.8',
    story: '围绕勇气与友谊展开的原创绘本故事，已进入校园推荐书单。',
    tags: ['校园推荐', '暖心成长']
  },
  {
    id: 'work_bunny_trip',
    title: '小兔子的冒险之旅',
    author: '张欣欣（9岁）',
    school: '星辰国际学校',
    publisher: '童趣出版社',
    publishDate: '2026-02-20',
    coverImage: '🐰',
    category: '绘本',
    status: 'published',
    sales: '3,200 册',
    revenue: '¥9,600',
    rating: '4.7',
    story: '一只勇敢的小兔子踏上寻找彩虹的旅程，入选春季亲子共读推荐榜。',
    tags: ['亲子共读', '旅行冒险']
  },
  {
    id: 'work_ocean',
    title: '海底奇遇记',
    author: '王乐乐（7岁）',
    school: '阳光小学',
    publisher: '星辰工作室',
    publishDate: '2026-03-01',
    coverImage: '🐠',
    category: '动画',
    status: 'production',
    sales: '-',
    revenue: '预计 ¥20,000',
    rating: '-',
    story: '海洋朋友主题改编动画开发中，已完成角色设定与分镜初稿。',
    tags: ['动画开发', '海洋主题']
  },
  {
    id: 'work_sky_city',
    title: '天空之城',
    author: '陈思思（10岁）',
    school: '星辰国际学校',
    publisher: '童趣出版社',
    publishDate: '2026-02-28',
    coverImage: '🏰',
    category: '绘本',
    status: 'review',
    sales: '-',
    revenue: '待定',
    rating: '-',
    story: '关于梦想与探索的原创幻想故事，目前处于编辑终审阶段。',
    tags: ['终审中', '奇幻世界']
  },
  {
    id: 'work_forest_concert',
    title: '森林音乐会',
    author: '周可可（8岁）',
    school: '阳光小学',
    publisher: '快乐童书',
    publishDate: '2026-03-06',
    coverImage: '🎻',
    category: '故事集',
    status: 'review',
    sales: '-',
    revenue: '待定',
    rating: '-',
    story: '以声音想象力为主题的原创故事作品，已进入编辑二轮评审。',
    tags: ['音乐主题', '二轮评审']
  }
];

export const mockSubmissionPublishers = [
  {
    id: 'publisher_1',
    name: '童趣出版社',
    type: '绘本',
    description: '专注 3-12 岁儿童原创绘本出版，适合完整故事型作品。',
    logo: '📚',
    acceptance: '高',
    territory: '全国',
    revenue: '35% 分成',
    reviewCycle: '5-7 个工作日'
  },
  {
    id: 'publisher_2',
    name: '快乐童书',
    type: '故事集',
    description: '面向校园故事合集与成长主题内容，编辑反馈节奏较快。',
    logo: '📖',
    acceptance: '中高',
    territory: '全国 + 海外版权',
    revenue: '30% 分成',
    reviewCycle: '7-10 个工作日'
  },
  {
    id: 'publisher_3',
    name: '星辰工作室',
    type: '动画改编',
    description: '适合角色鲜明、剧情连续的作品，偏向 IP 孵化合作。',
    logo: '🎬',
    acceptance: '中',
    territory: '全球发行',
    revenue: '25% 保底 + 分成',
    reviewCycle: '10-15 个工作日'
  }
];

export const mockSubmissionHistory = [
  {
    id: 'sub_1',
    title: '小兔子的冒险之旅',
    publisher: '童趣出版社',
    status: 'review',
    label: '审核中',
    date: '2026-03-08',
    icon: '⏳',
    note: '编辑已接收，等待终审'
  },
  {
    id: 'sub_2',
    title: '彩虹桥的秘密',
    publisher: '快乐童书',
    status: 'accepted',
    label: '已录用',
    date: '2026-02-25',
    icon: '✅',
    note: '已进入排版与封面设计阶段'
  },
  {
    id: 'sub_3',
    title: '海底奇遇记',
    publisher: '星辰工作室',
    status: 'production',
    label: '改编中',
    date: '2026-03-02',
    icon: '🎬',
    note: '正在确认角色动作设定'
  }
];

export const mockPartnerTimeline = [
  {
    date: '2026-01',
    title: '与童趣出版社达成合作意向',
    description: '完成首轮合作确认，开放绘本投稿绿色通道。'
  },
  {
    date: '2026-02',
    title: '阳光小学签约试点',
    description: '3 个班级启动试点应用，教师端报告功能完成首轮交付。'
  },
  {
    date: '2026-03',
    title: '首批作品进入出版社评审',
    description: '《彩虹桥的秘密》等 5 部作品进入合作方编辑评审流程。'
  },
  {
    date: '2026-Q2',
    title: '星辰工作室启动动画改编试点',
    description: '将重点孵化 2 个高潜力儿童原创内容 IP。'
  }
];

export const mockFaq = {
  revenueItems: [
    '图书出版：按合同约定向创作者发放 25-35% 版权收益分成',
    '动画改编：按合作协议向创作者发放 20-30% 改编收益分成',
    '校园合作：入选校本案例库的作品可获得创作激励金'
  ],
  schoolBenefits: [
    '50 个学生账号，无限制作品创作',
    '教师管理看板，班级数据分析',
    '作品投稿通道，优秀作品可推荐至合作出版社',
    'AI 课程资源库，美育教案辅助工具',
    '专属客服，技术支持响应时间 <24h'
  ]
};

export const mockBusinessModels = [
  {
    id: 'b2b',
    title: 'B2B 学校订阅',
    icon: '🏫',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    borderColor: 'border-blue-200',
    price: '¥3,000/年/班',
    description: '面向小学、幼儿园等教育机构提供班级级订阅与教学支持服务。',
    features: [
      { label: '50 个学生账号', value: '包含' },
      { label: '教师管理看板', value: '✓' },
      { label: '作品投稿通道', value: '✓' },
      { label: '数据分析报告', value: '✓' },
      { label: '专属客服支持', value: '✓' },
      { label: 'API 对接集成', value: '选配 +¥1,000' }
    ],
    market: '全国 20 万+学校',
    growth: '试点学校续费意向 82%'
  },
  {
    id: 'c2c',
    title: 'C2C 增值功能',
    icon: '✨',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-900',
    borderColor: 'border-purple-200',
    price: '¥9.9/月 或 ¥99/年',
    description: '面向家庭用户提供成长报告、作品集与家庭共创等增值服务。',
    features: [
      { label: '无限作品创作', value: '✓' },
      { label: 'VIP 专属课程', value: '10+节/月' },
      { label: 'AI 导师启发', value: '30 次/月' },
      { label: '作品优先审核', value: '✓' },
      { label: '家庭成长报告', value: '✓' },
      { label: '定制作品书', value: '选配 ¥299 起' }
    ],
    market: '适龄儿童家庭 1500 万+',
    growth: '月留存率 75%'
  },
  {
    id: 'ip',
    title: 'IP 孵化分成',
    icon: '📮',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-900',
    borderColor: 'border-amber-200',
    price: '25-35% 收益分成',
    description: '帮助儿童创作者对接出版社与内容机构，形成长期内容 IP 价值。',
    features: [
      { label: '出版社投稿', value: '3 家' },
      { label: '动画改编对接', value: '2 家' },
      { label: '版权跟踪服务', value: '✓' },
      { label: '收益自动结算', value: '✓' },
      { label: '作品定价建议', value: '✓' },
      { label: '法律支持', value: '选配服务' }
    ],
    market: '潜在创作者 500 万+',
    growth: '入池作品转化率 15%'
  }
];

export const mockRevenueForecast = {
  title: '收入预期预测（2026-2027）',
  cards: [
    {
      label: '2026 年目标',
      value: '¥150万',
      detail: 'B2B: 60% | C2C: 25% | IP: 15%'
    },
    {
      label: '2027 年预测',
      value: '¥500万',
      detail: 'B2B: 50% | C2C: 30% | IP: 20%'
    },
    {
      label: '客单价贡献',
      value: '¥135',
      detail: '学校: ¥3,000 | 家长: ¥99 | IP: ¥500'
    }
  ],
  disclaimer: '注意：以上数据为项目答辩演示用预测数据，实际收入会随渠道拓展、续费率和合作转化情况波动。'
};

export const mockTeacherDashboard = {
  className: '创意美术班（春季示范班）',
  studentCount: 42,
  totalWorks: 186,
  thisWeekWorks: 27,
  averageAbility: 84,
  topStudents: [
    { id: 'stu_1', name: '李小明', works: 12, score: 94 },
    { id: 'stu_2', name: '张欣欣', works: 10, score: 91 },
    { id: 'stu_3', name: '陈思思', works: 9, score: 89 },
    { id: 'stu_4', name: '周可可', works: 8, score: 87 }
  ],
  recentWorks: [
    { id: 'rw_1', student: '李小明', title: '彩虹桥的秘密', time: '今天 14:20', hasStory: true },
    { id: 'rw_2', student: '张欣欣', title: '小兔子的冒险之旅', time: '今天 11:35', hasStory: true },
    { id: 'rw_3', student: '周可可', title: '森林音乐会', time: '昨天 16:10', hasStory: false },
    { id: 'rw_4', student: '陈思思', title: '天空之城', time: '昨天 09:42', hasStory: true }
  ],
  abilityDistribution: [
    { label: '色彩感知', score: 88 },
    { label: '构图能力', score: 82 },
    { label: '叙事想象', score: 86 },
    { label: '细节丰富', score: 80 },
    { label: '创意独特', score: 84 }
  ]
};

export const mockFaqLanding = {
  subtitle: '了解项目合作进展、商业模式、合作材料与平台说明。',
  agreementDescription: '可查看与合作机构的意向协议展示内容，作为项目合作路径与商业闭环的答辩佐证材料。',
  contactTitle: '📞 欢迎咨询合作',
  contactDescription: '如果您是出版社、学校、教育机构或希望参与课程试点，欢迎与我们联系。',
  contacts: ['📧 business@tonghuaiqijing.com', '📱 400-888-8888']
};

export const mockPlatformStats = {
  showcaseWorks: 186,
  partnerCount: mockPartners.length
};

export const mockAbilityDefaultScores = {
  color_perception: 70,
  composition: 70,
  narrative: 70,
  detail_richness: 70,
  creativity: 70
};

export const mockAbilityConfig = [
  { key: 'color_perception', label: '色彩感知', color: '#FF6B6B' },
  { key: 'composition', label: '构图能力', color: '#4ECDC4' },
  { key: 'narrative', label: '叙事想象', color: '#45B7D1' },
  { key: 'detail_richness', label: '细节丰富', color: '#96CEB4' },
  { key: 'creativity', label: '创意独特', color: '#FFEAA7' }
];

export const mockAgreements = [
  {
    id: 'tongqu',
    title: '童趣出版社合作意向书',
    date: '2026-01-15',
    publisher: '童趣出版社',
    status: '已签署',
    contact: '签约编辑：张老师',
    file: 'tongqu_agreement.pdf',
    thumbnail: '📄',
    previewText: '甲方：童趣出版社\n乙方：童画·奇境团队\n\n一、合作内容\n1. 乙方将优质儿童原创作品推荐至甲方编辑池\n2. 甲方负责作品编辑、出版、发行\n3. 作品发行后，按约定向创作者发放版权收益\n\n二、合作期限\n本意向书自签署之日起有效期为 2 年\n\n……',
    code: 'AGR-THQ-2026-001'
  },
  {
    id: 'kuaile',
    title: '快乐童书合作意向书',
    date: '2026-02-10',
    publisher: '快乐童书',
    status: '洽谈中',
    contact: '版权经理：李经理',
    file: 'kuaile_agreement.pdf',
    thumbnail: '📘',
    previewText: '甲方：快乐童书\n乙方：童画·奇境团队\n\n合作条款草案\n\n一、合作意向\n针对儿童故事合集出版建立合作关系\n\n二、分成原则\n作品录用后，按照出版合同约定进行收益分成\n\n（注：以下条款正在商务洽谈中）',
    code: 'AGR-KL-2026-002'
  },
  {
    id: 'xingchen',
    title: '星辰工作室合作意向书',
    date: '2026-03-01',
    publisher: '星辰工作室',
    status: '签约中',
    contact: '制片人：王导演',
    file: 'xingchen_agreement.pdf',
    thumbnail: '🎬',
    previewText: '甲方：星辰工作室\n乙方：童画·奇境团队\n\n动画改编合作意向书\n\n一、作品类型\n儿童动画短片与有声故事改编\n\n二、授权范围\n经家长授权后，乙方可协助甲方进行动画开发评估\n\n（注：合同条款审核中）',
    code: 'AGR-XC-2026-003'
  }
];

export const mockAgreementContent = {
  headerText: '可下载查看与 {count} 家合作机构的意向协议展示内容',
  previewBadge: '项目材料预览 · 仅供答辩展示',
  disclaimer: '以上协议内容为项目答辩演示用材料，用于说明合作方向、商务流程和平台落地可行性，具体条款以正式签署版本为准。'
};

export const mockVoiceoverDemoVoices = [
  { id: 'mom', name: '妈妈温柔版', speaker: '妈妈', emoji: '👩', duration: '0:08', text: '宝贝，今天我们一起进入童话世界吧。' },
  { id: 'dad', name: '爸爸冒险版', speaker: '爸爸', emoji: '👨', duration: '0:06', text: '小英雄，准备好开始今天的奇妙冒险了吗？' },
  { id: 'grandma', name: '奶奶故事版', speaker: '奶奶', emoji: '👵', duration: '0:10', text: '乖孩子，奶奶给你讲一个温暖又神奇的故事。' }
];

export const mockVoiceoverConfig = {
  maxClips: 10,
  title: '🎙️ 家长配音室',
  subtitle: '为孩子的作品录制专属旁白，沉淀更有陪伴感的亲子创作记忆。',
  demoTitle: '🎭 快速选择示例配音',
  footerTip: '录音会优先保存在当前设备本地，每个作品最多保存 10 条配音。'
};

export const mockMagicEngineText = {
  processingHint: 'AI 正在整理画面、动画与故事内容，请稍候...',
  completedTitle: '创作完成！',
  completedSubtitle: '你的画作已经被整理成更完整的多模态展示内容。',
  errorTitle: '创作遇到问题'
};

export const mockNavConfig = {
  brandName: '童画·奇境',
  statsPrefix: '已展示',
  worksUnit: '份作品',
  partnerUnit: '个合作案例',
  loginLabel: '登录',
  logoutLabel: '退出',
  items: [
    { path: '/', label: '画廊', icon: '🏛️' },
    { path: '/workspace', label: '工作台', icon: '🎨' },
    { path: '/progress', label: '成长档案', icon: '📊', needsAuth: true },
    { path: '/teacher', label: '教师端', icon: '👨‍🏫' },
    { path: '/faq', label: '合作与FAQ', icon: '🤝' }
  ]
};

export const mockTeacherPageCopy = {
  title: '👨‍🏫 教师工作台',
  subtitle: '班级管理、作品观察与学生创作追踪',
  backButton: '返回画廊'
};

export const mockGalleryCopy = {
  title: '童画·奇境',
  subtitle: '欢迎来到儿童原创作品画廊',
  welcomeBackPrefix: '欢迎回来，',
  welcomeBackSuffix: '！',
  loadingText: '加载作品中...',
  retryButton: '重试',
  startButton: '开始创作 ✨',
  errors: {
    loadFailed: '加载作品失败',
    networkFailed: '加载作品失败，请检查网络连接'
  },
  emptyState: {
    title: '还没有作品',
    description: '成为第一位创作者，开启你的童画创作之旅！'
  },
  partnerSection: {
    title: '🤝 合作伙伴',
    description: '与出版社、学校和内容机构共同为儿童创作者提供展示与成长机会'
  }
};

export const mockWorkspaceCopy = {
  title: '神笔工作台 🎨',
  subtitle: '让你的画作延展成动画、故事与成长记录',
  welcomeBackPrefix: '欢迎回来，',
  welcomeBackSuffix: '！',
  viewResultButton: '查看作品',
  restartButton: '重新创作',
  backButton: '返回画廊',
  uploadSectionTitle: '上传你的画作',
  processingTitle: '创作处理中 ✨',
  errorTitle: '创作遇到问题',
  restartInlineButton: '重新开始'
};

export const mockWorkspaceGuidanceTemplates = {
  enhancing: {
    title: '🎨 画面优化建议',
    suggestions: [
      '试着调整亮度让画面更明亮',
      '增加对比度让细节更清晰',
      '适当提高饱和度让色彩更鲜艳'
    ],
    encouragement: '你的画作很有想象力，让我们把它整理得更完整。'
  },
  animating: {
    title: '🎬 动画延展思路',
    suggestions: [
      '考虑让画中的角色动起来',
      '添加一些魔法特效会很棒',
      '试试不同的动画风格'
    ],
    encouragement: '动画会让静态画面更有生命力！'
  },
  story_gen: {
    title: '📖 故事延展灵感',
    suggestions: [
      '画中的角色有什么特别的故事？',
      '这个场景发生在什么地方？',
      '接下来会发生什么奇妙的事情？'
    ],
    encouragement: '每幅画里都藏着一个独特故事，让我们一起把它讲出来！'
  }
};

export const mockLoginModalCopy = {
  header: {
    loginTitle: '🌟 欢迎回来',
    registerTitle: '✨ 加入童画·奇境',
    loginSubtitle: '登录你的创作账户',
    registerSubtitle: '创建你的创作账户'
  },
  labels: {
    nickname: '🎭 昵称',
    email: '📧 邮箱',
    password: '🔒 密码',
    confirmPassword: '🔒 确认密码'
  },
  placeholders: {
    nickname: '给自己起个有趣的名字',
    email: 'your@email.com',
    password: '••••••••'
  },
  loading: {
    login: '登录中...',
    register: '注册中...'
  },
  actions: {
    login: '🚀 立即登录',
    register: '🎉 创建账户'
  },
  success: {
    login: '登录成功！',
    register: '注册成功！'
  },
  errors: {
    nicknameRequired: '请输入昵称',
    passwordTooShort: '密码至少需要6个字符',
    passwordMismatch: '两次输入的密码不一致',
    actionFailed: '操作失败，请重试'
  }
};

export const mockCreations = [
  {
    id: 'demo_creation_001',
    artwork_id: 'demo_artwork_001',
    user_id: 'demo_user_001',
    original_image: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=900&q=60',
    enhanced_image: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=900&q=75',
    animation: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    story: '小熊在彩虹桥下捡到一颗会发光的星星，于是踏上了寻找星星回家路的旅程。',
    created_at: '2026-03-18T10:20:00.000Z',
    updated_at: '2026-03-18T10:25:00.000Z'
  },
  {
    id: 'demo_creation_002',
    artwork_id: 'demo_artwork_002',
    user_id: 'demo_user_001',
    original_image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=60',
    enhanced_image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=75',
    animation: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    story: '小兔子画了一辆会飞的胡萝卜车，邀请朋友一起去云朵上开派对。',
    created_at: '2026-03-20T14:08:00.000Z',
    updated_at: '2026-03-20T14:13:00.000Z'
  },
  {
    id: 'demo_creation_003',
    artwork_id: 'demo_artwork_003',
    user_id: 'demo_user_002',
    original_image: 'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=900&q=60',
    enhanced_image: null,
    animation: null,
    story: null,
    created_at: '2026-03-23T09:40:00.000Z',
    updated_at: '2026-03-23T09:40:00.000Z'
  },
  {
    id: 'demo_creation_004',
    artwork_id: 'demo_artwork_004',
    user_id: 'demo_user_003',
    original_image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=900&q=60',
    enhanced_image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=900&q=75',
    animation: null,
    story: '在海底城市里，章鱼邮差每天把快乐装进泡泡信封送到每家每户。',
    created_at: '2026-03-25T16:30:00.000Z',
    updated_at: '2026-03-25T16:32:00.000Z'
  },
  {
    id: 'demo_creation_005',
    artwork_id: 'demo_artwork_005',
    user_id: 'demo_user_002',
    original_image: 'https://images.unsplash.com/photo-1526666923127-b2970f64b422?auto=format&fit=crop&w=900&q=60',
    enhanced_image: 'https://images.unsplash.com/photo-1526666923127-b2970f64b422?auto=format&fit=crop&w=900&q=75',
    animation: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    story: '天空之城的钟声一响，所有纸飞机都会变成真正的飞鸟。',
    created_at: '2026-03-28T08:55:00.000Z',
    updated_at: '2026-03-28T09:02:00.000Z'
  },
  {
    id: 'demo_creation_006',
    artwork_id: 'demo_artwork_006',
    user_id: 'demo_user_004',
    original_image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=900&q=60',
    enhanced_image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=900&q=75',
    animation: null,
    story: '森林音乐会开始前，小松鼠把每片树叶都调成不同的音符。',
    created_at: '2026-03-30T19:12:00.000Z',
    updated_at: '2026-03-30T19:18:00.000Z'
  }
];

export const mockCreationDetails = {
  demo_creation_001: {
    ...mockCreations[0],
    full_story: '小熊在彩虹桥下捡到一颗会发光的星星。它悄悄告诉小熊：只要跟着风的方向，就能找到回家的路。小熊穿过花田、翻过小山、越过小河，遇到害怕黑夜的小猫、迷路的小鸭和喜欢讲笑话的小狐狸。大家决定一起护送星星回家。最后，他们在森林最深处看到一棵会唱歌的树，星星在树顶轻轻一跳，回到了天空。彩虹桥在夜里亮起，像是在向他们道谢。',
    interactive_story: {
      root: {
        text: '你在彩虹桥下发现一颗会发光的星星，它说想回家。你会怎么做？',
        choices: [
          { id: 'follow_wind', text: '跟着风的方向走' },
          { id: 'ask_forest', text: '去问森林里的动物' },
          { id: 'build_boat', text: '做一艘纸船送它回去' }
        ]
      },
      follow_wind: {
        text: '风带你来到花田，萤火虫说星星喜欢听歌。你要唱什么歌？',
        choices: [
          { id: 'lullaby', text: '唱一首摇篮曲' },
          { id: 'march', text: '唱一首冒险进行曲' }
        ]
      },
      ask_forest: {
        text: '小狐狸说星星会在会唱歌的树附近出现。你要先做什么准备？',
        choices: [
          { id: 'snacks', text: '带上零食和水' },
          { id: 'map', text: '画一张路线地图' }
        ]
      },
      build_boat: {
        text: '纸船做好了，但河水很急。你会请谁来帮忙？',
        choices: [
          { id: 'duck', text: '请小鸭当船长' },
          { id: 'beaver', text: '请河狸搭个小桥' }
        ]
      },
      lullaby: {
        text: '星星在歌声里变得更亮了。它指向远处的树顶：那里就是回家的门。',
        choices: []
      },
      march: {
        text: '大家跟着节奏一路前进，遇到的每个朋友都加入了队伍，星星开心极了。',
        choices: []
      },
      snacks: {
        text: '你把零食分给小伙伴，队伍更团结了。夜晚也不再可怕。',
        choices: []
      },
      map: {
        text: '有了地图，你们很快找到了会唱歌的树。星星跳上树枝，回到天空。',
        choices: []
      },
      duck: {
        text: '小鸭稳稳地把纸船开到河中央，星星在水面上照出一条银色的路。',
        choices: []
      },
      beaver: {
        text: '河狸搭好小桥，你们安全通过。星星在桥上转圈，像在跳舞。',
        choices: []
      }
    },
    current_node: 'root',
    story_path: ['root']
  },
  demo_creation_002: {
    ...mockCreations[1],
    full_story: '小兔子的胡萝卜车有一对透明的翅膀，每次拍动都会洒下橙色的星光。它飞过学校操场，飞过小河和风车，最后停在一朵大云上。云朵上摆着棉花糖桌子和泡泡汽水，朋友们来了：小刺猬带来鼓，小乌龟带来慢慢的舞步，小猫带来会发光的贴纸。派对结束时，小兔子把每个人的笑声画在本子里，变成了下一幅画。'
  },
  demo_creation_003: {
    ...mockCreations[2],
    full_story: null,
    interactive_story: null
  },
  demo_creation_004: {
    ...mockCreations[3],
    full_story: '海底城市有一条“泡泡邮局街”，章鱼邮差有八个邮包：一个装问候、一个装勇气、一个装安慰、还有一个装惊喜。今天它要送的，是一封写着“谢谢你”的信。收信的小海马看完信，决定把自己的微笑也写成信，寄给下一位朋友。于是，快乐在海里像气泡一样一串串升起。'
  },
  demo_creation_005: {
    ...mockCreations[4],
    full_story: '天空之城的钟楼里住着一位修钟匠，他说：每一次滴答，都在把梦想往前推一点点。孩子们折纸飞机比赛，看谁能飞得最远。钟声一响，纸飞机轻轻一抖，变成真正的飞鸟，带着孩子们的愿望飞向远方。第二天，孩子们在窗台上发现了羽毛：那是愿望被收到的回信。'
  },
  demo_creation_006: {
    ...mockCreations[5],
    full_story: '森林音乐会的舞台用树根搭成，灯光是萤火虫，观众是蘑菇和露珠。小松鼠把树叶调成音符：红叶是高音，绿叶是中音，黄叶是低音。小鹿用脚步打节拍，小鸟负责合唱。最后一段旋律响起时，连风都放慢了脚步，认真听完这一场属于森林的演出。'
  }
};

export const getMockCreationDetail = (creationId) => {
  if (mockCreationDetails[creationId]) return mockCreationDetails[creationId];
  const found = mockCreations.find((c) => c.id === creationId);
  return found ? { ...found } : null;
};

export const getMockUserProgress = (userId) => {
  const myCreations = mockCreations.filter((c) => String(c.user_id) === String(userId));
  const total = myCreations.length;
  const first = myCreations[0]?.created_at;
  const last = myCreations[myCreations.length - 1]?.created_at;
  const spanDays = first && last ? Math.max(1, Math.ceil((new Date(last) - new Date(first)) / (1000 * 60 * 60 * 24))) : 0;

  const timeline = myCreations.map((c, idx) => {
    const branches = c.id === 'demo_creation_001' ? 3 : c.story ? 2 : 0;
    return {
      id: c.id,
      index: idx + 1,
      date: c.created_at,
      thumbnail: c.enhanced_image || c.original_image || null,
      status: (c.story || c.animation || c.enhanced_image) ? 'completed' : 'draft',
      has_animation: Boolean(c.animation),
      has_story: Boolean(c.story),
      story_branches: branches,
      milestone: idx === 0 ? '第一次创作' : idx === 2 ? '故事创作突破' : idx === 4 ? '动画作品上线' : null
    };
  });

  const ability_scores = {
    color_perception: 72 + Math.min(total * 3, 18),
    composition: 68 + Math.min(total * 4, 20),
    narrative: 65 + Math.min(timeline.filter(t => t.has_story).length * 6, 30),
    detail_richness: 70 + Math.min(total * 2, 16),
    creativity: 74 + Math.min(total * 3, 18)
  };

  const insights = [
    {
      type: 'strength',
      icon: '🌈',
      title: '色彩表达逐渐更大胆',
      message: '你喜欢使用明亮的颜色对比，让画面更有情绪。'
    },
    {
      type: 'improvement',
      icon: '🧩',
      title: '构图层次还可以更丰富',
      message: '试着把主体放在前景，并添加一些背景小细节。'
    },
    {
      type: 'tip',
      icon: '📖',
      title: '故事能力正在起飞',
      message: '你写的故事里角色很可爱，可以尝试加入“冲突-解决”的结构。'
    }
  ];

  return {
    summary: {
      total_creations: total,
      creation_span_days: spanDays
    },
    ability_scores,
    timeline,
    insights
  };
};
