/**
 * Multi-Provider AI Client
 * 
 * This module provides a consistent way to initialize and access
 * multiple AI providers across all specialized agents.
 */

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type GenerationConfig,
  type SafetySetting
} from "@google/generative-ai";
import OpenAI from "openai";

// --- Provider Types ---
export type AIProvider = 'gemini-1.5-flash' | 'gemini-2.0-flash-exp' | 'gemini-1.5-pro' | 'gpt-4o' | 'gpt-4o-mini' | 'grok-beta' | 'grok-vision-beta';

// --- Client Instances ---
let genAIInstance: GoogleGenerativeAI | null = null;
let openAIInstance: OpenAI | null = null;
let xAIInstance: OpenAI | null = null;

// Standard safety settings for Gemini
const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Initialize and get the appropriate AI client
 */
export function getAIClient(provider: AIProvider) {
  switch (provider) {
    case 'gemini-1.5-flash':
    case 'gemini-2.0-flash-exp':
    case 'gemini-1.5-pro':
      return getGeminiClient(provider);
    
    case 'gpt-4o':
    case 'gpt-4o-mini':
      return getOpenAIClient(provider);
    
    case 'grok-beta':
    case 'grok-vision-beta':
      return getXAIClient(provider);
    
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Get Gemini client
 */
function getGeminiClient(model: string) {
  if (!genAIInstance) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is not set");
    }
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  
  return {
    client: genAIInstance,
    safetySettings,
    modelName: model,
    provider: 'gemini' as const
  };
}

/**
 * Get OpenAI client
 */
function getOpenAIClient(model: string) {
  if (!openAIInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openAIInstance = new OpenAI({ apiKey });
  }
  
  return {
    client: openAIInstance,
    modelName: model,
    provider: 'openai' as const
  };
}

/**
 * Get xAI (Grok) client
 */
function getXAIClient(model: string) {
  if (!xAIInstance) {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      throw new Error("XAI_API_KEY environment variable is not set");
    }
    xAIInstance = new OpenAI({ 
      baseURL: "https://api.x.ai/v1", 
      apiKey 
    });
  }
  
  return {
    client: xAIInstance,
    modelName: model,
    provider: 'xai' as const
  };
}

/**
 * Generate content using any provider with automatic fallback
 */
export async function generateContent(
  provider: AIProvider,
  prompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    responseFormat?: 'json' | 'text';
    fallbackProviders?: AIProvider[];
  }
): Promise<string> {
  const providers = [provider, ...(options?.fallbackProviders || [])];
  
  for (const currentProvider of providers) {
    try {
      const { client, modelName, provider: providerType } = getAIClient(currentProvider);
      
      switch (providerType) {
        case 'gemini': {
          const model = (client as GoogleGenerativeAI).getGenerativeModel({
            model: modelName,
            safetySettings,
            generationConfig: {
              temperature: options?.temperature || 0.7,
              maxOutputTokens: options?.maxTokens || 4096,
            },
          });
          
          const result = await model.generateContent(sanitizeText(prompt));
          return result.response.text();
        }
        
        case 'openai': {
          const response = await (client as OpenAI).chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: prompt }],
            max_tokens: options?.maxTokens || 4096,
            temperature: options?.temperature || 0.7,
            response_format: options?.responseFormat === 'json' ? { type: "json_object" } : undefined,
          });
          
          return response.choices[0].message.content || "";
        }
        
        case 'xai': {
          const response = await (client as OpenAI).chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: prompt }],
            max_tokens: options?.maxTokens || 4096,
            temperature: options?.temperature || 0.7,
            response_format: options?.responseFormat === 'json' ? { type: "json_object" } : undefined,
          });
          
          return response.choices[0].message.content || "";
        }
        
        default:
          throw new Error(`Unknown provider type: ${providerType}`);
      }
    } catch (error) {
      console.error(`[AI Client] Error with ${currentProvider}:`, error);
      
      // If this was the last provider, throw the error
      if (currentProvider === providers[providers.length - 1]) {
        throw error;
      }
      
      // Otherwise, continue to the next provider
      console.log(`[AI Client] Falling back to next provider...`);
    }
  }
  
  throw new Error('All AI providers failed');
}

/**
 * Sanitize text to avoid safety filter issues
 */
