"""CreationService 单元测试"""
import pytest
import os
import json
import tempfile
from backend.services.creation_service import CreationService


@pytest.fixture
def temp_storage():
    """创建临时存储文件"""
    fd, path = tempfile.mkstemp(suffix='.json')
    os.close(fd)
    
    # 初始化空数据结构
    with open(path, 'w', encoding='utf-8') as f:
        json.dump({"creations": []}, f)
    
    yield path
    
    # 清理
    if os.path.exists(path):
        os.remove(path)


@pytest.fixture
def creation_service(temp_storage):
    """创建创作服务实例"""
    return CreationService(storage_path=temp_storage)


class TestCreationService:
    """创作服务测试类"""
    
    def test_create_creation_success(self, creation_service):
        """测试成功创建作品"""
        artwork_id = "artwork-123"
        user_id = "user-456"
        original_image = "storage/images/original/test.jpg"
        
        creation = creation_service.create_creation(artwork_id, user_id, original_image)
        
        assert creation is not None
        assert "id" in creation
        assert creation["artwork_id"] == artwork_id
        assert creation["user_id"] == user_id
        assert creation["original_image"] == original_image
        assert creation["status"] == CreationService.STATUS_UPLOADED
        assert "created_at" in creation
        assert "updated_at" in creation
        assert creation["enhanced_image"] is None
        assert creation["animation"] is None
        assert creation["story"] is None
    
    def test_create_creation_empty_params(self, creation_service):
        """测试空参数应该抛出异常"""
        with pytest.raises(ValueError, match="artwork_id, user_id 和 original_image 不能为空"):
            creation_service.create_creation("", "user-123", "image.jpg")
        
        with pytest.raises(ValueError, match="artwork_id, user_id 和 original_image 不能为空"):
            creation_service.create_creation("artwork-123", "", "image.jpg")
            
        with pytest.raises(ValueError, match="artwork_id, user_id 和 original_image 不能为空"):
            creation_service.create_creation("artwork-123", "user-123", "")
    
    def test_get_creation_exists(self, creation_service):
        """测试获取存在的作品"""
        # 创建作品
        created_creation = creation_service.create_creation("artwork-123", "user-456", "test.jpg")
        creation_id = created_creation["id"]
        
        # 获取作品
        creation = creation_service.get_creation(creation_id)
        
        assert creation is not None
        assert creation["id"] == creation_id
        assert creation["artwork_id"] == "artwork-123"
    
    def test_get_creation_not_exists(self, creation_service):
        """测试获取不存在的作品"""
        creation = creation_service.get_creation("non-existent-id")
        assert creation is None
    
    def test_update_creation_success(self, creation_service):
        """测试成功更新作品"""
        # 创建作品
        creation = creation_service.create_creation("artwork-123", "user-456", "test.jpg")
        creation_id = creation["id"]
        
        # 更新作品
        updates = {
            "status": CreationService.STATUS_ENHANCED,
            "enhanced_image": "storage/images/enhanced/test_enhanced.jpg"
        }
        updated_creation = creation_service.update_creation(creation_id, updates)
        
        assert updated_creation is not None
        assert updated_creation["status"] == CreationService.STATUS_ENHANCED
        assert updated_creation["enhanced_image"] == "storage/images/enhanced/test_enhanced.jpg"
        assert updated_creation["updated_at"] != creation["updated_at"]
    
    def test_update_creation_not_exists(self, creation_service):
        """测试更新不存在的作品"""
        updates = {"status": CreationService.STATUS_ENHANCED}
        result = creation_service.update_creation("non-existent-id", updates)
        assert result is None
    
    def test_get_all_creations_empty(self, creation_service):
        """测试获取空作品列表"""
        result = creation_service.get_all_creations()
        
        assert result["creations"] == []
        assert result["total"] == 0
        assert result["limit"] == 20
        assert result["offset"] == 0
    
    def test_get_all_creations_with_data(self, creation_service):
        """测试获取作品列表"""
        # 创建多个作品
        creation1 = creation_service.create_creation("artwork-1", "user-1", "test1.jpg")
        creation2 = creation_service.create_creation("artwork-2", "user-2", "test2.jpg")
        
        result = creation_service.get_all_creations()
        
        assert len(result["creations"]) == 2
        assert result["total"] == 2
        # 验证按时间倒序排列（最新的在前）
        assert result["creations"][0]["id"] == creation2["id"]
        assert result["creations"][1]["id"] == creation1["id"]
    
    def test_get_all_creations_pagination(self, creation_service):
        """测试分页功能"""
        # 创建多个作品
        for i in range(5):
            creation_service.create_creation(f"artwork-{i}", f"user-{i}", f"test{i}.jpg")
        
        # 测试第一页
        result = creation_service.get_all_creations(limit=2, offset=0)
        assert len(result["creations"]) == 2
        assert result["total"] == 5
        assert result["limit"] == 2
        assert result["offset"] == 0
        
        # 测试第二页
        result = creation_service.get_all_creations(limit=2, offset=2)
        assert len(result["creations"]) == 2
        assert result["offset"] == 2
    
    def test_delete_creation_success(self, creation_service):
        """测试成功删除作品"""
        # 创建作品
        creation = creation_service.create_creation("artwork-123", "user-456", "test.jpg")
        creation_id = creation["id"]
        
        # 删除作品
        result = creation_service.delete_creation(creation_id)
        assert result is True
        
        # 验证作品已删除
        deleted_creation = creation_service.get_creation(creation_id)
        assert deleted_creation is None
    
    def test_delete_creation_not_exists(self, creation_service):
        """测试删除不存在的作品"""
        result = creation_service.delete_creation("non-existent-id")
        assert result is False
    
    def test_creation_persistence(self, creation_service, temp_storage):
        """测试作品数据持久化"""
        # 创建作品
        creation = creation_service.create_creation("artwork-123", "user-456", "test.jpg")
        creation_id = creation["id"]
        
        # 创建新的服务实例（模拟重启）
        new_service = CreationService(storage_path=temp_storage)
        
        # 验证作品仍然存在
        retrieved_creation = new_service.get_creation(creation_id)
        assert retrieved_creation is not None
        assert retrieved_creation["artwork_id"] == "artwork-123"
