import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Briefcase, Package, Eye, LogOut } from "lucide-react";
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png";

export default function BrandDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-teal-50">
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
              <Link href="/brand/dashboard" className="text-gray-800 hover:text-green-600 transition-colors font-medium">
                Dashboard
              </Link>
              <Link href="/brand/products" className="text-gray-600 hover:text-green-600 transition-colors">
                Products
              </Link>
              <Link href="/brand/marketplace" className="text-gray-600 hover:text-green-600 transition-colors">
                Marketplace
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-800 text-sm font-medium">Brand/Agency</span>
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
            Brand Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your products and discover placement opportunities
          </p>
        </div>

        {/* Product Management */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Products</h2>
            <Button className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
              <Package className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
          
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products added yet</h3>
            <p className="text-gray-600 mb-6">
              Start by adding your products to connect with film and TV productions
            </p>
            <Button className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
              Add Your First Product
            </Button>
          </div>
        </Card>

        {/* Marketplace Opportunities */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Placement Opportunities</h2>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Eye className="w-4 h-4 mr-2" />
              Browse Marketplace
            </Button>
          </div>
          
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Discover new opportunities</h3>
            <p className="text-gray-600 mb-6">
              Browse active film and TV projects looking for product placements
            </p>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Explore Projects
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}