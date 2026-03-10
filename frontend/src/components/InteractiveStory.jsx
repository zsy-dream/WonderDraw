import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * 互动故事分支选择组件
 * 展示故事内容并提供分支选择按钮
 */
function InteractiveStory({ storyData, onChoiceSelect, isProcessing }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  
  if (!storyData) return null;
  
  const { story, full_story, choices = [], has_choices, story_path = [] } = storyData;
  
  // 处理选择
  const handleChoiceClick = (choiceId) => {
    if (isProcessing) return;
    setSelectedChoice(choiceId);
    onChoiceSelect(choiceId);
  };
  
  // 进度指示器
  const ProgressIndicator = () => (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-gray-500">故事进度：</span>
      <div className="flex gap-1">
        {story_path.map((node, index) => (
          <motion.div
            key={node}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-3 h-3 rounded-full ${
              index === story_path.length - 1 
                ? 'bg-green-500' 
                : 'bg-blue-400'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">
        {story_path.length} / {has_choices ? '进行中' : '已完成'}
      </span>
    </div>
  );
  
  return (
    <div className="space-y-6">
      {/* 故事进度 */}
      <ProgressIndicator />
      
      {/* 故事内容卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="clay-card bg-gradient-to-br from-amber-50 to-orange-50"
      >
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">📖</span>
          <div>
            <h3 className="font-bold text-lg text-amber-800">
              {has_choices ? '故事正在继续...' : '故事圆满结局！'}
            </h3>
            <p className="text-sm text-amber-600">
              {has_choices 
                ? '小主人，请选择接下来会发生什么？' 
                : '这是一个美好的结局，你可以重新选择探索其他故事线！'}
            </p>
          </div>
        </div>
        
        {/* 故事文本 */}
        <div className="bg-white/70 rounded-xl p-4 mb-4">
          <p className="text-gray-700 leading-relaxed text-lg">
            {story}
          </p>
        </div>
        
        {/* 分支选择按钮 */}
        {has_choices && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600 mb-3">
              🎯 选择故事的走向：
            </p>
            <div className="grid gap-3">
              {choices.map((choice, index) => (
                <motion.button
                  key={choice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleChoiceClick(choice.id)}
                  disabled={isProcessing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    clay-button p-4 text-left transition-all
                    ${selectedChoice === choice.id 
                      ? 'bg-amber-300 border-amber-400' 
                      : 'bg-white hover:bg-amber-50'
                    }
                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {['A', 'B', 'C'][index]}
                    </span>
                    <span className="font-medium text-gray-700">
                      {choice.text}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
        
        {/* 结局标记 */}
        {!has_choices && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-6"
          >
            {/* 庆祝动画 */}
            <div className="flex justify-center gap-2 mb-4">
              {['🎉', '🎊', '🌟', '🎈', '🏆'].map((emoji, index) => (
                <motion.span
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ 
                    y: [0, -20, 0], 
                    opacity: 1,
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    delay: index * 0.1,
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  className="text-4xl"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300"
            >
              <h4 className="text-xl font-bold text-green-800 mb-2">
                🎊 太棒了！你完成了一个独特的故事！
              </h4>
              <p className="text-green-600 text-sm mb-3">
                这是第 {Math.floor(Math.random() * 6) + 1} 种可能的结局之一
              </p>
              
              {/* 成就徽章 */}
              <div className="flex justify-center gap-2 mt-3">
                <span className="bg-amber-200 text-amber-800 text-xs px-3 py-1 rounded-full font-medium">
                  🏅 故事导演
                </span>
                <span className="bg-purple-200 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                  📖 阅读达人
                </span>
              </div>
            </motion.div>
            
            {/* 重新选择提示 */}
            <p className="mt-4 text-sm text-gray-500">
              💡 提示：刷新页面可以重新选择，探索其他 {6 - 1} 种不同的故事结局！
            </p>
          </motion.div>
        )}
      </motion.div>
      
      {/* 完整故事预览（可折叠） */}
      {full_story && story_path.length > 1 && (
        <div className="clay-card bg-gray-50">
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-600 flex items-center gap-2">
              <span>📜</span>
              <span>查看完整故事</span>
              <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">
                {story_path.length} 个章节
              </span>
            </summary>
            <div className="mt-3 p-4 bg-white rounded-lg max-h-48 overflow-y-auto">
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {full_story}
              </p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

export default InteractiveStory;
