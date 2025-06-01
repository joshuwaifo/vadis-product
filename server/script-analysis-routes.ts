import type { Express } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { storage } from "./storage";
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

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

export function registerScriptAnalysisRoutes(app: Express) {
  // Create new script analysis project with PDF upload
  app.post("/api/projects/script-analysis", upload.single('scriptFile'), async (req, res) => {
    try {
      const { title, logline, budgetRange, fundingGoal, productionTimeline } = req.body;
      const scriptFile = req.file;

      if (!scriptFile) {
        return res.status(400).json({ error: "Script PDF file is required" });
      }

      // Extract text from PDF
      let scriptContent = "";
      try {
        const pdfData = await pdfParse(scriptFile.buffer);
        scriptContent = pdfData.text;
      } catch (error) {
        console.error("PDF parsing error:", error);
        return res.status(400).json({ error: "Failed to parse PDF file" });
      }

      if (!scriptContent || scriptContent.length < 100) {
        return res.status(400).json({ error: "Script content is too short or could not be extracted" });
      }

      // Create project in database
      const project = await storage.createProject({
        userId: 1, // Using hardcoded user ID for now
        title,
        projectType: "script_analysis",
        logline,
        scriptContent,
        budgetRange,
        fundingGoal: parseInt(fundingGoal),
        productionTimeline,
        status: "analyzing",
      });

      // Start analysis process asynchronously
      analyzeScriptAsync(project.id, scriptContent, {
        title,
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
      const projectId = parseInt(req.params.id);
      // This would be implemented in storage
      const scenes = []; // await storage.getScenesByProject(projectId);
      res.json(scenes);
    } catch (error) {
      console.error("Error fetching scenes:", error);
      res.status(500).json({ error: "Failed to fetch scenes" });
    }
  });

  // Get characters for a project
  app.get("/api/projects/:id/characters", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      // This would be implemented in storage
      const characters = []; // await storage.getCharactersByProject(projectId);
      const relationships = []; // await storage.getCharacterRelationships(projectId);
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

    // Step 1: Extract scenes
    console.log("Extracting scenes...");
    const scenes = await extractScenes(scriptContent);
    // Save scenes to database here

    // Step 2: Analyze characters
    console.log("Analyzing characters...");
    const { characters, relationships } = await analyzeCharacters(scenes);
    // Save characters and relationships to database here

    // Step 3: Suggest actors
    console.log("Suggesting actors...");
    const actorSuggestions = await suggestActors(characters);
    // Save actor suggestions to database here

    // Step 4: Analyze VFX needs
    console.log("Analyzing VFX needs...");
    const vfxNeeds = await analyzeVFXNeeds(scenes);
    // Save VFX needs to database here

    // Step 5: Generate product placement ideas
    console.log("Generating product placement ideas...");
    const productPlacements = await generateProductPlacement(scenes);
    // Save product placements to database here

    // Step 6: Suggest locations
    console.log("Suggesting locations...");
    const locations = await suggestLocations(scenes);
    // Save locations to database here

    // Step 7: Generate financial plan
    console.log("Generating financial plan...");
    const financialPlan = await generateFinancialPlan(
      scenes,
      characters,
      vfxNeeds,
      actorSuggestions,
      locations,
      productPlacements
    );
    // Save financial plan to database here

    // Step 8: Generate project summary
    console.log("Generating project summary...");
    const projectSummary = await generateProjectSummary(
      projectData.title,
      scenes,
      characters,
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