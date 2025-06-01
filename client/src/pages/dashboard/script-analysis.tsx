import { useState } from "react";
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
  DollarSign,
  Calendar,
  Users,
  Target
} from "lucide-react";
import DashboardLayout from "./dashboard-layout";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  logline: z.string().min(10, "Logline must be at least 10 characters"),
  targetGenres: z.array(z.string()).min(1, "Select at least one genre"),
  budgetRange: z.string().min(1, "Budget range is required"),
  fundingGoal: z.number().min(1000, "Funding goal must be at least $1,000"),
  productionTimeline: z.string().min(1, "Production timeline is required"),
  scriptContent: z.string().min(100, "Script content must be at least 100 characters"),
});

export default function ScriptAnalysis() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      logline: "",
      targetGenres: [],
      budgetRange: "",
      fundingGoal: 0,
      productionTimeline: "",
      scriptContent: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/projects", "POST", {
      ...data,
      projectType: "script_analysis",
    }),
    onSuccess: () => {
      toast({
        title: "Project created successfully!",
        description: "Your script analysis project has been created and analysis will begin shortly.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error creating project",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createProjectMutation.mutate(data);
  };

  const genres = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", 
    "Mystery", "Romance", "Sci-Fi", "Thriller", "Documentary", "Animation"
  ];

  const budgetRanges = [
    "Under $100K", "$100K - $500K", "$500K - $1M", "$1M - $5M", 
    "$5M - $10M", "$10M - $25M", "$25M+"
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
            Script Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Upload your script for AI-powered analysis and investment readiness evaluation
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
          {/* Step 1: Project Details */}
          {step === 1 && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Information
                </CardTitle>
                <CardDescription>
                  Tell us about your script and production goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <div className="space-y-2">
                  <Label>Target Genres*</Label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant={form.watch("targetGenres")?.includes(genre) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = form.getValues("targetGenres") || [];
                          if (current.includes(genre)) {
                            form.setValue("targetGenres", current.filter(g => g !== genre));
                          } else {
                            form.setValue("targetGenres", [...current, genre]);
                          }
                        }}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  {form.formState.errors.targetGenres && (
                    <p className="text-sm text-red-600">{form.formState.errors.targetGenres.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  >
                    Next Step
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
                  Script Content
                </CardTitle>
                <CardDescription>
                  Upload your script content for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="scriptContent">Script Content*</Label>
                  <Textarea
                    id="scriptContent"
                    {...form.register("scriptContent")}
                    placeholder="Paste your script content here or upload a file..."
                    rows={15}
                    className="min-h-[400px]"
                  />
                  {form.formState.errors.scriptContent && (
                    <p className="text-sm text-red-600">{form.formState.errors.scriptContent.message}</p>
                  )}
                </div>

                <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Or drag and drop your script file here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports .pdf, .txt, .doc, .docx files
                    </p>
                  </div>
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
                    type="button" 
                    onClick={() => setStep(3)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  >
                    Review & Submit
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Review & Submit
                </CardTitle>
                <CardDescription>
                  Review your project details before submission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Project Title</Label>
                      <p className="text-lg font-semibold">{form.watch("title")}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Budget Range</Label>
                      <p className="text-lg">{form.watch("budgetRange")}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Funding Goal</Label>
                      <p className="text-lg">${form.watch("fundingGoal")?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Target Genres</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {form.watch("targetGenres")?.map((genre) => (
                          <Badge key={genre} variant="secondary">{genre}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Production Timeline</Label>
                      <p className="text-lg">{form.watch("productionTimeline")}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Logline</Label>
                  <p className="text-lg mt-1">{form.watch("logline")}</p>
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(2)}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createProjectMutation.isPending}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  >
                    {createProjectMutation.isPending ? "Creating Project..." : "Create Project"}
                    <CheckCircle2 className="ml-2 h-4 w-4" />
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