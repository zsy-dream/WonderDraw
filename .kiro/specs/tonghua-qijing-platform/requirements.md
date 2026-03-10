# 需求文档 - 童画·奇境平台

## 简介

童画·奇境 (TongHua·QiJing) 是一个基于多模态大模型的儿童创意绘画即时动画化平台。该平台允许儿童上传简笔画或涂鸦，通过 AI 技术将其转换为精美插画、动画视频，并生成配套的童话故事。平台提供沉浸式的 3D 展示空间和富有创意的交互体验。

## 术语表

- **Platform**: 童画·奇境平台系统
- **User**: 使用平台的儿童或家长
- **Artwork**: 用户上传的原始简笔画或涂鸦
- **Enhanced_Image**: 经过 ControlNet 优化后的精美插画
- **Animation**: 由静态图生成的 2-4 秒动画视频
- **Story**: AI 生成的配套童话故事文本
- **Gallery**: 作品展示画廊（奇境入口）
- **Workspace**: 创作工作台（神笔工作台）
- **Creation**: 完整的作品，包含原图、优化图、动画和故事
- **ControlNet**: 基于 Stable Diffusion 的图像优化模型
- **SVD**: Stable Video Diffusion，用于生成动画的模型（已替换为豆包图生视频 API）
- **Doubao**: 豆包，字节跳动的 AI 服务，提供图生视频和 LLM 能力
- **LLM**: 大语言模型，用于生成故事文本（使用豆包 LLM API）

## 需求

### 需求 1: 用户身份管理

**用户故事:** 作为用户，我希望能够简单地登录平台，以便保存和查看我的创作历史。

#### 验收标准

1. WHEN 用户首次访问平台 THEN THE Platform SHALL 提示用户输入昵称进行登录
2. WHEN 用户输入昵称并提交 THEN THE Platform SHALL 创建用户会话并存储用户标识
3. WHEN 用户再次访问平台 THEN THE Platform SHALL 识别用户身份并加载其历史作品
4. THE Platform SHALL 将用户信息存储在本地文件系统中

### 需求 2: 作品上传

**用户故事:** 作为用户，我希望能够上传我的简笔画或涂鸦，以便开始创作流程。

#### 验收标准

1. WHEN 用户访问神笔工作台 THEN THE Platform SHALL 显示上传区域
2. WHEN 用户选择图片文件 THEN THE Platform SHALL 验证文件格式为常见图片格式（JPG、PNG、WEBP）
3. WHEN 用户上传有效图片 THEN THE Platform SHALL 显示上传成功反馈并展示预览
4. IF 用户上传无效文件格式 THEN THE Platform SHALL 显示错误提示并拒绝上传
5. WHEN 图片上传成功 THEN THE Platform SHALL 将原始图片保存到文件系统

### 需求 3: AI 图像优化

**用户故事:** 作为用户，我希望 AI 能够将我的简笔画优化为精美插画，以便获得更好的视觉效果。

#### 验收标准

1. WHEN 用户上传作品后点击"开始魔法" THEN THE Platform SHALL 调用 ControlNet 模型处理图像
2. WHEN ControlNet 处理图像 THEN THE Platform SHALL 保持原始构图和主要元素
3. WHEN 图像优化完成 THEN THE Platform SHALL 生成高质量的插画图像
4. WHEN 优化过程进行中 THEN THE Platform SHALL 显示加载动画和进度提示
5. IF ControlNet 处理失败 THEN THE Platform SHALL 显示错误信息并允许用户重试
6. WHEN 优化完成 THEN THE Platform SHALL 将优化后的图像保存到文件系统

### 需求 4: 动画生成

**用户故事:** 作为用户，我希望将静态插画转换为动画视频，以便让作品更加生动有趣。

#### 验收标准

