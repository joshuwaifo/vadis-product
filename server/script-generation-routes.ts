/**
 * Script Generation Routes
 * 
 * API endpoints for AI-powered screenplay generation
 * Integrates with the script generation service for comprehensive script creation
 */
import { Request, Response } from 'express';
import { z } from 'zod';
import { generateScript, ScriptGenerationRequest } from './services/script-generation-service';
import { db } from './db';
import { projects } from '@shared/schema';
import { eq } from 'drizzle-orm';

const scriptGenerationSchema = z.object({
  projectTitle: z.string().min(1, "Project title is required"),
  logline: z.string().optional(),
  description: z.string().optional(),
  genre: z.string().min(1, "Genre is required"),
  targetedRating: z.enum(['G', 'PG', 'PG-13', 'R', 'NC-17']),
  storyLocation: z.string().optional(),
  concept: z.string().optional(),
  specialRequest: z.string().optional(),
  projectId: z.number().optional()
});

export function registerScriptGenerationRoutes(app: any) {
  
  /**
   * Generate a new script using AI with streaming
   */
  app.post('/api/script-generation/generate', async (req: Request, res: Response) => {
    try {
      const validatedData = scriptGenerationSchema.parse(req.body);
      
      console.log('[Script Generation] Starting generation for:', validatedData.projectTitle);
      
      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });
      
      let accumulatedScript = '';
      let tokenCount = 0;
      
      // Custom callback to stream progress
      const progressCallback = (chunk: string, tokens: number) => {
        accumulatedScript += chunk;
        tokenCount = tokens;
        
        // Send progress update with minimal data to avoid JSON truncation
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          tokenCount: tokenCount,
          hasNewContent: true
        })}\n\n`);
        
        // Send the actual content in a separate, simpler event
        const chunkLines = chunk.split('\n');
        for (const line of chunkLines) {
          if (line.trim()) {
            res.write(`data: ${JSON.stringify({
              type: 'content',
              line: line
            })}\n\n`);
          }
        }
      };
      
      // Generate the script using AI with streaming
      const generatedScript = await generateScript(validatedData as ScriptGenerationRequest, progressCallback);
      
      // If projectId is provided, update the project with the generated script
      if (validatedData.projectId) {
        await db
          .update(projects)
          .set({ 
            scriptContent: generatedScript,
            updatedAt: new Date()
          })
          .where(eq(projects.id, validatedData.projectId));
        
        console.log(`[Script Generation] Updated project ${validatedData.projectId} with generated script`);
      }
      
      // Send completion event
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        script: generatedScript,
        tokenCount: tokenCount,
        success: true
      })}\n\n`);
      
      res.end();
      
    } catch (error: any) {
      console.error('[Script Generation] Error:', error.message);
      
      // Send error event
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error.message
      })}\n\n`);
      
      res.end();
    }
  });

  /**
   * Get script generation templates and presets
   */
  app.get('/api/script-generation/templates', async (req: Request, res: Response) => {
    try {
      const templates = {
        genres: [
          'Action',
          'Adventure',
          'Comedy',
          'Drama',
          'Horror',
          'Romance',
          'Sci-Fi',
          'Thriller',
          'Fantasy',
          'Mystery',
          'Crime',
          'Western',
          'War',
          'Biography',
          'Documentary'
        ],
        ratings: [
          { value: 'G', label: 'G - General Audiences' },
          { value: 'PG', label: 'PG - Parental Guidance' },
          { value: 'PG-13', label: 'PG-13 - Parents Strongly Cautioned' },
          { value: 'R', label: 'R - Restricted' },
          { value: 'NC-17', label: 'NC-17 - Adults Only' }
        ],
        samplePrompts: [
          {
            genre: 'Action',
            logline: 'A retired special forces operative must rescue his daughter from international terrorists.',
            concept: 'High-octane action sequences with emotional father-daughter relationship at the core.'
          },
          {
            genre: 'Comedy',
            logline: 'Two mismatched roommates accidentally become viral internet sensations.',
            concept: 'Modern comedy exploring social media culture and unlikely friendships.'
          },
          {
            genre: 'Drama',
            logline: 'A struggling artist discovers a family secret that changes everything.',
            concept: 'Character-driven story about identity, family, and personal growth.'
          }
        ]
      };
      
      res.json({
        success: true,
        templates
      });
      
    } catch (error: any) {
      console.error('[Script Generation] Templates error:', error.message);
      res.status(500).json({
        success: false,
        error: "Failed to fetch templates"
      });
    }
  });

  /**
   * Validate script generation parameters
   */
  app.post('/api/script-generation/validate', async (req: Request, res: Response) => {
    try {
      const validatedData = scriptGenerationSchema.parse(req.body);
      
      res.json({
        success: true,
        message: "Parameters are valid",
        estimatedLength: "90-120 pages",
        estimatedTime: "5-10 minutes"
      });
      
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: "Invalid parameters",
        details: error.errors
      });
    }
  });

  /**
   * Get script generation status/progress
   */
  app.get('/api/script-generation/status/:jobId', async (req: Request, res: Response) => {
    try {
      // For now, this is a simple implementation
      // In a production environment, you might want to track generation jobs
      res.json({
        success: true,
        status: 'completed',
        progress: 100
      });
      
    } catch (error: any) {
      console.error('[Script Generation] Status error:', error.message);
      res.status(500).json({
        success: false,
        error: "Failed to get generation status"
      });
    }
  });

  /**
   * Export script as PDF
   */
  app.post('/api/script-generation/export-pdf', async (req: Request, res: Response) => {
    try {
      const { title, content, genre, logline } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      // Create formatted script content for PDF
      const formattedContent = `${title.toUpperCase()}

