import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Users, Camera, Zap, MapPin, DollarSign, Star } from "lucide-react";
import { Link } from "wouter";

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

interface Character {
  id: number;
  name: string;
  description: string | null;
  age: string | null;
  gender: string | null;
  personality: string[] | null;
  importance: string | null;
  screenTime: number | null;
  characterArc: string | null;
}

interface CastingRecommendation {
  id: number;
  characterName: string;
  actorName: string;
  reasoning: string | null;
  fitScore: number | null;
  estimatedFee: string | null;
}

interface LocationSuggestion {
  id: number;
  sceneId: number;
  location: string;
  city: string;
  state: string;
  country: string;
  taxIncentive: number | null;
  estimatedCost: number | null;
  logistics: string | null;
  weatherConsiderations: string | null;
}

interface FinancialPlan {
  id: number;
  totalBudget: number | null;
  budgetBreakdown: {
    preProduction: number;
    production: number;
    postProduction: number;
    marketing: number;
    contingency: number;
  } | null;
  revenueProjections: {
    domestic: number;
    international: number;
    streaming: number;
    merchandise: number;
    productPlacement: number;
  } | null;
  roi: string | null;
  breakEvenPoint: number | null;
}

function SceneBreakdown({ scenes, projectTitle }: { scenes: Scene[]; projectTitle: string }) {
  const vfxScenes = scenes.filter(scene => scene.vfxNeeds && scene.vfxNeeds.length > 0);
  const brandableScenes = scenes.filter(scene => scene.productPlacementOpportunities && scene.productPlacementOpportunities.length > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Scenes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{scenes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              VFX Scenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{vfxScenes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Brandable Scenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{brandableScenes.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scene Breakdown for "{projectTitle}"</CardTitle>
          <CardDescription>Complete scene-by-scene analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {scenes.map((scene) => (
                <Card key={scene.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Scene {scene.sceneNumber}</CardTitle>
                        <CardDescription>{scene.location} - {scene.timeOfDay || 'Time not specified'}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {scene.vfxNeeds && scene.vfxNeeds.length > 0 && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            <Zap className="h-3 w-3 mr-1" />
                            VFX
                          </Badge>
                        )}
                        {scene.productPlacementOpportunities && scene.productPlacementOpportunities.length > 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Star className="h-3 w-3 mr-1" />
                            Brandable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {scene.description && (
                      <p className="text-sm text-muted-foreground mb-3">{scene.description}</p>
                    )}
                    {scene.characters && scene.characters.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium">Characters: </span>
                        <span className="text-sm">{scene.characters.join(', ')}</span>
                      </div>
                    )}
                    {scene.duration && (
                      <div className="mb-3">
                        <span className="text-sm font-medium">Estimated Duration: </span>
                        <span className="text-sm">{scene.duration} minutes</span>
                      </div>
                    )}
                    {scene.vfxNeeds && scene.vfxNeeds.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-purple-700">VFX Needs: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {scene.vfxNeeds.map((vfx, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {vfx}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {scene.productPlacementOpportunities && scene.productPlacementOpportunities.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-green-700">Product Placement Opportunities: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {scene.productPlacementOpportunities.map((opportunity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {opportunity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function CharacterAnalysis({ characters }: { characters: Character[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Characters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{characters.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lead Characters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {characters.filter(c => c.importance === 'lead').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {characters.map((character) => (
          <Card key={character.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{character.name}</CardTitle>
                  <CardDescription>
                    {character.age && `${character.age} • `}
                    {character.gender && `${character.gender} • `}
                    {character.importance && character.importance.charAt(0).toUpperCase() + character.importance.slice(1)}
                  </CardDescription>
                </div>
                {character.importance === 'lead' && (
                  <Badge variant="default">Lead</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {character.description && (
                <p className="text-sm text-muted-foreground mb-3">{character.description}</p>
              )}
              {character.personality && character.personality.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm font-medium">Personality Traits: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {character.personality.map((trait, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {character.screenTime && (
                <div className="mb-3">
                  <span className="text-sm font-medium">Screen Time: </span>
                  <span className="text-sm">{character.screenTime} minutes</span>
                </div>
              )}
              {character.characterArc && (
                <div>
                  <span className="text-sm font-medium">Character Arc: </span>
                  <p className="text-sm text-muted-foreground">{character.characterArc}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CastingRecommendations({ recommendations }: { recommendations: CastingRecommendation[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Casting Recommendations
          </CardTitle>
          <CardDescription>AI-suggested actors for each character</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{rec.actorName}</CardTitle>
                      <CardDescription>for {rec.characterName}</CardDescription>
                    </div>
                    <div className="text-right">
                      {rec.fitScore && (
                        <Badge variant="secondary" className="mb-2">
                          {rec.fitScore}% fit
                        </Badge>
                      )}
                      {rec.estimatedFee && (
                        <div className="text-sm text-muted-foreground">{rec.estimatedFee}</div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {rec.reasoning && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LocationSuggestions({ locations }: { locations: LocationSuggestion[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Suggestions
          </CardTitle>
          <CardDescription>Recommended filming locations with incentives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((location) => (
              <Card key={location.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{location.location}</CardTitle>
                  <CardDescription>{location.city}, {location.state}, {location.country}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {location.taxIncentive && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Tax Incentive:</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {location.taxIncentive}%
                        </Badge>
                      </div>
                    )}
                    {location.estimatedCost && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Estimated Cost:</span>
                        <span className="text-sm">${location.estimatedCost.toLocaleString()}</span>
                      </div>
                    )}
                    {location.logistics && (
                      <div>
                        <span className="text-sm font-medium">Logistics: </span>
                        <p className="text-sm text-muted-foreground">{location.logistics}</p>
                      </div>
                    )}
                    {location.weatherConsiderations && (
                      <div>
                        <span className="text-sm font-medium">Weather: </span>
                        <p className="text-sm text-muted-foreground">{location.weatherConsiderations}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinancialAnalysis({ financialPlan }: { financialPlan: FinancialPlan | null }) {
  if (!financialPlan) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No financial analysis available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialPlan.totalBudget?.toLocaleString() || 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Projected ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {financialPlan.roi || 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Break Even</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialPlan.breakEvenPoint?.toLocaleString() || 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Revenue Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${((financialPlan.revenueProjections?.domestic || 0) + 
                 (financialPlan.revenueProjections?.international || 0) + 
                 (financialPlan.revenueProjections?.streaming || 0)).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {financialPlan.budgetBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">Pre-Production</div>
                <div className="text-2xl font-bold text-orange-600">
                  ${financialPlan.budgetBreakdown.preProduction.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">Production</div>
                <div className="text-2xl font-bold text-red-600">
                  ${financialPlan.budgetBreakdown.production.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">Post-Production</div>
                <div className="text-2xl font-bold text-purple-600">
                  ${financialPlan.budgetBreakdown.postProduction.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">Marketing</div>
                <div className="text-2xl font-bold text-green-600">
                  ${financialPlan.budgetBreakdown.marketing.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">Contingency</div>
                <div className="text-2xl font-bold text-gray-600">
                  ${financialPlan.budgetBreakdown.contingency.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {financialPlan.revenueProjections && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">Domestic</div>
                <div className="text-2xl font-bold text-blue-600">
                  ${financialPlan.revenueProjections.domestic.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">International</div>
                <div className="text-2xl font-bold text-green-600">
                  ${financialPlan.revenueProjections.international.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">Streaming</div>
                <div className="text-2xl font-bold text-purple-600">
                  ${financialPlan.revenueProjections.streaming.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">Merchandise</div>
                <div className="text-2xl font-bold text-orange-600">
                  ${financialPlan.revenueProjections.merchandise.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">Product Placement</div>
                <div className="text-2xl font-bold text-yellow-600">
                  ${financialPlan.revenueProjections.productPlacement.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalysisResults() {
  const { id } = useParams();
  const projectId = parseInt(id!);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['/api/projects', projectId],
  });

  const { data: scenes = [], isLoading: scenesLoading } = useQuery({
    queryKey: ['/api/projects', projectId, 'scenes'],
  });

  const { data: characters = [], isLoading: charactersLoading } = useQuery({
    queryKey: ['/api/projects', projectId, 'characters'],
  });

  const { data: castingRecommendations = [], isLoading: castingLoading } = useQuery({
    queryKey: ['/api/projects', projectId, 'casting'],
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['/api/projects', projectId, 'locations'],
  });

  const { data: financialPlan, isLoading: financialLoading } = useQuery({
    queryKey: ['/api/projects', projectId, 'financial-plan'],
  });

  const isLoading = projectLoading || scenesLoading || charactersLoading || castingLoading || locationsLoading || financialLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">Comprehensive Script Analysis Results</p>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="scenes" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Scenes
          </TabsTrigger>
          <TabsTrigger value="characters" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Characters
          </TabsTrigger>
          <TabsTrigger value="casting" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Casting
          </TabsTrigger>
          <TabsTrigger value="vfx" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            VFX
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
              <CardDescription>Comprehensive analysis overview</CardDescription>
            </CardHeader>
            <CardContent>
              {project.readerReport ? (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{project.readerReport}</div>
                </div>
              ) : (
                <p className="text-muted-foreground">No summary available. Run analysis to generate comprehensive report.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenes">
          <SceneBreakdown scenes={scenes} projectTitle={project.title} />
        </TabsContent>

        <TabsContent value="characters">
          <CharacterAnalysis characters={characters} />
        </TabsContent>

        <TabsContent value="casting">
          <CastingRecommendations recommendations={castingRecommendations} />
        </TabsContent>

        <TabsContent value="vfx">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                VFX Analysis
              </CardTitle>
              <CardDescription>Visual effects requirements and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scenes
                  .filter(scene => scene.vfxNeeds && scene.vfxNeeds.length > 0)
                  .map((scene) => (
                    <Card key={scene.id} className="border-l-4 border-l-purple-500">
                      <CardHeader>
                        <CardTitle className="text-lg">Scene {scene.sceneNumber}</CardTitle>
                        <CardDescription>{scene.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">VFX Requirements:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {scene.vfxNeeds!.map((vfx, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {vfx}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {scene.description && (
                            <div>
                              <span className="text-sm font-medium">Description:</span>
                              <p className="text-sm text-muted-foreground">{scene.description}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              {scenes.filter(scene => scene.vfxNeeds && scene.vfxNeeds.length > 0).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No VFX requirements identified</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <LocationSuggestions locations={locations} />
        </TabsContent>

        <TabsContent value="financials">
          <FinancialAnalysis financialPlan={financialPlan} />
        </TabsContent>
      </Tabs>
    </div>
  );
}