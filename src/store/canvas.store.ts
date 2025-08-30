import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  CanvasNode,
  CanvasEdge,
  Viewport,
  SelectedPath,
  Snapshot,
  LoadingState,
  ErrorState,
  CanvasConfig,
  NodeContext,
  AILevel,
  AIAnalysisResult,
  KeywordNodeData,
  CanvasSnapshot
} from '@/types/canvas';
import { NodeExpansionResult } from '@/lib/ai/types';
import { geminiService } from '@/lib/ai/gemini';
import { CHATBOT_RESPONSE_TEMPLATE } from '@/lib/ai/prompts';
import { downloadFile, createSnapshotFilename } from '@/lib/utils/file';
// AI helper functions - using real Gemini API
const analyzeUserInput = async (userInput: string, existingLevels?: Array<{level: number, description: string}>) => {
  try {
    const result = await geminiService.analyzeAndGenerateLevels({ userInput, existingLevels });
    return {
      levelCount: result.levelCount,
      levels: result.levels.map(level => ({
        ...level,
        isActive: level.level === 1,
        nodeCount: level.level === 1 ? result.initialNodes.length : 0
      })),
      initialNodes: result.initialNodes,
      originalPrompt: userInput
    };
  } catch (error) {
    console.error('AI analysis failed, using fallback:', error);
    // 降级处理：返回默认结构
    return {
      levelCount: 3,
      levels: [
        { level: 1, label: 'L1', description: 'Surface Exploration', isActive: true, nodeCount: 2 },
        { level: 2, label: 'L2', description: 'Root Analysis', isActive: false, nodeCount: 0 },
        { level: 3, label: 'L3', description: 'Deep Solutions', isActive: false, nodeCount: 0 }
      ],
      initialNodes: [
        { level: 1, content: 'Surface phenomena', hasChildren: true },
        { level: 1, content: 'Related factors', hasChildren: true }
      ],
      originalPrompt: userInput
    };
  }
};

const expandNodeContent = async (
  nodeContent: string,
  nodeLevel: number,
  parentContext: string,
  userPrompt: string
): Promise<NodeExpansionResult> => {
  try {
    const result = await geminiService.expandNode({
      nodeContent,
      nodeLevel,
      parentContext,
      userPrompt
    });
    return result;
  } catch (error) {
    console.error('Node expansion failed, using fallback:', error);
    // Fallback: return default child nodes, generate different content based on level
    const fallbackContent = generateFallbackContent(nodeContent, nodeLevel);
    return {
      children: fallbackContent
    };
  }
};

// Function to generate fallback content
const generateFallbackContent = (nodeContent: string, nodeLevel: number): Array<{
  content: string;
  level: number;
  hasChildren: boolean;
}> => {
  const baseContent = nodeContent || 'complaint';

  switch (nodeLevel) {
    case 0: // Original node -> L1 (固定的投诉信问题)
      return [
        { content: 'What time?', level: 1, hasChildren: true },
        { content: 'Which place?', level: 1, hasChildren: true },
        { content: 'With who?', level: 1, hasChildren: true }
      ];
    case 1: // L1 -> L2 (固定的情感影响问题)
      return [
        { content: 'How did it affect you emotionally?', level: 2, hasChildren: true },
        { content: 'What inconvenience or harm did it cause?', level: 2, hasChildren: true },
        { content: 'How important was this to you?', level: 2, hasChildren: true }
      ];
    case 2: // L2 -> L3 (固定的解决方案问题)
      return [
        { content: 'What do you want them to do?', level: 3, hasChildren: false },
        { content: 'How soon do you expect a response?', level: 3, hasChildren: false },
        { content: 'Is there anything you\'d accept as an alternative?', level: 3, hasChildren: false }
      ];
    case 3: // L3 -> L4
      return [
        { content: `In-depth analysis of root causes and triggers of ${baseContent}`, level: 3, hasChildren: false },
        { content: `Explore relationship between ${baseContent} and personal values`, level: 3, hasChildren: false },
        { content: `Understanding how ${baseContent} hinders personal growth`, level: 3, hasChildren: false }
      ];
    default:
      return [
        { content: `${baseContent} - Option 1`, level: nodeLevel + 1, hasChildren: nodeLevel + 1 < 3 },
        { content: `${baseContent} - Option 2`, level: nodeLevel + 1, hasChildren: nodeLevel + 1 < 3 },
        { content: `${baseContent} - Option 3`, level: nodeLevel + 1, hasChildren: nodeLevel + 1 < 3 }
      ];
  }
};

const generateChatBotResponse = (levelCount: number): string => {
  return CHATBOT_RESPONSE_TEMPLATE(levelCount);
};

// 层级区域布局函数 - 只用于L2及后续层级
const getLevelAreaX = (level: number): number => {
  if (level <= 1) {
    // L1及之前保持原有逻辑，不使用此函数
    return 400; // L1区域起始位置
  }

  // L2开始使用固定区域布局
  const l1AreaX = 400;
  const levelWidth = 300;
  return l1AreaX + (level - 1) * levelWidth;
};

// 估算节点高度的函数 - 优化版本，支持投诉信问题节点
const estimateNodeHeight = (content: string, isExpanded: boolean = false, level?: number): number => {
  // 投诉信问题节点的特殊高度计算
  const isComplaintQuestion = (
    // L1问题
    (level === 1 && (content === 'What time?' || content === 'Which place?' || content === 'With who?')) ||
    // L2问题
    (level === 2 && (content === 'How did it affect you emotionally?' || content === 'What inconvenience or harm did it cause?' || content === 'How important was this to you?')) ||
    // L3问题
    (level === 3 && (content === 'What do you want them to do?' || content === 'How soon do you expect a response?' || content === 'Is there anything you\'d accept as an alternative?'))
  );

  if (isComplaintQuestion) {
    // 投诉信问题节点包含问题文本 + 多行文本域，需要更多空间
    return 120; // 问题文本(~20px) + 间距(8px) + 多行文本域(~60px) + padding(~32px)
  }

  const baseHeight = 50; // 最小高度
  const padding = 24; // 上下内边距 (12px * 2)
  const lineHeight = 19.6; // 14px * 1.4
  const contentWidth = 140; // 文本容器宽度（与KeywordNode中的contentWidth一致）

  if (!isExpanded && content.length <= 30) {
    // 短文本，不需要展开
    const lines = Math.ceil(content.length / 18); // 更精确的行数估算
    return Math.max(baseHeight, padding + lines * lineHeight);
  }

  if (!isExpanded) {
    // 长文本但未展开，使用固定的折叠高度
    return Math.max(baseHeight, padding + 98); // 98px是collapsed状态的max-height
  }

  // 展开状态，根据实际内容计算高度 - 更精确的计算
  const avgCharsPerLine = 16; // 考虑中英文混合，更保守的估算
  const estimatedLines = Math.ceil(content.length / avgCharsPerLine);

  // 考虑换行符的影响
  const actualLines = Math.max(estimatedLines, content.split('\n').length);

  const contentHeight = actualLines * lineHeight;
  const expandIndicatorHeight = 40; // 展开指示器和额外间距
  const extraPadding = 20; // 额外的安全边距

  return Math.max(baseHeight, padding + contentHeight + expandIndicatorHeight + extraPadding);
};

