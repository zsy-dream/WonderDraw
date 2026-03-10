// 童话·奇境 常量配置

// 文件上传配置
export const UPLOAD_CONFIG = {
  ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

// 创作流程步骤
export const CREATION_STEPS = {
  UPLOAD: 'upload',
  ENHANCING: 'enhancing',
  ENHANCED: 'enhanced',
  ANIMATING: 'animating',
  ANIMATED: 'animated',
  STORY_GEN: 'story_gen',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// 创作状态
export const CREATION_STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
};

// 步骤显示名称
export const STEP_LABELS = {
  [CREATION_STEPS.UPLOAD]: '上传画作',
  [CREATION_STEPS.ENHANCING]: 'AI 优化中',
  [CREATION_STEPS.ENHANCED]: '优化完成',
  [CREATION_STEPS.ANIMATING]: 'AI 动画生成中',
  [CREATION_STEPS.ANIMATED]: '动画完成',
  [CREATION_STEPS.STORY_GEN]: 'AI 故事创作中',
  [CREATION_STEPS.COMPLETED]: '创作完成',
  [CREATION_STEPS.FAILED]: '创作失败',
};

// 步骤图标
export const STEP_ICONS = {
  [CREATION_STEPS.UPLOAD]: '📤',
  [CREATION_STEPS.ENHANCING]: '🎨',
  [CREATION_STEPS.ENHANCED]: '✨',
  [CREATION_STEPS.ANIMATING]: '🎬',
  [CREATION_STEPS.ANIMATED]: '🎞️',
  [CREATION_STEPS.STORY_GEN]: '📖',
  [CREATION_STEPS.COMPLETED]: '🎉',
  [CREATION_STEPS.FAILED]: '❌',
};

// 导出类型
export const EXPORT_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  PDF: 'pdf',
};

// 导出类型标签
export const EXPORT_LABELS = {
  [EXPORT_TYPES.IMAGE]: '下载图片',
  [EXPORT_TYPES.VIDEO]: '下载视频',
  [EXPORT_TYPES.PDF]: '下载电子绘本',
};

// 本地存储键
export const STORAGE_KEYS = {
  USER_ID: 'tonghua_user_id',
  USER_NICKNAME: 'tonghua_user_nickname',
  CREATION_STORE: 'creation-store',
};

// 错误消息
export const ERROR_MESSAGES = {
  INVALID_FILE_FORMAT: '不支持的文件格式，请上传 JPG、PNG 或 WEBP 格式的图片',
  FILE_TOO_LARGE: '文件过大，请上传小于 10MB 的图片',
  UPLOAD_FAILED: '上传失败，请重试',
  NETWORK_ERROR: '网络连接失败，请检查网络后重试',
  UNKNOWN_ERROR: '发生未知错误，请重试',
  LOGIN_REQUIRED: '请先登录',
  NICKNAME_REQUIRED: '请输入昵称',
  CREATION_NOT_FOUND: '作品不存在',
  PROCESSING_ERROR: 'AI 处理失败，请重试',
};

// 成功消息
export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: '上传成功！',
  ENHANCE_SUCCESS: '图片优化完成！',
  ANIMATION_SUCCESS: '动画生成完成！',
  STORY_SUCCESS: '故事创作完成！',
  EXPORT_SUCCESS: '导出成功！',
  LOGIN_SUCCESS: '登录成功！',
};

// 动画配置
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 0.2,
    NORMAL: 0.3,
    SLOW: 0.5,
  },
  EASING: {
    EASE_OUT: 'easeOut',
    EASE_IN_OUT: 'easeInOut',
    BOUNCE: 'anticipate',
  },
};

// 3D 画廊配置
export const GALLERY_CONFIG = {
  CAMERA_POSITION: [0, 0, 10],
  CARD_SPACING: 2.5,
  SCROLL_SPEED: 0.02,
  HOVER_SCALE: 1.1,
  ANIMATION_DURATION: 0.3,
};

export default {
  UPLOAD_CONFIG,
  CREATION_STEPS,
  CREATION_STATUS,
  STEP_LABELS,
  STEP_ICONS,
  EXPORT_TYPES,
  EXPORT_LABELS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ANIMATION_CONFIG,
  GALLERY_CONFIG,
};
