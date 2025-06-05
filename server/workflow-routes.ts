import type { Express } from "express";
import { storage } from "./storage";
import { PROJECT_WORKFLOW_STEPS } from "./types/project-workflow";
import { extractScriptFromPdf } from "./services/pdf-service";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, DOC, and DOCX files are allowed'));
    }
  }
});

export function registerWorkflowRoutes(app: Express) {
  // Upload script file
  app.post("/api/upload/script", upload.single('script'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let scriptContent = "";
      
      // Extract text based on file type
      if (req.file.mimetype === 'text/plain') {
        scriptContent = req.file.buffer.toString('utf-8');
      } else if (req.file.mimetype === 'application/pdf') {
        try {
          // Use the existing AI-powered PDF service for extraction
          const parsedScript = await extractScriptFromPdf(req.file.buffer, req.file.mimetype);
          scriptContent = parsedScript.content;
          
          if (!scriptContent || scriptContent.trim().length < 10) {
            throw new Error('No readable text found in PDF');
          }
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          throw new Error('Failed to extract text from PDF file. Please ensure the PDF contains readable text.');
        }
      } else {
        // For DOC, DOCX files
        throw new Error('Document format not fully supported. Please convert to PDF or plain text.');
      }

      // Log script upload
      console.log(`Script uploaded: ${req.file.originalname}, Size: ${req.file.size}, Content length: ${scriptContent.length}`);

      res.json({
        success: true,
        content: scriptContent,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });

    } catch (error) {
      console.error("Script upload error:", error);
      res.status(500).json({ error: "Failed to process script file" });
    }
  });

  // Create or update project workflow
  app.post("/api/projects/workflow", async (req, res) => {
    try {
      const userId = (req.session as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { currentStep, stepData } = req.body;

      // Create new project if this is the first step
      if (currentStep === 'project_info' && stepData) {
        const project = await storage.createProject({
          userId,
          title: stepData.title,
          logline: stepData.logline,
          synopsis: stepData.synopsis,
          targetGenres: stepData.targetGenres,
          budgetRange: stepData.budgetRange,
          scriptContent: stepData.scriptContent,
          projectType: 'script_analysis',
          workflowStatus: currentStep,
          lastSavedStep: currentStep
        });

        // Log user action
        await logUserAction(userId, project.id, 'project_created', {
          title: stepData.title,
          step: currentStep
        });

        res.json({
          success: true,
          project,
          workflow: {
            projectId: project.id,
            currentStep,
            steps: PROJECT_WORKFLOW_STEPS
          }
        });
      } else {
        res.status(400).json({ error: "Invalid workflow step or missing data" });
      }

    } catch (error) {
      console.error("Workflow creation error:", error);
      res.status(500).json({ error: "Failed to create project workflow" });
    }
  });

  // Update existing project workflow
  app.put("/api/projects/:projectId/workflow", async (req, res) => {
    try {
      const userId = (req.session as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { projectId } = req.params;
      const { currentStep, stepData } = req.body;

      // Update project with step data
      if (stepData) {
        await storage.updateProject(parseInt(projectId), {
          ...stepData,
          workflowStatus: currentStep,
          lastSavedStep: currentStep,
          updatedAt: new Date()
        });
      }

      // Log user action
      await logUserAction(userId, parseInt(projectId), 'workflow_step_saved', {
        step: currentStep,
        stepData: stepData ? Object.keys(stepData) : []
      });

      res.json({
        success: true,
        workflow: {
          projectId: parseInt(projectId),
          currentStep,
          steps: PROJECT_WORKFLOW_STEPS
        }
      });

    } catch (error) {
      console.error("Workflow update error:", error);
      res.status(500).json({ error: "Failed to update project workflow" });
    }
  });

  // Get project workflow
  app.get("/api/projects/:projectId/workflow", async (req, res) => {
    try {
      const userId = (req.session as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { projectId } = req.params;
      const project = await storage.getProject(parseInt(projectId));

      if (!project || project.userId !== userId) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json({
        projectId: project.id,
        currentStep: project.workflowStatus || 'project_info',
        steps: PROJECT_WORKFLOW_STEPS
      });

    } catch (error) {
      console.error("Workflow fetch error:", error);
      res.status(500).json({ error: "Failed to fetch project workflow" });
    }
  });

  // Run script analysis
  app.post("/api/projects/:projectId/analyze", async (req, res) => {
    try {
      const userId = (req.session as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { projectId } = req.params;
      const { features } = req.body;

      const project = await storage.getProject(parseInt(projectId));
      if (!project || project.userId !== userId) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Log user action
      await logUserAction(userId, parseInt(projectId), 'analysis_started', {
        features,
        scriptLength: project.scriptContent?.length
      });

      // Update project status
      await storage.updateProject(parseInt(projectId), {
        status: 'analyzing',
        workflowStatus: 'script_analysis'
      });

      // For now, return success - actual analysis would be implemented with AI services
      res.json({
        success: true,
        message: "Analysis started successfully",
        analysisId: `analysis_${projectId}_${Date.now()}`
      });

    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to start script analysis" });
    }
  });

  // Get analysis results
  app.get("/api/projects/:projectId/analysis", async (req, res) => {
    try {
      const userId = (req.session as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { projectId } = req.params;
      const project = await storage.getProject(parseInt(projectId));

      if (!project || project.userId !== userId) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Fetch analysis results from storage
      const scenes = await storage.getScenes(parseInt(projectId));
      const characters = await storage.getCharacters(parseInt(projectId));
      const financialPlan = await storage.getFinancialPlan(parseInt(projectId));

      res.json({
        scenes,
        characters,
        financial: financialPlan,
        // Add other analysis results as they become available
        casting: [],
        locations: [],
        vfx: [],
        productPlacement: [],
        summary: null
      });

    } catch (error) {
      console.error("Analysis results error:", error);
      res.status(500).json({ error: "Failed to fetch analysis results" });
    }
  });

  // Get project summary
  app.get("/api/projects/:projectId/summary", async (req, res) => {
    try {
      const userId = (req.session as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { projectId } = req.params;
      const project = await storage.getProject(parseInt(projectId));

      if (!project || project.userId !== userId) {
        return res.status(404).json({ error: "Project not found" });
      }

      const scenes = await storage.getScenes(parseInt(projectId));
      const characters = await storage.getCharacters(parseInt(projectId));
      const financialPlan = await storage.getFinancialPlan(parseInt(projectId));

      const summary = {
        totalScenes: scenes.length,
        totalCharacters: characters.length,
        estimatedDuration: scenes.reduce((total, scene) => total + (scene.duration || 0), 0),
        estimatedBudget: financialPlan?.totalBudget || 0
      };

      res.json(summary);

    } catch (error) {
      console.error("Project summary error:", error);
      res.status(500).json({ error: "Failed to generate project summary" });
    }
  });

  // Finalize project
  app.post("/api/projects/:projectId/finalize", async (req, res) => {
    try {
      const userId = (req.session as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { projectId } = req.params;
      const { publishToMarketplace } = req.body;

      const project = await storage.updateProject(parseInt(projectId), {
        status: 'completed',
        isPublished: publishToMarketplace,
        workflowStatus: 'finalize_project'
      });

      // Log user action
      await logUserAction(userId, parseInt(projectId), 'project_finalized', {
        publishToMarketplace,
        completedAt: new Date()
      });

      res.json({
        success: true,
        project,
        message: publishToMarketplace 
          ? "Project finalized and published to marketplace"
          : "Project finalized successfully"
      });

    } catch (error) {
      console.error("Project finalization error:", error);
      res.status(500).json({ error: "Failed to finalize project" });
    }
  });
}

// Helper function to log user actions
async function logUserAction(userId: number, projectId: number | null, action: string, details: any) {
  try {
    // This would be implemented with a proper action logging system
    console.log(`User Action Log - User: ${userId}, Project: ${projectId}, Action: ${action}`, details);
    
    // For now, we'll just log to console
    // In a real implementation, this would save to a user_action_logs table
  } catch (error) {
    console.error("Failed to log user action:", error);
  }
}