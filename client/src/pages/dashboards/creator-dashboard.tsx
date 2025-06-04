import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Camera, 
  Star, 
  Film,
  Users
} from "lucide-react";
import DashboardLayout from "../dashboard/dashboard-layout";

export default function CreatorDashboard() {
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
        <div className="relative bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-pink-900/20 overflow-hidden">
          <div className="relative px-6 py-12 sm:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-pink-800 dark:from-white dark:via-orange-200 dark:to-pink-200 bg-clip-text text-transparent leading-tight">
                      Welcome, {currentUser?.user?.name || 'Creator'}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                      Connect with productions, showcase your talent, and find opportunities to bring your creative vision to life.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <Button size="lg" className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Camera className="w-5 h-5 mr-2" />
                      Create Portfolio
                    </Button>
                    <Button variant="outline" size="lg" className="border-2 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300">
                      <Film className="w-5 h-5 mr-2" />
                      Browse Projects
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
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
                          </div>
                          <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Star className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connections</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
                          </div>
                          <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
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
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Creator Dashboard Coming Soon</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      Your creator dashboard is being built. Soon you'll be able to showcase your work and connect with production teams.
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