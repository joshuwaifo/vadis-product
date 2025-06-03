/**
 * VFX Analysis Service
 * 
 * Provides comprehensive VFX analysis for film scripts including
 * scene-by-scene VFX identification and detailed tier analysis.
 */

import { generateContent } from './ai-agents/ai-client';
import type { AIProvider } from './ai-agents/ai-client';
import { storage } from '../storage';

export interface VfxSceneAnalysis {
  sceneId: number;
  sceneNumber: number;
  isVfxScene: boolean;
  vfxDescription: string | null;
  vfxKeywords: string[];
}

export interface VfxTierDetails {
  vfxElementsSummary: string;
  estimatedVfxCost: number;
  costEstimationNotes: string;
  conceptualImageUrl?: string | null;
  conceptualVideoUrl?: string | null;
}

/**
 * Analyze script scenes to identify VFX requirements
 */
export async function analyzeAndStoreScriptVFX(
  projectId: number,
  scriptContent: string,
  allScenes: any[],
  provider: AIProvider = 'gemini-1.5-flash'
): Promise<void> {
  const logPrefix = `[VFX Analysis for Project ${projectId}]`;
  
  try {
    console.log(`${logPrefix} Starting VFX analysis for ${allScenes.length} scenes`);
    
    const scenesFormatted = allScenes.map(scene => 
      `Scene ${scene.sceneNumber}: ${scene.location} - ${scene.description || 'No description'}`
    ).join('\n');
    
    const prompt = `Analyze these script scenes to identify which ones require VFX work.

VFX scenes include: explosions, supernatural elements, impossible physics, weather effects, sci-fi technology, green screen needs, digital environments, superhuman abilities, magical elements, futuristic technology, space scenes, underwater scenes, creature effects.

NON-VFX scenes include: regular dialogue, normal human actions, real vehicles, natural outdoor scenes, interior scenes with practical props, everyday activities.

SCENES TO ANALYZE:
${scenesFormatted}

For each scene, respond with exactly this format (one line per scene):
sceneNumber|isVfxScene|description|keywords

Examples:
1|true|Explosion destroys building|explosion,destruction,debris
2|false||
3|true|Character flies through air|flying,supernatural,gravity

Use this exact format - one line per scene, separated by | characters. For non-VFX scenes, use "false" and leave description and keywords empty but keep the | separators.`;

    const response = await generateContent(provider, prompt, {
      maxTokens: 3000
    });
    
    console.log(`${logPrefix} Received VFX analysis response`);
    
    // Parse the response format: sceneNumber|isVfxScene|description|keywords
    const lines = response.trim().split('\n');
    const analysisResults: VfxSceneAnalysis[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || !trimmedLine.includes('|')) continue;
      
      const parts = trimmedLine.split('|');
      if (parts.length < 2) continue;
      
      const sceneNumber = parseInt(parts[0]);
      const isVfxScene = parts[1].toLowerCase() === 'true';
      const vfxDescription = parts[2] || null;
      const vfxKeywords = parts[3] ? parts[3].split(',').map(k => k.trim()) : [];
      
      if (!isNaN(sceneNumber)) {
        // Find corresponding scene
        const scene = allScenes.find(s => s.sceneNumber === sceneNumber);
        const sceneId = scene ? scene.id : 0;
        
        analysisResults.push({
          sceneId,
          sceneNumber,
          isVfxScene,
          vfxDescription,
          vfxKeywords
        });
      }
    }
    
    console.log(`${logPrefix} Successfully parsed ${analysisResults.length} scene analyses`);

    // Update scenes with VFX information
    let updatedCount = 0;
    let vfxScenesCount = 0;

    for (const analysis of analysisResults) {
      try {
        const scene = allScenes.find(s => s.sceneNumber === analysis.sceneNumber);
        
        if (!scene) {
          console.warn(`${logPrefix} Could not find scene with number ${analysis.sceneNumber}`);
          continue;
        }

        // Update scene with VFX information
        await storage.updateScene(scene.id, {
          vfxNeeds: analysis.isVfxScene ? analysis.vfxKeywords : [],
        });

        updatedCount++;
        
        if (analysis.isVfxScene) {
          vfxScenesCount++;
          console.log(`${logPrefix} Scene ${scene.sceneNumber} marked as VFX: ${analysis.vfxDescription}`);
        }

      } catch (updateError) {
        console.error(`${logPrefix} Error updating scene ${analysis.sceneNumber}:`, updateError);
      }
    }

    console.log(`${logPrefix} VFX analysis complete. Updated ${updatedCount} scenes, ${vfxScenesCount} identified as VFX scenes`);

  } catch (error) {
    console.error(`${logPrefix} Error during VFX analysis:`, error);
    throw error;
  }
}

