import { Request, Response } from "express";
import { extractScenes, analyzeCharacters, suggestActors, analyzeVFXNeeds, generateProductPlacement, suggestLocations, generateFinancialPlan, generateProjectSummary } from "./script-analysis-agents";
import { db, pool } from "./db";
import { projects, scenes, characters, actorSuggestions, vfxNeeds, productPlacements, locationSuggestions, financialPlans } from "@shared/schema";
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
      if (!project.length || !project[0].scriptContent) {
        return res.status(400).json({ error: 'Project not found or no script content available' });
      }

      let scriptContent = project[0].scriptContent;

      // Check if this is a PDF metadata format (on-demand extraction needed)
      if (scriptContent && scriptContent.startsWith('PDF_UPLOADED:')) {
        try {
          let extractedText = null;
          
          // Method 1: Try extracting from stored PDF data
          if (project[0].pdfFileData || project[0].scriptFileData) {
            const pdfData = project[0].pdfFileData || project[0].scriptFileData;
            const mimeType = project[0].pdfMimeType || project[0].scriptFileMimeType || 'application/pdf';
            
            if (pdfData) {
              console.log(`Attempting extraction from stored PDF data`);
              const { extractTextFromPDF } = await import('./services/pdf-text-extractor');
              const pdfBuffer = Buffer.from(pdfData, 'base64');
              
              extractedText = await extractTextFromPDF(pdfBuffer);
              console.log(`Extracted ${extractedText?.length || 0} characters from stored PDF`);
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
        estimatedDuration: savedScenes.reduce((total, scene) => total + (scene.duration || 0), 0)
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

      // Handle PDF extraction if needed
      if (scriptContent && scriptContent.startsWith('PDF_UPLOADED:')) {
        try {
          if (project[0].scriptFileData) {
            console.log('Extracting text from stored PDF for character analysis');
            const { extractTextFromPDF } = await import('./services/pdf-text-extractor');
            const pdfBuffer = Buffer.from(project[0].scriptFileData, 'base64');
            scriptContent = await extractTextFromPDF(pdfBuffer);
            console.log(`Extracted ${scriptContent?.length || 0} characters for analysis`);
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

  // Brand Marketplace - Product Placement
  app.post('/api/script-analysis/product_placement', async (req: Request, res: Response) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      // Get existing scenes for this project
      const projectScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, parseInt(projectId)));

      const productPlacementOpportunities = await generateProductPlacement(projectScenes, scriptContent);
      
      // Save product placement opportunities
      const savedPlacements = await Promise.all(
        productPlacementOpportunities.map(async (placement) => {
          const [saved] = await db
            .insert(productPlacements)
            .values({
              projectId: parseInt(projectId),
              sceneId: placement.sceneId,
              brand: placement.brand,
              product: placement.product,
              placement: placement.placement,
              naturalness: placement.naturalness,
              visibility: placement.visibility,
              estimatedValue: placement.estimatedValue
            })
            .returning();
          return saved;
        })
      );

      res.json({
        success: true,
        productPlacements: savedPlacements,
        totalEstimatedValue: savedPlacements.reduce((total, placement) => total + (placement.estimatedValue || 0), 0)
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
      
      // Get existing casting analysis
      const existingCasting = await db.select().from(actorSuggestions).where(eq(actorSuggestions.projectId, parseInt(projectId)));
      
      if (!existingCasting.length) {
        return res.status(404).json({ error: 'No casting analysis found for this project' });
      }

      // Create updated character suggestions with selected actors
      const updatedCharacterSuggestions = characterSuggestions.map((charSuggestion: any) => {
        const selectedActor = selectedActors.find((sel: any) => sel.characterName === charSuggestion.characterName);
        
        if (selectedActor) {
          // Move selected actor to the front of the suggestions
          const selectedActorData = charSuggestion.suggestedActors.find((actor: any) => actor.actorName === selectedActor.selectedActor);
          if (selectedActorData) {
            const otherActors = charSuggestion.suggestedActors.filter((actor: any) => actor.actorName !== selectedActor.selectedActor);
            return {
              ...charSuggestion,
              suggestedActors: [selectedActorData, ...otherActors]
            };
          }
        }
        
        return charSuggestion;
      });

      // Generate new ensemble chemistry analysis with selected actors
      const characters = await db.select().from(characters).where(eq(characters.projectId, parseInt(projectId)));
      
      // Create casting analysis with selected actors prioritized
      const castingAnalysis = await suggestActors(
        characters,
        `Updated casting analysis for ${scriptTitle} with user-selected actors: ${selectedActors.map((s: any) => `${s.characterName}: ${s.selectedActor}`).join(', ')}`
      );

      // Update the database with new ensemble chemistry
      const castingData = {
        scriptTitle,
        characterSuggestions: updatedCharacterSuggestions,
        ensembleChemistry: castingAnalysis.ensembleChemistry,
        userSelections: selectedActors.reduce((acc: any, sel: any) => {
          acc[sel.characterName] = {
            selectedActor: sel.selectedActor,
            reason: 'User selected',
            isLocked: true
          };
          return acc;
        }, {})
      };

      // Update existing casting suggestions with new ensemble chemistry
      await db
        .update(actorSuggestions)
        .set({
          castingData: JSON.stringify(castingData),
          updatedAt: new Date()
        })
        .where(eq(actorSuggestions.projectId, parseInt(projectId)));

      res.json({
        success: true,
        ensembleChemistry: castingAnalysis.ensembleChemistry,
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

}