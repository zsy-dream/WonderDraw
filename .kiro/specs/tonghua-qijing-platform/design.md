# 设计文档 - 童画·奇境平台

## 概述

童画·奇境平台是一个多层架构的 Web 应用，采用前后端分离设计。前端使用 React 构建交互界面，Three.js 实现 3D 展示效果，Framer Motion 提供流畅动画。后端使用 Python Flask 提供 RESTful API，集成多个 AI 模型（ControlNet、Stable Video Diffusion、LLM）处理图像优化、动画生成和故事创作。数据存储采用文件系统 + JSON 的轻量级方案。

## 架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (React)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 奇境入口页面  │  │ 神笔工作台    │  │ 作品详情页面  │      │
│  │ (Gallery)    │  │ (Workspace)  │  │ (Detail)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                           │                                 │
│  ┌────────────────────────▼──────────────────────────────┐  │
│  │           UI 组件层 (Components)                      │  │
│  │  - 3D Gallery (Three.js)                             │  │
│  │  - Upload Zone                                       │  │
│  │  - Magic Engine Display                              │  │
│  │  - Animation Player                                  │  │
│  │  - Story Display                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌────────────────────────▼──────────────────────────────┐  │
│  │           状态管理层 (State Management)               │  │
│  │  - User State                                        │  │
│  │  - Creation State                                    │  │
│  │  - UI State                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌────────────────────────▼──────────────────────────────┐  │
│  │           API 客户端层 (API Client)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────▼───────────────────────────────────┐
│                    后端层 (Flask API)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │              路由层 (Routes)                         │   │
│  │  /api/users, /api/artworks, /api/creations          │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │            服务层 (Services)                         │   │
│  │  - UserService                                       │   │
│  │  - ArtworkService                                    │   │
│  │  - CreationService                                   │   │
│  │  - AIService                                         │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │            AI 模型层 (AI Models)                     │   │
│  │  - ControlNetProcessor                               │   │
│  │  - SVDProcessor                                      │   │
│  │  - LLMProcessor                                      │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │            数据访问层 (Data Access)                  │   │
│  │  - FileStorage                                       │   │
│  │  - JSONStorage                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    存储层 (Storage)                          │
│  - 文件系统 (images/, videos/, exports/)                    │
│  - JSON 文件 (users.json, creations.json)                   │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

**前端:**
- React 18+ (UI 框架)
- Three.js (3D 渲染)
- React Three Fiber (React + Three.js 集成)
- Framer Motion (动画库)
- Axios (HTTP 客户端)
- React Router (路由管理)
- Zustand 或 Redux (状态管理)

**后端:**
- Python 3.9+
- Flask 2.x (Web 框架)
- Flask-CORS (跨域支持)
- Pillow (图像处理)
- diffusers (Hugging Face 模型库)
- torch (PyTorch，AI 模型运行时)
- requests (HTTP 客户端，调用 LLM API)

**AI 模型:**
- ControlNet (Stable Diffusion 1.5 + ControlNet Scribble)
- 豆包 (Doubao) 图生视频 API - 字节跳动
- 豆包 (Doubao) LLM API - 用于故事生成

**存储:**
- 文件系统 (本地存储)
- JSON 文件 (元数据存储)

## 组件和接口

### 前端组件

#### 1. GalleryPage (奇境入口)

**职责:** 展示所有作品的 3D 画廊

**接口:**
```typescript
interface GalleryPageProps {}

interface Creation {
  id: string;
  userId: string;
  originalImage: string;
  enhancedImage: string;
  animation: string;
  story: string;
  createdAt: string;
}
```

**主要方法:**
- `fetchCreations()`: 从 API 获取所有作品
- `renderGallery()`: 使用 Three.js 渲染 3D 场景
- `handleCreationClick(creationId)`: 处理作品点击事件

#### 2. WorkspacePage (神笔工作台)

**职责:** 提供创作流程界面

**接口:**
```typescript
interface WorkspacePageProps {
  userId: string;
}

interface CreationState {
  step: 'upload' | 'enhancing' | 'animating' | 'story' | 'complete';
  originalImage: File | null;
  enhancedImage: string | null;
  animation: string | null;
  story: string | null;
  error: string | null;
}
```

