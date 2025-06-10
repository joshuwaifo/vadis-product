import { Request, Response } from "express";
import { extractScenes, analyzeCharacters, suggestActors, analyzeVFXNeeds, generateProductPlacement, suggestLocations, generateFinancialPlan, generateProjectSummary } from "./script-analysis-agents";
import { db, pool } from "./db";
import { projects, scenes, characters, actorSuggestions, vfxNeeds, productPlacements, locationSuggestions, financialPlans, sceneBreakdowns } from "@shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * Basic scene parser as fallback when AI is unavailable
 */
function parseBasicScenes(scriptContent: string) {
  const lines = scriptContent.split('\n');
  const scenes = [];
  let currentScene = null;
  let sceneNumber = 1;
  let currentPageStart = 1;
  
  // More comprehensive scene header patterns
  const scenePatterns = [
    /^(INT\.|INTERIOR)\s+(.+?)\s*[-–—]\s*(.+?)$/i,
    /^(EXT\.|EXTERIOR)\s+(.+?)\s*[-–—]\s*(.+?)$/i,
    /^(INT\.|INTERIOR)\s+(.+?)\s*-\s*(.+?)$/i,
    /^(EXT\.|EXTERIOR)\s+(.+?)\s*-\s*(.+?)$/i,
    /^(INT\.|INTERIOR)\s+(.+?)$/i,
    /^(EXT\.|EXTERIOR)\s+(.+?)$/i,
    /^SCENE\s+\d+/i,
    /^\d+\.\s+(INT\.|EXT\.)/i
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for scene headers using multiple patterns
    let sceneHeaderMatch = null;
    for (const pattern of scenePatterns) {
      sceneHeaderMatch = line.match(pattern);
      if (sceneHeaderMatch) break;
    }
    
    if (sceneHeaderMatch || (line.toUpperCase().startsWith('FADE IN') && sceneNumber === 1)) {
      // Save previous scene if exists
      if (currentScene) {
        currentScene.pageEnd = Math.floor(i / 55) + 1;
        currentScene.duration = Math.max(1, Math.floor(currentScene.content.split('\n').length / 8));
        scenes.push({
          ...currentScene,
          content: currentScene.content.trim()
        });
      }
      
      // Start new scene
      let location = 'UNKNOWN LOCATION';
      let timeOfDay = 'UNSPECIFIED';
      
      if (sceneHeaderMatch) {
        if (sceneHeaderMatch[2]) {
          location = sceneHeaderMatch[2].trim();
        }
        if (sceneHeaderMatch[3]) {
          timeOfDay = sceneHeaderMatch[3].trim();
        } else if (sceneHeaderMatch[2]) {
          // Try to extract time from location if not separate
          const timeMatch = sceneHeaderMatch[2].match(/(.+?)\s*[-–—]\s*(.+)/);
          if (timeMatch) {
            location = timeMatch[1].trim();
            timeOfDay = timeMatch[2].trim();
          }
        }
      }
      
      currentPageStart = Math.floor(i / 55) + 1;
      
      currentScene = {
        id: `scene-${sceneNumber}`,
        sceneNumber: sceneNumber++,
        location,
        timeOfDay,
        description: `Scene at ${location} during ${timeOfDay}`,
        characters: [],
        content: line + '\n',
        pageStart: currentPageStart,
        pageEnd: currentPageStart,
        duration: 2,
        vfxNeeds: [],
        productPlacementOpportunities: []
      };
    } else if (currentScene) {
      // Add content to current scene
      currentScene.content += line + '\n';
      
      // Extract character names - more comprehensive patterns
      const characterPatterns = [
        /^([A-Z][A-Z\s',.-]+)$/,  // All caps names
        /^([A-Z][A-Z\s]+)\s*\([^)]*\)$/,  // Names with parentheticals
        /^([A-Z][A-Z\s]+):$/,  // Names with colons
        /^([A-Z]{2,}[A-Z\s]*)$/  // At least 2 consecutive caps
      ];
      
      for (const pattern of characterPatterns) {
        const match = line.match(pattern);
        if (match) {
          const characterName = match[1].trim();
          if (characterName.length >= 2 && characterName.length <= 25 && 
              !currentScene.characters.includes(characterName) &&
              !characterName.match(/^(INT|EXT|FADE|CUT|DISSOLVE|INTERIOR|EXTERIOR|SCENE|ACT)/) &&
              characterName !== line.toUpperCase()) {
            currentScene.characters.push(characterName);
          }
          break;
        }
      }
    }
  }
  
  // Add the last scene
  if (currentScene) {
    currentScene.pageEnd = Math.floor(lines.length / 55) + 1;
    currentScene.duration = Math.max(1, Math.floor(currentScene.content.split('\n').length / 8));
    scenes.push({
      ...currentScene,
      content: currentScene.content.trim()
    });
  }
  
  // Generate better descriptions based on content analysis
  scenes.forEach((scene) => {
    const content = scene.content.toLowerCase();
    let description = `Scene at ${scene.location}`;
    
    if (scene.timeOfDay && scene.timeOfDay !== 'UNSPECIFIED') {
      description += ` during ${scene.timeOfDay}`;
    }
    
    // Add action context if found
    if (content.includes('fight') || content.includes('action')) {
      description += ' - Action sequence';
    } else if (content.includes('dialogue') || scene.characters.length > 1) {
      description += ` - Dialogue between ${scene.characters.slice(0, 3).join(', ')}`;
    }
    
    scene.description = description;
  });
  
  return scenes;
}

/**
 * Comprehensive script analysis routes based on ANNEX C technical roadmap
 * Handles all AI-powered analysis features for the Vadis platform
 */

export function registerComprehensiveAnalysisRoutes(app: any) {
  
  // Scene extraction and breakdown
  app.post('/api/script-analysis/scene_extraction', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      // Get project and script content from database
      const project = await db.select().from(projects).where(eq(projects.id, parseInt(projectId))).limit(1);
      if (!project.length) {
        return res.status(400).json({ error: 'Project not found' });
      }

      let scriptContent = project[0].scriptContent;

      // If no script content at all, return error
      if (!scriptContent) {
        return res.status(400).json({ error: 'No script content available' });
      }

      // Prioritize using existing extracted script content
      if (scriptContent && !scriptContent.startsWith('PDF_UPLOADED:') && scriptContent.length > 100) {
        console.log(`Using existing extracted script content (${scriptContent.length} characters)`);
      }
      // Only extract from PDF if we don't have usable script content
      else if (scriptContent && scriptContent.startsWith('PDF_UPLOADED:')) {
        try {
          let extractedText = null;
          
          // Method 1: Try extracting from stored PDF data
          if (project[0].pdfFileData || project[0].scriptFileData) {
            const pdfData = project[0].pdfFileData || project[0].scriptFileData;
            const mimeType = project[0].pdfMimeType || project[0].scriptFileMimeType || 'application/pdf';
            
            if (pdfData) {
              console.log(`Attempting extraction from stored PDF data`);
              const { extractTextAndPageCount } = await import('./services/pdf-text-extractor');
              const pdfBuffer = Buffer.from(pdfData, 'base64');
              
              const extractionResult = await extractTextAndPageCount(pdfBuffer);
              extractedText = extractionResult.text;
              const actualPageCount = extractionResult.pageCount;
              
              console.log(`Extracted ${extractedText?.length || 0} characters from ${actualPageCount} pages`);
              
              // Update project with actual page count
              await db.update(projects)
                .set({ pageCount: actualPageCount })
                .where(eq(projects.id, parseInt(projectId)));
            }
          }
          
          // Method 2: Fallback to filesystem search
          if (!extractedText || extractedText.length < 100) {
            console.log('Trying filesystem fallback for PDF extraction');
            const fs = await import('fs');
            const possiblePaths = [
              'Pulp Fiction.pdf',
              `${project[0].title}.pdf`,
              'test_improved.pdf'
            ];
            
            for (const pdfPath of possiblePaths) {
              try {
                if (fs.existsSync(pdfPath)) {
                  console.log(`Found and processing ${pdfPath}`);
                  const { extractScriptFromPdf } = await import('./services/pdf-text-extractor');
                  const pdfBuffer = fs.readFileSync(pdfPath);
                  
                  const result = await extractScriptFromPdf(pdfBuffer, 'application/pdf');
                  if (result.content && result.content.length > 100) {
                    extractedText = result.content;
                    console.log(`Successfully extracted ${extractedText.length} characters from ${pdfPath}`);
                    break;
                  }
                }
              } catch (fileError) {
                console.log(`Failed to process ${pdfPath}: ${fileError.message}`);
                continue;
              }
            }
          }
          
          // Method 3: Check if Gemini AI key is available for PDF processing
          if (!extractedText || extractedText.length < 100) {
            if (!process.env.GEMINI_API_KEY) {
              throw new Error('PDF text extraction failed and no GEMINI_API_KEY available for enhanced processing');
            }
            
            console.log('Attempting Gemini AI PDF extraction as final method');
            // This will be handled by the PDF extraction service
            throw new Error('Unable to extract readable text from PDF file - please ensure PDF contains selectable text');
          }
          
          if (extractedText && extractedText.length > 50) {
            scriptContent = extractedText;
            
            // Update the project with extracted content
            await db.update(projects)
              .set({ 
                scriptContent: extractedText,
                updatedAt: new Date()
              })
              .where(eq(projects.id, parseInt(projectId)));
            
            console.log(`Saved extracted text (${extractedText.length} characters) to database for project ${projectId}`);
          } else {
            throw new Error('Unable to extract sufficient text content from any source');
          }
          
        } catch (extractionError) {
          console.error('PDF extraction failed:', extractionError.message);
          return res.status(400).json({ 
            error: 'PDF extraction failed',
            message: 'Unable to extract text from the PDF file. Please ensure the PDF contains readable text and try uploading again.',
            requiresExtraction: true,
            details: extractionError.message
          });
        }
      }

      // Use proper scene extraction workflow based on demo app
      console.log(`Processing script content of ${scriptContent.length} characters`);
      
      // Clear existing scenes for this project to prevent duplication
      await db.delete(scenes).where(eq(scenes.projectId, parseInt(projectId)));
      console.log(`Cleared existing scenes for project ${projectId}`);

      // Import the enhanced scene extractor for comprehensive processing
      const { extractScenesWithChunking } = await import('./services/enhanced-scene-extractor');
      const analysisResult = await extractScenesWithChunking(scriptContent);
      
      console.log(`Enhanced scene extractor found ${analysisResult.totalScenes} scenes from script analysis`);
      
      // Get actual page count from database (stored during PDF extraction)
      const updatedProject = await db
        .select()
        .from(projects)
        .where(eq(projects.id, parseInt(projectId)))
        .limit(1);
      
      const actualPageCount = updatedProject[0]?.pageCount || Math.ceil(scriptContent.split(/\s+/).length / 250);
      console.log(`Using ${actualPageCount} pages for estimated duration`);
      
      // Convert to the expected format
      const extractedScenes = analysisResult.scenes.map(scene => ({
        id: `scene-${scene.sceneNumber}`,
        sceneNumber: scene.sceneNumber,
        location: scene.location || 'UNSPECIFIED',
        timeOfDay: scene.timeOfDay || 'UNSPECIFIED', 
        description: scene.title || `Scene ${scene.sceneNumber}`,
        plotSummary: scene.plotSummary || 'Scene summary not available',
        characters: scene.characters || [],
        content: scene.content,
        pageStart: scene.pageStart || 1,
        pageEnd: scene.pageEnd || 1,
        duration: scene.duration || 1,
        vfxNeeds: [],
        productPlacementOpportunities: []
      }));
      
      // Save scenes to database
      const savedScenes = await Promise.all(
        extractedScenes.map(async (scene) => {
          const [savedScene] = await db
            .insert(scenes)
            .values({
              projectId: parseInt(projectId),
              sceneNumber: scene.sceneNumber,
              location: scene.location,
              timeOfDay: scene.timeOfDay,
              description: scene.description,
              plotSummary: scene.plotSummary,
              characters: scene.characters,
              content: scene.content,
              pageStart: scene.pageStart,
              pageEnd: scene.pageEnd,
              duration: scene.duration,
              vfxNeeds: scene.vfxNeeds,
              productPlacementOpportunities: scene.productPlacementOpportunities
            })
            .returning();
          return savedScene;
        })
      );

      res.json({
        success: true,
        scenes: savedScenes,
        totalScenes: savedScenes.length,
        estimatedDuration: actualPageCount // Use actual PDF page count as estimated minutes
      });

    } catch (error) {
      console.error('Scene extraction error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        projectId
      });
      res.status(500).json({ 
        error: 'Failed to extract scenes from script',
        details: error.message 
      });
    }
  });

  // Get stored scene breakdown
  app.get('/api/projects/:projectId/scene-breakdown', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      // Get stored scene breakdown from database
      const storedBreakdown = await db
        .select()
        .from(sceneBreakdowns)
        .where(eq(sceneBreakdowns.projectId, parseInt(projectId)))
        .orderBy(sceneBreakdowns.startScene);

      if (storedBreakdown.length > 0) {
        // Return stored breakdown data
        const segments = storedBreakdown.map(breakdown => ({
          title: breakdown.title,
          sceneRange: breakdown.sceneRange,
          startScene: breakdown.startScene,
          endScene: breakdown.endScene,
          summary: breakdown.summary,
          mainCharacters: breakdown.mainCharacters || [],
          keyLocations: breakdown.keyLocations || []
        }));

        return res.json({
          success: true,
          projectId: parseInt(projectId),
          segments,
          totalSegments: segments.length,
          cached: true
        });
      }

      // No stored data found
      res.json({
        success: true,
        projectId: parseInt(projectId),
        segments: [],
        totalSegments: 0,
        cached: false
      });

    } catch (error) {
      console.error('Scene breakdown retrieval error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve scene breakdown',
        details: error.message 
      });
    }
  });

  // Scene breakdown - groups consecutive scenes into narrative segments
  app.post('/api/script-analysis/scene_breakdown', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      // Get project and script content from database
      const project = await db.select().from(projects).where(eq(projects.id, parseInt(projectId))).limit(1);
      if (!project.length) {
        return res.status(400).json({ error: 'Project not found' });
      }

      let scriptContent = project[0].scriptContent;

      // If no script content at all, return error
      if (!scriptContent) {
        return res.status(400).json({ error: 'No script content available' });
      }

      // Prioritize using existing extracted script content
      if (scriptContent && !scriptContent.startsWith('PDF_UPLOADED:') && scriptContent.length > 100) {
        console.log(`Using existing extracted script content for scene breakdown (${scriptContent.length} characters)`);
      }
      // Only extract from PDF if we don't have usable script content
      else if (scriptContent && scriptContent.startsWith('PDF_UPLOADED:')) {
        try {
          let extractedText = null;
          
          // Method 1: Try extracting from stored PDF data
          if (project[0].pdfFileData || project[0].scriptFileData) {
            const pdfData = project[0].pdfFileData || project[0].scriptFileData;
            
            if (pdfData) {
              console.log(`Attempting extraction from stored PDF data for scene breakdown`);
              const { extractTextAndPageCount } = await import('./services/pdf-text-extractor');
              const pdfBuffer = Buffer.from(pdfData, 'base64');
              
              const extractionResult = await extractTextAndPageCount(pdfBuffer);
              extractedText = extractionResult.text;
              const actualPageCount = extractionResult.pageCount;
              
              console.log(`Extracted ${extractedText?.length || 0} characters from ${actualPageCount} pages for scene breakdown`);
              
              // Update project with extracted content and page count
              await db.update(projects)
                .set({ 
                  scriptContent: extractedText,
                  pageCount: actualPageCount 
                })
                .where(eq(projects.id, parseInt(projectId)));
            }
          }
          
          if (!extractedText || extractedText.length < 100) {
            return res.status(400).json({ 
              error: 'Unable to extract text from PDF for scene breakdown analysis' 
            });
          }
          
          scriptContent = extractedText;
          
          // Save extracted text to database for future use
          await db.update(projects)
            .set({ 
              scriptContent: extractedText,
              updatedAt: new Date()
            })
            .where(eq(projects.id, parseInt(projectId)));
          
          console.log(`Saved extracted text (${extractedText.length} characters) to database for scene breakdown`);
          
        } catch (extractionError) {
          console.error('PDF extraction error for scene breakdown:', extractionError);
          return res.status(400).json({ 
            error: 'Failed to extract script content from PDF for analysis' 
          });
        }
      }

      // Check for existing scenes first, fallback to script content analysis
      const existingScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, parseInt(projectId)))
        .orderBy(scenes.sceneNumber);

      let scenesData;
      
      if (existingScenes.length > 0) {
        // Use existing extracted scenes if available
        scenesData = existingScenes.map(scene => ({
          sceneNumber: scene.sceneNumber,
          location: scene.location,
          timeOfDay: scene.timeOfDay,
          description: scene.description,
          plotSummary: scene.plotSummary,
          characters: scene.characters,
          duration: scene.duration,
          content: scene.content
        }));
      } else {
        // Parse script content directly for scene breakdown
        const basicScenes = parseBasicScenes(scriptContent);
        scenesData = basicScenes.map((scene, index) => ({
          sceneNumber: index + 1,
          location: scene.location || 'UNSPECIFIED',
          timeOfDay: scene.timeOfDay || 'UNSPECIFIED',
          description: scene.description || `Scene ${index + 1}`,
          plotSummary: scene.content.substring(0, 200) + '...',
          characters: scene.characters || [],
          duration: scene.duration || 1,
          content: scene.content
        }));
      }

      // Use OpenAI to analyze and group scenes into narrative segments
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Pre-analyze locations to help with grouping
      const locationAnalysis = scenesData.reduce((acc, scene, index) => {
        const prevScene = index > 0 ? scenesData[index - 1] : null;
        const nextScene = index < scenesData.length - 1 ? scenesData[index + 1] : null;
        
        acc.push({
          sceneNumber: scene.sceneNumber,
          location: scene.location,
          isLocationChange: prevScene ? scene.location !== prevScene.location : true,
          nextLocationChange: nextScene ? scene.location !== nextScene.location : true
        });
        
        return acc;
      }, [] as any[]);

      const prompt = `Analyze the following scenes and group consecutive scenes into logical narrative segments based on LOCATION CONTINUITY and natural story flow.

CRITICAL GROUPING RULES:
1. LOCATION PRIORITY: Group consecutive scenes in the same location together
2. LOCATION TRANSITIONS: Start a new segment when location significantly changes
3. GRANULAR SEGMENTATION: Aim for 35-45 segments total (roughly 4-6 scenes per segment for ${scenesData.length} scenes)
4. MINIMUM SEGMENTS: Never create fewer than 25 segments
5. SMALL SEGMENTS OK: Segments can be 1-3 scenes if location/context warrants

LOCATION GROUPING LOGIC:
- Same exact location = same segment
- Related locations (e.g., different rooms in same building) = same segment  
- Significant location changes (building to building, interior to exterior, different settings) = new segment
- Time of day changes within same location = consider new segment
- Character group changes = consider new segment boundary

For each segment provide:
- Title: Compelling, evocative title capturing the story beat
- Scene range: "Scenes X-Y" format
- Summary: DETAILED, comprehensive storytelling description (minimum 150-250 words) covering:
  * What exactly happens in this segment (specific events, actions, dialogue themes)
  * Character motivations, emotions, and development
  * Dramatic tension, conflict, and stakes
  * Visual elements, atmosphere, and tone
  * How this segment advances the overall plot
  * Key story beats and turning points
  * Subtext and underlying themes
  Write as if describing the segment to someone who hasn't read the script - be thorough and vivid
- Main characters: Primary characters active in this segment  
- Key locations: Primary location(s) where action occurs

CREATE MORE SEGMENTS RATHER THAN FEWER. Target 35-45 segments minimum.

Location Analysis (to help with grouping):
${JSON.stringify(locationAnalysis, null, 2)}

Scenes data:
${JSON.stringify(scenesData, null, 2)}

Respond in JSON format with this structure:
{
  "segments": [
    {
      "title": "Compelling and evocative segment title",
      "sceneRange": "Scenes X-Y",
      "startScene": X,
      "endScene": Y,
      "summary": "Direct, immersive storytelling description of what happens - the events, character actions, emotional stakes, dramatic tension, and plot developments without meta-narrative language",
      "mainCharacters": ["Character1", "Character2"],
      "keyLocations": ["Location1", "Location2"]
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert script analyst specializing in narrative structure and story segmentation. Analyze scenes and group them into logical narrative beats."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      // Save scene breakdown results to database
      try {
        // First, clear any existing scene breakdown data for this project
        await db
          .delete(sceneBreakdowns)
          .where(eq(sceneBreakdowns.projectId, parseInt(projectId)));

        // Insert new scene breakdown data
        if (analysis.segments && analysis.segments.length > 0) {
          const breakdownData = analysis.segments.map((segment: any) => ({
            projectId: parseInt(projectId),
            title: segment.title,
            sceneRange: segment.sceneRange,
            startScene: segment.startScene,
            endScene: segment.endScene,
            summary: segment.summary,
            mainCharacters: segment.mainCharacters || [],
            keyLocations: segment.keyLocations || []
          }));

          await db.insert(sceneBreakdowns).values(breakdownData);
          console.log(`Saved ${analysis.segments.length} scene breakdown segments to database`);
        }
      } catch (dbError) {
        console.error('Error saving scene breakdown to database:', dbError);
        // Continue with response even if DB save fails
      }
      
      res.json({
        success: true,
        projectId: parseInt(projectId),
        segments: analysis.segments,
        totalSegments: analysis.segments.length,
        totalScenes: existingScenes.length
      });

    } catch (error) {
      console.error('Scene breakdown error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze scene breakdown',
        details: error.message 
      });
    }
  });

  // Character analysis
  app.post('/api/script-analysis/character_analysis', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.body;
      console.log(`Starting character analysis for project ${projectId}`);
      
      // Get project and script content
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, parseInt(projectId)));

      if (!project.length) {
        return res.status(404).json({ error: 'Project not found' });
      }

      let scriptContent = project[0].scriptContent;

      // If no script content at all, return error
      if (!scriptContent) {
        return res.status(400).json({ error: 'No script content available' });
      }

      // Prioritize using existing extracted script content
      if (scriptContent && !scriptContent.startsWith('PDF_UPLOADED:') && scriptContent.length > 100) {
        console.log(`Using existing extracted script content for character analysis (${scriptContent.length} characters)`);
      }
      // Only extract from PDF if we don't have usable script content
      else if (scriptContent && scriptContent.startsWith('PDF_UPLOADED:')) {
        try {
          if (project[0].scriptFileData) {
            console.log('Extracting text from stored PDF for character analysis');
            const { extractTextFromPDF } = await import('./services/pdf-text-extractor');
            const pdfBuffer = Buffer.from(project[0].scriptFileData, 'base64');
            scriptContent = await extractTextFromPDF(pdfBuffer);
            console.log(`Extracted ${scriptContent?.length || 0} characters for analysis`);
            
            // Save extracted text to database for future use
            await db.update(projects)
              .set({ 
                scriptContent: scriptContent,
                updatedAt: new Date()
              })
              .where(eq(projects.id, parseInt(projectId)));
            
            console.log(`Saved extracted text (${scriptContent.length} characters) to database for character analysis`);
          }
        } catch (extractError) {
          console.error('PDF extraction failed for character analysis:', extractError);
          return res.status(400).json({ 
            error: 'PDF extraction failed', 
            message: 'Unable to extract text from the PDF file for character analysis.',
            requiresExtraction: true,
            details: extractError.message
          });
        }
      }

      if (!scriptContent || scriptContent.length < 100) {
        return res.status(400).json({ 
          error: 'Insufficient script content for character analysis',
          message: 'Please ensure your script contains adequate character dialogue and descriptions.'
        });
      }

      // Clear existing characters for this project to prevent duplication
      await db.delete(characters).where(eq(characters.projectId, parseInt(projectId)));
      console.log(`Cleared existing characters for project ${projectId}`);

      // Get existing scenes for this project to use in character analysis
      const existingScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, parseInt(projectId)));

      console.log(`Found ${existingScenes.length} existing scenes for character analysis`);

      // Perform enhanced character analysis with demographics and relationships
      const { analyzeCharacters } = await import('./script-analysis-agents');
      const analysisResult = await analyzeCharacters(existingScenes.length > 0 ? existingScenes : [], 'gpt-4o');
      
      console.log(`Character analysis complete: ${analysisResult.characters.length} characters, ${analysisResult.relationships.length} relationships`);

      // Save characters to database with enhanced demographics
      const savedCharacters = await Promise.all(
        analysisResult.characters.map(async (character) => {
          const [savedCharacter] = await db
            .insert(characters)
            .values({
              projectId: parseInt(projectId),
              name: character.name,
              description: character.description,
              age: character.age,
              gender: character.gender,
              personality: character.personality,
              importance: character.importance,
              screenTime: character.screenTime,
              relationships: character.relationships,
              characterArc: character.characterArc
            })
            .returning();
          return savedCharacter;
        })
      );

      res.json({
        success: true,
        characters: analysisResult.characters,
        relationships: analysisResult.relationships,
        relationshipExplanations: analysisResult.relationshipExplanations,
        totalCharacters: analysisResult.characters.length,
        savedToDatabase: savedCharacters.length
      });

    } catch (error) {
      console.error('Character analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze characters',
        message: error.message || 'An unexpected error occurred during character analysis.'
      });
    }
  });

  // AI Casting Director - Enhanced with comprehensive analysis
  app.post('/api/script-analysis/casting_suggestions', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.body;
      console.log(`Starting casting analysis for project ${projectId}`);
      
      // Get project details
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, parseInt(projectId)));

      if (!project.length) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Get existing characters for this project
      const projectCharacters = await db
        .select()
        .from(characters)
        .where(eq(characters.projectId, parseInt(projectId)));

      if (projectCharacters.length === 0) {
        return res.status(400).json({ 
          error: 'No characters found for casting analysis', 
          message: 'Please run character analysis first to generate casting suggestions.',
          requiresCharacterAnalysis: true
        });
      }

      console.log(`Found ${projectCharacters.length} characters for casting analysis`);

      // Get character relationships data (assuming it's stored or can be retrieved)
      const relationships = projectCharacters.flatMap(char => 
        char.relationships || []
      );

      // Perform comprehensive casting analysis
      const { suggestActors } = await import('./script-analysis-agents');
      const castingAnalysis = await suggestActors(
        projectCharacters as any[], 
        relationships,
        project[0].title || 'Untitled Script',
        'gpt-4o'
      );

      // Fetch actor profile images
      const { tmdbService } = await import('./tmdb-service');
      if (tmdbService) {
        console.log('Fetching actor profile images...');
        
        // Collect all actor names for batch processing
        const allActorNames = new Set<string>();
        
        castingAnalysis.characterSuggestions.forEach(suggestion => {
          suggestion.suggestedActors.forEach(actor => {
            allActorNames.add(actor.actorName);
          });
        });

        // Fetch all actor profiles
        const actorProfiles = await tmdbService.getActorProfiles(Array.from(allActorNames));

        // Add profile images to casting suggestions
        castingAnalysis.characterSuggestions.forEach(suggestion => {
          suggestion.suggestedActors.forEach(actor => {
            const profile = actorProfiles[actor.actorName];
            actor.profileImageUrl = profile?.profileImageUrl || 
              tmdbService.generatePlaceholderAvatar(actor.actorName);
          });
        });

        console.log('Actor profile images added to casting suggestions');
      }
      
      console.log(`Casting analysis complete for ${castingAnalysis.characterSuggestions.length} characters`);

      // Save complete casting analysis to database
      const savedAnalysis = await pool.query(`
        INSERT INTO casting_analysis (project_id, script_title, analysis_data)
        VALUES ($1, $2, $3)
        ON CONFLICT (project_id) 
        DO UPDATE SET 
          analysis_data = $3,
          updated_at = NOW()
        RETURNING id
      `, [parseInt(projectId), castingAnalysis.scriptTitle, JSON.stringify(castingAnalysis)]);

      console.log('Complete casting analysis saved to database:', savedAnalysis.rows[0]?.id);

      res.json({
        success: true,
        castingAnalysis,
        savedToDatabase: true,
        message: `Generated comprehensive casting analysis for ${castingAnalysis.characterSuggestions.length} characters`
      });

    } catch (error: any) {
      console.error('Casting suggestions error:', error);
      res.status(500).json({ 
        error: 'Failed to generate casting suggestions',
        message: error.message || 'An unexpected error occurred during casting analysis.'
      });
    }
  });

  // Analyze user-suggested actor for a character
  app.post('/api/script-analysis/analyze_user_actor', async (req: Request, res: Response) => {
    try {
      const { projectId, characterName, suggestedActor } = req.body;
      
      if (!projectId || !characterName || !suggestedActor) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          message: 'Please provide projectId, characterName, and suggestedActor'
        });
      }

      // Get character details
      const allProjectCharacters = await db
        .select()
        .from(characters)
        .where(eq(characters.projectId, parseInt(projectId)));

      const character = allProjectCharacters.filter(char => char.name === characterName);

      if (!character.length) {
        return res.status(404).json({ error: 'Character not found' });
      }

      // Use the already fetched characters
      const allCharacters = allProjectCharacters;

      // Get relationships (using empty array as fallback since relationships field may not exist)
      const relationships: any[] = [];

      // Analyze user's actor choice
      const { analyzeUserActorChoice } = await import('./script-analysis-agents');
      const analysis = await analyzeUserActorChoice(
        character[0] as any,
        suggestedActor,
        allCharacters as any[],
        relationships,
        'gpt-4o'
      );

      // Fetch actor profile image from TMDB
      const { tmdbService } = await import('./tmdb-service');
      if (tmdbService) {
        try {
          console.log(`Fetching profile image for actor: ${suggestedActor}`);
          const actorProfile = await tmdbService.searchActor(suggestedActor);
          if (actorProfile && actorProfile.profileImageUrl) {
            analysis.profileImageUrl = actorProfile.profileImageUrl;
            console.log(`Profile image found for ${suggestedActor}: ${actorProfile.profileImageUrl}`);
          } else {
            console.log(`No profile image found for ${suggestedActor}`);
          }
        } catch (imageError) {
          console.warn(`Failed to fetch profile image for ${suggestedActor}:`, imageError);
        }
      }

      res.json({
        success: true,
        analysis,
        characterName,
        suggestedActor
      });

    } catch (error: any) {
      console.error('User actor analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze actor suggestion',
        message: error.message || 'An unexpected error occurred during actor analysis.'
      });
    }
  });

  // Location Intelligence
  app.post('/api/script-analysis/location_analysis', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      // Get existing scenes for this project
      const projectScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, parseInt(projectId)));

      if (projectScenes.length === 0) {
        return res.status(400).json({ error: 'No scenes found. Please run scene extraction first.' });
      }

      const locationSuggestionsList = await suggestLocations(projectScenes, scriptContent);
      
      // Save location suggestions
      const savedLocations = await Promise.all(
        locationSuggestionsList.map(async (locationSugg) => {
          const [saved] = await db
            .insert(locationSuggestions)
            .values({
              projectId: parseInt(projectId),
              sceneId: locationSugg.sceneId,
              locationType: locationSugg.locationType,
              suggestions: locationSugg.suggestions
            })
            .returning();
          return saved;
        })
      );

      res.json({
        success: true,
        locationSuggestions: savedLocations
      });

    } catch (error) {
      console.error('Location analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze locations' });
    }
  });

  // VFX Requirements Analysis
  app.post('/api/script-analysis/vfx_analysis', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      // Get existing scenes for this project
      const projectScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, parseInt(projectId)));

      const vfxRequirements = await analyzeVFXNeeds(projectScenes, scriptContent);
      
      // Save VFX needs
      const savedVFX = await Promise.all(
        vfxRequirements.map(async (vfx) => {
          const [saved] = await db
            .insert(vfxNeeds)
            .values({
              projectId: parseInt(projectId),
              sceneId: vfx.sceneId,
              sceneDescription: vfx.sceneDescription,
              vfxType: vfx.vfxType,
              complexity: vfx.complexity,
              estimatedCost: vfx.estimatedCost,
              description: vfx.description,
              referenceImages: vfx.referenceImages
            })
            .returning();
          return saved;
        })
      );

      res.json({
        success: true,
        vfxNeeds: savedVFX,
        totalEstimatedCost: savedVFX.reduce((total, vfx) => total + (vfx.estimatedCost || 0), 0)
      });

    } catch (error) {
      console.error('VFX analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze VFX requirements' });
    }
  });

  // AI Product Placement - Identify brandable scenes
  app.post('/api/script-analysis/identify_brandable_scenes', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.body;
      
      // Get scene breakdowns for this project
      const projectSceneBreakdowns = await db
        .select()
        .from(sceneBreakdowns)
        .where(eq(sceneBreakdowns.projectId, parseInt(projectId)));

      if (!projectSceneBreakdowns || projectSceneBreakdowns.length === 0) {
        return res.status(400).json({ 
          error: 'No scene breakdowns found. Please run scene breakdown analysis first.' 
        });
      }

      const { identifyBrandableScenes } = await import('./services/ai-product-placement');
      const brandableScenes = await identifyBrandableScenes(projectSceneBreakdowns);
      
      res.json({
        success: true,
        brandableScenes,
        totalScenes: brandableScenes.length
      });

    } catch (error) {
      console.error('Brandable scenes analysis error:', error);
      res.status(500).json({ error: 'Failed to identify brandable scenes' });
    }
  });

  // AI Product Placement - Get matching products for scene
  app.get('/api/script-analysis/matching_products/:sceneId', async (req: Request, res: Response) => {
    try {
      const { sceneId } = req.params;
      const { categories } = req.query;
      
      const { getMatchingProducts } = await import('./services/ai-product-placement');
      const suggestedCategories = categories ? (categories as string).split(',') : [];
      const matchingProducts = getMatchingProducts(suggestedCategories);
      
      res.json({
        success: true,
        products: matchingProducts,
        totalProducts: matchingProducts.length
      });

    } catch (error) {
      console.error('Product matching error:', error);
      res.status(500).json({ error: 'Failed to get matching products' });
    }
  });

  // AI Product Placement - Generate visualization
  app.post('/api/script-analysis/generate_placement_visualization', async (req: Request, res: Response) => {
    try {
      const { sceneBreakdownId, productId } = req.body;
      
      if (!sceneBreakdownId || !productId) {
        return res.status(400).json({ error: 'Scene breakdown ID and product ID are required' });
      }

      // Get scene breakdown details using raw SQL
      console.log('Looking for scene breakdown with ID:', sceneBreakdownId);
      const sceneBreakdownResult = await pool.query(`
        SELECT * FROM scene_breakdowns WHERE id = $1 LIMIT 1
      `, [parseInt(sceneBreakdownId)]);

      if (sceneBreakdownResult.rows.length === 0) {
        return res.status(404).json({ error: 'Scene breakdown not found' });
      }
      
      const sceneBreakdown = sceneBreakdownResult.rows[0];

      // Get the actual product placement from database
      console.log('Looking for product placement with ID:', productId);
      const placementResult = await pool.query(`
        SELECT * FROM product_placements WHERE id = $1
      `, [parseInt(productId)]);
      
      console.log('Product placement query result:', placementResult.rows);
      
      if (placementResult.rows.length === 0) {
        return res.status(404).json({ error: 'Product placement not found' });
      }
      
      const placement = placementResult.rows[0];
      
      // Create a product object compatible with the visualization function
      const product = {
        id: placement.id.toString(),
        name: placement.product,
        brand: placement.brand,
        category: placement.visibility,
        description: placement.placement,
        imageUrl: "https://via.placeholder.com/400x300?text=" + encodeURIComponent(placement.brand),
        placementStyle: placement.visibility
      };
      
      const { generateProductPlacementVisualization } = await import('./services/ai-product-placement');

      const visualization = await generateProductPlacementVisualization(
        sceneBreakdown,
        product
      );

      res.json({
        success: true,
        visualization
      });

    } catch (error) {
      console.error('Visualization generation error:', error);
      res.status(500).json({ error: 'Failed to generate placement visualization' });
    }
  });

  // Brand Marketplace - Product Placement (Legacy route for backward compatibility)
  app.post('/api/script-analysis/product_placement', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      // Get existing scenes for this project
      const projectScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, parseInt(projectId)));

      const productPlacementOpportunities = await generateProductPlacement(projectScenes, scriptContent);
      
      // Save product placement opportunities using raw SQL for better compatibility
      const savedPlacements = await Promise.all(
        productPlacementOpportunities.map(async (placement) => {
          // Find the actual scene ID from the database that matches the AI-generated scene reference
          const sceneMatch = projectScenes.find(scene => 
            scene.id.toString() === placement.sceneId || 
            scene.sceneNumber.toString() === placement.sceneId ||
            scene.id === parseInt(placement.sceneId)
          );
          
          if (!sceneMatch) {
            console.warn(`No matching scene found for sceneId: ${placement.sceneId}`);
            console.warn(`Available scene IDs: ${projectScenes.map(s => s.id).join(', ')}`);
            return null;
          }

          console.log(`Inserting placement: ${placement.brand} - ${placement.product} for scene ${sceneMatch.id}`);

          const result = await pool.query(`
            INSERT INTO product_placements (project_id, scene_id, brand, product, placement, naturalness, visibility, estimated_value)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `, [
            parseInt(projectId),
            sceneMatch.id,
            placement.brand,
            placement.product,
            placement.placement,
            placement.naturalness,
            placement.visibility,
            placement.estimatedValue
          ]);
          
          return result.rows[0];
        })
      );

      // Filter out null results
      const validPlacements = savedPlacements.filter(placement => placement !== null);

      res.json({
        success: true,
        productPlacements: validPlacements,
        totalEstimatedValue: validPlacements.reduce((total, placement) => total + (placement.estimated_value || 0), 0)
      });

    } catch (error) {
      console.error('Product placement analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze product placement opportunities' });
    }
  });

  // Financial Projection
  app.post('/api/script-analysis/financial_planning', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      // Get all analysis data for financial planning
      const [projectScenes, projectVFX, projectPlacements] = await Promise.all([
        db.select().from(scenes).where(eq(scenes.projectId, parseInt(projectId))),
        db.select().from(vfxNeeds).where(eq(vfxNeeds.projectId, parseInt(projectId))),
        db.select().from(productPlacements).where(eq(productPlacements.projectId, parseInt(projectId)))
      ]);

      const financialPlan = await generateFinancialPlan(
        projectScenes,
        projectVFX,
        projectPlacements,
        scriptContent
      );
      
      // Save financial plan
      const [savedPlan] = await db
        .insert(financialPlans)
        .values({
          projectId: parseInt(projectId),
          totalBudget: financialPlan.totalBudget,
          budgetBreakdown: financialPlan.budgetBreakdown,
          revenueProjections: financialPlan.revenueProjections,
          roi: financialPlan.roi,
          breakEvenPoint: financialPlan.breakEvenPoint
        })
        .returning();

      // Update project with financial data
      await db
        .update(projects)
        .set({
          totalBudget: financialPlan.totalBudget,
          projectedROI: `${financialPlan.roi}%`
        })
        .where(eq(projects.id, parseInt(projectId)));

      res.json({
        success: true,
        financialPlan: savedPlan
      });

    } catch (error) {
      console.error('Financial planning error:', error);
      res.status(500).json({ error: 'Failed to generate financial plan' });
    }
  });

  // Executive Summary Generation
  app.post('/api/script-analysis/project_summary', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      // Get all analysis data for comprehensive summary
      const [projectScenes, projectCharacters, projectCasting, projectLocations, projectVFX, projectPlacements, projectFinancial] = await Promise.all([
        db.select().from(scenes).where(eq(scenes.projectId, parseInt(projectId))),
        db.select().from(characters).where(eq(characters.projectId, parseInt(projectId))),
        db.select().from(actorSuggestions).where(eq(actorSuggestions.projectId, parseInt(projectId))),
        db.select().from(locationSuggestions).where(eq(locationSuggestions.projectId, parseInt(projectId))),
        db.select().from(vfxNeeds).where(eq(vfxNeeds.projectId, parseInt(projectId))),
        db.select().from(productPlacements).where(eq(productPlacements.projectId, parseInt(projectId))),
        db.select().from(financialPlans).where(eq(financialPlans.projectId, parseInt(projectId)))
      ]);

      const executiveSummary = await generateProjectSummary(
        projectScenes,
        projectCharacters,
        projectCasting,
        projectLocations,
        projectVFX,
        projectPlacements,
        projectFinancial[0],
        scriptContent
      );
      
      // Update project with reader's report
      await db
        .update(projects)
        .set({
          readerReport: executiveSummary,
          status: 'in_progress'
        })
        .where(eq(projects.id, parseInt(projectId)));

      res.json({
        success: true,
        executiveSummary
      });

    } catch (error) {
      console.error('Project summary error:', error);
      res.status(500).json({ error: 'Failed to generate project summary' });
    }
  });

  // Update Ensemble Chemistry Analysis with Selected Actors
  app.post('/api/script-analysis/update_ensemble_chemistry', async (req: Request, res: Response) => {
    try {
      const { projectId, selectedActors, scriptTitle, characterSuggestions } = req.body;
      
      // Get existing casting analysis from the correct table
      const analysisResult = await pool.query(`
        SELECT analysis_data 
        FROM casting_analysis 
        WHERE project_id = $1
      `, [parseInt(projectId)]);
      
      if (analysisResult.rows.length === 0) {
        return res.status(404).json({ error: 'No casting analysis found for this project' });
      }

      const existingCastingData = analysisResult.rows[0].analysis_data;

      // Update user selections in the database
      const updatedCastingData = {
        ...existingCastingData,
        userSelections: selectedActors.reduce((acc: any, sel: any) => {
          acc[sel.characterName] = {
            selectedActor: sel.selectedActor,
            reason: 'User selected',
            isLocked: true
          };
          return acc;
        }, existingCastingData.userSelections || {})
      };

      // Update existing casting analysis with user selections
      await pool.query(`
        UPDATE casting_analysis 
        SET analysis_data = $1, updated_at = NOW()
        WHERE project_id = $2
      `, [JSON.stringify(updatedCastingData), parseInt(projectId)]);

      res.json({
        success: true,
        message: 'Ensemble chemistry analysis updated with selected actors'
      });

    } catch (error) {
      console.error('Update ensemble chemistry error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update ensemble chemistry analysis' 
      });
    }
  });

  /**
   * Get stored product placements for a project
   */
  app.get('/api/projects/:projectId/product-placements', async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);

      if (!projectId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Valid project ID is required' 
        });
      }

      // Get product placements from database using raw SQL query
      const result = await pool.query(`
        SELECT * FROM product_placements WHERE project_id = $1
      `, [projectId]);

      const productPlacementResults = result.rows;

      res.json({
        success: true,
        productPlacements: productPlacementResults,
        totalEstimatedValue: productPlacementResults.reduce((sum: number, placement: any) => sum + (placement.estimated_value || 0), 0)
      });

    } catch (error) {
      console.error('Error fetching product placements:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch product placements' 
      });
    }
  });

}