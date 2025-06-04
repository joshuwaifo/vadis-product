import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Film, BarChart3, Users, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ProductionDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user projects (will implement proper API later)
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
    enabled: false // Disabled for now since we're starting fresh
  });

  const stats = [
    {
      title: "Active Projects",
      value: "3",
      change: "+2 this month",
      icon: Film,
      color: "text-blue-600"
    },
    {
      title: "Total Budget",
      value: "$2.5M",
      change: "+15% from last quarter",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Scripts Analyzed",
      value: "12",
      change: "+4 this week",
      icon: BarChart3,
      color: "text-purple-600"
    },
    {
      title: "Team Members",
      value: "8",
      change: "+1 new hire",
      icon: Users,
      color: "text-orange-600"
    }
  ];

  const recentProjects = [
    {
      id: 1,
      title: "The Digital Revolution",
      status: "In Production",
      progress: 65,
      budget: "$850K",
      genre: "Sci-Fi Thriller",
      deadline: "Dec 2024"
    },
    {
      id: 2,
      title: "Midnight in Paris 2",
      status: "Pre-Production",
      progress: 30,
      budget: "$1.2M",
      genre: "Romantic Comedy",
      deadline: "Mar 2025"
    },
    {
      id: 3,
      title: "Ocean's Legacy",
      status: "Script Analysis",
      progress: 90,
      budget: "$450K",
      genre: "Action Drama",
      deadline: "Jan 2025"
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
                Production Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, Producer Demo
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
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
          {/* Projects List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>
                  Your latest film and TV projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {project.title}
                        </h3>
                        <Badge variant={project.status === "In Production" ? "default" : "secondary"}>
                          {project.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div>
                          <span className="font-medium">Budget:</span> {project.budget}
                        </div>
                        <div>
                          <span className="font-medium">Genre:</span> {project.genre}
                        </div>
                        <div>
                          <span className="font-medium">Deadline:</span> {project.deadline}
                        </div>
                        <div>
                          <span className="font-medium">Progress:</span> {project.progress}%
                        </div>
                      </div>
                      <Progress value={project.progress} className="h-2" />
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
                  <Film className="w-4 h-4 mr-2" />
                  Analyze New Script
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Invite Team Member
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="font-medium">Script analysis completed</p>
                      <p className="text-gray-600 dark:text-gray-400">Ocean's Legacy - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="font-medium">Budget approved</p>
                      <p className="text-gray-600 dark:text-gray-400">The Digital Revolution - 1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <div>
                      <p className="font-medium">New team member added</p>
                      <p className="text-gray-600 dark:text-gray-400">Sarah Director - 2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}