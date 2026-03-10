"""
LLM 故事生成示例

演示如何使用 LLMProcessor 生成儿童故事
"""

import os
import sys

# 添加父目录到路径以便导入模块
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.llm_processor import LLMProcessor
from config import Config
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def main():
    """主函数"""
    
    # 检查 API 密钥
    if not Config.LLM_API_KEY:
        logger.error("请在 .env 文件中设置 LLM_API_KEY")
        return
    
    # 初始化 LLM 处理器
    logger.info("初始化 LLM 处理器...")
    processor = LLMProcessor(
        api_key=Config.LLM_API_KEY,
        api_url=Config.LLM_API_URL,
        provider=Config.LLM_PROVIDER,
        max_tokens=Config.LLM_MAX_TOKENS,
        temperature=Config.LLM_TEMPERATURE
    )
    
    # 示例图像描述
    image_descriptions = [
        "一只可爱的小兔子在花园里玩耍，周围有五颜六色的花朵和蝴蝶",
        "一个小男孩和他的机器人朋友在星空下探险",
        "一座彩虹桥连接着两座云朵城堡，小精灵们在桥上跳舞"
    ]
    
    # 为每个描述生成故事
    for i, description in enumerate(image_descriptions, 1):
        logger.info(f"\n{'='*60}")
        logger.info(f"示例 {i}: {description}")
        logger.info('='*60)
        
        try:
            # 生成故事
            story = processor.generate_story(description)
            
            # 输出结果
            logger.info(f"\n生成的故事：\n{story}")
            logger.info(f"\n故事长度: {len(story)} 字")
            
            # 验证故事长度
            if processor.MIN_STORY_LENGTH <= len(story) <= processor.MAX_STORY_LENGTH:
                logger.info("✓ 故事长度符合要求")
            else:
                logger.warning("✗ 故事长度不符合要求")
            
        except Exception as e:
            logger.error(f"生成故事失败: {str(e)}")
    
    logger.info("\n示例运行完成")


if __name__ == '__main__':
    main()
