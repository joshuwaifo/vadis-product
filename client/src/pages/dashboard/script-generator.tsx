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
import { Slider } from "@/components/ui/slider";
import { 
  Wand2, 
  Lightbulb, 
  ArrowRight, 
  CheckCircle2,
  Brain,
  FileText,
  Sparkles
} from "lucide-react";

import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  concept: z.string().min(20, "Concept must be at least 20 characters"),
  targetGenres: z.array(z.string()).min(1, "Select at least one genre"),
  budgetRange: z.string().min(1, "Budget range is required"),
  fundingGoal: z.number().min(1000, "Funding goal must be at least $1,000"),
  productionTimeline: z.string().min(1, "Production timeline is required"),
  targetAudience: z.string().min(1, "Target audience is required"),
  tone: z.string().min(1, "Tone is required"),
  scriptLength: z.number().min(30).max(180),
  keyThemes: z.string().min(10, "Key themes must be at least 10 characters"),
});

export default function ScriptGenerator() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      concept: "",
      targetGenres: [],
      budgetRange: "",
      fundingGoal: 0,
      productionTimeline: "",
      targetAudience: "",
      tone: "",
      scriptLength: 90,
      keyThemes: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/projects", "POST", {
      ...data,
      projectType: "script_generator",
    }),
    onSuccess: () => {
      toast({
        title: "Project created successfully!",
        description: "Your script generation project has been created and AI generation will begin shortly.",
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

  const tones = [
    "Lighthearted", "Dark", "Comedic", "Dramatic", "Suspenseful", 
    "Inspirational", "Gritty", "Whimsical", "Intense", "Romantic"
  ];

  const audiences = [
    "General Audience", "Young Adult", "Adult", "Family", "Children", 
    "Mature", "Niche/Art House", "Mainstream Commercial"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
            Script Generator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Transform your creative concepts into full scripts with AI-powered generation
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                ${step >= stepNumber 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' 
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }
              `}>
                {step > stepNumber ? <CheckCircle2 className="h-5 w-5" /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${step > stepNumber ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gray-200 dark:bg-gray-700'}
                `} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Core Concept */}
          {step === 1 && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Core Concept & Vision
                </CardTitle>
                <CardDescription>
                  Share your creative vision and we'll help bring it to life
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
                  <Label htmlFor="concept">Core Concept*</Label>
                  <Textarea
                    id="concept"
                    {...form.register("concept")}
                    placeholder="Describe your story concept, main characters, setting, and central conflict..."
                    rows={4}
                  />
                  {form.formState.errors.concept && (
                    <p className="text-sm text-red-600">{form.formState.errors.concept.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyThemes">Key Themes*</Label>
                  <Textarea
                    id="keyThemes"
                    {...form.register("keyThemes")}
                    placeholder="What themes, messages, or emotions do you want to explore?"
                    rows={3}
                  />
                  {form.formState.errors.keyThemes && (
                    <p className="text-sm text-red-600">{form.formState.errors.keyThemes.message}</p>
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
                      placeholder="e.g., 8 months development, 4 months filming"
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
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                  >
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Style & Parameters */}
          {step === 2 && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Style & Generation Parameters
                </CardTitle>
                <CardDescription>
                  Fine-tune how AI will generate your script
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience*</Label>
                    <Select onValueChange={(value) => form.setValue("targetAudience", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        {audiences.map((audience) => (
                          <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.targetAudience && (
                      <p className="text-sm text-red-600">{form.formState.errors.targetAudience.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone & Style*</Label>
                    <Select onValueChange={(value) => form.setValue("tone", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {tones.map((tone) => (
                          <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.tone && (
                      <p className="text-sm text-red-600">{form.formState.errors.tone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Script Length (minutes): {form.watch("scriptLength")}</Label>
                  <Slider
                    value={[form.watch("scriptLength") || 90]}
                    onValueChange={(value) => form.setValue("scriptLength", value[0])}
                    max={180}
                    min={30}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>30 min (Short)</span>
                    <span>90 min (Feature)</span>
                    <span>180 min (Epic)</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Generation Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Character development arcs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Three-act structure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Dialogue generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Scene descriptions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Market analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Investment pitch materials</span>
                    </div>
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
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                  >
                    Review & Generate
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
                  Review & Generate Script
                </CardTitle>
                <CardDescription>
                  Review your specifications before AI generation begins
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
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Script Length</Label>
                      <p className="text-lg">{form.watch("scriptLength")} minutes</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Target Audience</Label>
                      <p className="text-lg">{form.watch("targetAudience")}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tone</Label>
                      <p className="text-lg">{form.watch("tone")}</p>
                    </div>
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
                  <Label className="text-sm font-medium text-gray-500">Core Concept</Label>
                  <p className="text-lg mt-1">{form.watch("concept")}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Key Themes</Label>
                  <p className="text-lg mt-1">{form.watch("keyThemes")}</p>
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
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                  >
                    {createProjectMutation.isPending ? "Creating Project..." : "Generate Script"}
                    <Wand2 className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
      </div>
    </div>
  );
}