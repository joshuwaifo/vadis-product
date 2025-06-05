// import { Request, Response } from "express";
// import { extractScenes, analyzeCharacters, suggestActors, analyzeVFXNeeds, generateProductPlacement, suggestLocations, generateFinancialPlan, generateProjectSummary } from "./script-analysis-agents";
// import { db } from "./db";
// import { projects, scenes, characters, actorSuggestions, vfxNeeds, productPlacements, locationSuggestions, financialPlans } from "@shared/schema";
// import { eq } from "drizzle-orm";

// /**
//  * Basic scene parser as fallback when AI is unavailable
//  */
// function parseBasicScenes(scriptContent: string) {
//   const lines = scriptContent.split('\n');
//   const scenes = [];
//   let currentScene = null;
//   let sceneNumber = 1;
//   let currentPageStart = 1;
  
//   // More comprehensive scene header patterns
//   const scenePatterns = [
//     /^(INT\.|INTERIOR)\s+(.+?)\s*[-–—]\s*(.+?)$/i,
//     /^(EXT\.|EXTERIOR)\s+(.+?)\s*[-–—]\s*(.+?)$/i,
//     /^(INT\.|INTERIOR)\s+(.+?)\s*-\s*(.+?)$/i,
//     /^(EXT\.|EXTERIOR)\s+(.+?)\s*-\s*(.+?)$/i,
//     /^(INT\.|INTERIOR)\s+(.+?)$/i,
//     /^(EXT\.|EXTERIOR)\s+(.+?)$/i,
//     /^SCENE\s+\d+/i,
//     /^\d+\.\s+(INT\.|EXT\.)/i
//   ];
  
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].trim();
    
//     // Check for scene headers using multiple patterns
//     let sceneHeaderMatch = null;
//     for (const pattern of scenePatterns) {
//       sceneHeaderMatch = line.match(pattern);
//       if (sceneHeaderMatch) break;
//     }
    
//     if (sceneHeaderMatch || (line.toUpperCase().startsWith('FADE IN') && sceneNumber === 1)) {
//       // Save previous scene if exists
//       if (currentScene) {
//         currentScene.pageEnd = Math.floor(i / 55) + 1;
//         currentScene.duration = Math.max(1, Math.floor(currentScene.content.split('\n').length / 8));
//         scenes.push({
//           ...currentScene,
//           content: currentScene.content.trim()
//         });
//       }
      
//       // Start new scene
//       let location = 'UNKNOWN LOCATION';
//       let timeOfDay = 'UNSPECIFIED';
      
//       if (sceneHeaderMatch) {
//         if (sceneHeaderMatch[2]) {
//           location = sceneHeaderMatch[2].trim();
//         }
//         if (sceneHeaderMatch[3]) {
//           timeOfDay = sceneHeaderMatch[3].trim();
//         } else if (sceneHeaderMatch[2]) {
//           // Try to extract time from location if not separate
//           const timeMatch = sceneHeaderMatch[2].match(/(.+?)\s*[-–—]\s*(.+)/);
//           if (timeMatch) {
//             location = timeMatch[1].trim();
//             timeOfDay = timeMatch[2].trim();
//           }
//         }
//       }
      
//       currentPageStart = Math.floor(i / 55) + 1;
      
//       currentScene = {
//         id: `scene-${sceneNumber}`,
//         sceneNumber: sceneNumber++,
//         location,
//         timeOfDay,
//         description: `Scene at ${location} during ${timeOfDay}`,
//         characters: [],
//         content: line + '\n',
//         pageStart: currentPageStart,
//         pageEnd: currentPageStart,
//         duration: 2,
//         vfxNeeds: [],
//         productPlacementOpportunities: []
//       };
//     } else if (currentScene) {
//       // Add content to current scene
//       currentScene.content += line + '\n';
      
//       // Extract character names - more comprehensive patterns
//       const characterPatterns = [
//         /^([A-Z][A-Z\s',.-]+)$/,  // All caps names
//         /^([A-Z][A-Z\s]+)\s*\([^)]*\)$/,  // Names with parentheticals
//         /^([A-Z][A-Z\s]+):$/,  // Names with colons
//         /^([A-Z]{2,}[A-Z\s]*)$/  // At least 2 consecutive caps
//       ];
      
