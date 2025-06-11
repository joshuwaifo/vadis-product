import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Film, Layers, Clock, MapPin, Users, Camera, 
  Maximize2, Play, Pause, SkipForward, SkipBack, X,
  Loader2, Image as ImageIcon, Info
} from 'lucide-react';
import StoryboardSceneView from '@/components/script/StoryboardSceneView';

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

interface SceneSegment {
  id: string;
  title: string;
  description: string;
  scenes: Scene[];
  startPage: number;
  endPage: number;
  estimatedDuration: number;
  keyCharacters: string[];
  plotPoints: string[];
  tone: string;
  pacing: string;
}

interface SceneAnalysisViewProps {
  projectId: number;
  projectTitle: string;
  onClose?: () => void;
}

export default function SceneAnalysisView({ projectId, projectTitle, onClose }: SceneAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'storyboard'>('breakdown');
  const [showStoryboardView, setShowStoryboardView] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<SceneSegment | null>(null);

  // Fetch scenes data
  const { data: scenes = [], isLoading: scenesLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/scenes`],
    enabled: !!projectId
  });

  // Fetch scene breakdown data
  const { data: sceneBreakdown, isLoading: breakdownLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/scene-breakdown`],
    enabled: !!projectId
  });

  // Fetch project data for page count
  const { data: project } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId
  });

  const segments: SceneSegment[] = sceneBreakdown?.segments || [];

  const handleStoryboardView = () => {
    setShowStoryboardView(true);
  };

  const handleSegmentSelect = (segment: SceneSegment) => {
    setSelectedSegment(segment);
  };

  if (showStoryboardView) {
    return (
      <StoryboardSceneView
        scenes={scenes}
        onClose={() => setShowStoryboardView(false)}
        projectTitle={projectTitle}
        pageCount={project?.pageCount}
        projectId={projectId}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Film className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Scene Analysis</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Breakdown and storyboard visualization for {projectTitle}
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'breakdown' | 'storyboard')} className="flex-1 flex flex-col">
          <div className="flex-shrink-0 px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="breakdown" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Scene Breakdown
              </TabsTrigger>
              <TabsTrigger value="storyboard" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Storyboard
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Scene Breakdown Tab */}
          <TabsContent value="breakdown" className="flex-1 px-6 pb-6 mt-4">
            {breakdownLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading scene breakdown...</p>
                </div>
              </div>
            ) : segments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Segments List */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Narrative Segments ({segments.length})
                  </h3>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      {segments.map((segment, index) => (
                        <Card 
                          key={segment.id}
                          className={`cursor-pointer transition-all ${
                            selectedSegment?.id === segment.id 
                              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => handleSegmentSelect(segment)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                Segment {index + 1}
                              </Badge>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {segment.estimatedDuration}min
                              </div>
                            </div>
                            <CardTitle className="text-base font-semibold">
                              {segment.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {segment.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {segment.scenes.slice(0, 3).map((scene) => (
                                <Badge key={scene.id} variant="secondary" className="text-xs">
                                  Scene {scene.sceneNumber}
                                </Badge>
                              ))}
                              {segment.scenes.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{segment.scenes.length - 3} more
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Pages {segment.startPage}-{segment.endPage}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Segment Details */}
                <div className="lg:col-span-2">
                  {selectedSegment ? (
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl">{selectedSegment.title}</CardTitle>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {selectedSegment.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {selectedSegment.estimatedDuration}min
                            </div>
                            <div>
                              Pages {selectedSegment.startPage}-{selectedSegment.endPage}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[500px]">
                          <div className="space-y-6">
                            {/* Segment Metadata */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Tone</h4>
                                <Badge variant="outline">{selectedSegment.tone}</Badge>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Pacing</h4>
                                <Badge variant="outline">{selectedSegment.pacing}</Badge>
                              </div>
                            </div>

                            {/* Key Characters */}
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Key Characters
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedSegment.keyCharacters.map((character, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {character}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Plot Points */}
                            <div>
                              <h4 className="font-semibold mb-2">Key Plot Points</h4>
                              <ul className="space-y-2">
                                {selectedSegment.plotPoints.map((point, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-sm">{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Scenes in Segment */}
                            <div>
                              <h4 className="font-semibold mb-2">Scenes in Segment</h4>
                              <div className="space-y-3">
                                {selectedSegment.scenes.map((scene) => (
                                  <Card key={scene.id} className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <Badge variant="outline">Scene {scene.sceneNumber}</Badge>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <MapPin className="h-3 w-3" />
                                        {scene.location}
                                        <span>•</span>
                                        {scene.timeOfDay}
                                      </div>
                                    </div>
                                    <p className="text-sm font-medium mb-2">{scene.description}</p>
                                    <div className="flex flex-wrap gap-1">
                                      {scene.characters.map((character, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {character}
                                        </Badge>
                                      ))}
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a segment to view details</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <Card className="h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No scene breakdown available. Run Scene Analysis first.</p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Storyboard Tab */}
          <TabsContent value="storyboard" className="flex-1 px-6 pb-6 mt-4">
            {scenesLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading scenes...</p>
                </div>
              </div>
            ) : scenes.length > 0 ? (
              <div className="space-y-6">
                {/* Storyboard Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Storyboard Overview
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Visual representation of your screenplay with AI-generated storyboard frames
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {scenes.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Scenes</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {project?.pageCount || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Script Pages</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {Math.round(scenes.reduce((sum, scene) => sum + scene.duration, 0))}min
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Est. Runtime</div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={handleStoryboardView} className="flex items-center gap-2">
                        <Maximize2 className="h-4 w-4" />
                        Open Full Storyboard View
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Scene Preview Grid */}
                <Card>
                  <CardHeader>
                    <CardTitle>Scene Preview</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quick overview of all scenes in your screenplay
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scenes.slice(0, 12).map((scene: Scene) => (
                          <Card key={scene.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                Scene {scene.sceneNumber}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {scene.duration}min
                              </div>
                            </div>
                            <h4 className="font-medium text-sm mb-2 truncate">
                              {scene.description || `Scene ${scene.sceneNumber}`}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{scene.location}</span>
                              <span>•</span>
                              <span>{scene.timeOfDay}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {scene.characters.slice(0, 2).map((character, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {character}
                                </Badge>
                              ))}
                              {scene.characters.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{scene.characters.length - 2}
                                </Badge>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                      {scenes.length > 12 && (
                        <div className="text-center mt-4">
                          <Button variant="outline" onClick={handleStoryboardView}>
                            View All {scenes.length} Scenes
                          </Button>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No scenes available. Run Scene Analysis first.</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}