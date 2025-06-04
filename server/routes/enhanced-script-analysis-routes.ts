import { Express } from "express";
import { db } from "../db";
import { 
  scenes, 
  characters, 
  actorSuggestions, 
  vfxNeeds, 
  productPlacements, 
  locationSuggestions, 
  financialPlans,
  scriptAnalysisResults,
  projectAnalysisMetadata,
  castingSelections,
  vfxSceneDetails,
  brandableScenes
} from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import { 
  extractScenes,
  analyzeCharacters,
  suggestActors,
  analyzeVFXNeeds,
  generateProductPlacement,
  suggestLocations,
  generateFinancialPlan,
  generateProjectSummary
} from "../script-analysis-agents";

export function registerEnhancedScriptAnalysisRoutes(app: Express) {
  // Get project analysis overview
  app.get("/api/projects/:projectId/analysis", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Get project metadata
      const metadataResults = await db
        .select()
        .from(projectAnalysisMetadata)
        .where(eq(projectAnalysisMetadata.projectId, projectId));
      
      const metadata = metadataResults[0];

      // Get analysis results
      const analysisResults = await db
        .select()
        .from(scriptAnalysisResults)
        .where(eq(scriptAnalysisResults.projectId, projectId));

      // Get scenes and characters count
      const projectScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, projectId));

      const projectCharacters = await db
        .select()
        .from(characters)
        .where(eq(characters.projectId, projectId));

      const analysisFeatures = [
        'scenes', 'characters', 'casting', 'locations', 
        'vfx', 'product_placement', 'financial', 'summary'
      ].map(featureId => {
        const result = analysisResults.find(r => r.analysisType === featureId);
        return {
          id: featureId,
          status: result?.status || 'pending',
          progress: result?.status === 'completed' ? 100 : 
                   result?.status === 'processing' ? 50 : 0,
          results: result?.results
        };
      });

      const response = {
        projectId,
        projectTitle: `Project ${projectId}`,
        totalScenes: projectScenes.length,
        totalCharacters: projectCharacters.length,
        analysisProgress: metadata?.analysisProgress || 0,
        features: analysisFeatures,
        metadata: metadata ? {
          estimatedBudget: metadata.estimatedBudget,
          estimatedShootDays: metadata.estimatedShootDays,
          vfxComplexityLevel: metadata.vfxComplexityLevel,
          castingComplexity: metadata.castingComplexity
        } : undefined
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching project analysis:', error);
      res.status(500).json({ error: 'Failed to fetch project analysis' });
    }
  });

  // Start comprehensive analysis
  app.post("/api/projects/:projectId/analyze", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { features } = req.body;

      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      console.log(`Starting analysis for project ${projectId} with features:`, features);

      // Initialize or update metadata
      await db
        .insert(projectAnalysisMetadata)
        .values({
          projectId,
          analysisProgress: 0,
          lastAnalysisRun: new Date()
        })
        .onConflictDoUpdate({
          target: projectAnalysisMetadata.projectId,
          set: {
            analysisProgress: 0,
            lastAnalysisRun: new Date()
          }
        });

      // Start analysis process asynchronously
      analyzeProjectAsync(projectId, features, req.session.user.id);

      res.json({ 
        success: true, 
        message: "Analysis started",
        projectId 
      });
    } catch (error) {
      console.error('Error starting analysis:', error);
      res.status(500).json({ error: 'Failed to start analysis' });
    }
  });

  // Get scenes for project
  app.get("/api/projects/:projectId/scenes", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      const projectScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, projectId));

      res.json(projectScenes);
    } catch (error) {
      console.error('Error fetching scenes:', error);
      res.status(500).json({ error: 'Failed to fetch scenes' });
    }
  });

  // Get characters for project
  app.get("/api/projects/:projectId/characters", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      const projectCharacters = await db
        .select()
        .from(characters)
        .where(eq(characters.projectId, projectId));

      res.json(projectCharacters);
    } catch (error) {
      console.error('Error fetching characters:', error);
      res.status(500).json({ error: 'Failed to fetch characters' });
    }
  });

  // Get actor suggestions for character
  app.get("/api/projects/:projectId/characters/:characterName/suggestions", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const characterName = req.params.characterName;
      
      const suggestions = await db
        .select()
        .from(actorSuggestions)
        .where(
          and(
            eq(actorSuggestions.projectId, projectId),
            eq(actorSuggestions.characterName, characterName)
          )
        );

      // Transform to expected format
      const formattedSuggestions = suggestions.map(s => ({
        id: s.id,
        characterName: s.characterName,
        actorName: s.actorName,
        reasoning: s.reasoning || '',
        fitScore: s.fitScore || 0,
        availability: s.availability || 'Unknown',
        estimatedFee: s.estimatedFee || 'TBD',
        workingRelationships: s.workingRelationships || [],
        imageUrl: `https://placehold.co/150x200?text=${encodeURIComponent(s.actorName)}`,
        nationality: 'Unknown',
        recentWork: [],
        controversyLevel: 'none' as const
      }));

      res.json(formattedSuggestions);
    } catch (error) {
      console.error('Error fetching actor suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch actor suggestions' });
    }
  });

  // Get casting selections
  app.get("/api/projects/:projectId/casting-selections", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      const selections = await db
        .select()
        .from(castingSelections)
        .where(eq(castingSelections.projectId, projectId));

      res.json(selections);
    } catch (error) {
      console.error('Error fetching casting selections:', error);
      res.status(500).json({ error: 'Failed to fetch casting selections' });
    }
  });

  // Create casting selection
  app.post("/api/projects/:projectId/casting-selections", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { characterName, selectedActorName, fitScore, isConfirmed } = req.body;

      const selectionResults = await db
        .insert(castingSelections)
        .values({
          projectId,
          characterName,
          selectedActorName,
          fitScore,
          isConfirmed: isConfirmed || false
        })
        .returning();

      res.json(selectionResults[0]);
    } catch (error) {
      console.error('Error creating casting selection:', error);
      res.status(500).json({ error: 'Failed to create casting selection' });
    }
  });

  // Get VFX needs
  app.get("/api/projects/:projectId/vfx-needs", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      const vfxData = await db
        .select()
        .from(vfxSceneDetails)
        .where(eq(vfxSceneDetails.projectId, projectId));

      res.json(vfxData);
    } catch (error) {
      console.error('Error fetching VFX needs:', error);
      res.status(500).json({ error: 'Failed to fetch VFX needs' });
    }
  });

  // Update VFX tier
  app.put("/api/vfx-needs/:vfxId/tier", async (req, res) => {
    try {
      const vfxId = parseInt(req.params.vfxId);
      const { qualityTier } = req.body;

      const updatedResults = await db
        .update(vfxSceneDetails)
        .set({ qualityTier })
        .where(eq(vfxSceneDetails.id, vfxId))
        .returning();

      res.json(updatedResults[0]);
    } catch (error) {
      console.error('Error updating VFX tier:', error);
      res.status(500).json({ error: 'Failed to update VFX tier' });
    }
  });

  // Get product placements
  app.get("/api/projects/:projectId/product-placements", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      const placements = await db
        .select()
        .from(productPlacements)
        .where(eq(productPlacements.projectId, projectId));

      res.json(placements);
    } catch (error) {
      console.error('Error fetching product placements:', error);
      res.status(500).json({ error: 'Failed to fetch product placements' });
    }
  });

  // Get location suggestions
  app.get("/api/projects/:projectId/location-suggestions", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      const locations = await db
        .select()
        .from(locationSuggestions)
        .where(eq(locationSuggestions.projectId, projectId));

      res.json(locations);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch location suggestions' });
    }
  });

  // Get financial plan
  app.get("/api/projects/:projectId/financial-plan", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      const planResults = await db
        .select()
        .from(financialPlans)
        .where(eq(financialPlans.projectId, projectId));

      res.json(planResults[0]);
    } catch (error) {
      console.error('Error fetching financial plan:', error);
      res.status(500).json({ error: 'Failed to fetch financial plan' });
    }
  });
}

