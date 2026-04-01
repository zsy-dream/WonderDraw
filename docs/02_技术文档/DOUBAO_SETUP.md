# 豆包视频生成 API 集成指南

## 1. 获取豆包 API 密钥

### 步骤：
1. 访问火山引擎控制台：https://console.volcengine.com/ark
2. 注册/登录账号
3. 进入"豆包大模型"或"视频生成"服务
4. 创建 API 密钥
5. 获取 Endpoint ID（模型端点 ID）

## 2. 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，填入你的 API 密钥：

```env
DOUBAO_API_KEY=your_actual_api_key_here
DOUBAO_ENDPOINT_ID=ep-20241230185133-xxxxx
```

## 3. 安装依赖

```bash
pip install requests python-dotenv
```

## 4. 使用说明

### 自动切换模式

系统会自动检测是否配置了豆包 API：

- **有配置**：使用真实的豆包 API 生成视频
- **无配置**：使用模拟数据（示例视频）

### API 调用流程

1. 用户上传图片
2. 系统调用豆包 API 上传图片
3. 提交视频生成任务
4. 轮询任务状态（最多等待 5 分钟）
5. 下载生成的视频
6. 返回视频 URL

### 视频参数

- **时长**：3 秒（可调整）
- **宽高比**：16:9
- **提示词**：自动生成儿童友好的提示词

## 5. 测试

启动后端服务：

```bash
python backend/app_simple.py
```

上传图片后，系统会自动调用豆包 API 生成视频。

## 6. 费用说明

豆包视频生成 API 可能需要付费，具体价格请查看：
https://www.volcengine.com/pricing

建议：
- 开发测试时使用模拟模式
- 生产环境配置真实 API

## 7. 故障排查

### 问题：视频生成失败

**可能原因：**
1. API 密钥错误
2. 账户余额不足
3. 网络连接问题
4. 图片格式不支持

**解决方法：**
1. 检查 `.env` 文件配置
2. 查看后端日志：`tail -f backend.log`
3. 验证 API 密钥是否有效
4. 确保图片格式为 JPG/PNG

### 问题：视频生成超时

**解决方法：**
- 增加等待时间（修改 `max_wait` 参数）
- 减少视频时长
- 检查网络连接

## 8. API 文档参考

豆包官方文档：
- https://www.volcengine.com/docs/82379
- https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint

## 9. 替代方案

如果豆包 API 不可用，可以使用：

1. **Stable Video Diffusion**（本地部署）
2. **Runway ML API**
3. **Pika Labs API**
4. **其他视频生成服务**

只需修改 `backend/models/doubao_video_processor.py` 中的 API 调用逻辑即可。