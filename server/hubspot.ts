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
    // Use HubSpot email template for reliable delivery
    const templateEmailData = {
      emailId: 216446626511, // Your HubSpot email template ID
      message: {
        to: demoRequest.email,
        from: "noreply@vadismedia.com"
      },
      contactProperties: {
        firstname: demoRequest.firstName,
        lastname: demoRequest.lastName,
        company: demoRequest.companyName,
        industry: demoRequest.companyType || "",
        jobtitle: demoRequest.jobTitle || "",
        demo_use_case: demoRequest.useCase || ""
      },
      customProperties: {
        company_name: demoRequest.companyName,
        company_type: demoRequest.companyType || "Not specified",
        use_case_details: demoRequest.useCase || "Not specified"
      }
    };

    try {
      // Try using the email template first
      await this.makeRequest("/marketing/v3/transactional/single-email/send", "POST", templateEmailData);
      console.log(`Confirmation email sent successfully using template to ${demoRequest.email}`);
    } catch (templateError: any) {
      console.log("Template email failed, trying direct send:", templateError.message);
      
      // Fallback to direct email sending
      const directEmailData = {
        message: {
          to: demoRequest.email,
          subject: "Demo Request Received - We'll Be In Touch Soon!",
          htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px;">
              <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">VadisAI</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Thank you for your interest!</p>
              </div>
              
              <div style="padding: 30px;">
                <h2 style="color: #1f2937; margin: 0 0 20px;">Hi ${demoRequest.firstName},</h2>
                
                <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                  We've received your demo request and our team will contact you within 24 hours to schedule your personalized VadisAI demonstration.
                </p>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                  <h3 style="margin: 0 0 15px; color: #1f2937;">Request Details:</h3>
                  <p style="margin: 5px 0; color: #1f2937;"><strong>Name:</strong> ${demoRequest.firstName} ${demoRequest.lastName}</p>
                  <p style="margin: 5px 0; color: #1f2937;"><strong>Company:</strong> ${demoRequest.companyName}</p>
                  <p style="margin: 5px 0; color: #1f2937;"><strong>Company Type:</strong> ${demoRequest.companyType || 'Not specified'}</p>
                  ${demoRequest.jobTitle ? `<p style="margin: 5px 0; color: #1f2937;"><strong>Role:</strong> ${demoRequest.jobTitle}</p>` : ''}
                  ${demoRequest.useCase ? `<p style="margin: 5px 0; color: #1f2937;"><strong>Use Case:</strong> ${demoRequest.useCase}</p>` : ''}
                </div>
                
                <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
                  Best regards,<br><strong>The VadisAI Team</strong>
                </p>
              </div>
              
              <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                  VadisMedia AG<br>Gartenstrasse 6, 6300 Zug, Switzerland
                </p>
              </div>
            </div>
          `
        }
      };
      
      try {
        await this.makeRequest("/marketing/v3/transactional/single-email/send", "POST", directEmailData);
        console.log(`Direct confirmation email sent to ${demoRequest.email}`);
      } catch (directError: any) {
        console.log("Direct email also failed, logging engagement:", directError.message);
        
        // Final fallback - create email engagement for tracking
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
            subject: "Demo Request Received - We'll Be In Touch Soon!",
            html: directEmailData.message.htmlBody,
            text: `Hi ${demoRequest.firstName}, thank you for your demo request. Our team will contact you within 24 hours.`
          }
        };
        
        await this.makeRequest("/engagements/v1/engagements", "POST", engagementData);
        console.log("Email engagement logged for tracking purposes");
      }
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