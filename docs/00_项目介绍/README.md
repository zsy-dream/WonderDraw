# 童画·奇境（WonderDraw）项目介绍

## 项目一句话

童画·奇境是一个面向儿童的创意教育平台：以“创作引导 + 互动叙事 + 成长档案”为核心，把孩子的绘画/故事创作变成可记录、可回放、可持续成长的学习闭环。

本项目仓库同时包含：

- 前端 H5/PC Web（Vite + React）
- 后端 REST API（Flask）
- 本地存储与演示数据（`storage/` + `docs/`）

## 项目定位

- 从：AI 绘画/视频生成工具
- 到：儿童创意教育生态平台（差异化：教育闭环、亲子协同、成长档案、原创保护、产业对接）

## 核心创新点（答辩/展示重点）

- 教育闭环：不只是生成结果，更强调启发式引导与过程培养
- 亲子协同：家长参与共创（如配音/互动共创），强化家庭陪伴价值
- 互动叙事：多分支剧情选择，孩子决定故事走向
- 成长档案：沉淀创作轨迹与能力维度评估（时间轴/雷达等）
- 原创保护与产业对接：存证/版权教育、IP 孵化通路（规划项）

## 核心功能清单（从“能演示”出发）

- **创作工作台**：上传画作，触发 AI 处理流水线
- **AI 图像优化**：将儿童线稿/涂鸦进行风格化与细节补全
- **AI 动画生成**：基于优化图生成短视频（或接入模拟模式）
- **AI 故事生成 + 互动分支**：可续写、多选项分支，形成“故事树”
- **作品详情页**：展示原图/优化图/动画/互动故事，并支持导出
- **成长档案**：时间轴 + 能力雷达（色彩/构图/叙事/细节/创意）
- **商业化演示模块**：出版投稿历史/合作方展示（用于互联网+路演）

## 技术架构概览

- 前端：`frontend/`（React 18 + Vite）
- 后端：`backend/`（Flask REST API）
- 本地存储：`storage/`（数据、图片、导出、临时文件等）

## 端口与访问入口

- 前端开发服务器：`http://localhost:5173`
- 后端 API：
  - 完整版 `backend/app.py` 默认 `http://localhost:5000`
  - 简化版 `backend/app_simple.py` 默认 `http://localhost:5001`（一键启动使用）
- 健康检查：`GET /api/health`

## 目录速览

- `frontend/`：前端应用
- `backend/`：后端服务与 API
- `docs/`：项目文档
- `storage/`：运行数据与产物（图片/导出/临时文件等）
- `一键启动.bat`：本地快速启动脚本

## 端到端数据流（评委最关心的“怎么跑起来”）

1. 前端工作台上传图片（`frontend/src/pages/WorkspacePage.jsx`）
2. 调用后端上传接口（`POST /api/artworks/upload`）
3. 后端保存原图 + 写入 `storage/data/artworks.json`
4. 创建创作记录（`POST /api/creations`），写入 `storage/data/creations.json`
5. 触发 AI 流水线（增强 → 动画 → 故事）（对应多个 API 或完整工作流接口）
6. 作品完成后，进入详情页（`/detail/:id`）展示与导出

## 快速开始（本地）

### 方式 A：一键启动（推荐）

直接运行仓库根目录的：`一键启动.bat`

它会：

- 检测 Node.js
- 启动后端简化版（`backend/app_simple.py`，端口 `5001`）
- 安装/启动前端（Vite dev server，浏览器打开 `5173`）

### 方式 B：手动启动

1. 后端

- 进入 `backend/`
- 安装依赖：`pip install -r requirements.txt`
- 配置：复制 `backend/.env.example` 为 `backend/.env`，按需填写
- 启动：`python app.py`

2. 前端

- 进入 `frontend/`
- 安装依赖：`npm install`
- 启动开发：`npm run dev`

## AI 能力与环境变量说明

