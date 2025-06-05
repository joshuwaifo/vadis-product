/**
 * Script Text Extractor Service
 * Extracts text content from uploaded script files for AI analysis
 */

import { generateContent } from './ai-agents/ai-client';

/**
 * Extract text from PDF using pdf-parse
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid startup issues
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData?.text || "";
    
    if (extractedText.length > 100) {
      console.log("Successfully extracted text from PDF");
      return extractedText;
    }
    
    throw new Error("PDF text extraction yielded insufficient content");
  } catch (error) {
    console.error("PDF text extraction failed:", error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Clean and format script text for AI analysis
 */
export async function formatScriptText(rawText: string): Promise<string> {
  try {
    const prompt = `Format this screenplay text for proper analysis. Ensure scene headings are clear (INT./EXT.), character names are properly formatted, and dialogue is distinct from action lines. Preserve all original content but improve readability:

${rawText.substring(0, 20000)}`;

    const formattedText = await generateContent('gemini-1.5-flash', prompt);
    return formattedText || rawText;
  } catch (error) {
    console.warn("Script formatting failed, using raw text:", error);
    return rawText;
  }
}

/**
 * Process uploaded script file and extract usable text
 */
export async function processScriptFile(fileBuffer: Buffer, fileName: string): Promise<string> {
  const fileExtension = fileName.toLowerCase().split('.').pop();
  
  switch (fileExtension) {
    case 'pdf':
      const pdfText = await extractTextFromPDF(fileBuffer);
      return await formatScriptText(pdfText);
    
    case 'txt':
    case 'fountain':
      const textContent = fileBuffer.toString('utf-8');
      return await formatScriptText(textContent);
    
    default:
      throw new Error(`Unsupported file format: ${fileExtension}`);
  }
}