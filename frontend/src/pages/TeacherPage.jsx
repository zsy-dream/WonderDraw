import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TeacherDashboard from '../components/TeacherDashboard';

/**
 * 教师端管理页面
 */
function TeacherPage() {
  const navigate = useNavigate();

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
              👨‍🏫 教师工作台
            </h1>
            <p className="text-lg text-gray-600">班级管理与学生创作追踪</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="clay-button px-6 py-3"
          >
            返回画廊
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
            <TeacherDashboard />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default TeacherPage;
