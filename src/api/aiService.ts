
import { GoogleGenAI } from "@google/genai";
import { AIGenerationRequest, DocType } from '../types';
import { DOC_HIERARCHY } from '../data/hierarchy';

// === TYPES ===
export interface ExtractedProjectDetails {
  name?: string;
  concept?: string;
  problem?: string;
  audience?: string;
  features?: string[];
  tech?: string[];
  budget?: string;
  timeline?: string;
}

export interface AIResult {
  success: boolean;
  content?: string;
  model?: string;
  error?: string;
  docType?: string;
  data?: ExtractedProjectDetails;
}

// Configuration Helpers
const getAIConfig = () => {
  return {
    provider: localStorage.getItem('sf_provider') || 'google',
    openRouterKey: localStorage.getItem('sf_openrouter_key') || '',
    openRouterModel: localStorage.getItem('sf_openrouter_model') || 'anthropic/claude-3.5-sonnet'
  };
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry Helper with Exponential Backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, baseDelay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error.message?.includes('429') || error.status === 429 || error.status === 'RESOURCE_EXHAUSTED';
    if (retries === 0 || !isRateLimit) {
      throw error;
    }
    console.warn(`Rate limit hit. Retrying in ${baseDelay}ms... (${retries} retries left)`);
    await delay(baseDelay);
    return retryWithBackoff(fn, retries - 1, baseDelay * 2);
  }
}

// Helper for Google GenAI calls
async function callGoogleGenAI(prompt: string, docType: string): Promise<AIResult> {
  const localKey = localStorage.getItem('sf_gemini_key');
  const apiKey = localKey || import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn(`No API Key found in VITE_GEMINI_API_KEY. Using Mock Mode for ${docType}.`);
    await delay(1000); 

    if (docType === 'EXTRACTION') {
      return {
        success: true,
        content: JSON.stringify({
          name: "Mock Project",
          concept: "A revolutionary AI platform for developers.",
          problem: "Developing AI is hard and time-consuming.",
          audience: "Developers and Startups",
          features: ["AI Code Generation", "Automated Testing", "Smart Deployments"],
          tech: ["React", "Node.js", "Supabase"],
          budget: "Small ($5-25k)",
          timeline: "Normal (3-6m)"
        }),
        model: 'mock-model'
      };
    }

    if (docType === 'BRAINSTORM') {
      return {
        success: true,
        content: JSON.stringify(["Feature A", "Feature B", "Feature C", "Feature D", "Feature E"]),
        model: 'mock-model'
      };
    }

    return {
      success: true,
      content: `## Mock Generated ${docType.toUpperCase()}\n\nThis is a simulated response.\n\n## 1. Content\nMock content for ${docType}.`,
      model: 'mock-model'
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Intelligent config based on doc type
  const useSearch = [
    DocType.STRATEGY_MARKET, DocType.STRATEGY_VISION, DocType.BIZ_GTM, 
    DocType.COMPETITOR_ANALYSIS, DocType.ARCH_OVERVIEW
  ].includes(docType as DocType);

  const useThinking = [
    DocType.ARCH_DB, DocType.ARCH_API, DocType.TEST_CASES, 
    DocType.PRODUCT_STORIES, DocType.CODE_SCAFFOLD
  ].includes(docType as DocType);

  try {
    const config: any = {
      systemInstruction: "You are an expert technical writer, product manager, and systems architect. Generate professional, detailed, and actionable documentation. Return ONLY the markdown content. Use Markdown H2 (##) for all main sections.",
    };

    if (useSearch) config.tools = [{ googleSearch: {} }];
  
    let modelName = 'gemini-2.0-flash';
    if (useThinking) {
      modelName = 'gemini-2.0-flash-thinking-exp-01-21';
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: config
      });
    });

    let content = response.text || "";

    // Append sources if available
    if (useSearch && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const chunks = response.candidates[0].groundingMetadata.groundingChunks;
      const sources = chunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: string | undefined | null) => uri)
        .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);

      if (sources.length > 0) {
        content += "\n\n## References & Sources\n\n" + sources.map((s: string) => `- [${s}](${s})`).join('\n');
      }
    }

    return { success: true, content: content, model: modelName };
  } catch (error: any) {
    console.error(`Error generating ${docType} via Gemini:`, error);
    
    const errorMsg = error.message || "";
    const isLeaked = errorMsg.includes('leaked') || error.status === 403;
    const isRateLimit = errorMsg.includes('429') || error.status === 429 || error.status === 'RESOURCE_EXHAUSTED';

    if (isLeaked) {
      return {
        success: false,
        error: "CRITICAL: Your Gemini API Key has been reported as leaked. For security, Google has disabled it. Please generate a new key at https://aistudio.google.com/app/apikey and update your VITE_GEMINI_API_KEY in .env.local",
        docType
      };
    }

    if (isRateLimit) {
       const openRouterKey = localStorage.getItem('sf_openrouter_key');
       if (openRouterKey) {
          return callOpenRouter(prompt, docType, {
            openRouterKey,
            openRouterModel: localStorage.getItem('sf_openrouter_model') || 'anthropic/claude-3.5-sonnet'
          });
       }
       return {
         success: true,
         content: `## ⚠️ Rate Limit\n\nAI provider busy. Please try again later or configure OpenRouter backup in settings.\n\n## Placeholder for ${docType}\n- Section 1\n- Section 2`,
         model: 'fallback-mode'
       };
    }
    return { success: false, error: error.message, docType };
  }
}

