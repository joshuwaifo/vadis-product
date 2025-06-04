import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, MapPin, Sparkles, DollarSign, 
  Film, User, BarChart3, FileText,
  ArrowRight, Save, Edit, Check
} from "lucide-react";

interface ReviewResultsStepProps {
  projectId: number;
  onNext: (data: any) => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}

export default function ReviewResultsStep({ projectId, onNext, onSave, isLoading }: ReviewResultsStepProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<Record<string, boolean>>({});

  // Fetch analysis results
  const { data: analysisResults, isLoading: resultsLoading } = useQuery({
    queryKey: ['analysisResults', projectId],
    queryFn: async () => {
      const response = await apiRequest(`/api/projects/${projectId}/analysis`, "GET");
      return response.json();
    },
    enabled: !!projectId
  });

  const handleSectionReview = (section: string, approved: boolean) => {
    setReviewStatus(prev => ({
      ...prev,
      [section]: approved
    }));
  };

  const handleSave = () => {
    onSave({ reviewStatus, editingSection });
  };

  const handleNext = () => {
    const completedSections = Object.values(reviewStatus).filter(Boolean).length;
    const totalSections = analysisResults ? Object.keys(analysisResults).length : 0;
    
    onNext({ 
      reviewStatus, 
      reviewComplete: completedSections === totalSections,
      completedSections,
      totalSections
    });
  };

  if (resultsLoading) {
    return <div>Loading analysis results...</div>;
  }

  if (!analysisResults) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analysis results found. Please run the analysis first.</p>
      </div>
    );
  }

  const sections = [
    { id: 'scenes', name: 'Scenes', icon: Film, data: analysisResults.scenes },
    { id: 'characters', name: 'Characters', icon: Users, data: analysisResults.characters },
    { id: 'casting', name: 'Casting', icon: User, data: analysisResults.casting },
    { id: 'locations', name: 'Locations', icon: MapPin, data: analysisResults.locations },
    { id: 'vfx', name: 'VFX', icon: Sparkles, data: analysisResults.vfx },
    { id: 'productPlacement', name: 'Product Placement', icon: DollarSign, data: analysisResults.productPlacement },
    { id: 'financial', name: 'Financial', icon: BarChart3, data: analysisResults.financial },
    { id: 'summary', name: 'Summary', icon: FileText, data: analysisResults.summary }
  ].filter(section => section.data && section.data.length > 0);

  return (
    <div className="space-y-6">
      {/* Review Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Review Analysis Results</CardTitle>
            <Badge variant="outline">
              {Object.values(reviewStatus).filter(Boolean).length} of {sections.length} reviewed
            </Badge>
          </div>
          <p className="text-gray-600">
            Review and approve each section of the analysis results
          </p>
        </CardHeader>
      </Card>

      {/* Results Tabs */}
      <Tabs defaultValue={sections[0]?.id} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {sections.map((section) => {
            const IconComponent = section.icon;
            const isReviewed = reviewStatus[section.id];
            
            return (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="flex items-center space-x-1"
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{section.name}</span>
                {isReviewed && <Check className="w-3 h-3 text-green-600" />}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <section.icon className="w-5 h-5" />
                    <span>{section.name} Analysis</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSection(section.id)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant={reviewStatus[section.id] ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSectionReview(section.id, !reviewStatus[section.id])}
                    >
                      {reviewStatus[section.id] ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Approved
                        </>
                      ) : (
                        'Approve'
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {section.id === 'scenes' && (
                  <div className="space-y-4">
                    {section.data.map((scene: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium">Scene {scene.sceneNumber}: {scene.location}</h4>
                        <p className="text-sm text-gray-600 mt-1">{scene.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Duration: {scene.duration}min</span>
                          <span>Characters: {scene.characters?.join(', ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'characters' && (
                  <div className="space-y-4">
                    {section.data.map((character: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium">{character.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{character.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Age: {character.age}</span>
                          <span>Importance: {character.importance}</span>
                          <span>Screen Time: {character.screenTime}min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.id === 'financial' && section.data && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Budget Breakdown</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Pre-Production:</span>
                          <span>${section.data.preProductionBudget?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Production:</span>
                          <span>${section.data.productionBudget?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Post-Production:</span>
                          <span>${section.data.postProductionBudget?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Revenue Projections</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Domestic:</span>
                          <span>${section.data.domesticRevenue?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>International:</span>
                          <span>${section.data.internationalRevenue?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Streaming:</span>
                          <span>${section.data.streamingRevenue?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generic display for other sections */}
                {!['scenes', 'characters', 'financial'].includes(section.id) && Array.isArray(section.data) && (
                  <div className="space-y-2">
                    {section.data.map((item: any, index: number) => (
                      <div key={index} className="border rounded p-3">
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(item, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleSave}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Review Progress
        </Button>

        <Button
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Finalize Project'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}