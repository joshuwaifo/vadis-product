import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Star, Package, Sparkles, Eye, Zap } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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

const ProductPlacementView: React.FC<ProductPlacementViewProps> = ({ projectId }) => {
  const [selectedScene, setSelectedScene] = useState<BrandableScene | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MockBrandProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVisualizationModal, setShowVisualizationModal] = useState(false);
  const [currentVisualization, setCurrentVisualization] = useState<PlacementVisualization | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get brandable scenes
  const { 
    data: brandableScenesData, 
    isLoading: loadingScenes, 
    error: scenesError 
  } = useQuery({
    queryKey: [`/api/script-analysis/brandable-scenes`, projectId],
    queryFn: async () => {
      const response = await fetch('/api/script-analysis/identify_brandable_scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      return response.json();
    },
    enabled: !!projectId
  });

  // Query to get matching products for selected scene
  const { 
    data: productsData, 
    isLoading: loadingProducts 
  } = useQuery({
    queryKey: [`/api/script-analysis/matching-products`, selectedScene?.sceneBreakdownId],
    queryFn: async () => {
      if (!selectedScene) return { products: [] };
      
      const categoriesParam = selectedScene.suggestedCategories.join(',');
      const response = await fetch(`/api/script-analysis/matching_products/${selectedScene.sceneBreakdownId}?categories=${categoriesParam}`);
      return response.json();
    },
    enabled: !!selectedScene
  });

  // Mutation to generate product placement visualization
  const generateVisualizationMutation = useMutation({
    mutationFn: async ({ sceneBreakdownId, productId }: { sceneBreakdownId: number; productId: string }) => {
      const response = await fetch('/api/script-analysis/generate_placement_visualization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneBreakdownId, productId, projectId })
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setCurrentVisualization(data.visualization);
      setShowVisualizationModal(true);
      setShowProductModal(false);
      toast({
        title: "Visualization Generated",
        description: "AI has created a product placement visualization for your scene."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate product placement visualization.",
        variant: "destructive"
      });
    }
  });

  const handleSceneClick = (scene: BrandableScene) => {
    setSelectedScene(scene);
    setShowProductModal(true);
  };

  const handleProductSelect = (product: MockBrandProduct) => {
    if (!selectedScene) return;
    
    setSelectedProduct(product);
    generateVisualizationMutation.mutate({
      sceneBreakdownId: selectedScene.sceneBreakdownId,
      productId: product.id
    });
  };

  const getPlacementStyleIcon = (style: string) => {
    switch (style) {
      case 'hero': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'featured': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'subtle': return <Package className="h-4 w-4 text-gray-500" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getBrandabilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (loadingScenes) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Analyzing scenes for product placement opportunities...</span>
      </div>
    );
  }

  if (scenesError) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Failed to analyze product placement opportunities.</p>
        <p className="text-sm text-gray-500 mt-2">Please ensure scene breakdown analysis is completed first.</p>
      </div>
    );
  }

  const brandableScenes = brandableScenesData?.brandableScenes || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">AI Product Placement Opportunities</h3>
        <Badge variant="secondary">{brandableScenes.length} scenes identified</Badge>
      </div>

      {brandableScenes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No brandable scenes identified.</p>
            <p className="text-sm text-gray-500 mt-2">
              The AI analysis didn't find suitable product placement opportunities in the current script.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brandableScenes.map((scene) => (
            <Card 
              key={scene.sceneBreakdownId} 
              className="cursor-pointer hover:shadow-md transition-shadow relative"
              onClick={() => handleSceneClick(scene)}
            >
              {/* Blue Star Indicator */}
              <div className="absolute top-3 right-3">
                <div className="bg-blue-600 rounded-full p-1">
                  <Star className="h-4 w-4 text-white fill-white" />
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium pr-8">
                  {scene.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {scene.sceneRange}
                  </Badge>
                  <Badge 
                    className={`text-xs ${getBrandabilityColor(scene.brandabilityScore)}`}
                  >
                    {scene.brandabilityScore}% match
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {scene.summary}
                </p>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Why this scene works:</p>
                    <p className="text-xs text-gray-700 line-clamp-2">
                      {scene.brandabilityReason}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {scene.suggestedCategories.slice(0, 3).map((category) => (
                      <Badge 
                        key={category} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {category}
                      </Badge>
                    ))}
                    {scene.suggestedCategories.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{scene.suggestedCategories.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product Selection Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Select Product for Placement
            </DialogTitle>
            {selectedScene && (
              <div className="text-sm text-gray-600">
                Scene: {selectedScene.title} ({selectedScene.sceneRange})
              </div>
            )}
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            {loadingProducts ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading products...</span>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {productsData?.products?.map((product: MockBrandProduct) => (
                  <Card 
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleProductSelect(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{product.name}</h4>
                            {getPlacementStyleIcon(product.placementStyle)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                product.placementStyle === 'hero' ? 'bg-yellow-100 text-yellow-800' :
                                product.placementStyle === 'featured' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {product.placementStyle}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {generateVisualizationMutation.isPending && (
            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="ml-2 text-blue-700">Generating AI visualization...</span>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Visualization Modal */}
      <Dialog open={showVisualizationModal} onOpenChange={setShowVisualizationModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI Product Placement Visualization
            </DialogTitle>
          </DialogHeader>

          {currentVisualization && (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={currentVisualization.imageUrl} 
                  alt={currentVisualization.description}
                  className="w-full rounded-lg shadow-lg"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-blue-600 text-white">
                    AI Generated
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Description</h4>
                  <p className="text-sm text-gray-600">
                    {currentVisualization.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Generation Prompt</h4>
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    {currentVisualization.placementPrompt}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Generated on {new Date(currentVisualization.generatedAt).toLocaleString()}</span>
                  <span>Scene: {selectedScene?.sceneRange}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setShowVisualizationModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    // Here you could implement saving/downloading functionality
                    toast({
                      title: "Feature Coming Soon",
                      description: "Save and export functionality will be available soon."
                    });
                  }}
                  className="flex-1"
                >
                  Save Placement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductPlacementView;