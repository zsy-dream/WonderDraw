"""用户服务集成测试 - 验证需求"""
import pytest
import os
import json
from backend.services.user_service import UserService


def test_requirement_1_1_user_login():
    """
    需求 1.1: WHEN 用户首次访问平台 THEN THE Platform SHALL 提示用户输入昵称进行登录
    验证：用户可以通过昵称创建账户
    """
    service = UserService(storage_path='storage/data/users.json')
    user = service.create_user("测试用户")
    
    assert user is not None
    assert user["nickname"] == "测试用户"
    assert "id" in user


def test_requirement_1_2_user_session_creation():
    """
    需求 1.2: WHEN 用户输入昵称并提交 THEN THE Platform SHALL 创建用户会话并存储用户标识
    验证：创建用户后生成唯一 ID 并存储
    """
    service = UserService(storage_path='storage/data/users.json')
    user = service.create_user("会话测试用户")
    
    # 验证生成了 UUID
    assert user["id"] is not None
    assert len(user["id"]) > 0
    
    # 验证可以通过 ID 检索用户
    retrieved = service.get_user(user["id"])
    assert retrieved is not None
    assert retrieved["id"] == user["id"]


def test_requirement_1_3_user_recognition():
    """
    需求 1.3: WHEN 用户再次访问平台 THEN THE Platform SHALL 识别用户身份并加载其历史作品
    验证：可以通过用户 ID 获取用户信息和作品列表
    """
    service = UserService(storage_path='storage/data/users.json')
    
    # 创建用户并添加作品
    user = service.create_user("历史用户")
    user_id = user["id"]
    service.add_creation_to_user(user_id, "creation-001")
    service.add_creation_to_user(user_id, "creation-002")
    
    # 模拟用户再次访问 - 获取用户信息
    retrieved_user = service.get_user(user_id)
    assert retrieved_user is not None
    
    # 加载历史作品
    creations = service.get_user_creations(user_id)
    assert len(creations) == 2
    assert "creation-001" in creations
    assert "creation-002" in creations


def test_requirement_1_4_local_storage():
    """
    需求 1.4: THE Platform SHALL 将用户信息存储在本地文件系统中
    验证：用户数据存储在 JSON 文件中
    """
    storage_path = 'storage/data/users.json'
    service = UserService(storage_path=storage_path)
    
    # 创建用户
    user = service.create_user("本地存储测试")
    
    # 验证文件存在
    assert os.path.exists(storage_path)
    
    # 验证文件内容
    with open(storage_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        assert "users" in data
        
        # 查找创建的用户
        found = False
        for stored_user in data["users"]:
            if stored_user["id"] == user["id"]:
                found = True
                assert stored_user["nickname"] == "本地存储测试"
                break
        
        assert found, "用户未在文件中找到"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
