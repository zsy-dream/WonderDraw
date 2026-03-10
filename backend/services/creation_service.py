"""创作服务 - 管理完整的创作流程和作品数据"""
import uuid
from typing import Dict, List, Optional
from datetime import datetime
from backend.utils.storage import JSONStorage


class CreationService:
    """创作服务类
    
    负责管理完整的创作流程，包括创作记录的创建、更新、查询和删除
    """
    
    # 创作状态常量
    STATUS_UPLOADED = 'uploaded'
    STATUS_ENHANCING = 'enhancing'
    STATUS_ENHANCED = 'enhanced'
    STATUS_ANIMATING = 'animating'
    STATUS_ANIMATED = 'animated'
    STATUS_STORY_GEN = 'story_gen'
    STATUS_COMPLETED = 'completed'
    STATUS_FAILED = 'failed'
    
    def __init__(self, storage_path: str = 'storage/data/creations.json'):
        """
        初始化创作服务
        
        Args:
            storage_path: 创作数据存储路径
        """
        self.storage_path = storage_path
    
    def create_creation(self, artwork_id: str, user_id: str, original_image: str) -> Dict[str, any]:
        """
        创建新的作品记录
        
        Args:
            artwork_id: 原始作品 ID
            user_id: 用户 ID
            original_image: 原始图片路径
            
        Returns:
            创作信息字典
            
        Raises:
            ValueError: 如果必需参数为空
        """
        if not artwork_id or not user_id or not original_image:
            raise ValueError("artwork_id, user_id 和 original_image 不能为空")
        
        creation_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        creation = {
            "id": creation_id,
            "user_id": user_id,
            "artwork_id": artwork_id,
            "original_image": original_image,
            "enhanced_image": None,
            "animation": None,
            "story": None,
            "status": self.STATUS_UPLOADED,
            "created_at": now,
            "updated_at": now
        }
        
        # 保存创作记录到 JSON 文件
        JSONStorage.append(self.storage_path, "creations", creation)
        
        return creation
    
    def update_creation(self, creation_id: str, updates: Dict[str, any]) -> Optional[Dict[str, any]]:
        """
        更新作品状态和数据
        
        Args:
            creation_id: 创作 ID
            updates: 要更新的字段字典
            
        Returns:
            更新后的创作信息，如果创作不存在则返回 None
        """
        data = JSONStorage.read(self.storage_path)
        creations = data.get("creations", [])
        
        for creation in creations:
            if creation.get("id") == creation_id:
                # 更新字段
                creation.update(updates)
                # 更新时间戳
                creation["updated_at"] = datetime.now().isoformat()
                
                # 保存更新后的数据
                if JSONStorage.write(self.storage_path, data):
                    return creation
                return None
        
        return None
    
    def get_creation(self, creation_id: str) -> Optional[Dict[str, any]]:
        """
        获取作品详情
        
        Args:
            creation_id: 创作 ID
            
        Returns:
            创作信息字典，如果创作不存在则返回 None
        """
        data = JSONStorage.read(self.storage_path)
        creations = data.get("creations", [])
        
        for creation in creations:
            if creation.get("id") == creation_id:
                return creation
        
        return None
    
    def get_all_creations(self, limit: int = 20, offset: int = 0) -> Dict[str, any]:
        """
        获取所有作品，支持分页
        
        按创建时间倒序排列（最新的在前）
        
        Args:
            limit: 每页数量，默认 20
            offset: 偏移量，默认 0
            
        Returns:
            包含 creations 列表和 total 总数的字典
        """
        data = JSONStorage.read(self.storage_path)
        creations = data.get("creations", [])
        
        # 按创建时间倒序排列（需求 6.6）
        sorted_creations = sorted(
            creations,
            key=lambda x: x.get("created_at", ""),
            reverse=True
        )
        
        # 分页
        total = len(sorted_creations)
        paginated_creations = sorted_creations[offset:offset + limit]
        
        return {
            "creations": paginated_creations,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    
    def delete_creation(self, creation_id: str) -> bool:
        """
        删除作品
        
        Args:
            creation_id: 创作 ID
            
        Returns:
            操作是否成功
        """
        data = JSONStorage.read(self.storage_path)
        creations = data.get("creations", [])
        
        # 查找并删除创作
        original_length = len(creations)
        data["creations"] = [c for c in creations if c.get("id") != creation_id]
        
        # 如果列表长度改变，说明删除成功
        if len(data["creations"]) < original_length:
            return JSONStorage.write(self.storage_path, data)
        
        return False
