import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const projectDetailsSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  logline: z.string().min(10, "Please provide a logline of at least 10 characters"),
  synopsis: z.string().min(50, "Please provide a synopsis of at least 50 characters"),
});

type ProjectDetailsData = z.infer<typeof projectDetailsSchema>;

export default function ProjectDetailsForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [genres, setGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState("");

  const form = useForm<ProjectDetailsData>({
    resolver: zodResolver(projectDetailsSchema),
    defaultValues: {
      title: "",
      logline: "",
      synopsis: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectDetailsData & { targetGenres: string[] }) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create project");
      }
      
      return response.json();
    },
    onSuccess: (project) => {
      toast({
        title: "Project created successfully!",
        description: "Let's set up your script options next.",
      });
      setLocation(`/production/projects/${project.id}/script-options`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectDetailsData) => {
    createProjectMutation.mutate({
      ...data,
      targetGenres: genres,
    });
  };

  const addGenre = () => {
    if (genreInput.trim() && !genres.includes(genreInput.trim())) {
      setGenres([...genres, genreInput.trim()]);
      setGenreInput("");
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setGenres(genres.filter(genre => genre !== genreToRemove));
  };

  const handleGenreKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addGenre();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/production/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Project</h1>
          <p className="text-gray-600">
            Let's start by gathering some basic details about your project.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Provide the essential information about your project. You'll be able to add script content in the next step.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your project title"
                          {...field}
                        />
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
                        <Input
                          placeholder="A one-sentence summary of your story"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Target Genres</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a genre (e.g., Drama, Action, Comedy)"
                      value={genreInput}
                      onChange={(e) => setGenreInput(e.target.value)}
                      onKeyPress={handleGenreKeyPress}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addGenre} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {genres.map((genre) => (
                        <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                          {genre}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeGenre(genre)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="synopsis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brief Synopsis</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a brief synopsis of your story (minimum 50 characters)"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/production/dashboard")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProjectMutation.isPending}
                    className="flex-1"
                  >
                    {createProjectMutation.isPending ? "Creating..." : "Continue to Script Options"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}