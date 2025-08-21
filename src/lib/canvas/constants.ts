// 节点类型常量
export const NODE_TYPES = {
  KEYWORD: 'keyword',
  ORIGINAL: 'original',
  LEVEL: 'level',
  OUTPUT: 'output',
} as const;

// 边类型常量
export const EDGE_TYPES = {
  DEFAULT: 'default',
  ANIMATED: 'animated',
} as const;

// 节点尺寸
export const NODE_DIMENSIONS = {
  KEYWORD: {
    width: 215, // 增加节点宽度，从240改为300
    height: 50,
  },
  ORIGINAL: {
    width: 320,
    height: 120,
  },
  LEVEL: {
    width: 150,
    height: 40,
  },
  OUTPUT: {
    width: 300,
    height: 200,
  },
} as const;

// 画布配置
export const CANVAS_CONFIG = {
  // 缩放限制
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 2,
  
  // 默认视口
  DEFAULT_VIEWPORT: {
    x: 0,
    y: 0,
    zoom: 1,
  },
  
  // 节点间距
  NODE_SPACING: {
    horizontal: 200,
    vertical: 100,
  },
  
  // 自动布局配置
  AUTO_LAYOUT: {
    direction: 'TB' as const,
    rankSeparation: 100,
    nodeSeparation: 200,
    edgeSeparation: 50,
  },
  
  // 动画配置
  ANIMATION: {
    duration: 300,
    easing: 'ease-in-out',
  },
} as const;

// 颜色主题
export const COLORS = {
  // 主色调
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primaryLight: '#dbeafe',
  
  // 次要色调
  secondary: '#64748b',
  secondaryHover: '#475569',
  secondaryLight: '#f1f5f9',
  
  // 状态色
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // 中性色
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // 边框
  border: '#e2e8f0',
  borderHover: '#cbd5e1',
  
  // 背景
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  
  // 文本
  text: '#171717',
  textSecondary: '#64748b',
  textMuted: '#9ca3af',
} as const;

// 层级颜色 - 按照PRD要求的背景色规则
export const LEVEL_COLORS = [
  '#161618', // Level 0 - 原始内容
  '#262627', // Level 1 - L1
  '#161618', // Level 2 - L2
  '#262627', // Level 3 - L3
  '#161618', // Level 4 - L4
  '#262627', // Level 5 - L5
] as const;

// 获取节点背景色的函数
export const getNodeBackgroundColor = (level: number): string => {
  if (level === 0) return '#161618'; // 原始内容
  return level % 2 === 1 ? '#262627' : '#161618';
};

// 快捷键
export const SHORTCUTS = {
  // 画布操作
  FIT_VIEW: 'Space',
  ZOOM_IN: 'Ctrl+=',
  ZOOM_OUT: 'Ctrl+-',
  RESET_ZOOM: 'Ctrl+0',
  
  // 编辑操作
  DELETE: 'Delete',
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
  COPY: 'Ctrl+C',
  PASTE: 'Ctrl+V',
  
  // 保存操作
  SAVE: 'Ctrl+S',
  SAVE_AS: 'Ctrl+Shift+S',
  
  // 生成操作
  GENERATE: 'Enter',
  RENEW: 'Ctrl+R',
  
  // 选择操作
  SELECT_ALL: 'Ctrl+A',
  CLEAR_SELECTION: 'Escape',
} as const;

// 动画类型
export const ANIMATIONS = {
  FADE_IN: 'fadeIn',
  FADE_OUT: 'fadeOut',
  SLIDE_IN: 'slideIn',
  SLIDE_OUT: 'slideOut',
  SCALE_IN: 'scaleIn',
  SCALE_OUT: 'scaleOut',
  BOUNCE: 'bounce',
  PULSE: 'pulse',
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  GENERATION_FAILED: '生成失败，请重试',
  NETWORK_ERROR: '网络连接错误',
  STORAGE_ERROR: '存储失败',
  VALIDATION_ERROR: '数据验证失败',
  UNKNOWN_ERROR: '未知错误',
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  GENERATION_SUCCESS: '生成成功',
  SAVE_SUCCESS: '保存成功',
  LOAD_SUCCESS: '加载成功',
  DELETE_SUCCESS: '删除成功',
} as const;

// API 端点
export const API_ENDPOINTS = {
  GENERATE: '/api/generate',
  GRAPH: '/api/graph',
  OUTPUT: '/api/output',
} as const;

// 存储键名
export const STORAGE_KEYS = {
  SNAPSHOTS: 'anyplan_snapshots',
  PREFERENCES: 'anyplan_preferences',
  RECENT_FILES: 'anyplan_recent_files',
} as const;

// 文件类型
export const FILE_TYPES = {
  JSON: 'application/json',
  MARKDOWN: 'text/markdown',
  PDF: 'application/pdf',
  PNG: 'image/png',
  SVG: 'image/svg+xml',
} as const;

// 导出格式
export const EXPORT_FORMATS = {
  JSON: 'json',
  MARKDOWN: 'markdown',
  PDF: 'pdf',
  IMAGE: 'image',
} as const;
