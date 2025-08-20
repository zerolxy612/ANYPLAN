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
import { geminiService } from '@/lib/ai/gemini';
import { CHATBOT_RESPONSE_TEMPLATE } from '@/lib/ai/prompts';
// AI 辅助函数 - 使用真实的 Gemini API
const analyzeUserInput = async (userInput: string) => {
  try {
    const result = await geminiService.analyzeAndGenerateLevels({ userInput });
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
  }
};

const expandNodeContent = async (
  nodeContent: string,
  nodeLevel: number,
  parentContext: string,
  userPrompt: string
) => {
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
    // 降级处理：返回默认子节点，根据层级生成不同内容
    const fallbackContent = generateFallbackContent(nodeContent, nodeLevel);
    return {
      children: fallbackContent
    };
  }
};

// 生成降级内容的函数
const generateFallbackContent = (nodeContent: string, nodeLevel: number) => {
  const baseContent = nodeContent || '拖延症';

  switch (nodeLevel) {
    case 0: // 原始节点 -> L1
      return [
        { content: '完美主义', level: 1, hasChildren: true },
        { content: '缺乏动力', level: 1, hasChildren: true },
        { content: '没有目标', level: 1, hasChildren: true }
      ];
    case 1: // L1 -> L2
      return [
        { content: `${baseContent}的具体表现和影响`, level: 2, hasChildren: true },
        { content: `${baseContent}背后的心理原因`, level: 2, hasChildren: true },
        { content: `${baseContent}在日常生活中的体现`, level: 2, hasChildren: true }
      ];
    case 2: // L2 -> L3
      return [
        { content: `深入分析${baseContent}的根本原因和触发因素`, level: 3, hasChildren: true },
        { content: `探索${baseContent}与个人价值观和信念的关系`, level: 3, hasChildren: true },
        { content: `理解${baseContent}对个人成长和目标实现的阻碍`, level: 3, hasChildren: true }
      ];
    default:
      return [
        { content: `${baseContent} - 选项1`, level: nodeLevel + 1, hasChildren: true },
        { content: `${baseContent} - 选项2`, level: nodeLevel + 1, hasChildren: true },
        { content: `${baseContent} - 选项3`, level: nodeLevel + 1, hasChildren: true }
      ];
  }
};

const generateChatBotResponse = (levelCount: number): string => {
  return CHATBOT_RESPONSE_TEMPLATE(levelCount);
};

// 生成新层级描述的简单函数
const generateLevelDescription = async (newLevel: number, originalPrompt: string, existingLevels: AILevel[]): Promise<string> => {
  // 简单的层级描述生成逻辑
  const levelDescriptions = [
    '表层探索', '具体原因', '深层机制', '解决方案', '实施策略', '效果评估'
  ];

  // 如果有现有层级，尝试智能生成
  if (existingLevels.length > 0) {
    const beforeLevel = existingLevels.find(l => l.level === newLevel - 1);
    const afterLevel = existingLevels.find(l => l.level === newLevel);

    if (beforeLevel && afterLevel) {
      // 在两个层级之间插入，生成过渡性描述
      return `${beforeLevel.description}分析`;
    }
  }

  // 使用默认描述
  return levelDescriptions[newLevel - 1] || `第${newLevel}层级`;
};

// 使用constants中的函数
import { getNodeBackgroundColor } from '@/lib/canvas/constants';

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

  // 节点选择状态
  selectedNodesByLevel: Record<number, string | null>; // 每个层级只能选中一个节点

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

  // 节点选择
  selectNode: (nodeId: string, level: number) => void;
  clearNodeSelection: (level?: number) => void;
  isNodeSelected: (nodeId: string) => boolean;

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
    // 初始状态
    nodes: [],
    edges: [],
    viewport: defaultViewport,
    selectedPath: null,

    // AI相关初始状态 - 用户未操作时为空
    levels: [],
    currentLevel: 1,
    originalPrompt: '',
    isAIGenerating: false,

    // 节点选择状态
    selectedNodesByLevel: {},

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

    // 节点选择管理
    selectNode: (nodeId, level) => set((state) => {
      // 清除该层级之前的选择
      state.selectedNodesByLevel[level] = nodeId;
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
          console.log('🎯 Generating children for original node');

          // 为原始节点生成L1层级的3个选项
          const expansionResult = await expandNodeContent(
            context.parentContent || '',
            0, // 原始节点层级为0
            '',
            useCanvasStore.getState().originalPrompt || ''
          );

          console.log('📊 Analysis result:', expansionResult);
          console.log('📊 Children count:', expansionResult.children?.length);
          console.log('📊 Children data:', expansionResult.children);

          set((state) => {
            console.log('🔄 Before adding nodes, current nodes count:', state.nodes.length);

            // 计算L1区域的位置
            const l1AreaX = 400; // L1区域开始位置
            const l1AreaWidth = 300; // L1区域宽度
            const canvasCenterY = 300; // 画布垂直居中

            // 生成3个选项节点，垂直排列在L1区域内
            const childNodes = expansionResult.children.map((childData: {
              content: string;
              level: number;
              hasChildren: boolean;
            }, index: number) => {
              const newNode = {
                id: `l1-node-${Date.now()}-${index}`,
                type: 'keyword' as const,
                position: {
                  x: l1AreaX + l1AreaWidth / 2 - 100, // 在L1区域中心，节点宽度200px的一半
                  y: canvasCenterY - 100 + index * 120 // 垂直排列，间距120px
                },
                data: {
                  id: `l1-node-${Date.now()}-${index}`,
                  content: childData.content,
                  level: 1, // L1层级
                  parentId: nodeId, // 使用实际的原始节点ID
                  type: 'keyword' as const,
                  canExpand: childData.hasChildren,
                  hasChildren: childData.hasChildren,
                  isGenerating: false,
                  isSelected: false,
                } as KeywordNodeData,
                style: {
                  backgroundColor: getNodeBackgroundColor(1),
                }
              };
              console.log('🆕 Creating new node:', newNode);
              return newNode;
            });

            // 暂时不创建连接线，先确保节点正确
            state.nodes.push(...childNodes);
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

      // 重置节点选择状态
      state.selectedNodesByLevel = {};

      state.loading = defaultLoadingState;
      state.error = null;
    }),
  }))
);