1. WHEN 图像优化完成 THEN THE Platform SHALL 自动启动动画生成流程
2. WHEN 生成动画 THEN THE Platform SHALL 使用豆包图生视频 API
3. WHEN 动画生成完成 THEN THE Platform SHALL 生成 2 到 4 秒的视频文件
4. WHEN 动画生成过程进行中 THEN THE Platform SHALL 显示加载动画和进度提示
5. IF 动画生成失败 THEN THE Platform SHALL 显示错误信息并允许用户重试
6. WHEN 动画生成完成 THEN THE Platform SHALL 将视频文件保存到文件系统

### 需求 5: 故事生成

**用户故事:** 作为用户，我希望 AI 能够为我的作品生成配套的童话故事，以便增加作品的趣味性和想象力。

#### 验收标准

1. WHEN 动画生成完成 THEN THE Platform SHALL 自动启动故事生成流程
2. WHEN 生成故事 THEN THE Platform SHALL 调用豆包 LLM API（或兼容的 DeepSeek/Qwen API）
3. WHEN 调用 LLM THEN THE Platform SHALL 提供图像描述作为上下文
4. WHEN 故事生成完成 THEN THE Platform SHALL 返回适合儿童的童话故事文本
5. WHEN 故事生成过程进行中 THEN THE Platform SHALL 显示加载动画和提示
6. IF 故事生成失败 THEN THE Platform SHALL 显示错误信息并允许用户重试
7. WHEN 故事生成完成 THEN THE Platform SHALL 将故事文本保存到文件系统

### 需求 6: 作品展示画廊

**用户故事:** 作为用户，我希望在 3D 漂浮展厅中浏览所有作品，以便获得沉浸式的视觉体验。

#### 验收标准

1. WHEN 用户访问奇境入口页面 THEN THE Platform SHALL 显示 3D 漂浮展厅
2. WHEN 展示作品 THEN THE Platform SHALL 使用 Three.js 渲染 3D 场景
3. WHEN 渲染画廊 THEN THE Platform SHALL 以瀑布流布局展示作品缩略图
4. WHEN 用户滚动页面 THEN THE Platform SHALL 实现平滑的 3D 视差效果
5. WHEN 用户点击作品缩略图 THEN THE Platform SHALL 显示作品详情（优化图、动画、故事）
6. THE Platform SHALL 按创建时间倒序排列作品

### 需求 7: 作品详情展示

**用户故事:** 作为用户，我希望查看作品的完整内容，以便欣赏优化后的图像、动画和故事。

#### 验收标准

1. WHEN 用户打开作品详情 THEN THE Platform SHALL 显示原始图片、优化图片、动画视频和故事文本
2. WHEN 显示动画 THEN THE Platform SHALL 自动循环播放视频
3. WHEN 显示故事 THEN THE Platform SHALL 以易读的格式展示文本内容
4. WHEN 用户查看详情 THEN THE Platform SHALL 提供返回画廊的导航选项
5. THE Platform SHALL 应用 Claymorphism 风格和多巴胺配色方案

### 需求 8: 作品分享

**用户故事:** 作为用户，我希望能够分享我的作品，以便与朋友和家人展示我的创意。

#### 验收标准

1. WHEN 用户在作品详情页点击分享 THEN THE Platform SHALL 生成朋友圈分享海报
2. WHEN 生成海报 THEN THE Platform SHALL 包含优化后的图像和部分故事文本
3. WHEN 海报生成完成 THEN THE Platform SHALL 提供下载选项
4. THE Platform SHALL 将海报设计为适合社交媒体分享的尺寸

### 需求 9: 作品导出

**用户故事:** 作为用户，我希望能够导出我的作品，以便保存到本地或制作电子绘本。

#### 验收标准

1. WHEN 用户在作品详情页点击导出 THEN THE Platform SHALL 提供导出选项
2. WHERE 用户选择导出图片 THEN THE Platform SHALL 下载优化后的图像文件
3. WHERE 用户选择导出视频 THEN THE Platform SHALL 下载动画视频文件
4. WHERE 用户选择导出电子绘本 THEN THE Platform SHALL 生成包含图像和故事的 PDF 文件
5. WHEN 导出完成 THEN THE Platform SHALL 显示成功提示

