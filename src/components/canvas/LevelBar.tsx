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



  // 滑动功能 - 添加丝滑动画效果和边界处理
  const handleSlideLeft = () => {
    if (!viewport || !onViewportChange || levels.length === 0) return;

    const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 120 - 40 : 800;
    const minLevel = Math.min(...levels.map(l => l.level));

    // 找到当前最左侧完全可见的层级
    let leftmostFullyVisibleLevel = Infinity;
    for (const level of levels) {
      const canvasLevelX = 400 + (level.level - 1) * 300;
      const transformedX = canvasLevelX * viewport.zoom + viewport.x;
      const buttonLeft = transformedX - 120 + (300 * viewport.zoom - 100) / 2;

      if (buttonLeft >= 0 && buttonLeft + 100 <= containerWidth) {
        leftmostFullyVisibleLevel = Math.min(leftmostFullyVisibleLevel, level.level);
      }
    }

    // 如果当前已经可以看到原始区域和前3个层级，回到初始状态
    const originalAreaX = 50; // 原始区域的x位置
    const originalAreaVisible = (originalAreaX * viewport.zoom + viewport.x) >= -50; // 原始区域是否可见

    if (leftmostFullyVisibleLevel <= minLevel && originalAreaVisible) {
      // 回到初始状态：显示原始区域 + L1 + L2 + L3
      const targetX = -150;
      animateViewportChange(viewport, { ...viewport, x: targetX });
      return;
    }

    // 如果还没到最左边，继续向左滑动
    if (leftmostFullyVisibleLevel > minLevel) {
      const targetLevel = Math.max(minLevel, leftmostFullyVisibleLevel - 1);
      const targetCanvasX = 400 + (targetLevel - 1) * 300;
      const targetX = containerWidth / 2 - (targetCanvasX * viewport.zoom - 120) - (300 * viewport.zoom) / 2;
      animateViewportChange(viewport, { ...viewport, x: targetX });
    } else {
      // 回到显示原始区域的初始状态
      const targetX = -150;
      animateViewportChange(viewport, { ...viewport, x: targetX });
    }
  };

  const handleSlideRight = () => {
    if (!viewport || !onViewportChange || levels.length === 0) return;

    const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 120 - 40 : 800;
    const maxLevel = Math.max(...levels.map(l => l.level));

    // 找到当前最右侧完全可见的层级
    let rightmostFullyVisibleLevel = 0;
    for (const level of levels) {
      const canvasLevelX = 400 + (level.level - 1) * 300;
      const transformedX = canvasLevelX * viewport.zoom + viewport.x;
      const buttonLeft = transformedX - 120 + (300 * viewport.zoom - 100) / 2;

      if (buttonLeft >= 0 && buttonLeft + 100 <= containerWidth) {
        rightmostFullyVisibleLevel = Math.max(rightmostFullyVisibleLevel, level.level);
      }
    }

    // 如果已经是最后一个层级，不再滑动
    if (rightmostFullyVisibleLevel >= maxLevel) {
      return;
    }

    // 计算目标位置，让下一个层级完全可见
    const targetLevel = Math.min(maxLevel, rightmostFullyVisibleLevel + 1);
    const targetCanvasX = 400 + (targetLevel - 1) * 300;

    // 计算让目标层级居中显示的viewport位置
    const targetX = containerWidth / 2 - (targetCanvasX * viewport.zoom - 120) - (300 * viewport.zoom) / 2;

    // 使用动画过渡
    animateViewportChange(viewport, { ...viewport, x: targetX });
  };

  // 动画过渡函数
  const animateViewportChange = (from: { x: number; y: number; zoom: number }, to: { x: number; y: number; zoom: number }) => {
    if (!onViewportChange) return;

    const duration = 300; // 300ms动画时长
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 使用easeInOutCubic缓动函数
      const easeProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentX = from.x + (to.x - from.x) * easeProgress;

      onViewportChange({
        x: currentX,
        y: from.y,
        zoom: from.zoom
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // 计算滑动按钮的显示状态
  const calculateSlideButtonsVisibility = () => {
    if (!viewport || levels.length === 0) {
      return { showLeftSlide: false, showRightSlide: false };
    }

    const zoom = viewport.zoom || 1;
    const offsetX = viewport.x || 0;
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 120 - 40 : 800;

    // 检查原始区域是否可见
    const originalAreaX = 50;
    const originalAreaVisible = (originalAreaX * zoom + offsetX) >= -50;

    // 检查层级的可见性
    let rightmostVisibleLevel = 0;
    let leftmostVisibleLevel = Infinity;

    for (const level of levels) {
      const canvasLevelX = 400 + (level.level - 1) * 300;
      const canvasLevelWidth = 300;
      const transformedX = canvasLevelX * zoom + offsetX;
      const transformedWidth = canvasLevelWidth * zoom;
      const buttonWidth = 100;
      const buttonLeft = transformedX - 120 + (transformedWidth - buttonWidth) / 2;

      // 记录完全可见的层级范围
      if (buttonLeft >= 0 && buttonLeft + buttonWidth <= containerWidth) {
        leftmostVisibleLevel = Math.min(leftmostVisibleLevel, level.level);
        rightmostVisibleLevel = Math.max(rightmostVisibleLevel, level.level);
      }
    }

    const maxLevel = Math.max(...levels.map(l => l.level));
    const minLevel = Math.min(...levels.map(l => l.level));

    // 左滑动按钮：如果不是在初始状态（显示原始区域+前3个层级），则显示
    const showLeftSlide = !originalAreaVisible || leftmostVisibleLevel > minLevel;

    // 右滑动按钮：如果最右侧可见层级不是最后一个层级，则显示
    const showRightSlide = rightmostVisibleLevel < maxLevel;

    return { showLeftSlide, showRightSlide };
  };

  const { showLeftSlide, showRightSlide } = calculateSlideButtonsVisibility();

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
        height: '60px',
        backgroundColor: '#2a292c',
        borderBottom: '1px solid #404040',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px'
      }}>
        <div style={{ color: '#a1a1aa', fontSize: '14px' }}>
          请在右侧输入问题开始探索
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
      {/* 主题排版标签 - 固定在左侧 */}
      <div style={{
        position: 'absolute',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#a1a1aa',
        fontSize: '12px',
        zIndex: 10
      }}>
        主题 | 排版
      </div>

      {/* 层级按钮容器 - 简化版本，先确保基本显示正确 */}
      <div style={{
        position: 'absolute',
        left: '120px', // 在主题标签右侧开始
        top: '0',
        right: '40px', // 为滑动按钮留出空间
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
          // LevelBar容器从120px开始，所以需要减去120px
          // 让按钮居中对齐到对应的画布区域
          const buttonWidth = 100; // 固定宽度100px，适合显示约5个中文字符
          const buttonLeft = transformedX - 120 + (transformedWidth - buttonWidth) / 2; // 居中对齐，不使用Math.max

          // 如果按钮超出可视范围，则不显示
          const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 120 - 40 : 800; // 层级按钮容器的实际可用宽度
          if (buttonLeft > containerWidth || buttonLeft + buttonWidth < 0) {
            return null;
          }

          // 确保按钮在容器内显示，如果部分超出则调整位置
          const adjustedButtonLeft = Math.max(0, Math.min(buttonLeft, containerWidth - buttonWidth));

          // 添加层级按钮
          const levelButton = (
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
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '10px',
                minWidth: 0 // 确保flex子元素可以收缩
              }}>
                {editingLevel === level.level ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={handleEditSubmit}
                    onKeyDown={(e) => {
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
                ) : (
                  level.description
                )}
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
          );

          // 添加层级间的"+"按钮（在当前层级后面，但不包括最后一个层级）
          if (index < levels.length - 1 && levels.length < 6) {
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
        {levels.length < 6 && levels.length > 0 && (() => {
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

        {/* 左滑动按钮 */}
        {showLeftSlide && (
          <button
            onClick={handleSlideLeft}
            style={{
              position: 'absolute',
              left: '5px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
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
              zIndex: 15
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#65f0a3';
              e.currentTarget.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#404040';
              e.currentTarget.style.color = '#ffffff';
            }}
            title="向左滑动查看前面的层级"
          >
            ‹
          </button>
        )}

        {/* 右滑动按钮 */}
        {showRightSlide && (
          <button
            onClick={handleSlideRight}
            style={{
              position: 'absolute',
              right: '5px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
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
              zIndex: 15
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#65f0a3';
              e.currentTarget.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#404040';
              e.currentTarget.style.color = '#ffffff';
            }}
            title="向右滑动查看后面的层级"
          >
            ›
          </button>
        )}
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
            disabled={levels.length <= 1}
            style={{
              width: '100%',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              color: levels.length <= 1 ? '#666666' : '#ffffff',
              cursor: levels.length <= 1 ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              fontSize: '14px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (levels.length > 1) {
                e.currentTarget.style.backgroundColor = '#404040';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            删除
          </button>
        </div>
      )}
    </div>
  );
};

export default LevelBar;