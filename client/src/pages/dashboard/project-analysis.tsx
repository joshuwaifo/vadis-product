import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Camera, 
  DollarSign, 
  MapPin, 
  Star,
  TrendingUp,
  FileText,
  Download,
  Share2
} from "lucide-react";
import DashboardLayout from "./dashboard-layout";
import { Link } from "wouter";

interface Project {
  id: number;
  title: string;
  status: string;
}

interface Character {
  id: number;
  name: string;
  description?: string;
  age?: string;
  gender?: string;
  importance?: string;
  screenTime?: number;
  characterArc?: string;
  personality?: string[];
}

interface Scene {
  id: number;
  sceneNumber: number;
  location: string;
  timeOfDay?: string;
  description?: string;
  duration?: number;
  characters?: string[];
  vfxNeeds?: string[];
}

interface ActorSuggestion {
  id: number;
  characterName: string;
  actorName: string;
  reasoning?: string;
  fitScore?: number;
  availability?: string;
  estimatedFee?: string;
  workingRelationships?: string[];
}

interface VFXNeed {
  id: number;
  sceneId: string;
  vfxType: string;
  complexity: string;
  estimatedCost?: number;
  description: string;
}

interface ProductPlacement {
  id: number;
  sceneId: string;
  brand: string;
  product: string;
  placement: string;
  estimatedValue?: number;
}

interface LocationSuggestion {
  id: number;
  sceneId: string;
  locationType: string;
  location: string;
  city: string;
  state: string;
  country: string;
  taxIncentive?: number;
  estimatedCost?: number;
}

