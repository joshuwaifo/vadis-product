/**
 * Character Analysis Service
 * 
 * Enhanced character extraction and analysis system adapted from Cannes demo
 * for the Vadis multi-user platform. Provides detailed character profiling,
 * relationship mapping, and casting analysis.
 */

import { generateContent, type AIProvider } from './ai-agents/ai-client';
import { extractJsonFromText } from './ai-agents/ai-client';

// Enhanced Character interfaces
export interface DetailedCharacter {
  name: string;
  description: string;
  age: string;
  gender: string;
  personality: string[];
  importance: 'lead' | 'supporting' | 'minor';
  screenTime: number;
  characterArc: string;
  physicalDescription: string;
  backstory: string;
  motivations: string[];
  conflictSources: string[];
  speechPatterns: string;
  relationships: CharacterRelationship[];
}

export interface CharacterRelationship {
  character: string;
  relationship: string;
  strength: number; // 1-10
  dynamicType: 'static' | 'evolving' | 'conflicted';
  keyScenes: string[];
}

export interface CharacterSummary {
  name: string;
  roleType: string;
  significance: number; // 1-100
  arcComplexity: 'simple' | 'moderate' | 'complex';
  castingNotes: string[];
}

/**
 * Extract characters from script content using advanced NLP analysis
 */
export async function extractCharacters(
  scriptContent: string,
  provider: AIProvider = 'gemini-1.5-pro'
): Promise<string[]> {
  const prompt = `
    Extract ALL character names from this script content. This includes:
    - Main characters (protagonists, antagonists)
    - Supporting characters with dialogue
    - Minor characters with names (even if only mentioned)
    - Background characters that are specifically named
    
    Rules:
    1. Return ONLY character names, one per line
    2. Use the exact spelling from the script
    3. Exclude generic terms like "WAITER", "COP #1" unless they have actual names
    4. Include characters mentioned in dialogue but not present in scenes
    5. Remove duplicates and variations (e.g., "JOHN" and "John Smith" should be "JOHN SMITH")
    
    Return as a simple list:
    CHARACTER_NAME_1
    CHARACTER_NAME_2
    CHARACTER_NAME_3
    
    Script content:
    ${scriptContent.substring(0, 25000)}
  `;

  try {
    const response = await generateContent(provider, prompt, {
      maxTokens: 2000,
      temperature: 0.3
    });

    const characterNames = response
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0 && !name.includes(':') && !name.includes('='))
      .slice(0, 50); // Reasonable limit

    console.log(`Extracted ${characterNames.length} characters:`, characterNames);
    return characterNames;
  } catch (error) {
    console.error('Error extracting characters:', error);
    throw new Error('Failed to extract characters from script');
  }
}

/**
 * Get detailed character analysis for a specific character
 */
export async function getCharacterDetails(
  characterName: string,
  scriptContent: string,
  provider: AIProvider = 'gpt-4o'
): Promise<DetailedCharacter> {
  const prompt = `
    Analyze the character "${characterName}" in this script. Provide comprehensive details:

    Return as JSON with this exact structure:
    {
      "name": "${characterName}",
      "description": "Comprehensive character description",
      "age": "Age range (e.g., '25-30', 'elderly', 'teenager')",
      "gender": "Gender identity",
      "personality": ["trait1", "trait2", "trait3", "trait4", "trait5"],
      "importance": "lead|supporting|minor",
      "screenTime": estimated_minutes_number,
      "characterArc": "Character development journey",
      "physicalDescription": "Physical appearance and mannerisms",
      "backstory": "Inferred background and history",
      "motivations": ["primary motivation", "secondary motivation"],
      "conflictSources": ["internal conflict", "external conflict"],
      "speechPatterns": "How they speak, vocabulary, accent notes",
      "relationships": [
        {
          "character": "OTHER_CHARACTER_NAME",
          "relationship": "relationship description",
          "strength": strength_1_to_10,
          "dynamicType": "static|evolving|conflicted",
          "keyScenes": ["scene description where they interact"]
        }
      ]
    }

    Focus only on "${characterName}". Analyze their:
    - Dialogue patterns and word choices
    - Actions and reactions
    - How other characters respond to them
    - Character development throughout the script
    - Relationships and dynamics

    Script content:
    ${scriptContent.substring(0, 30000)}
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 3000,
      temperature: 0.4
    });

    const parsed = extractJsonFromText(response);
    if (!parsed || !parsed.name) {
      throw new Error(`Failed to parse character details for ${characterName}`);
    }

    return parsed as DetailedCharacter;
  } catch (error) {
    console.error(`Error getting character details for ${characterName}:`, error);
    throw new Error(`Failed to analyze character ${characterName}`);
  }
}

/**
 * Generate character summary for casting and production planning
 */
export async function generateCharacterSummary(
  character: DetailedCharacter,
  provider: AIProvider = 'gemini-1.5-flash'
): Promise<CharacterSummary> {
  const prompt = `
    Create a concise character summary for "${character.name}" for casting and production purposes.

    Character Details:
    ${JSON.stringify(character, null, 2)}

    Return as JSON:
    {
      "name": "${character.name}",
      "roleType": "protagonist|antagonist|love_interest|mentor|comic_relief|etc",
      "significance": significance_score_1_to_100,
      "arcComplexity": "simple|moderate|complex",
      "castingNotes": [
        "specific casting requirement 1",
        "specific casting requirement 2",
        "specific casting requirement 3"
      ]
    }

    Casting notes should include:
    - Age range requirements
    - Physical requirements
    - Acting skills needed (comedy, drama, action, etc.)
    - Special talents required (singing, dancing, accents, etc.)
    - Chemistry requirements with other characters
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 1000,
      temperature: 0.5
    });

    const parsed = extractJsonFromText(response);
    if (!parsed || !parsed.name) {
      throw new Error(`Failed to parse character summary for ${character.name}`);
    }

    return parsed as CharacterSummary;
  } catch (error) {
    console.error(`Error generating character summary for ${character.name}:`, error);
    throw new Error(`Failed to generate summary for character ${character.name}`);
  }
}

