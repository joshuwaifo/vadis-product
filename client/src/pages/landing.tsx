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
import { SiNetflix, SiApple, SiAmazon, SiNike, SiCocacola, SiMercedes, SiSony } from 'react-icons/si';
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
      id: "brand", 
      name: "Brand",
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
      name: "Creator",
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
      icon: Users,
      title: "Instant Project-Partner Matching",
      description: "Your $50M sci-fi project meets the perfect VFX studio, streaming platform, and luxury car brand sponsor in under 24 hours. Our AI analyzes 10,000+ industry connections daily.",
      metric: "97% faster partnerships",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      badge: "AI-Powered"
    },
    {
      icon: TrendingUp,
      title: "ROI-Guaranteed Collaborations", 
      description: "Every partnership is structured for mutual wins. Productions get funding + brand visibility, investors see measurable returns, brands reach target audiences authentically.",
      metric: "avg 340% ROI increase",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      badge: "Profit-Driven"
    },
    {
      icon: ShieldCheck,
      title: "Hollywood-Grade Security",
      description: "Bank-level encryption protects your scripts, financials, and strategic plans. Share confidently knowing your IP is safer than Fort Knox.",
      metric: "zero data breaches",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      badge: "Enterprise Security"
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
              <a href="#" className="text-white/90 hover:bg-gradient-to-r hover:from-blue-400 hover:via-purple-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent font-bold text-lg transition-all duration-300 font-sans">Products</a>
              <a href="#" className="text-white/90 hover:bg-gradient-to-r hover:from-blue-400 hover:via-purple-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent font-bold text-lg transition-all duration-300 font-sans">Solutions</a>
              <a href="#" className="text-white/90 hover:bg-gradient-to-r hover:from-blue-400 hover:via-purple-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent font-bold text-lg transition-all duration-300 font-sans">Learn</a>
              <a href="#" className="text-white/90 hover:bg-gradient-to-r hover:from-blue-400 hover:via-purple-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent font-bold text-lg transition-all duration-300 font-sans">Company</a>
              <a href="#" className="text-white/90 hover:bg-gradient-to-r hover:from-blue-400 hover:via-purple-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent font-bold text-lg transition-all duration-300 font-sans">Pricing</a>
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
                Unite vision
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                  with success
                </span>
              </h1>
              
              {/* Subheading */}
              <p className="text-2xl sm:text-3xl lg:text-4xl text-white/90 mb-24 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 font-sans font-medium leading-relaxed">
                Connect productions, investors, brands, and creators on one AI-powered platform.
                Where every project finds its perfect partners and every goal becomes achievable.
              </p>

              {/* Role Selection */}
              <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
                <h2 className="text-4xl lg:text-5xl font-black text-white mb-16 font-sans">Are you a...</h2>
                
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
                          <h3 className={`text-2xl font-black transition-colors font-sans ${isSelected ? 'text-gray-900' : 'text-gray-900 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:via-purple-500 group-hover:to-pink-500 group-hover:bg-clip-text group-hover:text-transparent'}`} style={{textShadow: '0 0 10px rgba(255,255,255,0.8)'}}>
                            {role.name}
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
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white px-20 py-8 text-2xl font-black transition-all duration-700 transform hover:scale-110 hover:rotate-1 shadow-2xl hover:shadow-3xl font-sans rounded-2xl relative overflow-hidden group"
                >
                  <span className="relative z-10">Request a demo</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
                Where <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">industry leaders</span> connect
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
                    
                    {/* Floating Orb */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                  </div>
                );
              })}
            </div>
            
            {/* Call to Action */}
            <div className="text-center mt-16">
              <p className="text-lg text-gray-700 font-medium mb-6">
                Ready to join the next generation of media collaboration?
              </p>
              <div className="inline-flex px-8 py-3 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full border border-purple-200">
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ✨ VadisMedia connects your vision with the right partners
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Power Features Section */}
        <section className="py-32 modern-gradient grain-texture relative overflow-hidden">
          {/* Floating Orbs - matching hero section */}
          <div className="floating-orb w-80 h-80 bg-gradient-to-r from-blue-500/30 to-purple-500/30 top-10 right-10"></div>
          <div className="floating-orb w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 bottom-20 left-10"></div>
          <div className="floating-orb w-96 h-96 bg-gradient-to-r from-pink-500/15 to-blue-500/15 top-1/3 left-1/3"></div>
          <div className="floating-orb w-48 h-48 bg-gradient-to-r from-green-500/20 to-blue-500/20 bottom-10 right-1/3"></div>
          
          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
            <div className="text-center mb-20 relative z-10">
              <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/30 mb-8">
                <span className="text-white font-semibold text-sm tracking-wide">REVOLUTIONARY PLATFORM</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 font-sans leading-tight glow-text">
                Turn ideas into 
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                  billion-dollar hits
                </span>
              </h2>
              <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-medium">
                Stop chasing connections. Start creating empires. VadisMedia's AI matches your vision 
                with the exact partners, funding, and talent to make box office magic happen.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 relative z-10">
              {powerFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div 
                    key={index} 
                    className="cursor-pointer p-8 transition-all duration-700 transform hover:scale-105 hover:rotate-1 backdrop-blur-lg relative z-10 card-glow overflow-hidden bg-gradient-to-br from-white/10 via-white/5 to-white/10 hover:from-white/20 hover:via-white/15 hover:to-white/20 border border-white/30 hover:border-white/50 rounded-3xl group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                        <span className="text-white text-xs font-bold tracking-wide">
                          {feature.badge}
                        </span>
                      </div>
                      <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-white mb-4 font-sans group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:via-purple-500 group-hover:to-pink-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300" style={{textShadow: '0 0 10px rgba(255,255,255,0.8)'}}>
                        {feature.title}
                      </h3>
                      <p className="text-white/80 leading-relaxed mb-6 text-lg font-medium">
                        {feature.description}
                      </p>
                      
                      {/* Metric */}
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse shadow-lg"></div>
                        <span className="text-green-300 font-bold text-sm uppercase tracking-wide">
                          {feature.metric}
                        </span>
                      </div>
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
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/3 to-pink-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          
          {/* Floating Orbs */}
          <div className="absolute top-20 left-1/4 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce opacity-20"></div>
          <div className="absolute bottom-20 right-1/3 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce delay-300 opacity-15"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-bounce delay-700 opacity-25"></div>
          
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Premium Badge */}
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-full border border-blue-500/20 mb-8">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold text-sm tracking-wide">✨ TRANSFORM YOUR VISION</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Ready to connect your next big project?
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              Join productions, investors, brands, and creators who use VadisMedia 
              to turn ambitious projects into profitable partnerships.
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
            
            {/* Enhanced Trust Indicators */}
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600">
              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center items-center gap-6">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full px-4 py-2 border border-blue-200/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 text-xs font-medium">Instant Setup</span>
                </div>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full px-4 py-2 border border-purple-200/50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
                  <span className="text-gray-700 text-xs font-medium">AI-Powered Matching</span>
                </div>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-50 to-blue-50 rounded-full px-4 py-2 border border-pink-200/50">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-400"></div>
                  <span className="text-gray-700 text-xs font-medium">Enterprise Security</span>
                </div>
              </div>
            </div>
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
