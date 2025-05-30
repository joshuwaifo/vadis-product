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
    // Use HubSpot's transactional email API with subscription account
    const emailData = {
      message: {
        to: demoRequest.email,
        subject: "Demo Request Received - We'll Be In Touch Soon!",
        htmlBody: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Demo Request Confirmation</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 40px 20px;">
                  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899); padding: 40px 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">VadisAI</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Thank you for your interest!</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">Hi ${demoRequest.firstName},</h2>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px; font-size: 16px;">
                          We've received your demo request and our team will contact you within 24 hours to schedule your personalized VadisAI demonstration.
                        </p>
                        
                        <!-- Request Details -->
                        <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #3b82f6;">
                          <h3 style="color: #1f2937; margin: 0 0 16px; font-size: 18px;">Request Details:</h3>
                          <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 4px 0; color: #6b7280; font-weight: 600; width: 120px;">Name:</td>
                              <td style="padding: 4px 0; color: #1f2937;">${demoRequest.firstName} ${demoRequest.lastName}</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; color: #6b7280; font-weight: 600;">Company:</td>
                              <td style="padding: 4px 0; color: #1f2937;">${demoRequest.companyName}</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; color: #6b7280; font-weight: 600;">Company Type:</td>
                              <td style="padding: 4px 0; color: #1f2937;">${demoRequest.companyType || 'Not specified'}</td>
                            </tr>
                            ${demoRequest.jobTitle ? `
                            <tr>
                              <td style="padding: 4px 0; color: #6b7280; font-weight: 600;">Role:</td>
                              <td style="padding: 4px 0; color: #1f2937;">${demoRequest.jobTitle}</td>
                            </tr>
                            ` : ''}
                            ${demoRequest.useCase ? `
                            <tr>
                              <td style="padding: 4px 0; color: #6b7280; font-weight: 600;">Use Case:</td>
                              <td style="padding: 4px 0; color: #1f2937;">${demoRequest.useCase}</td>
                            </tr>
                            ` : ''}
                          </table>
                        </div>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 20px 0; font-size: 16px;">
                          In the meantime, feel free to explore our platform resources or contact us directly if you have any questions.
                        </p>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 32px 0;">
                          <a href="https://vadismedia.com" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            Explore VadisAI
                          </a>
                        </div>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 24px 0 0; font-size: 16px;">
                          Best regards,<br>
                          <strong style="color: #1f2937;">The VadisAI Team</strong>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; margin: 0; font-size: 14px;">
                          VadisMedia AG<br>
                          Gartenstrasse 6, 6300 Zug, Switzerland
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        textBody: `Hi ${demoRequest.firstName},

Thank you for your interest in VadisAI!

We've received your demo request and our team will contact you within 24 hours to schedule your personalized demonstration.

Request Details:
- Name: ${demoRequest.firstName} ${demoRequest.lastName}
- Company: ${demoRequest.companyName}
- Company Type: ${demoRequest.companyType || 'Not specified'}
${demoRequest.jobTitle ? `- Role: ${demoRequest.jobTitle}` : ''}
${demoRequest.useCase ? `- Use Case: ${demoRequest.useCase}` : ''}

Best regards,
The VadisAI Team

VadisMedia AG
Gartenstrasse 6, 6300 Zug, Switzerland`
      },
      contactProperties: {
        firstname: demoRequest.firstName,
        lastname: demoRequest.lastName,
        company: demoRequest.companyName,
        industry: demoRequest.companyType || "",
        jobtitle: demoRequest.jobTitle || ""
      }
    };

    try {
      await this.makeRequest("/marketing/v3/transactional/single-email/send", "POST", emailData);
      console.log(`Confirmation email sent successfully to ${demoRequest.email}`);
    } catch (error: any) {
      console.error("Failed to send confirmation email:", error.message);
      
      // Create an email engagement for tracking purposes
      try {
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
            html: emailData.message.htmlBody,
            text: emailData.message.textBody
          }
        };
        
        await this.makeRequest("/engagements/v1/engagements", "POST", engagementData);
        console.log("Email engagement logged for tracking");
      } catch (engagementError) {
        console.error("Failed to log email engagement:", engagementError);
      }
      
      throw new Error(`Email sending failed: ${error.message}`);
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