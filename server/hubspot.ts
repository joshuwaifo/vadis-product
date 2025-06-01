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
    // Send confirmation email to client
    const emailData = {
      emailId: 126870675, // You'll need to create this email template in HubSpot
      message: {
        to: demoRequest.email,
        from: "sales@vadis.ai",
        subject: "Thank you for your VadisAI demo request"
      },
      contactProperties: [
        {
          name: "firstname",
          value: demoRequest.firstName
        },
        {
          name: "lastname", 
          value: demoRequest.lastName
        },
        {
          name: "company",
          value: demoRequest.companyName
        }
      ]
    };

    try {
      await this.makeRequest(`/marketing/v3/transactional/single-email/send`, "POST", emailData);
      console.log(`Confirmation email sent to ${demoRequest.email}`);
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      // Fallback: log the email content for manual follow-up
      console.log(`Manual follow-up needed for: ${demoRequest.email} - ${demoRequest.firstName} ${demoRequest.lastName} from ${demoRequest.companyName}`);
    }
  }

  async sendAdminNotification(contactId: string, dealId: string, demoRequest: any): Promise<void> {
    // Send notification email to admin
    const adminEmailData = {
      emailId: 126870676, // You'll need to create this admin notification template in HubSpot  
      message: {
        to: "sales@vadis.ai",
        from: "noreply@vadis.ai",
        subject: `New Demo Request: ${demoRequest.companyName}`
      },
      contactProperties: [
        {
          name: "demo_contact_name",
          value: `${demoRequest.firstName} ${demoRequest.lastName}`
        },
        {
          name: "demo_company_name",
          value: demoRequest.companyName
        },
        {
          name: "demo_company_type",
          value: demoRequest.companyType
        },
        {
          name: "demo_email",
          value: demoRequest.email
        },
        {
          name: "demo_phone",
          value: demoRequest.phoneNumber || "Not provided"
        },
        {
          name: "demo_use_case",
          value: demoRequest.useCase || "Not specified"
        },
        {
          name: "hubspot_contact_id",
          value: contactId
        },
        {
          name: "hubspot_deal_id", 
          value: dealId
        }
      ]
    };

    try {
      await this.makeRequest(`/marketing/v3/transactional/single-email/send`, "POST", adminEmailData);
      console.log(`Admin notification sent for demo request from ${demoRequest.companyName}`);
    } catch (error) {
      console.error("Failed to send admin notification:", error);
      // Fallback: log for manual notification
      console.log(`URGENT: Manual admin notification needed - New demo request from ${demoRequest.firstName} ${demoRequest.lastName} at ${demoRequest.companyName} (${demoRequest.email})`);
    }
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

      // Send confirmation email
      try {
        await this.sendConfirmationEmail(contact.id, demoRequest);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Continue even if email fails
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