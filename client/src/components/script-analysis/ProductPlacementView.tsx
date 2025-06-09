import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Package, Sparkles, Eye, DollarSign, Wand2, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface SceneBreakdownSegment {
  id: number;
  projectId: number;
  title: string;
  sceneRange: string;
  startScene: number;
  endScene: number;
  summary: string;
  narrative: string;
  mainCharacters: string[];
  keyLocations: string[];
  themes: string[];
  plotPoints: string[];
  createdAt: string;
}

interface BrandableScene {
  sceneBreakdownId: number;
  title: string;
  sceneRange: string;
  summary: string;
  brandabilityScore: number;
  brandabilityReason: string;
  suggestedCategories: string[];
  placementContext: string;
}

interface MockBrandProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  placementStyle: 'subtle' | 'featured' | 'hero';
}

interface PlacementVisualization {
  sceneBreakdownId: number;
  productId: string;
  imageUrl: string;
  description: string;
  placementPrompt: string;
  generatedAt: Date;
}

interface ProductPlacementViewProps {
  projectId: number;
}

export default function ProductPlacementView({ projectId }: ProductPlacementViewProps) {
  const [selectedSegment, setSelectedSegment] = useState<SceneBreakdownSegment | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MockBrandProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [generatedVisualization, setGeneratedVisualization] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all scene breakdown segments
  const { data: sceneBreakdown, isLoading: loadingBreakdown } = useQuery({
    queryKey: [`/api/projects/${projectId}/scene-breakdown`],
    enabled: !!projectId
  });

  // Fetch brandable scenes (top 5)
  const { data: brandableScenes, isLoading: loadingBrandable } = useQuery({
    queryKey: [`/api/script-analysis/brandable-scenes/${projectId}`],
    queryFn: async () => {
      const response = await fetch('/api/script-analysis/identify_brandable_scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      if (!response.ok) throw new Error('Failed to fetch brandable scenes');
      const data = await response.json();
      return data.brandableScenes || [];
    },
    enabled: !!projectId
  });

  // Fetch product placement suggestions for selected segment
  const { data: productPlacements } = useQuery({
    queryKey: [`/api/script-analysis/product-placements/${projectId}`],
    queryFn: async () => {
      const response = await fetch('/api/script-analysis/product_placement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      if (!response.ok) throw new Error('Failed to fetch product placements');
      return response.json();
    },
    enabled: !!projectId
  });

  // Generate visualization mutation
  const generateVisualizationMutation = useMutation({
    mutationFn: async ({ sceneBreakdownId, productId }: { sceneBreakdownId: number; productId: string }) => {
      const response = await fetch('/api/script-analysis/generate_placement_visualization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneBreakdownId, productId })
      });
      if (!response.ok) throw new Error('Failed to generate visualization');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.visualization) {
        setGeneratedVisualization({
          ...data.visualization,
          productName: selectedProduct?.name,
          brandName: selectedProduct?.brand,
          estimatedValue: 25000,
          integrationType: selectedProduct?.placementStyle || 'subtle',
          rewrittenDescription: data.visualization.description
        });
        toast({
          title: "Visualization Generated",
          description: "AI product placement visualization has been created successfully."
        });
      }
      setShowProductModal(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate visualization. Please try again.",
        variant: "destructive"
      });
    }
  });

  const segments = sceneBreakdown?.segments || [];
  const brandableSceneIds = new Set(brandableScenes?.map((scene: BrandableScene) => scene.sceneBreakdownId) || []);

  const handleSegmentClick = (segment: SceneBreakdownSegment) => {
    setSelectedSegment(segment);
  };

  const handleProductSelect = (product: MockBrandProduct) => {
    if (!selectedSegment) return;
    
    setSelectedProduct(product);
    generateVisualizationMutation.mutate({
      sceneBreakdownId: selectedSegment.id,
      productId: product.id
    });
  };

  const getBrandabilityInfo = (segmentId: number) => {
    return brandableScenes?.find((scene: BrandableScene) => scene.sceneBreakdownId === segmentId);
  };

  if (loadingBreakdown) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading scene breakdown...</p>
        </div>
      </div>
    );
  }

  if (!segments || segments.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Scene Breakdown Available</h3>
        <p className="text-muted-foreground">
          Run scene breakdown analysis first to identify product placement opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Scene Segments List */}
      <div className="w-1/3 border-r bg-gray-50 dark:bg-gray-900/50">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Scene Breakdown</h3>
          <p className="text-sm text-muted-foreground">
            Select a narrative segment to explore product placement opportunities
          </p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-4 space-y-3">
            {segments.map((segment: SceneBreakdownSegment) => {
              const isBrandable = brandableSceneIds.has(segment.id);
              const brandabilityInfo = getBrandabilityInfo(segment.id);
              const isSelected = selectedSegment?.id === segment.id;
              
              return (
                <Card 
                  key={segment.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleSegmentClick(segment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {segment.sceneRange || `Scene ${segment.startScene}-${segment.endScene}`}
                        </Badge>
                        {isBrandable && (
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                        )}
                      </div>
                      {brandabilityInfo && (
                        <Badge variant="secondary" className="text-xs">
                          {brandabilityInfo.brandabilityScore}% match
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="text-sm font-medium mb-2 line-clamp-2">
                      {segment.title || `Narrative Segment ${segment.id}`}
                    </h4>
                    
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {segment.summary || segment.narrative || 'No summary available'}
                    </p>
                    
                    {isBrandable && brandabilityInfo && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex flex-wrap gap-1">
                          {brandabilityInfo.suggestedCategories?.slice(0, 2).map((category: string) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Selected Segment Details */}
      <div className="flex-1 p-6">
        {selectedSegment ? (
          <div className="space-y-6">
            {/* Segment Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {selectedSegment.sceneRange || `Scene ${selectedSegment.startScene}-${selectedSegment.endScene}`}
                </Badge>
                {brandableSceneIds.has(selectedSegment.id) && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Recommended for Brand Integration
                    </span>
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-bold mb-3">
                {selectedSegment.title || `Narrative Segment ${selectedSegment.id}`}
              </h2>
              
              {/* Scene Details */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-2">Full Scene Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedSegment.narrative || selectedSegment.summary || 'No detailed description available'}
                </p>
              </div>

              {/* Characters and Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {selectedSegment.mainCharacters && selectedSegment.mainCharacters.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Main Characters</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedSegment.mainCharacters.map((character: string) => (
                        <Badge key={character} variant="outline" className="text-xs">
                          {character}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedSegment.keyLocations && selectedSegment.keyLocations.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Key Locations</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedSegment.keyLocations.map((location: string) => (
                        <Badge key={location} variant="outline" className="text-xs">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Brandability Analysis */}
            {(() => {
              const brandabilityInfo = getBrandabilityInfo(selectedSegment.id);
              if (brandabilityInfo) {
                return (
                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Sparkles className="h-5 w-5" />
                        Brand Integration Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Brandability Score</span>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {brandabilityInfo.brandabilityScore}% Match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {brandabilityInfo.brandabilityReason}
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2">Suggested Categories</h5>
                        <div className="flex flex-wrap gap-1">
                          {brandabilityInfo.suggestedCategories?.map((category: string) => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2">Placement Context</h5>
                        <p className="text-sm text-muted-foreground">
                          {brandabilityInfo.placementContext}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })()}

            {/* Brand Product Suggestions */}
            {selectedSegment && productPlacements && productPlacements.productPlacements && (
              (() => {
                const scenePlacements = productPlacements.productPlacements.filter((placement: any) => 
                  placement.sceneId === selectedSegment.id.toString()
                );
                
                if (scenePlacements.length === 0) return null;

                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        AI-Generated Brand Suggestions
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Click any brand to generate an AI visualization
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scenePlacements.map((placement: any, index: number) => (
                          <Card key={`${placement.sceneId}-${index}`} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg mb-3 flex items-center justify-center">
                                <div className="text-center">
                                  <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">{placement.brand}</p>
                                </div>
                              </div>
                              
                              <h4 className="font-medium text-sm mb-1">{placement.product}</h4>
                              <p className="text-xs text-muted-foreground mb-2">{placement.brand}</p>
                              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                {placement.placement}
                              </p>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {placement.visibility}
                                  </Badge>
                                  <span className="text-xs font-medium text-green-600">
                                    ${placement.estimatedValue?.toLocaleString()}
                                  </span>
                                </div>
                                
                                <Button 
                                  size="sm" 
                                  onClick={() => handleProductSelect({
                                    id: `${placement.brand}-${placement.product}`.toLowerCase().replace(/\s+/g, '-'),
                                    name: placement.product,
                                    brand: placement.brand,
                                    category: placement.visibility,
                                    description: placement.placement,
                                    imageUrl: '',
                                    placementStyle: placement.visibility as 'subtle' | 'featured' | 'hero'
                                  })}
                                  disabled={generateVisualizationMutation.isPending}
                                  className="w-full text-xs"
                                >
                                  {generateVisualizationMutation.isPending ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Wand2 className="h-3 w-3 mr-1" />
                                      Generate AI Visualization
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()
            )}

            {/* Generated Visualization */}
            {generatedVisualization && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    AI-Generated Product Placement Visualization
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {generatedVisualization.rewrittenDescription}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={generatedVisualization.imageUrl}
                        alt={`Product placement visualization for ${generatedVisualization.productName}`}
                        className="w-full rounded-lg shadow-md"
                        onLoad={() => {
                          // Image loaded successfully
                        }}
                        onError={() => {
                          // Handle image load error
                        }}
                      />
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Placement Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Product</p>
                          <p className="font-medium">{generatedVisualization.productName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Brand</p>
                          <p className="font-medium">{generatedVisualization.brandName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Integration Type</p>
                          <p className="font-medium capitalize">{generatedVisualization.integrationType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Estimated Value</p>
                          <p className="font-medium">${generatedVisualization.estimatedValue?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Scene Segment</h3>
              <p className="text-muted-foreground">
                Choose a narrative segment from the left panel to explore product placement opportunities and generate AI visualizations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}