"""
数据访问层单元测试

Feature: tonghua-qijing-platform
测试错误处理场景（需求 12.6）
"""
import os
import tempfile
import shutil
import json
import pytest

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from utils.storage import FileStorage, JSONStorage


class TestFileStorageErrorHandling:
    """FileStorage 错误处理单元测试"""
    
    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """为每个测试创建和清理临时目录"""
        self.test_dir = tempfile.mkdtemp()
        yield
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
    
    def test_read_nonexistent_file(self):
        """测试读取不存在的文件应该抛出异常"""
        nonexistent_path = os.path.join(self.test_dir, 'nonexistent.png')
        
        with pytest.raises(FileNotFoundError):
            FileStorage.read_file(nonexistent_path)
    
    def test_delete_nonexistent_file(self):
        """测试删除不存在的文件应该返回 False"""
        nonexistent_path = os.path.join(self.test_dir, 'nonexistent.png')
        
        result = FileStorage.delete_file(nonexistent_path)
        assert result is False, "删除不存在的文件应该返回 False"
    
    def test_save_file_creates_directory(self):
        """测试保存文件时自动创建不存在的目录"""
        nested_dir = os.path.join(self.test_dir, 'level1', 'level2', 'level3')
        filename = 'test.png'
        file_data = b'test data'
        
        saved_path = FileStorage.save_file(file_data, nested_dir, filename)
        
        assert os.path.exists(saved_path), "文件应该被成功保存"
        assert os.path.exists(nested_dir), "嵌套目录应该被自动创建"
    
    def test_get_file_url_with_base_path(self):
        """测试获取文件 URL 时正确处理基础路径"""
        file_path = os.path.join(self.test_dir, 'images', 'test.png')
        base_path = self.test_dir
        
        url = FileStorage.get_file_url(file_path, base_path)
        
        assert url.startswith('/'), "URL 应该以 / 开头"
        assert 'images/test.png' in url, "URL 应该包含相对路径"
        assert '\\' not in url, "URL 不应该包含反斜杠"
    
    def test_get_file_url_without_base_path(self):
        """测试获取文件 URL 时不提供基础路径"""
        file_path = 'storage\\images\\test.png'
        
        url = FileStorage.get_file_url(file_path)
        
        assert '\\' not in url, "URL 不应该包含反斜杠"
        assert '/' in url, "URL 应该使用正斜杠"