- 系统支持“自动切换模式”：
  - 配置了相关 API Key：走真实大模型/视频生成
  - 未配置：可使用模拟模式（适合比赛/离线演示）

豆包相关配置与接入说明见：`docs/02_技术文档/DOUBAO_SETUP.md`

## 互联网+答辩建议（演示路径）

建议用“3分钟可闭环”的演示路线：

1. 画廊页（`/`）展示作品宇宙与合作方背书
2. 进入工作台（`/workspace`）上传一张儿童画（或用演示图片）
3. 展示 AI 工作流进度（优化图 → 动画 → 故事）
4. 自动跳转详情页（`/detail/:id`）
5. 展示：互动分支选择、导出、投稿/存证/配音等“商业闭环模块”
6. 打开成长档案页（`/progress/:userId`）强调“教育闭环与长期价值”

互联网+材料入口：`docs/04_商业计划/`

## 互联网+使用清单（按场景：看什么文件/讲什么点）

下面是“互联网+比赛”最常用的内容清单，我按答辩节奏把 **要讲的点** 和 **仓库里对应的证据（页面/接口/文档/文件）** 直接对齐。

### 场景 A：产品是什么（1 分钟讲清楚）【必看】

- **要讲什么**
  - 我们不是“生成工具”，而是儿童创意教育平台（创作引导 + 互动叙事 + 成长档案）
  - 面向用户：3-12 岁儿童 + 家长 +（扩展）学校/教师
- **看哪些内容**
  - 本文档前半部分：项目一句话、定位、核心功能清单
  - 前端入口与路由：`frontend/src/router.jsx`
  - 路演稿：`docs/04_商业计划/PITCH_SCRIPT.md`

### 场景 B：核心创新点怎么证明（不是 PPT）【必看】

- **上台话术（综合赛道版本）**
  - 我们的创新不在“生成一次结果”，而在“把创意变成可持续成长、可被出版对接的资产”。
  - 第一，**创作引导**：AI 不代替孩子画，而是用开放式问题引导孩子补全想象，形成“过程教育”。
  - 第二，**互动叙事**：故事不是一条线，而是孩子每次选择形成一棵“故事树”，训练叙事能力与决策能力。
  - 第三，**成长档案**：每次创作沉淀为时间轴与五维能力雷达，让家长/学校能看到长期变化，而不是一次性娱乐。

- **证据入口（对应实现）**
  - 教育闭环（过程引导）
    - 前端：`frontend/src/components/CreativeGuidance.jsx`
    - 后端：`backend/services/creative_guidance.py`
  - 互动叙事（多分支故事树）
    - 前端：`frontend/src/components/InteractiveStory.jsx`
    - 前端：`frontend/src/pages/DetailPage.jsx`（`handleStoryChoice`）
    - 后端：`backend/routes/artworks.py`（`POST /api/artworks/<id>/story`）
  - 成长档案（可量化成长）
    - 前端：`frontend/src/pages/ProgressPage.jsx`、`frontend/src/components/CreationTimeline.jsx`、`frontend/src/components/AbilityRadarChart.jsx`
    - 后端：`backend/services/progress_analyzer.py`

### 场景 C：技术壁垒/技术路线怎么讲【必看】

- **要讲什么**
  - 多模态流水线：图像优化 → 动画生成 → 文本故事生成
  - 产品化难点：状态机、数据落盘、离线可演示、接口稳定
- **看哪些内容**
  - AI 编排：`backend/services/ai_service.py`
  - 创作状态机：`backend/services/creation_service.py`
  - API 层：
    - `backend/routes/artworks.py`
    - `backend/routes/creations.py`
  - 前端串联流程：`frontend/src/pages/WorkspacePage.jsx`

### 场景 D：商业模式/产业对接（互联网+重点）【必看】

