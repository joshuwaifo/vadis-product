import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, TrendingUp, DollarSign, PieChart, Target, Calendar, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function FinancierDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      title: "Portfolio Value",
      value: "$15.2M",
      change: "+12% this quarter",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Active Investments",
      value: "8",
      change: "+2 new deals",
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "ROI Average",
      value: "24.5%",
      change: "+3.2% from target",
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Under Review",
      value: "12",
      change: "5 priority projects",
      icon: FileText,
      color: "text-orange-600"
    }
  ];

  const investments = [
    {
      id: 1,
      title: "The Digital Revolution",
      stage: "Production",
      invested: "$2.5M",
      currentValue: "$3.1M",
      roi: "+24%",
      riskLevel: "Medium",
      progress: 65,
      expectedReturn: "$4.2M",
      timeline: "18 months"
    },
    {
      id: 2,
      title: "Midnight Romance",
      stage: "Post-Production",
      invested: "$1.8M",
      currentValue: "$2.3M",
      roi: "+28%",
      riskLevel: "Low",
      progress: 85,
      expectedReturn: "$3.1M",
      timeline: "6 months"
    },
    {
      id: 3,
      title: "Ocean's Legacy",
      stage: "Development",
      invested: "$800K",
      currentValue: "$850K",
      roi: "+6%",
      riskLevel: "High",
      progress: 30,
      expectedReturn: "$1.5M",
      timeline: "24 months"
    }
  ];

  const opportunities = [
    {
      id: 1,
      title: "Space Odyssey 2025",
      genre: "Sci-Fi",
      budget: "$12M",
      seeking: "$4M",
      expectedRoi: "35%",
      riskLevel: "Medium",
      timeline: "2 years",
      status: "Review"
    },
    {
      id: 2,
      title: "Comedy Central Special",
      genre: "Comedy",
      budget: "$3M",
      seeking: "$1.5M",
      expectedRoi: "22%",
      riskLevel: "Low",
      timeline: "8 months",
      status: "Interested"
    },
    {
      id: 3,
      title: "Documentary: Climate Change",
      genre: "Documentary",
      budget: "$2.5M",
      seeking: "$1M",
      expectedRoi: "18%",
      riskLevel: "Low",
      timeline: "14 months",
      status: "Due Diligence"
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
                Investment Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, Financier Demo
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Investment
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
          {/* Portfolio */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Portfolio</CardTitle>
                <CardDescription>
                  Your current film and TV investments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.map((investment) => (
                    <div key={investment.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {investment.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={investment.riskLevel === "Low" ? "default" : investment.riskLevel === "Medium" ? "secondary" : "destructive"}>
                            {investment.riskLevel} Risk
                          </Badge>
                          <Badge variant="outline" className="text-green-600">
                            {investment.roi}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div>
                          <span className="font-medium">Invested:</span> {investment.invested}
                        </div>
                        <div>
                          <span className="font-medium">Current:</span> {investment.currentValue}
                        </div>
                        <div>
                          <span className="font-medium">Expected:</span> {investment.expectedReturn}
                        </div>
                        <div>
                          <span className="font-medium">Timeline:</span> {investment.timeline}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{investment.stage} Progress</span>
                        <span className="text-sm text-gray-600">{investment.progress}%</span>
                      </div>
                      <Progress value={investment.progress} className="h-2" />
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
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Portfolio Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Due Diligence
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <PieChart className="w-4 h-4 mr-2" />
                  Risk Assessment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Network Events
                </Button>
              </CardContent>
            </Card>

            {/* Investment Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle>New Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {opportunities.slice(0, 3).map((opportunity) => (
                    <div key={opportunity.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{opportunity.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {opportunity.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {opportunity.genre} • {opportunity.timeline}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Seeking:</span> {opportunity.seeking}
                        </div>
                        <div>
                          <span className="font-medium">ROI:</span> {opportunity.expectedRoi}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Portfolio Performance</span>
                    <span className="text-sm font-medium text-green-600">+18.2%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Diversification</span>
                    <span className="text-sm font-medium">Optimal</span>
                  </div>
                  <Progress value={88} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Market Timing</span>
                    <span className="text-sm font-medium">Strong</span>
                  </div>
                  <Progress value={76} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}