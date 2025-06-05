/**
 * PDF Text Extraction Service
 * 
 * Handles extraction of text content from PDF files for script analysis.
 * Supports multiple extraction methods with fallback handling.
 */

import fs from 'fs';
import path from 'path';

interface PDFExtractionResult {
  text: string;
  pageCount: number;
  metadata?: any;
  extractionMethod: string;
}

export class PDFTextExtractor {
  
  /**
   * Extract text from PDF file using pdf-parse library
   */
  async extractWithPdfParse(filePath: string): Promise<PDFExtractionResult> {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const pdfBuffer = fs.readFileSync(filePath);
      
      const data = await pdfParse(pdfBuffer, {
        // Options to improve text extraction
        normalizeWhitespace: false,
        disableCombineTextItems: false
      });
      
      return {
        text: data.text,
        pageCount: data.numpages,
        metadata: data.metadata,
        extractionMethod: 'pdf-parse'
      };
    } catch (error) {
      throw new Error(`PDF-Parse extraction failed: ${error.message}`);
    }
  }

  /**
   * Basic text extraction fallback method
   */
  async extractBasicText(filePath: string): Promise<PDFExtractionResult> {
    try {
      // Simple PDF content extraction attempt
      const buffer = fs.readFileSync(filePath);
      const text = buffer.toString('utf8');
      
      // Look for readable text patterns
      const extractedText = text.replace(/[^\x20-\x7E\n\r]/g, '');
      
      if (extractedText.length < 100) {
        throw new Error('Insufficient text content extracted');
      }
      
      return {
        text: extractedText,
        pageCount: 1,
        extractionMethod: 'basic-fallback'
      };
    } catch (error) {
      throw new Error(`Basic extraction failed: ${error.message}`);
    }
  }

  /**
   * Main extraction method with fallback handling
   */
  async extractText(filePath: string): Promise<PDFExtractionResult> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`PDF file not found: ${filePath}`);
    }

    const extractionMethods = [
      () => this.extractWithPdfParse(filePath),
      () => this.extractBasicText(filePath)
    ];

    let lastError: Error | null = null;

    for (const method of extractionMethods) {
      try {
        const result = await method();
        
        // Validate extraction quality
        if (result.text && result.text.length > 100) {
          console.log(`Successfully extracted ${result.text.length} characters using ${result.extractionMethod}`);
          return result;
        }
      } catch (error) {
        console.log(`Extraction method failed: ${error.message}`);
        lastError = error;
        continue;
      }
    }

    throw new Error(`All PDF extraction methods failed. Last error: ${lastError?.message}`);
  }

  /**
   * Find and extract from available PDF files
   */
  async findAndExtractScript(projectTitle?: string): Promise<PDFExtractionResult> {
    const possiblePaths = [
      'test.pdf',
      'test_improved.pdf',
      'Pulp Fiction.pdf',
      ...(projectTitle ? [`${projectTitle}.pdf`] : [])
    ];

    for (const pdfPath of possiblePaths) {
      try {
        if (fs.existsSync(pdfPath)) {
          console.log(`Attempting to extract text from ${pdfPath}`);
          const result = await this.extractText(pdfPath);
          return result;
        }
      } catch (error) {
        console.log(`Failed to extract from ${pdfPath}: ${error.message}`);
        continue;
      }
    }

    throw new Error('No readable PDF files found for text extraction');
  }

  /**
   * Clean and format extracted script text
   */
  cleanScriptText(rawText: string): string {
    return rawText
      // Remove excessive whitespace
      .replace(/\s{3,}/g, '\n\n')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      // Remove page numbers and headers/footers
      .replace(/^\d+\s*$/gm, '')
      // Clean up common PDF artifacts
      .replace(/[^\x20-\x7E\n]/g, '')
      .trim();
  }
}

export const pdfTextExtractor = new PDFTextExtractor();