- **上台话术（综合赛道版本：商业闭环）**
  - 我们的商业闭环是：**创作（教育价值）→ 沉淀（成长档案）→ 分发（家庭/学校）→ 产业对接（出版/IP）→ 收益回流（激励创作）**。
  - **C 端**：亲子共创（配音/故事互动/作品导出）+ 增值服务（导出、定制、主题活动）。
  - **B 端**：学校/机构订阅（班级创作任务、作品墙、成长报告），解决“美育师资不足与评价难”。
  - **产业对接**：将优秀作品进入投稿通道，形成“出版/动画/IP 孵化”的外部变现路径。
  - 互联网+强调落地与数据，我们在前端已经准备了**可演示的投稿历史与出版成果场景**，可在答辩时现场点击展示完整链路。

- **证据入口（对应实现/材料）**
  - 出版投稿演示数据与话术：`docs/01_项目说明/SUBMISSION_DEMO_DATA.md`
  - 前端投稿/对接展示：`frontend/src/components/PublisherSubmission.jsx`
  - 合作方/成果展示：
    - `frontend/src/components/PartnerShowcase.jsx`
    - `frontend/src/components/PublishedWorksShowcase.jsx`
  - 商业计划书（正文材料）：`docs/04_商业计划/创业计划书_互联网+_童画奇境_路演型A_终稿.md`
  - 教师端（B 端入口，可选展示）：`frontend/src/pages/TeacherPage.jsx`

## 综合赛道（偏商业闭环）3 分钟讲稿模板 / 一页话术卡

你可以直接照着讲（可按现场删减），并且每句话后面都能在仓库里找到“证据入口”。

### 0:00-0:20 痛点（为什么要做）

- 儿童创意表达很强，但缺少“过程引导”和“长期记录”，容易变成一次性娱乐。
- 家长/学校最缺的是：能持续陪伴、能看见成长、还能对接成果与激励的产品。

### 0:20-1:20 方案（我们做的是什么）

- 我们做的是童画·奇境：一个儿童创意教育平台。
- 让孩子上传画作后，平台完成一条多模态创作链路：图像优化 → 动画生成 → 故事生成。
- 更关键的是：中间加入“创作引导”和“互动叙事”，最后沉淀为“成长档案”。

证据入口：

- 工作台：`frontend/src/pages/WorkspacePage.jsx`
- AI 编排：`backend/services/ai_service.py`

### 1:20-2:00 壁垒（为什么是你们能做）

- 我们的壁垒在“产品化闭环”而不只是模型调用：
  - 引导式教育交互（不是代画）
  - 故事树的互动叙事（不是单次生成）
  - 成长档案与能力雷达（可量化长期价值）

证据入口：

- 引导：`frontend/src/components/CreativeGuidance.jsx` + `backend/services/creative_guidance.py`
- 故事分支：`frontend/src/components/InteractiveStory.jsx` + `backend/routes/artworks.py`
- 成长档案：`frontend/src/pages/ProgressPage.jsx` + `backend/services/progress_analyzer.py`

### 2:00-2:30 商业模式（怎么挣钱，怎么闭环）

- C 端：亲子共创与增值服务（配音、导出、定制主题）。
- B 端：学校/机构订阅（任务、作品墙、成长报告）。
- 产业对接：出版投稿 + IP 孵化，让优秀作品有外部变现通路。

证据入口：

- 投稿演示数据：`docs/01_项目说明/SUBMISSION_DEMO_DATA.md`
- 投稿 UI：`frontend/src/components/PublisherSubmission.jsx`

### 2:30-2:50 落地与可运行（现场能不能跑）

- 我们支持一键启动、离线演示与数据落盘，保证比赛现场可稳定跑通。

证据入口：

- 一键启动：`一键启动.bat`
- 简化后端：`backend/app_simple.py`
- 迭代证明：`docs/01_项目说明/UPDATE_LOG.md`

### 2:50-3:00 风险与应对（加分项）

- 未成年人隐私：只存必要信息，支持离线演示。
- 原创与版权：提供存证/证书能力作为扩展。

证据入口：

- 协议/授权：`frontend/src/components/AgreementModal.jsx`
- 证书模块：`frontend/src/components/BlockchainCertificate.jsx`

