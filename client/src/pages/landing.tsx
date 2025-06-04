import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Vadis AI Platform
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Advanced AI-powered platform for entertainment industry professionals
          </p>
          <Button 
            onClick={() => setLocation("/auth/login")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Production Companies
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Comprehensive script analysis and production management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li>• AI script analysis</li>
                <li>• Production planning</li>
                <li>• Financial forecasting</li>
                <li>• Project management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Brands & Agencies
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Product placement opportunities and brand integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li>• Product placement analysis</li>
                <li>• Brand integration</li>
                <li>• Campaign management</li>
                <li>• ROI tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Financiers
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Investment analysis and portfolio management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li>• Investment opportunities</li>
                <li>• Risk assessment</li>
                <li>• Portfolio tracking</li>
                <li>• Market analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Individual Creators
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Creative tools and collaboration platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li>• Script development</li>
                <li>• Creative collaboration</li>
                <li>• Project showcase</li>
                <li>• Industry connections</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}