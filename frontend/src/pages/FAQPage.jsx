import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BusinessModelHero from '../components/BusinessModelHero';
import CooperationProgressFAQ from '../components/CooperationProgressFAQ';
import AgreementModal from '../components/AgreementModal';

/**
 * FAQ页面
 * 展示合作进展、商业模式和常见问题
 */
function FAQPage() {
  const navigate = useNavigate();
  const [showAgreementModal, setShowAgreementModal] = useState(false);

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
              🤝 合作与FAQ
            </h1>
            <p className="text-lg text-gray-600">了解我们的合作进展、商业模式和使用说明</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="clay-button px-6 py-3"
          >
            返回首页
          </button>
        </div>
      </motion.header>

      {/* 内容区域 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            {/* 第一部分：商业模式展示 */}
            <section id="business-model">
              <BusinessModelHero />
            </section>

            {/* 第二部分：合作进展FAQ */}
            <section id="cooperation">
              <CooperationProgressFAQ />
            </section>

            {/* 第三部分：意向书展示 */}
            <section id="agreements">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 border-2 border-gray-200"
              >
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>📄</span>
                  <span>出版社合作意向书</span>
                </h3>
                <p className="text-gray-600 mb-6">
                  可下载查看与合作出版社签署的意向协议书，作为项目合作佐证材料
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAgreementModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold text-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>🔓</span>
                    <span>查看意向协议书</span>
                  </span>
                </motion.button>
              </motion.div>
            </section>

            {/* 底部说明 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 text-center border border-indigo-200"
            >
              <h4 className="font-bold text-indigo-900 mb-2">📞 欢迎咨询合作</h4>
              <p className="text-sm text-indigo-700 mb-3">
                如果您是出版社、学校、教育机构或有合作意向，欢迎联系我们
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <span className="bg-white px-4 py-2 rounded-lg">📧 business@tonghuaiqijing.com</span>
                <span className="bg-white px-4 py-2 rounded-lg">📱 400-888-8888</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      {/* 意向书浮层 */}
      <AgreementModal
        isOpen={showAgreementModal}
        onClose={() => setShowAgreementModal(false)}
      />
    </div>
  );
}

export default FAQPage;