### 场景 E：可运行性/可交付性（评委现场要看你能不能跑）【必看】

- **要讲什么**
  - 项目可一键启动，现场网络差也能演示
  - 数据落盘与导出能力，保证“做出来了”
- **看哪些内容**
  - 一键启动：`一键启动.bat`
  - 简化后端（离线/演示）：`backend/app_simple.py`
  - 自检脚本：`verify-setup.py`
  - 更新日志（证明迭代）：`docs/01_项目说明/UPDATE_LOG.md`

### 场景 F：风险与合规（可选加分，但建议准备）【选看】

- **要讲什么**
  - 版权与原创保护（存证/证书）
  - 未成年人内容安全与隐私（不收集敏感信息、可离线演示）
- **看哪些内容**
  - 区块链证书组件：`frontend/src/components/BlockchainCertificate.jsx`
  - 协议弹窗：`frontend/src/components/AgreementModal.jsx`
  - 本地数据存储能力（离线/缓存）：`frontend/src/utils/localDatabase.js`

### 场景 G：部署与上线（比赛后落地）【选看】

- **看哪些内容**
  - 部署方案：`docs/03_部署运维/DEPLOYMENT.md`
  - Vercel 部署：`docs/03_部署运维/VERCEL_部署指南.md`

## 文档导航

- 项目说明
  - 功能开发大纲：`docs/01_项目说明/DEVELOPMENT_PLAN.md`
  - 演示数据说明：`docs/01_项目说明/SUBMISSION_DEMO_DATA.md`
  - 更新日志：`docs/01_项目说明/UPDATE_LOG.md`

- 技术文档
  - 豆包接入：`docs/02_技术文档/DOUBAO_SETUP.md`

- 部署运维
  - 部署配置与方案：`docs/03_部署运维/DEPLOYMENT.md`
  - Vercel 部署：`docs/03_部署运维/VERCEL_部署指南.md`

## 文件与目录详解（按仓库结构逐一说明）

以下内容用于：

- 互联网+答辩时解释“我们做了什么、怎么实现、哪些文件对应哪些能力”
- 团队协作与交接（别人拿到仓库 10 分钟能定位关键入口）

### 1) 根目录（项目入口与运行工具）

- **`一键启动.bat`**：【必看】零基础启动脚本。启动后端简化版（`5001`）+ 前端开发服务器，并自动打开浏览器
- **`verify-setup.py`**：【必看】初始化自检脚本。检查前后端关键文件、存储目录、配置是否齐全
- **`.gitignore`**：【选看】Git 忽略规则
- **`create_env.py`**：【选看】环境创建辅助脚本（用于自动化搭建 Python 环境/依赖时使用）
- **`vercel.json` / `vercel.json.new` / `.vercelignore`**：【选看】Vercel 部署相关配置

### 2) `backend/`（后端 API 与 AI 工作流）

#### 2.1 后端入口文件

- **`backend/app.py`**：【必看】后端主入口（Flask）。
  - 注册蓝图：`users_bp` / `artworks_bp` / `creations_bp`
  - 提供 `GET /api/health`
  - 运行端口：`5000`
- **`backend/app_simple.py`**：【必看】简化版后端（比赛/离线演示友好）。
  - 自带 JSON 存储读写逻辑、静态 `storage/` 访问（`/storage/<path>`）
  - 一键启动默认使用它，端口 `5001`

#### 2.2 配置与依赖

- **`backend/requirements.txt`**：【选看】Python 依赖
- **`backend/config.py`**：【选看】集中式配置（LLM provider、URL、Key、默认参数等）
- **`backend/.env.example` / `backend/.env`**：【选看】环境变量示例/本地配置

#### 2.3 路由层（Controller / API 层） `backend/routes/`

- **`backend/routes/__init__.py`**：【选看】导出并聚合蓝图
- **`backend/routes/users.py`**：【必看】用户相关 API
  - `POST /api/users` 创建用户
  - `GET /api/users/<user_id>` 获取用户
  - `GET /api/users/<user_id>/creations` 获取用户作品列表
