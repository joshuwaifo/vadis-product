/**
 * AI Product Placement Service
 * 
 * Identifies brandable scenes from narrative segments and generates 
 * AI-powered product placement visualizations with mock brand products.
 */

import OpenAI from "openai";
import { generateContent } from './ai-agents/ai-client';
import type { AIProvider } from './ai-agents/ai-client';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface BrandableScene {
  sceneBreakdownId: number;
  title: string;
  sceneRange: string;
  summary: string;
  brandabilityScore: number; // 1-100
  brandabilityReason: string;
  suggestedCategories: string[];
  placementContext: string;
}

export interface MockBrandProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  placementStyle: 'subtle' | 'featured' | 'hero';
}

export interface PlacementVisualization {
  sceneBreakdownId: number;
  productId: string;
  imageUrl: string;
  description: string;
  placementPrompt: string;
  generatedAt: Date;
}

// Mock brand products for demonstration
const MOCK_BRAND_PRODUCTS: MockBrandProduct[] = [
  {
    id: "apple-iphone",
    name: "iPhone 15 Pro",
    brand: "Apple",
    category: "TECHNOLOGY",
    description: "Premium smartphone with titanium design",
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
    placementStyle: "featured"
  },
  {
    id: "nike-air-jordan",
    name: "Air Jordan Retro",
    brand: "Nike",
    category: "SPORTS",
    description: "Iconic basketball sneakers",
    imageUrl: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop",
    placementStyle: "subtle"
  },
  {
    id: "coca-cola-classic",
    name: "Coca-Cola Classic",
    brand: "Coca-Cola",
    category: "BEVERAGE",
    description: "Classic cola beverage",
    imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop",
    placementStyle: "hero"
  },
  {
    id: "tesla-model-s",
    name: "Model S",
    brand: "Tesla",
    category: "AUTOMOTIVE",
    description: "Electric luxury sedan",
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=400&fit=crop",
    placementStyle: "hero"
  },
  {
    id: "sony-headphones",
    name: "WH-1000XM5",
    brand: "Sony",
    category: "ELECTRONICS",
    description: "Noise-canceling wireless headphones",
    imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
    placementStyle: "featured"
  },
  {
    id: "starbucks-coffee",
    name: "Pike Place Roast",
    brand: "Starbucks",
    category: "BEVERAGE",
    description: "Medium roast coffee",
    imageUrl: "https://images.unsplash.com/photo-1521302200778-33500795e128?w=400&h=400&fit=crop",
    placementStyle: "subtle"
  },
  {
    id: "adidas-ultraboost",
    name: "Ultraboost 22",
    brand: "Adidas",
    category: "SPORTS",
    description: "Performance running shoes",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    placementStyle: "featured"
  },
  {
    id: "rolex-submariner",
    name: "Submariner",
    brand: "Rolex",
    category: "LUXURY",
    description: "Luxury diving watch",
    imageUrl: "https://images.unsplash.com/photo-1523170335258-f5c216a0c1b3?w=400&h=400&fit=crop",
    placementStyle: "hero"
  }
];

/**
 * Analyze scene breakdowns and identify the best scenes for product placement
 */
export async function identifyBrandableScenes(
  sceneBreakdowns: any[],
  provider: AIProvider = 'gpt-4o'
): Promise<BrandableScene[]> {
  if (!sceneBreakdowns || sceneBreakdowns.length === 0) {
    return [];
  }

  const prompt = `Analyze these narrative segments from a screenplay and identify the 3-5 best scenes for product placement opportunities.

EVALUATION CRITERIA:
- Visual Clarity: Scenes with clear, describable visual elements
- Natural Integration: Products can be seamlessly incorporated without disrupting narrative
- Context Relevance: Scene context supports authentic product usage
- Brand Safety: Appropriate content for brand association
- Commercial Viability: High audience engagement potential

PRODUCT CATEGORIES: TECHNOLOGY, SPORTS, BEVERAGE, AUTOMOTIVE, ELECTRONICS, LUXURY, FOOD, CLOTHING, LIFESTYLE, TRAVEL

SCENE SEGMENTS:
${sceneBreakdowns.map((segment, index) => `
Segment ${index + 1}: ${segment.title || `Scenes ${segment.startScene || 1}-${segment.endScene || 1}`}
Range: ${segment.sceneRange || `Scenes ${segment.startScene || 1}-${segment.endScene || 1}`}
Summary: ${segment.summary || segment.narrative || 'No summary available'}
Characters: ${segment.mainCharacters?.join(', ') || segment.characters?.join(', ') || 'Not specified'}
Locations: ${segment.keyLocations?.join(', ') || segment.locations?.join(', ') || 'Not specified'}
`).join('\n')}

Return a JSON object with this structure:
{
  "brandableScenes": [
    {
      "sceneBreakdownId": number,
      "brandabilityScore": number (1-100),
      "brandabilityReason": "string explaining why this scene is ideal for product placement",
      "suggestedCategories": ["CATEGORY1", "CATEGORY2"],
      "placementContext": "string describing how products could be naturally integrated"
    }
  ]
}

Only include the top 3-5 most suitable scenes. Return ONLY the JSON object.`;

  try {
    const response = await generateContent(provider, prompt, {
      responseFormat: 'json',
      maxTokens: 2000
    });

    const parsedResponse = JSON.parse(response);
    
    if (!parsedResponse.brandableScenes || !Array.isArray(parsedResponse.brandableScenes)) {
      console.error("[Brandable Scenes] Invalid response format");
      return [];
    }

    // Map the response to include full scene breakdown data
    const brandableScenes: BrandableScene[] = parsedResponse.brandableScenes
      .map((scene: any) => {
        const sceneBreakdown = sceneBreakdowns.find(sb => sb.id === scene.sceneBreakdownId) || sceneBreakdowns[scene.sceneBreakdownId];
        if (!sceneBreakdown) return null;

        return {
          sceneBreakdownId: scene.sceneBreakdownId,
          title: sceneBreakdown.title || `Scenes ${sceneBreakdown.startScene || 1}-${sceneBreakdown.endScene || 1}`,
          sceneRange: sceneBreakdown.sceneRange || `Scenes ${sceneBreakdown.startScene || 1}-${sceneBreakdown.endScene || 1}`,
          summary: sceneBreakdown.summary || sceneBreakdown.narrative || 'No summary available',
          brandabilityScore: scene.brandabilityScore,
          brandabilityReason: scene.brandabilityReason,
          suggestedCategories: scene.suggestedCategories || [],
          placementContext: scene.placementContext
        };
      })
      .filter(Boolean)
      .sort((a: BrandableScene, b: BrandableScene) => b.brandabilityScore - a.brandabilityScore);

    console.log(`[Brandable Scenes] Identified ${brandableScenes.length} brandable scenes`);
    return brandableScenes;

  } catch (error) {
    console.error("[Brandable Scenes] Analysis error:", error);
    return [];
  }
}