**主要方法:**
- `handleUpload(file)`: 处理文件上传
- `startMagic()`: 启动 AI 处理流程
- `enhanceImage()`: 调用图像优化 API
- `generateAnimation()`: 调用动画生成 API
- `generateStory()`: 调用故事生成 API

#### 3. DetailPage (作品详情)

**职责:** 展示单个作品的完整内容

**接口:**
```typescript
interface DetailPageProps {
  creationId: string;
}

interface DetailState {
  creation: Creation | null;
  loading: boolean;
  error: string | null;
}
```

**主要方法:**
- `fetchCreationDetail(creationId)`: 获取作品详情
- `handleShare()`: 生成分享海报
- `handleExport(type)`: 导出作品

#### 4. ThreeGallery (3D 画廊组件)

**职责:** 使用 Three.js 渲染 3D 展示空间

**接口:**
```typescript
interface ThreeGalleryProps {
  creations: Creation[];
  onCreationClick: (creationId: string) => void;
}
```

**主要方法:**
- `initScene()`: 初始化 Three.js 场景
- `createFloatingCards()`: 创建漂浮的作品卡片
- `animateScene()`: 动画循环
- `handleInteraction()`: 处理用户交互

#### 5. UploadZone (上传区域)

**职责:** 处理文件上传和预览

**接口:**
```typescript
interface UploadZoneProps {
  onUpload: (file: File) => void;
  accept: string;
}
```

**主要方法:**
- `handleFileSelect(event)`: 处理文件选择
- `validateFile(file)`: 验证文件格式和大小
- `showPreview(file)`: 显示图片预览

#### 6. MagicEngine (魔法引擎显示)

**职责:** 显示 AI 处理进度和状态

**接口:**
```typescript
interface MagicEngineProps {
  step: CreationState['step'];
  progress: number;
}
```

**主要方法:**
- `renderStepIndicator()`: 渲染步骤指示器
- `renderProgressBar()`: 渲染进度条
- `renderLoadingAnimation()`: 渲染加载动画

### 后端服务

#### 1. UserService

**职责:** 管理用户身份和会话

**接口:**
```python
class UserService:
    def create_user(nickname: str) -> dict
    def get_user(user_id: str) -> dict
    def get_user_creations(user_id: str) -> list
```

**数据模型:**
```python
User = {
    "id": str,
    "nickname": str,
    "created_at": str,
    "creations": list[str]  # creation IDs
}
```

#### 2. ArtworkService

**职责:** 处理原始作品上传和存储

**接口:**
```python
class ArtworkService:
    def upload_artwork(file: FileStorage, user_id: str) -> dict
    def get_artwork(artwork_id: str) -> dict
    def validate_image(file: FileStorage) -> bool
```

**数据模型:**
```python
Artwork = {
    "id": str,
    "user_id": str,
    "original_path": str,
    "uploaded_at": str
}
```

#### 3. CreationService

**职责:** 管理完整的创作流程和作品数据

**接口:**
```python
class CreationService:
    def create_creation(artwork_id: str, user_id: str) -> dict
    def update_creation(creation_id: str, updates: dict) -> dict
    def get_creation(creation_id: str) -> dict
    def get_all_creations() -> list
    def delete_creation(creation_id: str) -> bool
```

**数据模型:**
```python
Creation = {
    "id": str,
    "user_id": str,
    "artwork_id": str,
    "original_image": str,
    "enhanced_image": str | None,
    "animation": str | None,
    "story": str | None,
    "status": str,  # 'processing', 'completed', 'failed'
    "created_at": str,
    "updated_at": str
}
```

#### 4. AIService

**职责:** 协调所有 AI 模型调用

**接口:**
```python
class AIService:
    def enhance_image(image_path: str) -> str
    def generate_animation(image_path: str) -> str
    def generate_story(image_path: str) -> str
```

#### 5. ControlNetProcessor

**职责:** 使用 ControlNet 优化图像

**接口:**
```python
class ControlNetProcessor:
    def __init__(model_id: str, controlnet_id: str)
    def process(input_image_path: str, prompt: str, output_path: str) -> str
    def preprocess_image(image_path: str) -> Image
```

