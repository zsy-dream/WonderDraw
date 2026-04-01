#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""文档整理脚本 - 使用pathlib处理中文路径"""

from pathlib import Path
import shutil

# 项目根目录
BASE = Path("d:/互联网+项目开发/06 童画·奇境————基于多模态大模型的儿童创意教育生态平台")

# 文档分类映射
DOCS = [
    # 01_项目说明
    ("README.md", "docs/01_项目说明"),
    ("UPDATE_LOG.md", "docs/01_项目说明"),
    ("DEVELOPMENT_PLAN.md", "docs/01_项目说明"),
    ("SUBMISSION_DEMO_DATA.md", "docs/01_项目说明"),
    # 02_技术文档
    ("setup.md", "docs/02_技术文档"),
    ("DOUBAO_SETUP.md", "docs/02_技术文档"),
    ("DOUBAO_FREE_TIER_GUIDE.md", "docs/02_技术文档"),
    ("TESTING_GUIDE.md", "docs/02_技术文档"),
    ("SHOT_GUIDE.md", "docs/02_技术文档"),
    # 03_部署运维
    ("DEPLOYMENT.md", "docs/03_部署运维"),
    ("VERCEL_部署指南.md", "docs/03_部署运维"),
    # 04_商业计划
    ("PITCH_SCRIPT.md", "docs/04_商业计划"),
    ("创业计划书_互联网+_智联万象_完整稿.md", "docs/04_商业计划"),
    ("创业计划书_互联网+_童画奇境_路演型A_终稿.md", "docs/04_商业计划"),
    ("给对方的打包说明.md", "docs/04_商业计划"),
    ("零基础用户启动攻略.md", "docs/04_商业计划"),
]

print("开始整理文档...\n")
moved = 0
skipped = 0

for filename, folder in DOCS:
    src = BASE / filename
    dst_dir = BASE / folder
    dst = dst_dir / filename
    
    if src.exists():
        dst_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        src.unlink()
        print(f"✓ {filename}")
        moved += 1
    else:
        print(f"✗ 跳过(不存在): {filename}")
        skipped += 1

print(f"\n整理完成！移动 {moved} 个文件，跳过 {skipped} 个文件")
