'use client';

import React, { useState } from 'react';
import Canvas from '@/components/canvas/Canvas';
import ChatPanel from '@/components/sidebar/ChatPanel';
import SnapshotManager from '@/components/canvas/SnapshotManager';
import { useCanvasStore } from '@/store/canvas.store';

export default function Home() {
  const { mode, setMode } = useCanvasStore();
  const [showSnapshotManager, setShowSnapshotManager] = useState(false);

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
                询问模式
              </button>
              <button
                className={`mode-button ${mode === 'writing' ? 'active' : ''}`}
                onClick={() => setMode('writing')}
              >
                <span className="mode-icon">✍️</span>
                写作模式
              </button>
            </div>
          </div>

          {/* 快照管理按钮 */}
          <div className="snapshot-toggle">
            <button
              className={`snapshot-button ${showSnapshotManager ? 'active' : ''}`}
              onClick={() => setShowSnapshotManager(!showSnapshotManager)}
            >
              <span className="snapshot-icon">💾</span>
              快照管理
              <span className={`arrow ${showSnapshotManager ? 'up' : 'down'}`}>
                {showSnapshotManager ? '▲' : '▼'}
              </span>
            </button>
          </div>

          {/* 快照管理面板 */}
          {showSnapshotManager && (
            <div className="snapshot-panel">
              <SnapshotManager />
            </div>
          )}

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

        .mode-button:hover:not(.active) {
          background-color: #2a2830;
        }

        .mode-icon {
          font-size: 16px;
        }

        /* 快照管理样式 */
        .snapshot-toggle {
          margin-bottom: 16px;
        }

        .snapshot-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #2a2830;
          border: 1px solid #404040;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .snapshot-button:hover {
          background: #333;
          border-color: #555;
        }

        .snapshot-button.active {
          background: #65f0a3;
          color: #000;
          border-color: #65f0a3;
        }

        .snapshot-icon {
          font-size: 16px;
          margin-right: 8px;
        }

        .arrow {
          font-size: 12px;
          transition: transform 0.2s ease;
        }

        .snapshot-panel {
          margin-bottom: 16px;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
