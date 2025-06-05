/**
 * Regex-based scene extraction for screenplay PDFs
 * Handles complete document processing without token limits
 */

export interface ExtractedScene {
  id: string;
  sceneNumber: number;
  location: string;
  timeOfDay: string;
  description: string;
  characters: string[];
  content: string;
  pageStart: number;
  pageEnd: number;
  duration: number;
  vfxNeeds: string[];
  productPlacementOpportunities: string[];
}

/**
 * Extract scenes from screenplay text using regex patterns
 */
export function extractScenesWithRegex(scriptContent: string): ExtractedScene[] {
  const scenes: ExtractedScene[] = [];
  
  // Comprehensive scene heading patterns for screenplays
  const sceneHeadingPatterns = [
    // Standard format: INT./EXT. LOCATION - TIME
    /^(INT\.|EXT\.|INTERIOR|EXTERIOR)\s+(.+?)\s*[-–—]\s*(.+?)$/gim,
    // Alternative format: INT./EXT. LOCATION TIME
    /^(INT\.|EXT\.|INTERIOR|EXTERIOR)\s+(.+?)\s+(DAY|NIGHT|MORNING|AFTERNOON|EVENING|DAWN|DUSK|CONTINUOUS|LATER|MOMENTS LATER)$/gim,
    // Simple format: INT./EXT. LOCATION
    /^(INT\.|EXT\.|INTERIOR|EXTERIOR)\s+(.+?)$/gim,
  ];
  
  // Split content into lines for processing
  const lines = scriptContent.split('\n');
  let currentScene: Partial<ExtractedScene> | null = null;
  let sceneCounter = 0;
  let currentPageEstimate = 1;
  let lineCounter = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    lineCounter++;
    
    // Estimate page numbers (approximately 55 lines per page in standard screenplay format)
    currentPageEstimate = Math.ceil(lineCounter / 55);
    
    if (!line) continue;
    
    // Check if this line is a scene heading
    let isSceneHeading = false;
    let location = '';
    let timeOfDay = '';
    
    for (const pattern of sceneHeadingPatterns) {
      pattern.lastIndex = 0; // Reset regex
      const match = pattern.exec(line);
      
      if (match) {
        isSceneHeading = true;
        
        if (match[3]) {
          // Format: INT./EXT. LOCATION - TIME
          location = match[2].trim();
          timeOfDay = match[3].trim();
        } else if (match[2] && /^(DAY|NIGHT|MORNING|AFTERNOON|EVENING|DAWN|DUSK|CONTINUOUS|LATER|MOMENTS LATER)$/i.test(match[2].split(' ').pop() || '')) {
          // Format: INT./EXT. LOCATION TIME
          const parts = match[2].trim().split(' ');
          timeOfDay = parts.pop() || '';
          location = parts.join(' ');
        } else {
          // Format: INT./EXT. LOCATION
          location = match[2].trim();
          timeOfDay = 'UNSPECIFIED';
        }
        break;
      }
    }
    
    if (isSceneHeading) {
      // Save previous scene if exists
      if (currentScene) {
        scenes.push(finalizeScene(currentScene, currentPageEstimate - 1));
      }
      
      // Start new scene
      sceneCounter++;
      currentScene = {
        id: `scene_${sceneCounter}`,
        sceneNumber: sceneCounter,
        location: location,
        timeOfDay: timeOfDay.toUpperCase(),
        description: line,
        characters: [],
        content: line + '\n',
        pageStart: currentPageEstimate,
        pageEnd: currentPageEstimate,
        duration: 1,
        vfxNeeds: [],
        productPlacementOpportunities: []
      };
    } else if (currentScene) {
      // Add content to current scene
      currentScene.content += line + '\n';
      currentScene.pageEnd = currentPageEstimate;
      
      // Extract character names (usually in ALL CAPS, centered or left-aligned)
      const characterMatch = line.match(/^([A-Z][A-Z\s]{2,}[A-Z])$/);
      if (characterMatch && characterMatch[1].length < 30) {
        const character = characterMatch[1].trim();
        if (!currentScene.characters?.includes(character)) {
          currentScene.characters?.push(character);
        }
      }
      
      // Detect potential VFX needs
      const vfxKeywords = [
        'explosion', 'fire', 'crash', 'special effect', 'cgi', 'green screen',
        'composite', 'digital', 'effect', 'supernatural', 'magic', 'flying',
        'transformation', 'monster', 'creature', 'blood', 'gore', 'battle'
      ];
      
      for (const keyword of vfxKeywords) {
        if (line.toLowerCase().includes(keyword) && !currentScene.vfxNeeds?.includes(keyword)) {
          currentScene.vfxNeeds?.push(keyword);
        }
      }
      
      // Detect product placement opportunities
      const productKeywords = [
        'car', 'phone', 'computer', 'laptop', 'watch', 'brand', 'logo',
        'restaurant', 'store', 'shop', 'drink', 'food', 'clothing', 'shoes'
      ];
      
      for (const keyword of productKeywords) {
        if (line.toLowerCase().includes(keyword) && !currentScene.productPlacementOpportunities?.includes(keyword)) {
          currentScene.productPlacementOpportunities?.push(keyword);
        }
      }
    }
  }
  
  // Add the last scene
  if (currentScene) {
    scenes.push(finalizeScene(currentScene, currentPageEstimate));
  }
  
  console.log(`Regex extraction completed: ${scenes.length} scenes found from ${currentPageEstimate} estimated pages`);
  return scenes;
}

/**
 * Finalize scene data and calculate duration
 */
function finalizeScene(sceneData: Partial<ExtractedScene>, endPage: number): ExtractedScene {
  const pageCount = Math.max(1, (sceneData.pageEnd || endPage) - (sceneData.pageStart || 1) + 1);
  
  return {
    id: sceneData.id || 'unknown',
    sceneNumber: sceneData.sceneNumber || 0,
    location: sceneData.location || 'UNKNOWN LOCATION',
    timeOfDay: sceneData.timeOfDay || 'UNSPECIFIED',
    description: sceneData.description || '',
    characters: sceneData.characters || [],
    content: sceneData.content || '',
    pageStart: sceneData.pageStart || 1,
    pageEnd: sceneData.pageEnd || endPage,
    duration: Math.max(1, Math.round(pageCount * 1.2)), // Estimate 1.2 minutes per page
    vfxNeeds: sceneData.vfxNeeds || [],
    productPlacementOpportunities: sceneData.productPlacementOpportunities || []
  };
}

/**
 * Clean and normalize screenplay text
 */
export function cleanScreenplayText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove page numbers and headers/footers
    .replace(/^\s*\d+\s*$/gm, '')
    .replace(/^\s*(CONTINUED|CONT'D|MORE)\s*$/gm, '')
    // Normalize spacing
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]{3,}/g, '  ')
    .trim();
}