# 童画·奇境 (TongHua·QiJing) 🎨✨

> **互联网+大学生创新创业大赛参赛项目**
> 
> 基于多模态大模型的儿童创意教育生态平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-2.x-green.svg)](https://flask.palletsprojects.com/)
[![Status](https://img.shields.io/badge/Status-6大功能全部可用-success.svg)]()

---

## 🌟 项目亮点

**不是简单的AI工具，而是完整的儿童创意教育生态**

### 核心创新（6大功能全部实现）

| 功能 | 创新点 | 教育价值 |
|-----|--------|---------|
| 🎭 **互动故事分支选择** | 3分支×2层深度=6种结局 | 培养决策思维、逻辑能力 |
| 💡 **AI创作引导助手** | 启发式提问替代直接生成 | 保护原创力、引导思考 |
| 📊 **成长时间轴档案** | 5维能力雷达图+里程碑 | 可视化成长轨迹 |
| 🎙️ **家长配音共创** | 亲子协同+模拟录音 | 情感纽带、家庭记忆 |
| ⛓️ **区块链原创存证** | 数字证书+版权教育 | 知识产权启蒙 |
| 👨‍🏫 **班级教师管理** | 班级看板+能力分析 | B端落地、学校推广 |

---

## 🚀 快速开始

### 方式一：本地演示（零成本，推荐）

```bash
# 1. 启动后端
cd backend
python app_simple.py
# → 自动运行在 http://localhost:5001

# 2. 启动前端（新终端）
cd frontend
npm install  # 首次运行
npm run dev
# → 自动运行在 http://localhost:5173
```

**无需配置API Key，自动使用模拟数据模式，所有功能可用！**

### 方式二：完整功能模式

```bash
# 1. 配置环境变量
cd backend
cp .env.example .env
# 编辑 .env，添加：
# DOUBAO_API_KEY=your_api_key
# LLM_API_KEY=your_key

# 2. 启动服务
python app_simple.py
```

---

## 📂 项目结构

```
06童话/
├── 📁 frontend/              # React 前端
│   ├── src/
│   │   ├── components/      # ✨ 11个组件全部实现
│   │   │   ├── InteractiveStory.jsx     # 互动故事分支
│   │   │   ├── CreativeGuidance.jsx     # AI创作引导
│   │   │   ├── AbilityRadarChart.jsx      # 能力雷达图
│   │   │   ├── CreationTimeline.jsx       # 创作时间轴
│   │   │   ├── ParentVoiceOver.jsx        # 家长配音
│   │   │   ├── BlockchainCertificate.jsx  # 区块链证书
│   │   │   ├── TeacherDashboard.jsx       # 教师管理
│   │   │   └── PageTransition.jsx         # 页面动效
│   │   ├── pages/           # 📄 5个页面
│   │   │   ├── GalleryPage.jsx
│   │   │   ├── WorkspacePage.jsx
│   │   │   ├── DetailPage.jsx
│   │   │   ├── ProgressPage.jsx           # 成长档案
│   │   │   └── TeacherPage.jsx            # 教师端
│   │   └── services/api.js  # API服务层
│   └── package.json
│
├── 📁 backend/               # Flask 后端
│   ├── app_simple.py        # 主应用（含6大功能API）
│   └── services/
│       ├── creative_guidance.py   # 创作引导服务
│       └── progress_analyzer.py   # 成长分析服务
│
├── 📁 storage/               # 数据存储
│   └── data/
│       └── creations.json   # 作品数据
│
└── 📄 文档
    ├── DEVELOPMENT_PLAN.md           # 功能开发大纲
    ├── TESTING_GUIDE.md              # 测试清单
    ├── UPDATE_LOG.md                 # 更新日志
    ├── DOUBAO_FREE_TIER_GUIDE.md     # 免费API获取指南
    └── DEPLOYMENT.md                 # 部署指南
```

---

## ✨ 功能详解

### 1️⃣ 互动故事分支选择 🎭

**路径**：作品详情页 → 互动故事

- 9个故事节点，6种不同结局
- 孩子通过点击按钮决定故事走向
- 进度指示器显示故事章节
- 完成时庆祝动画 + 成就徽章

```
[根节点]
├─ 🌸 发光的花 → [种子结局] / [花园结局]
├─ 🦋 会说话的蝴蝶 → [彩虹湖结局] / [分享结局]
└─ 🏠 神秘小屋 → [饼干店结局] / [勇气结局]
```

### 2️⃣ AI创作引导助手 💡

**路径**：工作台 → 右侧浮动面板

- 4个创作阶段渐进式提示
- 启发式问题（不问"是什么"，问"为什么"）
- 个性化建议（基于画面元素分析）
- 鼓励语增强孩子信心

**示例提示**：
> "你的小兔子看起来很开心，它在想什么呢？"
> "试着给画面加一个边框，像画框一样"

### 3️⃣ 作品成长时间轴 📊

**路径**：访问 `/progress/user_001`

- 创作里程碑可视化
- 5维能力雷达图（色彩、构图、叙事、细节、创意）
- 成长洞察与个性化建议
- 作品数量、创作天数统计

### 4️⃣ 家长配音共创 🎙️

**路径**：作品详情页 → 亲子配音室

- 模拟录音功能（3秒自动保存）
- 快速选择：妈妈/爸爸/奶奶版配音
- 支持上传本地音频文件
- 配音列表管理

### 5️⃣ 区块链原创存证 ⛓️

**路径**：作品详情页 → 原创保护

- 申请后2秒生成数字证书
- 证书信息：编号、哈希、区块高度、交易哈希
- 点击下载生成PNG证书图片
- 区块链知识科普提示

### 6️⃣ 班级教师管理 👨‍🏫

**路径**：访问 `/teacher`

- 班级概览（本周新增、平均能力分）
- 学生列表与排名
- 班级能力分布分析
- 作品墙展示

---

## 🛠️ 技术栈

### 前端
- **React 18** - UI框架
- **Framer Motion** - 动画库（庆祝动效、页面过渡）
- **Three.js** - 3D展示（画廊页面）
- **Axios** - HTTP客户端
- **Zustand** - 状态管理

### 后端
- **Flask** - Web框架
- **SQLite/JSON** - 数据存储
- **Python** - 业务逻辑

### AI服务（可选配置）
- **豆包API** - 视频生成
- **DeepSeek/Qwen** - 故事生成
- **本地模板** - 离线演示模式（已内置）

---

## 📖 文档索引

| 文档 | 说明 |
|-----|------|
| [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) | 功能开发大纲、创新点分析 |
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | 功能测试清单、验证步骤 |
| [UPDATE_LOG.md](UPDATE_LOG.md) | 更新日志、完善记录 |
| [DOUBAO_FREE_TIER_GUIDE.md](DOUBAO_FREE_TIER_GUIDE.md) | API免费额度获取指南 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 部署配置、上线指南 |

---

## 🎯 比赛答辩要点

### 核心问题：为什么不用豆包直接生成？

**我们的回答是：**

> 豆包是**工具**，我们是**教育生态**。

| 维度 | 豆包（单次交互） | 我们的平台（教育闭环） |
|-----|-----------------|---------------------|
| 目标 | 快速生成内容 | 培养儿童创造力 |
| 方式 | AI直接输出 | AI引导+孩子创作 |
| 成果 | 一次性视频 | 成长档案+多结局故事 |
| 价值 | 娱乐 | 教育+情感+版权保护 |
| 场景 | 个人使用 | 学校课堂+亲子互动 |

**6大创新壁垒：**
1. ✅ 教育闭环（创作→引导→档案→成长）
2. ✅ 互动叙事（6种结局培养逻辑思维）
3. ✅ 成长记录（3-12岁能力发展轨迹）
4. ✅ 亲子协同（家庭共创情感记忆）
5. ✅ 原创保护（区块链版权启蒙）
6. ✅ 教师管理（B端学校落地）

---

## � 部署上线

### 免费部署方案

```bash
# 前端 → Vercel（免费）
cd frontend
npm i -g vercel
vercel --prod

# 后端 → Railway（免费额度）
# 或本地服务器 + 花生壳内网穿透
```

**推荐比赛方案**：阿里云轻量服务器（学生优惠¥100/年）

详见 [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 💰 免费API获取

- **火山引擎新用户礼包**：300元代金券（即时到账）
- **教育扶持计划**：5000元额度（需申请，7-15天）
- **GitHub学生包**：500元（需.edu邮箱）

详见 [DOUBAO_FREE_TIER_GUIDE.md](DOUBAO_FREE_TIER_GUIDE.md)

---

## 📝 最新更新（2026-02-27）

### ✅ 新增功能
- 作品导出（下载JSON文件）
- 区块链证书下载（生成PNG图片）
- 故事完成庆祝动画（弹跳emoji+成就徽章）
- 魔法加载组件（旋转动画+进度点）
- 分享功能（复制链接到剪贴板）

### ✅ 优化改进
- 页面过渡动画
- 加载状态优化
- Toast提示统一
- 骨架屏占位

---

## 👥 团队

**互联网+创新创业大赛参赛团队**

- 项目阶段：原型已完成，6大功能全部可用
- 落地进展：已联系3所学校试点意向
- 商业合作：与2家出版社洽谈IP孵化

---

## 📄 License

MIT License © 2026 童画·奇境团队

---

**🎨 让每个孩子都能成为故事的导演！**

