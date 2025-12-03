
import { GoogleGenAI } from "@google/genai";
import { AIGenerationRequest, DocType } from '../types';
import { DOC_HIERARCHY } from '../data/hierarchy';

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
async function callGoogleGenAI(prompt: string, docType: string) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("No API Key found in process.env.API_KEY. Using Mock Mode.");
    await delay(2000); 
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

    let modelName = 'gemini-2.5-flash';
    if (useThinking) {
      modelName = 'gemini-3-pro-preview';
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
    if (error.message?.includes('429') || error.status === 429 || error.status === 'RESOURCE_EXHAUSTED') {
       const openRouterKey = localStorage.getItem('sf_openrouter_key');
       if (openRouterKey) {
          return callOpenRouter(prompt, docType, {
            openRouterKey,
            openRouterModel: localStorage.getItem('sf_openrouter_model') || 'anthropic/claude-3.5-sonnet'
          });
       }
       return {
         success: true,
         content: `## ⚠️ Rate Limit\n\nAI provider busy. Please try again later or configure OpenRouter backup.\n\n## Placeholder for ${docType}\n- Section 1\n- Section 2`,
         model: 'fallback-mode'
       };
    }
    return { success: false, error: error.message, docType };
  }
}

async function callOpenRouter(prompt: string, docType: string, config: any) {
  if (!config.openRouterKey) return { success: false, error: "Missing OpenRouter Key", docType };
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.openRouterKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Systematic Funnels",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.openRouterModel,
        messages: [
          { role: "system", content: "You are an expert technical writer. Generate professional markdown documentation." },
          { role: "user", content: prompt }
        ]
      })
    });
    if (!response.ok) throw new Error((await response.json()).error?.message);
    const data = await response.json();
    return { success: true, content: data.choices?.[0]?.message?.content || "", model: data.model };
  } catch (error: any) {
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
export async function refineDocument(currentContent: string, instruction: string, docType: string) {
  const config = getAIConfig();
  const prompt = `
    Role: Expert Editor.
    Task: Update the content below based on the instruction.
    Instruction: "${instruction}"
    
    Content:
    """${currentContent}"""
    
    Output: Updated Markdown only. No preamble.
  `;

  if (config.provider === 'openrouter' && config.openRouterKey) {
     return callOpenRouter(prompt, docType, config);
  }
  return callGoogleGenAI(prompt, docType);
}

// === CENTRALIZED GENERATOR ===
export async function generateDocument(docType: DocType, req: AIGenerationRequest) {
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

async function callAI(prompt: string, docType: string) {
  const config = getAIConfig();
  if (config.provider === 'openrouter' && config.openRouterKey) {
    return callOpenRouter(prompt, docType, config);
  }
  return callGoogleGenAI(prompt, docType);
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
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
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
      const data = await response.json();
      return { success: false, error: data.error?.message || "Invalid configuration" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
