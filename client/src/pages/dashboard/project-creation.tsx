import { useState } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Wand2, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Lightbulb,
  ArrowLeft
} from "lucide-react";

export default function ProjectCreation() {
  const params = useParams();
  const projectId = params.id;
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const projectTypes = [
    {
      id: "script_analysis",
      title: "Script Analysis",
      description: "Upload your existing script for AI-powered analysis and insights",
      icon: FileText,
      features: [
        "Character development analysis",
        "Plot structure evaluation",
        "Dialogue quality assessment",
        "Genre and market fit analysis",
        "Investment potential scoring"
      ],
      timeframe: "2-3 days",
      pricing: "Starting at $2,500",
      bestFor: "Existing scripts ready for production",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "script_generator",
      title: "Script Generator",
      description: "Create new scripts from your ideas using AI-powered generation",
      icon: Wand2,
      features: [
        "Story concept development",
        "Character creation and arcs",
        "Scene-by-scene generation",
        "Multiple genre adaptations",
        "Investor pitch preparation"
      ],
      timeframe: "1-2 weeks",
      pricing: "Starting at $5,000",
      bestFor: "New concepts and story ideas",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Choose Your Script Option
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              How would you like to add script content to your project?
            </p>
          </div>
        </div>

        {/* Project Type Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projectTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <Card 
                key={type.id}
                className={`relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 shadow-lg transform scale-105' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-5`} />
                
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${type.gradient}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{type.title}</CardTitle>
                        <CardDescription className="text-base mt-1">
                          {type.description}
                        </CardDescription>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-6">
                  {/* Best for */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-sm">Best for:</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{type.bestFor}</p>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-medium mb-3">What's included:</h4>
                    <ul className="space-y-2">
                      {type.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Timeline and Pricing */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Timeline</p>
                        <p className="text-sm font-medium">{type.timeframe}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Investment</p>
                        <p className="text-sm font-medium">{type.pricing}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        {selectedType && (
          <div className="text-center">
            <Link href={`/production/projects/${projectId}/script-${selectedType === 'script_analysis' ? 'upload' : 'writer'}`}>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-lg px-8"
              >
                Continue with {projectTypes.find(t => t.id === selectedType)?.title}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Process Overview */}
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <h3 className="font-medium">Choose Your Path</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select between script analysis or generation based on your needs
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">2</span>
                </div>
                <h3 className="font-medium">AI Processing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our advanced AI analyzes or generates content with industry insights
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-pink-600 dark:text-pink-400">3</span>
                </div>
                <h3 className="font-medium">Investor Ready</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive comprehensive reports and materials ready for investor presentations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}