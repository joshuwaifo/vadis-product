import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Star, 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  UserPlus, 
  Shuffle, 
  AlertTriangle,
  Award,
  TrendingUp,
  CheckCircle,
  Plus,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ActorDetailModal } from './ActorDetailModal';
import { UserActorSuggestionModal } from './UserActorSuggestionModal';

interface ActorProfile {
  actorName: string;
  age: number;
  bio: string;
  fitAnalysis: string;
  chemistryFactor: string;
  recentWork?: string[];
  notableWork?: string[];
  fitScore: number;
  availability: string;
  estimatedFee: string;
  profileImageUrl?: string;
  controversyLevel: 'low' | 'medium' | 'high';
  fanRating: number;
  strengthsForRole?: string;
  potentialChemistry?: string;
  detailedBio?: string;
  awards?: string[];
  socialMediaFollowing?: string;
  marketValue?: string;
}

interface CastingAnalysisData {
  scriptTitle: string;
  characterSuggestions: Array<{
    characterName: string;
    suggestedActors: ActorProfile[];
  }>;
  ensembleChemistry: {
    keyRelationships: Array<{
      characters: string[];
      relationshipType: string;
      chemistryAnalysis: string;
      primaryActors: string[];
    }>;
    overallSynergy: string;
    castingRationale: string;
  };
  userSelections?: Record<string, {
    selectedActor: string;
    reason?: string;
    isLocked?: boolean;
  }>;
}

interface CastingAnalysisViewProps {
  castingData: CastingAnalysisData;
  projectId: number;
  onRefresh?: () => void;
}

