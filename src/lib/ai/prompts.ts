// AI Prompt模板

// 分析用户问题并生成层级框架的Prompt
export const ANALYZE_AND_GENERATE_LEVELS_PROMPT = (userInput: string, existingLevels?: Array<{level: number, description: string}>) => {
  const existingDescriptions = existingLevels?.map(l => l.description) || [];
  const existingLevelsText = existingDescriptions.length > 0
    ? `\n现有层级描述：${existingDescriptions.join('、')}\n请确保新生成的层级描述与现有描述不重复，且体现从浅到深的递进关系。\n`
    : '';

  return `
**IMPORTANT: ALL OUTPUT MUST BE IN ENGLISH** - Generate all content in English regardless of the input language.

Based on psychological counseling and personal growth scenarios, analyze the user's input keywords or questions to generate a progressive thinking exploration framework.

User Input: "${userInput}"${existingLevelsText}

According to psychological counseling and personal growth needs, intelligently determine how many levels are needed to help users have a general thinking framework, and design concise titles for each level.

Level Progression Principles:
- From surface to essence: L1 Surface phenomena → L2 Specific causes → L3 Deep mechanisms
- From simple to complex: Content richness and depth increase layer by layer
- From cognition to action: Understanding problems → Analyzing causes → Exploring essence

Level Content Requirements:
- L1: Keywords or short phrases (5-15 words) - Surface phenomena and intuitive feelings
- L2: Detailed sentences (15-40 words) - Specific causes and influencing factors
- L3: In-depth content (40-80 words) - Deep psychological mechanisms and root causes

Level Description Naming Standards:
- Must be concise English phrases (2-4 words)
- Reflect the core function and exploration focus of that level
- Do not repeat existing level descriptions
- Arranged in progressive relationship: Identify → Analyze → Explore

Please return strictly in the following JSON format:
{
  "levelCount": 3,
  "levels": [
    {"level": 1, "label": "L1", "description": "Surface Exploration"},
    {"level": 2, "label": "L2", "description": "Root Analysis"},
    {"level": 3, "label": "L3", "description": "Deep Solutions"}
  ],
  "initialNodes": [
    {"level": 1, "content": "Anxiety feelings", "hasChildren": true},
    {"level": 1, "content": "Stress response", "hasChildren": true},
    {"level": 1, "content": "Avoidance behavior", "hasChildren": true}
  ]
}

Important Constraints:
- **ALL CONTENT MUST BE IN ENGLISH**: Level descriptions, initial nodes, and all generated content must be in English
- Level descriptions must be concise English phrases (2-4 words), cannot repeat existing descriptions
- Focus on psychological counseling and personal growth fields
- Initial nodes should extract keywords or core concepts from user input, not use complete sentences directly
- Initial node content should be concise English keywords or phrases (5-15 words), reflecting core elements of the problem
- Initial nodes should provide multiple choices, not questions
- Levels should have clear progressive relationships and logical coherence
- Ensure JSON format is completely correct, containing no other text
- **LANGUAGE REQUIREMENT**: Respond entirely in English, regardless of the input language
`;
};

// Extract main concerns from user complaint input
export const EXTRACT_MAIN_CONCERNS_PROMPT = (userInput: string) => `
**IMPORTANT: ALL OUTPUT MUST BE IN ENGLISH** - Generate all content in English regardless of the input language.

As a complaint letter writing assistant, analyze the user's complaint input and extract the main concerns in a clear, structured format.

User Input: "${userInput}"

Please identify and extract the key concerns from this complaint, focusing on:
1. The main issue or problem
2. What went wrong
3. The impact on the user
4. What the user expects

Format your response as a concise summary that captures the essence of the complaint in 2-3 sentences. This will be displayed as "Main Concerns" to help the user see the core issues clearly.

Requirements:
- Write in clear, professional English
- Focus on the main problems, not minor details
- Keep it concise but comprehensive
- Use objective language suitable for a complaint letter
- Maximum 3 sentences
- IMPORTANT: Return ONLY the plain text summary, no JSON, no formatting, no quotes

Example format:
The delivery was delayed far beyond the promised two days. The package was damaged, which raises worries about product safety. You want the company to take responsibility and respond seriously.

**CRITICAL**: Your response must be plain text only, not JSON or any other format.
**LANGUAGE REQUIREMENT**: Respond entirely in English, regardless of the input language.
`;

