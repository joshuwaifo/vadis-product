import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingUp, 
  PieChart,
  Briefcase
} from "lucide-react";
import DashboardLayout from "../dashboard/dashboard-layout";

export default function InvestorDashboard() {
  const [, setLocation] = useLocation();

  // Fetch current user data from session
  const { data: currentUser, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Authentication required');
      }
      return response.json();
    },
  });

  // Redirect to login if authentication fails
  if (userError) {
    setLocation('/login');
    return null;
  }

  // Show loading state while user data is being fetched
  if (userLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 overflow-hidden">
          <div className="relative px-6 py-12 sm:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 dark:from-white dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent leading-tight">
                      Welcome, {currentUser?.user?.name || 'Investor'}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                      Discover promising entertainment projects, analyze investment opportunities, and connect with innovative production companies.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Browse Projects
                    </Button>
                    <Button variant="outline" size="lg" className="border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300">
                      <PieChart className="w-5 h-5 mr-2" />
                      Portfolio
                    </Button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="w-full lg:w-auto">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:min-w-[300px]">
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Investments</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
                          </div>
                          <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio Value</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">$0</p>
                          </div>
                          <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto">
                    <DollarSign className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Investor Dashboard Coming Soon</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      Your investment dashboard is being built. Soon you'll be able to discover and analyze entertainment investment opportunities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}