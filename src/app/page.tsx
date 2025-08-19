'use client';

import React from 'react';
import Canvas from '@/components/canvas/Canvas';
import ChatPanel from '@/components/sidebar/ChatPanel';

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
          <ChatPanel />
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
          background: #161618;
        }

        .sidebar {
          width: 33.333%;
          height: 100%;
          background: #2a292c;
          border-left: 1px solid #404040;
          display: flex;
          flex-direction: column;
        }


      `}</style>
    </div>
  );
}
