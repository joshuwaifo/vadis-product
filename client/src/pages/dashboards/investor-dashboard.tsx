import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { DollarSign, TrendingUp, Search, LogOut } from "lucide-react";
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png";

export default function InvestorDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-orange-50">
      {/* Navigation Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <img
                src={vadisLogoLight}
                alt="VadisMedia"
                className="h-24 w-auto drop-shadow-2xl cursor-pointer"
              />
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/investor/dashboard" className="text-gray-800 hover:text-orange-600 transition-colors font-medium">
                Dashboard
              </Link>
              <Link href="/investor/portfolio" className="text-gray-600 hover:text-orange-600 transition-colors">
                Portfolio
              </Link>
              <Link href="/investor/marketplace" className="text-gray-600 hover:text-orange-600 transition-colors">
                Marketplace
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-800 text-sm font-medium">Investor</span>
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
            Investor Dashboard
          </h1>
          <p className="text-gray-600">
            Discover and invest in high-potential entertainment projects
          </p>
        </div>

        {/* Investment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-800">$0</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Total Invested</h3>
            <p className="text-gray-600 text-sm">Across all projects</p>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-800">0</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Active Investments</h3>
            <p className="text-gray-600 text-sm">Projects in portfolio</p>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Search className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-800">12</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Available Projects</h3>
            <p className="text-gray-600 text-sm">Seeking investment</p>
          </Card>
        </div>

        {/* Investment Opportunities */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Investment Opportunities</h2>
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
              <Search className="w-4 h-4 mr-2" />
              Browse Projects
            </Button>
          </div>
          
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Discover investment opportunities</h3>
            <p className="text-gray-600 mb-6">
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