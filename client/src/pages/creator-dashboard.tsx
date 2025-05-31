import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Video, Pen, FileText, LogOut } from "lucide-react";
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png";

export default function CreatorDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50">
      {/* Navigation Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
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
              <Link href="/creator/dashboard" className="text-gray-800 hover:text-purple-600 transition-colors font-medium">
                Dashboard
              </Link>
              <Link href="/creator/scripts" className="text-gray-600 hover:text-purple-600 transition-colors">
                Scripts
              </Link>
              <Link href="/creator/collaborate" className="text-gray-600 hover:text-purple-600 transition-colors">
                Collaborate
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Video className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-800 text-sm font-medium">Creator</span>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Creator Dashboard
          </h1>
          <p className="text-gray-600">
            Generate scripts and collaborate with industry professionals
          </p>
        </div>

        {/* Script Generation */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Script Generator</h2>
              <p className="text-gray-600">Create professional scripts with AI assistance</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
              <Pen className="w-4 h-4 mr-2" />
              Generate Script
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-gray-800 font-semibold mb-2">Short Film</h3>
              <p className="text-gray-600 text-sm">5-15 minute scripts</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-gray-800 font-semibold mb-2">Web Series</h3>
              <p className="text-gray-600 text-sm">Episode-based content</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-gray-800 font-semibold mb-2">Feature Film</h3>
              <p className="text-gray-600 text-sm">Full-length scripts</p>
            </div>
          </div>
        </Card>

        {/* My Scripts */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Scripts</h2>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <FileText className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No scripts created yet</h3>
            <p className="text-gray-600 mb-6">
              Start creating your first script with our AI-powered generator
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
              Create Your First Script
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}