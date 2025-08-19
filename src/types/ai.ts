// AI 生成请求类型
export interface GenerateRequest {
  type: 'children' | 'renew' | 'output';
  prompt: string;
  context: GenerateContext;
  options?: GenerateOptions;
}

// 生成上下文
export interface GenerateContext {
  nodeId?: string;
  parentContent?: string;
  siblingContents?: string[];
  level: number;
  fullPath: string[];
  selectedPath?: string[];
  userPrompt: string;
}

// 生成选项
export interface GenerateOptions {
  count?: number; // 生成数量，默认3个
  temperature?: number; // 创造性，0-1
  maxTokens?: number;
  model?: string;
}

// AI 生成响应
export interface GenerateResponse {
  success: boolean;
  data?: GeneratedContent[];
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 生成的内容
export interface GeneratedContent {
  id: string;
  content: string;
  confidence?: number; // 0-1，AI对生成内容的信心度
  reasoning?: string; // AI的推理过程
}

// 输出生成请求
export interface OutputGenerateRequest {
  type: 'single' | 'joint';
  selectedPath: string[];
  customPrompt?: string;
  outputFormat?: 'text' | 'markdown' | 'structured';
}

// 输出生成响应
export interface OutputGenerateResponse {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: {
    wordCount: number;
    readingTime: number;
    structure: string[];
  };
}

// Gemini API 配置
export interface GeminiConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
  timeout?: number;
}

// 提示词模板
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: 'generation' | 'renewal' | 'output';
}

// AI 服务状态
export interface AIServiceStatus {
  isConnected: boolean;
  model: string;
  lastRequestTime?: Date;
  requestCount: number;
  errorCount: number;
}

// 批量生成请求
export interface BatchGenerateRequest {
  requests: GenerateRequest[];
  options?: {
    parallel?: boolean;
    maxConcurrency?: number;
  };
}

// 批量生成响应
export interface BatchGenerateResponse {
  results: GenerateResponse[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    totalTokens: number;
  };
}
