/**
 * Script Generation Service
 * 
 * AI-powered screenplay generation using Google Gemini
 * Based on ANNEX C Technical Roadmap requirements for script creation
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ScriptGenerationRequest {
  projectTitle: string;
  logline?: string;
  description?: string;
  genre: string;
  targetedRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  storyLocation?: string;
  concept?: string;
  specialRequest?: string;
}

const MODEL_NAME = "gemini-1.5-flash";
const APPROX_TOKENS_PER_CHAR = 0.25;
const MIN_TOTAL_TOKENS = 32000;
const MAX_TOTAL_TOKENS = 48000;
const MAX_ITERATION_TOKENS = 8000;
const CONTEXT_LINES = 20;

function getRatingDescription(rating: string): string {
  switch (rating) {
    case "G":
      return "General Audiences. All ages admitted. No content that would be offensive to parents for viewing by children.";
    case "PG":
      return "Parental Guidance Suggested. Some material may not be suitable for children.";
    case "PG-13":
      return "Parents Strongly Cautioned. Some material may be inappropriate for children under 13.";
    case "R":
      return "Restricted. Children Under 17 Require Accompanying Parent or Adult Guardian.";
    case "NC-17":
      return "Adults Only. No One 17 and Under Admitted.";
    default:
      return "General content guidelines apply.";
  }
}

export async function generateScript(formData: ScriptGenerationRequest): Promise<string> {
  const logPrefix = `[Script Generation - ${formData.projectTitle}]`;
  console.log(`${logPrefix} Starting AI-powered script generation`);

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is required for script generation");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  let fullScriptText = "";
  let estimatedTokensGenerated = 0;
  let iterationCount = 0;
  const ratingDescription = getRatingDescription(formData.targetedRating);

  while (estimatedTokensGenerated < MIN_TOTAL_TOKENS) {
    iterationCount++;
    console.log(`${logPrefix} Iteration ${iterationCount}, tokens: ${estimatedTokensGenerated}`);

    let iterationInstructions = "";
    let previousContext = "";

    if (iterationCount === 1) {
      iterationInstructions = `This is the beginning of the screenplay. Start with "FADE IN:". Establish the beginning of the story.`;
      previousContext = `Project Details:
- Project Title: "${formData.projectTitle}"
- Logline: "${formData.logline || 'Not specified'}"
- Description/Synopsis: "${formData.description || 'Not specified'}"
- Genre: "${formData.genre}"
- Core Concept/Idea: "${formData.concept || 'Not specified'}"
- Targeted Rating: ${formData.targetedRating} (${ratingDescription})
- Primary Story Location: "${formData.storyLocation || 'Not specified'}"
- Special Requests: "${formData.specialRequest || 'None'}"

Begin with "FADE IN:".`;
    } else {
      const previousLines = fullScriptText
        .split("\n")
        .slice(-CONTEXT_LINES)
        .join("\n");

      previousContext = `PREVIOUS SCRIPT EXCERPT (for continuation):
${previousLines}`;

      if (estimatedTokensGenerated > MIN_TOTAL_TOKENS * 0.8) {
        iterationInstructions = `Continue the screenplay from the previous excerpt. You're approaching the end of the story, so begin wrapping up plot points and moving toward a conclusion.`;
      } else {
        iterationInstructions = `Continue the screenplay from the previous excerpt. Develop the story further, adding new scenes and advancing the plot.`;
      }

      if (estimatedTokensGenerated > MIN_TOTAL_TOKENS * 0.95) {
        iterationInstructions = `This should be the final segment of the screenplay. Bring the story to a satisfying conclusion. Ensure all major plot points are resolved. End with "FADE OUT." or "THE END".`;
      }
    }

    const prompt = `
You are an expert Hollywood screenwriter creating an original feature film screenplay.

Overall Project Details:
Project Title: "${formData.projectTitle}"
Logline: "${formData.logline || 'Not specified'}"
Genre: "${formData.genre}"
Targeted Rating: ${formData.targetedRating} (${ratingDescription})
Primary Story Location: "${formData.storyLocation || 'Various locations'}"

${previousContext}

Segment-Specific Instructions:
${iterationInstructions}

Formatting Requirements (Strictly Adhere):
- Scene Headings: ALL CAPS (e.g., INT. COFFEE SHOP - DAY).
- Action/Description: Standard sentence case.
- Character Names (before dialogue): ALL CAPS, indented.
- Dialogue: Standard sentence case, indented under the character name.
- Parentheticals: (e.g., (to herself)), indented.
- Transitions: (e.g., CUT TO:), ALL CAPS.
- Do NOT include page numbers.
- Do NOT repeat "FADE IN:" unless this is the first segment.
- Do NOT include any pre-amble, notes, or text other than the screenplay segment itself.

CONTINUE SCRIPT SEGMENT HERE:
`;

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: MAX_ITERATION_TOKENS,
        },
      });

      const response = await result.response;
      const segmentText = response.text();

      if (!segmentText || segmentText.trim().length === 0) {
        throw new Error(`Iteration ${iterationCount}: Empty response from AI model`);
      }

      fullScriptText += (fullScriptText ? "\n\n" : "") + segmentText.trim();

      const segmentTokens = Math.ceil(segmentText.length * APPROX_TOKENS_PER_CHAR);
      estimatedTokensGenerated += segmentTokens;

      console.log(`${logPrefix} Generated ~${segmentTokens} tokens. Total: ${estimatedTokensGenerated}`);

      if (estimatedTokensGenerated >= MIN_TOTAL_TOKENS) {
        if (
          !fullScriptText.includes("FADE OUT") &&
          !fullScriptText.includes("THE END") &&
          estimatedTokensGenerated < MAX_TOTAL_TOKENS
        ) {
          console.log(`${logPrefix} Adding final segment to wrap up`);
          continue;
        } else {
          console.log(`${logPrefix} Script generation complete`);
          break;
        }
      }

      if (estimatedTokensGenerated < MIN_TOTAL_TOKENS) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      console.error(`${logPrefix} Error in iteration ${iterationCount}:`, error.message);

      if (fullScriptText && estimatedTokensGenerated > MIN_TOTAL_TOKENS * 0.5) {
        console.log(`${logPrefix} Partial script available despite error`);
        break;
      } else {
        throw new Error(`Script generation failed: ${error.message}`);
      }
    }
  }

  if (!fullScriptText || fullScriptText.trim().length === 0) {
    throw new Error("Failed to generate script content");
  }

  console.log(`${logPrefix} Final script length: ${fullScriptText.length} characters`);
  return fullScriptText;
}