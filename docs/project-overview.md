# VadisAI Platform - Project Overview

## Platform Description

VadisAI is a comprehensive AI-powered collaboration platform for the entertainment industry, designed to bridge the gap between creative vision and financial execution. The platform serves as a marketplace where production companies can publish investment-ready projects analyzed through advanced AI systems.

## Core Value Proposition

**Script-to-Investment Pipeline**: Transform raw film/TV scripts into comprehensive investment packages through AI-powered analysis, providing detailed insights for production planning, casting, budgeting, and market positioning.

## Target Users

### Production Companies
- **Primary Use**: Create and manage film/TV projects with AI-powered analysis
- **Key Features**: Script analysis, project publishing, investor connection
- **Dashboard Access**: Project creation, portfolio management, script analysis tools

### Investors/Financiers  
- **Primary Use**: Discover vetted investment opportunities with detailed analysis
- **Key Features**: Project marketplace, AI-generated reports, ROI projections
- **Dashboard Access**: Investment pipeline, project discovery, financial analytics

### Brands/Agencies
- **Primary Use**: Product placement and brand partnership opportunities
- **Key Features**: Product management, brand integration analysis
- **Dashboard Access**: Product catalog, partnership matching, campaign tracking

### Individual Creators
- **Primary Use**: Portfolio showcase and collaboration opportunities
- **Key Features**: Creative portfolio, networking, project participation
- **Dashboard Access**: Portfolio management, collaboration tools, opportunity discovery

## System Architecture

### Frontend Technology Stack
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight routing
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Icons**: Lucide React and React Icons

### Backend Technology Stack
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Express sessions with bcrypt
- **File Processing**: Multer for PDF uploads
- **AI Integration**: Multi-provider client system

### Database Schema
- **Users**: Authentication and role management
- **Production Profiles**: Company information and billing
- **Projects**: Core project data with analysis results
- **Analysis Components**: Dedicated tables for each analysis type
- **Demo Requests**: Lead generation and CRM integration

## Key Features

### 1. Comprehensive Script Analysis System
**8 Specialized Analysis Components:**

#### Scene Extraction & Breakdown
- Automatic scene identification with location mapping
- Character presence tracking per scene
- Duration estimation for production planning
- VFX requirements identification

#### Character Analysis & Relationships
- Detailed character profiles with importance ranking
- Complex relationship mapping with strength ratings
- Character arc development tracking
- Screen time estimation for casting decisions

#### AI-Powered Actor Suggestions
- Industry-aware casting recommendations
- Real collaboration history analysis
- Availability and fee estimation
- Working relationship identification

#### VFX Needs Assessment
- Technical requirements with complexity ratings
- Realistic cost projections
- Reference material compilation
- Production timeline integration

#### Product Placement Analysis
- Natural integration opportunity identification
- Brand matching with story context
- Revenue potential estimation
- Placement quality scoring

#### Location Scouting Intelligence
- Scene-specific location recommendations
- Tax incentive analysis by jurisdiction
- Production cost estimation
- Logistics and weather considerations

#### Financial Planning & Budgeting
- Comprehensive budget breakdown
- Multi-channel revenue projections
- ROI analysis and risk assessment
- Funding strategy recommendations

#### Professional Reader's Reports
- Executive summary generation
- Market positioning analysis
- Investment recommendation
- Industry-standard formatting

### 2. Multi-Provider AI System
- **Google Gemini**: Fast processing, content understanding
- **OpenAI GPT**: Industry knowledge, professional writing
- **xAI Grok**: Alternative perspectives, vision capabilities
- **Intelligent Provider Selection**: Optimal model for each analysis type

### 3. Project Management Platform
- **Project Creation**: Multi-step wizard with PDF script upload
- **Portfolio Management**: Project status tracking and organization
- **Publishing System**: Investment-ready project presentation
- **Collaboration Tools**: Team management and communication

### 4. Authentication & Security
- **Multi-Role Authentication**: Production, investor, brand, creator roles
- **Secure Sessions**: PostgreSQL-backed session management
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Comprehensive Zod schema validation

### 5. CRM Integration
- **HubSpot Integration**: Automated lead management
- **Demo Request System**: Multi-role demo pages
- **Contact Management**: Automated contact and deal creation
- **Sales Pipeline**: Integrated opportunity tracking

## Current Development Status

### ✅ Completed Features
- Multi-role authentication system with PostgreSQL persistence
- Comprehensive script analysis system with 8 AI-powered components
- Multi-provider AI client supporting Gemini, OpenAI, and Grok
- PDF script upload and text extraction
- Database schema with analysis component tables
- Project creation and management workflows
- HubSpot CRM integration for demo requests
- Responsive dashboard with professional design
- Role-based access control and security

### 🔧 Recently Updated
- Fixed React infinite loop issues in profile management
- Cleaned up outdated script analysis files
- Updated database schema with missing columns
- Enhanced documentation structure
- Improved error handling and validation

