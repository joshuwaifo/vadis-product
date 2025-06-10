/**
 * Script Content Optimization Routes
 * Ensures extracted script text is permanently saved for efficient reuse
 */
import { Request, Response } from 'express';
import { db } from './db';
import { projects } from '../shared/schema';
import { eq } from 'drizzle-orm';

export function registerScriptOptimizationRoutes(app: any) {
  /**
   * Fix script extraction for a specific project
   * Permanently saves extracted text to database
   */
  app.post('/api/script-optimization/fix-extraction/:projectId', async (req: Request, res: Response) => {
    const { projectId } = req.params;
    
    try {
      console.log(`Starting script extraction fix for project ${projectId}`);
      
      // Get project data
      const project = await db.select().from(projects).where(eq(projects.id, parseInt(projectId))).limit(1);
      
      if (!project.length) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const projectData = project[0];
      
      // Check if already extracted
      if (projectData.scriptContent && 
          !projectData.scriptContent.startsWith('PDF_UPLOADED:') && 
          projectData.scriptContent.length > 100) {
        return res.json({ 
          success: true, 
          message: 'Script content already extracted',
          contentLength: projectData.scriptContent.length 
        });
      }

      if (!projectData.pdfFileData) {
        return res.status(400).json({ error: 'No PDF data available for extraction' });
      }

      // Extract text using PDF service
      const { extractTextAndPageCount } = await import('./services/pdf-text-extractor');
      const pdfBuffer = Buffer.from(projectData.pdfFileData, 'base64');
      
      console.log(`Extracting text from ${pdfBuffer.length} byte PDF buffer...`);
      const result = await extractTextAndPageCount(pdfBuffer);
      
      if (!result.text || result.text.length < 100) {
        return res.status(400).json({ error: 'PDF extraction produced insufficient text content' });
      }

      console.log(`Extraction successful: ${result.text.length} characters, ${result.pageCount} pages`);
      
      // Update database with extracted content
      await db.update(projects)
        .set({ 
          scriptContent: result.text,
          pageCount: result.pageCount,
          updatedAt: new Date()
        })
        .where(eq(projects.id, parseInt(projectId)));
      
      console.log(`Database updated successfully for project ${projectId}`);
      
      // Verify the update
      const verification = await db.select({ 
        scriptContent: projects.scriptContent,
        pageCount: projects.pageCount 
      }).from(projects).where(eq(projects.id, parseInt(projectId))).limit(1);
      
      if (verification[0]?.scriptContent && !verification[0].scriptContent.startsWith('PDF_UPLOADED:')) {
        res.json({
          success: true,
          message: 'Script content extracted and saved successfully',
          contentLength: result.text.length,
          pageCount: result.pageCount,
          verified: true
        });
      } else {
        res.status(500).json({ 
          error: 'Database update verification failed',
          extracted: true,
          saved: false
        });
      }
      
    } catch (error: any) {
      console.error('Script extraction fix failed:', error);
      res.status(500).json({ 
        error: 'Script extraction failed',
        details: error.message 
      });
    }
  });

  /**
   * Check extraction status for a project
   */
  app.get('/api/script-optimization/status/:projectId', async (req: Request, res: Response) => {
    const { projectId } = req.params;
    
    try {
      const project = await db.select({
        id: projects.id,
        title: projects.title,
        scriptContent: projects.scriptContent,
        pageCount: projects.pageCount,
        pdfFileData: projects.pdfFileData
      }).from(projects).where(eq(projects.id, parseInt(projectId))).limit(1);
      
      if (!project.length) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const projectData = project[0];
      const hasExtractedText = projectData.scriptContent && 
                              !projectData.scriptContent.startsWith('PDF_UPLOADED:') && 
                              projectData.scriptContent.length > 100;
      
      res.json({
        projectId: projectData.id,
        title: projectData.title,
        hasExtractedText,
        contentLength: hasExtractedText ? projectData.scriptContent?.length || 0 : 0,
        pageCount: projectData.pageCount || 0,
        hasPdfData: !!projectData.pdfFileData,
        status: hasExtractedText ? 'extracted' : 'needs_extraction',
        optimized: hasExtractedText
      });
      
    } catch (error: any) {
      console.error('Status check failed:', error);
      res.status(500).json({ 
        error: 'Status check failed',
        details: error.message 
      });
    }
  });
}