//       for (const pattern of characterPatterns) {
//         const match = line.match(pattern);
//         if (match) {
//           const characterName = match[1].trim();
//           if (characterName.length >= 2 && characterName.length <= 25 && 
//               !currentScene.characters.includes(characterName) &&
//               !characterName.match(/^(INT|EXT|FADE|CUT|DISSOLVE|INTERIOR|EXTERIOR|SCENE|ACT)/) &&
//               characterName !== line.toUpperCase()) {
//             currentScene.characters.push(characterName);
//           }
//           break;
//         }
//       }
//     }
//   }
  
//   // Add the last scene
//   if (currentScene) {
//     currentScene.pageEnd = Math.floor(lines.length / 55) + 1;
//     currentScene.duration = Math.max(1, Math.floor(currentScene.content.split('\n').length / 8));
//     scenes.push({
//       ...currentScene,
//       content: currentScene.content.trim()
//     });
//   }
  
//   // Generate better descriptions based on content analysis
//   scenes.forEach((scene) => {
//     const content = scene.content.toLowerCase();
//     let description = `Scene at ${scene.location}`;
    
//     if (scene.timeOfDay && scene.timeOfDay !== 'UNSPECIFIED') {
//       description += ` during ${scene.timeOfDay}`;
//     }
    
//     // Add action context if found
//     if (content.includes('fight') || content.includes('action')) {
//       description += ' - Action sequence';
//     } else if (content.includes('dialogue') || scene.characters.length > 1) {
//       description += ` - Dialogue between ${scene.characters.slice(0, 3).join(', ')}`;
//     }
    
//     scene.description = description;
//   });
  
//   return scenes;
// }

// /**
//  * Comprehensive script analysis routes based on ANNEX C technical roadmap
//  * Handles all AI-powered analysis features for the Vadis platform
//  */

// export function registerComprehensiveAnalysisRoutes(app: any) {
  
//   // Scene extraction and breakdown
//   app.post('/api/script-analysis/scene_extraction', async (req: Request, res: Response) => {
//     try {
//       const { projectId } = req.body;
      
//       if (!projectId) {
//         return res.status(400).json({ error: 'Project ID is required' });
//       }

//       // Get project and script content from database
//       const project = await db.select().from(projects).where(eq(projects.id, parseInt(projectId))).limit(1);
//       if (!project.length || !project[0].scriptContent) {
//         return res.status(400).json({ error: 'Project not found or no script content available' });
//       }

//       let scriptContent = project[0].scriptContent;

//       // Check if this is a PDF metadata format (on-demand extraction needed)
//       if (scriptContent && scriptContent.startsWith('PDF_UPLOADED:')) {
//         // Try multiple PDF extraction methods for reliable text extraction
//         try {
//           let extractedData = null;
          
//           // Method 1: Use direct PDF parsing for stored file data
//           if ((project[0] as any).pdf_file_data && (project[0] as any).pdf_mime_type) {
//             try {
//               const { extractTextFromPDF } = await import('./services/pdf-text-extractor');
//               const pdfBuffer = Buffer.from((project[0] as any).pdf_file_data, 'base64');
//               console.log(`Extracting from stored PDF data (${pdfBuffer.length} bytes)`);
              
//               const textContent = await extractTextFromPDF(pdfBuffer);
//               if (textContent && textContent.length > 100) {
//                 console.log(`Successfully extracted ${textContent.length} characters from stored PDF`);
//                 scriptContent = textContent;
                
//                 // Update the project with extracted content for future use
//                 await db.update(projects)
//                   .set({ 
//                     scriptContent: textContent,
//                     updatedAt: new Date()
//                   })
//                   .where(eq(projects.id, parseInt(projectId)));
                
//                 extractedData = { content: textContent };
//               }
//             } catch (storageError) {
//               console.error('Failed to extract from stored PDF data:', storageError.message);
//             }
//           }
          
//           // Fallback to file system if stored data extraction failed
//           if (!extractedData || !extractedData.content) {
//             const fs = await import('fs');
//             const possiblePaths = [
//               'Pulp Fiction.pdf',
//               `${project[0].title}.pdf`,
//               'test_improved.pdf'
//             ].filter(filePath => {
//               try {
//                 if (fs.existsSync(filePath)) {
//                   const stats = fs.statSync(filePath);
//                   return stats.size > 10000;
//                 }
//                 return false;
//               } catch (e) {
//                 return false;
//               }
//             });
            
