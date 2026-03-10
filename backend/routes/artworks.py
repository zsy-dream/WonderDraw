"""作品相关路由"""
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from backend.services.artwork_service import ArtworkService
from backend.services.ai_service import AIService
import logging
import os

logger = logging.getLogger(__name__)
artworks_bp = Blueprint('artworks', __name__)
artwork_service = ArtworkService()
ai_service = AIService()


@artworks_bp.route('/artworks/upload', methods=['POST'])
def upload_artwork():
    """上传原始图片"""
    try:
        # 检查是否有文件
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': '没有上传文件'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': '没有选择文件'
            }), 400
        
        # 获取用户 ID
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': '缺少用户 ID'
            }), 400
        
        # 验证文件格式
        if not artwork_service.validate_image(file):
            return jsonify({
                'success': False,
                'error': '不支持的文件格式，请上传 JPG、PNG 或 WEBP 格式的图片'
            }), 400
        
        # 上传文件
        result = artwork_service.upload_artwork(file, user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'data': result['artwork'],
                'message': '文件上传成功'
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
            
    except Exception as e:
        logger.error(f"文件上传失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500


@artworks_bp.route('/artworks/<artwork_id>', methods=['GET'])
def get_artwork(artwork_id):
    """获取作品信息"""
    try:
        artwork = artwork_service.get_artwork(artwork_id)
        
        if not artwork:
            return jsonify({
                'success': False,
                'error': '作品不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'data': artwork
        })
        
    except Exception as e:
        logger.error(f"获取作品失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500


@artworks_bp.route('/artworks/<artwork_id>/enhance', methods=['POST'])
def enhance_artwork(artwork_id):
    """使用 ControlNet 优化图像"""
    try:
        # 获取作品信息
        artwork = artwork_service.get_artwork(artwork_id)
        if not artwork:
            return jsonify({
                'success': False,
                'error': '作品不存在'
            }), 404
        
        # 获取创作 ID
        data = request.get_json() or {}
        creation_id = data.get('creation_id')
        if not creation_id:
            return jsonify({
                'success': False,
                'error': '缺少创作 ID'
            }), 400
        
        # 调用 AI 服务进行图像优化
        result = ai_service.enhance_image(creation_id, artwork['file_path'])
        
        if result['success']:
            return jsonify({
                'success': True,
                'data': {
                    'enhanced_image': result['enhanced_image']
                },
                'message': result['message']
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        logger.error(f"图像优化失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500


@artworks_bp.route('/artworks/<artwork_id>/animate', methods=['POST'])
def animate_artwork(artwork_id):
    """生成动画视频"""
    try:
        # 获取作品信息
        artwork = artwork_service.get_artwork(artwork_id)
        if not artwork:
            return jsonify({
                'success': False,
                'error': '作品不存在'
            }), 404
        
        # 获取参数
        data = request.get_json() or {}
        creation_id = data.get('creation_id')
        enhanced_image = data.get('enhanced_image')
        
        if not creation_id:
            return jsonify({
                'success': False,
                'error': '缺少创作 ID'
            }), 400
        
        if not enhanced_image:
            return jsonify({
                'success': False,
                'error': '缺少优化后的图像路径'
            }), 400
        
        # 调用 AI 服务生成动画
        result = ai_service.generate_animation(creation_id, enhanced_image)
        
        if result['success']:
            return jsonify({
                'success': True,
                'data': {
                    'animation': result['animation']
                },
                'message': result['message']
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        logger.error(f"动画生成失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500


@artworks_bp.route('/artworks/<artwork_id>/story', methods=['POST'])
def generate_story(artwork_id):
    """生成童话故事"""
    try:
        # 获取作品信息
        artwork = artwork_service.get_artwork(artwork_id)
        if not artwork:
            return jsonify({
                'success': False,
                'error': '作品不存在'
            }), 404
        
        # 获取参数
        data = request.get_json() or {}
        creation_id = data.get('creation_id')
        image_description = data.get('image_description', '')
        
        if not creation_id:
            return jsonify({
                'success': False,
                'error': '缺少创作 ID'
            }), 400
        
        # 调用 AI 服务生成故事
        result = ai_service.generate_story(creation_id, image_description)
        
        if result['success']:
            return jsonify({
                'success': True,
                'data': {
                    'story': result['story']
                },
                'message': result['message']
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        logger.error(f"故事生成失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500