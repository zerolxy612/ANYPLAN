import { CanvasNode, CanvasEdge, NodePosition, Viewport } from '@/types/canvas';
import { NODE_DIMENSIONS, CANVAS_CONFIG, getNodeBackgroundColor } from './constants';

// 生成唯一ID
export function generateId(prefix: string = 'node'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 获取节点尺寸
export function getNodeDimensions(nodeType: string) {
  switch (nodeType) {
    case 'keyword':
      return NODE_DIMENSIONS.KEYWORD;
    case 'level':
      return NODE_DIMENSIONS.LEVEL;
    case 'output':
      return NODE_DIMENSIONS.OUTPUT;
    default:
      return NODE_DIMENSIONS.KEYWORD;
  }
}

// 计算节点位置
export function calculateNodePosition(
  level: number,
  index: number,
  parentPosition?: NodePosition
): NodePosition {
  const { horizontal, vertical } = CANVAS_CONFIG.NODE_SPACING;
  
  if (parentPosition) {
    return {
      x: parentPosition.x + (index - 1) * horizontal,
      y: parentPosition.y + vertical,
    };
  }
  
  return {
    x: index * horizontal,
    y: level * vertical,
  };
}

// 获取层级颜色 - 使用PRD规定的背景色规则
export function getLevelColor(level: number): string {
  return getNodeBackgroundColor(level);
}

// 创建关键词节点
export function createKeywordNode(
  content: string,
  level: number,
  position: NodePosition,
  parentId?: string
): CanvasNode {
  return {
    id: generateId('keyword'),
    type: 'keyword',
    position,
    data: {
      id: generateId('keyword'),
      type: 'keyword',
      content,
      level,
      parentId,
      canExpand: true,
      hasChildren: false,
    },
  };
}

// 创建边
export function createEdge(
  sourceId: string,
  targetId: string,
  animated: boolean = false
): CanvasEdge {
  return {
    id: generateId('edge'),
    source: sourceId,
    target: targetId,
    type: animated ? 'animated' : 'default',
    animated,
  };
}

// 查找节点的子节点
export function findChildNodes(nodeId: string, nodes: CanvasNode[]): CanvasNode[] {
  return nodes.filter(node => node.data.parentId === nodeId);
}

// 查找节点的父节点
export function findParentNode(nodeId: string, nodes: CanvasNode[]): CanvasNode | undefined {
  const node = nodes.find(n => n.id === nodeId);
  if (!node?.data.parentId) return undefined;
  return nodes.find(n => n.id === node.data.parentId);
}

// 获取节点路径
export function getNodePath(nodeId: string, nodes: CanvasNode[]): CanvasNode[] {
  const path: CanvasNode[] = [];
  let currentNode = nodes.find(n => n.id === nodeId);
  
  while (currentNode) {
    path.unshift(currentNode);
    if (currentNode.data.parentId) {
      currentNode = nodes.find(n => n.id === currentNode!.data.parentId);
    } else {
      break;
    }
  }
  
  return path;
}

// 计算画布边界
export function calculateCanvasBounds(nodes: CanvasNode[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  nodes.forEach(node => {
    const { width, height } = getNodeDimensions(node.type || 'keyword');
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + width);
    maxY = Math.max(maxY, node.position.y + height);
  });
  
  return { minX, minY, maxX, maxY };
}

// 适应视图
export function fitView(
  nodes: CanvasNode[],
  containerWidth: number,
  containerHeight: number,
  padding: number = 50
): Viewport {
  if (nodes.length === 0) {
    return CANVAS_CONFIG.DEFAULT_VIEWPORT;
  }
  
  const bounds = calculateCanvasBounds(nodes);
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;
  
  const scaleX = (containerWidth - padding * 2) / boundsWidth;
  const scaleY = (containerHeight - padding * 2) / boundsHeight;
  const zoom = Math.min(scaleX, scaleY, CANVAS_CONFIG.MAX_ZOOM);
  
  const x = (containerWidth - boundsWidth * zoom) / 2 - bounds.minX * zoom;
  const y = (containerHeight - boundsHeight * zoom) / 2 - bounds.minY * zoom;
  
  return { x, y, zoom };
}

// 验证节点数据
export function validateNodeData(data: unknown): boolean {
  if (!data || typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return (
    'id' in obj &&
    'content' in obj &&
    'level' in obj &&
    'type' in obj &&
    typeof obj.id === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.level === 'number' &&
    typeof obj.type === 'string'
  );
}

// 验证边数据
export function validateEdgeData(edge: unknown): boolean {
  if (!edge || typeof edge !== 'object' || edge === null) {
    return false;
  }

  const obj = edge as Record<string, unknown>;
  return (
    'id' in obj &&
    'source' in obj &&
    'target' in obj &&
    typeof obj.id === 'string' &&
    typeof obj.source === 'string' &&
    typeof obj.target === 'string'
  );
}

// 深度克隆对象
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

// 防抖函数
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化时间
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}
