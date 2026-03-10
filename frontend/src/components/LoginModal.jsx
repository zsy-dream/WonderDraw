import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';

/**
 * 用户登录/注册模态框
 */
function LoginModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register } = useUser();

  // 重置表单
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      nickname: ''
    });
    setError('');
    setSuccess('');
  };

  // 切换模式
  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  // 验证表单
  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('请填写邮箱和密码');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return false;
    }

    if (mode === 'register') {
      if (!formData.nickname) {
        setError('请输入昵称');
        return false;
      }

      if (formData.password.length < 6) {
        setError('密码至少需要6个字符');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('两次输入的密码不一致');
        return false;
      }
    }

    return true;
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      
      if (mode === 'login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(
          formData.email, 
          formData.password, 
          formData.nickname
        );
      }

      if (result.success) {
        setSuccess(mode === 'login' ? '登录成功！' : '注册成功！');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('操作失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 text-white">
            <h2 className="text-2xl font-bold text-center">
              {mode === 'login' ? '🌟 欢迎回来' : '✨ 加入童话世界'}
            </h2>
            <p className="text-center mt-2 text-white/90">
              {mode === 'login' ? '登录你的魔法账户' : '创建你的创作账户'}
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* 昵称（仅注册时显示） */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🎭 昵称
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="给自己起个有趣的名字"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📧 邮箱
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔒 密码
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            {/* 确认密码（仅注册时显示） */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔒 确认密码
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* 错误/成功提示 */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                >
                  ❌ {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
                >
                  ✅ {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-3 rounded-lg font-medium hover:from-yellow-500 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {mode === 'login' ? '登录中...' : '注册中...'}
                </span>
              ) : (
                <span>{mode === 'login' ? '🚀 立即登录' : '🎉 创建账户'}</span>
              )}
            </button>
          </form>

          {/* 切换模式 */}
          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? '还没有账户？' : '已有账户？'}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="ml-1 text-yellow-600 hover:text-yellow-700 font-medium"
                disabled={isLoading}
              >
                {mode === 'login' ? '立即注册' : '立即登录'}
              </button>
            </p>
          </div>

          {/* 关闭按钮 */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <span className="text-2xl">✕</span>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default LoginModal;