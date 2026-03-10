from flask import Flask, jsonify
from flask_cors import CORS
import os
import sys
import logging

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.routes import users_bp, artworks_bp, creations_bp

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 配置
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'storage')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# 注册蓝图
app.register_blueprint(users_bp, url_prefix='/api')
app.register_blueprint(artworks_bp, url_prefix='/api')
app.register_blueprint(creations_bp, url_prefix='/api')

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'message': '童画·奇境平台后端服务运行中',
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found(error):
    """404 错误处理"""
    return jsonify({
        'success': False,
        'error': '请求的资源不存在'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500 错误处理"""
    logger.error(f"服务器内部错误: {error}")
    return jsonify({
        'success': False,
        'error': '服务器内部错误'
    }), 500

@app.errorhandler(413)
def file_too_large(error):
    """文件过大错误处理"""
    return jsonify({
        'success': False,
        'error': '上传文件过大，请选择小于 16MB 的文件'
    }), 413

if __name__ == '__main__':
    # 确保存储目录存在
    storage_dirs = [
        'storage/images/original',
        'storage/images/enhanced',
        'storage/videos',
        'storage/exports/posters',
        'storage/exports/ebooks',
        'storage/data'
    ]
    
    for dir_path in storage_dirs:
        os.makedirs(dir_path, exist_ok=True)
    
    # 初始化数据文件
    data_files = {
        'storage/data/users.json': {'users': []},
        'storage/data/creations.json': {'creations': []},
        'storage/data/artworks.json': {'artworks': []}
    }
    
    for file_path, initial_data in data_files.items():
        if not os.path.exists(file_path):
            import json
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(initial_data, f, ensure_ascii=False, indent=2)
    
    logger.info("童画·奇境平台后端服务启动中...")
    app.run(debug=True, host='0.0.0.0', port=5000)
