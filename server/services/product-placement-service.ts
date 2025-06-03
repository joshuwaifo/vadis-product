/**
 * Product Placement Service
 * 
 * Provides comprehensive product placement analysis including brandable scene
 * identification, creative prompt generation, and image generation for placements.
 */

import { generateContent } from './ai-agents/ai-client';
import type { AIProvider } from './ai-agents/ai-client';
import { storage } from '../storage';

export interface BrandableSceneAnalysis {
  sceneId: number;
  reason: string;
  suggestedProducts: string[];
}

export interface AIAnalysisResponseForRoutes {
  brandableScenes: BrandableSceneAnalysis[];
}

export interface GenerationRequest {
  scene: any;
  product: any;
  variationNumber: number;
  prompt: string;
}

export interface GenerationResult {
  imageUrl: string;
  description: string;
  success: boolean;
}

// Product categories available for placement
export const ProductCategory = {
  AUTOMOTIVE: 'AUTOMOTIVE',
  BEVERAGE: 'BEVERAGE',
  CLOTHING: 'CLOTHING',
  ELECTRONICS: 'ELECTRONICS',
  FOOD: 'FOOD',
  LIFESTYLE: 'LIFESTYLE',
  LUXURY: 'LUXURY',
  SPORTS: 'SPORTS',
  TECHNOLOGY: 'TECHNOLOGY',
  TRAVEL: 'TRAVEL'
} as const;

/**
 * Identify brandable scenes using AI analysis
 */
export async function identifyBrandableScenesWithGemini(
  scenes: any[],
  targetBrandableSceneCount: number = 5,
  provider: AIProvider = 'gemini-1.5-flash'
): Promise<AIAnalysisResponseForRoutes> {
  if (!scenes || scenes.length === 0) {
    console.log("[Brandable Analysis] No scenes provided for analysis.");
    return { brandableScenes: [] };
  }
  
  console.log(
    `[Brandable Analysis] Analyzing ${scenes.length} scenes for ${targetBrandableSceneCount} brandable candidates...`
  );

  try {
    const scenesTextForPrompt = scenes
      .map((scene) => {
        const safeLocation = scene.location || 'Unknown location';
        const safeDescription = (scene.description || scene.content || 'No description').substring(0, 500);
        return `SCENE_ID: ${scene.id}\nLOCATION: ${safeLocation}\nDESCRIPTION: ${safeDescription}...\n---`;
      })
      .join("\n");

    const prompt = `You are an expert film production assistant specializing in identifying product placement opportunities.

TASK: Analyze the following screenplay scene summaries. Identify exactly ${targetBrandableSceneCount} scenes that offer the MOST promising and natural opportunities for integrating branded products.

SELECTION CRITERIA:
- Visual Clarity: Scenes with clear visual elements
- Natural Integration: Products can be naturally incorporated
- Context Relevance: Scene context supports product placement
- Sufficient Detail: Enough description to understand the scene
- Safety: Appropriate content for brand association

RESPONSE FORMAT: Return ONLY a valid JSON object with this structure:
{
  "brandableScenes": [
    {
      "sceneId": 123,
      "reason": "Characters eating breakfast provides natural food/beverage placement opportunity",
      "suggestedProducts": ["FOOD", "BEVERAGE"]
    }
  ]
}

PRODUCT CATEGORIES: ${Object.values(ProductCategory).join(", ")}

SCREENPLAY SCENES:
---
${scenesTextForPrompt}
---

Return ONLY the JSON object, no additional text.`;

    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 2000
    });

    try {
      const parsedResponse: { brandableScenes?: BrandableSceneAnalysis[] } = JSON.parse(response);
      
      if (!parsedResponse.brandableScenes || !Array.isArray(parsedResponse.brandableScenes)) {
        console.error("[Brandable Analysis] Response not in expected format");
        return { brandableScenes: [] };
      }

      const sceneIdMap = new Map(scenes.map((s) => [s.id, true]));
      const validCategories = new Set(Object.values(ProductCategory));
      
      const validatedBrandableScenes = parsedResponse.brandableScenes
        .filter((bs) => {
          const sceneId = typeof bs.sceneId === "string" ? parseInt(bs.sceneId, 10) : bs.sceneId;
          
          if (isNaN(sceneId) || !sceneIdMap.has(sceneId)) {
            console.warn(`[Brandable Analysis] Invalid sceneId ${bs.sceneId}`);
            return false;
          }
          
          if (typeof bs.reason !== "string" || bs.reason.length < 10) {
            console.warn(`[Brandable Analysis] Invalid reason for ${sceneId}`);
            return false;
          }
          
          if (!Array.isArray(bs.suggestedProducts) || bs.suggestedProducts.length === 0) {
            console.warn(`[Brandable Analysis] Invalid suggestedProducts for ${sceneId}`);
            return false;
          }
          
          if (!bs.suggestedProducts.every((p) => validCategories.has(p as any))) {
            console.warn(`[Brandable Analysis] Invalid category in suggestedProducts for ${sceneId}`);
            return false;
          }

          bs.sceneId = sceneId;
          return true;
        })
        .slice(0, targetBrandableSceneCount);

      console.log(`[Brandable Analysis] Identified ${validatedBrandableScenes.length} valid brandable scenes`);
      return { brandableScenes: validatedBrandableScenes };
      
    } catch (parseError) {
      console.error("[Brandable Analysis] Failed to parse JSON:", parseError);
      return { brandableScenes: [] };
    }
  } catch (error: any) {
    console.error("[Brandable Analysis] Error analyzing scenes:", error.message || error);
    return { brandableScenes: [] };
  }
}

