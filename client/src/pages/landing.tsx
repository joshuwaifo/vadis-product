import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Film, 
  Briefcase, 
  DollarSign, 
  Video, 
  Menu, 
  LogIn,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Users,
  ShieldCheck,
  Brain,
  Calendar,
  ChartBar
} from "lucide-react";
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png";
import vadisLogoDark from "@assets/Vadis_logo_dark.png";

export default function Landing() {
  const [selectedRole, setSelectedRole] = useState<string>("");

  const roles = [
    {
      id: "production",
      name: "Production",
      icon: Film,
      color: "from-indigo-500 to-indigo-600",
      hoverColor: "hover:text-indigo-600"
    },
    {
      id: "agency", 
      name: "Brand/Agency",
      icon: Briefcase,
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:text-purple-600"
    },
    {
      id: "investor",
      name: "Investor", 
      icon: DollarSign,
      color: "from-amber-500 to-amber-600",
      hoverColor: "hover:text-amber-600"
    },
    {
      id: "creator",
      name: "Creator",
      icon: Video,
      color: "from-green-500 to-green-600", 
      hoverColor: "hover:text-green-600"
    }
  ];

  const partners = [
    "Walmart", "Grab", "TikTok", "adidas", "udemy", "👑", "McDonald's"
  ];

  const features = [
    {
      icon: Brain,
      title: "AI Script Analysis",
      description: "Get instant insights on character development, pacing, and audience appeal with our advanced AI script analysis engine.",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling", 
      description: "Optimize shooting schedules, manage resources, and predict potential delays with intelligent production planning.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: ChartBar,
      title: "Performance Analytics",
      description: "Track project progress, budget utilization, and team performance with comprehensive real-time analytics.",
      color: "bg-amber-100 text-amber-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img 
                src={vadisLogoDark} 
                alt="VadisMedia" 
                className="h-8 w-auto"
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Products</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Solutions</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Learn</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Company</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Pricing</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-indigo-600">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Request a demo
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen flex items-center">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              {/* Main heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                Make good
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  data-driven choices
                </span>
              </h1>
              
              {/* Subheading */}
              <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                Transform insights into growth. Harness app results and
                hit your LTV goals with the #1 measurement partner.
              </p>

              {/* Role Selection */}
              <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8">Select your role:</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
                  {roles.map((role) => {
                    const IconComponent = role.icon;
                    const isSelected = selectedRole === role.id;
                    
                    return (
                      <Card 
                        key={role.id}
                        className={`cursor-pointer p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-2 ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                            : 'border-gray-200 hover:border-indigo-300 shadow-md hover:shadow-lg'
                        }`}
                        onClick={() => setSelectedRole(role.id)}
                      >
                        <div className="text-center">
                          <div className={`w-16 h-16 bg-gradient-to-br ${role.color} rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110`}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <h3 className={`text-lg font-semibold text-gray-900 transition-colors ${role.hoverColor}`}>
                            {role.name}
                          </h3>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600">
                <Button 
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Request a demo
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-indigo-600 hover:text-indigo-700 px-8 py-4 text-lg font-semibold border-2 border-indigo-200 hover:border-indigo-300 transition-all duration-300 hover:bg-indigo-50"
                >
                  Sign Up Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-lg text-gray-600 font-medium">Trusted by industry leaders</p>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-7 gap-8 items-center justify-items-center opacity-60 hover:opacity-80 transition-opacity duration-300">
              {partners.map((partner, index) => (
                <div key={index} className="flex items-center justify-center h-12">
                  <span className="text-2xl font-bold text-gray-400">{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Accelerate your <span className="text-indigo-600">creative process</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From script analysis to post-production optimization, VadisMedia's AI-powered platform 
                streamlines every aspect of film and media production.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Features List */}
              <div className="space-y-8">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Hero Image */}
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                  alt="Professional team analyzing film production data" 
                  className="rounded-2xl shadow-2xl w-full h-auto"
                />
                
                {/* Floating analytics card */}
                <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Production On Track</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">94% budget efficiency</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to revolutionize your production?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of creators, producers, and studios who trust VadisMedia 
              to bring their vision to life efficiently and effectively.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start free trial
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                Contact sales
              </Button>
            </div>
            
            <p className="text-indigo-200 text-sm mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center mb-4">
                <img 
                  src={vadisLogoLight} 
                  alt="VadisMedia" 
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-400 mb-4">
                AI-powered platform for modern film and media production.
              </p>
              <div className="flex space-x-4">
                <div className="w-6 h-6 text-gray-400 hover:text-indigo-500 cursor-pointer transition-colors">📱</div>
                <div className="w-6 h-6 text-gray-400 hover:text-indigo-500 cursor-pointer transition-colors">💼</div>
                <div className="w-6 h-6 text-gray-400 hover:text-indigo-500 cursor-pointer transition-colors">📺</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Script Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Production Planning</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 VadisMedia. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
