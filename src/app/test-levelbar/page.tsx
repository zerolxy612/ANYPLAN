'use client';

import React, { useState } from 'react';
import LevelBar from '@/components/canvas/LevelBar';
import { AILevel } from '@/types/canvas';

export default function TestLevelBar() {
  const [levels, setLevels] = useState<AILevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);

  const addTestLevels = () => {
    const testLevels: AILevel[] = [
      { level: 1, label: 'L1', description: '表层探索', nodeCount: 3, isActive: true },
      { level: 2, label: 'L2', description: '具体原因', nodeCount: 5, isActive: false },
      { level: 3, label: 'L3', description: '深层分析', nodeCount: 2, isActive: false },
      { level: 4, label: 'L4', description: '根本原因', nodeCount: 1, isActive: false },
      { level: 5, label: 'L5', description: '解决方案', nodeCount: 4, isActive: false },
      { level: 6, label: 'L6', description: '实施策略', nodeCount: 2, isActive: false }
    ];
    setLevels(testLevels);
  };

  const clearLevels = () => {
    setLevels([]);
  };

  const handleLevelClick = (levelId: string) => {
    const level = parseInt(levelId.replace('L', ''));
    setCurrentLevel(level);
    setLevels(prev => prev.map(l => ({
      ...l,
      isActive: l.level === level
    })));
  };

  const handleAddLevel = (afterLevel: number) => {
    const newLevel = afterLevel + 1;
    setLevels(prev => {
      // 更新现有层级编号
      const updatedLevels = prev.map(level => ({
        ...level,
        level: level.level > afterLevel ? level.level + 1 : level.level,
        label: level.level > afterLevel ? `L${level.level + 1}` : level.label,
        isActive: false
      }));

      // 添加新层级
      const newLevelObj: AILevel = {
        level: newLevel,
        label: `L${newLevel}`,
        description: `新层级 ${newLevel}`,
        nodeCount: 0,
        isActive: true
      };

      const insertIndex = updatedLevels.findIndex(l => l.level > newLevel);
      if (insertIndex === -1) {
        updatedLevels.push(newLevelObj);
      } else {
        updatedLevels.splice(insertIndex, 0, newLevelObj);
      }

      return updatedLevels;
    });
    setCurrentLevel(newLevel);
  };

  const handleDeleteLevel = (levelToDelete: number) => {
    if (levels.length <= 1) return;

    setLevels(prev => {
      const filtered = prev.filter(level => level.level !== levelToDelete);
      return filtered.map(level => ({
        ...level,
        level: level.level > levelToDelete ? level.level - 1 : level.level,
        label: level.level > levelToDelete ? `L${level.level - 1}` : level.label
      }));
    });

    if (currentLevel === levelToDelete) {
      setCurrentLevel(1);
    } else if (currentLevel > levelToDelete) {
      setCurrentLevel(currentLevel - 1);
    }
  };

  const handleEditLevel = (level: number, newDescription: string) => {
    setLevels(prev => prev.map(l => 
      l.level === level ? { ...l, description: newDescription } : l
    ));
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#161618',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#2a292c',
        borderBottom: '1px solid #404040'
      }}>
        <h1 style={{ color: '#ffffff', marginBottom: '20px' }}>LevelBar 测试页面</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={addTestLevels}
            style={{
              padding: '8px 16px',
              backgroundColor: '#65f0a3',
              color: '#000000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            添加测试层级
          </button>
          <button
            onClick={clearLevels}
            style={{
              padding: '8px 16px',
              backgroundColor: '#404040',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            清空层级
          </button>
        </div>
        <p style={{ color: '#a1a1aa', marginTop: '10px' }}>
          当前层级数量: {levels.length} | 当前激活层级: L{currentLevel}
        </p>
      </div>

      {levels.length > 0 ? (
        <LevelBar
          levels={levels}
          currentLevel={currentLevel}
          onLevelClick={handleLevelClick}
          onAddLevel={handleAddLevel}
          onDeleteLevel={handleDeleteLevel}
          onEditLevel={handleEditLevel}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px'
        }}>
          <div style={{
            width: '90%',
            height: '60px',
            backgroundColor: '#2a292c',
            borderRadius: '30px',
            border: '1px solid #404040',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a1a1aa',
            fontSize: '14px'
          }}>
            点击&ldquo;添加测试层级&rdquo;来测试LevelBar功能
          </div>
        </div>
      )}

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#a1a1aa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>测试说明</h2>
          <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
            <li>点击&ldquo;添加测试层级&rdquo;会创建6个测试层级</li>
            <li>LevelBar一次最多显示3个层级</li>
            <li>使用左右滚动按钮查看更多层级</li>
            <li>点击层级按钮可以切换当前层级</li>
            <li>双击层级可以编辑描述</li>
            <li>右键点击层级可以删除</li>
            <li>点击&ldquo;+&rdquo;按钮可以添加新层级</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
