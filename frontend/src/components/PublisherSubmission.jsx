import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 出版投稿组件
 * 允许用户将作品投稿给合作出版社
 */
function PublisherSubmission({ creation, onSubmitted }) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [selectedPublisher, setSelectedPublisher] = useState(null);
  const [formData, setFormData] = useState({
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    authorAge: '',
    parentalConsent: false,
    description: ''
  });

  // 模拟合作出版社
  const publishers = [
    {
      id: 'publisher_1',
      name: '童趣出版社',
      type: '绘本',
      description: '专注3-12岁儿童原创绘本出版',
      logo: '📚',
      acceptance: '高',
      territory: '全国',
      revenue: '35%分成'
    },
    {
      id: 'publisher_2',
      name: '快乐童书',
      type: '故事集',
      description: '优质儿童故事合集投稿通道',
      logo: '🏫',
      acceptance: '中',
      territory: '海外',
      revenue: '30%分成'
    },
    {
      id: 'publisher_3',
      name: '星辰工作室',
      type: '动画',
      description: '儿童动画短片改编制作',
      logo: '🎬',
      acceptance: '低',
      territory: '全球',
      revenue: '25%分成'
    }
  ];

  // 模拟投稿历史
  const mockSubmissions = [
    {
      id: 'sub_1',
      title: '小兔子的冒险之旅',
      publisher: '童趣出版社',
      status: 'review',
      label: '审核中',
      date: '2026-03-08',
      icon: '⏳'
    },
    {
      id: 'sub_2',
      title: '彩虹桥的秘密',
      publisher: '快乐童书',
      status: 'accepted',
      label: '已录用',
      date: '2026-02-25',
      icon: '✅'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 模拟投稿处理
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSubmissionStatus({
      success: true,
      submissionId: `SUB_${Date.now()}`,
      publisher: selectedPublisher.name,
      estimatedReviewDays: 7
    });

    setIsSubmitting(false);
    if (onSubmitted) onSubmitted();
  };

  const closeForm = () => {
    setShowForm(false);
    setSubmissionStatus(null);
    setFormData({
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      authorAge: '',
      parentalConsent: false,
      description: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* 主按钮：投稿到出版社 */}
      {!showForm && submissionStatus === null && (
        <>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <span>📮</span>
              <span>投稿到出版社</span>
            </span>
          </motion.button>

          {/* 历史投稿记录 */}
          {mockSubmissions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-700">⊕ 投稿历史</h4>
              {mockSubmissions.map((sub) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border ${
                    sub.status === 'accepted'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{sub.icon}</span>
                      <div>
                        <p className="font-medium text-gray-800">{sub.title}</p>
                        <p className="text-xs text-gray-500">{sub.publisher} • {sub.date}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      sub.status === 'accepted'
                        ? 'bg-green-600 text-white'
                        : 'bg-amber-200 text-amber-800'
                    }`}>
                      {sub.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* 商业模式提示 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
            <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <span>💰</span>
              <span>稿件录用后可获得收益</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-white rounded-lg p-2">
                <p className="font-bold text-indigo-700">25-35%</p>
                <p className="text-xs text-gray-600">收益分成</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="font-bold text-indigo-700">全国</p>
                <p className="text-xs text-gray-600">发行范围</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="font-bold text-indigo-700">终身</p>
                <p className="text-xs text-gray-600">版权收益</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 投稿表单 */}
      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
          >
            {/* 表单头部 */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
              <h3 className="text-xl font-bold text-gray-800">📮 投稿到出版社</h3>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* 成功状态 */}
            {submissionStatus && submissionStatus.success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h4 className="text-2xl font-bold text-green-800 mb-2">投稿成功！</h4>
                <p className="text-gray-600 text-center mb-6">
                  您的作品已提交给 <strong>{submissionStatus.publisher}</strong><br/>
                  预计审核周期：<span className="font-bold text-indigo-600">{submissionStatus.estimatedReviewDays}个工作日</span>
                </p>
                <div className="space-y-3 w-full max-w-sm">
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">投稿编号</p>
                    <p className="font-mono text-lg font-bold text-gray-800">{submissionStatus.submissionId}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-sm text-indigo-700">
                      <span className="font-bold">💡</span> 我们将在审核完成后通过邮件通知您，请保持关注
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeForm}
                  className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                  关闭
                </button>
              </motion.div>
            ) : (
              <>
                {/* 第一阶段：选择出版社 */}
                {!selectedPublisher ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 mb-4">请选择目标投稿的出版社：</p>
                    <div className="grid gap-4">
                      {publishers.map((pub, index) => (
                        <motion.button
                          key={pub.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedPublisher(pub)}
                          className="text-left p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-4xl">{pub.logo}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-gray-800">{pub.name}</h4>
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                  {pub.type}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{pub.description}</p>
                              <div className="flex gap-4 mt-2">
                                <span className="text-xs text-gray-500">📊 录用率: {pub.acceptance}</span>
                                <span className="text-xs text-gray-500">🌍 {pub.territory}</span>
                                <span className="text-xs font-bold text-indigo-600">{pub.revenue}</span>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 第二阶段：填写投稿信息 */}
                    <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{selectedPublisher.logo}</span>
                        <div>
                          <h4 className="font-bold text-indigo-900">{selectedPublisher.name}</h4>
                          <p className="text-xs text-indigo-700">录用后将获得 {selectedPublisher.revenue}</p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* 联系人信息 */}
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2">📞 联系方式</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="联系人姓名"
                            value={formData.contactName}
                            onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                            className="clay-button px-4 py-2 bg-white text-gray-700 w-full"
                            required
                          />
                          <input
                            type="tel"
                            placeholder="联系电话"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                            className="clay-button px-4 py-2 bg-white text-gray-700 w-full"
                            required
                          />
                        </div>
                      </div>

                      <input
                        type="email"
                        placeholder="电子邮箱（接收审核通知）"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                        className="clay-button px-4 py-2 bg-white text-gray-700 w-full"
                        required
                      />

                      <input
                        type="text"
                        placeholder="小创作者年龄（如：8岁）"
                        value={formData.authorAge}
                        onChange={(e) => setFormData({...formData, authorAge: e.target.value})}
                        className="clay-button px-4 py-2 bg-white text-gray-700 w-full"
                        required
                      />

                      <textarea
                        placeholder="作品创作说明（50-200字）"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="clay-button px-4 py-2 bg-white text-gray-700 w-full h-20 resize-none"
                        required
                      />

                      {/* 家长授权 */}
                      <label className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <input
                          type="checkbox"
                          checked={formData.parentalConsent}
                          onChange={(e) => setFormData({...formData, parentalConsent: e.target.checked})}
                          className="mt-1"
                          required
                        />
                        <span className="text-sm text-amber-900">
                          <span className="font-bold">家长授权：</span>本人（家长/监护人）已阅读并同意《童画·奇境投稿协议》，确认作品内容由孩子原创创作，同意将作品投稿给出版社进行商业合作。
                          作品版权归创作者所有，平台仅提供投稿渠道。
                        </span>
                      </label>

                      {/* 提交按钮 */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedPublisher(null)}
                          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                        >
                          上一步
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="animate-spin">⏳</span>
                              提交中...
                            </span>
                          ) : (
                            '提交投稿'
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PublisherSubmission;