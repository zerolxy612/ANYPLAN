'use client';

import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Connection,
  Edge,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore } from '@/store/canvas.store';
import { useCanvasActions } from './hooks/useCanvasActions';
import KeywordNode from './node-types/KeywordNode';

import DefaultEdge from './edges/DefaultEdge';
import LevelBar from './LevelBar';
import OriginalNodeComponent from './OriginalNode';
import SelectedNodeButton from './SelectedNodeButton';


// 节点类型映射
const nodeTypes = {
  keyword: KeywordNode,
};

// 边类型映射
const edgeTypes = {
  default: DefaultEdge,
};

interface CanvasProps {
  className?: string;
}

function CanvasComponent({ className }: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // 从 store 获取状态
  const {
    nodes,
    edges,
    viewport,
    setViewport,
    config,
    loading,
    error,
    levels,
    currentLevel,
    setCurrentLevel,
    insertLevel,
    deleteLevel,
    editLevel,
    originalPrompt,

  } = useCanvasStore();

  // 调试日志
  console.log('🔍 Canvas render - nodes:', nodes.length, nodes);
  console.log('🔍 Canvas render - edges:', edges.length, edges);

  const {
    fitView,
    addNode,
  } = useCanvasActions();

  // 原始节点操作处理
  const handleRegenerateOriginal = useCallback(() => {
    // TODO: 重新生成原始内容和层级框架
    console.log('重新生成原始内容');
  }, []);

  const handleGenerateNextLevel = useCallback(() => {
    // TODO: 生成下一层级内容
    console.log('生成下一层级内容');
  }, []);





  // 直接使用 store 中的数据，不使用 React Flow 的内部状态
  const onNodesChange = useCallback((changes: any) => {
    console.log('🔄 Canvas: Nodes changed:', changes);
    // 这里可以处理节点变化，比如位置更新等
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    console.log('🔄 Canvas: Edges changed:', changes);
    // 这里可以处理边变化
  }, []);

  // 连接处理
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: 'default',
      } as Edge;
      // 直接更新 store 中的边
      // TODO: 实现 addEdge 到 store
      console.log('🔗 Adding edge:', newEdge);
    },
    []
  );

  // 视口变化处理
  const onViewportChange = useCallback(
    (newViewport: { x: number; y: number; zoom: number }) => {
      setViewport(newViewport);
    },
    [setViewport]
  );

  // 画布点击处理
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      // 双击添加新节点
      if (event.detail === 2) {
        const rect = reactFlowWrapper.current?.getBoundingClientRect();
        if (rect) {
          const position = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          };
          addNode('新节点', 1, undefined, position);
        }
      }
    },
    [addNode]
  );

  // 键盘快捷键处理
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            // TODO: 保存快照
            break;
          case 'z':
            event.preventDefault();
            // TODO: 撤销
            break;
          case 'y':
            event.preventDefault();
            // TODO: 重做
            break;
          case 'v':
            event.preventDefault();
            // TODO: 粘贴
            break;
        }
      } else {
        switch (event.key) {
          case ' ':
            event.preventDefault();
            fitView();
            break;
          case 'Delete':
            // TODO: 删除选中节点
            break;
        }
      }
    },
    [fitView]
  );

  return (
    <div className={`canvas-wrapper ${className || ''}`}>
      {/* 层级条 */}
      {levels.length > 0 ? (
        <LevelBar
          levels={levels}
          currentLevel={currentLevel}
          viewport={viewport}
          onViewportChange={setViewport}
          onLevelClick={(levelId) => {
            const level = parseInt(levelId.replace('L', ''));
            setCurrentLevel(level);
          }}
          onAddLevel={(afterLevel) => {
            insertLevel(afterLevel);
          }}
          onDeleteLevel={(level) => {
            deleteLevel(level);
          }}
          onEditLevel={(level, newDescription) => {
            editLevel(level, newDescription);
          }}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px'
        }}>
          <div style={{
            width: '90%',
            height: '60px',
            backgroundColor: '#2a292c',
            borderRadius: '30px',
            border: '1px solid #404040',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a1a1aa',
            fontSize: '14px'
          }}>
            {/* 请在右侧输入问题开始探索 */}
          </div>
        </div>
      )}

      {/* 画布区域 */}
      <div
        ref={reactFlowWrapper}
        className="canvas-container"
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onViewportChange={onViewportChange}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={config.defaultViewport}
        minZoom={config.minZoom}
        maxZoom={config.maxZoom}
        attributionPosition="bottom-left"
      >
        {/* 背景 */}
        <Background
          color="#404040"
          gap={20}
          size={1}
        />

        {/* 层级背景区域 - 使用SVG，手动应用viewport变换 */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
            {levels.map((level, index) => (
              <rect
                key={level.level}
                x={400 + (level.level - 1) * 300}
                y={-1000}
                width={300}
                height={3000}
                fill={index % 2 === 0 ? '#1a1a1c' : '#161618'}
                stroke="#2a2a2a"
                strokeWidth="1"
              />
            ))}
          </g>
        </svg>



        {/* 控制面板 */}
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />

        
        {/* 加载状态 */}
        {loading.isGenerating && (
          <Panel position="top-center" className="loading-panel">
            <div className="loading-content">
              <div className="loading-spinner" />
              <span>正在生成...</span>
            </div>
          </Panel>
        )}
        
        {/* 错误提示 */}
        {error && (
          <Panel position="top-center" className="error-panel">
            <div className="error-content">
              <span>{error.message}</span>
              <button
                onClick={() => useCanvasStore.getState().clearError()}
                className="error-close"
              >
                ×
              </button>
            </div>
          </Panel>
        )}


      </ReactFlow>

      {/* 原始节点 - 当有层级时显示 */}
      {levels.length > 0 && originalPrompt && (
        <OriginalNodeComponent
          content={originalPrompt}
          onRegenerate={handleRegenerateOriginal}
          onGenerateNext={handleGenerateNextLevel}
          viewport={viewport}
        />
      )}

      {/* 选中节点的生成按钮 */}
      <SelectedNodeButton viewport={viewport} />

      </div>

      <style jsx>{`
        .canvas-container {
          width: 100%;
          height: 100%;
          position: relative;
          outline: none;
        }
        

        
        .loading-panel {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 12px 16px;
        }
        
        .loading-content {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 14px;
        }
        
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-panel {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px 16px;
        }
        
        .error-content {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #dc2626;
          font-size: 14px;
        }
        
        .error-close {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 0;
          margin-left: 8px;
        }

        .canvas-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .canvas-container {
          flex: 1;
          width: 100%;
          height: 100%;
        }

        .level-background-container {
          position: relative;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .level-background {
          position: absolute;
          top: 0;
          bottom: 0;
          pointer-events: none;
          z-index: -1;
        }
      `}</style>
    </div>
  );
}

// 包装组件以提供 ReactFlowProvider
export default function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasComponent {...props} />
    </ReactFlowProvider>
  );
}
