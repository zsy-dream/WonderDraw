import React from 'react';
import { motion } from 'framer-motion';

/**
 * 能力雷达图组件
 * 展示儿童5维创作能力评估
 */
function AbilityRadarChart({ scores = {} }) {
  // 默认分数
  const defaultScores = {
    color_perception: 70,
    composition: 70,
    narrative: 70,
    detail_richness: 70,
    creativity: 70
  };
  
  const finalScores = { ...defaultScores, ...scores };
  
  // 能力维度配置
  const abilities = [
    { key: 'color_perception', label: '色彩感知', color: '#FF6B6B' },
    { key: 'composition', label: '构图能力', color: '#4ECDC4' },
    { key: 'narrative', label: '叙事想象', color: '#45B7D1' },
    { key: 'detail_richness', label: '细节丰富', color: '#96CEB4' },
    { key: 'creativity', label: '创意独特', color: '#FFEAA7' }
  ];
  
  // 雷达图参数
  const size = 200;
  const center = size / 2;
  const radius = 70;
  const angleStep = (2 * Math.PI) / 5;
  
  // 计算多边形顶点
  const getPoint = (index, score) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (score / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };
  
  // 生成多边形路径
  const polygonPoints = abilities.map((ability, index) => {
    const score = finalScores[ability.key] || 0;
    const point = getPoint(index, score);
    return `${point.x},${point.y}`;
  }).join(' ');
  
  // 生成网格圆
  const gridCircles = [20, 40, 60, 80, 100].map(level => (
    <circle
      key={level}
      cx={center}
      cy={center}
      r={(level / 100) * radius}
      fill="none"
      stroke="#e0e0e0"
      strokeWidth="1"
      strokeDasharray="4,4"
    />
  ));
  
  // 生成轴线
  const axisLines = abilities.map((_, index) => {
    const endPoint = getPoint(index, 100);
    return (
      <line
        key={index}
        x1={center}
        y1={center}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke="#e0e0e0"
        strokeWidth="1"
      />
    );
  });
  
  // 生成标签
  const labels = abilities.map((ability, index) => {
    const point = getPoint(index, 115);
    const score = finalScores[ability.key] || 0;
    return (
      <g key={ability.key}>
        <text
          x={point.x}
          y={point.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-gray-600 font-medium"
        >
          {ability.label}
        </text>
        <text
          x={point.x}
          y={point.y + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-bold"
          fill={ability.color}
        >
          {score}分
        </text>
      </g>
    );
  });
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* 背景网格 */}
        {gridCircles}
        {axisLines}
        
        {/* 数据多边形 */}
        <motion.polygon
          points={polygonPoints}
          fill="rgba(99, 102, 241, 0.2)"
          stroke="#6366F1"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        
        {/* 数据点 */}
        {abilities.map((ability, index) => {
          const score = finalScores[ability.key] || 0;
          const point = getPoint(index, score);
          return (
            <motion.circle
              key={ability.key}
              cx={point.x}
              cy={point.y}
              r="5"
              fill={ability.color}
              stroke="white"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            />
          );
        })}
        
        {/* 标签 */}
        {labels}
      </svg>
    </div>
  );
}

export default AbilityRadarChart;
