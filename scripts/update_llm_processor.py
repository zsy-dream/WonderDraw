#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新 llm_processor.py 以支持华为云 ModelArts DeepSeek-V3.2
"""

import re
import os

file_path = 'backend/models/llm_processor.py'

# 读取文件
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 修改 __init__ 方法签名，添加 model_name 参数
old_init = '''    def __init__(
        self,
        api_key: str,
        api_url: str,
        provider: str = 'deepseek',
        max_tokens: int = 500,
        temperature: float = 0.8
    ):'''

new_init = '''    def __init__(
        self,
        api_key: str,
        api_url: str,
        provider: str = 'deepseek',
        max_tokens: int = 500,
        temperature: float = 0.8,
        model_name: str = None
    ):'''

content = content.replace(old_init, new_init)

# 2. 添加 self.model_name 赋值
old_assign = '''        self.api_key = api_key
        self.api_url = api_url
        self.provider = provider.lower()
        self.max_tokens = max_tokens
        self.temperature = temperature'''

new_assign = '''        self.api_key = api_key
        self.api_url = api_url
        self.provider = provider.lower()
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.model_name = model_name'''

content = content.replace(old_assign, new_assign)

# 3. 修改 _get_model_name 方法
old_method = '''    def _get_model_name(self) -> str:
        """获取模型名称
        
        Returns:
            模型名称字符串
        """
        if self.provider == 'deepseek':
            return 'deepseek-chat'
        elif self.provider == 'qwen':
            return 'qwen-turbo'
        else:
            # 默认使用 deepseek
            return 'deepseek-chat' '''

new_method = '''    def _get_model_name(self) -> str:
        """获取模型名称
        
        Returns:
            模型名称字符串
        """
        # 优先使用指定的模型名称（用于华为云等自定义模型）
        if self.model_name:
            return self.model_name
        
        if self.provider == 'deepseek':
            return 'deepseek-chat'
        elif self.provider == 'qwen':
            return 'qwen-turbo'
        else:
            # 默认使用 deepseek
            return 'deepseek-chat' '''

content = content.replace(old_method, new_method)

# 写回文件
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'✓ {file_path} 已成功更新！')
print('支持华为云 ModelArts DeepSeek-V3.2')
