import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Target, TrendingUp, Eye, ShoppingBag, Calendar, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function BrandDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      title: "Active Campaigns",
      value: "5",
      change: "+2 this month",
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "Placement Value",
      value: "$125K",
      change: "+25% ROI",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Brand Visibility",
      value: "2.3M",
      change: "+18% reach",
      icon: Eye,
      color: "text-purple-600"
    },
    {
      title: "Products Listed",
      value: "12",
      change: "+3 new products",
      icon: ShoppingBag,
      color: "text-orange-600"
    }
  ];

  const activeCampaigns = [
    {
      id: 1,
      name: "Summer Collection Launch",
      status: "Active",
      progress: 75,
      budget: "$45K",
      impressions: "1.2M",
      placement: "Hero Placement",
      endDate: "Dec 15, 2024"
    },
    {
      id: 2,
      name: "Tech Innovation Series",
      status: "In Review",
      progress: 40,
      budget: "$30K",
      impressions: "800K",
      placement: "Featured",
      endDate: "Jan 20, 2025"
    },
    {
      id: 3,
      name: "Lifestyle Brand Partnership",
      status: "Planning",
      progress: 20,
      budget: "$50K",
      impressions: "Target 2M",
      placement: "Background",
      endDate: "Mar 10, 2025"
    }
  ];

  const products = [
    {
      id: 1,
      name: "Premium Smartphone",
      category: "Electronics",
      placements: 8,
      avgValue: "$12K",
      status: "Active"
    },
    {
      id: 2,
      name: "Designer Sunglasses",
      category: "Fashion",
      placements: 5,
      avgValue: "$8K",
      status: "Active"
    },
    {
      id: 3,
      name: "Energy Drink",
      category: "Beverages",
      placements: 12,
      avgValue: "$5K",
      status: "Active"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Brand Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, Brand Demo
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-green-600">
                      {stat.change}
                    </p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaigns List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>
                  Your product placement campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeCampaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {campaign.name}
                        </h3>
                        <Badge variant={campaign.status === "Active" ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div>
                          <span className="font-medium">Budget:</span> {campaign.budget}
                        </div>
                        <div>
                          <span className="font-medium">Impressions:</span> {campaign.impressions}
                        </div>
                        <div>
                          <span className="font-medium">Placement:</span> {campaign.placement}
                        </div>
                        <div>
                          <span className="font-medium">End Date:</span> {campaign.endDate}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600">{campaign.progress}%</span>
                      </div>
                      <Progress value={campaign.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  Browse Projects
                </Button>
              </CardContent>
            </Card>

            {/* Product Portfolio */}
            <Card>
              <CardHeader>
                <CardTitle>Product Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{product.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {product.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {product.category}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Placements:</span> {product.placements}
                        </div>
                        <div>
                          <span className="font-medium">Avg Value:</span> {product.avgValue}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Brand Exposure</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Campaign ROI</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audience Reach</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}