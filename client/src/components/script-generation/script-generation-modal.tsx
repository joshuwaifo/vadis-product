/**
 * Script Generation Modal
 * 
 * AI-powered screenplay generation interface based on ANNEX C Technical Roadmap
 * Provides comprehensive form for script creation with genre templates and real-time generation
 */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Wand2,
  FileText,
  Clock,
  Film,
  Lightbulb,
  MapPin,
  Star,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

const scriptGenerationSchema = z.object({
  projectTitle: z.string().min(1, "Project title is required"),
  logline: z.string().optional(),
  description: z.string().optional(),
  genre: z.string().min(1, "Genre is required"),
  targetedRating: z.enum(['G', 'PG', 'PG-13', 'R', 'NC-17']),
  storyLocation: z.string().optional(),
  concept: z.string().optional(),
  specialRequest: z.string().optional(),
});

type ScriptGenerationFormData = z.infer<typeof scriptGenerationSchema>;

interface ScriptGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: number;
  projectTitle?: string;
  onScriptGenerated?: (script: string) => void;
}

export default function ScriptGenerationModal({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  onScriptGenerated,
}: ScriptGenerationModalProps) {
  const [generationStep, setGenerationStep] = useState<'form' | 'generating' | 'complete'>('form');
  const [generatedScript, setGeneratedScript] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const form = useForm<ScriptGenerationFormData>({
    resolver: zodResolver(scriptGenerationSchema),
    defaultValues: {
      projectTitle: projectTitle || "",
      logline: "",
      description: "",
      genre: "",
      targetedRating: "PG-13",
      storyLocation: "",
      concept: "",
      specialRequest: "",
    },
  });

  // Fetch templates and genre options
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/script-generation/templates'],
    enabled: open,
  });

  // Script generation mutation
  const generateScriptMutation = useMutation({
    mutationFn: async (data: ScriptGenerationFormData) => {
      const payload = {
        ...data,
        projectId,
      };
      
      const response = await apiRequest('/api/script-generation/generate', 'POST', payload);
      return response.json();
    },
    onMutate: () => {
      setGenerationStep('generating');
      setProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 2000);
      
      return { progressInterval };
    },
    onSuccess: (data, variables, context) => {
      if (context?.progressInterval) {
        clearInterval(context.progressInterval);
      }
      
      setProgress(100);
      setGeneratedScript(data.script);
      setGenerationStep('complete');
      
      toast({
        title: "Script Generated Successfully",
        description: "Your AI-powered screenplay is ready for review.",
      });
      
      if (onScriptGenerated) {
        onScriptGenerated(data.script);
      }
    },
    onError: (error: any, variables, context) => {
      if (context?.progressInterval) {
        clearInterval(context.progressInterval);
      }
      
      setGenerationStep('form');
      setProgress(0);
      
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate script. Please try again.",
      });
    },
  });

  const onSubmit = (data: ScriptGenerationFormData) => {
    generateScriptMutation.mutate(data);
  };

  const handleUseTemplate = (template: any) => {
    form.setValue('genre', template.genre);
    form.setValue('logline', template.logline);
    form.setValue('concept', template.concept);
  };

  const handleReset = () => {
    setGenerationStep('form');
    setProgress(0);
    setGeneratedScript("");
    form.reset();
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      handleReset();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Script Generation
          </DialogTitle>
          <DialogDescription>
            Create professional screenplays using advanced AI technology. Powered by the ANNEX C Technical Roadmap.
          </DialogDescription>
        </DialogHeader>

        {generationStep === 'form' && (
          <div className="space-y-6">
            {/* Template Section */}
            {templates?.samplePrompts && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Quick Start Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {templates.samplePrompts.map((template: any, index: number) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <Badge variant="secondary">{template.genre}</Badge>
                            <p className="text-sm font-medium">{template.logline}</p>
                            <p className="text-xs text-muted-foreground">{template.concept}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="projectTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Film className="w-4 h-4" />
                          Project Title
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your project title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select genre..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {templates && Array.isArray(templates.genres) ? templates.genres.map((genre: string) => (
                              <SelectItem key={genre} value={genre}>
                                {genre}
                              </SelectItem>
                            )) : (
                              <>
                                <SelectItem value="Action">Action</SelectItem>
                                <SelectItem value="Comedy">Comedy</SelectItem>
                                <SelectItem value="Drama">Drama</SelectItem>
                                <SelectItem value="Horror">Horror</SelectItem>
                                <SelectItem value="Romance">Romance</SelectItem>
                                <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                                <SelectItem value="Thriller">Thriller</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="logline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logline</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="A one-sentence summary of your story..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A compelling one-liner that captures the essence of your story
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Synopsis/Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of your story, characters, and plot..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A more detailed overview of your story, characters, and main plot points
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetedRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Target Rating
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {templates && Array.isArray(templates.ratings) ? templates.ratings.map((rating: any) => (
                              <SelectItem key={rating.value} value={rating.value}>
                                {rating.label}
                              </SelectItem>
                            )) : (
                              <>
                                <SelectItem value="G">G - General Audiences</SelectItem>
                                <SelectItem value="PG">PG - Parental Guidance</SelectItem>
                                <SelectItem value="PG-13">PG-13 - Parents Strongly Cautioned</SelectItem>
                                <SelectItem value="R">R - Restricted</SelectItem>
                                <SelectItem value="NC-17">NC-17 - Adults Only</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storyLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Primary Location
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., New York City, Space Station..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="concept"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Core Concept</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What makes your story unique? Key themes, innovative elements..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The unique hook or central idea that sets your story apart
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialRequest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific elements, tone, or style preferences..."
                          className="min-h-[60px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Any specific requirements or preferences for the script
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={generateScriptMutation.isPending}>
                    {generateScriptMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Script...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Script
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {generationStep === 'generating' && (
          <div className="space-y-6 py-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Wand2 className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Generating Your Script</h3>
                <p className="text-muted-foreground">
                  Our AI is crafting your screenplay with professional formatting and structure
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Estimated: 5-10 minutes</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <FileText className="w-4 h-4" />
                <span>90-120 pages</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Film className="w-4 h-4" />
                <span>Feature length</span>
              </div>
            </div>
          </div>
        )}

        {generationStep === 'complete' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Script Generated Successfully!</h3>
                <p className="text-muted-foreground">
                  Your AI-powered screenplay is ready for review and editing
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Generated Script Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {generatedScript.substring(0, 1000)}
                    {generatedScript.length > 1000 && "..."}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                Generate Another
              </Button>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const blob = new Blob([generatedScript], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${form.getValues('projectTitle') || 'script'}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download Script
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  Use This Script
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}