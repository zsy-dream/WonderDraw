# 童画·奇境 - 后端

Flask REST API 后端服务

## 安装依赖

```bash
pip install -r requirements.txt
```

## 配置

1. 复制 `.env.example` 为 `.env`
2. 配置必要的环境变量

## 运行

```bash
python app.py
```

服务将运行在 http://localhost:5000

## API 端点

- `GET /api/health` - 健康检查

更多端点将在后续开发中添加。

## 技术栈

- Flask 3.0
- Flask-CORS
- Pillow (图像处理)
- PyTorch + diffusers (AI 模型)
- requests (HTTP 客户端)