export function sanitizeText(text: string): string {
  if (!text) return "";
  
  const profanityMap: Record<string, string> = {
    shit: "stuff",
    damn: "darn",
    "fuckin'": "really",
    fucking: "really",
    hell: "heck",
  };
  
  let sanitized = text;
  for (const word in profanityMap) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    sanitized = sanitized.replace(regex, profanityMap[word]);
  }
  
  // Remove null characters
  sanitized = sanitized.replace(/\u0000/g, "");
  
  return sanitized;
}

/**
 * Extract valid JSON from potentially messy AI response text
 */
export function extractJsonFromText(text: string): any {
  try {
    // Remove markdown code blocks more aggressively
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Remove any leading/trailing non-JSON text
    cleanText = cleanText.replace(/^[^{\[]*/, '').replace(/[^}\]]*$/, '');
    
    // Find the first [ or { and the last ] or }
    const startMatch = cleanText.search(/[\{\[]/);
    const endMatch = cleanText.lastIndexOf(cleanText.includes('[') ? ']' : '}');
    
    if (startMatch !== -1 && endMatch !== -1) {
      let jsonStr = cleanText.substring(startMatch, endMatch + 1);
      
      // Try to fix common JSON formatting issues
      jsonStr = jsonStr
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/(\w+):/g, '"$1":'); // Add quotes around unquoted keys if needed
      
      try {
        const parsed = JSON.parse(jsonStr);
        
        // If we got a single object but expected an array, wrap it in an array
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          console.log("[AI Client] Converting single object to array");
          return [parsed];
        }
        
        return parsed;
      } catch (innerError) {
        console.log("[AI Client] Trying to wrap single object in array due to parse error");
        // If JSON parsing fails, try wrapping in array brackets
        try {
          const arrayStr = `[${jsonStr}]`;
          return JSON.parse(arrayStr);
        } catch (arrayError) {
          throw innerError; // Throw original error
        }
      }
    }
    
    // Fallback to original text
    const parsed = JSON.parse(cleanText);
    
    // If we got a single object but expected an array, wrap it in an array
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      console.log("[AI Client] Converting single object to array (fallback)");
      return [parsed];
    }
    
    return parsed;
  } catch (error) {
    console.error("[AI Client] Error parsing JSON response:", error);
    console.error("[AI Client] Raw text:", text);
    
    // Last resort: try to extract a valid object manually and wrap in array
    try {
      const match = text.match(/\{[^{}]*"sceneId"[^{}]*\}/);
      if (match) {
        console.log("[AI Client] Attempting manual object extraction");
        const obj = JSON.parse(match[0]);
        return [obj];
      }
    } catch (manualError) {
      // Ignore manual extraction error
    }
    
    return null;
  }
}

/**
 * Analyze document with vision models (for PDF processing)
 */
export async function analyzeDocument(
  provider: AIProvider,
  base64Data: string,
  prompt: string,
  mimeType: string = "application/pdf"
): Promise<string> {
  if (!['gemini-1.5-flash', 'gemini-1.5-pro', 'gpt-4o', 'grok-vision-beta'].includes(provider)) {
    throw new Error(`Provider ${provider} does not support document analysis`);
  }
  
  const { client, modelName, provider: providerType } = getAIClient(provider);
  
  try {
    switch (providerType) {
      case 'gemini': {
        const model = (client as GoogleGenerativeAI).getGenerativeModel({
          model: modelName,
          safetySettings,
        });
        
        const result = await model.generateContent([
          {
            inlineData: {
              data: base64Data,
              mimeType
            }
          },
          prompt
        ]);
        
        return result.response.text();
      }
      
      case 'openai': {
        const response = await (client as OpenAI).chat.completions.create({
          model: modelName,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`
                  }
                }
              ]
            }
          ],
          max_tokens: 4096,
        });
        
        return response.choices[0].message.content || "";
      }
      
      case 'xai': {
        const response = await (client as OpenAI).chat.completions.create({
          model: modelName,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`
                  }
                }
              ]
            }
          ],
          max_tokens: 4096,
        });
        
        return response.choices[0].message.content || "";
      }
      
      default:
        throw new Error(`Unknown provider type: ${providerType}`);
    }
  } catch (error) {
    console.error(`[AI Client] Document analysis error with ${provider}:`, error);
    throw error;
  }
}