/**
 * Project Summary Service
 * 
 * Generates comprehensive project reports integrating all analysis components
 * including characters, VFX, financial breakdown, locations, and product placement.
 */

import { generateContent } from './ai-agents/ai-client';
import type { AIProvider } from './ai-agents/ai-client';
import { storage } from '../storage';

export interface ProjectSummaryReport {
  projectTitle: string;
  executiveSummary: string;
  genreAnalysis: {
    primaryGenre: string;
    secondaryGenres: string[];
    marketAppeal: string;
  };
  characterAnalysis: {
    leadCharacters: string[];
    totalCharacterCount: number;
    castingComplexity: string;
  };
  productionAnalysis: {
    estimatedShootDays: number;
    vfxComplexity: string;
    locationRequirements: string;
    productionChallenges: string[];
  };
  financialSummary: {
    totalBudget: number;
    aboveTheLinePercentage: number;
    belowTheLinePercentage: number;
    contingencyPercentage: number;
    estimatedROI: number;
  };
  marketAnalysis: {
    targetAudience: string;
    marketComparables: string[];
    distributionStrategy: string;
    revenueProjection: number;
  };
  riskAssessment: {
    productionRisks: string[];
    marketRisks: string[];
    mitigationStrategies: string[];
  };
  recommendation: {
    greenlight: boolean;
    reasoning: string;
    keySuccessFactors: string[];
  };
}

/**
 * Generate comprehensive project summary report
 */
export async function generateComprehensiveProjectSummary(
  projectId: number,
  provider: AIProvider = 'gemini-1.5-pro'
): Promise<string | null> {
  try {
    console.log(`[Project Summary] Generating comprehensive report for project ${projectId}`);

    // Gather all analysis data
    const project = await storage.getProject(projectId);
    if (!project) {
      console.error("[Project Summary] Project not found");
      return null;
    }

    const scenes = await storage.getScenes(projectId);
    const characters = await storage.getCharacters(projectId);
    const financialPlan = await storage.getFinancialPlan(projectId);
    const locationSuggestions = await storage.getLocationSuggestions(projectId);

    // Prepare analysis data for AI
    const analysisContext = {
      projectTitle: project.title,
      projectType: project.projectType,
      logline: project.logline || "No logline provided",
      synopsis: project.synopsis || "No synopsis provided",
      totalBudget: project.totalBudget || 0,
      sceneCount: scenes.length,
      characterCount: characters.length,
      hasVFXNeeds: scenes.some(scene => scene.vfxNeeds && scene.vfxNeeds.length > 0),
      hasProductPlacement: scenes.some(scene => scene.productPlacementOpportunities && scene.productPlacementOpportunities.length > 0),
      locationCount: locationSuggestions.length,
      financialBreakdown: financialPlan ? {
        totalBudget: financialPlan.totalBudget,
        preProduction: financialPlan.budgetBreakdown?.preProduction || 0,
        production: financialPlan.budgetBreakdown?.production || 0,
        postProduction: financialPlan.budgetBreakdown?.postProduction || 0,
        marketing: financialPlan.budgetBreakdown?.marketing || 0,
        contingency: financialPlan.budgetBreakdown?.contingency || 0
      } : null
    };

    const prompt = `You are a senior development executive at a major film studio with 20+ years of experience in greenlight decisions. Generate a comprehensive, professional reader's report for the following project.

PROJECT DETAILS:
Title: ${analysisContext.projectTitle}
Type: ${analysisContext.projectType}
Logline: ${analysisContext.logline}
Synopsis: ${analysisContext.synopsis}

ANALYSIS DATA:
- Total Budget: $${analysisContext.totalBudget.toLocaleString()}
- Scene Count: ${analysisContext.sceneCount}
- Character Count: ${analysisContext.characterCount}
- VFX Requirements: ${analysisContext.hasVFXNeeds ? 'Yes' : 'No'}
- Product Placement Opportunities: ${analysisContext.hasProductPlacement ? 'Yes' : 'No'}
- Location Variations: ${analysisContext.locationCount}
${analysisContext.financialBreakdown ? `
FINANCIAL BREAKDOWN:
- Pre-Production: $${analysisContext.financialBreakdown.preProduction.toLocaleString()}
- Production: $${analysisContext.financialBreakdown.production.toLocaleString()}
- Post-Production: $${analysisContext.financialBreakdown.postProduction.toLocaleString()}
- Marketing: $${analysisContext.financialBreakdown.marketing.toLocaleString()}
- Contingency: $${analysisContext.financialBreakdown.contingency.toLocaleString()}` : ''}

Generate a professional reader's report with the following sections:

1. EXECUTIVE SUMMARY (2-3 paragraphs)
2. STORY ANALYSIS (strengths, weaknesses, genre positioning)
3. CHARACTER EVALUATION (lead characters, supporting cast, casting considerations)
4. PRODUCTION ASSESSMENT (technical requirements, challenges, feasibility)
5. FINANCIAL ANALYSIS (budget appropriateness, revenue potential, risk factors)
6. MARKET ANALYSIS (target audience, comparable films, distribution strategy)
7. RECOMMENDATION (Pass/Consider/Recommend with detailed reasoning)

Write in a professional, industry-standard tone. Be specific about commercial viability, production challenges, and market positioning. Include concrete recommendations for development or production adjustments if applicable.

The report should be thorough enough for studio executives to make informed decisions about project development and financing.`;

    const response = await generateContent(provider, prompt, {
      maxTokens: 4000
    });

    if (!response || response.length < 500) {
      console.error("[Project Summary] Generated report too short or empty");
      return null;
    }

    console.log(`[Project Summary] Generated comprehensive report (${response.length} characters)`);
    return response;

  } catch (error) {
    console.error("[Project Summary] Error generating comprehensive report:", error);
    return null;
  }
}

