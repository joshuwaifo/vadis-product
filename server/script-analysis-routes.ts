import type { Express } from "express";
import multer from "multer";
import { storage } from "./storage";
import { extractScriptFromPdf } from "./services/pdf-service";
import {
  extractScenes,
  analyzeCharacters,
  suggestActors,
  analyzeVFXNeeds,
  generateProductPlacement,
  suggestLocations,
  generateFinancialPlan,
  generateProjectSummary
} from "./script-analysis-agents";
import { 
  performCompleteCharacterAnalysis,
  type DetailedCharacter 
} from "./services/character-analysis-service";
import {
  performCompleteCastingAnalysis,
  type ActorSuggestion as CastingActorSuggestion
} from "./services/casting-suggestion-service";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files and images (JPEG, PNG) are allowed'));
    }
  },
});

export function registerScriptAnalysisRoutes(app: Express) {
  // Create new script analysis project with PDF upload
  app.post("/api/projects/script-analysis", upload.single('scriptFile'), async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { title, logline, budgetRange, fundingGoal, productionTimeline } = req.body;
      const scriptFile = req.file;

      if (!scriptFile) {
        return res.status(400).json({ error: "Script file is required" });
      }

      console.log("Script file received:", scriptFile.originalname, "Size:", scriptFile.size, "Type:", scriptFile.mimetype);

      // Parse the uploaded script file using the integrated PDF service
      const parsedScript = await extractScriptFromPdf(scriptFile.buffer, scriptFile.mimetype);
      
      if (!parsedScript.content || parsedScript.content.length < 10) {
        return res.status(400).json({ error: "Failed to extract valid script content from file" });
      }

      // Use parsed title if user didn't provide one, otherwise prioritize user's title
      const finalTitle = (title && title.trim().length > 0) ? title : parsedScript.title;

      // Create project in database
      const project = await storage.createProject({
        userId: req.session.user.id,
        title: finalTitle,
        projectType: "script_analysis",
        logline,
        scriptContent: parsedScript.content,
        budgetRange,
        fundingGoal: parseInt(fundingGoal),
        productionTimeline,
        status: "analyzing",
      });

      // Save individual scenes to the database
      console.log(`Saving ${parsedScript.scenes.length} scenes for project ${project.id}`);
      for (const scene of parsedScript.scenes) {
        try {
          await storage.createScene({
            projectId: project.id,
            sceneNumber: scene.sceneNumber,
            location: scene.heading, // Use heading as location for now
            timeOfDay: null, // Could be parsed from heading later
            description: scene.content.substring(0, 500), // Truncate for description
            characters: [], // Will be populated during analysis
            content: scene.content,
            pageStart: null,
            pageEnd: null,
            duration: null, // Will be estimated during analysis
            vfxNeeds: [],
            productPlacementOpportunities: [],
          });
        } catch (sceneError) {
          console.error(`Error saving scene ${scene.sceneNumber}:`, sceneError);
          // Continue with other scenes even if one fails
        }
      }

      // Start analysis process asynchronously
      analyzeScriptAsync(project.id, parsedScript.content, {
        title: finalTitle,
        budgetRange,
        fundingGoal: parseInt(fundingGoal),
      }).catch(error => {
        console.error("Script analysis error:", error);
      });

      res.json({ id: project.id, status: "analyzing" });
    } catch (error) {
      console.error("Error creating script analysis project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Get project analysis results
  app.get("/api/projects/:id/analysis", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Get project details
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get all analysis data (these would be implemented in storage)
      const analysisData = {
        project,
        scenes: [], // await storage.getScenesByProject(projectId),
        characters: [], // await storage.getCharactersByProject(projectId),
        relationships: [], // await storage.getCharacterRelationships(projectId),
        actorSuggestions: [], // await storage.getActorSuggestions(projectId),
        vfxNeeds: [], // await storage.getVFXNeeds(projectId),
        productPlacements: [], // await storage.getProductPlacements(projectId),
        locations: [], // await storage.getLocationSuggestions(projectId),
        financialPlan: null, // await storage.getFinancialPlan(projectId),
      };

      res.json(analysisData);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ error: "Failed to fetch analysis" });
    }
  });

  // Get scenes for a project
  app.get("/api/projects/:id/scenes", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const projectId = parseInt(req.params.id);
      
      // Verify project belongs to authenticated user
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== Number(req.session.user.id)) {
        return res.status(404).json({ error: "Project not found" });
      }

      const scenes = await storage.getScenesByProject(projectId);
      res.json(scenes);
    } catch (error) {
      console.error("Error fetching scenes:", error);
      res.status(500).json({ error: "Failed to fetch scenes" });
    }
  });

  // Get characters for a project
  app.get("/api/projects/:id/characters", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const projectId = parseInt(req.params.id);
      
      // Verify project belongs to authenticated user
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== Number(req.session.user.id)) {
        return res.status(404).json({ error: "Project not found" });
      }

      const characters = await storage.getCharactersByProject(projectId);
      const relationships = await storage.getCharacterRelationshipsByProject(projectId);
      res.json({ characters, relationships });
    } catch (error) {
      console.error("Error fetching characters:", error);
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });

  // Get actor suggestions for a project
  app.get("/api/projects/:id/actors", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      // This would be implemented in storage
      const actorSuggestions = []; // await storage.getActorSuggestions(projectId);
      res.json(actorSuggestions);
    } catch (error) {
      console.error("Error fetching actor suggestions:", error);
      res.status(500).json({ error: "Failed to fetch actor suggestions" });
    }
  });

  // Get VFX needs for a project
  app.get("/api/projects/:id/vfx", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      // This would be implemented in storage
      const vfxNeeds = []; // await storage.getVFXNeeds(projectId);
      res.json(vfxNeeds);
    } catch (error) {
      console.error("Error fetching VFX needs:", error);
      res.status(500).json({ error: "Failed to fetch VFX needs" });
    }
  });

  // Get product placement opportunities for a project
  app.get("/api/projects/:id/product-placement", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      // This would be implemented in storage
      const productPlacements = []; // await storage.getProductPlacements(projectId);
      res.json(productPlacements);
    } catch (error) {
      console.error("Error fetching product placements:", error);
      res.status(500).json({ error: "Failed to fetch product placements" });
    }
  });

  // Get location suggestions for a project
  app.get("/api/projects/:id/locations", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      // This would be implemented in storage
      const locations = []; // await storage.getLocationSuggestions(projectId);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  // Get financial plan for a project
  app.get("/api/projects/:id/financial", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      // This would be implemented in storage
      const financialPlan = null; // await storage.getFinancialPlan(projectId);
      res.json(financialPlan);
    } catch (error) {
      console.error("Error fetching financial plan:", error);
      res.status(500).json({ error: "Failed to fetch financial plan" });
    }
  });
}

