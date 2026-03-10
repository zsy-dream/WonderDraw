import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import AbilityRadarChart from '../components/AbilityRadarChart';
import CreationTimeline from '../components/CreationTimeline';

/**
 * 成长档案页面
 * 展示儿童的创作成长轨迹和能力发展
 */
function ProgressPage() {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 优先使用 URL 参数中的 userId，否则使用当前登录用户
  const userId = paramUserId || currentUser?.id;

  useEffect(() => {
    if (!userId) {
      setError('请先登录查看成长档案');
      setIsLoading(false);
      return;
    }
    loadProgress();
  }, [userId]);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await userAPI.getUserProgress(userId);
      
      if (response.success) {
        setProgressData(response.data);
      } else {
        setError('加载成长档案失败');
      }
    } catch (err) {
      console.error('加载成长档案失败:', err);
      setError('加载失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          ✨
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="clay-card text-center p-8">
          <div className="text-4xl mb-4">😢</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadProgress}
            className="clay-button px-6 py-2"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  const { summary = {}, ability_scores = {}, timeline = [], insights = [] } = progressData || {};

  return (
    <div className="min-h-screen gradient-bg">
      {/* 页面标题 */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8"
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                🌱 成长档案
              </h1>
              <p className="text-lg text-gray-600">记录每一步创作进步</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="clay-button px-6 py-3"
            >
              返回画廊
            </button>
          </div>
        </div>
      </motion.header>

      {/* 内容区域 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* 统计概览 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="clay-card bg-gradient-to-br from-blue-50 to-blue-100 text-center">
              <div className="text-3xl mb-2">🎨</div>
              <div className="text-2xl font-bold text-blue-800">
                {summary.total_creations || 0}
              </div>
              <div className="text-sm text-blue-600">总作品数</div>
            </div>
            
            <div className="clay-card bg-gradient-to-br from-green-50 to-green-100 text-center">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-2xl font-bold text-green-800">
                {summary.creation_span_days || 0}
              </div>
              <div className="text-sm text-green-600">创作天数</div>
            </div>
            
            <div className="clay-card bg-gradient-to-br from-purple-50 to-purple-100 text-center">
              <div className="text-3xl mb-2">📖</div>
              <div className="text-2xl font-bold text-purple-800">
                {timeline.filter(t => t.has_story).length}
              </div>
              <div className="text-sm text-purple-600">故事创作</div>
            </div>
            
            <div className="clay-card bg-gradient-to-br from-amber-50 to-amber-100 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-amber-800">
                {timeline.filter(t => t.milestone).length}
              </div>
              <div className="text-sm text-amber-600">获得里程碑</div>
            </div>
          </motion.div>

          {/* 能力雷达图和成长洞察 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 能力评估 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="clay-card"
            >
              <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--color-primary)' }}>
                🎯 创作能力评估
              </h2>
              <AbilityRadarChart scores={ability_scores} />
              <p className="text-center text-sm text-gray-500 mt-4">
                基于 {summary.total_creations || 0} 幅作品综合分析
              </p>
            </motion.div>

            {/* 成长洞察 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="clay-card"
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--color-secondary)' }}>
                💡 成长洞察
              </h2>
              <div className="space-y-4">
                {insights.length > 0 ? (
                  insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`p-4 rounded-xl ${
                        insight.type === 'strength' 
                          ? 'bg-green-50 border border-green-200' 
                          : insight.type === 'improvement'
                          ? 'bg-amber-50 border border-amber-200'
                          : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{insight.icon}</span>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{insight.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{insight.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    继续创作，获取个性化成长建议！
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* 创作时间轴 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="clay-card"
          >
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--color-accent)' }}>
              📈 创作历程时间轴
            </h2>
            <CreationTimeline timeline={timeline} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;
