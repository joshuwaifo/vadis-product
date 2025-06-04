/**
 * Script Generation Routes
 * 
 * API endpoints for AI-powered screenplay generation
 * Integrates with the script generation service for comprehensive script creation
 */
import { Request, Response } from 'express';
import { z } from 'zod';
import { generateScript, ScriptGenerationRequest } from './services/script-generation-service';
import { db } from './db';
import { projects } from '@shared/schema';
import { eq } from 'drizzle-orm';

const scriptGenerationSchema = z.object({
  projectTitle: z.string().min(1, "Project title is required"),
  logline: z.string().optional(),
  description: z.string().optional(),
  genre: z.string().min(1, "Genre is required"),
  targetedRating: z.enum(['G', 'PG', 'PG-13', 'R', 'NC-17']),
  storyLocation: z.string().optional(),
  concept: z.string().optional(),
  specialRequest: z.string().optional(),
  projectId: z.number().optional()
});

export function registerScriptGenerationRoutes(app: any) {
  
  /**
   * Generate a new script using AI with streaming
   */
  app.post('/api/script-generation/generate', async (req: Request, res: Response) => {
    try {
      const validatedData = scriptGenerationSchema.parse(req.body);
      
      console.log('[Script Generation] Starting generation for:', validatedData.projectTitle);
      
      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });
      
      let accumulatedScript = '';
      let tokenCount = 0;
      
      // Custom callback to stream progress
      const progressCallback = (chunk: string, tokens: number) => {
        accumulatedScript += chunk;
        tokenCount = tokens;
        
        // Send progress update
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          content: accumulatedScript,
          tokenCount: tokenCount,
          chunk: chunk
        })}\n\n`);
      };
      
      // Generate the script using AI with streaming
      const generatedScript = await generateScript(validatedData as ScriptGenerationRequest, progressCallback);
      
      // If projectId is provided, update the project with the generated script
      if (validatedData.projectId) {
        await db
          .update(projects)
          .set({ 
            scriptContent: generatedScript,
            updatedAt: new Date()
          })
          .where(eq(projects.id, validatedData.projectId));
        
        console.log(`[Script Generation] Updated project ${validatedData.projectId} with generated script`);
      }
      
      // Send completion event
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        script: generatedScript,
        tokenCount: tokenCount,
        success: true
      })}\n\n`);
      
      res.end();
      
    } catch (error: any) {
      console.error('[Script Generation] Error:', error.message);
      
      // Send error event
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error.message
      })}\n\n`);
      
      res.end();
    }
  });

  /**
   * Get script generation templates and presets
   */
  app.get('/api/script-generation/templates', async (req: Request, res: Response) => {
    try {
      const templates = {
        genres: [
          'Action',
          'Adventure',
          'Comedy',
          'Drama',
          'Horror',
          'Romance',
          'Sci-Fi',
          'Thriller',
          'Fantasy',
          'Mystery',
          'Crime',
          'Western',
          'War',
          'Biography',
          'Documentary'
        ],
        ratings: [
          { value: 'G', label: 'G - General Audiences' },
          { value: 'PG', label: 'PG - Parental Guidance' },
          { value: 'PG-13', label: 'PG-13 - Parents Strongly Cautioned' },
          { value: 'R', label: 'R - Restricted' },
          { value: 'NC-17', label: 'NC-17 - Adults Only' }
        ],
        samplePrompts: [
          {
            genre: 'Action',
            logline: 'A retired special forces operative must rescue his daughter from international terrorists.',
            concept: 'High-octane action sequences with emotional father-daughter relationship at the core.'
          },
          {
            genre: 'Comedy',
            logline: 'Two mismatched roommates accidentally become viral internet sensations.',
            concept: 'Modern comedy exploring social media culture and unlikely friendships.'
          },
          {
            genre: 'Drama',
            logline: 'A struggling artist discovers a family secret that changes everything.',
            concept: 'Character-driven story about identity, family, and personal growth.'
          }
        ]
      };
      
      res.json({
        success: true,
        templates
      });
      
    } catch (error: any) {
      console.error('[Script Generation] Templates error:', error.message);
      res.status(500).json({
        success: false,
        error: "Failed to fetch templates"
      });
    }
  });

  /**
   * Validate script generation parameters
   */
  app.post('/api/script-generation/validate', async (req: Request, res: Response) => {
    try {
      const validatedData = scriptGenerationSchema.parse(req.body);
      
      res.json({
        success: true,
        message: "Parameters are valid",
        estimatedLength: "90-120 pages",
        estimatedTime: "5-10 minutes"
      });
      
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: "Invalid parameters",
        details: error.errors
      });
    }
  });

  /**
   * Get script generation status/progress
   */
  app.get('/api/script-generation/status/:jobId', async (req: Request, res: Response) => {
    try {
      // For now, this is a simple implementation
      // In a production environment, you might want to track generation jobs
      res.json({
        success: true,
        status: 'completed',
        progress: 100
      });
      
    } catch (error: any) {
      console.error('[Script Generation] Status error:', error.message);
      res.status(500).json({
        success: false,
        error: "Failed to get generation status"
      });
    }
  });
}