/**
 * Generate detailed VFX tier analysis for a specific scene
 */
export async function generateVFXTierDetailsForScene(
  scene: any,
  vfxDescription: string,
  vfxKeywords: string[],
  provider: AIProvider = 'gemini-1.5-pro'
): Promise<{ [tier: string]: VfxTierDetails }> {
  const logPrefix = `[VFX Tier Gen Scene ${scene.id}]`;
  
  try {
    console.log(`${logPrefix} Starting VFX tier detail generation`);
    
    const qualityTiers = ['LOW', 'MEDIUM', 'HIGH'];
    const tierDetails: { [tier: string]: VfxTierDetails } = {};
    
    // Process each quality tier
    for (const tier of qualityTiers) {
      try {
        console.log(`${logPrefix} Processing ${tier} tier`);
        
        const prompt = `You are a VFX supervisor creating detailed cost estimates and element breakdowns.

TASK: Analyze this VFX scene and provide specific details for ${tier} quality tier production.

SCENE DESCRIPTION: ${vfxDescription}
VFX KEYWORDS: ${vfxKeywords.join(', ')}
QUALITY TIER: ${tier}

COST ESTIMATION GUIDELINES:
- LOW tier: Basic VFX, simple compositing ($5,000-$15,000 USD for short sequence)
- MEDIUM tier: Professional VFX, detailed simulations ($20,000-$75,000 USD for short sequence) 
- HIGH tier: Photorealistic, complex VFX ($100,000-$500,000 USD for short sequence)

Please provide a JSON response with this exact structure:
{
  "vfxElementsSummary": "Brief description of VFX elements for this tier",
  "estimatedVfxCost": 25000,
  "costEstimationNotes": "Brief justification for the cost estimate"
}

INSTRUCTIONS:
1. vfxElementsSummary: 1-2 sentences describing what VFX elements would be created for this tier
2. estimatedVfxCost: Specific dollar amount within the tier range
3. costEstimationNotes: Brief explanation of cost factors

Return ONLY the JSON object, no additional text.`;

        const response = await generateContent(provider, prompt, {
          responseFormat: 'json',
          maxTokens: 1000
        });
        
        // Parse the JSON response
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(response);
        } catch (parseError) {
          console.error(`${logPrefix} Failed to parse ${tier} tier response:`, parseError);
          continue;
        }
        
        if (!parsedResponse.vfxElementsSummary || !parsedResponse.estimatedVfxCost || !parsedResponse.costEstimationNotes) {
          console.error(`${logPrefix} Invalid tier details structure for ${tier}`);
          continue;
        }

        tierDetails[tier] = {
          vfxElementsSummary: parsedResponse.vfxElementsSummary,
          estimatedVfxCost: parseInt(parsedResponse.estimatedVfxCost),
          costEstimationNotes: parsedResponse.costEstimationNotes,
          conceptualImageUrl: null, // Future enhancement
          conceptualVideoUrl: null  // Future enhancement
        };

        console.log(`${logPrefix} ${tier} tier: ${parsedResponse.vfxElementsSummary} (Cost: $${parsedResponse.estimatedVfxCost})`);
        
      } catch (tierError) {
        console.error(`${logPrefix} Error processing ${tier} tier:`, tierError);
        // Continue with other tiers even if one fails
      }
    }
    
    console.log(`${logPrefix} VFX tier detail generation completed`);
    return tierDetails;
    
  } catch (error) {
    console.error(`${logPrefix} Error during VFX tier generation:`, error);
    throw error;
  }
}

/**
 * Extract JSON from a text response that may contain additional formatting
 */
function extractJsonFromString(text: string): string | null {
  try {
    // Try to find JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : null;
  } catch (error) {
    return null;
  }
}