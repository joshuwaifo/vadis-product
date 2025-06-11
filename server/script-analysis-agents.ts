/**
 * Script Analysis Agents
 * 
 * Specialized AI agents for comprehensive script analysis including
 * scene extraction, character analysis, casting suggestions, VFX needs,
 * product placement, location suggestions, and financial planning.
 */

import { generateContent, analyzeDocument, extractJsonFromText, type AIProvider } from './services/ai-agents/ai-client';

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
  ethnicity?: string;
  occupation?: string;
  personality: string[];
  importance: 'lead' | 'supporting' | 'minor';
  screenTime: number; // estimated minutes
  demographics: {
    ageRange: string;
    gender: string;
    ethnicity?: string;
    socioeconomicStatus?: string;
    education?: string;
    occupation?: string;
  };
  bio: string; // short character biography
  relationships: Array<{
    character: string;
    relationship: string;
    strength: number; // 1-10
    description: string; // brief explanation of the relationship
  }>;
  characterArc: string;
}

export interface ActorProfile {
  actorName: string;
  age: number;
  bio: string;
  fitAnalysis: string;
  chemistryFactor: string;
  recentWork: string[];
  notableWork?: string[];
  fitScore: number; // 1-100
  availability: string;
  estimatedFee: string;
  profileImageUrl?: string;
  controversyLevel: 'low' | 'medium' | 'high'; // New field
  fanRating: number; // 1-10, New field
  strengthsForRole?: string;
  potentialChemistry?: string;
  detailedBio?: string; // Extended biography
  awards?: string[]; // Notable awards and nominations
  socialMediaFollowing?: string; // Social media metrics
  marketValue?: string; // Current market positioning
}

export interface ActorSuggestion {
  characterName: string;
  suggestedActors: ActorProfile[]; // Changed from primaryChoice + alternatives to array
}

export interface CastingAnalysis {
  scriptTitle: string;
  characterSuggestions: ActorSuggestion[];
  ensembleChemistry: {
    keyRelationships: Array<{
      characters: string[];
      relationshipType: string;
      chemistryAnalysis: string;
      primaryActors: string[];
    }>;
    overallSynergy: string;
    castingRationale: string;
  };
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
      maxTokens: 16000 // Increased for full script processing
    });

    const parsed = extractJsonFromText(response);
    return parsed?.scenes || [];
  } catch (error) {
    console.error('Error extracting scenes:', error);
    throw new Error('Failed to extract scenes from script');
  }
}

/**
 * Analyze characters and their relationships with enhanced demographics and relationship mapping
 */
