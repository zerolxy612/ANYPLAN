'use client';

import React, { memo, useState, useRef } from 'react';
import { NodeProps } from '@xyflow/react';
import { KeywordNodeData } from '@/types/canvas';
import { useCanvasStore } from '@/store/canvas.store';
import { getLevelColor } from '@/lib/canvas/utils';
import { NODE_DIMENSIONS } from '@/lib/canvas/constants';

interface KeywordNodeProps extends NodeProps {
  data: KeywordNodeData;
}

const KeywordNode = memo(({ data, selected }: KeywordNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.content);
  const [hideButtonTimer, setHideButtonTimer] = useState<NodeJS.Timeout | null>(null);
  const [isComposing, setIsComposing] = useState(false); // 中文输入状态
  const textareaRef = useRef<HTMLTextAreaElement>(null); // textarea引用
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
    isNodeExpanded,
    generateSiblingNode,
    updateNodeContent
  } = useCanvasStore();

  // 使用 store 中的展开状态
  const isExpanded = isNodeExpanded(data.id);

  const levelColor = getLevelColor(data.level);
  // 使用节点自身的生成状态，而不是全局状态
  const isGenerating = data.isGenerating || false;
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

  // 生成同层级节点
  const handleGenerateSibling = async (position: 'above' | 'below') => {
    if (!isGenerating) {
      await generateSiblingNode(data.id, position);
    }
  };

  // 处理鼠标进入节点区域
  const handleMouseEnter = () => {
    // 清除隐藏定时器
    if (hideButtonTimer) {
      clearTimeout(hideButtonTimer);
      setHideButtonTimer(null);
    }
    setIsHovered(true);
    setShowActions(true);
  };

  // 处理鼠标离开节点区域
  const handleMouseLeave = () => {
    // 延迟隐藏按钮，给用户时间移动到按钮上
    const timer = setTimeout(() => {
      setIsHovered(false);
      setShowActions(false);
    }, 200); // 200ms延迟
    setHideButtonTimer(timer);
  };

  // 处理鼠标进入按钮区域
  const handleButtonMouseEnter = () => {
    // 清除隐藏定时器，保持按钮显示
    if (hideButtonTimer) {
      clearTimeout(hideButtonTimer);
      setHideButtonTimer(null);
    }
  };

  // 处理鼠标离开按钮区域
  const handleButtonMouseLeave = () => {
    // 立即隐藏按钮
    setIsHovered(false);
    setShowActions(false);
  };

  // 右键菜单处理
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  // 删除节点
  const handleDeleteNode = () => {
    deleteNode(data.id);
    setShowContextMenu(false);
  };

  // 关闭右键菜单
  const handleCloseContextMenu = () => {
    setShowContextMenu(false);
  };

  // 开始编辑
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(data.content);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== data.content) {
      updateNodeContent(data.id, editValue.trim());
    }
    setIsEditing(false);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditValue(data.content);
    setIsEditing(false);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 中文输入法候选确认阶段不拦截Enter/Escape
    if (isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // 点击其他地方关闭菜单
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (showContextMenu) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showContextMenu]);

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (hideButtonTimer) {
        clearTimeout(hideButtonTimer);
      }
    };
  }, [hideButtonTimer]);
  
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
        // 展开时大幅提升z-index，确保在所有元素之上
        zIndex: isExpanded ? 9999 : 'auto',
      } as React.CSSProperties}
      onClick={handleNodeClick}
      onDoubleClick={handleNodeDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 节点内容 */}
      <div className="node-content">
        {(data.level === 1 || data.level === 2 || data.level === 3) ? (
          // L1/L2/L3节点：投诉信问题+用户输入
          <div className="complaint-question-node">
            {/* 问题文本 */}
            <div className="question-text">
              {data.questionText || data.content}
            </div>
            {/* 用户输入区域 */}
            <div className="user-input-area">
              <textarea
                ref={textareaRef}
                defaultValue={data.userInput || ''}
                onInput={(e) => {
                  // 使用onInput而不是onChange，减少重新渲染
                  const target = e.target as HTMLTextAreaElement;

                  // 只在非中文输入时立即更新状态
                  if (!isComposing) {
                    useCanvasStore.setState((state) => {
                      const nodeIndex = state.nodes.findIndex(n => n.id === data.id);
                      if (nodeIndex !== -1 && state.nodes[nodeIndex].data) {
                        (state.nodes[nodeIndex].data as KeywordNodeData).userInput = target.value;
                      }
                    });
                  }

                  // 自动调整高度
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
                onPaste={(e) => {
                  // 确保粘贴功能正常工作
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  // 防止某些快捷键被画布拦截
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  // 防止点击触发父节点选择等逻辑，确保输入法焦点稳定
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  // 防止React Flow拖拽等行为影响输入焦点
                  e.stopPropagation();
                }}
                onCompositionStart={() => {
                  // 中文输入开始，暂停其他处理
                  setIsComposing(true);
                }}
                onCompositionEnd={(e) => {
                  // 中文输入结束，更新状态
                  setIsComposing(false);

                  // 确保中文输入的最终结果被保存
                  const target = e.target as HTMLTextAreaElement;
                  useCanvasStore.setState((state) => {
                    const nodeIndex = state.nodes.findIndex(n => n.id === data.id);
                    if (nodeIndex !== -1 && state.nodes[nodeIndex].data) {
                      (state.nodes[nodeIndex].data as KeywordNodeData).userInput = target.value;
                    }
                  });

                  // 调整高度
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
                placeholder="Enter your answer..."
                className="user-input"
                rows={3}
                style={{
                  resize: 'none',
                  imeMode: 'auto' // 支持输入法
                }}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>
        ) : isEditing ? (
          // 其他层级的编辑模式
          <div className="edit-mode">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onBlur={handleSaveEdit}
              className="edit-input"
              autoFocus
            />
          </div>
        ) : (
          // 其他层级的显示模式
          <div
            className={`content-text ${isExpanded ? 'expanded' : 'collapsed'}`}
          >
            <div className="text-content">
              {data.content}
            </div>
            {data.content.length > 30 && (
              <>
                {!isExpanded && <div className="fade-overlay"></div>}
                <div className="expand-indicator" title="Double-click to expand/collapse">
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
        )}

        {/* 加载状态 */}
        {(isGenerating || isRenewing) && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
            <span>{isRenewing ? 'Updating...' : 'Generating...'}</span>
          </div>
        )}
      </div>

      {/* 编辑按钮 - L1/L2/L3节点不显示编辑按钮 */}
      {!isEditing && data.level > 3 && (
        <div
          className="edit-button"
          onClick={(e) => {
            e.stopPropagation();
            handleStartEdit();
          }}
          title="Edit node content"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* 上方+按钮 - L1/L2/L3节点不显示同层级生成按钮 */}
      {nodeSelected && isHovered && data.level > 3 && (
        <div
          className="sibling-add-button"
          onClick={(e) => {
            e.stopPropagation();
            handleGenerateSibling('above');
          }}
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
          title="Generate sibling node"
        >
          +
        </div>
      )}

      {/* 右键菜单 */}
      {showContextMenu && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-menu-item" onClick={handleDeleteNode}>
            🗑️ Delete node
          </div>
        </div>
      )}











      <style jsx>{`
        .keyword-node {
          min-width: ${nodeWidth}px;
          max-width: ${nodeWidth}px;
          min-height: 50px;
          max-height: ${isExpanded ? 'none' : '200px'};
          border-radius: 25px;
          border: 1px solid #e2e8f0;
          background: white;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1), max-height 0.3s ease-out, box-shadow 0.3s ease-out;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          overflow: hidden; /* 确保内容不会超出节点边界 */
          /* 展开时增强阴影效果，提升视觉层级 */
          box-shadow: ${isExpanded ? '0 12px 48px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.15)' : 'inherit'};
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
          overflow: hidden; /* 确保内容不会超出节点边界 */
          min-height: 0; /* 允许flex子元素收缩 */
        }
        
        .content-text {
          text-align: left;
          font-size: 0.875rem; /* 14px */
          line-height: 1.4;
          color: #d9d9d9;
          word-break: break-word;
          width: ${contentWidth}px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .content-text.collapsed {
          max-height: 120px; /* 增加高度限制，约8-9行文字 */
          overflow: hidden;
          white-space: pre-wrap;
          transition: max-height 0.3s ease-out;
        }

        .content-text.expanded {
          max-height: none; /* 展开时不限制高度 */
          overflow: visible;
          white-space: pre-wrap;
          transition: max-height 0.3s ease-out;
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
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 12px;
          color: #374151;
          font-weight: 500;
          z-index: 10;
          transition: all 0.2s ease-in-out;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #f3f4f6;
          border-top: 3px solid #10b981;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 添加脉冲动画效果 */
        .loading-overlay::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 60px;
          height: 60px;
          border: 2px solid #10b981;
          border-radius: 50%;
          opacity: 0.3;
          transform: translate(-50%, -50%);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.7;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.7;
          }
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

        /* 同层级节点生成按钮 */
        .sibling-add-button {
          position: absolute;
          left: 50%;
          top: -28px;
          transform: translateX(-50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #65f0a3;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .sibling-add-button:hover {
          transform: translateX(-50%) scale(1.1);
          box-shadow: 0 4px 8px rgba(101, 240, 163, 0.4);
          background: #4ade80;
        }

        .sibling-add-button:active {
          transform: translateX(-50%) scale(0.95);
        }

        /* 右键菜单样式 */
        .context-menu {
          background: #2a2830;
          border: 1px solid #404040;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          min-width: 120px;
          overflow: hidden;
        }

        .context-menu-item {
          padding: 8px 12px;
          color: #ffffff;
          font-size: 0.875rem; /* 14px */
          cursor: pointer;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .context-menu-item:hover {
          background: #404040;
        }

        .context-menu-item:active {
          background: #505050;
        }

        /* 编辑功能样式 */
        .edit-button {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
          color: #666;
        }

        .edit-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .edit-mode {
          width: 100%;
          padding: 8px;
        }

        .edit-input {
          width: 100%;
          background: transparent;
          border: 1px solid #65f0a3;
          border-radius: 4px;
          padding: 4px 8px;
          color: #fff;
          font-size: 0.875rem; /* 14px */
          outline: none;
        }

        .edit-input:focus {
          border-color: #4ade80;
          box-shadow: 0 0 0 2px rgba(101, 240, 163, 0.2);
        }

        /* 投诉信问题节点样式 */
        .complaint-question-node {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .question-text {
          font-size: 0.875rem; /* 14px */
          font-weight: 600;
          color: #ffffff;
          text-align: center;
          padding: 4px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .user-input-area {
          display: flex;
          flex-direction: column;
        }

        .user-input {
          width: 100%;
          background: #171717;
          border: 1px solid #404040;
          border-radius: 8px;
          padding: 8px 12px;
          color: #ffffff;
          font-size: 0.875rem; /* 14px */
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
          line-height: 1.4;
          min-height: 60px;
          max-height: 120px;
          overflow-y: auto;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .user-input:focus {
          background: #171717;
          border-color: #65f0a3;
          box-shadow: 0 0 0 2px rgba(101, 240, 163, 0.3);
        }

        .user-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
          font-weight: 400;
        }

        /* 自定义滚动条样式 */
        .user-input::-webkit-scrollbar {
          width: 6px;
        }

        .user-input::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .user-input::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .user-input::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
});

KeywordNode.displayName = 'KeywordNode';

export default KeywordNode;
