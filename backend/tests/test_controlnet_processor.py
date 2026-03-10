"""
ControlNetProcessor 单元测试

测试 ControlNet 图像处理器的核心功能
"""

import pytest
import os
import sys
import tempfile
from unittest.mock import Mock, patch, MagicMock
from PIL import Image

# Mock torch and diffusers modules if not available
if 'torch' not in sys.modules:
    sys.modules['torch'] = MagicMock()
    sys.modules['torch.cuda'] = MagicMock()
if 'diffusers' not in sys.modules:
    sys.modules['diffusers'] = MagicMock()
    sys.modules['diffusers.utils'] = MagicMock()

from backend.models.controlnet_processor import ControlNetProcessor


class TestControlNetProcessor:
    """ControlNetProcessor 单元测试类"""
    
    @pytest.fixture
    def mock_models(self):
        """模拟 AI 模型加载"""
        with patch('backend.models.controlnet_processor.ControlNetModel') as mock_controlnet, \
             patch('backend.models.controlnet_processor.StableDiffusionControlNetPipeline') as mock_pipeline, \
             patch('backend.models.controlnet_processor.load_image') as mock_load_image:
            
            # 模拟 ControlNet 模型
            mock_controlnet_instance = MagicMock()
            mock_controlnet.from_pretrained.return_value = mock_controlnet_instance
            
            # 模拟 Pipeline
            mock_pipeline_instance = MagicMock()
            mock_pipeline_instance.to.return_value = mock_pipeline_instance
            mock_pipeline_instance.enable_attention_slicing.return_value = None
            mock_pipeline.from_pretrained.return_value = mock_pipeline_instance
            
            # 模拟 load_image - 返回真实的 PIL Image
            def load_image_side_effect(path):
                return Image.open(path)
            mock_load_image.side_effect = load_image_side_effect
            
            yield {
                'controlnet': mock_controlnet,
                'pipeline': mock_pipeline,
                'controlnet_instance': mock_controlnet_instance,
                'pipeline_instance': mock_pipeline_instance,
                'load_image': mock_load_image
            }
    
    @pytest.fixture
    def processor(self, mock_models):
        """创建 ControlNetProcessor 实例"""
        processor = ControlNetProcessor(
            model_id='test-model',
            controlnet_id='test-controlnet',
            device='cpu'
        )
        return processor
    
    @pytest.fixture
    def test_image(self):
        """创建测试图像"""
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            img = Image.new('RGB', (256, 256), color='red')
            img.save(f.name)
            temp_path = f.name
        yield temp_path
        try:
            os.unlink(temp_path)
        except (PermissionError, FileNotFoundError):
            pass  # File may already be deleted or in use
    
    def test_initialization(self, mock_models):
        """测试处理器初始化"""
        processor = ControlNetProcessor(
            model_id='test-model',
            controlnet_id='test-controlnet',
            device='cpu'
        )
        
        assert processor.model_id == 'test-model'
        assert processor.controlnet_id == 'test-controlnet'
        assert processor.device == 'cpu'
        assert processor.controlnet is not None
        assert processor.pipeline is not None
    
    def test_auto_device_detection(self):
        """测试自动设备检测"""
        with patch('backend.models.controlnet_processor.ControlNetModel'), \
             patch('backend.models.controlnet_processor.StableDiffusionControlNetPipeline'), \
             patch('backend.models.controlnet_processor.torch') as mock_torch:
            
            # Test CPU detection
            mock_torch.cuda.is_available.return_value = False
            processor = ControlNetProcessor(
                model_id='test-model',
                controlnet_id='test-controlnet'
            )
            assert processor.device == 'cpu'
            
            # Test CUDA detection
            mock_torch.cuda.is_available.return_value = True
            processor = ControlNetProcessor(
                model_id='test-model',
                controlnet_id='test-controlnet'
            )
            assert processor.device == 'cuda'
    
    def test_preprocess_image_rgb_conversion(self, processor, test_image):
        """测试图像 RGB 转换"""
        # 创建 RGBA 图像
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            img = Image.new('RGBA', (256, 256), color=(255, 0, 0, 128))
            img.save(f.name)
            rgba_path = f.name
        
        try:
            processed = processor.preprocess_image(rgba_path)
            assert processed.mode == 'RGB'
        finally:
            os.unlink(rgba_path)
    
    def test_preprocess_image_resize(self, processor):
        """测试图像尺寸调整"""
        # 创建大尺寸图像
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            img = Image.new('RGB', (1024, 768), color='blue')
            img.save(f.name)
            large_image_path = f.name
        
        try:
            processed = processor.preprocess_image(large_image_path)
            
            # 验证尺寸被调整
            assert processed.size[0] <= 512
            assert processed.size[1] <= 512
            
            # 验证尺寸是 8 的倍数
            assert processed.size[0] % 8 == 0
            assert processed.size[1] % 8 == 0
        finally:
            os.unlink(large_image_path)
    
    def test_preprocess_image_aspect_ratio(self, processor):
        """测试保持宽高比 (需求 18.4)"""
        # 创建 16:9 宽高比图像
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            img = Image.new('RGB', (1600, 900), color='green')
            img.save(f.name)
            wide_image_path = f.name
        
        try:
            processed = processor.preprocess_image(wide_image_path)
            
            # 计算原始和处理后的宽高比
            original_ratio = 1600 / 900
            processed_ratio = processed.size[0] / processed.size[1]
            
            # 宽高比应该接近（允许小误差）
            assert abs(original_ratio - processed_ratio) < 0.1
        finally:
            os.unlink(wide_image_path)
    
    def test_process_with_default_prompts(self, processor, test_image, mock_models):
        """测试使用默认提示词处理图像 (需求 18.3)"""
        with tempfile.TemporaryDirectory() as tmpdir:
            output_path = os.path.join(tmpdir, 'output.png')
            
            # 模拟生成结果
            mock_output = MagicMock()
            mock_output.images = [Image.new('RGB', (512, 512), color='yellow')]
            mock_models['pipeline_instance'].return_value = mock_output
            
            result = processor.process(test_image, output_path)
            
            # 验证调用参数
            call_args = mock_models['pipeline_instance'].call_args
            assert call_args[1]['prompt'] == ControlNetProcessor.DEFAULT_PROMPT
            assert call_args[1]['negative_prompt'] == ControlNetProcessor.DEFAULT_NEGATIVE_PROMPT
            
            # 验证输出文件
            assert result == output_path
            assert os.path.exists(output_path)
    
    def test_process_with_custom_prompts(self, processor, test_image, mock_models):
        """测试使用自定义提示词"""
        with tempfile.TemporaryDirectory() as tmpdir:
            output_path = os.path.join(tmpdir, 'output.png')
            
            # 模拟生成结果
            mock_output = MagicMock()
            mock_output.images = [Image.new('RGB', (512, 512), color='purple')]
            mock_models['pipeline_instance'].return_value = mock_output
            
            custom_prompt = "custom prompt"
            custom_negative = "custom negative"
            
            result = processor.process(
                test_image,
                output_path,
                prompt=custom_prompt,
                negative_prompt=custom_negative
            )
            
            # 验证调用参数
            call_args = mock_models['pipeline_instance'].call_args
            assert call_args[1]['prompt'] == custom_prompt
            assert call_args[1]['negative_prompt'] == custom_negative
    
    def test_process_creates_output_directory(self, processor, test_image, mock_models):
        """测试自动创建输出目录 (需求 3.6)"""
        with tempfile.TemporaryDirectory() as tmpdir:
            # 使用不存在的子目录
            output_path = os.path.join(tmpdir, 'subdir', 'nested', 'output.png')
            
            # 模拟生成结果
            mock_output = MagicMock()
            mock_output.images = [Image.new('RGB', (512, 512), color='cyan')]
            mock_models['pipeline_instance'].return_value = mock_output
            
            result = processor.process(test_image, output_path)
            
            # 验证目录被创建
            assert os.path.exists(os.path.dirname(output_path))
            assert os.path.exists(output_path)
    
    def test_process_saves_high_quality_image(self, processor, test_image, mock_models):
        """测试保存高质量图像 (需求 18.5)"""
        with tempfile.TemporaryDirectory() as tmpdir:
            output_path = os.path.join(tmpdir, 'output.png')
            
            # 模拟生成结果
            mock_image = MagicMock(spec=Image.Image)
            mock_output = MagicMock()
            mock_output.images = [mock_image]
            mock_models['pipeline_instance'].return_value = mock_output
            
            processor.process(test_image, output_path)
            
            # 验证保存参数
            mock_image.save.assert_called_once()
            call_args = mock_image.save.call_args
            assert call_args[0][0] == output_path
            assert call_args[1]['quality'] == 95
            assert call_args[1]['optimize'] is True
    
    def test_process_without_loaded_models(self, processor):
        """测试未加载模型时的错误处理"""
        processor.pipeline = None
        
        with pytest.raises(RuntimeError, match="模型未加载"):
            processor.process('dummy.png', 'output.png')
    
    def test_unload_models(self, processor, mock_models):
        """测试模型卸载"""
        assert processor.pipeline is not None
        assert processor.controlnet is not None
        
        with patch('torch.cuda.is_available', return_value=False):
            processor.unload_models()
        
        assert processor.pipeline is None
        assert processor.controlnet is None
    
    def test_model_loading_error(self, mock_models):
        """测试模型加载失败处理 (需求 3.5)"""
        mock_models['controlnet'].from_pretrained.side_effect = Exception("模型加载失败")
        
        with pytest.raises(Exception, match="模型加载失败"):
            ControlNetProcessor(
                model_id='test-model',
                controlnet_id='test-controlnet',
                device='cpu'
            )
    
    def test_image_preprocessing_error(self, processor):
        """测试图像预处理错误处理"""
        with pytest.raises(Exception):
            processor.preprocess_image('nonexistent_file.png')
    
    def test_process_error_handling(self, processor, mock_models):
        """测试处理过程错误处理"""
        # 模拟处理失败
        mock_models['pipeline_instance'].side_effect = Exception("处理失败")
        
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            img = Image.new('RGB', (256, 256), color='red')
            img.save(f.name)
            test_image_path = f.name
        
        try:
            with pytest.raises(Exception):
                processor.process(test_image_path, 'output.png')
        finally:
            try:
                os.unlink(test_image_path)
            except (PermissionError, FileNotFoundError):
                pass