### 需求 10: 视觉设计和交互效果

**用户故事:** 作为用户，我希望平台具有吸引人的视觉设计和流畅的交互效果，以便获得愉悦的使用体验。

#### 验收标准

1. THE Platform SHALL 使用 #FFF5E6 作为背景色
2. THE Platform SHALL 使用 #FF6B6B 作为主色调
3. THE Platform SHALL 使用 #FFD93D 作为辅助色
4. THE Platform SHALL 应用 Claymorphism（黏土拟态）设计风格
5. WHEN 用户与界面交互 THEN THE Platform SHALL 显示粒子特效
6. WHEN 用户点击按钮 THEN THE Platform SHALL 播放弹性动画效果
7. WHEN 用户执行操作 THEN THE Platform SHALL 提供音效反馈
8. THE Platform SHALL 使用圆润、Q弹、高饱和度的视觉元素

### 需求 11: 创作流程管理

**用户故事:** 作为用户，我希望清楚地了解创作流程的每个步骤，以便知道当前进度和下一步操作。

#### 验收标准

1. WHEN 用户开始创作 THEN THE Platform SHALL 显示流程步骤指示器
2. THE Platform SHALL 按顺序执行：上传 -> AI优化 -> AI动画 -> AI故事
3. WHEN 每个步骤完成 THEN THE Platform SHALL 更新步骤指示器状态
4. WHEN 某个步骤失败 THEN THE Platform SHALL 标记该步骤并允许重试
5. WHEN 所有步骤完成 THEN THE Platform SHALL 显示完成提示并跳转到作品详情

### 需求 12: 数据持久化

**用户故事:** 作为系统管理员，我希望所有用户数据和作品能够可靠地存储，以便用户可以随时访问其历史作品。

#### 验收标准

1. THE Platform SHALL 将用户信息存储为 JSON 文件
2. THE Platform SHALL 将作品元数据存储为 JSON 文件
3. THE Platform SHALL 将图像文件存储在文件系统的指定目录
4. THE Platform SHALL 将视频文件存储在文件系统的指定目录
5. WHEN 保存数据 THEN THE Platform SHALL 确保文件写入成功
6. WHEN 读取数据 THEN THE Platform SHALL 处理文件不存在或损坏的情况

### 需求 13: 错误处理和用户反馈

**用户故事:** 作为用户，我希望在出现错误时能够收到清晰的提示，以便了解问题并采取相应措施。

#### 验收标准

1. IF 任何 AI 模型调用失败 THEN THE Platform SHALL 显示友好的错误消息
2. IF 文件上传失败 THEN THE Platform SHALL 显示具体的失败原因
3. IF 网络请求超时 THEN THE Platform SHALL 提示用户检查网络连接
4. WHEN 显示错误消息 THEN THE Platform SHALL 提供重试或返回的操作选项
5. THE Platform SHALL 记录错误日志以便调试

### 需求 14: 性能和响应性

**用户故事:** 作为用户，我希望平台响应迅速且流畅，以便获得良好的使用体验。

#### 验收标准

1. WHEN 用户上传图片 THEN THE Platform SHALL 在 2 秒内显示预览
2. WHEN 渲染 3D 画廊 THEN THE Platform SHALL 保持至少 30 FPS 的帧率
3. WHEN 加载作品列表 THEN THE Platform SHALL 实现懒加载以优化性能
4. WHEN 执行动画效果 THEN THE Platform SHALL 使用硬件加速
5. THE Platform SHALL 压缩图像和视频以减少存储空间和加载时间

### 需求 15: 前端架构

**用户故事:** 作为开发者，我希望前端架构清晰且可维护，以便后续功能扩展和维护。

#### 验收标准

