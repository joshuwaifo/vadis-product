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
    let extractedText = '';
    
    try {
      if (projectData.pdfFileData) {
        console.log('Extracting text from stored PDF data');
        const { extractTextAndPageCount } = await import('./services/pdf-text-extractor');
        const pdfBuffer = Buffer.from(projectData.pdfFileData, 'base64');
        
        const result = await extractTextAndPageCount(pdfBuffer);
        extractedText = result.text;
        
        console.log(`Extracted ${extractedText.length} characters from PDF`);
        
        // Save to database immediately
        await db.update(projects)
          .set({ 
            scriptContent: extractedText,
            pageCount: result.pageCount,
            updatedAt: new Date()
          })
          .where(eq(projects.id, projectId));
        
        console.log(`Successfully saved extracted text to database for project ${projectId}`);
        
        return extractedText;
      }
    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  throw new Error('No script content available for extraction');
}