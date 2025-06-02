/**
 * PDF Service for Vadis Product
 * 
 * Adapted from Cannes Demo to work with multi-user architecture
 * and existing Vadis AI infrastructure
 */

import { generateContent, AIProvider } from './ai-agents/ai-client';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
// Use dynamic import for pdf-parse to avoid startup issues
// import pdfParse from 'pdf-parse';

// --- Helper Functions for File Processing ---

/**
 * Convert buffer to temporary file for AI processing
 */
async function bufferToTempFile(buffer: Buffer, extension: string): Promise<string> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vadis-"));
  const tempFileName = `${uuidv4()}${extension}`;
  const tempFilePath = path.join(tempDir, tempFileName);
  try {
    await fs.promises.writeFile(tempFilePath, buffer);
    return tempFilePath;
  } catch (err) {
    console.error(`Error writing temp file ${tempFilePath}:`, err);
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch {}
    throw err;
  }
}

/**
 * Clean up temporary files
 */
async function cleanupTempFile(filePath: string) {
  try {
    const dirPath = path.dirname(filePath);
    await fs.promises.unlink(filePath);
    await fs.promises.rmdir(dirPath).catch(() => {});
  } catch (cleanupErr) {
    console.warn(`Failed to clean up temp file ${filePath}:`, cleanupErr);
  }
}

/**
 * Extract text from image using existing Vadis analyzeDocument function
 */
async function extractTextFromImage(
  imageBuffer: Buffer,
  mimeType: string,
  provider: AIProvider = 'gemini-1.5-flash'
): Promise<string> {
  try {
    const prompt = "Extract all text content from this image. If it appears to be a film script or screenplay, format it properly with scene headings, action, and dialogue. If no text is visible, describe the image.";
    
    // Convert buffer to base64 for analyzeDocument
    const base64Data = imageBuffer.toString('base64');
    
    // Use the existing analyzeDocument function which handles images
    const { analyzeDocument } = await import('./ai-agents/ai-client');
    const result = await analyzeDocument(provider, base64Data, prompt, mimeType);
    
    console.log("Successfully extracted text from image via Vadis AI.");
    return result;
  } catch (error) {
    console.error("Error extracting text from image with Vadis AI:", error);
    return `Error: Failed to extract text from image. ${error instanceof Error ? error.message : "Unknown AI error"}`;
  }
}

/**
 * Extract text from PDF using pdf-parse and enhance with AI if needed
 */
async function extractTextFromPdf(
  pdfBuffer: Buffer,
  provider: AIProvider = 'gemini-1.5-flash'
): Promise<string> {
  try {
    // Dynamic import to avoid startup issues with pdf-parse
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData?.text || "";
    
    if (extractedText.length > 100) {
      console.log("Successfully extracted text from PDF using pdf-parse.");
      return extractedText;
    }
    
    console.log("pdf-parse extraction insufficient, trying AI for enhancement...");
    
    const prompt = `The following text was extracted from a PDF, but might be incomplete or badly formatted. Please analyze it. If it appears to be a film script or screenplay, reformat it accurately with scene headings (INT./EXT.), action lines, character names (centered), and dialogue. If it's not a script, simply clean up the formatting for readability. Preserve as much original content as possible. 

Extracted Text: --- ${extractedText.substring(0, 25000)} --- 

Formatted Output:`;
    
    const result = await generateContent(provider, prompt);
    console.log("Successfully enhanced/extracted PDF text using Vadis AI.");
    return result;
  } catch (error) {
    console.error("Error processing PDF with pdf-parse and/or AI:", error);
    return `Error: Failed to process PDF. ${error instanceof Error ? error.message : "Unknown processing error"}`;
  }
}

// Interface for extracted scene data
export interface ExtractedScene {
  sceneNumber: number;
  heading: string;
  content: string;
}

export interface ScriptParsingResult {
  title: string;
  content: string;
  scenes: ExtractedScene[];
}

/**
 * Extract script content and scenes from PDF or image file
 * Uses the existing Vadis AI infrastructure for document analysis
 */
export async function extractScriptFromPdf(
  fileBuffer: Buffer, 
  mimeType?: string,
  provider: AIProvider = 'gemini-1.5-flash'
): Promise<ScriptParsingResult> {
  try {
    console.log(`Processing uploaded file with MIME type: ${mimeType || 'application/pdf'}`);
    
    let extractedText = '';
    const isImage = mimeType && mimeType.startsWith('image/');
    
    if (isImage && mimeType) {
      extractedText = await extractTextFromImage(fileBuffer, mimeType, provider);
    } else {
      extractedText = await extractTextFromPdf(fileBuffer, provider);
    }
    
    console.log('Successfully extracted text using Vadis AI client');
    
    // Log a sample of the extraction
    const truncatedText = extractedText.length > 100 
      ? extractedText.substring(0, 100) + '...' 
      : extractedText;
    console.log('Sample text extracted:', truncatedText);
    
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

/**
 * Extract scenes from script text using refined regex patterns
 * This is the improved version from Cannes Demo
 */
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

/**
 * Fallback method to create scenes if regular scene detection fails
 */
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

/**
 * Utility function to validate if extracted content looks like a script
 */
export function isValidScriptContent(content: string): boolean {
  if (!content || content.length < 100) return false;
  
  // Check for common script elements
  const hasSceneHeadings = /\b(INT\.?|EXT\.?|I\/E\.?)\s+/i.test(content);
  const hasCharacterNames = /^[A-Z\s]+$/m.test(content);
  const hasDialogue = content.split('\n').some(line => 
    line.trim().length > 0 && 
    !line.match(/^[A-Z\s]+$/) && 
    !line.match(/^\(.*\)$/)
  );
  
  return hasSceneHeadings || (hasCharacterNames && hasDialogue);
}

/**
 * Extract metadata from script content
 */
export function extractScriptMetadata(content: string): {
  estimatedPages: number;
  characterCount: number;
  sceneCount: number;
  genre?: string;
} {
  const scenes = extractScenes(content);
  const lines = content.split('\n');
  
  // Estimate pages (roughly 250 words per page for scripts)
  const wordCount = content.split(/\s+/).length;
  const estimatedPages = Math.ceil(wordCount / 250);
  
  // Count unique character names (all caps lines)
  const characterNames = new Set<string>();
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.toUpperCase() === trimmed && 
        trimmed.length > 2 && 
        trimmed.length < 30 && 
        !trimmed.includes('.') &&
        !trimmed.includes('-')) {
      characterNames.add(trimmed);
    }
  });
  
  return {
    estimatedPages,
    characterCount: characterNames.size,
    sceneCount: scenes.length
  };
}