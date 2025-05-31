# Demo Request System Documentation

## Overview

The VadisAI demo request system is a comprehensive lead generation platform that captures potential customers' information and seamlessly integrates with HubSpot CRM for sales pipeline management. The system provides role-specific demo pages tailored for different user types in the entertainment industry.

## Features

### ✅ Multi-Role Demo Pages
- **Default Demo Request**: `/demo-request` - General demo form with company type selection
- **Production Company**: `/demo/production` - Tailored for film/TV production companies
- **Brand/Agency**: `/demo/brand` - Focused on marketing agencies and brand partnerships
- **Financier**: `/demo/financier` - Designed for investors and financial partners
- **Individual Creator**: `/demo/creator` - For content creators and independent professionals

### ✅ HubSpot CRM Integration
- Creates contacts with comprehensive profile information
- Generates deals in sales pipeline with demo request details
- Handles duplicate contacts gracefully
- Maps company types to industry classifications

### ✅ Form Validation
- Required fields: First Name, Last Name, Email, Company Name
- Optional fields: Job Title, Use Case/Project Details
- Email format validation
- Real-time form validation feedback

## Technical Architecture

### Frontend Components

**Landing Page Integration**
- Request demo button prominently displayed
- Gradient design matching VadisAI branding
- Responsive across all device sizes

**Form Pages Structure**
```
client/src/pages/
├── demo-request.tsx      # Default demo form
├── demo-production.tsx   # Production company specific
├── demo-brand.tsx        # Brand/agency specific
├── demo-financier.tsx    # Financier specific
└── demo-creator.tsx      # Creator specific
```

**Form Schema**
```typescript
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  companyName: z.string().min(1, "Company name is required"),
  companyType: z.string().optional(), // Auto-filled for role-specific pages
  jobTitle: z.string().optional(),
  useCase: z.string().optional()
});
```

### Backend Integration

**API Endpoint**: `POST /api/demo-request`

**Request Body**:
```json
{
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "companyName": "string",
  "companyType": "production_company|brand_agency|financier|individual_creator",
  "jobTitle": "string (optional)",
  "useCase": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "id": 1,
  "hubspotSynced": true
}
```

### HubSpot Integration

**Contact Creation**
- Primary email serves as unique identifier
- Updates existing contacts if found
- Maps form fields to HubSpot properties:
  - `firstname` → First Name
  - `lastname` → Last Name  
  - `email` → Email
  - `company` → Company Name
  - `industry` → Company Type
  - `jobtitle` → Job Title

**Deal Creation**
- Creates deal associated with contact
- Deal name: "Demo Request - [Company Name]"
- Deal amount: $10,000 (placeholder value)
- Pipeline: Default sales pipeline
- Deal stage: Initial stage

**Company Type Mapping**
```typescript
production_company → "Entertainment & Media"
brand_agency → "Marketing & Advertising" 
financier → "Financial Services"
individual_creator → "Creative Services"
```

## Page-Specific Content

### Production Company (`/demo/production`)
**Focus**: AI talent matching, location incentives, brand integration
**Key Features**:
- Access to verified talent database
- Location-based incentive tracking
- Brand partnership visualization tools
- Production timeline optimization

### Brand/Agency (`/demo/brand`)
**Focus**: Connecting with production companies, audience targeting
**Key Features**:
- Production company marketplace
- Audience analytics and targeting
- Campaign performance tracking
- ROI measurement tools

### Financier (`/demo/financier`)
**Focus**: Investment opportunities in film/TV productions
**Key Features**:
- Investment opportunity pipeline
- ROI prediction analytics
- Risk assessment tools
- Portfolio management dashboard

### Individual Creator (`/demo/creator`)
**Focus**: Collaboration and monetization opportunities
**Key Features**:
- Creator collaboration network
- Monetization opportunity matching
- Content performance analytics
- Brand partnership opportunities

## Environment Configuration

### Required Environment Variables
```bash
HUBSPOT_API_KEY=your_hubspot_private_app_key
```

### HubSpot Setup Requirements
1. HubSpot account (Starter tier or higher)
2. Private app with CRM permissions:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`

## Usage Flow

1. **User visits landing page** → Clicks "Request a Demo"
2. **Redirected to demo form** → Selects appropriate role-specific page or uses default
3. **Fills out form** → Provides contact and company information
4. **Form submission** → Data validated and sent to backend
5. **HubSpot integration** → Contact and deal created in CRM
6. **Success confirmation** → User sees confirmation message
7. **Sales follow-up** → Sales team contacts prospect within 24 hours

## Error Handling

### Frontend Validation
- Real-time field validation
- Clear error messages for invalid inputs
- Form submission disabled until all required fields valid

### Backend Error Handling
- Graceful handling of HubSpot API failures
- Duplicate contact management
- Comprehensive error logging
- User-friendly error responses

### HubSpot Integration Resilience
- Automatic retry logic for transient failures
- Fallback storage if HubSpot unavailable
- Detailed logging for troubleshooting

## Analytics & Tracking

### Available Metrics
- Demo request conversion rates by page type
- Lead quality by company type
- Form completion vs. abandonment rates
- Time-to-contact from demo request

### HubSpot Reporting
- All demo requests tracked as deals in pipeline
- Contact source attribution maintained
- Custom properties for detailed segmentation
- Integration with HubSpot reporting tools

## Customization Options

### Adding New Demo Types
1. Create new page component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Update company type mapping in backend
4. Add specific messaging and branding

### Form Field Modifications
1. Update Zod schema in form components
2. Modify HubSpot property mappings
3. Update database schema if using persistent storage
4. Test validation and submission flow

## Security Considerations

- All form inputs validated and sanitized
- HubSpot API key stored securely as environment variable
- HTTPS enforced for all form submissions
- Rate limiting on API endpoints
- Input length restrictions to prevent abuse

## Performance Optimization

- Form components use React Query for efficient state management
- Optimistic UI updates for better user experience
- Lazy loading of non-critical form elements
- Minimal external dependencies
- CDN-ready static assets

## Future Enhancements

### Planned Features
- Email confirmation system (pending email service integration)
- Multi-step form wizard for complex requirements
- Calendar integration for instant meeting scheduling
- Advanced analytics and conversion tracking
- A/B testing for form optimization

### Integration Opportunities
- Salesforce CRM alternative
- Marketing automation platforms
- Calendar scheduling tools (Calendly, HubSpot Meetings)
- Email marketing services (SendGrid, Brevo)
- Analytics platforms (Google Analytics, Mixpanel)