'use client';

import React, { memo } from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';

const DefaultEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={{
          stroke: selected ? '#3b82f6' : '#94a3b8',
          strokeWidth: selected ? 3 : 2,
          fill: 'none',
          ...style,
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />
      
      {/* 可选的边标签 */}
      {data?.label && (
        <text
          x={labelX}
          y={labelY}
          style={{
            fontSize: '12px',
            fill: '#6b7280',
            textAnchor: 'middle',
            dominantBaseline: 'middle',
            pointerEvents: 'none',
          }}
          className="react-flow__edge-text"
        >
          {String(data.label)}
        </text>
      )}
    </>
  );
});

DefaultEdge.displayName = 'DefaultEdge';

export default DefaultEdge;
