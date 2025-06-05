/**
 * PDF Text Extraction Service
 * Provides robust PDF text extraction with fallback methods
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

interface PDFExtractionResult {
  text: string;
  method: 'pdf-parse' | 'gemini-ai' | 'fallback';
  success: boolean;
}

/**
 * Extract text using PDF.js with enhanced text processing
 */
async function extractWithPDFJS(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log('Attempting PDF.js extraction...');
    
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      verbosity: 0
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    console.log(`PDF has ${pdf.numPages} pages`);
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Extract text items and reconstruct with spacing
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      fullText += pageText + '\n\n';
      
      if (pageNum % 10 === 0) {
        console.log(`Processed ${pageNum}/${pdf.numPages} pages...`);
      }
    }
    
    console.log(`PDF.js extracted ${fullText.length} characters from ${pdf.numPages} pages`);
    return fullText.trim();
    
  } catch (error) {
    console.log('PDF.js extraction failed:', error.message);
    throw error;
  }
}

/**
 * Extract text from PDF buffer using multiple methods
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  console.log(`Starting PDF text extraction from buffer (${pdfBuffer.length} bytes)`);
  
  // Method 1: Try PDF.js first (most reliable for text extraction)
  try {
    const extractedText = await extractWithPDFJS(pdfBuffer);
    if (extractedText.length > 500) {
      console.log(`Successfully extracted ${extractedText.length} characters using PDF.js`);
      return extractedText;
    }
  } catch (error) {
    console.log('PDF.js extraction failed, trying pdf-parse...');
  }
  
  // Method 2: Try pdf-parse as backup
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData?.text || "";
    
    if (extractedText.length > 500) {
      console.log(`Successfully extracted ${extractedText.length} characters using pdf-parse`);
      return extractedText;
    }
  } catch (error) {
    console.log('pdf-parse extraction failed, trying Gemini AI...');
  }
  
  // Method 3: Use Gemini AI for complex PDFs
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not available');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Convert PDF buffer to base64 for Gemini
    const base64Data = pdfBuffer.toString('base64');
    
    const prompt = `Extract ALL text content from this PDF document completely and accurately. This is a film script/screenplay - extract EVERY scene, dialogue, and stage direction from ALL pages without exception. 

Key requirements:
- Extract the complete text from every single page
- Preserve all scene headings (INT./EXT./FADE IN/FADE OUT)
- Include all character names and dialogue
- Maintain proper script formatting structure
- Do not truncate, summarize, or skip any content
- Output the raw extracted text exactly as it appears

Return only the extracted text content with no additional commentary.`;
    
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
  
  // Method 4: Fallback error
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