async function callOpenRouter(prompt: string, docType: string, config: any): Promise<AIResult> {
  if (!config.openRouterKey) return { success: false, error: "Missing OpenRouter Key", docType };
  
  try {
    console.log(`[AI] Calling OpenRouter with model: ${config.openRouterModel}`);
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.openRouterKey.trim()}`
      },
      body: JSON.stringify({
        model: config.openRouterModel,
        messages: [
          { role: "system", content: "You are an expert technical writer. Generate professional markdown documentation." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("OpenRouter returned an empty response. Please try a different model or check your credit balance.");
    }

    return { success: true, content: content, model: data.model };
  } catch (error: any) {
    console.error(`[AI] OpenRouter Error for ${docType}:`, error);
    return { success: false, error: error.message, docType };
  }
}

// === GENERIC PROMPT BUILDER FOR UNIVERSAL TREE ===
function buildGenericPrompt(docType: DocType, req: AIGenerationRequest): string {
  const node = DOC_HIERARCHY[docType];
  const title = node ? node.title : docType.replace(/_/g, ' ').toUpperCase();
  const desc = node ? node.description : "";
  const category = node ? node.category : "";

  // Base Context
  const context = `
PROJECT CONTEXT:
Name: [Derived from Concept]
Concept: ${req.projectConcept}
Problem: ${req.problem}
Audience: ${req.targetAudience}
Features: ${req.features.join(', ')}
Tech Stack: ${req.preferences.tech.join(', ')}
Timeline: ${req.preferences.timeline}
Budget: ${req.preferences.budget}
`;

  // Dynamic Instructions based on Category/Type
  let instructions = "";

  if (category.includes("Strategy")) {
    instructions = `
      Focus on high-level strategic alignment.
      Analyze the market fit, user needs, and long-term vision.
      Include sections: Vision, Mission, Strategic Pillars, Market Analysis.
    `;
  } else if (category.includes("Product")) {
    instructions = `
      Focus on detailed functional requirements.
      Define User Stories, Acceptance Criteria, and MoSCoW priorities.
      Include sections: Features, User Flows, Data Requirements.
    `;
  } else if (category.includes("Architecture") || category.includes("Code")) {
    instructions = `
      Focus on technical implementation details.
      Provide specific technology choices, patterns, and component breakdowns.
      Include sections: System Design, Data Model, API Contracts, Security.
    `;
  } else if (category.includes("Business")) {
    instructions = `
      Focus on commercial viability and growth.
      Analyze costs, revenue models, and go-to-market channels.
      Include sections: Pricing Strategy, Sales Channels, Unit Economics (CAC/LTV).
    `;
  } else {
    instructions = `
      Focus on ${desc}.
      Provide actionable guides, checklists, and clear process definitions.
    `;
  }

  return `
    Create the document: "${title}"
    Description: ${desc}
    
    ${context}

    INSTRUCTIONS:
    ${instructions}

    FORMAT:
    - Use Markdown H2 (##) for all main sections.
    - Be professional, concise, and actionable.
    - If relevant, include tables or code blocks.
  `;
}

// === REFINEMENT ===
export async function streamRefineDocument(
  content: string,
  instruction: string,
  docType: string,
  onChunk: (chunk: string) => void
): Promise<AIResult> {
  const localKey = localStorage.getItem('sf_gemini_key');
  const apiKey = localKey || import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    // Mock streaming
    const mockContent = `## Refined ${docType}\n\n${content}\n\n**Added by AI:** This is a simulated refinement based on: "${instruction}"`;
    const words = mockContent.split(' ');
    for (let i = 0; i < words.length; i++) {
      onChunk(words[i] + (i === words.length - 1 ? '' : ' '));
      await delay(30);
    }
    return { success: true, content: mockContent };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Enhanced prompt with better context and instructions
    const prompt = `
      ROLE: You are an expert document editor and content specialist.

      DOCUMENT TYPE: ${docType}
      USER REQUEST: "${instruction}"

      ORIGINAL CONTENT:
      ${content}

      TASK: Refine the content according to the user's specific request.
      - Maintain the document's purpose and key information
      - Preserve important technical details and data
      - Ensure the response is well-structured and professional
      - Return ONLY the refined markdown content
      - Do not add meta-commentary or explanations outside the content

      OUTPUT: Return the improved version of the provided content as clean markdown.
    `;

    const result = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional document editor. Focus on clarity, accuracy, and structure. Return only the refined content without any wrapper text or explanations."
      }
    });
    let fullContent = "";

    for await (const chunk of result) {
      const chunkText = chunk.text;
      fullContent += chunkText;
      onChunk(chunkText);
    }

    return { success: true, content: fullContent };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function refineDocument(content: string, instruction: string, docType: string): Promise<AIResult> {
  const prompt = `
    Role: Expert Editor.
    Task: Update the content below based on the instruction.
    Instruction: "${instruction}"

    Content:
    """${content}"""

    Output: Updated Markdown only. No preamble.
  `;

  return callAI(prompt, docType);
}

