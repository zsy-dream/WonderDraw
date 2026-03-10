"""作品服务单元测试"""
import pytest
import os
import json
import tempfile
from io import BytesIO
from PIL import Image
from werkzeug.datastructures import FileStorage
from backend.services.artwork_service import ArtworkService


@pytest.fixture
def temp_storage():
    """创建临时存储文件和目录"""
    # 创建临时目录
    temp_dir = tempfile.mkdtemp()
    storage_file = os.path.join(temp_dir, 'artworks.json')
    image_dir = os.path.join(temp_dir, 'images')
    
    # 初始化空数据结构
    with open(storage_file, 'w', encoding='utf-8') as f:
        json.dump({"artworks": []}, f)
    
    yield storage_file, image_dir, temp_dir
    
    # 清理
    import shutil
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)


@pytest.fixture
def artwork_service(temp_storage):
    """创建作品服务实例"""
    storage_file, image_dir, _ = temp_storage
    return ArtworkService(storage_path=storage_file, image_dir=image_dir)


def create_test_image(format='PNG', size=(100, 100), mode='RGB'):
    """创建测试图片"""
    img = Image.new(mode, size, color='red')
    img_io = BytesIO()
    img.save(img_io, format=format)
    img_io.seek(0)
    return img_io


def create_file_storage(filename, content, content_type='image/png'):
    """创建 FileStorage 对象"""
    return FileStorage(
        stream=content,
        filename=filename,
        content_type=content_type
    )