/**
 * Generate creative placement prompt for image generation
 */
export async function generateCreativePlacementPrompt(
  scene: any,
  product: any,
  provider: AIProvider = 'gemini-1.5-flash'
): Promise<string> {
  const logPrefix = `[Creative Prompt S:${scene.sceneNumber}/P:${product.id}]`;
  console.log(`${logPrefix} Generating creative prompt...`);
  
  const fallbackPrompt = `Cinematic film still, ${scene.location}. A ${product.name} is naturally integrated into the scene. Photorealistic, high detail.`;
  
  try {
    const safeSceneContext = (scene.description || scene.content || 'No scene content provided').substring(0, 500);
    const safeLocation = scene.location || 'Unknown location';
    
    const promptToAI = `Act as a creative director for film product placement. Generate a single, descriptive, visually rich prompt (max 100 words) for an AI image generator.

The prompt must depict:
SCENE CONTEXT: Location: ${safeLocation}, Description: ${safeSceneContext}
PRODUCT: ${product.name}, Category: ${product.category}, Brand: ${product.brand || product.companyName || 'Unknown brand'}

Requirements:
- Emphasize photorealism and cinematic lighting
- Ensure natural product integration
- High detail and professional composition
- Maintain neutral, professional tone
- Avoid violence, explicit content, or controversial elements

OUTPUT: Respond ONLY with the generated prompt text. No introductions or explanations.`;

    const response = await generateContent(provider, promptToAI, {
      maxTokens: 200
    });

    let generatedPrompt = response.trim();
    
    if (!generatedPrompt || generatedPrompt.length < 20) {
      console.warn(`${logPrefix} Generated prompt too short, using fallback`);
      return fallbackPrompt;
    }

    // Clean up the prompt
    generatedPrompt = generatedPrompt.replace(/[""]/g, '"');
    generatedPrompt = generatedPrompt.replace(/\s+/g, ' ');
    
    // Ensure it ends properly
    if (!generatedPrompt.endsWith('.') && !generatedPrompt.endsWith(',')) {
      generatedPrompt += '.';
    }

    console.log(`${logPrefix} Generated prompt: ${generatedPrompt.substring(0, 100)}...`);
    return generatedPrompt;
    
  } catch (error) {
    console.error(`${logPrefix} Error generating creative prompt:`, error);
    return fallbackPrompt;
  }
}

/**
 * Generate product placement image (placeholder implementation)
 * Note: This would integrate with image generation services like Replicate
 */
