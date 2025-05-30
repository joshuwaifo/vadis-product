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
    // Try using HubSpot's transactional email API
    const emailData = {
      emailId: 123456789, // This would need to be a real template ID from your HubSpot account
      message: {
        to: demoRequest.email,
        from: "noreply@vadismedia.com", // This needs to be verified in HubSpot
        subject: "Demo Request Confirmation - VadisAI",
      },
      contactProperties: {
        firstname: demoRequest.firstName,
        lastname: demoRequest.lastName,
        company: demoRequest.companyName,
        jobtitle: demoRequest.jobTitle || "",
        demo_use_case: demoRequest.useCase || ""
      }
    };

    try {
      // Try transactional email first
      await this.makeRequest("/marketing/v3/transactional/single-email/send", "POST", emailData);
      console.log(`Transactional email sent to ${demoRequest.email}`);
    } catch (transactionalError: any) {
      console.log("Transactional email failed, trying alternative method:", transactionalError.message);
      
      // Fall back to creating an email engagement (for logging only)
      const engagementData = {
        engagement: {
          active: true,
          type: "EMAIL",
          timestamp: Date.now()
        },
        associations: {
          contactIds: [contactId]
        },
        metadata: {
          subject: "Demo Request Confirmation - VadisAI",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Thank you for your demo request!</h2>
              <p>Hi ${demoRequest.firstName},</p>
              <p>We've received your demo request for VadisAI. Our team will be in touch within 24 hours to schedule your personalized demo.</p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Your Request Details:</h3>
                <p><strong>Name:</strong> ${demoRequest.firstName} ${demoRequest.lastName}</p>
                <p><strong>Company:</strong> ${demoRequest.companyName}</p>
                <p><strong>Email:</strong> ${demoRequest.email}</p>
                ${demoRequest.jobTitle ? `<p><strong>Role:</strong> ${demoRequest.jobTitle}</p>` : ''}
                ${demoRequest.useCase ? `<p><strong>Use Case:</strong> ${demoRequest.useCase}</p>` : ''}
              </div>
              <p>In the meantime, feel free to explore our resources or contact us directly if you have any questions.</p>
              <p>Best regards,<br>The VadisAI Team</p>
            </div>
          `,
          text: `Hi ${demoRequest.firstName}, thank you for your demo request for VadisAI. Our team will be in touch within 24 hours to schedule your personalized demo.`
        }
      };
      
      await this.makeRequest("/engagements/v1/engagements", "POST", engagementData);
      console.log("Email engagement logged (but actual email not sent - requires HubSpot email setup)");
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