'use client';

import React from 'react';

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
  const zoom = viewport?.zoom || 1;
  const offsetX = viewport?.x || 0;
  const offsetY = viewport?.y || 0;

  // 原始节点的固定位置 - 调整尺寸使其更紧凑
  const nodeX = 50;
  const nodeY = 200;
  const nodeWidth = 200;  // 从300减少到200
  const nodeHeight = 60;  // 从80减少到60

  // 应用viewport变换
  const transformedX = nodeX * zoom + offsetX;
  const transformedY = nodeY * zoom + offsetY;
  const transformedWidth = nodeWidth * zoom;
  const transformedHeight = nodeHeight * zoom;

  // 重新生成按钮位置（节点左侧）- 调整位置和大小
  const regenerateButtonX = transformedX - 50;  // 更靠近节点
  const regenerateButtonY = transformedY + transformedHeight / 2 - 16;  // 调整垂直居中

  // 生成下一层级按钮位置（节点右侧，在原始区域和L1区域边界上）
  const nextButtonX = transformedX + transformedWidth + 30;  // 稍微远一点
  const nextButtonY = transformedY + transformedHeight / 2 - 16;  // 调整垂直居中

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
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
          zIndex: 15,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#65f0a3';
          e.currentTarget.style.color = '#000000';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#404040';
          e.currentTarget.style.color = '#ffffff';
        }}
        title="重新生成"
      >
        ✨
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
          height: `${transformedHeight}px`,
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
          关键词
        </div>

        {/* 内容 */}
        <div
          style={{
            fontSize: `${14 * zoom}px`,  // 稍微减小字体
            color: '#ffffff',
            fontWeight: '600',
            textAlign: 'center',
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {content}
        </div>
      </div>

      {/* 生成下一层级按钮 */}
      <button
        onClick={onGenerateNext}
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
          zIndex: 15,
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
        title="生成下一层级"
      >
        ›
      </button>
    </div>
  );
};

export default OriginalNode;
