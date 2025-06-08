import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, Award, TrendingUp, AlertTriangle } from "lucide-react";

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
  detailedBio?: string;
  awards?: string[];
  socialMediaFollowing?: string;
  marketValue?: string;
  strengthsForRole?: string;
  potentialChemistry?: string;
}

interface ActorDetailModalProps {
  actor: ActorProfile | null;
  characterName: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (actor: ActorProfile) => void;
}

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

const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating / 2) 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-sm text-muted-foreground ml-1">{rating}/10</span>
    </div>
  );
};

export function ActorDetailModal({ actor, characterName, isOpen, onClose, onSelect }: ActorDetailModalProps) {
  if (!actor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {actor.actorName} for {characterName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Actor Photo and Basic Info */}
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              {actor.profileImageUrl ? (
                <img 
                  src={actor.profileImageUrl} 
                  alt={actor.actorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Users className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Key Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Controversy Level</span>
                {getControveryBadge(actor.controversyLevel)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fan Rating</span>
                {renderStars(actor.fanRating)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fit Score</span>
                <Badge variant="outline" className="font-bold">
                  {actor.fitScore}/100
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Age</span>
                <span className="text-sm">{actor.age} years</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Availability</span>
                <span className="text-sm">{actor.availability}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimated Fee</span>
                <span className="text-sm font-semibold">{actor.estimatedFee}</span>
              </div>

              {actor.socialMediaFollowing && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Social Media</span>
                  <span className="text-sm">{actor.socialMediaFollowing}</span>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Information */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Biography
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {actor.detailedBio || actor.bio}
              </p>
            </div>

            {/* Fit Analysis */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Role Fit Analysis
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {actor.fitAnalysis}
              </p>
            </div>

            {/* Chemistry Factor */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Ensemble Chemistry
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {actor.chemistryFactor}
              </p>
            </div>

            {/* Recent Work */}
            {actor.recentWork && actor.recentWork.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Recent Work</h3>
                <div className="flex flex-wrap gap-2">
                  {actor.recentWork.map((work, index) => (
                    <Badge key={index} variant="outline">
                      {work}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notable Work */}
            {actor.notableWork && actor.notableWork.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Notable Career Highlights</h3>
                <div className="flex flex-wrap gap-2">
                  {actor.notableWork.map((work, index) => (
                    <Badge key={index} variant="secondary">
                      {work}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Awards */}
            {actor.awards && actor.awards.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Awards & Recognition
                </h3>
                <div className="flex flex-wrap gap-2">
                  {actor.awards.map((award, index) => (
                    <Badge key={index} variant="secondary">
                      {award}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Market Value */}
            {actor.marketValue && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Market Position</h3>
                <p className="text-sm text-muted-foreground">
                  {actor.marketValue}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={() => onSelect(actor)}
                className="flex-1"
              >
                Select {actor.actorName} for {characterName}
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="px-8"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}