export default function ProjectAnalysis() {
  const params = useParams();
  const projectId = params.id;

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: charactersData } = useQuery<{ characters: Character[] }>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: scenes } = useQuery<Scene[]>({
    queryKey: [`/api/projects/${projectId}/scenes`],
  });

  const { data: actors } = useQuery<ActorSuggestion[]>({
    queryKey: [`/api/projects/${projectId}/actors`],
  });

  const { data: vfx } = useQuery<VFXNeed[]>({
    queryKey: [`/api/projects/${projectId}/vfx`],
  });

  const { data: productPlacements } = useQuery<ProductPlacement[]>({
    queryKey: [`/api/projects/${projectId}/product-placements`],
  });

  const { data: locations } = useQuery<LocationSuggestion[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  const characters = charactersData?.characters || [];

  if (projectLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">The analysis for this project is not available.</p>
          <Link href="/dashboard/projects">
            <Button className="mt-4">Back to Projects</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const leadCharacters = characters.filter(c => c.importance === 'lead');
  const totalBudgetEstimate = (vfx || []).reduce((sum, item) => sum + (item.estimatedCost || 0), 0) +
                             (locations || []).reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analysis: {project.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive AI-powered script analysis and production insights
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share Analysis
            </Button>
            <Link href={`/dashboard/projects/${projectId}`}>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Back to Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Characters</p>
                  <p className="font-semibold text-xl">{characters.length}</p>
                  <p className="text-xs text-gray-500">{leadCharacters.length} leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Camera className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Scenes</p>
                  <p className="font-semibold text-xl">{scenes?.length || 0}</p>
                  <p className="text-xs text-gray-500">
                    {scenes?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0} min total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cast Suggestions</p>
                  <p className="font-semibold text-xl">{actors?.length || 0}</p>
                  <p className="text-xs text-gray-500">AI-powered matching</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Est. Budget</p>
                  <p className="font-semibold text-xl">
                    ${totalBudgetEstimate > 0 ? (totalBudgetEstimate / 1000000).toFixed(1) + 'M' : 'TBD'}
                  </p>
                  <p className="text-xs text-gray-500">Production costs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Tabs */}
        <Tabs defaultValue="characters" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="characters">Characters</TabsTrigger>
            <TabsTrigger value="casting">Casting</TabsTrigger>
            <TabsTrigger value="scenes">Scenes</TabsTrigger>
            <TabsTrigger value="vfx">VFX</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="characters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Character Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {characters.length > 0 ? (
                  <div className="space-y-6">
                    {characters.map((character) => (
                      <div key={character.id} className="border rounded-lg p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{character.name}</h3>
                            <div className="flex gap-2 mt-2">
                              {character.importance && (
                                <Badge className={
                                  character.importance === 'lead' ? 'bg-blue-100 text-blue-800' :
                                  character.importance === 'supporting' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {character.importance}
                                </Badge>
                              )}
                              {character.age && (
                                <Badge variant="outline">{character.age}</Badge>
                              )}
                              {character.gender && (
                                <Badge variant="outline">{character.gender}</Badge>
                              )}
                            </div>
                          </div>
                          {character.screenTime && (
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Screen Time</p>
                              <p className="text-lg font-semibold">{character.screenTime} min</p>
                            </div>
                          )}
                        </div>
                        
                        {character.description && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                            <p className="text-gray-700 dark:text-gray-300">{character.description}</p>
                          </div>
                        )}

                        {character.personality && character.personality.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Personality Traits</h4>
                            <div className="flex flex-wrap gap-1">
                              {character.personality.map((trait, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {character.characterArc && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Character Arc</h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{character.characterArc}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No character analysis available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="casting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Casting Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                {actors && actors.length > 0 ? (
                  <div className="space-y-4">
                    {actors.map((actor) => (
                      <div key={actor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{actor.actorName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">for <span className="font-medium">{actor.characterName}</span></p>
                          </div>
                          <div className="flex items-center gap-3">
                            {actor.fitScore && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{actor.fitScore}%</div>
                                <div className="text-xs text-gray-500">Fit Score</div>
                              </div>
                            )}
                            {actor.estimatedFee && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {actor.estimatedFee}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {actor.reasoning && (
                          <div className="mb-3">
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{actor.reasoning}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          {actor.availability && (
                            <span>Available: {actor.availability}</span>
                          )}
                          {actor.workingRelationships && actor.workingRelationships.length > 0 && (
                            <span>Previous collaborations: {actor.workingRelationships.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No casting suggestions available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scene Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {scenes && scenes.length > 0 ? (
                  <div className="space-y-4">
                    {scenes.map((scene) => (
                      <div key={scene.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold">Scene {scene.sceneNumber}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {scene.location}
                            </div>
                            {scene.timeOfDay && (
                              <span>{scene.timeOfDay}</span>
                            )}
                            {scene.duration && (
                              <span>{scene.duration} min</span>
                            )}
                          </div>
                        </div>
                        
                        {scene.description && (
                          <p className="text-gray-700 dark:text-gray-300 mb-3">{scene.description}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm">
                          {scene.characters && scene.characters.length > 0 && (
                            <div>
                              <span className="font-medium">Characters: </span>
                              <span className="text-gray-600">{scene.characters.join(', ')}</span>
                            </div>
                          )}
                          {scene.vfxNeeds && scene.vfxNeeds.length > 0 && (
                            <div>
                              <span className="font-medium">VFX Needs: </span>
                              <span className="text-gray-600">{scene.vfxNeeds.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No scene analysis available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vfx" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>VFX Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {vfx && vfx.length > 0 ? (
                  <div className="space-y-4">
                    {vfx.map((effect) => (
                      <div key={effect.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{effect.vfxType}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              effect.complexity === 'low' ? 'bg-green-100 text-green-800' :
                              effect.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              effect.complexity === 'high' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {effect.complexity} complexity
                            </Badge>
                            {effect.estimatedCost && (
                              <Badge variant="outline">
                                ${effect.estimatedCost.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{effect.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No VFX analysis available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Location Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                {locations && locations.length > 0 ? (
                  <div className="space-y-4">
                    {locations.map((location) => (
                      <div key={location.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{location.location}</h3>
                            <p className="text-sm text-gray-600">{location.city}, {location.state}, {location.country}</p>
                          </div>
                          <div className="text-right">
                            {location.taxIncentive && (
                              <Badge className="bg-green-100 text-green-800 mb-1">
                                {location.taxIncentive}% tax incentive
                              </Badge>
                            )}
                            {location.estimatedCost && (
                              <p className="text-sm font-medium">${location.estimatedCost.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Type: {location.locationType}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No location suggestions available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                {productPlacements && productPlacements.length > 0 ? (
                  <div className="space-y-4">
                    {productPlacements.map((placement) => (
                      <div key={placement.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{placement.brand} - {placement.product}</h3>
                            <p className="text-sm text-gray-600">Placement: {placement.placement}</p>
                          </div>
                          {placement.estimatedValue && (
                            <Badge className="bg-green-100 text-green-800">
                              ${placement.estimatedValue.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">Total Revenue Potential</h4>
                      <p className="text-2xl font-bold text-green-600">
                        ${productPlacements.reduce((sum, p) => sum + (p.estimatedValue || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No revenue analysis available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}