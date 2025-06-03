import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Star, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface Scene {
  id: number;
  sceneNumber: number;
  location: string;
  timeOfDay: string | null;
  description: string | null;
  characters: string[] | null;
  content: string | null;
  pageStart: number | null;
  pageEnd: number | null;
  duration: number | null;
  vfxNeeds: string[] | null;
  productPlacementOpportunities: string[] | null;
}

interface SceneBreakdownProps {
  projectId: number;
  projectTitle: string;
  activeSceneId?: number;
  onSceneSelect: (sceneId: number) => void;
}

export default function SceneBreakdown({
  projectId,
  activeSceneId,
  projectTitle,
  onSceneSelect,
}: SceneBreakdownProps) {
  const { data: scenes = [], isLoading } = useQuery({
    queryKey: ['/api/projects', projectId, 'scenes'],
  });

  // Identify brandable and VFX scenes from the fetched data
  const brandableSceneIds = scenes
    .filter((scene: Scene) => scene.productPlacementOpportunities && scene.productPlacementOpportunities.length > 0)
    .map((scene: Scene) => scene.id);

  const vfxSceneIds = scenes
    .filter((scene: Scene) => scene.vfxNeeds && scene.vfxNeeds.length > 0)
    .map((scene: Scene) => scene.id);

  if (isLoading) {
    return (
      <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow animate-pulse">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          <Skeleton className="h-6 w-3/4" />
        </h2>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 text-foreground">
        {projectTitle
          ? `Scene Breakdown for "${projectTitle}"`
          : "Scene Breakdown"}
      </h2>

      <div className="h-[400px] overflow-hidden">
        <ScrollArea className="h-full pr-2">
          <ul className="space-y-2">
            {scenes.map((scene: Scene) => (
              <li
                key={scene.id}
                className={cn(
                  "px-3 py-2 rounded-r cursor-pointer scene-item transition-colors",
                  "hover:bg-blue-50 border-l-4",
                  activeSceneId === scene.id 
                    ? "bg-blue-100 border-l-blue-500 active" 
                    : "bg-gray-50 border-l-gray-200",
                )}
                onClick={() => onSceneSelect(scene.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">
                      Scene {scene.sceneNumber}
                    </span>
                    <p className="text-xs text-gray-600">
                      {scene.location}
                      {scene.timeOfDay && ` - ${scene.timeOfDay}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {vfxSceneIds.includes(scene.id) && (
                      <Sparkles className="h-4 w-4 text-purple-500" title="VFX Scene" />
                    )}
                    {brandableSceneIds.includes(scene.id) && (
                      <Star className="h-5 w-5 text-green-500 brandable-indicator" title="Brandable Scene" />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      {brandableSceneIds.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800 mb-2 font-medium">
              {`VADIS AI SUGGESTED BRANDABLE SCENES`}
            </p>
            <p className="text-xs text-green-600 mb-2">
              {`There are ${scenes.filter((scene: Scene) => brandableSceneIds.includes(scene.id)).length} scenes with product placement potential. Vadis AI has suggested the following scenes for their branding potential:`}
            </p>
            <div className="max-h-24 overflow-y-auto">
              <ul className="text-xs text-green-700 space-y-1 pr-2">
                {scenes
                  .filter((scene: Scene) => brandableSceneIds.includes(scene.id))
                  .map((scene: Scene) => {
                    const category = scene.productPlacementOpportunities?.length
                      ? scene.productPlacementOpportunities[0]
                      : "Product";

                    return (
                      <li key={scene.id} className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-green-600 flex-shrink-0" />
                        Scene {scene.sceneNumber}: {scene.location.length > 30 ? scene.location.substring(0, 30) + "..." : scene.location} ({category})
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VFX Scenes Summary */}
      {scenes.length > 0 && vfxSceneIds.length > 0 && (
        <div className="mt-4">
          <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
            <p className="text-sm text-purple-800 mb-2 font-medium">
              {`VADIS AI SUGGESTED VFX SCENES`}
            </p>
            <p className="text-xs text-purple-600 mb-2">
              {`There are ${vfxSceneIds.length} scenes with VFX potential. Vadis AI has suggested the following scenes for their VFX potential:`}
            </p>
            <div className="max-h-24 overflow-y-auto">
              <ul className="text-xs text-purple-700 space-y-1 pr-2">
                {scenes
                  .filter((scene: Scene) => vfxSceneIds.includes(scene.id))
                  .map((scene: Scene) => {
                    return (
                      <li key={scene.id} className="flex items-center">
                        <Sparkles className="h-4 w-4 mr-1 text-purple-600 flex-shrink-0" />
                        Scene {scene.sceneNumber}: {scene.location.length > 30 ? scene.location.substring(0, 30) + "..." : scene.location}
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}