/**
 * Generate structured project analysis for database storage
 */
export async function generateStructuredProjectAnalysis(
  projectId: number,
  provider: AIProvider = 'gemini-1.5-flash'
): Promise<ProjectSummaryReport | null> {
  try {
    console.log(`[Project Analysis] Generating structured analysis for project ${projectId}`);

    const project = await storage.getProject(projectId);
    if (!project) return null;

    const scenes = await storage.getScenes(projectId);
    const characters = await storage.getCharacters(projectId);
    const financialPlan = await storage.getFinancialPlan(projectId);

    const prompt = `Analyze the following project and provide a structured assessment in JSON format:

PROJECT: ${project.title}
LOGLINE: ${project.logline || "Not provided"}
BUDGET: $${(project.totalBudget || 0).toLocaleString()}
SCENES: ${scenes.length}
CHARACTERS: ${characters.length}

Provide analysis in this JSON structure:
{
  "projectTitle": "${project.title}",
  "executiveSummary": "2-3 sentence project overview",
  "genreAnalysis": {
    "primaryGenre": "primary genre",
    "secondaryGenres": ["genre1", "genre2"],
    "marketAppeal": "assessment of market appeal"
  },
  "characterAnalysis": {
    "leadCharacters": ["char1", "char2"],
    "totalCharacterCount": ${characters.length},
    "castingComplexity": "Low/Medium/High"
  },
  "productionAnalysis": {
    "estimatedShootDays": estimated_days,
    "vfxComplexity": "Low/Medium/High",
    "locationRequirements": "description",
    "productionChallenges": ["challenge1", "challenge2"]
  },
  "financialSummary": {
    "totalBudget": ${project.totalBudget || 0},
    "aboveTheLinePercentage": percentage,
    "belowTheLinePercentage": percentage,
    "contingencyPercentage": 10,
    "estimatedROI": estimated_roi_multiplier
  },
  "marketAnalysis": {
    "targetAudience": "primary audience description",
    "marketComparables": ["film1", "film2", "film3"],
    "distributionStrategy": "theatrical/streaming/hybrid",
    "revenueProjection": projected_revenue
  },
  "riskAssessment": {
    "productionRisks": ["risk1", "risk2"],
    "marketRisks": ["risk1", "risk2"],
    "mitigationStrategies": ["strategy1", "strategy2"]
  },
  "recommendation": {
    "greenlight": true_or_false,
    "reasoning": "detailed reasoning for recommendation",
    "keySuccessFactors": ["factor1", "factor2", "factor3"]
  }
}

Return only the JSON object, no additional text.`;

    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 2000
    });

    try {
      const analysis = JSON.parse(response) as ProjectSummaryReport;
      console.log(`[Project Analysis] Generated structured analysis for ${analysis.projectTitle}`);
      return analysis;
    } catch (parseError) {
      console.error("[Project Analysis] Failed to parse JSON response:", parseError);
      return null;
    }

  } catch (error) {
    console.error("[Project Analysis] Error generating structured analysis:", error);
    return null;
  }
}

/**
 * Generate executive summary for quick review
 */
export async function generateExecutiveSummary(
  projectId: number,
  provider: AIProvider = 'gemini-1.5-flash'
): Promise<string | null> {
  try {
    const project = await storage.getProject(projectId);
    if (!project) return null;

    const financialPlan = await storage.getFinancialPlan(projectId);
    const budget = project.totalBudget || 0;

    const prompt = `Generate a concise executive summary (3-4 sentences) for this film project:

Title: ${project.title}
Logline: ${project.logline || "Not provided"}
Budget: $${budget.toLocaleString()}
${financialPlan ? `Projected ROI: ${(financialPlan.roi || 1.0).toFixed(1)}x` : ''}

Focus on commercial viability, target audience, and key selling points. Write for studio executives making funding decisions.`;

    const response = await generateContent(provider, prompt, {
      maxTokens: 300
    });

    return response?.trim() || null;

  } catch (error) {
    console.error("[Executive Summary] Error generating summary:", error);
    return null;
  }
}