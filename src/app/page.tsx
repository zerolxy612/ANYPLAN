'use client';

import React from 'react';
import Canvas from '@/components/canvas/Canvas';
import ChatPanel from '@/components/sidebar/ChatPanel';
import { useCanvasStore } from '@/store/canvas.store';

export default function Home() {
  const { mode, setMode, checkL3NodesComplete } = useCanvasStore();

  return (
    <div className="canvas-page">
      <div className="canvas-layout">
        {/* 左侧画布区域 */}
        <div className="canvas-area">
          <Canvas />
        </div>

        {/* 右侧侧边栏 */}
        <div className="sidebar">
          {/* 模式切换按钮 */}
          <div className="mode-toggle">
            <div className="mode-buttons">
              <button
                className={`mode-button ${mode === 'inquiry' ? 'active' : ''}`}
                onClick={() => setMode('inquiry')}
              >
                <span className="mode-icon">🔍</span>
                Ask Sue
              </button>
              <button
                className={`mode-button ${mode === 'writing' ? 'active' : ''} ${!checkL3NodesComplete() ? 'disabled' : ''}`}
                onClick={() => checkL3NodesComplete() && setMode('writing')}
                disabled={!checkL3NodesComplete()}
              >
                <span className="mode-icon">✍️</span>
                Generate
              </button>
            </div>
          </div>



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
          position: relative;
          z-index: 10; /* 确保sidebar在画布按钮之上 */
        }

        .mode-toggle {
          padding: 20px;
          background-color: #161618;
        }

        .mode-buttons {
          display: flex;
          gap: 8px;
        }

        .mode-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #ffffff;
        }

        .mode-button:not(.active) {
          background-color: #18161a;
        }

        .mode-button.active {
          background-color: #65f0a3;
          color: #000000;
        }

        .mode-button:hover:not(.active):not(.disabled) {
          background-color: #2a2830;
        }

        .mode-button.disabled {
          background-color: #18161a;
          color: #666666;
          cursor: not-allowed;
          opacity: 0.5;
        }

        .mode-button.disabled:hover {
          background-color: #18161a;
        }

        .mode-icon {
          font-size: 16px;
        }


      `}</style>
    </div>
  );
}
