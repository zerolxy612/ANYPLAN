'use client';

import React from 'react';

interface LevelBarProps {
  onLevelClick?: (levelId: string) => void;
  onAddLevel?: (afterLevelId?: string) => void;
  onThemeToggle?: () => void;
  className?: string;
}

const LevelBar: React.FC<LevelBarProps> = ({
  onLevelClick,
  onAddLevel,
  onThemeToggle,
  className
}) => {
  // 使用参数避免未使用警告
  console.log('LevelBar props:', { onLevelClick, onAddLevel, onThemeToggle, className });

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
      <div style={{ color: '#a1a1aa' }}>主题 | 排版</div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button style={{
          padding: '8px 16px',
          backgroundColor: '#65f0a3',
          color: '#000000',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer'
        }}>
          L1 表层探索
        </button>
        <button style={{
          padding: '8px 16px',
          backgroundColor: '#18161a',
          color: '#a1a1aa',
          border: '1px solid #404040',
          borderRadius: '20px',
          cursor: 'pointer'
        }}>
          L2 具体原因
        </button>
        <button style={{
          padding: '8px 16px',
          backgroundColor: '#18161a',
          color: '#a1a1aa',
          border: '1px solid #404040',
          borderRadius: '20px',
          cursor: 'pointer'
        }}>
          L3 解释层级
        </button>
      </div>
    </div>
  );
};

export default LevelBar;