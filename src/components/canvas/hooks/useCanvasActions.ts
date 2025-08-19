'use client';

import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useCanvasStore } from '@/store/canvas.store';
import { autoLayout, levelLayout, treeLayout } from '../layout/autoLayout';
import { createKeywordNode, createEdge, fitView } from '@/lib/canvas/utils';
import { CanvasNode, NodeContext } from '@/types/canvas';

export function useCanvasActions() {
  const reactFlowInstance = useReactFlow();
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setViewport,
    addNode,
    addEdge,
    generateChildren,
    renewNode,
    deleteNode,
    selectPath,
    clearSelection,
    saveSnapshot,
    config,
  } = useCanvasStore();

  // 自动布局
  const handleAutoLayout = useCallback((layoutType: 'dagre' | 'level' | 'tree' = 'dagre') => {
    let layoutedNodes: CanvasNode[];
    
    switch (layoutType) {
      case 'level':
        layoutedNodes = levelLayout(nodes, config.autoLayout);
        break;
      case 'tree':
        layoutedNodes = treeLayout(nodes, edges, config.autoLayout);
        break;
      case 'dagre':
      default:
        layoutedNodes = autoLayout(nodes, edges, config.autoLayout);
        break;
    }
    
    setNodes(layoutedNodes);
  }, [nodes, edges, setNodes, config.autoLayout]);

  // 适应视图
  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 50, duration: 300 });
    }
  }, [reactFlowInstance]);

  // 重置缩放
  const handleResetZoom = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 });
    }
  }, [reactFlowInstance]);

  // 缩放到指定级别
  const handleZoomTo = useCallback((zoom: number) => {
    if (reactFlowInstance) {
      const { x, y } = reactFlowInstance.getViewport();
      reactFlowInstance.setViewport({ x, y, zoom }, { duration: 300 });
    }
  }, [reactFlowInstance]);

  // 添加新节点
  const handleAddNode = useCallback((
    content: string,
    level: number,
    parentId?: string,
    position?: { x: number; y: number }
  ) => {
    const nodePosition = position || {
      x: Math.random() * 500,
      y: Math.random() * 500,
    };
    
    const newNode = createKeywordNode(content, level, nodePosition, parentId);
    addNode(newNode);
    
    // 如果有父节点，创建连接边
    if (parentId) {
      const edge = createEdge(parentId, newNode.id);
      addEdge(edge);
    }
    
    return newNode;
  }, [addNode, addEdge]);

  // 生成子节点
  const handleGenerateChildren = useCallback(async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const context: NodeContext = {
      parentContent: node.data.content,
      siblingContents: [], // TODO: 获取同级节点内容
      level: node.data.level + 1,
      userPrompt: node.data.content,
      fullPath: [], // TODO: 获取完整路径
    };
    
    await generateChildren(nodeId, context);
  }, [nodes, generateChildren]);

  // 更新节点
  const handleRenewNode = useCallback(async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const context: NodeContext = {
      parentContent: node.data.content,
      siblingContents: [], // TODO: 获取同级节点内容
      level: node.data.level,
      userPrompt: node.data.content,
      fullPath: [], // TODO: 获取完整路径
    };
    
    await renewNode(nodeId, context);
  }, [nodes, renewNode]);

  // 删除节点及其子节点
  const handleDeleteNodeAndChildren = useCallback((nodeId: string) => {
    const nodesToDelete = new Set([nodeId]);
    
    // 递归查找所有子节点
    const findChildren = (parentId: string) => {
      nodes.forEach(node => {
        if (node.data.parentId === parentId) {
          nodesToDelete.add(node.id);
          findChildren(node.id);
        }
      });
    };
    
    findChildren(nodeId);
    
    // 删除所有相关节点
    nodesToDelete.forEach(id => deleteNode(id));
  }, [nodes, deleteNode]);

  // 选择路径
  const handleSelectPath = useCallback((nodeId: string) => {
    const path: string[] = [];
    let currentNode = nodes.find(n => n.id === nodeId);
    
    // 向上追溯到根节点
    while (currentNode) {
      path.unshift(currentNode.id);
      if (currentNode.data.parentId) {
        currentNode = nodes.find(n => n.id === currentNode!.data.parentId);
      } else {
        break;
      }
    }
    
    selectPath(path);
  }, [nodes, selectPath]);

  // 清除选择
  const handleClearSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // 保存快照
  const handleSaveSnapshot = useCallback(async (name?: string) => {
    const snapshotName = name || `快照 ${new Date().toLocaleString()}`;
    await saveSnapshot(snapshotName);
  }, [saveSnapshot]);

  // 导出数据
  const handleExportData = useCallback(() => {
    const data = {
      nodes,
      edges,
      viewport: reactFlowInstance?.getViewport(),
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anyplan-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges, reactFlowInstance]);

  // 导入数据
  const handleImportData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
          if (data.viewport) {
            setViewport(data.viewport);
          }
        }
      } catch (error) {
        console.error('导入数据失败:', error);
      }
    };
    reader.readAsText(file);
  }, [setNodes, setEdges, setViewport]);

  // 复制节点
  const handleCopyNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const copiedData = {
        type: 'anyplan-node',
        data: node.data,
      };
      navigator.clipboard.writeText(JSON.stringify(copiedData));
    }
  }, [nodes]);

  // 粘贴节点
  const handlePasteNode = useCallback(async (position: { x: number; y: number }) => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const copiedData = JSON.parse(clipboardText);
      
      if (copiedData.type === 'anyplan-node') {
        const newNode = createKeywordNode(
          copiedData.data.content,
          copiedData.data.level,
          position
        );
        addNode(newNode);
      }
    } catch (error) {
      console.error('粘贴节点失败:', error);
    }
  }, [addNode]);

  return {
    // 布局操作
    autoLayout: handleAutoLayout,
    fitView: handleFitView,
    resetZoom: handleResetZoom,
    zoomTo: handleZoomTo,
    
    // 节点操作
    addNode: handleAddNode,
    generateChildren: handleGenerateChildren,
    renewNode: handleRenewNode,
    deleteNode: handleDeleteNodeAndChildren,
    copyNode: handleCopyNode,
    pasteNode: handlePasteNode,
    
    // 选择操作
    selectPath: handleSelectPath,
    clearSelection: handleClearSelection,
    
    // 数据操作
    saveSnapshot: handleSaveSnapshot,
    exportData: handleExportData,
    importData: handleImportData,
  };
}
