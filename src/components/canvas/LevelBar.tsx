'use client';

import React, { useRef, useState } from 'react';
import { AILevel } from '@/types/canvas';

interface LevelBarProps {
  levels?: AILevel[];
  currentLevel?: number;
  onLevelClick?: (levelId: string) => void;
  onAddLevel?: (afterLevel: number) => void;
  onThemeToggle?: () => void;
  className?: string;
}

const LevelBar: React.FC<LevelBarProps> = ({
  levels = [],
  currentLevel = 1,
  onLevelClick,
  onAddLevel,
  onThemeToggle,
  className
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
              {level.description}
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
    </div>
  );
};

export default LevelBar;