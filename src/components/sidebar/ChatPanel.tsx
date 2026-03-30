'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useCanvasStore } from '@/store/canvas.store';
import { parseSnapshotFile, validateSnapshotFile } from '@/lib/utils/file';
import GenerateReportPanel from './GenerateReportPanel';
import { LETTER_TONE_OPTIONS, LetterToneKey } from '@/constants/letterTones';

type EmotionOption = {
  id: string;
  label: string;
  emoji?: string;
  isCustom?: boolean;
};

const DEFAULT_EMOTION_OPTIONS: EmotionOption[] = [
  { id: 'angry', label: 'Angry', emoji: '😡' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😤' },
  { id: 'disappointed', label: 'Disappointed', emoji: '😔' },
  { id: 'anxiety', label: 'Anxiety', emoji: '😐' },
  { id: 'worried', label: 'Worried', emoji: '😥' },
  { id: 'surprised', label: 'Surprised', emoji: '😳' },
];

const EMOTION_COLOR_MAP: Record<string, {
  baseBg: string;
  baseBorder: string;
  baseText: string;
  activeBg: string;
  activeText: string;
}> = {
  angry: {
    baseBg: 'rgba(240,75,76,0.15)',
    baseBorder: 'rgba(240,75,76,0.4)',
    baseText: '#f04b4c',
    activeBg: '#f04b4c',
    activeText: '#130101'
  },
  frustrated: {
    baseBg: 'rgba(255,140,66,0.15)',
    baseBorder: 'rgba(255,140,66,0.4)',
    baseText: '#ff8c42',
    activeBg: '#ff8c42',
    activeText: '#160701'
  },
  disappointed: {
    baseBg: 'rgba(155,81,224,0.15)',
    baseBorder: 'rgba(155,81,224,0.4)',
    baseText: '#9b51e0',
    activeBg: '#9b51e0',
    activeText: '#18021f'
  },
  anxiety: {
    baseBg: 'rgba(242,201,76,0.15)',
    baseBorder: 'rgba(242,201,76,0.4)',
    baseText: '#f2c94c',
    activeBg: '#f2c94c',
    activeText: '#1b1102'
  },
  worried: {
    baseBg: 'rgba(45,156,219,0.15)',
    baseBorder: 'rgba(45,156,219,0.4)',
    baseText: '#2d9cdb',
    activeBg: '#2d9cdb',
    activeText: '#02121e'
  },
  surprised: {
    baseBg: 'rgba(86,204,242,0.15)',
    baseBorder: 'rgba(86,204,242,0.4)',
    baseText: '#56ccf2',
    activeBg: '#56ccf2',
    activeText: '#01131b'
  },
};

const getEmotionColors = (label: string) => {
  const key = label.toLowerCase();
  return EMOTION_COLOR_MAP[key] || {
    baseBg: 'rgba(101, 240, 163, 0.15)',
    baseBorder: 'rgba(101, 240, 163, 0.3)',
    baseText: '#65f0a3',
    activeBg: '#65f0a3',
    activeText: '#111'
  };
};

const ChatPanel = () => {
  const [greeting, setGreeting] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [downloadSnapshot, setDownloadSnapshot] = useState(true);
  const [isImportingSnapshot, setIsImportingSnapshot] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [customEmotions, setCustomEmotions] = useState<EmotionOption[]>([]);
  const [isAddingCustomEmotion, setIsAddingCustomEmotion] = useState(false);
  const [customEmotionInput, setCustomEmotionInput] = useState('');
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toneDropdownRef = useRef<HTMLDivElement>(null);

  const {
    analyzeUserInput,
    isAIGenerating,
    levels,
    mode,
    getSelectedChainContent,
    generateReport,
    generateReportWithSnapshot,
    importSnapshot,
    chatMessages,
    addChatMessage,
    clearChatMessages,
    isChatbotGenerating,
    checkL3NodesComplete,
    letterTone,
    setLetterTone,
    customTonePrompt,
    setCustomTonePrompt,
    generateFinalComplaintLetter,
    hasFinalAnalyzed,
    setMode,
    setEmotionTags
  } = useCanvasStore();

  // Dynamically set greeting based on time
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 6) {
        setGreeting('Good early morning');
      } else if (hour < 12) {
        setGreeting('Good morning');
      } else if (hour < 18) {
        setGreeting('Good afternoon');
      } else {
        setGreeting('Good evening');
      }
    };

    // Set initial greeting immediately
    updateGreeting();
    // Update greeting every minute
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setEmotionTags(selectedEmotions);
  }, [selectedEmotions, setEmotionTags]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isToneDropdownOpen &&
        toneDropdownRef.current &&
        !toneDropdownRef.current.contains(event.target as Node)
      ) {
        setIsToneDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isToneDropdownOpen]);

  // If greeting is empty, set default value
  const displayGreeting = greeting || 'Good afternoon';

  // 处理用户输入
  const handleSendMessage = async () => {
    if (isAIGenerating || isChatbotGenerating) {
      return;
    }

    // 检查是否在写作模式且有选中的链路
    const chainContent = getSelectedChainContent();
    const isWritingModeWithChain = mode === 'writing' && chainContent.length > 0;

    // 在写作模式下，即使没有输入内容也可以生成报告
    if (!inputValue.trim() && !isWritingModeWithChain) {
      return;
    }

    const currentInput = inputValue.trim();

    // 如果有用户输入，添加用户消息
    if (currentInput) {
      addChatMessage({
        type: 'user',
        content: currentInput
      });
    }

    setInputValue('');

    try {
      let aiResponse: string;

      if (isWritingModeWithChain) {
        // 写作模式下生成报告 - 设置chatbot loading状态
        useCanvasStore.setState({ isChatbotGenerating: true });
        console.log('🔍 Generating report for chain:', chainContent);
        if (downloadSnapshot) {
          aiResponse = await generateReportWithSnapshot(currentInput || undefined);
        } else {
          aiResponse = await generateReport(currentInput || undefined);
        }
      } else {
        // Normal mode: analyze user input - 这里isAIGenerating已经在analyzeUserInput中设置了
        aiResponse = await analyzeUserInput(currentInput);
        aiResponse = typeof aiResponse === 'string' ? aiResponse : 'Analysis completed, please check the results on the canvas.';
      }

      addChatMessage({
        type: 'ai',
        content: aiResponse,
        isMarkdown: isWritingModeWithChain // Report-type messages use Markdown rendering
      });
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      addChatMessage({
        type: 'ai',
        content: 'Sorry, an error occurred while processing your request. Please try again.'
      });
    } finally {
      // 确保清除chatbot loading状态
      if (isWritingModeWithChain) {
        useCanvasStore.setState({ isChatbotGenerating: false });
      }
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 中文输入法候选确认阶段不拦截Enter
    if (isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 处理附件按钮点击（快照导入）
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImportingSnapshot(true);
    setImportError(null);

    try {
      // Validate file
      if (!validateSnapshotFile(file)) {
        throw new Error('Invalid file format. Please select a .json snapshot file');
      }

      // Parse snapshot
      const snapshot = await parseSnapshotFile(file);

      // Import snapshot
      importSnapshot(snapshot);

      // Show success message
      addChatMessage({
        type: 'ai',
        content: `✅ Snapshot imported successfully! Restored ${snapshot.nodes.length} nodes, ${snapshot.levels.length} levels`,
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Import failed: Unknown error';
      setImportError(errorMsg);

      // Show error message
      addChatMessage({
        type: 'ai',
        content: `❌ ${errorMsg}`,
      });
    } finally {
      setIsImportingSnapshot(false);
      // 清空input值，允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const emotionOptions = useMemo(
    () => [...DEFAULT_EMOTION_OPTIONS, ...customEmotions],
    [customEmotions]
  );

  const selectedToneOption = useMemo(
    () => LETTER_TONE_OPTIONS.find((option) => option.key === letterTone),
    [letterTone]
  );

  const toggleEmotion = (label: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleCustomEmotionSubmit = () => {
    const trimmed = customEmotionInput.trim();
    if (!trimmed) {
      return;
    }

    const normalizedLabel = trimmed.replace(/^#+/, '');
    const alreadyExists =
      emotionOptions.some((emotion) => emotion.label.toLowerCase() === normalizedLabel.toLowerCase());

    if (!alreadyExists) {
      const newEmotion: EmotionOption = {
        id: `custom-${Date.now()}`,
        label: normalizedLabel,
        isCustom: true,
      };
      setCustomEmotions((prev) => [...prev, newEmotion]);
    }

    setSelectedEmotions((prev) =>
      prev.includes(normalizedLabel) ? prev : [...prev, normalizedLabel]
    );
    setCustomEmotionInput('');
    setIsAddingCustomEmotion(false);
  };

  const handleCustomEmotionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomEmotionSubmit();
    }
    if (e.key === 'Escape') {
      setIsAddingCustomEmotion(false);
      setCustomEmotionInput('');
    }
  };

  const handleFinalAnalyzeClick = async () => {
    if (isChatbotGenerating) return;
    try {
      setMode('writing');
      useCanvasStore.setState({ mode: 'writing' });
      await generateFinalComplaintLetter();
    } catch (error) {
      console.error('Final analyze failed:', error);
      setMode('inquiry');
      useCanvasStore.setState({ mode: 'inquiry' });
    } finally {
      setIsToneDropdownOpen(false);
    }
  };

  return (
    <div className={`chat-panel ${chatMessages.length > 0 ? 'has-messages' : ''}`}>
      {mode === 'writing' ? (
        /* Generate模式：显示报告生成界面 */
        <GenerateReportPanel />
      ) : (
        /* Ask Sue模式：显示聊天界面 */
        <>
          {/* 消息历史 */}
          {(chatMessages.length > 0 || isChatbotGenerating) && (
            <div className="messages-section">
              {chatMessages.map((message, index) => {
                // 如果是最后一个AI消息且正在生成中，显示loading状态
                const isLastAIMessage = message.type === 'ai' &&
                  index === chatMessages.length - 1 &&
                  isChatbotGenerating;

                return (
                  <div key={message.id} className={`message ${message.type}`}>
                    <div className={`message-content ${message.isMarkdown ? 'markdown-content' : ''}`}>
                      {isLastAIMessage ? (
                        // 显示loading状态替换最后一个AI消息
                        <>
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          <span className="loading-text" style={{ marginLeft: '10px', fontSize: '14px', color: '#888' }}>
                            Updating your complaint letter...
                          </span>
                        </>
                      ) : message.isMarkdown ? (
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
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                );
              })}
              {/* 在有消息且正在生成时显示loading */}
              {(isAIGenerating || isChatbotGenerating) && (
                <div className="message ai">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="loading-text" style={{ marginLeft: '10px', fontSize: '14px', color: '#888' }}>
                      {isChatbotGenerating ? 'Generating your complaint letter...' : 'Analyzing your input...'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 问候文本 */}
          <div className={`greeting-section ${chatMessages.length > 0 ? 'compact' : ''}`}>
            {chatMessages.length === 0 && (
              <div className="text-block">
                <h2 className="greeting-title">{displayGreeting},</h2>
                <p className="greeting-subtitle">How can I help you?</p>
              </div>
            )}

            {/* L3完成后的分析按钮 */}
            {checkL3NodesComplete() && (
              <div className="tone-selection-card">
                <div className="tone-header">
                  <div>
                    <p className="tone-eyebrow">Great work collecting the facts</p>
                    <h3 className="tone-title">Select the tone for your letter</h3>
                  </div>
                  {selectedToneOption?.recommended && (
                    <span className="tone-badge">Recommended</span>
                  )}
                </div>
                <label className="tone-label">
                  Tone options
                </label>
                <div className="tone-select-wrapper" ref={toneDropdownRef}>
                  <button
                    type="button"
                    className={`tone-select-display ${isToneDropdownOpen ? 'open' : ''}`}
                    onClick={() => setIsToneDropdownOpen((prev) => !prev)}
                  >
                    <span>{selectedToneOption?.label || 'Select tone'}</span>
                    <span className="tone-select-caret">⌄</span>
                  </button>
                  {isToneDropdownOpen && (
                    <div className="tone-dropdown">
                      {LETTER_TONE_OPTIONS.map((option) => (
                        <button
                          type="button"
                          key={option.key}
                          className={`tone-option ${letterTone === option.key ? 'active' : ''}`}
                          onClick={() => {
                            setLetterTone(option.key as LetterToneKey);
                            setIsToneDropdownOpen(false);
                          }}
                        >
                          <span className="tone-option-label">{option.label}</span>
                          <span className="tone-option-desc">{option.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="tone-description-text">
                    {selectedToneOption?.description || 'Use your own custom tone instructions'}
                  </span>
                </div>
                {letterTone === 'custom' && (
                  <div className="custom-tone-group">
                    <textarea
                      className="custom-tone-input"
                      placeholder="Describe the tone you want (e.g., “Firm but appreciative, showing urgency without sounding aggressive.”)"
                      value={customTonePrompt}
                      onChange={(e) => setCustomTonePrompt(e.target.value)}
                      rows={3}
                    />
                    <p className="custom-tone-hint">
                      These instructions are sent directly to the AI to shape the letter’s voice.
                    </p>
                  </div>
                )}
                <p className="tone-hint">
                  The selected tone will be applied when you switch to Writing mode and click “Generate”.
                </p>
                <button
                  type="button"
                  className={`tone-analyze-button ${isChatbotGenerating ? 'disabled' : ''}`}
                  onClick={handleFinalAnalyzeClick}
                  disabled={isChatbotGenerating}
                >
                  {isChatbotGenerating ? '⏳ Analyzing...' : hasFinalAnalyzed ? '🔍 Analyze Again' : '🔍 Final Analyze'}
                </button>
                {hasFinalAnalyzed && (
                  <p className="tone-hint">
                    Final analysis ready! Head to Writing mode any time to generate the refined letter.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 输入区域 */}
        <div className="input-section">
          <div className="input-container">
            <textarea
              className="chat-input"
              placeholder="Please enter your question or upload a file"
              rows={3}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              disabled={isAIGenerating}
            />
            <div className="input-footer">
              <div className="footer-left">
                <div className="model-info">
                  <span className="model-name">Gemini 3.0 Flash Preview</span>
                </div>

              </div>
              <div className="input-actions">
                <div className="tooltip-container">
                  <button
                    className="action-button"
                    onClick={handleAttachmentClick}
                    disabled={isImportingSnapshot}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    {isImportingSnapshot ? '⏳' : '📎'}
                  </button>
                  {showTooltip && !isImportingSnapshot && (
                    <div className="custom-tooltip">
                      Upload snapshot file (.json)
                    </div>
                  )}
                </div>
                <button className="action-button" title="Voice">
                  🎤
                </button>
                <button
                  className={`action-button send-button ${isAIGenerating ? 'disabled' : ''}`}
                  title="Send"
                  onClick={handleSendMessage}
                  disabled={isAIGenerating || !inputValue.trim()}
                >
                  {isAIGenerating ? '⏳' : '↑'}
                </button>
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
          </div>
        </div>
        {chatMessages.length === 0 && (
          <div className="emotion-section">
            <div className="emotion-header">
              <p className="emotion-question">How did you feel?</p>
              <p className="emotion-instruction">Select your emotion labels</p>
            </div>
            <div className="emotion-card">
              <div className="selected-emotions">
                {selectedEmotions.length > 0 ? (
                  selectedEmotions.map((emotion) => {
                    const colors = getEmotionColors(emotion);
                    return (
                      <span
                        key={emotion}
                        className="selected-emotion-chip"
                        style={{
                          background: colors.baseBg,
                          borderColor: colors.baseBorder,
                          color: colors.baseText
                        }}
                      >
                        #{emotion}
                        <button
                          type="button"
                          className="emotion-remove"
                          onClick={() =>
                            setSelectedEmotions((prev) =>
                              prev.filter((item) => item !== emotion)
                            )
                          }
                          aria-label={`Remove ${emotion}`}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })
                ) : (
                  <span className="selected-placeholder">No emotion selected yet</span>
                )}
              </div>
              <div className="emotion-options">
                {emotionOptions.map((emotion) => {
                  const isSelected = selectedEmotions.includes(emotion.label);
                  const colors = getEmotionColors(emotion.label);
                  return (
                    <button
                      type="button"
                      key={emotion.id}
                      className={`emotion-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleEmotion(emotion.label)}
                      style={{
                        background: isSelected ? colors.activeBg : colors.baseBg,
                        color: isSelected ? colors.activeText : colors.baseText,
                        borderColor: colors.baseBorder
                      }}
                    >
                      {emotion.emoji && <span className="emotion-emoji">{emotion.emoji}</span>}
                      {emotion.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className={`emotion-chip add-chip ${isAddingCustomEmotion ? 'selected' : ''}`}
                  onClick={() => {
                    setIsAddingCustomEmotion((prev) => !prev);
                    setCustomEmotionInput('');
                  }}
                >
                  <span className="emotion-emoji">➕</span>
                  Add your own...
                </button>
              </div>
              {isAddingCustomEmotion && (
                <div className="custom-emotion-row">
                  <input
                    className="custom-emotion-input"
                    type="text"
                    placeholder="Type an emotion and press Enter"
                    value={customEmotionInput}
                    onChange={(e) => setCustomEmotionInput(e.target.value)}
                    onKeyDown={handleCustomEmotionKeyDown}
                  />
                  <button
                    type="button"
                    className="save-custom-emotion"
                    onClick={handleCustomEmotionSubmit}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        </>
      )}

      <style jsx>{`
        .chat-panel {
          height: 100%;
          padding: 16px; /* 减少padding以增加可用空间 */
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0; /* 允许flex子元素收缩 */
        }

        /* 当没有消息时，整个内容区域居中 */
        .chat-panel:not(.has-messages) {
          justify-content: center;
          align-items: center;
        }

        /* 当有消息时，正常的flex布局 */
        .chat-panel.has-messages {
          justify-content: flex-start;
          align-items: stretch;
        }

        .messages-section {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px 0;
          margin-bottom: 8px; /* 减少与greeting-section的间距 */
          min-height: 0; /* 关键：允许收缩 */
          max-height: calc(100vh - 120px); /* 最大化利用空间，只为输入区域预留必要空间 */
        }

        /* 自定义滚动条样式 */
        .messages-section::-webkit-scrollbar {
          width: 8px;
        }

        .messages-section::-webkit-scrollbar-track {
          background: #2a2830;
          border-radius: 4px;
        }

        .messages-section::-webkit-scrollbar-thumb {
          background: #65f0a3;
          border-radius: 4px;
          opacity: 0.8;
        }

        .messages-section::-webkit-scrollbar-thumb:hover {
          background: #52d18a;
        }

        /* Firefox滚动条样式 */
        .messages-section {
          scrollbar-width: thin;
          scrollbar-color: #65f0a3 #2a2830;
        }

        .message {
          display: flex;
          flex-direction: column;
        }

        .message.user {
          align-items: flex-end;
        }

        .message.ai {
          align-items: flex-start;
        }

        .message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word; /* 防止长单词撑破布局 */
          overflow-wrap: break-word;
        }

        .message.user .message-content {
          background-color: #65f0a3;
          color: #000000;
        }

        .message.ai .message-content {
          background-color: #2a2830;
          color: #ffffff;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
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
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .greeting-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          gap: 32px;
          flex-shrink: 0; /* 防止被挤压 */
        }

        .greeting-section.compact {
          gap: 16px;
          justify-content: flex-end;
          align-items: flex-start;
          flex-shrink: 0;
          flex: 0; /* 在有消息时不占据额外空间，让messages-section充分利用空间 */
        }

        .text-block {
          width: 100%;
          text-align: left;
        }

        .greeting-section:not(.compact) {
          /* 在没有消息时，不占据额外空间，让整体居中 */
          flex: none;
        }

        .levels-info {
          text-align: center;
        }

        .levels-text {
          color: #65f0a3;
          font-size: 14px;
          margin: 0;
        }

        .chain-status {
          color: #65f0a3;
          font-size: 12px;
          margin: 4px 0 0 0;
          font-weight: 500;
        }

        /* Markdown 样式 */
        .markdown-content {
          line-height: 1.6;
          max-width: 100%;
          overflow-x: auto; /* 处理水平溢出 */
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .markdown-h1 {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 16px 0 12px 0;
          border-bottom: 2px solid #65f0a3;
          padding-bottom: 4px;
        }

        .markdown-h2 {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin: 14px 0 10px 0;
          border-bottom: 1px solid #444;
          padding-bottom: 2px;
        }

        .markdown-h3 {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          margin: 12px 0 8px 0;
        }

        .markdown-p {
          margin: 8px 0;
          color: #ffffff;
          line-height: 1.6;
        }

        .markdown-strong {
          color: #65f0a3;
          font-weight: 600;
        }

        .markdown-ul, .markdown-ol {
          margin: 8px 0;
          padding-left: 20px;
        }

        .markdown-li {
          margin: 4px 0;
          color: #ffffff;
          line-height: 1.5;
        }

        .text-block {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
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
          width: 100%;
          flex-shrink: 0; /* 防止输入区域被挤压 */
        }

        /* 当没有消息时，输入区域紧跟在greeting后面 */
        .chat-panel:not(.has-messages) .input-section {
          margin-top: 32px; /* 与greeting保持适当间距 */
          width: 100%;
          max-width: 600px; /* 限制最大宽度，保持美观 */
        }

        /* 当有消息时，输入区域推到底部 */
        .chat-panel.has-messages .input-section {
          margin-top: auto;
          width: 100%;
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
          align-items: flex-end;
          padding-top: 12px;
        }

        .footer-left {
          display: flex;
          flex-direction: column;
          gap: 8px;
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

        .snapshot-option {
          display: flex;
          align-items: center;
        }

        .snapshot-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: 12px;
          color: #a1a1aa;
          user-select: none;
        }

        .snapshot-checkbox input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 14px;
          height: 14px;
          border: 1px solid #404040;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .snapshot-checkbox input[type="checkbox"]:checked + .checkmark {
          background: #65f0a3;
          border-color: #65f0a3;
        }

        .snapshot-checkbox input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          color: #000;
          font-size: 10px;
          font-weight: bold;
        }

        .checkbox-label {
          font-size: 11px;
        }

        .input-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .tooltip-container {
          position: relative;
          display: inline-block;
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

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-button:disabled:hover {
          background-color: transparent;
          color: #a1a1aa;
        }

        .custom-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          padding: 8px 12px;
          background-color: #1a1a1c;
          color: #ffffff;
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 1px solid #404040;
          z-index: 1000;
          animation: tooltipFadeIn 0.2s ease-out;
        }

        .custom-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: #1a1a1c;
        }

        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .send-button {
          background-color: #65f0a3;
          color: #000000;
          font-weight: bold;
        }

        .send-button:hover:not(.disabled) {
          background-color: #52d18a;
        }

        .send-button.disabled {
          background-color: #404040;
          color: #6b7280;
          cursor: not-allowed;
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
        }

        .tone-selection-card {
          margin-bottom: 20px;
          padding: 20px;
          border-radius: 16px;
          background: linear-gradient(135deg, #0f3b2f 0%, #147a5a 60%, #23c686 100%);
          border: 1px solid rgba(101, 240, 163, 0.4);
          display: flex;
          flex-direction: column;
          gap: 12px;
          color: #f0fff7;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
        }

        .tone-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .tone-eyebrow {
          margin: 0;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.85;
        }

        .tone-title {
          margin: 4px 0 0 0;
          font-size: 20px;
          color: #ffffff;
        }

        .tone-badge {
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(240, 255, 247, 0.4);
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .tone-label {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tone-select-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }

        .tone-select-display {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          background: rgba(0, 0, 0, 0.25);
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .tone-select-display.open {
          border-color: #ffffff;
          background: rgba(0, 0, 0, 0.4);
        }

        .tone-select-caret {
          font-size: 16px;
          opacity: 0.8;
        }

        .tone-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 100%;
          background: #0ab174;
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 16px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 20;
        }

        .tone-option {
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 10px 12px;
          text-align: left;
          background: transparent;
          color: #f1f5f9;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .tone-option:hover {
          background: rgba(3, 106, 76, 0.25);
          transform: translateX(2px);
        }

        .tone-option.active {
          background: #036a4c;
        }

        .tone-option-label {
          display: block;
          font-weight: 600;
          font-size: 14px;
        }

        .tone-option-desc {
          display: block;
          font-size: 12px;
          color: rgba(241, 245, 249, 0.8);
          margin-top: 2px;
        }

        .tone-description-text {
          font-size: 13px;
          color: rgba(240, 255, 247, 0.95);
        }

        .custom-tone-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .custom-tone-input {
          width: 100%;
          border-radius: 12px;
          border: 1px dashed rgba(255, 255, 255, 0.5);
          background: rgba(0, 0, 0, 0.25);
          color: #ffffff;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          resize: none;
          min-height: 70px;
        }

        .custom-tone-input:focus {
          border-color: #ffffff;
        }

        .custom-tone-hint {
          margin: 0;
          font-size: 12px;
          color: rgba(240, 255, 247, 0.8);
        }

        .tone-hint {
          margin: 0;
          font-size: 13px;
          color: rgba(240, 255, 247, 0.95);
          font-weight: 500;
        }

        .tone-analyze-button {
          margin-top: 8px;
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 12px 16px;
          background: #ffffff;
          color: #0f3b2f;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }

        .tone-analyze-button:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }

        .tone-analyze-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .emotion-section {
          margin-top: 20px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .emotion-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .emotion-question {
          margin: 0;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
        }

        .emotion-instruction {
          margin: 4px 0 0 0;
          color: #a1a1aa;
          font-size: 13px;
        }

        .emotion-card {
          background: #1a1a1c;
          border: 1px solid #2f2f33;
          border-radius: 18px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
        }

        .selected-emotions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          min-height: 28px;
        }

        .selected-emotion-chip {
          background: rgba(101, 240, 163, 0.15);
          color: #65f0a3;
          border-radius: 999px;
          padding: 4px 8px 4px 12px;
          font-size: 13px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .selected-placeholder {
          color: #6b7280;
          font-size: 13px;
        }

        .emotion-remove {
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          font-size: 12px;
          padding: 0;
          line-height: 1;
        }

        .emotion-remove:hover {
          color: #ffffff;
        }

        .emotion-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .emotion-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid #333338;
          font-size: 13px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .emotion-chip:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .emotion-chip.add-chip {
          border-style: dashed;
        }

        .emotion-emoji {
          font-size: 14px;
        }

        .custom-emotion-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .custom-emotion-input {
          flex: 1;
          background: #0d0d0f;
          border: 1px solid #2f2f33;
          border-radius: 8px;
          padding: 8px 12px;
          color: #fff;
          font-size: 13px;
        }

        .custom-emotion-input::placeholder {
          color: #6b7280;
        }

        .save-custom-emotion {
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          background: #65f0a3;
          color: #111;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .save-custom-emotion:hover {
          background: #52d18a;
        }
      `}</style>
    </div>
  );
};

export default ChatPanel;
