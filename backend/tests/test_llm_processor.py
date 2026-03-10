"""
LLM 故事生成处理器单元测试

测试 LLMProcessor 的各项功能
"""

import pytest
import sys
import os
from unittest.mock import Mock, patch, MagicMock

# 直接导入 LLMProcessor 模块文件，避免通过 __init__.py
import importlib.util
spec = importlib.util.spec_from_file_location(
    "llm_processor",
    os.path.join(os.path.dirname(__file__), '..', 'models', 'llm_processor.py')
)
llm_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(llm_module)
LLMProcessor = llm_module.LLMProcessor


class TestLLMProcessor:
    """LLM 处理器单元测试类"""
    
    @pytest.fixture
    def processor(self):
        """创建测试用的 LLM 处理器实例"""
        return LLMProcessor(
            api_key='test_api_key',
            api_url='https://api.test.com/v1/chat/completions',
            provider='deepseek',
            max_tokens=500,
            temperature=0.8
        )
    
    def test_initialization(self, processor):
        """测试处理器初始化"""
        assert processor.api_key == 'test_api_key'
        assert processor.api_url == 'https://api.test.com/v1/chat/completions'
        assert processor.provider == 'deepseek'
        assert processor.max_tokens == 500
        assert processor.temperature == 0.8
    
    def test_initialization_without_api_key(self):
        """测试没有 API 密钥的初始化（应该发出警告但不报错）"""
        processor = LLMProcessor(
            api_key='',
            api_url='https://api.test.com/v1/chat/completions'
        )
        assert processor.api_key == ''
    
    def test_initialization_without_api_url(self):
        """测试没有 API URL 的初始化（应该报错）"""
        with pytest.raises(ValueError, match="LLM API URL 不能为空"):
            LLMProcessor(api_key='test_key', api_url='')
    
    def test_build_prompt_default_template(self, processor):
        """测试使用默认模板构建提示词"""
        image_description = "一只可爱的小兔子在花园里玩耍"
        prompt = processor.build_prompt(image_description)
        
        assert image_description in prompt
        assert '100-300字' in prompt
        assert '3-12岁儿童' in prompt
        assert '积极向上' in prompt
        assert '避免暴力' in prompt
    
    def test_build_prompt_custom_template(self, processor):
        """测试使用自定义模板构建提示词"""
        image_description = "一个小男孩和机器人"
        custom_template = "为这幅画创作故事：{image_description}"
        prompt = processor.build_prompt(image_description, custom_template)
        
        assert prompt == f"为这幅画创作故事：{image_description}"
    
    def test_get_model_name_deepseek(self, processor):
        """测试获取 DeepSeek 模型名称"""
        assert processor._get_model_name() == 'deepseek-chat'
    
    def test_get_model_name_qwen(self):
        """测试获取 Qwen 模型名称"""
        processor = LLMProcessor(
            api_key='test_key',
            api_url='https://api.test.com',
            provider='qwen'
        )
        assert processor._get_model_name() == 'qwen-turbo'
    
    def test_get_model_name_unknown_provider(self):
        """测试未知提供商（应该使用默认值）"""
        processor = LLMProcessor(
            api_key='test_key',
            api_url='https://api.test.com',
            provider='unknown'
        )
        assert processor._get_model_name() == 'deepseek-chat'
    
    def test_clean_story_basic(self, processor):
        """测试基本的故事清理"""
        story = "  从前有一只小兔子。  它很可爱。  "
        cleaned = processor._clean_story(story)
        assert cleaned == "从前有一只小兔子。 它很可爱。"
    
    def test_clean_story_remove_quotes(self, processor):
        """测试移除引号"""
        story = '"从前有一只小兔子。"'
        cleaned = processor._clean_story(story)
        assert cleaned == "从前有一只小兔子。"
        
        story = "'从前有一只小兔子。'"
        cleaned = processor._clean_story(story)
        assert cleaned == "从前有一只小兔子。"
    
    def test_clean_story_remove_title(self, processor):
        """测试移除标题行"""
        story = "故事：小兔子的冒险\n从前有一只小兔子。"
        cleaned = processor._clean_story(story)
        assert "故事：" not in cleaned
        assert "从前有一只小兔子。" in cleaned
    
    def test_validate_story_empty(self, processor):
        """测试验证空故事（应该报错）"""
        with pytest.raises(ValueError, match="生成的故事为空"):
            processor._validate_story("")
    
    def test_validate_story_too_short(self, processor):
        """测试验证过短的故事（应该报错）"""
        short_story = "小兔子很可爱。"  # 少于 100 字
        with pytest.raises(ValueError, match="故事长度不足"):
            processor._validate_story(short_story)
    
    def test_validate_story_too_long(self, processor):
        """测试验证过长的故事（应该报错）"""
        long_story = "从前" * 200  # 超过 300 字
        with pytest.raises(ValueError, match="故事长度超出限制"):
            processor._validate_story(long_story)
    
    def test_validate_story_valid_length(self, processor):
        """测试验证合适长度的故事（应该通过）"""
        valid_story = "从前有一只小兔子，它住在美丽的森林里。" * 10  # 约 200 字
        # 不应该抛出异常
        processor._validate_story(valid_story)
    
    def test_is_content_safe_with_safe_content(self, processor):
        """测试安全内容检查（应该通过）"""
        safe_story = "从前有一只可爱的小兔子，它在花园里快乐地玩耍。"
        assert processor._is_content_safe(safe_story) is True
    
    def test_is_content_safe_with_unsafe_keywords(self, processor):
        """测试包含不安全关键词的内容（应该不通过）"""
        unsafe_stories = [
            "小兔子遇到了暴力的狼。",
            "森林里有可怕的怪物。",
            "小兔子看到了血。",
            "战争开始了。"
        ]
        
        for story in unsafe_stories:
            assert processor._is_content_safe(story) is False
    
    @patch('requests.post')
    def test_call_llm_api_success(self, mock_post, processor):
        """测试成功调用 LLM API"""
        # 模拟 API 响应
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'choices': [
                {
                    'message': {
                        'content': '从前有一只小兔子，它住在美丽的森林里。' * 10
                    }
                }
            ]
        }
        mock_post.return_value = mock_response
        
        # 调用 API
        result = processor._call_llm_api("测试提示词")
        
        # 验证结果
        assert '从前有一只小兔子' in result
        assert mock_post.called
        
        # 验证请求参数
        call_args = mock_post.call_args
        assert call_args[0][0] == processor.api_url
        assert call_args[1]['json']['model'] == 'deepseek-chat'
        assert call_args[1]['json']['max_tokens'] == 500
        assert call_args[1]['json']['temperature'] == 0.8
    
    @patch('requests.post')
    def test_call_llm_api_timeout(self, mock_post, processor):
        """测试 API 调用超时"""
        import requests
        mock_post.side_effect = requests.exceptions.Timeout()
        
        with pytest.raises(RuntimeError, match="API 请求超时"):
            processor._call_llm_api("测试提示词")
    
    @patch('requests.post')
    def test_call_llm_api_request_error(self, mock_post, processor):
        """测试 API 请求错误"""
        import requests
        mock_post.side_effect = requests.exceptions.RequestException("网络错误")
        
        with pytest.raises(RuntimeError, match="API 请求失败"):
            processor._call_llm_api("测试提示词")
    
    @patch('requests.post')
    def test_call_llm_api_invalid_response(self, mock_post, processor):
        """测试 API 返回无效响应"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'error': 'Invalid request'}
        mock_post.return_value = mock_response
        
        with pytest.raises(RuntimeError, match="API 响应格式错误"):
            processor._call_llm_api("测试提示词")
    
    @patch.object(LLMProcessor, '_call_llm_api')
    @patch.object(LLMProcessor, '_is_content_safe')
    def test_generate_story_success(self, mock_safe, mock_api, processor):
        """测试成功生成故事"""
        # 模拟 API 返回合适长度的故事
        valid_story = "从前有一只可爱的小兔子，它住在美丽的森林里。每天早上，小兔子都会在花园里玩耍，和蝴蝶们一起跳舞。" * 3
        mock_api.return_value = valid_story
        mock_safe.return_value = True
        
        # 生成故事
        result = processor.generate_story("一只小兔子在花园里")
        
        # 验证结果
        assert result == valid_story
        assert mock_api.called
        assert mock_safe.called
    
    @patch.object(LLMProcessor, '_call_llm_api')
    @patch.object(LLMProcessor, '_is_content_safe')
    def test_generate_story_unsafe_content_retry(self, mock_safe, mock_api, processor):
        """测试生成不安全内容时重试"""
        valid_story = "从前有一只可爱的小兔子，它住在美丽的森林里。每天早上，小兔子都会在花园里玩耍，和蝴蝶们一起跳舞。" * 3
        mock_api.return_value = valid_story
        
        # 第一次返回不安全，第二次返回安全
        mock_safe.side_effect = [False, True]
        
        # 生成故事
        result = processor.generate_story("一只小兔子在花园里")
        
        # 验证调用了两次
        assert mock_api.call_count == 2
        assert mock_safe.call_count == 2
    
    @patch.object(LLMProcessor, '_call_llm_api')
    def test_generate_story_api_failure_retry(self, mock_api, processor):
        """测试 API 失败时重试"""
        # 前两次失败，第三次成功
        valid_story = "从前有一只可爱的小兔子，它住在美丽的森林里。每天早上，小兔子都会在花园里玩耍，和蝴蝶们一起跳舞。" * 3
        mock_api.side_effect = [
            RuntimeError("API 错误"),
            RuntimeError("API 错误"),
            valid_story
        ]
        
        # 生成故事
        result = processor.generate_story("一只小兔子在花园里", retry_count=3)
        
        # 验证调用了三次
        assert mock_api.call_count == 3
        assert result == valid_story
    
    @patch.object(LLMProcessor, '_call_llm_api')
    def test_generate_story_max_retries_exceeded(self, mock_api, processor):
        """测试超过最大重试次数"""
        mock_api.side_effect = RuntimeError("API 错误")
        
        # 应该抛出异常
        with pytest.raises(RuntimeError, match="故事生成失败，已重试"):
            processor.generate_story("一只小兔子在花园里", retry_count=2)
        
        # 验证调用了指定次数
        assert mock_api.call_count == 2
    
    def test_generate_story_with_custom_prompt(self, processor):
        """测试使用自定义提示词生成故事"""
        with patch.object(processor, '_call_llm_api') as mock_api:
            valid_story = "从前有一只可爱的小兔子。" * 20
            mock_api.return_value = valid_story
            
            custom_prompt = "创作一个关于小兔子的故事"
            result = processor.generate_story(
                image_description="",
                custom_prompt=custom_prompt
            )
            
            # 验证使用了自定义提示词
            call_args = mock_api.call_args[0][0]
            assert call_args == custom_prompt
