import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, FileText, ArrowRight, Save, X, 
  Film, DollarSign, Target, BookOpen, Eye
} from "lucide-react";

const projectInfoSchema = z.object({
  title: z.string().min(1, "Project title is required")
});

interface ProjectInfoStepProps {
  projectId?: number;
  onNext: (data: any) => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}

export default function ProjectInfoStep({ projectId, onNext, onSave, isLoading }: ProjectInfoStepProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [scriptContent, setScriptContent] = useState<string>("");
  const [fileData, setFileData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch existing project data if projectId is provided
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['/api/projects', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const response = await fetch(`/api/projects/${projectId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      return response.json();
    },
    enabled: !!projectId,
  });

  const form = useForm<z.infer<typeof projectInfoSchema>>({
    resolver: zodResolver(projectInfoSchema),
    defaultValues: {
      title: ""
    }
  });

  // Load existing project data into form
  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title || ""
      });
      
      if (project.scriptContent) {
        setScriptContent(project.scriptContent);
        // Indicate that script is already uploaded
        setUploadedFile({ name: "Previously uploaded script" } as File);
      }
    }
  }, [project, form]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('script', file);
      
      const response = await fetch('/api/upload/script', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setScriptContent(data.content);
      
      // Store PDF file data if available
      if (data.fileData && data.mimeType) {
        setFileData(data.fileData);
        setMimeType(data.mimeType);
      }
      
      toast({
        title: "Script uploaded",
        description: `Successfully uploaded ${data.fileName} - ready for analysis`
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to process script file. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      uploadMutation.mutate(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setScriptContent("");
    setFileData(null);
    setMimeType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    const formData = form.getValues();
    onSave({ ...formData, scriptContent, uploadedFile: uploadedFile?.name });
  };

  const handleNext = (data: z.infer<typeof projectInfoSchema>) => {
    if (!scriptContent) {
      toast({
        title: "Script required",
        description: "Please upload a script file before proceeding.",
        variant: "destructive"
      });
      return;
    }
    
    onNext({ 
      ...data, 
      scriptContent, 
      uploadedFile: uploadedFile?.name,
      fileData,
      mimeType,
      fileName: uploadedFile?.name
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Film className="w-5 h-5" />
            <span>Project Information</span>
            {project && (
              <Badge variant="secondary" className="ml-2">
                Loaded from existing project
              </Badge>
            )}
          </CardTitle>
          <p className="text-gray-600">
            {project 
              ? "Review and update your project details and script" 
              : "Tell us about your project and upload your script for analysis"
            }
          </p>
        </CardHeader>
      </Card>

      {/* Project Details - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Project Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
              <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {project && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-800">Project Status</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{project.status || 'Draft'}</Badge>
                      {project.workflowStatus && (
                        <Badge variant="secondary">
                          Step: {project.workflowStatus.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    {project.createdAt && (
                      <p className="text-xs text-blue-600">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleNext)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your project title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
                
                {project?.logline && (
                  <div className="space-y-2">
                    <FormLabel>Logline</FormLabel>
                    <div className="p-3 bg-gray-50 border rounded-md">
                      <p className="text-sm text-gray-700">{project.logline}</p>
                    </div>
                  </div>
                )}
                
                {project?.synopsis && (
                  <div className="space-y-2">
                    <FormLabel>Synopsis</FormLabel>
                    <div className="p-3 bg-gray-50 border rounded-md max-h-32 overflow-y-auto">
                      <p className="text-sm text-gray-700">{project.synopsis}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Script Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Script Upload</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
              <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
          ) : !uploadedFile ? (
            <div>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Upload Your Script
                </p>
                <p className="text-gray-500 mb-4">
                  Drag and drop or click to select
                </p>
                <p className="text-sm text-gray-400">
                  Supports PDF, DOC, DOCX, and TXT files
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{uploadedFile.name}</p>
                    {uploadedFile.size ? (
                      <p className="text-sm text-green-600">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    ) : (
                      <p className="text-sm text-green-600">Previously uploaded</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Processing script...</p>
            </div>
          )}
        </CardContent>
      </Card>



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
          onClick={form.handleSubmit(handleNext)}
          disabled={isLoading || uploadMutation.isPending || !scriptContent}
        >
          {isLoading || uploadMutation.isPending ? 'Processing...' : 'Continue to Analysis'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}