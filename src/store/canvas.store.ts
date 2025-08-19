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
  NodeContext
} from '@/types/canvas';

interface CanvasStore {
  // 核心数据
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: Viewport;
  selectedPath: SelectedPath | null;
  
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
  
  // AI 生成相关
  generateChildren: (nodeId: string, context: NodeContext) => Promise<void>;
  renewNode: (nodeId: string, context: NodeContext) => Promise<void>;
  
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
  immer((set, get) => ({
    // 初始状态
    nodes: [],
    edges: [],
    viewport: defaultViewport,
    selectedPath: null,
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

    // AI 生成相关 (占位符实现)
    generateChildren: async (nodeId, context) => {
      set((state) => {
        state.loading.isGenerating = true;
      });
      
      try {
        // TODO: 实现实际的AI生成逻辑
        console.log('Generating children for node:', nodeId, context);
        
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        set((state) => {
          state.error = {
            message: error instanceof Error ? error.message : 'Generation failed',
            type: 'generation',
            nodeId,
            timestamp: new Date(),
          };
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
      state.loading = defaultLoadingState;
      state.error = null;
    }),
  }))
);
