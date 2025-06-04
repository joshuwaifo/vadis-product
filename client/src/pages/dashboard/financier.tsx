import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Target, 
  FileText,
  Plus,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function FinancierDashboard() {
  const [investments] = useState([
    {
      id: 1,
      project: "Ocean's Edge",
      genre: "Thriller",
      stage: "Production",
      invested: "$5M",
      currentValue: "$6.2M",
      roi: "+24%",
      risk: "Medium",
      status: "Active"
    },
    {
      id: 2,
      project: "City Lights",
      genre: "Romance",
      stage: "Post-Production",
      invested: "$2.5M",
      currentValue: "$3.1M",
      roi: "+24%",
      risk: "Low",
      status: "Active"
    }
  ]);

  const [opportunities] = useState([
    {
      id: 1,
      project: "Desert Storm",
      genre: "Action",
      budget: "$15M",
      seeking: "$8M",
      expectedRoi: "185%",
      risk: "Medium",
      aiScore: 94,
      timeline: "18 months"
    },
    {
      id: 2,
      project: "Family Reunion",
      genre: "Comedy",
      budget: "$5M",
      seeking: "$3M",
      expectedRoi: "145%",
      risk: "Low",
      aiScore: 87,
      timeline: "12 months"
    }
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Financier Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Welcome back, Financier Demo
              </p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              New Investment
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$47.3M</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                +12.5% from last quarter
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <PieChart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Across 6 genres
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+167%</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Over 3 years
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">83%</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Profitable projects
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Active Investments</CardTitle>
                <CardDescription>
                  Your current investment portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.map((investment) => (
                    <div
                      key={investment.id}
                      className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {investment.project}
                          </h3>
                          <Badge variant="outline">{investment.genre}</Badge>
                          <Badge variant={investment.status === "Active" ? "default" : "secondary"}>
                            {investment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span>Invested: {investment.invested}</span>
                          <span>Current: {investment.currentValue}</span>
                          <span className="text-green-600 font-medium">{investment.roi} ROI</span>
                          <span>Risk: {investment.risk}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Reports
                        </Button>
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Investment Opportunities</CardTitle>
                <CardDescription>
                  AI-vetted projects seeking funding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {opportunities.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                            {opportunity.project}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{opportunity.genre}</Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs font-medium">AI Score: {opportunity.aiScore}/100</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {opportunity.risk === "Low" && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {opportunity.risk === "Medium" && <Clock className="w-4 h-4 text-yellow-500" />}
                          {opportunity.risk === "High" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          <span className="text-xs text-slate-500">{opportunity.risk} Risk</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-slate-500">Total Budget:</span>
                          <p className="font-medium">{opportunity.budget}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Seeking:</span>
                          <p className="font-medium">{opportunity.seeking}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Expected ROI:</span>
                          <p className="font-medium text-green-600">{opportunity.expectedRoi}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Timeline:</span>
                          <p className="font-medium">{opportunity.timeline}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          View Pitch Deck
                        </Button>
                        <Button size="sm" variant="outline">
                          AI Analysis
                        </Button>
                        <Button size="sm">
                          Express Interest
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>
                    Performance metrics across your investments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Genre Diversification</span>
                      <span className="text-sm font-medium">Excellent</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risk Distribution</span>
                      <span className="text-sm font-medium">Balanced</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg. Investment Period</span>
                      <span className="text-sm font-medium">24 months</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Capital Utilization</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>AI Market Insights</CardTitle>
                  <CardDescription>
                    Data-driven investment recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Action films show 23% higher ROI this quarter
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Streaming rights value increased 34% YoY
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        Consider increasing sci-fi allocation by 15%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
                <CardDescription>
                  Industry trends and market intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Advanced market analysis features coming soon
                  </p>
                  <Button variant="outline">
                    Request Early Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}