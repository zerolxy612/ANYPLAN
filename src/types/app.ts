// 应用全局状态
export interface AppState {
  isInitialized: boolean;
  currentUser?: User;
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
  preferences: UserPreferences;
}

// 用户信息
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

// 用户偏好设置
export interface UserPreferences {
  canvas: {
    autoSave: boolean;
    autoLayout: boolean;
    showMinimap: boolean;
    showGrid: boolean;
    snapToGrid: boolean;
  };
  ai: {
    defaultModel: string;
    temperature: number;
    maxTokens: number;
    autoGenerate: boolean;
  };
  ui: {
    sidebarWidth: number;
    panelCollapsed: boolean;
    shortcuts: Record<string, string>;
  };
}

// 应用配置
export interface AppConfig {
  version: string;
  buildTime: string;
  environment: 'development' | 'production' | 'test';
  features: {
    aiGeneration: boolean;
    cloudSync: boolean;
    collaboration: boolean;
    export: boolean;
  };
  limits: {
    maxNodes: number;
    maxSnapshots: number;
    maxFileSize: number;
  };
}

// 通知类型
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number; // 毫秒，undefined表示不自动消失
  actions?: NotificationAction[];
  createdAt: Date;
}

// 通知操作
export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

// 快捷键配置
export interface ShortcutConfig {
  key: string;
  description: string;
  action: string;
  category: 'canvas' | 'editing' | 'navigation' | 'general';
}

// 应用统计
export interface AppStats {
  totalNodes: number;
  totalSnapshots: number;
  totalGenerations: number;
  storageUsed: number; // bytes
  lastActivity: Date;
}

// 导入/导出格式
export interface ImportExportFormat {
  format: 'json' | 'markdown' | 'pdf' | 'image';
  version: string;
  options?: Record<string, unknown>;
}

// 错误报告
export interface ErrorReport {
  id: string;
  error: Error;
  context: {
    url: string;
    userAgent: string;
    timestamp: Date;
    userId?: string;
    action?: string;
  };
  stackTrace: string;
  metadata?: Record<string, unknown>;
}

// 性能指标
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  nodeCount: number;
  edgeCount: number;
  lastMeasurement: Date;
}

// 应用事件
export type AppEvent = 
  | 'app-initialized'
  | 'user-login'
  | 'user-logout'
  | 'theme-changed'
  | 'language-changed'
  | 'preferences-updated'
  | 'error-occurred'
  | 'performance-warning';

// 事件监听器
export interface EventListener {
  event: AppEvent;
  handler: (data?: unknown) => void;
  once?: boolean;
}