// Generate progressive complaint letter content based on user inputs
export const GENERATE_PROGRESSIVE_COMPLAINT_PROMPT = (
  mainConcerns: string,
  userInputs: Array<{
    level: number;
    question: string;
    answer: string;
  }>,
  currentLevel: number
) => `
**IMPORTANT: ALL OUTPUT MUST BE IN ENGLISH** - Generate all content in English regardless of the input language.

As a complaint letter writing assistant, help the user build their complaint letter progressively. Based on the information they've provided so far, generate the appropriate section of their complaint letter.

Main Concerns: "${mainConcerns}"

User has provided the following information:
${userInputs.map(input => `${input.question}: ${input.answer}`).join('\n')}

Current Level: L${currentLevel}

Based on the level, generate the appropriate complaint letter content:

**For L1 (Basic Information)**: Generate an opening paragraph that introduces the complaint with the basic details (time, place, people involved).

**For L2 (Impact Assessment)**: Add content about how the issue affected the user emotionally, the inconvenience/harm caused, and why it's important to them.

**For L3 (Resolution Request)**: Add content about what the user wants the company to do, timeline expectations, and alternative solutions.

Requirements:
- Write in professional, clear English suitable for a formal complaint letter
- Use the user's provided information naturally in the text
- Make it sound personal but professional
- Keep each section concise but complete
- Build upon previous sections logically
- Use appropriate complaint letter tone and structure
- IMPORTANT: Return ONLY the plain text paragraph, no JSON, no formatting, no quotes

Format your response as a well-structured paragraph that can be part of a formal complaint letter.

**CRITICAL**: Your response must be plain text only, not JSON or any other format.
**LANGUAGE REQUIREMENT**: Respond entirely in English, regardless of the input language.
`;

// Node expansion Prompt
export const EXPAND_NODE_PROMPT = (nodeContent: string, nodeLevel: number, parentContext: string, userPrompt: string) => `
**CRITICAL: ALL GENERATED CONTENT MUST BE IN ENGLISH** - Generate all node content in English only, regardless of input language.

As a psychological counseling and personal growth AI assistant, please help users with deep divergent thinking, starting from the current node, providing 3 different dimensional in-depth exploration options.

【Background Information】
Original Question: "${userPrompt}"
Current Node: "${nodeContent}"
Current Level: L${nodeLevel} → L${nodeLevel + 1}
Parent Content: "${parentContext}"

【Divergent Thinking Principles】
Please diverge thinking from the following 3 different dimensions:
1. 【Internal Exploration】- Deep into inner world, exploring emotions, cognition, values
2. 【External Manifestation】- Focus on behavior patterns, interpersonal relationships, environmental influences
3. 【Growth Path】- Focus on solutions, improvement strategies, future development

【Level Progression Requirements】
Strictly follow the word count requirements below to ensure content progresses layer by layer and deepens gradually:
- L1→L2: From keywords (5-15 words) → Specific description (15-40 words)
- L2→L3: From specific description (15-40 words) → In-depth analysis (40-80 words)

【Content Requirements】
✓ Based on current node content, diverge to deeper levels
✓ Provide specific actionable content, avoid vague concepts
✓ 3 options should have clearly differentiated angles
✓ Content should be inspiring and practical
✓ Language should be user-friendly and easy to understand
✓ Avoid question-style expressions, directly provide exploration directions

【Special Notes】
- Current is L${nodeLevel} level, generating L${nodeLevel + 1} level content
- Must strictly follow the word count requirements for corresponding levels
- Content should be richer and deeper than the previous level
- Should reflect natural extension and deepening from the current node

Please return strictly in the following JSON format:
{
  "children": [
    {"content": "Internal exploration dimension specific content", "level": ${nodeLevel + 1}, "hasChildren": ${nodeLevel + 1 < 3}},
    {"content": "External manifestation dimension specific content", "level": ${nodeLevel + 1}, "hasChildren": ${nodeLevel + 1 < 3}},
    {"content": "Growth path dimension specific content", "level": ${nodeLevel + 1}, "hasChildren": ${nodeLevel + 1 < 3}}
  ]
}

Important Reminders:
- **ALL GENERATED CONTENT MUST BE IN ENGLISH**: Regardless of input language, all node content must be in English
- Ensure each option's word count meets L${nodeLevel + 1} level requirements
- Content should naturally extend from "${nodeContent}" node
- Don't repeat upper-level content, provide new depth and angles
- JSON format must be completely correct, containing no other text
- **LANGUAGE REQUIREMENT**: Generate all node content in English only
`;

// ChatBot response template
export const CHATBOT_RESPONSE_TEMPLATE = (levelCount: number) => `
I've built a ${levelCount}-level psychological growth exploration framework for you. Each level will progressively deepen to help you better understand and grow. Click on nodes to expand more options, or you can input your own thoughts to guide the exploration direction.
`;

