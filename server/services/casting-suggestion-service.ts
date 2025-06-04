/**
 * AI-Powered Casting Suggestion Service
 * 
 * Uses advanced AI analysis (primarily Grok) to generate industry-standard
 * casting suggestions based on character profiles, current actor availability,
 * market trends, and industry relationships.
 */

import { generateContent, type AIProvider } from './ai-agents/ai-client';
import { extractJsonFromText } from './ai-agents/ai-client';
import type { DetailedCharacter, CharacterSummary } from './character-analysis-service';

export interface ActorSuggestion {
  actorName: string;
  reasoning: string;
  fitScore: number; // 1-100
  availability: string;
  estimatedFee: string;
  workingRelationships: string[];
  castingNotes: string[];
  marketValue: 'A-list' | 'B-list' | 'Rising' | 'Character' | 'Newcomer';
  ageAppropriate: boolean;
  physicalMatch: number; // 1-10
  actingRangeMatch: number; // 1-10
  chemistryPotential: string[];
}

export interface CastingRecommendation {
  characterName: string;
  primarySuggestions: ActorSuggestion[];
  alternativeSuggestions: ActorSuggestion[];
  budgetConsiderations: {
    highBudget: ActorSuggestion[];
    midBudget: ActorSuggestion[];
    lowBudget: ActorSuggestion[];
  };
  diversityOptions: ActorSuggestion[];
  emergingTalent: ActorSuggestion[];
}

/**
 * Generate comprehensive actor suggestions for a character using AI analysis
 */
