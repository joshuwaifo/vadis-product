# Script Analysis System Documentation

## Overview

The VadisAI Script Analysis System is a comprehensive AI-powered platform that transforms film and TV scripts into detailed investment-ready reports. The system processes PDF scripts through 8 specialized analysis components, providing production companies and investors with complete project evaluation.

## System Architecture

### Multi-Provider AI Client
The system supports multiple AI providers for optimal analysis quality:
- **Google Gemini**: Models include `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash-exp`
- **OpenAI**: Models include `gpt-4o`, `gpt-4o-mini`
- **xAI Grok**: Models include `grok-beta`, `grok-vision-beta`

### Core Components

#### 1. PDF Script Processing
- **File Upload**: Secure PDF upload with validation
- **Text Extraction**: Advanced PDF parsing with formatting preservation
- **Character Encoding**: Proper handling of special characters and formatting

#### 2. Scene Extraction & Analysis
- **Scene Breakdown**: Automatic identification of scenes, locations, and timing
- **Character Tracking**: Scene-by-scene character presence mapping
- **Duration Estimation**: Scene timing for production planning
- **VFX Identification**: Early detection of special effects requirements

#### 3. Character Analysis
- **Character Profiles**: Detailed character descriptions and importance ranking
- **Relationship Mapping**: Complex character relationship analysis with strength ratings
- **Character Arcs**: Story development tracking for each character
- **Screen Time Estimation**: Production planning metrics

#### 4. Actor Casting Suggestions
- **AI-Powered Matching**: Industry-aware actor suggestions based on character profiles
- **Collaboration History**: Real working relationships and past collaborations
- **Availability Assessment**: Current market availability estimates
- **Fee Estimation**: Budget planning with realistic actor costs

#### 5. VFX Needs Assessment
- **Complexity Analysis**: Detailed VFX requirements with complexity ratings
- **Cost Estimation**: Realistic budget projections for special effects
- **Technical Specifications**: Detailed VFX breakdowns for production planning
- **Reference Compilation**: Industry examples and technical references

#### 6. Product Placement Analysis
- **Opportunity Identification**: Natural product placement opportunities
- **Brand Matching**: Suitable brands for story context
- **Revenue Estimation**: Potential income from product placements
- **Integration Quality**: Naturalness scoring for brand integrations

#### 7. Location Scouting
- **Location Suggestions**: Scene-specific filming location recommendations
- **Tax Incentive Analysis**: State and international filming incentives
- **Cost Analysis**: Location-specific production cost estimates
- **Logistics Assessment**: Transportation, accommodation, and crew considerations

#### 8. Financial Planning
- **Budget Breakdown**: Comprehensive production budget analysis
- **Revenue Projections**: Multi-channel revenue forecasting
- **ROI Analysis**: Return on investment calculations
- **Risk Assessment**: Financial risk analysis and mitigation strategies

## Database Schema

### Projects Table
```sql
projects (
  id: serial primary key,
  title: varchar(255) not null,
  project_type: varchar(50) default 'feature',
  status: varchar(50),
  user_id: integer references users(id),
  logline: text,
  budget_range: varchar(100),
  funding_goal: decimal(12,2),
  funding_raised: decimal(12,2) default 0,
  production_timeline: varchar(100),
  target_genres: text[],
  script_content: text,
  is_published: boolean default false,
  scenes_data: jsonb,
  characters_data: jsonb,
  actors_data: jsonb,
  vfx_data: jsonb,
  product_placement_data: jsonb,
  locations_data: jsonb,
  financial_plan: jsonb,
  reader_report: text,
  created_at: timestamp default now(),
  updated_at: timestamp default now()
)
```

### Analysis Tables
```sql
scenes (
  id: serial primary key,
  project_id: integer references projects(id),
  scene_number: integer not null,
  location: varchar(255),
  time_of_day: varchar(100),
  description: text,
  characters: text[],
  content: text,
  page_start: integer,
  page_end: integer,
  duration: integer,
  vfx_needs: text[],
  product_placement_opportunities: text[]
)

characters (
  id: serial primary key,
  project_id: integer references projects(id),
  name: varchar(255) not null,
  description: text,
  age: varchar(50),
  gender: varchar(50),
  personality: text[],
  importance: varchar(50),
  screen_time: integer,
  character_arc: text
)

actor_suggestions (
  id: serial primary key,
  project_id: integer references projects(id),
  character_name: varchar(255) not null,
  actor_name: varchar(255) not null,
  reasoning: text,
  fit_score: integer,
  availability: varchar(100),
  estimated_fee: varchar(100),
  working_relationships: text[]
)

vfx_needs (
  id: serial primary key,
  project_id: integer references projects(id),
  scene_id: varchar(100),
  scene_description: text,
  vfx_type: varchar(255),
  complexity: varchar(50),
  estimated_cost: decimal(12,2),
  description: text,
  reference_images: text[]
)

product_placements (
  id: serial primary key,
  project_id: integer references projects(id),
  scene_id: varchar(100),
  brand: varchar(255),
  product: varchar(255),
  placement: text,
  naturalness: integer,
  visibility: varchar(50),
  estimated_value: decimal(12,2)
)

location_suggestions (
  id: serial primary key,
  project_id: integer references projects(id),
  scene_id: varchar(100),
  location_type: varchar(255),
  location: varchar(255),
  city: varchar(255),
  state: varchar(255),
  country: varchar(255),
  tax_incentive: decimal(5,2),
  estimated_cost: decimal(12,2),
  logistics: text,
  weather_considerations: text
)
```

