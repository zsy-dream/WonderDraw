"""
用户管理属性测试

Feature: tonghua-qijing-platform
测试属性 1 和属性 2
"""
import os
import tempfile
import shutil
from hypothesis import given, strategies as st, settings
from hypothesis.strategies import composite
import pytest

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.user_service import UserService


# 测试数据生成策略
@composite
def nickname_strategy(draw):
    """生成有效的用户昵称"""
    # 生成 1-50 个字符的昵称（包含中文、英文、数字）
    return draw(st.text(min_size=1, max_size=50).filter(lambda x: x.strip() != ''))


@composite
def creation_ids_strategy(draw):
    """生成作品 ID 列表"""
    return draw(st.lists(st.uuids().map(str), min_size=0, max_size=20))


class TestUserServiceProperties:
    """用户服务属性测试"""
    
    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """为每个测试创建和清理临时存储文件"""
        fd, self.test_file = tempfile.mkstemp(suffix='.json')
        os.close(fd)
        # 初始化空的用户数据结构
        with open(self.test_file, 'w', encoding='utf-8') as f:
            f.write('{"users": []}')
        yield
        if os.path.exists(self.test_file):
            os.remove(self.test_file)
    
    @settings(max_examples=100)
    @given(nickname=nickname_strategy())
    def test_property_1_user_creation_persistence(self, nickname):
        """
        **Validates: Requirements 1.2, 1.4**
        
        属性 1: 用户创建持久化
        对于任意昵称字符串，当创建用户后，从存储中读取该用户 ID 应返回相同的昵称和用户数据。
        """
        # 创建用户服务实例
        user_service = UserService(storage_path=self.test_file)
        
        # 创建用户
        created_user = user_service.create_user(nickname)
        
        # 验证返回的用户数据包含必需字段
        assert 'id' in created_user, "创建的用户应该包含 id 字段"
        assert 'nickname' in created_user, "创建的用户应该包含 nickname 字段"
        assert 'created_at' in created_user, "创建的用户应该包含 created_at 字段"
        assert 'creations' in created_user, "创建的用户应该包含 creations 字段"
        
        # 验证昵称正确（去除首尾空格）
        assert created_user['nickname'] == nickname.strip(), "昵称应该与输入一致（去除空格）"
        
        # 验证初始作品列表为空
        assert created_user['creations'] == [], "新用户的作品列表应该为空"
        
        # 从存储中读取用户（测试持久化）
        user_id = created_user['id']
        retrieved_user = user_service.get_user(user_id)
        
        # 验证持久化的用户数据
        assert retrieved_user is not None, "应该能从存储中读取到用户"
        assert retrieved_user['id'] == user_id, "用户 ID 应该一致"
        assert retrieved_user['nickname'] == nickname.strip(), "持久化的昵称应该与创建时一致"
        assert retrieved_user['created_at'] == created_user['created_at'], "创建时间应该一致"
        assert retrieved_user['creations'] == created_user['creations'], "作品列表应该一致"
        
        # 验证完整的往返一致性
        assert retrieved_user == created_user, "从存储读取的用户数据应该与创建时完全一致"
    
    @settings(max_examples=100)
    @given(
        nickname=nickname_strategy(),
        creation_ids=creation_ids_strategy()
    )
    def test_property_2_user_session_recovery(self, nickname, creation_ids):
        """
        **Validates: Requirements 1.3**
        
        属性 2: 用户会话恢复
        对于任意已创建的用户，当用户再次访问平台时，系统应能识别用户身份并加载其所有历史作品 ID。
        """
        # 创建用户服务实例
        user_service = UserService(storage_path=self.test_file)
        
        # 创建用户
        created_user = user_service.create_user(nickname)
        user_id = created_user['id']
        
        # 添加作品到用户
        for creation_id in creation_ids:
            success = user_service.add_creation_to_user(user_id, creation_id)
            assert success, f"添加作品 {creation_id} 应该成功"
        
        # 模拟用户再次访问平台（创建新的服务实例，模拟应用重启）
        new_user_service = UserService(storage_path=self.test_file)
        
        # 验证能够识别用户身份
        recovered_user = new_user_service.get_user(user_id)
        assert recovered_user is not None, "应该能识别用户身份"
        assert recovered_user['id'] == user_id, "用户 ID 应该一致"
        assert recovered_user['nickname'] == nickname.strip(), "用户昵称应该一致"
        
        # 验证能够加载所有历史作品
        recovered_creations = new_user_service.get_user_creations(user_id)
        assert recovered_creations is not None, "应该能加载作品列表"
        assert len(recovered_creations) == len(creation_ids), "作品数量应该一致"
        
        # 验证所有作品 ID 都被正确恢复
        for creation_id in creation_ids:
            assert creation_id in recovered_creations, f"作品 {creation_id} 应该在恢复的列表中"
        
        # 验证作品顺序保持一致（按添加顺序）
        assert recovered_creations == creation_ids, "作品列表应该与添加顺序一致"
    
    @settings(max_examples=100)
    @given(
        nickname=nickname_strategy(),
        creation_ids=st.lists(st.uuids().map(str), min_size=1, max_size=10)
    )
    def test_property_2_session_recovery_with_multiple_restarts(self, nickname, creation_ids):
        """
        **Validates: Requirements 1.3**
        
        属性 2: 用户会话恢复（多次重启场景）
        验证在多次应用重启后，用户数据仍然能够正确恢复
        """
        # 第一次：创建用户
        user_service_1 = UserService(storage_path=self.test_file)
        created_user = user_service_1.create_user(nickname)
        user_id = created_user['id']
        
        # 添加一半的作品
        mid_point = len(creation_ids) // 2
        for creation_id in creation_ids[:mid_point]:
            user_service_1.add_creation_to_user(user_id, creation_id)
        
        # 第二次重启：添加剩余作品
        user_service_2 = UserService(storage_path=self.test_file)
        for creation_id in creation_ids[mid_point:]:
            user_service_2.add_creation_to_user(user_id, creation_id)
        
        # 第三次重启：验证所有数据
        user_service_3 = UserService(storage_path=self.test_file)
        recovered_user = user_service_3.get_user(user_id)
        recovered_creations = user_service_3.get_user_creations(user_id)
        
        # 验证用户信息
        assert recovered_user is not None, "多次重启后应该能识别用户"
        assert recovered_user['nickname'] == nickname.strip(), "昵称应该保持一致"
        
        # 验证所有作品都被保存
        assert len(recovered_creations) == len(creation_ids), "所有作品都应该被保存"
        for creation_id in creation_ids:
            assert creation_id in recovered_creations, f"作品 {creation_id} 应该存在"
    
    @settings(max_examples=100)
    @given(
        nicknames=st.lists(nickname_strategy(), min_size=2, max_size=10, unique=True)
    )
    def test_property_1_multiple_users_persistence(self, nicknames):
        """
        **Validates: Requirements 1.2, 1.4**
        
        属性 1: 用户创建持久化（多用户场景）
        验证多个用户可以同时被创建和持久化，互不干扰
        """
        user_service = UserService(storage_path=self.test_file)
        
        # 创建多个用户
        created_users = []
        for nickname in nicknames:
            user = user_service.create_user(nickname)
            created_users.append(user)
        
        # 验证所有用户都能被正确读取
        for created_user in created_users:
            user_id = created_user['id']
            retrieved_user = user_service.get_user(user_id)
            
            assert retrieved_user is not None, f"用户 {user_id} 应该能被读取"
            assert retrieved_user['id'] == created_user['id'], "用户 ID 应该一致"
            assert retrieved_user['nickname'] == created_user['nickname'], "昵称应该一致"
            assert retrieved_user == created_user, "用户数据应该完全一致"
        
        # 验证用户之间互不干扰
        user_ids = [user['id'] for user in created_users]
        assert len(user_ids) == len(set(user_ids)), "所有用户 ID 应该唯一"
        
        user_nicknames = [user['nickname'] for user in created_users]
        assert len(user_nicknames) == len(nicknames), "所有昵称都应该被保存"


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
