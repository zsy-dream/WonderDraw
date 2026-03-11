@echo off
chcp 65001 >nul 2>&1
title 童画·奇境 - 一键启动

echo ============================================
echo    童画·奇境 - 零基础一键启动
echo ============================================
echo.
echo [1/4] 检查环境...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js，请先安装后重试
    echo.
    echo 下载地址：https://nodejs.org/zh-cn/
    echo 安装后重新双击此文件
    pause
    exit /b
)
echo ✅ Node.js 已安装
echo.

echo [2/4] 启动后端服务器...
cd /d "%~dp0"
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ 正在安装后端依赖...
    pip install flask flask-cors python-dotenv Pillow requests >nul 2>&1
)
start "童画奇境-后端" python backend/app_simple.py
echo ✅ 后端服务器启动中（端口 5001）...
echo.

echo [3/4] 启动前端服务器...
cd /d "%~dp0frontend" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 找不到 frontend 文件夹
    echo 请将此文件放在项目根目录下
    pause
    exit /b
)

call npm install >nul 2>&1
start "童画奇境-前端" npm run dev

echo ✅ 前端服务器启动中（端口 3000）...
echo.

echo [4/4] 打开浏览器...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ============================================
echo   ✅ 启动成功！
echo ============================================
echo.
echo 浏览器已自动打开：
echo     http://localhost:5173
echo.
echo 说明：
echo - 后端服务: http://localhost:5001
echo - 前端服务器已在后台运行
echo - 关闭浏览器后服务器仍在运行
echo - 如需关闭，请关闭任务栏中"童画奇境-后端"和"童画奇境-前端"窗口
echo.
echo 如遇问题，请查看"零基础用户启动攻略.md"
echo.
pause