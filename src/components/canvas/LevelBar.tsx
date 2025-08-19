'use client';

import React, { useRef, useState } from 'react';
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
}

const LevelBar: React.FC<LevelBarProps> = ({
  levels = [],
  currentLevel = 1,
  onLevelClick,
  onAddLevel,
  onDeleteLevel,
  onEditLevel,
  onThemeToggle,
  className
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    level: number;
  } | null>(null);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // 检查滚动状态
  const checkScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // 滚动函数
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(checkScrollState, 300);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(checkScrollState, 300);
    }
  };

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

  const handleEditCancel = () => {
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

  // 初始化滚动状态检查
  React.useEffect(() => {
    checkScrollState();
    const handleResize = () => checkScrollState();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [levels]);
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
      width: '100%',
      height: '60px',
      backgroundColor: '#2a292c',
      borderBottom: '1px solid #404040',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px'
    }}>
      <div style={{ color: '#a1a1aa', fontSize: '14px', marginRight: '20px' }}>
        主题 | 排版
      </div>

      {/* 左滚动按钮 */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#404040',
            border: '1px solid #606060',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#65f0a3';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#404040';
            e.currentTarget.style.color = '#ffffff';
          }}
        >
          ‹
        </button>
      )}

      {/* 滚动容器 */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollState}
        style={{
          flex: 1,
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          overflowX: 'auto',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
          paddingLeft: '8px',
          paddingRight: '8px',
          // 隐藏webkit滚动条
          WebkitScrollbar: 'none'
        } as React.CSSProperties}
      >
        {levels.map((level, index) => (
          <React.Fragment key={level.level}>
            {/* 层级按钮 */}
            <button
              onClick={() => onLevelClick?.(level.label)}
              onContextMenu={(e) => handleContextMenu(e, level.level)}
              onDoubleClick={() => handleDoubleClick(level)}
              style={{
              padding: '0',
              backgroundColor: level.level === currentLevel ? '#65f0a3' : '#18161a',
              border: level.level === currentLevel ? 'none' : '1px solid #404040',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden'
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
              padding: '8px 12px',
              backgroundColor: level.level === currentLevel ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
              color: level.level === currentLevel ? '#000000' : '#ffffff',
              fontWeight: '600',
              borderRight: `1px solid ${level.level === currentLevel ? 'rgba(0,0,0,0.2)' : '#404040'}`,
              display: 'flex',
              alignItems: 'center'
            }}>
              {level.label}
            </div>

            {/* 描述文本部分 */}
            <div style={{
              padding: '8px 16px',
              color: level.level === currentLevel ? '#000000' : '#a1a1aa',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
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
                      handleEditCancel();
                    }
                  }}
                  autoFocus
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    width: '100px',
                    minWidth: '60px'
                  }}
                />
              ) : (
                level.description
              )}
              {level.nodeCount > 0 && (
                <span style={{
                  fontSize: '12px',
                  opacity: 0.7
                }}>
                  ({level.nodeCount})
                </span>
              )}
            </div>
            </button>

            {/* 添加层级按钮 - 在每个层级后面，但不在最后一个层级后面 */}
            {index < levels.length - 1 && levels.length < 6 && (
              <button
                onClick={() => onAddLevel?.(level.level)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#404040',
                  border: '1px solid #606060',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#65f0a3';
                  e.currentTarget.style.color = '#000000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#404040';
                  e.currentTarget.style.color = '#ffffff';
                }}
                title={`在L${level.level}后添加新层级`}
              >
                +
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 右滚动按钮 */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#404040',
            border: '1px solid #606060',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#65f0a3';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#404040';
            e.currentTarget.style.color = '#ffffff';
          }}
        >
          ›
        </button>
      )}

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