**配置:**
- Model: `runwayml/stable-diffusion-v1-5`
- ControlNet: `lllyasviel/control_v11p_sd15_scribble`
- Prompt Template: "children's book illustration, colorful, cute, whimsical, high quality"
- Negative Prompt: "ugly, blurry, low quality, dark, scary"

#### 6. DoubaoVideoProcessor

**职责:** 使用豆包图生视频 API 生成动画

**接口:**
```python
class DoubaoVideoProcessor:
    def __init__(api_key: str)
    def generate_video(image_path: str, prompt: str, duration: int, output_path: str) -> dict
    def _upload_image(image_path: str) -> dict
    def _submit_video_task(image_url: str, prompt: str, duration: int) -> dict
    def _poll_task_status(task_id: str, max_wait: int) -> str
    def _download_video(video_url: str, output_path: str) -> dict
```

**配置:**
- API: 豆包 (Doubao) 图生视频 API
- Base URL: `https://ark.cn-beijing.volces.com/api/v3`
- Duration: 2-4 seconds (默认 3 秒)
- Aspect Ratio: 16:9
- 需要环境变量: `DOUBAO_API_KEY`, `DOUBAO_ENDPOINT_ID`

#### 7. LLMProcessor

**职责:** 调用豆包 LLM API 生成故事

**接口:**
```python
class LLMProcessor:
    def __init__(api_key: str, api_url: str, provider: str)
    def generate_story(image_description: str, custom_prompt: str, retry_count: int) -> str
    def build_prompt(image_description: str, custom_template: str) -> str
    def _call_llm_api(prompt: str) -> str
    def _clean_story(story: str) -> str
    def _validate_story(story: str) -> None
    def _is_content_safe(story: str) -> bool
```

**配置:**
- API: 豆包 (Doubao) LLM API 或 DeepSeek/Qwen (兼容)
- Base URL: `https://ark.cn-beijing.volces.com/api/v3` (豆包)
- Max Tokens: 500
- Temperature: 0.8
- Story Length: 100-300 字
- Prompt Template: "基于这幅儿童画作，创作一个适合3-12岁儿童的温馨童话故事（100-300字）..."
- 需要环境变量: `DOUBAO_API_KEY` 或 `LLM_API_KEY`

#### 8. FileStorage

**职责:** 管理文件系统存储

**接口:**
```python
class FileStorage:
    def save_file(file: bytes, directory: str, filename: str) -> str
    def read_file(file_path: str) -> bytes
    def delete_file(file_path: str) -> bool
    def get_file_url(file_path: str) -> str
```

**目录结构:**
```
storage/
├── images/
│   ├── original/
│   └── enhanced/
├── videos/
├── exports/
│   ├── posters/
│   └── ebooks/
└── temp/
```

#### 9. JSONStorage

**职责:** 管理 JSON 数据存储

**接口:**
```python
class JSONStorage:
    def read(file_path: str) -> dict
    def write(file_path: str, data: dict) -> bool
    def append(file_path: str, item: dict) -> bool
    def update(file_path: str, item_id: str, updates: dict) -> bool
```

### API 端点

#### 用户相关

**POST /api/users**
- 描述: 创建新用户（登录）
- 请求体: `{ "nickname": string }`
- 响应: `{ "id": string, "nickname": string, "created_at": string }`

**GET /api/users/{userId}/creations**
- 描述: 获取用户的所有作品
- 响应: `{ "creations": Creation[] }`

#### 作品上传

**POST /api/artworks/upload**
- 描述: 上传原始图片
- 请求体: `multipart/form-data { "file": File, "user_id": string }`
- 响应: `{ "artwork_id": string, "original_path": string }`

#### AI 处理

**POST /api/artworks/{artworkId}/enhance**
- 描述: 优化图像
- 响应: `{ "enhanced_image": string, "status": string }`

**POST /api/artworks/{artworkId}/animate**
- 描述: 生成动画
- 请求体: `{ "enhanced_image": string }`
- 响应: `{ "animation": string, "status": string }`

**POST /api/artworks/{artworkId}/story**
- 描述: 生成故事
- 请求体: `{ "enhanced_image": string }`
- 响应: `{ "story": string, "status": string }`

#### 作品管理

**GET /api/creations**
- 描述: 获取所有作品
- 查询参数: `?limit=20&offset=0`
- 响应: `{ "creations": Creation[], "total": number }`

