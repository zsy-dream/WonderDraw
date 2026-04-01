import React from 'react';
import { motion } from 'framer-motion';
import { mockPublishedWorks } from '../utils/mockData';

/**
 * 已录用作品展示组件
 * 展示已被出版社录用的优秀作品案例
 */
function PublishedWorksShowcase() {
  const publishedWorks = mockPublishedWorks;
  const totalRevenue = publishedWorks
    .filter((work) => work.status === 'published')
    .reduce((sum, work) => sum + Number((work.revenue || '').replace(/[^\d.]/g, '')), 0);

  const getStatusBadge = (status) => {
    const statusMap = {
      published: { text: '已出版', color: 'bg-green-100 text-green-800 border-green-200' },
      production: { text: '制作中', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      review: { text: '审核中', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    };
    const config = statusMap[status] || statusMap.review;
    return <span className={`text-xs px-2 py-1 rounded-full border font-medium ${config.color}`}>{config.text}</span>;
  };

  return (
    <div className="space-y-6">
      {/* 头部统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-200">
          <div className="text-3xl mb-2">📚</div>
          <div className="text-2xl font-bold text-green-700">
            {publishedWorks.filter(w => w.status === 'published').length}
          </div>
          <div className="text-sm text-green-600">已出版作品</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-200">
          <div className="text-3xl mb-2">🎬</div>
          <div className="text-2xl font-bold text-blue-700">
            {publishedWorks.filter(w => w.status === 'production').length}
          </div>
          <div className="text-sm text-blue-600">制作中动画</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 text-center border border-amber-200">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-amber-700">
            {publishedWorks.filter(w => w.status === 'review').length}
          </div>
          <div className="text-sm text-amber-600">审核中作品</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-200">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-purple-700">¥{totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-purple-600">已发放收益</div>
        </div>
      </div>

      {/* 作品展示 */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span>🏆</span>
          <span>已录用作品展示</span>
        </h3>

        <div className="grid gap-4">
          {publishedWorks.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all p-4"
            >
              <div className="flex gap-4">
                {/* 封面 */}
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-5xl flex-shrink-0">
                  {work.coverImage}
                </div>

                {/* 内容 */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-800">{work.title}</h4>
                      <p className="text-sm text-gray-500">
                        {work.author} • {work.school}
                      </p>
                    </div>
                    {getStatusBadge(work.status)}
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{work.story}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {work.tags?.map((tag) => (
                      <span key={tag} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">出版社：</span>
                      <span className="font-medium text-indigo-600">{work.publisher}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">发行日期：</span>
                      <span className="font-medium">{work.publishDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">销量：</span>
                      <span className="font-bold text-green-600">{work.sales}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">收益：</span>
                      <span className="font-bold text-green-700">{work.revenue}</span>
                    </div>
                    {work.rating !== '-' && (
                      <div>
                        <span className="text-gray-500">评分：</span>
                        <span className="font-bold text-amber-600">⭐ {work.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 底部说明 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
          <span>💡</span>
          <span>稿件录用流程</span>
        </h4>
        <div className="flex items-center gap-4 text-sm text-indigo-700 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <span>投稿</span>
          </div>
          <div className="h-px flex-1 bg-indigo-300 min-w-[20px]" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <span>审核（7个工作日）</span>
          </div>
          <div className="h-px flex-1 bg-indigo-300 min-w-[20px]" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <span>签约</span>
          </div>
          <div className="h-px flex-1 bg-indigo-300 min-w-[20px]" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
            <span>发行</span>
          </div>
          <div className="h-px flex-1 bg-indigo-300 min-w-[20px]" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">5</div>
            <span>结算收益</span>
          </div>
        </div>
        <p className="text-xs text-indigo-600 mt-3">
          当前演示数据已累计展示 {publishedWorks.length} 部代表作品，其中 {publishedWorks.filter(w => w.status === 'published').length} 部已进入出版阶段。
        </p>
      </div>
    </div>
  );
}

export default PublishedWorksShowcase;