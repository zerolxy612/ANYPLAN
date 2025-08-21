'use client';

import React from 'react';
import { useCanvasStore } from '@/store/canvas.store';
import { CanvasNode } from '@/types/canvas';

interface SelectedNodeButtonProps {
  viewport?: { x: number; y: number; zoom: number };
}

const SelectedNodeButton: React.FC<SelectedNodeButtonProps> = ({ viewport }) => {
  const {
    nodes,
    generateChildren,
    loading,
    selectedNodesByLevel
  } = useCanvasStore();
  
  const zoom = viewport?.zoom || 1;
  const offsetX = viewport?.x || 0;
  const offsetY = viewport?.y || 0;

  // 获取所有选中且可展开的节点
  const getSelectedNodes = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 SelectedNodeButton - selectedNodesByLevel:', selectedNodesByLevel);
      console.log('🔍 SelectedNodeButton - nodes count:', nodes.length);
    }

    const selectedNodes: CanvasNode[] = [];

    // 遍历所有选中的节点
    for (const [level, nodeId] of Object.entries(selectedNodesByLevel)) {
      if (nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 Level ${level}, NodeId: ${nodeId}, Found node:`, node);
        }
        if (node) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 Node data:`, node.data);
            console.log(`🔍 canExpand: ${node.data.canExpand}, level: ${node.data.level}`);
          }
          if (node.data.canExpand) {
            selectedNodes.push(node);
          }
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Selected expandable nodes:', selectedNodes.length);
    }
    return selectedNodes;
  };

  const selectedNodes = getSelectedNodes();

  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 SelectedNodeButton render - selectedNodes:', selectedNodes.length);
    console.log('🎯 SelectedNodeButton render - loading.isGenerating:', loading.isGenerating);
  }

  if (selectedNodes.length === 0 || loading.isGenerating) {
    return null;
  }

  // 为每个选中节点创建按钮的函数
  const createButtonForNode = (selectedNode: CanvasNode) => {
    // 计算按钮位置（参考原始节点逻辑，稍微降低高度）
    const nextLevelBoundaryX = 400 + selectedNode.data.level * 300;
    const nodeCanvasY = selectedNode.position.y;

    const buttonX = nextLevelBoundaryX * zoom + offsetX - 16;
    const buttonY = nodeCanvasY * zoom + offsetY + 5;

    // 处理生成下一层级
    const handleGenerateNext = async () => {
      if (loading.isGenerating) return;

      try {
        await generateChildren(selectedNode.id, {
          parentContent: selectedNode.data.content,
          siblingContents: [],
          level: selectedNode.data.level + 1,
          userPrompt: selectedNode.data.content,
          fullPath: [selectedNode.data.content],
        });
      } catch (error) {
        console.error('生成下一层级失败:', error);
      }
    };

    return (
      <button
        key={`selected-node-button-${selectedNode.id}`} // 关键：为每个节点提供唯一key
        onClick={handleGenerateNext}
        disabled={loading.isGenerating}
        style={{
          position: 'absolute',
          left: `${buttonX}px`,
          top: `${buttonY}px`,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#606060',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          pointerEvents: 'auto',
          zIndex: 3, // 降低层级，确保不覆盖sidebar(z-index:10)
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#65f0a3';
          e.currentTarget.style.color = '#000000';
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(101, 240, 163, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#606060';
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        }}
        title={`生成下一层级 (${selectedNode.data.content.substring(0, 20)}...)`}
      >
        ›
      </button>
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2, // 降低层级，确保不覆盖sidebar(z-index:10)
      }}
    >
      {/* 为每个选中节点创建独立的按钮 */}
      {selectedNodes.map(selectedNode => createButtonForNode(selectedNode))}
    </div>
  );
};

export default SelectedNodeButton;
