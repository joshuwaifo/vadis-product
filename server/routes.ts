import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { hubspotService } from "./hubspot";
import { 
  insertDemoRequestSchema, 
  productionSignupSchema, 
  brandSignupSchema, 
  investorSignupSchema, 
  creatorSignupSchema, 
  loginSchema,
  userRoles
} from "@shared/schema";

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

  // Authentication Routes
  
  // Signup endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { role, ...signupData } = req.body;
      
      // Validate based on role
      let validatedData;
      switch (role) {
        case userRoles.PRODUCTION:
          validatedData = productionSignupSchema.parse(signupData);
          break;
        case userRoles.BRAND_AGENCY:
          validatedData = brandSignupSchema.parse(signupData);
          break;
        case userRoles.INVESTOR:
          validatedData = investorSignupSchema.parse(signupData);
          break;
        case userRoles.INDIVIDUAL_CREATOR:
          validatedData = creatorSignupSchema.parse(signupData);
          break;
        default:
          return res.status(400).json({ error: "Invalid role specified" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(validatedData.password, 10);

      // Prepare role-specific details
      let roleSpecificDetails = {};
      switch (role) {
        case userRoles.PRODUCTION:
          const prodData = validatedData as any;
          roleSpecificDetails = {
            companyName: prodData.companyName,
            contactPerson: prodData.contactPerson,
            companyWebsite: prodData.companyWebsite
          };
          break;
        case userRoles.BRAND_AGENCY:
          const brandData = validatedData as any;
          roleSpecificDetails = {
            brandName: brandData.brandName,
            contactPerson: brandData.contactPerson,
            companyWebsite: brandData.companyWebsite
          };
          break;
        case userRoles.INVESTOR:
          const investorData = validatedData as any;
          roleSpecificDetails = {
            fullName: investorData.fullName,
            investmentType: investorData.investmentType,
            structure: investorData.structure
          };
          break;
        case userRoles.INDIVIDUAL_CREATOR:
          const creatorData = validatedData as any;
          roleSpecificDetails = {
            fullName: creatorData.fullName,
            platformLink: creatorData.platformLink
          };
          break;
      }

      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        passwordHash,
        role,
        roleSpecificDetails
      });

      // Create investor profile if needed
      if (role === userRoles.INVESTOR) {
        const investorData = validatedData as any;
        await storage.createInvestorProfile({
          userId: user.id,
          investmentType: investorData.investmentType,
          structure: investorData.structure
        });
      }

      // Return user data (without password hash)
      const { passwordHash: _, ...userResponse } = user;
      res.status(201).json({
        success: true,
        user: userResponse
      });

    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Signup failed"
      });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.validateUser(validatedData.email, validatedData.password);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Return user data (without password hash)
      const { passwordHash: _, ...userResponse } = user;
      res.json({
        success: true,
        user: userResponse
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
    // This would typically check session/JWT token
    // For now, returning a placeholder response
    res.status(401).json({ error: "Authentication required" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