/**
 * Perform comprehensive script analysis asynchronously
 */
async function analyzeScriptAsync(
  projectId: number,
  scriptContent: string,
  projectData: { title: string; budgetRange: string; fundingGoal: number }
) {
  try {
    console.log(`Starting analysis for project ${projectId}`);

    // Step 1: Get scenes from database (already saved during upload)
    console.log("Retrieving scenes from database...");
    const scenes = await storage.getScenesByProject(projectId);
    
    // If no scenes in database, fall back to extracting from content
    if (scenes.length === 0) {
      console.log("No scenes found in database, extracting from script content...");
      const extractedScenes = await extractScenes(scriptContent);
      
      // Save extracted scenes to database
      for (const scene of extractedScenes) {
        await storage.createScene({
          projectId,
          sceneNumber: scene.sceneNumber,
          location: scene.location,
          timeOfDay: scene.timeOfDay || null,
          description: scene.description || null,
          characters: scene.characters || [],
          content: scene.content || null,
          pageStart: scene.pageStart || null,
          pageEnd: scene.pageEnd || null,
          duration: scene.duration || null,
          vfxNeeds: scene.vfxNeeds || [],
          productPlacementOpportunities: scene.productPlacementOpportunities || [],
        });
      }
    }

    // Step 2: Enhanced Character Analysis
    console.log("Performing comprehensive character analysis...");
    const characterAnalysis = await performCompleteCharacterAnalysis(scriptContent);
    
    // Save detailed characters to database
    for (const character of characterAnalysis.characters) {
      await storage.createCharacter({
        projectId,
        name: character.name,
        description: character.description || null,
        age: character.age || null,
        gender: character.gender || null,
        personality: character.personality || [],
        importance: character.importance || null,
        screenTime: character.screenTime || null,
        characterArc: character.characterArc || null,
      });
    }
    
    // Save enhanced character relationships to database
    for (const relationship of characterAnalysis.relationshipMap) {
      await storage.createCharacterRelationship({
        projectId,
        fromCharacter: relationship.from,
        toCharacter: relationship.to,
        relationship: relationship.type,
        strength: relationship.strength || null,
      });
    }

    // Step 3: AI-Powered Casting Analysis
    console.log("Performing comprehensive casting analysis...");
    const castingAnalysis = await performCompleteCastingAnalysis(
      characterAnalysis.characters,
      characterAnalysis.summaries,
      'medium' // Default budget tier - could be determined from project data
    );
    
    // Save actor suggestions to database
    for (const recommendation of castingAnalysis.individualRecommendations) {
      const allSuggestions = [
        ...recommendation.primarySuggestions,
        ...recommendation.alternativeSuggestions,
        ...recommendation.budgetConsiderations.midBudget,
        ...recommendation.diversityOptions,
        ...recommendation.emergingTalent
      ];

      for (const suggestion of allSuggestions) {
        await storage.createActorSuggestion({
          projectId,
          characterName: recommendation.characterName,
          actorName: suggestion.actorName,
          reasoning: suggestion.reasoning || null,
          fitScore: suggestion.fitScore || null,
          availability: suggestion.availability || null,
          estimatedFee: suggestion.estimatedFee || null,
          workingRelationships: suggestion.workingRelationships || [],
        });
      }
    }

    // Step 4: Analyze VFX needs
    console.log("Analyzing VFX needs...");
    const vfxNeeds = await analyzeVFXNeeds(scenes);
    // Save VFX needs to database here

    // Step 5: Generate product placement ideas
    console.log("Generating product placement ideas...");
    const productPlacements = await generateProductPlacement(scenes);
    
    // Save product placements to database
    for (const placement of productPlacements) {
      await storage.createProductPlacement({
        projectId,
        sceneId: null, // For now, set sceneId as null until we implement scene ID mapping
        brand: placement.brand,
        product: placement.product,
        placement: placement.placement || null,
        naturalness: placement.naturalness || null,
        visibility: placement.visibility || null,
        estimatedValue: placement.estimatedValue || null,
      });
    }

    // Step 6: Suggest locations
    console.log("Suggesting locations...");
    const locations = await suggestLocations(scenes);
    
    // Save location suggestions to database
    for (const locationSet of locations) {
      if (locationSet.suggestions && locationSet.suggestions.length > 0) {
        for (const suggestion of locationSet.suggestions) {
          await storage.createLocationSuggestion({
            projectId,
            sceneId: null, // For now, set sceneId as null until we implement scene ID mapping
            locationType: locationSet.locationType,
            location: suggestion.location,
            city: suggestion.city || null,
            state: suggestion.state || null,
            country: suggestion.country || null,
            taxIncentive: suggestion.taxIncentive || null,
            estimatedCost: suggestion.estimatedCost || null,
            logistics: suggestion.logistics || null,
            weatherConsiderations: suggestion.weatherConsiderations || null,
          });
        }
      }
    }

    // Step 7: Generate financial plan
    console.log("Generating financial plan...");
    const financialPlan = await generateFinancialPlan(
      scenes,
      characterAnalysis.characters,
      vfxNeeds,
      castingAnalysis.individualRecommendations,
      locations,
      productPlacements
    );
    
    // Save financial plan to database (flatten nested structure)
    await storage.createFinancialPlan({
      projectId,
      totalBudget: financialPlan.totalBudget || null,
      preProductionBudget: financialPlan.budgetBreakdown?.preProduction || null,
      productionBudget: financialPlan.budgetBreakdown?.production || null,
      postProductionBudget: financialPlan.budgetBreakdown?.postProduction || null,
      marketingBudget: financialPlan.budgetBreakdown?.marketing || null,
      contingencyBudget: financialPlan.budgetBreakdown?.contingency || null,
      domesticRevenue: financialPlan.revenueProjections?.domestic || null,
      internationalRevenue: financialPlan.revenueProjections?.international || null,
      streamingRevenue: financialPlan.revenueProjections?.streaming || null,
      merchandiseRevenue: financialPlan.revenueProjections?.merchandise || null,
      productPlacementRevenue: financialPlan.revenueProjections?.productPlacement || null,
      roi: financialPlan.roi?.toString() || null,
      breakEvenPoint: financialPlan.breakEvenPoint || null,
    });

    // Step 8: Generate project summary
    console.log("Generating project summary...");
    const projectSummary = await generateProjectSummary(
      projectData.title,
      scenes,
      characterAnalysis.characters,
      vfxNeeds,
      productPlacements,
      financialPlan
    );

    // Update project status
    await storage.updateProject(projectId, {
      status: "completed",
      readerReport: projectSummary,
    });

    console.log(`Analysis completed for project ${projectId}`);
  } catch (error) {
    console.error(`Analysis failed for project ${projectId}:`, error);
    
    // Update project status to failed
    await storage.updateProject(projectId, {
      status: "failed",
    });
  }
}