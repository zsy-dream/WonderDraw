#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新 ai_service.py 以支持传入 model_name 参数
"""

import re
import os

file_path = 'backend/services/ai_service.py'

# 读取文件
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 找到并修改 LLMProcessor 初始化部分
# 需要在 _load_models 方法中添加 model_name 参数

# 先查找 config 导入
if 'from backend.config import Config' not in content:
    # 在文件开头添加导入
    old_import = 'from backend.models.llm_processor import LLMProcessor'
    new_import = '''from backend.models.llm_processor import LLMProcessor
from backend.config import Config'''
    content = content.replace(old_import, new_import)

# 修改 _load_models 方法中的 LLMProcessor 初始化
old_llm_init = 'self.llm_processor = LLMProcessor()'
new_llm_init = '''self.llm_processor = LLMProcessor(
                api_key=Config.LLM_API_KEY,
                api_url=Config.LLM_API_URL,
                provider=Config.LLM_PROVIDER,
                max_tokens=Config.LLM_MAX_TOKENS,
                temperature=Config.LLM_TEMPERATURE,
                model_name=getattr(Config, 'LLM_MODEL_NAME', None)
            )'''

if old_llm_init in content:
    content = content.replace(old_llm_init, new_llm_init)
    print('✓ 已更新 LLMProcessor 初始化参数')
else:
    print('⚠ 未找到需要修改的代码，可能已经是新的初始化方式')

# 写回文件
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'✓ {file_path} 已更新！')
