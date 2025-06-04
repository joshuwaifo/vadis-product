import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Target, 
  TrendingUp, 
  Eye, 
  DollarSign,
  Plus,
  Camera,
  PlayCircle,
  Star,
  BarChart3
} from "lucide-react";

export default function BrandDashboard() {
  const [campaigns] = useState([
    {
      id: 1,
      name: "Summer Collection 2024",
      product: "Athletic Wear",
      status: "Active",
      placements: 8,
      reach: "2.4M",
      roi: "+245%"
    },
    {
      id: 2,
      name: "Tech Innovation",
      product: "Smart Watch",
      status: "Planning",
      placements: 3,
      reach: "1.1M",
      roi: "+180%"
    }
  ]);

  const [opportunities] = useState([
    {
      id: 1,
      project: "Blockbuster Action Film",
      scene: "Hero's morning routine",
      placement: "Coffee Brand",
      visibility: "Featured",
      naturalness: 9,
      estimatedReach: "15M viewers",
      cost: "$250k"
    },
    {
      id: 2,
      project: "Romantic Comedy",
      scene: "Date night dinner",
      placement: "Wine Brand",
      visibility: "Background",
      naturalness: 8,
      estimatedReach: "8M viewers",
      cost: "$125k"
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
                Brand Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Welcome back, Brand Demo
              </p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                +6 from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47.3M</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Estimated viewers
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campaign ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+189%</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Average return
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Placements</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Total this year
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>
                  Your current product placement campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {campaign.name}
                          </h3>
                          <Badge variant={campaign.status === "Active" ? "default" : "secondary"}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span>{campaign.product}</span>
                          <span>{campaign.placements} placements</span>
                          <span>{campaign.reach} reach</span>
                          <span className="text-green-600 font-medium">{campaign.roi} ROI</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Analytics
                        </Button>
                        <Button size="sm">
                          View Campaign
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
                <CardTitle>Placement Opportunities</CardTitle>
                <CardDescription>
                  AI-identified opportunities for product placement
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
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {opportunity.scene}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          {opportunity.visibility}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Placement:</span>
                          <p className="font-medium">{opportunity.placement}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Naturalness:</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="font-medium">{opportunity.naturalness}/10</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500">Est. Reach:</span>
                          <p className="font-medium">{opportunity.estimatedReach}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Cost:</span>
                          <p className="font-medium">{opportunity.cost}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          Request Details
                        </Button>
                        <Button size="sm">
                          Make Offer
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
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Campaign performance overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Brand Awareness Lift</span>
                      <span className="text-sm font-medium text-green-600">+34%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Purchase Intent</span>
                      <span className="text-sm font-medium text-green-600">+28%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cost per Impression</span>
                      <span className="text-sm font-medium">$0.08</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Engagement Rate</span>
                      <span className="text-sm font-medium">4.7%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>
                    Smart recommendations for your brand
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Action films show 67% higher engagement for your brand
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Morning scenes provide optimal product visibility
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        Recommended budget allocation: 60% films, 40% TV
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Product Catalog</CardTitle>
                <CardDescription>
                  Manage your products available for placement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Product catalog management coming soon
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