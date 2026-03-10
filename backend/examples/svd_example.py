"""
SVDProcessor 使用示例

演示如何使用 SVDProcessor 将静态图像转换为动画视频
"""

import os
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from models.svd_processor import SVDProcessor
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def main():
    """主函数"""
    # 配置
    MODEL_ID = "stabilityai/stable-video-diffusion-img2vid"
    INPUT_IMAGE = "storage/images/enhanced/sample.png"  # 优化后的图像
    OUTPUT_VIDEO = "storage/videos/sample_animation.mp4"
    
    # 检查输入文件是否存在
    if not os.path.exists(INPUT_IMAGE):
        logger.error(f"输入图像不存在: {INPUT_IMAGE}")
        logger.info("请先运行 controlnet_example.py 生成优化图像")
        return
    
    try:
        # 1. 初始化 SVD 处理器
        logger.info("=" * 60)
        logger.info("步骤 1: 初始化 SVD 处理器")
        logger.info("=" * 60)
        
        processor = SVDProcessor(
            model_id=MODEL_ID,
            device='cuda'  # 使用 'cpu' 如果没有 GPU
        )
        
        # 2. 配置视频参数
        logger.info("\n" + "=" * 60)
        logger.info("步骤 2: 配置视频参数")
        logger.info("=" * 60)
        
        # 生成 2 秒视频，24 FPS
        processor.configure_parameters(
            fps=24,
            duration=2  # 2-4 秒之间
        )
        
        logger.info(f"配置完成: FPS={processor.fps}, 帧数={processor.num_frames}, 时长={processor.duration}秒")
        
        # 3. 生成视频
        logger.info("\n" + "=" * 60)
        logger.info("步骤 3: 生成视频动画")
        logger.info("=" * 60)
        
        output_path = processor.generate_video(
            input_image_path=INPUT_IMAGE,
            output_path=OUTPUT_VIDEO,
            num_inference_steps=25,  # 推理步数（质量 vs 速度）
            motion_bucket_id=127,    # 运动强度（0-255）
            noise_aug_strength=0.02  # 噪声增强（0-1）
        )
        
        logger.info(f"\n✓ 视频生成成功！")
        logger.info(f"输出路径: {output_path}")
        logger.info(f"视频时长: {processor.duration} 秒")
        logger.info(f"帧率: {processor.fps} FPS")
        logger.info(f"总帧数: {processor.num_frames}")
        
        # 4. 清理资源
        logger.info("\n" + "=" * 60)
        logger.info("步骤 4: 清理资源")
        logger.info("=" * 60)
        
        processor.unload_model()
        logger.info("模型已卸载")
        
    except Exception as e:
        logger.error(f"处理失败: {str(e)}", exc_info=True)
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
