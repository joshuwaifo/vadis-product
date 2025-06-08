import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { hubspotService } from "./hubspot";
import { authService } from "./auth-service";
import { 
  insertDemoRequestSchema, 
  insertProjectSchema,
  loginSchema,
  userRoles
} from "@shared/schema";
import { registerScriptAnalysisRoutes } from "./script-analysis-routes";
import { registerWorkflowRoutes } from "./workflow-routes";
import { registerComprehensiveAnalysisRoutes } from "./comprehensive-analysis-routes";
import { registerScriptGenerationRoutes } from "./script-generation-routes";

// Simple authentication middleware
function requireAuth(req: any, res: any, next: any) {
  if (req.session?.user) {
    next();
  } else {
    res.status(401).json({ error: "Authentication required" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Demo request submission endpoint
  app.post("/api/demo-request", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = insertDemoRequestSchema.parse(req.body);

      let hubspotContactId = null;
      let hubspotDealId = null;
      let hubspotResult = null;

      // Try to submit to HubSpot first (primary database)
      if (hubspotService) {
        try {
          hubspotResult = await hubspotService.submitDemoRequest(validatedData);
          hubspotContactId = hubspotResult.contactId;
          hubspotDealId = hubspotResult.dealId;
        } catch (hubspotError) {
          console.error("HubSpot submission failed:", hubspotError);
          // Continue with local storage as fallback
        }
      }

      // Store in local database (as backup/cache)
      const demoRequest = await storage.createDemoRequest(validatedData);
      
      // Update with HubSpot IDs if successful
      if (hubspotContactId && hubspotDealId) {
        await storage.updateDemoRequest(demoRequest.id, {
          hubspotContactId,
          hubspotDealId,
          status: "hubspot_synced"
        });
      }

      res.json({ 
        success: true, 
        id: demoRequest.id,
        hubspotSynced: !!(hubspotContactId && hubspotDealId)
      });
    } catch (error) {
      console.error("Demo request submission error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Invalid request data" 
      });
    }
  });

  // Get demo request by ID
  app.get("/api/demo-request/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const demoRequest = await storage.getDemoRequest(id);
      
      if (!demoRequest) {
        return res.status(404).json({ error: "Demo request not found" });
      }
      
      res.json(demoRequest);
    } catch (error) {
      console.error("Get demo request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Projects endpoints
  app.get("/api/projects", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const projects = await storage.getProjectsByUser(req.session.user.id);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get individual project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Verify project belongs to authenticated user
      if (project.userId !== Number(req.session.user.id)) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Validate the request body using Zod schema
      const validatedData = insertProjectSchema.parse({
        userId: req.session.user.id,
        ...req.body,
      });

      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error: any) {
      console.error("Error creating project:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Delete project by ID
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Verify project belongs to authenticated user
      if (project.userId !== Number(req.session.user.id)) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.deleteProject(projectId);
      res.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Get individual project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Verify project ownership
      if (project.userId !== req.session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Get project history/activity log
  app.get("/api/projects/:id/history", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Check if user has access to this project
      if (project.userId !== req.session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const history = await storage.getProjectHistory(projectId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching project history:", error);
      res.status(500).json({ error: "Failed to fetch project history" });
    }
  });

  // Get project scenes
  app.get("/api/projects/:id/scenes", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const projectId = parseInt(req.params.id);
      const scenes = await storage.getScenes(projectId);
      res.json(scenes);
    } catch (error) {
      console.error("Error fetching scenes:", error);
      res.status(500).json({ error: "Failed to fetch scenes" });
    }
  });

  // Get project characters
  app.get("/api/projects/:id/characters", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const projectId = parseInt(req.params.id);
      const characters = await storage.getCharacters(projectId);
      res.json(characters);
    } catch (error) {
      console.error("Error fetching characters:", error);
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });

  // Get project casting analysis
  app.get("/api/projects/:id/casting", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const projectId = parseInt(req.params.id);
      const casting = await storage.getCastingSuggestions(projectId);
      res.json(casting);
    } catch (error) {
      console.error("Error fetching casting:", error);
      res.status(500).json({ error: "Failed to fetch casting data" });
    }
  });

  // Save user casting selection
  app.post("/api/projects/:id/casting/select", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const projectId = parseInt(req.params.id);
      const { characterName, actorName, fitScore, reasoning, availability, estimatedFee } = req.body;

      if (!characterName || !actorName) {
        return res.status(400).json({ error: "Character name and actor name are required" });
      }

      // Check if selection already exists
      const existingSelection = await storage.getCastingSelection(projectId, characterName);
      
      if (existingSelection) {
        // Update existing selection
        await storage.updateCastingSelection(projectId, characterName, {
          actorName,
          fitScore: fitScore || 0,
          reasoning: reasoning || '',
          availability: availability || '',
          estimatedFee: estimatedFee || ''
        });
      } else {
        // Create new selection
        await storage.saveCastingSelection({
          projectId,
          characterName,
          actorName,
          fitScore: fitScore || 0,
          reasoning: reasoning || '',
          availability: availability || '',
          estimatedFee: estimatedFee || '',
          workingRelationships: []
        });
      }

      res.json({ success: true, message: "Casting selection saved" });
    } catch (error) {
      console.error("Error saving casting selection:", error);
      res.status(500).json({ error: "Failed to save casting selection" });
    }
  });

  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const projects = await storage.getProjectsByUser(req.session.user.id);
      const publishedProjects = projects.filter(p => p.isPublished);
      const totalFunding = projects.reduce((sum, p) => sum + (p.fundingGoal || 0), 0);
      const fundsRaised = projects.reduce((sum, p) => sum + (p.fundingRaised || 0), 0);
      
      res.json({
        totalProjects: projects.length,
        publishedProjects: publishedProjects.length,
        totalFunding,
        fundsRaised,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/profile", async (req, res) => {
    try {
      // Return basic profile for now
      res.json({
        id: 1,
        userId: 1,
        companyName: "",
        logoUrl: null,
        city: "",
        state: "",
        country: "",
        website: "",
        description: "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Authentication Routes
  
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      console.log("Login attempt for email:", validatedData.email);
      
      // Use the new role-specific authentication service
      const authResult = await authService.login(validatedData.email, validatedData.password);
      if (!authResult) {
        console.log("Authentication failed for email:", validatedData.email);
        return res.status(401).json({ error: "Invalid email or password" });
      }

      console.log("Login successful for user:", validatedData.email, "Role:", authResult.role);
      
      // Store user information in session
      (req.session as any).user = {
        id: authResult.user.id,
        email: authResult.user.email,
        role: authResult.role,
        name: authResult.role === 'creator' 
          ? `${authResult.user.firstName} ${authResult.user.lastName}`
          : authResult.user.contactName || authResult.user.companyName
      };
      
      // Return user data (without password hash) and dashboard redirect
      const { passwordHash: _, ...userResponse } = authResult.user;
      res.json({
        success: true,
        user: {
          ...userResponse,
          role: authResult.role
        },
        redirectPath: authService.getDashboardPath(authResult.role)
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Login failed"
      });
    }
  });

  // Get current user endpoint (for session management)
  app.get("/api/auth/me", async (req, res) => {
    try {
      if ((req.session as any).user) {
        res.json({ user: (req.session as any).user });
      } else {
        res.status(401).json({ user: null, error: "No active session" });
      }
    } catch (error) {
      console.error("Session validation error:", error);
      res.status(500).json({ user: null, error: "Session validation failed" });
    }
  });

  // Debug session endpoint
  app.get("/api/debug/session", async (req, res) => {
    try {
      res.json({
        sessionId: req.sessionID,
        sessionExists: !!req.session,
        userExists: !!(req.session as any)?.user,
        sessionUser: (req.session as any)?.user || null,
        cookie: req.session?.cookie
      });
    } catch (error) {
      res.status(500).json({ error: "Session debug failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie('vadis.sid');
        res.json({ success: true, message: "Logged out successfully" });
      });
    } else {
      res.json({ success: true, message: "No active session" });
    }
  });

  // Debug endpoint to list all users (remove in production)
  app.get("/api/debug/users", async (req, res) => {
    try {
      // Get all users from storage for debugging
      const users = Array.from((storage as any).users.values()).map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }));
      res.json({ users });
    } catch (error) {
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Scene Variations API endpoints
  app.get("/api/projects/:projectId/scenes/:sceneId/variations", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const sceneId = parseInt(req.params.sceneId);
      const variations = await storage.getSceneVariationsByScene(sceneId);
      res.json(variations);
    } catch (error) {
      console.error("Error fetching scene variations:", error);
      res.status(500).json({ error: "Failed to fetch scene variations" });
    }
  });

  app.post("/api/projects/:projectId/scenes/:sceneId/variations", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const sceneId = parseInt(req.params.sceneId);
      const variation = await storage.createSceneVariation({
        sceneId,
        ...req.body
      });
      res.json(variation);
    } catch (error) {
      console.error("Error creating scene variation:", error);
      res.status(500).json({ error: "Failed to create scene variation" });
    }
  });

  app.patch("/api/variations/:variationId", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const variationId = parseInt(req.params.variationId);
      const updated = await storage.updateSceneVariation(variationId, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating scene variation:", error);
      res.status(500).json({ error: "Failed to update scene variation" });
    }
  });

  app.post("/api/variations/:variationId/generate-video", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const variationId = parseInt(req.params.variationId);
      // For now, return a success response - video generation would be implemented with actual service
      res.json({ 
        success: true, 
        message: "Video generation started",
        variationId 
      });
    } catch (error) {
      console.error("Error starting video generation:", error);
      res.status(500).json({ error: "Failed to start video generation" });
    }
  });

  // Project History API endpoints
  app.get("/api/projects/:id/history", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const history = await storage.getProjectHistory(projectId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching project history:", error);
      res.status(500).json({ error: "Failed to fetch project history" });
    }
  });

  // Register script analysis routes
  registerScriptAnalysisRoutes(app);
  registerWorkflowRoutes(app);
  registerComprehensiveAnalysisRoutes(app);
  registerScriptGenerationRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
