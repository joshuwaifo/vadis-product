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
    <div className="min-h-screen modern-gradient grain-texture">
      {/* Header Navigation */}
      <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <div className="flex items-center relative z-10">
              <img 
                src={vadisLogoLight} 
                alt="VadisMedia" 
                className="h-20 w-auto"
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10 relative z-10">
              <a href="#" className="text-white/90 hover:text-blue-400 font-bold text-lg transition-all duration-300 font-sans">Products</a>
              <a href="#" className="text-white/90 hover:text-blue-400 font-bold text-lg transition-all duration-300 font-sans">Solutions</a>
              <a href="#" className="text-white/90 hover:text-blue-400 font-bold text-lg transition-all duration-300 font-sans">Learn</a>
              <a href="#" className="text-white/90 hover:text-blue-400 font-bold text-lg transition-all duration-300 font-sans">Company</a>
              <a href="#" className="text-white/90 hover:text-blue-400 font-bold text-lg transition-all duration-300 font-sans">Pricing</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-6 relative z-10">
              <Button variant="ghost" className="text-white hover:text-blue-400 font-bold text-lg font-sans border-none">
                <LogIn className="w-5 h-5 mr-3" />
                Login
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-sans rounded-xl">
                Request a demo
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden relative z-10">
              <Button variant="ghost" size="sm" className="text-white">
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-screen flex items-center">
          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-32">
            <div className="text-center relative z-10">
              {/* Main heading */}
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 font-sans leading-tight tracking-tight">
                Make good
                <br />
                <span className="text-blue-400">
                  data-driven choices
                </span>
              </h1>
              
              {/* Subheading */}
              <p className="text-xl sm:text-2xl lg:text-3xl text-white/80 mb-20 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 font-sans font-medium leading-relaxed">
                Transform insights into growth. Harness production data and
                hit your creative goals with the #1 AI-powered platform.
              </p>

              {/* Role Selection */}
              <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
                <h2 className="text-4xl lg:text-5xl font-black text-white mb-16 font-sans">Select your role:</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 max-w-6xl mx-auto">
                  {roles.map((role) => {
                    const IconComponent = role.icon;
                    const isSelected = selectedRole === role.id;
                    
                    return (
                      <Card 
                        key={role.id}
                        className={`cursor-pointer p-10 transition-all duration-500 transform hover:scale-110 backdrop-blur-sm grain-light relative z-10 ${
                          isSelected 
                            ? 'border-2 border-blue-400 bg-white/95 shadow-2xl scale-105' 
                            : 'border border-white/20 hover:border-blue-400/50 shadow-xl hover:shadow-2xl bg-white/10 hover:bg-white/20'
                        } rounded-2xl`}
                        onClick={() => setSelectedRole(role.id)}
                      >
                        <div className="text-center relative z-10">
                          <div className={`w-24 h-24 ${isSelected ? 'bg-blue-600' : 'bg-white/20'} rounded-2xl flex items-center justify-center mx-auto mb-8 transition-all duration-500 hover:scale-110 shadow-lg`}>
                            <IconComponent className={`w-12 h-12 ${isSelected ? 'text-white' : 'text-white/90'}`} />
                          </div>
                          <h3 className={`text-xl font-bold transition-colors font-sans ${isSelected ? 'text-gray-900' : 'text-white'}`}>
                            {role.name}
                          </h3>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-8 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600 relative z-10">
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-16 py-6 text-xl font-black transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-3xl font-sans rounded-xl"
                >
                  Request a demo
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-white border-2 border-white/30 hover:border-blue-400 hover:bg-white/10 px-16 py-6 text-xl font-black transition-all duration-500 hover:scale-105 font-sans rounded-xl backdrop-blur-sm"
                >
                  Sign Up Now <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-24 bg-white grain-light">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-16">
              <p className="text-2xl text-gray-800 font-bold font-sans">Trusted by industry leaders</p>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-7 gap-12 items-center justify-items-center opacity-40 hover:opacity-60 transition-opacity duration-300">
              {partners.map((partner, index) => (
                <div key={index} className="flex items-center justify-center h-16">
                  <span className="text-3xl font-black text-gray-600 font-sans">{partner}</span>
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
                  className="h-12 w-auto"
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
