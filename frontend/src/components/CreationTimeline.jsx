import React from 'react';
import { motion } from 'framer-motion';

/**
 * 创作时间轴组件
 * 展示用户的创作历程和里程碑
 */
function CreationTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl mb-2 block">📝</span>
        <p>还没有创作记录，开始你的第一幅作品吧！</p>
      </div>
    );
  }
  
  // 格式化日期
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="relative">
      {/* 时间轴线 */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-purple-300 to-pink-300" />
      
      {/* 时间轴项目 */}
      <div className="space-y-6">
        {timeline.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-start gap-4"
          >
            {/* 节点图标 */}
            <div className="relative z-10 flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.2 }}
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center
                  shadow-lg border-4 border-white
                  ${item.milestone ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-white'}
                `}
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={`作品 ${item.index}`}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span 
                  className={`text-2xl ${item.thumbnail ? 'hidden' : 'flex'}`}
                >
                  {item.milestone ? '🏆' : '🎨'}
                </span>
              </motion.div>
              
              {/* 序号标记 */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                {item.index}
              </div>
            </div>
            
            {/* 内容卡片 */}
            <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-800">
                      第 {item.index} 幅作品
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  
                  {/* 里程碑标记 */}
                  {item.milestone && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-block bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium mb-2"
                    >
                      ✨ {item.milestone}
                    </motion.div>
                  )}
                  
                  {/* 作品状态标签 */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.has_animation && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        🎬 动画
                      </span>
                    )}
                    {item.has_story && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        📖 故事
                      </span>
                    )}
                    {item.story_branches > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        🌳 {item.story_branches}个结局
                      </span>
                    )}
                  </div>
                </div>
                
                {/* 状态图标 */}
                <div className="text-2xl">
                  {item.status === 'completed' ? '✅' : '🎨'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default CreationTimeline;
