'use client';

import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
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
import { CANVAS_CONFIG } from '@/lib/canvas/constants';

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
  const {
    nodes,
    edges,
    viewport,
    setNodes,
    setEdges,
    setViewport,
    config,
    loading,
    error,
  } = useCanvasStore();
  
  const {
    autoLayout,
    fitView,
    addNode,
    pasteNode,
  } = useCanvasActions();

  // 使用 React Flow 的状态管理
  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState(nodes);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState(edges);

  // 不再自动创建初始节点，保持画布为空

  // 同步状态
  React.useEffect(() => {
    setReactFlowNodes(nodes);
  }, [nodes, setReactFlowNodes]);

  React.useEffect(() => {
    setReactFlowEdges(edges);
  }, [edges, setReactFlowEdges]);

  // 连接处理
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: 'default',
      } as Edge;
      setReactFlowEdges((eds) => addEdge(newEdge, eds));
    },
    [setReactFlowEdges]
  );

  // 视口变化处理
  const onViewportChange = useCallback(
    (newViewport: typeof viewport) => {
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
    <div 
      ref={reactFlowWrapper} 
      className={`canvas-container ${className || ''}`}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
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
        fitView
        attributionPosition="bottom-left"
      >
        {/* 背景 */}
        <Background
          color="#404040"
          gap={20}
          size={1}
        />

        {/* 控制面板 */}
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        
        {/* 工具栏 */}
        <Panel position="top-left" className="canvas-toolbar">
          <div className="toolbar-group">
            <button
              onClick={() => autoLayout('dagre')}
              className="toolbar-btn"
              title="自动布局"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h18v18H3V3zm2 2v14h14V5H5z" fill="currentColor"/>
              </svg>
            </button>
            
            <button
              onClick={() => autoLayout('level')}
              className="toolbar-btn"
              title="层级布局"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor"/>
              </svg>
            </button>
            
            <button
              onClick={fitView}
              className="toolbar-btn"
              title="适应视图"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm12 0h6v6h-6v-6z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </Panel>
        
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
      
      <style jsx>{`
        .canvas-container {
          width: 100%;
          height: 100%;
          position: relative;
          outline: none;
        }
        
        .canvas-toolbar {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 8px;
        }
        
        .toolbar-group {
          display: flex;
          gap: 4px;
        }
        
        .toolbar-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s ease;
        }
        
        .toolbar-btn:hover {
          background: #f3f4f6;
          color: #374151;
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
