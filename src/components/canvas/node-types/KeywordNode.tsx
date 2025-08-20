'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { KeywordNodeData } from '@/types/canvas';
import { useCanvasStore } from '@/store/canvas.store';
import { getLevelColor } from '@/lib/canvas/utils';

interface KeywordNodeProps extends NodeProps {
  data: KeywordNodeData;
}

const KeywordNode = memo(({ data, selected }: KeywordNodeProps) => {
  const [, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { generateChildren, renewNode, deleteNode, loading, viewport } = useCanvasStore();

  const levelColor = getLevelColor(data.level);
  const isGenerating = loading.isGenerating;
  const isRenewing = loading.renewingNodeId === data.id;

  // 计算"生成下一层级"按钮的位置（位于当前层级和下一层级的分界线上）
  const calculateNextLevelButtonPosition = () => {
    const currentLevelX = 400 + (data.level - 1) * 300; // 当前层级区域起始位置
    const nextLevelX = currentLevelX + 300; // 下一层级区域起始位置
    const zoom = viewport?.zoom || 1;
    const offsetX = viewport?.x || 0;
    const offsetY = viewport?.y || 0;

    return {
      x: nextLevelX * zoom + offsetX - 16, // 按钮中心对齐分界线
      y: 300 * zoom + offsetY - 16 // 垂直居中
    };
  };
  
  const handleGenerateChildren = async () => {
    if (data.canExpand && !isGenerating) {
      await generateChildren(data.id, {
        parentContent: data.content,
        siblingContents: [],
        level: data.level + 1,
        userPrompt: data.content,
        fullPath: [data.content],
      });
    }
  };
  
  const handleRenewNode = async () => {
    if (!isRenewing) {
      await renewNode(data.id, {
        parentContent: data.content,
        siblingContents: [],
        level: data.level,
        userPrompt: data.content,
        fullPath: [data.content],
      });
    }
  };
  
  const handleDeleteNode = () => {
    deleteNode(data.id);
  };
  
  return (
    <div
      className="keyword-node"
      style={{
        borderColor: selected ? '#65f0a3' : '#404040',
        borderWidth: selected ? '2px' : '1px',
        backgroundColor: selected ? '#65f0a3' : levelColor,
        boxShadow: selected ? `0 0 0 2px #65f0a320` : '0 1px 3px rgba(0, 0, 0, 0.3)',
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
    >
      {/* 层级指示器 */}
      <div
        className="level-indicator"
        style={{ backgroundColor: levelColor }}
      >
        L{data.level}
      </div>
      
      {/* 节点内容 */}
      <div className="node-content">
        <div className="content-text">
          {data.content}
        </div>
        
        {/* 加载状态 */}
        {(isGenerating || isRenewing) && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
            <span>{isRenewing ? '更新中...' : '生成中...'}</span>
          </div>
        )}
      </div>
      
      {/* 操作按钮 */}
      {showActions && !isGenerating && !isRenewing && (
        <div className="node-actions">
          {data.canExpand && (
            <button
              className="action-btn generate-btn"
              onClick={handleGenerateChildren}
              title="生成子节点"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          
          <button
            className="action-btn renew-btn"
            onClick={handleRenewNode}
            title="重新生成"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M1 4v6h6m16 10v-6h-6M2.05 10.5a8 8 0 0 1 15.9-2.5M21.95 13.5a8 8 0 0 1-15.9 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button
            className="action-btn delete-btn"
            onClick={handleDeleteNode}
            title="删除节点"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
      
      {/* 连接点 */}
      <Handle
        type="target"
        position={Position.Top}
        className="node-handle node-handle-target"
        style={{ backgroundColor: levelColor }}
      />
      
      {data.canExpand && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="node-handle node-handle-source"
          style={{ backgroundColor: levelColor }}
        />
      )}

      {/* 生成下一层级按钮 - 仅在选中时显示 */}
      {selected && data.canExpand && data.level < 6 && (
        <button
          onClick={handleGenerateChildren}
          disabled={isGenerating}
          style={{
            position: 'fixed',
            left: `${calculateNextLevelButtonPosition().x}px`,
            top: `${calculateNextLevelButtonPosition().y}px`,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isGenerating ? '#404040' : '#606060',
            border: 'none',
            color: '#ffffff',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
          onMouseEnter={(e) => {
            if (!isGenerating) {
              e.currentTarget.style.backgroundColor = '#65f0a3';
              e.currentTarget.style.color = '#000000';
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isGenerating) {
              e.currentTarget.style.backgroundColor = '#606060';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
          title={`生成L${data.level + 1}层级内容`}
        >
          {isGenerating ? '...' : '›'}
        </button>
      )}

      <style jsx>{`
        .keyword-node {
          min-width: 200px;
          min-height: 80px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          position: relative;
          transition: all 0.2s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        
        .level-indicator {
          position: absolute;
          top: -8px;
          left: 8px;
          padding: 2px 8px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          z-index: 10;
        }
        
        .node-content {
          padding: 16px;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .content-text {
          text-align: center;
          font-size: 14px;
          line-height: 1.4;
          color: #ffffff;
          word-break: break-word;
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 12px;
          color: #ffffff;
        }
        
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 8px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .node-actions {
          position: absolute;
          top: -12px;
          right: -12px;
          display: flex;
          gap: 4px;
          z-index: 20;
        }
        
        .action-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .action-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
        
        .generate-btn {
          color: #10b981;
          border-color: #10b981;
        }
        
        .generate-btn:hover {
          background: #10b981;
          color: white;
        }
        
        .renew-btn {
          color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .renew-btn:hover {
          background: #3b82f6;
          color: white;
        }
        
        .delete-btn {
          color: #ef4444;
          border-color: #ef4444;
        }
        
        .delete-btn:hover {
          background: #ef4444;
          color: white;
        }
        
        .node-handle {
          width: 12px;
          height: 12px;
          border: 2px solid white;
          border-radius: 50%;
        }
        
        .node-handle-target {
          top: -6px;
        }
        
        .node-handle-source {
          bottom: -6px;
        }
      `}</style>
    </div>
  );
});

KeywordNode.displayName = 'KeywordNode';

export default KeywordNode;
