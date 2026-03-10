#!/usr/bin/env python3
"""验证项目初始化是否完成"""
import os
import json

def check_directory(path, name):
    """检查目录是否存在"""
    exists = os.path.isdir(path)
    status = "✓" if exists else "✗"
    print(f"{status} {name}: {path}")
    return exists

def check_file(path, name):
    """检查文件是否存在"""
    exists = os.path.isfile(path)
    status = "✓" if exists else "✗"
    print(f"{status} {name}: {path}")
    return exists

def main():
    print("=" * 60)
    print("童画·奇境平台 - 项目初始化验证")
    print("=" * 60)
    
    all_checks = []
    
    print("\n前端项目:")
    all_checks.append(check_directory("frontend", "前端目录"))
    all_checks.append(check_file("frontend/package.json", "package.json"))
    all_checks.append(check_file("frontend/vite.config.js", "Vite 配置"))
    all_checks.append(check_file("frontend/src/App.jsx", "App 组件"))
    all_checks.append(check_file("frontend/index.html", "HTML 入口"))
    
    print("\n后端项目:")
    all_checks.append(check_directory("backend", "后端目录"))
    all_checks.append(check_file("backend/app.py", "Flask 应用"))
    all_checks.append(check_file("backend/config.py", "配置文件"))
    all_checks.append(check_file("backend/requirements.txt", "依赖列表"))
    all_checks.append(check_file("backend/.env.example", "环境变量示例"))
    
    print("\n存储目录:")
    all_checks.append(check_directory("storage/images/original", "原始图片目录"))
    all_checks.append(check_directory("storage/images/enhanced", "优化图片目录"))
    all_checks.append(check_directory("storage/videos", "视频目录"))
    all_checks.append(check_directory("storage/exports/posters", "海报导出目录"))
    all_checks.append(check_directory("storage/exports/ebooks", "电子书导出目录"))
    all_checks.append(check_directory("storage/data", "数据目录"))
    
    print("\n配置文件:")
    all_checks.append(check_file("config/app.json", "应用配置"))
    all_checks.append(check_file("storage/data/users.json", "用户数据"))
    all_checks.append(check_file("storage/data/creations.json", "作品数据"))
    
    print("\nGit 仓库:")
    all_checks.append(check_directory(".git", "Git 仓库"))
    all_checks.append(check_file(".gitignore", ".gitignore"))
    
    print("\n" + "=" * 60)
    passed = sum(all_checks)
    total = len(all_checks)
    print(f"验证结果: {passed}/{total} 项通过")
    
    if passed == total:
        print("✓ 项目初始化完成！")
        return 0
    else:
        print("✗ 部分检查未通过，请检查缺失的文件或目录")
        return 1

if __name__ == "__main__":
    exit(main())