export async function rankActorsForCharacter(
  character: DetailedCharacter,
  characterSummary: CharacterSummary,
  projectBudget: 'low' | 'medium' | 'high' | 'blockbuster' = 'medium',
  provider: AIProvider = 'gpt-4o'
): Promise<CastingRecommendation> {
  const prompt = `
    You are a top Hollywood casting director with 20+ years of experience. Analyze this character and provide comprehensive casting suggestions.

    CHARACTER PROFILE:
    Name: ${character.name}
    Description: ${character.description}
    Age: ${character.age}
    Gender: ${character.gender}
    Personality: ${character.personality.join(', ')}
    Importance: ${character.importance}
    Physical Description: ${character.physicalDescription}
    Character Arc: ${character.characterArc}
    Speech Patterns: ${character.speechPatterns}
    Motivations: ${character.motivations.join(', ')}

    CASTING REQUIREMENTS:
    Role Type: ${characterSummary.roleType}
    Significance: ${characterSummary.significance}/100
    Arc Complexity: ${characterSummary.arcComplexity}
    Casting Notes: ${characterSummary.castingNotes.join('; ')}

    PROJECT BUDGET TIER: ${projectBudget}

    Provide casting suggestions considering:
    - Current actor availability (2024-2025)
    - Market trends and recent career trajectories
    - Physical and acting range compatibility
    - Budget appropriateness
    - Chemistry potential with ensemble casts
    - Diversity and representation
    - Risk vs. reward for different talent levels

    Return as JSON with this exact structure:
    {
      "characterName": "${character.name}",
      "primarySuggestions": [
        {
          "actorName": "Actor Name",
          "reasoning": "Detailed explanation of why this actor fits",
          "fitScore": 85,
          "availability": "Available Q2 2025",
          "estimatedFee": "$2-5M",
          "workingRelationships": ["Director Name", "Co-star Name"],
          "castingNotes": ["specific requirement 1", "specific requirement 2"],
          "marketValue": "A-list|B-list|Rising|Character|Newcomer",
          "ageAppropriate": true,
          "physicalMatch": 8,
          "actingRangeMatch": 9,
          "chemistryPotential": ["Actor A", "Actor B"]
        }
      ],
      "alternativeSuggestions": [
        // 3-5 alternative options with same structure
      ],
      "budgetConsiderations": {
        "highBudget": [
          // A-list actors for high-budget productions
        ],
        "midBudget": [
          // Established actors for mid-budget films
        ],
        "lowBudget": [
          // Rising talent and character actors for indie productions
        ]
      },
      "diversityOptions": [
        // Diverse casting options that maintain character integrity
      ],
      "emergingTalent": [
        // Up-and-coming actors who could break out in this role
      ]
    }

    Focus on:
    - Realistic, current actor suggestions (avoid retired/deceased actors)
    - Industry-accurate fee estimates
    - Real working relationships and collaborations
    - Authentic availability windows based on known projects
    - Practical casting considerations (scheduling, conflicts, etc.)
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 4000,
      temperature: 0.6
    });

    const parsed = extractJsonFromText(response);
    if (!parsed || !parsed.characterName) {
      throw new Error(`Failed to parse casting recommendations for ${character.name}`);
    }

    return parsed as CastingRecommendation;
  } catch (error) {
    console.error(`Error generating casting suggestions for ${character.name}:`, error);
    throw new Error(`Failed to generate casting suggestions for character ${character.name}`);
  }
}

/**
 * AI-powered actor filtering based on character requirements
 * Since we don't have an actor database, this uses AI knowledge of the industry
 */
export async function filterActorsFromDatabase(
  character: DetailedCharacter,
  characterSummary: CharacterSummary,
  filters: {
    ageRange?: [number, number];
    gender?: string;
    experience?: 'newcomer' | 'established' | 'veteran';
    budget?: 'low' | 'medium' | 'high';
    availability?: string;
  } = {},
  provider: AIProvider = 'gpt-4o'
): Promise<string[]> {
  const prompt = `
    Based on these character requirements and filters, suggest appropriate actors from the entertainment industry.

    CHARACTER: ${character.name}
    - Age: ${character.age}
    - Gender: ${character.gender}
    - Physical Description: ${character.physicalDescription}
    - Role Importance: ${character.importance}
    - Character Type: ${characterSummary.roleType}

    FILTERS:
    ${filters.ageRange ? `- Age Range: ${filters.ageRange[0]}-${filters.ageRange[1]} years` : ''}
    ${filters.gender ? `- Gender: ${filters.gender}` : ''}
    ${filters.experience ? `- Experience Level: ${filters.experience}` : ''}
    ${filters.budget ? `- Budget Tier: ${filters.budget}` : ''}
    ${filters.availability ? `- Availability: ${filters.availability}` : ''}

    Return a JSON array of actor names that match these criteria:
    [
      "Actor Name 1",
      "Actor Name 2",
      "Actor Name 3",
      ...
    ]

    Guidelines:
    - Focus on currently active actors (2024-2025)
    - Consider age-appropriate casting
    - Include diverse options when character allows
    - Match experience level to role importance
    - Consider budget-appropriate talent
    - Limit to 15-20 names maximum
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 1500,
      temperature: 0.4
    });

    const parsed = extractJsonFromText(response);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Error filtering actors for ${character.name}:`, error);
    return [];
  }
}

/**
 * Generate ensemble casting suggestions considering character relationships
 */
export async function generateEnsembleCasting(
  characters: DetailedCharacter[],
  projectBudget: 'low' | 'medium' | 'high' | 'blockbuster' = 'medium',
  provider: AIProvider = 'gpt-4o'
): Promise<{
  castingCombinations: Array<{
    combination: Array<{ character: string; actor: string }>;
    chemistryScore: number;
    totalBudget: string;
    marketAppeal: number;
    reasoning: string;
  }>;
  castingDirectorNotes: string[];
}> {
  const leadCharacters = characters.filter(c => c.importance === 'lead').slice(0, 5);
  
  const prompt = `
    As an expert casting director, suggest ensemble casting combinations for these lead characters:

    CHARACTERS:
    ${leadCharacters.map(c => `
    - ${c.name}: ${c.description} (${c.age}, ${c.gender})
      Relationships: ${c.relationships.map(r => `${r.character} (${r.relationship})`).join(', ')}
    `).join('')}

    PROJECT BUDGET: ${projectBudget}

    Consider:
    - Actor chemistry and previous collaborations
    - Age-appropriate pairings
    - Market appeal and box office draw
    - Budget distribution across leads
    - Diversity and representation
    - Awards potential and critical reception

    Return as JSON:
    {
      "castingCombinations": [
        {
          "combination": [
            {"character": "Character Name", "actor": "Actor Name"},
            {"character": "Character Name", "actor": "Actor Name"}
          ],
          "chemistryScore": 85,
          "totalBudget": "$15-25M",
          "marketAppeal": 78,
          "reasoning": "Explanation of why this combination works"
        }
      ],
      "castingDirectorNotes": [
        "Industry insight 1",
        "Market consideration 2"
      ]
    }

    Provide 3-5 different casting combinations with varying budget and risk profiles.
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 3000,
      temperature: 0.7
    });

    const parsed = extractJsonFromText(response);
    return parsed || { castingCombinations: [], castingDirectorNotes: [] };
  } catch (error) {
    console.error('Error generating ensemble casting suggestions:', error);
    return { castingCombinations: [], castingDirectorNotes: [] };
  }
}

