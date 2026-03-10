import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CREATION_STEPS, STEP_LABELS, STEP_ICONS } from '../utils/constants';

/**
 * 魔法引擎组件
 * 显示创作流程进度和结果
 */
function MagicEngine({ 
  currentStep, 
  isProcessing, 
  error, 
  originalImage, 
  enhancedImage, 
  animation, 
  story 
}) {
  const steps = [
    { key: CREATION_STEPS.UPLOAD, label: '上传画作', icon: STEP_ICONS[CREATION_STEPS.UPLOAD] },
    { key: CREATION_STEPS.ENHANCING, label: 'AI 优化', icon: STEP_ICONS[CREATION_STEPS.ENHANCING] },
    { key: CREATION_STEPS.ENHANCED, label: '优化完成', icon: STEP_ICONS[CREATION_STEPS.ENHANCED] },
    { key: CREATION_STEPS.ANIMATING, label: 'AI 动画', icon: STEP_ICONS[CREATION_STEPS.ANIMATING] },
    { key: CREATION_STEPS.ANIMATED, label: '动画完成', icon: STEP_ICONS[CREATION_STEPS.ANIMATED] },
    { key: CREATION_STEPS.STORY_GEN, label: 'AI 故事', icon: STEP_ICONS[CREATION_STEPS.STORY_GEN] },
    { key: CREATION_STEPS.COMPLETED, label: '创作完成', icon: STEP_ICONS[CREATION_STEPS.COMPLETED] },
  ];

  const getCurrentStepIndex = () => {
    const index = steps.findIndex(step => step.key === currentStep);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  // 粒子动画组件
  const ParticleEffect = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
          initial={{ 
            x: Math.random() * 400, 
            y: Math.random() * 300,
            opacity: 0 
          }}
          animate={{
            x: Math.random() * 400,
            y: Math.random() * 300,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="magic-engine relative">
      {/* 粒子特效 */}
      {isProcessing && <ParticleEffect />}

      {/* 步骤指示器 */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={step.key} className="flex-1 flex items-center">
              {/* 步骤圆圈 */}
              <motion.div
                className="flex flex-col items-center flex-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    text-2xl mb-2 clay-card relative overflow-hidden
                    ${isActive ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
                    ${isCompleted ? 'bg-green-100' : ''}
                    ${isPending ? 'opacity-50' : ''}
                  `}
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : undefined,
                    color: isActive ? 'white' : undefined,
                  }}
                  animate={isActive && isProcessing ? {
                    boxShadow: [
                      '0 0 0 0 rgba(59, 130, 246, 0.7)',
                      '0 0 0 10px rgba(59, 130, 246, 0)',
                    ]
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: isActive && isProcessing ? Infinity : 0,
                  }}
                >
                  <motion.span
                    animate={isActive && isProcessing ? {
                      rotate: [0, 360],
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: isActive && isProcessing ? Infinity : 0,
                      ease: "linear"
                    }}
                  >
                    {step.icon}
                  </motion.span>
                  
                  {/* 完成勾选 */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center text-white"
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>
                
                <p
                  className={`
                    text-sm font-medium text-center
                    ${isActive ? 'text-blue-600 font-bold' : ''}
                    ${isCompleted ? 'text-green-600' : ''}
                    ${isPending ? 'text-gray-400' : 'text-gray-700'}
                  `}
                >
                  {step.label}
                </p>
              </motion.div>

              {/* 连接线 */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-500"
                    initial={{ width: '0%' }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 当前状态显示 */}
      <AnimatePresence mode="wait">
        {isProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8 relative z-10"
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              ✨
            </motion.div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {STEP_LABELS[currentStep] || '处理中...'}
            </h3>
            <p className="text-gray-600">
              AI 正在施展魔法，请稍候...
            </p>
          </motion.div>
        )}

        {/* 结果展示 */}
        {currentStep === CREATION_STEPS.COMPLETED && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 relative z-10"
          >
            {/* 成功标题 */}
            <div className="text-center">
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🎉
              </motion.div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                创作完成！
              </h3>
              <p className="text-gray-600">
                你的画作已经变成了一个完整的故事
              </p>
            </div>

            {/* 结果网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 原始图片 */}
              {originalImage && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="clay-card"
                >
                  <h4 className="font-bold mb-3 text-gray-700">原始画作</h4>
                  <img 
                    src={originalImage} 
                    alt="原始画作" 
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </motion.div>
              )}

              {/* 优化图片 */}
              {enhancedImage && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="clay-card"
                >
                  <h4 className="font-bold mb-3 text-gray-700">AI 优化</h4>
                  <img 
                    src={enhancedImage} 
                    alt="AI 优化" 
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </motion.div>
              )}

              {/* 动画视频 */}
              {animation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="clay-card"
                >
                  <h4 className="font-bold mb-3 text-gray-700">AI 动画</h4>
                  <video 
                    src={animation} 
                    autoPlay 
                    loop 
                    muted 
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </motion.div>
              )}

              {/* 故事文本 */}
              {story && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="clay-card"
                >
                  <h4 className="font-bold mb-3 text-gray-700">AI 故事</h4>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl max-h-48 overflow-y-auto">
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {story}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* 错误状态 */}
        {error && currentStep === CREATION_STEPS.FAILED && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 relative z-10"
          >
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-bold text-red-600 mb-2">
              创作遇到问题
            </h3>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MagicEngine;
