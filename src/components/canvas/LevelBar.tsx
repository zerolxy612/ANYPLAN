'use client';

import React from 'react';
import { AILevel } from '@/types/canvas';

interface LevelBarProps {
  levels?: AILevel[];
  currentLevel?: number;
  onLevelClick?: (levelId: string) => void;
  onAddLevel?: (afterLevelId?: string) => void;
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
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
        {levels.map((level) => (
          <button
            key={level.level}
            onClick={() => onLevelClick?.(level.label)}
            style={{
              padding: '8px 16px',
              backgroundColor: level.level === currentLevel ? '#65f0a3' : '#18161a',
              color: level.level === currentLevel ? '#000000' : '#a1a1aa',
              border: level.level === currentLevel ? 'none' : '1px solid #404040',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (level.level !== currentLevel) {
                e.currentTarget.style.backgroundColor = '#2a2830';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (level.level !== currentLevel) {
                e.currentTarget.style.backgroundColor = '#18161a';
                e.currentTarget.style.color = '#a1a1aa';
              }
            }}
          >
            {level.label} {level.description}
            {level.nodeCount > 0 && (
              <span style={{
                marginLeft: '4px',
                fontSize: '12px',
                opacity: 0.7
              }}>
                ({level.nodeCount})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelBar;