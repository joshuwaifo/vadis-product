import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  User, 
  FolderOpen, 
  Plus, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Projects", href: "/dashboard/projects", icon: FolderOpen },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location === "/dashboard";
    }
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Modern Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and Primary Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link href="/dashboard">
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-xl shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                      <span className="text-xs font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">V</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">VadisAI</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                      {userLoading ? 'Loading...' : currentUser?.user?.role || 'User'}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Horizontal Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} href={item.href}>
                      <div className={`
                        flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group
                        ${isActive(item.href)
                          ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-white'
                        }
                      `}>
                        <Icon className={`mr-2 h-4 w-4 transition-colors ${
                          isActive(item.href) ? 'text-blue-600 dark:text-blue-400' : 'group-hover:text-blue-500'
                        }`} />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/projects/new">
                <Button className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-6">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </Link>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* User menu */}
              <Button variant="ghost" size="sm" className="rounded-lg">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-xl shadow-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                    <span className="text-xs font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">V</span>
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">VadisAI</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                    {userLoading ? 'Loading...' : currentUser?.user?.role || 'User'}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="mt-8 px-4 pb-6">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div className={`
                        flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                        ${isActive(item.href)
                          ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-100 dark:border-blue-800/50'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white'
                        }
                      `}>
                        <Icon className={`mr-3 h-5 w-5 transition-colors ${
                          isActive(item.href) ? 'text-blue-600 dark:text-blue-400' : 'group-hover:text-blue-500'
                        }`} />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}