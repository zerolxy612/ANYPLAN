import { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react';

// 基础节点数据接口
export interface BaseNodeData {
  id: string;
  content: string;
  level: number;
  parentId?: string;
  isGenerating?: boolean;
  isSelected?: boolean;
}

// 关键词节点数据
export interface KeywordNodeData extends BaseNodeData {
  type: 'keyword';
  keywords?: string[];
  canExpand: boolean;
  hasChildren: boolean;
}

// 层级指示器节点数据
export interface LevelIndicatorData extends BaseNodeData {
  type: 'level';
  levelName: string;
  nodeCount: number;
}

// 输出节点数据
export interface OutputNodeData extends BaseNodeData {
  type: 'output';
  outputType: 'single' | 'joint';
  generatedContent: string;
}

// 联合节点数据类型
export type NodeData = KeywordNodeData | LevelIndicatorData | OutputNodeData;

// 扩展的节点类型
export interface CanvasNode extends ReactFlowNode {
  data: NodeData;
}

// 扩展的边类型
export interface CanvasEdge extends ReactFlowEdge {
  animated?: boolean;
  style?: React.CSSProperties;
}

// 画布视口
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

// 节点位置
export interface NodePosition {
  x: number;
  y: number;
}

// 生成上下文
export interface NodeContext {
  parentContent?: string;
  siblingContents: string[];
  level: number;
  userPrompt: string;
  fullPath: string[];
}

// 选中路径
export interface SelectedPath {
  nodeIds: string[];
  nodes: CanvasNode[];
  isComplete: boolean;
}

// 快照/版本
export interface Snapshot {
  id: string;
  name: string;
  description?: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: Viewport;
  selectedPath?: SelectedPath;
  createdAt: Date;
  updatedAt: Date;
}

// 画布操作类型
export type CanvasAction = 
  | 'generate-children'
  | 'renew-node'
  | 'delete-node'
  | 'select-path'
  | 'clear-selection'
  | 'auto-layout'
  | 'fit-view'
  | 'save-snapshot'
  | 'load-snapshot';

// 加载状态
export interface LoadingState {
  isGenerating: boolean;
  renewingNodeId: string | null;
  isSaving: boolean;
  isLoading: boolean;
}

// 错误状态
export interface ErrorState {
  message: string;
  type: 'generation' | 'network' | 'storage' | 'validation';
  nodeId?: string;
  timestamp: Date;
}

// 画布配置
export interface CanvasConfig {
  maxZoom: number;
  minZoom: number;
  defaultViewport: Viewport;
  nodeSpacing: {
    horizontal: number;
    vertical: number;
  };
  autoLayout: {
    direction: 'TB' | 'BT' | 'LR' | 'RL';
    rankSeparation: number;
    nodeSeparation: number;
  };
}

// 导出数据格式
export interface ExportData {
  version: string;
  snapshots: Snapshot[];
  config: CanvasConfig;
  exportedAt: Date;
}