/**
 * Analyze character relationships and generate relationship map
 */
export async function analyzeCharacterRelationships(
  characters: DetailedCharacter[],
  provider: AIProvider = 'gemini-1.5-pro'
): Promise<Array<{
  from: string;
  to: string;
  type: string;
  strength: number;
  evolution: string;
}>> {
  const prompt = `
    Analyze the relationships between these characters and create a comprehensive relationship map.

    Characters:
    ${JSON.stringify(characters.map(c => ({
      name: c.name,
      importance: c.importance,
      relationships: c.relationships
    })), null, 2)}

    Return as JSON array:
    [
      {
        "from": "CHARACTER_A",
        "to": "CHARACTER_B",
        "type": "romantic|familial|professional|friendship|rivalry|mentorship|etc",
        "strength": strength_1_to_10,
        "evolution": "grows_stronger|weakens|remains_constant|becomes_complicated"
      }
    ]

    Rules:
    - Only include meaningful relationships (strength >= 3)
    - Avoid duplicate relationships (A->B and B->A)
    - Focus on relationships that impact the story
    - Consider how relationships change throughout the script
  `;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 2500,
      temperature: 0.4
    });

    const parsed = extractJsonFromText(response);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error analyzing character relationships:', error);
    throw new Error('Failed to analyze character relationships');
  }
}

/**
 * Enhanced character analysis pipeline - main entry point
 */
export async function performCompleteCharacterAnalysis(
  scriptContent: string,
  fallbackProvider?: AIProvider
): Promise<{
  characters: DetailedCharacter[];
  summaries: CharacterSummary[];
  relationshipMap: Array<{
    from: string;
    to: string;
    type: string;
    strength: number;
    evolution: string;
  }>;
}> {
  try {
    console.log('Starting comprehensive character analysis...');

    // Step 1: Extract character names
    const characterNames = await extractCharacters(scriptContent, 'gemini-1.5-flash');
    console.log(`Found ${characterNames.length} characters to analyze`);

    // Step 2: Get detailed analysis for each character
    const characters: DetailedCharacter[] = [];
    const summaries: CharacterSummary[] = [];

    for (const characterName of characterNames) {
      try {
        console.log(`Analyzing character: ${characterName}`);
        
        const characterDetails = await getCharacterDetails(
          characterName, 
          scriptContent, 
          fallbackProvider || 'gpt-4o'
        );
        
        const characterSummary = await generateCharacterSummary(
          characterDetails,
          'gemini-1.5-flash'
        );

        characters.push(characterDetails);
        summaries.push(characterSummary);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to analyze character ${characterName}:`, error);
        // Continue with other characters rather than failing completely
      }
    }

    // Step 3: Analyze relationships
    const relationshipMap = await analyzeCharacterRelationships(
      characters,
      'gemini-1.5-pro'
    );

    console.log(`Character analysis complete: ${characters.length} characters, ${relationshipMap.length} relationships`);

    return {
      characters,
      summaries,
      relationshipMap
    };
  } catch (error) {
    console.error('Error in complete character analysis:', error);
    throw new Error('Failed to perform complete character analysis');
  }
}