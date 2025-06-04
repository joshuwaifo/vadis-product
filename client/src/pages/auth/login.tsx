import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { loginSchema, type LoginData, userRoles } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("/api/auth/login", "POST", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Login successful!",
        description: "Welcome back to VadisAI.",
      });
      
      // Use the redirectPath from the server response if available
      if (data.redirectPath) {
        setLocation(data.redirectPath);
      } else {
        // Fallback: redirect based on role
        const role = data.user?.role;
        switch (role) {
          case 'production':
            setLocation("/dashboard/production");
            break;
          case 'brand':
            setLocation("/dashboard/brand");
            break;
          case 'financier':
            setLocation("/dashboard/financier");
            break;
          case 'creator':
            setLocation("/dashboard/creator");
            break;
          default:
            setLocation("/dashboard");
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen modern-gradient grain-texture flex flex-col">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <img
              src={vadisLogoLight}
              alt="VadisMedia"
              className="h-24 w-auto drop-shadow-2xl cursor-pointer"
            />
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-white/80">Don't have an account?</span>
            <Button asChild className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-gray-900 transition-all duration-300">
              <Link href="/demo-request">Request a Demo</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Login Form - Centered */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to your VadisAI account
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            placeholder="Enter your password"
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

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                New to VadisAI?{" "}
                <Link href="/demo-request" className="text-blue-600 hover:text-blue-700 font-medium">
                  Request a Demo
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}