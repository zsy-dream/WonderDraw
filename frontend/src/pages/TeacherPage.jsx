import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TeacherDashboard from '../components/TeacherDashboard';
import { useDemo } from '../contexts/DemoContext';
import { mockTeacherPageCopy } from '../utils/mockData';

/**
 * 教师端管理页面
 */
function TeacherPage() {
  const navigate = useNavigate();
  const { state: demoState } = useDemo();

  const forced = demoState?.enabled ? demoState?.forced?.teacher : 'normal';

  return (
    <div className="min-h-screen gradient-bg">
      {/* 页面标题 */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
              {mockTeacherPageCopy.title}
            </h1>
            <p className="text-lg text-gray-600">{mockTeacherPageCopy.subtitle}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="clay-button px-6 py-3"
          >
            {mockTeacherPageCopy.backButton}
          </button>
        </div>
      </motion.header>

      {/* 内容区域 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="clay-card"
          >
            {forced === 'error' ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">😢</div>
                <p className="text-gray-500">加载教师看板失败</p>
              </div>
            ) : forced === 'loading' ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-4xl inline-block mb-4"
                >
                  ✨
                </motion.div>
                <p className="text-gray-500">加载中...</p>
              </div>
            ) : (
              <TeacherDashboard />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default TeacherPage;
