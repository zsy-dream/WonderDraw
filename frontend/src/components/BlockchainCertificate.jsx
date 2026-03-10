import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { blockchainAPI } from '../services/api';

/**
 * 区块链存证组件（演示版）
 * 模拟作品上链存证和数字证书展示
 */
function BlockchainCertificate({ creation, onCertify }) {
  const [isCertifying, setIsCertifying] = useState(false);
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    const loadCertificate = async () => {
      if (!creation?.id) return;
      try {
        const response = await blockchainAPI.getCertificate(creation.id);
        if (response.success && response.data) {
          setCertificate(mapCertificate(response.data, creation));
        }
      } catch (_) {
        // 未存证时忽略
      }
    };

    loadCertificate();
  }, [creation?.id]);

  // 模拟上链存证
  const certifyWork = async () => {
    setIsCertifying(true);

    try {
      const response = await blockchainAPI.certify(creation?.id);
      if (!response.success || !response.data) {
        throw new Error(response.error || '存证失败');
      }

      const cert = mapCertificate(response.data, creation);
      setCertificate(cert);
      if (onCertify) onCertify(cert);
    } catch (error) {
      console.error('区块链存证失败:', error);
    } finally {
      setIsCertifying(false);
    }
  };

  // 下载证书为图片
  const downloadCertificate = (cert) => {
    // 创建canvas绘制证书
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#FEF3C7');
    gradient.addColorStop(1, '#FDE68A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // 边框
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 760, 560);
    
    // 标题
    ctx.fillStyle = '#92400E';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⛓️ 区块链数字证书', 400, 80);
    
    ctx.font = '24px Arial';
    ctx.fillStyle = '#78350F';
    ctx.fillText('Blockchain Digital Certificate', 400, 115);
    
    // 分隔线
    ctx.beginPath();
    ctx.moveTo(100, 140);
    ctx.lineTo(700, 140);
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 证书内容
    ctx.textAlign = 'left';
    ctx.font = '18px Arial';
    ctx.fillStyle = '#374151';
    
    const content = [
      `证书编号：${cert.id}`,
      `作品标题：${cert.workTitle}`,
      `区块链：${cert.blockchain}`,
      `区块高度：#${cert.blockNumber.toLocaleString()}`,
      `交易哈希：${cert.txHash.slice(0, 30)}...`,
      `存证时间：${cert.timestamp}`,
      '',
      '此证书证明该作品已在区块链上完成存证，',
      '具有不可篡改、永久可查的特性。'
    ];
    
    let y = 190;
    content.forEach(line => {
      ctx.fillText(line, 100, y);
      y += 35;
    });
    
    // 状态标签
    ctx.fillStyle = '#10B981';
    ctx.fillRect(550, 480, 150, 40);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✓ 已上链存证', 625, 505);
    
    // 下载
    const link = document.createElement('a');
    link.download = `区块链证书_${cert.id}.png`;
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 成功提示
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-6 py-3 rounded-full shadow-lg z-50';
    toast.textContent = '📜 证书下载成功！';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  if (certificate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200"
      >
        {/* 证书头部 */}
        <div className="text-center mb-6">
          <div className="inline-block bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-2">
            ⛓️ 区块链数字证书
          </div>
          <h3 className="text-xl font-bold text-gray-800">作品存证证书</h3>
          <p className="text-sm text-gray-500">Blockchain Digital Certificate</p>
        </div>

        {/* 证书内容 */}
        <div className="bg-white rounded-lg p-4 space-y-3 mb-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-500">证书编号</span>
            <span className="text-sm font-mono font-medium">{certificate.id}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-500">作品哈希</span>
            <span className="text-xs font-mono text-gray-600">{certificate.hash.slice(0, 20)}...</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-500">区块链</span>
            <span className="text-sm text-blue-600">{certificate.blockchain}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-500">区块高度</span>
            <span className="text-sm font-mono">#{certificate.blockNumber.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">存证时间</span>
            <span className="text-sm">{certificate.timestamp}</span>
          </div>
        </div>

        {/* 交易哈希 */}
        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-400 mb-1">交易哈希 (TxHash)</p>
          <p className="text-xs font-mono text-green-400 break-all">{certificate.txHash}</p>
        </div>

        {/* 二维码和状态 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-16 h-16 bg-white p-1 rounded">
              <img src={certificate.qrCode} alt="QR" className="w-full h-full" />
            </div>
            <div className="text-xs text-gray-500">
              <p>扫码验证</p>
              <p>证书真伪</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-green-700">{certificate.status}</span>
          </div>
        </div>

        {/* 教育提示 */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <span className="font-bold">💡 小知识：</span>
            区块链技术像是一个永远不会被篡改的日记本，你的作品信息被永久记录在上面，任何人都可以验证这是你的原创作品！
          </p>
        </div>

        {/* 下载按钮 */}
        <button
          onClick={() => downloadCertificate(certificate)}
          className="w-full mt-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
        >
          📥 下载证书
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 说明卡片 */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
        <div className="flex items-start gap-3">
          <span className="text-3xl">⛓️</span>
          <div>
            <h3 className="font-bold text-indigo-900 mb-1">区块链原创保护</h3>
            <p className="text-sm text-indigo-700">
              将作品信息永久记录在区块链上，生成不可篡改的数字证书，教会孩子尊重原创、保护知识产权！
            </p>
          </div>
        </div>
      </div>

      {/* 存证按钮 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={certifyWork}
        disabled={isCertifying}
        className={`
          w-full py-4 rounded-xl font-bold text-white
          ${isCertifying 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
          }
          transition-all shadow-lg
        `}
      >
        {isCertifying ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              ⏳
            </motion.span>
            正在写入区块链...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>🛡️</span>
            申请区块链存证
          </span>
        )}
      </motion.button>

      {/* 存证说明 */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-xl block mb-1">🔒</span>
          <span className="text-xs text-gray-600">不可篡改</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-xl block mb-1">🔍</span>
          <span className="text-xs text-gray-600">永久可查</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-xl block mb-1">✅</span>
          <span className="text-xs text-gray-600">权威认证</span>
        </div>
      </div>
    </div>
  );
}

export default BlockchainCertificate;

function mapCertificate(cert, creation) {
  return {
    id: cert.id,
    workTitle: `儿童画作 #${creation?.id?.slice(0, 8) || 'Unknown'}`,
    creator: creation?.user_id || 'Anonymous',
    createTime: cert.timestamp,
    blockchain: cert.blockchain,
    txHash: cert.tx_hash,
    blockNumber: cert.block_number,
    timestamp: cert.timestamp,
    hash: cert.content_hash,
    status: cert.status,
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSI3MCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxMCIgeT0iNzAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz48L3N2Zz4='
  };
}
