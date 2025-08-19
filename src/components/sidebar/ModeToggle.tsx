'use client';

import React, { useState } from 'react';

type ChatMode = 'inquiry' | 'writing';

interface ModeToggleProps {
  mode?: ChatMode;
  onModeChange?: (mode: ChatMode) => void;
}

const ModeToggle = ({ mode = 'inquiry', onModeChange }: ModeToggleProps) => {
  const [currentMode, setCurrentMode] = useState<ChatMode>(mode);

  const handleModeChange = (newMode: ChatMode) => {
    setCurrentMode(newMode);
    onModeChange?.(newMode);
  };

  return (
    <div className="mode-toggle">
      <div className="mode-buttons">
        <button
          className={`mode-button ${currentMode === 'inquiry' ? 'active' : ''}`}
          onClick={() => handleModeChange('inquiry')}
        >
          <span className="mode-icon">🔍</span>
          询问模式
        </button>
        <button
          className={`mode-button ${currentMode === 'writing' ? 'active' : ''}`}
          onClick={() => handleModeChange('writing')}
        >
          <span className="mode-icon">✍️</span>
          写作模式
        </button>
      </div>

      <style jsx>{`
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

        @media (max-width: 768px) {
          .mode-toggle {
            padding: 16px;
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

export default ModeToggle;