**GET /api/creations/{creationId}**
- 描述: 获取作品详情
- 响应: `Creation`

**POST /api/creations/{creationId}/export**
- 描述: 导出作品
- 请求体: `{ "type": "image" | "video" | "ebook" }`
- 响应: `{ "download_url": string }`

## 数据模型

### 用户数据模型

```typescript
interface User {
  id: string;              // UUID
  nickname: string;        // 用户昵称
  createdAt: string;       // ISO 8601 时间戳
  creations: string[];     // 作品 ID 列表
}
```

**存储位置:** `storage/data/users.json`

**示例:**
```json
{
  "users": [
    {
      "id": "user-123",
      "nickname": "小明",
      "createdAt": "2024-01-15T10:30:00Z",
      "creations": ["creation-456", "creation-789"]
    }
  ]
}
```

### 作品数据模型

```typescript
interface Creation {
  id: string;                    // UUID
  userId: string;                // 用户 ID
  artworkId: string;             // 原始作品 ID
  originalImage: string;         // 原始图片路径
  enhancedImage: string | null;  // 优化图片路径
  animation: string | null;      // 动画视频路径
  story: string | null;          // 故事文本
  status: CreationStatus;        // 状态
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}

type CreationStatus = 
  | 'uploaded'      // 已上传
  | 'enhancing'     // 优化中
  | 'enhanced'      // 已优化
  | 'animating'     // 动画生成中
  | 'animated'      // 动画已生成
  | 'story_gen'     // 故事生成中
  | 'completed'     // 完成
  | 'failed';       // 失败
```

**存储位置:** `storage/data/creations.json`

**示例:**
```json
{
  "creations": [
    {
      "id": "creation-456",
      "userId": "user-123",
      "artworkId": "artwork-789",
      "originalImage": "/storage/images/original/artwork-789.png",
      "enhancedImage": "/storage/images/enhanced/creation-456.png",
      "animation": "/storage/videos/creation-456.mp4",
      "story": "从前有一只小兔子...",
      "status": "completed",
      "createdAt": "2024-01-15T10:35:00Z",
      "updatedAt": "2024-01-15T10:40:00Z"
    }
  ]
}
```

### 配置数据模型

```typescript
interface AppConfig {
  ai: {
    controlnet: {
      modelId: string;
      controlnetId: string;
      prompt: string;
      negativePrompt: string;
    };
    svd: {
      modelId: string;
      fps: number;
      minDuration: number;
      maxDuration: number;
    };
    llm: {
      provider: 'deepseek' | 'qwen';
      apiKey: string;
      apiUrl: string;
      maxTokens: number;
      temperature: number;
    };
  };
  storage: {
    basePath: string;
    maxFileSize: number;
    allowedFormats: string[];
  };
  ui: {
    colors: {
      background: string;
      primary: string;
      secondary: string;
    };
    gallery: {
      itemsPerPage: number;
    };
  };
}
```

**存储位置:** `config/app.json`

## 正确性属性

*属性（Property）是系统在所有有效执行中都应保持为真的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性是人类可读规范和机器可验证正确性保证之间的桥梁。*

### 用户管理属性

**属性 1: 用户创建持久化**
*对于任意*昵称字符串，当创建用户后，从存储中读取该用户 ID 应返回相同的昵称和用户数据。
**验证需求: 1.2, 1.4**

**属性 2: 用户会话恢复**
*对于任意*已创建的用户，当用户再次访问平台时，系统应能识别用户身份并加载其所有历史作品 ID。
**验证需求: 1.3**

### 文件上传和验证属性

**属性 3: 文件格式验证**
*对于任意*文件，如果文件扩展名是 JPG、PNG 或 WEBP（不区分大小写），则验证应通过；否则应拒绝。
**验证需求: 2.2, 2.4**

**属性 4: 上传文件持久化**
*对于任意*有效的图片文件，上传成功后，文件系统中应存在该文件且文件内容与上传内容一致。
**验证需求: 2.5**

### 创作流程属性

**属性 5: 工作流顺序执行**
*对于任意*创作流程，步骤必须按照以下顺序执行：上传 → 图像优化 → 动画生成 → 故事生成，不能跳过或乱序。
**验证需求: 11.2**

