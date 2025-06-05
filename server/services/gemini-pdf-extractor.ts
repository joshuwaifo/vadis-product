/**
 * Gemini AI PDF Text Extraction Service
 * Based on the Cannes demo implementation for authentic script processing
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface ScriptParsingResult {
  title: string;
  content: string;
  scenes: ExtractedScene[];
}

interface ExtractedScene {
  sceneNumber: number;
  heading: string;
  content: string;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

async function extractTextFromPdf(fileBuffer: Buffer): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Extract all text content from this PDF document. Preserve the original formatting, scene headings, character names, and dialogue structure. Return only the extracted text without any additional commentary.`;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: 'application/pdf'
        }
      }
    ]);
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

async function extractTextFromImage(fileBuffer: Buffer, mimeType: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Extract all text content from this image. If this is a script or screenplay, preserve the formatting, scene headings, character names, and dialogue structure. Return only the extracted text without any additional commentary.`;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: mimeType
        }
      }
    ]);
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini image extraction error:', error);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
}

export async function extractScriptFromPdf(fileBuffer: Buffer, mimeType?: string): Promise<ScriptParsingResult> {
  try {
    // Check if the file is an image or PDF based on mime type
    const isImage = mimeType && mimeType.startsWith('image/');
    
    let extractedText = '';
    
    if (isImage && mimeType) {
      console.log(`Processing uploaded image file with MIME type: ${mimeType}`);
      
      // Use Gemini AI to extract text from image
      extractedText = await extractTextFromImage(fileBuffer, mimeType);
      console.log('Successfully extracted text from image using Gemini AI');
      
      // Log a sample of the extraction
      const truncatedText = extractedText.length > 100 
        ? extractedText.substring(0, 100) + '...' 
        : extractedText;
      console.log('Sample text extracted from image:', truncatedText);
    } else {
      // PDF processing
      console.log('Processing uploaded PDF file with Gemini AI...');
      
      // Use Gemini AI to extract text from PDF
      extractedText = await extractTextFromPdf(fileBuffer);
      console.log('Successfully extracted text from PDF using Gemini AI');
      
      // Log a sample of the extraction
      const truncatedText = extractedText.length > 100 
        ? extractedText.substring(0, 100) + '...' 
        : extractedText;
      console.log('Sample text extracted from PDF:', truncatedText);
    }
    
    // Extract a title from the first few lines
    const lines = extractedText.split('\n').filter((line: string) => line.trim() !== '');
    let title = "Untitled Script";
    
    // Look for a line that might be a title (all caps, early in document)
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line: string = lines[i].trim();
      if (line.toUpperCase() === line && line.length > 3 && !line.includes('EXT.') && !line.includes('INT.')) {
        title = line;
        break;
      }
    }
    
    // Extract scenes from the document
    const scenes = extractScenes(extractedText);
    console.log(`Extracted ${scenes.length} scenes from the uploaded file`);
    
    // If no scenes were found, create some basic ones
    const finalScenes = scenes.length > 0 ? scenes : createFallbackScenes(extractedText);
    
    return {
      title,
      content: extractedText,
      scenes: finalScenes
    };
  } catch (error) {
    console.error('Script processing error:', error);
    
    // Create a fallback response if everything fails
    const fallbackText = "Failed to process the uploaded file. The file may be corrupted or in an unsupported format.";
    
    return {
      title: "Untitled Script",
      content: fallbackText,
      scenes: [{
        sceneNumber: 1,
        heading: "UNTITLED SCENE",
        content: fallbackText
      }]
    };
  }
}

// Fallback method to create scenes if regular scene detection fails
function createFallbackScenes(scriptText: string): ExtractedScene[] {
  const scenes: ExtractedScene[] = [];
  const paragraphs = scriptText.split(/\n\s*\n/);
  
  // Create some scenes based on paragraphs or page breaks
  let sceneNumber = 1;
  let currentContent = '';
  
  // Group paragraphs into scenes (roughly 4-6 paragraphs per scene)
  const paragraphsPerScene = 5;
  
  for (let i = 0; i < paragraphs.length; i++) {
    currentContent += paragraphs[i] + '\n\n';
    
    // Create a new scene every few paragraphs
    if ((i + 1) % paragraphsPerScene === 0 || i === paragraphs.length - 1) {
      scenes.push({
        sceneNumber,
        heading: `SCENE ${sceneNumber}`,
        content: currentContent.trim()
      });
      
      sceneNumber++;
      currentContent = '';
    }
  }
  
  return scenes;
}

function extractScenes(scriptText: string): ExtractedScene[] {
  const sceneHeadingRegex = /\b(?:\d+\.\s*)?(INT\.?|EXT\.?|I\/E\.?|INT\/EXT\.?)[\s\.\-]+(.*?)(?:\s*[-\s]+\s*)(DAY|NIGHT|EVENING|MORNING|AFTERNOON|DUSK|DAWN|LATER|CONTINUOUS|MOMENTS LATER|SAME TIME)?\b/gi;
  const looseNumberedSceneRegex = /^\s*(\d+)[\.\)]\s+(?!INT\.?|EXT\.?|I\/E\.?|INT\/EXT\.?)([^\n]+)$/gim;

  type MatchInfo = { index: number; heading: string };
  const allMatches: MatchInfo[] = [];
  let match: RegExpExecArray | null;

  const seenIndices = new Set<number>();

  // Match standard and semi-standard scene headings
  while ((match = sceneHeadingRegex.exec(scriptText)) !== null) {
    if (!seenIndices.has(match.index)) {
      allMatches.push({
        index: match.index,
        heading: match[0].trim()
      });
      seenIndices.add(match.index);
    }
  }

  // Match scenes that are only numbered like: "1. SOME SCENE LABEL"
  while ((match = looseNumberedSceneRegex.exec(scriptText)) !== null) {
    const fullMatch = match[0].trim();
    if (!/\b(INT\.?|EXT\.?|I\/E\.?)\b/i.test(fullMatch) && !seenIndices.has(match.index)) {
      allMatches.push({
        index: match.index,
        heading: fullMatch
      });
      seenIndices.add(match.index);
    }
  }

  allMatches.sort((a, b) => a.index - b.index);

  const scenes: ExtractedScene[] = [];
  let sceneNumber = 1;
  let lastIndex = 0;

  for (const matchInfo of allMatches) {
    const headingIndex = matchInfo.index;

    if (scenes.length > 0) {
      scenes[scenes.length - 1].content = scriptText.substring(lastIndex, headingIndex).trim();
    }

    scenes.push({
      sceneNumber,
      heading: matchInfo.heading,
      content: ''
    });

    lastIndex = headingIndex + matchInfo.heading.length;
    sceneNumber++;
  }

  // Add final scene content
  if (scenes.length > 0) {
    scenes[scenes.length - 1].content = scriptText.substring(lastIndex).trim();
  } else {
    scenes.push({
      sceneNumber: 1,
      heading: 'UNTITLED SCENE',
      content: scriptText.trim()
    });
  }

  return scenes;
}