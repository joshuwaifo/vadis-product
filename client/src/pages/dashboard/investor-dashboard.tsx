import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign,
  TrendingUp, 
  Eye,
  PieChart,
  Search,
  Building2,
  FileText,
  Calendar
} from "lucide-react";


interface Investment {
  id: number;
  projectTitle: string;
  amount: number;
  status: string;
  expectedReturn: number;
  createdAt: string;
}

interface DashboardStats {
  totalInvestments: number;
  activeInvestments: number;
  totalInvested: number;
  expectedReturns: number;
}

export default function InvestorDashboard() {
  const { data: investments = [], isLoading: investmentsLoading } = useQuery<Investment[]>({
    queryKey: ['/api/investments'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/investor/stats'],
  });

  const recentInvestments = investments.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investor Dashboard</h1>
            <p className="text-gray-600">Track your entertainment industry investments</p>
          </div>
          <Link href="/investor/marketplace">
            <Button className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700">
              <Search className="w-4 h-4 mr-2" />
              Browse Projects
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalInvestments || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Projects funded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.activeInvestments || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Currently in production
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  ${(stats?.totalInvested || 0).toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Capital deployed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  ${(stats?.expectedReturns || 0).toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Projected returns
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for investors and financiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/investor/marketplace">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50">
                  <Search className="w-8 h-8 text-blue-600" />
                  <div className="text-center">
                    <div className="font-medium">Browse Projects</div>
                    <div className="text-sm text-gray-500">Find investment opportunities</div>
                  </div>
                </Button>
              </Link>

              <Link href="/investor/profile">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50">
                  <Building2 className="w-8 h-8 text-purple-600" />
                  <div className="text-center">
                    <div className="font-medium">Update Profile</div>
                    <div className="text-sm text-gray-500">Manage investment preferences</div>
                  </div>
                </Button>
              </Link>

              <Link href="/investor/analytics">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div className="text-center">
                    <div className="font-medium">Portfolio Analytics</div>
                    <div className="text-sm text-gray-500">Track investment performance</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Investments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Investments</CardTitle>
              <CardDescription>
                Your recent investment portfolio
              </CardDescription>
            </div>
            <Link href="/investor/portfolio">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {investmentsLoading ? (
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
            ) : recentInvestments.length === 0 ? (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No investments yet</h3>
                <p className="text-gray-500 mb-4">Browse the marketplace to find your first investment opportunity</p>
                <Link href="/investor/marketplace">
                  <Button>Browse Projects</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInvestments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{investment.projectTitle}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>${investment.amount.toLocaleString()}</span>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(investment.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={investment.status === 'active' ? "default" : "secondary"}>
                        {investment.status}
                      </Badge>
                      <Link href={`/investor/investments/${investment.id}`}>
                        <Button variant="outline" size="sm">
                          View
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