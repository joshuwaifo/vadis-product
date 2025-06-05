/**
 * PDF Text Extraction Service
 * Provides robust PDF text extraction with fallback methods
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface PDFExtractionResult {
  text: string;
  method: 'pdf-parse' | 'gemini-ai' | 'fallback';
  success: boolean;
}

/**
 * Extract text from PDF buffer using multiple methods
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  console.log(`Starting PDF text extraction from buffer (${pdfBuffer.length} bytes)`);
  
  // Method 1: Try pdf-parse first
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData?.text || "";
    
    if (extractedText.length > 100) {
      console.log(`Successfully extracted ${extractedText.length} characters using pdf-parse`);
      return extractedText;
    }
  } catch (error) {
    console.log('pdf-parse extraction failed, trying Gemini AI...');
  }
  
  // Method 2: Use Gemini AI for PDF processing
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not available');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Convert PDF buffer to base64 for Gemini
    const base64Data = pdfBuffer.toString('base64');
    
    const prompt = `Extract all text content from this PDF document. If it appears to be a film script or screenplay, preserve the formatting with scene headings (INT./EXT.), character names, and dialogue. Return only the extracted text content.`;
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      },
      prompt
    ]);
    
    const response = await result.response;
    const extractedText = response.text();
    
    if (extractedText && extractedText.length > 50) {
      console.log(`Successfully extracted ${extractedText.length} characters using Gemini AI`);
      return extractedText;
    }
  } catch (error) {
    console.error('Gemini AI extraction failed:', error.message);
  }
  
  // Method 3: Fallback error
  throw new Error('Unable to extract text from PDF using any available method');
}

/**
 * Extract script content from PDF with comprehensive error handling
 */
export async function extractScriptFromPdf(pdfBuffer: Buffer, mimeType: string) {
  try {
    console.log(`Processing PDF file (${pdfBuffer.length} bytes, type: ${mimeType})`);
    
    // Extract text content
    const extractedText = await extractTextFromPDF(pdfBuffer);
    
    if (!extractedText || extractedText.length < 50) {
      throw new Error('Insufficient text content extracted from PDF');
    }
    
    // Basic script title extraction
    const lines = extractedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let title = "Untitled Script";
    
    // Look for title in first few lines
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      if (line.length > 3 && line.length < 100 && 
          !line.match(/^(INT\.|EXT\.|FADE|COPYRIGHT|BY\s+|WRITTEN)/i) &&
          !line.match(/^\d+/) &&
          line.match(/[A-Z]/)) {
        title = line;
        break;
      }
    }
    
    console.log(`Extracted script "${title}" with ${extractedText.length} characters`);
    
    return {
      title,
      content: extractedText,
      success: true
    };
    
  } catch (error) {
    console.error('Script extraction error:', error);
    throw new Error(`Failed to extract script content: ${error.message}`);
  }
}