## API Endpoints

### Script Analysis Workflow
```
POST /api/projects/script-analysis
Content-Type: multipart/form-data

Body:
- title: string
- logline: string
- budgetRange: string
- fundingGoal: number
- productionTimeline: string
- scriptFile: File (PDF)
```

### Analysis Components
```
GET /api/projects/:id/analysis/:component
Components: scenes, characters, actors, vfx, product-placement, locations, financial, summary
```

## Usage Workflow

### 1. Project Creation
1. User navigates to `/dashboard/projects/new/script_analysis`
2. Fills out project details (title, logline, budget, timeline)
3. Uploads PDF script file
4. Submits form to initiate analysis

### 2. AI Analysis Process
1. **PDF Processing**: Extract and clean script text
2. **Scene Analysis**: Break down scenes and identify elements
3. **Character Analysis**: Map characters and relationships
4. **Casting Analysis**: Generate actor suggestions
5. **VFX Analysis**: Identify special effects needs
6. **Product Placement**: Find brand integration opportunities
7. **Location Analysis**: Suggest filming locations
8. **Financial Planning**: Generate comprehensive budget
9. **Reader's Report**: Create executive summary

### 3. Results Presentation
- Comprehensive dashboard with 8 analysis components
- Downloadable reports in multiple formats
- Interactive visualizations and charts
- Investment-ready documentation

## AI Provider Configuration

### Required Environment Variables
```bash
GEMINI_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
XAI_API_KEY=your_xai_grok_api_key
```

### Provider Selection Strategy
- **Scene Extraction**: Gemini 1.5 Flash (fast processing)
- **Character Analysis**: Gemini 1.5 Pro (deep understanding)
- **Actor Suggestions**: GPT-4o (industry knowledge)
- **VFX Analysis**: Gemini 2.0 Flash (latest capabilities)
- **Product Placement**: GPT-4o Mini (cost-effective)
- **Location Suggestions**: Gemini 1.5 Pro (geographical knowledge)
- **Financial Planning**: GPT-4o (complex calculations)
- **Reader's Report**: GPT-4o (professional writing)

## Error Handling

### File Upload Validation
- PDF format verification
- File size limits (50MB maximum)
- Content validation for script format
- Virus scanning and security checks

### AI Processing Errors
- Provider failover mechanisms
- Retry logic with exponential backoff
- Graceful degradation for partial failures
- Detailed error logging and monitoring

### Database Integrity
- Transaction management for analysis updates
- Foreign key constraints for data consistency
- JSON validation for structured data
- Backup and recovery procedures

## Security Considerations

### File Security
- Secure file upload with validation
- Temporary file cleanup after processing
- Content scanning for malicious uploads
- Access control for script content

### API Security
- Rate limiting on analysis endpoints
- Authentication required for all operations
- API key rotation and management
- Audit logging for all analysis requests

### Data Privacy
- Script content encryption at rest
- Secure deletion of temporary files
- GDPR compliance for user data
- Industry-standard security practices

## Performance Optimization

### Processing Efficiency
- Asynchronous analysis pipeline
- Parallel processing of independent components
- Caching of intermediate results
- Progressive result delivery

### Scalability
- Queue-based job processing
- Load balancing across AI providers
- Database connection pooling
- CDN integration for file delivery

## Future Enhancements

### Planned Features
- Video analysis for existing footage
- Real-time collaboration on analysis results
- Integration with production management tools
- Advanced financial modeling and scenarios

### AI Improvements
- Custom model training on industry data
- Multi-language script support
- Voice-over and dubbing analysis
- Automated storyboard generation

## Monitoring and Analytics

### System Metrics
- Analysis completion rates by component
- Processing time per script length
- AI provider performance comparison
- User engagement with analysis results

### Business Intelligence
- Popular script genres and themes
- Budget range analysis trends
- Geographic filming preference patterns
- ROI prediction accuracy tracking