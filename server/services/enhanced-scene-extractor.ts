/**
 * Enhanced Scene Extraction Service with Gemini AI Integration
 * Provides comprehensive scene extraction with chunking for full PDF coverage
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractedScene {
  sceneNumber: number;
  title: string;
  plotSummary: string;
  location?: string;
  timeOfDay?: string;
  characters?: string[];
  content: string;
  pageStart?: number;
  pageEnd?: number;
  duration?: number;
}

export interface ScriptAnalysisResult {
  scenes: ExtractedScene[];
  totalScenes: number;
  estimatedDuration: number;
}

/**
 * Extract scenes using chunked processing for comprehensive coverage
 */
export async function extractScenesWithChunking(scriptText: string): Promise<ScriptAnalysisResult> {
  if (!process.env.GEMINI_API_KEY) {
    // Fallback to basic extraction without AI enhancement
    return extractScenesBasic(scriptText);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
  
  // Split script into chunks to ensure complete processing
  const chunks = chunkScript(scriptText, 25000); // Larger chunks to capture more scenes
  const allScenes: ExtractedScene[] = [];
  
  console.log(`Processing script in ${chunks.length} chunks for comprehensive scene extraction`);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} characters)`);
    
    try {
      const prompt = `You are a script analysis assistant. I will provide you with a movie script in standard Hollywood format. Your task is to identify and extract each scene, then return ONLY the following three pieces of information for each scene:

1. **Scene Number** (if explicitly numbered, or assign sequential numbers starting from 1)
2. **Scene Title** (create a concise, descriptive title based on the scene heading/location)
3. **Plot Summary** (2-3 sentences maximum describing what happens in the scene)

**Guidelines:**
- A new scene typically begins with a scene heading (INT./EXT. LOCATION - TIME)
- Keep plot summaries concise but capture the key action, dialogue purpose, or story development
- Focus on what happens, not how it's written
- If scenes aren't pre-numbered, number them sequentially
- For scene titles, use the location and key action (e.g., "Kitchen Argument," "Car Chase Downtown," "Office Meeting")

Format as JSON array:
[{
  "sceneNumber": 1,
  "title": "Apartment Bedroom - Morning",
  "plotSummary": "Sarah wakes up late and rushes to get ready for an important job interview. She spills coffee on her outfit and has to change clothes."
}]

Script text:
${chunk}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Parse JSON response
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const scenes = JSON.parse(jsonMatch[0]);
          scenes.forEach((scene: any) => {
            allScenes.push({
              sceneNumber: scene.sceneNumber || allScenes.length + 1,
              title: scene.title || `Scene ${allScenes.length + 1}`,
              plotSummary: scene.plotSummary || 'Scene description not available',
              location: 'UNSPECIFIED',
              timeOfDay: 'UNSPECIFIED',
              characters: [],
              content: scene.plotSummary || 'Scene content',
              pageStart: 1,
              pageEnd: 1,
              duration: 2
            });
          });
        }
      } catch (parseError) {
        console.log(`Failed to parse JSON for chunk ${i + 1}, using fallback extraction`);
        // Fallback to basic pattern matching for this chunk
        const basicScenes = extractScenesFromChunk(chunk, allScenes.length);
        allScenes.push(...basicScenes);
      }
      
      // Add delay to respect API rate limits
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.log(`Error processing chunk ${i + 1}:`, error.message);
      // Fallback to basic extraction for this chunk
      const basicScenes = extractScenesFromChunk(chunk, allScenes.length);
      allScenes.push(...basicScenes);
    }
  }
  
  console.log(`Extracted ${allScenes.length} scenes total using enhanced chunked processing`);
  
  return {
    scenes: allScenes,
    totalScenes: allScenes.length,
    estimatedDuration: allScenes.reduce((total, scene) => total + (scene.duration || 2), 0)
  };
}

/**
 * Split script into manageable chunks
 */
