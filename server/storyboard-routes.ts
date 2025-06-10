/**
 * Storyboard Routes
 * 
 * API endpoints for character-consistent storyboard generation
 */

import { Request, Response, Express } from "express";
import { storyboardService } from "./services/storyboard-service";

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function registerStoryboardRoutes(app: Express) {
  /**
   * Generate character profiles for a project
   */
  app.post('/api/projects/:projectId/storyboard/characters', requireAuth, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      console.log(`[Storyboard API] Generating character profiles for project ${projectId}`);
      
      const profiles = await storyboardService.generateCharacterProfiles(projectId);
      
      res.json({
        success: true,
        profiles,
        message: `Generated ${profiles.length} character profiles`
      });

    } catch (error) {
      console.error("[Storyboard API] Error generating character profiles:", error);
      res.status(500).json({
        error: "Failed to generate character profiles",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  /**
   * Generate storyboard image for a specific scene
   */
  app.post('/api/scenes/:sceneId/storyboard', requireAuth, async (req: Request, res: Response) => {
    try {
      const sceneId = parseInt(req.params.sceneId);
      
      if (isNaN(sceneId)) {
        return res.status(400).json({ error: "Invalid scene ID" });
      }

      console.log(`[Storyboard API] Generating storyboard image for scene ${sceneId}`);
      
      const storyboardImage = await storyboardService.generateSceneStoryboard(sceneId);
      
      res.json({
        success: true,
        storyboardImage,
        message: "Storyboard image generated successfully"
      });

    } catch (error) {
      console.error("[Storyboard API] Error generating scene storyboard:", error);
      res.status(500).json({
        error: "Failed to generate storyboard image",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  /**
   * Get existing storyboard image for a scene
   */
  app.get('/api/scenes/:sceneId/storyboard', requireAuth, async (req: Request, res: Response) => {
    try {
      const sceneId = parseInt(req.params.sceneId);
      
      if (isNaN(sceneId)) {
        return res.status(400).json({ error: "Invalid scene ID" });
      }

      const storyboardImage = await storyboardService.getSceneStoryboard(sceneId);
      
      if (!storyboardImage) {
        return res.status(404).json({ 
          error: "No storyboard image found for this scene",
          sceneId 
        });
      }

      res.json({
        success: true,
        storyboardImage
      });

    } catch (error) {
      console.error("[Storyboard API] Error fetching scene storyboard:", error);
      res.status(500).json({
        error: "Failed to fetch storyboard image",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  /**
   * Generate storyboard for entire project
   */
  app.post('/api/projects/:projectId/storyboard/generate', requireAuth, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      console.log(`[Storyboard API] Starting full project storyboard generation for project ${projectId}`);
      
      // Start generation asynchronously (don't wait for completion)
      storyboardService.generateProjectStoryboard(projectId)
        .then(() => {
          console.log(`[Storyboard API] Completed storyboard generation for project ${projectId}`);
        })
        .catch((error) => {
          console.error(`[Storyboard API] Failed storyboard generation for project ${projectId}:`, error);
        });
      
      res.json({
        success: true,
        message: "Storyboard generation started. This process will continue in the background.",
        projectId
      });

    } catch (error) {
      console.error("[Storyboard API] Error starting project storyboard generation:", error);
      res.status(500).json({
        error: "Failed to start storyboard generation",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  /**
   * Get all storyboard images for a project
   */
  app.get('/api/projects/:projectId/storyboard', requireAuth, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const storyboardImages = await storyboardService.getProjectStoryboard(projectId);
      
      res.json({
        success: true,
        storyboardImages,
        totalImages: storyboardImages.length
      });

    } catch (error) {
      console.error("[Storyboard API] Error fetching project storyboard:", error);
      res.status(500).json({
        error: "Failed to fetch project storyboard",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  /**
   * Get character profiles for a project
   */
  app.get('/api/projects/:projectId/storyboard/characters', requireAuth, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const { db } = await import("./db");
      const { characterProfiles } = await import("../shared/schema");
      const { eq } = await import("drizzle-orm");

      const profiles = await db
        .select()
        .from(characterProfiles)
        .where(eq(characterProfiles.projectId, projectId));
      
      res.json({
        success: true,
        profiles,
        totalProfiles: profiles.length
      });

    } catch (error) {
      console.error("[Storyboard API] Error fetching character profiles:", error);
      res.status(500).json({
        error: "Failed to fetch character profiles",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}