import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, MapPin, Sparkles, DollarSign, 
  Film, User, BarChart3, FileText,
  ArrowRight, Save, Play 
} from "lucide-react";

interface AnalysisFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  estimatedTime: string;
  enabled: boolean;
}

interface ScriptAnalysisStepProps {
  projectId: number;
  onNext: (data: any) => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}

const ANALYSIS_FEATURES: AnalysisFeature[] = [
  {
    id: 'scenes',
    name: 'Scene Breakdown',
    description: 'Extract and analyze individual scenes, locations, and timing',
    icon: Film,
    estimatedTime: '2-3 min',
    enabled: true
  },
  {
    id: 'characters',
    name: 'Character Analysis',
    description: 'Identify characters, relationships, and character arcs',
    icon: Users,
    estimatedTime: '3-4 min',
    enabled: true
  },
  {
    id: 'casting',
    name: 'Casting Suggestions',
    description: 'AI-powered actor recommendations for each character',
    icon: User,
    estimatedTime: '4-5 min',
    enabled: false
  },
  {
    id: 'locations',
    name: 'Location Scouting',
    description: 'Filming location suggestions with tax incentives',
    icon: MapPin,
    estimatedTime: '3-4 min',
    enabled: false
  },
  {
    id: 'vfx',
    name: 'VFX Analysis',
    description: 'Visual effects needs and cost estimation',
    icon: Sparkles,
    estimatedTime: '2-3 min',
    enabled: false
  },
  {
    id: 'product_placement',
    name: 'Product Placement',
    description: 'Brand integration opportunities and revenue potential',
    icon: DollarSign,
    estimatedTime: '3-4 min',
    enabled: false
  },
  {
    id: 'financial',
    name: 'Financial Planning',
    description: 'Budget breakdown and revenue projections',
    icon: BarChart3,
    estimatedTime: '5-6 min',
    enabled: false
  },
  {
    id: 'summary',
    name: 'Complete Summary',
    description: 'Comprehensive project report and analysis',
    icon: FileText,
    estimatedTime: '2-3 min',
    enabled: false
  }
];

export default function ScriptAnalysisStep({ projectId, onNext, onSave, isLoading }: ScriptAnalysisStepProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['scenes', 'characters']);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  // Run analysis mutation
  const runAnalysisMutation = useMutation({
    mutationFn: async (features: string[]) => {
      const response = await apiRequest(`/api/projects/${projectId}/analyze`, "POST", {
        features,
        analysisType: 'comprehensive'
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsAnalyzing(false);
      setAnalysisProgress(100);
      toast({
        title: "Analysis complete",
        description: "Script analysis has been completed successfully."
      });
    },
    onError: () => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis failed",
        description: "Script analysis failed. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    if (enabled) {
      setSelectedFeatures([...selectedFeatures, featureId]);
    } else {
      setSelectedFeatures(selectedFeatures.filter(id => id !== featureId));
    }
  };

  const handleStartAnalysis = async () => {
    if (selectedFeatures.length === 0) {
      toast({
        title: "No features selected",
        description: "Please select at least one analysis feature to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 1000);

    runAnalysisMutation.mutate(selectedFeatures);
  };

  const handleSave = () => {
    onSave({ selectedFeatures, analysisStatus: isAnalyzing ? 'running' : 'pending' });
  };

  const handleNext = () => {
    if (analysisProgress < 100) {
      toast({
        title: "Analysis incomplete",
        description: "Please complete the analysis before proceeding.",
        variant: "destructive"
      });
      return;
    }
    onNext({ selectedFeatures, analysisComplete: true });
  };

  const totalEstimatedTime = selectedFeatures.reduce((total, featureId) => {
    const feature = ANALYSIS_FEATURES.find(f => f.id === featureId);
    if (feature) {
      const time = parseInt(feature.estimatedTime.split('-')[1]);
      return total + time;
    }
    return total;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Project: {project?.title}</CardTitle>
          <p className="text-gray-600">
            Select the analysis features you want to run on your script
          </p>
        </CardHeader>
      </Card>

      {/* Analysis Features Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ANALYSIS_FEATURES.map((feature) => {
              const isSelected = selectedFeatures.includes(feature.id);
              const IconComponent = feature.icon;
              
              return (
                <div
                  key={feature.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleFeatureToggle(feature.id, !isSelected)}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium">{feature.name}</h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {feature.estimatedTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      {selectedFeatures.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Selected Features: {selectedFeatures.length}</h4>
                <p className="text-sm text-gray-600">
                  Estimated total time: {totalEstimatedTime} minutes
                </p>
              </div>
              {!isAnalyzing && analysisProgress === 0 && (
                <Button onClick={handleStartAnalysis}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Analysis
                </Button>
              )}
            </div>
            
            {isAnalyzing && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Running analysis...</span>
                  <span className="text-sm text-gray-500">{Math.round(analysisProgress)}%</span>
                </div>
                <Progress value={analysisProgress} className="w-full" />
              </div>
            )}
            
            {analysisProgress === 100 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 text-sm">
                  ✓ Analysis completed successfully! You can now review the results.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleSave}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Progress
        </Button>

        <Button
          onClick={handleNext}
          disabled={analysisProgress < 100 || isLoading}
        >
          {isLoading ? 'Processing...' : 'Continue to Review'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}