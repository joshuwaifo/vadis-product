/**
 * Direct script text extraction and database update utility
 * Fixes the Storyboard workflow optimization issue
 */
import { db } from './db';
import { projects } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function fixScriptExtraction(projectId: number): Promise<void> {
  console.log(`Fixing script extraction for project ${projectId}`);
  
  // Get project data
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  
  if (!project.length) {
    throw new Error('Project not found');
  }

  const projectData = project[0];
  
  if (!projectData.pdfFileData) {
    throw new Error('No PDF data available');
  }

  // Extract text using the PDF service
  const { extractTextAndPageCount } = await import('./services/pdf-text-extractor');
  const pdfBuffer = Buffer.from(projectData.pdfFileData, 'base64');
  
  console.log(`Extracting text from ${pdfBuffer.length} byte PDF buffer...`);
  const result = await extractTextAndPageCount(pdfBuffer);
  
  if (result.text && result.text.length > 100) {
    console.log(`Extraction successful: ${result.text.length} characters, ${result.pageCount} pages`);
    
    // Update database with extracted content
    await db.update(projects)
      .set({ 
        scriptContent: result.text,
        pageCount: result.pageCount,
        updatedAt: new Date()
      })
      .where(eq(projects.id, projectId));
    
    console.log(`Database updated successfully for project ${projectId}`);
  } else {
    throw new Error('PDF extraction failed - insufficient text extracted');
  }
}

export { fixScriptExtraction };