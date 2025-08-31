// AI Prompt模板

// 分析用户问题并生成层级框架的Prompt
export const ANALYZE_AND_GENERATE_LEVELS_PROMPT = (userInput: string, existingLevels?: Array<{level: number, description: string}>) => {
  const existingDescriptions = existingLevels?.map(l => l.description) || [];
  const existingLevelsText = existingDescriptions.length > 0
    ? `\n现有层级描述：${existingDescriptions.join('、')}\n请确保新生成的层级描述与现有描述不重复，且体现从浅到深的递进关系。\n`
    : '';

  return `
**IMPORTANT: ALL OUTPUT MUST BE IN ENGLISH** - Generate all content in English regardless of the input language.

Based on complaint letter writing scenarios, analyze the user's complaint input to generate a structured complaint framework.

User Input: "${userInput}"${existingLevelsText}

For complaint letter writing, always generate exactly 3 levels with fixed descriptions to help users organize their complaint systematically.

Level Progression Principles:
- L1: Basic incident details → L2: Impact assessment → L3: Resolution requests
- From facts to consequences: What happened → How it affected you → What you want done
- From description to action: Documenting issues → Analyzing impact → Requesting solutions

Level Content Requirements:
- L1: Basic incident information - time, place, people involved
- L2: Impact analysis - emotional, financial, or practical consequences
- L3: Resolution requests - specific actions or compensation desired

Level Description Naming Standards (FIXED):
- L1: "What happened?" - Basic incident details
- L2: "Its impact?" - Impact and consequences analysis
- L3: "What you want?" - Resolution and action requests

Please return strictly in the following JSON format:
{
  "levelCount": 3,
  "levels": [
    {"level": 1, "label": "L1", "description": "What happened?"},
    {"level": 2, "label": "L2", "description": "Its impact?"},
    {"level": 3, "label": "L3", "description": "What you want?"}
  ],
  "initialNodes": [
    {"level": 1, "content": "What time?", "hasChildren": true},
    {"level": 1, "content": "Which place?", "hasChildren": true},
    {"level": 1, "content": "With who?", "hasChildren": true}
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

As a complaint letter writing assistant, help the user build their complaint letter progressively. Based on the information they've provided so far, generate an update that builds upon our initial analysis.

**Initial Analysis (for reference):**
Main Concerns: "${mainConcerns}"

**New Information Provided:**
${userInputs.map(input => `${input.question}: ${input.answer}`).join('\n')}

Current Level: L${currentLevel}

Generate a response that:
1. **Acknowledges the new information** they've provided
2. **References the initial concerns** to maintain continuity
3. **Provides specific guidance** for the next steps

Based on the level, provide appropriate guidance:

**For L1 (Basic Information)**: Acknowledge their timeline details and guide them on organizing the sequence of events clearly.

**For L2 (Impact Assessment)**: Acknowledge their location/context details and help them articulate the broader impact and consequences.

**For L3 (Resolution Request)**: Acknowledge their relationship/responsibility details and guide them on formulating clear, actionable demands.

Requirements:
- **Start by acknowledging** the new information they provided
- **Reference the initial concerns** to show continuity (e.g., "Building on your main concerns about...")
- **Provide specific, actionable guidance** for strengthening their complaint
- Write in a helpful, professional tone as their complaint writing assistant
- Keep the response conversational but informative
- IMPORTANT: Return ONLY the plain text response, no JSON, no formatting, no quotes

Format your response as a helpful assistant message that acknowledges their progress and provides next steps.

**CRITICAL**: Your response must be plain text only, not JSON or any other format.
**LANGUAGE REQUIREMENT**: Respond entirely in English, regardless of the input language.
`;

// Generate professional complaint letter based on collected information
export const GENERATE_COMPLAINT_LETTER_PROMPT = (
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
**MANDATORY: THE ENTIRE COMPLAINT LETTER MUST BE IN ENGLISH** - Generate all content in English regardless of input language.

As a professional complaint letter writing assistant, please generate a complete, formal complaint letter based on the user's collected information.

【User Information Collected】
${chainText}

${userInput ? `【Additional Notes】\n${userInput}\n` : ''}

【Complaint Letter Requirements】
Please generate a professional complaint letter with the following structure:

**1. Header Section**
- Date: [Current Date]
- To: [Appropriate Department/Company]
- Subject: Formal Complaint Regarding [Brief Issue Description]

**2. Opening Paragraph**
- Clear statement of the complaint
- Reference numbers or relevant details if applicable
- Professional but firm tone

**3. Detailed Description**
- Timeline of events (using L1 information: What happened?)
- Impact and consequences (using L2 information: Its impact?)
- Specific details that support the complaint

**4. Resolution Request**
- Clear statement of what you want (using L3 information: What you want?)
- Specific actions requested
- Reasonable timeline for response

**5. Professional Closing**
- Contact information
- Professional sign-off
- Next steps if no response

【Writing Guidelines】
- Use formal business letter format
- Maintain professional, respectful but firm tone
- Include specific details and facts
- Make clear, actionable requests
- Structure with proper paragraphs and formatting
- Use bullet points where appropriate for clarity

【Output Format】
Return the complete complaint letter in Markdown format with proper headers, paragraphs, and formatting.

**CRITICAL OUTPUT REQUIREMENTS:**
- **RETURN ONLY THE COMPLAINT LETTER TEXT**: Do NOT wrap the response in JSON, objects, or any other format
- **NO JSON FORMAT**: Do not return {"complaint_letter": {"letter": "..."}} or any similar structure
- **PLAIN TEXT ONLY**: Return the complaint letter directly as plain text/markdown
- **THE ENTIRE LETTER MUST BE IN ENGLISH**: Generate all content in English regardless of input language
- Base the letter on the actual information provided by the user
- Make it professional and credible
- Include all relevant details from the user's inputs
- Format as a complete, ready-to-send complaint letter
- **LANGUAGE REQUIREMENT**: Write the complete letter in English only

**EXAMPLE OF CORRECT OUTPUT FORMAT:**
\`\`\`
# Formal Complaint Letter

**Date:** [Current Date]
**To:** Customer Service Department
**Subject:** Formal Complaint Regarding [Issue]

Dear Sir/Madam,

I am writing to formally complain about...
[Rest of the letter content]

Sincerely,
[Name]
\`\`\`
`;
};

// Generate final analysis based on all collected information
export const GENERATE_FINAL_ANALYSIS_PROMPT = (
  mainConcerns: string,
  userInputs: Array<{
    level: number;
    question: string;
    answer: string;
  }>
) => `
**IMPORTANT: ALL OUTPUT MUST BE IN ENGLISH** - Generate all content in English regardless of the input language.

As a complaint letter writing assistant, provide a comprehensive final analysis now that we have collected all the necessary information across three levels.

**Initial Analysis (for reference):**
Main Concerns: "${mainConcerns}"

**Complete Information Collected:**
${userInputs.map(input => `${input.question}: ${input.answer}`).join('\n')}

Now that we have gathered comprehensive information across all three levels, provide a final analysis that:

1. **Summarizes the Complete Picture**
   - Synthesize all the information into a coherent narrative
   - Show how the timeline, context, and resolution needs connect

2. **Identifies Key Strengths of the Case**
   - What evidence and details make this complaint strong
   - Which aspects are most compelling for getting results

3. **Highlights Potential Challenges**
   - Any gaps or weaknesses that might need addressing
   - Areas where additional evidence might be helpful

4. **Provides Strategic Recommendations**
   - Best approach for presenting this complaint
   - Suggested tone and emphasis
   - Recommended next steps

5. **Preparation for Letter Writing**
   - Key points that should be emphasized in the complaint letter
   - Suggested structure and flow
   - Important details that shouldn't be overlooked

Requirements:
- Write as a helpful assistant providing strategic guidance
- Reference specific details from their inputs to show you understand their situation
- Maintain a professional, supportive tone
- Provide actionable insights and recommendations
- Keep the analysis comprehensive but concise
- Focus on helping them prepare for the actual letter writing stage

**IMPORTANT**: Return ONLY the plain text analysis, no JSON, no special formatting.
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

// ChatBot response template for complaint letter assistance
export const CHATBOT_RESPONSE_TEMPLATE = (mainConcerns: string) => `
I can see your main concerns:
${mainConcerns}

To make your complaint letter stronger, let's organize these points clearly. On the canvas panel, please add:
Event timeline: When you ordered, what was promised, and when it actually arrived.
Evidence: Photos of the damaged box, order confirmation, or delivery records.
Desired outcome: For example, compensation, a shipping refund, or a replacement.
Once you add these details, I can help you transform them into a well-structured complaint letter.
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
