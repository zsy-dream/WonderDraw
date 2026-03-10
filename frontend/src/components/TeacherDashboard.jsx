import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { teacherAPI } from '../services/api';
import PublishedWorksShowcase from './PublishedWorksShowcase';

/**
 * 教师管理看板组件
 * 班级作品管理和学生创造力评估
 */
function TeacherDashboard({ classData }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从后端加载数据
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await teacherAPI.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error('加载教师看板失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 默认数据（API未返回时使用）
  const fallbackData = {
    className: '创意美术班',
    studentCount: 0,
    totalWorks: 0,
    thisWeekWorks: 0,
    averageAbility: 0,
    topStudents: [],
    recentWorks: []
  };

  const data = classData || dashboardData || fallbackData;

  if (isLoading) {
    return (
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
    );
  }

  const tabs = [
    { id: 'overview', label: '班级概览', icon: '📊' },
    { id: 'students', label: '学生管理', icon: '👨‍🎓' },
    { id: 'works', label: '作品墙', icon: '🎨' },
    { id: 'analytics', label: '数据分析', icon: '📈' },
  ];

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{data.className}</h2>
          <p className="text-gray-500">教师工作台</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.studentCount}</div>
            <div className="text-xs text-gray-500">学生数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.totalWorks}</div>
            <div className="text-xs text-gray-500">总作品</div>
          </div>
        </div>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">📚</div>
                <div className="text-2xl font-bold text-blue-700">{data.thisWeekWorks}</div>
                <div className="text-sm text-blue-600">本周新增</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-green-700">{data.averageAbility}</div>
                <div className="text-sm text-green-600">平均能力分</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">🎭</div>
                <div className="text-2xl font-bold text-purple-700">
                  {data.recentWorks.filter(w => w.hasStory).length}
                </div>
                <div className="text-sm text-purple-600">有故事作品</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-2xl font-bold text-amber-700">{data.topStudents.length}</div>
                <div className="text-sm text-amber-600">本周之星</div>
              </div>
            </div>

            {/* 最近作品 */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">最近提交</h3>
              <div className="space-y-3">
                {data.recentWorks.map(work => (
                  <div key={work.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center text-white">
                        🎨
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{work.title}</p>
                        <p className="text-sm text-gray-500">{work.student} • {work.time}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {work.hasStory && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">故事</span>
                      )}
                      <button className="text-blue-600 text-sm hover:underline">查看</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">学生列表</h3>
              <button className="text-sm text-blue-600 hover:underline">+ 添加学生</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.topStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedStudent(student)}
                  className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{student.name}</h4>
                      <p className="text-sm text-gray-500">{student.works} 幅作品</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{student.score}</div>
                      <div className="text-xs text-gray-500">能力分</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'works' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >

            {/* 已录用作品展示 */}
            <PublishedWorksShowcase />

            {/* 说明 */}
            <div className="bg-indigo-50 rounded-xl p-4 text-center text-sm text-indigo-700">
              <p>💡 教师可将优秀作品投稿给合作出版社，帮助学生实现作品变现</p>
              <p className="text-xs mt-1 opacity-70">长按作品卡片可查看投稿详情</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">班级能力分布</h3>
              <div className="space-y-3">
                {['色彩感知', '构图能力', '叙事想象', '细节丰富', '创意独特'].map((ability, index) => (
                  <div key={ability} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-gray-600">{ability}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${[85, 78, 72, 80, 75][index]}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                      />
                    </div>
                    <span className="w-10 text-sm font-medium text-gray-700">
                      {[85, 78, 72, 80, 75][index]}分
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
