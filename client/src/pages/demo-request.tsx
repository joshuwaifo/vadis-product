import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { z } from "zod";
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png";

// Simple form schema with only essential fields
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().optional(),
  phoneNumber: z.string().optional(),
  useCase: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function DemoRequest() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      companyName: "",
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
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Demo request submitted!",
        description: "We'll be in touch within 24 hours to schedule your demo.",
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
              Your demo request has been submitted successfully. Our team will contact you within 24 hours to schedule your personalized demo.
            </p>
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
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Homepage
            </Link>
            <img 
              src={vadisLogoLight} 
              alt="VadisMedia" 
              className="h-12 w-auto"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-blue-600 font-medium text-sm">Request a Demo</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            See VadisAI in <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Action</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Get a personalized demo tailored to your specific needs and see how VadisAI can transform your creative projects.
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Let's get started</CardTitle>
            <CardDescription className="text-gray-600">
              Fill out the form below and our team will be in touch within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">First Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your first name" 
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
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
                        <FormLabel className="text-gray-700 font-medium">Last Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your last name" 
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Work Email *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="you@company.com" 
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                            {...field} 
                          />
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
                        <FormLabel className="text-gray-700 font-medium">Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+1 (555) 000-0000" 
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Company Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your company name" 
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                            {...field} 
                          />
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
                        <FormLabel className="text-gray-700 font-medium">Job Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your role" 
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
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
                  name="useCase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Tell us about your project</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Briefly describe how you plan to use VadisAI or what challenges you're looking to solve..."
                          className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-4">
                  <Button 
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    {submitMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      "Request Demo"
                    )}
                  </Button>
                  <p className="text-center text-sm text-gray-500 mt-4">
                    We'll contact you within 24 hours to schedule your personalized demo
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Trusted by industry leaders</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-gray-400 font-bold">NETFLIX</div>
            <div className="text-gray-400 font-bold">APPLE</div>
            <div className="text-gray-400 font-bold">AMAZON</div>
            <div className="text-gray-400 font-bold">SONY</div>
          </div>
        </div>
      </div>
    </div>
  );
}