// 智能计算子节点垂直位置 - 考虑节点实际高度
const calculateChildVerticalPositions = (
  parentY: number,
  childCount: number,
  childContents: string[] = [],
  expandedStates: boolean[] = [],
  childLevel?: number // 新增参数：子节点的层级
): number[] => {
  if (childCount === 1) {
    return [parentY]; // 单个子节点直接对齐父节点
  }

  // 估算每个节点的高度 - 使用childLevel参数
  const nodeHeights = childContents.map((content, index) =>
    estimateNodeHeight(content, expandedStates[index] || false, childLevel)
  );

  // 计算最小间距（确保节点不重叠）- 为投诉信问题节点增加更多间距
  const baseMinSpacing = 60; // 基础最小间距，进一步增加到60，确保120px高度节点有足够间距
  const expandedNodeExtraSpacing = 40; // 展开节点的额外间距，增加到40

  // 计算总高度和位置
  let totalHeight = 0;
  const spacings: number[] = [];

  for (let i = 0; i < childCount - 1; i++) {
    const currentNodeHeight = nodeHeights[i];
    const nextNodeHeight = nodeHeights[i + 1];
    const currentExpanded = expandedStates[i] || false;
    const nextExpanded = expandedStates[i + 1] || false;

    // 检查是否是投诉信问题节点（高度为120px）
    const isComplaintNodes = currentNodeHeight >= 120 || nextNodeHeight >= 120;

    // 如果有展开节点，增加额外间距
    const extraSpacing = (currentExpanded || nextExpanded) ? expandedNodeExtraSpacing : 0;

    // 为投诉信问题节点提供额外间距
    const complaintExtraSpacing = isComplaintNodes ? 20 : 0;

    const requiredSpacing = Math.max(
      baseMinSpacing + extraSpacing + complaintExtraSpacing,
      (currentNodeHeight + nextNodeHeight) / 2 + baseMinSpacing + extraSpacing + complaintExtraSpacing
    );
    spacings.push(requiredSpacing);
    totalHeight += requiredSpacing;
  }

  // 计算起始位置（让中间节点与父节点对齐）
  const startY = parentY - totalHeight / 2;

  // 生成位置数组
  const positions: number[] = [startY];
  for (let i = 1; i < childCount; i++) {
    positions.push(positions[i - 1] + spacings[i - 1]);
  }

  return positions;
};

// 生成新层级描述的智能函数
const generateLevelDescription = async (newLevel: number, originalPrompt: string, existingLevels: AILevel[]): Promise<string> => {
  try {
    // 使用AI生成不重复的层级描述
    const existingDescriptions = existingLevels.map(l => ({ level: l.level, description: l.description }));
    const result = await geminiService.analyzeAndGenerateLevels({
      userInput: originalPrompt,
      existingLevels: existingDescriptions
    });

    // 找到对应层级的描述
    const targetLevel = result.levels.find(l => l.level === newLevel);
    if (targetLevel) {
      return targetLevel.description;
    }
  } catch (error) {
    console.error('AI level description generation failed:', error);
  }

  // Fallback: Use smart default descriptions
  const levelDescriptions = [
    'Surface Exploration', 'Root Analysis', 'Deep Solutions'
  ];

  // Ensure no duplication with existing descriptions
  const existingDescriptions = existingLevels.map(l => l.description);
  let description = levelDescriptions[newLevel - 1] || `Level ${newLevel}`;

  // If duplicate, try other descriptions
  if (existingDescriptions.includes(description)) {
    const alternatives = ['Deep Analysis', 'Advanced Exploration', 'System Thinking'];
    for (const alt of alternatives) {
      if (!existingDescriptions.includes(alt)) {
        description = alt;
        break;
      }
    }
  }

  return description;
};

// 使用constants中的函数
import { getNodeBackgroundColor } from '@/lib/canvas/constants';

interface CanvasStore {
  // Core data
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: Viewport;
  selectedPath: SelectedPath | null;

  // AI-related state
  levels: AILevel[];
  currentLevel: number;
  originalPrompt: string;
  isAIGenerating: boolean;

  // Mode management
  mode: 'inquiry' | 'writing';

  // Node selection state
  selectedNodesByLevel: Record<number, string | null>; // Each level can only select one node

  // Node expansion state - stores expansion state for each node
  nodeExpandedStates: Record<string, boolean>;

  // Version management
  snapshots: Snapshot[];
  currentSnapshotId: string | null;

  // UI state
  loading: LoadingState;
  error: ErrorState | null;
  config: CanvasConfig;

  // Report data storage (for download buttons)
  lastGeneratedReport: {
    content: string;
    snapshot: CanvasSnapshot;
    timestamp: number;
    dateStr: string;
  } | null;
  
  // 基础操作
  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  setViewport: (viewport: Viewport) => void;
  
  // 节点操作
  addNode: (node: CanvasNode) => void;
  updateNode: (nodeId: string, updates: Partial<CanvasNode>) => void;
  updateNodeContent: (nodeId: string, newContent: string) => void;
  deleteNode: (nodeId: string) => void;
  
  // 边操作
  addEdge: (edge: CanvasEdge) => void;
  deleteEdge: (edgeId: string) => void;
  
  // 路径选择
  selectPath: (nodeIds: string[]) => void;
  clearSelection: () => void;

  // 模式管理
  setMode: (mode: 'inquiry' | 'writing') => void;

  // 节点选择
  selectNode: (nodeId: string, level: number) => void;
  clearNodeSelection: (level?: number) => void;
  isNodeSelected: (nodeId: string) => boolean;
  getHighlightedNodes: () => string[]; // 获取应该高亮的节点列表

  // 获取当前选中链路的内容
  getSelectedChainContent: () => Array<{
    nodeId: string;
    content: string;
    level: number;
    levelDescription: string;
  }>;

  // 布局管理
  relayoutSiblingNodes: (nodeId: string) => void;

  // 节点展开状态管理
  setNodeExpanded: (nodeId: string, expanded: boolean) => void;
  isNodeExpanded: (nodeId: string) => boolean;

