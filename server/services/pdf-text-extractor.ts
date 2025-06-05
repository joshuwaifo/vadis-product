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
  
  // Method 1: Use Gemini AI for comprehensive extraction (most reliable for complete scripts)
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not available');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Convert PDF buffer to base64 for Gemini
    const base64Data = pdfBuffer.toString('base64');
    
    const estimatedPages = Math.floor(pdfBuffer.length / 2000); // More conservative estimate
    
    const prompt = `You are a professional script digitization service. Extract the COMPLETE text content from this PDF screenplay document with absolute precision. This is a ${estimatedPages}-page professional film script that must be extracted in its entirety.

MANDATORY EXTRACTION PROTOCOL:
- Extract text from EVERY SINGLE PAGE without exception (page 1 through page ${estimatedPages})
- Include EVERY scene heading (INT./EXT./FADE IN/FADE OUT/CUT TO/MONTAGE/etc.)
- Include EVERY character name (usually in ALL CAPS)
- Include EVERY line of dialogue word-for-word
- Include EVERY action line and stage direction
- Include ALL parentheticals and voice-over directions
- Include ALL scene transitions and camera directions
- Include ALL page breaks and scene numbers if present
- Preserve the exact screenplay formatting structure

CRITICAL REQUIREMENTS:
- This is NOT a summary task - extract the complete raw text
- Do NOT skip any pages, scenes, or dialogue
- Do NOT truncate long scenes or monologues
- Do NOT paraphrase or rewrite any content
- Process the ENTIRE document from first page to last page
- The output should be the complete screenplay text (typically 20,000-30,000 words for a feature film)

Return the complete extracted screenplay text exactly as it appears, with proper scene breaks and formatting preserved.`;
    
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
    
    if (extractedText && extractedText.length > 5000) {
      console.log(`Successfully extracted ${extractedText.length} characters using Gemini AI`);
      return extractedText;
    } else {
      console.log(`Gemini AI extracted only ${extractedText?.length || 0} characters, trying pdf-parse fallback...`);
    }
  } catch (error) {
    console.error('Gemini AI extraction failed:', error.message);
  }
  
  // Method 2: Try pdf-parse as fallback
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