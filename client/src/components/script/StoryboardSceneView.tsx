import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Play, Pause, SkipForward, SkipBack, Maximize2, 
  Clock, MapPin, Users, Camera, X, Info, Image as ImageIcon, Loader2
} from 'lucide-react';

interface Scene {
  id: string;
  sceneNumber: number;
  location: string;
  timeOfDay: string;
  description: string;
  characters: string[];
  content: string;
  pageStart: number;
  pageEnd: number;
  duration: number;
  vfxNeeds: string[];
  productPlacementOpportunities: string[];
}

interface StoryboardSceneViewProps {
  scenes: Scene[];
  onClose: () => void;
  projectTitle: string;
  pageCount?: number;
  projectId?: number;
}

interface StoryboardImage {
  id: number;
  sceneId: number;
  imageUrl: string;
  prompt: string;
  charactersPresent: string[];
  generatedAt: Date;
}

export default function StoryboardSceneView({ scenes, onClose, projectTitle, pageCount, projectId }: StoryboardSceneViewProps) {
  const [selectedScene, setSelectedScene] = useState<Scene | null>(scenes[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [backgroundGeneration, setBackgroundGeneration] = useState({
    isGenerating: false,
    completed: 0,
    currentScene: ''
  });
  const queryClient = useQueryClient();

  // Get storyboard image for the selected scene
  const { data: storyboardImage, isLoading: imageLoading } = useQuery({
    queryKey: ['storyboard', selectedScene?.id],
    queryFn: async () => {
      if (!selectedScene) return null;
      const response = await fetch(`/api/scenes/${selectedScene.id}/storyboard`);
      if (response.status === 404) return null; // No image exists yet
      if (!response.ok) throw new Error('Failed to fetch storyboard image');
      const data = await response.json();
      return data.storyboardImage as StoryboardImage;
    },
    enabled: !!selectedScene
  });

  // Generate storyboard image mutation
  const generateImageMutation = useMutation({
    mutationFn: async (sceneId: string) => {
      const response = await fetch(`/api/scenes/${sceneId}/storyboard`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to generate storyboard image');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storyboard', selectedScene?.id] });
    }
  });

  // Auto-generate all storyboard images in background when component mounts
  const generateAllImagesMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await fetch(`/api/projects/${projectId}/storyboard/generate`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to generate project storyboard');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all storyboard queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['storyboard'] });
    }
  });

  // Get all storyboard images for the project to track progress
  const { data: allStoryboardData } = useQuery({
    queryKey: ['/api/projects', projectId, 'storyboard'],
    enabled: !!projectId,
    refetchInterval: 3000, // Poll every 3 seconds for new images
  });

  // Calculate generation progress
  const storyboardImages = (allStoryboardData as any)?.storyboardImages || [];
  const completedScenes = storyboardImages.length;
  const totalScenes = scenes.length;
  const generationProgress = totalScenes > 0 ? Math.round((completedScenes / totalScenes) * 100) : 0;
  const isGenerating = completedScenes < totalScenes;

  // Find existing storyboard image for current scene
  const currentSceneImage = storyboardImages.find((img: any) => 
    img.sceneId === parseInt(selectedScene?.id || '0')
  );

  // Start background generation when component mounts if projectId is available
  useEffect(() => {
    if (projectId && scenes.length > 0 && storyboardImages !== undefined) {
      const existingCount = storyboardImages.length;
      
      // Only start generation if we don't have all images
      if (existingCount < scenes.length) {
        setBackgroundGeneration(prev => ({
          ...prev,
          isGenerating: true,
          completed: existingCount,
          currentScene: scenes[existingCount]?.description || `Scene ${scenes[existingCount]?.sceneNumber}`
        }));
        generateAllImagesMutation.mutate(projectId);
        
        // Set up polling to refresh images as they become available
        const pollForNewImages = () => {
          queryClient.invalidateQueries({ queryKey: ['project-storyboard', projectId] });
          queryClient.invalidateQueries({ queryKey: ['scene-storyboard'] });
        };
        
        const pollInterval = setInterval(pollForNewImages, 2000); // Poll every 2 seconds
        
        // Clear interval when component unmounts or generation completes
        return () => clearInterval(pollInterval);
      } else {
        setBackgroundGeneration(prev => ({
          ...prev,
          isGenerating: false,
          completed: existingCount
        }));
      }
    }
  }, [projectId, scenes.length, storyboardImages?.length]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && scenes.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          const nextIndex = (prev + 1) % scenes.length;
          setSelectedScene(scenes[nextIndex]);
          return nextIndex;
        });
      }, 3000); // 3 seconds per scene

      return () => clearInterval(interval);
    }
  }, [isPlaying, scenes]);

  const handleSceneSelect = (scene: Scene, index: number) => {
    setSelectedScene(scene);
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : scenes.length - 1;
    setCurrentIndex(prevIndex);
    setSelectedScene(scenes[prevIndex]);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % scenes.length;
    setCurrentIndex(nextIndex);
    setSelectedScene(scenes[nextIndex]);
  };

  // Use actual PDF page count for estimated runtime (1 page = 1 minute industry standard)
  // Fall back to scene duration sum if pageCount is not available
  const estimatedRuntime = pageCount || Math.round(scenes.reduce((sum, scene) => sum + scene.duration, 0));

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-xl font-bold text-white truncate">{projectTitle}</h1>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Scene Storyboard View</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-6 ml-2 sm:ml-8">
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold text-white">{scenes.length}</div>
                <div className="text-xs text-gray-400">Scenes</div>
              </div>
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold text-blue-400">{estimatedRuntime}min</div>
                <div className="text-xs text-gray-400 hidden sm:block">Est. Runtime</div>
                <div className="text-xs text-gray-400 sm:hidden">Runtime</div>
              </div>
              {isGenerating && (
                <div className="text-center">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 text-blue-400 animate-spin" />
                    <span className="text-sm font-bold text-blue-400">
                      {completedScenes}/{totalScenes}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 hidden sm:block">AI Generating</div>
                  <div className="text-xs text-gray-400 sm:hidden">AI Gen</div>
                  <div className="text-xs text-blue-300 mt-1">
                    {generationProgress}% complete
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Playback Controls */}
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-800 rounded-lg p-1 sm:p-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePrevious}
                className="text-white hover:bg-gray-700 h-8 w-8 p-0"
              >
                <SkipBack className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:bg-gray-700 h-8 w-8 p-0"
              >
                {isPlaying ? <Pause className="h-3 w-3 sm:h-4 sm:w-4" /> : <Play className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleNext}
                className="text-white hover:bg-gray-700 h-8 w-8 p-0"
              >
                <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-gray-800 h-8 w-8 p-0"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Scene Preview Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-950 to-black min-h-0">
          {selectedScene ? (
            <div className="flex-1 flex flex-col p-3 sm:p-6 lg:p-8 overflow-hidden">
              {/* Scene Header */}
              <div className="mb-4 sm:mb-6 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Badge className="bg-blue-600 text-white text-sm sm:text-lg px-3 py-1 sm:px-4 sm:py-2 w-fit">
                      Scene {selectedScene.sceneNumber}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                    <span>Pages {selectedScene.pageStart}-{selectedScene.pageEnd}</span>
                    <span>•</span>
                    <span>{selectedScene.duration}min</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                  {selectedScene.description || `Scene ${selectedScene.sceneNumber}`}
                </h2>
              </div>

              {/* Scene Content */}
              <div className="flex-1 bg-gray-900/50 rounded-xl p-3 sm:p-6 border border-gray-800 min-h-0 flex flex-col gap-4 sm:gap-6">
                {/* Script Content */}
                <div className="flex-1 min-h-0">
                  <ScrollArea className="h-full">
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-200 text-xs sm:text-sm lg:text-lg leading-6 sm:leading-7 lg:leading-8 font-mono">
                        {selectedScene.content}
                      </div>
                    </div>
                  </ScrollArea>
                </div>

                {/* Storyboard Image Section */}
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <Camera className="h-4 w-4 text-blue-400" />
                    <h3 className="text-sm sm:text-base font-semibold text-white">Storyboard Frame</h3>
                    {backgroundGeneration.isGenerating && (
                      <div className="flex items-center gap-2 text-xs text-blue-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>AI generating images...</span>
                      </div>
                    )}
                  </div>

                  {/* Image Display Area */}
                  <div className="relative">
                    {imageLoading && (
                      <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                        <div className="text-center text-gray-400">
                          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                          <p className="text-sm">Loading storyboard...</p>
                        </div>
                      </div>
                    )}
                    
                    {storyboardImage && (
                      <div className="space-y-3">
                        <div className="relative">
                          <img
                            src={storyboardImage.imageUrl}
                            alt={`Storyboard for Scene ${selectedScene?.sceneNumber}`}
                            className="w-full aspect-video object-cover rounded-lg border border-gray-700"
                            onError={(e) => {
                              console.error('Failed to load storyboard image');
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          {/* Character tags overlay */}
                          {storyboardImage.charactersPresent && storyboardImage.charactersPresent.length > 0 && (
                            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                              {storyboardImage.charactersPresent.map((character, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-black/60 text-white border-gray-600">
                                  {character}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Image metadata */}
                        <div className="text-xs text-gray-400 space-y-1">
                          <p><span className="text-gray-300">Generated:</span> {new Date(storyboardImage.generatedAt).toLocaleString()}</p>
                          {storyboardImage.charactersPresent && storyboardImage.charactersPresent.length > 0 && (
                            <p><span className="text-gray-300">Characters:</span> {storyboardImage.charactersPresent.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {!storyboardImage && !imageLoading && (
                      <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 border-dashed">
                        <div className="text-center text-gray-400">
                          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          {backgroundGeneration.isGenerating ? (
                            <>
                              <p className="text-sm font-medium mb-1">Storyboard generating...</p>
                              <p className="text-xs">AI is creating visual representations for all scenes</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium mb-1">No storyboard image</p>
                              <p className="text-xs">Images will generate automatically after scene extraction</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {generateImageMutation.isPending && (
                      <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                        <div className="text-center text-gray-400">
                          <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin" />
                          <p className="text-sm font-medium mb-1">Generating storyboard frame...</p>
                          <p className="text-xs">Creating character-consistent visualization</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Scene Metadata */}
              <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 flex-shrink-0">
                {selectedScene.characters.length > 0 && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                        <h4 className="font-semibold text-white text-sm sm:text-base">Characters</h4>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {selectedScene.characters.map((character, idx) => (
                          <Badge key={idx} variant="outline" className="text-gray-300 border-gray-600 text-xs">
                            {character}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedScene.vfxNeeds.length > 0 && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                        <h4 className="font-semibold text-white text-sm sm:text-base">VFX Needs</h4>
                      </div>
                      <div className="space-y-1">
                        {selectedScene.vfxNeeds.slice(0, 3).map((vfx, idx) => (
                          <div key={idx} className="text-xs sm:text-sm text-gray-300">{vfx}</div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedScene.productPlacementOpportunities.length > 0 && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Info className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                        <h4 className="font-semibold text-white text-sm sm:text-base">Product Placement</h4>
                      </div>
                      <div className="space-y-1">
                        {selectedScene.productPlacementOpportunities.slice(0, 3).map((opportunity, idx) => (
                          <div key={idx} className="text-xs sm:text-sm text-gray-300">{opportunity}</div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center text-gray-400">
                <Camera className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg sm:text-xl">Select a scene to view details</p>
              </div>
            </div>
          )}
        </div>

        {/* Scene Grid Sidebar - Responsive */}
        <div className="w-full lg:w-80 xl:w-96 bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col max-h-80 lg:max-h-none">
          <div className="p-3 sm:p-4 border-b border-gray-800 flex-shrink-0">
            <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Scene Overview</h3>
            <div className="text-xs sm:text-sm text-gray-400">
              {currentIndex + 1} of {scenes.length} scenes
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3">
                {scenes.map((scene, index) => (
                  <Card
                    key={scene.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedScene?.id === scene.id
                        ? 'bg-blue-600 border-blue-500 shadow-lg'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
                    }`}
                    onClick={() => handleSceneSelect(scene, index)}
                  >
                    <CardContent className="p-2 sm:p-3">
                      <div className="text-center">
                        <div className={`text-sm sm:text-lg font-bold mb-1 ${
                          selectedScene?.id === scene.id ? 'text-white' : 'text-gray-200'
                        }`}>
                          {scene.sceneNumber}
                        </div>
                        <div className={`text-xs mb-1 sm:mb-2 truncate leading-tight ${
                          selectedScene?.id === scene.id ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                          {scene.description ? 
                            scene.description.slice(0, 30) + (scene.description.length > 30 ? '...' : '') 
                            : `Scene ${scene.sceneNumber}`
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Bottom Progress Bar */}
          <div className="p-3 sm:p-4 border-t border-gray-800 flex-shrink-0">
            <div className="mb-2 flex justify-between text-xs sm:text-sm text-gray-400">
              <span>Progress</span>
              <span>{Math.round(((currentIndex + 1) / scenes.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / scenes.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}