'use client';

import React, { useRef, useState } from 'react';
import { useCanvasStore } from '@/store/canvas.store';
import { parseSnapshotFile, validateSnapshotFile, formatFileSize } from '@/lib/utils/file';

interface SnapshotManagerProps {
  className?: string;
}

const SnapshotManager: React.FC<SnapshotManagerProps> = ({ className = '' }) => {
  const { exportSnapshot, importSnapshot, nodes, levels } = useCanvasStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 清除消息
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // 导出快照
  const handleExport = async () => {
    if (nodes.length === 0) {
      setError('画布为空，无法导出快照');
      return;
    }

    setIsExporting(true);
    clearMessages();

    try {
      const title = `思维导图-${levels.length}层级-${nodes.length}节点`;
      exportSnapshot(title, '从ANYPLAN导出的思维导图快照');
      setSuccess('快照导出成功！');
    } catch (error) {
      setError('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsExporting(false);
    }
  };

  // 处理文件导入
  const handleFileImport = async (file: File) => {
    setIsImporting(true);
    clearMessages();

    try {
      // 验证文件
      if (!validateSnapshotFile(file)) {
        throw new Error('无效的文件格式。请选择 .json 快照文件');
      }

      // 解析快照
      const snapshot = await parseSnapshotFile(file);
      
      // 导入快照
      importSnapshot(snapshot);
      
      setSuccess(`快照导入成功！已还原 ${snapshot.nodes.length} 个节点，${snapshot.levels.length} 个层级`);
    } catch (error) {
      setError('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImporting(false);
    }
  };

  // 文件选择处理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
    // 清空input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileImport(files[0]);
    }
  };

  return (
    <div className={`snapshot-manager ${className}`}>
      {/* 导出部分 */}
      <div className="export-section">
        <h3>导出快照</h3>
        <p className="description">
          将当前画布状态保存为快照文件，包含所有节点、层级和选择路径
        </p>
        <button
          onClick={handleExport}
          disabled={isExporting || nodes.length === 0}
          className="export-btn"
        >
          {isExporting ? (
            <>
              <span className="loading-spinner"></span>
              导出中...
            </>
          ) : (
            <>
              📥 导出快照
            </>
          )}
        </button>
        {nodes.length === 0 && (
          <p className="warning">画布为空，请先创建一些节点</p>
        )}
      </div>

      {/* 导入部分 */}
      <div className="import-section">
        <h3>导入快照</h3>
        <p className="description">
          从快照文件还原画布状态，将替换当前所有内容
        </p>
        
        {/* 拖拽上传区域 */}
        <div
          className={`drop-zone ${dragOver ? 'drag-over' : ''} ${isImporting ? 'importing' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isImporting ? (
            <div className="importing-state">
              <span className="loading-spinner"></span>
              <p>导入中...</p>
            </div>
          ) : (
            <div className="drop-content">
              <div className="drop-icon">📤</div>
              <p className="drop-text">
                {dragOver ? '释放文件以导入' : '拖拽快照文件到此处或点击选择'}
              </p>
              <p className="drop-hint">支持 .json 格式的快照文件</p>
            </div>
          )}
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* 消息显示 */}
      {error && (
        <div className="message error">
          <span className="message-icon">❌</span>
          <span className="message-text">{error}</span>
          <button className="message-close" onClick={clearMessages}>×</button>
        </div>
      )}

      {success && (
        <div className="message success">
          <span className="message-icon">✅</span>
          <span className="message-text">{success}</span>
          <button className="message-close" onClick={clearMessages}>×</button>
        </div>
      )}

      <style jsx>{`
        .snapshot-manager {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 20px;
          background: #1a1a1a;
          border-radius: 12px;
          border: 1px solid #333;
        }

        .export-section,
        .import-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        h3 {
          margin: 0;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        .description {
          margin: 0;
          color: #999;
          font-size: 14px;
          line-height: 1.4;
        }

        .export-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: #65f0a3;
          color: #000;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 44px;
        }

        .export-btn:hover:not(:disabled) {
          background: #4ade80;
          transform: translateY(-1px);
        }

        .export-btn:disabled {
          background: #333;
          color: #666;
          cursor: not-allowed;
          transform: none;
        }

        .drop-zone {
          border: 2px dashed #444;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #222;
        }

        .drop-zone:hover {
          border-color: #65f0a3;
          background: #252525;
        }

        .drop-zone.drag-over {
          border-color: #65f0a3;
          background: rgba(101, 240, 163, 0.1);
        }

        .drop-zone.importing {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .drop-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .drop-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .drop-text {
          margin: 0;
          color: #fff;
          font-size: 16px;
          font-weight: 500;
        }

        .drop-hint {
          margin: 0;
          color: #999;
          font-size: 12px;
        }

        .importing-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .importing-state p {
          margin: 0;
          color: #65f0a3;
          font-size: 16px;
        }

        .warning {
          margin: 0;
          color: #f59e0b;
          font-size: 12px;
          font-style: italic;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
        }

        .message.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .message.success {
          background: rgba(101, 240, 163, 0.1);
          border: 1px solid rgba(101, 240, 163, 0.3);
          color: #65f0a3;
        }

        .message-text {
          flex: 1;
        }

        .message-close {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SnapshotManager;
