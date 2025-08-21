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
    content: '短文本测试',
    level: 1,
    canExpand: true,
    hasChildren: true,
    isGenerating: false,
    isSelected: false,
  };

  const mediumTextNode: KeywordNodeData = {
    id: 'test-medium',
    type: 'keyword',
    content: '这是一个中等长度的文本测试，用来验证文本展示效果是否正常工作，应该会显示渐变模糊效果。',
    level: 2,
    canExpand: true,
    hasChildren: true,
    isGenerating: false,
    isSelected: false,
  };

  const longTextNode: KeywordNodeData = {
    id: 'test-long',
    type: 'keyword',
    content: '你的拖延行为实际上是一种心理防御机制，通过延迟行动来保护自我价值感。当面对重要任务时，内心深处害怕全力以赴后仍然失败，这会直接威胁到对自己能力的认知。拖延让你可以在失败时找到借口："如果我有足够时间肯定能做好"，这样就避免了承认能力不足的痛苦。这种模式虽然暂时保护了自尊，但长期来看会阻碍个人成长和目标实现。',
    level: 3,
    canExpand: true,
    hasChildren: true,
    isGenerating: false,
    isSelected: false,
  };

  const veryLongTextNode: KeywordNodeData = {
    id: 'test-very-long',
    type: 'keyword',
    content: '自我价值保护机制是一个复杂的心理现象，它涉及多个层面的认知和情感过程。首先，这种机制源于我们对失败的恐惧和对成功的渴望之间的矛盾。当我们面临重要任务或挑战时，内心会产生两种相互冲突的力量：一方面渴望成功和认可，另一方面又害怕失败带来的羞耻感和自我价值的贬低。拖延行为正是在这种心理冲突中产生的一种妥协策略。通过推迟行动，我们暂时避免了直面可能的失败，同时也为自己保留了"如果认真做就能成功"的幻想。这种机制在短期内确实能够缓解焦虑和压力，但长期来看，它会形成一个恶性循环：越是拖延，越是积累焦虑；越是焦虑，越是倾向于继续拖延。最终，这种模式不仅阻碍了我们实现目标，还会逐渐侵蚀我们的自信心和自我效能感。',
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
      <h1 style={{ color: '#fff', marginBottom: '20px' }}>文本渐变模糊效果测试</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
        <div>
          <h3 style={{ color: '#ccc', marginBottom: '10px' }}>短文本（不应显示渐变效果）</h3>
          <TestKeywordNode data={shortTextNode} selected={false} />
        </div>

        <div>
          <h3 style={{ color: '#ccc', marginBottom: '10px' }}>中等文本（可能显示渐变效果）</h3>
          <TestKeywordNode data={mediumTextNode} selected={false} />
        </div>

        <div>
          <h3 style={{ color: '#ccc', marginBottom: '10px' }}>长文本（应显示渐变效果）</h3>
          <TestKeywordNode data={longTextNode} selected={false} />
        </div>

        <div>
          <h3 style={{ color: '#ccc', marginBottom: '10px' }}>超长文本（应显示渐变效果）</h3>
          <TestKeywordNode data={veryLongTextNode} selected={false} />
        </div>

        <div>
          <h3 style={{ color: '#ccc', marginBottom: '10px' }}>选中状态的长文本</h3>
          <TestKeywordNode data={longTextNode} selected={true} />
        </div>
      </div>

      <div style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
        <p>✨ 点击节点可以展开/收起文本内容</p>
        <p>📝 超过30个字符的文本会显示渐变模糊效果</p>
        <p>🔽 收起状态显示向下箭头，展开状态显示向上箭头</p>
        <p>🎨 选中状态的节点渐变色会变为绿色</p>
      </div>
    </div>
  );
};

export default TestTextFadePage;
