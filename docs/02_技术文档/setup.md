# 开发环境搭建指南

## 前置要求

- Node.js 18+ 和 npm
- Python 3.9+
- Git

## 安装步骤

### 1. 克隆项目（如果从远程仓库）

```bash
git clone <repository-url>
cd tonghua-qijing-platform
```

### 2. 前端设置

```bash
cd frontend
npm install
```

### 3. 后端设置

```bash
cd backend
pip install -r requirements.txt
```

或使用虚拟环境（推荐）：

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
pip install -r requirements.txt
```

### 4. 环境配置

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，配置必要的 API 密钥：
- `LLM_API_KEY`: 配置 DeepSeek 或 Qwen 的 API 密钥

### 5. 启动开发服务器

**终端 1 - 后端：**
```bash
cd backend
python app.py
```

**终端 2 - 前端：**
```bash
cd frontend
npm run dev
```

### 6. 访问应用

- 前端：http://localhost:3000
- 后端：http://localhost:5000
- 健康检查：http://localhost:5000/api/health

## 目录结构验证

确保以下目录存在：
- `storage/images/original/`
- `storage/images/enhanced/`
- `storage/videos/`
- `storage/exports/posters/`
- `storage/exports/ebooks/`
- `storage/data/`

## 常见问题

### 端口被占用

如果端口 3000 或 5000 被占用，可以修改：
- 前端：编辑 `frontend/vite.config.js` 中的 `server.port`
- 后端：编辑 `backend/app.py` 中的 `port` 参数

### AI 模型下载

首次运行时，AI 模型会自动从 Hugging Face 下载，可能需要较长时间。确保网络连接稳定。

### Python 依赖安装失败

某些依赖（如 PyTorch）较大，建议使用国内镜像：
```bash
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```