//             for (const pdfPath of possiblePaths) {
//               try {
//                 if (fs.existsSync(pdfPath)) {
//                   console.log(`Attempting to extract text from ${pdfPath} using Gemini AI`);
//                   const pdfBuffer = fs.readFileSync(pdfPath);
                  
//                   extractedData = await extractScriptFromPdf(pdfBuffer, 'application/pdf');
                  
//                   if (extractedData.content && extractedData.content.length > 100) {
//                     console.log(`Successfully extracted ${extractedData.content.length} characters from ${pdfPath}`);
                    
//                     // Update the project with extracted content
//                     await db.update(projects)
//                       .set({ 
//                         scriptContent: extractedData.content,
//                         updatedAt: new Date()
//                       })
//                       .where(eq(projects.id, parseInt(projectId)));
                    
//                     // Use the extracted content for analysis
//                     scriptContent = extractedData.content;
//                     break;
//                   }
//                 }
//               } catch (pdfError) {
//                 console.log(`Failed to extract from ${pdfPath}: ${pdfError.message}`);
//                 continue;
//               }
//             }
            
//             if (!extractedData || !extractedData.content) {
//               throw new Error('No readable PDF files found for authentic text extraction');
//             }
//           }
//         } catch (extractionError) {
//           console.error('Authentic PDF extraction failed:', extractionError.message);
//           return res.status(400).json({ 
//             error: 'Authentic script content required',
//             message: 'Unable to extract text from the PDF file using Gemini AI. Please ensure the PDF contains readable text and try uploading again.',
//             requiresExtraction: true,
//             details: extractionError.message
//           });
//         }
//       }

//       // Use proper scene extraction workflow based on demo app
//       console.log(`Processing script content of ${scriptContent.length} characters`);
      
//       // Import the proper scene extractor
//       const { analyzeScript } = await import('./services/scene-extractor');
//       const analysisResult = analyzeScript(scriptContent);
      
//       console.log(`Scene extractor found ${analysisResult.totalScenes} scenes from script analysis`);
      
//       // Convert to the expected format
//       const extractedScenes = analysisResult.scenes.map(scene => ({
//         id: `scene-${scene.sceneNumber}`,
//         sceneNumber: scene.sceneNumber,
//         location: scene.location || 'UNSPECIFIED',
//         timeOfDay: scene.timeOfDay || 'UNSPECIFIED', 
//         description: scene.heading,
//         characters: scene.characters || [],
//         content: scene.content,
//         pageStart: scene.pageStart || 1,
//         pageEnd: scene.pageEnd || 1,
//         duration: scene.duration || 1,
//         vfxNeeds: [],
//         productPlacementOpportunities: []
//       }));
      
//       // Save scenes to database
//       const savedScenes = await Promise.all(
//         extractedScenes.map(async (scene) => {
//           const [savedScene] = await db
//             .insert(scenes)
//             .values({
//               projectId: parseInt(projectId),
//               sceneNumber: scene.sceneNumber,
//               location: scene.location,
//               timeOfDay: scene.timeOfDay,
//               description: scene.description,
//               characters: scene.characters,
//               content: scene.content,
//               pageStart: scene.pageStart,
//               pageEnd: scene.pageEnd,
//               duration: scene.duration,
//               vfxNeeds: scene.vfxNeeds,
//               productPlacementOpportunities: scene.productPlacementOpportunities
//             })
//             .returning();
//           return savedScene;
//         })
//       );

//       res.json({
//         success: true,
//         scenes: savedScenes,
//         totalScenes: savedScenes.length,
//         estimatedDuration: savedScenes.reduce((total, scene) => total + (scene.duration || 0), 0)
//       });

//     } catch (error) {
//       console.error('Scene extraction error:', error);
//       console.error('Error details:', {
//         message: error.message,
//         stack: error.stack,
//         projectId
//       });
//       res.status(500).json({ 
//         error: 'Failed to extract scenes from script',
//         details: error.message 
//       });
//     }
//   });

//   // Character analysis
//   app.post('/api/script-analysis/character_analysis', async (req: Request, res: Response) => {
//     try {
//       const { projectId, scriptContent } = req.body;
      
//       const analyzedCharacters = await analyzeCharacters(scriptContent);
      
