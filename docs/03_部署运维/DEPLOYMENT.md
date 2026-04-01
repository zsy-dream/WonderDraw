# 生产环境部署配置

## 环境变量配置

### 后端配置 (.env)
```bash
# 数据库
DATABASE_URL=sqlite:///./storage/data/app.db

# AI API配置（可选，不配置则使用模拟模式）
LLM_API_KEY=your_deepseek_or_qwen_api_key
DOUBAO_API_KEY=your_doubao_api_key
DOUBAO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3

# 运行模式
DEBUG=false
PORT=5001
HOST=0.0.0.0

# 安全配置
SECRET_KEY=your_random_secret_key_here
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# 文件存储
UPLOAD_FOLDER=storage/uploads
MAX_CONTENT_LENGTH=16777216
```

### 前端配置 (.env)
```bash
# API地址
VITE_API_BASE_URL=https://your-api-domain.com/api

# 生产环境
VITE_PRODUCTION=true

# 功能开关
VITE_ENABLE_BLOCKCHAIN=true
VITE_ENABLE_VOICE_OVER=true
```

---

## Docker部署（推荐）

### 1. 创建Dockerfile（后端）

```dockerfile
# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 创建存储目录
RUN mkdir -p storage/data storage/uploads

# 暴露端口
EXPOSE 5001

# 启动命令
CMD ["python", "app_simple.py"]
```

### 2. 创建Dockerfile（前端）

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制代码并构建
COPY . .
RUN npm run build

# 生产环境使用Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. Nginx配置

```nginx
# frontend/nginx.conf
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://backend:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. Docker Compose配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: fairytale-backend
    restart: always
    ports:
      - "5001:5001"
    volumes:
      - ./storage:/app/storage
    environment:
      - DEBUG=false
      - PORT=5001
      - HOST=0.0.0.0
    env_file:
      - ./backend/.env
    networks:
      - fairytale-network

  frontend:
    build: ./frontend
    container_name: fairytale-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - fairytale-network

networks:
  fairytale-network:
    driver: bridge
```

---

## 传统部署方式

### 后端部署（Linux服务器）

```bash
# 1. 安装Python依赖
pip install -r requirements.txt

# 2. 创建系统服务
sudo tee /etc/systemd/system/fairytale.service << EOF
[Unit]
Description=Fairytale Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/fairytale/backend
ExecStart=/usr/bin/python3 app_simple.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 3. 启动服务
sudo systemctl enable fairytale
sudo systemctl start fairytale
```

### 前端部署

```bash
# 1. 构建
cd frontend
npm install
npm run build

# 2. 部署到Nginx
cp -r dist/* /var/www/html/

# 3. Nginx配置
sudo tee /etc/nginx/sites-available/fairytale << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/fairytale /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 云服务部署（推荐用于比赛演示）

### 阿里云ECS（轻量应用服务器）

**推荐配置**：
- 2核2G内存（足够演示）
- 40G SSD
- 3M带宽
- 价格：约100元/年（学生优惠）

**部署步骤**：
```bash
# 1. 购买服务器后，SSH登录
ssh root@your-server-ip

# 2. 安装基础环境
apt update && apt install -y python3-pip nginx git

# 3. 克隆项目
cd /var/www
git clone https://github.com/yourusername/fairytale.git

# 4. 部署后端
cd fairytale/backend
pip3 install -r requirements.txt

# 5. 部署前端
cd ../frontend
npm install
npm run build
cp -r dist/* /var/www/html/

# 6. 配置Nginx反向代理
# 编辑 /etc/nginx/sites-available/default

# 7. 启动后端（使用screen或systemd）
screen -S backend
cd /var/www/fairytale/backend
python3 app_simple.py
# Ctrl+A+D  detach
```

---

## 免费部署选项

### Vercel（前端，免费）

```bash
cd frontend
# 安装Vercel CLI
npm i -g vercel
# 部署
vercel --prod
```

### Railway/Render（后端，免费额度）

1. 在GitHub创建仓库并推送代码
2. 连接Railway/Render账号
3. 自动部署

### 组合方案（完全免费）

| 服务 | 用途 | 成本 |
|-----|------|-----|
| Vercel | 前端托管 | ¥0 |
| Railway | 后端API | ¥0（有免费额度） |
| SQLite | 数据库 | ¥0 |

---

## 比赛演示专用配置

### 本地演示（无需网络）

**适用场景**：比赛现场无网络/网络不稳定

```bash
# 1. 使用模拟模式（完全离线）
cd backend
MOCK_MODE=true python app_simple.py

# 2. 前端使用本地API
cd frontend
# 修改 .env.local
VITE_API_BASE_URL=http://localhost:5001/api
npm run dev

# 3. 使用localhost访问
# http://localhost:5173
```

### 离线包制作

```bash
# 制作可离线运行的包
mkdir fairytale-offline-demo
cp -r backend fairytale-offline-demo/
cp -r frontend/dist fairytale-offline-demo/

# 创建启动脚本
cat > fairytale-offline-demo/start.bat << 'EOF'
@echo off
echo Starting Fairytale Demo...
start python backend/app_simple.py
timeout /t 3
start frontend/dist/index.html
EOF

# 压缩为zip，带到比赛现场
zip -r fairytale-demo.zip fairytale-offline-demo/
```

---

## 监控与维护

### 日志查看

```bash
# 后端日志
journalctl -u fairytale -f

# Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 备份策略

```bash
# 数据库备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp storage/data/creations.json backup/creations_$DATE.json
# 保留最近30天
cd backup && ls -t | tail -n +31 | xargs rm -f
```

---

## 域名与HTTPS

### 免费域名
- Freenom（.tk/.ml/.ga等）
- 花生壳/ nat123（国内）

### 免费SSL证书（Let's Encrypt）

```bash
# 安装certbot
apt install certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run
```

---

## 部署检查清单

- [ ] 环境变量配置完成
- [ ] 数据库目录权限正确
- [ ] API端口开放（防火墙）
- [ ] Nginx配置正确
- [ ] SSL证书配置（生产环境）
- [ ] 日志轮转配置
- [ ] 备份脚本配置
- [ ] 监控告警配置（可选）

---

**推荐比赛演示方案**：使用阿里云轻量服务器（学生优惠）或本地笔记本运行，配合内网穿透（花生壳/ngrok）让评委能访问。**
