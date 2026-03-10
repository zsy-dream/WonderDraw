"""
文件上传属性测试

Feature: tonghua-qijing-platform
测试属性 3: 文件格式验证
"""
import os
import tempfile
from io import BytesIO
from hypothesis import given, strategies as st, settings
from hypothesis.strategies import composite
import pytest
from PIL import Image
from werkzeug.datastructures import FileStorage as WerkzeugFileStorage

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.artwork_service import ArtworkService


# 测试数据生成策略
@composite
def valid_image_format_strategy(draw):
    """生成有效的图片格式（JPG, PNG, WEBP）"""
    return draw(st.sampled_from(['jpg', 'jpeg', 'png', 'webp']))


@composite
def invalid_format_strategy(draw):
    """生成无效的文件格式"""
    # 常见的非图片格式
    invalid_formats = [
        'txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx',
        'gif', 'bmp', 'svg', 'tiff', 'ico',
        'mp4', 'avi', 'mov', 'mp3', 'wav',
        'zip', 'rar', '7z', 'tar', 'gz',
        'exe', 'dll', 'so', 'bin',
        'html', 'css', 'js', 'json', 'xml'
    ]
    return draw(st.sampled_from(invalid_formats))


@composite
def filename_with_format_strategy(draw, format_str):
    """生成带指定格式的文件名"""
    # 生成文件名主体（字母、数字、下划线、连字符）
    name_chars = st.text(
        alphabet=st.characters(
            whitelist_categories=('Lu', 'Ll', 'Nd'),
            whitelist_characters='-_'
        ),
        min_size=1,
        max_size=30
    ).filter(lambda x: x.strip() and not x.startswith('.'))
    
    name = draw(name_chars)
    return f"{name}.{format_str}"


@composite
def case_variant_strategy(draw, text):
    """生成文本的大小写变体"""
    # 生成各种大小写组合
    variants = [
        text.lower(),
        text.upper(),
        text.capitalize(),
    ]
    # 添加混合大小写（如果文本长度 > 1）
    if len(text) > 1:
        # 随机大小写混合
        mixed = ''.join(
            c.upper() if draw(st.booleans()) else c.lower()
            for c in text
        )
        variants.append(mixed)
    
    return draw(st.sampled_from(variants))


def create_mock_file(filename: str, content: bytes = b'fake content', content_type: str = 'application/octet-stream'):
    """创建模拟的 FileStorage 对象"""
    return WerkzeugFileStorage(
        stream=BytesIO(content),
        filename=filename,
        content_type=content_type
    )


def create_valid_image_file(filename: str, format: str = 'PNG'):
    """创建有效的图片文件"""
    # 创建一个小的测试图片
    img = Image.new('RGB', (100, 100), color='red')
    img_io = BytesIO()
    
    # 根据扩展名确定保存格式
    save_format = format.upper()
    if save_format in ['JPG', 'JPEG']:
        save_format = 'JPEG'
    
    img.save(img_io, format=save_format)
    img_io.seek(0)
    
    content_type_map = {
        'JPEG': 'image/jpeg',
        'PNG': 'image/png',
        'WEBP': 'image/webp'
    }
    
    return WerkzeugFileStorage(
        stream=img_io,
        filename=filename,
        content_type=content_type_map.get(save_format, 'image/png')
    )


