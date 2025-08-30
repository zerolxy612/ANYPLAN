// AI service unified export

// Export AI services
export { geminiService, GeminiService } from './gemini';

// Export type definitions
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

// Export Prompt templates
export {
  ANALYZE_AND_GENERATE_LEVELS_PROMPT,
  EXPAND_NODE_PROMPT,
  CHATBOT_RESPONSE_TEMPLATE,
  SYSTEM_PROMPT,
  ERROR_PROMPTS
} from './prompts';

// Utility functions
export const getNodeBackgroundColor = (level: number): string => {
  if (level === 0) return '#161618'; // Original content
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