function chunkScript(text: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Basic scene extraction for fallback
 */
function extractScenesBasic(scriptText: string): ScriptAnalysisResult {
  const scenes: ExtractedScene[] = [];
  
  // Standard scene heading patterns
  const sceneHeadingRegex = /(INT\.?|EXT\.?|INTERIOR|EXTERIOR)[\s\.\-]+([^\n\r]+?)(?:\s*[-\s]+\s*(DAY|NIGHT|EVENING|MORNING|AFTERNOON|DAWN|DUSK|LATER|CONTINUOUS))?/gi;
  
  let match;
  let sceneNumber = 1;
  const matches = [];
  
  while ((match = sceneHeadingRegex.exec(scriptText)) !== null) {
    matches.push({
      index: match.index,
      heading: match[0],
      location: match[2]?.trim() || 'UNSPECIFIED',
      timeOfDay: match[3]?.trim() || 'UNSPECIFIED'
    });
  }
  
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    
    const startIndex = current.index;
    const endIndex = next ? next.index : scriptText.length;
    const content = scriptText.substring(startIndex, endIndex).trim();
    
    // Generate basic plot summary
    const plotSummary = generateBasicPlotSummary(content);
    
    scenes.push({
      sceneNumber: sceneNumber++,
      title: current.heading,
      plotSummary,
      location: current.location,
      timeOfDay: current.timeOfDay,
      characters: extractCharactersFromContent(content),
      content,
      pageStart: Math.floor(startIndex / 2000) + 1,
      pageEnd: Math.floor(endIndex / 2000) + 1,
      duration: Math.max(1, Math.floor(content.length / 1000))
    });
  }
  
  return {
    scenes,
    totalScenes: scenes.length,
    estimatedDuration: scenes.reduce((total, scene) => total + (scene.duration || 2), 0)
  };
}

/**
 * Extract scenes from a single chunk using basic patterns
 */
function extractScenesFromChunk(chunk: string, startingSceneNumber: number): ExtractedScene[] {
  const scenes: ExtractedScene[] = [];
  const sceneHeadingRegex = /(INT\.?|EXT\.?|INTERIOR|EXTERIOR)[\s\.\-]+([^\n\r]+)/gi;
  
  let match;
  let sceneNumber = startingSceneNumber + 1;
  
  while ((match = sceneHeadingRegex.exec(chunk)) !== null) {
    const heading = match[0];
    const location = match[2]?.trim() || 'UNSPECIFIED';
    
    // Extract content until next scene or end of chunk
    const startIndex = match.index;
    const nextMatch = sceneHeadingRegex.exec(chunk);
    sceneHeadingRegex.lastIndex = match.index + match[0].length;
    
    const endIndex = nextMatch ? nextMatch.index : chunk.length;
    const content = chunk.substring(startIndex, endIndex).trim();
    
    scenes.push({
      sceneNumber: sceneNumber++,
      title: heading,
      plotSummary: generateBasicPlotSummary(content),
      location,
      timeOfDay: 'UNSPECIFIED',
      characters: extractCharactersFromContent(content),
      content,
      pageStart: 1,
      pageEnd: 1,
      duration: 2
    });
  }
  
  return scenes;
}

/**
 * Generate basic plot summary from scene content
 */
function generateBasicPlotSummary(content: string): string {
  // Take first few lines of meaningful dialogue/action
  const lines = content.split('\n').filter(line => 
    line.trim().length > 10 && 
    !line.match(/^(INT\.?|EXT\.?|FADE|CUT|DISSOLVE)/)
  );
  
  const summary = lines.slice(0, 3).join(' ').trim();
  return summary.length > 10 ? summary.substring(0, 150) + '...' : 'Scene content available';
}

/**
 * Extract character names from scene content
 */
function extractCharactersFromContent(content: string): string[] {
  const characters = new Set<string>();
  
  // Look for character names in dialogue format
  const dialogueRegex = /^\s*([A-Z][A-Z\s\.]{2,}?)(?:\s*\([^)]*\))?\s*$/gm;
  let match;
  
  while ((match = dialogueRegex.exec(content)) !== null) {
    const character = match[1].trim();
    if (character.length > 2 && character.length < 30) {
      characters.add(character);
    }
  }
  
  return Array.from(characters).slice(0, 10);
}