**属性 6: 工作流自动推进**
*对于任意*创作，当图像优化完成时，动画生成应自动启动；当动画生成完成时，故事生成应自动启动。
**验证需求: 4.1, 5.1**

**属性 7: 步骤状态同步**
*对于任意*创作流程，当某个步骤完成时，步骤指示器的状态应立即更新为"已完成"。
**验证需求: 11.3**

### AI 处理属性

**属性 8: 视频时长规格**
*对于任意*生成的动画视频，视频时长应在 2 秒到 4 秒之间（包含边界）。
**验证需求: 4.3**

**属性 9: AI 模型调用验证**
*对于任意*图像优化请求，系统应调用 ControlNet 模型；对于任意动画生成请求，系统应调用豆包图生视频 API；对于任意故事生成请求，系统应调用豆包 LLM API。
**验证需求: 3.1, 4.2, 5.2**

**属性 10: LLM 上下文传递**
*对于任意*故事生成请求，传递给豆包 LLM 的提示词中应包含图像描述或相关上下文信息。
**验证需求: 5.3**

### 数据持久化属性

**属性 11: 创作数据完整性**
*对于任意*完成的创作，存储的 JSON 数据应包含所有必需字段：id、userId、originalImage、enhancedImage、animation、story、status、createdAt、updatedAt。
**验证需求: 12.1, 12.2**

**属性 12: 文件存储位置正确性**
*对于任意*保存的文件，原始图片应存储在 `images/original/` 目录，优化图片应存储在 `images/enhanced/` 目录，视频应存储在 `videos/` 目录。
**验证需求: 12.3, 12.4**

**属性 13: 数据写入验证**
*对于任意*数据保存操作，保存后应能成功读取该数据，且读取的数据与保存的数据一致（往返一致性）。
**验证需求: 12.5**

**属性 14: 文件缺失错误处理**
*对于任意*文件读取操作，如果文件不存在或损坏，系统应返回错误而不是崩溃，并提供有意义的错误信息。
**验证需求: 12.6**

### 错误处理属性

**属性 15: AI 失败错误反馈**
*对于任意*AI 模型调用失败（ControlNet、豆包视频、豆包 LLM），系统应显示友好的错误消息并提供重试选项。
**验证需求: 3.5, 4.5, 5.6, 13.1**

**属性 16: 上传失败错误反馈**
*对于任意*文件上传失败，系统应显示具体的失败原因（如文件过大、格式不支持、网络错误）。
**验证需求: 13.2**

**属性 17: 超时错误处理**
*对于任意*网络请求，如果超时，系统应提示用户检查网络连接并提供重试选项。
**验证需求: 13.3**

**属性 18: 错误日志记录**
*对于任意*系统错误，应在日志文件中记录错误类型、时间戳、错误消息和堆栈跟踪。
**验证需求: 13.5**

### 作品展示属性

**属性 19: 作品时间排序**
*对于任意*作品列表，作品应按 createdAt 时间戳降序排列（最新的在前）。
**验证需求: 6.6**

**属性 20: 作品详情完整性**
*对于任意*作品详情页面，应显示原始图片、优化图片、动画视频和故事文本四个元素。
**验证需求: 7.1**

**属性 21: 视频循环播放**
*对于任意*作品详情页面中的动画视频，视频元素应设置 loop 属性为 true。
**验证需求: 7.2**

### 分享和导出属性

**属性 22: 海报内容完整性**
*对于任意*生成的分享海报，海报图像中应包含优化后的图像和部分故事文本。
**验证需求: 8.2**

**属性 23: 海报尺寸规格**
*对于任意*生成的分享海报，尺寸应为适合社交媒体的标准尺寸（如 1080x1920 或 1200x1200）。
**验证需求: 8.4**

**属性 24: 导出文件类型正确性**
*对于任意*导出操作，如果选择导出图片，应下载 PNG/JPG 文件；如果选择导出视频，应下载 MP4 文件；如果选择导出电子绘本，应下载 PDF 文件。
**验证需求: 9.2, 9.3, 9.4**

**属性 25: PDF 内容完整性**
*对于任意*导出的电子绘本 PDF，应包含优化后的图像和完整的故事文本。
**验证需求: 9.4**

### UI 交互属性

