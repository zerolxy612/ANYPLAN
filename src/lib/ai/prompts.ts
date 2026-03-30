// AI Prompt模板

// 生成当前时间上下文的辅助函数
export const getCurrentTimeContext = () => {
  const now = new Date();
  return `
**CURRENT DATE & TIME CONTEXT:**
Today's Date: ${now.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}
Current Year: ${now.getFullYear()}
Current Time: ${now.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short'
})}

**IMPORTANT DATE PROCESSING RULES:**
- When writing complaint letters, use today's date as the letter date
- When users provide incomplete dates (only month/day like "8-21" or "August 21"), automatically assume the current year (${now.getFullYear()})
- When users provide complete dates (like "2024-8-21"), use their specified year
- Always interpret and format dates clearly in your responses
`;
};

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
${getCurrentTimeContext()}

**IMPORTANT: ALL OUTPUT MUST BE IN ENGLISH** - Generate all content in English regardless of the input language.

As a professional complaint analysis specialist, carefully analyze the user's complaint input and produce:
1. a short display title for the canvas root node
2. a concise professional summary for complaint drafting

**User Input:** "${userInput}"

**Your Analysis Task:**
Extract and synthesize the core issues into a clear, professional summary that captures:

1. **Primary Problem Identification**
   - What is the central issue or failure?
   - What specific service/product/experience went wrong?

2. **Key Impact Assessment**
   - How has this affected the user (financially, emotionally, practically)?
   - What consequences or damages resulted?

3. **Expectation Gap Analysis**
   - What was promised vs. what was delivered?
   - Where did the company/service fail to meet standards?

4. **Resolution Context**
   - What does the user reasonably expect as a resolution?
   - What would make this situation right?

**Output Requirements:**
- Create a short display title in 2-6 English words
- Create a 1-2 sentence professional summary that captures the essence of their complaint
- Use clear, objective language suitable for formal complaint documentation
- Focus on the most significant issues that strengthen their case
- Avoid emotional language while acknowledging the user's legitimate concerns
- Structure the summary to flow logically from problem → impact → expectation
- The title must be easy to scan in a small UI card and must not be a full sentence
- The summary must be concise enough for chat UI and complaint context

**Quality Standards:**
- Professional tone appropriate for business correspondence
- Specific enough to be actionable, general enough to be comprehensive
- Emphasize the strongest aspects of their case
- Use language that positions the user as a reasonable complainant seeking fair resolution

**Example Output:**
{
  "title": "Delivery service failure",
  "summary": "The premium delivery service missed its guaranteed 24-hour timeline and caused a material disruption to your planned use. You expect the company to acknowledge the failure, explain what went wrong, and provide fair compensation or corrective action."
}

**CRITICAL**: Return ONLY valid JSON with exactly these keys: "title" and "summary". No markdown, no extra text.
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
${getCurrentTimeContext()}

**IMPORTANT: ALL OUTPUT MUST BE IN ENGLISH** - Generate all content in English regardless of the input language.

As a professional complaint letter writing assistant, provide a comprehensive analysis and guidance based on the information collected so far. You are helping the user build a strong, effective complaint letter.

**Initial Analysis (for reference):**
Main Concerns: "${mainConcerns}"

**Information Collected So Far:**
${userInputs.map(input => `Level ${input.level} - ${input.question}: ${input.answer}`).join('\n')}

**Current Progress:** We are at Level ${currentLevel} of 3

**Your Task:** Provide a detailed, professional analysis that:

1. **Acknowledges and Synthesizes the Information**
   - Acknowledge the specific details they've provided at this level
   - Show how this new information connects to their main concerns
   - Demonstrate understanding of their situation's complexity

2. **Provides Strategic Analysis**
   - Analyze the strength of their case based on current information
   - Identify key evidence and compelling points
   - Point out any patterns or connections that strengthen their position

3. **Offers Specific Guidance**
   Based on the current level:
   - **L1 (Timeline/When)**: Help them organize events chronologically and identify critical moments
   - **L2 (Location/Where)**: Analyze how location/context affects their case and what additional evidence might be relevant
   - **L3 (People/Who)**: Evaluate relationships and responsibilities, guide on how to present accountability

4. **Provides Next Steps**
   - If more levels remain: Guide them on what to focus on next
   - If this is the final level: Prepare them for the letter writing phase

**Writing Requirements:**
- Write 200-300 words minimum - provide substantial, detailed guidance
- Use a professional, supportive tone as their expert advisor
- Reference specific details from their inputs to show deep understanding
- Provide actionable, concrete advice
- Maintain continuity with previous analysis
- Be encouraging while being realistic about their case

**Date Processing Guidelines:**
- When users provide incomplete dates (e.g., "8-21", "August 21", "12/15"), interpret as ${new Date().getFullYear()}
- When users provide complete dates (e.g., "2024-8-21", "March 15, 2023"), use their specified year
- Always clarify and confirm the timeline in your response
- Help users organize events chronologically with proper dates