  // AI层级管理
  analyzeUserInput: (userInput: string) => Promise<string>;
  setLevels: (levels: AILevel[]) => void;
  setCurrentLevel: (level: number) => void;
  updateLevelNodeCount: (level: number, count: number) => void;
  insertLevel: (afterLevel: number) => Promise<void>;
  deleteLevel: (level: number) => void;
  editLevel: (level: number, newDescription: string) => void;

  // AI 生成相关
  generateChildren: (nodeId: string, context: NodeContext) => Promise<void>;
  renewNode: (nodeId: string, context: NodeContext) => Promise<void>;
  generateInitialNodes: (analysisResult: AIAnalysisResult) => void;

  // 同层级节点生成
  generateSiblingNode: (nodeId: string, position: 'above' | 'below') => Promise<void>;

  // 报告生成
  generateReport: (userInput?: string) => Promise<string>;
  generateReportWithSnapshot: (userInput?: string) => Promise<string>;

  // 手动下载方法
  downloadMarkdownReport: () => void;
  downloadSnapshotFile: () => void;

  // 画布快照导出导入
  exportSnapshot: (title?: string, description?: string) => void;
  importSnapshot: (snapshot: CanvasSnapshot) => void;
  
  // 版本管理
  saveSnapshot: (name: string, description?: string) => Promise<void>;
  loadSnapshot: (snapshotId: string) => void;
  deleteSnapshot: (snapshotId: string) => void;
  
  // 错误处理
  setError: (error: ErrorState | null) => void;
  clearError: () => void;
  
  // 加载状态
  setLoading: (loading: Partial<LoadingState>) => void;
  
  // 重置
  reset: () => void;
}

// 调整初始viewport，让原始区域(x=50)和前3个层级(x=400,700,1000)都可见
// 原始区域：x=50, width≈100px
// L1-L3区域：x=400到x=1300, width=900px
// 总显示范围：x=50到x=1300，总宽度1250px
// 设置初始x为-150，让布局更协调
const defaultViewport: Viewport = { x: -150, y: 0, zoom: 1 };

const defaultConfig: CanvasConfig = {
  maxZoom: 2,
  minZoom: 0.1,
  defaultViewport,
  nodeSpacing: {
    horizontal: 200,
    vertical: 100,
  },
  autoLayout: {
    direction: 'TB',
    rankSeparation: 100,
    nodeSeparation: 200,
  },
};

const defaultLoadingState: LoadingState = {
  isGenerating: false,
  renewingNodeId: null,
  isSaving: false,
  isLoading: false,
};