//       // Save characters to database
//       const savedCharacters = await Promise.all(
//         analyzedCharacters.map(async (character) => {
//           const [savedCharacter] = await db
//             .insert(characters)
//             .values({
//               projectId: parseInt(projectId),
//               name: character.name,
//               description: character.description,
//               age: character.age,
//               gender: character.gender,
//               personality: character.personality,
//               importance: character.importance,
//               screenTime: character.screenTime,
//               relationships: character.relationships,
//               characterArc: character.characterArc
//             })
//             .returning();
//           return savedCharacter;
//         })
//       );

//       res.json({
//         success: true,
//         characters: savedCharacters,
//         totalCharacters: savedCharacters.length
//       });

//     } catch (error) {
//       console.error('Character analysis error:', error);
//       res.status(500).json({ error: 'Failed to analyze characters' });
//     }
//   });

//   // AI Casting Director
//   app.post('/api/script-analysis/casting_suggestions', async (req: Request, res: Response) => {
//     try {
//       const { projectId, scriptContent } = req.body;
      
//       // Get existing characters for this project
//       const projectCharacters = await db
//         .select()
//         .from(characters)
//         .where(eq(characters.projectId, parseInt(projectId)));

//       if (projectCharacters.length === 0) {
//         return res.status(400).json({ error: 'No characters found. Please run character analysis first.' });
//       }

//       const castingSuggestions = await suggestActors(projectCharacters, scriptContent);
      
//       // Save casting suggestions
//       const savedSuggestions = await Promise.all(
//         castingSuggestions.map(async (suggestion) => {
//           const [saved] = await db
//             .insert(actorSuggestions)
//             .values({
//               projectId: parseInt(projectId),
//               characterName: suggestion.characterName,
//               suggestions: suggestion.suggestions
//             })
//             .returning();
//           return saved;
//         })
//       );

//       res.json({
//         success: true,
//         castingSuggestions: savedSuggestions
//       });

//     } catch (error) {
//       console.error('Casting suggestions error:', error);
//       res.status(500).json({ error: 'Failed to generate casting suggestions' });
//     }
//   });

//   // Location Intelligence
//   app.post('/api/script-analysis/location_analysis', async (req: Request, res: Response) => {
//     try {
//       const { projectId, scriptContent } = req.body;
      
//       // Get existing scenes for this project
//       const projectScenes = await db
//         .select()
//         .from(scenes)
//         .where(eq(scenes.projectId, parseInt(projectId)));

//       if (projectScenes.length === 0) {
//         return res.status(400).json({ error: 'No scenes found. Please run scene extraction first.' });
//       }

//       const locationSuggestionsList = await suggestLocations(projectScenes, scriptContent);
      
//       // Save location suggestions
//       const savedLocations = await Promise.all(
//         locationSuggestionsList.map(async (locationSugg) => {
//           const [saved] = await db
//             .insert(locationSuggestions)
//             .values({
//               projectId: parseInt(projectId),
//               sceneId: locationSugg.sceneId,
//               locationType: locationSugg.locationType,
//               suggestions: locationSugg.suggestions
//             })
//             .returning();
//           return saved;
//         })
//       );

//       res.json({
//         success: true,
//         locationSuggestions: savedLocations
//       });

//     } catch (error) {
//       console.error('Location analysis error:', error);
//       res.status(500).json({ error: 'Failed to analyze locations' });
//     }
//   });

//   // VFX Requirements Analysis
//   app.post('/api/script-analysis/vfx_analysis', async (req: Request, res: Response) => {
//     try {
//       const { projectId, scriptContent } = req.body;
      
//       // Get existing scenes for this project
//       const projectScenes = await db
//         .select()
//         .from(scenes)
//         .where(eq(scenes.projectId, parseInt(projectId)));

//       const vfxRequirements = await analyzeVFXNeeds(projectScenes, scriptContent);
      
//       // Save VFX needs
//       const savedVFX = await Promise.all(
//         vfxRequirements.map(async (vfx) => {
//           const [saved] = await db
//             .insert(vfxNeeds)
//             .values({
//               projectId: parseInt(projectId),
//               sceneId: vfx.sceneId,
//               sceneDescription: vfx.sceneDescription,
//               vfxType: vfx.vfxType,
//               complexity: vfx.complexity,
//               estimatedCost: vfx.estimatedCost,
//               description: vfx.description,
//               referenceImages: vfx.referenceImages
//             })
//             .returning();
//           return saved;
//         })
//       );

