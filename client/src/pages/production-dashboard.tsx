import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Film, Plus, BarChart3, Users, LogOut } from "lucide-react";
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png";

export default function ProductionDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <img
                src={vadisLogoLight}
                alt="VadisAI"
                className="h-10 w-auto cursor-pointer"
              />
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/production/dashboard" className="text-white hover:text-purple-300 transition-colors">
                Dashboard
              </Link>
              <Link href="/production/projects" className="text-white/70 hover:text-purple-300 transition-colors">
                Projects
              </Link>
              <Link href="/production/marketplace" className="text-white/70 hover:text-purple-300 transition-colors">
                Marketplace
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Film className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm">Production Company</span>
              </div>
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Production Dashboard
          </h1>
          <p className="text-white/80">
            Manage your film and TV projects with AI-powered insights
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Start New Project
              </Button>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Create Project</h3>
            <p className="text-white/70">
              Start a new film or TV project with AI-powered script generation and analysis
            </p>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                View Analytics
              </Button>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Project Analytics</h3>
            <p className="text-white/70">
              Track project performance, budget analysis, and market insights
            </p>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Browse Network
              </Button>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Industry Network</h3>
            <p className="text-white/70">
              Connect with brands, investors, and talent for your projects
            </p>
          </Card>
        </div>

        {/* My Projects Section */}
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">My Projects</h2>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
          
          <div className="text-center py-12">
            <Film className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-white/70 mb-6">
              Get started by creating your first film or TV project
            </p>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Create Your First Project
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}