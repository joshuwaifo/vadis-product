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
  
  // Method 1: Use Gemini AI with enhanced extraction strategy
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not available');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        maxOutputTokens: 8192, // Maximum possible output
        temperature: 0.1 // Low temperature for precise extraction
      }
    });
    
    // Convert PDF buffer to base64 for Gemini
    const base64Data = pdfBuffer.toString('base64');
    
    const estimatedPages = Math.floor(pdfBuffer.length / 2000);
    
    const prompt = `COMPLETE SCREENPLAY EXTRACTION TASK

You are processing a ${estimatedPages}-page film screenplay PDF. Your task is to extract the ENTIRE script content with perfect accuracy.

EXTRACTION PROTOCOL:
1. Process ALL pages from beginning to end
2. Extract ALL scene headings (INT./EXT./FADE IN/FADE OUT/CUT TO)
3. Extract ALL character names (typically in CAPS)
4. Extract ALL dialogue lines verbatim
5. Extract ALL action descriptions and stage directions
6. Extract ALL parentheticals and voice-over text
7. Extract ALL scene transitions and camera directions

OUTPUT REQUIREMENTS:
- Return the complete screenplay text
- Maintain original formatting structure
- Include all content from every page
- Do not summarize, truncate, or skip any text
- This should be the full script (typically 15,000-40,000 words)

Begin extraction now - output the complete screenplay text:`;
    
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
    
    // Check if we got a substantial extraction
    if (extractedText && extractedText.length > 10000) {
      console.log(`Successfully extracted ${extractedText.length} characters using Gemini AI (enhanced)`);
      return extractedText;
    } else {
      console.log(`Gemini AI extracted only ${extractedText?.length || 0} characters, trying multi-pass extraction...`);
      
      // Try a different approach with explicit instruction
      const fallbackPrompt = `Extract the complete text from this screenplay PDF. Return every single word from the document, including all scene headers, character names, dialogue, and action descriptions. Do not skip any content. Output the full screenplay text now:`;
      
      const fallbackResult = await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: "application/pdf"
          }
        },
        fallbackPrompt
      ]);
      
      const fallbackResponse = await fallbackResult.response;
      const fallbackText = fallbackResponse.text();
      
      if (fallbackText && fallbackText.length > extractedText?.length) {
        console.log(`Fallback extraction succeeded with ${fallbackText.length} characters`);
        return fallbackText;
      }
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