// AI服务统一导出

// 导出AI服务
export { geminiService, GeminiService } from './gemini';

// 导出类型定义
export type {
  AIServiceConfig,
  AIServiceError,
  AnalysisRequest,
  LevelGenerationResult,
  AIAnalysisResult,
  NodeExpansionRequest,
  NodeExpansionResult,
  GeminiRequest,
  GeminiResponse,
  GeminiCandidate,
  GeminiContent,
  GeminiPart
} from './types';

// 导出Prompt模板
export {
  ANALYZE_AND_GENERATE_LEVELS_PROMPT,
  EXPAND_NODE_PROMPT,
  CHATBOT_RESPONSE_TEMPLATE,
  SYSTEM_PROMPT,
  ERROR_PROMPTS
} from './prompts';

// 工具函数
export const getNodeBackgroundColor = (level: number): string => {
  if (level === 0) return '#161618'; // 原始内容
  return level % 2 === 1 ? '#262627' : '#161618';
};

// AI服务健康检查
export const checkAIServiceHealth = async (): Promise<boolean> => {
  try {
    // 简单的健康检查：尝试分析一个简单问题
    const { geminiService } = await import('./gemini');
    await geminiService.analyzeAndGenerateLevels({ userInput: '测试' });
    return true;
  } catch (error) {
    console.error('AI service health check failed:', error);
    return false;
  }
};
