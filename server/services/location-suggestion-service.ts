/**
 * Location Suggestion Service
 * 
 * Provides AI-powered location suggestions for film scripts based on
 * scene analysis and available location database.
 */

import { generateContent } from './ai-agents/ai-client';
import type { AIProvider } from './ai-agents/ai-client';
import { storage } from '../storage';

export interface LocationSuggestionInput {
  location: string;
  city: string;
  state: string;
  country: string;
  taxIncentive: number;
  estimatedCost: number;
  logistics: string;
  weatherConsiderations: string;
}

export interface SceneLocationSuggestion {
  sceneId: string;
  locationType: string;
  suggestions: LocationSuggestionInput[];
}

/**
 * Enhanced location suggestion function that analyzes script content
 * and provides detailed filming location recommendations
 */
export async function suggestLocationsForScript(
  scriptContent: string,
  scenes: any[],
  projectBudget?: number,
  numberOfSuggestions: number = 5,
  provider: AIProvider = 'gemini-1.5-pro'
): Promise<SceneLocationSuggestion[]> {
  
  if (!scriptContent || scriptContent.trim().length < 100) {
    console.warn('Script content is too short for meaningful location suggestions.');
    return [];
  }

  // Extract unique location types from scenes
  const uniqueLocations = new Set();
  scenes.forEach(s => uniqueLocations.add(s.location));
  const locationTypes = Array.from(uniqueLocations);
  
  const prompt = `
You are an expert Location Scout AI. Based on the script content and scene breakdown provided, recommend diverse filming locations for each scene type.

SCRIPT CONTENT:
${scriptContent.substring(0, 10000)} // Truncate for token limits

SCENE BREAKDOWN:
${JSON.stringify(scenes.map(s => ({ 
  id: s.id, 
  sceneNumber: s.sceneNumber,
  location: s.location, 
  description: s.description,
  timeOfDay: s.timeOfDay 
})), null, 2)}

PROJECT BUDGET: ${projectBudget ? `$${projectBudget.toLocaleString()}` : "Not Specified"}

INSTRUCTIONS:
- Analyze each unique location type from the scenes
- For each location type, suggest ${numberOfSuggestions} diverse real-world filming locations
- Consider production budget, tax incentives, accessibility, and weather patterns
- Provide specific location names, cities, states/provinces, and countries
- Include estimated costs, tax incentives, logistical considerations, and weather notes

OUTPUT FORMAT: Return ONLY valid JSON:
[
  {
    "sceneId": "scene_1",
    "locationType": "INT. OFFICE BUILDING",
    "suggestions": [
      {
        "location": "Specific building or studio name",
        "city": "City name",
        "state": "State/Province",
        "country": "Country",
        "taxIncentive": 25,
        "estimatedCost": 5000,
        "logistics": "Accessibility, permits, equipment access details",
        "weatherConsiderations": "Best filming months, indoor/outdoor factors"
      }
    ]
  }
]

Focus on real, filmable locations with practical production considerations.
`;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 4000
    });

    // Parse and validate the response
    let suggestions: SceneLocationSuggestion[] = [];
    try {
      suggestions = JSON.parse(response);
      
      // Validate the structure
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }
      
      // Ensure each suggestion has the required fields
      suggestions = suggestions.filter(suggestion => {
        return suggestion.sceneId && 
               suggestion.locationType && 
               Array.isArray(suggestion.suggestions) &&
               suggestion.suggestions.length > 0;
      });
      
    } catch (parseError) {
      console.error('Error parsing location suggestions response:', parseError);
      console.error('Raw response:', response);
      return [];
    }

    console.log(`Generated ${suggestions.length} location suggestion sets`);
    return suggestions;
    
  } catch (error) {
    console.error('Error generating location suggestions:', error);
    throw new Error('Failed to generate location suggestions');
  }
}

/**
 * Save location suggestions to the database
 */
export async function saveLocationSuggestions(
  projectId: number,
  suggestions: SceneLocationSuggestion[]
): Promise<void> {
  try {
    for (const suggestionSet of suggestions) {
      if (suggestionSet.suggestions && suggestionSet.suggestions.length > 0) {
        for (const suggestion of suggestionSet.suggestions) {
          await storage.createLocationSuggestion({
            projectId,
            sceneId: null, // We'll map scene IDs later if needed
            locationType: suggestionSet.locationType,
            location: suggestion.location,
            city: suggestion.city || null,
            state: suggestion.state || null,
            country: suggestion.country || null,
            taxIncentive: suggestion.taxIncentive || null,
            estimatedCost: suggestion.estimatedCost || null,
            logistics: suggestion.logistics || null,
            weatherConsiderations: suggestion.weatherConsiderations || null,
          });
        }
      }
    }
    console.log(`Saved location suggestions for project ${projectId}`);
  } catch (error) {
    console.error('Error saving location suggestions:', error);
    throw error;
  }
}