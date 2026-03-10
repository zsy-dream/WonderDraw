"""用户服务单元测试"""
import pytest
import os
import json
import tempfile
from backend.services.user_service import UserService


@pytest.fixture
def temp_storage():
    """创建临时存储文件"""
    fd, path = tempfile.mkstemp(suffix='.json')
    os.close(fd)
    
    # 初始化空数据结构
    with open(path, 'w', encoding='utf-8') as f:
        json.dump({"users": []}, f)
    
    yield path
    
    # 清理
    if os.path.exists(path):
        os.remove(path)


@pytest.fixture
def user_service(temp_storage):
    """创建用户服务实例"""
    return UserService(storage_path=temp_storage)


class TestUserService:
    """用户服务测试类"""
    
    def test_create_user_success(self, user_service):
        """测试成功创建用户"""
        nickname = "小明"
        user = user_service.create_user(nickname)
        
        assert user is not None
        assert "id" in user
        assert user["nickname"] == nickname
        assert "created_at" in user
        assert user["creations"] == []
    
    def test_create_user_empty_nickname(self, user_service):
        """测试空昵称应该抛出异常"""
        with pytest.raises(ValueError, match="昵称不能为空"):
            user_service.create_user("")
        
        with pytest.raises(ValueError, match="昵称不能为空"):
            user_service.create_user("   ")
    
    def test_get_user_exists(self, user_service):
        """测试获取存在的用户"""
        # 创建用户
        created_user = user_service.create_user("小红")
        user_id = created_user["id"]
        
        # 获取用户
        user = user_service.get_user(user_id)
        
        assert user is not None
        assert user["id"] == user_id
        assert user["nickname"] == "小红"
    
    def test_get_user_not_exists(self, user_service):
        """测试获取不存在的用户"""
        user = user_service.get_user("non-existent-id")
        assert user is None
    
    def test_get_user_creations_empty(self, user_service):
        """测试获取新用户的空作品列表"""
        user = user_service.create_user("小刚")
        creations = user_service.get_user_creations(user["id"])
        
        assert creations == []
    
    def test_get_user_creations_not_exists(self, user_service):
        """测试获取不存在用户的作品列表"""
        creations = user_service.get_user_creations("non-existent-id")
        assert creations == []
    
    def test_add_creation_to_user(self, user_service):
        """测试添加作品到用户"""
        user = user_service.create_user("小李")
        creation_id = "creation-123"
        
        # 添加作品
        result = user_service.add_creation_to_user(user["id"], creation_id)
        assert result is True
        
        # 验证作品已添加
        creations = user_service.get_user_creations(user["id"])
        assert creation_id in creations
    
    def test_add_creation_to_user_no_duplicates(self, user_service):
        """测试添加重复作品不会重复添加"""
        user = user_service.create_user("小王")
        creation_id = "creation-456"
        
        # 添加两次相同的作品
        user_service.add_creation_to_user(user["id"], creation_id)
        user_service.add_creation_to_user(user["id"], creation_id)
        
        # 验证只有一个
        creations = user_service.get_user_creations(user["id"])
        assert creations.count(creation_id) == 1
    
    def test_add_creation_to_nonexistent_user(self, user_service):
        """测试向不存在的用户添加作品"""
        result = user_service.add_creation_to_user("non-existent-id", "creation-789")
        assert result is False
    
    def test_user_persistence(self, user_service, temp_storage):
        """测试用户数据持久化"""
        # 创建用户
        user = user_service.create_user("小张")
        user_id = user["id"]
        
        # 创建新的服务实例（模拟重启）
        new_service = UserService(storage_path=temp_storage)
        
        # 验证用户仍然存在
        retrieved_user = new_service.get_user(user_id)
        assert retrieved_user is not None
        assert retrieved_user["nickname"] == "小张"
