import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hubspotService } from "./hubspot";
import { insertDemoRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Demo request submission endpoint
  app.post("/api/demo-request", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = insertDemoRequestSchema.parse(req.body);

      let hubspotContactId = null;
      let hubspotDealId = null;

      // Try to submit to HubSpot first (primary database)
      if (hubspotService) {
        try {
          const hubspotResult = await hubspotService.submitDemoRequest(validatedData);
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
        hubspotSynced: !!(hubspotContactId && hubspotDealId),
        meetingLink: hubspotResult?.meetingLink
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

  const httpServer = createServer(app);

  return httpServer;
}
