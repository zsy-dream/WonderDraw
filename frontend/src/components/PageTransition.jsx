import React from 'react';
import { motion } from 'framer-motion';

/**
 * 页面过渡动画组件
 * 为页面切换添加平滑的过渡效果
 */
function PageTransition({ children }) {
  const pageVariants = {
    initial: {
      opacity: 0,
      x: '-100vw',
      scale: 0.95
    },
    in: {
      opacity: 1,
      x: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      x: '100vw',
      scale: 1.05
    }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

/**
 * 加载状态组件 - 带魔法效果
 */
export function MagicLoading({ message = '魔法施展中...', size = 'large' }) {
  const sizeClasses = {
    small: 'text-3xl',
    medium: 'text-5xl',
    large: 'text-7xl'
  };

  const messages = [
    '魔法施展中...',
    'AI正在绘画...',
    '故事创作中...',
    '动画生成中...',
    '创意激发中...'
  ];

  const displayMessage = message || messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      {/* 魔法圈动画 */}
      <div className="relative">
        {/* 外圈 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className={`${sizeClasses[size]} absolute inset-0`}
        >
          ✨
        </motion.div>
        
        {/* 内圈 - 反向旋转 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className={`${sizeClasses[size]} opacity-60`}
        >
          🎨
        </motion.div>
        
        {/* 中心闪烁 */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`${sizeClasses[size]} absolute inset-0 flex items-center justify-center`}
        >
          🌟
        </motion.div>
      </div>
      
      {/* 加载文字 */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-lg text-gray-600 font-medium"
      >
        {displayMessage}
      </motion.p>
      
      {/* 进度点 */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              backgroundColor: ['#e5e7eb', '#6366f1', '#e5e7eb']
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className="w-3 h-3 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 骨架屏组件 - 用于内容加载占位
 */
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="clay-card animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      {Array(lines).fill(0).map((_, i) => (
        <div 
          key={i} 
          className="h-3 bg-gray-200 rounded mb-2"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        ></div>
      ))}
      <div className="h-32 bg-gray-200 rounded mt-4"></div>
    </div>
  );
}

/**
 * 渐进加载组件 - 内容逐步显示
 */
export function FadeInSection({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
