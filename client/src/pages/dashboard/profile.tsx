import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  Globe, 
  CreditCard, 
  Shield,
  Upload,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import DashboardLayout from "./dashboard-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});

const billingSchema = z.object({
  billingAddress: z.string().min(1, "Address is required"),
  billingCity: z.string().min(1, "City is required"),
  billingState: z.string().min(1, "State is required"),
  billingCountry: z.string().min(1, "Country is required"),
  billingZip: z.string().min(1, "ZIP code is required"),
});

interface ProductionProfile {
  id: number;
  userId: number;
  companyName: string;
  logoUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  description?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingZip?: string;
}

export default function ProfilePage() {
  const [showBilling, setShowBilling] = useState(false);
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery<ProductionProfile>({
    queryKey: ['/api/profile'],
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: profile?.companyName || "",
      city: profile?.city || "",
      state: profile?.state || "",
      country: profile?.country || "",
      website: profile?.website || "",
      description: profile?.description || "",
    },
  });

  const billingForm = useForm({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      billingAddress: profile?.billingAddress || "",
      billingCity: profile?.billingCity || "",
      billingState: profile?.billingState || "",
      billingCountry: profile?.billingCountry || "",
      billingZip: profile?.billingZip || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/profile", "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile updated",
        description: "Your company profile has been updated successfully.",
      });
    },
  });

  const updateBillingMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/profile/billing", "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Billing information updated",
        description: "Your billing information has been updated successfully.",
      });
    },
  });

  const onProfileSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const onBillingSubmit = (data: any) => {
    updateBillingMutation.mutate(data);
  };

  // Update form default values when profile data loads
  if (profile && !profileForm.formState.isDirty) {
    profileForm.reset({
      companyName: profile.companyName,
      city: profile.city || "",
      state: profile.state || "",
      country: profile.country || "",
      website: profile.website || "",
      description: profile.description || "",
    });

    billingForm.reset({
      billingAddress: profile.billingAddress || "",
      billingCity: profile.billingCity || "",
      billingState: profile.billingState || "",
      billingCountry: profile.billingCountry || "",
      billingZip: profile.billingZip || "",
    });
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Company Profile
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your production company information and billing details
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Company Information</TabsTrigger>
            <TabsTrigger value="billing">Billing & Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Public Company Information
                </CardTitle>
                <CardDescription>
                  This information will be visible to investors and collaborators in the marketplace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  {/* Company Logo */}
                  <div className="space-y-2">
                    <Label>Company Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        {profile?.logoUrl ? (
                          <img 
                            src={profile.logoUrl} 
                            alt="Company logo" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <Button type="button" variant="outline">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Logo
                        </Button>
                        <p className="text-sm text-gray-500 mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name*</Label>
                      <Input
                        id="companyName"
                        {...profileForm.register("companyName")}
                        placeholder="Your Production Company"
                      />
                      {profileForm.formState.errors.companyName && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.companyName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        {...profileForm.register("website")}
                        placeholder="https://yourcompany.com"
                      />
                      {profileForm.formState.errors.website && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.website.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...profileForm.register("city")}
                        placeholder="Los Angeles"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        {...profileForm.register("state")}
                        placeholder="California"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        {...profileForm.register("country")}
                        placeholder="United States"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      {...profileForm.register("description")}
                      placeholder="Tell investors about your production company, your vision, and your track record..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Private Billing Information
                  <Badge variant="secondary" className="ml-auto">
                    <Shield className="mr-1 h-3 w-3" />
                    Private
                  </Badge>
                </CardTitle>
                <CardDescription>
                  This information is private and used only for billing purposes. It will never be shared with investors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Toggle billing visibility */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">Billing Information</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBilling(!showBilling)}
                    >
                      {showBilling ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Show
                        </>
                      )}
                    </Button>
                  </div>

                  {showBilling && (
                    <form onSubmit={billingForm.handleSubmit(onBillingSubmit)} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="billingAddress">Billing Address*</Label>
                        <Input
                          id="billingAddress"
                          {...billingForm.register("billingAddress")}
                          placeholder="123 Main Street"
                        />
                        {billingForm.formState.errors.billingAddress && (
                          <p className="text-sm text-red-600">
                            {billingForm.formState.errors.billingAddress.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="billingCity">City*</Label>
                          <Input
                            id="billingCity"
                            {...billingForm.register("billingCity")}
                            placeholder="Los Angeles"
                          />
                          {billingForm.formState.errors.billingCity && (
                            <p className="text-sm text-red-600">
                              {billingForm.formState.errors.billingCity.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="billingState">State*</Label>
                          <Input
                            id="billingState"
                            {...billingForm.register("billingState")}
                            placeholder="CA"
                          />
                          {billingForm.formState.errors.billingState && (
                            <p className="text-sm text-red-600">
                              {billingForm.formState.errors.billingState.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="billingZip">ZIP Code*</Label>
                          <Input
                            id="billingZip"
                            {...billingForm.register("billingZip")}
                            placeholder="90210"
                          />
                          {billingForm.formState.errors.billingZip && (
                            <p className="text-sm text-red-600">
                              {billingForm.formState.errors.billingZip.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billingCountry">Country*</Label>
                        <Input
                          id="billingCountry"
                          {...billingForm.register("billingCountry")}
                          placeholder="United States"
                        />
                        {billingForm.formState.errors.billingCountry && (
                          <p className="text-sm text-red-600">
                            {billingForm.formState.errors.billingCountry.message}
                          </p>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Payment Methods</h3>
                        <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                          <CreditCard className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">No payment methods added yet</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Payment methods will be required when brand opportunities are available
                          </p>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={updateBillingMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {updateBillingMutation.isPending ? "Saving..." : "Save Billing Information"}
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}