// === HELPER: Clean & Parse JSON ===
function safeParseJSON(content: string, type: 'object' | 'array' = 'object'): any {
  try {
    // 1. Remove markdown code blocks
    let clean = content.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    // 2. Extract the actual JSON part using regex
    const pattern = type === 'object' ? /\{[\s\S]*\}/ : /\[[\s\S]*\]/;
    const match = clean.match(pattern);
    
    if (match) {
      clean = match[0];
    }
    
    // 3. Final cleanup for common AI hallucinations
    // Remove trailing commas before closing braces/brackets
    clean = clean.replace(/,(\s*[\]\}])/g, '$1');
    
    return JSON.parse(clean);
  } catch (e) {
    console.error(`[AI] JSON Parse Error:`, e, content);
    throw new Error("Invalid JSON structure in AI response");
  }
}

// === PROJECT EXTRACTION ===
export async function extractProjectDetails(input: string): Promise<AIResult> {
  const prompt = `
    Analyze the following project summary or transcript and extract structured project details.
    
    Input Text:
    """
    ${input}
    """
    
    Return ONLY a JSON object with the following fields:
    {
      "name": "Short project name",
      "concept": "1-2 line overview",
      "problem": "Main pain point being solved",
      "audience": "Target audience description",
      "features": ["Feature 1", "Feature 2", ...],
      "tech": ["React", "Next.js", "Node.js", etc. - preferred from: React, Next.js, Vue, Node.js, Python, Go, Flutter, RN, Firebase, AWS, Supabase, PostgreSQL],
      "budget": "One of: Bootstrapped (<$5k), Small ($5-25k), Medium ($25-100k), Enterprise (>$100k)",
      "timeline": "One of: ASAP (1-3m), Normal (3-6m), Flexible (6-12m), Long (12m+)"
    }
    
    If a field is not mentioned, provide a reasonable best guess based on the context.
  `;

  const result = await callAI(prompt, 'EXTRACTION');
  
  if (result.success && result.content) {
    try {
      const data = safeParseJSON(result.content, 'object');
      return { success: true, data };
    } catch (e) {
      return { success: false, error: "Failed to parse project details from AI response" };
    }
  }
  
  return result;
}

