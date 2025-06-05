/**
 * Scene extraction service based on the demo app workflow
 * Handles comprehensive scene breakdown from script text
 */

export interface ExtractedScene {
  sceneNumber: number;
  heading: string;
  content: string;
  location?: string;
  timeOfDay?: string;
  characters?: string[];
  pageStart?: number;
  pageEnd?: number;
  duration?: number;
}

export interface ScriptAnalysisResult {
  title?: string;
  scenes: ExtractedScene[];
  totalScenes: number;
  estimatedDuration: number;
}

/**
 * Extract scenes from script text using comprehensive regex patterns
 */
export function extractScenes(scriptText: string): ExtractedScene[] {
  const scenes: ExtractedScene[] = [];
  
  // Standard scene heading patterns from demo app
  const sceneHeadingPatterns = [
    // Standard format: INT./EXT. LOCATION - TIME
    /(INT\.?|EXT\.?|I\/E\.?|INT\/EXT\.?)[\s\.\-]+(.*?)(?:\s*[-\s]+\s*)(DAY|NIGHT|EVENING|MORNING|AFTERNOON|DAWN|DUSK|LATER|CONTINUOUS|SAME TIME)/gi,
    // Without time specification
    /(INT\.?|EXT\.?|I\/E\.?|INT\/EXT\.?)[\s\.\-]+([^\n\r]+)/gi,
    // Numbered scenes
    /^\s*(\d+)[\.\)]\s+(?!INT\.?|EXT\.?...)([^\n]+)$/gim
  ];
  
  const allMatches: Array<{
    match: RegExpMatchArray;
    position: number;
    pattern: number;
  }> = [];
  
  // Find all scene heading matches
  sceneHeadingPatterns.forEach((pattern, patternIndex) => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(scriptText)) !== null) {
      allMatches.push({
        match,
        position: match.index || 0,
        pattern: patternIndex
      });
    }
  });
  
  // Sort matches by position in script
  allMatches.sort((a, b) => a.position - b.position);
  
  // Extract content between scene headings
  for (let i = 0; i < allMatches.length; i++) {
    const currentMatch = allMatches[i];
    const nextMatch = allMatches[i + 1];
    
    const sceneStart = currentMatch.position;
    const sceneEnd = nextMatch ? nextMatch.position : scriptText.length;
    
    const heading = currentMatch.match[0].trim();
    const content = scriptText.substring(sceneStart, sceneEnd).trim();
    
    // Parse location and time from heading
    let location = '';
    let timeOfDay = '';
    
    if (currentMatch.pattern === 0) { // Standard format with time
      location = currentMatch.match[2]?.trim() || '';
      timeOfDay = currentMatch.match[3]?.trim() || '';
    } else if (currentMatch.pattern === 1) { // Without time
      location = currentMatch.match[2]?.trim() || '';
    } else if (currentMatch.pattern === 2) { // Numbered scenes
      location = currentMatch.match[2]?.trim() || '';
    }
    
    // Extract characters from scene content
    const characters = extractCharacters(content);
    
    // Estimate page numbers (approximately 55 lines per page)
    const contentLines = content.split('\n').length;
    const pageStart = Math.floor(sceneStart / (scriptText.length / (scriptText.split('\n').length / 55))) + 1;
    const pageEnd = Math.floor(sceneEnd / (scriptText.length / (scriptText.split('\n').length / 55))) + 1;
    
    // Estimate duration (1 page ≈ 1 minute)
    const duration = Math.max(1, Math.floor(contentLines / 55) || 1);
    
    scenes.push({
      sceneNumber: i + 1,
      heading,
      content,
      location,
      timeOfDay,
      characters,
      pageStart,
      pageEnd,
      duration
    });
  }
  
  // If no scenes found, create fallback scenes
  if (scenes.length === 0) {
    return createFallbackScenes(scriptText);
  }
  
  return scenes;
}

/**
 * Extract character names from scene content
 */
function extractCharacters(content: string): string[] {
  const characters = new Set<string>();
  
  // Character name patterns (all caps names before dialogue)
  const characterPatterns = [
    /^([A-Z][A-Z\s'.-]{1,25})$/gm,  // Basic all-caps names
    /^([A-Z][A-Z\s'.-]+)\s*\([^)]*\)$/gm,  // Names with parentheticals
    /^([A-Z][A-Z\s'.-]+):$/gm,  // Names with colons
  ];
  
  characterPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1].trim();
      
      // Validate character name
      if (name.length >= 2 && 
          name.length <= 25 &&
          !name.match(/^(INT|EXT|FADE|CUT|DISSOLVE|INTERIOR|EXTERIOR|SCENE|ACT|THE|END|TITLE)/) &&
          !name.match(/^\d+/) &&
          name.split(' ').length <= 3) {
        characters.add(name);
      }
    }
  });
  
  return Array.from(characters);
}

/**
 * Create fallback scenes when no standard headings are found
 */
function createFallbackScenes(scriptText: string): ExtractedScene[] {
  const paragraphs = scriptText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const scenes: ExtractedScene[] = [];
  
  // Group paragraphs into scenes (5 paragraphs per scene)
  const paragraphsPerScene = 5;
  
  for (let i = 0; i < paragraphs.length; i += paragraphsPerScene) {
    const sceneParagraphs = paragraphs.slice(i, i + paragraphsPerScene);
    const content = sceneParagraphs.join('\n\n');
    
    // Try to extract a meaningful heading from first paragraph
    const firstParagraph = sceneParagraphs[0];
    let heading = `Scene ${Math.floor(i / paragraphsPerScene) + 1}`;
    
    // Look for location indicators in first paragraph
    const locationMatch = firstParagraph.match(/(INT\.?|EXT\.?)[\s\.]+(.*?)(?:\s*[-\s]+\s*)/i);
    if (locationMatch) {
      heading = firstParagraph.trim();
    } else {
      // Use first few words as heading
      const words = firstParagraph.trim().split(/\s+/).slice(0, 6);
      heading = words.join(' ') + (words.length === 6 ? '...' : '');
    }
    
    scenes.push({
      sceneNumber: Math.floor(i / paragraphsPerScene) + 1,
      heading,
      content,
      characters: extractCharacters(content),
      pageStart: Math.floor(i / paragraphsPerScene) + 1,
      pageEnd: Math.floor(i / paragraphsPerScene) + 1,
      duration: Math.max(1, Math.floor(content.length / 1000))
    });
  }
  
  return scenes;
}

/**
 * Extract potential title from script text
 */
export function extractTitle(scriptText: string): string | null {
  const lines = scriptText.split('\n').slice(0, 10); // Check first 10 lines
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Look for all-caps text that could be a title
    if (trimmedLine.length > 3 && 
        trimmedLine.length < 50 &&
        trimmedLine === trimmedLine.toUpperCase() &&
        !trimmedLine.includes('INT.') &&
        !trimmedLine.includes('EXT.') &&
        !trimmedLine.includes('FADE') &&
        !trimmedLine.match(/^\d/)) {
      return trimmedLine;
    }
  }
  
  return null;
}

/**
 * Analyze complete script and return structured result
 */
export function analyzeScript(scriptText: string): ScriptAnalysisResult {
  const title = extractTitle(scriptText);
  const scenes = extractScenes(scriptText);
  const totalScenes = scenes.length;
  const estimatedDuration = scenes.reduce((total, scene) => total + (scene.duration || 1), 0);
  
  return {
    title: title || undefined,
    scenes,
    totalScenes,
    estimatedDuration
  };
}