export async function analyzeCharacters(
  scenes: Scene[],
  provider: AIProvider = 'gpt-4o'
): Promise<{ characters: Character[], relationships: any[], relationshipExplanations: string[] }> {
  const sceneText = scenes.map(s => s.content).join('\n\n');
  
  const prompt = `
    Analyze the characters in this script with detailed demographics and relationships. Provide:
    
    1. Character analysis with demographics, personality, importance, and screen time estimates
    2. Detailed relationship mapping between characters with strength ratings and explanations
    3. Character development arcs and short biographies
    4. Explanations of key character relationships

    Return as JSON with this exact structure:
    {
      "characters": [
        {
          "name": "CHARACTER_NAME",
          "description": "Physical and personality description",
          "age": "Age range (e.g., '25-30')",
          "gender": "Gender",
          "personality": ["trait1", "trait2", "trait3"],
          "importance": "lead|supporting|minor",
          "screenTime": 45,
          "demographics": {
            "ageRange": "25-30",
            "gender": "Male/Female/Other",
            "ethnicity": "Ethnicity if specified",
            "socioeconomicStatus": "Working class/Middle class/Upper class",
            "education": "Education level if apparent",
            "occupation": "Job or role"
          },
          "bio": "A concise 1-2 sentence biography of the character",
          "relationships": [
            {
              "character": "OTHER_CHARACTER",
              "relationship": "brother/friend/enemy/lover/colleague",
              "strength": 8,
              "description": "Brief explanation of their relationship"
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
          "strength": 7,
          "description": "Explanation of this relationship"
        }
      ],
      "relationshipExplanations": [
        "Character A is Character B's brother and they have a complex relationship due to...",
        "Character C and Character D are former lovers who now work together reluctantly..."
      ]
    }

    Focus on identifying:
    - Main characters (leads with most screen time and story importance)
    - Supporting characters (significant but secondary roles)
    - Minor characters (brief appearances)
    - Demographic details when evident from dialogue/description
    - Relationship dynamics and their explanations

    Script content:
    ${sceneText}
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 8000
    });

    const parsed = extractJsonFromText(response);
    return {
      characters: parsed?.characters || [],
      relationships: parsed?.relationshipGraph || [],
      relationshipExplanations: parsed?.relationshipExplanations || []
    };
  } catch (error) {
    console.error('Error analyzing characters:', error);
    throw new Error('Failed to analyze characters');
  }
}

/**
 * Enhanced casting director AI that provides comprehensive casting analysis
 */
export async function suggestActors(
  characters: Character[],
  relationships: any[],
  scriptTitle: string = 'Untitled Script',
  provider: AIProvider = 'gpt-4o'
): Promise<CastingAnalysis> {
  // Prioritize lead and supporting characters, but include all characters
  const prioritizedCharacters = characters.sort((a, b) => {
    const importanceOrder = { 'lead': 0, 'supporting': 1, 'minor': 2 };
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  });

  const prompt = `
You are an expert casting director AI. Based on the provided character analysis data, suggest optimal casting choices for ALL characters listed below.

**CRITICAL REQUIREMENT: You MUST provide casting suggestions for ALL ${characters.length} characters. Do not skip any character.**

**Character Analysis Data:**
Script Title: ${scriptTitle}
Characters (ALL MUST BE CAST): ${JSON.stringify(prioritizedCharacters, null, 2)}
Relationships: ${JSON.stringify(relationships, null, 2)}

**Your Task:**
1. Analyze EVERY character's profile (age, personality, relationships, story importance)
2. Consider character dynamics and on-screen chemistry requirements
3. Provide casting recommendations with detailed justifications for ALL ${characters.length} characters

**For EACH AND EVERY Character, Provide:**

**PRIMARY RECOMMENDATION:**
- Actor Name & Brief Bio (2-3 sentences about their career/style)
- **Fit Analysis:** Why this actor suits the character (physical, acting style, experience)
- **Chemistry Factor:** How they work with other cast members based on relationships
- **Recent Work:** 2-3 relevant recent performances

**ALTERNATIVE OPTIONS (3-4 actors):**
For each alternative:
- Actor name and current age
- Strengths for this specific role
- Potential chemistry with other cast members
- 2-3 notable works that demonstrate their suitability
- Fit score (1-100)
- Availability status
- Estimated fee range

**CASTING SYNERGY ANALYSIS:**
- Highlight key relationships (protagonist/antagonist, romantic pairs, family dynamics)
- Explain why your primary recommendations work well together
- Note any potential on-screen chemistry based on past collaborations or similar projects
- Overall ensemble rationale

**MANDATORY: Create an entry for EVERY character listed above. The response must include exactly ${characters.length} character suggestions.**

Return as JSON with this exact structure, ensuring ALL characters are included:
{
  "scriptTitle": "${scriptTitle}",
  "characterSuggestions": [
    ${prioritizedCharacters.map(char => `{
      "characterName": "${char.name}",
      "suggestedActors": [
        {
          "actorName": "[Actor Name for ${char.name}]",
          "age": [age],
          "bio": "Brief bio about their career and acting style",
          "fitAnalysis": "Why this actor suits ${char.name}",
          "chemistryFactor": "How they work with other characters",
          "recentWork": ["Recent work 1", "Recent work 2", "Recent work 3"],
          "fitScore": [score 1-100],
          "availability": "Available [year]",
          "estimatedFee": "$[amount]",
          "controversyLevel": "low|medium|high",
          "fanRating": [rating 1-10],
          "detailedBio": "Extended biography with career highlights",
          "awards": ["Notable award 1", "Notable award 2"],
          "socialMediaFollowing": "X million followers",
          "marketValue": "Current market positioning"
        },
        {
          "actorName": "[Alternative actor name]",
          "age": [age],
          "bio": "Brief bio about their career",
          "strengthsForRole": "Strengths for ${char.name}",
          "potentialChemistry": "Chemistry with ensemble",
          "recentWork": ["Notable work 1", "Notable work 2"],
          "fitScore": [score],
          "availability": "Available",
          "estimatedFee": "$[amount]",
          "controversyLevel": "low|medium|high",
          "fanRating": [rating 1-10],
          "detailedBio": "Extended biography",
          "awards": ["Award 1", "Award 2"],
          "socialMediaFollowing": "X million followers",
          "marketValue": "Market positioning"
        }
      ]
    }`).join(',\n    ')}
  ],
  "ensembleChemistry": {
    "keyRelationships": [
      {
        "characters": ["Character A", "Character B"],
        "relationshipType": "relationship type",
        "chemistryAnalysis": "Why these actors work well together",
        "primaryActors": ["Actor A", "Actor B"]
      }
    ],
    "overallSynergy": "How the entire cast works together as an ensemble",
    "castingRationale": "The strategic thinking behind these casting choices"
  }
}

Focus on current, relevant actors (active in 2020s), realistic availability, and authentic chemistry analysis based on their acting styles and past work.

**REMINDER: You must provide casting suggestions for ALL ${characters.length} characters: ${prioritizedCharacters.map(c => c.name).join(', ')}**
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 12000
    });

    const parsed = extractJsonFromText(response);
    return parsed || {
      scriptTitle,
      characterSuggestions: [],
      ensembleChemistry: {
        keyRelationships: [],
        overallSynergy: "No casting analysis available",
        castingRationale: "Analysis failed"
      }
    };
  } catch (error) {
    console.error('Error in casting analysis:', error);
    throw new Error('Failed to generate casting suggestions');
  }
}

