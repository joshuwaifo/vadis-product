import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ComprehensiveAnalysisPanel from "@/components/script-analysis/comprehensive-analysis-panel";
import { 
  Users, MapPin, Sparkles, DollarSign, 
  Film, User, BarChart3, FileText,
  ArrowRight, Save, Play, Wand2, CheckCircle
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
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
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

  // Handle analysis completion
  const handleAnalysisComplete = (results: any) => {
    setAnalysisComplete(true);
    setAnalysisResults(results);
    toast({
      title: "Analysis Complete",
      description: "Comprehensive script analysis has been completed successfully."
    });
  };

  // Show comprehensive analysis panel if project has script content
  if (project?.scriptContent && !analysisComplete) {
    return (
      <div className="space-y-6">
        <ComprehensiveAnalysisPanel
          projectId={projectId}
          scriptContent={project.scriptContent}
          onAnalysisComplete={handleAnalysisComplete}
        />
        
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
          <div className="space-x-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show results and next step if analysis is complete
  if (analysisComplete && analysisResults) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analysis Complete
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your comprehensive script analysis is ready. Review the results in the next step.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analysisResults.map((task: any) => (
                <div key={task.id} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.name}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Completed
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
          <Button onClick={handleNext} disabled={isLoading}>
            Review Results
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Script Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Upload a script in the previous step to begin comprehensive AI analysis.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Ready for Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Once you upload a script, the AI analysis suite will automatically begin processing your content with advanced features including:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Scene breakdown and character analysis</li>
            <li>• AI casting director suggestions</li>
            <li>• Location intelligence with tax incentives</li>
            <li>• VFX requirements and cost estimation</li>
            <li>• Brand placement opportunities</li>
            <li>• Financial projections and budget planning</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save Progress
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Back to Upload
        </Button>
      </div>
    </div>
  );
}