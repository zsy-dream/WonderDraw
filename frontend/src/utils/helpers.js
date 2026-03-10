import { UPLOAD_CONFIG, ERROR_MESSAGES } from './constants';

/**
 * 验证文件格式
 * @param {File} file - 要验证的文件
 * @returns {boolean} - 是否有效
 */
export function validateFileFormat(file) {
  if (!file) return false;
  return UPLOAD_CONFIG.ALLOWED_FORMATS.includes(file.type);
}

/**
 * 验证文件大小
 * @param {File} file - 要验证的文件
 * @returns {boolean} - 是否有效
 */
export function validateFileSize(file) {
  if (!file) return false;
  return file.size <= UPLOAD_CONFIG.MAX_FILE_SIZE;
}

/**
 * 验证图片文件
 * @param {File} file - 要验证的文件
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: '请选择文件' };
  }

  if (!validateFileFormat(file)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_FILE_FORMAT };
  }

  if (!validateFileSize(file)) {
    return { valid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
  }

  return { valid: true, error: null };
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} - 格式化后的大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 格式化日期时间
 * @param {string} dateString - ISO 日期字符串
 * @returns {string} - 格式化后的日期
 */
export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 生成唯一 ID
 * @returns {string} - 唯一 ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 延迟函数
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 下载文件
 * @param {string} url - 文件 URL
 * @param {string} filename - 文件名
 */
export function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default {
  validateFileFormat,
  validateFileSize,
  validateImageFile,
  formatFileSize,
  formatDateTime,
  generateId,
  delay,
  downloadFile,
};