- **`backend/routes/artworks.py`**：【必看】图片作品相关 API
  - `POST /api/artworks/upload` 上传原图
  - `POST /api/artworks/<id>/enhance` 图像优化
  - `POST /api/artworks/<id>/animate` 动画生成
  - `POST /api/artworks/<id>/story` 故事生成/分支续写
- **`backend/routes/creations.py`**：【必看】创作记录管理 API
  - `GET /api/creations` 列表（分页）
  - `GET /api/creations/<id>` 详情
  - `PUT /api/creations/<id>` 更新
  - `POST /api/creations/<id>/process` 完整工作流
  - `POST /api/creations/<id>/export` 导出

#### 2.4 服务层（业务编排/可测单元） `backend/services/`

- **`ai_service.py`**：【必看】AI 工作流编排核心。
  - 延迟加载模型（ControlNet / SVD / LLM）
  - 提供 `enhance_image` / `generate_animation` / `generate_story` / `process_full_workflow`
- **`artwork_service.py`**：【必看】上传图片验证与存储。
  - 校验格式/大小/有效图片
  - 自动转色彩模式、必要时压缩/缩放
  - 写入 `storage/data/artworks.json`
- **`creation_service.py`**：【必看】创作记录生命周期。
  - 状态机：`uploaded/enhancing/enhanced/animating/animated/story_gen/completed/failed`
  - 写入 `storage/data/creations.json`
- **`user_service.py`**：【选看】用户创建与作品关联（`storage/data/users.json`）
- **`creative_guidance.py`**：【必看】AI 创作引导（启发式问题/建议），用于“教育闭环”的过程引导
- **`progress_analyzer.py`**：【必看】成长档案分析（时间轴 + 五维能力雷达），用于“可量化成长”展示
- **`artwork_service.py` / `creation_service.py`**：两者组合构成“数据闭环的最小后端”

#### 2.5 工具与存储适配

- **`backend/utils/storage.py`**：【选看】JSON 文件读写与文件系统操作封装（后端统一存储层）
- **`backend/storage/`**：【选看】后端侧的存储资源目录（与根目录 `storage/` 配合使用）

### 3) `frontend/`（用户体验与路演展示）

#### 3.1 前端工程配置

- **`frontend/package.json`**：依赖与脚本（`dev/build/preview`）
- **`frontend/vite.config.js`**：Vite 配置（通常包含代理与构建配置）
- **`frontend/.env.example` / `.env`**：前端环境变量示例/本地配置
- **`frontend/index.html`**：HTML 入口

#### 3.2 入口与路由 `frontend/src/`

- **`src/main.jsx`**：React 挂载入口
- **`src/App.jsx`**：应用根组件（注入 Context + Router）
- **`src/router.jsx`**：路由表
  - `/`：画廊（`GalleryPage`）
  - `/workspace`：工作台（`WorkspacePage`）
  - `/detail/:id`：作品详情（`DetailPage`）
  - `/progress/:userId`：成长档案（`ProgressPage`）
  - `/teacher`：教师端（`TeacherPage`）
  - `/faq`：FAQ（`FAQPage`）

#### 3.3 页面层 `frontend/src/pages/`

- **`GalleryPage.jsx`**：【必看】项目“门面”页面（3D 漂浮画廊 + 合作方展示），是路演第一屏
- **`WorkspacePage.jsx`**：【必看】创作工作台（上传 → AI 处理 → 自动跳详情页），路演核心流程
- **`DetailPage.jsx`**：【必看】作品详情聚合页（原图/优化图/动画/互动故事/导出/存证/投稿等模块）
- **`ProgressPage.jsx`**：【必看】成长档案页（时间轴 + 雷达图 + 洞察）
- **`TeacherPage.jsx`**：【选看】教师/班级端展示页（B 端商业模式入口）
- **`FAQPage.jsx`**：【选看】评委可能追问的集中解释页