export default function CastingAnalysisView({ castingData, projectId, onRefresh }: CastingAnalysisViewProps) {
  // Early return if no casting data
  if (!castingData || !castingData.characterSuggestions) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No casting data available</p>
      </div>
    );
  }
  const [selectedActor, setSelectedActor] = useState<ActorProfile | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [selectedActors, setSelectedActors] = useState<Record<string, ActorProfile>>({});
  const [showUserSuggestionModal, setShowUserSuggestionModal] = useState(false);
  const [currentCharacterForSuggestion, setCurrentCharacterForSuggestion] = useState<{name: string, description: string} | null>(null);
  const { toast } = useToast();

  // Create dynamic ensemble chemistry based on selected actors
  const getEnsembleChemistryWithSelections = () => {
    if (!castingData.ensembleChemistry) return castingData.ensembleChemistry;

    const updatedRelationships = castingData.ensembleChemistry.keyRelationships.map(relationship => {
      const updatedPrimaryActors = relationship.characters.map(characterName => {
        const selectedActor = selectedActors[characterName];
        if (selectedActor) {
          return selectedActor.actorName;
        }
        // Fall back to original suggestion if no selection made
        const originalSuggestion = castingData.characterSuggestions.find(
          cs => cs.characterName === characterName
        );
        return originalSuggestion?.suggestedActors[0]?.actorName || characterName;
      });

      // Update chemistry analysis text to reflect selected actors
      let updatedChemistryAnalysis = relationship.chemistryAnalysis;
      relationship.characters.forEach(characterName => {
        const selectedActor = selectedActors[characterName];
        if (selectedActor) {
          // Find original suggested actor for this character
          const originalSuggestion = castingData.characterSuggestions.find(
            cs => cs.characterName === characterName
          );
          const originalActor = originalSuggestion?.suggestedActors[0]?.actorName;
          
          if (originalActor) {
            // Replace original actor name with selected actor name in chemistry analysis
            const regex = new RegExp(originalActor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            updatedChemistryAnalysis = updatedChemistryAnalysis.replace(regex, selectedActor.actorName);
          }
        }
      });

      return {
        ...relationship,
        primaryActors: updatedPrimaryActors,
        chemistryAnalysis: updatedChemistryAnalysis
      };
    });

    // Update overall synergy and rationale text to reflect selected actors
    let updatedSynergy = castingData.ensembleChemistry.overallSynergy;
    let updatedRationale = castingData.ensembleChemistry.castingRationale;

    // Replace actor names in the text with selected actors
    Object.entries(selectedActors).forEach(([characterName, actor]) => {
      // Find original suggested actor for this character
      const originalSuggestion = castingData.characterSuggestions.find(
        cs => cs.characterName === characterName
      );
      const originalActor = originalSuggestion?.suggestedActors[0]?.actorName;
      
      if (originalActor) {
        // Replace original actor name with selected actor name in the text
        const regex = new RegExp(originalActor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        updatedSynergy = updatedSynergy.replace(regex, actor.actorName);
        updatedRationale = updatedRationale.replace(regex, actor.actorName);
      }
    });

    return {
      ...castingData.ensembleChemistry,
      keyRelationships: updatedRelationships,
      overallSynergy: updatedSynergy,
      castingRationale: updatedRationale
    };
  };

  // Initialize selections from casting data user selections
  useEffect(() => {
    if (castingData.userSelections) {
      const selectionsMap: Record<string, ActorProfile> = {};
      
      Object.entries(castingData.userSelections).forEach(([characterName, selection]) => {
        // Find the actor details from the character suggestions
        const characterSuggestion = castingData.characterSuggestions.find(
          cs => cs.characterName === characterName
        );
        
        if (characterSuggestion) {
          const selectedActorProfile = characterSuggestion.suggestedActors.find(
            actor => actor.actorName === selection.selectedActor
          );
          
          if (selectedActorProfile) {
            selectionsMap[characterName] = selectedActorProfile;
          }
        }
      });
      
      setSelectedActors(selectionsMap);
    }
  }, [castingData]);

  const handleSelectActor = async (characterName: string, actor: ActorProfile) => {
    try {
      // Save selection to database
      await apiRequest(`/api/projects/${projectId}/casting/select`, 'POST', {
        characterName,
        actorName: actor.actorName,
        fitScore: actor.fitScore,
        reasoning: actor.fitAnalysis,
        availability: actor.availability,
        estimatedFee: actor.estimatedFee
      });

      // Update local state
      setSelectedActors(prev => ({
        ...prev,
        [characterName]: actor
      }));

      // Invalidate casting analysis cache to refresh with new selections
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/casting/analysis`] 
      });
      
      toast({
        title: "Actor Selected",
        description: `${actor.actorName} selected for ${characterName} and saved`
      });
    } catch (error) {
      console.error('Error saving casting selection:', error);
      toast({
        title: "Error",
        description: "Failed to save casting selection. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOpenUserSuggestion = (characterName: string, characterData: any) => {
    setCurrentCharacterForSuggestion({
      name: characterName,
      description: characterData?.description || `Character: ${characterName}`
    });
    setShowUserSuggestionModal(true);
  };

  const handleUpdateEnsembleAnalysis = async () => {
    try {
      // Create updated casting data with selected actors
      const selectedActorsList = Object.entries(selectedActors).map(([characterName, actor]) => ({
        characterName,
        selectedActor: actor.actorName
      }));

      // Call API to generate new ensemble chemistry analysis with selected actors
      const response = await apiRequest(`/api/script-analysis/update_ensemble_chemistry`, 'POST', {
        projectId,
        selectedActors: selectedActorsList,
        scriptTitle: castingData.scriptTitle,
        characterSuggestions: castingData.characterSuggestions
      });

      if (response.success) {
        // Refresh the casting analysis data
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${projectId}/casting/analysis`] 
        });
        
        toast({
          title: "Ensemble Analysis Updated",
          description: "Chemistry analysis updated based on your selected actors"
        });
      }
    } catch (error) {
      console.error('Error updating ensemble analysis:', error);
      toast({
        title: "Error",
        description: "Failed to update ensemble analysis. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddUserSuggestion = (actor: ActorProfile) => {
    if (currentCharacterForSuggestion) {
      // Add user-suggested actor to the character's suggested actors list
      const characterIndex = castingData.characterSuggestions.findIndex(
        char => char.characterName === currentCharacterForSuggestion.name
      );
      
      if (characterIndex !== -1) {
        castingData.characterSuggestions[characterIndex].suggestedActors.push(actor);
      }
      
      toast({
        title: "Actor Added",
        description: `${actor.actorName} added to casting options for ${currentCharacterForSuggestion.name}`
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    return 'destructive';
  };

  const getControveryBadge = (level: string) => {
    switch (level) {
      case 'low':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">High Risk</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // ActorCard component for side-by-side display
  const ActorCard = ({ actor, characterName, isSelected, onViewDetails, onSelect }: {
    actor: ActorProfile;
    characterName: string;
    isSelected: boolean;
    onViewDetails: () => void;
    onSelect: () => void;
  }) => (
    <Card className={`transition-all duration-200 cursor-pointer hover:shadow-lg h-full flex flex-col ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:shadow-md'}`}>
      <CardContent className="p-4 flex flex-col h-full">
        {/* Actor Photo & Basic Info */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
            {actor.profileImageUrl ? (
              <img 
                src={actor.profileImageUrl} 
                alt={actor.actorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Users className="w-6 h-6" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
              {actor.actorName}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Age {actor.age}
            </p>
            
            {/* Fit Score & Controversy */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getScoreBadgeVariant(actor.fitScore)}>
                {actor.fitScore}% Fit
              </Badge>
              {getControveryBadge(actor.controversyLevel)}
            </div>
            
            {/* Fan Rating */}
            <div className="flex items-center mt-2">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{actor.fanRating}/10</span>
            </div>
          </div>
        </div>

        {/* Key Info */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Availability:</span>
            <span className="font-medium">{actor.availability}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fee:</span>
            <span className="font-medium text-green-600">{actor.estimatedFee}</span>
          </div>
        </div>

        {/* Recent Work - grows to fill available space */}
        <div className="flex-1">
          {actor.recentWork && actor.recentWork.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Recent Work:</p>
              <div className="flex flex-wrap gap-1">
                {actor.recentWork.slice(0, 2).map((work, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {work}
                  </Badge>
                ))}
                {actor.recentWork.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{actor.recentWork.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - always at bottom */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewDetails}
            className="flex-1"
          >
            <Eye className="w-3 h-3 mr-1" />
            Details
          </Button>
          <Button 
            size="sm" 
            onClick={onSelect}
            disabled={isSelected}
            className="flex-1"
          >
            {isSelected ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Selected
              </>
            ) : (
              'Select'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Casting Director Analysis
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered casting suggestions for "{castingData.scriptTitle}"
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <Shuffle className="w-4 h-4 mr-2" />
          Regenerate
        </Button>
      </div>

      {/* Casting Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Characters</p>
                <p className="text-2xl font-bold">{castingData?.characterSuggestions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Selected</p>
                <p className="text-2xl font-bold">{Object.keys(selectedActors).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Fit Score</p>
                <p className="text-2xl font-bold">
                  {castingData.characterSuggestions.length > 0 ? Math.round(
                    castingData.characterSuggestions.reduce((acc, char) => 
                      acc + (char.suggestedActors?.[0]?.fitScore || 0), 0
                    ) / castingData.characterSuggestions.length
                  ) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Key Relationships</p>
                <p className="text-2xl font-bold">{castingData.ensembleChemistry.keyRelationships.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="characters" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="characters">Character Casting</TabsTrigger>
          <TabsTrigger value="ensemble">Ensemble Chemistry</TabsTrigger>
        </TabsList>

        <TabsContent value="characters" className="space-y-6">
          {castingData.characterSuggestions.map((character, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {character.characterName}
                  </h3>
                  {selectedActors[character.characterName] ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {selectedActors[character.characterName].actorName} Selected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-1">
                      {character.suggestedActors?.length || 0} Options Available
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenUserSuggestion(character.characterName, character)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Suggest Actor
                </Button>
              </div>

              {/* Side-by-side Actor Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(character.suggestedActors || []).map((actor, actorIndex) => (
                  <ActorCard
                    key={actorIndex}
                    actor={actor}
                    characterName={character.characterName}
                    isSelected={selectedActors[character.characterName]?.actorName === actor.actorName}
                    onViewDetails={() => {
                      setSelectedActor(actor);
                      setSelectedCharacter(character.characterName);
                    }}
                    onSelect={() => handleSelectActor(character.characterName, actor)}
                  />
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="ensemble" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ensemble Chemistry Analysis</CardTitle>
              <CardDescription>
                How the cast works together as a unified ensemble
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Relationships */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Key Character Relationships
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(getEnsembleChemistryWithSelections()?.keyRelationships || []).map((rel, index) => (
                    <Card key={index} className="p-4 border border-gray-200 dark:border-gray-700">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {rel.relationshipType}
                          </Badge>
                          {rel.characters.some(char => selectedActors[char]) && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                              Updated Cast
                            </Badge>
                          )}
                        </div>
                        <h5 className="font-medium text-sm">
                          {rel.characters.join(' & ')}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Cast: {rel.primaryActors.join(' & ')}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {rel.chemistryAnalysis}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Overall Synergy */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Overall Ensemble Synergy
                  </h4>
                  {Object.keys(selectedActors).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpdateEnsembleAnalysis}
                      className="text-xs"
                    >
                      <Shuffle className="w-3 h-3 mr-1" />
                      Update Analysis
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {getEnsembleChemistryWithSelections()?.overallSynergy || 'No ensemble analysis available'}
                  </p>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      Casting Rationale
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {getEnsembleChemistryWithSelections()?.castingRationale || 'No casting rationale available'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Components */}
      <ActorDetailModal
        actor={selectedActor}
        characterName={selectedCharacter}
        isOpen={selectedActor !== null}
        onClose={() => setSelectedActor(null)}
        onSelect={(actor) => {
          handleSelectActor(selectedCharacter, actor);
          setSelectedActor(null);
        }}
      />

      <UserActorSuggestionModal
        characterName={currentCharacterForSuggestion?.name || ''}
        characterDescription={currentCharacterForSuggestion?.description || ''}
        projectId={projectId.toString()}
        isOpen={showUserSuggestionModal}
        onClose={() => {
          setShowUserSuggestionModal(false);
          setCurrentCharacterForSuggestion(null);
        }}
        onAddToList={handleAddUserSuggestion}
      />
    </div>
  );
}