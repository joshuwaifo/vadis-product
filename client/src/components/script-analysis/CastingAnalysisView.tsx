import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Star, DollarSign, Calendar, ArrowRight, UserPlus, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CastingAnalysisData {
  scriptTitle: string;
  characterSuggestions: Array<{
    characterName: string;
    primaryChoice: {
      actorName: string;
      bio: string;
      fitAnalysis: string;
      chemistryFactor: string;
      recentWork: string[];
      fitScore: number;
      availability: string;
      estimatedFee: string;
      profileImageUrl?: string;
    };
    alternatives: Array<{
      actorName: string;
      age: number;
      strengthsForRole: string;
      potentialChemistry: string;
      notableWork: string[];
      fitScore: number;
      availability: string;
      estimatedFee: string;
      profileImageUrl?: string;
    }>;
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
}

interface CastingAnalysisViewProps {
  castingData: CastingAnalysisData;
  projectId: number;
  onRefresh?: () => void;
}

export default function CastingAnalysisView({ castingData, projectId, onRefresh }: CastingAnalysisViewProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [customActor, setCustomActor] = useState('');
  const [userAnalysis, setUserAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeUserActor = async (characterName: string, actorName: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/script-analysis/analyze_user_actor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          characterName,
          suggestedActor: actorName
        })
      });

      const data = await response.json();

      if (data.success) {
        setUserAnalysis(data.analysis);
        toast({
          title: "Actor Analysis Complete",
          description: `Analysis for ${actorName} as ${characterName} is ready.`
        });
      } else {
        throw new Error(data.message || 'Failed to analyze actor');
      }
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze actor suggestion",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Characters Cast</p>
                <p className="text-2xl font-bold">{castingData.characterSuggestions.length}</p>
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
                  {Math.round(
                    castingData.characterSuggestions.reduce((acc, char) => 
                      acc + char.primaryChoice.fitScore, 0
                    ) / castingData.characterSuggestions.length
                  )}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
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

        <TabsContent value="characters" className="space-y-4">
          {castingData.characterSuggestions.map((character, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{character.characterName}</CardTitle>
                    <CardDescription>Primary Casting Recommendation</CardDescription>
                  </div>
                  <Badge 
                    variant={getScoreBadgeVariant(character.primaryChoice.fitScore)}
                    className="text-sm"
                  >
                    {character.primaryChoice.fitScore}% Fit
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Primary Choice */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Actor Profile Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={character.primaryChoice.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.primaryChoice.actorName)}&size=120&background=6366f1&color=ffffff&bold=true`}
                          alt={character.primaryChoice.actorName}
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.primaryChoice.actorName)}&size=120&background=6366f1&color=ffffff&bold=true`;
                          }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {character.primaryChoice.actorName}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {character.primaryChoice.bio}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-1">Fit Analysis</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {character.primaryChoice.fitAnalysis}
                            </p>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-1">Chemistry Factor</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {character.primaryChoice.chemistryFactor}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{character.primaryChoice.availability}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{character.primaryChoice.estimatedFee}</span>
                          </div>
                        </div>

                        {character.primaryChoice.recentWork.length > 0 && (
                          <div className="mt-3">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-1">Recent Work</h5>
                            <div className="flex flex-wrap gap-1">
                              {character.primaryChoice.recentWork.map((work, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {work}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Alternatives & Custom Actor */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        Alternative Casting Options
                      </h5>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedCharacter(character.characterName)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Suggest Actor
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Suggest Actor for {character.characterName}</DialogTitle>
                            <DialogDescription>
                              Enter an actor name to get AI analysis of their fit for this role.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Enter actor name..."
                              value={customActor}
                              onChange={(e) => setCustomActor(e.target.value)}
                            />
                            <Button 
                              onClick={() => {
                                if (customActor.trim()) {
                                  analyzeUserActor(character.characterName, customActor);
                                  setCustomActor('');
                                }
                              }}
                              disabled={isAnalyzing || !customActor.trim()}
                              className="w-full"
                            >
                              {isAnalyzing ? 'Analyzing...' : 'Analyze Actor'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {character.alternatives.map((alt, altIndex) => (
                        <Card key={altIndex} className="p-3 border border-gray-200 dark:border-gray-700">
                          <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                              <img
                                src={alt.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(alt.actorName)}&size=80&background=6366f1&color=ffffff&bold=true`}
                                alt={alt.actorName}
                                className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt.actorName)}&size=80&background=6366f1&color=ffffff&bold=true`;
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h6 className="font-medium text-sm truncate">{alt.actorName}</h6>
                                  <Badge variant="outline" className="text-xs ml-2">
                                    {alt.fitScore}%
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Age: {alt.age}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {alt.strengthsForRole}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>{alt.availability}</span>
                              <span>{alt.estimatedFee}</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
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
                  {castingData.ensembleChemistry.keyRelationships.map((rel, index) => (
                    <Card key={index} className="p-4 border border-gray-200 dark:border-gray-700">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {rel.relationshipType}
                          </Badge>
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

              {/* Overall Analysis */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Overall Casting Strategy
                </h4>
                <div className="space-y-4">
                  <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Ensemble Synergy
                    </h5>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {castingData.ensembleChemistry.overallSynergy}
                    </p>
                  </Card>
                  
                  <Card className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      Casting Rationale
                    </h5>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {castingData.ensembleChemistry.castingRationale}
                    </p>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Analysis Results */}
      {userAnalysis && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
            <CardTitle className="text-orange-900 dark:text-orange-100">
              Your Actor Suggestion Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  Suitability Assessment
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userAnalysis.suitabilityAssessment}
                </p>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  Chemistry Impact
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userAnalysis.chemistryImpact}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  Casting Adjustments
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userAnalysis.castingAdjustments}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                    Overall Fit Score
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userAnalysis.comparisonWithOriginal}
                  </p>
                </div>
                <Badge 
                  variant={getScoreBadgeVariant(userAnalysis.fitScore)}
                  className="text-lg px-3 py-1"
                >
                  {userAnalysis.fitScore}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}