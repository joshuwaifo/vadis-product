import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  FileText,
  Upload,
  Sparkles,
  Info
} from "lucide-react";
import DashboardLayout from "./dashboard-layout";

export default function ProjectCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectType: "",
    logline: "",
    targetGenres: [] as string[],
    synopsis: "",
    fundingGoal: "",
    timeline: ""
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      return response.json();
    },
    onSuccess: (project) => {
      toast({
        title: "Project Created",
        description: "Your project has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setLocation(`/dashboard/projects/${project.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.projectType) {
      toast({
        title: "Required Fields",
        description: "Please fill in the title and project type.",
        variant: "destructive",
      });
      return;
    }

    createProjectMutation.mutate({
      ...formData,
      fundingGoal: formData.fundingGoal ? parseInt(formData.fundingGoal) : null,
      targetGenres: formData.targetGenres.length > 0 ? formData.targetGenres : null,
    });
  };

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      targetGenres: prev.targetGenres.includes(genre)
        ? prev.targetGenres.filter(g => g !== genre)
        : [...prev.targetGenres, genre]
    }));
  };

  const genres = [
    "Action", "Adventure", "Comedy", "Drama", "Horror", "Thriller",
    "Romance", "Sci-Fi", "Fantasy", "Mystery", "Crime", "Documentary",
    "Animation", "Musical", "Western", "War", "Biography", "Sports"
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/production/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Project</h1>
            <p className="text-muted-foreground">Set up your project details to begin script analysis and production planning</p>
          </div>
        </div>

        {/* Project Creation Options */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 mx-auto text-blue-600 mb-2" />
              <CardTitle className="text-lg">Script Analysis</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Upload an existing script for comprehensive AI analysis
              </p>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Recommended
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20">
            <CardHeader className="text-center">
              <Sparkles className="h-12 w-12 mx-auto text-purple-600 mb-2" />
              <CardTitle className="text-lg">AI Script Generation</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Generate a new script from your concept and ideas
              </p>
              <Badge variant="outline">
                Coming Soon
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
            <CardHeader className="text-center">
              <Upload className="h-12 w-12 mx-auto text-green-600 mb-2" />
              <CardTitle className="text-lg">Production Planning</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Start with project details and upload script later
              </p>
              <Badge variant="outline">
                Flexible
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Project Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter your project title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectType">Project Type *</Label>
                    <Select value={formData.projectType} onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FEATURE_FILM">Feature Film</SelectItem>
                        <SelectItem value="SHORT_FILM">Short Film</SelectItem>
                        <SelectItem value="TV_SERIES">TV Series</SelectItem>
                        <SelectItem value="TV_PILOT">TV Pilot</SelectItem>
                        <SelectItem value="DOCUMENTARY">Documentary</SelectItem>
                        <SelectItem value="WEB_SERIES">Web Series</SelectItem>
                        <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                        <SelectItem value="MUSIC_VIDEO">Music Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logline">Logline</Label>
                  <Input
                    id="logline"
                    placeholder="A compelling one-sentence summary of your story"
                    value={formData.logline}
                    onChange={(e) => setFormData(prev => ({ ...prev, logline: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of your project"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>

              <Separator />

              {/* Genres */}
              <div className="space-y-3">
                <Label>Target Genres</Label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Badge
                      key={genre}
                      variant={formData.targetGenres.includes(genre) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => handleGenreToggle(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fundingGoal">Funding Goal ($)</Label>
                  <Input
                    id="fundingGoal"
                    type="number"
                    placeholder="e.g., 500000"
                    value={formData.fundingGoal}
                    onChange={(e) => setFormData(prev => ({ ...prev, fundingGoal: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeline">Production Timeline</Label>
                  <Input
                    id="timeline"
                    placeholder="e.g., 6 months, Q2 2024"
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="synopsis">Synopsis</Label>
                <Textarea
                  id="synopsis"
                  placeholder="A detailed synopsis of your story (optional)"
                  value={formData.synopsis}
                  onChange={(e) => setFormData(prev => ({ ...prev, synopsis: e.target.value }))}
                  rows={6}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/production/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Next Steps Info */}
        <Card className="mt-6 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What happens next?</h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>• After creating your project, you can upload a PDF script for analysis</p>
              <p>• Our AI will analyze characters, scenes, locations, and production requirements</p>
              <p>• Get casting suggestions, financial breakdowns, and production insights</p>
              <p>• Discover product placement opportunities and connect with brands</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}