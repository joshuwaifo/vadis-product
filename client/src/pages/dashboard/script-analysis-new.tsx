import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  ArrowRight, 
  CheckCircle2,
  Loader2,
  AlertCircle,
  Film,
  Users,
  Camera,
  MapPin,
  DollarSign,
  Star,
  Zap,
  BarChart3,
  Play,
  Clock,
  Eye,
  Wand2
} from "lucide-react";
import DashboardLayout from "./dashboard-layout";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
});

export default function ScriptAnalysisNew() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [showAnalysisTools, setShowAnalysisTools] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for existing project ID in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const existingProjectId = urlParams.get('projectId');
    if (existingProjectId) {
      setProjectId(parseInt(existingProjectId));
      setShowAnalysisTools(true);
    }
  }, []);

  // Fetch project data when we have a projectId
  const { data: project } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('projectType', 'script_analysis');
      
      if (uploadedFile) {
        formData.append('scriptFile', uploadedFile);
      }

      const response = await fetch("/api/projects/script-analysis", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data && data.id) {
        setProjectId(data.id);
        setShowAnalysisTools(true);
        toast({
          title: "Project created successfully!",
          description: "Your script has been uploaded and is ready for analysis.",
        });
      } else {
        toast({
          title: "Error creating project",
          description: "Invalid response from server. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error("Project creation error:", error);
      toast({
        title: "Error creating project",
        description: error.message || "There was an issue creating your project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file only.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setUploadedFile(file);
    }
  };

  const onSubmit = (data: any) => {
    if (!uploadedFile) {
      toast({
        title: "Script required",
        description: "Please upload your script PDF before proceeding.",
        variant: "destructive",
      });
      return;
    }
    createProjectMutation.mutate(data);
  };

  const analysisFeatures = [
    {
      id: 'casting',
      name: 'Casting',
      icon: Users,
      color: 'orange',
      description: 'AI-powered actor suggestions based on character analysis',
      emoji: '👥'
    },
    {
      id: 'product-placement',
      name: 'Product Placement',
      icon: BarChart3,
      color: 'blue',
      description: 'Identify opportunities for brand partnerships',
      emoji: '📦'
    },
    {
      id: 'vfx',
      name: 'VFX Analysis',
      icon: Zap,
      color: 'purple',
      description: 'Visual effects requirements and cost estimation',
      emoji: '✨'
    },
    {
      id: 'locations',
      name: 'Location Scouting',
      icon: MapPin,
      color: 'green',
      description: 'Optimal filming locations with tax incentives',
      emoji: '📍'
    },
    {
      id: 'scenes',
      name: 'Scene Analysis',
      icon: Film,
      color: 'indigo',
      description: 'Detailed breakdown of scenes and structure',
      emoji: '🎬'
    },
    {
      id: 'characters',
      name: 'Character Analysis',
      icon: Eye,
      color: 'pink',
      description: 'Character development and relationship mapping',
      emoji: '🎭'
    },
    {
      id: 'financial',
      name: 'Financial Planning',
      icon: DollarSign,
      color: 'yellow',
      description: 'Budget estimation and revenue projections',
      emoji: '💰'
    },
    {
      id: 'summary',
      name: 'Complete Summary',
      icon: FileText,
      color: 'gradient',
      description: 'Comprehensive analysis report across all categories',
      emoji: '📋'
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
            Script Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Upload your script for comprehensive AI-powered analysis
          </p>
        </div>

        {!showAnalysisTools ? (
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Setup
                </CardTitle>
                <CardDescription>
                  Enter your project title and upload your script to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title*</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      placeholder="Enter your project title"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
                    >
                      {uploadedFile ? (
                        <div className="space-y-2">
                          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
                          <p className="text-lg font-semibold text-green-600">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button variant="outline" size="sm" type="button">
                            Change File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="text-lg font-semibold">Click to upload script PDF</p>
                          <p className="text-sm text-gray-500">
                            Only PDF files up to 10MB are accepted
                          </p>
                        </div>
                      )}
                    </div>

                    {!uploadedFile && (
                      <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          Please upload your script in PDF format to proceed with analysis
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={!uploadedFile || !form.watch("title") || createProjectMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    >
                      {createProjectMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Project...
                        </>
                      ) : (
                        <>
                          Start Analysis
                          <Film className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Success Message */}
            <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      Script Uploaded Successfully!
                    </h3>
                    <p className="text-green-700 dark:text-green-300">
                      {project?.title || 'Your project'} is ready for analysis. Select the tools you'd like to use below.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Tools Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Choose Your Analysis Tools
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {analysisFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={feature.id}
                      className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 hover:border-blue-400"
                      onClick={() => setLocation(`/dashboard/projects/${projectId}/analysis?feature=${feature.id}`)}
                    >
                      <CardContent className="p-6 text-center space-y-4">
                        <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-2xl ${
                          feature.color === 'gradient' 
                            ? 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400' 
                            : `bg-${feature.color}-100 dark:bg-${feature.color}-900/20`
                        }`}>
                          <span>{feature.emoji}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {feature.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {feature.description}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full group-hover:bg-blue-50 group-hover:border-blue-300"
                        >
                          Analyze
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center gap-4 pt-6">
              <Button 
                onClick={() => setLocation(`/dashboard/projects/${projectId}/analysis`)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                View All Results
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}