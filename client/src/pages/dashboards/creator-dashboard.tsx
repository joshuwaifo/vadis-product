import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, BookOpen, Star, Users, Calendar, TrendingUp, Eye, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function CreatorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      title: "Scripts Written",
      value: "7",
      change: "+2 this month",
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      title: "Industry Rating",
      value: "4.8/5",
      change: "+0.3 improvement",
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "Collaborations",
      value: "3",
      change: "1 active project",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Profile Views",
      value: "1.2K",
      change: "+15% this week",
      icon: Eye,
      color: "text-purple-600"
    }
  ];

  const scripts = [
    {
      id: 1,
      title: "The Last Frontier",
      genre: "Sci-Fi Drama",
      status: "Published",
      progress: 100,
      pages: 120,
      rating: 4.9,
      views: 234,
      lastUpdated: "2 days ago",
      collaborators: ["Producer Demo"]
    },
    {
      id: 2,
      title: "Urban Legends",
      genre: "Mystery Thriller",
      status: "In Review",
      progress: 85,
      pages: 95,
      rating: 4.7,
      views: 187,
      lastUpdated: "5 days ago",
      collaborators: []
    },
    {
      id: 3,
      title: "Coffee Shop Stories",
      genre: "Romantic Comedy",
      status: "Draft",
      progress: 45,
      pages: 54,
      rating: 0,
      views: 0,
      lastUpdated: "1 week ago",
      collaborators: []
    }
  ];

  const opportunities = [
    {
      id: 1,
      title: "Netflix Original Series",
      type: "Writing Opportunity",
      genre: "Drama",
      budget: "$500K - $1M",
      deadline: "Dec 30, 2024",
      status: "Open"
    },
    {
      id: 2,
      title: "Independent Film Collab",
      type: "Collaboration",
      genre: "Thriller",
      budget: "$50K - $100K",
      deadline: "Jan 15, 2025",
      status: "Interested"
    },
    {
      id: 3,
      title: "Documentary Series",
      type: "Research Project",
      genre: "Documentary",
      budget: "$25K - $75K",
      deadline: "Feb 28, 2025",
      status: "Applied"
    }
  ];

  const achievements = [
    { title: "First Script Published", date: "Nov 2024", icon: "🎬" },
    { title: "4.5+ Rating Achieved", date: "Oct 2024", icon: "⭐" },
    { title: "100+ Profile Views", date: "Oct 2024", icon: "👁️" },
    { title: "First Collaboration", date: "Sep 2024", icon: "🤝" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Creator Studio
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, Creator Demo
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Script
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
          {/* Scripts Portfolio */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Scripts</CardTitle>
                <CardDescription>
                  Your creative portfolio and ongoing projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scripts.map((script) => (
                    <div key={script.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {script.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={script.status === "Published" ? "default" : script.status === "In Review" ? "secondary" : "outline"}>
                            {script.status}
                          </Badge>
                          {script.rating > 0 && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{script.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div>
                          <span className="font-medium">Genre:</span> {script.genre}
                        </div>
                        <div>
                          <span className="font-medium">Pages:</span> {script.pages}
                        </div>
                        <div>
                          <span className="font-medium">Views:</span> {script.views}
                        </div>
                        <div>
                          <span className="font-medium">Updated:</span> {script.lastUpdated}
                        </div>
                      </div>
                      {script.collaborators.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Collaborators: </span>
                          {script.collaborators.map((collab, idx) => (
                            <Badge key={idx} variant="outline" className="ml-1 text-xs">
                              {collab}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Completion</span>
                        <span className="text-sm text-gray-600">{script.progress}%</span>
                      </div>
                      <Progress value={script.progress} className="h-2" />
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
                  <BookOpen className="w-4 h-4 mr-2" />
                  Write New Script
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Find Collaborators
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Industry Network
                </Button>
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle>Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {opportunities.map((opportunity) => (
                    <div key={opportunity.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{opportunity.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {opportunity.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {opportunity.type} • {opportunity.genre}
                      </p>
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        <div>
                          <span className="font-medium">Budget:</span> {opportunity.budget}
                        </div>
                        <div>
                          <span className="font-medium">Deadline:</span> {opportunity.deadline}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="text-lg">{achievement.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{achievement.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Scripts Completed</span>
                    <span className="text-sm font-medium">2/3</span>
                  </div>
                  <Progress value={67} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Collaboration Projects</span>
                    <span className="text-sm font-medium">1/2</span>
                  </div>
                  <Progress value={50} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Industry Connections</span>
                    <span className="text-sm font-medium">8/10</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}