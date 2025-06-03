import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Users, 
  Camera, 
  DollarSign, 
  MapPin, 
  Calendar,
  Edit,
  Eye,
  Download
} from "lucide-react";
import DashboardLayout from "./dashboard-layout";
import { Link } from "wouter";

interface Project {
  id: number;
  title: string;
  projectType: string;
  status: string;
  description?: string;
  genre?: string;
  budget?: number;
  timeline?: string;
  budgetRange?: string;
  fundingGoal?: number;
  fundingRaised: number;
  isPublished: boolean;
  createdAt: string;
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
}

interface Scene {
  id: number;
  sceneNumber: number;
  location: string;
  timeOfDay?: string;
  description?: string;
  duration?: number;
}

interface ActorSuggestion {
  id: number;
  characterName: string;
  actorName: string;
  reasoning?: string;
  fitScore?: number;
  availability?: string;
  estimatedFee?: string;
}

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id;

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: characters } = useQuery<{ characters: Character[] }>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: scenes } = useQuery<Scene[]>({
    queryKey: [`/api/projects/${projectId}/scenes`],
  });

  const { data: actors } = useQuery<ActorSuggestion[]>({
    queryKey: [`/api/projects/${projectId}/actors`],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'analyzing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (projectLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">The project you're looking for doesn't exist.</p>
          <Link href="/dashboard/projects">
            <Button className="mt-4">Back to Projects</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {project.title}
              </h1>
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              {project.isPublished && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Published
                </Badge>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {project.description || `${project.projectType.replace('_', ' ')} project`}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/projects/${project.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            {project.status === 'completed' && (
              <Link href={`/dashboard/projects/${project.id}/analysis`}>
                <Button>
                  <Eye className="w-4 h-4 mr-2" />
                  View Analysis
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Project Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                  <p className="font-semibold">{project.projectType.replace('_', ' ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
                  <p className="font-semibold">
                    {project.budget ? `$${project.budget.toLocaleString()}` : project.budgetRange || 'TBD'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Timeline</p>
                  <p className="font-semibold">{project.timeline || 'TBD'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Characters</p>
                  <p className="font-semibold">{characters?.characters?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="characters">Characters</TabsTrigger>
            <TabsTrigger value="scenes">Scenes</TabsTrigger>
            <TabsTrigger value="casting">Casting</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Genre</label>
                    <p className="text-lg">{project.genre || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                    <p className="text-lg">{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {project.fundingGoal && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Funding Progress</label>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>${project.fundingRaised.toLocaleString()} raised</span>
                        <span>${project.fundingGoal.toLocaleString()} goal</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${Math.min((project.fundingRaised / project.fundingGoal) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="characters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Character Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {characters?.characters && characters.characters.length > 0 ? (
                  <div className="grid gap-4">
                    {characters.characters.map((character) => (
                      <div key={character.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{character.name}</h3>
                          {character.importance && (
                            <Badge variant="outline">{character.importance}</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Age:</span> {character.age || 'Not specified'}
                          </div>
                          <div>
                            <span className="font-medium">Gender:</span> {character.gender || 'Not specified'}
                          </div>
                          <div>
                            <span className="font-medium">Screen Time:</span> {character.screenTime ? `${character.screenTime} min` : 'Not specified'}
                          </div>
                        </div>
                        {character.description && (
                          <p className="mt-2 text-gray-600 dark:text-gray-400">{character.description}</p>
                        )}
                        {character.characterArc && (
                          <p className="mt-2 text-sm text-gray-500">{character.characterArc}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No character analysis available</p>
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
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">Scene {scene.sceneNumber}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {scene.location}
                          </div>
                          {scene.timeOfDay && (
                            <div className="text-sm text-gray-600">
                              {scene.timeOfDay}
                            </div>
                          )}
                          {scene.duration && (
                            <div className="text-sm text-gray-600">
                              {scene.duration} min
                            </div>
                          )}
                        </div>
                        {scene.description && (
                          <p className="text-gray-600 dark:text-gray-400">{scene.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No scene analysis available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="casting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Casting Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                {actors && actors.length > 0 ? (
                  <div className="space-y-4">
                    {actors.map((actor) => (
                      <div key={actor.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{actor.actorName}</h3>
                            <p className="text-sm text-gray-600">for {actor.characterName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {actor.fitScore && (
                              <Badge variant="outline">{actor.fitScore}% fit</Badge>
                            )}
                            {actor.estimatedFee && (
                              <Badge variant="secondary">{actor.estimatedFee}</Badge>
                            )}
                          </div>
                        </div>
                        {actor.reasoning && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{actor.reasoning}</p>
                        )}
                        {actor.availability && (
                          <p className="text-xs text-gray-500">Availability: {actor.availability}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No casting suggestions available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}