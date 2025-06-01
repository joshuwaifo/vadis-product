import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Package,
  TrendingUp, 
  Eye,
  ShoppingBag,
  Search,
  Star,
  Building2
} from "lucide-react";


interface Product {
  id: number;
  productName: string;
  companyName: string;
  category: string;
  imageUrl?: string;
  description: string;
  placementCriteria: string;
  createdAt: string;
}

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalViews: number;
  placementRequests: number;
}

export default function BrandDashboard() {
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/brand/stats'],
  });

  const recentProducts = products.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Brand Dashboard</h1>
            <p className="text-gray-600">Manage your products and brand partnerships</p>
          </div>
          <Link href="/brand/products/new">
            <Button className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                In your catalog
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.activeProducts || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Available for placement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Product Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                By production companies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Placement Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.placementRequests || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Active opportunities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for brands and agencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/brand/products/new">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50">
                  <Package className="w-8 h-8 text-blue-600" />
                  <div className="text-center">
                    <div className="font-medium">Add Product</div>
                    <div className="text-sm text-gray-500">Create new product listing</div>
                  </div>
                </Button>
              </Link>

              <Link href="/brand/marketplace">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50">
                  <Search className="w-8 h-8 text-purple-600" />
                  <div className="text-center">
                    <div className="font-medium">Browse Projects</div>
                    <div className="text-sm text-gray-500">Find placement opportunities</div>
                  </div>
                </Button>
              </Link>

              <Link href="/brand/analytics">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div className="text-center">
                    <div className="font-medium">View Analytics</div>
                    <div className="text-sm text-gray-500">Track placement performance</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Products</CardTitle>
              <CardDescription>
                Your product catalog for brand placements
              </CardDescription>
            </div>
            <Link href="/brand/products">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-500 mb-4">Add your first product to start getting placement opportunities</p>
                <Link href="/brand/products/new">
                  <Button>Add Your First Product</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{product.productName}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Building2 className="w-3 h-3" />
                          <span>{product.companyName}</span>
                          <span>•</span>
                          <span>{product.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">
                        Active
                      </Badge>
                      <Link href={`/brand/products/${product.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}