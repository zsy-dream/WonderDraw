# 🚀 Vercel 部署完整指南

## ⏱️ 预计耗时：5 分钟

---

## 第1步：创建 Vercel 账户

访问：https://vercel.com

点击右上角"Sign Up"，选择用 GitHub 账户登录（最简单）

---

## 第2步：连接 GitHub 仓库

1. 登录 Vercel 后，点击"Add New..." → "Project"
2. 选择"Import Git Repository"
3. 在搜索框输入你的 GitHub 仓库名称
4. 点击"Import"

---

## 第3步：配置项目

进入"Configure Project"页面：

### 设置 1：项目名称
```
Project Name: tonghuai-qijing
```

### 设置 2：Build Settings
- **Framework Preset**: 选择 "Vite"
- **Build Command**: 保持默认 `npm run build`
- **Output Directory**: 保持默认 `dist`
- **Install Command**: 保持默认 `npm install`

### 设置 3：Environment Variables（可选）
如果项目需要 API 配置，可以在这里添加：
```
VITE_API_URL=http://localhost:5001
```
（但演示版本不需要）

---

## 第4步：部署

点击"Deploy"按钮

等待部署完成（通常 2-3 分钟）

---

## 📍 部署完成后

会显示类似这样的信息：
```
✅ Deployment successful!

Visit: https://tonghuai-qijing.vercel.app
```

---

## 🎯 复制你的在线地址

部署成功后，你会获得一个永久在线的演示网址，如：
```
https://tonghuai-qijing.vercel.app
```

**将这个地址发送给任何人，他们可以立即在浏览器打开查看！**

---

## ⚠️ 常见问题

### Q：部署失败了，显示 "Build failed"

**A：** 检查以下几点：
1. 确保 `frontend/package.json` 存在
2. 确保 `vite.config.js` 配置正确
3. 查看"Deployments"→"View logs"看具体错误

### Q：部署成功但打开是白屏

**A：** 可能是 API 请求失败（后端服务不可用）
- 确保 `VITE_API_URL` 配置正确
- 或在前端代码中添加模拟数据（已内置）

### Q：我没有 GitHub 账户怎么办？

**A：** 可以用邮箱直接注册 Vercel，但需要手动上传代码

---

## 🎉 部署成功后

你现在有了：

✅ **永久在线的演示网址** - 给任何人打开都可以看  
✅ **HTTPS 安全链接** - 自动配置，无需额外操作  
✅ **全球 CDN 加速** - 国内国外都很快  
✅ **自动更新** - 代码推送到 GitHub 后自动部署  
✅ **免费使用** - Vercel 免费层足够演示使用  

---

## 📱 分享链接

部署完成后，直接分享这个链接给任何人：

```
🎨 童画·奇境在线演示
https://tonghuai-qijing.vercel.app

无需下载，点击即可查看完整功能演示！
（推荐 Chrome 浏览器）
```

---

## 如果需要更新

每次代码有更新时：

1. 推送到 GitHub（`git push`）
2. Vercel 自动检测并重新部署
3. 约 2-3 分钟后自动上线

无需手动操作！

---

**部署成功后直接把链接发给评委/投资人，他们秒开即可看到完整演示！** 🎉