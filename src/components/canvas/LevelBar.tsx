'use client';

import React, { useState } from 'react';
import { AILevel } from '@/types/canvas';

interface LevelBarProps {
  levels?: AILevel[];
  currentLevel?: number;
  onLevelClick?: (levelId: string) => void;
  onAddLevel?: (afterLevel: number) => void;
  onDeleteLevel?: (level: number) => void;
  onEditLevel?: (level: number, newDescription: string) => void;
  onThemeToggle?: () => void;
  className?: string;
  viewport?: { x: number; y: number; zoom: number };
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
}

const LevelBar: React.FC<LevelBarProps> = ({
  levels = [],
  currentLevel = 1,
  onLevelClick,
  onAddLevel,
  onDeleteLevel,
  onEditLevel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onThemeToggle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className,
  viewport,
  onViewportChange
}) => {

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    level: number;
  } | null>(null);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isComposing, setIsComposing] = useState(false);



  // 右键菜单处理
  const handleContextMenu = (e: React.MouseEvent, level: number) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      level
    });
  };

  const handleDeleteLevel = () => {
    if (contextMenu && levels.length > 1) { // 至少保留一个层级
      onDeleteLevel?.(contextMenu.level);
    }
    setContextMenu(null);
  };

  const handleDoubleClick = (level: AILevel) => {
    setEditingLevel(level.level);
    setEditingText(level.description);
  };

  const handleEditSubmit = () => {
    if (editingLevel !== null && editingText.trim()) {
      onEditLevel?.(editingLevel, editingText.trim());
    }
    setEditingLevel(null);
    setEditingText('');
  };







  // 点击其他地方关闭右键菜单
  React.useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);


  // 如果没有层级数据，显示默认状态
  if (levels.length === 0) {
    return (
      <div className="level-bar" style={{
        width: '100%',
        height: '50px',
        backgroundColor: '#2a292c',
        borderBottom: '1px solid #404040',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        position: 'relative'
      }}>
        <div style={{
          color: '#666666',
          fontSize: '14px',
          fontWeight: '500',
          letterSpacing: '0.5px',
          textAlign: 'center',
          opacity: 0.8
        }}>
          SueMind | Power Your Complaint
        </div>
      </div>
    );
  }

  return (
    <div className="level-bar" style={{
      position: 'relative',
      width: '100%',
      height: '50px',
      backgroundColor: '#2a292c',
      borderBottom: '1px solid #404040',
      overflow: 'hidden'
    }}>

      {/* 标题文本 - 始终显示 */}
      <div style={{
        position: 'absolute',
        left: '20px',
        top: '0',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        color: '#666666',
        fontSize: '14px',
        fontWeight: '500',
        letterSpacing: '0.5px',
        opacity: 0.8,
        zIndex: 1
      }}>
        SueMind | Power Your Complaint
      </div>

      {/* 层级按钮容器 */}
      <div style={{
        position: 'absolute',
        left: '250px', // 为标题文本留出空间
        top: '0',
        right: '20px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {levels.map((level, index) => {
          // 计算与画布层级区域对应的位置
          // 画布中层级区域：x = 400 + (level.level - 1) * 300, width = 300
          const canvasLevelX = 400 + (level.level - 1) * 300;
          const canvasLevelWidth = 300;

          // 考虑视口变换
          const zoom = viewport?.zoom || 1;
          const offsetX = viewport?.x || 0;

          // 计算变换后的位置（相对于画布容器）
          const transformedX = canvasLevelX * zoom + offsetX;
          const transformedWidth = canvasLevelWidth * zoom;

          // 转换为相对于LevelBar容器的位置
          // LevelBar容器从250px开始，所以需要减去250px
          // 让按钮居中对齐到对应的画布区域
          const buttonWidth = 140; // 增加宽度到140px，适合显示完整的英文问题文本
          const buttonLeft = transformedX - 250 + (transformedWidth - buttonWidth) / 2; // 居中对齐，调整为新的容器起始位置

          // 如果按钮超出可视范围，则不显示
          const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 250 - 20 : 550; // 层级按钮容器的实际可用宽度
          if (buttonLeft > containerWidth || buttonLeft + buttonWidth < 0) {
            return null;
          }

          // 确保按钮在容器内显示，如果部分超出则调整位置
          const adjustedButtonLeft = Math.max(0, Math.min(buttonLeft, containerWidth - buttonWidth));

          // 添加层级按钮（编辑态使用div，避免在button内嵌input导致IME异常）
          const levelButton = (
            editingLevel === level.level ? (
              <div
                key={level.level}
                title={`${level.label}: ${level.description}${level.nodeCount ? ` (${level.nodeCount}个节点)` : ''}`}
                style={{
                  position: 'absolute',
                  left: `${adjustedButtonLeft}px`,
                  width: `${buttonWidth}px`,
                  height: '28px',
                  padding: '0',
                  backgroundColor: level.level === currentLevel ? '#65f0a3' : '#18161a',
                  border: level.level === currentLevel ? 'none' : '1px solid #404040',
                  borderRadius: '14px',
                  fontSize: '11px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                  zIndex: 5
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* L1 标签部分 */}
                <div style={{
                  padding: '4px 6px',
                  backgroundColor: level.level === currentLevel ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                  color: level.level === currentLevel ? '#000000' : '#ffffff',
                  fontWeight: '600',
                  borderRight: `1px solid ${level.level === currentLevel ? 'rgba(0,0,0,0.2)' : '#404040'}`,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '10px',
                  minWidth: '24px',
                  justifyContent: 'center'
                }}>
                  {level.label}
                </div>
                {/* 描述输入部分（编辑态） */}
                <div style={{
                  padding: '4px 6px',
                  color: level.level === currentLevel ? '#000000' : '#ffffff',
                  flex: 1,
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '10px',
                  minWidth: 0
                }}>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    onBlur={() => { if (!isComposing) handleEditSubmit(); }}
                    onKeyDown={(e) => {
                      if (isComposing) return;
                      if (e.key === 'Enter') {
                        handleEditSubmit();
                      } else if (e.key === 'Escape') {
                        setEditingLevel(null);
                        setEditingText('');
                      }
                    }}
                    autoFocus
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'inherit',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      width: '100%',
                      outline: 'none'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {level.nodeCount && level.nodeCount > 0 && (
                  <div style={{
                    padding: '1px 3px',
                    backgroundColor: level.level === currentLevel ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                    color: level.level === currentLevel ? '#000000' : '#ffffff',
                    fontSize: '8px',
                    borderRadius: '4px',
                    marginRight: '3px',
                    flexShrink: 0
                  }}>
                    {level.nodeCount}
                  </div>
                )}
              </div>
            ) : (
              <button
                key={level.level}
                onClick={() => onLevelClick?.(level.label)}
                onContextMenu={(e) => handleContextMenu(e, level.level)}
                onDoubleClick={() => handleDoubleClick(level)}
                title={`${level.label}: ${level.description}${level.nodeCount ? ` (${level.nodeCount}个节点)` : ''}`}
                style={{
                  position: 'absolute',
                  left: `${adjustedButtonLeft}px`,
                  width: `${buttonWidth}px`,
                  height: '28px',
                  padding: '0',
                  backgroundColor: level.level === currentLevel ? '#65f0a3' : '#18161a',
                  border: level.level === currentLevel ? 'none' : '1px solid #404040',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                  zIndex: 5
                }}
                onMouseEnter={(e) => {
                  if (level.level !== currentLevel) {
                    e.currentTarget.style.backgroundColor = '#2a2830';
                  }
                }}
                onMouseLeave={(e) => {
                  if (level.level !== currentLevel) {
                    e.currentTarget.style.backgroundColor = '#18161a';
                  }
                }}
              >
                {/* L1 标签部分 */}
                <div style={{
                  padding: '4px 6px',
                  backgroundColor: level.level === currentLevel ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                  color: level.level === currentLevel ? '#000000' : '#ffffff',
                  fontWeight: '600',
                  borderRight: `1px solid ${level.level === currentLevel ? 'rgba(0,0,0,0.2)' : '#404040'}`,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '10px',
                  minWidth: '24px',
                  justifyContent: 'center'
                }}>
                  {level.label}
                </div>

                {/* 描述部分 */}
                <div style={{
                  padding: '4px 6px',
                  color: level.level === currentLevel ? '#000000' : '#ffffff',
                  flex: 1,
                  textAlign: 'left',
                  // 原来的省略号逻辑（因为现在是固定文本，不需要省略号了）
                  // overflow: 'hidden',
                  // textOverflow: 'ellipsis',
                  // whiteSpace: 'nowrap',
                  // 新的完整显示逻辑
                  whiteSpace: 'pre-wrap', // 支持换行显示完整内容
                  wordBreak: 'break-word', // 长单词自动换行
                  fontSize: '10px',
                  minWidth: 0 // 确保flex子元素可以收缩
                }}>
                  {level.description}
                </div>

                {/* 节点数量显示 */}
                {level.nodeCount && level.nodeCount > 0 && (
                  <div style={{
                    padding: '1px 3px',
                    backgroundColor: level.level === currentLevel ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                    color: level.level === currentLevel ? '#000000' : '#ffffff',
                    fontSize: '8px',
                    borderRadius: '4px',
                    marginRight: '3px',
                    flexShrink: 0
                  }}>
                    {level.nodeCount}
                  </div>
                )}
              </button>
            )
          );

          // 添加层级间的"+"按钮（在当前层级后面，但不包括最后一个层级）
          // 只有在onAddLevel回调存在时才显示（即未禁用时）
          if (index < levels.length - 1 && levels.length < 3 && onAddLevel) {
            // 计算下一个层级的位置
            const nextLevel = levels[index + 1];
            const nextCanvasLevelX = 400 + (nextLevel.level - 1) * 300;
            const nextCanvasLevelWidth = 300;
            const nextTransformedX = nextCanvasLevelX * zoom + offsetX;
            const nextTransformedWidth = nextCanvasLevelWidth * zoom;

            // "+"按钮位于当前层级和下一个层级之间
            const currentButtonRight = transformedX - 120 + (transformedWidth - 100) / 2 + 100; // 当前按钮的右边缘
            const nextButtonLeft = nextTransformedX - 120 + (nextTransformedWidth - 100) / 2; // 下一个按钮的左边缘
            const addButtonLeft = Math.max(0, (currentButtonRight + nextButtonLeft) / 2 - 12); // 居中，12px是按钮宽度的一半

            const addButton = (
              <button
                key={`add-after-${level.level}`}
                onClick={() => {
                  console.log('🔄 Add button clicked, afterLevel:', level.level);
                  onAddLevel?.(level.level);
                }}
                style={{
                  position: 'absolute',
                  left: `${addButtonLeft}px`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: '#404040',
                  border: '1px solid #606060',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  zIndex: 4
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#65f0a3';
                  e.currentTarget.style.color = '#000000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#404040';
                  e.currentTarget.style.color = '#ffffff';
                }}
                title={`在L${level.level}和L${nextLevel.level}之间添加层级`}
              >
                +
              </button>
            );

            return [levelButton, addButton];
          }

          return levelButton;
        })}

        {/* 添加层级按钮 - 位于最后一个层级的右侧 */}
        {/* 只有在onAddLevel回调存在时才显示（即未禁用时） */}
        {levels.length < 3 && levels.length > 0 && onAddLevel && (() => {
          const lastLevel = levels[levels.length - 1];
          const lastCanvasLevelX = 400 + (lastLevel.level - 1) * 300;
          const lastCanvasLevelWidth = 300;
          const zoom = viewport?.zoom || 1;
          const offsetX = viewport?.x || 0;
          const lastTransformedX = lastCanvasLevelX * zoom + offsetX;
          const lastTransformedWidth = lastCanvasLevelWidth * zoom;

          // 位于最后一个层级右侧
          const addButtonLeft = Math.max(0, lastTransformedX - 120 + lastTransformedWidth + 10);

          return (
            <button
              onClick={() => {
                console.log('🔄 Last add button clicked, afterLevel:', lastLevel.level);
                onAddLevel?.(lastLevel.level);
              }}
              style={{
                position: 'absolute',
                left: `${addButtonLeft}px`,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                backgroundColor: '#404040',
                border: '1px solid #606060',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                zIndex: 5
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#65f0a3';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#404040';
                e.currentTarget.style.color = '#ffffff';
              }}
              title="在最后添加新层级"
            >
              +
            </button>
          );
        })()}


      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: '#2a292c',
            border: '1px solid #404040',
            borderRadius: '8px',
            padding: '4px 0',
            zIndex: 1000,
            minWidth: '80px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDeleteLevel}
            disabled={levels.length <= 1 || !onDeleteLevel}
            style={{
              width: '100%',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              color: (levels.length <= 1 || !onDeleteLevel) ? '#666666' : '#ffffff',
              cursor: (levels.length <= 1 || !onDeleteLevel) ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              fontSize: '14px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (levels.length > 1 && onDeleteLevel) {
                e.currentTarget.style.backgroundColor = '#404040';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={!onDeleteLevel ? '已生成节点后无法删除层级' : levels.length <= 1 ? '至少需要保留一个层级' : '删除此层级'}
          >
            {!onDeleteLevel ? '删除 (已禁用)' : '删除'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LevelBar;
