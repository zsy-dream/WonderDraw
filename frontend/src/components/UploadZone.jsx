import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateImageFile } from '../utils/helpers';
import { UPLOAD_CONFIG, ERROR_MESSAGES } from '../utils/constants';

/**
 * 上传区域组件
 * 支持拖放和点击上传
 */
function UploadZone({ onFileSelect, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    setError(null);
    setIsUploading(true);

    try {
      // 验证文件
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // 回调处理文件上传
      if (onFileSelect) {
        await onFileSelect(file);
      }
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.UPLOAD_FAILED);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="upload-zone">
      <input
        ref={fileInputRef}
        type="file"
        accept={UPLOAD_CONFIG.ALLOWED_FORMATS.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <motion.div
        className={`
          clay-card cursor-pointer transition-all duration-300 relative overflow-hidden
          ${isDragging ? 'border-blue-400 bg-blue-50' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center relative"
            >
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="预览"
                  className="max-w-full max-h-96 mx-auto rounded-xl shadow-lg"
                />
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearPreview();
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
              <p className="text-gray-600 mt-4">
                {disabled ? '正在处理中...' : '点击或拖放新图片以替换'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <motion.div
                className="text-6xl mb-4"
                animate={isDragging ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {isDragging ? '🎯' : '🎨'}
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                {isDragging ? '放开鼠标上传' : '上传你的画作'}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {isDragging ? '松开鼠标即可上传' : '点击或拖放图片到这里'}
              </p>
              
              <div className="text-sm text-gray-500 space-y-1">
                <p>支持 JPG、PNG、WEBP 格式</p>
                <p>最大文件大小：{Math.round(UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB</p>
              </div>

              {/* 装饰性元素 */}
              <div className="flex justify-center gap-2 mt-6">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 上传进度遮罩 */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium">正在上传...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-xl flex items-center gap-3"
          >
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium">上传失败</p>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UploadZone;
