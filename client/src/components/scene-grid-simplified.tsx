import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Scene {
  id: number;
  sceneNumber: number;
  location: string;
  timeOfDay: string | null;
  description: string | null;
  plotSummary: string | null;
  characters: string[] | null;
  content: string | null;
  pageStart: number | null;
  pageEnd: number | null;
  duration: number | null;
}

interface SceneGridSimplifiedProps {
  projectId: number;
}

export function SceneGridSimplified({ projectId }: SceneGridSimplifiedProps) {
  const { data: scenes, isLoading, error } = useQuery({
    queryKey: ['/api/scenes', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/scenes/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch scenes');
      }
      return response.json() as Scene[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-48">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load scenes. Please try again.</p>
      </div>
    );
  }

  if (!scenes || scenes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No scenes found. Upload and analyze a script to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Scene Breakdown</h3>
        <Badge variant="secondary">{scenes.length} scenes</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenes.map((scene) => (
          <Card key={scene.id} className="h-fit hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs font-mono">
                  Scene {scene.sceneNumber}
                </Badge>
                {scene.duration && (
                  <span className="text-xs text-muted-foreground">
                    ~{scene.duration}min
                  </span>
                )}
              </div>
              <CardTitle className="text-sm font-medium leading-tight">
                {scene.description || `Scene ${scene.sceneNumber}`}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0">
              <ScrollArea className="h-20">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {scene.plotSummary || 'No plot summary available'}
                </p>
              </ScrollArea>
              
              {scene.location && scene.timeOfDay && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{scene.location}</span>
                    <span>•</span>
                    <span>{scene.timeOfDay}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}