"""AI 服务 - 协调各种 AI 模型的工作流"""
import logging
from typing import Dict, Optional
from backend.models.controlnet_processor import ControlNetProcessor
from backend.models.svd_processor import SVDProcessor
from backend.models.llm_processor import LLMProcessor
from backend.services.creation_service import CreationService

logger = logging.getLogger(__name__)


class AIService:
    """AI 服务类
    
    负责协调 ControlNet、SVD 和 LLM 模型的工作流程
    """
    
    def __init__(self):
        """初始化 AI 服务"""
        self.controlnet_processor = None
        self.svd_processor = None
        self.llm_processor = None
        self.creation_service = CreationService()
        
        # 延迟加载模型以提高启动速度
        self._models_loaded = False
    
    def _load_models(self):
        """延迟加载 AI 模型"""
        if self._models_loaded:
            return
        
        try:
            logger.info("正在加载 AI 模型...")
            self.controlnet_processor = ControlNetProcessor()
            self.svd_processor = SVDProcessor()
            self.llm_processor = LLMProcessor()
            self._models_loaded = True
            logger.info("AI 模型加载完成")
        except Exception as e:
            logger.error(f"AI 模型加载失败: {e}")
            raise
    
    def enhance_image(self, creation_id: str, original_image_path: str) -> Dict[str, any]:
        """
        使用 ControlNet 优化图像
        
        Args:
            creation_id: 创作 ID
            original_image_path: 原始图像路径
            
        Returns:
            处理结果字典
        """
        try:
            self._load_models()
            
            # 更新状态为处理中
            self.creation_service.update_creation(creation_id, {
                "status": CreationService.STATUS_ENHANCING
            })
            
            # 调用 ControlNet 处理
            result = self.controlnet_processor.process(original_image_path)
            
            if result["success"]:
                # 更新创作记录
                self.creation_service.update_creation(creation_id, {
                    "status": CreationService.STATUS_ENHANCED,
                    "enhanced_image": result["enhanced_image"]
                })
                
                return {
                    "success": True,
                    "enhanced_image": result["enhanced_image"],
                    "message": "图像优化完成"
                }
            else:
                # 处理失败
                self.creation_service.update_creation(creation_id, {
                    "status": CreationService.STATUS_FAILED
                })
                
                return {
                    "success": False,
                    "error": result.get("error", "图像优化失败")
                }
                
        except Exception as e:
            logger.error(f"图像优化失败: {e}")
            self.creation_service.update_creation(creation_id, {
                "status": CreationService.STATUS_FAILED
            })
            
            return {
                "success": False,
                "error": str(e)
            }
    
    def generate_animation(self, creation_id: str, enhanced_image_path: str) -> Dict[str, any]:
        """
        使用 SVD 生成动画
        
        Args:
            creation_id: 创作 ID
            enhanced_image_path: 优化后的图像路径
            
        Returns:
            处理结果字典
        """
        try:
            self._load_models()
            
            # 更新状态为处理中
            self.creation_service.update_creation(creation_id, {
                "status": CreationService.STATUS_ANIMATING
            })
            
            # 调用 SVD 处理
            result = self.svd_processor.generate_video(enhanced_image_path)
            
            if result["success"]:
                # 更新创作记录
                self.creation_service.update_creation(creation_id, {
                    "status": CreationService.STATUS_ANIMATED,
                    "animation": result["video_path"]
                })
                
                return {
                    "success": True,
                    "animation": result["video_path"],
                    "message": "动画生成完成"
                }
            else:
                # 处理失败
                self.creation_service.update_creation(creation_id, {
                    "status": CreationService.STATUS_FAILED
                })
                
                return {
                    "success": False,
                    "error": result.get("error", "动画生成失败")
                }
                
        except Exception as e:
            logger.error(f"动画生成失败: {e}")
            self.creation_service.update_creation(creation_id, {
                "status": CreationService.STATUS_FAILED
            })
            
            return {
                "success": False,
                "error": str(e)
            }
    
    def generate_story(self, creation_id: str, image_description: str = "") -> Dict[str, any]:
        """
        使用 LLM 生成故事
        
        Args:
            creation_id: 创作 ID
            image_description: 图像描述（可选）
            
        Returns:
            处理结果字典
        """
        try:
            self._load_models()
            
            # 更新状态为处理中
            self.creation_service.update_creation(creation_id, {
                "status": CreationService.STATUS_STORY_GEN
            })
            
            # 调用 LLM 处理
            result = self.llm_processor.generate_story(image_description)
            
            if result["success"]:
                # 更新创作记录
                self.creation_service.update_creation(creation_id, {
                    "status": CreationService.STATUS_COMPLETED,
                    "story": result["story"]
                })
                
                return {
                    "success": True,
                    "story": result["story"],
                    "message": "故事生成完成"
                }
            else:
                # 处理失败
                self.creation_service.update_creation(creation_id, {
                    "status": CreationService.STATUS_FAILED
                })
                
                return {
                    "success": False,
                    "error": result.get("error", "故事生成失败")
                }
                
        except Exception as e:
            logger.error(f"故事生成失败: {e}")
            self.creation_service.update_creation(creation_id, {
                "status": CreationService.STATUS_FAILED
            })
            
            return {
                "success": False,
                "error": str(e)
            }
    
    def process_full_workflow(self, creation_id: str, original_image_path: str) -> Dict[str, any]:
        """
        执行完整的 AI 工作流（图像优化 → 动画生成 → 故事生成）
        
        Args:
            creation_id: 创作 ID
            original_image_path: 原始图像路径
            
        Returns:
            处理结果字典
        """
        try:
            # 步骤 1: 图像优化
            enhance_result = self.enhance_image(creation_id, original_image_path)
            if not enhance_result["success"]:
                return enhance_result
            
            # 步骤 2: 动画生成
            animation_result = self.generate_animation(creation_id, enhance_result["enhanced_image"])
            if not animation_result["success"]:
                return animation_result
            
            # 步骤 3: 故事生成
            story_result = self.generate_story(creation_id)
            if not story_result["success"]:
                return story_result
            
            return {
                "success": True,
                "message": "完整工作流处理完成",
                "enhanced_image": enhance_result["enhanced_image"],
                "animation": animation_result["animation"],
                "story": story_result["story"]
            }
            
        except Exception as e:
            logger.error(f"完整工作流处理失败: {e}")
            return {
                "success": False,
                "error": str(e)
            }