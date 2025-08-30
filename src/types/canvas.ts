import { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react';

// 基础节点数据接口
export interface BaseNodeData extends Record<string, unknown> {
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
  // 投诉信相关字段
  questionText?: string; // 问题文本（如"What time?"）
  userInput?: string; // 用户输入的答案
}

// 层级指示器节点数据
export interface LevelIndicatorData extends BaseNodeData {
  type: 'level';
  levelName: string;
  nodeCount: number;
}

// 原始节点数据
export interface OriginalNodeData extends BaseNodeData {
  type: 'original';
  originalPrompt: string;
  isRoot: true;
}

// 输出节点数据
export interface OutputNodeData extends BaseNodeData {
  type: 'output';
  outputType: 'single' | 'joint';
  generatedContent: string;
}

// 联合节点数据类型
export type NodeData = KeywordNodeData | LevelIndicatorData | OriginalNodeData | OutputNodeData;

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

// AI层级定义
export interface AILevel {
  level: number;
  label: string;        // L1, L2, L3...
  description: string;  // 表层探索, 具体原因, 解释层级...
  isActive: boolean;
  nodeCount: number;
}

// AI生成的节点数据
export interface AIGeneratedNode {
  level: number;
  content: string;
  hasChildren: boolean;
  parentId?: string;
}

// AI分析结果
export interface AIAnalysisResult {
  levelCount: number;
  levels: AILevel[];
  initialNodes: AIGeneratedNode[];
  originalPrompt: string;
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

// 画布快照相关类型
export interface CanvasSnapshot {
  version: string;
  createdAt: string;
  originalPrompt: string;
  levels: AILevel[];
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedPath: Array<{
    nodeId: string;
    level: number;
  }>;
  viewport?: Viewport;
  metadata: {
    title?: string;
    description?: string;
    nodeCount: number;
    levelCount: number;
    appVersion?: string;
  };
}

// 报告生成相关类型
export interface ReportGenerationRequest {
  chainContent: Array<{
    nodeId: string;
    content: string;
    level: number;
    levelDescription: string;
  }>;
  userInput?: string;
}
