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
  KeywordNodeData
} from '@/types/canvas';
// AI 辅助函数
const analyzeUserInput = async (userInput: string) => {
  // 模拟AI分析结果
  return {
    levelCount: 3,
    levels: [
      { level: 1, label: 'L1', description: '表层探索', isActive: true, nodeCount: 2 },
      { level: 2, label: 'L2', description: '具体原因', isActive: false, nodeCount: 0 },
      { level: 3, label: 'L3', description: '解决方案', isActive: false, nodeCount: 0 }
    ],
    initialNodes: [
      { level: 1, content: '问题的表面现象', hasChildren: true },
      { level: 1, content: '相关影响因素', hasChildren: true }
    ],
    originalPrompt: userInput
  };
};

const expandNodeContent = async (
  nodeContent: string,
  nodeLevel: number,
  parentContext: string,
  userPrompt: string
) => {
  // 使用参数避免未使用警告
  console.log('Expanding node:', { nodeContent, nodeLevel, parentContext, userPrompt });
  // 模拟节点扩展结果
  return {
    children: [
      { content: `${nodeContent} - 子项1`, level: nodeLevel + 1, hasChildren: true },
      { content: `${nodeContent} - 子项2`, level: nodeLevel + 1, hasChildren: true }
    ]
  };
};

const generateChatBotResponse = (levelCount: number): string => {
  return `已根据关键词为您准备好${levelCount}个层级的基础构建模型，您可根据需求调整生成的层级。点击箭头以生成下一级内容。`;
};

const getNodeBackgroundColor = (level: number): string => {
  if (level === 0) return '#161618'; // 原始内容
  return level % 2 === 1 ? '#262627' : '#161618';
};

interface CanvasStore {
  // 核心数据
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: Viewport;
  selectedPath: SelectedPath | null;

  // AI相关状态
  levels: AILevel[];
  currentLevel: number;
  originalPrompt: string;
  isAIGenerating: boolean;

  // 版本管理
  snapshots: Snapshot[];
  currentSnapshotId: string | null;

  // UI 状态
  loading: LoadingState;
  error: ErrorState | null;
  config: CanvasConfig;
  
  // 基础操作
  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  setViewport: (viewport: Viewport) => void;
  
  // 节点操作
  addNode: (node: CanvasNode) => void;
  updateNode: (nodeId: string, updates: Partial<CanvasNode>) => void;
  deleteNode: (nodeId: string) => void;
  
  // 边操作
  addEdge: (edge: CanvasEdge) => void;
  deleteEdge: (edgeId: string) => void;
  
  // 路径选择
  selectPath: (nodeIds: string[]) => void;
  clearSelection: () => void;

  // AI层级管理
  analyzeUserInput: (userInput: string) => Promise<string>;
  setLevels: (levels: AILevel[]) => void;
  setCurrentLevel: (level: number) => void;
  updateLevelNodeCount: (level: number, count: number) => void;

