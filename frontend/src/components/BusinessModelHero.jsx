import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { mockBusinessModels, mockRevenueForecast } from '../utils/mockData';

/**
 * 商业模式可视化组件
 * 展示三大营收渠道：B端学校订阅、C端增值功能、IP孵化分成
 */
function BusinessModelHero() {
  const [activeModel, setActiveModel] = useState(null);
  const businessModels = mockBusinessModels;

  return (
    <div className="space-y-8">
      {/* 标题区 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
          💰 三大营收渠道
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          通过多层次的商业模式，实现可持续的商业闭环，同时为用户创造实质性价值
        </p>
      </div>

      {/* 三栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {businessModels.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            onMouseEnter={() => setActiveModel(model.id)}
            onMouseLeave={() => setActiveModel(null)}
            className={`relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${
              activeModel === model.id
                ? model.borderColor + ' shadow-xl scale-[1.03]'
                : 'border-gray-200 hover:border-gray-300'
            } ${model.bgColor}`}
          >
            {/* 渐变背景 */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${model.color} opacity-5 transition-opacity ${
                activeModel === model.id ? 'opacity-10' : ''
              }`}
            />

            <div className="relative p-6 h-full flex flex-col">
              {/* 头部 */}
              <div className="text-center mb-6">
                <div className={`text-6xl mb-4 inline-block ${activeModel === model.id ? 'animate-bounce' : ''}`}>
                  {model.icon}
                </div>
                <h3 className={`text-xl font-bold ${model.textColor} mb-2`}>
                  {model.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                <div className="text-2xl font-bold bg-white px-4 py-2 rounded-full inline-block shadow">
                  {model.price}
                </div>
              </div>

              {/* 功能列表 */}
              <div className="flex-1 space-y-2 mb-4">
                {model.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between text-sm py-2 px-3 rounded-lg ${
                      activeModel === model.id ? 'bg-white/50' : 'bg-white/30'
                    }`}
                  >
                    <span className="text-gray-700">{feature.label}</span>
                    <span className={`font-bold ${model.textColor}`}>{feature.value}</span>
                  </div>
                ))}
              </div>

              {/* 市场数据 */}
              <div className="pt-4 border-t border-gray-300">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">目标市场</p>
                    <p className={`font-bold ${model.textColor}`}>{model.market}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">增长预期</p>
                    <p className={`font-bold ${model.textColor}`}>{model.growth}</p>
                  </div>
                </div>
              </div>

              {/* 悬停展开详情 */}
              {activeModel === model.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6 flex flex-col items-center justify-center"
                >
                  <div className="text-5xl mb-4">{model.icon}</div>
                  <h4 className="text-xl font-bold mb-2">{model.title}</h4>
                  <p className="text-center text-sm opacity-80 mb-4">
                    {model.description}
                  </p>
                  <div className="text-4xl font-bold mb-4">{model.price}</div>
                  <button
                    className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-opacity-90"
                  >
                    了解详情
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 收入预期 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
      >
        <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
          <span>📈</span>
          <span>{mockRevenueForecast.title}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockRevenueForecast.cards.map((card) => (
            <div key={card.label} className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-green-700">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.detail}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 底部 disclaimer */}
      <div className="text-center text-xs text-gray-500">
        <p>
          {mockRevenueForecast.disclaimer}
          <br/>
          作品版权归创作者所有，平台仅提供投稿渠道，收益分配遵循相关协议。
        </p>
      </div>
    </div>
  );
}

export default BusinessModelHero;