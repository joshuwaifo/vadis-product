/**
 * Script Analysis Agents
 * 
 * Specialized AI agents for comprehensive script analysis including
 * scene extraction, character analysis, casting suggestions, VFX needs,
 * product placement, location suggestions, and financial planning.
 */

import { generateContent, analyzeDocument, extractJsonFromText, type AIProvider } from './ai-client';

export interface Scene {
  id: string;
  sceneNumber: number;
  location: string;
  timeOfDay: string;
  description: string;
  characters: string[];
  content: string;
  pageStart: number;
  pageEnd: number;
  duration: number; // estimated minutes
  vfxNeeds: string[];
  productPlacementOpportunities: string[];
}

export interface Character {
  name: string;
  description: string;
  age: string;
  gender: string;
  personality: string[];
  importance: 'lead' | 'supporting' | 'minor';
  screenTime: number; // estimated minutes
  relationships: Array<{
    character: string;
    relationship: string;
    strength: number; // 1-10
  }>;
  characterArc: string;
}

export interface ActorSuggestion {
  characterName: string;
  suggestions: Array<{
    actorName: string;
    reasoning: string;
    fitScore: number; // 1-100
    availability: string;
    estimatedFee: string;
    workingRelationships: string[];
  }>;
}

export interface VFXNeed {
  sceneId: string;
  sceneDescription: string;
  vfxType: string;
  complexity: 'low' | 'medium' | 'high' | 'extreme';
  estimatedCost: number;
  description: string;
  referenceImages: string[];
}

export interface ProductPlacement {
  sceneId: string;
  brand: string;
  product: string;
  placement: string;
  naturalness: number; // 1-10
  visibility: 'background' | 'featured' | 'hero';
  estimatedValue: number;
}

export interface LocationSuggestion {
  sceneId: string;
  locationType: string;
  suggestions: Array<{
    location: string;
    city: string;
    state: string;
    country: string;
    taxIncentive: number; // percentage
    estimatedCost: number;
    logistics: string;
    weatherConsiderations: string;
  }>;
}

export interface FinancialPlan {
  totalBudget: number;
  budgetBreakdown: {
    preProduction: number;
    production: number;
    postProduction: number;
    marketing: number;
    contingency: number;
  };
  revenueProjections: {
    domestic: number;
    international: number;
    streaming: number;
    merchandise: number;
    productPlacement: number;
  };
  roi: number;
  breakEvenPoint: number;
}

/**
 * Extract scenes from a script PDF
 */
export async function extractScenes(
  scriptContent: string,
  provider: AIProvider = 'gemini-1.5-flash'
): Promise<Scene[]> {
  const prompt = `
    Analyze this script and extract all scenes. For each scene, identify:
    - Scene number
    - Location (INT./EXT. and specific place)
    - Time of day
    - Brief description
    - Characters present
    - Full scene content
    - Page numbers (estimate)
    - Estimated duration in minutes
    - Any VFX needs
    - Product placement opportunities

    Return as JSON array with this structure:
    {
      "scenes": [
        {
          "id": "scene_1",
          "sceneNumber": 1,
          "location": "INT. COFFEE SHOP - DAY",
          "timeOfDay": "DAY",
          "description": "Brief scene description",
          "characters": ["CHARACTER1", "CHARACTER2"],
          "content": "Full scene dialogue and action",
          "pageStart": 1,
          "pageEnd": 3,
          "duration": 5,
          "vfxNeeds": ["practical effects needed"],
          "productPlacementOpportunities": ["coffee brands", "laptops"]
        }
      ]
    }

    Script content:
    ${scriptContent}
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 8000
    });

    const parsed = extractJsonFromText(response);
    return parsed?.scenes || [];
  } catch (error) {
    console.error('Error extracting scenes:', error);
    throw new Error('Failed to extract scenes from script');
  }
}

/**
 * Analyze characters and their relationships
 */
export async function analyzeCharacters(
  scenes: Scene[],
  provider: AIProvider = 'gemini-1.5-pro'
): Promise<{ characters: Character[], relationships: any[] }> {
  const sceneText = scenes.map(s => s.content).join('\n\n');
  
  const prompt = `
    Analyze the characters in this script and their relationships. Provide:
    
    1. Character analysis with personality, importance, screen time estimates
    2. Relationship mapping between characters with strength ratings
    3. Character development arcs

    Return as JSON with this structure:
    {
      "characters": [
        {
          "name": "CHARACTER_NAME",
          "description": "Physical and personality description",
          "age": "Age range",
          "gender": "Gender",
          "personality": ["trait1", "trait2", "trait3"],
          "importance": "lead|supporting|minor",
          "screenTime": 45,
          "relationships": [
            {
              "character": "OTHER_CHARACTER",
              "relationship": "relationship type",
              "strength": 8
            }
          ],
          "characterArc": "Character development description"
        }
      ],
      "relationshipGraph": [
        {
          "from": "CHARACTER1",
          "to": "CHARACTER2", 
          "type": "relationship_type",
          "strength": 7
        }
      ]
    }

    Script content:
    ${sceneText}
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 6000
    });

    const parsed = extractJsonFromText(response);
    return {
      characters: parsed?.characters || [],
      relationships: parsed?.relationshipGraph || []
    };
  } catch (error) {
    console.error('Error analyzing characters:', error);
    throw new Error('Failed to analyze characters');
  }
}