//       res.json({
//         success: true,
//         vfxNeeds: savedVFX,
//         totalEstimatedCost: savedVFX.reduce((total, vfx) => total + (vfx.estimatedCost || 0), 0)
//       });

//     } catch (error) {
//       console.error('VFX analysis error:', error);
//       res.status(500).json({ error: 'Failed to analyze VFX requirements' });
//     }
//   });

//   // Brand Marketplace - Product Placement
//   app.post('/api/script-analysis/product_placement', async (req: Request, res: Response) => {
//     try {
//       const { projectId, scriptContent } = req.body;
      
//       // Get existing scenes for this project
//       const projectScenes = await db
//         .select()
//         .from(scenes)
//         .where(eq(scenes.projectId, parseInt(projectId)));

//       const productPlacementOpportunities = await generateProductPlacement(projectScenes, scriptContent);
      
//       // Save product placement opportunities
//       const savedPlacements = await Promise.all(
//         productPlacementOpportunities.map(async (placement) => {
//           const [saved] = await db
//             .insert(productPlacements)
//             .values({
//               projectId: parseInt(projectId),
//               sceneId: placement.sceneId,
//               brand: placement.brand,
//               product: placement.product,
//               placement: placement.placement,
//               naturalness: placement.naturalness,
//               visibility: placement.visibility,
//               estimatedValue: placement.estimatedValue
//             })
//             .returning();
//           return saved;
//         })
//       );

//       res.json({
//         success: true,
//         productPlacements: savedPlacements,
//         totalEstimatedValue: savedPlacements.reduce((total, placement) => total + (placement.estimatedValue || 0), 0)
//       });

//     } catch (error) {
//       console.error('Product placement analysis error:', error);
//       res.status(500).json({ error: 'Failed to analyze product placement opportunities' });
//     }
//   });

//   // Financial Projection
//   app.post('/api/script-analysis/financial_planning', async (req: Request, res: Response) => {
//     try {
//       const { projectId, scriptContent } = req.body;
      
//       // Get all analysis data for financial planning
//       const [projectScenes, projectVFX, projectPlacements] = await Promise.all([
//         db.select().from(scenes).where(eq(scenes.projectId, parseInt(projectId))),
//         db.select().from(vfxNeeds).where(eq(vfxNeeds.projectId, parseInt(projectId))),
//         db.select().from(productPlacements).where(eq(productPlacements.projectId, parseInt(projectId)))
//       ]);

//       const financialPlan = await generateFinancialPlan(
//         projectScenes,
//         projectVFX,
//         projectPlacements,
//         scriptContent
//       );
      
//       // Save financial plan
//       const [savedPlan] = await db
//         .insert(financialPlans)
//         .values({
//           projectId: parseInt(projectId),
//           totalBudget: financialPlan.totalBudget,
//           budgetBreakdown: financialPlan.budgetBreakdown,
//           revenueProjections: financialPlan.revenueProjections,
//           roi: financialPlan.roi,
//           breakEvenPoint: financialPlan.breakEvenPoint
//         })
//         .returning();

//       // Update project with financial data
//       await db
//         .update(projects)
//         .set({
//           totalBudget: financialPlan.totalBudget,
//           projectedROI: `${financialPlan.roi}%`
//         })
//         .where(eq(projects.id, parseInt(projectId)));

//       res.json({
//         success: true,
//         financialPlan: savedPlan
//       });

//     } catch (error) {
//       console.error('Financial planning error:', error);
//       res.status(500).json({ error: 'Failed to generate financial plan' });
//     }
//   });

//   // Executive Summary Generation
//   app.post('/api/script-analysis/project_summary', async (req: Request, res: Response) => {
//     try {
//       const { projectId, scriptContent } = req.body;
      
//       // Get all analysis data for comprehensive summary
//       const [projectScenes, projectCharacters, projectCasting, projectLocations, projectVFX, projectPlacements, projectFinancial] = await Promise.all([
//         db.select().from(scenes).where(eq(scenes.projectId, parseInt(projectId))),
//         db.select().from(characters).where(eq(characters.projectId, parseInt(projectId))),
//         db.select().from(actorSuggestions).where(eq(actorSuggestions.projectId, parseInt(projectId))),
//         db.select().from(locationSuggestions).where(eq(locationSuggestions.projectId, parseInt(projectId))),
//         db.select().from(vfxNeeds).where(eq(vfxNeeds.projectId, parseInt(projectId))),
//         db.select().from(productPlacements).where(eq(productPlacements.projectId, parseInt(projectId))),
//         db.select().from(financialPlans).where(eq(financialPlans.projectId, parseInt(projectId)))
//       ]);

