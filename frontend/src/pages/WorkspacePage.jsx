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
import { mockWorkspaceCopy, mockWorkspaceGuidanceTemplates } from '../utils/mockData';

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
      setError(err.message || ERROR_MESSAGES.UPLOAD_FAILED);
      setCreationStatus(CREATION_STATUS.ERROR);
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
        setStory(storyResponse.data.story || storyResponse.data);
      }
      
      setCreationStep(CREATION_STEPS.COMPLETED);
      setCreationStatus(CREATION_STATUS.SUCCESS);
      
      // 3秒后跳转到详情页
      setTimeout(() => {
        navigate(`/detail/${creationId}`);
      }, 3000);
      
    } catch (err) {
      console.error('AI processing error:', err);
      setError(err.message || ERROR_MESSAGES.PROCESSING_ERROR);
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