/**
 * Suggest actors for characters
 */
export async function suggestActors(
  characters: Character[],
  provider: AIProvider = 'gpt-4o'
): Promise<ActorSuggestion[]> {
  const prompt = `
    Based on these character descriptions, suggest appropriate actors for each role.
    Consider age, physical characteristics, acting range, and current availability.
    Also consider actors who have good working relationships with each other.

    Characters:
    ${JSON.stringify(characters, null, 2)}

    Return as JSON array with this structure:
    [
      {
        "characterName": "CHARACTER_NAME",
        "suggestions": [
          {
            "actorName": "Actor Name",
            "reasoning": "Why this actor fits the role",
            "fitScore": 85,
            "availability": "Available 2024",
            "estimatedFee": "$2-5M",
            "workingRelationships": ["Actor B", "Actor C"]
          }
        ]
      }
    ]
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 4000
    });

    return extractJsonFromText(response) || [];
  } catch (error) {
    console.error('Error suggesting actors:', error);
    throw new Error('Failed to suggest actors');
  }
}

/**
 * Analyze VFX needs
 */
export async function analyzeVFXNeeds(
  scenes: Scene[],
  provider: AIProvider = 'gemini-2.0-flash-exp'
): Promise<VFXNeed[]> {
  const prompt = `
    Analyze these scenes for VFX requirements. Identify:
    - Type of VFX needed (CGI, practical effects, compositing, etc.)
    - Complexity level
    - Estimated cost
    - Detailed description

    Scenes:
    ${JSON.stringify(scenes.map(s => ({ id: s.id, description: s.description, content: s.content })), null, 2)}

    Return as JSON array:
    [
      {
        "sceneId": "scene_1",
        "sceneDescription": "Brief description",
        "vfxType": "CGI Environment",
        "complexity": "high",
        "estimatedCost": 150000,
        "description": "Detailed VFX requirements",
        "referenceImages": ["style references or mood boards"]
      }
    ]
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 4000
    });

    return extractJsonFromText(response) || [];
  } catch (error) {
    console.error('Error analyzing VFX needs:', error);
    throw new Error('Failed to analyze VFX needs');
  }
}

/**
 * Generate product placement ideas
 */
export async function generateProductPlacement(
  scenes: Scene[],
  provider: AIProvider = 'gpt-4o-mini'
): Promise<ProductPlacement[]> {
  const prompt = `
    Analyze these scenes for natural product placement opportunities.
    Focus on placements that feel organic and don't disrupt the story.

    Scenes:
    ${JSON.stringify(scenes.map(s => ({ id: s.id, location: s.location, description: s.description })), null, 2)}

    Return as JSON array:
    [
      {
        "sceneId": "scene_1",
        "brand": "Brand Name",
        "product": "Specific Product",
        "placement": "How it's integrated",
        "naturalness": 8,
        "visibility": "featured",
        "estimatedValue": 50000
      }
    ]
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 3000
    });

    return extractJsonFromText(response) || [];
  } catch (error) {
    console.error('Error generating product placement ideas:', error);
    throw new Error('Failed to generate product placement ideas');
  }
}

/**
 * Suggest filming locations
 */
export async function suggestLocations(
  scenes: Scene[],
  provider: AIProvider = 'gemini-1.5-pro'
): Promise<LocationSuggestion[]> {
  const prompt = `
    Suggest filming locations for these scenes, considering:
    - Tax incentives by state/country
    - Production costs
    - Logistics and accessibility
    - Weather patterns
    - Local crew availability

    Scenes:
    ${JSON.stringify(scenes.map(s => ({ id: s.id, location: s.location, description: s.description })), null, 2)}

    Return as JSON array:
    [
      {
        "sceneId": "scene_1",
        "locationType": "Urban Office Building",
        "suggestions": [
          {
            "location": "Specific location name",
            "city": "City",
            "state": "State",
            "country": "Country",
            "taxIncentive": 25,
            "estimatedCost": 5000,
            "logistics": "Accessibility and setup notes",
            "weatherConsiderations": "Best filming months"
          }
        ]
      }
    ]
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 4000
    });

    return extractJsonFromText(response) || [];
  } catch (error) {
    console.error('Error suggesting locations:', error);
    throw new Error('Failed to suggest locations');
  }
}

