'use client';

import React, { memo, useState } from 'react';
import { NodeProps } from '@xyflow/react';
import { KeywordNodeData } from '@/types/canvas';
import { useCanvasStore } from '@/store/canvas.store';
import { getLevelColor } from '@/lib/canvas/utils';
import { NODE_DIMENSIONS } from '@/lib/canvas/constants';

interface KeywordNodeProps extends NodeProps {
  data: KeywordNodeData;
}

const KeywordNode = memo(({ data, selected }: KeywordNodeProps) => {
  const [, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const {
    generateChildren,
    renewNode,
    deleteNode,
    loading,
    viewport,
    selectNode,
    clearNodeSelection,
    getHighlightedNodes,
    nodes,
    setNodeExpanded,
    isNodeExpanded
  } = useCanvasStore();

  // 使用 store 中的展开状态
  const isExpanded = isNodeExpanded(data.id);

  const levelColor = getLevelColor(data.level);
  const isGenerating = loading.isGenerating;
  const isRenewing = loading.renewingNodeId === data.id;

  // 直接计算高亮状态，避免useMemo依赖问题
  const highlightedNodes = getHighlightedNodes();
  const shouldHighlight = highlightedNodes.includes(data.id);

  // 在探索模式下，只使用 getHighlightedNodes 的结果
  // 在写作模式下，使用完整的选择状态
  const nodeSelected = shouldHighlight; // 统一使用 shouldHighlight

  // 调试信息（开发环境）
  if (process.env.NODE_ENV === 'development' && (shouldHighlight || nodeSelected)) {
    console.log(`🎯 Node ${data.id} highlight status:`, {
      shouldHighlight,
      nodeSelected,
      highlightedNodes,
      content: data.content.substring(0, 20)
    });
  }

  // 使用配置文件中的节点宽度
  const nodeWidth = NODE_DIMENSIONS.KEYWORD.width;
  const contentWidth = nodeWidth - 40; // 减去padding




  
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

  const handleNodeClick = (e: React.MouseEvent) => {
    // 防止事件冒泡
    e.stopPropagation();

    // 检查当前节点是否是该层级的选中节点
    const { selectedNodesByLevel } = useCanvasStore.getState();
    const isCurrentlySelected = selectedNodesByLevel[data.level] === data.id;

    if (isCurrentlySelected) {
      // 如果已选中，则取消选择
      clearNodeSelection(data.level);
    } else {
      // 选择当前节点（会自动清除同层级其他选择）
      selectNode(data.id, data.level);
    }
  };

  const handleNodeDoubleClick = () => {
    // 双击展开/收缩节点
    setNodeExpanded(data.id, !isExpanded);
  };
  
  // 统一使用我们的高亮逻辑，忽略React Flow的selected
  const isHighlighted = shouldHighlight || nodeSelected;

  return (
    <div
      className={`keyword-node ${isHighlighted ? 'selected' : ''}`}
      style={{
        borderColor: isHighlighted ? '#65f0a3' : '#404040',
        borderWidth: isHighlighted ? '2px' : '1px',
        backgroundColor: isHighlighted ? '#65f0a3' : levelColor,
        boxShadow: isHighlighted ? `0 0 0 2px #65f0a320` : '0 1px 3px rgba(0, 0, 0, 0.3)',
        '--node-bg-color': isHighlighted ? '#65f0a3' : levelColor,
      } as React.CSSProperties}
      onClick={handleNodeClick}
      onDoubleClick={handleNodeDoubleClick}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
    >
      {/* 节点内容 */}
      <div className="node-content">
        <div
          className={`content-text ${isExpanded ? 'expanded' : 'collapsed'}`}
        >
          <div className="text-content">
            {data.content}
          </div>
          {data.content.length > 30 && (
            <>
              {!isExpanded && <div className="fade-overlay"></div>}
              <div className="expand-indicator" title="双击展开/收缩">
                {isExpanded ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </>
          )}
        </div>

        {/* 加载状态 */}
        {(isGenerating || isRenewing) && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
            <span>{isRenewing ? '更新中...' : '生成中...'}</span>
          </div>
        )}
      </div>
      

      








      <style jsx>{`
        .keyword-node {
          min-width: ${nodeWidth}px;
          max-width: ${nodeWidth}px;
          min-height: 50px;
          max-height: ${isExpanded ? 'none' : '150px'};
          border-radius: 25px;
          border: 1px solid #e2e8f0;
          background: white;
          position: relative;
          transition: all 0.2s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }

        .keyword-node:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .keyword-node.selected {
          background: #65f0a3;
          border-color: #65f0a3;
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
          padding: 12px 20px;
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          position: relative;
        }
        
        .content-text {
          text-align: left;
          font-size: 14px;
          line-height: 1.4;
          color: #d9d9d9;
          word-break: break-word;
          width: ${contentWidth}px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .content-text.collapsed {
          max-height: 98px; /* 约7行文字的高度 (14px * 1.4 * 5 ≈ 98px) */
          overflow: hidden;
          white-space: pre-wrap;
        }

        .content-text.expanded {
          max-height: none;
          overflow: visible;
          white-space: pre-wrap;
        }

        .text-content {
          position: relative;
          z-index: 1;
        }

        .fade-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50px;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(38, 38, 39, 0.3) 30%,
            rgba(38, 38, 39, 0.8) 70%,
            var(--node-bg-color, #262627) 100%
          );
          pointer-events: none;
          z-index: 2;
        }

        .keyword-node.selected .fade-overlay {
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(101, 240, 163, 0.3) 30%,
            rgba(101, 240, 163, 0.8) 70%,
            #65f0a3 100%
          );
        }

        .expand-indicator {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          color: #888;
          z-index: 3;
          opacity: 0.8;
          transition: all 0.2s ease;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .expand-indicator:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.5);
          transform: translateX(-50%) scale(1.1);
        }

        .content-text.expanded .expand-indicator {
          position: relative;
          bottom: auto;
          left: auto;
          transform: none;
          margin: 8px auto 0;
        }

        .content-text:hover .expand-indicator {
          opacity: 1;
        }

        .keyword-node.selected .content-text {
          color: #000000;
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
