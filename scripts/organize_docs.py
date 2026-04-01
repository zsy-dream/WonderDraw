import os
import shutil
import sys

base = r"d:\互联网+项目开发\06 童画·奇境————基于多模态大模型的儿童创意教育生态平台"
os.chdir(base)

print(f"当前目录: {os.getcwd()}")
print(f"目录内容: {os.listdir('.')}")

docs_mapping = [
    # 项目说明
    ("README.md", "docs/01_项目说明"),
    ("UPDATE_LOG.md", "docs/01_项目说明"),
    ("DEVELOPMENT_PLAN.md", "docs/01_项目说明"),
    ("SUBMISSION_DEMO_DATA.md", "docs/01_项目说明"),
    # 技术文档
    ("setup.md", "docs/02_技术文档"),
    ("DOUBAO_SETUP.md", "docs/02_技术文档"),
    ("DOUBAO_FREE_TIER_GUIDE.md", "docs/02_技术文档"),
    ("TESTING_GUIDE.md", "docs/02_技术文档"),
    ("SHOT_GUIDE.md", "docs/02_技术文档"),
    # 部署运维
    ("DEPLOYMENT.md", "docs/03_部署运维"),
    ("VERCEL_部署指南.md", "docs/03_部署运维"),
    # 商业计划
    ("PITCH_SCRIPT.md", "docs/04_商业计划"),
    ("创业计划书_互联网+_智联万象_完整稿.md", "docs/04_商业计划"),
    ("创业计划书_互联网+_童画奇境_路演型A_终稿.md", "docs/04_商业计划"),
    ("给对方的打包说明.md", "docs/04_商业计划"),
    ("零基础用户启动攻略.md", "docs/04_商业计划"),
]

print("开始整理文档...")

for src, dst_dir in docs_mapping:
    if os.path.exists(src):
        os.makedirs(dst_dir, exist_ok=True)
        shutil.copy2(src, os.path.join(dst_dir, src))
        os.remove(src)
        print(f"✓ {src}")
    else:
        print(f"✗ 跳过(不存在): {src}")

print("\n文档整理完成！")
