import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Film, 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Bell,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react"
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png"

export default function DashboardProduction() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  const handleLogout = () => {
    window.location.href = "/api/logout"
  }

  const projects = [
    {
      id: 1,
      title: "Summer Romance Series",
      status: "In Production",
      budget: "$2.5M",
      progress: 65,
      crew: 45,
      daysRemaining: 23,
      type: "TV Series"
    },
    {
      id: 2,
      title: "Urban Legends Documentary",
      status: "Pre-Production", 
      budget: "$800K",
      progress: 25,
      crew: 12,
      daysRemaining: 89,
      type: "Documentary"
    },
    {
      id: 3,
      title: "Tech Startup Commercial",
      status: "Post-Production",
      budget: "$150K", 
      progress: 85,
      crew: 8,
      daysRemaining: 12,
      type: "Commercial"
    }
  ]

  const recentActivity = [
    { action: "New crew member added to Summer Romance Series", time: "2 hours ago" },
    { action: "Budget approved for Urban Legends Documentary", time: "5 hours ago" },
    { action: "Post-production milestone reached", time: "1 day ago" },
    { action: "Location scouting completed", time: "2 days ago" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Production": return "bg-green-100 text-green-800"
      case "Pre-Production": return "bg-yellow-100 text-yellow-800"
      case "Post-Production": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={vadisLogoLight} alt="VadisAI" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Production Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.firstName || 'Producer'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white/80 backdrop-blur-xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="crew">Crew Management</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/80 backdrop-blur-xl border-white/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Film className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-gray-600">+1 from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$3.45M</div>
                  <p className="text-xs text-gray-600">Across all projects</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Crew Members</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">65</div>
                  <p className="text-xs text-gray-600">Across all projects</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">58%</div>
                  <p className="text-xs text-gray-600">Average across projects</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Project Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/80 backdrop-blur-xl border-white/50">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your projects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-600">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/50">
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                  <CardDescription>Current status of active projects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{project.title}</span>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <p className="text-xs text-gray-600">{project.progress}% complete</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Projects</h2>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="bg-white/80 backdrop-blur-xl border-white/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>{project.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Budget</p>
                        <p className="font-semibold">{project.budget}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Crew</p>
                        <p className="font-semibold">{project.crew} members</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-gray-600">
                        {project.daysRemaining} days remaining
                      </span>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crew">
            <Card className="bg-white/80 backdrop-blur-xl border-white/50">
              <CardHeader>
                <CardTitle>Crew Management</CardTitle>
                <CardDescription>Manage your production crew across all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Crew management features will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance">
            <Card className="bg-white/80 backdrop-blur-xl border-white/50">
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Track budgets, expenses, and financial performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Financial management features will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="bg-white/80 backdrop-blur-xl border-white/50">
              <CardHeader>
                <CardTitle>Production Calendar</CardTitle>
                <CardDescription>Schedule and track important dates and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Calendar features will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}