  // AI 生成相关
  generateChildren: (nodeId: string, context: NodeContext) => Promise<void>;
  renewNode: (nodeId: string, context: NodeContext) => Promise<void>;
  generateInitialNodes: (analysisResult: AIAnalysisResult) => void;
  
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

const defaultViewport: Viewport = { x: 0, y: 0, zoom: 1 };

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
  immer((set) => ({
    // 初始状态
    nodes: [],
    edges: [],
    viewport: defaultViewport,
    selectedPath: null,

    // AI相关初始状态
    levels: [],
    currentLevel: 1,
    originalPrompt: '',
    isAIGenerating: false,

    snapshots: [],
    currentSnapshotId: null,
    loading: defaultLoadingState,
    error: null,
    config: defaultConfig,

    // 基础操作
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

    deleteNode: (nodeId) => set((state) => {
      state.nodes = state.nodes.filter(n => n.id !== nodeId);
      state.edges = state.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
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

    // AI层级管理
    analyzeUserInput: async (userInput: string) => {
      console.log('🏪 Store analyzeUserInput called with:', userInput);

      set((state) => {
        state.isAIGenerating = true;
        state.originalPrompt = userInput;
      });

      try {
        console.log('🔄 Calling local analyzeUserInput function...');
        const analysisResult = await analyzeUserInput(userInput);
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
        });

        // 生成初始节点
        set((state) => {
          state.nodes = analysisResult.initialNodes.map((nodeData: {
            content: string;
            level: number;
            hasChildren: boolean;
          }, index: number) => ({
            id: `node-${Date.now()}-${index}`,
            type: 'keyword' as const,
            position: { x: index * 250, y: 100 },
            data: {
              id: `node-${Date.now()}-${index}`,
              content: nodeData.content,
              level: nodeData.level,
              type: 'keyword' as const,
              canExpand: nodeData.hasChildren,
              hasChildren: nodeData.hasChildren,
              isGenerating: false,
              isSelected: false,
            } as KeywordNodeData,
            style: {
              backgroundColor: getNodeBackgroundColor(nodeData.level),
            }
          }));
        });

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

    generateInitialNodes: (analysisResult) => set((state) => {
      // 清空现有节点
      state.nodes = [];
      state.edges = [];

      // 生成初始节点
      state.nodes = analysisResult.initialNodes.map((nodeData: {
        content: string;
        level: number;
        hasChildren: boolean;
      }, index: number) => ({
        id: `node-${Date.now()}-${index}`,
        type: 'keyword' as const,
        position: { x: index * 250, y: 100 },
        data: {
          id: `node-${Date.now()}-${index}`,
          content: nodeData.content,
          level: nodeData.level,
          type: 'keyword' as const,
          canExpand: nodeData.hasChildren,
          hasChildren: nodeData.hasChildren,
          isGenerating: false,
          isSelected: false,
        } as KeywordNodeData,
        style: {
          backgroundColor: getNodeBackgroundColor(nodeData.level),
        }
      }));
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
        const parentNode = useCanvasStore.getState().nodes.find(n => n.id === nodeId);
        if (!parentNode || !parentNode.data) {
          throw new Error('Parent node not found');
        }

        const expansionResult = await expandNodeContent(
          parentNode.data.content,
          parentNode.data.level,
          context.parentContent || '',
          useCanvasStore.getState().originalPrompt
        );

        set((state) => {
          const parentNodeIndex = state.nodes.findIndex(n => n.id === nodeId);
          if (parentNodeIndex === -1) return;

          const parentNode = state.nodes[parentNodeIndex];
          const childLevel = parentNode.data.level + 1;

          // 生成子节点
          const childNodes = expansionResult.children.map((childData: {
            content: string;
            level: number;
            hasChildren: boolean;
          }, index: number) => ({
            id: `${nodeId}-child-${Date.now()}-${index}`,
            type: 'keyword' as const,
            position: {
              x: parentNode.position.x + (index - expansionResult.children.length / 2) * 200,
              y: parentNode.position.y + 150
            },
            data: {
              id: `${nodeId}-child-${Date.now()}-${index}`,
              content: childData.content,
              level: childLevel,
              parentId: nodeId,
              type: 'keyword' as const,
              canExpand: childData.hasChildren,
              hasChildren: childData.hasChildren,
              isGenerating: false,
              isSelected: false,
            } as KeywordNodeData,
            style: {
              backgroundColor: getNodeBackgroundColor(childLevel),
            }
          }));

          // 添加子节点到画布
          state.nodes.push(...childNodes);

          // 创建连接边
          const childEdges = childNodes.map((childNode: CanvasNode) => ({
            id: `edge-${nodeId}-${childNode.id}`,
            source: nodeId,
            target: childNode.id,
            type: 'default' as const,
          }));

          state.edges.push(...childEdges);

          // 更新层级节点数量
          const levelIndex = state.levels.findIndex(l => l.level === childLevel);
          if (levelIndex !== -1) {
            state.levels[levelIndex].nodeCount += childNodes.length;
          }

          // 更新父节点状态
          if (state.nodes[parentNodeIndex].data) {
            state.nodes[parentNodeIndex].data.isGenerating = false;
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
            nodes: [...state.nodes],
            edges: [...state.edges],
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

      state.loading = defaultLoadingState;
      state.error = null;
    }),
  }))
);
