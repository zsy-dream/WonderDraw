import axios from 'axios';

import { getMockCreationDetail, getMockUserProgress, mockCreations, mockTeacherDashboard } from '../utils/mockData';

// API 基础配置
const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  // 统一走 Vite proxy（避免跨域/不同域名导致的 Network Error）
  if (!envUrl) return '/api';
  // 仅接受相对路径（如 /api），绝对 URL 会导致跨域问题
  if (typeof envUrl === 'string' && envUrl.startsWith('/')) return envUrl;
  return '/api';
};

const API_BASE_URL = resolveApiBaseUrl();

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isDemoMode = String(import.meta.env.VITE_DEMO_MODE || '').toLowerCase() === 'true';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const demoOk = async (data, delayMs = 350) => {
  await sleep(delayMs);
  return { success: true, data };
};

const demoId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const demoTemplateByArtworkId = new Map();
const demoOriginalByArtworkId = new Map();
const demoTemplateByCreationId = new Map();
const demoOriginalByCreationId = new Map();

const demoPickAnimation = (templateId) => {
  if (templateId === 'demo_flower_garden') return 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  if (templateId === 'demo_space_rocket') return 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  if (templateId === 'demo_sky_castle') return 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  if (templateId === 'demo_cat_adventure') return null;
  return mockCreations[0]?.animation || null;
};

const demoPickStoryText = (templateId) => {
  if (templateId === 'demo_cat_adventure') return '小猫背上小背包，沿着彩色小路出发，去寻找会说话的风铃。';
  if (templateId === 'demo_space_rocket') return '火箭点亮星光，带着你穿过云层，去拜访一颗会唱歌的星球。';
  if (templateId === 'demo_sky_castle') return '天空城堡的门只对勇敢的孩子打开，钥匙藏在彩虹尽头。';
  if (templateId === 'demo_flower_garden') return '花园里的每朵花都是一个小精灵，它们用颜色讲故事。';
  return mockCreations[0]?.story || '这是一个关于勇气与想象力的故事。';
};

const demoObjectUrlFromFile = (file) => {
  try {
    if (typeof window !== 'undefined' && window.URL && file instanceof File) {
      return window.URL.createObjectURL(file);
    }
  } catch (_) {
    // ignore
  }
  return null;
};

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证 token
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 统一错误处理
    const errorMessage = error.response?.data?.error || error.message || '请求失败';
    console.error('API Error:', errorMessage);
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// 用户相关 API
export const userAPI = {
  createUser: (nickname) => apiClient.post('/users', { nickname }),
  getUser: (userId) => apiClient.get(`/users/${userId}`),
  getUserCreations: (userId) => apiClient.get(`/users/${userId}/creations`),
  getUserProgress: async (userId) => {
    if (isDemoMode) {
      return demoOk(getMockUserProgress(userId));
    }
    return apiClient.get(`/users/${userId}/progress`);
  },
};

