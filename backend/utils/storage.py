"""文件存储工具类"""
import os
import json
from typing import Any, Dict, Optional
from datetime import datetime


class FileStorage:
    """文件系统存储管理器"""
    
    @staticmethod
    def save_file(file_data: bytes, directory: str, filename: str) -> str:
        """
        保存文件到指定目录
        
        Args:
            file_data: 文件二进制数据
            directory: 目标目录
            filename: 文件名
            
        Returns:
            保存的文件路径
        """
        os.makedirs(directory, exist_ok=True)
        file_path = os.path.join(directory, filename)
        
        with open(file_path, 'wb') as f:
            f.write(file_data)
        
        return file_path
    
    @staticmethod
    def read_file(file_path: str) -> bytes:
        """读取文件内容"""
        with open(file_path, 'rb') as f:
            return f.read()
    
    @staticmethod
    def delete_file(file_path: str) -> bool:
        """删除文件"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False
    
    @staticmethod
    def get_file_url(file_path: str, base_path: str = '') -> str:
        """获取文件的 URL 路径"""
        if base_path:
            return file_path.replace(base_path, '').replace('\\', '/')
        return file_path.replace('\\', '/')


class JSONStorage:
    """JSON 数据存储管理器"""
    
    @staticmethod
    def read(file_path: str) -> Dict[str, Any]:
        """读取 JSON 文件"""
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return {}
        except Exception:
            return {}
    
    @staticmethod
    def write(file_path: str, data: Dict[str, Any]) -> bool:
        """写入 JSON 文件"""
        try:
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        except Exception:
            return False
    
    @staticmethod
    def append(file_path: str, key: str, item: Dict[str, Any]) -> bool:
        """向 JSON 文件的数组中追加项"""
        try:
            data = JSONStorage.read(file_path)
            if key not in data:
                data[key] = []
            data[key].append(item)
            return JSONStorage.write(file_path, data)
        except Exception:
            return False
    
    @staticmethod
    def update(file_path: str, key: str, item_id: str, updates: Dict[str, Any]) -> bool:
        """更新 JSON 文件中的项"""
        try:
            data = JSONStorage.read(file_path)
            if key not in data:
                return False
            
            for item in data[key]:
                if item.get('id') == item_id:
                    item.update(updates)
                    item['updated_at'] = datetime.now().isoformat()
                    return JSONStorage.write(file_path, data)
            
            return False
        except Exception:
            return False
