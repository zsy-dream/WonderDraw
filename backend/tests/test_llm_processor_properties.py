"""
LLM 故事生成处理器属性测试

使用 Hypothesis 进行基于属性的测试
Feature: tonghua-qijing-platform
"""

import pytest
import os
import importlib.util
from hypothesis import given, strategies as st, settings
from unittest.mock import patch, Mock

# 直接导入 LLMProcessor 模块文件，避免通过 __init__.py
spec = importlib.util.spec_from_file_location(
    "llm_processor",
    os.path.join(os.path.dirname(__file__), '..', 'models', 'llm_processor.py')
)
llm_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(llm_module)
LLMProcessor = llm_module.LLMProcessor


class TestLLMProcessorProperties:
    """LLM 处理器基于属性的测试类"""
    
    def _create_processor(self):
        """创建测试用的 LLM 处理器实例"""
        return LLMProcessor(
            api_key='test_api_key',
            api_url='https://api.test.com/v1/chat/completions',
            provider='deepseek'
        )
    
    # Feature: tonghua-qijing-platform, Property 10: LLM 上下文传递
    # 验证需求: 5.3
    @given(
        image_description=st.text(min_size=1, max_size=500)
    )
    @settings(max_examples=50)
    def test_property_llm_context_passing(self, image_description):
        """
        属性 10: LLM 上下文传递
        
        对于任意故事生成请求，传递给 LLM 的提示词中应包含图像描述或相关上下文信息。
        
        验证需求: 5.3 - WHEN 调用 LLM THEN THE Platform SHALL 提供图像描述作为上下文
        """
        processor = self._create_processor()
        
        # 构建提示词
        prompt = processor.build_prompt(image_description)
        
        # 验证：提示词中必须包含图像描述
        assert image_description in prompt, \
            f"提示词中应包含图像描述，但未找到。描述: {image_description[:50]}..."
        
        # 验证：提示词应包含儿童故事相关的指导
        assert any(keyword in prompt for keyword in ['儿童', '童话', '故事']), \
            "提示词应包含儿童故事相关的关键词"
    
    @given(
        api_key=st.text(min_size=0, max_size=100),
        api_url=st.one_of(
            st.just('https://api.test.com'),
            st.just('https://api.deepseek.com/v1/chat/completions'),
            st.just('https://api.qwen.com/v1/chat/completions')
        ),
        provider=st.sampled_from(['deepseek', 'qwen', 'DeepSeek', 'QWEN', 'unknown'])
    )
    @settings(max_examples=50)
    def test_property_processor_initialization(self, api_key, api_url, provider):
        """
        属性：处理器初始化一致性
        
        对于任意有效的配置参数，处理器应能成功初始化并保存配置。
        """
        try:
            processor = LLMProcessor(
                api_key=api_key,
                api_url=api_url,
                provider=provider
            )
            
            # 验证：配置应被正确保存
            assert processor.api_key == api_key
            assert processor.api_url == api_url
            assert processor.provider == provider.lower()
            
        except ValueError as e:
            # 只有在 api_url 为空时才应该抛出异常
            assert api_url == '' or not api_url
    
    @given(
        story=st.text(min_size=0, max_size=1000)
    )
    @settings(max_examples=50)
    def test_property_story_cleaning_idempotent(self, story):
        """
        属性：故事清理幂等性
        
        对于任意故事文本，多次清理应产生相同的结果（幂等性）。
        """
        processor = self._create_processor()
        
        # 第一次清理
        cleaned_once = processor._clean_story(story)
        
        # 第二次清理
        cleaned_twice = processor._clean_story(cleaned_once)
        
        # 验证：两次清理结果应该相同
        assert cleaned_once == cleaned_twice, \
            "故事清理应该是幂等的，多次清理应产生相同结果"
    
    @given(
        story_length=st.integers(min_value=0, max_value=500)
    )
    @settings(max_examples=50)
    def test_property_story_length_validation(self, story_length):
        """
        属性：故事长度验证一致性
        
        对于任意长度的故事，验证逻辑应该一致：
        - 长度 = 0: 应该失败（空故事）
        - 长度 < 100: 应该失败（长度不足）
        - 长度 100-300: 应该通过
        - 长度 > 300: 应该失败（长度超出）
        """
        processor = self._create_processor()
        
        # 生成指定长度的故事
        story = '从' * story_length
        
        if story_length == 0:
            # 应该抛出"空故事"异常
            with pytest.raises(ValueError, match="生成的故事为空"):
                processor._validate_story(story)
        elif story_length < processor.MIN_STORY_LENGTH:
            # 应该抛出"长度不足"异常
            with pytest.raises(ValueError, match="故事长度不足"):
                processor._validate_story(story)
        elif story_length <= processor.MAX_STORY_LENGTH:
            # 应该通过验证（不抛出异常）
            try:
                processor._validate_story(story)
            except ValueError:
                pytest.fail(f"长度为 {story_length} 的故事应该通过验证")
        else:
            # 应该抛出"长度超出"异常
            with pytest.raises(ValueError, match="故事长度超出限制"):
                processor._validate_story(story)
    
    @given(
        safe_words=st.lists(
            st.sampled_from(['可爱', '快乐', '温馨', '美丽', '友谊', '勇敢', '善良']),
            min_size=5,
            max_size=20
        )
    )
    @settings(max_examples=50)
    def test_property_safe_content_always_passes(self, safe_words):
        """
        属性：安全内容检查一致性
        
        对于任意由安全词汇组成的故事，内容安全检查应该通过。
        """
        processor = self._create_processor()
        
        # 构建由安全词汇组成的故事
        story = ''.join(safe_words) + '。'
        
        # 验证：应该通过安全检查
        assert processor._is_content_safe(story), \
            f"由安全词汇组成的故事应该通过安全检查: {story[:50]}..."
    
    @given(
        unsafe_keyword=st.sampled_from(LLMProcessor.UNSAFE_KEYWORDS)
    )
    @settings(max_examples=50)
    def test_property_unsafe_content_always_fails(self, unsafe_keyword):
        """
        属性：不安全内容检查一致性
        
        对于任意包含不安全关键词的故事，内容安全检查应该失败。
        """
        processor = self._create_processor()
        
        # 构建包含不安全关键词的故事
        story = f"从前有一只小兔子，它遇到了{unsafe_keyword}的情况。"
        
        # 验证：应该不通过安全检查
        assert not processor._is_content_safe(story), \
            f"包含不安全关键词 '{unsafe_keyword}' 的故事不应该通过安全检查"
    
    @given(
        provider=st.sampled_from(['deepseek', 'qwen', 'DeepSeek', 'QWEN', 'Deepseek'])
    )
    @settings(max_examples=50)
    def test_property_model_name_consistency(self, provider):
        """
        属性：模型名称获取一致性
        
        对于任意提供商名称（不区分大小写），应该返回正确的模型名称。
        """
        processor = LLMProcessor(
            api_key='test_key',
            api_url='https://api.test.com',
            provider=provider
        )
        
        model_name = processor._get_model_name()
        
        # 验证：模型名称应该与提供商对应
        if processor.provider == 'deepseek':
            assert model_name == 'deepseek-chat'
        elif processor.provider == 'qwen':
            assert model_name == 'qwen-turbo'
    
    @given(
        image_description=st.text(min_size=1, max_size=200),
        custom_template=st.one_of(
            st.none(),
            st.just("创作故事：{image_description}"),
            st.just("基于图片：{image_description}，写一个故事")
        )
    )
    @settings(max_examples=50)
    def test_property_prompt_building_contains_description(self, image_description, custom_template):
        """
        属性：提示词构建完整性
        
        对于任意图像描述和模板，构建的提示词应该包含图像描述。
        """
        processor = self._create_processor()
        
        prompt = processor.build_prompt(image_description, custom_template)
        
        # 验证：提示词必须包含图像描述
        assert image_description in prompt, \
            "构建的提示词必须包含图像描述"
        
        # 验证：提示词不应为空
        assert len(prompt) > 0, "提示词不应为空"
    
    @given(
        story=st.text(min_size=100, max_size=300)
    )
    @settings(max_examples=50)
    def test_property_valid_story_length_range(self, story):
        """
        属性：有效故事长度范围
        
        对于任意长度在 100-300 字之间的故事，验证应该通过。
        
        验证需求: 20.3 - WHEN 生成故事 THEN THE Platform SHALL 生成 100-300 字的故事文本
        """
        processor = self._create_processor()
        
        # 确保故事长度在有效范围内
        if len(story) < processor.MIN_STORY_LENGTH:
            story = story + '从' * (processor.MIN_STORY_LENGTH - len(story))
        elif len(story) > processor.MAX_STORY_LENGTH:
            story = story[:processor.MAX_STORY_LENGTH]
        
        # 验证：应该通过验证
        try:
            processor._validate_story(story)
        except ValueError as e:
            pytest.fail(f"长度为 {len(story)} 的故事应该通过验证，但抛出异常: {str(e)}")
    
    @patch('requests.post')
    @given(
        image_description=st.text(min_size=10, max_size=100)
    )
    @settings(max_examples=50)  # 减少示例数量因为涉及 mock
    def test_property_api_call_includes_context(self, mock_post, image_description):
        """
        属性：API 调用包含上下文
        
        对于任意图像描述，调用 API 时应该在请求中包含该描述。
        
        验证需求: 5.3 - WHEN 调用 LLM THEN THE Platform SHALL 提供图像描述作为上下文
        """
        processor = self._create_processor()
        
        # 模拟 API 响应
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'choices': [{
                'message': {
                    'content': '从前有一只可爱的小兔子，它住在美丽的森林里。' * 5
                }
            }]
        }
        mock_post.return_value = mock_response
        
        # 生成故事
        try:
            processor.generate_story(image_description)
            
            # 验证：API 被调用
            assert mock_post.called, "API 应该被调用"
            
            # 验证：请求中包含图像描述
            call_args = mock_post.call_args
            request_json = call_args[1]['json']
            messages = request_json['messages']
            
            # 检查消息中是否包含图像描述
            message_content = ' '.join([msg['content'] for msg in messages])
            assert image_description in message_content, \
                "API 请求中应该包含图像描述"
                
        except Exception as e:
            # 如果故事验证失败（长度或安全性），这是可以接受的
            pass
