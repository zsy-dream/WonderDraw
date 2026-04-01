#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创建 backend/.env 文件
"""
import os

env_content = """# 华为云 ModelArts DeepSeek-V3.2（故事生成）
LLM_API_KEY=9NvZH3QX5p0koaNQCf9pGJsTlXCggNLg-NS3hspcA0gZH_L3txOiLE4dN-1r6sSQWR8jCXasdWBZHszSREkhIA
LLM_API_URL=https://api.modelarts-maas.com/v2/chat/completions
LLM_MODEL_NAME=deepseek-v3.2
LLM_PROVIDER=deepseek

# 豆包（视频生成，可选）
DOUBAO_API_KEY=your_doubao_api_key_here
DOUBAO_ENDPOINT_ID=ep-20241230185133-xxxxx

# 服务器配置
FLASK_ENV=development
FLASK_DEBUG=True
"""

# 写入文件
with open('backend/.env', 'w', encoding='utf-8') as f:
    f.write(env_content)

print('✓ backend/.env 文件已创建成功！')
print('\n文件内容预览：')
print('-' * 50)
print(env_content)
print('-' * 50)
print('\n使用方法：')
print('cd backend')
print('python app_simple.py')