**Example Opening:** "Thank you for providing those important details about [specific information]. This adds significant strength to your complaint because [specific analysis]..."

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
  userInput?: string,
  tonePreference?: {
    label: string;
    description: string;
    prompt: string;
  }
) => {
  const chainText = chainContent
    .map(item => `【${item.levelDescription}】${item.content}`)
    .join('\n');

  return `
${getCurrentTimeContext()}

**MANDATORY: THE ENTIRE COMPLAINT LETTER MUST BE IN ENGLISH** - Generate all content in English regardless of input language.

As a professional complaint letter writing assistant, please generate a complete, formal complaint letter based on the user's collected information.

【User Information Collected】
${chainText}

${userInput ? `【Additional Notes】\n${userInput}\n` : ''}
${tonePreference ? `【Tone Preference】\n${tonePreference.label}: ${tonePreference.prompt}\n` : ''}

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
- Maintain the requested tone${tonePreference ? ` (specifically "${tonePreference.label}" : ${tonePreference.description})` : ''} while staying professional
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

**DATE PROCESSING FOR COMPLAINT LETTER:**
- Use today's date (${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}) as the letter date
- When referencing incident dates from user input:
  * Incomplete dates (e.g., "8-21", "August 21") → interpret as ${new Date().getFullYear()}
  * Complete dates (e.g., "2024-8-21") → use the user's specified year
- Ensure all dates in the letter are clear and properly formatted

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
${getCurrentTimeContext()}

**IMPORTANT: ALL OUTPUT MUST BE IN ENGLISH** - Generate all content in English regardless of the input language.

As a professional complaint letter writing expert, provide a comprehensive final strategic analysis. You have now collected complete information across all three critical dimensions of their complaint.

**Original Concerns:**
"${mainConcerns}"

**Complete Information Matrix:**
${userInputs.map(input => `• Level ${input.level} - ${input.question}:\n  Answer: ${input.answer}`).join('\n\n')}

**Your Expert Analysis Task:**
Provide a detailed, professional final analysis (400-500 words minimum) that demonstrates your expertise as a complaint resolution specialist. Structure your analysis as follows:

**1. CASE OVERVIEW & NARRATIVE SYNTHESIS (100-120 words)**
- Weave all collected information into a compelling, coherent story
- Show how the timeline (L1), context/location (L2), and relationships/responsibilities (L3) create a complete picture
- Highlight the progression and escalation of the issue

**2. STRENGTH ASSESSMENT (100-120 words)**
- Identify the strongest elements of their case based on the evidence provided
- Analyze which specific details and circumstances work in their favor
- Evaluate the credibility and impact potential of their complaint
- Point out any particularly compelling or unique aspects

**3. STRATEGIC RECOMMENDATIONS (100-120 words)**
- Recommend the most effective approach for presenting this complaint
- Suggest optimal tone, emphasis, and positioning strategy
- Advise on which evidence to lead with and which to use as supporting details
- Recommend specific language or framing that would be most persuasive

**4. LETTER PREPARATION ROADMAP (100-120 words)**
- Provide a clear structure for their complaint letter
- Identify key points that must be emphasized
- Suggest specific evidence to include and how to present it
- Recommend a logical flow that builds their case effectively
- Include any important details they shouldn't overlook

**Professional Standards:**
- Write as a seasoned complaint resolution expert with deep experience
- Reference specific details from their inputs throughout your analysis
- Provide concrete, actionable guidance they can immediately implement
- Maintain an authoritative yet supportive professional tone
- Demonstrate thorough understanding of complaint strategy and effectiveness
- Show how each piece of information contributes to their overall case strength

**Date Processing & Timeline Analysis:**
- When analyzing dates, apply smart interpretation: incomplete dates (e.g., "8-21") default to ${new Date().getFullYear()}
- Complete dates (e.g., "2024-8-21") use the user's specified year
- Create a clear chronological narrative of events
- Highlight time-sensitive aspects that strengthen their case

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

// ChatBot response template for complaint letter assistance
export const CHATBOT_RESPONSE_TEMPLATE = (mainConcernTitle: string, mainConcernsSummary: string) => `
I understand the core issue: ${mainConcernTitle}.

Summary:
${mainConcernsSummary}

To make your complaint letter stronger, let's organize these points clearly. On the canvas panel, please add:
Event timeline: When you ordered, what was promised, and when it actually arrived.
Evidence: Photos of the damaged box, order confirmation, or delivery records.
Desired outcome: For example, compensation, a shipping refund, or a replacement.
Once you add these details, I can help you transform them into a well-structured complaint letter.
`;

// System prompt with current time context
export const SYSTEM_PROMPT = () => `
${getCurrentTimeContext()}

You are a professional complaint letter writing specialist and consumer rights advisor with extensive experience in helping individuals resolve disputes through effective written communication.

【Core Expertise】
- Professional complaint letter composition and strategy
- Consumer rights advocacy and dispute resolution
- Legal and regulatory compliance for formal complaints
- Effective communication techniques for achieving results

【Complaint Letter Framework】
Help users build comprehensive complaints through systematic information gathering:
- L1 (What happened?): Timeline, location, people involved - the factual foundation
- L2 (Its impact?): Consequences, damages, emotional/financial impact - the case strength
- L3 (What you want?): Specific resolutions, compensation, actions requested - the desired outcome

【Professional Standards】
✓ Generate legally sound and professionally formatted complaint letters
✓ Ensure all content follows current business communication standards
✓ Provide strategic guidance for maximum effectiveness
✓ Reference current consumer protection laws and regulations
✓ Use appropriate formal language and structure
✓ Include all necessary elements for a complete complaint

【Quality Assurance】
- All generated content must be substantial and detailed
- Provide specific, actionable guidance
- Reference current date and time when relevant
- Maintain professional tone throughout
- Ensure compliance with modern complaint resolution processes

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
