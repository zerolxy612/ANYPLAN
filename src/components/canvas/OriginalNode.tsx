'use client';

import React from 'react';
import { useCanvasStore } from '@/store/canvas.store';

interface OriginalNodeProps {
  content: string;
  onRegenerate?: () => void;
  onGenerateNext?: () => void;
  viewport?: { x: number; y: number; zoom: number };
}

const OriginalNode: React.FC<OriginalNodeProps> = ({
  content,
  onRegenerate,
  onGenerateNext,
  viewport
}) => {
  const { generateChildren, loading, originalPrompt, mainConcerns } = useCanvasStore();
  const zoom = viewport?.zoom || 1;
  const offsetX = viewport?.x || 0;
  const offsetY = viewport?.y || 0;

  // 处理生成下一层级
  const handleGenerateNext = async () => {
    if (loading.isGenerating) return;

    try {
      // 使用固定的原始节点ID，因为它是独立组件
      const originalNodeId = 'original-independent-node';

      console.log('🎯 Using independent original node ID:', originalNodeId);

      // 调用生成子节点功能
      await generateChildren(originalNodeId, {
        parentContent: content,
        siblingContents: [],
        level: 1, // 生成L1层级的节点
        userPrompt: originalPrompt || content,
        fullPath: [content],
      });

      // 调用外部回调
      onGenerateNext?.();
    } catch (error) {
      console.error('Failed to generate next level:', error);
    }
  };

  // L1区域分界线位置
  const l1BoundaryX = 400;

  // 画布垂直居中位置（假设画布高度，可以根据实际容器调整）
  const canvasCenterY = 300;  // 画布垂直居中位置

  // 生成下一层级按钮位置（固定在L1分界线上，垂直居中）
  const nextButtonX = l1BoundaryX * zoom + offsetX - 16;  // 按钮中心对齐分界线（按钮宽度32px的一半）
  const nextButtonY = canvasCenterY * zoom + offsetY - 16;  // 垂直居中（按钮高度32px的一半）

  // 原始节点位置（基于生成按钮位置反推，确保整体协调）
  const nodeWidth = 160;
  const baseNodeHeight = 80;
  const nodeHeight = baseNodeHeight; // 固定高度80px
  const nodeX = l1BoundaryX - nodeWidth - 40;  // 距离分界线40px
  const nodeY = canvasCenterY - nodeHeight / 2;  // 垂直居中

  // 应用viewport变换
  const transformedX = nodeX * zoom + offsetX;
  const transformedY = nodeY * zoom + offsetY;
  const transformedWidth = nodeWidth * zoom;
  const transformedHeight = nodeHeight * zoom;

  // 重新生成按钮位置（节点左侧50px，垂直居中）
  const regenerateButtonX = transformedX - 50;
  const regenerateButtonY = transformedY + transformedHeight / 2 - 16;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2, // 降低层级，确保不覆盖sidebar(z-index:10)
      }}
    >
      {/* 重新生成按钮 */}
      <button
        onClick={onRegenerate}
        style={{
          position: 'absolute',
          left: `${regenerateButtonX}px`,
          top: `${regenerateButtonY}px`,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#404040',
          border: '2px solid #606060',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          transition: 'all 0.2s ease',
          pointerEvents: 'auto',
          zIndex: 3, // 降低层级，确保不覆盖sidebar(z-index:10)
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#65f0a3';
          e.currentTarget.style.color = '#000000';
          // 修改图片滤镜，使其在绿色背景上显示为黑色
          const img = e.currentTarget.querySelector('img');
          if (img) {
            img.style.filter = 'brightness(0)'; // 变为黑色
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#404040';
          e.currentTarget.style.color = '#ffffff';
          // 恢复图片滤镜，使其显示为白色
          const img = e.currentTarget.querySelector('img');
          if (img) {
            img.style.filter = 'brightness(0) invert(1)'; // 变为白色
          }
        }}
        title="Regenerate"
      >
        <img
          src="/restart.png"
          alt="Regenerate"
          style={{
            width: '16px',
            height: '16px',
            filter: 'brightness(0) invert(1)', // 将图片变为白色
            transition: 'filter 0.2s ease',
            pointerEvents: 'none', // 防止图片干扰点击事件
          }}
        />
      </button>

      {/* 连线 */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        <line
          x1={regenerateButtonX + 32}  // 调整为新的按钮宽度
          y1={regenerateButtonY + 16}  // 调整为新的按钮高度的一半
          x2={transformedX}
          y2={transformedY + transformedHeight / 2}
          stroke="#606060"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      </svg>

      {/* 原始节点 */}
      <div
        style={{
          position: 'absolute',
          left: `${transformedX}px`,
          top: `${transformedY}px`,
          width: `${transformedWidth}px`,
          height: 'auto', // 自动高度以适应内容
        minHeight: `${transformedHeight}px`,
          backgroundColor: '#2a2a2c',
          border: '2px solid #404040',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',  // 减少内边距
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          pointerEvents: 'auto',
        }}
      >
        {/* 标题 */}
        <div
          style={{
            fontSize: `${12 * zoom}px`,
            color: '#a1a1aa',
            marginBottom: '4px',  // 减少标题和内容之间的间距
            fontWeight: '500',
          }}
        >
          Main Concerns
        </div>

        {/* 内容 */}
        <div
          style={{
            fontSize: `${12 * zoom}px`,
            color: '#ffffff',
            fontWeight: '600',
            textAlign: 'center',
            lineHeight: '1.3',
            padding: '4px',
            width: '100%',
            boxSizing: 'border-box',
            whiteSpace: 'pre-wrap', // 直接显示完整内容，支持换行
            wordBreak: 'break-word'
          }}
        >
          {mainConcerns || content}
        </div>
      </div>

      {/* 生成下一层级按钮 */}
      <button
        onClick={handleGenerateNext}
        disabled={loading.isGenerating}
        style={{
          position: 'absolute',
          left: `${nextButtonX}px`,
          top: `${nextButtonY}px`,
          width: '32px',  // 调整尺寸与重新生成按钮一致
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#606060',  // 改为灰色，符合设计稿
          border: 'none',
          color: '#ffffff',  // 改为白色文字
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',  // 调整字体大小
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          pointerEvents: 'auto',
          zIndex: 3, // 降低层级，确保不覆盖sidebar(z-index:10)
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',  // 调整阴影
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#65f0a3';  // 悬停时变绿色
          e.currentTarget.style.color = '#000000';
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(101, 240, 163, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#606060';  // 恢复灰色
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        }}
        title="Generate next level"
      >
        ›
      </button>
    </div>
  );
};

export default OriginalNode;
