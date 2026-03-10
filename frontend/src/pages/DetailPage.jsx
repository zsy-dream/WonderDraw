import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { creationAPI, aiAPI } from '../services/api';
import InteractiveStory from '../components/InteractiveStory';
import ParentVoiceOver from '../components/ParentVoiceOver';
import BlockchainCertificate from '../components/BlockchainCertificate';
import PublisherSubmission from '../components/PublisherSubmission';
import { MagicLoading } from '../components/PageTransition';
import { exportCreationVideo } from '../services/videoExport';

/**
 * 作品详情页
 * 展示完整作品：原图、优化图、动画、互动故事
 */
function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [creation, setCreation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toastRef = React.useRef(null);

  const [storyData, setStoryData] = useState(null);
  const [isStoryProcessing, setIsStoryProcessing] = useState(false);

  useEffect(() => {
    loadCreation();
  }, [id]);

  const loadCreation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await creationAPI.getCreationDetail(id);
      
      if (response.success) {
        setCreation(response.data);
        // 如果已有互动故事数据，加载它
        if (response.data.interactive_story) {
          const currentNode = response.data.current_node || 'root';
          const node = response.data.interactive_story[currentNode];
          setStoryData({
            story: response.data.story,
            full_story: response.data.full_story,
            interactive_story: response.data.interactive_story,
            current_node: currentNode,
            story_path: response.data.story_path || ['root'],
            has_choices: node && node.choices && node.choices.length > 0,
            choices: node ? node.choices : []
          });
        }
      } else {
        setError('作品不存在');
      }
    } catch (err) {
      console.error('Failed to load creation:', err);
      setError('加载作品失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!creation) return;
    
    try {
      // 复制作品链接到剪贴板
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);

      showToast('✅ 作品链接已复制到剪贴板！', 'success');
    } catch (err) {
      alert('分享链接: ' + window.location.href);
    }
  };

  const handleExport = async () => {
    if (!creation) return;
    
    try {
      showToast('⏳ 正在导出视频，请稍候...', 'info');
      const result = await exportCreationVideo({ creation });
      showToast(`📥 导出成功：${result.filename}`, 'success');
    } catch (err) {
      console.error('导出失败:', err);
      showToast('❌ 导出失败，请重试', 'error');
    }
  };

  const showToast = (message, type = 'info') => {
    if (toastRef.current) {
      toastRef.current.remove();
      toastRef.current = null;
    }

    const toast = document.createElement('div');
    const colors = {
      success: 'bg-green-700 border border-green-200',
      error: 'bg-red-700 border border-red-200',
      info: 'bg-slate-800 border border-slate-200'
    };
    toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${colors[type]} text-white px-6 py-3 rounded-full shadow-xl z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);
    toastRef.current = toast;
    setTimeout(() => {
      toast.remove();
      if (toastRef.current === toast) toastRef.current = null;
    }, 2500);
  };

  // 处理故事分支选择
  const handleStoryChoice = async (choiceId) => {
    if (!creation || isStoryProcessing) return;
    
    try {
      setIsStoryProcessing(true);
      const response = await aiAPI.generateStory(
        creation.artwork_id, 
        creation.id, 
        choiceId
      );
      
      if (response.success && response.data) {
        setStoryData(response.data);
        // 更新creation数据
        setCreation(prev => ({
          ...prev,
          story: response.data.story,
          interactive_story: response.data.interactive_story,
          current_node: response.data.current_node,
          story_path: response.data.story_path
        }));
      }
    } catch (err) {
      console.error('故事分支选择失败:', err);
      alert('故事续写失败，请重试');
    } finally {
      setIsStoryProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <MagicLoading message="正在加载作品..." size="large" />
      </div>
    );
  }

  if (error || !creation) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="clay-card text-center p-12">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-4">{error || '作品不存在'}</h2>
          <button
            onClick={() => navigate('/')}
            className="clay-button px-6 py-3"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            返回画廊
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* 页面标题 */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
              作品详情
            </h1>
            <p className="text-sm text-gray-500">作品 ID: {id}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="clay-button px-6 py-3"
          >
            返回画廊
          </button>
        </div>
      </motion.header>

      {/* 作品内容 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* 作品网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 原始图片 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="clay-card"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-secondary)' }}>
                  <span>🎨</span>
                  <span>原始画作</span>
                </h3>
                {creation.original_image ? (
                  <img 
                    src={creation.original_image} 
                    alt="原始画作" 
                    className="w-full aspect-square object-cover rounded-xl shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center">
                    <p className="text-gray-500">暂无图片</p>
                  </div>
                )}
              </motion.div>

              {/* 优化图片 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="clay-card"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
                  <span>✨</span>
                  <span>AI 优化</span>
                </h3>
                {creation.enhanced_image ? (
                  <img 
                    src={creation.enhanced_image} 
                    alt="AI 优化" 
                    className="w-full aspect-square object-cover rounded-xl shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center">
                    <p className="text-gray-500">处理中...</p>
                  </div>
                )}
              </motion.div>

              {/* 动画视频 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="clay-card"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-purple)' }}>
                  <span>🎬</span>
                  <span>AI 动画</span>
                </h3>
                {creation.animation ? (
                  <video 
                    src={creation.animation} 
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full aspect-video object-cover rounded-xl shadow-lg"
                  >
                    您的浏览器不支持视频播放
                  </video>
                ) : (
                  <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
                    <p className="text-gray-500">处理中...</p>
                  </div>
                )}
              </motion.div>

              {/* 互动故事 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="clay-card md:col-span-2"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-blue)' }}>
                  <span>📖</span>
                  <span>互动故事 - 由你导演</span>
                  <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                    多结局
                  </span>
                </h3>
                
                {creation.story ? (
                  <InteractiveStory
                    storyData={storyData}
                    onChoiceSelect={handleStoryChoice}
                    isProcessing={isStoryProcessing}
                  />
                ) : (
                  <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="text-4xl mb-2"
                      >
                        ✨
                      </motion.div>
                      <p className="text-gray-500">AI正在创作互动故事...</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

              {/* 区块链存证 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="clay-card"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-purple)' }}>
                  <span>⛓️</span>
                  <span>原创保护</span>
                  <span className="ml-2 text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">
                    区块链
                  </span>
                </h3>
                <BlockchainCertificate 
                  creation={creation}
                  onCertify={(cert) => console.log('存证成功:', cert)}
                />
              </motion.div>

              {/* 家长配音 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="clay-card"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-secondary)' }}>
                  <span>🎙️</span>
                  <span>亲子配音室</span>
                  <span className="ml-2 text-xs bg-pink-200 text-pink-800 px-2 py-1 rounded-full">
                    家庭共创
                  </span>
                </h3>
                <ParentVoiceOver 
                  creationId={id}
                  onVoiceAdded={(clip) => console.log('添加配音:', clip)}
                />
              </motion.div>

              {/* 出版投稿 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="clay-card"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-green)' }}>
                  <span>📮</span>
                  <span>出版投稿</span>
                  <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                    IP 孵化
                  </span>
                </h3>
                <PublisherSubmission
                  creation={creation}
                  onSubmitted={(submission) => console.log('投稿成功:', submission)}
                />
              </motion.div>

            {/* 操作按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 justify-center"
            >
              <button 
                onClick={handleShare}
                className="clay-button px-8 py-3 text-white"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <span className="flex items-center gap-2">
                  <span>📤</span>
                  <span>分享作品</span>
                </span>
              </button>
              <button 
                onClick={handleExport}
                className="clay-button px-8 py-3 text-white"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <span className="flex items-center gap-2">
                  <span>💾</span>
                  <span>导出作品</span>
                </span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
