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
  
  // Method 1: Enhanced pdf-parse with full document processing
  try {
    const pdfParse = (await import('pdf-parse')).default;
    
    // Configure for maximum extraction
    const options = {
      normalizeWhitespace: false, // Preserve original spacing for screenplay format
      disableCombineTextItems: false,
      max: 0, // Process all pages
      version: 'v1.10.1'
    };
    
    const pdfData = await pdfParse(pdfBuffer, options);
    let extractedText = pdfData?.text || "";
    
    if (extractedText && extractedText.length > 1000) {
      // Clean up text while preserving screenplay structure
      extractedText = extractedText
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Preserve double line breaks for scene transitions
        .replace(/\n{4,}/g, '\n\n\n')
        // Clean up excessive spaces but preserve indentation
        .replace(/[ \t]{3,}/g, '  ')
        .trim();
        
      console.log(`Successfully extracted ${extractedText.length} characters from ${pdfData.numpages} pages using enhanced pdf-parse`);
      return extractedText;
    }
  } catch (error) {
    console.log('Enhanced pdf-parse failed, trying alternative method...');
  }
  
  // Method 2: Use enhanced pdf-parse with better configuration
  try {
    const pdfParse = (await import('pdf-parse')).default;
    
    // Enhanced options for better text extraction
    const options = {
      normalizeWhitespace: true,
      disableCombineTextItems: false,
      max: 0, // Extract all pages
    };
    
    const pdfData = await pdfParse(pdfBuffer, options);
    let extractedText = pdfData?.text || "";
    
    // Clean up the extracted text
    if (extractedText) {
      // Remove excessive whitespace but preserve screenplay formatting
      extractedText = extractedText
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim();
        
      console.log(`Enhanced pdf-parse extracted ${extractedText.length} characters from ${pdfData.numpages} pages`);
      
      if (extractedText.length > 1000) {
        return extractedText;
      }
    }
  } catch (error) {
    console.log('Enhanced pdf-parse failed, trying Gemini AI...');
  }
  
  // Method 3: Use Gemini AI for PDF processing as fallback
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not available');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",  // Use Pro model for better document processing
      generationConfig: {
        maxOutputTokens: 8192,   // Increase output limit
      }
    });
    
    // Convert PDF buffer to base64 for Gemini
    const base64Data = pdfBuffer.toString('base64');
    
    const prompt = `Extract ALL text content from this complete PDF document. This appears to be a screenplay/script document with multiple pages. Please extract every single page of text content, preserving the original formatting including:
- Scene headings (INT./EXT.)
- Character names
- Dialogue
- Action lines
- Page breaks and scene transitions

Return the complete text content from the entire document, not just a summary or excerpt.`;
    
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
      console.log(`Successfully extracted ${extractedText.length} characters using Gemini AI Pro`);
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