"""
AI创作引导助手 - 启发式提示生成器
分析画面并提供开放式创作建议，而非直接生成内容
"""

import random

# 启发式提示模板库
# 按画面元素分类，提供开放式问题引导孩子思考

PROMPT_TEMPLATES = {
    'character': {
        'questions': [
            "你的{character}看起来很开心，它在想什么呢？",
            "{character}现在在哪里？它要去哪里冒险？",
            "{character}有朋友吗？它们会一起做什么？",
            "{character}最喜欢吃什么食物？可以画出来吗？",
            "{character}今天穿什么衣服？有什么特别的地方吗？",
        ],
        'suggestions': [
            "试着给你的{character}加一个表情，让它更生动",
            "{character}周围可以有一些它喜欢的东西",
            "想想看，{character}的家会是什么样子的？",
        ]
    },
    'scene': {
        'questions': [
            "这是什么地方？有什么特别的故事发生在这里吗？",
            "这里的天气怎么样？是晴天还是雨天？",
            "这个场景里还缺什么？门？窗户？还是一棵树？",
            "这里会发生什么样的冒险故事？",
            "如果你可以走进这幅画，你最想去哪里？",
        ],
        'suggestions': [
            "可以在天上加一些东西，比如云、太阳或月亮",
            "地面可以有一些小细节，比如草、花或石头",
            "远处可以画一些山或房子，让画面更有层次感",
        ]
    },
    'action': {
        'questions': [
            "画面中的人物在做什么？接下来会发生什么？",
            "这个动作之前发生了什么故事？",
            "其他人看到这个场景会有什么反应？",
            "如果是你，你会怎么帮助画面中的人物？",
        ],
        'suggestions': [
            "可以画一些动作的线条，让人物看起来在动",
            "加上一些飘动的效果，比如风或魔法",
            "人物的姿势可以更有动感一些",
        ]
    },
    'detail': {
        'questions': [
            "这里还可以加什么小东西让画面更有趣？",
            "有什么秘密藏在画面里等着被发现？",
            "如果给这幅画加上声音，会听到什么？",
            "画面中有什么东西在发光或发亮吗？",
        ],
        'suggestions': [
            "角落可以加一个小彩蛋，比如一只小虫子",
            "试试用不同的线条表现不同的质感",
            "可以在空白的地方加一些装饰图案",
        ]
    }
}

# 画面元素识别关键词（简化版模拟）
ELEMENT_KEYWORDS = {
    'character': ['人', '小孩', '动物', '兔子', '猫', '狗', '鸟', '鱼', '熊', '大象', '老虎', '狮子'],
    'scene': ['房子', '树', '山', '海', '天空', '草地', '花园', '森林', '城堡'],
    'action': ['跑', '跳', '飞', '游', '吃', '玩', '睡觉', '笑', '哭'],
    'detail': ['花', '云', '星星', '太阳', '月亮', '彩虹', '蝴蝶', '气球']
}

def analyze_artwork_keywords(artwork_description=""):
    """
    分析画面内容，识别关键元素
    实际项目中应该使用图像识别API，这里用关键词模拟
    """
    detected_elements = {
        'character': [],
        'scene': [],
        'action': [],
        'detail': []
    }
    
    # 简单的关键词匹配（实际应用中使用AI视觉模型）
    description_lower = artwork_description.lower()
    
    for category, keywords in ELEMENT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in description_lower:
                detected_elements[category].append(keyword)
    
    return detected_elements

