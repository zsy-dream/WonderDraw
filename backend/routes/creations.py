"""创作相关路由"""
from flask import Blueprint, request, jsonify
from backend.services.creation_service import CreationService
from backend.services.ai_service import AIService
import logging

logger = logging.getLogger(__name__)
creations_bp = Blueprint('creations', __name__)
creation_service = CreationService()
ai_service = AIService()


@creations_bp.route('/creations', methods=['GET'])
def get_all_creations():
    """获取所有作品列表（支持分页）"""
    try:
        # 获取分页参数
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # 验证参数
        if limit <= 0 or limit > 100:
            limit = 20
        if offset < 0:
            offset = 0
        
        # 获取作品列表
        result = creation_service.get_all_creations(limit=limit, offset=offset)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"获取作品列表失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500


@creations_bp.route('/creations', methods=['POST'])
def create_creation():
    """创建新的创作记录"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': '缺少请求数据'
            }), 400
        
        # 验证必需参数
        required_fields = ['artwork_id', 'user_id', 'original_image']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'error': f'缺少必需的参数: {field}'
                }), 400
        
        # 创建创作记录
        creation = creation_service.create_creation(
            artwork_id=data['artwork_id'],
            user_id=data['user_id'],
            original_image=data['original_image']
        )
        
        return jsonify({
            'success': True,
            'data': creation,
            'message': '创作记录创建成功'
        }), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        logger.error(f"创建创作记录失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500


@creations_bp.route('/creations/<creation_id>', methods=['GET'])
def get_creation(creation_id):
    """获取创作详情"""
    try:
        creation = creation_service.get_creation(creation_id)
        
        if not creation:
            return jsonify({
                'success': False,
                'error': '创作不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'data': creation
        })
        
    except Exception as e:
        logger.error(f"获取创作详情失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500


@creations_bp.route('/creations/<creation_id>', methods=['PUT'])
def update_creation(creation_id):
    """更新创作信息"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': '缺少更新数据'
            }), 400
        
        # 更新创作记录
        updated_creation = creation_service.update_creation(creation_id, data)
        
        if not updated_creation:
            return jsonify({
                'success': False,
                'error': '创作不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'data': updated_creation,
            'message': '创作更新成功'
        })
        
    except Exception as e:
        logger.error(f"更新创作失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500


@creations_bp.route('/creations/<creation_id>', methods=['DELETE'])
def delete_creation(creation_id):
    """删除创作"""
    try:
        success = creation_service.delete_creation(creation_id)
        
        if not success:
            return jsonify({
                'success': False,
                'error': '创作不存在或删除失败'
            }), 404
        
        return jsonify({
            'success': True,
            'message': '创作删除成功'
        })
        
    except Exception as e:
        logger.error(f"删除创作失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500


@creations_bp.route('/creations/<creation_id>/process', methods=['POST'])
def process_creation(creation_id):
    """执行完整的 AI 处理工作流"""
    try:
        # 获取创作信息
        creation = creation_service.get_creation(creation_id)
        if not creation:
            return jsonify({
                'success': False,
                'error': '创作不存在'
            }), 404
        
        # 执行完整工作流
        result = ai_service.process_full_workflow(creation_id, creation['original_image'])
        
        if result['success']:
            return jsonify({
                'success': True,
                'data': {
                    'creation_id': creation_id,
                    'enhanced_image': result['enhanced_image'],
                    'animation': result['animation'],
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
        logger.error(f"处理创作工作流失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500


@creations_bp.route('/creations/<creation_id>/export', methods=['POST'])
def export_creation(creation_id):
    """导出创作作品"""
    try:
        # 获取创作信息
        creation = creation_service.get_creation(creation_id)
        if not creation:
            return jsonify({
                'success': False,
                'error': '创作不存在'
            }), 404
        
        # 获取导出类型
        data = request.get_json() or {}
        export_type = data.get('type', 'image')  # image, video, pdf
        
        # 验证创作是否完成
        if creation['status'] != CreationService.STATUS_COMPLETED:
            return jsonify({
                'success': False,
                'error': '创作尚未完成，无法导出'
            }), 400
        
        # 根据导出类型返回相应的文件路径
        export_data = {}
        
        if export_type == 'image' and creation.get('enhanced_image'):
            export_data['file_path'] = creation['enhanced_image']
            export_data['file_type'] = 'image'
        elif export_type == 'video' and creation.get('animation'):
            export_data['file_path'] = creation['animation']
            export_data['file_type'] = 'video'
        elif export_type == 'pdf':
            # TODO: 实现 PDF 生成逻辑
            return jsonify({
                'success': False,
                'error': 'PDF 导出功能尚未实现'
            }), 501
        else:
            return jsonify({
                'success': False,
                'error': f'不支持的导出类型: {export_type}'
            }), 400
        
        return jsonify({
            'success': True,
            'data': export_data,
            'message': '导出准备完成'
        })
        
    except Exception as e:
        logger.error(f"导出创作失败: {e}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500