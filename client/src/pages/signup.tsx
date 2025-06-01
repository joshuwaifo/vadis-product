import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  Film, 
  Briefcase, 
  DollarSign, 
  Video,
  ArrowLeft,
  Eye,
  EyeOff 
} from "lucide-react";
import { 
  userRoles,
  productionSignupSchema,
  brandSignupSchema,
  investorSignupSchema,
  creatorSignupSchema,
  type ProductionSignup,
  type BrandSignup,
  type InvestorSignup,
  type CreatorSignup 
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png";

type RoleType = keyof typeof userRoles;
type SignupFormData = ProductionSignup | BrandSignup | InvestorSignup | CreatorSignup;

export default function Signup() {
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData & { role: RoleType }) => {
      const response = await apiRequest("/api/auth/signup", "POST", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Account created successfully!",
        description: "Welcome to VadisAI. Redirecting to your dashboard...",
      });
      
      // Redirect to role-specific dashboard
      const role = data.user?.role;
      switch (role) {
        case userRoles.PRODUCTION:
          setLocation("/production/dashboard");
          break;
        case userRoles.BRAND_AGENCY:
          setLocation("/brand/dashboard");
          break;
        case userRoles.INVESTOR:
          setLocation("/investor/dashboard");
          break;
        case userRoles.INDIVIDUAL_CREATOR:
          setLocation("/creator/dashboard");
          break;
        default:
          setLocation("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const getFormSchema = () => {
    switch (selectedRole) {
      case "PRODUCTION":
        return productionSignupSchema;
      case "BRAND_AGENCY":
        return brandSignupSchema;
      case "INVESTOR":
        return investorSignupSchema;
      case "INDIVIDUAL_CREATOR":
        return creatorSignupSchema;
      default:
        return productionSignupSchema;
    }
  };

  const form = useForm<SignupFormData>({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      // Production fields
      companyName: "",
      contactPerson: "",
      companyWebsite: "",
      // Brand fields
      brandName: "",
      // Investor fields
      fullName: "",
      investmentType: undefined,
      structure: undefined,
      // Creator fields
      platformLink: "",
    },
  });

  const onSubmit = (data: SignupFormData) => {
    if (!selectedRole) return;
    signupMutation.mutate({ ...data, role: selectedRole });
  };

  const roleCards = [
    {
      id: "PRODUCTION" as RoleType,
      title: "Production Company",
      description: "Create, manage, and analyze film/TV projects with AI-powered insights",
      icon: Film,
      gradient: "from-blue-500 via-purple-600 to-pink-600",
    },
    {
      id: "BRAND_AGENCY" as RoleType,
      title: "Brand/Agency",
      description: "Connect with productions for strategic product placement opportunities",
      icon: Briefcase,
      gradient: "from-green-500 via-teal-600 to-blue-600",
    },
    {
      id: "INVESTOR" as RoleType,
      title: "Financier (Investor)",
      description: "Discover and invest in high-potential entertainment projects",
      icon: DollarSign,
      gradient: "from-yellow-500 via-orange-600 to-red-600",
    },
    {
      id: "INDIVIDUAL_CREATOR" as RoleType,
      title: "Individual Creator",
      description: "Generate scripts and collaborate with industry professionals",
      icon: Video,
      gradient: "from-purple-500 via-pink-600 to-red-600",
    },
  ];

  if (!selectedRole) {
    return (
      <div className="min-h-screen modern-gradient grain-texture">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <img
                src={vadisLogoLight}
                alt="VadisMedia"
                className="h-24 w-auto drop-shadow-2xl cursor-pointer"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-white/80">Already have an account?</span>
              <Button asChild className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-gray-900 transition-all duration-300">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-black text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Join VadisAI
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Select your role to get started with AI-powered entertainment collaboration
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roleCards.map((role) => {
                const IconComponent = role.icon;
                return (
                  <Card
                    key={role.id}
                    className="relative group cursor-pointer overflow-hidden border-0 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                    onClick={() => setSelectedRole(role.id)}
                    style={{
                      background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #60a5fa, #a855f7, #ec4899) border-box',
                      border: '3px solid transparent'
                    }}
                  >
                    <div className="p-8 text-center">
                      <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${role.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:via-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {role.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedRoleData = roleCards.find(role => role.id === selectedRole);

  return (
    <div className="min-h-screen modern-gradient grain-texture">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <img
              src={vadisLogoLight}
              alt="VadisMedia"
              className="h-24 w-auto drop-shadow-2xl cursor-pointer"
            />
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-white/80">Already have an account?</span>
            <Button asChild className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-gray-900 transition-all duration-300">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setSelectedRole(null)}
              className="text-white hover:bg-white/10 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to role selection
            </Button>
          </div>

          <Card className="p-8">
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${selectedRoleData?.gradient} flex items-center justify-center`}>
                {selectedRoleData && <selectedRoleData.icon className="w-8 h-8 text-white" />}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedRoleData?.title}
              </h2>
              <p className="text-gray-600">
                Create your account to get started
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Common Fields */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter your email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Create password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              type={showConfirmPassword ? "text" : "password"} 
                              placeholder="Confirm password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Role-specific Fields */}
                {selectedRole === "PRODUCTION" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Production company name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Your full name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="companyWebsite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Website (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://yourcompany.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {selectedRole === "BRAND_AGENCY" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="brandName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand/Agency Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Brand or agency name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Your full name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="companyWebsite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Website (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://yourbrand.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {selectedRole === "INVESTOR" && (
                  <>
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name or Company Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your name or company name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="investmentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Investment Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select investment type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ROI-based Equity">ROI-based Equity</SelectItem>
                                <SelectItem value="Loan-based Debt">Loan-based Debt</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="structure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Structure</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select structure" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Individual">Individual</SelectItem>
                                <SelectItem value="Team/Fund">Team/Fund</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {selectedRole === "INDIVIDUAL_CREATOR" && (
                  <>
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name/Creator Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your full name or creator name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="platformLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Content Platform Link (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://youtube.com/channel/..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}