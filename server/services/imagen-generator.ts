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
      
      // Replicate returns the image URL as a string
      let imageUrl: string;
      if (typeof output === 'string') {
        imageUrl = output;
      } else if (Array.isArray(output) && output.length > 0) {
        imageUrl = output[0];
      } else if (output && typeof output === 'object' && 'url' in output) {
        imageUrl = (output as any).url;
      } else {
        imageUrl = String(output);
      }

      if (!imageUrl || imageUrl === '{}' || imageUrl === 'null' || imageUrl === 'undefined') {
        throw new Error("No valid image URL returned from Imagen-4");
      }

      console.log("[Imagen] Successfully generated image, URL:", imageUrl);
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