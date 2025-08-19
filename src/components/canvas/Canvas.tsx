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
    setViewport,
    config,
    loading,
    error,
  } = useCanvasStore();

  const {
    fitView,
    addNode,
  } = useCanvasActions();

  console.log('🎨 Canvas component rendered!');

  // 使用 React Flow 的状态管理，直接使用 store 中的数据
  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState(nodes);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState(edges);

  // 不需要同步 useEffect，useNodesState 和 useEdgesState 会自动处理初始数据

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
          border: '1px solid #404040'
        }}>
          {/* 空的层级条容器，等待用户操作后显示内容 */}
        </div>
      </div>

      {/* 画布区域 */}
      <div
        ref={reactFlowWrapper}
        className="canvas-container"
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
