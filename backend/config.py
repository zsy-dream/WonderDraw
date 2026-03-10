import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """应用配置类"""
    
    # Flask 配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # 存储配置
    BASE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    STORAGE_PATH = os.path.join(BASE_PATH, 'storage')
    UPLOAD_FOLDER = os.path.join(STORAGE_PATH, 'images', 'original')
    ENHANCED_FOLDER = os.path.join(STORAGE_PATH, 'images', 'enhanced')
    VIDEO_FOLDER = os.path.join(STORAGE_PATH, 'videos')
    EXPORT_FOLDER = os.path.join(STORAGE_PATH, 'exports')
    DATA_FOLDER = os.path.join(STORAGE_PATH, 'data')
    
    # 文件上传配置
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
    
    # AI 模型配置
    CONTROLNET_MODEL_ID = os.environ.get('CONTROLNET_MODEL_ID', 'runwayml/stable-diffusion-v1-5')
    CONTROLNET_ID = os.environ.get('CONTROLNET_ID', 'lllyasviel/control_v11p_sd15_scribble')
    SVD_MODEL_ID = os.environ.get('SVD_MODEL_ID', 'stabilityai/stable-video-diffusion-img2vid')
    
    # LLM 配置
    LLM_PROVIDER = os.environ.get('LLM_PROVIDER', 'deepseek')
    LLM_API_KEY = os.environ.get('LLM_API_KEY', '')
    LLM_API_URL = os.environ.get('LLM_API_URL', 'https://api.deepseek.com/v1/chat/completions')
    LLM_MAX_TOKENS = 500
    LLM_TEMPERATURE = 0.8
    
    # 视频生成配置
    VIDEO_FPS = 24
    VIDEO_MIN_DURATION = 2
    VIDEO_MAX_DURATION = 4
