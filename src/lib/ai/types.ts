// AI服务相关类型定义

// Gemini API请求结构
export interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiContent {
  parts: GeminiPart[];
  role?: 'user' | 'model';
}

export interface GeminiPart {
  text: string;
}

// Gemini API响应结构
export interface GeminiResponse {
  candidates: GeminiCandidate[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface GeminiCandidate {
  content: GeminiContent;
  finishReason?: string;
  index?: number;
  safetyRatings?: Array<{
    category: string;
    probability: string;
  }>;
}

// AI分析请求
export interface AnalysisRequest {
  userInput: string;
  existingLevels?: Array<{level: number, description: string}>; // 现有层级信息，用于避免重复
  context?: {
    previousLevels?: number;
    existingNodes?: string[];
  };
}

// AI层级生成结果
export interface LevelGenerationResult {
  levelCount: number;
  levels: {
    level: number;
    label: string;
    description: string;
  }[];
  initialNodes: {
    level: number;
    content: string;
    hasChildren: boolean;
  }[];
}

// AI分析结果（包含原始问题）
export interface AIAnalysisResult extends LevelGenerationResult {
  originalPrompt: string;
}

// AI节点扩展请求
export interface NodeExpansionRequest {
  nodeContent: string;
  nodeLevel: number;
  parentContext: string;
  userPrompt: string;
}

// AI节点扩展结果
export interface NodeExpansionResult {
  children: {
    content: string;
    level: number;
    hasChildren: boolean;
  }[];
}

// AI服务配置
export interface AIServiceConfig {
  apiKey: string;
  apiUrl: string;
  defaultTemperature: number;
  maxTokens: number;
  timeout: number;
}

// 报告生成请求
export interface ReportGenerationRequest {
  chainContent: Array<{
    nodeId: string;
    content: string;
    level: number;
    levelDescription: string;
  }>;
  userInput?: string;
}

// 报告生成结果
export interface ReportGenerationResult {
  report: string; // Markdown格式的报告内容
  metadata?: {
    wordCount: number;
    generatedAt: string;
    chainLength: number;
  };
}

// AI服务错误类型
export interface AIServiceError {
  code: 'NETWORK_ERROR' | 'API_ERROR' | 'PARSE_ERROR' | 'TIMEOUT_ERROR';
  message: string;
  details?: Record<string, unknown>;
}
