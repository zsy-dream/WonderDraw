import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThreeGallery from '../components/ThreeGallery';
import LoginModal from '../components/LoginModal';
import PartnerShowcase from '../components/PartnerShowcase';
import { useUser } from '../contexts/UserContext';
import { creationAPI } from '../services/api';

/**
 * 奇境入口 - 3D 漂浮展厅
 * 展示所有作品的画廊页面
 */
function GalleryPage() {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [creations, setCreations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载作品列表
  useEffect(() => {
    loadCreations();
  }, []);

  const loadCreations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await creationAPI.getCreations({ limit: 50 });
      
      if (response.success) {
        setCreations(response.data.creations || []);
      } else {
        setError('加载作品失败');
        setCreations([]);
      }
    } catch (err) {
      console.error('Failed to load creations:', err);
      setError('加载作品失败，请检查网络连接');
      setCreations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreationClick = (creationId) => {
    navigate(`/detail/${creationId}`);
  };

  const handleStartCreation = () => {
    if (!isLoggedIn()) {
      setShowLogin(true);
    } else {
      navigate('/workspace');
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* 页面标题 */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 text-center"
      >
        <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
          童话·奇境
        </h1>
        <p className="text-xl text-gray-600">欢迎来到魔法画廊</p>
        {currentUser && (
          <p className="text-sm text-gray-500 mt-2">
            欢迎回来，{currentUser.nickname}！
          </p>
        )}
      </motion.header>

      {/* 3D 画廊区域 */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="clay-card text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-6xl mb-4 inline-block"
            >
              ✨
            </motion.div>
            <p className="text-gray-600">加载作品中...</p>
          </div>
        ) : error ? (
          <div className="clay-card text-center py-12">
            <div className="text-6xl mb-4">😢</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadCreations}
              className="clay-button px-6 py-3"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              重试
            </button>
          </div>
        ) : creations.length === 0 ? (
          <div className="clay-card text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
              还没有作品
            </h3>
            <p className="text-gray-600 mb-6">
              成为第一个创作者，开启你的魔法之旅！
            </p>
            <button
              onClick={handleStartCreation}
              className="clay-button px-8 py-3 text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              开始创作 ✨
            </button>
          </div>
        ) : (
          <ThreeGallery
            creations={creations}
            onCreationClick={handleCreationClick}
          />
        )}
      </div>

      {/* 合作伙伴展示 */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
              🤝 合作伙伴
            </h2>
            <p className="text-gray-600">与优秀出版机构、学校共同为儿童创作者提供机会</p>
          </div>
          <PartnerShowcase />
        </motion.div>
      </div>

      {/* 创作按钮 */}
      <motion.div
        className="fixed bottom-8 right-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={handleStartCreation}
          className="clay-button text-white px-8 py-4 text-lg font-bold shadow-lg"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          开始创作 ✨
        </button>
      </motion.div>

      {/* 登录弹窗 */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </div>
  );
}

export default GalleryPage;