**属性 26: 异步操作状态反馈**
*对于任意*异步操作（图像优化、动画生成、故事生成），在操作进行中，UI 应显示加载动画或进度指示器。
**验证需求: 3.4, 4.4, 5.5**

**属性 27: 按钮动画效果**
*对于任意*按钮点击事件，应触发弹性动画效果（通过 CSS 类或 Framer Motion）。
**验证需求: 10.6**

**属性 28: 音效反馈触发**
*对于任意*用户操作（上传、点击、完成），应触发相应的音效播放。
**验证需求: 10.7**

### 性能属性

**属性 29: 上传预览响应时间**
*对于任意*有效的图片上传，从上传完成到显示预览的时间应不超过 2 秒。
**验证需求: 14.1**

**属性 30: 3D 渲染帧率**
*对于任意*3D 画廊场景，在正常负载下（少于 100 个作品），渲染帧率应保持在 30 FPS 以上。
**验证需求: 14.2**

**属性 31: 懒加载实现**
*对于任意*作品列表，应只加载当前可见区域及其附近的作品，而不是一次性加载所有作品。
**验证需求: 14.3**

**属性 32: 文件压缩效果**
*对于任意*保存的图像或视频文件，输出文件大小应小于或等于输入文件大小（除非输入已经是最优压缩）。
**验证需求: 14.5**

## 错误处理

### 错误分类

系统错误分为以下几类：

1. **用户输入错误**
   - 无效文件格式
   - 文件过大
   - 空昵称

2. **AI 模型错误**
   - ControlNet 处理失败
   - SVD 生成失败
   - LLM API 调用失败
   - 模型加载失败

3. **存储错误**
   - 文件写入失败
   - 文件读取失败
   - 磁盘空间不足
   - JSON 解析错误

4. **网络错误**
   - API 请求超时
   - 连接失败
   - 服务不可用

### 错误处理策略

**用户输入错误:**
- 在客户端进行前置验证
- 显示清晰的错误提示
- 提供修正建议
- 不发送无效请求到服务器

**AI 模型错误:**
- 实现重试机制（最多 3 次）
- 显示友好的错误消息
- 记录详细错误日志
- 提供手动重试选项
- 考虑降级方案（如使用备用模型）

**存储错误:**
- 在写入前检查磁盘空间
- 使用原子写入操作
- 实现数据备份
- 提供数据恢复机制

**网络错误:**
- 设置合理的超时时间（30 秒）
- 实现指数退避重试
- 显示网络状态提示
- 提供离线模式（如果适用）

### 错误响应格式

所有 API 错误响应应遵循统一格式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "用户友好的错误消息",
    "details": "技术细节（可选）",
    "timestamp": "2024-01-15T10:30:00Z",
    "retryable": true
  }
}
```

### 错误代码

- `INVALID_FILE_FORMAT`: 不支持的文件格式
- `FILE_TOO_LARGE`: 文件超过大小限制
- `UPLOAD_FAILED`: 文件上传失败
- `CONTROLNET_ERROR`: ControlNet 处理失败
- `DOUBAO_VIDEO_ERROR`: 豆包视频生成失败
- `DOUBAO_LLM_ERROR`: 豆包 LLM 故事生成失败
- `DOUBAO_API_KEY_MISSING`: 豆包 API 密钥未配置
- `STORAGE_ERROR`: 存储操作失败
- `NETWORK_TIMEOUT`: 网络请求超时
- `NOT_FOUND`: 资源不存在
- `INTERNAL_ERROR`: 内部服务器错误

## 测试策略

### 双重测试方法

系统测试采用单元测试和基于属性的测试相结合的方法：

**单元测试:**
- 验证特定示例和边界情况
- 测试组件集成点
- 测试错误条件和异常处理
- 快速反馈，适合 TDD 开发流程

**基于属性的测试:**
- 验证跨所有输入的通用属性
- 通过随机化实现全面的输入覆盖
- 发现边界情况和意外行为
- 每个测试运行最少 100 次迭代

两种测试方法是互补的：单元测试捕获具体的 bug，基于属性的测试验证通用正确性。

### 前端测试

**测试框架:**
- Jest (测试运行器)
- React Testing Library (组件测试)
- fast-check (基于属性的测试库)

**测试覆盖:**

1. **组件单元测试**
   - UploadZone: 文件选择、验证、预览
   - MagicEngine: 步骤指示器、进度显示
   - ThreeGallery: 场景初始化、交互处理

2. **基于属性的测试**
   - 属性 3: 文件格式验证
   - 属性 19: 作品排序
   - 属性 26: 异步状态反馈

3. **集成测试**
   - 完整创作流程
   - 页面导航
   - API 客户端调用

### 后端测试

**测试框架:**
- pytest (测试运行器)
- Hypothesis (基于属性的测试库)
- pytest-mock (模拟框架)

**测试覆盖:**

1. **服务单元测试**
   - UserService: 用户创建、查询
   - CreationService: 创作 CRUD 操作
   - FileStorage: 文件读写操作
   - JSONStorage: JSON 数据操作

2. **基于属性的测试**
   - 属性 1: 用户创建持久化
   - 属性 4: 上传文件持久化
   - 属性 8: 视频时长规格
   - 属性 11: 创作数据完整性
   - 属性 13: 数据往返一致性

3. **AI 模型测试**
   - ControlNetProcessor: 模拟模型调用
   - DoubaoVideoProcessor: 模拟 API 调用和任务轮询
   - LLMProcessor: 提示词构建和 API 调用

4. **API 端点测试**
   - 所有端点的成功路径
   - 错误处理和验证
   - 认证和授权

### 基于属性的测试配置

**配置要求:**
- 每个属性测试最少运行 100 次迭代
- 使用随机种子以实现可重现性
- 在 CI/CD 中运行更多迭代（1000+）

**测试标记格式:**
```python
# Feature: tonghua-qijing-platform, Property 1: 用户创建持久化
def test_user_creation_persistence():
    ...
