import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, TrendingUp, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useMutation } from '@tanstack/react-query';

interface ActorAnalysisResult {
  actorName: string;
  age: number;
  bio: string;
  fitAnalysis: string;
  chemistryFactor: string;
  recentWork: string[];
  fitScore: number;
  availability: string;
  estimatedFee: string;
  profileImageUrl?: string;
  controversyLevel: 'low' | 'medium' | 'high';
  fanRating: number;
  detailedBio?: string;
  awards?: string[];
  socialMediaFollowing?: string;
  marketValue?: string;
  recommendation: 'excellent' | 'good' | 'poor';
  alternativeSuggestions?: string[];
}

interface UserActorSuggestionModalProps {
  characterName: string;
  characterDescription: string;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToList: (actor: ActorAnalysisResult) => void;
}

const getRecommendationBadge = (recommendation: string) => {
  switch (recommendation) {
    case 'excellent':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Excellent Match</Badge>;
    case 'good':
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Good Match</Badge>;
    case 'poor':
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Poor Match</Badge>;
    default:
      return <Badge variant="secondary">Analyzing...</Badge>;
  }
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

export function UserActorSuggestionModal({ 
  characterName, 
  characterDescription, 
  projectId, 
  isOpen, 
  onClose, 
  onAddToList 
}: UserActorSuggestionModalProps) {
  const [actorName, setActorName] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ActorAnalysisResult | null>(null);

  const analyzeActorMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/script-analysis/analyze_user_actor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          characterName,
          suggestedActor: actorName.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze actor suggestion');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data.analysis);
    }
  });

  const handleAnalyze = () => {
    if (actorName.trim()) {
      analyzeActorMutation.mutate();
    }
  };

  const handleAddToList = () => {
    if (analysisResult) {
      onAddToList(analysisResult);
      handleClose();
    }
  };

  const handleClose = () => {
    setActorName('');
    setAnalysisResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Suggest Actor for {characterName}
          </DialogTitle>
          <p className="text-muted-foreground">
            {characterDescription}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Actor Input */}
          <div className="space-y-2">
            <Label htmlFor="actorName">Actor Name</Label>
            <div className="flex gap-2">
              <Input
                id="actorName"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                placeholder="Enter actor's full name..."
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                disabled={analyzeActorMutation.isPending}
              />
              <Button 
                onClick={handleAnalyze}
                disabled={!actorName.trim() || analyzeActorMutation.isPending}
              >
                {analyzeActorMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </Button>
            </div>
          </div>

          {/* Analysis Result */}
          {analysisResult && (
            <div className="border rounded-lg p-6 space-y-6">
              <div className="flex items-start gap-4">
                {/* Actor Photo */}
                <div className="w-32 h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                  {analysisResult.profileImageUrl ? (
                    <img 
                      src={analysisResult.profileImageUrl} 
                      alt={analysisResult.actorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Users className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{analysisResult.actorName}</h3>
                    {getRecommendationBadge(analysisResult.recommendation)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age:</span>
                      <span>{analysisResult.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fit Score:</span>
                      <Badge variant="outline">{analysisResult.fitScore}/100</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Controversy:</span>
                      {getControveryBadge(analysisResult.controversyLevel)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fan Rating:</span>
                      <span>{analysisResult.fanRating}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Availability:</span>
                      <span>{analysisResult.availability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Fee:</span>
                      <span className="font-semibold">{analysisResult.estimatedFee}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Role Fit Analysis
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysisResult.fitAnalysis}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Ensemble Chemistry
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysisResult.chemistryFactor}
                  </p>
                </div>
              </div>

              {/* Recent Work */}
              <div>
                <h4 className="font-semibold mb-2">Recent Work</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.recentWork.map((work, index) => (
                    <Badge key={index} variant="outline">
                      {work}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Alternative Suggestions */}
              {analysisResult.alternativeSuggestions && analysisResult.alternativeSuggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">AI Recommends Instead</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.alternativeSuggestions.map((suggestion, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={handleAddToList}
                  className="flex-1"
                  variant={analysisResult.recommendation === 'poor' ? 'outline' : 'default'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add {analysisResult.actorName} to Casting List
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  className="px-8"
                >
                  <X className="w-4 h-4 mr-2" />
                  Discard
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {analyzeActorMutation.isError && (
            <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Analysis Failed</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                Unable to analyze the suggested actor. Please check the spelling and try again.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}