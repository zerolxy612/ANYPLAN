'use client';

import React from 'react';
import { KeywordNodeData } from '@/types/canvas';

// 创建一个简化的测试组件，不依赖于完整的 React Flow NodeProps
const TestKeywordNode = ({ data, selected }: { data: KeywordNodeData; selected: boolean }) => {
  return (
    <div
      style={{
        width: '180px',
        minHeight: '50px',
        maxHeight: '150px',
        borderRadius: '25px',
        border: selected ? '2px solid #65f0a3' : '1px solid #404040',
        backgroundColor: selected ? '#65f0a3' : '#262627',
        padding: '12px 20px',
        color: selected ? '#000000' : '#d9d9d9',
        fontSize: '14px',
        lineHeight: '1.4',
        wordBreak: 'break-word',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        {data.content}
      </div>
      {data.content.length > 30 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50px',
            background: selected
              ? 'linear-gradient(to bottom, transparent 0%, rgba(101, 240, 163, 0.3) 30%, rgba(101, 240, 163, 0.8) 70%, #65f0a3 100%)'
              : 'linear-gradient(to bottom, transparent 0%, rgba(38, 38, 39, 0.3) 30%, rgba(38, 38, 39, 0.8) 70%, #262627 100%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
};

const TestTextFadePage = () => {
  // 创建测试节点数据
  const shortTextNode: KeywordNodeData = {
    id: 'test-short',
    type: 'keyword',
    content: 'Short text test',
    level: 1,
    canExpand: true,
    hasChildren: true,
    isGenerating: false,
    isSelected: false,
  };

  const mediumTextNode: KeywordNodeData = {
    id: 'test-medium',
    type: 'keyword',
    content: 'This is a medium-length text test to verify that the text display effect works properly and should show gradient blur effect.',
    level: 2,
    canExpand: true,
    hasChildren: true,
    isGenerating: false,
    isSelected: false,
  };

  const longTextNode: KeywordNodeData = {
    id: 'test-long',
    type: 'keyword',
    content: 'Your procrastination behavior is actually a psychological defense mechanism that protects self-worth by delaying action. When facing important tasks, deep down you fear that even after giving your all, you might still fail, which would directly threaten your perception of your own abilities. Procrastination allows you to find excuses when you fail: "If I had enough time, I could definitely do it well," thus avoiding the pain of admitting inadequate ability. While this pattern temporarily protects self-esteem, in the long run it hinders personal growth and goal achievement.',
    level: 3,
    canExpand: true,
    hasChildren: true,
    isGenerating: false,
    isSelected: false,
  };

  const veryLongTextNode: KeywordNodeData = {
    id: 'test-very-long',
    type: 'keyword',
    content: 'The self-worth protection mechanism is a complex psychological phenomenon involving multiple levels of cognitive and emotional processes. First, this mechanism stems from the contradiction between our fear of failure and desire for success. When we face important tasks or challenges, our hearts generate two conflicting forces: on one hand, we crave success and recognition, while on the other hand, we fear the shame and devaluation of self-worth that failure brings. Procrastination behavior is precisely a compromise strategy that emerges from this psychological conflict. By postponing action, we temporarily avoid facing possible failure while preserving the illusion that "if I did it seriously, I could succeed." While this mechanism can indeed alleviate anxiety and pressure in the short term, in the long run, it forms a vicious cycle: the more we procrastinate, the more anxiety accumulates; the more anxious we become, the more we tend to continue procrastinating. Ultimately, this pattern not only hinders us from achieving our goals but also gradually erodes our confidence and self-efficacy.',
    level: 4,
    canExpand: true,
    hasChildren: true,
    isGenerating: false,
    isSelected: false,
  };

  return (
    <div style={{ 
      padding: '40px',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#fff', marginBottom: '20px' }}>Text Gradient Blur Effect Test</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
        <div>
          <h3 style={{ color: '#ccc', marginBottom: '10px' }}>Short text (should not show gradient effect)</h3>
          <TestKeywordNode data={shortTextNode} selected={false} />
        </div>

        <div>
          <h3 style={{ color: '#ccc', marginBottom: '10px' }}>Medium text (may show gradient effect)</h3>
          <TestKeywordNode data={mediumTextNode} selected={false} />
        </div>

        <div>
          <h3 style={{ color: '#ccc', marginBottom: '10px' }}>Long text (should show gradient effect)</h3>
          <TestKeywordNode data={longTextNode} selected={false} />
        </div>

        <div>
          <h3 style={{ color: '#ccc', marginBottom: '10px' }}>Very long text (should show gradient effect)</h3>
          <TestKeywordNode data={veryLongTextNode} selected={false} />
        </div>

        <div>
          <h3 style={{ color: '#ccc', marginBottom: '10px' }}>Selected state long text</h3>
          <TestKeywordNode data={longTextNode} selected={true} />
        </div>
      </div>

      <div style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
        <p>✨ Click nodes to expand/collapse text content</p>
        <p>📝 Text over 30 characters will show gradient blur effect</p>
        <p>🔽 Collapsed state shows down arrow, expanded state shows up arrow</p>
        <p>🎨 Selected nodes will have green gradient color</p>
      </div>
    </div>
  );
};

export default TestTextFadePage;
