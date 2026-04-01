import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockFaq, mockPartnerTimeline } from '../utils/mockData';

/**
 * 合作进展FAQ组件
 * 展示合作进展时间线、用户权益和问答
 */
function CooperationProgressFAQ() {
  const [openItem, setOpenItem] = useState(null);
  const revenueItems = mockFaq.revenueItems;
  const schoolBenefits = mockFaq.schoolBenefits;

  const toggleItem = (id) => {
    setOpenItem(openItem === id ? null : id);
  };

  const faqItems = [
    {
      id: 'progress',
      icon: '📅',
      title: '合作进展时间线',
      content: (
        <div className="space-y-4">
          {mockPartnerTimeline.map((item) => (
            <div key={item.date + item.title} className="flex gap-4">
              <div className="flex-shrink-0 w-24 text-right text-sm text-gray-500">{item.date}</div>
              <div className="flex-1">
                <p className="font-bold">{item.title}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'copyright',
      icon: '©️',
      title: '作品版权归属',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700">
            <span className="font-bold">作品归创作者所有：</span>
            儿童作者享有其作品的完整著作权，包括但不限于复制权、发行权、信息网络传播权。
          </p>
          <p className="text-gray-700">
            <span className="font-bold">授权范围明确：</span>
            家长授权书仅授权平台为投稿至出版社的必要用途，平台不得擅自用于其他商业化用途。
          </p>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-sm text-blue-700">
              💡 如需更改授权范围或撤销投稿，可联系客服申请处理。
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'revenue',
      icon: '💰',
      title: '收益分成说明',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="font-bold text-green-900 mb-2">收益构成</p>
            <ul className="text-sm space-y-1">
              {revenueItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-gray-600">
            具体分成比例根据合同约定而不同。平台不收取任何中介费，收益通过出版社直接结算，并由平台代为扣税后发放至创作者账户。
          </p>
        </div>
      )
    },
    {
      id: 'schools',
      icon: '🏫',
      title: '学校合作权益',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700">
            学校订阅服务（¥3,000/年/班）包含：
          </p>
          <ul className="text-sm space-y-2">
            {schoolBenefits.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            注：学生投稿成功后，收益由平台代管，按学期发放给学校，由学校转交给原作者及家长。
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          ❓ 合作与权益 FAQ
        </h3>
        <p className="text-sm text-gray-600">
          关于合作进展、版权归属、收益分成等常见问题解答
        </p>
      </div>

      {faqItems.map((item) => (
        <motion.div
          key={item.id}
          className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
        >
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <span className="font-bold text-gray-800">{item.title}</span>
            </div>
            <motion.div
              animate={{ rotate: openItem === item.id ? 180 : 0 }}
              className="text-gray-400"
            >
              ▼
            </motion.div>
          </button>

          <AnimatePresence>
            {openItem === item.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200"
              >
                <div className="px-6 py-4 text-gray-700">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      <div className="text-center text-xs text-gray-500">
        <p>
          如有其他问题，欢迎联系客服：support@tonghuaiqijing.com
        </p>
      </div>
    </div>
  );
}

export default CooperationProgressFAQ;