class TestJSONStorageErrorHandling:
    """JSONStorage 错误处理单元测试"""
    
    def _get_temp_file(self):
        """创建临时文件路径"""
        fd, path = tempfile.mkstemp(suffix='.json')
        os.close(fd)
        return path
    
    def test_read_nonexistent_file(self):
        """测试读取不存在的 JSON 文件应该返回空字典"""
        nonexistent_path = '/tmp/nonexistent_file_12345.json'
        
        result = JSONStorage.read(nonexistent_path)
        
        assert result == {}, "读取不存在的文件应该返回空字典"
    
    def test_read_invalid_json(self):
        """测试读取无效的 JSON 文件应该返回空字典"""
        test_file = self._get_temp_file()
        try:
            # 写入无效的 JSON 内容
            with open(test_file, 'w', encoding='utf-8') as f:
                f.write('{ invalid json content }')
            
            result = JSONStorage.read(test_file)
            
            assert result == {}, "读取无效 JSON 应该返回空字典"
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    def test_read_corrupted_json(self):
        """测试读取损坏的 JSON 文件应该返回空字典"""
        test_file = self._get_temp_file()
        try:
            # 写入不完整的 JSON 内容
            with open(test_file, 'w', encoding='utf-8') as f:
                f.write('{"users": [{"id": "123", "name": ')
            
            result = JSONStorage.read(test_file)
            
            assert result == {}, "读取损坏的 JSON 应该返回空字典"
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    def test_write_creates_directory(self):
        """测试写入 JSON 时自动创建不存在的目录"""
        temp_dir = tempfile.mkdtemp()
        try:
            nested_path = os.path.join(temp_dir, 'level1', 'level2', 'data.json')
            data = {'test': 'value'}
            
            result = JSONStorage.write(nested_path, data)
            
            assert result is True, "写入应该成功"
            assert os.path.exists(nested_path), "文件应该被创建"
            assert os.path.exists(os.path.dirname(nested_path)), "目录应该被自动创建"
        finally:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)

    
    def test_append_to_nonexistent_file(self):
        """测试向不存在的文件追加数据应该创建新文件"""
        test_file = os.path.join(tempfile.gettempdir(), 'new_file_test.json')
        try:
            if os.path.exists(test_file):
                os.remove(test_file)
            
            item = {'id': '123', 'value': 'test'}
            result = JSONStorage.append(test_file, 'items', item)
            
            assert result is True, "追加到新文件应该成功"
            assert os.path.exists(test_file), "文件应该被创建"
            
            data = JSONStorage.read(test_file)
            assert 'items' in data, "键应该存在"
            assert len(data['items']) == 1, "应该有一个项"
            assert data['items'][0] == item, "项内容应该正确"
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    def test_append_to_new_key(self):
        """测试向已存在文件的新键追加数据"""
        test_file = self._get_temp_file()
        try:
            # 先写入一些数据
            initial_data = {'existing_key': [{'id': '1'}]}
            JSONStorage.write(test_file, initial_data)
            
            # 向新键追加数据
            new_item = {'id': '2', 'value': 'new'}
            result = JSONStorage.append(test_file, 'new_key', new_item)
            
            assert result is True, "追加到新键应该成功"
            
            data = JSONStorage.read(test_file)
            assert 'existing_key' in data, "原有键应该保留"
            assert 'new_key' in data, "新键应该存在"
            assert data['new_key'][0] == new_item, "新项内容应该正确"
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    def test_update_nonexistent_key(self):
        """测试更新不存在的键应该返回 False"""
        test_file = self._get_temp_file()
        try:
            data = {'items': [{'id': '123', 'value': 'test'}]}
            JSONStorage.write(test_file, data)
            
            result = JSONStorage.update(test_file, 'nonexistent_key', '123', {'value': 'updated'})
            
            assert result is False, "更新不存在的键应该返回 False"
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    def test_update_nonexistent_item(self):
        """测试更新不存在的项应该返回 False"""
        test_file = self._get_temp_file()
        try:
            data = {'items': [{'id': '123', 'value': 'test'}]}
            JSONStorage.write(test_file, data)
            
            result = JSONStorage.update(test_file, 'items', 'nonexistent_id', {'value': 'updated'})
            
            assert result is False, "更新不存在的项应该返回 False"
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    def test_update_adds_updated_at_field(self):
        """测试更新操作应该自动添加 updated_at 字段"""
        test_file = self._get_temp_file()
        try:
            data = {'items': [{'id': '123', 'value': 'test'}]}
            JSONStorage.write(test_file, data)
            
            result = JSONStorage.update(test_file, 'items', '123', {'value': 'updated'})
            
            assert result is True, "更新应该成功"
            
            updated_data = JSONStorage.read(test_file)
            assert 'updated_at' in updated_data['items'][0], "应该包含 updated_at 字段"
            assert updated_data['items'][0]['value'] == 'updated', "值应该已更新"
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    def test_write_empty_dict(self):
        """测试写入空字典"""
        test_file = self._get_temp_file()
        try:
            result = JSONStorage.write(test_file, {})
            
            assert result is True, "写入空字典应该成功"
            
            data = JSONStorage.read(test_file)
            assert data == {}, "读取的数据应该是空字典"
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    def test_write_nested_data(self):
        """测试写入嵌套的复杂数据结构"""
        test_file = self._get_temp_file()
        try:
            complex_data = {
                'users': [
                    {
                        'id': '123',
                        'name': '测试用户',
                        'creations': [
                            {'id': 'c1', 'title': '作品1'},
                            {'id': 'c2', 'title': '作品2'}
                        ]
                    }
                ],
                'metadata': {
                    'version': '1.0',
                    'count': 1
                }
            }
            
            result = JSONStorage.write(test_file, complex_data)
            
            assert result is True, "写入复杂数据应该成功"
            
            data = JSONStorage.read(test_file)
            assert data == complex_data, "读取的复杂数据应该与原数据一致"
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    def test_read_empty_file(self):
        """测试读取空文件应该返回空字典"""
        test_file = self._get_temp_file()
        try:
            # 创建空文件
            with open(test_file, 'w', encoding='utf-8') as f:
                f.write('')
            
            result = JSONStorage.read(test_file)
            
            assert result == {}, "读取空文件应该返回空字典"
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
