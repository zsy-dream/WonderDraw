import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UploadZone from '../components/UploadZone';
import MagicEngine from '../components/MagicEngine';
import LoginModal from '../components/LoginModal';
import CreativeGuidance from '../components/CreativeGuidance';
import { useUser } from '../contexts/UserContext';
import { artworkAPI, creationAPI, aiAPI } from '../services/api';
// imageProcessor/videoGenerator 已经迁移到后端 API
import { CREATION_STEPS, CREATION_STATUS, ERROR_MESSAGES } from '../utils/constants';
import { mockWorkspaceCopy, mockWorkspaceGuidanceTemplates, getMockCreationDetail } from '../utils/mockData';

/**
 * 神笔工作台
 * 创作流程页面：上传 -> AI优化 -> AI动画 -> AI故事
 */
function WorkspacePage() {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn } = useUser();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [guidanceData, setGuidanceData] = useState(null);
  const [isGuidanceLoading, setIsGuidanceLoading] = useState(false);
  
  // 创作状态
  const [creationStep, setCreationStep] = useState(CREATION_STEPS.UPLOAD);
  const [creationStatus, setCreationStatus] = useState(CREATION_STATUS.IDLE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // 作品数据
  const [artworkId, setArtworkId] = useState(null);
  const [creationId, setCreationId] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [animation, setAnimation] = useState(null);
  const [story, setStory] = useState(null);

  const startLocalDemoFlow = async (file) => {
    const demoCreationId = `local_demo_${Date.now()}`;
    const demoTemplateId = file?.__demoTemplateId || null;
    const template = getMockCreationDetail('demo_creation_001');

    const pickAnimation = (tid) => {
      if (tid === 'demo_flower_garden') return 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
      if (tid === 'demo_space_rocket') return 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
      if (tid === 'demo_sky_castle') return 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
      if (tid === 'demo_cat_adventure') return null;
      return template?.animation || null;
    };

    const pickStory = (tid) => {
      if (tid === 'demo_cat_adventure') return '小猫背上小背包，沿着彩色小路出发，去寻找会说话的风铃。';
      if (tid === 'demo_space_rocket') return '火箭点亮星光，带着你穿过云层，去拜访一颗会唱歌的星球。';
      if (tid === 'demo_sky_castle') return '天空城堡的门只对勇敢的孩子打开，钥匙藏在彩虹尽头。';
      if (tid === 'demo_flower_garden') return '花园里的每朵花都是一个小精灵，它们用颜色讲故事。';
      return template?.story || '这是一个关于勇气与想象力的故事。';
    };

    const pickInteractive = (tid) => {
      const rootText = tid === 'demo_cat_adventure'
        ? '小猫听到风铃在呼唤，你想先去哪里找线索？'
        : tid === 'demo_space_rocket'
          ? '火箭准备起飞，你想先带上什么？'
          : tid === 'demo_sky_castle'
            ? '天空城堡出现了，你会怎样靠近它？'
            : tid === 'demo_flower_garden'
              ? '花精灵邀请你做客，你想先看哪朵花？'
              : (template?.interactive_story?.root?.text || '你想让故事怎么开始？');

      const choices = tid === 'demo_cat_adventure'
        ? [
            { id: 'smell', text: '跟着气味走' },
            { id: 'ask', text: '问问路边的小鸟' },
            { id: 'map', text: '画一张探险地图' }
          ]
        : tid === 'demo_space_rocket'
          ? [
              { id: 'snacks', text: '带上星星饼干' },
              { id: 'telescope', text: '带上望远镜' },
              { id: 'robot', text: '带上小机器人' }
            ]
          : tid === 'demo_sky_castle'
            ? [
                { id: 'balloon', text: '坐热气球上去' },
                { id: 'stairs', text: '寻找云梯' },
                { id: 'kite', text: '放一只会飞的风筝' }
              ]
            : tid === 'demo_flower_garden'
              ? [
                  { id: 'sun', text: '金色向日葵' },
                  { id: 'rose', text: '红色玫瑰' },
                  { id: 'blue', text: '蓝色小花' }
                ]
              : (template?.interactive_story?.root?.choices || []);

      return {
        root: { text: rootText, choices },
      };
    };

    setError(null);
    setCreationStatus(CREATION_STATUS.PROCESSING);
    setArtworkId(`local_artwork_${Date.now()}`);
    setCreationId(demoCreationId);

    const reader = new FileReader();
    const dataUrl = await new Promise((resolve, reject) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('读取图片失败'));
      reader.readAsDataURL(file);
    });

    setOriginalImage(dataUrl);

    const demoCreation = {
      ...(template || {}),
      id: demoCreationId,
      artwork_id: `local_artwork_${Date.now()}`,
      original_image: dataUrl,
      enhanced_image: dataUrl,
      animation: pickAnimation(demoTemplateId),
      story: pickStory(demoTemplateId),
      full_story: pickStory(demoTemplateId),
      interactive_story: pickInteractive(demoTemplateId),
      current_node: 'root',
      story_path: ['root'],
      created_at: new Date().toISOString()
    };

    try {
      localStorage.setItem(`demo_creation_${demoCreationId}`, JSON.stringify(demoCreation));
    } catch (e) {
      // ignore storage failure
    }

    setIsProcessing(true);
    setCreationStep(CREATION_STEPS.ENHANCING);
    setTimeout(() => {
      setEnhancedImage(demoCreation.enhanced_image);
      setCreationStep(CREATION_STEPS.ENHANCED);
    }, 900);

    setTimeout(() => {
      setCreationStep(CREATION_STEPS.ANIMATING);
    }, 1400);

    setTimeout(() => {
      setAnimation(demoCreation.animation);
      setCreationStep(CREATION_STEPS.ANIMATED);
    }, 2400);

    setTimeout(() => {
      setCreationStep(CREATION_STEPS.STORY_GEN);
    }, 2700);

    setTimeout(() => {
      setStory(demoCreation.story);
      setCreationStep(CREATION_STEPS.COMPLETED);
      setCreationStatus(CREATION_STATUS.SUCCESS);
      setIsProcessing(false);
    }, 3600);

    setTimeout(() => {
      navigate(`/detail/${demoCreationId}`, { state: { demoCreation } });
    }, 5200);
  };

  // 检查登录状态
  useEffect(() => {
    if (!isLoggedIn()) {
      setShowLoginModal(true);
    }
  }, [isLoggedIn]);

  // 处理文件上传
  const handleFileUpload = async (file) => {
    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }

    try {
      setIsProcessing(true);
      setCreationStatus(CREATION_STATUS.UPLOADING);
      setError(null);

      // 通过后端 API 上传文件
      const uploadResponse = await artworkAPI.uploadArtwork(file, currentUser.id);
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || '上传失败');
      }
      
      const artworkData = uploadResponse.data;
      setArtworkId(artworkData.id);
      setOriginalImage(artworkData.file_path);
      
      // 通过后端 API 创建创作记录
      const creationResponse = await creationAPI.createCreation(
        artworkData.id, 
        currentUser.id, 
        artworkData.file_path
      );
      if (!creationResponse.success) {
        throw new Error(creationResponse.error || '创建创作记录失败');
      }
      
      const creationData = creationResponse.data;
      setCreationId(creationData.id);
      setCreationStep(CREATION_STEPS.ENHANCED);
      setCreationStatus(CREATION_STATUS.SUCCESS);
      
      // 自动开始 AI 处理流程
      setTimeout(() => {
        startAIProcessing(artworkData.id, creationData.id);
      }, 1000);
      
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err?.message || ERROR_MESSAGES.UPLOAD_FAILED;
      const shouldFallback = /405|method not allowed|network|failed to fetch/i.test(msg);
      if (shouldFallback) {
        await startLocalDemoFlow(file);
      } else {
        setError(msg);
        setCreationStatus(CREATION_STATUS.ERROR);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 开始 AI 处理流程（通过后端 API）
  const startAIProcessing = async (artworkId, creationId) => {
    try {
      setIsProcessing(true);
      
      // 步骤 1: 图像优化
      setCreationStep(CREATION_STEPS.ENHANCING);
      setCreationStatus(CREATION_STATUS.PROCESSING);
      
      const enhanceResponse = await aiAPI.enhanceImage(artworkId, creationId);
      if (enhanceResponse.success) {
        setEnhancedImage(enhanceResponse.data.enhanced_image);
        setCreationStep(CREATION_STEPS.ENHANCED);
      }
      
      // 步骤 2: 动画生成
      setCreationStep(CREATION_STEPS.ANIMATING);
      
      const animateResponse = await aiAPI.generateAnimation(artworkId, creationId, enhanceResponse?.data?.enhanced_image);
      if (animateResponse.success) {
        setAnimation(animateResponse.data.animation);
        setCreationStep(CREATION_STEPS.ANIMATED);
      }
      
      // 步骤 3: 故事生成
      setCreationStep(CREATION_STEPS.STORY_GEN);
      
      const storyResponse = await aiAPI.generateStory(artworkId, creationId);
      if (storyResponse.success && storyResponse.data) {
        const data = storyResponse.data;
        const storyText = typeof data === 'string'
          ? data
          : (data?.story || data?.text || '');
        setStory(storyText);
      }
      
      setCreationStep(CREATION_STEPS.COMPLETED);
      setCreationStatus(CREATION_STATUS.SUCCESS);
      
      // 3秒后跳转到详情页
      setTimeout(() => {
        navigate(`/detail/${creationId}`);
      }, 3000);
      
    } catch (err) {
      console.error('AI processing error:', err);
      const msg = err?.message || ERROR_MESSAGES.PROCESSING_ERROR;
      const shouldFallback = /405|method not allowed|network|failed to fetch/i.test(msg);
      if (shouldFallback && originalImage) {
        try {
          const blob = await (await fetch(originalImage)).blob();
          const file = new File([blob], 'demo.jpg', { type: blob.type || 'image/jpeg' });
          await startLocalDemoFlow(file);
          return;
        } catch (e) {
          // ignore fallback failure
        }
      }
      setError(msg);
      setCreationStep(CREATION_STEPS.FAILED);
      setCreationStatus(CREATION_STATUS.ERROR);
    } finally {
      setIsProcessing(false);
    }
  };

  // 重新开始创作
  const handleRestart = () => {
    setCreationStep(CREATION_STEPS.UPLOAD);
    setCreationStatus(CREATION_STATUS.IDLE);
    setIsProcessing(false);
    setError(null);
    setArtworkId(null);
    setCreationId(null);
    setOriginalImage(null);
    setEnhancedImage(null);
    setAnimation(null);
    setStory(null);
    setGuidanceData(null);
  };

  // 手动跳转到详情页
  const handleViewResult = () => {
    if (creationId) {
      navigate(`/detail/${creationId}`);
    }
  };

  // 请求AI创作引导
  const requestCreativeGuidance = async () => {
    if (!creationId) return;
    
    try {
      setIsGuidanceLoading(true);
      // 尝试API，失败则使用模板
      let guidanceData;
      try {
        const response = await aiAPI.getCreativeGuidance(creationId, creationStep);
        if (response.success && response.data) {
          guidanceData = response.data;
        }
      } catch (apiError) {
        console.log('API guidance failed, using template');
      }
      
      // 使用模板引导
      if (!guidanceData) {
        guidanceData = mockWorkspaceGuidanceTemplates[creationStep] || mockWorkspaceGuidanceTemplates[CREATION_STEPS.ENHANCING];
      }
      
      setGuidanceData(guidanceData);
    } catch (err) {
      console.error('获取创作引导失败:', err);
    } finally {
      setIsGuidanceLoading(false);
    }
  };

  // 上传成功后获取首次引导
  useEffect(() => {
    if (creationId && creationStep === CREATION_STEPS.ENHANCING) {
      requestCreativeGuidance();
    }
  }, [creationId, creationStep]);

  return (
    <div className="min-h-screen gradient-bg">
      {/* 登录模态框 */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />

      {/* AI创作引导助手 - 仅在创作过程中显示 */}
      {creationStep !== CREATION_STEPS.UPLOAD && creationStep !== CREATION_STEPS.COMPLETED && creationStep !== CREATION_STEPS.FAILED && (
        <CreativeGuidance
          guidanceData={guidanceData}
          onRequestGuidance={requestCreativeGuidance}
          isLoading={isGuidanceLoading}
          currentStep={creationStep}
        />
      )}

      {/* 页面标题 */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
              {mockWorkspaceCopy.title}
            </h1>
            <p className="text-lg text-gray-600">{mockWorkspaceCopy.subtitle}</p>
            {currentUser && (
              <p className="text-sm text-gray-500 mt-1">
                {mockWorkspaceCopy.welcomeBackPrefix}{currentUser.nickname}{mockWorkspaceCopy.welcomeBackSuffix}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {creationStep === CREATION_STEPS.COMPLETED && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleViewResult}
                className="clay-button px-6 py-3 bg-green-500 text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mockWorkspaceCopy.viewResultButton}
              </motion.button>
            )}
            {(creationStep === CREATION_STEPS.FAILED || creationStep === CREATION_STEPS.COMPLETED) && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleRestart}
                className="clay-button px-6 py-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mockWorkspaceCopy.restartButton}
              </motion.button>
            )}
            <button
              onClick={() => navigate('/')}
              className="clay-button px-6 py-3"
            >
              {mockWorkspaceCopy.backButton}
            </button>
          </div>
        </div>
      </motion.header>

      {/* 创作区域 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 上传区域 */}
          <AnimatePresence mode="wait">
            {creationStep === CREATION_STEPS.UPLOAD && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="clay-card mb-8"
              >
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>
                  {mockWorkspaceCopy.uploadSectionTitle}
                </h2>
                <UploadZone 
                  onFileSelect={handleFileUpload}
                  disabled={isProcessing}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 魔法引擎 */}
          <AnimatePresence>
            {creationStep !== CREATION_STEPS.UPLOAD && (
              <motion.div
                key="magic-engine"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="clay-card"
              >
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-accent)' }}>
                  {mockWorkspaceCopy.processingTitle}
                </h2>
                <MagicEngine 
                  currentStep={creationStep}
                  isProcessing={isProcessing}
                  error={error}
                  originalImage={originalImage}
                  enhancedImage={enhancedImage}
                  animation={animation}
                  story={story}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 错误提示 */}
          <AnimatePresence>
            {error && creationStatus === CREATION_STATUS.ERROR && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="clay-card mt-6 bg-red-50 border-red-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <h3 className="font-bold text-red-800">{mockWorkspaceCopy.errorTitle}</h3>
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
                <button
                  onClick={handleRestart}
                  className="mt-4 clay-button px-4 py-2 bg-red-500 text-white"
                >
                  {mockWorkspaceCopy.restartInlineButton}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default WorkspacePage;