def generate_guidance_prompts(artwork_description="", previous_prompts=None):
    """
    生成启发式创作提示
    
    Args:
        artwork_description: 画作描述或识别结果
        previous_prompts: 已经展示过的提示，避免重复
    
    Returns:
        dict: 包含问题和建议的提示列表
    """
    if previous_prompts is None:
        previous_prompts = []
    
    # 分析画面元素
    elements = analyze_artwork_keywords(artwork_description)
    
    prompts = {
        'questions': [],
        'suggestions': [],
        'category': None
    }
    
    # 根据检测到的元素选择提示类别
    detected_categories = [cat for cat, items in elements.items() if items]
    
    if not detected_categories:
        # 如果没有识别到具体元素，提供通用提示
        prompts['questions'] = [
            "这幅画讲的是什么故事？可以告诉我吗？",
            "你画的是在哪里？是什么地方？",
            "画面里最特别的是什么？",
        ]
        prompts['suggestions'] = [
            "试着给画面加一个边框，像画框一样",
            "可以在角落签上你的名字和日期",
            "用你喜欢的颜色给背景涂满",
        ]
        prompts['category'] = 'general'
        return prompts
    
    # 根据优先级选择提示类别
    priority = ['character', 'scene', 'action', 'detail']
    selected_category = None
    
    for cat in priority:
        if cat in detected_categories:
            selected_category = cat
            break
    
    if not selected_category:
        selected_category = detected_categories[0]
    
    prompts['category'] = selected_category
    templates = PROMPT_TEMPLATES[selected_category]
    
    # 替换模板中的占位符
    element_items = elements[selected_category]
    element_name = element_items[0] if element_items else '主角'
    
    # 生成3个问题和2个建议
    questions = templates['questions']
    suggestions = templates['suggestions']
    
    # 随机选择并替换占位符
    import random
    selected_questions = random.sample(questions, min(3, len(questions)))
    selected_suggestions = random.sample(suggestions, min(2, len(suggestions)))
    
    prompts['questions'] = [q.format(character=element_name) for q in selected_questions]
    prompts['suggestions'] = [s.format(character=element_name) for s in selected_suggestions]
    
    return prompts

def get_progressive_prompts(step=1, artwork_description=""):
    """
    根据创作阶段提供渐进式提示
    
    step: 1=开始阶段, 2=构图阶段, 3=细化阶段, 4=完善阶段
    """
    stage_prompts = {
        1: {  # 开始阶段
            'questions': [
                "你想画什么呢？一个人物、一个地方，还是一个故事？",
                "今天画画的心情是什么颜色的？",
                "你的画里会发生什么样的魔法？",
            ],
            'suggestions': [
                "先画一个你最喜欢的形状开始",
                "想想看，画面中间应该放什么？",
                "可以用你喜欢的颜色先涂一块背景",
            ],
            'encouragement': "开始是最棒的一步！✨"
        },
        2: {  # 构图阶段
            'questions': [
                "画面里谁最重要？把它画得大一点",
                "主角在哪里？天上、地上还是水里？",
                "还有什么可以和主角做朋友？",
            ],
            'suggestions': [
                "试着画不同大小的东西，让画面更有趣",
                "有些东西可以画在边缘，有些东西在中间",
                "留白的地方后面可以加细节",
            ],
            'encouragement': "构图很棒！继续加油！🎨"
        },
        3: {  # 细化阶段
            'questions': [
                "主角的表情是什么样的？开心、惊讶还是勇敢？",
                "这里可以加什么小东西让故事更丰富？",
                "画面里会发生什么有趣的事情？",
            ],
            'suggestions': [
                "可以给主角加上手和脚，让它能动起来",
                "试试画一些重复的东西，比如很多花或很多云",
                "加一些线条表示风、速度或声音",
            ],
            'encouragement': "细节让画面活起来了！🌟"
        },
        4: {  # 完善阶段
            'questions': [
                "如果这幅画有标题，会叫什么名字？",
                "画里有隐藏的小秘密吗？",
                "给这幅画编一个三句话的故事吧",
            ],
            'suggestions': [
                "在角落签上你的名字，这是你的杰作",
                "可以给画加一个漂亮的边框",
                "看看有没有空白的地方可以加点装饰",
            ],
            'encouragement': "一幅精彩的作品即将完成！🎉"
        }
    }
    
    return stage_prompts.get(step, stage_prompts[1])

# 用于后端API的函数
def generate_ai_guidance(artwork_id=None, creation_step=1, artwork_description=""):
    """
    主函数：生成AI创作引导
    供后端API调用
    """
    if creation_step <= 2:
        # 早期阶段使用渐进式提示
        prompts = get_progressive_prompts(creation_step, artwork_description)
    else:
        # 后期阶段基于内容分析提供提示
        prompts = generate_guidance_prompts(artwork_description)
        prompts['encouragement'] = "你的想法越来越丰富了！✨"
    
    return {
        'success': True,
        'data': {
            'step': creation_step,
            'questions': prompts.get('questions', []),
            'suggestions': prompts.get('suggestions', []),
            'encouragement': prompts.get('encouragement', '继续加油！'),
            'category': prompts.get('category', 'general')
        },
        'message': '创作引导生成成功'
    }