class TestArtworkServiceProperties:
    """文件上传属性测试"""
    
    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """为每个测试创建和清理临时目录"""
        self.test_dir = tempfile.mkdtemp()
        self.storage_file = os.path.join(self.test_dir, 'artworks.json')
        self.image_dir = os.path.join(self.test_dir, 'images')
        
        # 初始化空的作品数据结构
        import json
        with open(self.storage_file, 'w', encoding='utf-8') as f:
            json.dump({"artworks": []}, f)
        
        self.service = ArtworkService(
            storage_path=self.storage_file,
            image_dir=self.image_dir
        )
        
        yield
        
        # 清理
        import shutil
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
    
    @settings(max_examples=100)
    @given(format=valid_image_format_strategy())
    def test_property_3_valid_format_acceptance(self, format):
        """
        **Validates: Requirements 2.2, 2.4**
        
        属性 3: 文件格式验证（有效格式）
        对于任意文件，如果文件扩展名是 JPG、PNG 或 WEBP（不区分大小写），则验证应通过。
        """
        # 生成带有有效格式的文件名
        filename = f"test_image.{format}"
        
        # 创建有效的图片文件
        file = create_valid_image_file(filename, format.upper() if format != 'jpeg' else 'JPEG')
        
        # 验证文件
        is_valid, error = self.service.validate_image(file)
        
        # 断言：有效格式应该通过验证
        assert is_valid is True, f"格式 {format} 应该被接受，但被拒绝了。错误: {error}"
        assert error is None, f"有效格式不应该有错误消息，但得到: {error}"
    
    @settings(max_examples=100)
    @given(
        format=valid_image_format_strategy(),
        filename_base=st.text(
            alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'), whitelist_characters='-_'),
            min_size=1,
            max_size=20
        ).filter(lambda x: x.strip() and not x.startswith('.'))
    )
    def test_property_3_case_insensitive_validation(self, format, filename_base):
        """
        **Validates: Requirements 2.2, 2.4**
        
        属性 3: 文件格式验证（大小写不敏感）
        验证文件格式检查不区分大小写（JPG, jpg, JpG 都应该通过）
        """
        # 生成各种大小写变体
        format_variants = [
            format.lower(),
            format.upper(),
            format.capitalize(),
        ]
        
        # 如果格式长度 > 1，添加混合大小写
        if len(format) > 1:
            # 例如：JpG, pNg, WeBp
            mixed = ''.join(
                c.upper() if i % 2 == 0 else c.lower()
                for i, c in enumerate(format)
            )
            format_variants.append(mixed)
        
        for variant in format_variants:
            filename = f"{filename_base}.{variant}"
            
            # 创建有效的图片文件
            save_format = format.upper() if format != 'jpeg' else 'JPEG'
            file = create_valid_image_file(filename, save_format)
            
            # 验证文件
            is_valid, error = self.service.validate_image(file)
            
            # 断言：所有大小写变体都应该通过
            assert is_valid is True, \
                f"格式 {variant} (原始: {format}) 应该被接受，但被拒绝了。错误: {error}"
            assert error is None, \
                f"有效格式 {variant} 不应该有错误消息，但得到: {error}"
    
    @settings(max_examples=100)
    @given(format=invalid_format_strategy())
    def test_property_3_invalid_format_rejection(self, format):
        """
        **Validates: Requirements 2.2, 2.4**
        
        属性 3: 文件格式验证（无效格式拒绝）
        对于任意文件，如果文件扩展名不是 JPG、PNG 或 WEBP，则验证应拒绝。
        """
        # 生成带有无效格式的文件名
        filename = f"test_file.{format}"
        
        # 创建模拟文件
        file = create_mock_file(filename)
        
        # 验证文件
        is_valid, error = self.service.validate_image(file)
        
        # 断言：无效格式应该被拒绝
        assert is_valid is False, \
            f"格式 {format} 应该被拒绝，但被接受了"
        assert error is not None, \
            f"无效格式 {format} 应该有错误消息"
        assert "不支持的文件格式" in error, \
            f"错误消息应该提到格式问题，但得到: {error}"
    
    @settings(max_examples=100)
    @given(
        format=valid_image_format_strategy(),
        has_extension=st.booleans()
    )
    def test_property_3_filename_with_or_without_extension(self, format, has_extension):
        """
        **Validates: Requirements 2.2, 2.4**
        
        属性 3: 文件格式验证（文件名边界情况）
        测试有无扩展名的文件名处理
        """
        if has_extension:
            filename = f"test.{format}"
            # 创建有效的图片文件
            save_format = format.upper() if format != 'jpeg' else 'JPEG'
            file = create_valid_image_file(filename, save_format)
            
            is_valid, error = self.service.validate_image(file)
            assert is_valid is True, f"带扩展名的有效文件应该通过: {filename}"
        else:
            # 没有扩展名的文件
            filename = "test_no_extension"
            file = create_mock_file(filename)
            
            is_valid, error = self.service.validate_image(file)
            assert is_valid is False, "没有扩展名的文件应该被拒绝"
            assert error is not None
    
    @settings(max_examples=100)
    @given(
        format=valid_image_format_strategy(),
        dots_in_name=st.integers(min_value=0, max_value=3)
    )
    def test_property_3_multiple_dots_in_filename(self, format, dots_in_name):
        """
        **Validates: Requirements 2.2, 2.4**
        
        属性 3: 文件格式验证（文件名包含多个点）
        测试文件名中包含多个点的情况（如 my.test.image.png）
        """
        # 构建包含多个点的文件名
        name_parts = ['test'] * (dots_in_name + 1)
        filename = '.'.join(name_parts) + f'.{format}'
        
        # 创建有效的图片文件
        save_format = format.upper() if format != 'jpeg' else 'JPEG'
        file = create_valid_image_file(filename, save_format)
        
        # 验证文件
        is_valid, error = self.service.validate_image(file)
        
        # 断言：应该根据最后一个扩展名判断
        assert is_valid is True, \
            f"文件名 {filename} 应该被接受（根据最后的扩展名 .{format}），但被拒绝了。错误: {error}"
    
    @settings(max_examples=100)
    @given(
        valid_format=valid_image_format_strategy(),
        invalid_format=invalid_format_strategy()
    )
    def test_property_3_format_boundary(self, valid_format, invalid_format):
        """
        **Validates: Requirements 2.2, 2.4**
        
        属性 3: 文件格式验证（边界测试）
        同时测试有效和无效格式，确保边界清晰
        """
        # 测试有效格式
        valid_filename = f"valid.{valid_format}"
        save_format = valid_format.upper() if valid_format != 'jpeg' else 'JPEG'
        valid_file = create_valid_image_file(valid_filename, save_format)
        
        is_valid, error = self.service.validate_image(valid_file)
        assert is_valid is True, f"有效格式 {valid_format} 应该通过"
        
        # 测试无效格式
        invalid_filename = f"invalid.{invalid_format}"
        invalid_file = create_mock_file(invalid_filename)
        
        is_valid, error = self.service.validate_image(invalid_file)
        assert is_valid is False, f"无效格式 {invalid_format} 应该被拒绝"
    
    @settings(max_examples=100)
    @given(format=st.sampled_from(['jpg', 'jpeg']))
    def test_property_3_jpg_jpeg_equivalence(self, format):
        """
        **Validates: Requirements 2.2, 2.4**
        
        属性 3: 文件格式验证（JPG 和 JPEG 等价性）
        验证 .jpg 和 .jpeg 扩展名都被接受
        """
        filename = f"test.{format}"
        file = create_valid_image_file(filename, 'JPEG')
        
        is_valid, error = self.service.validate_image(file)
        
        assert is_valid is True, \
            f"格式 {format} 应该被接受（JPG/JPEG 等价），但被拒绝了。错误: {error}"
        assert error is None
    
    @settings(max_examples=100)
    @given(
        format=valid_image_format_strategy(),
        whitespace=st.sampled_from(['', ' ', '  ', '\t', '\n'])
    )
    def test_property_3_whitespace_in_extension(self, format, whitespace):
        """
        **Validates: Requirements 2.2, 2.4**
        
        属性 3: 文件格式验证（扩展名中的空白字符）
        测试扩展名前后有空白字符的情况
        """
        if whitespace:
            # 扩展名中有空白字符应该被拒绝
            filename = f"test.{whitespace}{format}"
            file = create_mock_file(filename)
            
            is_valid, error = self.service.validate_image(file)
            # 空白字符会导致扩展名不匹配，应该被拒绝
            assert is_valid is False, \
                f"扩展名包含空白字符的文件应该被拒绝: '{format}' with whitespace"
        else:
            # 正常情况
            filename = f"test.{format}"
            save_format = format.upper() if format != 'jpeg' else 'JPEG'
            file = create_valid_image_file(filename, save_format)
            
            is_valid, error = self.service.validate_image(file)
            assert is_valid is True, f"正常格式应该通过: {format}"


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
