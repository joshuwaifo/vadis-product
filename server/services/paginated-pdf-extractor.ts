/**
 * Paginated PDF Text Extraction Service
 * Processes large PDFs by extracting text in smaller page segments
 * to overcome AI model output length limitations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PageExtraction {
  pageRange: string;
  content: string;
  characterCount: number;
}

export interface PaginatedExtractionResult {
  totalPages: number;
  totalCharacters: number;
  pages: PageExtraction[];
  combinedText: string;
}

/**
 * Extract PDF text using paginated approach for complete coverage
 */
export async function extractPDFTextPaginated(pdfBuffer: Buffer): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    console.log('GEMINI_API_KEY not available, falling back to pdf-parse');
    return extractWithPdfParse(pdfBuffer);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.1
    }
  });

  const estimatedPages = Math.floor(pdfBuffer.length / 2000);
  const base64Data = pdfBuffer.toString('base64');
  
  console.log(`Starting paginated extraction for ${estimatedPages}-page PDF`);
  
  // Extract in page segments using parallel processing
  const pageSegments = calculatePageSegments(estimatedPages);
  console.log(`Processing ${pageSegments.length} segments in parallel for faster extraction`);
  
  // Process segments in parallel with controlled concurrency
  const maxConcurrency = 4; // Process 4 segments simultaneously
  const extractions: PageExtraction[] = [];
  
  for (let i = 0; i < pageSegments.length; i += maxConcurrency) {
    const batch = pageSegments.slice(i, i + maxConcurrency);
    console.log(`Processing batch ${Math.floor(i / maxConcurrency) + 1}/${Math.ceil(pageSegments.length / maxConcurrency)} (${batch.length} segments)`);
    
    const batchPromises = batch.map(async (segment) => {
      try {
        console.log(`Extracting pages ${segment.start}-${segment.end}`);
        
        const prompt = `Extract complete text from pages ${segment.start} to ${segment.end} of this screenplay PDF.

EXTRACTION REQUIREMENTS:
- Extract ALL text from pages ${segment.start} through ${segment.end} only
- Include scene headers, character names, dialogue, and action lines
- Maintain exact formatting and line breaks
- Output raw text content without any analysis or summary
- This is ${segment.end - segment.start + 1} pages of a ${estimatedPages}-page screenplay

Extract the complete text from pages ${segment.start}-${segment.end}:`;

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
          console.log(`Extracted ${extractedText.length} characters from pages ${segment.start}-${segment.end}`);
          return {
            pageRange: `${segment.start}-${segment.end}`,
            content: extractedText,
            characterCount: extractedText.length,
            segmentOrder: segment.start // For proper ordering
          };
        } else {
          console.log(`Low extraction for pages ${segment.start}-${segment.end}: ${extractedText?.length || 0} characters`);
          return null;
        }
        
      } catch (error) {
        console.error(`Error extracting pages ${segment.start}-${segment.end}:`, error.message);
        return null;
      }
    });
    
    // Wait for batch to complete
    const batchResults = await Promise.all(batchPromises);
    
    // Add successful extractions to results
    batchResults.forEach(result => {
      if (result) {
        extractions.push(result);
      }
    });
    
    // Brief pause between batches to respect rate limits
    if (i + maxConcurrency < pageSegments.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // Sort extractions by page order to maintain sequence
  extractions.sort((a, b) => (a as any).segmentOrder - (b as any).segmentOrder);
  
  // Combine all extracted text
  const combinedText = extractions.map(e => e.content).join('\n\n');
  const totalCharacters = combinedText.length;
  
  console.log(`Paginated extraction complete: ${totalCharacters} total characters from ${extractions.length} segments`);
  
  if (totalCharacters > 50000) {
    return combinedText;
  } else {
    console.log('Paginated extraction yielded insufficient content, trying fallback');
    return extractWithPdfParse(pdfBuffer);
  }
}

/**
 * Calculate optimal page segments for extraction
 */
function calculatePageSegments(totalPages: number): Array<{ start: number; end: number }> {
  const segments: Array<{ start: number; end: number }> = [];
  const pagesPerSegment = Math.min(15, Math.ceil(totalPages / 8)); // Extract in 8-15 page chunks
  
  for (let start = 1; start <= totalPages; start += pagesPerSegment) {
    const end = Math.min(start + pagesPerSegment - 1, totalPages);
    segments.push({ start, end });
  }
  
  return segments;
}

/**
 * Fallback extraction using pdf-parse
 */
async function extractWithPdfParse(pdfBuffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(pdfBuffer);
    console.log(`PDF-parse extracted ${data.text.length} characters from ${data.numpages} pages`);
    return data.text;
  } catch (error) {
    console.error('PDF-parse extraction failed:', error.message);
    return '';
  }
}