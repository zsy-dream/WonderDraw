"""
创作分析服务 - 作品成长档案与能力评估
分析儿童创作数据，生成成长时间轴和能力雷达图
"""

from datetime import datetime
from collections import defaultdict

def analyze_creation_progress(creations):
    """
    分析创作进步轨迹
    
    Args:
        creations: 用户的所有创作记录列表
    
    Returns:
        dict: 包含时间轴和能力评估的数据
    """
    if not creations:
        return {
            'timeline': [],
            'ability_scores': {},
            'total_creations': 0,
            'creation_span_days': 0
        }
    
    # 按时间排序
    sorted_creations = sorted(creations, key=lambda x: x.get('created_at', ''))
    
    # 构建时间轴
    timeline = []
    for i, creation in enumerate(sorted_creations):
        timeline_item = {
            'id': creation.get('id'),
            'date': creation.get('created_at'),
            'index': i + 1,
            'thumbnail': creation.get('original_image'),
            'status': creation.get('status'),
            'has_story': bool(creation.get('story')),
            'has_animation': bool(creation.get('animation')),
            'story_branches': len(creation.get('story_path', [])) if creation.get('story_path') else 0,
            'milestone': get_milestone(i + 1, len(sorted_creations))
        }
        timeline.append(timeline_item)
    
    # 计算能力维度得分 (模拟算法)
    ability_scores = calculate_ability_scores(sorted_creations)
    
    # 计算创作跨度
    if len(sorted_creations) >= 2:
        first_date = datetime.fromisoformat(sorted_creations[0].get('created_at', '').replace('Z', '+00:00'))
        last_date = datetime.fromisoformat(sorted_creations[-1].get('created_at', '').replace('Z', '+00:00'))
        creation_span_days = (last_date - first_date).days
    else:
        creation_span_days = 0
    
    return {
        'timeline': timeline,
        'ability_scores': ability_scores,
        'total_creations': len(creations),
        'creation_span_days': creation_span_days,
        'first_creation_date': sorted_creations[0].get('created_at') if sorted_creations else None,
        'latest_creation_date': sorted_creations[-1].get('created_at') if sorted_creations else None
    }

def get_milestone(index, total):
    """获取创作里程碑标签"""
    milestones = {
        1: '🎉 第一幅作品',
        5: '🌟 创作达人',
        10: '🏆 小艺术家',
        20: '🎨 创意大师',
        50: '👑 艺术之星'
    }
    
    # 返回最大的符合条件的里程碑
    achieved = [m for idx, m in milestones.items() if index == idx]
    return achieved[-1] if achieved else None

def calculate_ability_scores(creations):
    """
    计算5维能力评分
    - 色彩感知力 (color_perception)
    - 构图能力 (composition)
    - 叙事想象力 (narrative)
    - 细节丰富度 (detail_richness)
    - 创意独特性 (creativity)
    
    算法：基于作品特征模拟评分（实际应用应使用AI分析图像）
    """
    if not creations:
        return {
            'color_perception': 0,
            'composition': 0,
            'narrative': 0,
            'detail_richness': 0,
            'creativity': 0
        }
    
    n = len(creations)
    
    # 基础分数 (60-70)
    base_score = 60 + min(n * 2, 20)  # 随着作品数量增加基础分
    
    # 计算各维度
    # 色彩感知：有优化图片的分数更高
    color_perception = min(base_score + sum(1 for c in creations if c.get('enhanced_image')) * 5, 95)
    
    # 构图能力：基于作品完成度
    composition = min(base_score + sum(1 for c in creations if c.get('status') == 'completed') * 3, 90)
    
    # 叙事想象力：有故事且分支多的分数高
    narrative_scores = []
    for c in creations:
        score = 0
        if c.get('story'):
            score += 10
            if c.get('story_path'):
                score += len(c.get('story_path')) * 5
        narrative_scores.append(min(score, 30))
    narrative = base_score + (sum(narrative_scores) / len(narrative_scores) if narrative_scores else 0)
    narrative = min(narrative, 92)
    
    # 细节丰富度：基于创作时间（假设创作时间长的更细致）
    detail_richness = min(base_score + n * 3, 88)
    
    # 创意独特性：随机分布使分数差异化（实际应使用AI分析图像独特性）
    import random
    random.seed(n)  # 固定种子使结果可复现
    creativity = min(base_score + random.randint(0, 25), 94)
    
    return {
        'color_perception': round(color_perception),
        'composition': round(composition),
        'narrative': round(narrative),
        'detail_richness': round(detail_richness),
        'creativity': round(creativity)
    }

def get_growth_insights(progress_data):
    """
    生成成长洞察和建议
    """
    insights = []
    scores = progress_data.get('ability_scores', {})
    total = progress_data.get('total_creations', 0)
    
    # 基于数据生成个性化建议
    if total == 0:
        insights.append({
            'type': 'welcome',
            'icon': '👋',
            'title': '欢迎来到童话·奇境',
            'message': '开始你的第一幅创作，开启艺术之旅！'
        })
    elif total < 3:
        insights.append({
            'type': 'beginner',
            'icon': '🌱',
            'title': '创作萌芽期',
            'message': f'已完成{total}幅作品，继续探索不同的主题吧！'
        })
    elif total < 10:
        insights.append({
            'type': 'growing',
            'icon': '🌿',
            'title': '快速成长中',
            'message': f'太棒了！已完成{total}幅作品，尝试创作一个系列故事吧！'
        })
    else:
        insights.append({
            'type': 'advanced',
            'icon': '🌳',
            'title': '小小艺术家',
            'message': f'惊人！已完成{total}幅作品，你的创作越来越丰富了！'
        })
    
    # 能力维度建议
    if scores:
        min_ability = min(scores.items(), key=lambda x: x[1])
        ability_names = {
            'color_perception': '色彩感知',
            'composition': '构图能力',
            'narrative': '叙事想象',
            'detail_richness': '细节丰富度',
            'creativity': '创意独特性'
        }
        
        if min_ability[1] < 70:
            insights.append({
                'type': 'improvement',
                'icon': '📈',
                'title': f'{ability_names.get(min_ability[0], min_ability[0])}提升建议',
                'message': f'当前得分{min_ability[1]}分，建议多尝试不同风格的创作来提升这个能力！'
            })
    
    # 最强能力
    if scores:
        max_ability = max(scores.items(), key=lambda x: x[1])
        if max_ability[1] > 80:
            insights.append({
                'type': 'strength',
                'icon': '⭐',
                'title': f'你的强项：{ability_names.get(max_ability[0], max_ability[0])}',
                'message': f'{max_ability[1]}分！在这个方面你表现非常出色！'
            })
    
    return insights

def generate_progress_report(user_id, creations):
    """
    生成完整的成长报告（供后端API调用）
    """
    progress_data = analyze_creation_progress(creations)
    insights = get_growth_insights(progress_data)
    
    return {
        'success': True,
        'data': {
            'user_id': user_id,
            'summary': {
                'total_creations': progress_data['total_creations'],
                'creation_span_days': progress_data['creation_span_days'],
                'first_creation_date': progress_data['first_creation_date'],
                'latest_creation_date': progress_data['latest_creation_date']
            },
            'timeline': progress_data['timeline'],
            'ability_scores': progress_data['ability_scores'],
            'insights': insights
        },
        'message': '成长档案生成成功'
    }
