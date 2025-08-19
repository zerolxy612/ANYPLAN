'use client';

import React from 'react';
import Canvas from '@/components/canvas/Canvas';

export default function TestSlidePage() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex',
      backgroundColor: '#1a1a1a'
    }}>
      {/* 画布区域 */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Canvas />
      </div>
      
      {/* 右侧信息面板 */}
      <div style={{
        width: '300px',
        backgroundColor: '#2a292c',
        padding: '20px',
        color: '#ffffff',
        borderLeft: '1px solid #404040'
      }}>
        <h3>滑动功能测试</h3>
        <div style={{ marginTop: '20px', fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>测试说明：</strong></p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>当前有6个层级（L1-L6）</li>
            <li>如果层级按钮被截断，应该显示滑动按钮</li>
            <li>点击右滑动按钮（›）向右滑动</li>
            <li>点击左滑动按钮（‹）向左滑动</li>
            <li>滑动时层级按钮和画布背景区域应该同步移动</li>
          </ul>
          
          <p style={{ marginTop: '20px' }}><strong>预期效果：</strong></p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>初始状态：显示L1、L2、L3，右侧有›按钮</li>
            <li>点击›后：显示L2、L3、L4，左右都有按钮</li>
            <li>继续点击›：显示L3、L4、L5，然后L4、L5、L6</li>
            <li>最右侧时：只显示‹按钮</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
