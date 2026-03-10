"""用户相关路由"""
from flask import Blueprint, request, jsonify
from backend.services.user_service import UserService
import logging

logger = logging.getLogger(__name__)
users_bp = Blueprint('users', __name__)
user_service = UserService()


@users_bp.route('/users', methods=['POST'])
def create_user():
    """创建新用户"""
    try:
        data = request.get_json()
        
        if not data or 'nickname' not in data:
            return jsonify({
                'success': False,
                'error': '缺少必需的参数: nickname'
            }), 400
        
        nickname = data['nickname'].strip()
        if not nickname:
            return jsonify({
                'success': False,
                'error': '昵称不能为空'
            }), 400
        
        # 创建用户
        user = user_service.create_user(nickname)
        
        return jsonify({
            'success': True,
            'data': user,
            'message': '用户创建成功'
        }), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        logger.error(f"创建用户失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500


@users_bp.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """获取用户信息"""
    try:
        user = user_service.get_user(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': '用户不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'data': user
        })
        
    except Exception as e:
        logger.error(f"获取用户失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500


@users_bp.route('/users/<user_id>/creations', methods=['GET'])
def get_user_creations(user_id):
    """获取用户的作品列表"""
    try:
        # 验证用户是否存在
        user = user_service.get_user(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': '用户不存在'
            }), 404
        
        # 获取用户作品
        creations = user_service.get_user_creations(user_id)
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user_id,
                'creations': creations,
                'total': len(creations)
            }
        })
        
    except Exception as e:
        logger.error(f"获取用户作品失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500