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
    selectedNodesByLevel,
    checkLevelNodesComplete
  } = useCanvasStore();
  
  const zoom = viewport?.zoom || 1;
  const offsetX = viewport?.x || 0;
  const offsetY = viewport?.y || 0;

  // 获取所有选中且可展开的节点，包括自动显示的节点
  const getSelectedNodes = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 SelectedNodeButton - selectedNodesByLevel:', selectedNodesByLevel);
      console.log('🔍 SelectedNodeButton - nodes count:', nodes.length);
    }

    const selectedNodes: CanvasNode[] = [];

    // 1. 首先添加用户手动选中的节点
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

    // 2. 如果没有手动选中的节点，检查是否需要自动显示按钮
    if (selectedNodes.length === 0) {
      // 检查L1层级是否完成且没有L2节点
      if (checkLevelNodesComplete(1)) {
        const hasL2Nodes = nodes.some(node => node.data.level === 2);
        if (!hasL2Nodes) {
          // L1完成但没有L2节点，在L1的中间节点显示按钮
          const l1Nodes = nodes.filter(node => node.data.level === 1).sort((a, b) => a.position.y - b.position.y);
          if (l1Nodes.length >= 2) {
            const middleNode = l1Nodes[1]; // 选择中间节点（索引1）
            if (middleNode.data.canExpand) {
              selectedNodes.push(middleNode);
              if (process.env.NODE_ENV === 'development') {
                console.log('🎯 Auto-showing button for L1 middle node:', middleNode.id);
              }
            }
          }
        }
      }

      // 检查L2层级是否完成且没有L3节点
      if (checkLevelNodesComplete(2)) {
        const hasL3Nodes = nodes.some(node => node.data.level === 3);
        if (!hasL3Nodes) {
          // L2完成但没有L3节点，在L2的中间节点显示按钮
          const l2Nodes = nodes.filter(node => node.data.level === 2).sort((a, b) => a.position.y - b.position.y);
          if (l2Nodes.length >= 2) {
            const middleNode = l2Nodes[1]; // 选择中间节点（索引1）
            if (middleNode.data.canExpand) {
              selectedNodes.push(middleNode);
              if (process.env.NODE_ENV === 'development') {
                console.log('🎯 Auto-showing button for L2 middle node:', middleNode.id);
              }
            }
          }
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Selected expandable nodes (including auto):', selectedNodes.length);
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
