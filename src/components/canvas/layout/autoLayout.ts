import dagre from 'dagre';
import { CanvasNode, CanvasEdge } from '@/types/canvas';
import { getNodeDimensions } from '@/lib/canvas/utils';

export interface LayoutOptions {
  direction: 'TB' | 'BT' | 'LR' | 'RL';
  rankSeparation: number;
  nodeSeparation: number;
  edgeSeparation: number;
  marginX: number;
  marginY: number;
}

const defaultLayoutOptions: LayoutOptions = {
  direction: 'TB',
  rankSeparation: 100,
  nodeSeparation: 200,
  edgeSeparation: 50,
  marginX: 50,
  marginY: 50,
};

/**
 * 使用 dagre 算法自动布局节点
 */
export function autoLayout(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  options: Partial<LayoutOptions> = {}
): CanvasNode[] {
  const layoutOptions = { ...defaultLayoutOptions, ...options };
  
  // 创建 dagre 图
  const graph = new dagre.graphlib.Graph();
  
  // 设置图的默认属性
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: layoutOptions.direction,
    ranksep: layoutOptions.rankSeparation,
    nodesep: layoutOptions.nodeSeparation,
    edgesep: layoutOptions.edgeSeparation,
    marginx: layoutOptions.marginX,
    marginy: layoutOptions.marginY,
  });
  
  // 添加节点到图中
  nodes.forEach((node) => {
    const dimensions = getNodeDimensions(node.type || 'keyword');
    graph.setNode(node.id, {
      width: dimensions.width,
      height: dimensions.height,
    });
  });
  
  // 添加边到图中
  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });
  
  // 执行布局算法
  dagre.layout(graph);
  
  // 更新节点位置
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = graph.node(node.id);
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });
  
  return layoutedNodes;
}

/**
 * 层级布局 - 按层级水平排列节点
 */
export function levelLayout(
  nodes: CanvasNode[],
  options: Partial<LayoutOptions> = {}
): CanvasNode[] {
  const layoutOptions = { ...defaultLayoutOptions, ...options };
  
  // 按层级分组节点
  const nodesByLevel = new Map<number, CanvasNode[]>();
  
  nodes.forEach((node) => {
    const level = node.data.level;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(node);
  });
  
  const layoutedNodes: CanvasNode[] = [];
  
  // 为每个层级计算位置
  nodesByLevel.forEach((levelNodes, level) => {
    const totalWidth = levelNodes.length * layoutOptions.nodeSeparation;
    const startX = -totalWidth / 2;
    
    levelNodes.forEach((node, index) => {
      const x = startX + index * layoutOptions.nodeSeparation;
      const y = level * layoutOptions.rankSeparation;
      
      layoutedNodes.push({
        ...node,
        position: { x, y },
      });
    });
  });
  
  return layoutedNodes;
}

/**
 * 树形布局 - 基于父子关系的树形结构
 */
export function treeLayout(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  options: Partial<LayoutOptions> = {}
): CanvasNode[] {
  const layoutOptions = { ...defaultLayoutOptions, ...options };
  
  // 构建父子关系映射
  const childrenMap = new Map<string, CanvasNode[]>();
  const parentMap = new Map<string, string>();
  
  nodes.forEach((node) => {
    if (node.data.parentId) {
      parentMap.set(node.id, node.data.parentId);
      
      if (!childrenMap.has(node.data.parentId)) {
        childrenMap.set(node.data.parentId, []);
      }
      childrenMap.get(node.data.parentId)!.push(node);
    }
  });
  
  // 找到根节点
  const rootNodes = nodes.filter((node) => !node.data.parentId);
  
  const layoutedNodes: CanvasNode[] = [];
  const processedNodes = new Set<string>();
  
  // 递归布局函数
  function layoutSubtree(
    node: CanvasNode,
    x: number,
    y: number,
    subtreeWidth: number
  ): number {
    if (processedNodes.has(node.id)) {
      return 0;
    }
    
    processedNodes.add(node.id);
    
    const children = childrenMap.get(node.id) || [];
    const nodeWidth = getNodeDimensions(node.type || 'keyword').width;
    
    // 计算子树的总宽度
    let totalChildWidth = 0;
    if (children.length > 0) {
      totalChildWidth = children.length * layoutOptions.nodeSeparation;
    }
    
    // 当前节点位置
    const nodeX = x + Math.max(0, (subtreeWidth - nodeWidth) / 2);
    layoutedNodes.push({
      ...node,
      position: { x: nodeX, y },
    });
    
    // 布局子节点
    if (children.length > 0) {
      const childY = y + layoutOptions.rankSeparation;
      const startX = x + (subtreeWidth - totalChildWidth) / 2;
      
      children.forEach((child, index) => {
        const childX = startX + index * layoutOptions.nodeSeparation;
        layoutSubtree(child, childX, childY, layoutOptions.nodeSeparation);
      });
    }
    
    return Math.max(subtreeWidth, totalChildWidth);
  }
  
  // 布局每个根节点
  let currentX = 0;
  rootNodes.forEach((rootNode) => {
    const subtreeWidth = calculateSubtreeWidth(rootNode, childrenMap, layoutOptions);
    layoutSubtree(rootNode, currentX, 0, subtreeWidth);
    currentX += subtreeWidth + layoutOptions.nodeSeparation;
  });
  
  return layoutedNodes;
}

/**
 * 计算子树宽度
 */
function calculateSubtreeWidth(
  node: CanvasNode,
  childrenMap: Map<string, CanvasNode[]>,
  options: LayoutOptions
): number {
  const children = childrenMap.get(node.id) || [];
  
  if (children.length === 0) {
    return getNodeDimensions(node.type || 'keyword').width;
  }
  
  const childrenWidth = children.reduce((total, child) => {
    return total + calculateSubtreeWidth(child, childrenMap, options);
  }, 0);
  
  const spacingWidth = (children.length - 1) * options.nodeSeparation;
  const nodeWidth = getNodeDimensions(node.type || 'keyword').width;
  
  return Math.max(nodeWidth, childrenWidth + spacingWidth);
}

/**
 * 圆形布局 - 将节点排列成圆形
 */
export function circularLayout(
  nodes: CanvasNode[],
  centerX: number = 0,
  centerY: number = 0,
  radius: number = 300
): CanvasNode[] {
  const angleStep = (2 * Math.PI) / nodes.length;
  
  return nodes.map((node, index) => {
    const angle = index * angleStep;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    return {
      ...node,
      position: { x, y },
    };
  });
}

/**
 * 网格布局 - 将节点排列成网格
 */
export function gridLayout(
  nodes: CanvasNode[],
  columns: number = 5,
  spacing: number = 200
): CanvasNode[] {
  return nodes.map((node, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    
    return {
      ...node,
      position: {
        x: col * spacing,
        y: row * spacing,
      },
    };
  });
}
