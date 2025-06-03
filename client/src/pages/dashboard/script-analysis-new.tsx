import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  ArrowRight, 
  CheckCircle2,
  Loader2,
  AlertCircle,
  Film
} from "lucide-react";
import DashboardLayout from "./dashboard-layout";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
});

export default function ScriptAnalysisNew() {
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for existing project ID in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const existingProjectId = urlParams.get('projectId');
    if (existingProjectId) {
      setProjectId(parseInt(existingProjectId));
      setStep(3); // Skip to analysis step since we have an existing project
    }
  }, []);

  // Fetch project data when we have a projectId
  const { data: project, refetch: refetchProject } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
    refetchInterval: projectId && step === 3 ? 5000 : false, // Poll every 5 seconds when analyzing
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
        setStep(3);
        toast({
          title: "Project created successfully!",
          description: "Your script is being analyzed. This may take a few minutes.",
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
      // Keep user on step 2 to retry
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



  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
            Script Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Upload your script for comprehensive AI-powered analysis
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                ${step >= stepNumber 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }
              `}>
                {step > stepNumber ? <CheckCircle2 className="h-5 w-5" /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${step > stepNumber ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200 dark:bg-gray-700'}
                `} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Project Information */}
          {step === 1 && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Information
                </CardTitle>
                <CardDescription>
                  Basic details about your script and production goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setStep(2)}
                    disabled={!form.watch("title")}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  >
                    Next: Upload Script
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Script Upload */}
          {step === 2 && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Script
                </CardTitle>
                <CardDescription>
                  Upload your script PDF for comprehensive analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(1)}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="submit"
                    disabled={!uploadedFile || createProjectMutation.isPending}
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
              </CardContent>
            </Card>
          )}

          {/* Step 3: Analysis Features Selection */}
          {step === 3 && projectId && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Script Uploaded Successfully
                </CardTitle>
                <CardDescription>
                  Select the analysis features you'd like to run on your script
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Casting */}
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2 border-2 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950 transition-all"
                    onClick={() => setLocation(`/dashboard/projects/${projectId}/analysis?feature=casting`)}
                  >
                    <div className="w-8 h-8 bg-orange-400 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-bold">👥</span>
                    </div>
                    <span className="text-sm font-medium">Casting</span>
                  </Button>

                  {/* Product Placement */}
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2 border-2 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
                    onClick={() => setLocation(`/dashboard/projects/${projectId}/analysis?feature=product-placement`)}
                  >
                    <div className="w-8 h-8 bg-blue-400 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-bold">📦</span>
                    </div>
                    <span className="text-sm font-medium">Product Placement</span>
                  </Button>

                  {/* VFX */}
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2 border-2 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all"
                    onClick={() => setLocation(`/dashboard/projects/${projectId}/analysis?feature=vfx`)}
                  >
                    <div className="w-8 h-8 bg-purple-400 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✨</span>
                    </div>
                    <span className="text-sm font-medium">VFX</span>
                  </Button>

                  {/* Location Suggestions */}
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2 border-2 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950 transition-all"
                    onClick={() => setLocation(`/dashboard/projects/${projectId}/analysis?feature=locations`)}
                  >
                    <div className="w-8 h-8 bg-green-400 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-bold">📍</span>
                    </div>
                    <span className="text-sm font-medium">Location Suggestions</span>
                  </Button>
                </div>

                {/* Summary Section */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or generate complete analysis</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    className="h-32 w-32 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 text-white shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center space-y-2"
                    onClick={() => setLocation(`/dashboard/projects/${projectId}/analysis?feature=summary`)}
                  >
                    <span className="text-2xl">📋</span>
                    <span className="text-sm font-medium">Summary</span>
                  </Button>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate a brief summary of the Script and a Reader's Report for Key Industry Insights across all analysis categories
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(2)}
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={() => setLocation(`/dashboard/projects/${projectId}/analysis`)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  >
                    View All Results
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}