// === FEATURE BRAINSTORMING ===
export async function brainstormFeatures(concept: string, problem: string): Promise<{ success: boolean; features?: string[]; error?: string }> {
  const prompt = `
    Based on the following project concept and problem statement, brainstorm 5-7 core features that would make this a successful product.
    
    Concept: ${concept}
    Problem: ${problem}
    
    Return ONLY a JSON array of strings. 
    Example: ["User Authentication", "Dashboard", "Push Notifications"]
  `;

  const result = await callAI(prompt, 'BRAINSTORM');
  
  if (result.success && result.content) {
    try {
      const features = safeParseJSON(result.content, 'array');
      return { success: true, features };
    } catch (e) {
      return { success: false, error: "Failed to parse features from AI response" };
    }
  }
  
  return { success: false, error: result.error || "Brainstorming failed" };
}

// === CENTRALIZED GENERATOR ===
export async function generateDocument(docType: DocType, req: AIGenerationRequest): Promise<AIResult> {
  // Use Generic Builder for all types in the hierarchy
  // This replaces the 35+ individual functions
  const prompt = buildGenericPrompt(docType, req);
  return callAI(prompt, docType);
}

// === STREAMING SIMULATION ===
export async function streamDocumentGeneration(
  docType: DocType,
  req: AIGenerationRequest,
  onProgress: (progress: number, phase: string) => void
): Promise<{ success: boolean; content?: string; error?: string }> {
  
  onProgress(5, 'Initializing...');
  await delay(500);
  
  onProgress(15, 'Analyzing context...');
  
  const generationPromise = generateDocument(docType, req);

  let currentProgress = 20;
  const interval = setInterval(() => {
    if (currentProgress < 90) {
      currentProgress += Math.floor(Math.random() * 8) + 2;
      const phases = ['Drafting sections...', 'expanding details...', 'checking constraints...'];
      onProgress(Math.min(90, currentProgress), phases[Math.floor(Math.random() * phases.length)]);
    }
  }, 800);

  try {
    const result = await generationPromise;
    clearInterval(interval);
    
    if (result.success) {
      onProgress(100, 'Completed');
    } else {
      onProgress(100, 'Failed');
    }
    
    return result;
  } catch (error: any) {
    clearInterval(interval);
    onProgress(0, 'Failed');
    return { success: false, error: error.message };
  }
}

async function callAI(prompt: string, docType: string): Promise<AIResult> {
  const config = getAIConfig();
  console.log(`[AI] Attempting ${docType} via ${config.provider}`);

  if (config.provider === 'openrouter' && config.openRouterKey) {
    const result = await callOpenRouter(prompt, docType, config);
    if (result.success) return result;
    
    // If OpenRouter was explicitly chosen but failed, we still report it
    console.warn(`[AI] OpenRouter failed, but it was the primary choice.`);
    return result;
  }

  // Default to Google
  const result = await callGoogleGenAI(prompt, docType);
  
  // If Google fails and we have an OpenRouter key, try fallback automatically
  if (!result.success && config.openRouterKey) {
    console.log(`[AI] Google failed, attempting automatic fallback to OpenRouter`);
    return callOpenRouter(prompt, docType, config);
  }

  return result;
}

// Helper to get doc metadata for UI
export function getDocMetadata(docType: DocType) {
  return DOC_HIERARCHY[docType] || {
    id: docType,
    title: docType.replace(/_/g, ' '),
    category: "Other",
    owner: "AI",
    cta: "Next",
    description: ""
  };
}

export async function validateOpenRouterConfig(apiKey: string, model: string = 'anthropic/claude-3.5-sonnet') {
  if (!apiKey) return { success: false, error: "API Key is required" };
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 5
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