/**
 * Perform comprehensive script analysis asynchronously
 */
async function analyzeProjectAsync(projectId: number, features: string[], userId: number) {
  try {
    console.log(`Starting async analysis for project ${projectId}`);

    // Get project with script content
    const projectResults = await db.query.projects.findMany({
      where: (projects, { eq }) => eq(projects.id, projectId)
    });

    const project = projectResults[0];

    if (!project || !project.scriptContent) {
      throw new Error('Project or script content not found');
    }

    let totalSteps = features.length;
    let completedSteps = 0;

    const updateProgress = async () => {
      const progress = Math.round((completedSteps / totalSteps) * 100);
      await db
        .update(projectAnalysisMetadata)
        .set({ analysisProgress: progress })
        .where(eq(projectAnalysisMetadata.projectId, projectId));
    };

    // Scene Analysis
    if (features.includes('scenes')) {
      try {
        await db
          .insert(scriptAnalysisResults)
          .values({
            projectId,
            analysisType: 'scenes',
            status: 'processing'
          })
          .onConflictDoUpdate({
            target: [scriptAnalysisResults.projectId, scriptAnalysisResults.analysisType],
            set: { status: 'processing' }
          });

        const extractedScenes = await extractScenes(project.scriptContent);
        
        // Store scenes in database with proper data transformation
        for (const scene of extractedScenes) {
          try {
            await db
              .insert(scenes)
              .values({
                projectId,
                sceneNumber: scene.sceneNumber || 0,
                location: scene.location || 'Unknown',
                timeOfDay: scene.timeOfDay || null,
                description: scene.description || null,
                characters: Array.isArray(scene.characters) ? scene.characters : null,
                content: scene.content || null,
                pageStart: typeof scene.pageStart === 'number' ? scene.pageStart : null,
                pageEnd: typeof scene.pageEnd === 'number' ? scene.pageEnd : null,
                duration: typeof scene.duration === 'number' ? scene.duration : null,
                vfxNeeds: Array.isArray(scene.vfxNeeds) ? scene.vfxNeeds : null,
                productPlacementOpportunities: Array.isArray(scene.productPlacementOpportunities) ? scene.productPlacementOpportunities : null
              })
              .onConflictDoNothing();
          } catch (error) {
            console.error('Error storing scene:', error, scene);
          }
        }

        await db
          .update(scriptAnalysisResults)
          .set({ 
            status: 'completed',
            results: { scenes: extractedScenes.length }
          })
          .where(
            and(
              eq(scriptAnalysisResults.projectId, projectId),
              eq(scriptAnalysisResults.analysisType, 'scenes')
            )
          );

        completedSteps++;
        await updateProgress();
      } catch (error) {
        console.error('Scene analysis failed:', error);
        await db
          .update(scriptAnalysisResults)
          .set({ 
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          })
          .where(
            and(
              eq(scriptAnalysisResults.projectId, projectId),
              eq(scriptAnalysisResults.analysisType, 'scenes')
            )
          );
      }
    }

    // Character Analysis
    if (features.includes('characters')) {
      try {
        await db
          .insert(scriptAnalysisResults)
          .values({
            projectId,
            analysisType: 'characters',
            status: 'processing'
          })
          .onConflictDoUpdate({
            target: [scriptAnalysisResults.projectId, scriptAnalysisResults.analysisType],
            set: { status: 'processing' }
          });

        const characterAnalysis = await analyzeCharacters(project.scriptContent);
        
        // Store characters in database
        for (const character of characterAnalysis) {
          await db
            .insert(characters)
            .values({
              projectId,
              name: character.name,
              description: character.description,
              age: character.age,
              gender: character.gender,
              personality: character.personality,
              importance: character.importance,
              screenTime: character.screenTime,
              characterArc: character.characterArc
            })
            .onConflictDoNothing();
        }

        await db
          .update(scriptAnalysisResults)
          .set({ 
            status: 'completed',
            results: { characters: characterAnalysis.length }
          })
          .where(
            and(
              eq(scriptAnalysisResults.projectId, projectId),
              eq(scriptAnalysisResults.analysisType, 'characters')
            )
          );

        completedSteps++;
        await updateProgress();
      } catch (error) {
        console.error('Character analysis failed:', error);
        await db
          .update(scriptAnalysisResults)
          .set({ 
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          })
          .where(
            and(
              eq(scriptAnalysisResults.projectId, projectId),
              eq(scriptAnalysisResults.analysisType, 'characters')
            )
          );
      }
    }

    console.log(`Analysis completed for project ${projectId}`);

  } catch (error) {
    console.error('Analysis failed:', error);
    
    // Mark all pending analyses as failed
    await db
      .update(scriptAnalysisResults)
      .set({ 
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Analysis failed'
      })
      .where(eq(scriptAnalysisResults.projectId, projectId));
  }
}