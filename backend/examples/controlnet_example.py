"""
ControlNetProcessor 使用示例

演示如何使用 ControlNetProcessor 优化儿童简笔画
"""

import os
import sys

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.controlnet_processor import ControlNetProcessor
from config import Config


def main():
    """主函数 - 演示 ControlNet 图像优化流程"""
    
    print("=" * 60)
    print("ControlNetProcessor 使用示例")
    print("=" * 60)
    
    # 1. 初始化处理器
    print("\n1. 初始化 ControlNetProcessor...")
    print(f"   模型: {Config.CONTROLNET_MODEL_ID}")
    print(f"   ControlNet: {Config.CONTROLNET_ID}")
    
    processor = ControlNetProcessor(
        model_id=Config.CONTROLNET_MODEL_ID,
        controlnet_id=Config.CONTROLNET_ID
    )
    
    print(f"   设备: {processor.device}")
    print("   ✓ 模型加载成功")
    
    # 2. 准备输入输出路径
    print("\n2. 准备文件路径...")
    
    # 示例输入图像路径（需要替换为实际路径）
    input_image = os.path.join(Config.UPLOAD_FOLDER, "example_drawing.png")
    
    # 输出图像路径
    output_image = os.path.join(Config.ENHANCED_FOLDER, "enhanced_drawing.png")
    
    print(f"   输入: {input_image}")
    print(f"   输出: {output_image}")
    
    # 检查输入文件是否存在
    if not os.path.exists(input_image):
        print(f"\n   ⚠ 警告: 输入文件不存在")
        print(f"   请将测试图像放置在: {input_image}")
        print(f"   或修改 input_image 变量指向实际文件")
        return
    
    # 3. 处理图像
    print("\n3. 开始处理图像...")
    print("   这可能需要几分钟时间，请耐心等待...")
    
    try:
        result_path = processor.process(
            input_image_path=input_image,
            output_path=output_image,
            # 使用默认的儿童插画风格提示词
            # prompt=None,  # 将使用 DEFAULT_PROMPT
            # negative_prompt=None,  # 将使用 DEFAULT_NEGATIVE_PROMPT
            num_inference_steps=20,  # 推理步数（可调整，越高质量越好但越慢）
            guidance_scale=7.5,  # 引导强度
            controlnet_conditioning_scale=1.0  # ControlNet 条件强度
        )
        
        print(f"   ✓ 处理完成!")
        print(f"   优化图像已保存: {result_path}")
        
    except Exception as e:
        print(f"   ✗ 处理失败: {str(e)}")
        return
    
    # 4. 清理（可选）
    print("\n4. 清理资源...")
    processor.unload_models()
    print("   ✓ 模型已卸载")
    
    print("\n" + "=" * 60)
    print("示例完成!")
    print("=" * 60)


def custom_prompt_example():
    """自定义提示词示例"""
    
    print("\n" + "=" * 60)
    print("自定义提示词示例")
    print("=" * 60)
    
    processor = ControlNetProcessor(
        model_id=Config.CONTROLNET_MODEL_ID,
        controlnet_id=Config.CONTROLNET_ID
    )
    
    # 自定义提示词
    custom_prompt = "watercolor painting, soft colors, dreamy, artistic, children's illustration"
    custom_negative = "realistic, photographic, dark, scary, violent"
    
    input_image = os.path.join(Config.UPLOAD_FOLDER, "example_drawing.png")
    output_image = os.path.join(Config.ENHANCED_FOLDER, "custom_style_drawing.png")
    
    if not os.path.exists(input_image):
        print(f"输入文件不存在: {input_image}")
        return
    
    print(f"\n自定义提示词: {custom_prompt}")
    print(f"负面提示词: {custom_negative}")
    
    try:
        result_path = processor.process(
            input_image_path=input_image,
            output_path=output_image,
            prompt=custom_prompt,
            negative_prompt=custom_negative,
            num_inference_steps=25,  # 更多步数以获得更好质量
            guidance_scale=8.0,  # 更强的引导
            controlnet_conditioning_scale=0.8  # 稍微降低以允许更多创意
        )
        
        print(f"✓ 自定义风格图像已保存: {result_path}")
        
    except Exception as e:
        print(f"✗ 处理失败: {str(e)}")
    
    processor.unload_models()


if __name__ == "__main__":
    # 运行基本示例
    main()
    
    # 取消注释以运行自定义提示词示例
    # custom_prompt_example()
