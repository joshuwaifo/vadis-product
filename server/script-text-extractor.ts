/**
 * Dedicated script text extraction service
 * Ensures extracted text is permanently saved to database
 */
import { db } from './db';
import { projects } from '../shared/schema';
import { eq } from 'drizzle-orm';

export async function extractAndSaveScriptText(projectId: number): Promise<string> {
  // Get project data
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  
  if (!project.length) {
    throw new Error('Project not found');
  }

  const projectData = project[0];
  
  // Check if we already have extracted text
  if (projectData.scriptContent && 
      !projectData.scriptContent.startsWith('PDF_UPLOADED:') && 
      projectData.scriptContent.length > 100) {
    console.log(`Using existing extracted text (${projectData.scriptContent.length} characters)`);
    return projectData.scriptContent;
  }

  // Extract from PDF if needed
  if (projectData.scriptContent && projectData.scriptContent.startsWith('PDF_UPLOADED:')) {
    if (!projectData.pdfFileData) {
      throw new Error('No PDF data available for extraction');
    }

    console.log('Extracting text from stored PDF data');
    
    try {
      // Use the reliable PDF text extractor
      const { extractTextAndPageCount } = await import('./services/pdf-text-extractor');
      const pdfBuffer = Buffer.from(projectData.pdfFileData, 'base64');
      
      console.log(`Starting PDF extraction for buffer of ${pdfBuffer.length} bytes`);
      const result = await extractTextAndPageCount(pdfBuffer);
      console.log(`PDF extraction completed. Text length: ${result.text?.length || 0}, Pages: ${result.pageCount}`);
      
      if (result.text && result.text.length > 100) {
        console.log(`PDF extraction successful: ${result.text.length} characters from ${result.pageCount} pages`);
        
        // Save to database immediately
        await db.update(projects)
          .set({ 
            scriptContent: result.text,
            pageCount: result.pageCount,
            updatedAt: new Date()
          })
          .where(eq(projects.id, projectId));
        
        console.log(`Successfully saved extracted text to database for project ${projectId}`);
        
        // Verify the database update
        const verification = await db.select({ 
          scriptContent: projects.scriptContent,
          pageCount: projects.pageCount 
        })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);
        
        if (verification[0]?.scriptContent && !verification[0].scriptContent.startsWith('PDF_UPLOADED:')) {
          console.log(`Database verification successful: ${verification[0].scriptContent.length} characters saved`);
          return result.text;
        } else {
          console.error('Database verification failed - script content not properly saved');
          throw new Error('Database update verification failed');
        }
      } else {
        throw new Error('PDF extraction produced insufficient text content');
      }
    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  throw new Error('No script content available for extraction');
}