import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play, Edit, RefreshCw, Star, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SceneVariation {
  id: number;
  sceneId: number;
  productId: number;
  brandName: string;
  productName: string;
  placementDescription: string;
  imagePrompt: string;
  imageUrl: string | null;
  videoUrl: string | null;
  naturalness: number;
  visibility: 'background' | 'featured' | 'hero';
  estimatedValue: number;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
}

interface BrandableScenesProps {
  projectId: number;
  activeSceneId?: number;
  videoGenerationStates: Record<number, 'idle' | 'generating' | 'completed' | 'error'>;
  onGenerateVideoRequest: (variationId: number) => void;
}

interface ChangeProductModalProps {
  variation: SceneVariation;
  onSave: (variationId: number, updates: Partial<SceneVariation>) => void;
  isOpen: boolean;
  onClose: () => void;
}

function ChangeProductModal({ variation, onSave, isOpen, onClose }: ChangeProductModalProps) {
  const [brandName, setBrandName] = useState(variation.brandName);
  const [productName, setProductName] = useState(variation.productName);
  const [placementDescription, setPlacementDescription] = useState(variation.placementDescription);
  const [visibility, setVisibility] = useState<'background' | 'featured' | 'hero'>(variation.visibility);
  const [estimatedValue, setEstimatedValue] = useState(variation.estimatedValue.toString());

  const handleSave = () => {
    onSave(variation.id, {
      brandName,
      productName,
      placementDescription,
      visibility,
      estimatedValue: parseInt(estimatedValue) || 0,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Product Placement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Brand Name</Label>
              <Input
                id="brand"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter brand name"
              />
            </div>
            <div>
              <Label htmlFor="product">Product Name</Label>
              <Input
                id="product"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Placement Description</Label>
            <Textarea
              id="description"
              value={placementDescription}
              onChange={(e) => setPlacementDescription(e.target.value)}
              placeholder="Describe how the product will be placed in the scene"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={visibility} onValueChange={(value: 'background' | 'featured' | 'hero') => setVisibility(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="background">Background</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="hero">Hero</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Estimated Value ($)</Label>
              <Input
                id="value"
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BrandableScenes({
  projectId,
  activeSceneId,
  videoGenerationStates,
  onGenerateVideoRequest,
}: BrandableScenesProps) {
  const [editingVariation, setEditingVariation] = useState<SceneVariation | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: variations = [], isLoading } = useQuery<SceneVariation[]>({
    queryKey: ['/api/projects', projectId, 'scenes', activeSceneId, 'variations'],
    enabled: !!activeSceneId,
  });

  const updateVariationMutation = useMutation({
    mutationFn: async ({ variationId, updates }: { variationId: number; updates: Partial<SceneVariation> }) => {
      const response = await fetch(`/api/variations/${variationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update variation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/projects', projectId, 'scenes', activeSceneId, 'variations'],
      });
      toast({
        title: "Success",
        description: "Product placement updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product placement",
        variant: "destructive",
      });
    },
  });

  const handleEditVariation = (variationId: number, updates: Partial<SceneVariation>) => {
    updateVariationMutation.mutate({ variationId, updates });
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'hero':
        return 'bg-red-100 text-red-800';
      case 'featured':
        return 'bg-yellow-100 text-yellow-800';
      case 'background':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenerationStateColor = (state: string) => {
    switch (state) {
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!activeSceneId) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Select a scene to view product placement opportunities</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (variations.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No product placement opportunities found for this scene</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Placement Opportunities</h3>
        <Badge variant="secondary">
          {variations.length} variation{variations.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {variations.map((variation) => {
          const generationState = videoGenerationStates[variation.id] || 'idle';
          
          return (
            <Card key={variation.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{variation.brandName} - {variation.productName}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getVisibilityColor(variation.visibility)}>
                        {variation.visibility}
                      </Badge>
                      <Badge variant="outline">
                        ${variation.estimatedValue.toLocaleString()}
                      </Badge>
                      <Badge className={getGenerationStateColor(generationState)}>
                        {generationState}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingVariation(variation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {variation.placementDescription}
                </p>
                
                {variation.imageUrl && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={variation.imageUrl}
                      alt={`${variation.brandName} ${variation.productName} placement`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  {variation.videoUrl ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => window.open(variation.videoUrl!, '_blank')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      View Video
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onGenerateVideoRequest(variation.id)}
                      disabled={generationState === 'generating'}
                    >
                      {generationState === 'generating' ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Generate Video
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editingVariation && (
        <ChangeProductModal
          variation={editingVariation}
          onSave={handleEditVariation}
          isOpen={!!editingVariation}
          onClose={() => setEditingVariation(null)}
        />
      )}
    </div>
  );
}