### 📋 Configuration Requirements
**Environment Variables Needed:**
- `GEMINI_API_KEY`: Google Gemini API access
- `OPENAI_API_KEY`: OpenAI GPT model access  
- `XAI_API_KEY`: xAI Grok model access
- `HUBSPOT_API_KEY`: CRM integration
- `DATABASE_URL`: PostgreSQL connection

## File Structure

### Core Application
```
├── client/src/
│   ├── pages/
│   │   ├── dashboard/           # Main dashboard components
│   │   ├── auth/               # Authentication pages
│   │   ├── demos/              # Demo request pages
│   │   └── landing.tsx         # Homepage
│   ├── components/ui/          # Reusable UI components
│   └── lib/                   # Utility functions
├── server/
│   ├── ai-client.ts           # Multi-provider AI system
│   ├── script-analysis-agents.ts # 8 analysis components
│   ├── script-analysis-routes.ts # Analysis API endpoints
│   ├── storage.ts             # Database operations
│   ├── routes.ts              # Main API routes
│   └── index.ts               # Express server
├── shared/
│   └── schema.ts              # Database schema definitions
└── docs/                      # Documentation
```

### Dashboard Pages
- `dashboard-home.tsx`: Main dashboard with project overview
- `profile.tsx`: Company profile and billing management
- `projects-list.tsx`: Project portfolio view
- `project-creation.tsx`: Multi-step project creation
- `script-analysis-new.tsx`: AI-powered script analysis workflow
- `script-generator.tsx`: AI script generation tools

### Demo System
- `demo-request.tsx`: General demo request form
- `demo-production.tsx`: Production company specific
- `demo-brand.tsx`: Brand/agency focused
- `demo-financier.tsx`: Investor oriented
- `demo-creator.tsx`: Individual creator targeted

## API Endpoints

### Authentication
- `POST /api/auth/signup`: User registration with role selection
- `POST /api/auth/login`: User authentication
- `GET /api/auth/logout`: Session termination

### Project Management
- `GET /api/projects`: User's project list
- `POST /api/projects`: Create new project
- `GET /api/projects/:id`: Project details
- `PATCH /api/projects/:id`: Update project
- `POST /api/projects/:id/publish`: Publish to marketplace

### Script Analysis
- `POST /api/projects/script-analysis`: Upload and analyze script
- `GET /api/projects/:id/analysis/:component`: Get analysis results

### Demo Requests
- `POST /api/demo-request`: Submit demo request
- `GET /api/demo-requests`: Admin dashboard (if applicable)

### User Management
- `GET /api/profile`: User profile data
- `PATCH /api/profile`: Update profile
- `PATCH /api/profile/billing`: Update billing information

## Design System

### Color Palette
- **Primary Gradient**: Blue to purple (`from-blue-500 via-purple-600 to-pink-600`)
- **Background**: Clean whites with gray accents
- **Text**: Professional gray hierarchy
- **Status Colors**: Green (success), red (error), yellow (warning)

### Typography
- **Headings**: Bold, hierarchical sizing
- **Body Text**: Readable with proper line height
- **Code**: Monospace for technical content

### Layout Principles
- **Responsive Design**: Mobile-first approach
- **Card-Based Layout**: Clean information architecture
- **Progressive Disclosure**: Complex features revealed progressively
- **Professional Aesthetic**: Industry-appropriate design language

## Business Model

### Revenue Streams
1. **Subscription Tiers**: Monthly/annual access to AI analysis tools
2. **Analysis Credits**: Pay-per-analysis for occasional users  
3. **Marketplace Commission**: Percentage of successful project funding
4. **Premium Features**: Advanced analytics and white-label solutions

### Market Positioning
- **Primary Market**: Independent production companies seeking funding
- **Secondary Market**: Established studios optimizing development process
- **Adjacent Markets**: Investment funds, brand agencies, content creators

## Future Roadmap

### Short-Term Enhancements
- Enhanced dashboard analytics and reporting
- Advanced project collaboration features
- Mobile app development
- API rate limiting and monitoring

### Medium-Term Goals
- Multi-language script support
- Video content analysis capabilities
- Blockchain-based contract management
- Advanced financial modeling

### Long-Term Vision
- Global marketplace for entertainment projects
- AI-powered content creation tools
- Industry-standard analytics platform
- Comprehensive production management suite

## Technical Considerations

### Performance
- Asynchronous AI processing for large scripts
- Database connection pooling
- CDN integration for file delivery
- Progressive loading for complex analysis

### Security
- Input sanitization and validation
- Secure file upload handling
- API rate limiting
- Comprehensive audit logging

### Scalability
- Microservices architecture potential
- Horizontal database scaling
- Load balancing strategies
- Queue-based job processing

## Documentation Structure

- `authentication.md`: User management and security
- `script-analysis.md`: AI analysis system details
- `ai-client.md`: Multi-provider AI integration
- `demo-request.md`: Lead generation system
- `homepage.md`: Landing page documentation
- `project-overview.md`: This comprehensive overview

This platform represents a significant advancement in entertainment industry tooling, combining cutting-edge AI technology with practical business needs to create a comprehensive solution for script-to-investment workflows.