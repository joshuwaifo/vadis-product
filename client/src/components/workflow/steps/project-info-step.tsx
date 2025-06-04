import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileText, Save, ArrowRight } from "lucide-react";

const projectInfoSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  logline: z.string().optional(),
  synopsis: z.string().optional(),
  targetGenres: z.array(z.string()).optional(),
  budgetRange: z.string().optional(),
});

type ProjectInfoData = z.infer<typeof projectInfoSchema>;

interface ProjectInfoStepProps {
  projectId?: number;
  onNext: (data: any) => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}

const GENRE_OPTIONS = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", 
  "Documentary", "Drama", "Family", "Fantasy", "Horror", "Musical", 
  "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"
];

const BUDGET_RANGES = [
  "Under $100K", "$100K - $500K", "$500K - $1M", "$1M - $5M", 
  "$5M - $15M", "$15M - $50M", "$50M - $100M", "Over $100M"
];

export default function ProjectInfoStep({ projectId, onNext, onSave, isLoading }: ProjectInfoStepProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [scriptContent, setScriptContent] = useState<string>("");
  const { toast } = useToast();

  // Fetch existing project data if editing
  const { data: existingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const response = await apiRequest(`/api/projects/${projectId}`, "GET");
      return response.json();
    },
    enabled: !!projectId
  });

  const form = useForm<ProjectInfoData>({
    resolver: zodResolver(projectInfoSchema),
    defaultValues: {
      title: existingProject?.title || "",
      logline: existingProject?.logline || "",
      synopsis: existingProject?.synopsis || "",
      targetGenres: existingProject?.targetGenres || [],
      budgetRange: existingProject?.budgetRange || "",
    },
  });

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('script', file);
      
      const response = await fetch('/api/upload/script', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setScriptContent(data.content);
      toast({
        title: "Script uploaded successfully",
        description: "Your script has been processed and is ready for analysis."
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload script. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Project creation/update mutation
  const saveProjectMutation = useMutation({
    mutationFn: async (data: ProjectInfoData & { scriptContent?: string }) => {
      const response = await apiRequest(
        projectId ? `/api/projects/${projectId}` : '/api/projects',
        projectId ? "PUT" : "POST",
        {
          ...data,
          scriptContent: scriptContent || data.scriptContent,
          projectType: 'script_analysis'
        }
      );
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Project saved",
        description: "Project information has been saved successfully."
      });
      return data;
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Failed to save project. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      uploadFileMutation.mutate(file);
    }
  };

  const handleSave = async () => {
    const formData = form.getValues();
    const result = await saveProjectMutation.mutateAsync({
      ...formData,
      scriptContent
    });
    onSave(result);
  };

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    if (!scriptContent && !uploadedFile) {
      toast({
        title: "Script required",
        description: "Please upload a script to continue.",
        variant: "destructive"
      });
      return;
    }

    const formData = form.getValues();
    const result = await saveProjectMutation.mutateAsync({
      ...formData,
      scriptContent
    });
    
    onNext(result);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Information */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Project Details</h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your project title" />
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
                      <Input {...field} placeholder="One-sentence summary of your project" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="synopsis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Synopsis</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Brief description of your project"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BUDGET_RANGES.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Script Upload */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Script Upload</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {uploadedFile || scriptContent ? (
                  <div className="space-y-4">
                    <FileText className="w-12 h-12 text-green-600 mx-auto" />
                    <div>
                      <p className="font-medium text-green-600">
                        {uploadedFile ? uploadedFile.name : "Script uploaded"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {scriptContent && `${scriptContent.length.toLocaleString()} characters`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('script-upload')?.click()}
                    >
                      Upload Different File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="font-medium">Upload your script</p>
                      <p className="text-sm text-gray-500">
                        PDF, DOC, DOCX, or TXT files supported
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('script-upload')?.click()}
                      disabled={uploadFileMutation.isPending}
                    >
                      {uploadFileMutation.isPending ? 'Uploading...' : 'Choose File'}
                    </Button>
                  </div>
                )}
                
                <input
                  id="script-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </Form>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={saveProjectMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {saveProjectMutation.isPending ? 'Saving...' : 'Save Progress'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={isLoading || uploadFileMutation.isPending || saveProjectMutation.isPending}
        >
          {isLoading ? 'Processing...' : 'Save & Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}