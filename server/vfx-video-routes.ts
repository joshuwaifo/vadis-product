/**
 * VFX Video Generation Routes
 * 
 * API endpoints for generating VFX concept videos using Replicate's wan-2.1-i2v-480p model
 * Integrates with Gemini for prompt refinement and storyboard images as input
 */

import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Replicate from 'replicate';

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

interface VFXConceptRequest {
  sceneId: number;
  projectId: number;
  quality: 'low' | 'medium' | 'high';
}

interface VideoGenerationStatus {
  predictionId: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string;
  progress?: number;
  error?: string;
}

// Store active predictions in memory (in production, use Redis or database)
const activePredictions = new Map<string, VideoGenerationStatus>();

export function registerVFXVideoRoutes(app: any) {
  
  /**
   * Generate VFX concept video
   */
  app.post('/api/vfx/generate-concept', async (req: Request, res: Response) => {
    try {
      const { sceneId, projectId, quality }: VFXConceptRequest = req.body;

      if (!sceneId || !projectId || !quality) {
        return res.status(400).json({ 
          error: "Scene ID, project ID, and quality are required" 
        });
      }

      console.log(`[VFX Video] Starting video generation for scene ${sceneId} with ${quality} quality`);

      // Get scene data
      const { db } = require('./db');
      const { scenes, storyboardImages } = require('../shared/schema');
      const { eq, and } = require('drizzle-orm');

      const [scene] = await db
        .select()
        .from(scenes)
        .where(eq(scenes.id, sceneId))
        .limit(1);

      if (!scene) {
        return res.status(404).json({ error: "Scene not found" });
      }

      // Get storyboard image for the scene
      const [storyboardImage] = await db
        .select()
        .from(storyboardImages)
        .where(eq(storyboardImages.sceneId, sceneId))
        .limit(1);

      if (!storyboardImage) {
        return res.status(400).json({ 
          error: "No storyboard image found for this scene. Please generate a storyboard first." 
        });
      }

      // Generate refined prompt using Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
      
      const qualitySettings = {
        low: "basic VFX with simple effects",
        medium: "professional VFX with detailed effects and good quality",
        high: "cinematic VFX with advanced effects, high detail, and premium quality"
      };

      const promptRefinementRequest = `
You are a VFX supervisor creating a detailed prompt for video generation from a storyboard image.

Scene Details:
- Location: ${scene.location}
- Time: ${scene.timeOfDay}
- Description: ${scene.description}
- Quality Level: ${quality} (${qualitySettings[quality]})

Create a concise but detailed video prompt that describes:
1. The visual effects needed for this scene
2. Camera movement and cinematography
3. Lighting and atmosphere
4. Any special effects or transformations

Keep the prompt under 200 characters and focus on visual elements that can be achieved in video generation.
Do NOT include style instructions like "Studio Ghibli" or art style references.

Prompt:`;

      const promptResult = await model.generateContent(promptRefinementRequest);
      const refinedPrompt = promptResult.response.text().trim();

      console.log(`[VFX Video] Generated refined prompt: ${refinedPrompt}`);

      // Generate video using Replicate wan-2.1-i2v-480p
      const prediction = await replicate.predictions.create({
        version: "1e9e2b2f-aedc-4beb-8ac3-90c3f7fce6b8", // wan-2.1-i2v-480p version
        input: {
          image: storyboardImage.imageUrl,
          prompt: refinedPrompt,
          num_frames: quality === 'high' ? 48 : quality === 'medium' ? 32 : 24,
          guidance_scale: quality === 'high' ? 9.0 : quality === 'medium' ? 7.5 : 6.0,
          num_inference_steps: quality === 'high' ? 30 : quality === 'medium' ? 25 : 20,
        },
      });

      // Store prediction status
      activePredictions.set(prediction.id, {
        predictionId: prediction.id,
        status: prediction.status as any,
        progress: 0
      });

      console.log(`[VFX Video] Video generation started with prediction ID: ${prediction.id}`);

      res.json({
        success: true,
        predictionId: prediction.id,
        status: prediction.status,
        message: "VFX concept video generation started"
      });

    } catch (error) {
      console.error("[VFX Video] Error generating concept video:", error);
      res.status(500).json({
        error: "Failed to generate VFX concept video",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  /**
   * Check video generation status
   */
  app.get('/api/vfx/prediction/:predictionId', async (req: Request, res: Response) => {
    try {
      const { predictionId } = req.params;

      if (!predictionId) {
        return res.status(400).json({ error: "Prediction ID is required" });
      }

      // Get prediction status from Replicate
      const prediction = await replicate.predictions.get(predictionId);
      
      // Update local status
      const statusData: VideoGenerationStatus = {
        predictionId,
        status: prediction.status as any,
        output: prediction.output,
        error: prediction.error
      };

      // Calculate progress based on status
      if (prediction.status === 'starting') {
        statusData.progress = 10;
      } else if (prediction.status === 'processing') {
        statusData.progress = 60;
      } else if (prediction.status === 'succeeded') {
        statusData.progress = 100;
      } else if (prediction.status === 'failed') {
        statusData.progress = 0;
      }

      activePredictions.set(predictionId, statusData);

      console.log(`[VFX Video] Prediction ${predictionId} status: ${prediction.status}`);

      res.json(statusData);

    } catch (error) {
      console.error("[VFX Video] Error checking prediction status:", error);
      res.status(500).json({
        error: "Failed to check prediction status",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  /**
   * Get all predictions for a project
   */
  app.get('/api/vfx/predictions/project/:projectId', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;

      // In a real implementation, you'd query the database for predictions
      // For now, return active predictions
      const projectPredictions = Array.from(activePredictions.values());

      res.json({
        success: true,
        predictions: projectPredictions
      });

    } catch (error) {
      console.error("[VFX Video] Error fetching project predictions:", error);
      res.status(500).json({
        error: "Failed to fetch project predictions",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}