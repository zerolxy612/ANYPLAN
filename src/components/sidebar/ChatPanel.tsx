'use client';

import React, { useState, useEffect } from 'react';

type ChatMode = 'inquiry' | 'writing';

const ChatPanel = () => {
  const [mode, setMode] = useState<ChatMode>('inquiry');
  const [greeting, setGreeting] = useState('');

  // 根据时间动态设置问候语
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 6) {
        setGreeting('凌晨好');
      } else if (hour < 12) {
        setGreeting('上午好');
      } else if (hour < 18) {
        setGreeting('下午好');
      } else {
        setGreeting('晚上好');
      }
    };

    // 立即设置初始问候语
    updateGreeting();
    // 每分钟更新一次问候语
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  // 如果greeting为空，设置默认值
  const displayGreeting = greeting || '下午好';

  return (
    <div className="chat-panel">
      {/* 模式切换按钮 */}
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

      {/* 问候文本 */}
      <div className="greeting-section">
        <h2 className="greeting-title">{displayGreeting}，</h2>
        <p className="greeting-subtitle">有什么我可以帮你的吗？</p>
      </div>

      {/* 输入区域 */}
      <div className="input-section">
        <div className="input-container">
          <textarea
            className="chat-input"
            placeholder="请输入您的问题或上传文件"
            rows={3}
          />
          <div className="input-footer">
            <div className="model-info">
              <span className="model-name">HKGAI V1</span>
            </div>
            <div className="input-actions">
              <button className="action-button" title="附件">
                📎
              </button>
              <button className="action-button" title="语音">
                🎤
              </button>
              <button className="action-button send-button" title="发送">
                ↑
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .chat-panel {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
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

        .greeting-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          gap: 8px;
        }

        .greeting-title {
          font-size: 32px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        .greeting-subtitle {
          font-size: 18px;
          color: #a1a1aa;
          margin: 0;
          line-height: 1.4;
        }

        .input-section {
          margin-top: auto;
        }

        .input-container {
          background-color: #18161a;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #404040;
        }

        .chat-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 14px;
          line-height: 1.5;
          resize: none;
          font-family: inherit;
        }

        .chat-input::placeholder {
          color: #6b7280;
        }

        .input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #404040;
        }

        .model-info {
          display: flex;
          align-items: center;
        }

        .model-name {
          background-color: #2a2830;
          color: #a1a1aa;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
        }

        .input-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .action-button {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background-color: transparent;
          color: #a1a1aa;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.2s ease;
        }

        .action-button:hover {
          background-color: #2a2830;
          color: #ffffff;
        }

        .send-button {
          background-color: #65f0a3;
          color: #000000;
          font-weight: bold;
        }

        .send-button:hover {
          background-color: #52d18a;
        }

        @media (max-width: 768px) {
          .chat-panel {
            padding: 16px;
            gap: 20px;
          }

          .greeting-title {
            font-size: 28px;
          }

          .greeting-subtitle {
            font-size: 16px;
          }

          .mode-button {
            padding: 6px 12px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPanel;