export async function generateProductPlacement(request: GenerationRequest): Promise<GenerationResult> {
  const { scene, product, variationNumber, prompt } = request;
  const logPrefix = `[Product Placement S${scene.sceneNumber} V${variationNumber} P:${product.id}]`;
  
  console.log(`${logPrefix} Generating product placement image...`);
  
  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 10) {
    console.error(`${logPrefix} Invalid or empty prompt received`);
    return {
      imageUrl: "https://via.placeholder.com/1024x576/cccccc/666666?text=Image+Generation+Placeholder",
      description: "Error: Invalid generation prompt.",
      success: false,
    };
  }

  try {
    // This is a placeholder implementation
    // In production, this would integrate with Replicate or similar services
    console.log(`${logPrefix} Using prompt: ${prompt.substring(0, 100)}...`);
    
    return {
      imageUrl: "https://via.placeholder.com/1024x576/e6f3ff/0066cc?text=Product+Placement+Generated",
      description: `Product placement variation ${variationNumber} for ${product.name} in scene ${scene.sceneNumber}`,
      success: true,
    };
    
  } catch (error) {
    console.error(`${logPrefix} Error generating product placement:`, error);
    return {
      imageUrl: "https://via.placeholder.com/1024x576/ffcccc/cc0000?text=Generation+Failed",
      description: "Error: Failed to generate product placement image.",
      success: false,
    };
  }
}

/**
 * Find matching products for a scene based on suggested categories
 */
export async function getTopMatchingProductsForScene(
  sceneId: number,
  suggestedCategories: string[],
  limit: number = 3
): Promise<any[]> {
  try {
    // This would be implemented to fetch products from the database
    // For now, return empty array as products are managed separately
    console.log(`[Product Matching] Finding products for scene ${sceneId} with categories: ${suggestedCategories.join(', ')}`);
    return [];
  } catch (error) {
    console.error("Error fetching matching products:", error);
    return [];
  }
}

/**
 * Create scene variation record for generated product placement
 */
export async function createSceneVariation(data: {
  projectId: number;
  sceneId: number;
  productId: number;
  variationNumber: number;
  imageUrl: string;
  prompt: string;
  description: string;
}): Promise<void> {
  try {
    // This would integrate with the scene variations storage
    // For now, log the creation attempt
    console.log(`[Scene Variation] Creating variation for scene ${data.sceneId}, product ${data.productId}`);
    
    // In production, this would call something like:
    // await storage.createSceneVariation(data);
    
  } catch (error) {
    console.error("Error creating scene variation:", error);
    throw error;
  }
}

/**
 * Generate video from scene variation (placeholder for Replicate integration)
 */
export async function generateVideoFromVariation(
  variationId: number,
  imageUrl: string,
  duration: number = 3
): Promise<{ predictionId: string; status: string }> {
  const logPrefix = `[Video Generation V:${variationId}]`;
  console.log(`${logPrefix} Starting video generation...`);
  
  try {
    // This would integrate with Replicate for video generation
    // For now, return a mock prediction ID
    const predictionId = `pred_${Date.now()}_${variationId}`;
    
    console.log(`${logPrefix} Video generation started with prediction ID: ${predictionId}`);
    
    return {
      predictionId,
      status: 'starting'
    };
    
  } catch (error) {
    console.error(`${logPrefix} Error generating video:`, error);
    throw new Error(`Failed to generate video: ${error}`);
  }
}

/**
 * Check video generation status
 */
export async function getPredictionStatus(predictionId: string): Promise<{
  status: string;
  output?: string;
  error?: string;
  progress?: number;
}> {
  const logPrefix = `[Video Status ${predictionId}]`;
  
  try {
    // This would check Replicate prediction status
    // For now, simulate different statuses based on time
    const createdTime = parseInt(predictionId.split('_')[1]) || Date.now();
    const elapsed = Date.now() - createdTime;
    
    if (elapsed < 10000) {
      return { status: 'processing', progress: 25 };
    } else if (elapsed < 20000) {
      return { status: 'processing', progress: 75 };
    } else {
      return {
        status: 'succeeded',
        output: 'https://via.placeholder.com/1024x576/00ff00/ffffff?text=Generated+Video+Placeholder',
        progress: 100
      };
    }
    
  } catch (error) {
    console.error(`${logPrefix} Error checking status:`, error);
    return {
      status: 'failed',
      error: `Failed to check prediction status: ${error}`
    };
  }
}