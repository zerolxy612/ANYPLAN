'use client';

import React, { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useCanvasStore } from '@/store/canvas.store';
import ReportDownloadButtons from '@/components/common/ReportDownloadButtons';

const GenerateReportPanel = () => {
  const { 
    generateReport, 
    isAIGenerating, 
    lastGeneratedReport,
    setMode 
  } = useCanvasStore();
  
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);
  const [refinementInput, setRefinementInput] = useState('');
  const [hasSubmittedRefinement, setHasSubmittedRefinement] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // 当组件挂载时自动开始生成报告
  useEffect(() => {
    if (!hasStartedGeneration && !isAIGenerating && !lastGeneratedReport) {
      setHasStartedGeneration(true);
      generateReport().catch(error => {
        console.error('Failed to generate report:', error);
      });
    }
    if (lastGeneratedReport) {
      setHasSubmittedRefinement(false);
      setRefinementInput('');
      setSelectedMood(null);
    }
  }, [hasStartedGeneration, isAIGenerating, lastGeneratedReport, generateReport]);

  const moodOptions = useMemo(() => ([
    { id: 'angry', label: '😡' },
    { id: 'unsatisfied', label: '😕' },
    { id: 'neutral', label: '😐' },
    { id: 'satisfied', label: '🙂' },
    { id: 'delighted', label: '😄' },
  ]), []);

  const handleRefineLetter = async () => {
    if (!refinementInput.trim() || isAIGenerating) return;
    try {
      setHasSubmittedRefinement(true);
      await generateReport(refinementInput.trim());
    } catch (error) {
      console.error('Failed to refine report:', error);
    }
  };

  return (
    <div className="generate-report-panel">
      {isAIGenerating ? (
        /* Loading状态 */
        <div className="loading-section">
          <div className="loading-content">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <h3 className="loading-title">Generating Your Complaint Letter...</h3>
            <p className="loading-subtitle">
              Analyzing all your information and creating a professional complaint letter.
            </p>
          </div>
        </div>
      ) : lastGeneratedReport ? (
        /* 报告生成完成 */
        <div className="report-section">
          <div className="report-header">
            <h2 className="report-title">Your Complaint Letter</h2>
            <p className="report-subtitle">
              Your professional complaint letter has been generated based on all the information you provided.
            </p>
          </div>
          
          <div className="report-content">
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="markdown-h1">{children}</h1>,
                  h2: ({children}) => <h2 className="markdown-h2">{children}</h2>,
                  h3: ({children}) => <h3 className="markdown-h3">{children}</h3>,
                  p: ({children}) => <p className="markdown-p">{children}</p>,
                  strong: ({children}) => <strong className="markdown-strong">{children}</strong>,
                  ul: ({children}) => <ul className="markdown-ul">{children}</ul>,
                  ol: ({children}) => <ol className="markdown-ol">{children}</ol>,
                  li: ({children}) => <li className="markdown-li">{children}</li>,
                }}
              >
                {lastGeneratedReport.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* 下载按钮 */}
          <div className="download-section">
            <ReportDownloadButtons />
          </div>

          {/* 修改与满意度反馈 */}
          <div className="feedback-section">
            <div className="refine-card">
              <h4>Need adjustments?</h4>
              <p>Describe what should change and we will regenerate the letter with those instructions.</p>
              <textarea
                placeholder="e.g., “Make the tone more urgent and emphasize the refund request.”"
                value={refinementInput}
                onChange={(e) => {
                  setRefinementInput(e.target.value);
                  setHasSubmittedRefinement(false);
                }}
                rows={3}
                disabled={isAIGenerating}
              />
              <button
                className={`refine-button ${isAIGenerating || !refinementInput.trim() ? 'disabled' : ''}`}
                onClick={handleRefineLetter}
                disabled={isAIGenerating || !refinementInput.trim()}
              >
                {isAIGenerating && hasSubmittedRefinement ? 'Regenerating...' : 'Update Letter'}
              </button>
            </div>

            <div className="mood-card">
              <p className="mood-question">How do you feel about this result?</p>
              <div className="mood-options">
                {moodOptions.map(option => (
                  <button
                    key={option.id}
                    className={`mood-button ${selectedMood === option.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMood(option.id)}
                    type="button"
                    disabled={isAIGenerating}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {selectedMood && (
                <p className="mood-selection">
                  Thanks for letting us know — we&rsquo;ll use it to keep improving.
                </p>
              )}
            </div>
          </div>

          {/* 返回按钮 */}
          <div className="action-section">
            <button
              className="back-button"
              onClick={() => setMode('inquiry')}
            >
              ← Back to Ask Sue
            </button>
          </div>
        </div>
      ) : (
        /* 错误状态 */
        <div className="error-section">
          <div className="error-content">
            <h3 className="error-title">Failed to Generate Report</h3>
            <p className="error-subtitle">
              Something went wrong while generating your complaint letter. Please try again.
            </p>
            <button
              className="retry-button"
              onClick={() => {
                setHasStartedGeneration(false);
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .generate-report-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .loading-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .loading-content {
          text-align: center;
          max-width: 400px;
        }

        .loading-title {
          margin: 20px 0 10px 0;
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
        }

        .loading-subtitle {
          margin: 0;
          font-size: 16px;
          color: #a1a1aa;
          line-height: 1.5;
        }

        .report-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
          overflow-y: auto;
        }

        .report-header {
          margin-bottom: 20px;
        }

        .report-title {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
        }

        .report-subtitle {
          margin: 0;
          font-size: 14px;
          color: #a1a1aa;
          line-height: 1.5;
        }

        .report-content {
          flex: 1;
          margin-bottom: 20px;
        }

        .download-section {
          margin-bottom: 20px;
        }

        .feedback-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }

        .refine-card,
        .mood-card {
          background: #111016;
          border: 1px solid #2f2f33;
          border-radius: 16px;
          padding: 16px;
        }

        .refine-card h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }

        .refine-card p {
          margin: 0 0 12px 0;
          color: #a1a1aa;
          font-size: 14px;
        }

        .refine-card textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #2f2f33;
          background: #0b0b10;
          color: #ffffff;
          padding: 12px;
          font-size: 14px;
          resize: none;
          min-height: 80px;
          margin-bottom: 12px;
        }

        .refine-card textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .refine-button {
          width: 100%;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #23c686, #0f9f5c);
          color: #04150d;
          font-weight: 600;
          padding: 12px;
          cursor: pointer;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .refine-button:hover:not(.disabled) {
          transform: translateY(-1px);
        }

        .refine-button.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .mood-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mood-question {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
        }

        .mood-options {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .mood-button {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          border: 1px solid #2f2f33;
          background: #18161c;
          color: #ffffff;
          font-size: 24px;
          cursor: pointer;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .mood-button.selected {
          border-color: #65f0a3;
          transform: translateY(-2px);
        }

        .mood-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mood-selection {
          margin: 0;
          font-size: 13px;
          color: #65f0a3;
        }

        .action-section {
          display: flex;
          justify-content: center;
        }

        .back-button {
          padding: 12px 24px;
          background: #18161a;
          color: #ffffff;
          border: 1px solid #333;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background: #2a2830;
        }

        .error-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .error-content {
          text-align: center;
          max-width: 400px;
        }

        .error-title {
          margin: 0 0 10px 0;
          font-size: 24px;
          font-weight: 600;
          color: #ef4444;
        }

        .error-subtitle {
          margin: 0 0 20px 0;
          font-size: 16px;
          color: #a1a1aa;
          line-height: 1.5;
        }

        .retry-button {
          padding: 12px 24px;
          background: #ef4444;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-button:hover {
          background: #dc2626;
        }

        /* Typing indicator */
        .typing-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #65f0a3;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Markdown样式 */
        .markdown-content {
          color: #ffffff;
          line-height: 1.6;
        }

        .markdown-h1 {
          font-size: 24px;
          font-weight: 600;
          margin: 24px 0 16px 0;
          color: #ffffff;
        }

        .markdown-h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 20px 0 12px 0;
          color: #ffffff;
        }

        .markdown-h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 16px 0 8px 0;
          color: #ffffff;
        }

        .markdown-p {
          margin: 12px 0;
          color: #e5e5e5;
        }

        .markdown-strong {
          font-weight: 600;
          color: #ffffff;
        }

        .markdown-ul, .markdown-ol {
          margin: 12px 0;
          padding-left: 24px;
        }

        .markdown-li {
          margin: 4px 0;
          color: #e5e5e5;
        }
      `}</style>
    </div>
  );
};

export default GenerateReportPanel;
