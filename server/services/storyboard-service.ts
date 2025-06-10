/**
 * Storyboard Service
 * 
 * Manages character-consistent image generation for storyboard visualization.
 * Maintains visual continuity across scenes by tracking character appearances
 * and generating consistent visual representations.
 */

import { db } from "../db";
import { projects, scenes, characterProfiles, storyboardImages } from "../../shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import { imagenGenerator } from "./imagen-generator";

export interface CharacterProfile {
  id: number;
  projectId: number;
  characterName: string;
  physicalDescription: string;
  costumeDescription: string;
  visualStyle: string;
  referenceImageUrl?: string;
  createdAt: Date;
}

export interface StoryboardImage {
  id: number;
  sceneId: number;
  imageUrl: string;
  prompt: string;
  charactersPresent: string[];
  generatedAt: Date;
}

export class StoryboardService {
  /**
   * Generate character profiles for consistent visual representation
   */
  async generateCharacterProfiles(projectId: number): Promise<CharacterProfile[]> {
    console.log(`[Storyboard] Generating character profiles for project ${projectId}`);
    
    // Get all scenes for the project
    const projectScenes = await db
      .select()
      .from(scenes)
      .where(eq(scenes.projectId, projectId));

    if (projectScenes.length === 0) {
      throw new Error("No scenes found for project");
    }

    // Extract all unique characters from scenes
    const allCharacters = new Set<string>();
    projectScenes.forEach(scene => {
      scene.characters.forEach(char => allCharacters.add(char));
    });

    const uniqueCharacters = Array.from(allCharacters);
    console.log(`[Storyboard] Found ${uniqueCharacters.length} unique characters:`, uniqueCharacters);

    // Get project info for context
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (project.length === 0) {
      throw new Error("Project not found");
    }

    const projectTitle = project[0].title;

    // Generate visual descriptions for each character
    const generatedProfiles: CharacterProfile[] = [];

    for (const characterName of uniqueCharacters) {
      try {
        // Find scenes where this character appears to get context
        const characterScenes = projectScenes.filter(scene => 
          scene.characters.includes(characterName)
        );

        // Build context from scene content
        const sceneContext = characterScenes
          .slice(0, 3) // Use first 3 scenes for context
          .map(scene => scene.content)
          .join('\n\n');

        const prompt = `Analyze this screenplay content for the character "${characterName}" in "${projectTitle}" and create a detailed visual description that will ensure consistent representation across all storyboard images.

SCENE CONTEXT:
${sceneContext.substring(0, 2000)}

Create a comprehensive character profile with:
1. PHYSICAL DESCRIPTION: Age range, height, build, facial features, hair, distinctive characteristics
2. COSTUME/CLOTHING: Primary outfit style, colors, accessories, any costume changes noted
3. VISUAL STYLE: Overall aesthetic, personality reflected in appearance, era/setting appropriate details

Respond in JSON format:
{
  "physicalDescription": "detailed physical appearance",
  "costumeDescription": "clothing and accessories", 
  "visualStyle": "overall aesthetic and style notes"
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.3 // Lower temperature for consistency
        });

        const profileData = JSON.parse(response.choices[0].message.content || '{}');

        // Save to database
        const [savedProfile] = await db
          .insert(characterProfiles)
          .values({
            projectId,
            characterName,
            physicalDescription: profileData.physicalDescription || `Character: ${characterName}`,
            costumeDescription: profileData.costumeDescription || "Standard costume",
            visualStyle: profileData.visualStyle || "Cinematic style"
          })
          .returning();

        generatedProfiles.push(savedProfile);
        console.log(`[Storyboard] Generated profile for ${characterName}`);

      } catch (error) {
        console.error(`[Storyboard] Error generating profile for ${characterName}:`, error);
        
        // Create fallback profile
        const [fallbackProfile] = await db
          .insert(characterProfiles)
          .values({
            projectId,
            characterName,
            physicalDescription: `${characterName} - character from ${projectTitle}`,
            costumeDescription: "Appropriate costume for the scene",
            visualStyle: "Cinematic film style"
          })
          .returning();

        generatedProfiles.push(fallbackProfile);
      }
    }

    return generatedProfiles;
  }

  /**
   * Generate storyboard image for a specific scene
   */
  async generateSceneStoryboard(sceneId: number): Promise<StoryboardImage> {
    console.log(`[Storyboard] Generating image for scene ${sceneId}`);

    // Get scene details
    const [scene] = await db
      .select()
      .from(scenes)
      .where(eq(scenes.id, sceneId))
      .limit(1);

    if (!scene) {
      throw new Error("Scene not found");
    }

    // Get character profiles for this project
    const profiles = await db
      .select()
      .from(characterProfiles)
      .where(
        and(
          eq(characterProfiles.projectId, scene.projectId),
          inArray(characterProfiles.characterName, scene.characters)
        )
      );

    // Build character consistency prompts
    const characterDescriptions = profiles.map(profile => 
      `${profile.characterName}: ${profile.physicalDescription}. ${profile.costumeDescription}. ${profile.visualStyle}`
    ).join('\n');

    // Create comprehensive storyboard prompt
    const storyboardPrompt = `Create a cinematic film storyboard frame for this scene:

SCENE: ${scene.description || `Scene ${scene.sceneNumber}`}
LOCATION: ${scene.location}
TIME: ${scene.timeOfDay}

SCENE CONTENT:
${scene.content.substring(0, 1000)}

CHARACTER CONSISTENCY (maintain these exact descriptions):
${characterDescriptions}

VISUAL REQUIREMENTS:
- Cinematic composition suitable for film storyboard
- Professional cinematography lighting and framing
- Show characters as described above with exact consistency
- Capture the key dramatic moment of the scene
- Film-quality production value
- Appropriate mood and atmosphere for the scene

Style: Professional film storyboard, cinematic lighting, movie production quality`;

    try {
      // Generate image using Google's Imagen-4 for high-quality storyboard images with retry logic
      let imageUrl: string;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          imageUrl = await imagenGenerator.generateImage({
            prompt: storyboardPrompt,
            aspectRatio: "16:9",
            safetyFilterLevel: "block_medium_and_above"
          });
          break; // Success, exit retry loop
        } catch (error: any) {
          retries++;
          console.log(`[Storyboard] Imagen-4 error for scene ${sceneId}, retry ${retries}/${maxRetries}:`, error.message);
          
          if (retries >= maxRetries) {
            // If all retries failed, log the error but don't stop the entire generation process
            console.log(`[Storyboard] Skipping scene ${sceneId} after ${maxRetries} failed attempts due to Imagen-4 errors`);
            throw error;
          }
          
          // Exponential backoff for API errors: 3s, 6s, 12s
          const delay = Math.pow(2, retries) * 1500;
          console.log(`[Storyboard] Retry ${retries}/${maxRetries} for scene ${sceneId} after ${delay}ms delay`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      if (!imageUrl) {
        throw new Error("No image URL returned from Imagen-4");
      }

      // Save storyboard image to database
      const [savedImage] = await db
        .insert(storyboardImages)
        .values({
          sceneId,
          imageUrl,
          prompt: storyboardPrompt,
          charactersPresent: scene.characters
        })
        .returning();

      console.log(`[Storyboard] Generated image for scene ${sceneId}`);
      return savedImage;

    } catch (error) {
      console.error(`[Storyboard] Error generating image for scene ${sceneId}:`, error);
      throw error;
    }
  }

  /**
   * Get existing storyboard image for a scene
   */
  async getSceneStoryboard(sceneId: number): Promise<StoryboardImage | null> {
    const [existingImage] = await db
      .select()
      .from(storyboardImages)
      .where(eq(storyboardImages.sceneId, sceneId))
      .orderBy(storyboardImages.generatedAt)
      .limit(1);

    return existingImage || null;
  }

  /**
   * Generate storyboard images for all scenes in a project
   */
  async generateProjectStoryboard(projectId: number): Promise<void> {
    console.log(`[Storyboard] Starting full project storyboard generation for project ${projectId}`);

    // First, ensure character profiles exist
    await this.generateCharacterProfiles(projectId);

    // Get all scenes for the project
    const projectScenes = await db
      .select()
      .from(scenes)
      .where(eq(scenes.projectId, projectId))
      .orderBy(scenes.sceneNumber);

    console.log(`[Storyboard] Generating images for ${projectScenes.length} scenes`);

    // Filter out scenes that already have images
    const scenesToGenerate = [];
    for (const scene of projectScenes) {
      const existingImage = await this.getSceneStoryboard(scene.id);
      if (!existingImage) {
        scenesToGenerate.push(scene);
      } else {
        console.log(`[Storyboard] Image already exists for scene ${scene.sceneNumber}`);
      }
    }

    if (scenesToGenerate.length === 0) {
      console.log(`[Storyboard] All scenes already have storyboard images`);
      return;
    }

    console.log(`[Storyboard] Generating ${scenesToGenerate.length} new images`);

    // Process scenes one at a time for better quality control and API stability
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 5;
    
    for (let i = 0; i < scenesToGenerate.length; i++) {
      const scene = scenesToGenerate[i];
      
      // Circuit breaker: pause if too many consecutive failures
      if (consecutiveFailures >= maxConsecutiveFailures) {
        console.log(`[Storyboard] Pausing generation due to ${consecutiveFailures} consecutive API failures. Waiting 30 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second pause
        consecutiveFailures = 0; // Reset counter after pause
      }
      
      try {
        console.log(`[Storyboard] Generating image for scene ${scene.sceneNumber} (${i + 1}/${scenesToGenerate.length})`);
        await this.generateSceneStoryboard(scene.id);
        console.log(`[Storyboard] Completed image for scene ${scene.sceneNumber}`);
        consecutiveFailures = 0; // Reset on success
        
        // Small delay between requests to respect API limits
        if (i + 1 < scenesToGenerate.length) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between images
        }
      } catch (error: any) {
        consecutiveFailures++;
        console.error(`[Storyboard] Failed to generate image for scene ${scene.sceneNumber} (failure ${consecutiveFailures}):`, error?.status || 'unknown', error?.message || error);
        
        // Continue with next scene even if one fails
        // Longer delay after failures to give API time to recover
        if (i + 1 < scenesToGenerate.length) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay after failures
        }
      }
    }

    console.log(`[Storyboard] Completed storyboard generation for project ${projectId}`);
  }

  /**
   * Get all storyboard images for a project
   */
  async getProjectStoryboard(projectId: number): Promise<(StoryboardImage & { sceneNumber: number })[]> {
    const result = await db
      .select({
        id: storyboardImages.id,
        sceneId: storyboardImages.sceneId,
        imageUrl: storyboardImages.imageUrl,
        prompt: storyboardImages.prompt,
        charactersPresent: storyboardImages.charactersPresent,
        generatedAt: storyboardImages.generatedAt,
        sceneNumber: scenes.sceneNumber
      })
      .from(storyboardImages)
      .innerJoin(scenes, eq(scenes.id, storyboardImages.sceneId))
      .where(eq(scenes.projectId, projectId))
      .orderBy(scenes.sceneNumber);

    return result;
  }
}

export const storyboardService = new StoryboardService();