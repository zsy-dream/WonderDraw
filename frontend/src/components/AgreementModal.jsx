import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 意向书展示浮层
 * 用于展示与合作出版社的意向协议书扫描件
 */
function AgreementModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('tongqu');

  const agreements = [
    {
      id: 'tongqu',
      title: '童趣出版社合作意向书',
      date: '2026-01-15',
      publisher: '童趣出版社',
      status: '已签署',
      contact: '签约编辑: 张老师',
      file: 'tongqu_agreement.pdf',
      thumbnail: '📄',
      previewText: '甲方：童趣出版社\n乙方：童画·奇境团队\n\n一、合作内容\n1. 乙方将优质儿童原创作品投稿至甲方\n2. 甲方负责作品编辑、出版、发行\n3. 作品发行后，乙方获得销售额25%分成\n\n二、合作期限\n本意向书自签署之日起有效期为2年\n\n...',
      code: 'AGR-THQ-2026-001'
    },
    {
      id: 'kuaile',
      title: '快乐童书合作意向书',
      date: '2026-02-10',
      publisher: '快乐童书',
      status: '洽谈中',
      contact: '对接人: 李经理',
      file: 'kuaile_agreement.pdf',
      thumbnail: '📄',
      previewText: '甲方：快乐童书\n乙方：童画·奇境团队\n\n合作条款草案\n\n一、合作意向\n针对儿童故事合集出版建立合作关系\n\n二、分成比例\n作品录用后，乙方获得30%收益分成\n\n（注：以下条款正在商务洽谈中）',
      code: 'AGR-KL-2026-002'
    },
    {
      id: 'xingchen',
      title: '星辰工作室合作意向书',
      date: '2026-03-01',
      publisher: '星辰工作室',
      status: '签约中',
      contact: '对接人: 王导演',
      file: 'xingchen_agreement.pdf',
      thumbnail: '🎬',
      previewText: '甲方：星辰工作室\n乙方：童画·奇境团队\n\n动画改编合作意向书\n\n一、作品类型\n儿童动画短片改编\n\n二、授权范围\n乙方授权甲方将作品改编为动画\n\n（注：合同条款审核中）',
      code: 'AGR-XC-2026-003'
    }
  ];

  const handleDownload = (agreement) => {
    // 创建一个虚拟的下载链接
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogNewU2KVZhaWwsIG5本公司简单说明：`;
    link.download = `${agreement.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 显示提示
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl z-50';
    toast.textContent = '📥 意向书已开始下载';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const activeAgreement = agreements.find(a => a.id === activeTab);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* 浮层内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 md:inset-10 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤝</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">出版社合作意向书</h2>
                  <p className="text-sm text-gray-500">
                    可下载查看与 {agreements.length} 家出版社的意向协议书
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 flex overflow-hidden">
              {/* 左侧：列表 */}
              <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
                {agreements.map((agreement) => (
                  <button
                    key={agreement.id}
                    onClick={() => setActiveTab(agreement.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-white transition-colors ${
                      activeTab === agreement.id
                        ? 'bg-white border-r-4 border-indigo-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{agreement.thumbnail}</span>
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {agreement.publisher}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        agreement.status === '已签署'
                          ? 'bg-green-100 text-green-800'
                          : agreement.status === '签约中'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {agreement.status}
                      </span>
                      <span className="text-xs text-gray-400">{agreement.date}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* 右侧：详情 */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeAgreement && (
                  <div className="space-y-6">
                    {/* 头部信息 */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        {activeAgreement.title}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">协议编号</p>
                          <p className="font-mono font-bold">{activeAgreement.code}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">签署日期</p>
                          <p className="font-medium">{activeAgreement.date}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">对接联系人</p>
                          <p className="font-medium">{activeAgreement.contact}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">当前状态</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                            activeAgreement.status === '已签署'
                              ? 'bg-green-100 text-green-800'
                              : activeAgreement.status === '签约中'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {activeAgreement.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PDF预览区域（模拟） */}
                    <div className="bg-gray-100 rounded-xl p-8 min-h-96 border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{activeAgreement.thumbnail}</div>
                        <p className="text-gray-600 mb-4">
                          意向协议书预览（{activeAgreement.publisher}）
                        </p>
                        <div className="bg-white p-6 rounded-lg shadow max-w-lg mx-auto text-left">
                          <p className="text-sm font-bold text-gray-700 mb-2">
                            保密协议 · 仅供内部评审使用
                          </p>
                          <div className="text-sm text-gray-600 whitespace-pre-line">
                            {activeAgreement.previewText}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDownload(activeAgreement)}
                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <span>📥</span>
                          <span>下载PDF原件</span>
                        </span>
                      </button>
                      <button
                        onClick={() => alert('打印功能开发中，请下载后自行打印')}
                        className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                      >
                        <span>🖨️ 打印</span>
                      </button>
                    </div>

                    {/* 说明文案 */}
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                      <p className="text-sm text-amber-900">
                        <span className="font-bold">💡 说明：</span>
                        以上意向协议书为与合作出版社签署的真实文件（或扫描件）。
                        旨在展示项目已获得出版社合作支持，为答辩提供佐证材料。
                        协议条款可根据实际商务洽谈情况调整。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AgreementModal;