export const useCanvasStore = create<CanvasStore>()(
  immer((set, get) => ({
    // Initial state
    nodes: [],
    edges: [],
    viewport: defaultViewport,
    selectedPath: null,

    // AI-related initial state - empty when user hasn't operated
    levels: [],
    currentLevel: 1,
    originalPrompt: '',
    isAIGenerating: false,

    // Mode management
    mode: 'inquiry',

    // Node selection state
    selectedNodesByLevel: {},

    // Node expansion state
    nodeExpandedStates: {},

    snapshots: [],
    currentSnapshotId: null,
    loading: defaultLoadingState,
    error: null,
    config: defaultConfig,
    lastGeneratedReport: null,

    // Basic operations
    setNodes: (nodes) => set((state) => {
      state.nodes = nodes;
    }),

    setEdges: (edges) => set((state) => {
      state.edges = edges;
    }),

    setViewport: (viewport) => set((state) => {
      state.viewport = viewport;
    }),

    // 节点操作
    addNode: (node) => set((state) => {
      state.nodes.push(node);
    }),

    updateNode: (nodeId, updates) => set((state) => {
      const nodeIndex = state.nodes.findIndex(n => n.id === nodeId);
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex] = { ...state.nodes[nodeIndex], ...updates };
      }
    }),

    updateNodeContent: (nodeId, newContent) => set((state) => {
      const nodeIndex = state.nodes.findIndex(n => n.id === nodeId);
      if (nodeIndex !== -1 && state.nodes[nodeIndex].data) {
        state.nodes[nodeIndex].data.content = newContent;
        console.log('✅ Node content updated:', nodeId, newContent);
      }
    }),

    deleteNode: (nodeId) => set((state) => {
      const nodeToDelete = state.nodes.find(n => n.id === nodeId);
      if (!nodeToDelete) return;

      // 递归删除所有子节点
      const deleteNodeAndChildren = (id: string) => {
        // 找到所有子节点
        const childNodes = state.nodes.filter(n => n.data && n.data.parentId === id);

        // 递归删除子节点
        childNodes.forEach(child => {
          deleteNodeAndChildren(child.id);
        });

        // 删除当前节点
        state.nodes = state.nodes.filter(n => n.id !== id);

        // 删除相关的边
        state.edges = state.edges.filter(e => e.source !== id && e.target !== id);
      };

      // 开始递归删除
      deleteNodeAndChildren(nodeId);

      // 清除节点选择状态
      if (nodeToDelete.data && nodeToDelete.data.level) {
        const level = nodeToDelete.data.level;
        if (state.selectedNodesByLevel[level] === nodeId) {
          delete state.selectedNodesByLevel[level];
        }
      }

      // 重新布局剩余的同层级节点
      if (nodeToDelete.data && nodeToDelete.data.parentId) {
        // 找到同层级的兄弟节点
        const siblingNodes = state.nodes.filter(n =>
          n.data &&
          n.data.level === nodeToDelete.data.level &&
          n.data.parentId === nodeToDelete.data.parentId
        );

        // 重新计算兄弟节点的位置
        if (siblingNodes.length > 0) {
          const parentNode = state.nodes.find(n => n.id === nodeToDelete.data.parentId);
          if (parentNode) {
            // 计算新的垂直位置
            const yPositions = calculateChildVerticalPositions(siblingNodes.length, parentNode.position.y);

            siblingNodes.forEach((node, index) => {
              const nodeIndex = state.nodes.findIndex(n => n.id === node.id);
              if (nodeIndex !== -1) {
                state.nodes[nodeIndex].position.y = yPositions[index];
              }
            });
          }
        }
      }

      console.log('🗑️ Node and its children deleted:', nodeId);
    }),

    // 边操作
    addEdge: (edge) => set((state) => {
      state.edges.push(edge);
    }),

    deleteEdge: (edgeId) => set((state) => {
      state.edges = state.edges.filter(e => e.id !== edgeId);
    }),

    // 路径选择
    selectPath: (nodeIds) => set((state) => {
      const nodes = nodeIds.map(id => state.nodes.find(n => n.id === id)).filter(Boolean) as CanvasNode[];
      state.selectedPath = {
        nodeIds,
        nodes,
        isComplete: nodes.length === nodeIds.length,
      };
    }),

    clearSelection: () => set((state) => {
      state.selectedPath = null;
    }),

    // 模式管理
    setMode: (mode) => set((state) => {
      state.mode = mode;

      // 切换到写作模式时，清除所有节点选择
      if (mode === 'writing') {
        state.selectedNodesByLevel = {};
      }
    }),

    // 重新布局同层级节点
    relayoutSiblingNodes: (nodeId: string) => set((state) => {
      const targetNode = state.nodes.find(n => n.id === nodeId);
      if (!targetNode || !targetNode.data.parentId) return;

      // 找到所有同级节点
      const siblingNodes = state.nodes.filter(n =>
        n.data.parentId === targetNode.data.parentId && n.data.level === targetNode.data.level
      );

      if (siblingNodes.length <= 1) return;

      // 获取父节点位置
      const parentNode = state.nodes.find(n => n.id === targetNode.data.parentId);
      if (!parentNode) return;

      // 重新计算位置，使用实际的展开状态
      const childContents = siblingNodes.map(node => node.data.content);
      const expandedStates = siblingNodes.map(node => state.nodeExpandedStates[node.id] || false);

      const yPositions = calculateChildVerticalPositions(
        parentNode.position.y,
        siblingNodes.length,
        childContents,
        expandedStates
      );

      // 更新节点位置
      siblingNodes.forEach((node, index) => {
        const nodeIndex = state.nodes.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          state.nodes[nodeIndex].position.y = yPositions[index];
        }
      });
    }),

    // 节点选择管理
    selectNode: (nodeId, level) => set((state) => {
      // 清除该层级之前的选择
      state.selectedNodesByLevel[level] = nodeId;

      // 调试信息
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 Node selected:', { nodeId, level, selectedNodesByLevel: state.selectedNodesByLevel });
      }
    }),

    clearNodeSelection: (level) => set((state) => {
      if (level !== undefined) {
        // 清除指定层级的选择
        delete state.selectedNodesByLevel[level];
      } else {
        // 清除所有选择
        state.selectedNodesByLevel = {};
      }
    }),

    isNodeSelected: (nodeId) => {
      const state = get();
      return Object.values(state.selectedNodesByLevel).includes(nodeId);
    },

    // 获取应该高亮的节点列表
    getHighlightedNodes: () => {
      const state = get();
      const { mode, selectedNodesByLevel, nodes } = state;

      // 调试信息
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 getHighlightedNodes called:', { mode, selectedNodesByLevel });
      }

      if (mode === 'inquiry') {
        // 探索模式：只高亮最后选中的节点
        const selectedLevels = Object.keys(selectedNodesByLevel)
          .map(level => parseInt(level))
          .sort((a, b) => b - a); // 降序排列，获取最高层级

        if (selectedLevels.length > 0) {
          const highestLevel = selectedLevels[0];
          const nodeId = selectedNodesByLevel[highestLevel];
          const result = nodeId ? [nodeId] : [];

          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Inquiry mode highlight:', { highestLevel, nodeId, result });
          }

          return result;
        }
        return [];
      } else {
        // 写作模式：高亮整条选择链路
        const selectedLevels = Object.keys(selectedNodesByLevel)
          .map(level => parseInt(level))
          .sort((a, b) => a - b); // 升序排列

        if (selectedLevels.length === 0) return [];

        // 获取选中的节点链路
        const selectedChain: string[] = [];

        // 找到最高层级的选中节点
        const highestLevel = Math.max(...selectedLevels);
        const targetNodeId = selectedNodesByLevel[highestLevel];

        if (!targetNodeId) return [];

        // 从目标节点向上追溯到根节点
        let currentNodeId = targetNodeId;
        while (currentNodeId) {
          selectedChain.unshift(currentNodeId);
          const currentNode = nodes.find(n => n.id === currentNodeId);
          if (!currentNode || !currentNode.data.parentId) break;
          currentNodeId = currentNode.data.parentId;
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('✍️ Writing mode highlight chain:', { targetNodeId, selectedChain });
        }

        return selectedChain;
      }
    },

    // 获取当前选中链路的内容
    getSelectedChainContent: () => {
      const state = get();
      const { mode, selectedNodesByLevel, nodes, levels, originalPrompt } = state;

      // 只在写作模式下提供链路内容
      if (mode !== 'writing') {
        return [];
      }

      // 获取高亮的节点列表
      const highlightedNodeIds = state.getHighlightedNodes();

      if (highlightedNodeIds.length === 0) {
        return [];
      }

      // 构建链路内容数组
      const chainContent: Array<{
        nodeId: string;
        content: string;
        level: number;
        levelDescription: string;
      }> = [];

      // 添加原始问题作为L0层级
      chainContent.push({
        nodeId: 'original-prompt',
        content: originalPrompt,
        level: 0,
        levelDescription: 'Original Question'
      });

      // 按层级顺序添加选中的节点
      highlightedNodeIds.forEach(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (node && node.data) {
          const levelInfo = levels.find(l => l.level === node.data.level);
          chainContent.push({
            nodeId: node.id,
            content: node.data.content,
            level: node.data.level,
            levelDescription: levelInfo?.description || `L${node.data.level}`
          });
        }
      });

      // 按层级排序
      chainContent.sort((a, b) => a.level - b.level);

      if (process.env.NODE_ENV === 'development') {
        console.log('📋 Selected chain content:', chainContent);
      }

      return chainContent;
    },

    // 节点展开状态管理
    setNodeExpanded: (nodeId, expanded) => set((state) => {
      state.nodeExpandedStates[nodeId] = expanded;

      // 当展开状态改变时，重新布局同级节点
      const targetNode = state.nodes.find(n => n.id === nodeId);
      if (targetNode && targetNode.data.parentId) {
        // 找到所有同级节点
        const siblingNodes = state.nodes.filter(n =>
          n.data.parentId === targetNode.data.parentId && n.data.level === targetNode.data.level
        );

        if (siblingNodes.length > 1) {
          // 获取父节点位置
          const parentNode = state.nodes.find(n => n.id === targetNode.data.parentId);
          if (parentNode) {
            // 重新计算位置
            const childContents = siblingNodes.map(node => node.data.content);
            const expandedStates = siblingNodes.map(node => state.nodeExpandedStates[node.id] || false);

            const yPositions = calculateChildVerticalPositions(
              parentNode.position.y,
              siblingNodes.length,
              childContents,
              expandedStates
            );

            // 更新节点位置
            siblingNodes.forEach((node, index) => {
              const nodeIndex = state.nodes.findIndex(n => n.id === node.id);
              if (nodeIndex !== -1) {
                state.nodes[nodeIndex].position.y = yPositions[index];
              }
            });
          }
        }
      }
    }),

    isNodeExpanded: (nodeId) => {
      const state = get();
      return state.nodeExpandedStates[nodeId] || false;
    },

    // AI层级管理
    analyzeUserInput: async (userInput: string) => {
      console.log('🏪 Store analyzeUserInput called with:', userInput);

      set((state) => {
        state.isAIGenerating = true;
        state.originalPrompt = userInput;
      });

      try {
        console.log('🔄 Calling local analyzeUserInput function...');
        const state = get();
        const existingLevels = state.levels.map(l => ({ level: l.level, description: l.description }));
        const analysisResult = await analyzeUserInput(userInput, existingLevels);
        console.log('📊 Analysis result:', analysisResult);

        set((state) => {
          // 设置层级信息
          state.levels = analysisResult.levels.map((level: {
            level: number;
            label: string;
            description: string;
            isActive: boolean;
            nodeCount: number;
          }) => ({
            ...level,
            isActive: level.level === 1,
            nodeCount: level.level === 1 ? analysisResult.initialNodes.length : 0
          }));

          state.currentLevel = 1;

          // 设置原始提示
          state.originalPrompt = analysisResult.originalPrompt;
        });

        // 初始化画布，创建节点
        console.log('🚀 Calling generateInitialNodes...');
        useCanvasStore.getState().generateInitialNodes(analysisResult);

        return generateChatBotResponse(analysisResult.levelCount);

      } catch (error) {
        set((state) => {
          state.error = {
            message: error instanceof Error ? error.message : 'AI analysis failed',
            type: 'generation',
            timestamp: new Date(),
          };
        });
        throw error;
      } finally {
        set((state) => {
          state.isAIGenerating = false;
        });
      }
    },

    setLevels: (levels) => set((state) => {
      state.levels = levels;
    }),

    setCurrentLevel: (level) => set((state) => {
      state.currentLevel = level;
      // 更新层级激活状态
      state.levels.forEach(l => {
        l.isActive = l.level === level;
      });
    }),

    updateLevelNodeCount: (level, count) => set((state) => {
      const levelIndex = state.levels.findIndex(l => l.level === level);
      if (levelIndex !== -1) {
        state.levels[levelIndex].nodeCount = count;
      }
    }),

    // 插入新层级
    insertLevel: async (afterLevel: number) => {
      console.log('🔄 Inserting level after:', afterLevel);

      set((state) => {
        state.isAIGenerating = true;
      });

      try {
        // 生成新层级的描述
        const newLevelDescription = await generateLevelDescription(afterLevel + 1, get().originalPrompt, get().levels);

        set((state) => {
          // 将所有大于afterLevel的层级编号+1
          state.levels = state.levels.map(level => ({
            ...level,
            level: level.level > afterLevel ? level.level + 1 : level.level,
            label: level.level > afterLevel ? `L${level.level + 1}` : level.label,
            isActive: false // 重置所有层级的激活状态
          }));

          // 插入新层级
          const newLevel: AILevel = {
            level: afterLevel + 1,
            label: `L${afterLevel + 1}`,
            description: newLevelDescription,
            isActive: true,
            nodeCount: 0
          };

          // 在正确位置插入新层级
          const insertIndex = state.levels.findIndex(l => l.level > afterLevel + 1);
          if (insertIndex === -1) {
            state.levels.push(newLevel);
          } else {
            state.levels.splice(insertIndex, 0, newLevel);
          }

          // 设置当前层级为新插入的层级
          state.currentLevel = afterLevel + 1;

          // 更新所有节点的层级编号
          state.nodes = state.nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              level: node.data.level > afterLevel ? node.data.level + 1 : node.data.level
            }
          }));
        });

        console.log('✅ Level inserted successfully');
      } catch (error) {
        console.error('❌ Failed to insert level:', error);
      } finally {
        set((state) => {
          state.isAIGenerating = false;
        });
      }
    },

    // 删除层级
    deleteLevel: (levelToDelete: number) => set((state) => {
      console.log('🗑️ Deleting level:', levelToDelete);

      // 不能删除最后一个层级
      if (state.levels.length <= 1) {
        console.warn('Cannot delete the last level');
        return;
      }

      // 删除指定层级
      state.levels = state.levels.filter(level => level.level !== levelToDelete);

      // 重新编号所有大于被删除层级的层级
      state.levels = state.levels.map(level => ({
        ...level,
        level: level.level > levelToDelete ? level.level - 1 : level.level,
        label: level.level > levelToDelete ? `L${level.level - 1}` : level.label
      }));

      // 删除该层级的所有节点
      state.nodes = state.nodes.filter(node => node.data.level !== levelToDelete);

      // 更新所有大于被删除层级的节点的层级编号
      state.nodes = state.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          level: node.data.level > levelToDelete ? node.data.level - 1 : node.data.level
        }
      }));

      // 调整当前层级
      if (state.currentLevel === levelToDelete) {
        // 如果删除的是当前层级，切换到第一个层级
        state.currentLevel = 1;
      } else if (state.currentLevel > levelToDelete) {
        // 如果当前层级在被删除层级之后，编号减1
        state.currentLevel = state.currentLevel - 1;
      }

      console.log('✅ Level deleted successfully');
    }),

    // 编辑层级描述
    editLevel: (level: number, newDescription: string) => set((state) => {
      console.log('✏️ Editing level:', level, 'to:', newDescription);

      const levelIndex = state.levels.findIndex(l => l.level === level);
      if (levelIndex !== -1) {
        state.levels[levelIndex].description = newDescription;
        console.log('✅ Level description updated successfully');
      }
    }),

    generateInitialNodes: (analysisResult) => set((state) => {
      // 清空现有节点
      state.nodes = [];
      state.edges = [];

      // 不创建原始节点在React Flow中，使用独立组件
      const originalPrompt = state.originalPrompt;
      const nodes: CanvasNode[] = [];

      console.log('🎯 Original prompt for independent component:', originalPrompt);

      // 不自动生成初始节点，等待用户点击"生成下一层级"
      state.nodes = nodes; // 只设置空的nodes数组
      state.edges = []; // 清空edges
    }),

    // AI 生成相关 (占位符实现)
    generateChildren: async (nodeId, context) => {
      set((state) => {
        state.loading.isGenerating = true;
        // 更新节点生成状态
        const nodeIndex = state.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex !== -1 && state.nodes[nodeIndex].data) {
          state.nodes[nodeIndex].data.isGenerating = true;
        }
      });

      try {
        // 特殊处理原始节点的生成
        const isOriginalNode = nodeId === 'original-node' || nodeId.startsWith('original-') || nodeId === 'original-independent-node';
        if (isOriginalNode) {
          console.log('🎯 Generating children for original node - using fixed complaint questions');

          // 为投诉信生成固定的L1层级问题，不使用AI
          const expansionResult = {
            children: [
              { content: 'What time?', level: 1, hasChildren: false },
              { content: 'Which place?', level: 1, hasChildren: false },
              { content: 'With who?', level: 1, hasChildren: false }
            ]
          };

          console.log('📊 Fixed L1 questions:', expansionResult);
          console.log('📊 Children count:', expansionResult.children?.length);
          console.log('📊 Children data:', expansionResult.children);

          set((state) => {
            console.log('🔄 Before adding nodes, current nodes count:', state.nodes.length);

            // 计算L1区域的位置
            const l1AreaX = 400; // L1区域开始位置
            const l1AreaWidth = 300; // L1区域宽度
            const canvasCenterY = 300; // 画布垂直居中

            // 使用智能布局计算L1节点位置
            const childContents = expansionResult.children.map((child: { content: string; level: number; hasChildren: boolean }) => child.content);
            const expandedStates = expansionResult.children.map(() => false); // 默认都是收缩状态
            const yPositions = calculateChildVerticalPositions(
              canvasCenterY,
              expansionResult.children.length,
              childContents,
              expandedStates,
              1 // L1层级
            );

            // 生成3个选项节点，使用智能垂直布局
            const childNodes = expansionResult.children.map((childData: {
              content: string;
              level: number;
              hasChildren: boolean;
            }, index: number) => {
              const newNode = {
                id: `l1-node-${Date.now()}-${index}`,
                type: 'keyword' as const,
                position: {
                  x: l1AreaX + l1AreaWidth / 2 - 90, // 在L1区域中心，节点宽度180px的一半
                  y: yPositions[index] // 使用智能计算的垂直位置
                },
                data: {
                  id: `l1-node-${Date.now()}-${index}`,
                  content: childData.content,
                  level: 1, // L1层级
                  parentId: nodeId, // 使用实际的原始节点ID
                  type: 'keyword' as const,
                  canExpand: true, // L1节点可以展开到L2（虽然暂时不用AI生成）
                  hasChildren: false,
                  isGenerating: false,
                  isSelected: false,
                  // 添加投诉信相关的数据结构
                  questionText: childData.content, // 存储问题文本
                  userInput: '', // 用户输入的答案
                } as KeywordNodeData,
                style: {
                  backgroundColor: getNodeBackgroundColor(1),
                }
              };
              console.log('🆕 Creating new node:', newNode);
              return newNode;
            });

            // 不创建React Flow连接线，只使用按钮连线
            state.nodes.push(...childNodes);
            // 确保没有边
            state.edges = [];
            console.log('✅ After adding nodes, current nodes count:', state.nodes.length);
            console.log('📊 Child nodes data:', childNodes);

            // 更新L1层级的节点数量
            const l1Level = state.levels.find(l => l.level === 1);
            if (l1Level) {
              l1Level.nodeCount = childNodes.length;
              console.log('📈 Updated L1 level node count:', l1Level.nodeCount);
            }
          });

          console.log('🎉 Original node generation completed');
          return;
        }

        // 处理其他节点的生成
        const parentNode = useCanvasStore.getState().nodes.find(n => n.id === nodeId);
        if (!parentNode || !parentNode.data) {
          throw new Error('Parent node not found');
        }

        // 检查是否是L1或L2节点，使用固定问题
        const isL1Node = parentNode.data.level === 1;
        const isL2Node = parentNode.data.level === 2;

        let expansionResult;
        if (isL1Node || isL2Node) {
          console.log(`🎯 Generating fixed questions for L${parentNode.data.level + 1} level`);
          // 使用固定问题，不调用AI，包装成统一格式
          const fixedQuestions = generateFallbackContent('', parentNode.data.level);
          expansionResult = { children: fixedQuestions };
        } else {
          // L3及以上层级使用AI生成
          expansionResult = await expandNodeContent(
            parentNode.data.content,
            parentNode.data.level,
            context.parentContent || '',
            useCanvasStore.getState().originalPrompt
          );
        }

        set((state) => {
          const parentNodeIndex = state.nodes.findIndex(n => n.id === nodeId);
          if (parentNodeIndex === -1) return;

          const parentNode = state.nodes[parentNodeIndex];
          const childLevel = parentNode.data.level + 1;

          // 计算子节点位置 - 使用智能布局，考虑节点实际高度
          const levelAreaX = getLevelAreaX(childLevel);
          const levelCenterX = levelAreaX + 150; // 层级区域中心

          // 提取子节点内容和默认展开状态
          const childContents = expansionResult.children.map((child: { content: string; level: number; hasChildren: boolean }) => child.content);
          const expandedStates = expansionResult.children.map(() => false); // 默认都是收缩状态

          const yPositions = calculateChildVerticalPositions(
            parentNode.position.y,
            expansionResult.children.length,
            childContents,
            expandedStates,
            childLevel // 传入子节点层级
          );

          // 生成子节点
          const childNodes = expansionResult.children.map((childData: {
            content: string;
            level: number;
            hasChildren: boolean;
          }, index: number) => ({
            id: `${nodeId}-child-${Date.now()}-${index}`,
            type: 'keyword' as const,
            position: {
              x: levelCenterX - 90, // 节点宽度180px的一半，在层级区域中心
              y: yPositions[index] // 使用计算好的垂直位置
            },
            data: {
              id: `${nodeId}-child-${Date.now()}-${index}`,
              content: childData.content,
              level: childLevel,
              parentId: nodeId,
              type: 'keyword' as const,
              canExpand: childLevel < 3, // L1和L2可以展开，L3不能展开
              hasChildren: childLevel < 3,
              isGenerating: false,
              isSelected: false,
              // 为投诉信问题节点添加特殊字段
              ...(childLevel <= 3 && {
                questionText: childData.content, // 存储问题文本
                userInput: '', // 用户输入的答案
              }),
            } as KeywordNodeData,
            style: {
              backgroundColor: getNodeBackgroundColor(childLevel),
            }
          }));

          // 添加子节点到画布
          state.nodes.push(...childNodes);

          // 确保没有React Flow边，只使用按钮连线
          state.edges = [];

          // 不创建React Flow的连接边，只使用按钮连线
          // const childEdges = childNodes.map((childNode: CanvasNode) => ({
          //   id: `edge-${nodeId}-${childNode.id}`,
          //   source: nodeId,
          //   target: childNode.id,
          //   type: 'default' as const,
          // }));
          // state.edges.push(...childEdges);

          // 更新层级节点数量
          const levelIndex = state.levels.findIndex(l => l.level === childLevel);
          if (levelIndex !== -1) {
            state.levels[levelIndex].nodeCount += childNodes.length;
          }

          // 更新父节点状态 - 只更新hasChildren，isGenerating在finally中统一处理
          if (state.nodes[parentNodeIndex].data) {
            state.nodes[parentNodeIndex].data.hasChildren = true;
          }
        });

      } catch (error) {
        set((state) => {
          state.error = {
            message: error instanceof Error ? error.message : 'Generation failed',
            type: 'generation',
            nodeId,
            timestamp: new Date(),
          };

          // 重置节点生成状态
          const nodeIndex = state.nodes.findIndex(n => n.id === nodeId);
          if (nodeIndex !== -1 && state.nodes[nodeIndex].data) {
            state.nodes[nodeIndex].data.isGenerating = false;
          }
        });
      } finally {
        set((state) => {
          state.loading.isGenerating = false;
          // 重置节点生成状态
          const nodeIndex = state.nodes.findIndex(n => n.id === nodeId);
          if (nodeIndex !== -1 && state.nodes[nodeIndex].data) {
            state.nodes[nodeIndex].data.isGenerating = false;
          }
        });
      }
    },

    renewNode: async (nodeId, context) => {
      set((state) => {
        state.loading.renewingNodeId = nodeId;
      });
      
      try {
        // TODO: 实现实际的节点更新逻辑
        console.log('Renewing node:', nodeId, context);
        
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        set((state) => {
          state.error = {
            message: error instanceof Error ? error.message : 'Renewal failed',
            type: 'generation',
            nodeId,
            timestamp: new Date(),
          };
        });
      } finally {
        set((state) => {
          state.loading.renewingNodeId = null;
        });
      }
    },

    // 生成同层级节点
    generateSiblingNode: async (nodeId: string, position: 'above' | 'below') => {
      const state = get();
      const targetNode = state.nodes.find(n => n.id === nodeId);

      if (!targetNode || !targetNode.data) {
        console.error('Target node not found:', nodeId);
        return;
      }

      set((state) => {
        state.isAIGenerating = true;
      });

      try {
        // 获取同层级的兄弟节点内容
        const siblingNodes = state.nodes.filter(n =>
          n.data &&
          n.data.level === targetNode.data.level &&
          n.data.parentId === targetNode.data.parentId
        );

        const siblingContents = siblingNodes.map(n => n.data.content);

        // 使用AI生成新的同层级内容
        const expansionResult = await expandNodeContent(
          targetNode.data.content,
          targetNode.data.level - 1, // 传入父级层级
          targetNode.data.parentId ?
            state.nodes.find(n => n.id === targetNode.data.parentId)?.data?.content || '' :
            state.originalPrompt,
          state.originalPrompt
        );

        if (expansionResult.children && expansionResult.children.length > 0) {
          // 选择第一个生成的内容作为新的同层级节点
          const newContent = expansionResult.children[0];

          // 计算新节点的位置
          const targetPosition = targetNode.position;
          const verticalOffset = position === 'above' ? -80 : 80;

          const newNode = {
            id: `${nodeId}-sibling-${Date.now()}`,
            type: 'keyword' as const,
            position: {
              x: targetPosition.x,
              y: targetPosition.y + verticalOffset
            },
            data: {
              id: `${nodeId}-sibling-${Date.now()}`,
              content: newContent.content,
              level: targetNode.data.level,
              parentId: targetNode.data.parentId,
              type: 'keyword' as const,
              canExpand: targetNode.data.canExpand,
              hasChildren: false,
              isGenerating: false,
              isSelected: false,
            } as KeywordNodeData,
            style: {
              backgroundColor: getNodeBackgroundColor(targetNode.data.level),
            }
          };

          // 添加新节点和边
          set((state) => {
            // 添加新节点
            state.nodes.push(newNode);

            // 如果有父节点，添加连接边
            if (targetNode.data.parentId) {
              const newEdge = {
                id: `edge-${targetNode.data.parentId}-${newNode.id}`,
                source: targetNode.data.parentId,
                target: newNode.id,
                type: 'default' as const,
                animated: false,
                style: { stroke: '#65f0a3', strokeWidth: 2 }
              };
              state.edges.push(newEdge);
            }
          });

          // 重新布局同层级节点
          get().relayoutSiblingNodes(nodeId);

          console.log('✅ Sibling node generated successfully');
        }
      } catch (error) {
        console.error('Sibling node generation failed:', error);
      } finally {
        set((state) => {
          state.isAIGenerating = false;
        });
      }
    },

    // 版本管理
    saveSnapshot: async (name, description) => {
      set((state) => {
        state.loading.isSaving = true;
      });

      try {
        set((state) => {
          const snapshot: Snapshot = {
            id: `snapshot-${Date.now()}`,
            name,
            description,
            nodes: [...state.nodes] as CanvasNode[],
            edges: [...state.edges] as CanvasEdge[],
            viewport: { ...state.viewport },
            selectedPath: state.selectedPath ? { ...state.selectedPath } : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          state.snapshots.push(snapshot);
          state.currentSnapshotId = snapshot.id;
        });
        
      } catch (error) {
        set((state) => {
          state.error = {
            message: error instanceof Error ? error.message : 'Save failed',
            type: 'storage',
            timestamp: new Date(),
          };
        });
      } finally {
        set((state) => {
          state.loading.isSaving = false;
        });
      }
    },

    loadSnapshot: (snapshotId) => set((state) => {
      const snapshot = state.snapshots.find(s => s.id === snapshotId);
      if (snapshot) {
        state.nodes = [...snapshot.nodes];
        state.edges = [...snapshot.edges];
        state.viewport = { ...snapshot.viewport };
        state.selectedPath = snapshot.selectedPath ? { ...snapshot.selectedPath } : null;
        state.currentSnapshotId = snapshotId;
      }
    }),

    deleteSnapshot: (snapshotId) => set((state) => {
      state.snapshots = state.snapshots.filter(s => s.id !== snapshotId);
      if (state.currentSnapshotId === snapshotId) {
        state.currentSnapshotId = null;
      }
    }),

    // 错误处理
    setError: (error) => set((state) => {
      state.error = error;
    }),

    clearError: () => set((state) => {
      state.error = null;
    }),

    // 加载状态
    setLoading: (loading) => set((state) => {
      state.loading = { ...state.loading, ...loading };
    }),

    // 重置
    reset: () => set((state) => {
      state.nodes = [];
      state.edges = [];
      state.viewport = defaultViewport;
      state.selectedPath = null;

      // 重置AI相关状态
      state.levels = [];
      state.currentLevel = 1;
      state.originalPrompt = '';
      state.isAIGenerating = false;

      // 重置模式
      state.mode = 'inquiry';

      // 重置节点选择状态
      state.selectedNodesByLevel = {};

      state.loading = defaultLoadingState;
      state.error = null;
    }),

    // 报告生成
    generateReport: async (userInput?: string) => {
      const state = get();

      // 检查是否在写作模式
      if (state.mode !== 'writing') {
        throw new Error('Report generation is only available in writing mode');
      }

      // 获取链路内容
      const chainContent = state.getSelectedChainContent();

      if (chainContent.length === 0) {
        throw new Error('Please select a complete thinking chain first');
      }

      set((state) => {
        state.isAIGenerating = true;
      });

      try {
        const result = await geminiService.generateReport({
          chainContent,
          userInput
        });

        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Report generated:', result.metadata);
        }

        return result.report;
      } catch (error) {
        console.error('Report generation failed:', error);
        throw error;
      } finally {
        set((state) => {
          state.isAIGenerating = false;
        });
      }
    },

    // 生成报告并准备快照数据（不自动下载）
    generateReportWithSnapshot: async (userInput?: string) => {
      const state = get();
      const chainContent = state.getSelectedChainContent();

      if (chainContent.length === 0) {
        throw new Error('请先选择完整的思维链路');
      }

      set((state) => {
        state.isAIGenerating = true;
      });

      try {
        // 生成报告内容
        const reportResult = await geminiService.generateReport({
          chainContent,
          userInput
        });

        // 创建时间戳
        const timestamp = Date.now();
        const dateStr = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');

        // 准备快照数据（不自动下载）
        const selectedPath = Object.entries(state.selectedNodesByLevel).map(([level, nodeId]) => ({
          nodeId: nodeId!,
          level: parseInt(level)
        }));

        const snapshot: CanvasSnapshot = {
          version: '1.0',
          createdAt: new Date().toISOString(),
          originalPrompt: state.originalPrompt,
          levels: state.levels,
          nodes: state.nodes,
          edges: state.edges,
          selectedPath,
          viewport: state.viewport,
          metadata: {
            title: `思维探索报告 - ${dateStr}`,
            description: '与报告配套的思维导图快照',
            nodeCount: state.nodes.length,
            levelCount: state.levels.length,
            appVersion: '1.0.0'
          }
        };

        // 将快照数据存储到state中，供下载按钮使用
        set((state) => {
          state.lastGeneratedReport = {
            content: reportResult.report,
            snapshot,
            timestamp,
            dateStr
          };
        });

        console.log('✅ Report generated successfully (ready for download)');
        return reportResult.report;

      } catch (error) {
        console.error('Report generation failed:', error);
        throw error;
      } finally {
        set((state) => {
          state.isAIGenerating = false;
        });
      }
    },

    // 手动下载Markdown报告
    downloadMarkdownReport: () => {
      const state = get();
      if (!state.lastGeneratedReport) {
        console.warn('No report available for download');
        return;
      }

      const { content, dateStr, timestamp } = state.lastGeneratedReport;
      const reportBlob = new Blob([content], { type: 'text/markdown' });
      downloadFile(reportBlob, `anyplan-report-${dateStr}-${timestamp}.md`);
      console.log('✅ Markdown report downloaded');
    },

    // 手动下载JSON快照文件
    downloadSnapshotFile: () => {
      const state = get();
      if (!state.lastGeneratedReport) {
        console.warn('No snapshot available for download');
        return;
      }

      const { snapshot, dateStr, timestamp } = state.lastGeneratedReport;
      const snapshotBlob = new Blob([JSON.stringify(snapshot, null, 2)], {
        type: 'application/json'
      });
      downloadFile(snapshotBlob, `anyplan-graph-${dateStr}-${timestamp}.snapshot.json`);
      console.log('✅ Snapshot file downloaded');
    },

    // 导出画布快照
    exportSnapshot: (title?: string, description?: string) => {
      const state = get();

      // 获取当前选中路径
      const selectedPath = Object.entries(state.selectedNodesByLevel).map(([level, nodeId]) => ({
        nodeId: nodeId!,
        level: parseInt(level)
      }));

      // 创建快照数据
      const snapshot: CanvasSnapshot = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        originalPrompt: state.originalPrompt,
        levels: state.levels,
        nodes: state.nodes,
        edges: state.edges,
        selectedPath,
        viewport: state.viewport,
        metadata: {
          title: title || `思维导图快照 - ${new Date().toLocaleDateString()}`,
          description: description || '从ANYPLAN导出的画布快照',
          nodeCount: state.nodes.length,
          levelCount: state.levels.length,
          appVersion: '1.0.0'
        }
      };

      // 下载JSON文件
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
        type: 'application/json'
      });
      const filename = createSnapshotFilename(title);
      downloadFile(blob, filename);

      console.log('✅ Canvas snapshot exported successfully');
    },

    // 导入画布快照
    importSnapshot: (snapshot: CanvasSnapshot) => {
      try {
        // 验证快照格式
        if (!snapshot.version || !snapshot.nodes || !snapshot.levels) {
          throw new Error('Invalid snapshot format');
        }

        set((state) => {
          // 清空当前画布
          state.nodes = [];
          state.edges = [];
          state.selectedNodesByLevel = {};

          // 还原数据
          state.originalPrompt = snapshot.originalPrompt || '';
          state.levels = snapshot.levels || [];
          state.nodes = snapshot.nodes || [];
          state.edges = snapshot.edges || [];

          // 还原视口（如果有）
          if (snapshot.viewport) {
            state.viewport = snapshot.viewport;
          }

          // 还原选中路径
          if (snapshot.selectedPath) {
            snapshot.selectedPath.forEach(item => {
              state.selectedNodesByLevel[item.level] = item.nodeId;
            });
          }

          // 重置其他状态
          state.currentLevel = 1;
          state.isAIGenerating = false;
          state.error = null;
        });

        console.log('✅ Canvas snapshot imported successfully');
        console.log('📊 Restored:', {
          nodes: snapshot.nodes.length,
          levels: snapshot.levels.length,
          selectedPath: snapshot.selectedPath?.length || 0
        });

      } catch (error) {
        console.error('Failed to import snapshot:', error);
        throw new Error('导入快照失败：' + (error instanceof Error ? error.message : '未知错误'));
      }
    },
  }))
);