// 作品上传 API
export const artworkAPI = {
  uploadArtwork: (file, userId) => {
    if (isDemoMode) {
      const templateId = file?.__demoTemplateId || null;
      const objectUrl = demoObjectUrlFromFile(file);
      const fallback = mockCreations[0]?.original_image;
      const artworkId = demoId('demo_artwork');
      demoTemplateByArtworkId.set(artworkId, templateId);
      demoOriginalByArtworkId.set(artworkId, objectUrl || fallback);
      return demoOk({
        id: artworkId,
        user_id: userId,
        file_path: objectUrl || fallback,
        original_filename: file?.name || 'demo.png',
        template_id: templateId,
        created_at: new Date().toISOString()
      }, 600);
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    return apiClient.post('/artworks/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getArtwork: (artworkId) => apiClient.get(`/artworks/${artworkId}`),
};

// AI 处理 API
export const aiAPI = {
  enhanceImage: async (artworkId, creationId) => {
    if (isDemoMode) {
      const templateId = demoTemplateByCreationId.get(creationId) || demoTemplateByArtworkId.get(artworkId) || null;
      const original = demoOriginalByCreationId.get(creationId) || demoOriginalByArtworkId.get(artworkId) || null;
      const enhanced = original || mockCreations[0]?.enhanced_image;
      return demoOk({ enhanced_image: enhanced, creation_id: creationId, artwork_id: artworkId }, 900);
    }
    return apiClient.post(`/artworks/${artworkId}/enhance`, { creation_id: creationId });
  },
  generateAnimation: async (artworkId, creationId, enhancedImage) => {
    if (isDemoMode) {
      const templateId = demoTemplateByCreationId.get(creationId) || demoTemplateByArtworkId.get(artworkId) || null;
      const animation = demoPickAnimation(templateId);
      return demoOk({
        animation,
        enhanced_image: enhancedImage || mockCreations[0]?.enhanced_image,
        creation_id: creationId,
        artwork_id: artworkId
      }, 1100);
    }
    return apiClient.post(`/artworks/${artworkId}/animate`, {
      creation_id: creationId,
      enhanced_image: enhancedImage
    });
  },
  generateStory: async (artworkId, creationId, selectedChoice = null) => {
    if (isDemoMode) {
      const templateId = demoTemplateByCreationId.get(creationId) || demoTemplateByArtworkId.get(artworkId) || null;
      const storyText = demoPickStoryText(templateId);

      const interactive = {
        root: {
          text: templateId === 'demo_cat_adventure'
            ? '小猫听到风铃在呼唤，你想先去哪里找线索？'
            : templateId === 'demo_space_rocket'
              ? '火箭准备起飞，你想先带上什么？'
              : templateId === 'demo_sky_castle'
                ? '天空城堡出现了，你会怎样靠近它？'
                : templateId === 'demo_flower_garden'
                  ? '花精灵邀请你做客，你想先看哪朵花？'
                  : '你想让故事怎么开始？',
          choices: templateId === 'demo_cat_adventure'
            ? [
                { id: 'smell', text: '跟着气味走' },
                { id: 'ask', text: '问问路边的小鸟' },
                { id: 'map', text: '画一张探险地图' }
              ]
            : templateId === 'demo_space_rocket'
              ? [
                  { id: 'snacks', text: '带上星星饼干' },
                  { id: 'telescope', text: '带上望远镜' },
                  { id: 'robot', text: '带上小机器人' }
                ]
              : templateId === 'demo_sky_castle'
                ? [
                    { id: 'balloon', text: '坐热气球上去' },
                    { id: 'stairs', text: '寻找云梯' },
                    { id: 'kite', text: '放一只会飞的风筝' }
                  ]
                : templateId === 'demo_flower_garden'
                  ? [
                      { id: 'sun', text: '金色向日葵' },
                      { id: 'rose', text: '红色玫瑰' },
                      { id: 'blue', text: '蓝色小花' }
                    ]
                  : []
        }
      };

      if (!interactive) {
        return demoOk({ story: storyText, full_story: storyText }, 900);
      }

      const rootNode = 'root';
      const currentNode = selectedChoice || rootNode;
      const node = interactive[currentNode] || interactive[rootNode];
      const story_path = selectedChoice ? [rootNode, selectedChoice] : [rootNode];

      return demoOk({
        story: node?.text || storyText,
        full_story: storyText,
        interactive_story: interactive,
        current_node: currentNode,
        story_path,
        has_choices: Boolean(node?.choices?.length),
        choices: node?.choices || []
      }, 950);
    }
    return apiClient.post(`/artworks/${artworkId}/story`, {
      creation_id: creationId,
      selected_choice: selectedChoice
    });
  },
  getCreativeGuidance: async (creationId, step = 1, artworkDescription = '') => {
    if (isDemoMode) {
      return demoOk({
        title: '🧠 AI 创作引导',
        suggestions: [
          '试着在画面里加入一个“主角”，让故事更集中',
          '给背景增加 2-3 个小细节（云、星星、树叶）会更生动',
          '想一想：主角想要什么？遇到了什么困难？最后怎么解决？'
        ],
        encouragement: '你已经很棒了，再多一点点细节就会像动画一样鲜活！',
        step,
        artwork_description: artworkDescription,
        creation_id: creationId
      }, 550);
    }
    return apiClient.post(`/creations/${creationId}/guidance`, {
      step,
      artwork_description: artworkDescription
    });
  },
};

// 创作管理 API
export const creationAPI = {
  createCreation: async (artworkId, userId, originalImage) => {
    if (isDemoMode) {
      const id = demoId('demo_creation');
      const templateId = demoTemplateByArtworkId.get(artworkId) || null;
      demoTemplateByCreationId.set(id, templateId);
      demoOriginalByCreationId.set(id, originalImage || demoOriginalByArtworkId.get(artworkId) || null);
      return demoOk({
        id,
        artwork_id: artworkId,
        user_id: userId,
        original_image: originalImage,
        enhanced_image: null,
        animation: null,
        story: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, 450);
    }
    return apiClient.post('/creations', {
      artwork_id: artworkId,
      user_id: userId,
      original_image: originalImage
    });
  },
  getCreations: async (params = {}) => {
    if (isDemoMode) {
      const limit = Number(params?.limit || 50);
      return demoOk({ creations: mockCreations.slice(0, limit), total: mockCreations.length });
    }
    return apiClient.get('/creations', { params });
  },
  getCreationDetail: async (creationId) => {
    if (isDemoMode) {
      const detail = getMockCreationDetail(creationId);
      if (!detail) {
        await sleep(250);
        return { success: false, error: '作品不存在' };
      }
      return demoOk(detail);
    }
    return apiClient.get(`/creations/${creationId}`);
  },
  updateCreation: (creationId, updates) => 
    apiClient.put(`/creations/${creationId}`, updates),
  deleteCreation: (creationId) => apiClient.delete(`/creations/${creationId}`),
  processFullWorkflow: (creationId) => 
    apiClient.post(`/creations/${creationId}/process`),
  exportCreation: (creationId, type) => 
    apiClient.post(`/creations/${creationId}/export`, { type }),
};

// 认证 API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
};

// 区块链存证 API
export const blockchainAPI = {
  certify: async (creationId) => {
    if (isDemoMode) {
      return demoOk({
        id: `CERT_${String(creationId || '').slice(0, 8)}_${Date.now()}`,
        blockchain: 'WonderChain Testnet',
        tx_hash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`.slice(0, 66),
        block_number: 123456 + Math.floor(Math.random() * 2000),
        timestamp: new Date().toISOString(),
        content_hash: `0x${Math.random().toString(16).slice(2).padEnd(64, 'a')}`.slice(0, 66),
        status: '已存证'
      }, 900);
    }
    return apiClient.post('/blockchain/certify', { creation_id: creationId });
  },
  getCertificate: async (creationId) => {
    if (isDemoMode) {
      await sleep(300);
      return { success: false, error: '未存证' };
    }
    return apiClient.get(`/blockchain/cert/${creationId}`);
  },
};

// 配音管理 API
export const voiceoverAPI = {
  save: (data) => {
    if (isDemoMode) {
      return demoOk({ id: demoId('demo_voiceover'), ...data }, 250);
    }
    return apiClient.post('/voiceover', data);
  },
  getByCreation: async (creationId) => {
    if (isDemoMode) {
      return demoOk([], 250);
    }
    return apiClient.get(`/voiceover/${creationId}`);
  },
};

// 教师管理 API
export const teacherAPI = {
  getDashboard: async () => {
    if (isDemoMode) {
      return demoOk(mockTeacherDashboard, 500);
    }
    return apiClient.get('/teacher/dashboard');
  },
  getStudents: () => apiClient.get('/teacher/students'),
};

// 健康检查 API
export const healthAPI = {
  check: () => apiClient.get('/health'),
};

// 工具函数：处理文件下载
export const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('下载文件失败:', error);
    throw error;
  }
};

export default apiClient;
