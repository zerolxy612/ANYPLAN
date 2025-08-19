'use client';

import React from 'react';
import Canvas from '@/components/canvas/Canvas';

export default function Home() {
  return (
    <div className="canvas-page">
      <div className="canvas-layout">
        {/* 左侧画布区域 */}
        <div className="canvas-area">
          <Canvas />
        </div>

        {/* 右侧侧边栏 */}
        <div className="sidebar">
          <div className="sidebar-content">
            <h3>AI 助手</h3>
            <p>画布功能正在开发中...</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .canvas-page {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        .canvas-layout {
          display: flex;
          width: 100%;
          height: 100%;
        }

        .canvas-area {
          flex: 1;
          height: 100%;
          background: #f8fafc;
        }

        .sidebar {
          width: 320px;
          height: 100%;
          background: white;
          border-left: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .sidebar-content {
          padding: 20px;
          flex: 1;
        }

        .sidebar h3 {
          margin: 0 0 16px 0;
          color: #374151;
          font-size: 18px;
          font-weight: 600;
        }

        .sidebar p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
