// AI Prompt模板

// 分析用户问题并生成层级框架的Prompt
export const ANALYZE_AND_GENERATE_LEVELS_PROMPT = (userInput: string) => `
基于心理疏导与个人成长的使用场景，分析用户输入的关键词或问题，生成层层递进的思维探索框架。

用户输入：「${userInput}」

请根据心理疏导与个人成长的需求，智能判断需要多少个层级能帮助用户有一个大概的思路框架，并为每个层级设计4个字的标题。

层级内容要求：
- L1: 词组或短句（5-10字）
- L2: 深入细节的句子（15-30字）
- L3: 更深入的内容（30-50字）
- L4: 进一步深化（50-80字）
- L5: 综合分析（80-120字）
- L6: 完整方案（120-200字）

请严格按照以下JSON格式返回：
{
  "levelCount": 5,
  "levels": [
    {"level": 1, "label": "L1", "description": "情绪识别"},
    {"level": 2, "label": "L2", "description": "原因分析"},
    {"level": 3, "label": "L3", "description": "深层探索"},
    {"level": 4, "label": "L4", "description": "应对策略"},
    {"level": 5, "label": "L5", "description": "成长路径"}
  ],
  "initialNodes": [
    {"level": 1, "content": "焦虑情绪", "hasChildren": true},
    {"level": 1, "content": "压力反应", "hasChildren": true},
    {"level": 1, "content": "逃避行为", "hasChildren": true}
  ]
}

注意：
- 层级描述必须是4个字
- 专注于心理疏导与个人成长领域
- 初始节点要提供多种选择，不要提问
- 确保JSON格式完全正确，不要包含任何其他文字
`;

// 扩展节点内容的Prompt
export const EXPAND_NODE_PROMPT = (nodeContent: string, nodeLevel: number, parentContext: string, userPrompt: string) => `
基于心理疏导与个人成长的场景，为用户提供多种选择来深入探索当前节点。

原始输入：「${userPrompt}」
当前节点：「${nodeContent}」
节点层级：L${nodeLevel}
上级内容：「${parentContext}」

请为当前节点生成3个子节点选项，遵循以下内容长度要求：
- L1→L2: 从词组/短句(5-10字) 扩展到 深入句子(15-30字)
- L2→L3: 从句子(15-30字) 扩展到 详细内容(30-50字)
- L3→L4: 从详细内容(30-50字) 扩展到 深化分析(50-80字)
- L4→L5: 从深化分析(50-80字) 扩展到 综合理解(80-120字)
- L5→L6: 从综合理解(80-120字) 扩展到 完整方案(120-200字)

子节点要求：
1. 专注于心理疏导与个人成长
2. 提供具体的选择而非提问
3. 内容要有实用性和启发性
4. 3个选项要有不同的探索角度

请严格按照以下JSON格式返回：
{
  "children": [
    {"content": "第一个选择的具体内容", "level": ${nodeLevel + 1}, "hasChildren": true},
    {"content": "第二个选择的具体内容", "level": ${nodeLevel + 1}, "hasChildren": true},
    {"content": "第三个选择的具体内容", "level": ${nodeLevel + 1}, "hasChildren": true}
  ]
}

注意：
- 严格按照层级对应的字数要求
- 不要提问，要提供具体的选择
- 确保JSON格式完全正确，不要包含任何其他文字
`;

// ChatBot回复模板
export const CHATBOT_RESPONSE_TEMPLATE = (levelCount: number) => `
已为您构建了${levelCount}个层级的心理成长探索框架。每个层级内容会逐步深入，帮助您更好地理解和成长。点击节点可以展开更多选择，或者您可以输入自己的想法来引导探索方向。
`;

// 系统提示词
export const SYSTEM_PROMPT = `
我是一个AI产品设计师，正在构思一款新的产品。主要特征为：

产品特征：
- 树状图形式的flow，帮助用户发散思维
- 层层递进，深度挖掘用户的想法
- 每一个层级比上一个层级内容更丰富（如第一个层级为词组或短句；第二个层级则为更深入更细节的句子15-30字；第三层级为第二个层级基础上更深入的内容，大约30-50字.....以此类推，最多6个层级）
- 不通过提问的方式来引导用户，而是给予用户多种选择
- 当用户给出一个关键词，AI提供根据关键词发散出的内容（3个选项），用户可以在AI提供的内容中选择自己想要的或是增加一个输入框输入新的内容来指示AI生成下一步的内容

使用场景：心理疏导与个人成长

核心原则：
- 每个层级的内容长度递增：L1(词组/短句) → L2(15-30字) → L3(30-50字) → L4(50-80字) → L5(80-120字) → L6(120-200字)
- 提供多种选择而非提问引导
- 内容要有启发性和实用性
- 始终以JSON格式返回结构化数据
- 专注于心理疏导与个人成长领域
`;

// 错误处理提示
export const ERROR_PROMPTS = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置后重试',
  API_ERROR: 'AI服务暂时不可用，请稍后重试',
  PARSE_ERROR: 'AI返回数据格式错误，正在重新生成',
  TIMEOUT_ERROR: '请求超时，请重试或简化问题描述',
  INVALID_INPUT: '请输入有效的问题或想法',
  RATE_LIMIT: 'AI服务请求过于频繁，请稍后重试'
};
