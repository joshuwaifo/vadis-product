import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Wand2, FileText, Download, Loader2, Sparkles, Check } from "lucide-react";

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

interface ScriptGenerationWizardProps {
  onComplete: (projectId: number) => void;
  existingProjectId?: number;
  initialStep?: string;
}

export default function ScriptGenerationWizard({
  onComplete,
  existingProjectId,
  initialStep,
}: ScriptGenerationWizardProps) {
  const [currentStep, setCurrentStep] = useState<'setup' | 'generating' | 'review'>('setup');
  const [generatedScript, setGeneratedScript] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [streamedContent, setStreamedContent] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<ScriptGenerationFormData>({
    resolver: zodResolver(scriptGenerationSchema),
    defaultValues: {
      projectTitle: "",
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
  const { data: templates } = useQuery({
    queryKey: ['/api/script-generation/templates'],
  });

  // State for real-time token tracking
  const [tokenCount, setTokenCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Script generation with streaming
  const handleStreamingGeneration = async (formData: ScriptGenerationFormData) => {
    setCurrentStep('generating');
    setStreamedContent("");
    setTokenCount(0);
    setIsGenerating(true);

    const payload = {
      ...formData,
      projectId: existingProjectId,
    };

    try {
      const response = await fetch('/api/script-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to start script generation');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              console.log('Received streaming data:', data.type, 'tokens:', data.tokenCount);
              
              if (data.type === 'progress') {
                setStreamedContent(data.content);
                setTokenCount(data.tokenCount);
              } else if (data.type === 'complete') {
                setGeneratedScript(data.script);
                setStreamedContent(data.script);
                setTokenCount(data.tokenCount);
                setCurrentStep('review');
                setIsGenerating(false);
                
                toast({
                  title: "Script Generated Successfully",
                  description: "Your AI-powered screenplay is ready for review.",
                });
                return;
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.log('Parse error:', parseError, 'for line:', line);
            }
          }
        }
      }
    } catch (error: any) {
      setIsGenerating(false);
      setCurrentStep('setup');
      setStreamedContent("");
      setTokenCount(0);
      
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate script. Please try again.",
      });
    }
  };

  // Mutation for triggering generation
  const generateScriptMutation = useMutation({
    mutationFn: handleStreamingGeneration,
    onSuccess: () => {
      // Success handled in streaming function
    },
    onError: (error: any) => {
      setIsGenerating(false);
      setCurrentStep('setup');
      setStreamedContent("");
      setTokenCount(0);
      
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate script. Please try again.",
      });
    },
  });

  const handleStartGeneration = (data: ScriptGenerationFormData) => {
    generateScriptMutation.mutate(data);
  };

  const handleExportPDF = () => {
    // Create a new window with the script content formatted for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Please allow popups to export your script as PDF.",
      });
      return;
    }

    const projectTitle = form.getValues('projectTitle') || 'Screenplay';
    
    // HTML content with proper screenplay formatting
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${projectTitle}</title>
        <style>
          @page {
            size: letter;
            margin: 1in;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12pt;
            line-height: 1.5;
            color: black;
            background: white;
            margin: 0;
            padding: 0;
          }
          .script-content {
            white-space: pre-wrap;
            word-wrap: break-word;
            page-break-inside: avoid;
          }
          .title-page {
            text-align: center;
            margin-top: 2in;
            margin-bottom: 2in;
            page-break-after: always;
          }
          .title {
            font-size: 18pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 1in;
          }
          @media print {
            body { print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="title-page">
          <div class="title">${projectTitle}</div>
          <div>A Screenplay</div>
        </div>
        <div class="script-content">${generatedScript.replace(/\n/g, '<br>')}</div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print dialog
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      // Close the window after printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
      
      toast({
        title: "Script Export Started",
        description: "Use your browser's print dialog to save as PDF.",
      });
    }, 500);
  };

  const handleComplete = () => {
    if (existingProjectId) {
      onComplete(existingProjectId);
    }
  };

  if (currentStep === 'generating') {
    return (
      <div className="space-y-6 h-full">
        {/* Top Panel - Generation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wand2 className="w-5 h-5" />
              <span>Generating Script</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Creating Your Screenplay</h3>
                  <p className="text-muted-foreground">
                    Our AI is crafting your story with professional formatting
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generation Progress</span>
                    <span>{Math.round((tokenCount / 32000) * 100)}%</span>
                  </div>
                  <Progress value={(tokenCount / 32000) * 100} className="h-2" />
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${tokenCount > 1000 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Story structure development</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${tokenCount > 8000 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Character development</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${tokenCount > 16000 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Dialogue creation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${tokenCount > 24000 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Scene descriptions</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Panel - Live Script Preview */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Live Script Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-6 h-[500px] overflow-y-auto font-mono text-sm leading-relaxed">
              <pre className="whitespace-pre-wrap">
                {streamedContent || "Preparing to generate your script..."}
                {isGenerating && (
                  <span className="inline-block w-2 h-4 bg-purple-600 animate-pulse ml-1" />
                )}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'review') {
    return (
      <div className="space-y-6 h-full">
        {/* Top Panel - Completion Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span>Script Generated Successfully!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Your Screenplay is Ready</h3>
                  <p className="text-muted-foreground">
                    Review your generated script and export when ready
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generation Complete</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {tokenCount.toLocaleString()} tokens generated
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleExportPDF}
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to PDF
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleComplete}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Save to Project
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('setup')}
                  className="w-full"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Another Script
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Panel - Complete Script */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Complete Script</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-6 h-[500px] overflow-y-auto font-mono text-sm leading-relaxed">
              <pre className="whitespace-pre-wrap">{generatedScript}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Panel - What to Expect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>What to Expect</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">AI-Powered Writing</h4>
                <p className="text-sm text-gray-600">
                  Our advanced AI will craft a professional screenplay based on your inputs
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Real-Time Progress</h4>
                <p className="text-sm text-gray-600">
                  Watch your script being generated live with token-based progress tracking
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Instant Export</h4>
                <p className="text-sm text-gray-600">
                  Download your completed script as a PDF for immediate use
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Middle Panel - Generation Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">💡 Be Specific</p>
              <p className="text-blue-700">The more detailed your description, the better your script will be</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-900">🎭 Include Character Details</p>
              <p className="text-green-700">Mention key characters and their relationships in your description</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-900">🎬 Set the Tone</p>
              <p className="text-purple-700">Describe the mood and style you want for your screenplay</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Panel - Script Generation Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5" />
            <span>Script Generation Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleStartGeneration)} className="space-y-6">
              <FormField
                control={form.control}
                name="projectTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your project title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logline</FormLabel>
                    <FormControl>
                      <Input placeholder="A one-sentence summary of your story" {...field} />
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
                    <FormLabel>Genre *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="drama">Drama</SelectItem>
                        <SelectItem value="comedy">Comedy</SelectItem>
                        <SelectItem value="action">Action</SelectItem>
                        <SelectItem value="thriller">Thriller</SelectItem>
                        <SelectItem value="horror">Horror</SelectItem>
                        <SelectItem value="romance">Romance</SelectItem>
                        <SelectItem value="sci-fi">Science Fiction</SelectItem>
                        <SelectItem value="fantasy">Fantasy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetedRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Rating *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="G">G - General Audiences</SelectItem>
                        <SelectItem value="PG">PG - Parental Guidance</SelectItem>
                        <SelectItem value="PG-13">PG-13 - Parents Strongly Cautioned</SelectItem>
                        <SelectItem value="R">R - Restricted</SelectItem>
                        <SelectItem value="NC-17">NC-17 - Adults Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your story in detail..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storyLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Where does your story take place?" {...field} />
                    </FormControl>
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
                        placeholder="Any special requirements or creative directions..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={generateScriptMutation.isPending} className="w-full" size="lg">
                {generateScriptMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting Generation...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Start Script Generation
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}