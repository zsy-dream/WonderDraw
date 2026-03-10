"""用户管理服务"""
import uuid
from typing import Dict, List, Optional
from datetime import datetime
from backend.utils.storage import JSONStorage


class UserService:
    """用户管理服务类
    
    负责用户的创建、查询和作品关联管理
    """
    
    def __init__(self, storage_path: str = 'storage/data/users.json'):
        """
        初始化用户服务
        
        Args:
            storage_path: 用户数据存储路径
        """
        self.storage_path = storage_path
    
    def create_user(self, nickname: str) -> Dict[str, any]:
        """
        创建新用户
        
        Args:
            nickname: 用户昵称
            
        Returns:
            用户信息字典，包含 id, nickname, created_at, creations
            
        Raises:
            ValueError: 如果昵称为空
        """
        if not nickname or not nickname.strip():
            raise ValueError("昵称不能为空")
        
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "nickname": nickname.strip(),
            "created_at": datetime.now().isoformat(),
            "creations": []
        }
        
        # 保存用户到 JSON 文件
        JSONStorage.append(self.storage_path, "users", user)
        
        return user
    
    def get_user(self, user_id: str) -> Optional[Dict[str, any]]:
        """
        根据用户 ID 获取用户信息
        
        Args:
            user_id: 用户 ID
            
        Returns:
            用户信息字典，如果用户不存在则返回 None
        """
        data = JSONStorage.read(self.storage_path)
        users = data.get("users", [])
        
        for user in users:
            if user.get("id") == user_id:
                return user
        
        return None
    
    def get_user_creations(self, user_id: str) -> List[str]:
        """
        获取用户的所有作品 ID 列表
        
        Args:
            user_id: 用户 ID
            
        Returns:
            作品 ID 列表，如果用户不存在则返回空列表
        """
        user = self.get_user(user_id)
        if user:
            return user.get("creations", [])
        return []
    
    def add_creation_to_user(self, user_id: str, creation_id: str) -> bool:
        """
        将作品 ID 添加到用户的作品列表
        
        Args:
            user_id: 用户 ID
            creation_id: 作品 ID
            
        Returns:
            操作是否成功
        """
        data = JSONStorage.read(self.storage_path)
        users = data.get("users", [])
        
        for user in users:
            if user.get("id") == user_id:
                if "creations" not in user:
                    user["creations"] = []
                if creation_id not in user["creations"]:
                    user["creations"].append(creation_id)
                return JSONStorage.write(self.storage_path, data)
        
        return False
