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
  ChartBar,
  Play,
  Heart,
  Banknote
} from "lucide-react";
import { SiNetflix, SiApple, SiAmazon, SiNike, SiCocacola, SiMercedes, SiSony } from 'react-icons/si';
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png";
import vadisLogoDark from "@assets/Vadis_logo_dark.png";

export default function Landing() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [selectedPlatformOption, setSelectedPlatformOption] = useState<string>("");
  const [showSolutionsDropdown, setShowSolutionsDropdown] = useState(false);
  const [selectedSolutionOption, setSelectedSolutionOption] = useState<string>("");
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);

  const handlePlatformMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setShowPlatformDropdown(true);
    setShowSolutionsDropdown(false);
  };

  const handlePlatformMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowPlatformDropdown(false);
    }, 300);
    setDropdownTimeout(timeout);
  };

  const handleSolutionsMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setShowSolutionsDropdown(true);
    setShowPlatformDropdown(false);
  };

  const handleSolutionsMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowSolutionsDropdown(false);
    }, 300);
    setDropdownTimeout(timeout);
  };

  const platformOptions = [
    {
      id: "create",
      name: "Create",
      icon: Play,
      description: "Production tools and creative workflows",
      color: "from-blue-500 to-purple-600"
    },
    {
      id: "analyze",
      name: "Analyze", 
      icon: BarChart3,
      description: "AI-powered insights and analytics",
      color: "from-purple-500 to-pink-600"
    },
    {
      id: "brand",
      name: "Brand",
      icon: Heart,
      description: "Brand partnerships and collaborations", 
      color: "from-pink-500 to-red-500"
    },
    {
      id: "fund",
      name: "Fund",
      icon: Banknote,
      description: "Investment and financing solutions",
      color: "from-green-500 to-blue-500"
    }
  ];

  const solutionOptions = [
    {
      id: "production-companies",
      name: "Production Companies",
      icon: Film,
      description: "End-to-end production management solutions",
      color: "from-blue-500 to-purple-600"
    },
    {
      id: "brands-agencies",
      name: "Brands/Agencies",
      icon: Heart,
      description: "Brand partnership and campaign solutions",
      color: "from-purple-500 to-pink-600"
    },
    {
      id: "financiers",
      name: "Financiers",
      icon: DollarSign,
      description: "Investment and funding solutions",
      color: "from-green-500 to-blue-500"
    },
    {
      id: "individual-creators",
      name: "Individual Creators",
      icon: Users,
      description: "Tools for independent content creators",
      color: "from-pink-500 to-red-500"
    }
  ];

  const roles = [
    {
      id: "production",
      name: "Production Company",
      icon: Film,
      color: "from-indigo-500 to-indigo-600",
      hoverColor: "hover:text-indigo-600"
    },
    {
      id: "brand", 
      name: "Brand/Agency",
      icon: Briefcase,
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:text-purple-600"
    },
    {
      id: "financier",
      name: "Financier", 
      icon: DollarSign,
      color: "from-amber-500 to-amber-600",
      hoverColor: "hover:text-amber-600"
    },
    {
      id: "creator",
      name: "Individual Creator",
      icon: Video,
      color: "from-green-500 to-green-600", 
      hoverColor: "hover:text-green-600"
    }
  ];

  const industryPartners = [
    { name: "Netflix", icon: SiNetflix, category: "Streaming", color: "text-red-500" },
    { name: "Warner Bros", icon: Film, category: "Studios", color: "text-blue-600" },
    { name: "Apple", icon: SiApple, category: "Tech & Streaming", color: "text-gray-700" },
    { name: "Amazon", icon: SiAmazon, category: "Streaming & Production", color: "text-orange-500" },
    { name: "Nike", icon: SiNike, category: "Brand Partnership", color: "text-black" },
    { name: "Coca-Cola", icon: SiCocacola, category: "Brand Marketing", color: "text-red-600" },
    { name: "Mercedes", icon: SiMercedes, category: "Luxury Brands", color: "text-gray-800" },
    { name: "Sony", icon: SiSony, category: "Entertainment", color: "text-black" }
  ];

  const powerFeatures = [
    {
      icon: Heart,
      title: "Brand Marketplace",
      description: "Unlock new revenue streams from Brand Sponsorship opportunities in-scene with the Vadis Brand Marketplace. Analyze brandable scenes and generate static and dynamic assets in-realtime to showcase to partners and key stakeholders.",
      metric: "New revenue streams",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      badge: "Brand Partnerships"
    },
    {
      icon: TrendingUp,
      title: "Location Incentives", 
      description: "Maximize film location incentives globally with VadisAI's Location Suggestor and Partner Program for in-market legal and auditing teams.",
      metric: "Global incentives",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      badge: "Cost Optimization"
    },
    {
      icon: Play,
      title: "VFX Visualization",
      description: "Visualize VFX treatments for scenes in minutes with VadisFX, creating live estimates for VFX projects with our sister company, Volucap-Vadis Limited Company.",
      metric: "Instant estimates",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      badge: "VFX Solutions"
    },
    {
      icon: Users,
      title: "Character Analysis & Casting",
      description: "Understand the nuances and full interrelationship schemes of characters and let VadisAI help you with casting options for your project.",
      metric: "Smart casting",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50",
      badge: "AI Casting"
    }
  ];

  return (
    <div className="min-h-screen modern-gradient grain-texture">
      {/* Header Navigation */}
      <header className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur-xl border-b border-white/20 shadow-2xl">
        <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-28">
            {/* Logo */}
            <div className="flex items-center relative z-10">
              <img 
                src={vadisLogoLight} 
                alt="VadisMedia" 
                className="h-24 w-auto drop-shadow-2xl"
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10 relative z-10">
              <div 
                className="relative"
                onMouseEnter={handlePlatformMouseEnter}
                onMouseLeave={handlePlatformMouseLeave}
              >
                <a href="#" className="text-white/90 hover:bg-gradient-to-r hover:from-blue-400 hover:via-purple-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent font-bold text-lg transition-all duration-300 font-sans">
                  Platform
                </a>
                
                {/* Platform Dropdown */}
                {showPlatformDropdown && (
                  <div 
                    className="absolute top-full left-0 mt-4 w-80 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden z-50"
                    onMouseEnter={handlePlatformMouseEnter}
                    onMouseLeave={handlePlatformMouseLeave}
                  >
                    <div className="p-6">
                      <div className="grid gap-4">
                        {platformOptions.map((option, index) => {
                          const IconComponent = option.icon;
                          const isSelected = selectedPlatformOption === option.id;
                          return (
                            <div
                              key={index}
                              onClick={() => {
                                setSelectedPlatformOption(option.id);
                                setShowPlatformDropdown(false);
                              }}
                              className={`group flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-lg' 
                                  : 'border-transparent hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200/50'
                              }`}
                            >
                              <div className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg ${
                                isSelected ? 'scale-110' : ''
                              }`}>
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className={`font-bold transition-all duration-300 ${
                                  isSelected 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
                                    : 'text-gray-900 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent'
                                }`}>
                                  {option.name}
                                </h4>
                                <p className="text-sm text-gray-600 group-hover:text-gray-700">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div 
                className="relative"
                onMouseEnter={handleSolutionsMouseEnter}
                onMouseLeave={handleSolutionsMouseLeave}
              >
                <a href="#" className="text-white/90 hover:bg-gradient-to-r hover:from-blue-400 hover:via-purple-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent font-bold text-lg transition-all duration-300 font-sans">
                  Solutions
                </a>
                
                {/* Solutions Dropdown */}
                {showSolutionsDropdown && (
                  <div 
                    className="absolute top-full left-0 mt-4 w-80 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden z-50"
                    onMouseEnter={handleSolutionsMouseEnter}
                    onMouseLeave={handleSolutionsMouseLeave}
                  >
                    <div className="p-6">
                      <div className="grid gap-4">
                        {solutionOptions.map((option, index) => {
                          const IconComponent = option.icon;
                          const isSelected = selectedSolutionOption === option.id;
                          return (
                            <div
                              key={index}
                              onClick={() => {
                                setSelectedSolutionOption(option.id);
                                setShowSolutionsDropdown(false);
                              }}
                              className={`group flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-lg' 
                                  : 'border-transparent hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200/50'
                              }`}
                            >
                              <div className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg ${
                                isSelected ? 'scale-110' : ''
                              }`}>
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className={`font-bold transition-all duration-300 ${
                                  isSelected 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
                                    : 'text-gray-900 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent'
                                }`}>
                                  {option.name}
                                </h4>
                                <p className="text-sm text-gray-600 group-hover:text-gray-700">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <a href="#" className="text-white/90 hover:bg-gradient-to-r hover:from-blue-400 hover:via-purple-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent font-bold text-lg transition-all duration-300 font-sans">Company</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-6 relative z-10">
              <Button variant="ghost" className="text-white hover:bg-gradient-to-r hover:from-blue-400 hover:via-purple-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent font-bold text-lg font-sans border-none">
                <LogIn className="w-5 h-5 mr-3" />
                Login
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-8 py-3 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-sans rounded-xl">
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
      <main className="pt-28">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-screen flex items-center">
          {/* Floating Orbs */}
          <div className="floating-orb w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-600/20 top-20 -left-48"></div>
          <div className="floating-orb w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 top-1/2 -right-40"></div>
          <div className="floating-orb w-64 h-64 bg-gradient-to-r from-pink-500/20 to-blue-500/20 bottom-20 left-1/4"></div>
          
          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-32">
            <div className="text-center relative z-10">
              {/* Main heading */}
              <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black text-white mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 font-sans leading-tight tracking-tight glow-text">
                Accelerate your <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">business with VadisAI</span>
              </h1>
              
              {/* Subheading */}
              <p className="text-2xl sm:text-3xl lg:text-4xl text-white/90 mb-24 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 font-sans font-medium leading-relaxed">
                VadisAI delivers global opportunities for production companies, financiers, brands/agencies, and individual creators with our vertically integrated AI-driven platform.
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
                        className={`cursor-pointer p-12 transition-all duration-700 transform hover:scale-105 hover:rotate-1 backdrop-blur-lg relative z-10 card-glow overflow-hidden ${
                          isSelected 
                            ? 'bg-gradient-to-br from-white/95 via-white/90 to-white/95 shadow-2xl scale-105 border-2 border-white/50' 
                            : 'bg-gradient-to-br from-white/10 via-white/5 to-white/10 hover:from-white/20 hover:via-white/15 hover:to-white/20 border border-white/30 hover:border-white/50'
                        } rounded-3xl group`}
                        onClick={() => setSelectedRole(role.id)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                        <div className="text-center relative z-10">
                          <div className={`w-28 h-28 ${isSelected ? 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 shadow-2xl' : 'bg-gradient-to-br from-white/80 to-white/60 group-hover:from-blue-500/80 group-hover:via-purple-500/80 group-hover:to-pink-500/80'} rounded-3xl flex items-center justify-center mx-auto mb-10 transition-all duration-700 hover:scale-110 hover:rotate-12 shadow-xl`}>
                            <IconComponent className={`w-14 h-14 ${isSelected ? 'text-white drop-shadow-lg' : 'text-gray-800 group-hover:text-white'} transition-all duration-500 drop-shadow-lg`} />
                          </div>
                          <h3 className={`text-2xl font-black transition-all duration-300 font-sans ${isSelected ? 'text-gray-900' : 'text-gray-900'}`} style={{textShadow: '0 0 10px rgba(255,255,255,0.8)'}}>
                            <span className={`${!isSelected ? 'group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:via-purple-500 group-hover:to-pink-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300' : ''}`}>
                              {role.name}
                            </span>
                          </h3>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-10 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600 relative z-10">
                <Button 
                  key={selectedRole} // Force re-render to restart animation
                  size="lg"
                  className={`bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white px-20 py-8 text-2xl font-black transition-all duration-700 transform hover:scale-110 hover:rotate-1 shadow-2xl hover:shadow-3xl font-sans rounded-2xl relative overflow-hidden group ${
                    selectedRole ? 'animate-double-bounce' : ''
                  }`}
                >
                  <span className="relative z-10">Request a demo</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {selectedRole && (
                    <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-pink-400/30 rounded-3xl animate-ping"></div>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="relative px-20 py-8 text-2xl font-black transition-all duration-700 hover:scale-105 hover:-rotate-1 font-sans rounded-2xl overflow-hidden group border-0"
                  style={{
                    background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #60a5fa, #a855f7, #ec4899) border-box',
                    border: '4px solid transparent'
                  }}
                >
                  <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 bg-clip-text text-transparent font-black">
                    Sign Up Now
                  </span>
                  <ArrowRight className="w-7 h-7 ml-4 text-pink-500 group-hover:translate-x-2 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Industry Showcase */}
        <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-sans">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Trusted by industry leaders</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The kind of companies already transforming media production through strategic partnerships
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {industryPartners.map((company, index) => {
                const IconComponent = company.icon;
                return (
                  <div 
                    key={index} 
                    className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:rotate-1 shadow-lg hover:shadow-2xl border border-white/50"
                  >
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 text-center">
                      <div className="flex items-center justify-center mb-4">
                        <IconComponent className={`w-12 h-12 ${company.color} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans">{company.name}</h3>
                      <p className="text-sm text-gray-600 font-medium">{company.category}</p>
                    </div>
                    

                  </div>
                );
              })}
            </div>
            
            {/* Call to Action */}
            <div className="text-center mt-16">
              <p className="text-lg text-gray-700 font-medium mb-6">
                Ready to join the next generation of media collaboration?
              </p>
              <Button 
                size="lg"
                className="group relative bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-bold transition-all duration-500 transform hover:scale-110 hover:rotate-1 shadow-2xl hover:shadow-3xl rounded-2xl overflow-hidden"
              >
                <span className="relative z-10">✨ Schedule a demo</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </Button>
            </div>
          </div>
        </section>

        {/* Power Features Section */}
        <section className="py-32 modern-gradient grain-texture relative overflow-hidden">
          
          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
            <div className="text-center mb-20 relative z-10">

              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 font-sans leading-tight glow-text">
                Grow your ideas into the 
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                  next big hit
                </span>
              </h2>
              <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-medium">
                Stop chasing connections. Start creating empires. VadisMedia's AI matches your vision 
                with the exact partners, funding, and talent to make box office magic happen.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {powerFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div 
                    key={index} 
                    className="group relative h-full"
                  >
                    {/* Card Container with fixed height and consistent structure */}
                    <div className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 h-full transition-all duration-300 group-hover:border-white/40 group-hover:shadow-xl group-hover:transform group-hover:scale-[1.02] flex flex-col">
                      
                      {/* Header Section - Fixed Height */}
                      <div className="flex items-center justify-between mb-4 min-h-[80px]">
                        <div className="flex-1">
                          <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                            <span className="text-white text-xs font-semibold tracking-wide">
                              {feature.badge}
                            </span>
                          </div>
                        </div>
                        <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0`}>
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      
                      {/* Content Section - Flexible Height */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-3 font-sans leading-tight min-h-[3rem] flex items-start" style={{textShadow: '0 0 15px rgba(255,255,255,0.6)'}}>
                          {feature.title}
                        </h3>
                        
                        <p className="text-white/80 leading-relaxed text-sm font-medium flex-1 mb-4">
                          {feature.description}
                        </p>
                        
                        {/* Footer Section - Fixed Height */}
                        <div className="flex items-center pt-3 border-t border-white/10 mt-auto">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full shadow-md"></div>
                            <span className="text-emerald-300 font-semibold text-xs uppercase tracking-wide">
                              {feature.metric}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Subtle Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Success Stories Ticker */}
            <div className="mt-20 text-center relative z-10">
              <div className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/30 card-glow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <div className="text-4xl font-black text-white mb-2 glow-text">$2.3B</div>
                    <div className="text-white/70 font-medium">Projects funded through partnerships</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-white mb-2 glow-text">847</div>
                    <div className="text-white/70 font-medium">Successful collaborations launched</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-white mb-2 glow-text">99.2%</div>
                    <div className="text-white/70 font-medium">Partner satisfaction rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-32 bg-white relative overflow-hidden">
          
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Premium Badge */}
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-full border border-blue-500/20 mb-8">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold text-sm tracking-wide">✨ TRANSFORM YOUR VISION</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">Ready to join the future of media and entertainment?</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              Join Production Companies, Brands/Agencies, Financiers, and Individual Creators who use VadisAI to accelerate their new big idea.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
              <Button 
                size="lg"
                className="group relative bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white px-12 py-6 text-xl font-bold transition-all duration-500 transform hover:scale-110 hover:rotate-1 shadow-2xl hover:shadow-3xl rounded-2xl overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="group relative px-12 py-6 text-xl font-bold transition-all duration-500 transform hover:scale-105 hover:-rotate-1 rounded-2xl overflow-hidden border-0"
                style={{
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #60a5fa, #a855f7, #ec4899) border-box',
                  border: '3px solid transparent'
                }}
              >
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-pink-700 transition-all duration-300">
                  Contact sales
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              </Button>
            </div>

          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="lg:col-span-1">
              <div className="flex items-start mb-6">
                <img 
                  src={vadisLogoLight} 
                  alt="VadisMedia" 
                  className="h-20 w-auto"
                />
              </div>

              <p className="text-gray-400 text-sm leading-relaxed">
                Address: Gartenstrasse 6, 6300 Zug, Switzerland
              </p>
            </div>
            
            <div className="flex flex-col">
              <h4 className="text-white font-semibold mb-6 text-base">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Create</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Analyze</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Brand</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Fund</a></li>
              </ul>
            </div>
            
            <div className="flex flex-col">
              <h4 className="text-white font-semibold mb-6 text-base">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Press</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Contact</a></li>
              </ul>
            </div>
            
            <div className="flex flex-col">
              <h4 className="text-white font-semibold mb-6 text-base">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Technical Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Sales</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Vadis Media AG. All rights reserved.
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
