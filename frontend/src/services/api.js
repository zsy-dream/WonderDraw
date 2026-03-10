import axios from 'axios';

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  getUserProgress: (userId) => apiClient.get(`/users/${userId}/progress`),
};

// 作品上传 API
export const artworkAPI = {
  uploadArtwork: (file, userId) => {
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
  enhanceImage: (artworkId, creationId) => 
    apiClient.post(`/artworks/${artworkId}/enhance`, { creation_id: creationId }),
  generateAnimation: (artworkId, creationId, enhancedImage) => 
    apiClient.post(`/artworks/${artworkId}/animate`, { 
      creation_id: creationId, 
      enhanced_image: enhancedImage 
    }),
  generateStory: (artworkId, creationId, selectedChoice = null) => 
    apiClient.post(`/artworks/${artworkId}/story`, { 
      creation_id: creationId,
      selected_choice: selectedChoice
    }),
  getCreativeGuidance: (creationId, step = 1, artworkDescription = '') =>
    apiClient.post(`/creations/${creationId}/guidance`, {
      step,
      artwork_description: artworkDescription
    }),
};

// 创作管理 API
export const creationAPI = {
  createCreation: (artworkId, userId, originalImage) => 
    apiClient.post('/creations', { 
      artwork_id: artworkId, 
      user_id: userId, 
      original_image: originalImage 
    }),
  getCreations: (params = {}) => apiClient.get('/creations', { params }),
  getCreationDetail: (creationId) => apiClient.get(`/creations/${creationId}`),
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
  certify: (creationId) => apiClient.post('/blockchain/certify', { creation_id: creationId }),
  getCertificate: (creationId) => apiClient.get(`/blockchain/cert/${creationId}`),
};

// 配音管理 API
export const voiceoverAPI = {
  save: (data) => apiClient.post('/voiceover', data),
  getByCreation: (creationId) => apiClient.get(`/voiceover/${creationId}`),
};

// 教师管理 API
export const teacherAPI = {
  getDashboard: () => apiClient.get('/teacher/dashboard'),
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
