"""
数据访问层属性测试

Feature: tonghua-qijing-platform
测试属性 4 和属性 13
"""
import os
import tempfile
import shutil
from hypothesis import given, strategies as st, settings
from hypothesis.strategies import composite
import pytest

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from utils.storage import FileStorage, JSONStorage


# 测试数据生成策略
@composite
def file_data_strategy(draw):
    """生成随机文件数据"""
    # 生成 1 到 10KB 的随机二进制数据
    size = draw(st.integers(min_value=1, max_value=10240))
    return draw(st.binary(min_size=size, max_size=size))


@composite
def filename_strategy(draw):
    """生成有效的文件名"""
    # 生成安全的文件名（字母数字和常见扩展名）
    name = draw(st.text(
        alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd')),
        min_size=1,
        max_size=20
    ))
    extension = draw(st.sampled_from(['.png', '.jpg', '.jpeg', '.webp', '.mp4', '.json']))
    return f"{name}{extension}"


@composite
def json_data_strategy(draw):
    """生成随机 JSON 数据"""
    return draw(st.recursive(
        st.one_of(
            st.none(),
            st.booleans(),
            st.integers(),
            st.floats(allow_nan=False, allow_infinity=False),
            st.text(max_size=100)
        ),
        lambda children: st.one_of(
            st.lists(children, max_size=5),
            st.dictionaries(
                st.text(alphabet=st.characters(whitelist_categories=('Lu', 'Ll')), min_size=1, max_size=10),
                children,
                max_size=5
            )
        ),
        max_leaves=10
    ))


class TestFileStorageProperties:
    """FileStorage 属性测试"""
    
    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """为每个测试创建和清理临时目录"""
        self.test_dir = tempfile.mkdtemp()
        yield
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
    
    @settings(max_examples=100)
    @given(
        file_data=file_data_strategy(),
        filename=filename_strategy()
    )
    def test_property_4_file_persistence(self, file_data, filename):
        """
        **Validates: Requirements 2.5**
        
        属性 4: 上传文件持久化
        对于任意有效的图片文件，上传成功后，文件系统中应存在该文件且文件内容与上传内容一致。
        """
        # 保存文件
        saved_path = FileStorage.save_file(file_data, self.test_dir, filename)
        
        # 验证文件存在
        assert os.path.exists(saved_path), f"文件应该存在于 {saved_path}"
        
        # 验证文件路径正确
        expected_path = os.path.join(self.test_dir, filename)
        assert saved_path == expected_path, "返回的路径应该与预期路径一致"
        
        # 验证文件内容一致（往返一致性）
        read_data = FileStorage.read_file(saved_path)
        assert read_data == file_data, "读取的文件内容应该与原始内容完全一致"
        
        # 验证文件大小
        assert len(read_data) == len(file_data), "文件大小应该一致"


