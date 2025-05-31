import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Briefcase, Package, Eye, LogOut } from "lucide-react";
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png";

export default function BrandDashboard() {
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
              <Link href="/brand/dashboard" className="text-white hover:text-purple-300 transition-colors">
                Dashboard
              </Link>
              <Link href="/brand/products" className="text-white/70 hover:text-purple-300 transition-colors">
                Products
              </Link>
              <Link href="/brand/marketplace" className="text-white/70 hover:text-purple-300 transition-colors">
                Marketplace
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm">Brand/Agency</span>
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
            Brand Dashboard
          </h1>
          <p className="text-white/80">
            Manage your products and discover placement opportunities
          </p>
        </div>

        {/* Product Management */}
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">My Products</h2>
            <Button className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
              <Package className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
          
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No products added yet</h3>
            <p className="text-white/70 mb-6">
              Start by adding your products to connect with film and TV productions
            </p>
            <Button className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
              Add Your First Product
            </Button>
          </div>
        </Card>

        {/* Marketplace Opportunities */}
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Placement Opportunities</h2>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Eye className="w-4 h-4 mr-2" />
              Browse Marketplace
            </Button>
          </div>
          
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Discover new opportunities</h3>
            <p className="text-white/70 mb-6">
              Browse active film and TV projects looking for product placements
            </p>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Explore Projects
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}