/**
 * Generate financial plan
 */
export async function generateFinancialPlan(
  scenes: Scene[],
  characters: Character[],
  vfxNeeds: VFXNeed[],
  actorSuggestions: ActorSuggestion[],
  locations: LocationSuggestion[],
  productPlacements: ProductPlacement[],
  provider: AIProvider = 'gpt-4o'
): Promise<FinancialPlan> {
  const prompt = `
    Create a comprehensive financial plan for this film project based on:
    
    - ${scenes.length} scenes with ${scenes.reduce((sum, s) => sum + s.duration, 0)} minutes total runtime
    - ${characters.filter(c => c.importance === 'lead').length} lead characters, ${characters.filter(c => c.importance === 'supporting').length} supporting
    - ${vfxNeeds.length} VFX sequences with estimated costs: $${vfxNeeds.reduce((sum, v) => sum + v.estimatedCost, 0)}
    - Suggested actors and their estimated fees
    - Location costs and incentives
    - Product placement revenue: $${productPlacements.reduce((sum, p) => sum + p.estimatedValue, 0)}

    Provide realistic budget estimates and revenue projections based on similar independent films.

    Return as JSON:
    {
      "totalBudget": 5000000,
      "budgetBreakdown": {
        "preProduction": 500000,
        "production": 3000000,
        "postProduction": 1000000,
        "marketing": 400000,
        "contingency": 100000
      },
      "revenueProjections": {
        "domestic": 8000000,
        "international": 4000000,
        "streaming": 2000000,
        "merchandise": 100000,
        "productPlacement": 300000
      },
      "roi": 1.88,
      "breakEvenPoint": 5300000
    }

    Context:
    Scenes: ${scenes.length}
    VFX Budget: $${vfxNeeds.reduce((sum, v) => sum + v.estimatedCost, 0)}
    Product Placement Revenue: $${productPlacements.reduce((sum, p) => sum + p.estimatedValue, 0)}
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 2000
    });

    return extractJsonFromText(response) || {
      totalBudget: 0,
      budgetBreakdown: { preProduction: 0, production: 0, postProduction: 0, marketing: 0, contingency: 0 },
      revenueProjections: { domestic: 0, international: 0, streaming: 0, merchandise: 0, productPlacement: 0 },
      roi: 0,
      breakEvenPoint: 0
    };
  } catch (error) {
    console.error('Error generating financial plan:', error);
    throw new Error('Failed to generate financial plan');
  }
}

/**
 * Generate comprehensive project summary/reader's report
 */
export async function generateProjectSummary(
  scriptTitle: string,
  scenes: Scene[],
  characters: Character[],
  vfxNeeds: VFXNeed[],
  productPlacements: ProductPlacement[],
  financialPlan: FinancialPlan,
  provider: AIProvider = 'gpt-4o'
): Promise<string> {
  const prompt = `
    Create a professional Reader's Report for "${scriptTitle}" based on this analysis:

    SCRIPT ANALYSIS:
    - ${scenes.length} scenes
    - ${scenes.reduce((sum, s) => sum + s.duration, 0)} minute runtime
    - ${characters.filter(c => c.importance === 'lead').length} lead characters
    - Budget: $${financialPlan.totalBudget.toLocaleString()}
    - Projected ROI: ${(financialPlan.roi * 100).toFixed(1)}%

    CHARACTERS:
    ${characters.map(c => `- ${c.name}: ${c.description} (${c.importance})`).join('\n')}

    VFX REQUIREMENTS:
    ${vfxNeeds.map(v => `- ${v.vfxType}: $${v.estimatedCost.toLocaleString()}`).join('\n')}

    PRODUCT PLACEMENT OPPORTUNITIES:
    ${productPlacements.map(p => `- ${p.brand} ${p.product}: $${p.estimatedValue.toLocaleString()}`).join('\n')}

    Create a comprehensive reader's report with:
    1. Executive Summary
    2. Story Synopsis
    3. Character Analysis
    4. Commercial Viability
    5. Production Considerations
    6. Investment Recommendation

    Write in professional industry language for investors and producers.
  `;

  try {
    const response = await generateContent(provider, prompt, {
      maxTokens: 3000
    });

    return response;
  } catch (error) {
    console.error('Error generating project summary:', error);
    throw new Error('Failed to generate project summary');
  }
}