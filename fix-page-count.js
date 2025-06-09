// Quick script to count actual pages and update the database
import pkg from 'pg';
const { Pool } = pkg;

async function fixPageCount() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Get the script content
    const result = await pool.query('SELECT id, script_content FROM projects WHERE id = 16');
    const project = result.rows[0];
    
    if (!project || !project.script_content) {
      console.log('No script content found');
      return;
    }
    
    // Count pages - look for page breaks or estimate based on content length
    const content = project.script_content;
    
    // Method 1: Count explicit page numbers if they exist
    const pageNumberMatches = content.match(/^\s*\d+\s*$/gm);
    let pageCount = pageNumberMatches ? pageNumberMatches.length : 0;
    
    // Method 2: If no explicit page numbers, estimate based on industry standard
    // Average screenplay page has about 250 words, 55 lines, or ~3000 characters
    if (pageCount === 0) {
      const lines = content.split('\n').length;
      pageCount = Math.max(1, Math.ceil(lines / 55)); // 55 lines per page average
    }
    
    console.log(`Calculated page count: ${pageCount}`);
    
    // Update the database
    await pool.query('UPDATE projects SET page_count = $1 WHERE id = $2', [pageCount, 16]);
    
    console.log(`Updated project 16 with page count: ${pageCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

fixPageCount();