import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, ArrowRight, Sparkles, Lock, CheckCircle2, Building2, Megaphone, DollarSign, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png"
import type { UserRole } from "@shared/schema"

const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["production", "brand", "financier", "creator"], {
    required_error: "Please select your role"
  })
}).refine((data) => {
  // For business roles, validate email domain (basic check)
  if (['production', 'brand', 'financier'].includes(data.role)) {
    const domain = data.email.split('@')[1];
    // Reject common personal email domains for business roles
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    if (personalDomains.includes(domain?.toLowerCase())) {
      return false;
    }
  }
  return true;
}, {
  message: "Production companies, brands, and financiers must use a business email address",
  path: ["email"]
})

const signinSchema = z.object({
  email: z.string().email("Please enter a valid email address")
})

type SignupFormData = z.infer<typeof signupSchema>
type SigninFormData = z.infer<typeof signinSchema>

export default function AuthLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState('signup')

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      firstName: "",
      lastName: "",
      email: "",
      role: undefined
    }
  })

  const signinForm = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "" }
  })

  const roleOptions = [
    { value: "production" as UserRole, label: "Production Company", icon: Building2, description: "Film/TV production studios" },
    { value: "brand" as UserRole, label: "Brand/Agency", icon: Megaphone, description: "Marketing agencies & brands" },
    { value: "financier" as UserRole, label: "Financier", icon: DollarSign, description: "Investment firms & financiers" },
    { value: "creator" as UserRole, label: "Individual Creator", icon: User, description: "Independent content creators" }
  ]

  const onSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      // Store signup data in localStorage for after email verification
      localStorage.setItem('vadis_signup_data', JSON.stringify(data))

      // Try magic link first
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-callback`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role
          }
        }
      })

      console.log('Magic link request sent to:', data.email)
      console.log('Redirect URL:', `${window.location.origin}/auth-callback`)

      if (error) throw error

      setMessage({
        type: 'success',
        text: `Magic link sent to ${data.email}. Please check your inbox and click the link to complete signup.`
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send magic link. Please check your Supabase email configuration.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSigninSubmit = async (data: SigninFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-callback`
        }
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: `Magic link sent to ${data.email}. Please check your inbox and click the link to sign in.`
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send magic link. Please check your Supabase email configuration.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={vadisLogoLight} 
              alt="VadisAI" 
              className="h-16 w-auto drop-shadow-xl"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Welcome to VadisAI
          </h1>
          <p className="text-slate-600 leading-relaxed">
            Sign in to access your entertainment collaboration platform
          </p>
        </div>

        {/* Main Card */}
        <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2 text-xl">
              <Lock className="h-5 w-5 text-blue-600" />
              <span>Secure Authentication</span>
            </CardTitle>
            <CardDescription>
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100/80">
                <TabsTrigger value="signup" className="flex items-center space-x-2 data-[state=active]:bg-white">
                  <User className="h-4 w-4" />
                  <span>Sign Up</span>
                </TabsTrigger>
                <TabsTrigger value="signin" className="flex items-center space-x-2 data-[state=active]:bg-white">
                  <Mail className="h-4 w-4" />
                  <span>Sign In</span>
                </TabsTrigger>
              </TabsList>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                      <Sparkles className="h-3 w-3 mr-1" />
                      New to VadisAI
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Create your account and select your role to get started.
                  </p>
                </div>

                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={signupForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John" 
                                {...field} 
                                className="h-12 bg-white/80 border-slate-200 focus:border-blue-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Doe" 
                                {...field} 
                                className="h-12 bg-white/80 border-slate-200 focus:border-blue-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="john.doe@company.com" 
                              {...field} 
                              className="h-12 bg-white/80 border-slate-200 focus:border-blue-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-white/80 border-slate-200 focus:border-blue-400">
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roleOptions.map((role) => {
                                const Icon = role.icon
                                return (
                                  <SelectItem key={role.value} value={role.value}>
                                    <div className="flex items-center space-x-2">
                                      <Icon className="h-4 w-4" />
                                      <div>
                                        <div className="font-medium">{role.label}</div>
                                        <div className="text-xs text-slate-500">{role.description}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>Send Verification Code</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    Enter your email to receive a verification code.
                  </p>
                </div>

                <Form {...signinForm}>
                  <form onSubmit={signinForm.handleSubmit(onSigninSubmit)} className="space-y-4">
                    <FormField
                      control={signinForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your.email@company.com" 
                              {...field} 
                              className="h-12 bg-white/80 border-slate-200 focus:border-blue-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending Code...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>Send Verification Code</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            {/* Message Display */}
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="border-l-4">
                {message.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                <AlertDescription className="font-medium">
                  {message.text}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-slate-500">
            Secure authentication powered by enterprise-grade encryption
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <Lock className="h-3 w-3" />
              <span>256-bit SSL</span>
            </span>
            <span>•</span>
            <span>SOC 2 Compliant</span>
            <span>•</span>
            <span>GDPR Ready</span>
          </div>
        </div>

        {/* Email Domain Validation Helper */}
        <div className="text-center mt-4">
          <p className="text-xs text-slate-400">
            Business roles require company email addresses (not Gmail, Yahoo, etc.)
          </p>
        </div>
      </div>
    </div>
  )
}