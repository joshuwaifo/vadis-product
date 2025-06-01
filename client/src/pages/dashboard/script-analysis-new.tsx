import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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

import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  logline: z.string().min(10, "Logline must be at least 10 characters"),
  budgetRange: z.string().min(1, "Budget range is required"),
  fundingGoal: z.number().min(1000, "Funding goal must be at least $1,000"),
  productionTimeline: z.string().min(1, "Production timeline is required"),
});

export default function ScriptAnalysisNew() {
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      logline: "",
      budgetRange: "",
      fundingGoal: 0,
      productionTimeline: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('logline', data.logline);
      formData.append('budgetRange', data.budgetRange);
      formData.append('fundingGoal', data.fundingGoal.toString());
      formData.append('productionTimeline', data.productionTimeline);
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
      setProjectId(data.id);
      setStep(3);
      toast({
        title: "Project created successfully!",
        description: "Your script is being analyzed. This may take a few minutes.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating project",
        description: error.message || "Please try again.",
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

  const budgetRanges = [
    "Under $100K", "$100K - $500K", "$500K - $1M", "$1M - $5M", 
    "$5M - $10M", "$10M - $25M", "$25M+"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
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

                <div className="space-y-2">
                  <Label htmlFor="logline">Logline*</Label>
                  <Textarea
                    id="logline"
                    {...form.register("logline")}
                    placeholder="A compelling one-sentence summary of your story..."
                    rows={3}
                  />
                  {form.formState.errors.logline && (
                    <p className="text-sm text-red-600">{form.formState.errors.logline.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budgetRange">Budget Range*</Label>
                    <Select onValueChange={(value) => form.setValue("budgetRange", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetRanges.map((range) => (
                          <SelectItem key={range} value={range}>{range}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.budgetRange && (
                      <p className="text-sm text-red-600">{form.formState.errors.budgetRange.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fundingGoal">Funding Goal ($)*</Label>
                    <Input
                      id="fundingGoal"
                      type="number"
                      {...form.register("fundingGoal", { valueAsNumber: true })}
                      placeholder="1000000"
                    />
                    {form.formState.errors.fundingGoal && (
                      <p className="text-sm text-red-600">{form.formState.errors.fundingGoal.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productionTimeline">Production Timeline*</Label>
                  <Input
                    id="productionTimeline"
                    {...form.register("productionTimeline")}
                    placeholder="e.g., 6 months pre-production, 3 months filming"
                  />
                  {form.formState.errors.productionTimeline && (
                    <p className="text-sm text-red-600">{form.formState.errors.productionTimeline.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setStep(2)}
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

          {/* Step 3: Analysis in Progress */}
          {step === 3 && projectId && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analysis in Progress
                </CardTitle>
                <CardDescription>
                  AI is analyzing your script across multiple dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Extracting Scenes</span>
                      <span>In Progress...</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Analysis Components:</h4>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• Scene extraction and breakdown</li>
                        <li>• Character analysis and relationships</li>
                        <li>• Actor casting suggestions</li>
                        <li>• VFX requirements identification</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Business Analysis:</h4>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• Product placement opportunities</li>
                        <li>• Location scouting suggestions</li>
                        <li>• Financial planning and budgeting</li>
                        <li>• Investment readiness report</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={() => setLocation(`/dashboard/projects/${projectId}/analysis`)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  >
                    View Analysis Dashboard
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