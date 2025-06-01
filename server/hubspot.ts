import type { InsertDemoRequest } from "@shared/schema";

interface HubSpotContact {
  id: string;
  properties: Record<string, string>;
}

interface HubSpotDeal {
  id: string;
  properties: Record<string, string>;
}

export class HubSpotService {
  private apiKey: string;
  private baseUrl = "https://api.hubapi.com";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, method: string = "GET", data?: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async createOrUpdateContact(demoRequest: any): Promise<HubSpotContact> {
    const contactData = {
      properties: {
        email: demoRequest.email,
        firstname: demoRequest.firstName,
        lastname: demoRequest.lastName,
        phone: demoRequest.phoneNumber || "",
        company: demoRequest.companyName,
        jobtitle: demoRequest.jobTitle || "",
        // Company type for categorization
        industry: demoRequest.companyType || "",
        // Only include properties that exist in the form
        ...(demoRequest.useCase && { hs_content_membership_notes: demoRequest.useCase }),
        // Add lifecycle stage for demo requests
        lifecyclestage: "lead",
      },
    };

    try {
      // Try to create the contact
      return await this.makeRequest("/crm/v3/objects/contacts", "POST", contactData);
    } catch (error: any) {
      if (error.message.includes("409")) {
        // Contact exists, update instead
        const searchResponse = await this.makeRequest(`/crm/v3/objects/contacts/search`, "POST", {
          filterGroups: [{
            filters: [{
              propertyName: "email",
              operator: "EQ",
              value: demoRequest.email
            }]
          }]
        });
        
        if (searchResponse.results && searchResponse.results.length > 0) {
          const contactId = searchResponse.results[0].id;
          return await this.makeRequest(`/crm/v3/objects/contacts/${contactId}`, "PATCH", contactData);
        }
      }
      throw error;
    }
  }

  async createDeal(contactId: string, demoRequest: any): Promise<HubSpotDeal> {
    const dealData = {
      properties: {
        dealname: `Demo Request - ${demoRequest.companyName}`,
        dealstage: "appointmentscheduled",
        pipeline: "default",
        amount: "0",
        closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 3,
            },
          ],
        },
      ],
    };

    return this.makeRequest("/crm/v3/objects/deals", "POST", dealData);
  }

  async sendConfirmationEmail(contactId: string, demoRequest: any): Promise<void> {
    // Note: Email functionality requires proper HubSpot email permissions and templates
    // For now, we'll rely on HubSpot's workflow automation to send emails
    // when new contacts and deals are created
    console.log(`Demo request processed for ${demoRequest.email} - contact and deal created in HubSpot`);
    console.log(`Contact ID: ${contactId} | Name: ${demoRequest.firstName} ${demoRequest.lastName} | Company: ${demoRequest.companyName}`);
  }

  async sendAdminNotification(contactId: string, dealId: string, demoRequest: any): Promise<void> {
    // Log admin notification details for manual follow-up
    // HubSpot workflows can be configured to automatically notify admins when new deals are created
    console.log(`NEW DEMO REQUEST - Contact ID: ${contactId} | Deal ID: ${dealId}`);
    console.log(`Contact: ${demoRequest.firstName} ${demoRequest.lastName} (${demoRequest.email})`);
    console.log(`Company: ${demoRequest.companyName} | Type: ${demoRequest.companyType}`);
    console.log(`Phone: ${demoRequest.phoneNumber || "Not provided"} | Use Case: ${demoRequest.useCase || "Not specified"}`);
  }



  async submitDemoRequest(demoRequest: any): Promise<{
    contactId: string;
    dealId: string;
  }> {
    try {
      // First, create or update the contact
      const contact = await this.createOrUpdateContact(demoRequest);
      
      // Then, create a deal associated with the contact
      const deal = await this.createDeal(contact.id, demoRequest);

      // Send confirmation email to client
      try {
        await this.sendConfirmationEmail(contact.id, demoRequest);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Continue even if email fails
      }

      // Send admin notification
      try {
        await this.sendAdminNotification(contact.id, deal.id, demoRequest);
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
        // Continue even if admin notification fails
      }

      return {
        contactId: contact.id,
        dealId: deal.id
      };
    } catch (error) {
      console.error("HubSpot submission error:", error);
      throw error;
    }
  }
}

// Initialize HubSpot service (will be undefined if no API key)
export const hubspotService = process.env.HUBSPOT_API_KEY 
  ? new HubSpotService(process.env.HUBSPOT_API_KEY)
  : undefined;