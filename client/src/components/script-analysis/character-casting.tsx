import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Star, 
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  User,
  TrendingUp,
  Award,
  Calendar
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Character {
  id: number;
  name: string;
  description: string;
  age: string;
  gender: string;
  personality: string[];
  importance: 'lead' | 'supporting' | 'minor';
  screenTime: number;
  characterArc: string;
}

interface ActorSuggestion {
  id: number;
  characterName: string;
  actorName: string;
  reasoning: string;
  fitScore: number;
  availability: string;
  estimatedFee: string;
  workingRelationships: string[];
  imageUrl?: string;
  nationality?: string;
  recentWork?: string[];
  controversyLevel?: 'none' | 'low' | 'medium' | 'high';
}

interface CastingSelection {
  id: number;
  characterName: string;
  selectedActorName: string;
  fitScore: number;
  isConfirmed: boolean;
}

interface CharacterCastingProps {
  projectId: number;
}

export default function CharacterCasting({ projectId }: CharacterCastingProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActorDetails, setShowActorDetails] = useState<ActorSuggestion | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: characters, isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: ['characters', projectId],
    queryFn: () => apiRequest('GET', `/api/projects/${projectId}/characters`),
    enabled: !!projectId
  });

  const { data: actorSuggestions, isLoading: suggestionsLoading } = useQuery<ActorSuggestion[]>({
    queryKey: ['actor-suggestions', projectId, selectedCharacter?.name],
    queryFn: () => apiRequest('GET', `/api/projects/${projectId}/characters/${selectedCharacter?.name}/suggestions`),
    enabled: !!selectedCharacter
  });

  const { data: castingSelections } = useQuery<CastingSelection[]>({
    queryKey: ['casting-selections', projectId],
    queryFn: () => apiRequest('GET', `/api/projects/${projectId}/casting-selections`),
    enabled: !!projectId
  });

  const selectActorMutation = useMutation({
    mutationFn: async ({ characterName, actorName, fitScore }: { 
      characterName: string; 
      actorName: string; 
      fitScore: number; 
    }) => {
      return apiRequest('POST', `/api/projects/${projectId}/casting-selections`, {
        characterName,
        selectedActorName: actorName,
        fitScore,
        isConfirmed: false
      });
    },
    onSuccess: () => {
      toast({
        title: "Actor Selected",
        description: "Actor has been selected for this character."
      });
      queryClient.invalidateQueries({ queryKey: ['casting-selections', projectId] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Selection Failed",
        description: error.message || "Failed to select actor"
      });
    }
  });

  const confirmCastingMutation = useMutation({
    mutationFn: async (selectionId: number) => {
      return apiRequest('PUT', `/api/casting-selections/${selectionId}/confirm`);
    },
    onSuccess: () => {
      toast({
        title: "Casting Confirmed",
        description: "Actor casting has been confirmed."
      });
      queryClient.invalidateQueries({ queryKey: ['casting-selections', projectId] });
    }
  });

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'lead': return 'bg-red-100 text-red-800';
      case 'supporting': return 'bg-blue-100 text-blue-800';
      case 'minor': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getControversyColor = (level?: string) => {
    switch (level) {
      case 'none': return 'text-green-600';
      case 'low': return 'text-yellow-600';
      case 'medium': return 'text-orange-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const isActorSelected = (characterName: string, actorName: string) => {
    return castingSelections?.some(selection => 
      selection.characterName === characterName && 
      selection.selectedActorName === actorName
    );
  };

  const getCharacterSelection = (characterName: string) => {
    return castingSelections?.find(selection => selection.characterName === characterName);
  };

  const filteredCharacters = characters?.filter(character =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCharacters = characters?.length || 0;
  const castedCharacters = castingSelections?.length || 0;
  const confirmedCasting = castingSelections?.filter(s => s.isConfirmed).length || 0;
  const leadRoles = characters?.filter(c => c.importance === 'lead').length || 0;

  if (charactersLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Casting Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalCharacters}</div>
                <div className="text-sm text-gray-600">Total Characters</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{leadRoles}</div>
                <div className="text-sm text-gray-600">Lead Roles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{castedCharacters}</div>
                <div className="text-sm text-gray-600">Actors Selected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{confirmedCasting}</div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Characters List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Characters
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-2 p-4">
                  {filteredCharacters?.map((character) => {
                    const selection = getCharacterSelection(character.name);
                    
                    return (
                      <div
                        key={character.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedCharacter?.id === character.id 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedCharacter(character)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{character.name}</span>
                          <Badge className={getImportanceColor(character.importance)}>
                            {character.importance}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">
                            {character.age} • {character.gender}
                          </div>
                          <div className="text-xs text-gray-500">
                            ~{character.screenTime} min screen time
                          </div>
                        </div>

                        {selection && (
                          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                            <div className="flex items-center gap-1">
                              {selection.isConfirmed ? (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              ) : (
                                <Clock className="w-3 h-3 text-yellow-600" />
                              )}
                              <span className="font-medium">{selection.selectedActorName}</span>
                            </div>
                            <div className="text-gray-600">
                              Fit Score: {selection.fitScore}%
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Actor Suggestions */}
        <div className="lg:col-span-2">
          {selectedCharacter ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Casting Suggestions for {selectedCharacter.name}</span>
                  <Badge className={getImportanceColor(selectedCharacter.importance)}>
                    {selectedCharacter.importance}
                  </Badge>
                </CardTitle>
                <div className="text-sm text-gray-600">
                  {selectedCharacter.description}
                </div>
              </CardHeader>
              <CardContent>
                {suggestionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {actorSuggestions?.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="flex items-start space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={suggestion.imageUrl} alt={suggestion.actorName} />
                          <AvatarFallback>
                            {suggestion.actorName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{suggestion.actorName}</h4>
                              <p className="text-sm text-gray-600">{suggestion.nationality}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">
                                {suggestion.fitScore}%
                              </div>
                              <div className="text-xs text-gray-500">Fit Score</div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {suggestion.reasoning}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {suggestion.estimatedFee}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {suggestion.availability}
                            </Badge>
                            {suggestion.controversyLevel && (
                              <Badge variant="outline" className={`text-xs ${getControversyColor(suggestion.controversyLevel)}`}>
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {suggestion.controversyLevel} risk
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowActorDetails(suggestion)}
                            >
                              <User className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => selectActorMutation.mutate({
                                characterName: selectedCharacter.name,
                                actorName: suggestion.actorName,
                                fitScore: suggestion.fitScore
                              })}
                              disabled={selectActorMutation.isPending || isActorSelected(selectedCharacter.name, suggestion.actorName)}
                            >
                              {isActorSelected(selectedCharacter.name, suggestion.actorName) ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Selected
                                </>
                              ) : (
                                <>
                                  <Star className="w-4 h-4 mr-1" />
                                  Select Actor
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <Users className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-gray-500">Select a character to view casting suggestions</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Actor Details Modal */}
      <Dialog open={!!showActorDetails} onOpenChange={() => setShowActorDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{showActorDetails?.actorName}</DialogTitle>
          </DialogHeader>
          {showActorDetails && (
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={showActorDetails.imageUrl} alt={showActorDetails.actorName} />
                  <AvatarFallback>
                    {showActorDetails.actorName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{showActorDetails.actorName}</h3>
                  <p className="text-gray-600">{showActorDetails.nationality}</p>
                  <div className="mt-2">
                    <Badge variant="outline">
                      Fit Score: {showActorDetails.fitScore}%
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Why This Actor Fits</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {showActorDetails.reasoning}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Availability</h4>
                  <p className="text-sm">{showActorDetails.availability}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Estimated Fee</h4>
                  <p className="text-sm">{showActorDetails.estimatedFee}</p>
                </div>
              </div>
              
              {showActorDetails.recentWork && showActorDetails.recentWork.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recent Work</h4>
                  <div className="flex flex-wrap gap-1">
                    {showActorDetails.recentWork.map((work, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {work}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {showActorDetails.workingRelationships.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Working Relationships</h4>
                  <div className="flex flex-wrap gap-1">
                    {showActorDetails.workingRelationships.map((relationship, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {relationship}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}