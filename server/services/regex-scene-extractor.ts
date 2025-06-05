/**
 * Regex-based scene extraction for screenplay content
 * Designed to handle full-length scripts without token limitations
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

export function extractScenesWithRegex(scriptContent: string): ExtractedScene[] {
  const scenes: ExtractedScene[] = [];
  const lines = scriptContent.split('\n');
  let currentScene: Partial<ExtractedScene> | null = null;
  let sceneNumber = 1;
  let lineIndex = 0;
  
  // Enhanced regex patterns for scene headers
  const sceneHeaderPatterns = [
    // Standard format: INT./EXT. LOCATION - TIME
    /^(INT\.|INTERIOR|EXT\.|EXTERIOR)\s+([^-\n]+?)\s*[-–—]\s*(.+?)$/i,
    // Without dash: INT./EXT. LOCATION TIME
    /^(INT\.|INTERIOR|EXT\.|EXTERIOR)\s+(.+?)\s+(DAY|NIGHT|MORNING|AFTERNOON|EVENING|DAWN|DUSK|LATER|CONTINUOUS|SAME TIME)$/i,
    // Just location: INT./EXT. LOCATION
    /^(INT\.|INTERIOR|EXT\.|EXTERIOR)\s+(.+?)$/i,
    // Numbered scenes: 1. INT./EXT.
    /^\d+\.\s*(INT\.|INTERIOR|EXT\.|EXTERIOR)\s+(.+?)(?:\s*[-–—]\s*(.+?))?$/i,
    // SCENE format
    /^SCENE\s+\d+/i
  ];
  
  // Character name patterns
  const characterPatterns = [
    /^([A-Z][A-Z\s'.-]{1,25})$/,  // Basic all-caps
    /^([A-Z][A-Z\s'.-]+)\s*\([^)]*\)$/,  // With parentheticals
    /^([A-Z][A-Z\s'.-]+):$/,  // With colon
  ];
  
  // Action/scene transition patterns
  const transitionPatterns = [
    /^(FADE IN|FADE OUT|CUT TO|DISSOLVE TO|SMASH CUT|JUMP CUT):/i,
    /^(FADE IN|FADE OUT)\.?$/i
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    lineIndex = i;
    
    // Skip empty lines
    if (!line) {
      if (currentScene) {
        currentScene.content += '\n';
      }
      continue;
    }
    
    // Check for scene headers
    let isSceneHeader = false;
    let headerMatch: RegExpMatchArray | null = null;
    
    for (const pattern of sceneHeaderPatterns) {
      headerMatch = line.match(pattern);
      if (headerMatch) {
        isSceneHeader = true;
        break;
      }
    }
    
    // Also check for FADE IN as first scene
    if (!isSceneHeader && sceneNumber === 1) {
      for (const pattern of transitionPatterns) {
        if (pattern.test(line)) {
          isSceneHeader = true;
          break;
        }
      }
    }
    
    if (isSceneHeader) {
      // Save previous scene
      if (currentScene) {
        currentScene.pageEnd = Math.floor(i / 55) + 1;
        currentScene.duration = Math.max(1, Math.floor((currentScene.content?.split('\n').length || 0) / 10));
        scenes.push(currentScene as ExtractedScene);
      }
      
      // Parse new scene
      let location = 'UNKNOWN LOCATION';
      let timeOfDay = 'UNSPECIFIED';
      
      if (headerMatch) {
        if (headerMatch[2]) {
          location = headerMatch[2].trim();
        }
        if (headerMatch[3]) {
          timeOfDay = headerMatch[3].trim();
        } else if (headerMatch[2]) {
          // Try to extract time from combined location/time
          const timeMatch = location.match(/(.+?)\s+(DAY|NIGHT|MORNING|AFTERNOON|EVENING|DAWN|DUSK|LATER|CONTINUOUS|SAME TIME)$/i);
          if (timeMatch) {
            location = timeMatch[1].trim();
            timeOfDay = timeMatch[2].trim();
          }
        }
      }
      
      currentScene = {
        id: `scene-${sceneNumber}`,
        sceneNumber: sceneNumber++,
        location,
        timeOfDay,
        description: `Scene at ${location}${timeOfDay !== 'UNSPECIFIED' ? ` during ${timeOfDay}` : ''}`,
        characters: [],
        content: line + '\n',
        pageStart: Math.floor(i / 55) + 1,
        pageEnd: Math.floor(i / 55) + 1,
        duration: 2,
        vfxNeeds: [],
        productPlacementOpportunities: []
      };
    } else if (currentScene) {
      // Add content to current scene
      currentScene.content += line + '\n';
      
      // Extract character names
      for (const pattern of characterPatterns) {
        const match = line.match(pattern);
        if (match) {
          const characterName = match[1].trim();
          
          // Validate character name
          if (characterName.length >= 2 && 
              characterName.length <= 25 &&
              !currentScene.characters?.includes(characterName) &&
              !characterName.match(/^(INT|EXT|FADE|CUT|DISSOLVE|INTERIOR|EXTERIOR|SCENE|ACT|THE|END|TITLE)/) &&
              !characterName.match(/^\d+/) &&
              characterName.split(' ').length <= 4) {
            
            currentScene.characters = currentScene.characters || [];
            currentScene.characters.push(characterName);
          }
          break;
        }
      }
    }
  }
  
  // Add final scene
  if (currentScene) {
    currentScene.pageEnd = Math.floor(lines.length / 55) + 1;
    currentScene.duration = Math.max(1, Math.floor((currentScene.content?.split('\n').length || 0) / 10));
    scenes.push(currentScene as ExtractedScene);
  }
  
  // Post-process scenes for better descriptions
  scenes.forEach(scene => {
    const content = scene.content.toLowerCase();
    let description = `Scene at ${scene.location}`;
    
    if (scene.timeOfDay && scene.timeOfDay !== 'UNSPECIFIED') {
      description += ` during ${scene.timeOfDay}`;
    }
    
    // Add context based on content
    if (content.includes('fight') || content.includes('action') || content.includes('chase')) {
      description += ' - Action sequence';
    } else if (content.includes('dialogue') || scene.characters.length > 1) {
      description += ` - Dialogue scene`;
      if (scene.characters.length > 0) {
        description += ` featuring ${scene.characters.slice(0, 2).join(' and ')}`;
        if (scene.characters.length > 2) {
          description += ` and ${scene.characters.length - 2} others`;
        }
      }
    } else if (content.includes('montage')) {
      description += ' - Montage sequence';
    } else if (content.includes('flashback')) {
      description += ' - Flashback sequence';
    }
    
    scene.description = description;
    
    // Estimate duration more accurately
    const contentLines = scene.content.split('\n').filter(line => line.trim()).length;
    const dialogueLines = scene.characters.length * 3; // rough estimate
    const actionLines = contentLines - dialogueLines;
    
    // 1 page ≈ 1 minute, dialogue is faster, action is slower
    scene.duration = Math.max(1, Math.round(
      (dialogueLines * 0.5) + (actionLines * 1.2)
    ));
  });
  
  return scenes;
}