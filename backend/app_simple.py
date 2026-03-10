"""简化版后端应用 - 不加载 AI 模型用于开发测试"""
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import sys
import logging
import json
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 配置
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'storage')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

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
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(initial_data, f, ensure_ascii=False, indent=2)

# 工具函数
def read_json(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {}

def write_json(file_path, data):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 路由
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': '童画·奇境平台后端服务运行中（简化版）',
        'version': '1.0.0-dev'
    })

# 静态文件服务
@app.route('/storage/<path:filename>')
def serve_storage(filename):
    """提供存储文件的访问"""
    try:
        storage_path = os.path.join(BASE_DIR, 'storage')
        return send_from_directory(storage_path, filename)
    except Exception as e:
        logger.error(f"文件访问失败: {e}")
        return jsonify({'error': '文件不存在'}), 404

@app.route('/api/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        nickname = data.get('nickname', '').strip()
        
        if not nickname:
            return jsonify({'success': False, 'error': '昵称不能为空'}), 400
        
        user = {
            'id': str(uuid.uuid4()),
            'nickname': nickname,
            'creations': [],
            'created_at': datetime.now().isoformat()
        }
        
        users_data = read_json('storage/data/users.json')
        users_data.setdefault('users', []).append(user)
        write_json('storage/data/users.json', users_data)
        
        return jsonify({'success': True, 'data': user}), 201
    except Exception as e:
        logger.error(f"创建用户失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        users_data = read_json('storage/data/users.json')
        users = users_data.get('users', [])
        
        for user in users:
            if user['id'] == user_id:
                return jsonify({'success': True, 'data': user})
        
        return jsonify({'success': False, 'error': '用户不存在'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/artworks/upload', methods=['POST'])
def upload_artwork():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': '没有上传文件'}), 400
        
        file = request.files['file']
        user_id = request.form.get('user_id')
        
        if not user_id:
            return jsonify({'success': False, 'error': '缺少用户 ID'}), 400
        
        if file.filename == '':
            return jsonify({'success': False, 'error': '没有选择文件'}), 400
        
        # 保存文件
        filename = secure_filename(file.filename)
        artwork_id = str(uuid.uuid4())
        file_path = f'images/original/{artwork_id}_{filename}'
        full_path = os.path.join(BASE_DIR, 'storage', file_path)
        
        # 确保目录存在
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        file.save(full_path)
        
        # 返回可访问的 URL
        file_url = f'http://localhost:5001/storage/{file_path}'
        
        artwork = {
            'id': artwork_id,
            'user_id': user_id,
            'filename': filename,
            'file_path': file_url,
            'created_at': datetime.now().isoformat()
        }
        
        artworks_data = read_json('storage/data/artworks.json')
        artworks_data.setdefault('artworks', []).append(artwork)
        write_json('storage/data/artworks.json', artworks_data)
        
        return jsonify({'success': True, 'data': artwork}), 201
    except Exception as e:
        logger.error(f"文件上传失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/creations', methods=['POST'])
def create_creation():
    try:
        data = request.get_json()
        
        creation = {
            'id': str(uuid.uuid4()),
            'user_id': data['user_id'],
            'artwork_id': data['artwork_id'],
            'original_image': data['original_image'],
            'enhanced_image': None,
            'animation': None,
            'story': None,
            'status': 'uploaded',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        creations_data = read_json('storage/data/creations.json')
        creations_data.setdefault('creations', []).append(creation)
        write_json('storage/data/creations.json', creations_data)
        
        return jsonify({'success': True, 'data': creation}), 201
    except Exception as e:
        logger.error(f"创建创作失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/creations', methods=['GET'])
def get_creations():
    try:
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        
        creations_data = read_json('storage/data/creations.json')
        creations = creations_data.get('creations', [])
        
        # 按时间倒序
        sorted_creations = sorted(creations, key=lambda x: x.get('created_at', ''), reverse=True)
        
        return jsonify({
            'success': True,
            'data': {
                'creations': sorted_creations[offset:offset+limit],
                'total': len(sorted_creations),
                'limit': limit,
                'offset': offset
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/creations/<creation_id>', methods=['GET'])
def get_creation(creation_id):
    try:
        creations_data = read_json('storage/data/creations.json')
        creations = creations_data.get('creations', [])
        
        for creation in creations:
            if creation['id'] == creation_id:
                return jsonify({'success': True, 'data': creation})
        
        return jsonify({'success': False, 'error': '创作不存在'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# AI 处理路由（模拟实现）
@app.route('/api/artworks/<artwork_id>/enhance', methods=['POST'])
def enhance_artwork(artwork_id):
    """模拟图像优化"""
    try:
        data = request.get_json() or {}
        creation_id = data.get('creation_id')
        
        if not creation_id:
            return jsonify({'success': False, 'error': '缺少创作 ID'}), 400
        
        # 模拟处理延迟
        import time
        time.sleep(1)
        
        # 更新创作状态
        creations_data = read_json('storage/data/creations.json')
        creations = creations_data.get('creations', [])
        
        for creation in creations:
            if creation['id'] == creation_id:
                creation['status'] = 'enhanced'
                creation['enhanced_image'] = creation['original_image']  # 模拟：使用原图
                creation['updated_at'] = datetime.now().isoformat()
                write_json('storage/data/creations.json', creations_data)
                
                return jsonify({
                    'success': True,
                    'data': {'enhanced_image': creation['enhanced_image']},
                    'message': '图像优化完成（模拟）'
                })
        
        return jsonify({'success': False, 'error': '创作不存在'}), 404
    except Exception as e:
        logger.error(f"图像优化失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/artworks/<artwork_id>/animate', methods=['POST'])
def animate_artwork(artwork_id):
    """使用豆包生成动画"""
    try:
        data = request.get_json() or {}
        creation_id = data.get('creation_id')
        enhanced_image = data.get('enhanced_image')
        
        if not creation_id:
            return jsonify({'success': False, 'error': '缺少创作 ID'}), 400
        
        # 尝试使用豆包 API
        doubao_api_key = os.getenv('DOUBAO_API_KEY')
        
        if doubao_api_key:
            # 使用真实的豆包 API
            try:
                from backend.models.doubao_video_processor import DoubaoVideoProcessor
                
                processor = DoubaoVideoProcessor(api_key=doubao_api_key)
                
                # 获取图片路径
                if enhanced_image and enhanced_image.startswith('http'):
                    # 从 URL 提取本地路径
                    image_path = enhanced_image.replace('http://localhost:5001/storage/', '')
                    image_path = os.path.join(BASE_DIR, 'storage', image_path)
                else:
                    # 使用原始图片
                    creations_data = read_json('storage/data/creations.json')
                    creations = creations_data.get('creations', [])
                    for creation in creations:
                        if creation['id'] == creation_id:
                            original_image = creation['original_image']
                            if original_image.startswith('http'):
                                image_path = original_image.replace('http://localhost:5001/storage/', '')
                                image_path = os.path.join(BASE_DIR, 'storage', image_path)
                            else:
                                image_path = os.path.join(BASE_DIR, original_image)
                            break
                
                # 生成视频
                video_filename = f'{creation_id}_animation.mp4'
                video_path = os.path.join(BASE_DIR, 'storage', 'videos', video_filename)
                
                result = processor.generate_video(
                    image_path=image_path,
                    prompt="将这幅儿童画作变成一个生动有趣的动画，充满童趣和想象力",
                    duration=3,
                    output_path=video_path
                )
                
                if result['success']:
                    video_url = f'http://localhost:5001/storage/videos/{video_filename}'
                    
                    # 更新创作状态
                    creations_data = read_json('storage/data/creations.json')
                    creations = creations_data.get('creations', [])
                    
                    for creation in creations:
                        if creation['id'] == creation_id:
                            creation['status'] = 'animated'
                            creation['animation'] = video_url
                            creation['updated_at'] = datetime.now().isoformat()
                            write_json('storage/data/creations.json', creations_data)
                            break
                    
                    return jsonify({
                        'success': True,
                        'data': {'animation': video_url},
                        'message': '动画生成完成（豆包 AI）'
                    })
                else:
                    logger.warning(f"豆包 API 失败，使用模拟数据: {result.get('error')}")
                    # 失败则使用模拟数据
                    
            except Exception as e:
                logger.error(f"豆包 API 调用异常: {e}")
                # 异常则使用模拟数据
        
        # 模拟处理（如果没有配置豆包 API 或调用失败）
        import time
        time.sleep(1)
        
        # 更新创作状态
        creations_data = read_json('storage/data/creations.json')
        creations = creations_data.get('creations', [])
        
        for creation in creations:
            if creation['id'] == creation_id:
                creation['status'] = 'animated'
                creation['animation'] = 'https://www.w3schools.com/html/mov_bbb.mp4'  # 模拟视频
                creation['updated_at'] = datetime.now().isoformat()
                write_json('storage/data/creations.json', creations_data)
                
                return jsonify({
                    'success': True,
                    'data': {'animation': creation['animation']},
                    'message': '动画生成完成（模拟）'
                })
        
        return jsonify({'success': False, 'error': '创作不存在'}), 404
    except Exception as e:
        logger.error(f"动画生成失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

def build_full_story(story_tree):
    """根据故事树构建完整故事文本"""
    if not story_tree or 'root' not in story_tree:
        return ""
    
    parts = [story_tree['root']['content']]
    
    # 遍历所有非根节点
    for node_id, node in story_tree.items():
        if node_id != 'root':
            parts.append(node['content'])
    
    return '\n\n'.join(parts)

# 故事节点内容库 - 互动故事分支内容
STORY_NODES = {
    'root': {
        'content': '从前，在一个充满魔法的森林里，住着一只可爱的小兔子。它每天都在森林里探险，寻找新的朋友和有趣的故事。',
        'choices': [
            {'id': 'choice_1', 'text': '🌸 小兔子发现一朵会发光的花', 'next_node': 'flower'},
            {'id': 'choice_2', 'text': '🦋 小兔子遇到一只会说话的蝴蝶', 'next_node': 'butterfly'},
            {'id': 'choice_3', 'text': '🏠 小兔子找到一个神秘的小屋', 'next_node': 'house'}
        ],
        'is_endpoint': False
    },
    'flower': {
        'content': '小兔子发现了一朵会发光的花，这朵花告诉它："只要心怀善良，就能看到世界上最美的风景。"小兔子决定每天都来照顾这朵花。',
        'choices': [
            {'id': 'f1', 'text': '🌟 花送给小兔子一颗魔法种子', 'next_node': 'magic_seed'},
            {'id': 'f2', 'text': '🐰 小兔子邀请朋友们来看花', 'next_node': 'friends'},
        ],
        'is_endpoint': False
    },
    'butterfly': {
        'content': '会说话的蝴蝶告诉小兔子，森林深处有一个彩虹湖，湖水可以实现一个愿望。',
        'choices': [
            {'id': 'b1', 'text': '🌈 去彩虹湖许愿', 'next_node': 'rainbow_lake'},
            {'id': 'b2', 'text': '🎁 把愿望分享给朋友', 'next_node': 'share_wish'},
        ],
        'is_endpoint': False
    },
    'house': {
        'content': '神秘的小屋里住着一位智慧的老奶奶，她正在烘焙香喷喷的饼干。',
        'choices': [
            {'id': 'h1', 'text': '🍪 学习烤饼干的方法', 'next_node': 'cookies'},
            {'id': 'h2', 'text': '📖 听老奶奶讲故事', 'next_node': 'story_time'},
        ],
        'is_endpoint': False
    },
    'magic_seed': {
        'content': '小兔子种下了魔法种子，第二天长出了一棵结满糖果的树！从此森林里的小伙伴们都来分享甜蜜。',
        'choices': [],
        'is_endpoint': True
    },
    'friends': {
        'content': '朋友们都被发光的花吸引，它们决定一起建立一个"友谊花园"，让更多美丽的花开满森林。',
        'choices': [],
        'is_endpoint': True
    },
    'rainbow_lake': {
        'content': '小兔子来到彩虹湖边，湖水闪烁着七彩光芒。它闭上眼睛许愿："希望森林里的每一个朋友都能快乐。"突然，天空中出现了一道彩虹桥！',
        'choices': [],
        'is_endpoint': True
    },
    'share_wish': {
        'content': '小兔子把愿望分享给了朋友们，大家手拉手一起许愿。奇迹发生了——森林里到处开满了五颜六色的花！',
        'choices': [],
        'is_endpoint': True
    },
    'cookies': {
        'content': '小兔子学会了烤饼干，它回到森林开了一个"友谊饼干店"，所有朋友都能免费品尝！',
        'choices': [],
        'is_endpoint': True
    },
    'story_time': {
        'content': '老奶奶讲了一个关于勇气的故事，小兔子决定要成为森林里最勇敢的小兔子，保护所有的朋友。',
        'choices': [],
        'is_endpoint': True
    }
}

@app.route('/api/artworks/<artwork_id>/story', methods=['POST'])
def generate_story(artwork_id):
    """生成互动故事（带分支选择）"""
    try:
        data = request.get_json() or {}
        creation_id = data.get('creation_id')
        selected_choice = data.get('selected_choice')  # 用户选择的分支
        
        if not creation_id:
            return jsonify({'success': False, 'error': '缺少创作 ID'}), 400
        
        # 模拟处理延迟
        import time
        time.sleep(0.5)
        
        creations_data = read_json('storage/data/creations.json')
        creations = creations_data.get('creations', [])
        creation = None
        for c in creations:
            if c['id'] == creation_id:
                creation = c
                break
        
        if not creation:
            return jsonify({'success': False, 'error': '创作不存在'}), 404
        
        # 初始化互动故事结构
        if not creation.get('interactive_story'):
            creation['interactive_story'] = {'root': STORY_NODES['root'].copy()}
            creation['story'] = creation['interactive_story']['root']['content']
            creation['story_path'] = ['root']
        
        # 如果用户选择了分支，继续故事
        if selected_choice:
            story_tree = creation['interactive_story']
            current_node_id = creation.get('current_node', 'root')
            
            # 找到当前节点
            current_node = story_tree.get(current_node_id)
            if current_node:
                # 找到用户选择的选项
                selected_next = None
                for choice in current_node.get('choices', []):
                    if choice['id'] == selected_choice:
                        selected_next = choice['next_node']
                        break
                
                # 添加新节点到故事树
                if selected_next and selected_next in STORY_NODES:
                    new_node = STORY_NODES[selected_next].copy()
                    new_node['id'] = selected_next
                    story_tree[selected_next] = new_node
                    creation['current_node'] = selected_next
                    creation['story'] = new_node['content']
                    
                    # 记录故事路径
                    if 'story_path' not in creation:
                        creation['story_path'] = ['root']
                    creation['story_path'].append(selected_next)
        
        # 构建完整故事文本
        full_story = build_full_story(creation['interactive_story'])
        
        # 获取当前节点的选择
        current_node = creation['interactive_story'].get(creation.get('current_node', 'root'))
        has_choices = current_node and len(current_node.get('choices', [])) > 0
        
        creation['status'] = 'completed'
        creation['updated_at'] = datetime.now().isoformat()
        write_json('storage/data/creations.json', creations_data)
        
        return jsonify({
            'success': True,
            'data': {
                'story': creation['story'],
                'full_story': full_story,
                'interactive_story': creation['interactive_story'],
                'current_node': creation.get('current_node', 'root'),
                'story_path': creation.get('story_path', ['root']),
                'has_choices': has_choices,
                'choices': current_node.get('choices', []) if current_node else []
            },
            'message': '互动故事生成完成'
        })
        
    except Exception as e:
        logger.error(f"故事生成失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/creations/<creation_id>/guidance', methods=['POST'])
def get_creative_guidance(creation_id):
    """获取AI创作引导提示"""
    try:
        data = request.get_json() or {}
        step = data.get('step', 1)
        artwork_description = data.get('artwork_description', '')
        
        # 导入创作引导服务
        from services.creative_guidance import generate_ai_guidance
        
        result = generate_ai_guidance(
            artwork_id=creation_id,
            creation_step=step,
            artwork_description=artwork_description
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"创作引导生成失败: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'data': {
                'questions': ["想画什么呢？", "今天的心情是什么颜色？"],
                'suggestions': ["试着画一个你喜欢的形状"],
                'encouragement': "开始创作吧！✨"
            }
        }), 500

# ==================== 创作 CRUD 补全 ====================

@app.route('/api/creations/<creation_id>', methods=['PUT'])
def update_creation(creation_id):
    """更新创作记录"""
    try:
        data = request.get_json() or {}
        creations_data = read_json('storage/data/creations.json')
        creations = creations_data.get('creations', [])
        
        for creation in creations:
            if creation['id'] == creation_id:
                for key, value in data.items():
                    creation[key] = value
                creation['updated_at'] = datetime.now().isoformat()
                write_json('storage/data/creations.json', creations_data)
                return jsonify({'success': True, 'data': creation})
        
        return jsonify({'success': False, 'error': '创作不存在'}), 404
    except Exception as e:
        logger.error(f"更新创作失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/creations/<creation_id>', methods=['DELETE'])
def delete_creation(creation_id):
    """删除创作记录"""
    try:
        creations_data = read_json('storage/data/creations.json')
        creations = creations_data.get('creations', [])
        original_len = len(creations)
        creations_data['creations'] = [c for c in creations if c['id'] != creation_id]
        
        if len(creations_data['creations']) == original_len:
            return jsonify({'success': False, 'error': '创作不存在'}), 404
        
        write_json('storage/data/creations.json', creations_data)
        return jsonify({'success': True, 'message': '删除成功'})
    except Exception as e:
        logger.error(f"删除创作失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/creations/<creation_id>/process', methods=['POST'])
def process_creation(creation_id):
    """触发完整 AI 工作流：优化 → 动画 → 故事"""
    try:
        creations_data = read_json('storage/data/creations.json')
        creations = creations_data.get('creations', [])
        creation = None
        for c in creations:
            if c['id'] == creation_id:
                creation = c
                break
        
        if not creation:
            return jsonify({'success': False, 'error': '创作不存在'}), 404
        
        import time
        
        # 步骤1: 模拟图像优化
        creation['status'] = 'enhancing'
        creation['updated_at'] = datetime.now().isoformat()
        time.sleep(0.5)
        creation['enhanced_image'] = creation.get('original_image')
        creation['status'] = 'enhanced'
        
        # 步骤2: 模拟动画生成
        creation['status'] = 'animating'
        time.sleep(0.5)
        creation['animation'] = 'https://www.w3schools.com/html/mov_bbb.mp4'
        creation['status'] = 'animated'
        
        # 步骤3: 初始化互动故事
        creation['interactive_story'] = {'root': STORY_NODES['root'].copy()}
        creation['story'] = STORY_NODES['root']['content']
        creation['current_node'] = 'root'
        creation['story_path'] = ['root']
        creation['status'] = 'completed'
        creation['updated_at'] = datetime.now().isoformat()
        
        write_json('storage/data/creations.json', creations_data)
        
        return jsonify({
            'success': True,
            'data': creation,
            'message': '完整工作流处理完成'
        })
    except Exception as e:
        logger.error(f"完整工作流处理失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/creations/<creation_id>/export', methods=['POST'])
def export_creation(creation_id):
    """导出作品数据"""
    try:
        creations_data = read_json('storage/data/creations.json')
        creations = creations_data.get('creations', [])
        
        for creation in creations:
            if creation['id'] == creation_id:
                export_data = {
                    'title': f"我的作品 - {creation.get('created_at', '')[:10]}",
                    'created_at': creation.get('created_at'),
                    'story': creation.get('story'),
                    'full_story': build_full_story(creation.get('interactive_story', {})),
                    'story_path': creation.get('story_path', []),
                    'images': {
                        'original': creation.get('original_image'),
                        'enhanced': creation.get('enhanced_image')
                    },
                    'animation': creation.get('animation'),
                    'exported_at': datetime.now().isoformat()
                }
                return jsonify({'success': True, 'data': export_data})
        
        return jsonify({'success': False, 'error': '创作不存在'}), 404
    except Exception as e:
        logger.error(f"导出失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== 区块链存证 API ====================

@app.route('/api/blockchain/certify', methods=['POST'])
def certify_creation():
    """区块链存证（模拟）"""
    try:
        data = request.get_json() or {}
        creation_id = data.get('creation_id')
        
        if not creation_id:
            return jsonify({'success': False, 'error': '缺少创作 ID'}), 400
        
        import hashlib
        import time
        time.sleep(1)
        
        cert = {
            'id': f'CERT-{int(datetime.now().timestamp())}',
            'creation_id': creation_id,
            'blockchain': '蚂蚁链开放联盟链',
            'tx_hash': '0x' + hashlib.sha256(f'{creation_id}{datetime.now()}'.encode()).hexdigest(),
            'block_number': 1000000 + int(datetime.now().timestamp()) % 10000000,
            'content_hash': 'SHA256:' + hashlib.sha256(creation_id.encode()).hexdigest(),
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'status': '已上链存证'
        }
        
        # 持久化证书
        certs_path = 'storage/data/certificates.json'
        certs_data = read_json(certs_path)
        if not certs_data:
            certs_data = {'certificates': []}
        certs_data.setdefault('certificates', []).append(cert)
        write_json(certs_path, certs_data)
        
        return jsonify({'success': True, 'data': cert, 'message': '区块链存证成功'})
    except Exception as e:
        logger.error(f"区块链存证失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/blockchain/cert/<creation_id>', methods=['GET'])
def get_certificate(creation_id):
    """获取作品的区块链证书"""
    try:
        certs_data = read_json('storage/data/certificates.json')
        certs = certs_data.get('certificates', []) if certs_data else []
        
        for cert in certs:
            if cert.get('creation_id') == creation_id:
                return jsonify({'success': True, 'data': cert})
        
        return jsonify({'success': False, 'error': '未找到证书'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== 配音管理 API ====================

@app.route('/api/voiceover', methods=['POST'])
def save_voiceover():
    """保存配音记录"""
    try:
        data = request.get_json() or {}
        creation_id = data.get('creation_id')
        
        if not creation_id:
            return jsonify({'success': False, 'error': '缺少创作 ID'}), 400
        
        voiceover = {
            'id': str(uuid.uuid4()),
            'creation_id': creation_id,
            'name': data.get('name', '配音'),
            'speaker': data.get('speaker', '我'),
            'emoji': data.get('emoji', '🎤'),
            'duration': data.get('duration', '0:00'),
            'is_demo': data.get('is_demo', False),
            'text': data.get('text', ''),
            'created_at': datetime.now().isoformat()
        }
        
        vo_path = 'storage/data/voiceovers.json'
        vo_data = read_json(vo_path)
        if not vo_data:
            vo_data = {'voiceovers': []}
        vo_data.setdefault('voiceovers', []).append(voiceover)
        write_json(vo_path, vo_data)
        
        return jsonify({'success': True, 'data': voiceover}), 201
    except Exception as e:
        logger.error(f"保存配音失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/voiceover/<creation_id>', methods=['GET'])
def get_voiceovers(creation_id):
    """获取作品的配音列表"""
    try:
        vo_data = read_json('storage/data/voiceovers.json')
        voiceovers = vo_data.get('voiceovers', []) if vo_data else []
        result = [v for v in voiceovers if v.get('creation_id') == creation_id]
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== 教师管理 API ====================

@app.route('/api/teacher/dashboard', methods=['GET'])
def teacher_dashboard():
    """教师看板数据"""
    try:
        creations_data = read_json('storage/data/creations.json')
        users_data = read_json('storage/data/users.json')
        all_creations = creations_data.get('creations', [])
        all_users = users_data.get('users', [])
        
        # 本周创作（简化：取最近7天）
        from datetime import timedelta
        week_ago = (datetime.now() - timedelta(days=7)).isoformat()
        this_week = [c for c in all_creations if c.get('created_at', '') >= week_ago]
        
        # 学生排名（按作品数量）
        from collections import Counter
        user_work_counts = Counter(c.get('user_id') for c in all_creations)
        top_students = []
        for uid, count in user_work_counts.most_common(10):
            user_info = next((u for u in all_users if u.get('id') == uid), None)
            name = user_info.get('nickname', '未知') if user_info else uid[:8]
            top_students.append({
                'id': uid,
                'name': name,
                'works': count,
                'score': min(60 + count * 5, 95)
            })
        
        # 最近作品
        recent = sorted(all_creations, key=lambda x: x.get('created_at', ''), reverse=True)[:10]
        recent_works = []
        for c in recent:
            user_info = next((u for u in all_users if u.get('id') == c.get('user_id')), None)
            name = user_info.get('nickname', '未知') if user_info else '未知'
            recent_works.append({
                'id': c['id'],
                'student': name,
                'title': f"作品 {c['id'][:8]}",
                'time': c.get('created_at', ''),
                'hasStory': bool(c.get('story'))
            })
        
        dashboard = {
            'className': '创意美术班',
            'studentCount': len(all_users),
            'totalWorks': len(all_creations),
            'thisWeekWorks': len(this_week),
            'averageAbility': 78 if all_creations else 0,
            'topStudents': top_students,
            'recentWorks': recent_works
        }
        
        return jsonify({'success': True, 'data': dashboard})
    except Exception as e:
        logger.error(f"教师看板加载失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/teacher/students', methods=['GET'])
def teacher_students():
    """获取学生列表"""
    try:
        users_data = read_json('storage/data/users.json')
        creations_data = read_json('storage/data/creations.json')
        all_users = users_data.get('users', [])
        all_creations = creations_data.get('creations', [])
        
        from collections import Counter
        user_work_counts = Counter(c.get('user_id') for c in all_creations)
        
        students = []
        for user in all_users:
            uid = user.get('id')
            students.append({
                'id': uid,
                'name': user.get('nickname', '未知'),
                'works': user_work_counts.get(uid, 0),
                'created_at': user.get('created_at'),
                'score': min(60 + user_work_counts.get(uid, 0) * 5, 95)
            })
        
        students.sort(key=lambda x: x['works'], reverse=True)
        return jsonify({'success': True, 'data': students})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== 用户注册/登录 API ====================

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    """用户注册"""
    try:
        data = request.get_json() or {}
        nickname = data.get('nickname', '').strip()
        email = data.get('email', '').strip()
        
        if not nickname:
            return jsonify({'success': False, 'error': '昵称不能为空'}), 400
        
        users_data = read_json('storage/data/users.json')
        users = users_data.get('users', [])
        
        # 检查邮箱是否已存在
        if email:
            for u in users:
                if u.get('email') == email:
                    return jsonify({'success': False, 'error': '该邮箱已被注册'}), 400
        
        user = {
            'id': str(uuid.uuid4()),
            'nickname': nickname,
            'email': email,
            'avatar': data.get('avatar', ''),
            'creations': [],
            'created_at': datetime.now().isoformat()
        }
        
        users_data.setdefault('users', []).append(user)
        write_json('storage/data/users.json', users_data)
        
        return jsonify({'success': True, 'data': user}), 201
    except Exception as e:
        logger.error(f"注册失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login_user():
    """用户登录（简化：通过昵称登录）"""
    try:
        data = request.get_json() or {}
        nickname = data.get('nickname', '').strip()
        
        if not nickname:
            return jsonify({'success': False, 'error': '昵称不能为空'}), 400
        
        users_data = read_json('storage/data/users.json')
        users = users_data.get('users', [])
        
        for user in users:
            if user.get('nickname') == nickname:
                return jsonify({'success': True, 'data': user})
        
        # 自动注册
        user = {
            'id': str(uuid.uuid4()),
            'nickname': nickname,
            'email': '',
            'avatar': '',
            'creations': [],
            'created_at': datetime.now().isoformat()
        }
        users_data.setdefault('users', []).append(user)
        write_json('storage/data/users.json', users_data)
        
        return jsonify({'success': True, 'data': user, 'message': '新用户自动注册成功'}), 201
    except Exception as e:
        logger.error(f"登录失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== 错误处理 ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': '请求的资源不存在'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"服务器内部错误: {error}")
    return jsonify({'success': False, 'error': '服务器内部错误'}), 500

@app.errorhandler(413)
def file_too_large(error):
    return jsonify({'success': False, 'error': '上传文件过大'}), 413

@app.route('/api/users/<user_id>/progress', methods=['GET'])
def get_user_progress(user_id):
    """获取用户创作成长档案"""
    try:
        # 获取用户的所有创作
        creations_data = read_json('storage/data/creations.json')
        all_creations = creations_data.get('creations', [])
        user_creations = [c for c in all_creations if c.get('user_id') == user_id]
        
        # 导入成长分析服务
        from services.progress_analyzer import generate_progress_report
        
        result = generate_progress_report(user_id, user_creations)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"成长档案生成失败: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'data': {
                'total_creations': 0,
                'timeline': [],
                'ability_scores': {},
                'insights': []
            }
        }), 500

if __name__ == '__main__':
    logger.info("童画·奇境平台后端服务启动中（简化版 - 含互动故事和创作引导功能）...")
    app.run(debug=True, host='0.0.0.0', port=5001)