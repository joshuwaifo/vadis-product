# AI Client System Documentation

## Overview

The AI Client System provides a unified interface for accessing multiple AI providers across the VadisAI platform. This multi-provider approach ensures optimal performance, cost efficiency, and reliability for different analysis tasks.

## Supported AI Providers

### Google Gemini
- **Models**: `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash-exp`
- **Strengths**: Fast processing, excellent content understanding, cost-effective
- **Use Cases**: Scene extraction, character analysis, location suggestions

### OpenAI
- **Models**: `gpt-4o`, `gpt-4o-mini`
- **Strengths**: Industry knowledge, professional writing, complex reasoning
- **Use Cases**: Actor suggestions, financial planning, reader's reports

### xAI Grok
- **Models**: `grok-beta`, `grok-vision-beta`
- **Strengths**: Alternative perspective, vision capabilities
- **Use Cases**: VFX analysis, document processing, alternative analysis

## Architecture

### Core Components

#### AI Client Factory
```typescript
export function getAIClient(provider: AIProvider) {
  switch (provider) {
    case 'gemini-1.5-flash':
    case 'gemini-1.5-pro':
    case 'gemini-2.0-flash-exp':
      return getGeminiClient(provider);
    case 'gpt-4o':
    case 'gpt-4o-mini':
      return getOpenAIClient(provider);
    case 'grok-beta':
    case 'grok-vision-beta':
      return getXAIClient(provider);
  }
}
```

#### Universal Content Generation
```typescript
export async function generateContent(
  provider: AIProvider,
  prompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
    responseFormat?: 'text' | 'json';
  }
): Promise<string>
```

#### Document Analysis
```typescript
export async function analyzeDocument(
  provider: AIProvider,
  documentBase64: string,
  prompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string>
```

### Provider Configuration

#### Google Gemini Setup
```typescript
function getGeminiClient(model: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model });
}
```

#### OpenAI Setup
```typescript
function getOpenAIClient(model: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
```

#### xAI Grok Setup
```typescript
function getXAIClient(model: string) {
  if (!process.env.XAI_API_KEY) {
    throw new Error('XAI_API_KEY environment variable is required');
  }
  
  return new OpenAI({ 
    baseURL: "https://api.x.ai/v1", 
    apiKey: process.env.XAI_API_KEY 
  });
}
```

## Utility Functions

### Text Sanitization
```typescript
export function sanitizeText(text: string): string {
  return text
    .replace(/\b(kill|murder|death|violence)\b/gi, 'conflict')
    .replace(/\b(drug|alcohol|substance)\b/gi, 'substance')
    .replace(/\b(sexual|explicit)\b/gi, 'mature content')
    .trim();
}
```

### JSON Extraction
```typescript
export function extractJsonFromText(text: string): any {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Handle parsing errors gracefully
    }
  }
  return null;
}
```

## Provider Selection Strategy

### Scene Extraction
- **Primary**: Gemini 1.5 Flash
- **Reason**: Fast processing, excellent scene understanding
- **Fallback**: Gemini 1.5 Pro for complex scripts

### Character Analysis
- **Primary**: Gemini 1.5 Pro
- **Reason**: Deep character relationship understanding
- **Fallback**: GPT-4o for nuanced personality analysis

### Actor Suggestions
- **Primary**: GPT-4o
- **Reason**: Extensive industry knowledge and collaboration data
- **Fallback**: Gemini 1.5 Pro for alternative suggestions

### VFX Analysis
- **Primary**: Gemini 2.0 Flash Experimental
- **Reason**: Latest capabilities for technical analysis
- **Fallback**: Grok Vision for alternative perspective

### Product Placement
- **Primary**: GPT-4o Mini
- **Reason**: Cost-effective brand matching
- **Fallback**: Gemini 1.5 Flash for quick analysis

### Location Suggestions
- **Primary**: Gemini 1.5 Pro
- **Reason**: Geographical knowledge and tax incentive data
- **Fallback**: GPT-4o for detailed logistics

### Financial Planning
- **Primary**: GPT-4o
- **Reason**: Complex financial modeling capabilities
- **Fallback**: Gemini 1.5 Pro for budget breakdown

### Reader's Reports
- **Primary**: GPT-4o
- **Reason**: Professional writing and industry standards
- **Fallback**: Gemini 1.5 Pro for creative analysis

## Error Handling

### Provider Failover
```typescript
async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    console.warn('Primary provider failed, using fallback:', error.message);
    return await fallback();
  }
}
```

### Rate Limiting
- Automatic retry with exponential backoff
- Provider-specific rate limit handling
- Queue management for concurrent requests

### API Key Validation
- Environment variable presence checking
- API key format validation
- Connection testing on startup

## Usage Examples

### Basic Content Generation
```typescript
const analysis = await generateContent(
  'gemini-1.5-flash',
  'Analyze the following script scene...',
  {
    maxTokens: 2000,
    temperature: 0.7,
    responseFormat: 'json'
  }
);
```

### Document Analysis
```typescript
const scriptAnalysis = await analyzeDocument(
  'gpt-4o',
  base64ScriptContent,
  'Extract scenes and characters from this script',
  {
    maxTokens: 4000,
    temperature: 0.5
  }
);
```

### Multi-Provider Workflow
```typescript
// Step 1: Extract scenes with Gemini
const scenes = await extractScenes(scriptContent, 'gemini-1.5-flash');

// Step 2: Analyze characters with different provider
const characters = await analyzeCharacters(scenes, 'gemini-1.5-pro');

// Step 3: Get actor suggestions with OpenAI
const actors = await suggestActors(characters, 'gpt-4o');
```

## Configuration

### Environment Variables
```bash
# Google Gemini
GEMINI_API_KEY=your_google_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# xAI Grok
XAI_API_KEY=your_xai_api_key
```

### Provider Settings
```typescript
const PROVIDER_CONFIGS = {
  'gemini-1.5-flash': {
    maxTokens: 8192,
    temperature: 0.7,
    safetySettings: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  'gpt-4o': {
    maxTokens: 4096,
    temperature: 0.6,
    frequencyPenalty: 0.1
  },
  'grok-beta': {
    maxTokens: 131072,
    temperature: 0.8,
    topP: 0.9
  }
};
```

## Performance Optimization

### Caching Strategy
- Response caching for identical prompts
- Intelligent cache invalidation
- Provider-specific cache configurations

### Request Batching
- Combine multiple analysis requests
- Parallel processing where possible
- Optimal provider utilization

### Cost Management
- Provider cost tracking
- Automatic cost optimization
- Budget-based provider selection

## Security Considerations

### API Key Management
- Secure environment variable storage
- Key rotation procedures
- Access logging and monitoring

### Content Filtering
- Input sanitization for safety
- Output validation and filtering
- Compliance with provider policies

### Data Privacy
- No persistent storage of API responses
- Secure transmission protocols
- GDPR compliance measures

## Monitoring and Analytics

### Performance Metrics
- Response time by provider
- Success/failure rates
- Cost per analysis type
- Token usage optimization

### Quality Assessment
- Output quality scoring
- User satisfaction tracking
- A/B testing different providers

### Error Tracking
- Detailed error logging
- Provider-specific error patterns
- Automatic alerting for failures

## Future Enhancements

### Planned Features
- Custom model fine-tuning
- Multi-modal content analysis
- Real-time streaming responses
- Advanced prompt engineering

### Provider Expansion
- Anthropic Claude integration
- Local model support
- Specialized industry models
- Custom training capabilities