//       const executiveSummary = await generateProjectSummary(
//         projectScenes,
//         projectCharacters,
//         projectCasting,
//         projectLocations,
//         projectVFX,
//         projectPlacements,
//         projectFinancial[0],
//         scriptContent
//       );
      
//       // Update project with reader's report
//       await db
//         .update(projects)
//         .set({
//           readerReport: executiveSummary,
//           status: 'in_progress'
//         })
//         .where(eq(projects.id, parseInt(projectId)));

//       res.json({
//         success: true,
//         executiveSummary
//       });

//     } catch (error) {
//       console.error('Project summary error:', error);
//       res.status(500).json({ error: 'Failed to generate project summary' });
//     }
//   });

// }

import { Request, Response } from "express";
// Import extractScriptFromPdf from gemini-pdf-extractor, not pdf-service
import { extractScriptFromPdf } from "./services/gemini-pdf-extractor"; 
// Import analyzeScript from scene-extractor
import { analyzeScript } from "./services/scene-extractor"; 
import { db } from "./db";
import { projects, scenes as scenesTableSchema } from "@shared/schema"; // Renamed to avoid conflict
import { eq, and } from "drizzle-orm";
import { storage } from "./storage"; // Use storage for DB operations

// ... (other imports and existing functions like parseBasicScenes) ...
// Make sure analyzeCharacters, suggestActors etc are imported if used in other routes in this file.
// For now, we are focusing on scene_extraction.

