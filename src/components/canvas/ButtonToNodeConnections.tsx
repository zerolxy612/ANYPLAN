'use client';

import React from 'react';
import { useCanvasStore } from '@/store/canvas.store';

interface ButtonToNodeConnectionsProps {
  viewport?: { x: number; y: number; zoom: number };
}

const ButtonToNodeConnections: React.FC<ButtonToNodeConnectionsProps> = ({ viewport }) => {
  const {
    nodes,
    selectedNodesByLevel,
    levels,
    originalPrompt
  } = useCanvasStore();

  const zoom = viewport?.zoom || 1;
  const offsetX = viewport?.x || 0;
  const offsetY = viewport?.y || 0;

  // 获取当前选中的节点
  const getSelectedNode = () => {
    for (const [level, nodeId] of Object.entries(selectedNodesByLevel)) {
      if (nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        if (node && node.data.canExpand) {
          return node;
        }
      }
    }
    return null;
  };

  const selectedNode = getSelectedNode();

  // 收集所有需要绘制连线的情况
  const connections = [];

  // 1. 处理选中节点的连线
  if (selectedNode) {
    const childNodes = nodes.filter(n => n.data.parentId === selectedNode.id);

    if (childNodes.length > 0) {
      const nextLevelBoundaryX = 400 + selectedNode.data.level * 300;
      const nodeCanvasY = selectedNode.position.y;

      const buttonX = nextLevelBoundaryX * zoom + offsetX;
      const buttonY = nodeCanvasY * zoom + offsetY + 5;

      connections.push({
        buttonX,
        buttonY,
        childNodes,
        type: 'selected'
      });
    }
  }

  // 2. 处理原始节点的连线
  if (levels.length > 0 && originalPrompt) {
    // 获取L1节点（原始节点的子节点）
    const l1Nodes = nodes.filter(n => n.data.level === 1);

    if (l1Nodes.length > 0) {
      // 原始节点按钮位置（参考OriginalNode组件的计算）
      const l1BoundaryX = 400;
      const canvasCenterY = 300;

      const originalButtonX = l1BoundaryX * zoom + offsetX;
      const originalButtonY = canvasCenterY * zoom + offsetY + 5;

      connections.push({
        buttonX: originalButtonX,
        buttonY: originalButtonY,
        childNodes: l1Nodes,
        type: 'original'
      });
    }
  }

  if (connections.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5, // 在按钮下方，节点上方
      }}
    >
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {connections.map((connection) =>
          connection.childNodes.map((childNode, index) => {
            // 计算子节点位置（节点左边缘中心）
            const childX = childNode.position.x * zoom + offsetX; // 节点左边缘
            const childY = childNode.position.y * zoom + offsetY + 25; // 节点垂直中心

            // 计算控制点，创建平滑的曲线
            const controlX1 = connection.buttonX + 50; // 按钮右侧控制点
            const controlX2 = childX - 50;  // 节点左侧控制点

            return (
              <g key={`connection-${connection.type}-${childNode.id}`}>
                {/* 主连线：从按钮到子节点的贝塞尔曲线 */}
                <path
                  d={`M ${connection.buttonX} ${connection.buttonY} C ${controlX1} ${connection.buttonY}, ${controlX2} ${childY}, ${childX} ${childY}`}
                  stroke="#2a2a2b"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.8"
                />

                {/* 连接点：按钮处的小圆点（每个连接组只显示一次） */}
                {index === 0 && (
                  <circle
                    cx={connection.buttonX}
                    cy={connection.buttonY}
                    r="3"
                    fill="#2a2a2b"
                    opacity="0.8"
                  />
                )}

                {/* 连接点：节点处的小圆点 */}
                <circle
                  cx={childX}
                  cy={childY}
                  r="3"
                  fill="#2a2a2b"
                  opacity="0.8"
                />
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};

export default ButtonToNodeConnections;
