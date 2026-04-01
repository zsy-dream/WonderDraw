import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockAgreementContent, mockAgreements } from '../utils/mockData';

/**
 * 意向书展示浮层
 * 用于展示与合作出版社的意向协议书扫描件
 */
function AgreementModal({ isOpen, onClose }) {
  const agreements = mockAgreements;
  const [activeTab, setActiveTab] = useState(mockAgreements[0]?.id || 'tongqu');

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
                    {mockAgreementContent.headerText.replace('{count}', agreements.length)}
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
                            {mockAgreementContent.previewBadge}
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
                        {mockAgreementContent.disclaimer}
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