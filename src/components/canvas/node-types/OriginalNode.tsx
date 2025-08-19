'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { OriginalNodeData } from '@/types/canvas';

interface OriginalNodeProps extends NodeProps {
  data: OriginalNodeData;
}

const OriginalNode = memo(({ data, selected }: OriginalNodeProps) => {
  return (
    <div
      className="original-node"
      style={{
        borderColor: selected ? '#65f0a3' : '#404040',
        borderWidth: selected ? '2px' : '1px',
        backgroundColor: '#2a292c',
        boxShadow: selected ? `0 0 0 2px #65f0a320` : '0 1px 3px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* 原始问题图标 */}
      <div className="original-icon">
        <div className="icon-circle">
          <span className="icon-plus">✨</span>
          <div className="icon-line"></div>
        </div>
      </div>

      {/* 节点内容 */}
      <div className="node-content">
        <div className="node-header">
          <span className="node-label">关键词</span>
        </div>
        <div className="node-text">
          {data.content}
        </div>
      </div>

      {/* 右侧连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#65f0a3',
          border: '2px solid #404040',
          width: '12px',
          height: '12px',
        }}
      />

      <style jsx>{`
        .original-node {
          min-width: 280px;
          max-width: 320px;
          min-height: 120px;
          background: #2a292c;
          border: 1px solid #404040;
          border-radius: 12px;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .original-node:hover {
          border-color: #65f0a3;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .original-icon {
          flex-shrink: 0;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-circle {
          width: 48px;
          height: 48px;
          background: #404040;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .icon-plus {
          font-size: 20px;
          color: #65f0a3;
        }

        .icon-line {
          position: absolute;
          right: -6px;
          top: 50%;
          transform: translateY(-50%);
          width: 12px;
          height: 2px;
          background: #404040;
        }

        .node-content {
          flex: 1;
          padding: 16px 16px 16px 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .node-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .node-label {
          background: #404040;
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .node-text {
          color: #ffffff;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
          max-height: 60px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
});

OriginalNode.displayName = 'OriginalNode';

export default OriginalNode;