class TestJSONStorageProperties:
    """JSONStorage 属性测试"""
    
    def _get_temp_file(self):
        """为每个测试示例创建唯一的临时文件"""
        fd, path = tempfile.mkstemp(suffix='.json')
        os.close(fd)
        return path
    
    @settings(max_examples=100)
    @given(data=json_data_strategy())
    def test_property_13_data_roundtrip_consistency_simple(self, data):
        """
        **Validates: Requirements 12.5**
        
        属性 13: 数据往返一致性（简单数据）
        对于任意数据保存操作，保存后应能成功读取该数据，且读取的数据与保存的数据一致。
        """
        test_file = self._get_temp_file()
        try:
            # 包装数据为字典（JSON 文件的根必须是对象）
            wrapped_data = {'data': data}
            
            # 写入数据
            write_success = JSONStorage.write(test_file, wrapped_data)
            assert write_success, "数据写入应该成功"
            
            # 读取数据
            read_data = JSONStorage.read(test_file)
            
            # 验证往返一致性
            assert read_data == wrapped_data, "读取的数据应该与写入的数据完全一致"
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    @settings(max_examples=100)
    @given(
        user_id=st.uuids().map(str),
        nickname=st.text(min_size=1, max_size=50),
        creation_ids=st.lists(st.uuids().map(str), max_size=10)
    )
    def test_property_13_data_roundtrip_consistency_user(self, user_id, nickname, creation_ids):
        """
        **Validates: Requirements 12.5**
        
        属性 13: 数据往返一致性（用户数据）
        测试用户数据的往返一致性
        """
        test_file = self._get_temp_file()
        try:
            # 创建用户数据
            user_data = {
                'users': [{
                    'id': user_id,
                    'nickname': nickname,
                    'creations': creation_ids,
                    'created_at': '2024-01-15T10:30:00Z'
                }]
            }
            
            # 写入数据
            write_success = JSONStorage.write(test_file, user_data)
            assert write_success, "用户数据写入应该成功"
            
            # 读取数据
            read_data = JSONStorage.read(test_file)
            
            # 验证往返一致性
            assert read_data == user_data, "读取的用户数据应该与写入的数据完全一致"
            assert read_data['users'][0]['id'] == user_id
            assert read_data['users'][0]['nickname'] == nickname
            assert read_data['users'][0]['creations'] == creation_ids
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    @settings(max_examples=100)
    @given(
        creation_id=st.uuids().map(str),
        user_id=st.uuids().map(str),
        status=st.sampled_from(['uploaded', 'enhancing', 'enhanced', 'animating', 'animated', 'story_gen', 'completed', 'failed'])
    )
    def test_property_13_data_roundtrip_consistency_creation(self, creation_id, user_id, status):
        """
        **Validates: Requirements 12.5**
        
        属性 13: 数据往返一致性（创作数据）
        测试创作数据的往返一致性
        """
        test_file = self._get_temp_file()
        try:
            # 创建作品数据
            creation_data = {
                'creations': [{
                    'id': creation_id,
                    'userId': user_id,
                    'artworkId': f'artwork-{creation_id}',
                    'originalImage': f'/storage/images/original/{creation_id}.png',
                    'enhancedImage': f'/storage/images/enhanced/{creation_id}.png',
                    'animation': f'/storage/videos/{creation_id}.mp4',
                    'story': '从前有一只小兔子...',
                    'status': status,
                    'createdAt': '2024-01-15T10:35:00Z',
                    'updatedAt': '2024-01-15T10:40:00Z'
                }]
            }
            
            # 写入数据
            write_success = JSONStorage.write(test_file, creation_data)
            assert write_success, "创作数据写入应该成功"
            
            # 读取数据
            read_data = JSONStorage.read(test_file)
            
            # 验证往返一致性
            assert read_data == creation_data, "读取的创作数据应该与写入的数据完全一致"
            assert read_data['creations'][0]['id'] == creation_id
            assert read_data['creations'][0]['userId'] == user_id
            assert read_data['creations'][0]['status'] == status
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    @settings(max_examples=100)
    @given(
        key=st.text(min_size=1, max_size=20),
        items=st.lists(
            st.fixed_dictionaries({
                'id': st.uuids().map(str),
                'value': st.text(max_size=50)
            }),
            min_size=1,
            max_size=10
        )
    )
    def test_property_13_append_roundtrip_consistency(self, key, items):
        """
        **Validates: Requirements 12.5**
        
        属性 13: 数据往返一致性（追加操作）
        测试追加操作的往返一致性
        """
        test_file = self._get_temp_file()
        try:
            # 逐个追加项
            for item in items:
                append_success = JSONStorage.append(test_file, key, item)
                assert append_success, f"追加项 {item['id']} 应该成功"
            
            # 读取数据
            read_data = JSONStorage.read(test_file)
            
            # 验证所有项都被正确追加
            assert key in read_data, f"键 '{key}' 应该存在"
            assert len(read_data[key]) == len(items), "追加的项数量应该一致"
            
            # 验证每个项的内容
            for i, item in enumerate(items):
                assert read_data[key][i] == item, f"第 {i} 项的内容应该一致"
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    @settings(max_examples=100)
    @given(
        key=st.text(min_size=1, max_size=20),
        item_id=st.uuids().map(str),
        initial_value=st.text(max_size=50),
        updated_value=st.text(max_size=50)
    )
    def test_property_13_update_roundtrip_consistency(self, key, item_id, initial_value, updated_value):
        """
        **Validates: Requirements 12.5**
        
        属性 13: 数据往返一致性（更新操作）
        测试更新操作的往返一致性
        """
        test_file = self._get_temp_file()
        try:
            # 创建初始数据
            initial_item = {'id': item_id, 'value': initial_value}
            append_success = JSONStorage.append(test_file, key, initial_item)
            assert append_success, "初始数据追加应该成功"
            
            # 更新数据
            updates = {'value': updated_value}
            update_success = JSONStorage.update(test_file, key, item_id, updates)
            assert update_success, "数据更新应该成功"
            
            # 读取数据
            read_data = JSONStorage.read(test_file)
            
            # 验证更新后的数据
            assert key in read_data, f"键 '{key}' 应该存在"
            assert len(read_data[key]) == 1, "应该只有一个项"
            assert read_data[key][0]['id'] == item_id, "ID 应该保持不变"
            assert read_data[key][0]['value'] == updated_value, "值应该已更新"
            assert 'updated_at' in read_data[key][0], "应该包含 updated_at 字段"
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
