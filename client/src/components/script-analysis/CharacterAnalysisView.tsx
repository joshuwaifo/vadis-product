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
    if (strength >= 8) return '#dc2626'; // Strong - Red
    if (strength >= 6) return '#2563eb'; // Medium - Blue  
    if (strength >= 4) return '#16a34a'; // Weak - Green
    return '#9333ea'; // Minimal - Purple
  };

  const getRelationshipStrengthWidth = (strength: number) => {
    if (strength >= 8) return 4;
    if (strength >= 6) return 3;
    if (strength >= 4) return 2;
    return 1;
  };

  // Simple network graph positioning
  const getCharacterPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 180;
    const centerX = 400;
    const centerY = 250;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  // Polygon-based positioning algorithm for optimal character arrangement
  const getAdvancedCharacterPosition = (index: number, total: number, character: Character) => {
    const svgWidth = 1000;
    const svgHeight = 600;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    
    // Get all significant characters for polygon arrangement
    const allSignificantCharacters = [
      ...leadCharacters, 
      ...supportingCharacters,
      ...minorCharacters.filter(char => char.screenTime > 5).slice(0, 8)
    ];
    
    const characterIndex = allSignificantCharacters.findIndex(c => c.name === character.name);
    const totalCharacters = allSignificantCharacters.length;
    
    if (totalCharacters === 1) {
      return { x: centerX, y: centerY };
    }
    
    // Calculate polygon arrangement
    // Start from top and go clockwise
    const angle = (characterIndex / totalCharacters) * 2 * Math.PI - (Math.PI / 2);
    
    // Dynamic radius based on number of characters for optimal spacing
    let radius;
    if (totalCharacters <= 3) {
      radius = 150;
    } else if (totalCharacters <= 6) {
      radius = 180;
    } else if (totalCharacters <= 8) {
      radius = 220;
    } else {
      radius = 260;
    }
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const renderNetworkGraph = () => {
    // Include all significant characters (lead + all supporting, limited minor characters)
    const allSignificantCharacters = [
      ...leadCharacters, 
      ...supportingCharacters,
      ...minorCharacters.filter(char => char.screenTime > 5).slice(0, 8)
    ];
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Character Relationship Network
          </h3>
          <div className="text-sm text-gray-500">
            {allSignificantCharacters.length} characters • {relationships.length} relationships
          </div>
        </div>
        
        {allSignificantCharacters.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No character relationships found</p>
          </div>
        ) : (
          <div className="relative">
            <svg width="100%" height="600" viewBox="0 0 1000 600" className="mx-auto border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Polygon outline */}
              {allSignificantCharacters.length > 2 && (
                <polygon
                  points={allSignificantCharacters.map((char, idx) => {
                    const pos = getAdvancedCharacterPosition(idx, allSignificantCharacters.length, char);
                    return `${pos.x},${pos.y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  opacity="0.4"
                  strokeDasharray="5,5"
                />
              )}
              
              {/* Render relationships first (behind nodes) */}
              {relationships.map((rel, index) => {
                const fromIndex = allSignificantCharacters.findIndex(c => c.name === rel.from);
                const toIndex = allSignificantCharacters.findIndex(c => c.name === rel.to);
                
                if (fromIndex === -1 || toIndex === -1) return null;
                
                const fromPos = getAdvancedCharacterPosition(fromIndex, allSignificantCharacters.length, allSignificantCharacters[fromIndex]);
                const toPos = getAdvancedCharacterPosition(toIndex, allSignificantCharacters.length, allSignificantCharacters[toIndex]);
                
                return (
                  <g key={index}>
                    <line
                      x1={fromPos.x}
                      y1={fromPos.y}
                      x2={toPos.x}
                      y2={toPos.y}
                      stroke={getRelationshipStrengthColor(rel.strength)}
                      strokeWidth={getRelationshipStrengthWidth(rel.strength)}
                      opacity={0.8}
                      strokeDasharray={rel.strength < 4 ? "5,5" : "none"}
                    />
                    {/* Relationship label */}
                    <text
                      x={(fromPos.x + toPos.x) / 2}
                      y={(fromPos.y + toPos.y) / 2}
                      textAnchor="middle"
                      className="text-xs fill-gray-600 dark:fill-gray-400 pointer-events-none"
                      opacity={rel.strength >= 6 ? 0.8 : 0.5}
                    >
                      {rel.type}
                    </text>
                  </g>
                );
              })}
              
              {/* Render character nodes */}
              {allSignificantCharacters.map((character, index) => {
                const pos = getAdvancedCharacterPosition(index, allSignificantCharacters.length, character);
                const isSelected = selectedCharacter?.name === character.name;
                // Dynamic node size based on screen time and importance
                const baseSize = character.importance === 'lead' ? 30 : character.importance === 'supporting' ? 25 : 18;
                const screenTimeMultiplier = Math.min(1.5, 1 + (character.screenTime / 100));
                const nodeSize = baseSize * screenTimeMultiplier;
                
                return (
                  <g key={character.name}>
                    {/* Node shadow */}
                    <circle
                      cx={pos.x + 2}
                      cy={pos.y + 2}
                      r={nodeSize}
                      fill="rgba(0,0,0,0.1)"
                    />
                    
                    {/* Main node */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeSize}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'fill-blue-600 stroke-blue-800 stroke-3' 
                          : character.importance === 'lead'
                            ? 'fill-yellow-400 hover:fill-yellow-500 stroke-yellow-600 stroke-2'
                            : character.importance === 'supporting'
                              ? 'fill-blue-400 hover:fill-blue-500 stroke-blue-600 stroke-2'
                              : 'fill-gray-400 hover:fill-gray-500 stroke-gray-600 stroke-1'
                      }`}
                      onClick={() => setSelectedCharacter(character)}
                    />
                    
                    {/* Character name */}
                    <text
                      x={pos.x}
                      y={pos.y - nodeSize - 8}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-700 dark:fill-gray-300 cursor-pointer"
                      onClick={() => setSelectedCharacter(character)}
                    >
                      {character.name.length > 12 ? 
                        character.name.split(' ')[0] : 
                        character.name
                      }
                    </text>
                    
                    {/* Add title element for hover tooltip */}
                    <title>
                      {character.name} • {character.screenTime} minutes • {character.importance} character
                      {character.demographics?.occupation && ` • ${character.demographics.occupation}`}
                    </title>
                    
                    {/* Importance indicator */}
                    {character.importance === 'lead' && (
                      <text
                        x={pos.x + nodeSize - 5}
                        y={pos.y - nodeSize + 10}
                        textAnchor="middle"
                        className="text-xs fill-yellow-600"
                      >
                        ★
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            
            {/* Enhanced legend */}
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Relationship Strength</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-red-600"></div>
                    <span>Strong (8-10) - Core relationships</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-blue-600"></div>
                    <span>Medium (6-7) - Important dynamics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-green-600"></div>
                    <span>Weak (4-5) - Minor interactions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-purple-600 border-dashed border border-purple-300"></div>
                    <span>Minimal (1-3) - Brief encounters</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Character Types & Visual Guide</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-yellow-600"></div>
                      <div className="absolute -top-0.5 -right-0.5 text-yellow-600 text-xs">★</div>
                    </div>
                    <span>Lead Characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-blue-600"></div>
                    <span>Supporting Characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full border border-gray-600"></div>
                    <span>Minor Characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                      <div className="w-5 h-5 bg-blue-400 rounded-full"></div>
                    </div>
                    <span>Node size = screen time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-400">💭</div>
                    <span>Hover for character details</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
            <span>{character.demographics?.ageRange || character.age || 'Unknown age'}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>{character.demographics?.gender || character.gender || 'Unknown gender'}</span>
          </div>
          {(character.demographics?.occupation || (character as any).occupation) && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span>{character.demographics?.occupation || (character as any).occupation}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-gray-500" />
            <span>{character.screenTime}min</span>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {(character.personality || []).slice(0, 3).map((trait) => (
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
                        {character.demographics?.occupation || character.demographics?.ageRange || character.age || 'Character'}
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
                        <span className="text-gray-500">Age:</span> {selectedCharacter.demographics?.ageRange || selectedCharacter.age || 'Unknown'}
                      </div>
                      <div>
                        <span className="text-gray-500">Gender:</span> {selectedCharacter.demographics?.gender || selectedCharacter.gender || 'Unknown'}
                      </div>
                      {selectedCharacter.demographics?.ethnicity && (
                        <div>
                          <span className="text-gray-500">Ethnicity:</span> {selectedCharacter.demographics.ethnicity}
                        </div>
                      )}
                      {(selectedCharacter.demographics?.occupation || (selectedCharacter as any).occupation) && (
                        <div>
                          <span className="text-gray-500">Occupation:</span> {selectedCharacter.demographics?.occupation || (selectedCharacter as any).occupation}
                        </div>
                      )}
                      {selectedCharacter.demographics?.socioeconomicStatus && (
                        <div>
                          <span className="text-gray-500">Class:</span> {selectedCharacter.demographics.socioeconomicStatus}
                        </div>
                      )}
                      {selectedCharacter.demographics?.education && (
                        <div>
                          <span className="text-gray-500">Education:</span> {selectedCharacter.demographics.education}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Personality Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharacter.personality && selectedCharacter.personality.length > 0 ? (
                        selectedCharacter.personality.map((trait) => (
                          <Badge key={trait} variant="outline">
                            {trait}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No personality traits available</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Character Arc</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedCharacter.characterArc}
                    </p>
                  </div>

                  {selectedCharacter.relationships && selectedCharacter.relationships.length > 0 && (
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
        <div className="space-y-6">
          {/* Network Graph - Full Width */}
          <div className="w-full">
            {renderNetworkGraph()}
          </div>
          
          {/* Relationship Explanations - Full Width */}
          <div className="w-full">
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