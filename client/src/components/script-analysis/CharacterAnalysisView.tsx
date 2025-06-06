import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, User, Crown, Star, Heart, Briefcase, 
  GraduationCap, MapPin, Calendar, Info
} from 'lucide-react';

interface Character {
  name: string;
  description: string;
  age: string;
  gender: string;
  personality: string[];
  importance: 'lead' | 'supporting' | 'minor';
  screenTime: number;
  demographics: {
    ageRange: string;
    gender: string;
    ethnicity?: string;
    socioeconomicStatus?: string;
    education?: string;
    occupation?: string;
  };
  bio: string;
  relationships: Array<{
    character: string;
    relationship: string;
    strength: number;
    description: string;
  }>;
  characterArc: string;
}

interface Relationship {
  from: string;
  to: string;
  type: string;
  strength: number;
  description: string;
}

interface CharacterAnalysisViewProps {
  characters: Character[];
  relationships: Relationship[];
  relationshipExplanations: string[];
}

export default function CharacterAnalysisView({ 
  characters, 
  relationships, 
  relationshipExplanations 
}: CharacterAnalysisViewProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    characters.find(c => c.importance === 'lead') || characters[0] || null
  );
  const [viewMode, setViewMode] = useState<'overview' | 'graph' | 'details'>('overview');

  // Separate characters by importance
  const leadCharacters = characters.filter(c => c.importance === 'lead');
  const supportingCharacters = characters.filter(c => c.importance === 'supporting');
  const minorCharacters = characters.filter(c => c.importance === 'minor');

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'lead': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'supporting': return <Star className="h-4 w-4 text-blue-500" />;
      case 'minor': return <User className="h-4 w-4 text-gray-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getImportanceBadge = (importance: string) => {
    const colors = {
      lead: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      supporting: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      minor: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return colors[importance as keyof typeof colors] || colors.minor;
  };

  const getRelationshipStrengthColor = (strength: number) => {
    if (strength >= 8) return 'stroke-red-500';
    if (strength >= 6) return 'stroke-orange-500';
    if (strength >= 4) return 'stroke-yellow-500';
    return 'stroke-gray-400';
  };

  const getRelationshipStrengthWidth = (strength: number) => {
    if (strength >= 8) return 'stroke-[4px]';
    if (strength >= 6) return 'stroke-[3px]';
    if (strength >= 4) return 'stroke-[2px]';
    return 'stroke-[1px]';
  };

  // Simple network graph positioning
  const getCharacterPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 120;
    const centerX = 200;
    const centerY = 150;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const renderNetworkGraph = () => {
    const mainCharacters = [...leadCharacters, ...supportingCharacters.slice(0, 6)];
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Character Relationship Network
        </h3>
        
        <svg width="400" height="300" className="mx-auto">
          {/* Render relationships first (behind nodes) */}
          {relationships.map((rel, index) => {
            const fromIndex = mainCharacters.findIndex(c => c.name === rel.from);
            const toIndex = mainCharacters.findIndex(c => c.name === rel.to);
            
            if (fromIndex === -1 || toIndex === -1) return null;
            
            const fromPos = getCharacterPosition(fromIndex, mainCharacters.length);
            const toPos = getCharacterPosition(toIndex, mainCharacters.length);
            
            return (
              <line
                key={index}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                className={`${getRelationshipStrengthColor(rel.strength)} ${getRelationshipStrengthWidth(rel.strength)}`}
                opacity={0.7}
              />
            );
          })}
          
          {/* Render character nodes */}
          {mainCharacters.map((character, index) => {
            const pos = getCharacterPosition(index, mainCharacters.length);
            const isSelected = selectedCharacter?.name === character.name;
            
            return (
              <g key={character.name}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={character.importance === 'lead' ? 25 : 20}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'fill-blue-600 stroke-blue-800 stroke-2' 
                      : 'fill-blue-400 hover:fill-blue-500 stroke-blue-600 stroke-1'
                  }`}
                  onClick={() => setSelectedCharacter(character)}
                />
                <text
                  x={pos.x}
                  y={pos.y - 35}
                  textAnchor="middle"
                  className="text-sm font-medium fill-gray-700 dark:fill-gray-300 cursor-pointer"
                  onClick={() => setSelectedCharacter(character)}
                >
                  {character.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span>Strong (8-10)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-orange-500"></div>
              <span>Medium (6-7)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-yellow-500"></div>
              <span>Weak (4-5)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-gray-400"></div>
              <span>Minimal (1-3)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCharacterCard = (character: Character) => (
    <Card 
      key={character.name}
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selectedCharacter?.name === character.name 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : ''
      }`}
      onClick={() => setSelectedCharacter(character)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getImportanceIcon(character.importance)}
            <CardTitle className="text-lg">{character.name}</CardTitle>
          </div>
          <Badge className={getImportanceBadge(character.importance)}>
            {character.importance}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {character.bio}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{character.demographics.ageRange}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>{character.demographics.gender}</span>
          </div>
          {character.demographics.occupation && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span>{character.demographics.occupation}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-gray-500" />
            <span>{character.screenTime}min</span>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {character.personality.slice(0, 3).map((trait) => (
              <Badge key={trait} variant="outline" className="text-xs">
                {trait}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant={viewMode === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('overview')}
        >
          <Users className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={viewMode === 'graph' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('graph')}
        >
          <Heart className="h-4 w-4 mr-2" />
          Relationships
        </Button>
        <Button
          variant={viewMode === 'details' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('details')}
        >
          <Info className="h-4 w-4 mr-2" />
          Details
        </Button>
      </div>

      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Character Categories */}
          <div className="space-y-6">
            {/* Lead Characters */}
            {leadCharacters.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Main Characters ({leadCharacters.length})
                </h3>
                <div className="space-y-3">
                  {leadCharacters.map(renderCharacterCard)}
                </div>
              </div>
            )}

            {/* Supporting Characters */}
            {supportingCharacters.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-500" />
                  Supporting Characters ({supportingCharacters.length})
                </h3>
                <div className="space-y-3">
                  {supportingCharacters.map(renderCharacterCard)}
                </div>
              </div>
            )}

            {/* Minor Characters */}
            {minorCharacters.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  Minor Characters ({minorCharacters.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {minorCharacters.map((character) => (
                    <div
                      key={character.name}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setSelectedCharacter(character)}
                    >
                      <div className="font-medium text-sm">{character.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {character.demographics.occupation || character.demographics.ageRange}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Character Details */}
          {selectedCharacter && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {getImportanceIcon(selectedCharacter.importance)}
                    <CardTitle>{selectedCharacter.name}</CardTitle>
                    <Badge className={getImportanceBadge(selectedCharacter.importance)}>
                      {selectedCharacter.importance}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Biography</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedCharacter.bio}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Demographics</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Age:</span> {selectedCharacter.demographics.ageRange}
                      </div>
                      <div>
                        <span className="text-gray-500">Gender:</span> {selectedCharacter.demographics.gender}
                      </div>
                      {selectedCharacter.demographics.ethnicity && (
                        <div>
                          <span className="text-gray-500">Ethnicity:</span> {selectedCharacter.demographics.ethnicity}
                        </div>
                      )}
                      {selectedCharacter.demographics.occupation && (
                        <div>
                          <span className="text-gray-500">Occupation:</span> {selectedCharacter.demographics.occupation}
                        </div>
                      )}
                      {selectedCharacter.demographics.socioeconomicStatus && (
                        <div>
                          <span className="text-gray-500">Class:</span> {selectedCharacter.demographics.socioeconomicStatus}
                        </div>
                      )}
                      {selectedCharacter.demographics.education && (
                        <div>
                          <span className="text-gray-500">Education:</span> {selectedCharacter.demographics.education}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Personality Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharacter.personality.map((trait) => (
                        <Badge key={trait} variant="outline">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Character Arc</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedCharacter.characterArc}
                    </p>
                  </div>

                  {selectedCharacter.relationships.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Key Relationships</h4>
                      <div className="space-y-2">
                        {selectedCharacter.relationships.map((rel, index) => (
                          <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{rel.character}</span>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {rel.relationship}
                                </Badge>
                                <div className="flex">
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-1 h-3 mx-0.5 ${
                                        i < rel.strength 
                                          ? 'bg-blue-500' 
                                          : 'bg-gray-300 dark:bg-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {rel.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {viewMode === 'graph' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {renderNetworkGraph()}
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Relationship Explanations</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {relationshipExplanations.map((explanation, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm">{explanation}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {viewMode === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map(renderCharacterCard)}
        </div>
      )}
    </div>
  );
}