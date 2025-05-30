import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { CheckCircle, Film, Users, TrendingUp, Award } from "lucide-react";
import { SiNetflix, SiSony } from "react-icons/si";
import { Building2, Camera, Clapperboard, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().optional(),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  jobTitle: z.string().optional(),
  useCase: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const industryPartners = [
  { name: "Netflix", icon: SiNetflix, color: "text-red-600", category: "Streaming Platform" },
  { name: "Sony Pictures", icon: SiSony, color: "text-black", category: "Global Studio" },
  { name: "Warner Bros", icon: Building2, color: "text-blue-800", category: "Major Studio" },
  { name: "Universal", icon: Camera, color: "text-purple-600", category: "Production House" },
  { name: "Paramount", icon: Clapperboard, color: "text-blue-700", category: "Legendary Studio" },
  { name: "Lionsgate", icon: Video, color: "text-orange-600", category: "Independent Studio" },
  { name: "Disney", icon: Building2, color: "text-blue-600", category: "Entertainment Giant" },
  { name: "A24", icon: Film, color: "text-green-600", category: "Boutique Studio" },
];

export default function DemoProduction() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      companyName: "",
      jobTitle: "",
      useCase: "",
    },
  });

  const mutation = useMutation({
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
    mutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
          <CardContent className="p-12 text-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Film className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Production Company Demo
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Discover how VadisAI revolutionizes content creation, streamlines collaboration, and connects you with the right talent and funding partners.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Form Section */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">Request Your Demo</CardTitle>
              <p className="text-gray-600">
                See how leading production companies are scaling their operations with AI-powered insights.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
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
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
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
                        <FormLabel>Work Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@productioncompany.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
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
                        <FormLabel>Production Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Production Company" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Producer, Director, Executive" {...field} />
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
                        <FormLabel>Project Details (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your current project or production needs..."
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Submitting..." : "Request Demo"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Production Companies Choose VadisAI</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Talent Matching</h3>
                    <p className="text-gray-600">Find the perfect cast, crew, and creative partners for your projects using our intelligent matching algorithms.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Predictive Analytics</h3>
                    <p className="text-gray-600">Leverage data-driven insights to predict market trends, audience preferences, and project success rates.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Funding Connections</h3>
                    <p className="text-gray-600">Connect directly with investors and financing partners who align with your creative vision and budget requirements.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trusted Partners */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Trusted by Industry Leaders</h3>
              <div className="grid grid-cols-2 gap-4">
                {industryPartners.map((company, index) => {
                  const IconComponent = company.icon;
                  return (
                    <div 
                      key={index} 
                      className="group relative bg-white/80 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-gray-100"
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <IconComponent className={`w-8 h-8 ${company.color} group-hover:scale-110 transition-transform duration-300`} />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">{company.name}</h4>
                        <p className="text-xs text-gray-600">{company.category}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}