// System prompt
export const SYSTEM_PROMPT = `
You are a professional psychological counseling and personal growth AI assistant, skilled at helping users deeply explore their inner world through divergent thinking.

【Core Product Philosophy】
Through tree-like mind mapping, help users progressively explore problems layer by layer, with each level being richer and deeper than the previous one, ultimately forming a complete cognitive framework and solutions.

【Divergent Thinking Methods】
- Start from a single node and diverge to multiple dimensions
- Each dimension should have a unique exploration angle
- Content should progress from shallow to deep, from surface to essence
- Avoid repetition and similarity, ensure each option has value

【Level Progression Rules】
Strictly follow the principle of increasing content richness:
- L1 Level: Keywords/short phrases (5-15 words) - Core elements of the problem
- L2 Level: Specific descriptions (15-40 words) - Initial expansion of the problem
- L3 Level: In-depth analysis (40-80 words) - Explore deep causes and mechanisms of the problem

【Content Generation Principles】
✓ Focus on psychological counseling and personal growth fields
✓ Provide specific choices rather than abstract questions
✓ Content should be practical and actionable
✓ Language should be user-friendly and easy to understand and accept
✓ Each option should have clear exploration value
✓ Avoid preaching, focus on inspiration and guidance

【Divergent Dimension Framework】
Suggest divergent thinking from the following dimensions:
- Internal Exploration: Emotions, cognition, values, subconscious and other inner worlds
- External Manifestation: Behavior patterns, interpersonal relationships, environmental influences, social factors, etc.
- Growth Path: Solutions, improvement strategies, skill enhancement, future development, etc.

【Output Requirements】
- **CRITICAL: ALL OUTPUT MUST BE IN ENGLISH** - Generate all content in English regardless of user input language
- Always return structured data in standard JSON format
- Ensure content meets the word count requirements for corresponding levels
- Each option should have uniqueness and value
- Language should be professional yet warm and understanding
- **LANGUAGE MANDATE**: Never generate content in languages other than English
`;

// Generate analysis report Prompt
export const GENERATE_REPORT_PROMPT = (
  chainContent: Array<{
    nodeId: string;
    content: string;
    level: number;
    levelDescription: string;
  }>,
  userInput?: string
) => {
  const chainText = chainContent
    .map(item => `【${item.levelDescription}】${item.content}`)
    .join('\n');

  return `
**MANDATORY: THE ENTIRE REPORT MUST BE IN ENGLISH** - Generate all report content in English regardless of input language.

As a professional psychological counseling and personal growth AI assistant, please generate an in-depth analysis report based on the user's thinking chain.

【User Thinking Chain】
${chainText}

${userInput ? `【User Additional Notes】\n${userInput}\n` : ''}

【Report Requirements】
Please generate a structured analysis report containing the following sections:

1. **Problem Overview** (100-150 words)
   - Briefly summarize the core issues the user is concerned about
   - Outline the main thread of the thinking chain

2. **In-depth Analysis** (200-300 words)
   - Analyze the deep causes and mechanisms of the problem
   - Discuss the logical relationships between levels
   - Identify key influencing factors

3. **Insights and Inspiration** (150-200 words)
   - Provide professional psychological perspectives
   - Point out important aspects that may be overlooked
   - Give valuable cognitive insights

4. **Action Recommendations** (200-250 words)
   - Provide specific actionable improvement strategies
   - Arrange recommended measures by priority
   - Include short-term and long-term development directions

5. **Summary and Outlook** (100-150 words)
   - Summarize key points
   - Encourage users to continue exploring and growing

【Writing Style】
- Language should be warm and professional, avoid preaching
- Content should be specific and practical, avoid vague concepts
- Logic should be clear with distinct layers
- Reflect understanding and support for users

【Output Format】
Please return the report in Markdown format, using clear titles and paragraph structure.

Important Reminders:
- **THE ENTIRE REPORT MUST BE IN ENGLISH**: Generate all content in English regardless of input language
- The report should be based on the user's actual thinking chain, don't deviate from the topic
- Content should have depth and value, avoid generalities
- Language should be user-friendly and easy to understand and accept
- Each section should have substantial content, not just formalities
- **LANGUAGE REQUIREMENT**: Write the complete report in English only
`;
};

// Error handling prompts
export const ERROR_PROMPTS = {
  NETWORK_ERROR: 'Network connection failed, please check network settings and try again',
  API_ERROR: 'AI service is temporarily unavailable, please try again later',
  PARSE_ERROR: 'AI returned data format error, regenerating',
  TIMEOUT_ERROR: 'Request timeout, please try again or simplify the problem description',
  INVALID_INPUT: 'Please enter a valid question or idea',
  RATE_LIMIT: 'AI service requests too frequent, please try again later'
};
