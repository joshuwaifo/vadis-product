/**
 * Direct script text extraction utility
 * Ensures extracted text is permanently saved to database
 */
import { db } from './db';
import { projects } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function extractScriptTextForProject(projectId: number): Promise<void> {
  console.log(`Starting script extraction for project ${projectId}`);
  
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
    console.log(`Project ${projectId} already has extracted text (${projectData.scriptContent.length} characters)`);
    return;
  }

  // Extract from PDF
  if (projectData.pdfFileData) {
    try {
      console.log('Importing PDF text extractor...');
      const { extractTextAndPageCount } = await import('./services/pdf-text-extractor');
      
      console.log('Creating PDF buffer...');
      const pdfBuffer = Buffer.from(projectData.pdfFileData, 'base64');
      
      console.log('Extracting text from PDF...');
      const result = await extractTextAndPageCount(pdfBuffer);
      
      if (result.text && result.text.length > 100) {
        console.log(`Successfully extracted ${result.text.length} characters from PDF`);
        
        // Save to database
        await db.update(projects)
          .set({ 
            scriptContent: result.text,
            pageCount: result.pageCount,
            updatedAt: new Date()
          })
          .where(eq(projects.id, projectId));
        
        console.log(`Saved extracted text to database for project ${projectId}`);
        
        // Verify the save
        const verification = await db.select({ scriptContent: projects.scriptContent })
          .from(projects)
          .where(eq(projects.id, projectId))
          .limit(1);
        
        if (verification[0]?.scriptContent && !verification[0].scriptContent.startsWith('PDF_UPLOADED:')) {
          console.log(`Verification successful: Text saved to database`);
        } else {
          console.error(`Verification failed: Database still contains PDF reference`);
        }
      } else {
        console.error('Extracted text is too short or empty');
      }
    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw error;
    }
  } else {
    console.error('No PDF data found for project');
  }
}

// Run the extraction if this file is executed directly
if (require.main === module) {
  const projectId = parseInt(process.argv[2] || '23');
  extractScriptTextForProject(projectId)
    .then(() => {
      console.log('Script extraction completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script extraction failed:', error);
      process.exit(1);
    });
}

export { extractScriptTextForProject };