${logline ? `Logline: ${logline}\n` : ''}${genre ? `Genre: ${genre}\n` : ''}

${content}`;

      // Create a simple text-based PDF using a basic PDF structure
      const pdfContent = createSimplePDF(title, formattedContent);
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '_')}_screenplay.pdf"`);
      res.setHeader('Content-Length', pdfContent.length);
      
      // Send the PDF content
      res.end(pdfContent);
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      res.status(500).json({ 
        error: 'Failed to export PDF',
        details: error.message 
      });
    }
  });
}

/**
 * Create a simple PDF document with proper formatting
 */
function createSimplePDF(title: string, content: string): Buffer {
  // Clean and format content for PDF
  const cleanContent = content
    .replace(/[()\\]/g, '\\$&')  // Escape PDF special characters
    .replace(/\r\n/g, '\n')      // Normalize line endings
    .replace(/\r/g, '\n');       // Normalize line endings
  
  const lines = cleanContent.split('\n');
  const maxLinesPerPage = 45;
  const pages = [];
  
  // Split content into pages
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage));
  }
  
  if (pages.length === 0) {
    pages.push([]);
  }

  // Build PDF content
  let pdfContent = '%PDF-1.4\n';
  let objectCount = 1;
  const objectOffsets = [];
  
  // Record offset and add object
  const addObject = (obj: string) => {
    objectOffsets[objectCount - 1] = pdfContent.length;
    pdfContent += `${objectCount} 0 obj\n${obj}\nendobj\n\n`;
    objectCount++;
  };

  // Catalog
  addObject(`<<
/Type /Catalog
/Pages 2 0 R
>>`);

  // Pages object
  const pageRefs = pages.map((_, i) => `${3 + i} 0 R`).join(' ');
  addObject(`<<
/Type /Pages
/Kids [${pageRefs}]
/Count ${pages.length}
>>`);

  // Create page objects and content streams
  const contentObjStart = 3 + pages.length;
  
  pages.forEach((pageLines, pageIndex) => {
    // Page object
    addObject(`<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Resources <<
/Font <<
/F1 ${contentObjStart + pages.length} 0 R
>>
>>
/Contents ${contentObjStart + pageIndex} 0 R
>>`);
  });

  // Content streams for each page
  pages.forEach((pageLines, pageIndex) => {
    let yPos = 720;
    let streamContent = 'BT\n/F1 12 Tf\n72 720 Td\n';
    
    // Add title on first page
    if (pageIndex === 0) {
      streamContent += `(${title.toUpperCase()}) Tj\n0 -24 Td\n`;
      yPos -= 24;
    }
    
    // Add content lines
    pageLines.forEach(line => {
      if (line.trim()) {
        streamContent += `(${line}) Tj\n0 -14 Td\n`;
      } else {
        streamContent += `0 -14 Td\n`;
      }
      yPos -= 14;
    });
    
    streamContent += 'ET';
    
    addObject(`<<
/Length ${streamContent.length}
>>
stream
${streamContent}
endstream`);
  });

  // Font object
  addObject(`<<
/Type /Font
/Subtype /Type1
/BaseFont /Courier
>>`);

  // Cross-reference table
  const xrefPos = pdfContent.length;
  pdfContent += 'xref\n';
  pdfContent += `0 ${objectCount}\n`;
  pdfContent += '0000000000 65535 f \n';
  
  objectOffsets.forEach(offset => {
    pdfContent += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });

  // Trailer
  pdfContent += `trailer
<<
/Size ${objectCount}
/Root 1 0 R
>>
startxref
${xrefPos}
%%EOF`;

  return Buffer.from(pdfContent, 'utf8');
}