class TestArtworkService:
    """作品服务测试类"""
    
    def test_validate_image_success_png(self, artwork_service):
        """测试验证有效的 PNG 图片"""
        img_data = create_test_image('PNG')
        file = create_file_storage('test.png', img_data)
        
        is_valid, error = artwork_service.validate_image(file)
        assert is_valid is True
        assert error is None
    
    def test_validate_image_success_jpg(self, artwork_service):
        """测试验证有效的 JPG 图片"""
        img_data = create_test_image('JPEG')
        file = create_file_storage('test.jpg', img_data, 'image/jpeg')
        
        is_valid, error = artwork_service.validate_image(file)
        assert is_valid is True
        assert error is None
    
    def test_validate_image_success_webp(self, artwork_service):
        """测试验证有效的 WEBP 图片"""
        img_data = create_test_image('WEBP')
        file = create_file_storage('test.webp', img_data, 'image/webp')
        
        is_valid, error = artwork_service.validate_image(file)
        assert is_valid is True
        assert error is None
    
    def test_validate_image_invalid_format(self, artwork_service):
        """测试拒绝无效的文件格式"""
        content = BytesIO(b"not an image")
        file = create_file_storage('test.txt', content, 'text/plain')
        
        is_valid, error = artwork_service.validate_image(file)
        assert is_valid is False
        assert "不支持的文件格式" in error
    
    def test_validate_image_no_file(self, artwork_service):
        """测试未选择文件"""
        file = FileStorage(stream=BytesIO(), filename='')
        
        is_valid, error = artwork_service.validate_image(file)
        assert is_valid is False
        assert "未选择文件" in error
    
    def test_validate_image_empty_file(self, artwork_service):
        """测试空文件"""
        file = create_file_storage('test.png', BytesIO(b''))
        
        is_valid, error = artwork_service.validate_image(file)
        assert is_valid is False
        assert "文件为空" in error
    
    def test_validate_image_file_too_large(self, artwork_service):
        """测试文件过大"""
        # 创建一个超过限制的服务实例
        service = ArtworkService(max_file_size=100)  # 100 bytes
        
        img_data = create_test_image('PNG', size=(500, 500))
        file = create_file_storage('test.png', img_data)
        
        is_valid, error = service.validate_image(file)
        assert is_valid is False
        assert "文件过大" in error
    
    def test_validate_image_invalid_image_data(self, artwork_service):
        """测试无效的图片数据"""
        content = BytesIO(b"fake image data")
        file = create_file_storage('test.png', content)
        
        is_valid, error = artwork_service.validate_image(file)
        assert is_valid is False
        assert "无效的图片文件" in error
    
    def test_upload_artwork_success(self, artwork_service):
        """测试成功上传作品"""
        img_data = create_test_image('PNG')
        file = create_file_storage('test.png', img_data)
        user_id = "user-123"
        
        artwork = artwork_service.upload_artwork(file, user_id)
        
        assert artwork is not None
        assert "id" in artwork
        assert artwork["user_id"] == user_id
        assert "original_path" in artwork
        assert "uploaded_at" in artwork
        assert os.path.exists(artwork["original_path"])
    
    def test_upload_artwork_invalid_file(self, artwork_service):
        """测试上传无效文件应该抛出异常"""
        content = BytesIO(b"not an image")
        file = create_file_storage('test.txt', content)
        
        with pytest.raises(ValueError):
            artwork_service.upload_artwork(file, "user-123")
    
    def test_upload_artwork_resize_large_image(self, artwork_service):
        """测试上传大尺寸图片会自动调整"""
        # 创建超大图片
        img_data = create_test_image('PNG', size=(3000, 2000))
        file = create_file_storage('large.png', img_data)
        
        artwork = artwork_service.upload_artwork(file, "user-123")
        
        # 验证图片已保存
        assert os.path.exists(artwork["original_path"])
        
        # 验证图片尺寸已调整
        saved_img = Image.open(artwork["original_path"])
        width, height = saved_img.size
        assert width <= artwork_service.max_dimension
        assert height <= artwork_service.max_dimension
    
    def test_upload_artwork_rgba_to_rgb(self, artwork_service):
        """测试 RGBA 图片转换为 RGB"""
        img = Image.new('RGBA', (100, 100), color=(255, 0, 0, 128))
        img_io = BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)
        
        file = create_file_storage('test.png', img_io)
        artwork = artwork_service.upload_artwork(file, "user-123")
        
        # 验证保存的图片是 RGB 模式
        saved_img = Image.open(artwork["original_path"])
        assert saved_img.mode == 'RGB'
    
    def test_get_artwork_exists(self, artwork_service):
        """测试获取存在的作品"""
        # 上传作品
        img_data = create_test_image('PNG')
        file = create_file_storage('test.png', img_data)
        uploaded = artwork_service.upload_artwork(file, "user-123")
        
        # 获取作品
        artwork = artwork_service.get_artwork(uploaded["id"])
        
        assert artwork is not None
        assert artwork["id"] == uploaded["id"]
        assert artwork["user_id"] == "user-123"
    
    def test_get_artwork_not_exists(self, artwork_service):
        """测试获取不存在的作品"""
        artwork = artwork_service.get_artwork("non-existent-id")
        assert artwork is None
    
    def test_artwork_persistence(self, artwork_service, temp_storage):
        """测试作品数据持久化"""
        storage_file, image_dir, _ = temp_storage
        
        # 上传作品
        img_data = create_test_image('PNG')
        file = create_file_storage('test.png', img_data)
        artwork = artwork_service.upload_artwork(file, "user-123")
        artwork_id = artwork["id"]
        
        # 创建新的服务实例（模拟重启）
        new_service = ArtworkService(storage_path=storage_file, image_dir=image_dir)
        
        # 验证作品仍然存在
        retrieved = new_service.get_artwork(artwork_id)
        assert retrieved is not None
        assert retrieved["user_id"] == "user-123"
        assert os.path.exists(retrieved["original_path"])
    
    def test_resize_maintains_aspect_ratio(self, artwork_service):
        """测试调整尺寸保持宽高比"""
        # 创建宽图片
        img_data = create_test_image('PNG', size=(3000, 1500))
        file = create_file_storage('wide.png', img_data)
        
        artwork = artwork_service.upload_artwork(file, "user-123")
        
        saved_img = Image.open(artwork["original_path"])
        width, height = saved_img.size
        
        # 验证宽高比保持为 2:1
        assert abs(width / height - 2.0) < 0.1
    
    def test_case_insensitive_format_validation(self, artwork_service):
        """测试文件格式验证不区分大小写"""
        img_data = create_test_image('PNG')
        
        # 测试大写扩展名
        file = create_file_storage('test.PNG', img_data)
        is_valid, error = artwork_service.validate_image(file)
        assert is_valid is True
        
        # 测试混合大小写
        img_data.seek(0)
        file = create_file_storage('test.JpG', img_data)
        is_valid, error = artwork_service.validate_image(file)
        assert is_valid is True
    
    def test_reject_multiple_invalid_formats(self, artwork_service):
        """测试拒绝多种无效文件格式 - 需求 2.4"""
        invalid_formats = [
            ('test.txt', 'text/plain'),
            ('test.pdf', 'application/pdf'),
            ('test.doc', 'application/msword'),
            ('test.gif', 'image/gif'),
            ('test.bmp', 'image/bmp'),
            ('test.svg', 'image/svg+xml'),
            ('test.mp4', 'video/mp4'),
        ]
        
        for filename, content_type in invalid_formats:
            content = BytesIO(b"fake content")
            file = create_file_storage(filename, content, content_type)
            
            is_valid, error = artwork_service.validate_image(file)
            assert is_valid is False, f"文件 {filename} 应该被拒绝"
            assert "不支持的文件格式" in error, f"错误消息应该提到格式问题: {error}"
    
    def test_file_size_boundary_conditions(self, artwork_service):
        """测试文件大小边界条件 - 需求 18.1"""
        # 测试刚好在限制内的文件
        service = ArtworkService(max_file_size=1024)  # 1KB
        
        # 创建一个小于限制的图片
        small_img = create_test_image('PNG', size=(10, 10))
        file = create_file_storage('small.png', small_img)
        is_valid, error = service.validate_image(file)
        assert is_valid is True, "小于限制的文件应该通过"
        
        # 创建一个超过限制的图片
        large_img = create_test_image('PNG', size=(500, 500))
        file = create_file_storage('large.png', large_img)
        is_valid, error = service.validate_image(file)
        assert is_valid is False, "超过限制的文件应该被拒绝"
        assert "文件过大" in error
    
    def test_resize_preserves_image_quality(self, artwork_service):
        """测试图片尺寸调整保持质量 - 需求 18.2"""
        # 创建一个需要调整的大图片
        img_data = create_test_image('PNG', size=(3000, 2000))
        file = create_file_storage('large.png', img_data)
        
        artwork = artwork_service.upload_artwork(file, "user-123")
        
        # 验证调整后的图片可以正常打开
        saved_img = Image.open(artwork["original_path"])
        assert saved_img is not None
        
        # 验证图片模式正确
        assert saved_img.mode == 'RGB'
        
        # 验证尺寸在限制内
        width, height = saved_img.size
        assert width <= artwork_service.max_dimension
        assert height <= artwork_service.max_dimension
    
    def test_resize_different_aspect_ratios(self, artwork_service):
        """测试不同宽高比的图片调整 - 需求 18.2"""
        test_cases = [
            (3000, 1000),  # 宽图 3:1
            (1000, 3000),  # 高图 1:3
            (3000, 3000),  # 正方形
            (2500, 2000),  # 略宽 5:4
        ]
        
        for width, height in test_cases:
            img_data = create_test_image('PNG', size=(width, height))
            file = create_file_storage(f'test_{width}x{height}.png', img_data)
            
            artwork = artwork_service.upload_artwork(file, "user-123")
            
            saved_img = Image.open(artwork["original_path"])
            new_width, new_height = saved_img.size
            
            # 验证尺寸在限制内
            assert new_width <= artwork_service.max_dimension
            assert new_height <= artwork_service.max_dimension
            
            # 验证宽高比保持（允许小误差）
            original_ratio = width / height
            new_ratio = new_width / new_height
            assert abs(original_ratio - new_ratio) < 0.01, \
                f"宽高比应该保持: 原始={original_ratio:.2f}, 新={new_ratio:.2f}"
    
    def test_upload_with_special_characters_in_filename(self, artwork_service):
        """测试文件名包含特殊字符的处理"""
        img_data = create_test_image('PNG')
        
        # 测试各种特殊字符的文件名
        special_names = [
            '测试图片.png',  # 中文
            'test image.png',  # 空格
            'test-image_123.png',  # 连字符和下划线
        ]
        
        for filename in special_names:
            img_data.seek(0)
            file = create_file_storage(filename, img_data)
            
            # 应该能够成功上传
            artwork = artwork_service.upload_artwork(file, "user-123")
            assert artwork is not None
            assert os.path.exists(artwork["original_path"])
    
    def test_concurrent_uploads_generate_unique_ids(self, artwork_service):
        """测试并发上传生成唯一ID"""
        img_data = create_test_image('PNG')
        
        # 模拟多次上传
        artwork_ids = set()
        for i in range(10):
            img_data.seek(0)
            file = create_file_storage(f'test{i}.png', img_data)
            artwork = artwork_service.upload_artwork(file, "user-123")
            artwork_ids.add(artwork["id"])
        
        # 验证所有ID都是唯一的
        assert len(artwork_ids) == 10, "所有上传应该生成唯一的ID"
    
    def test_upload_invalid_format_raises_error(self, artwork_service):
        """测试上传无效格式抛出明确错误 - 需求 2.4"""
        invalid_files = [
            ('test.txt', b'text content', 'text/plain'),
            ('test.pdf', b'%PDF-1.4', 'application/pdf'),
            ('test.exe', b'MZ\x90\x00', 'application/x-msdownload'),
        ]
        
        for filename, content, content_type in invalid_files:
            file = create_file_storage(filename, BytesIO(content), content_type)
            
            with pytest.raises(ValueError) as exc_info:
                artwork_service.upload_artwork(file, "user-123")
            
            assert "不支持的文件格式" in str(exc_info.value), \
                f"错误消息应该明确说明格式问题: {exc_info.value}"
    
    def test_file_size_limit_enforced_on_upload(self, artwork_service):
        """测试上传时强制执行文件大小限制 - 需求 18.1"""
        # 创建一个小限制的服务
        service = ArtworkService(max_file_size=500)  # 500 bytes
        
        # 创建一个超过限制的图片
        large_img = create_test_image('PNG', size=(500, 500))
        file = create_file_storage('large.png', large_img)
        
        # 应该抛出错误
        with pytest.raises(ValueError) as exc_info:
            service.upload_artwork(file, "user-123")
        
        assert "文件过大" in str(exc_info.value)
    
    def test_resize_maintains_minimum_dimensions(self, artwork_service):
        """测试调整尺寸不会使图片过小"""
        # 创建一个需要调整的图片
        img_data = create_test_image('PNG', size=(3000, 100))  # 非常宽但很矮
        file = create_file_storage('wide.png', img_data)
        
        artwork = artwork_service.upload_artwork(file, "user-123")
        
        saved_img = Image.open(artwork["original_path"])
        width, height = saved_img.size
        
        # 验证调整后的图片仍然有合理的尺寸
        assert width > 0 and height > 0
        assert width <= artwork_service.max_dimension
        
        # 验证宽高比保持（允许较大误差，因为极端宽高比可能有舍入误差）
        original_ratio = 3000 / 100
        new_ratio = width / height
        assert abs(original_ratio - new_ratio) < 1.0, \
            f"宽高比应该接近: 原始={original_ratio:.2f}, 新={new_ratio:.2f}"
