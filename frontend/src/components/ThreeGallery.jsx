import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 简化的2.5D画廊组件
 * 使用CSS 3D变换实现漂浮效果，比Three.js更可靠
 */
function ThreeGallery({ creations = [], onCreationClick }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // 为每个作品计算3D位置
  const getPosition = (index, total) => {
    const columns = 3;
    const col = index % columns;
    const row = Math.floor(index / columns);
    
    // 基础位置
    const baseX = (col - 1) * 320;
    const baseY = row * 280;
    
    // 添加随机偏移使布局更自然
    const offsetX = (Math.sin(index * 1.5) * 30);
    const offsetY = (Math.cos(index * 2.3) * 20);
    const offsetZ = (Math.sin(index * 0.7) * 50);
    
    return {
      x: baseX + offsetX,
      y: baseY + offsetY,
      z: offsetZ,
      rotateY: (col - 1) * 5 + Math.sin(index) * 3,
      rotateX: Math.cos(index * 0.5) * 3
    };
  };

  // 获取图片URL - 尝试多种可能的字段名
  const getImageUrl = (creation) => {
    if (creation.enhanced_image) return creation.enhanced_image;
    if (creation.enhancedImage) return creation.enhancedImage;
    if (creation.original_image) return creation.original_image;
    if (creation.originalImage) return creation.originalImage;
    if (creation.thumbnail) return creation.thumbnail;
    if (creation.image_url) return creation.image_url;
    if (creation.imageUrl) return creation.imageUrl;
    if (creation.url) return creation.url;
    return null;
  };

  if (isLoading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center clay-card">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          ✨
        </motion.div>
      </div>
    );
  }

  if (creations.length === 0) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center clay-card">
        <div className="text-6xl mb-4">🎨</div>
        <p className="text-xl text-gray-600 mb-2">还没有作品</p>
        <p className="text-gray-500">开始创作你的第一个魔法作品吧！</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-[600px] clay-card overflow-hidden relative"
      style={{ perspective: '1000px' }}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-200 rounded-full opacity-20 blur-2xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-pink-200 rounded-full opacity-20 blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-2xl" />
      </div>

      {/* 3D画廊容器 */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: 'rotateX(10deg) translateZ(-100px)'
        }}
      >
        <AnimatePresence>
          {creations.map((creation, index) => {
            const pos = getPosition(index, creations.length);
            const imageUrl = getImageUrl(creation);
            const isHovered = hoveredId === creation.id;
            
            return (
              <motion.div
                key={creation.id}
                initial={{ opacity: 0, scale: 0.8, y: 100 }}
                animate={{ 
                  opacity: 1, 
                  scale: isHovered ? 1.1 : 1,
                  x: pos.x,
                  y: pos.y - 200,
                  z: pos.z,
                  rotateY: isHovered ? 0 : pos.rotateY,
                  rotateX: isHovered ? 0 : pos.rotateX
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 100
                }}
                whileHover={{ 
                  z: 100,
                  rotateY: 0,
                  rotateX: 0,
                  transition: { duration: 0.3 }
                }}
                onHoverStart={() => setHoveredId(creation.id)}
                onHoverEnd={() => setHoveredId(null)}
                onClick={() => onCreationClick(creation.id)}
                className="absolute cursor-pointer"
                style={{
                  transformStyle: 'preserve-3d',
                  width: '240px',
                  height: '240px'
                }}
              >
                {/* 卡片阴影 */}
                <div 
                  className="absolute inset-0 bg-black opacity-20 rounded-2xl"
                  style={{ 
                    transform: 'translateZ(-20px) translateY(20px)',
                    filter: 'blur(20px)'
                  }}
                />
                
                {/* 卡片主体 */}
                <div 
                  className={`w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
                    isHovered ? 'shadow-yellow-300/50' : ''
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)',
                    border: isHovered ? '3px solid #FFD93D' : '2px solid rgba(255, 217, 61, 0.3)'
                  }}
                >
                  {/* 图片区域 */}
                  <div className="w-full h-[180px] overflow-hidden bg-gradient-to-br from-amber-100 to-orange-50 relative">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={creation.title || '作品'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* 占位图 */}
                    <div 
                      className="absolute inset-0 items-center justify-center"
                      style={{ display: imageUrl ? 'none' : 'flex' }}
                    >
                      <span className="text-6xl">🎨</span>
                    </div>
                  </div>
                  
                  {/* 信息区域 */}
                  <div className="p-3 bg-white/80 backdrop-blur-sm">
                    <h3 className="font-bold text-gray-800 truncate text-sm">
                      {creation.title || '未命名作品'}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {creation.creator_name || creation.creatorName || '匿名'} • {creation.created_at || creation.createdAt || '刚刚'}
                    </p>
                  </div>
                </div>

                {/* 悬停光效 */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,217,61,0.3) 0%, transparent 50%)',
                      transform: 'translateZ(1px)'
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 操作提示 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-sm text-gray-600 shadow-lg">
        💡 悬停放大 | 点击查看详情 | 共 {creations.length} 个作品
      </div>

      {/* 装饰性星星 */}
      <motion.div
        animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-8 right-8 text-2xl"
      >
        ⭐
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute top-20 left-12 text-xl"
      >
        ✨
      </motion.div>
    </div>
  );
}

export default ThreeGallery;
