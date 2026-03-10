import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AI创作引导助手组件
 * 在孩子绘画过程中提供启发式提示，而非直接生成
 */
function CreativeGuidance({ guidanceData, onRequestGuidance, isLoading, currentStep }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedTips, setDismissedTips] = useState([]);
  
  if (!guidanceData && !isLoading) return null;
  
  const { questions = [], suggestions = [], encouragement = '', category = 'general' } = guidanceData || {};
  
  // 分类图标映射
  const categoryIcons = {
    'character': '👤',
    'scene': '🏞️',
    'action': '🏃',
    'detail': '✨',
    'general': '💡'
  };
  
  const categoryLabels = {
    'character': '角色创作',
    'scene': '场景构建',
    'action': '动作设计',
    'detail': '细节丰富',
    'general': '创作启发'
  };
  
  // 关闭某个提示
  const dismissTip = (index) => {
    setDismissedTips([...dismissedTips, index]);
  };
  
  // 阶段名称
  const stepLabels = {
    1: '构思阶段',
    2: '构图阶段', 
    3: '细化阶段',
    4: '完善阶段'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-4 top-24 w-80 z-40"
    >
      <div className="clay-card bg-gradient-to-br from-yellow-50 to-orange-50 border-amber-200">
        {/* 头部 */}
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <motion.span 
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 2, repeat: isLoading ? Infinity : 0 }}
              className="text-2xl"
            >
              {isLoading ? '✨' : categoryIcons[category] || '💡'}
            </motion.span>
            <div>
              <h3 className="font-bold text-amber-800 text-sm">
                AI 创作小助手
              </h3>
              <p className="text-xs text-amber-600">
                {stepLabels[currentStep] || '创作引导'}
              </p>
            </div>
          </div>
          <span className="text-amber-600">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-4 overflow-hidden"
            >
              {/* 鼓励语 */}
              {encouragement && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-amber-100 rounded-lg p-3 text-center"
                >
                  <p className="text-amber-800 font-medium text-sm">
                    {encouragement}
                  </p>
                </motion.div>
              )}
              
              {/* 启发式问题 */}
              {questions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    🤔 想一想
                  </h4>
                  {questions.map((question, index) => (
                    !dismissedTips.includes(`q-${index}`) && (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-lg p-3 shadow-sm border border-amber-100"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <p className="text-gray-700 text-sm leading-relaxed flex-1">
                            {question}
                          </p>
                          <button
                            onClick={() => dismissTip(`q-${index}`)}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </motion.div>
                    )
                  ))}
                </div>
              )}
              
              {/* 创作建议 */}
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    💡 试试这样做
                  </h4>
                  {suggestions.map((suggestion, index) => (
                    !dismissedTips.includes(`s-${index}`) && (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-lg p-3 shadow-sm border border-green-100"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <p className="text-gray-700 text-sm leading-relaxed flex-1">
                            {suggestion}
                          </p>
                          <button
                            onClick={() => dismissTip(`s-${index}`)}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </motion.div>
                    )
                  ))}
                </div>
              )}
              
              {/* 刷新按钮 */}
              <button
                onClick={onRequestGuidance}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-amber-200 hover:bg-amber-300 disabled:opacity-50 
                         rounded-lg text-amber-800 text-sm font-medium transition-colors
                         flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⏳
                    </motion.span>
                    思考中...
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    换个思路
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default CreativeGuidance;