1. THE Platform SHALL 使用 React 作为前端框架
2. THE Platform SHALL 使用 Three.js 实现 3D 效果
3. THE Platform SHALL 使用 Framer Motion 实现动画效果
4. THE Platform SHALL 组织代码为可复用的组件
5. THE Platform SHALL 使用状态管理库管理应用状态
6. THE Platform SHALL 分离业务逻辑和 UI 组件

### 需求 16: 后端架构

**用户故事:** 作为开发者，我希望后端架构简洁且高效，以便快速处理 AI 模型调用和文件操作。

#### 验收标准

1. THE Platform SHALL 使用 Python Flask 作为后端框架
2. THE Platform SHALL 提供 RESTful API 端点用于前端调用
3. THE Platform SHALL 集成 ControlNet 模型用于图像优化
4. THE Platform SHALL 集成豆包图生视频 API 用于动画生成
5. THE Platform SHALL 集成豆包 LLM API（或兼容的 DeepSeek/Qwen API）用于故事生成
6. THE Platform SHALL 实现文件上传和存储功能
7. THE Platform SHALL 处理并发请求

### 需求 17: API 端点设计

**用户故事:** 作为开发者，我希望 API 端点设计清晰且符合 RESTful 规范，以便前后端协作顺畅。

#### 验收标准

1. THE Platform SHALL 提供 POST /api/users 端点用于用户登录
2. THE Platform SHALL 提供 GET /api/users/{userId}/creations 端点用于获取用户作品列表
3. THE Platform SHALL 提供 POST /api/artworks/upload 端点用于上传原始图片
4. THE Platform SHALL 提供 POST /api/artworks/{artworkId}/enhance 端点用于图像优化
5. THE Platform SHALL 提供 POST /api/artworks/{artworkId}/animate 端点用于动画生成
6. THE Platform SHALL 提供 POST /api/artworks/{artworkId}/story 端点用于故事生成
7. THE Platform SHALL 提供 GET /api/creations 端点用于获取所有作品
8. THE Platform SHALL 提供 GET /api/creations/{creationId} 端点用于获取作品详情
9. THE Platform SHALL 提供 POST /api/creations/{creationId}/export 端点用于导出作品

### 需求 18: 图像处理和优化

**用户故事:** 作为系统，我希望能够高效地处理和优化图像，以便提供高质量的输出。

#### 验收标准

1. WHEN 接收上传图片 THEN THE Platform SHALL 验证图片尺寸和大小
2. IF 图片过大 THEN THE Platform SHALL 自动调整尺寸
3. WHEN 调用 ControlNet THEN THE Platform SHALL 使用适合儿童插画的提示词
4. WHEN 生成优化图像 THEN THE Platform SHALL 保持原始图像的宽高比
5. THE Platform SHALL 将优化后的图像保存为高质量格式

### 需求 19: 视频处理

**用户故事:** 作为系统，我希望能够生成流畅的动画视频，以便为用户提供生动的视觉体验。

#### 验收标准

1. WHEN 调用豆包图生视频 API THEN THE Platform SHALL 使用优化后的图像作为输入
2. WHEN 生成视频 THEN THE Platform SHALL 生成 2 到 4 秒的 MP4 格式视频
3. WHEN 生成视频 THEN THE Platform SHALL 设置适当的宽高比（16:9）
4. THE Platform SHALL 确保视频循环播放时过渡自然
5. THE Platform SHALL 压缩视频以优化文件大小

### 需求 20: 故事生成质量

**用户故事:** 作为用户，我希望生成的故事内容适合儿童且富有创意，以便激发孩子的想象力。

#### 验收标准

1. WHEN 调用 LLM 生成故事 THEN THE Platform SHALL 提供明确的提示词指导
2. WHEN 生成故事 THEN THE Platform SHALL 确保内容适合 3-12 岁儿童
3. WHEN 生成故事 THEN THE Platform SHALL 生成 100-300 字的故事文本
4. THE Platform SHALL 确保故事内容积极向上且富有教育意义
5. THE Platform SHALL 避免生成包含暴力、恐怖或不适当内容的故事
