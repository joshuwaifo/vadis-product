import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { DollarSign, TrendingUp, Search, LogOut } from "lucide-react";
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png";

export default function InvestorDashboard() {
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
              <Link href="/investor/dashboard" className="text-white hover:text-purple-300 transition-colors">
                Dashboard
              </Link>
              <Link href="/investor/portfolio" className="text-white/70 hover:text-purple-300 transition-colors">
                Portfolio
              </Link>
              <Link href="/investor/marketplace" className="text-white/70 hover:text-purple-300 transition-colors">
                Marketplace
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm">Investor</span>
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
            Investor Dashboard
          </h1>
          <p className="text-white/80">
            Discover and invest in high-potential entertainment projects
          </p>
        </div>

        {/* Investment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">$0</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Total Invested</h3>
            <p className="text-white/70 text-sm">Across all projects</p>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">0</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Active Investments</h3>
            <p className="text-white/70 text-sm">Projects in portfolio</p>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between mb-4">
              <Search className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">12</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Available Projects</h3>
            <p className="text-white/70 text-sm">Seeking investment</p>
          </Card>
        </div>

        {/* Investment Opportunities */}
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Investment Opportunities</h2>
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
              <Search className="w-4 h-4 mr-2" />
              Browse Projects
            </Button>
          </div>
          
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Discover investment opportunities</h3>
            <p className="text-white/70 mb-6">
              Browse film and TV projects seeking investment with detailed financial projections
            </p>
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
              Explore Marketplace
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}