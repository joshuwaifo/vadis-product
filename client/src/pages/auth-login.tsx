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
import { Mail, Smartphone, ArrowRight, Sparkles, Lock, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png"

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
})

const phoneSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number")
})

type EmailFormData = z.infer<typeof emailSchema>
type PhoneFormData = z.infer<typeof phoneSchema>

export default function AuthLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState('magic-link')

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" }
  })

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" }
  })

  const onMagicLinkSubmit = async (data: EmailFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/role-selection`
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
        text: error.message || 'Failed to send magic link. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onOTPSubmit = async (data: PhoneFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: data.phone
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: `Verification code sent to ${data.phone}. Please enter the code to sign in.`
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send verification code. Please try again.'
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
                <TabsTrigger value="magic-link" className="flex items-center space-x-2 data-[state=active]:bg-white">
                  <Mail className="h-4 w-4" />
                  <span>Magic Link</span>
                </TabsTrigger>
                <TabsTrigger value="otp" className="flex items-center space-x-2 data-[state=active]:bg-white">
                  <Smartphone className="h-4 w-4" />
                  <span>SMS Code</span>
                </TabsTrigger>
              </TabsList>

              {/* Magic Link Tab */}
              <TabsContent value="magic-link" className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    We'll send a secure link to your email. No password required.
                  </p>
                </div>

                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onMagicLinkSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
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
                          <span>Sending Magic Link...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>Send Magic Link</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* OTP Tab */}
              <TabsContent value="otp" className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    We'll send a verification code to your phone number.
                  </p>
                </div>

                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(onOTPSubmit)} className="space-y-4">
                    <FormField
                      control={phoneForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+1 (555) 123-4567" 
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
                          <Smartphone className="h-4 w-4" />
                          <span>Send SMS Code</span>
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
      </div>
    </div>
  )
}