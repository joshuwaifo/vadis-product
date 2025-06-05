/**
 * PDF Text Extraction Service
 * Provides robust PDF text extraction with fallback methods
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractPDFTextPaginated } from './paginated-pdf-extractor';

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
  
  // Method 1: Use paginated extraction for complete coverage
  try {
    console.log('Attempting paginated PDF extraction for complete content capture...');
    const paginatedText = await extractPDFTextPaginated(pdfBuffer);
    
    if (paginatedText && paginatedText.length > 50000) {
      console.log(`Paginated extraction successful: ${paginatedText.length} characters`);
      return paginatedText;
    } else {
      console.log(`Paginated extraction yielded ${paginatedText?.length || 0} characters, trying single-pass method...`);
    }
  } catch (error) {
    console.error('Paginated extraction failed:', error.message);
  }

  // Method 2: Fallback to single-pass Gemini AI extraction
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not available');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.1
      }
    });
    
    const base64Data = pdfBuffer.toString('base64');
    const estimatedPages = Math.floor(pdfBuffer.length / 2000);
    
    const prompt = `Extract ALL text content from this ${estimatedPages}-page screenplay PDF. This is a professional film script that must be digitized completely.

CRITICAL REQUIREMENTS:
- Extract EVERY SINGLE WORD from all ${estimatedPages} pages
- Include ALL scene headers, character names, dialogue, and action lines
- Do NOT summarize or paraphrase - extract verbatim text
- Do NOT skip any pages or scenes
- Output the complete raw screenplay text (expect 150,000+ characters)

This is a full-length feature screenplay. Extract the complete text now:`;
    
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
    
    if (extractedText && extractedText.length > 10000) {
      console.log(`Single-pass Gemini extraction: ${extractedText.length} characters`);
      return extractedText;
    }
  } catch (error) {
    console.error('Single-pass Gemini extraction failed:', error.message);
  }
  
  // Method 3: Try pdf-parse as final fallback
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(pdfBuffer);
    
    const extractedText = pdfData?.text || "";
    
    if (extractedText.length > 1000) {
      console.log(`Successfully extracted ${extractedText.length} characters using pdf-parse`);
      return extractedText;
    }
  } catch (error) {
    console.log('pdf-parse extraction failed:', error.message);
  }
  
  // Final fallback error
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