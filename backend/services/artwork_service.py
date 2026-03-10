"""作品上传和验证服务"""
import uuid
import os
from typing import Dict, Optional, Tuple
from datetime import datetime
from werkzeug.datastructures import FileStorage as WerkzeugFileStorage
from PIL import Image
from backend.utils.storage import FileStorage, JSONStorage


class ArtworkService:
    """作品管理服务类
    
    负责作品的上传、验证和存储管理
    """
    
    # 支持的图片格式
    ALLOWED_FORMATS = {'jpg', 'jpeg', 'png', 'webp'}
    
    # 默认最大文件大小（10MB）
    MAX_FILE_SIZE = 10 * 1024 * 1024
    
    # 默认最大图片尺寸
    MAX_IMAGE_DIMENSION = 2048
    
    def __init__(
        self,
        storage_path: str = 'storage/data/artworks.json',
        image_dir: str = 'storage/images/original',
        max_file_size: int = MAX_FILE_SIZE,
        max_dimension: int = MAX_IMAGE_DIMENSION
    ):
        """
        初始化作品服务
        
        Args:
            storage_path: 作品元数据存储路径
            image_dir: 图片存储目录
            max_file_size: 最大文件大小（字节）
            max_dimension: 最大图片尺寸（宽或高）
        """
        self.storage_path = storage_path
        self.image_dir = image_dir
        self.max_file_size = max_file_size
        self.max_dimension = max_dimension
    
    def validate_image(self, file: WerkzeugFileStorage) -> Tuple[bool, Optional[str]]:
        """
        验证上传的图片文件
        
        Args:
            file: 上传的文件对象
            
        Returns:
            (是否有效, 错误消息)
        """
        # 检查文件是否存在
        if not file or not file.filename:
            return False, "未选择文件"
        
        # 检查文件格式
        filename = file.filename.lower()
        file_ext = filename.rsplit('.', 1)[-1] if '.' in filename else ''
        
        if file_ext not in self.ALLOWED_FORMATS:
            return False, f"不支持的文件格式。支持的格式：{', '.join(self.ALLOWED_FORMATS).upper()}"
        
        # 检查文件大小
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)  # 重置文件指针
        
        if file_size > self.max_file_size:
            max_size_mb = self.max_file_size / (1024 * 1024)
            return False, f"文件过大。最大允许 {max_size_mb:.1f}MB"
        
        if file_size == 0:
            return False, "文件为空"
        
        # 验证是否为有效图片
        try:
            file.seek(0)
            img = Image.open(file.stream)
            img.verify()
            file.seek(0)  # 重置文件指针供后续使用
            return True, None
        except Exception as e:
            return False, f"无效的图片文件：{str(e)}"
    
    def _resize_image_if_needed(self, image: Image.Image) -> Image.Image:
        """
        如果图片尺寸超过限制，则调整大小
        
        Args:
            image: PIL Image 对象
            
        Returns:
            调整后的 Image 对象
        """
        width, height = image.size
        
        if width <= self.max_dimension and height <= self.max_dimension:
            return image
        
        # 计算缩放比例，保持宽高比
        if width > height:
            new_width = self.max_dimension
            new_height = int(height * (self.max_dimension / width))
        else:
            new_height = self.max_dimension
            new_width = int(width * (self.max_dimension / height))
        
        return image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    def upload_artwork(self, file: WerkzeugFileStorage, user_id: str) -> Dict[str, any]:
        """
        上传作品文件
        
        Args:
            file: 上传的文件对象
            user_id: 用户 ID
            
        Returns:
            作品信息字典，包含 id, user_id, original_path, uploaded_at
            
        Raises:
            ValueError: 如果文件验证失败
        """
        # 验证文件
        is_valid, error_msg = self.validate_image(file)
        if not is_valid:
            raise ValueError(error_msg)
        
        # 生成作品 ID 和文件名
        artwork_id = str(uuid.uuid4())
        file_ext = file.filename.rsplit('.', 1)[-1].lower()
        filename = f"{artwork_id}.{file_ext}"
        
        # 读取并处理图片
        file.seek(0)
        img = Image.open(file.stream)
        
        # 转换 RGBA 到 RGB（如果需要）
        if img.mode == 'RGBA':
            # 创建白色背景
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])  # 使用 alpha 通道作为 mask
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # 调整图片尺寸（如果需要）
        img = self._resize_image_if_needed(img)
        
        # 保存文件
        os.makedirs(self.image_dir, exist_ok=True)
        file_path = os.path.join(self.image_dir, filename)
        img.save(file_path, quality=95, optimize=True)
        
        # 创建作品记录
        artwork = {
            "id": artwork_id,
            "user_id": user_id,
            "original_path": file_path,
            "filename": filename,
            "uploaded_at": datetime.now().isoformat()
        }
        
        # 保存作品元数据
        JSONStorage.append(self.storage_path, "artworks", artwork)
        
        return artwork
    
    def get_artwork(self, artwork_id: str) -> Optional[Dict[str, any]]:
        """
        根据作品 ID 获取作品信息
        
        Args:
            artwork_id: 作品 ID
            
        Returns:
            作品信息字典，如果作品不存在则返回 None
        """
        data = JSONStorage.read(self.storage_path)
        artworks = data.get("artworks", [])
        
        for artwork in artworks:
            if artwork.get("id") == artwork_id:
                return artwork
        
        return None
