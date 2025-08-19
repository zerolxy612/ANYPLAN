import { 
  GeminiRequest, 
  GeminiResponse, 
  AIServiceConfig, 
  AIServiceError,
  AnalysisRequest,
  LevelGenerationResult,
  NodeExpansionRequest,
  NodeExpansionResult
} from './types';
import { 
  ANALYZE_AND_GENERATE_LEVELS_PROMPT, 
  EXPAND_NODE_PROMPT,
  SYSTEM_PROMPT 
} from './prompts';

// Gemini API配置
const DEFAULT_CONFIG: AIServiceConfig = {
  apiKey: 'AIzaSyBehM0G5s23Qv3Czh1sJpsclL2cpLBY3XQ',
  apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  defaultTemperature: 0.7,
  maxTokens: 2048,
  timeout: 30000, // 30秒
};

class GeminiService {
  private config: AIServiceConfig;

  constructor(config?: Partial<AIServiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // 发送请求到Gemini API
  private async sendRequest(prompt: string): Promise<string> {
    const request: GeminiRequest = {
      contents: [
        {
          parts: [{ text: SYSTEM_PROMPT }],
          role: 'user'
        },
        {
          parts: [{ text: prompt }],
          role: 'user'
        }
      ],
      generationConfig: {
        temperature: this.config.defaultTemperature,
        maxOutputTokens: this.config.maxTokens,
      }
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.config.apiKey,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from AI service');
      }

      const content = data.candidates[0].content.parts[0].text;
      return content;

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw this.createError('TIMEOUT_ERROR', 'Request timeout');
        }
        throw this.createError('NETWORK_ERROR', error.message);
      }
      throw this.createError('API_ERROR', 'Unknown error occurred');
    }
  }

  // 创建错误对象
  private createError(code: AIServiceError['code'], message: string, details?: Record<string, unknown>): AIServiceError {
    return { code, message, details };
  }

  // 解析JSON响应
  private parseJSONResponse<T>(response: string): T {
    try {
      // 清理响应文本，移除可能的markdown格式
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      return JSON.parse(cleanResponse);
    } catch (error) {
      throw this.createError('PARSE_ERROR', 'Failed to parse AI response', { response, error });
    }
  }

  // 分析用户输入并生成层级框架
  async analyzeAndGenerateLevels(request: AnalysisRequest): Promise<LevelGenerationResult> {
    if (!request.userInput.trim()) {
      throw this.createError('API_ERROR', 'User input cannot be empty');
    }

    try {
      const prompt = ANALYZE_AND_GENERATE_LEVELS_PROMPT(request.userInput);
      const response = await this.sendRequest(prompt);
      const result = this.parseJSONResponse<LevelGenerationResult>(response);

      // 验证返回数据的完整性
      if (!result.levelCount || !result.levels || !result.initialNodes) {
        throw new Error('Invalid response structure');
      }

      return result;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error; // 重新抛出AIServiceError
      }
      throw this.createError('API_ERROR', error instanceof Error ? error.message : 'Analysis failed');
    }
  }

  // 扩展节点内容
  async expandNode(request: NodeExpansionRequest): Promise<NodeExpansionResult> {
    try {
      const prompt = EXPAND_NODE_PROMPT(
        request.nodeContent,
        request.nodeLevel,
        request.parentContext,
        request.userPrompt
      );
      
      const response = await this.sendRequest(prompt);
      const result = this.parseJSONResponse<NodeExpansionResult>(response);

      // 验证返回数据
      if (!result.children || !Array.isArray(result.children)) {
        throw new Error('Invalid expansion response structure');
      }

      return result;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error;
      }
      throw this.createError('API_ERROR', error instanceof Error ? error.message : 'Node expansion failed');
    }
  }

  // 更新配置
  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 获取当前配置
  getConfig(): AIServiceConfig {
    return { ...this.config };
  }
}

// 导出单例实例
export const geminiService = new GeminiService();

// 导出类以便测试
export { GeminiService };
