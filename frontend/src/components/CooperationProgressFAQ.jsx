import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 合作进展FAQ组件
 * 展示合作进展时间线、用户权益和问答
 */
function CooperationProgressFAQ() {
  const [openItem, setOpenItem] = useState(null);

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
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-24 text-right text-sm text-gray-500">2026-01</div>
            <div className="flex-1">
              <p className="font-bold">与童趣出版社达成合作意向</p>
              <p className="text-sm text-gray-600">签署初步合作协议，开放投稿通道</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-24 text-right text-sm text-gray-500">2026-02</div>
            <div className="flex-1">
              <p className="font-bold">阳光小学签约试点</p>
              <p className="text-sm text-gray-600">3个班级试点应用，教师端功能交付</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-24 text-right text-sm text-gray-500">2026-03</div>
            <div className="flex-1">
              <p className="font-bold">首批作品成功投稿</p>
              <p className="text-sm text-gray-600">《彩虹桥的秘密》等4部作品投稿成功</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-24 text-right text-sm text-gray-500">2026-Q2</div>
            <div className="flex-1">
              <p className="font-bold">星辰国际学校签约</p>
              <p className="text-sm text-gray-600">5个班级覆盖，拓展市场份额</p>
            </div>
          </div>
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
              <li>• 图书出版：销售额的 25-35% 分成给创作者</li>
              <li>• 动画改编：版权费的 20-30% 分成给创作者</li>
              <li>• 付费简历：平台订阅费时的创作者补贴</li>
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
            <li className="flex gap-2">
              <span className="text-green-500">✓</span>
              <span>50 个学生账号，无限制作品创作</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500">✓</span>
              <span>教师管理看板，班级数据分析</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500">✓</span>
              <span>作品投稿通道，学生作品可投稿至合作出版社</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500">✓</span>
              <span>AI 课程资源库，美育教案辅助工具</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500">✓</span>
              <span>专属客服，技术支持响应时间 <24h</span>
            </li>
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