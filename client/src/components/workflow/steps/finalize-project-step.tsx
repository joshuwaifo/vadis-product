import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle, Globe, Lock, Eye, 
  DollarSign, Users, Calendar, Trophy
} from "lucide-react";

interface FinalizeProjectStepProps {
  projectId: number;
  onComplete: () => void;
  isLoading: boolean;
}

export default function FinalizeProjectStep({ projectId, onComplete, isLoading }: FinalizeProjectStepProps) {
  const [publishToMarketplace, setPublishToMarketplace] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  // Fetch project data
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await apiRequest(`/api/projects/${projectId}`, "GET");
      return response.json();
    },
    enabled: !!projectId
  });

  // Fetch analysis summary
  const { data: analysisSummary } = useQuery({
    queryKey: ['projectSummary', projectId],
    queryFn: async () => {
      const response = await apiRequest(`/api/projects/${projectId}/summary`, "GET");
      return response.json();
    },
    enabled: !!projectId
  });

  // Finalize project mutation
  const finalizeProjectMutation = useMutation({
    mutationFn: async (data: { publishToMarketplace: boolean }) => {
      const response = await apiRequest(`/api/projects/${projectId}/finalize`, "POST", {
        publishToMarketplace: data.publishToMarketplace,
        status: 'completed'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project finalized",
        description: publishToMarketplace 
          ? "Project has been completed and published to the marketplace."
          : "Project has been completed successfully."
      });
      onComplete();
    },
    onError: () => {
      toast({
        title: "Finalization failed",
        description: "Failed to finalize project. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFinalize = async () => {
    setIsPublishing(true);
    await finalizeProjectMutation.mutateAsync({
      publishToMarketplace
    });
    setIsPublishing(false);
  };

  if (!project || !analysisSummary) {
    return <div>Loading project summary...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-gold-600" />
            <span>Project Complete: {project.title}</span>
          </CardTitle>
          <p className="text-gray-600">
            Your script analysis is complete and ready for finalization
          </p>
        </CardHeader>
      </Card>

      {/* Analysis Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{analysisSummary.totalScenes || 0}</p>
                <p className="text-sm text-gray-600">Scenes Analyzed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{analysisSummary.totalCharacters || 0}</p>
                <p className="text-sm text-gray-600">Characters</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{analysisSummary.estimatedDuration || 0}</p>
                <p className="text-sm text-gray-600">Minutes Runtime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  ${analysisSummary.estimatedBudget?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-600">Est. Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Project Completion Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Project information completed</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Script uploaded and processed</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Analysis features completed</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Results reviewed and approved</span>
          </div>
        </CardContent>
      </Card>

      {/* Publishing Options */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Options</CardTitle>
          <p className="text-gray-600">
            Choose how you want to share your completed project
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="publish-marketplace" className="text-base font-medium">
                Publish to Marketplace
              </Label>
              <p className="text-sm text-gray-600">
                Make your project visible to investors, brands, and collaborators
              </p>
            </div>
            <Switch
              id="publish-marketplace"
              checked={publishToMarketplace}
              onCheckedChange={setPublishToMarketplace}
            />
          </div>

          {publishToMarketplace && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Marketplace Benefits
                  </p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Connect with potential investors and financiers</li>
                    <li>• Attract brand partnerships for product placement</li>
                    <li>• Find production company collaborators</li>
                    <li>• Professional project presentation</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!publishToMarketplace && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Lock className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Private Project
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your project will remain private and accessible only to you. 
                    You can publish it later from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Status */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Ready to Finalize
              </Badge>
            </div>
            <p className="text-gray-600">
              Your project analysis is complete and ready for finalization
            </p>
            
            <Button
              onClick={handleFinalize}
              disabled={isPublishing || isLoading}
              size="lg"
              className="w-full max-w-md"
            >
              {isPublishing ? 'Finalizing Project...' : 'Finalize Project'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}