/**
 * Analyze a user-suggested actor for a specific character
 */
export async function analyzeUserActorChoice(
  character: Character,
  suggestedActor: string,
  otherCharacters: Character[],
  relationships: any[],
  provider: AIProvider = 'gpt-4o'
): Promise<{
  actorName: string;
  age: number;
  bio: string;
  fitAnalysis: string;
  chemistryFactor: string;
  recentWork: string[];
  fitScore: number;
  availability: string;
  estimatedFee: string;
  profileImageUrl?: string;
  controversyLevel: 'low' | 'medium' | 'high';
  fanRating: number;
  detailedBio?: string;
  awards?: string[];
  socialMediaFollowing?: string;
  marketValue?: string;
  recommendation: 'excellent' | 'good' | 'poor';
  alternativeSuggestions?: string[];
}> {
  const prompt = `
As an expert casting director, analyze this user's actor suggestion:

**Character:** ${character.name}
**Character Details:** ${JSON.stringify(character, null, 2)}
**Suggested Actor:** ${suggestedActor}
**Other Characters:** ${JSON.stringify(otherCharacters, null, 2)}
**Relationships:** ${JSON.stringify(relationships, null, 2)}

Provide a comprehensive analysis in this exact JSON format:

{
  "actorName": "${suggestedActor}",
  "age": [actor's current age],
  "bio": "Brief professional biography highlighting their career and strengths",
  "fitAnalysis": "Detailed analysis of how well ${suggestedActor} fits ${character.name} - consider physical attributes, acting range, past roles, and character requirements",
  "chemistryFactor": "Analysis of how this casting choice affects ensemble dynamics and chemistry with other characters",
  "recentWork": ["Recent film/TV project 1", "Recent film/TV project 2", "Recent film/TV project 3"],
  "fitScore": [score from 1-100 based on overall suitability],
  "availability": "Current availability status (e.g., 'Available 2024', 'Busy until 2025')",
  "estimatedFee": "Realistic fee estimate (e.g., '$5 million', '$500K', 'Scale + backend')",
  "controversyLevel": "low|medium|high",
  "fanRating": [rating from 1-10 based on current popularity],
  "detailedBio": "Extended biography with career highlights and acting style",
  "awards": ["Notable award 1", "Notable award 2"],
  "socialMediaFollowing": "Social media metrics if notable",
  "marketValue": "Current market positioning and bankability",
  "recommendation": "excellent|good|poor",
  "alternativeSuggestions": ["Alternative actor 1", "Alternative actor 2", "Alternative actor 3"]
}

Focus on realistic, current information about the actor. If the actor is not well-known or suitable, be honest about limitations while providing constructive analysis.
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 4000
    });

    const analysis = extractJsonFromText(response);
    
    if (!analysis) {
      return {
        actorName: suggestedActor,
        age: 35,
        bio: "Analysis unavailable for this actor.",
        fitAnalysis: "Unable to analyze actor suitability at this time.",
        chemistryFactor: "Chemistry impact cannot be determined.",
        recentWork: [],
        fitScore: 50,
        availability: "Unknown",
        estimatedFee: "Not available",
        controversyLevel: "low" as const,
        fanRating: 5,
        recommendation: "poor" as const
      };
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing user actor choice:', error);
    throw new Error('Failed to analyze actor suggestion');
  }
}

/**
 * Analyze VFX needs using GPT-4o for superior scene identification
 */
export async function analyzeVFXNeeds(
  scenes: Scene[],
  provider: AIProvider = 'gpt-4o'
): Promise<VFXNeed[]> {
  const prompt = `
    You are an expert VFX supervisor analyzing a screenplay for visual effects requirements. 
    Carefully examine each scene and identify those that require VFX work.

    Look for scenes that contain:
    - Supernatural or fantasy elements (magic, ghosts, mythical creatures)
    - Sci-fi elements (aliens, spaceships, futuristic technology)
    - Impossible or dangerous actions (explosions, vehicle crashes, falls)
    - Environmental effects (storms, natural disasters, fire)
    - Creature work (dinosaurs, monsters, talking animals)
    - Digital environments or matte paintings
    - Wire removal or digital doubles
    - Period-specific elements requiring digital recreation
    - Crowd multiplication or digital extras
    - Blood, gore, or injury effects
    - Architectural or landscape modifications
    - Time manipulation or speed effects

    Be thorough but realistic - only identify scenes that truly need VFX work, not basic practical effects.

    Scenes to analyze (showing first 10 scenes for processing efficiency):
    ${JSON.stringify(scenes.slice(0, 10).map(s => ({ 
      id: s.id, 
      sceneNumber: s.sceneNumber,
      location: s.location,
      description: s.description, 
      content: s.content 
    })), null, 2)}

    Return as JSON array with detailed analysis:
    [
      {
        "sceneId": "scene_1",
        "sceneDescription": "Brief scene summary",
        "vfxType": "Specific VFX category (e.g., 'CGI Creature', 'Digital Environment', 'Compositing')",
        "complexity": "low|medium|high|extreme",
        "estimatedCost": 50000,
        "description": "Detailed description of VFX requirements and approach",
        "referenceImages": ["Suggested visual references or similar films"]
      }
    ]

    Only include scenes that genuinely require VFX work. If no scenes need VFX, return an empty array.
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
  scriptContent: string,
  provider: AIProvider = 'gemini-1.5-flash'
): Promise<ProductPlacement[]> {
  const prompt = `
    Analyze these scenes for natural product placement opportunities.
    Focus on placements that feel organic and don't disrupt the story.
    
    Script Context: ${scriptContent}

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