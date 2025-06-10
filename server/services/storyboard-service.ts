/**
 * Storyboard Service
 * 
 * Manages character-consistent image generation for storyboard visualization.
 * Maintains visual continuity across scenes by tracking character appearances
 * and generating consistent visual representations.
 */

import OpenAI from "openai";
import { db } from "../db";
import { projects, scenes, characterProfiles, storyboardImages } from "../../shared/schema";
import { eq, and, inArray } from "drizzle-orm";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    const characterProfiles: CharacterProfile[] = [];

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

        characterProfiles.push(savedProfile);
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

        characterProfiles.push(fallbackProfile);
      }
    }

    return characterProfiles;
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
      // Generate image using DALL-E
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: storyboardPrompt,
        n: 1,
        size: "1792x1024", // Widescreen format for cinematic feel
        quality: "standard",
      });

      const imageUrl = response.data[0].url;

      if (!imageUrl) {
        throw new Error("No image URL returned from OpenAI");
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

    // Generate images for each scene (with some delay to avoid rate limits)
    for (let i = 0; i < projectScenes.length; i++) {
      const scene = projectScenes[i];
      
      try {
        // Check if image already exists
        const existingImage = await this.getSceneStoryboard(scene.id);
        
        if (!existingImage) {
          await this.generateSceneStoryboard(scene.id);
          
          // Add delay between generations to respect rate limits
          if (i < projectScenes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          console.log(`[Storyboard] Image already exists for scene ${scene.sceneNumber}`);
        }
        
      } catch (error) {
        console.error(`[Storyboard] Failed to generate image for scene ${scene.sceneNumber}:`, error);
        // Continue with next scene rather than failing entire batch
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