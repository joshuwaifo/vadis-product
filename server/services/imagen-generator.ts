/**
 * Google Imagen-4 Image Generator Service
 * 
 * High-quality image generation using Google's Imagen-4 model via Replicate
 * Provides superior quality and reliability for storyboard generation
 */

import Replicate from "replicate";

export interface ImagenGenerationOptions {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "2:3" | "3:2" | "4:5" | "5:4";
  safetyFilterLevel?: "block_most" | "block_medium_and_above" | "block_some" | "block_few";
  seed?: number;
}

export class ImagenGenerator {
  private replicate: Replicate;

  constructor() {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN environment variable is required");
    }

    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  /**
   * Generate a high-quality image using Google's Imagen-4 model
   */
  async generateImage(options: ImagenGenerationOptions): Promise<string> {
    const {
      prompt,
      aspectRatio = "16:9",
      safetyFilterLevel = "block_medium_and_above",
      seed
    } = options;

    try {
      console.log("[Imagen] Generating image with prompt:", prompt.substring(0, 100) + "...");

      const input = {
        prompt,
        aspect_ratio: aspectRatio,
        safety_filter_level: safetyFilterLevel,
        ...(seed && { seed })
      };

      const output = await this.replicate.run("google/imagen-4", { input });
      
      console.log("[Imagen] Raw output from Imagen-4:", JSON.stringify(output));
      console.log("[Imagen] Output type:", typeof output);
      
      // Imagen-4 returns an object that converts to URL string via toString()
      let imageUrl: string;
      
      if (typeof output === 'string' && output.startsWith('http')) {
        imageUrl = output;
      } else if (Array.isArray(output)) {
        // Find the first valid URL in the array
        const validUrl = output.find(item => 
          typeof item === 'string' && item.startsWith('http')
        );
        if (validUrl) {
          imageUrl = validUrl;
        } else {
          throw new Error(`Array output contains no valid URLs: ${JSON.stringify(output)}`);
        }
      } else if (output && typeof output === 'object') {
        // Special case: Imagen-4 returns object that converts to URL via toString()
        const stringUrl = String(output);
        console.log("[Imagen] String conversion of output:", stringUrl);
        
        if (stringUrl && stringUrl.startsWith('http')) {
          imageUrl = stringUrl;
        } else {
          // Check for common URL properties as fallback
          const urlFields = ['url', 'image_url', 'output_url', 'result'];
          let found = false;
          for (const field of urlFields) {
            if (field in output && typeof (output as any)[field] === 'string') {
              imageUrl = (output as any)[field];
              found = true;
              break;
            }
          }
          if (!found) {
            throw new Error(`Object output has no valid URL: string="${stringUrl}", fields=${JSON.stringify(Object.keys(output))}`);
          }
        }
      } else {
        throw new Error(`Unexpected output format: ${typeof output} - ${JSON.stringify(output)}`);
      }

      if (!imageUrl || !imageUrl.startsWith('http')) {
        throw new Error(`Invalid image URL format: ${imageUrl}`);
      }

      console.log("[Imagen] Successfully generated image, URL:", imageUrl.substring(0, 100) + "...");
      return imageUrl;

    } catch (error: any) {
      console.error("[Imagen] Error generating image:", error);
      throw new Error(`Imagen-4 generation failed: ${error.message}`);
    }
  }

  /**
   * Generate multiple images in sequence with rate limiting
   */
  async generateBatch(prompts: string[], options: Partial<ImagenGenerationOptions> = {}): Promise<string[]> {
    const results: string[] = [];
    
    for (let i = 0; i < prompts.length; i++) {
      try {
        console.log(`[Imagen] Generating batch image ${i + 1}/${prompts.length}`);
        
        const imageUrl = await this.generateImage({
          ...options,
          prompt: prompts[i]
        });
        
        results.push(imageUrl);
        
        // Rate limiting: 2 second delay between requests
        if (i + 1 < prompts.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`[Imagen] Failed to generate batch image ${i + 1}:`, error);
        // Continue with next image even if one fails
      }
    }
    
    return results;
  }
}

export const imagenGenerator = new ImagenGenerator();

/**
 * Generate Ghibli-style storyboard image
 */
export async function generateImagenStoryboard(prompt: string): Promise<string> {
  return await imagenGenerator.generateImage({
    prompt,
    aspectRatio: "16:9",
    safetyFilterLevel: "block_medium_and_above"
  });
}