export function registerComprehensiveAnalysisRoutes(app: any) {

  // Scene extraction and breakdown
  app.post('/api/script-analysis/scene_extraction', async (req: Request, res: Response) => {
    const { projectId: projectIdStr } = req.body;
    const userId = (req.session as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!projectIdStr) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    const projectId = parseInt(projectIdStr, 10);
    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid Project ID format' });
    }

    try {
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }

      let scriptTextContent = project.scriptContent;
      let extractedScenesFromPdfService: Awaited<ReturnType<typeof extractScriptFromPdf>>['scenes'] = [];

      if (project.scriptContent && project.scriptContent.startsWith('PDF_UPLOADED:')) {
        if (!project.pdfFileData || !project.pdfMimeType) {
          console.error(`Project ${projectId} is marked as PDF_UPLOADED but has no PDF data.`);
          return res.status(400).json({ error: 'PDF data not found for this project. Please re-upload.' });
        }
        try {
          console.log(`Extracting PDF for project ${projectId} using Gemini PDF Extractor...`);
          const pdfBuffer = Buffer.from(project.pdfFileData, 'base64');
          const pdfExtractionResult = await extractScriptFromPdf(pdfBuffer, project.pdfMimeType);

          scriptTextContent = pdfExtractionResult.content;
          extractedScenesFromPdfService = pdfExtractionResult.scenes; // These scenes are from gemini-pdf-extractor

          // Update project with extracted text content if it's substantial
          if (scriptTextContent && scriptTextContent.length > 100) {
            await storage.updateProject(projectId, { scriptContent: scriptTextContent });
            console.log(`Updated project ${projectId} with extracted text content.`);
          } else {
            console.warn(`Extracted text for project ${projectId} was too short. Using original placeholder.`);
            scriptTextContent = project.scriptContent; // Revert if extraction bad
          }
        } catch (pdfError) {
          console.error(`Error extracting PDF for project ${projectId}:`, pdfError);
          return res.status(500).json({ error: 'Failed to process PDF script. Please try re-uploading.' });
        }
      } else if (!project.scriptContent) {
        return res.status(400).json({ error: 'No script content available for analysis.' });
      }

      let finalScenesToSave;
      if (extractedScenesFromPdfService.length > 0) {
        // Use scenes from gemini-pdf-extractor if available (it has its own scene parser)
        finalScenesToSave = extractedScenesFromPdfService.map((s, index) => ({
            sceneNumber: s.sceneNumber || (index + 1),
            heading: s.heading,
            content: s.content,
            // Default other fields if not provided by gemini-pdf-extractor's scene structure
            location: s.heading.split(' - ')[0]?.trim() || 'Unknown',
            timeOfDay: s.heading.split(' - ')[1]?.trim() || 'Unknown',
            description: s.content.substring(0, 200) + (s.content.length > 200 ? '...' : ''),
            characters: [], // Will be populated by character analysis
            pageStart: null,
            pageEnd: null,
            duration: Math.max(1, Math.floor((s.content.split('\n').length || 0) / 10) || 1),
        }));
        console.log(`Using ${finalScenesToSave.length} scenes from PDF service for project ${projectId}`);
      } else {
        // Fallback to scene-extractor if PDF service didn't provide scenes or if it was plain text
        console.log(`Using scene-extractor for project ${projectId} with text of length ${scriptTextContent?.length}`);
        const analysisResult = analyzeScript(scriptTextContent!); // analyzeScript from scene-extractor.ts
        finalScenesToSave = analysisResult.scenes.map(s => ({
            ...s, // Spread existing fields from analyzeScript
            // Ensure all fields expected by DB are present
            location: s.location || s.heading.split(' - ')[0]?.trim() || 'Unknown',
            timeOfDay: s.timeOfDay || s.heading.split(' - ')[1]?.trim() || 'Unknown',
            description: s.description || s.content.substring(0,200) + (s.content.length > 200 ? '...' : ''),
            characters: s.characters || [],
            pageStart: s.pageStart || null,
            pageEnd: s.pageEnd || null,
            duration: s.duration || Math.max(1, Math.floor((s.content.split('\n').length || 0) / 10) || 1),
        }));
        console.log(`Using ${finalScenesToSave.length} scenes from scene-extractor for project ${projectId}`);
      }

      // Clear existing scenes for this project before saving new ones
      await db.delete(scenesTableSchema).where(eq(scenesTableSchema.projectId, projectId));
      console.log(`Cleared existing scenes for project ${projectId}.`);

      const savedDbScenes = [];
      for (const sceneData of finalScenesToSave) {
        const sceneToInsert = {
            projectId: projectId,
            sceneNumber: sceneData.sceneNumber,
            location: sceneData.location,
            timeOfDay: sceneData.timeOfDay,
            description: sceneData.description,
            characters: sceneData.characters,
            content: sceneData.content,
            pageStart: sceneData.pageStart,
            pageEnd: sceneData.pageEnd,
            duration: sceneData.duration,
            vfxNeeds: [], // default
            productPlacementOpportunities: [], // default
        };
        try {
            const [savedScene] = await db.insert(scenesTableSchema).values(sceneToInsert).returning();
            savedDbScenes.push(savedScene);
        } catch (dbError) {
            console.error(`Error saving scene number ${sceneData.sceneNumber} for project ${projectId}:`, dbError);
            // Optionally decide if you want to stop or continue
        }
      }
      console.log(`Successfully saved ${savedDbScenes.length} scenes to DB for project ${projectId}.`);

      res.json({
        success: true,
        scenes: savedDbScenes, // Return the scenes as saved in the DB
        totalScenes: savedDbScenes.length,
        estimatedDuration: savedDbScenes.reduce((total, scene) => total + (scene.duration || 0), 0)
      });

    } catch (error) {
      console.error('Scene extraction API error:', error);
      res.status(500).json({ 
        error: 'Failed to extract scenes from script',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // ... (other analysis routes: character_analysis, casting_suggestions, etc.)
  // Ensure these are correctly implemented or stubbed if not the current focus.
  // For now, let's assume they exist or add placeholder stubs.

  app.post('/api/script-analysis/character_analysis', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Character analysis not yet implemented.' });
  });
  app.post('/api/script-analysis/casting_suggestions', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Casting suggestions not yet implemented.' });
  });
  app.post('/api/script-analysis/location_analysis', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Location analysis not yet implemented.' });
  });
  app.post('/api/script-analysis/vfx_analysis', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'VFX analysis not yet implemented.' });
  });
  app.post('/api/script-analysis/product_placement', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Product placement analysis not yet implemented.' });
  });
  app.post('/api/script-analysis/financial_planning', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Financial planning not yet implemented.' });
  });
  app.post('/api/script-analysis/project_summary', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Project summary not yet implemented.' });
  });

}