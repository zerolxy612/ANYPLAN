'use client';

import React from 'react';
import { useCanvasStore } from '@/store/canvas.store';

interface ButtonToNodeConnectionsProps {
  viewport?: { x: number; y: number; zoom: number };
}

const ButtonToNodeConnections: React.FC<ButtonToNodeConnectionsProps> = ({ viewport }) => {
  const {
    nodes,
    levels,
    originalPrompt
  } = useCanvasStore();

  const zoom = viewport?.zoom || 1;
  const offsetX = viewport?.x || 0;
  const offsetY = viewport?.y || 0;

  // 不再需要获取选中节点，因为我们要显示所有连线

  // 收集所有需要绘制连线的情况
  const connections = [];

  // 1. 处理原始节点的连线（原始节点 → L1节点）
  if (levels.length > 0 && originalPrompt) {
    // 获取L1节点（原始节点的子节点）
    const l1Nodes = nodes.filter(n => n.data.level === 1);

    if (l1Nodes.length > 0) {
      // 原始节点按钮位置（参考OriginalNode组件的计算）
      const l1BoundaryX = 400;
      const canvasCenterY = 300;

      const originalButtonX = l1BoundaryX * zoom + offsetX - 16;
      const originalButtonY = canvasCenterY * zoom + offsetY - 16;

      connections.push({
        buttonX: originalButtonX,
        buttonY: originalButtonY,
        childNodes: l1Nodes,
        type: 'original',
        parentLevel: 0
      });
    }
  }

  // 2. 处理所有层级节点的连线（L1 → L2, L2 → L3, 等等）
  // 按层级分组所有节点
  const nodesByLevel = new Map();
  nodes.forEach(node => {
    const level = node.data.level;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level).push(node);
  });

  // 为每个有子节点的节点创建连线
  nodes.forEach(parentNode => {
    // 查找该节点的子节点
    const childNodes = nodes.filter(n => n.data.parentId === parentNode.id);

    if (childNodes.length > 0) {
      // 计算"生成下一层级"按钮的位置
      const nextLevelBoundaryX = 400 + parentNode.data.level * 300;
      const nodeCanvasY = parentNode.position.y;

      const buttonX = nextLevelBoundaryX * zoom + offsetX - 16;
      const buttonY = nodeCanvasY * zoom + offsetY + 5;

      connections.push({
        buttonX,
        buttonY,
        childNodes,
        type: 'node',
        parentLevel: parentNode.data.level,
        parentNode
      });
    }
  });

  // 调试信息（开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 ButtonToNodeConnections - connections:', connections.length);
    connections.forEach((conn, index) => {
      console.log(`🔗 Connection ${index}: type=${conn.type}, parentLevel=${conn.parentLevel}, childNodes=${conn.childNodes.length}`);
    });
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
          connection.childNodes.map((childNode, childIndex) => {
            // 计算子节点位置（节点左边缘中心）
            const childX = childNode.position.x * zoom + offsetX; // 节点左边缘
            const childY = childNode.position.y * zoom + offsetY + 25; // 节点垂直中心

            // 计算控制点，创建平滑的曲线
            const controlX1 = connection.buttonX + 50; // 按钮右侧控制点
            const controlX2 = childX - 50;  // 节点左侧控制点

            // 根据连线类型设置不同的样式
            const strokeColor = connection.type === 'original' ? '#606060' : '#2a2a2b';
            const strokeWidth = connection.type === 'original' ? '2' : '2';
            const opacity = connection.type === 'original' ? '0.6' : '0.8';

            return (
              <g key={`connection-${connection.type}-${connection.parentLevel}-${childNode.id}`}>
                {/* 主连线：从按钮到子节点的贝塞尔曲线 */}
                <path
                  d={`M ${connection.buttonX + 16} ${connection.buttonY + 16} C ${controlX1} ${connection.buttonY + 16}, ${controlX2} ${childY}, ${childX} ${childY}`}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  opacity={opacity}
                  strokeDasharray={connection.type === 'original' ? '5,5' : 'none'}
                />

                {/* 连接点：按钮处的小圆点（每个连接组只显示一次） */}
                {childIndex === 0 && (
                  <circle
                    cx={connection.buttonX + 16}
                    cy={connection.buttonY + 16}
                    r="3"
                    fill={strokeColor}
                    opacity={opacity}
                  />
                )}

                {/* 连接点：节点处的小圆点 */}
                <circle
                  cx={childX}
                  cy={childY}
                  r="3"
                  fill={strokeColor}
                  opacity={opacity}
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
