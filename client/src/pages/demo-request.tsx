import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { z } from "zod";
import { SiNetflix, SiApple, SiAmazon, SiSony, SiMercedes } from 'react-icons/si';
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png";

// Simple form schema with only essential fields
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  companyName: z.string().min(1, "Company name is required"),
  companyType: z.string().min(1, "Company type is required"),
  jobTitle: z.string().optional(),
  phoneNumber: z.string().optional(),
  useCase: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function DemoRequest() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      companyName: "",
      companyType: "",
      jobTitle: "",
      phoneNumber: "",
      useCase: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit demo request");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitted(true);
      if (data.meetingLink) {
        setMeetingLink(data.meetingLink);
      }
      toast({
        title: "Demo request submitted!",
        description: data.hubspotSynced 
          ? "Confirmation email sent! We'll be in touch within 24 hours."
          : "We'll be in touch within 24 hours to schedule your demo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank you!</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your demo request has been submitted successfully. {meetingLink ? "A confirmation email has been sent to you." : "Our team will contact you within 24 hours to schedule your personalized demo."}
            </p>
            
            {meetingLink && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Schedule Your Demo</h3>
                <p className="text-blue-700 text-sm mb-3">Use the link below to schedule your demo at a time that works for you:</p>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <a href={meetingLink} target="_blank" rel="noopener noreferrer">
                    Schedule Demo Meeting
                  </a>
                </Button>
              </div>
            )}
            
            <div className="space-y-4">
              <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Link href="/">Return to Homepage</Link>
              </Button>
              <p className="text-sm text-gray-500">
                Need immediate assistance? Contact us at{" "}
                <a href="mailto:sales@vadis.ai" className="text-blue-600 hover:underline font-medium">
                  sales@vadis.ai
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            
            {/* Back Button */}
            <div className="flex items-center relative z-10">
              <Link href="/" className="flex items-center text-white/90 hover:bg-gradient-to-r hover:from-blue-400 hover:via-purple-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent font-bold text-lg transition-all duration-300 font-sans">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Homepage
              </Link>
            </div>
          </div>
        </nav>
      </header>
      <main className="pt-28">
        {/* Floating Orbs */}
        <div className="floating-orb w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-600/20 top-20 -left-48"></div>
        <div className="floating-orb w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-600/20 top-40 -right-40"></div>
        <div className="floating-orb w-72 h-72 bg-gradient-to-r from-pink-500/20 to-blue-500/20 bottom-32 left-1/4"></div>

        <section className="relative overflow-hidden min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - Value Proposition */}
              <div className="lg:pr-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight glow-text">
                  Accelerate your business with <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">VadisAI</span>
                </h1>
                
                <p className="text-xl text-white/80 mb-8 leading-relaxed">Submit your request to see how VadisAI can help you improve your business with our vertically-integrated AI-driven platform</p>

                <div className="mb-8">
                  <p className="text-lg font-semibold text-white mb-4">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent glow-text">250,000+</span> content creators use VadisAI to:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center text-white/80">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      Accelerate content production
                    </li>
                    <li className="flex items-center text-white/80">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      Increase brand partnership ROI
                    </li>
                    <li className="flex items-center text-white/80">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      Scale creative workflows
                    </li>
                    <li className="flex items-center text-white/80">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      Measure performance with AI insights
                    </li>
                    <li className="flex items-center text-white/80">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      Boost efficiency with AI-powered tools
                    </li>
                  </ul>
                </div>

                {/* Trust Indicators */}
                <div>
                  <p className="text-sm text-white/60 mb-4">The world's leading brands trust VadisAI as their growth partner</p>
                  <div className="flex items-center space-x-8 opacity-60">
                    <SiNetflix className="w-8 h-8 text-white/40 hover:text-red-400 transition-colors" />
                    <SiApple className="w-8 h-8 text-white/40 hover:text-white/80 transition-colors" />
                    <SiAmazon className="w-8 h-8 text-white/40 hover:text-orange-400 transition-colors" />
                    <SiSony className="w-8 h-8 text-white/40 hover:text-blue-400 transition-colors" />
                    <SiMercedes className="w-8 h-8 text-white/40 hover:text-white/70 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="lg:pl-8">
                <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-2xl font-bold text-white glow-text">Request a demo</CardTitle>
                    </div>
                  </CardHeader>
              <CardContent className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="First name*" 
                                className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Last name*" 
                                className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Work email*" 
                              className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Phone number" 
                                className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Company name*" 
                                className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="companyType"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12">
                                <SelectValue placeholder="Company type*" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="production_company">Production Company</SelectItem>
                              <SelectItem value="vfx_studio">VFX Studio</SelectItem>
                              <SelectItem value="animation_studio">Animation Studio</SelectItem>
                              <SelectItem value="post_production">Post-Production House</SelectItem>
                              <SelectItem value="brand_agency">Brand/Agency</SelectItem>
                              <SelectItem value="advertising_agency">Advertising Agency</SelectItem>
                              <SelectItem value="marketing_agency">Marketing Agency</SelectItem>
                              <SelectItem value="influencer">Influencer</SelectItem>
                              <SelectItem value="content_creator">Content Creator</SelectItem>
                              <SelectItem value="streaming_platform">Streaming Platform</SelectItem>
                              <SelectItem value="broadcaster">TV/Radio Broadcaster</SelectItem>
                              <SelectItem value="financier">Financier/Investor</SelectItem>
                              <SelectItem value="distribution">Distribution Company</SelectItem>
                              <SelectItem value="talent_agency">Talent Agency</SelectItem>
                              <SelectItem value="music_label">Music Label</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="What's your role at the company?" 
                              className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="useCase"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              placeholder="How can our team help?"
                              className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit"
                      disabled={submitMutation.isPending}
                      className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 h-12"
                    >
                      {submitMutation.isPending ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        "Book a call"
                      )}
                    </Button>

                    <p className="text-center text-xs text-white/60 leading-relaxed">
                      By clicking "Book a call", you agree to Vadis's <a href="#" className="text-blue-400 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>. We'll contact you within 24 hours.
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  </main>
    </div>
  );
}