/**
 * Get mock brand products that match scene categories
 */
export function getMatchingProducts(suggestedCategories: string[]): MockBrandProduct[] {
  const matchingProducts = MOCK_BRAND_PRODUCTS.filter(product => 
    suggestedCategories.includes(product.category)
  );

  // If no exact matches, return a diverse selection
  if (matchingProducts.length === 0) {
    return MOCK_BRAND_PRODUCTS.slice(0, 4);
  }

  // Ensure we have at least 3-4 products to choose from
  if (matchingProducts.length < 3) {
    const additionalProducts = MOCK_BRAND_PRODUCTS
      .filter(product => !matchingProducts.includes(product))
      .slice(0, 4 - matchingProducts.length);
    return [...matchingProducts, ...additionalProducts];
  }

  return matchingProducts.slice(0, 4);
}

/**
 * Generate AI-powered product placement visualization
 */
export async function generateProductPlacementVisualization(
  sceneBreakdown: any,
  product: MockBrandProduct,
  provider: AIProvider = 'gpt-4o'
): Promise<PlacementVisualization> {
  // First, generate a creative placement prompt
  const placementPrompt = await generatePlacementPrompt(sceneBreakdown, product, provider);
  
  // Generate the image using OpenAI DALL-E
  try {
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: placementPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const generatedImageUrl = imageResponse.data[0].url;

    return {
      sceneBreakdownId: sceneBreakdown.id,
      productId: product.id,
      imageUrl: generatedImageUrl || "https://via.placeholder.com/1024x1024/e6f3ff/0066cc?text=Product+Placement+Generated",
      description: `${product.name} naturally integrated into ${sceneBreakdown.title}`,
      placementPrompt,
      generatedAt: new Date()
    };

  } catch (error) {
    console.error("[Product Placement] Image generation error:", error);
    
    // Return a placeholder result if generation fails
    return {
      sceneBreakdownId: sceneBreakdown.id,
      productId: product.id,
      imageUrl: "https://via.placeholder.com/1024x1024/ffcccc/cc0000?text=Generation+Failed",
      description: `Error generating placement for ${product.name}`,
      placementPrompt,
      generatedAt: new Date()
    };
  }
}

/**
 * Generate creative placement prompt for image generation
 */
async function generatePlacementPrompt(
  sceneBreakdown: any,
  product: MockBrandProduct,
  provider: AIProvider = 'gpt-4o'
): Promise<string> {
  const prompt = `Create a single, descriptive prompt (max 100 words) for an AI image generator to create a cinematic film still showing natural product placement.

SCENE CONTEXT:
Title: ${sceneBreakdown.title}
Range: ${sceneBreakdown.sceneRange}
Summary: ${sceneBreakdown.summary}
Characters: ${sceneBreakdown.mainCharacters?.join(', ') || 'Characters present'}
Locations: ${sceneBreakdown.keyLocations?.join(', ') || 'Indoor/outdoor setting'}

PRODUCT TO PLACE:
${product.name} by ${product.brand}
Category: ${product.category}
Description: ${product.description}
Placement Style: ${product.placementStyle}

Create a prompt that shows the product naturally integrated into this scene context. The image should feel cinematic and authentic, not like an advertisement.

Return only the image generation prompt, no additional text.`;

  try {
    const response = await generateContent(provider, prompt, {
      maxTokens: 150
    });

    // Ensure we have a fallback prompt
    const cleanPrompt = response.trim() || 
      `Cinematic film still, ${sceneBreakdown.keyLocations?.[0] || 'indoor setting'}. ${product.name} naturally integrated into the scene. Professional lighting, realistic, high detail.`;

    return cleanPrompt;

  } catch (error) {
    console.error("[Placement Prompt] Generation error:", error);
    return `Cinematic film still featuring ${product.name} in ${sceneBreakdown.title}. Natural product placement, professional cinematography, realistic lighting.`;
  }
}

/**
 * Get all mock brand products
 */
export function getAllMockProducts(): MockBrandProduct[] {
  return MOCK_BRAND_PRODUCTS;
}