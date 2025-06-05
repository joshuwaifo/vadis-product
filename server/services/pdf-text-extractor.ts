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
  
  // Method 1: Try pdf-parse first (most reliable server-side method)
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(pdfBuffer, {
      // Enhanced options for better text extraction
      normalizeWhitespace: false,
      disableCombineTextItems: false,
      max: 0 // Extract all pages
    });
    
    const extractedText = pdfData?.text || "";
    
    if (extractedText.length > 1000) {
      console.log(`Successfully extracted ${extractedText.length} characters using pdf-parse`);
      return extractedText;
    } else {
      console.log(`pdf-parse extracted only ${extractedText.length} characters, trying enhanced method...`);
    }
  } catch (error) {
    console.log('pdf-parse extraction failed:', error.message);
  }
  
  // Method 2: Use Gemini AI for comprehensive extraction
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not available');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Convert PDF buffer to base64 for Gemini
    const base64Data = pdfBuffer.toString('base64');
    
    const prompt = `Extract ALL text content from this PDF document completely and accurately. This is a film script/screenplay - extract EVERY scene, dialogue, and stage direction from ALL pages without exception. 

CRITICAL REQUIREMENTS:
- Extract the complete text from every single page (all ${Math.floor(pdfBuffer.length / 1000)} pages estimated)
- Preserve all scene headings (INT./EXT./FADE IN/FADE OUT/CUT TO)
- Include all character names and dialogue verbatim
- Include all stage directions and action descriptions
- Maintain proper script formatting structure
- Do not truncate, summarize, or skip any content whatsoever
- Process the entire document from first page to last page
- Output the raw extracted text exactly as it appears in the PDF

Return ONLY the complete extracted text content with no additional commentary, headers, or explanations.`;
    
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
    
    if (extractedText && extractedText.length > 100) {
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