import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { mockPartners } from '../utils/mockData';

/**
 * 合作伙伴展示橱窗
 * 展示合作出版社、学校等合作伙伴
 */
function PartnerShowcase() {
  const [hoveredPartner, setHoveredPartner] = useState(null);
  const partners = mockPartners;

  const getStatusBadge = (partner) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      amber: 'bg-amber-100 text-amber-800 border-amber-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${colors[partner.statusColor]}`}>
        {partner.statusLabel}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* 合作伙伴总数统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-200"
        >
          <div className="text-3xl mb-2">📚</div>
          <div className="text-2xl font-bold text-green-700">
            {partners.filter(p => p.type === 'publisher' && p.status === 'partnered').length}
          </div>
          <div className="text-sm text-green-600">合作出版社</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-200"
        >
          <div className="text-3xl mb-2">🏫</div>
          <div className="text-2xl font-bold text-blue-700">
            {partners.filter(p => p.type === 'school' && p.status === 'partnered').length}
          </div>
          <div className="text-sm text-blue-600">合作学校</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 text-center border border-amber-200"
        >
          <div className="text-3xl mb-2">💬</div>
          <div className="text-2xl font-bold text-amber-700">
            {partners.filter(p => p.status === 'negotiating').length}
          </div>
          <div className="text-sm text-amber-600">意向洽谈</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-200"
        >
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-purple-700">{partners.length}</div>
          <div className="text-sm text-purple-600">总合作伙伴</div>
        </motion.div>
      </div>

      {/* 合作伙伴列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner, index) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => setHoveredPartner(partner.id)}
            onMouseLeave={() => setHoveredPartner(null)}
            className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
              hoveredPartner === partner.id
                ? 'border-indigo-400 shadow-xl scale-[1.02]'
                : 'border-gray-200 hover:border-gray-300'
            } bg-white`}
          >
            {/* 背景渐变 */}
            <div
              className={`absolute inset-0 opacity-10 transition-opacity ${
                partner.status === 'partnered'
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                  : 'bg-gradient-to-br from-amber-400 to-yellow-500'
              }`}
            />

            <div className="relative p-6 h-full flex flex-col">
              {/* 头部 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{partner.logo}</span>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{partner.name}</h3>
                    {getStatusBadge(partner)}
                  </div>
                </div>
              </div>

              {/* 描述 */}
              <p className="text-sm text-gray-600 mb-4 flex-1">{partner.description}</p>

              {/* 对接人和福利 */}
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>👤</span>
                  <span>{partner.collaborator}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-600">
                  <span>💰</span>
                  <span>{partner.benefit}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>✨</span>
                  <span>{partner.highlight}</span>
                </div>
              </div>

              {/* 悬停效果：显示详情 */}
              {hoveredPartner === partner.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-t from-indigo-600 to-purple-600 flex items-center justify-center p-6"
                >
                  <div className="text-center text-white">
                    <div className="text-5xl mb-4">{partner.logo}</div>
                    <h4 className="text-xl font-bold mb-2">{partner.name}</h4>
                    <p className="text-sm opacity-80 mb-4">{partner.description}</p>
                    <p className="text-xs opacity-80 mb-4">{partner.stageNote}</p>
                    {partner.status === 'partnered' ? (
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2 text-sm">
                        ✅ 已签约合作，学生作品可直接投稿
                      </div>
                    ) : (
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2 text-sm">
                        💬 意向洽谈中，预计 2026 Q2 签约
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 底部说明 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 text-center"
      >
        <h4 className="font-bold text-indigo-900 mb-3 flex items-center justify-center gap-2">
          <span>🤝</span>
          合作伙伴招募中
        </h4>
        <p className="text-sm text-indigo-700 mb-4">
          我们持续寻找优质的出版社、学校、教育机构合作伙伴
          <br/>
          为儿童创作者提供更多作品展示和变现渠道
        </p>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          商务合作咨询
        </button>
      </motion.div>
    </div>
  );
}

export default PartnerShowcase;