```

```typescript
// Feature: tonghua-qijing-platform, Property 3: 文件格式验证
test('file format validation property', () => {
    ...
});
```

### 测试数据生成

**前端生成器 (fast-check):**
```typescript
// 生成随机文件
const fileArbitrary = fc.record({
  name: fc.string(),
  type: fc.constantFrom('image/jpeg', 'image/png', 'image/webp', 'text/plain'),
  size: fc.integer({ min: 0, max: 10_000_000 })
});

// 生成随机创作
const creationArbitrary = fc.record({
  id: fc.uuid(),
  userId: fc.uuid(),
  originalImage: fc.webUrl(),
  enhancedImage: fc.option(fc.webUrl()),
  animation: fc.option(fc.webUrl()),
  story: fc.option(fc.string({ minLength: 100, maxLength: 300 })),
  createdAt: fc.date().map(d => d.toISOString())
});
```

**后端生成器 (Hypothesis):**
```python
from hypothesis import strategies as st

# 生成随机用户
user_strategy = st.builds(
    dict,
    id=st.uuids().map(str),
    nickname=st.text(min_size=1, max_size=50),
    created_at=st.datetimes().map(lambda d: d.isoformat()),
    creations=st.lists(st.uuids().map(str))
)

# 生成随机创作
creation_strategy = st.builds(
    dict,
    id=st.uuids().map(str),
    userId=st.uuids().map(str),
    originalImage=st.text(),
    enhancedImage=st.one_of(st.none(), st.text()),
    animation=st.one_of(st.none(), st.text()),
    story=st.one_of(st.none(), st.text(min_size=100, max_size=300)),
    status=st.sampled_from(['uploaded', 'enhancing', 'completed', 'failed'])
)
```

### 性能测试

**前端性能:**
- 使用 Chrome DevTools Performance 分析
- 测量 3D 渲染帧率
- 测量组件渲染时间
- 测量包大小和加载时间

**后端性能:**
- 使用 pytest-benchmark 测量函数执行时间
- 模拟 AI 模型调用以隔离性能测试
- 测量文件 I/O 性能
- 测量 API 响应时间

### CI/CD 集成

**测试流水线:**
1. 代码提交触发 CI
2. 运行 linter 和格式检查
3. 运行单元测试
4. 运行基于属性的测试（100 次迭代）
5. 运行集成测试
6. 生成测试覆盖率报告
7. 如果所有测试通过，允许合并

**测试覆盖率目标:**
- 单元测试覆盖率: 80%+
- 关键路径覆盖率: 100%
- 属性测试覆盖所有定义的属性

