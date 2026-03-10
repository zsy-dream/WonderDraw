"""
SVDProcessor 单元测试

测试 Stable Video Diffusion 视频生成处理器的核心功能
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

from backend.models.svd_processor import SVDProcessor


class TestSVDProcessor:
    """SVDProcessor 单元测试类"""
    
    @pytest.fixture
    def mock_models(self):
        """模拟 AI 模型加载"""
        with patch('backend.models.svd_processor.StableVideoDiffusionPipeline') as mock_pipeline, \
             patch('backend.models.svd_processor.load_image') as mock_load_image, \
             patch('backend.models.svd_processor.export_to_video') as mock_export:
            
            # 模拟 Pipeline
            mock_pipeline_instance = MagicMock()
            mock_pipeline_instance.to.return_value = mock_pipeline_instance
            mock_pipeline_instance.enable_attention_slicing.return_value = None
            mock_pipeline_instance.enable_model_cpu_offload.return_value = None
            mock_pipeline.from_pretrained.return_value = mock_pipeline_instance
            
            # 模拟 load_image - 返回真实的 PIL Image
            def load_image_side_effect(path):
                return Image.open(path)
            mock_load_image.side_effect = load_image_side_effect
            
            # 模拟 export_to_video
            def export_side_effect(frames, path, fps):
                # 创建一个空的视频文件
                os.makedirs(os.path.dirname(path), exist_ok=True)
                with open(path, 'wb') as f:
                    f.write(b'fake video data')
            mock_export.side_effect = export_side_effect
            
            yield {
                'pipeline': mock_pipeline,
                'pipeline_instance': mock_pipeline_instance,
                'load_image': mock_load_image,
                'export_to_video': mock_export
            }
    
    @pytest.fixture
    def processor(self, mock_models):
        """创建 SVDProcessor 实例"""
        processor = SVDProcessor(
            model_id='test-svd-model',
            device='cpu'
        )
        return processor
    
    @pytest.fixture
    def test_image(self):
        """创建测试图像"""
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            img = Image.new('RGB', (512, 512), color='blue')
            img.save(f.name)
            temp_path = f.name
        yield temp_path
        try:
            os.unlink(temp_path)
        except (PermissionError, FileNotFoundError):
            pass
    
    def test_initialization(self, mock_models):
        """测试处理器初始化 (需求 4.2, 16.4)"""
        processor = SVDProcessor(
            model_id='test-svd-model',
            device='cpu'
        )
        
        assert processor.model_id == 'test-svd-model'
        assert processor.device == 'cpu'
        assert processor.pipeline is not None
        assert processor.fps == SVDProcessor.DEFAULT_FPS
        assert processor.num_frames == SVDProcessor.DEFAULT_MIN_FRAMES
    
    def test_auto_device_detection(self):
        """测试自动设备检测"""
        with patch('backend.models.svd_processor.StableVideoDiffusionPipeline'), \
             patch('backend.models.svd_processor.torch') as mock_torch:
            
            # Test CPU detection
            mock_torch.cuda.is_available.return_value = False
            processor = SVDProcessor(model_id='test-model')
            assert processor.device == 'cpu'
            
            # Test CUDA detection
            mock_torch.cuda.is_available.return_value = True
            processor = SVDProcessor(model_id='test-model')
            assert processor.device == 'cuda'
    
    def test_configure_parameters_fps(self, processor):
        """测试 FPS 配置 (需求 19.3)"""
        processor.configure_parameters(fps=24)
        assert processor.fps == 24
        
        processor.configure_parameters(fps=30)
        assert processor.fps == 30
    
    def test_configure_parameters_duration(self, processor):
        """测试时长配置 (需求 4.3, 19.2)"""
        # 测试 2 秒
        processor.configure_parameters(duration=2)
        assert processor.duration == 2
        assert processor.num_frames == 24 * 2  # 48 帧
        
        # 测试 4 秒
        processor.configure_parameters(duration=4)
        assert processor.duration == 4
        assert processor.num_frames == 24 * 4  # 96 帧
    
    def test_configure_parameters_num_frames(self, processor):
        """测试帧数配置"""
        processor.configure_parameters(num_frames=60)
        assert processor.num_frames == 60
        assert processor.duration == 60 / 24  # 2.5 秒
    
    def test_configure_parameters_invalid_fps(self, processor):
        """测试无效 FPS"""
        with pytest.raises(ValueError, match="FPS 必须大于 0"):
            processor.configure_parameters(fps=0)
        
        with pytest.raises(ValueError, match="FPS 必须大于 0"):
            processor.configure_parameters(fps=-1)
    
    def test_configure_parameters_invalid_duration(self, processor):
        """测试无效时长 (需求 4.3)"""
        # 时长必须在 2-4 秒之间
        with pytest.raises(ValueError, match="视频时长必须在 2-4 秒之间"):
            processor.configure_parameters(duration=1)
        
        with pytest.raises(ValueError, match="视频时长必须在 2-4 秒之间"):
            processor.configure_parameters(duration=5)
    
    def test_configure_parameters_invalid_num_frames(self, processor):
        """测试无效帧数"""
        # 帧数必须在 48-96 之间
        with pytest.raises(ValueError, match="帧数必须在"):
            processor.configure_parameters(num_frames=30)
        
        with pytest.raises(ValueError, match="帧数必须在"):
            processor.configure_parameters(num_frames=100)
    
    def test_preprocess_image_rgb_conversion(self, processor):
        """测试图像 RGB 转换"""
        # 创建 RGBA 图像
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            img = Image.new('RGBA', (512, 512), color=(0, 0, 255, 128))
            img.save(f.name)
            rgba_path = f.name
        
        try:
            processed = processor._preprocess_image(rgba_path)
            assert processed.mode == 'RGB'
        finally:
            os.unlink(rgba_path)
    
    def test_preprocess_image_resize(self, processor):
        """测试图像尺寸调整"""
        # 创建大尺寸图像
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            img = Image.new('RGB', (2048, 1536), color='green')
            img.save(f.name)
            large_image_path = f.name
        
        try:
            processed = processor._preprocess_image(large_image_path)
            
            # 验证尺寸被调整
            assert processed.size[0] <= 1024
            assert processed.size[1] <= 576
            
            # 验证尺寸是 8 的倍数
            assert processed.size[0] % 8 == 0
            assert processed.size[1] % 8 == 0
        finally:
            os.unlink(large_image_path)
    
    def test_preprocess_image_aspect_ratio(self, processor):
        """测试保持宽高比"""
        # 创建 16:9 宽高比图像
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            img = Image.new('RGB', (1920, 1080), color='red')
            img.save(f.name)
            wide_image_path = f.name
        
        try:
            processed = processor._preprocess_image(wide_image_path)
            
            # 计算原始和处理后的宽高比
            original_ratio = 1920 / 1080
            processed_ratio = processed.size[0] / processed.size[1]
            
            # 宽高比应该接近（允许小误差）
            assert abs(original_ratio - processed_ratio) < 0.1
        finally:
            os.unlink(wide_image_path)
    
    def test_generate_video_basic(self, processor, test_image, mock_models):
        """测试基本视频生成 (需求 4.2, 4.3, 19.1, 19.2)"""
        with tempfile.TemporaryDirectory() as tmpdir:
            output_path = os.path.join(tmpdir, 'output.mp4')
            
            # 模拟生成结果
            mock_output = MagicMock()
            mock_output.frames = [[Image.new('RGB', (512, 512), color='yellow') for _ in range(48)]]
            mock_models['pipeline_instance'].return_value = mock_output
            
            # 配置参数
            processor.configure_parameters(fps=24, duration=2)
            
            # 生成视频
            with patch.object(processor, '_compress_video', return_value=output_path):
                result = processor.generate_video(test_image, output_path)
            
            # 验证调用参数
            call_args = mock_models['pipeline_instance'].call_args
            assert call_args[1]['image'] is not None
            assert call_args[1]['num_frames'] == 48  # 2 秒 @ 24 FPS
            
            # 验证导出参数
            export_call_args = mock_models['export_to_video'].call_args
            assert export_call_args[1]['fps'] == 24
            
            # 验证输出文件
            assert result == output_path
    
    def test_generate_video_creates_output_directory(self, processor, test_image, mock_models):
        """测试自动创建输出目录"""
        with tempfile.TemporaryDirectory() as tmpdir:
            # 使用不存在的子目录
            output_path = os.path.join(tmpdir, 'subdir', 'nested', 'output.mp4')
            
            # 模拟生成结果
            mock_output = MagicMock()
            mock_output.frames = [[Image.new('RGB', (512, 512), color='cyan') for _ in range(48)]]
            mock_models['pipeline_instance'].return_value = mock_output
            
            with patch.object(processor, '_compress_video', return_value=output_path):
                result = processor.generate_video(test_image, output_path)
            
            # 验证目录被创建
            assert os.path.exists(os.path.dirname(output_path))
    
    def test_generate_video_without_loaded_model(self, processor):
        """测试未加载模型时的错误处理 (需求 4.5)"""
        processor.pipeline = None
        
        with pytest.raises(RuntimeError, match="模型未加载"):
            processor.generate_video('dummy.png', 'output.mp4')
    
    def test_generate_video_custom_parameters(self, processor, test_image, mock_models):
        """测试自定义参数"""
        with tempfile.TemporaryDirectory() as tmpdir:
            output_path = os.path.join(tmpdir, 'output.mp4')
            
            # 模拟生成结果
            mock_output = MagicMock()
            mock_output.frames = [[Image.new('RGB', (512, 512), color='purple') for _ in range(48)]]
            mock_models['pipeline_instance'].return_value = mock_output
            
            with patch.object(processor, '_compress_video', return_value=output_path):
                result = processor.generate_video(
                    test_image,
                    output_path,
                    num_inference_steps=30,
                    motion_bucket_id=150,
                    noise_aug_strength=0.05
                )
            
            # 验证调用参数
            call_args = mock_models['pipeline_instance'].call_args
            assert call_args[1]['num_inference_steps'] == 30
            assert call_args[1]['motion_bucket_id'] == 150
            assert call_args[1]['noise_aug_strength'] == 0.05
    
    def test_compress_video_ffmpeg_not_available(self, processor):
        """测试 ffmpeg 不可用时的处理 (需求 19.5)"""
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f:
            f.write(b'fake video data')
            video_path = f.name
        
        try:
            with patch('subprocess.run', side_effect=FileNotFoundError):
                result = processor._compress_video(video_path)
                # 应该返回原始路径
                assert result == video_path
        finally:
            os.unlink(video_path)
    
    def test_compress_video_success(self, processor):
        """测试视频压缩成功 (需求 19.5)"""
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f:
            # 创建一个较大的假视频文件
            f.write(b'fake video data' * 1000)
            video_path = f.name
        
        try:
            # 模拟 ffmpeg 成功压缩
            with patch('subprocess.run') as mock_run:
                mock_run.return_value = MagicMock(returncode=0, stderr=b'')
                
                # 模拟压缩后的文件
                def create_compressed_file(*args, **kwargs):
                    compressed_path = video_path.replace('.mp4', '_compressed.mp4')
                    with open(compressed_path, 'wb') as cf:
                        cf.write(b'compressed data')
                    return MagicMock(returncode=0, stderr=b'')
                
                mock_run.side_effect = create_compressed_file
                
                result = processor._compress_video(video_path)
                
                # 验证 ffmpeg 被调用
                assert mock_run.called
        finally:
            try:
                os.unlink(video_path)
            except FileNotFoundError:
                pass
    
    def test_compress_video_timeout(self, processor):
        """测试压缩超时处理"""
        import subprocess
        
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f:
            f.write(b'fake video data')
            video_path = f.name
        
        try:
            with patch('subprocess.run', side_effect=subprocess.TimeoutExpired('ffmpeg', 300)):
                result = processor._compress_video(video_path)
                # 应该返回原始路径
                assert result == video_path
        finally:
            os.unlink(video_path)
    
    def test_unload_model(self, processor, mock_models):
        """测试模型卸载"""
        assert processor.pipeline is not None
        
        with patch('torch.cuda.is_available', return_value=False):
            processor.unload_model()
        
        assert processor.pipeline is None
    
    def test_model_loading_error(self, mock_models):
        """测试模型加载失败处理 (需求 4.5)"""
        mock_models['pipeline'].from_pretrained.side_effect = Exception("模型加载失败")
        
        with pytest.raises(Exception, match="模型加载失败"):
            SVDProcessor(
                model_id='test-model',
                device='cpu'
            )
    
    def test_image_preprocessing_error(self, processor):
        """测试图像预处理错误处理"""
        with pytest.raises(Exception):
            processor._preprocess_image('nonexistent_file.png')
    
    def test_generate_video_error_handling(self, processor, mock_models):
        """测试视频生成错误处理 (需求 4.5)"""
        # 模拟处理失败
        mock_models['pipeline_instance'].side_effect = Exception("生成失败")
        
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            img = Image.new('RGB', (512, 512), color='red')
            img.save(f.name)
            test_image_path = f.name
        
        try:
            with pytest.raises(Exception):
                processor.generate_video(test_image_path, 'output.mp4')
        finally:
            try:
                os.unlink(test_image_path)
            except (PermissionError, FileNotFoundError):
                pass
    
    def test_default_configuration(self, processor):
        """测试默认配置 (需求 19.3)"""
        # 验证默认值
        assert processor.fps == 24
        assert processor.num_frames == 48  # 2 秒 @ 24 FPS
        assert processor.duration == 2
    
    def test_video_duration_range(self, processor):
        """测试视频时长范围 (需求 4.3, 19.2)"""
        # 测试 2 秒（最小值）
        processor.configure_parameters(duration=2)
        assert processor.duration == 2
        
        # 测试 3 秒（中间值）
        processor.configure_parameters(duration=3)
        assert processor.duration == 3
        
        # 测试 4 秒（最大值）
        processor.configure_parameters(duration=4)
        assert processor.duration == 4