#### 3.4 组件层 `frontend/src/components/`（按答辩价值分组）

- **创作与 AI 体验**
  - `UploadZone.jsx`：拖拽/选择文件上传
  - `MagicEngine.jsx`：AI 工作流视觉引擎/步骤呈现
  - `CreativeGuidance.jsx`：创作引导助手（提问式而非代画）
  - `InteractiveStory.jsx`：互动分支故事 UI

- **教育闭环与成长档案**
  - `CreationTimeline.jsx`：成长时间轴
  - `AbilityRadarChart.jsx`：能力雷达图

- **商业化与互联网+展示**
  - `PublisherSubmission.jsx`：出版投稿演示（可对接 `docs/01_项目说明/SUBMISSION_DEMO_DATA.md`）
  - `PartnerShowcase.jsx` / `PartnerShowcase` 相关组件：合作方背书展示
  - `PublishedWorksShowcase.jsx`：出版成果展示
  - `BusinessModelHero.jsx`：商业模式 Banner/引导

- **可信与合规（加分项）**
  - `BlockchainCertificate.jsx`：区块链存证证书展示与下载
  - `AgreementModal.jsx`：协议/授权弹窗

- **亲子共创（场景价值）**
  - `ParentVoiceOver.jsx`：家长配音共创模块

- **基础设施组件**
  - `NavBar.jsx`：全局导航
  - `PageTransition.jsx`：页面动效与 Loading
  - `ThreeGallery.jsx`：3D 展厅/画廊渲染
  - `LoginModal.jsx`：登录弹窗

#### 3.5 前端调用后端与本地数据

- **`frontend/src/services/api.js`**：【必看】前端 API SDK（axios）
  - `userAPI/artworkAPI/creationAPI/aiAPI` 等
  - 统一 baseURL（默认走 `/api`，便于代理与避免跨域）
- **`frontend/src/utils/mockData.js`**：【选看】路演用模拟文案/数据（保证无 Key 也能跑演示）
- **`frontend/src/utils/localDatabase.js`**：【选看】IndexedDB 本地数据库（离线/缓存能力）
- **`frontend/src/stores/*`**：【选看】状态管理（Zustand）

### 4) `docs/`（互联网+材料与技术文档）

- **`docs/00_项目介绍/README.md`**：本文件，项目总览入口
- **`docs/01_项目说明/DEVELOPMENT_PLAN.md`**：功能开发大纲（创新点与阶段规划）
- **`docs/01_项目说明/SUBMISSION_DEMO_DATA.md`**：投稿演示数据（产业对接/商业闭环话术素材）
- **`docs/01_项目说明/UPDATE_LOG.md`**：更新日志（证明“不是 PPT 项目”，有真实迭代）
- **`docs/02_技术文档/DOUBAO_SETUP.md`**：豆包视频生成接入说明
- **`docs/03_部署运维/DEPLOYMENT.md`**：部署方案与环境变量
- **`docs/04_商业计划/*`**：互联网+路演稿/创业计划书/零基础启动攻略等

### 5) `scripts/`（仓库维护脚本）

- **`scripts/organize_docs.py` / `organize_docs2.py`**：文档整理脚本（用于归档与结构化）
- **`scripts/update_ai_service.py` / `update_llm_processor.py`**：更新 AI 服务/LLM 处理器的辅助脚本

## 常见问题（FAQ 简版）

- **Q：没有大模型 Key 能跑吗？**
  - A：可以。前后端支持模拟模式与演示数据，保证比赛现场可离线演示。
- **Q：你们的技术壁垒在哪？**
  - A：不止“生成”，而是“教育闭环”产品化：创作引导 + 互动叙事 + 成长档案 + 亲子共创 +（可选）存证与产业对接。
- **Q：数据存在哪？**
  - A：后端默认 JSON 文件落盘在 `storage/data/*.json`，图片/导出在 `storage/` 子目录；便于演示与迁移。
