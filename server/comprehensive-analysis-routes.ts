import { Request, Response } from "express";
import { extractScenes, analyzeCharacters, suggestActors, analyzeVFXNeeds, generateProductPlacement, suggestLocations, generateFinancialPlan, generateProjectSummary } from "./script-analysis-agents";
import { db } from "./db";
import { projects, scenes, characters, actorSuggestions, vfxNeeds, productPlacements, locationSuggestions, financialPlans } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Comprehensive script analysis routes based on ANNEX C technical roadmap
 * Handles all AI-powered analysis features for the Vadis platform
 */

export function registerComprehensiveAnalysisRoutes(app: any) {
  
  // Scene extraction and breakdown
  app.post('/api/script-analysis/scene_extraction', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      if (!projectId || !scriptContent) {
        return res.status(400).json({ error: 'Project ID and script content are required' });
      }

      // Extract scenes using AI
      const extractedScenes = await extractScenes(scriptContent);
      
      // Save scenes to database
      const savedScenes = await Promise.all(
        extractedScenes.map(async (scene) => {
          const [savedScene] = await db
            .insert(scenes)
            .values({
              projectId: parseInt(projectId),
              sceneNumber: scene.sceneNumber,
              location: scene.location,
              timeOfDay: scene.timeOfDay,
              description: scene.description,
              characters: scene.characters,
              content: scene.content,
              pageStart: scene.pageStart,
              pageEnd: scene.pageEnd,
              duration: scene.duration,
              vfxNeeds: scene.vfxNeeds,
              productPlacementOpportunities: scene.productPlacementOpportunities
            })
            .returning();
          return savedScene;
        })
      );

      res.json({
        success: true,
        scenes: savedScenes,
        totalScenes: savedScenes.length,
        estimatedDuration: savedScenes.reduce((total, scene) => total + (scene.duration || 0), 0)
      });

    } catch (error) {
      console.error('Scene extraction error:', error);
      res.status(500).json({ error: 'Failed to extract scenes from script' });
    }
  });

  // Character analysis
  app.post('/api/script-analysis/character_analysis', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      const analyzedCharacters = await analyzeCharacters(scriptContent);
      
      // Save characters to database
      const savedCharacters = await Promise.all(
        analyzedCharacters.map(async (character) => {
          const [savedCharacter] = await db
            .insert(characters)
            .values({
              projectId: parseInt(projectId),
              name: character.name,
              description: character.description,
              age: character.age,
              gender: character.gender,
              personality: character.personality,
              importance: character.importance,
              screenTime: character.screenTime,
              relationships: character.relationships,
              characterArc: character.characterArc
            })
            .returning();
          return savedCharacter;
        })
      );

      res.json({
        success: true,
        characters: savedCharacters,
        totalCharacters: savedCharacters.length
      });

    } catch (error) {
      console.error('Character analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze characters' });
    }
  });

  // AI Casting Director
  app.post('/api/script-analysis/casting_suggestions', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      // Get existing characters for this project
      const projectCharacters = await db
        .select()
        .from(characters)
        .where(eq(characters.projectId, parseInt(projectId)));

      if (projectCharacters.length === 0) {
        return res.status(400).json({ error: 'No characters found. Please run character analysis first.' });
      }

      const castingSuggestions = await suggestActors(projectCharacters, scriptContent);
      
      // Save casting suggestions
      const savedSuggestions = await Promise.all(
        castingSuggestions.map(async (suggestion) => {
          const [saved] = await db
            .insert(actorSuggestions)
            .values({
              projectId: parseInt(projectId),
              characterName: suggestion.characterName,
              suggestions: suggestion.suggestions
            })
            .returning();
          return saved;
        })
      );

      res.json({
        success: true,
        castingSuggestions: savedSuggestions
      });

    } catch (error) {
      console.error('Casting suggestions error:', error);
      res.status(500).json({ error: 'Failed to generate casting suggestions' });
    }
  });

  // Location Intelligence
  app.post('/api/script-analysis/location_analysis', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      // Get existing scenes for this project
      const projectScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, parseInt(projectId)));

      if (projectScenes.length === 0) {
        return res.status(400).json({ error: 'No scenes found. Please run scene extraction first.' });
      }

      const locationSuggestionsList = await suggestLocations(projectScenes, scriptContent);
      
      // Save location suggestions
      const savedLocations = await Promise.all(
        locationSuggestionsList.map(async (locationSugg) => {
          const [saved] = await db
            .insert(locationSuggestions)
            .values({
              projectId: parseInt(projectId),
              sceneId: locationSugg.sceneId,
              locationType: locationSugg.locationType,
              suggestions: locationSugg.suggestions
            })
            .returning();
          return saved;
        })
      );

      res.json({
        success: true,
        locationSuggestions: savedLocations
      });

    } catch (error) {
      console.error('Location analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze locations' });
    }
  });

  // VFX Requirements Analysis
  app.post('/api/script-analysis/vfx_analysis', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      // Get existing scenes for this project
      const projectScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, parseInt(projectId)));

      const vfxRequirements = await analyzeVFXNeeds(projectScenes, scriptContent);
      
      // Save VFX needs
      const savedVFX = await Promise.all(
        vfxRequirements.map(async (vfx) => {
          const [saved] = await db
            .insert(vfxNeeds)
            .values({
              projectId: parseInt(projectId),
              sceneId: vfx.sceneId,
              sceneDescription: vfx.sceneDescription,
              vfxType: vfx.vfxType,
              complexity: vfx.complexity,
              estimatedCost: vfx.estimatedCost,
              description: vfx.description,
              referenceImages: vfx.referenceImages
            })
            .returning();
          return saved;
        })
      );

      res.json({
        success: true,
        vfxNeeds: savedVFX,
        totalEstimatedCost: savedVFX.reduce((total, vfx) => total + (vfx.estimatedCost || 0), 0)
      });

    } catch (error) {
      console.error('VFX analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze VFX requirements' });
    }
  });

  // Brand Marketplace - Product Placement
  app.post('/api/script-analysis/product_placement', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      // Get existing scenes for this project
      const projectScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, parseInt(projectId)));

      const productPlacementOpportunities = await generateProductPlacement(projectScenes, scriptContent);
      
      // Save product placement opportunities
      const savedPlacements = await Promise.all(
        productPlacementOpportunities.map(async (placement) => {
          const [saved] = await db
            .insert(productPlacements)
            .values({
              projectId: parseInt(projectId),
              sceneId: placement.sceneId,
              brand: placement.brand,
              product: placement.product,
              placement: placement.placement,
              naturalness: placement.naturalness,
              visibility: placement.visibility,
              estimatedValue: placement.estimatedValue
            })
            .returning();
          return saved;
        })
      );

      res.json({
        success: true,
        productPlacements: savedPlacements,
        totalEstimatedValue: savedPlacements.reduce((total, placement) => total + (placement.estimatedValue || 0), 0)
      });

    } catch (error) {
      console.error('Product placement analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze product placement opportunities' });
    }
  });

  // Financial Projection
  app.post('/api/script-analysis/financial_planning', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      // Get all analysis data for financial planning
      const [projectScenes, projectVFX, projectPlacements] = await Promise.all([
        db.select().from(scenes).where(eq(scenes.projectId, parseInt(projectId))),
        db.select().from(vfxNeeds).where(eq(vfxNeeds.projectId, parseInt(projectId))),
        db.select().from(productPlacements).where(eq(productPlacements.projectId, parseInt(projectId)))
      ]);

      const financialPlan = await generateFinancialPlan(
        projectScenes,
        projectVFX,
        projectPlacements,
        scriptContent
      );
      
      // Save financial plan
      const [savedPlan] = await db
        .insert(financialPlans)
        .values({
          projectId: parseInt(projectId),
          totalBudget: financialPlan.totalBudget,
          budgetBreakdown: financialPlan.budgetBreakdown,
          revenueProjections: financialPlan.revenueProjections,
          roi: financialPlan.roi,
          breakEvenPoint: financialPlan.breakEvenPoint
        })
        .returning();

      // Update project with financial data
      await db
        .update(projects)
        .set({
          totalBudget: financialPlan.totalBudget,
          projectedROI: `${financialPlan.roi}%`
        })
        .where(eq(projects.id, parseInt(projectId)));

      res.json({
        success: true,
        financialPlan: savedPlan
      });

    } catch (error) {
      console.error('Financial planning error:', error);
      res.status(500).json({ error: 'Failed to generate financial plan' });
    }
  });

  // Executive Summary Generation
  app.post('/api/script-analysis/project_summary', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      // Get all analysis data for comprehensive summary
      const [projectScenes, projectCharacters, projectCasting, projectLocations, projectVFX, projectPlacements, projectFinancial] = await Promise.all([
        db.select().from(scenes).where(eq(scenes.projectId, parseInt(projectId))),
        db.select().from(characters).where(eq(characters.projectId, parseInt(projectId))),
        db.select().from(actorSuggestions).where(eq(actorSuggestions.projectId, parseInt(projectId))),
        db.select().from(locationSuggestions).where(eq(locationSuggestions.projectId, parseInt(projectId))),
        db.select().from(vfxNeeds).where(eq(vfxNeeds.projectId, parseInt(projectId))),
        db.select().from(productPlacements).where(eq(productPlacements.projectId, parseInt(projectId))),
        db.select().from(financialPlans).where(eq(financialPlans.projectId, parseInt(projectId)))
      ]);

      const executiveSummary = await generateProjectSummary(
        projectScenes,
        projectCharacters,
        projectCasting,
        projectLocations,
        projectVFX,
        projectPlacements,
        projectFinancial[0],
        scriptContent
      );
      
      // Update project with reader's report
      await db
        .update(projects)
        .set({
          readerReport: executiveSummary,
          status: 'in_progress'
        })
        .where(eq(projects.id, parseInt(projectId)));

      res.json({
        success: true,
        executiveSummary
      });

    } catch (error) {
      console.error('Project summary error:', error);
      res.status(500).json({ error: 'Failed to generate project summary' });
    }
  });

}