/**
 * Main casting pipeline - orchestrates the complete casting analysis
 */
export async function performCompleteCastingAnalysis(
  characters: DetailedCharacter[],
  characterSummaries: CharacterSummary[],
  projectBudget: 'low' | 'medium' | 'high' | 'blockbuster' = 'medium'
): Promise<{
  individualRecommendations: CastingRecommendation[];
  ensembleSuggestions: any;
  castingStrategy: {
    budgetAllocation: string;
    marketingAngle: string;
    riskAssessment: string;
    timeline: string;
  };
}> {
  try {
    console.log('Starting comprehensive casting analysis...');

    // Focus on significant characters only
    const significantCharacters = characters.filter(c => 
      c.importance === 'lead' || 
      (c.importance === 'supporting' && c.screenTime > 15)
    );

    const individualRecommendations: CastingRecommendation[] = [];

    // Generate casting recommendations for each significant character
    for (let i = 0; i < significantCharacters.length; i++) {
      const character = significantCharacters[i];
      const summary = characterSummaries.find(s => s.name === character.name);
      
      if (!summary) continue;

      try {
        console.log(`Generating casting suggestions for: ${character.name}`);
        
        const recommendation = await rankActorsForCharacter(
          character,
          summary,
          projectBudget,
          'grok-beta'
        );

        individualRecommendations.push(recommendation);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate casting for ${character.name}:`, error);
      }
    }

    // Generate ensemble casting suggestions
    const ensembleSuggestions = await generateEnsembleCasting(
      significantCharacters,
      projectBudget,
      'grok-beta'
    );

    // Generate overall casting strategy
    const strategyPrompt = `
      Based on this casting analysis, provide strategic recommendations:

      Characters: ${significantCharacters.length} significant roles
      Budget Tier: ${projectBudget}
      Lead Characters: ${characters.filter(c => c.importance === 'lead').length}

      Return as JSON:
      {
        "budgetAllocation": "How to distribute casting budget across roles",
        "marketingAngle": "How the cast can be marketed",
        "riskAssessment": "Casting risks and mitigation strategies",
        "timeline": "Recommended casting timeline and milestones"
      }
    `;

    const strategyResponse = await generateContent('grok-beta', strategyPrompt, {
      responseFormat: 'json',
      maxTokens: 1000
    });

    const castingStrategy = extractJsonFromText(strategyResponse) || {
      budgetAllocation: "Standard industry distribution",
      marketingAngle: "Ensemble appeal",
      riskAssessment: "Moderate risk profile",
      timeline: "12-16 weeks for principal casting"
    };

    console.log(`Casting analysis complete: ${individualRecommendations.length} character recommendations`);

    return {
      individualRecommendations,
      ensembleSuggestions,
      castingStrategy
    };
  } catch (error) {
    console.error('Error in complete casting analysis:', error);
    throw new Error('Failed to perform complete casting analysis');
  }
}