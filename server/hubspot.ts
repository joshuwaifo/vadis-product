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

  async createContact(demoRequest: any): Promise<HubSpotContact> {
    const contactData = {
      properties: {
        email: demoRequest.email,
        firstname: demoRequest.firstName,
        lastname: demoRequest.lastName,
        phone: demoRequest.phoneNumber || "",
        company: demoRequest.companyName,
        jobtitle: demoRequest.jobTitle || "",
        // Only include properties that exist in the form
        ...(demoRequest.useCase && { hs_content_membership_notes: demoRequest.useCase }),
      },
    };

    return this.makeRequest("/crm/v3/objects/contacts", "POST", contactData);
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

  async submitDemoRequest(demoRequest: any): Promise<{
    contactId: string;
    dealId: string;
  }> {
    try {
      // First, create or update the contact
      const contact = await this.createContact(demoRequest);
      
      // Then, create a deal associated with the contact
      const deal = await this.createDeal(contact.id, demoRequest);

      return {
        contactId: contact.id,
        dealId: deal.id,
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