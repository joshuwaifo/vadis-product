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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="h-32">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Scenes</h3>
        <Badge variant="secondary">{scenes.length} total</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {scenes.map((scene) => (
          <Card key={scene.id} className="h-32 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {scene.sceneNumber}
                </Badge>
              </div>
              
              <h4 className="text-sm font-medium mb-2 line-clamp-1">
                {scene.description || `Scene ${scene.sceneNumber}`}
              </h4>
              
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {scene.plotSummary || 'Plot summary not available'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}