'use client';

import React from 'react';
import { useCanvasStore } from '@/store/canvas.store';

interface ReportDownloadButtonsProps {
  className?: string;
}

const ReportDownloadButtons: React.FC<ReportDownloadButtonsProps> = ({ className = '' }) => {
  const { lastGeneratedReport, downloadMarkdownReport, downloadSnapshotFile } = useCanvasStore();

  // 如果没有生成的报告，不显示按钮
  if (!lastGeneratedReport) {
    return null;
  }

  return (
    <div className={`download-buttons ${className}`}>
      <div className="download-buttons-container">
        <h4 className="download-title">下载文件</h4>
        <div className="buttons-row">
          <button
            className="download-btn markdown-btn"
            onClick={downloadMarkdownReport}
            title="下载 Markdown 格式的分析报告"
          >
            <span className="btn-icon">📄</span>
            <span className="btn-text">下载 Markdown 文件</span>
          </button>
          
          <button
            className="download-btn snapshot-btn"
            onClick={downloadSnapshotFile}
            title="下载思维导图快照文件"
          >
            <span className="btn-icon">💾</span>
            <span className="btn-text">下载 JSON 文件</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .download-buttons {
          margin-top: 20px;
          padding: 16px;
          background-color: #1a1a1c;
          border-radius: 12px;
          border: 1px solid #2a2a2a;
        }

        .download-buttons-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .download-title {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          text-align: center;
        }

        .buttons-row {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 140px;
          justify-content: center;
        }

        .markdown-btn {
          background-color: #2563eb;
          color: #ffffff;
        }

        .markdown-btn:hover {
          background-color: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .snapshot-btn {
          background-color: #10b981;
          color: #ffffff;
        }

        .snapshot-btn:hover {
          background-color: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .download-btn:active {
          transform: translateY(0);
        }

        .btn-icon {
          font-size: 16px;
          line-height: 1;
        }

        .btn-text {
          line-height: 1;
        }

        /* 响应式设计 */
        @media (max-width: 480px) {
          .buttons-row {
            flex-direction: column;
          }
          
          .download-btn {
            min-width: 100%;
          }
        }

        /* 深色主题适配 */
        @media (prefers-color-scheme: dark) {
          .download-buttons {
            background-color: #1a1a1c;
            border-color: #2a2a2a;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportDownloadButtons;
