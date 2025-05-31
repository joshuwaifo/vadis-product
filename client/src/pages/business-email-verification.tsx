import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Building2, Mail, Shield, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { apiRequest } from "@/lib/queryClient"
import type { UserRole } from "@shared/schema"

const formSchema = z.object({
  businessEmail: z.string().email("Please enter a valid email address"),
  isIndividualFinancier: z.boolean().optional(),
  verifyDomain: z.boolean().refine((val) => val === true, {
    message: "Please confirm that you have access to this email domain"
  })
})

type FormData = z.infer<typeof formSchema>

const roleLabels = {
  production: "Production Company",
  brand: "Brand/Agency", 
  financier: "Financier",
  creator: "Individual Creator"
}

export default function BusinessEmailVerification() {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessEmail: user?.email || "",
      isIndividualFinancier: false,
      verifyDomain: false
    }
  })

  const isIndividualFinancier = form.watch("isIndividualFinancier")
  const userRole = user?.role as UserRole

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("POST", "/api/auth/verify-business-email", { 
        businessEmail: data.businessEmail,
        isIndividualFinancier: data.isIndividualFinancier 
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] })
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const onSubmit = (data: FormData) => {
    setError(null)
    mutation.mutate(data)
  }

  const requiresBusinessEmail = userRole && ['production', 'brand', 'financier'].includes(userRole)
  const currentDomain = form.watch("businessEmail")?.split("@")[1]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Business Email Verification</h1>
          </div>
          <p className="text-gray-600 max-w-lg mx-auto">
            As a {roleLabels[userRole as keyof typeof roleLabels]}, please provide your official business email address for verification purposes.
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <span>Email Verification</span>
            </CardTitle>
            <CardDescription>
              This helps us verify your business credentials and ensure secure communication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Individual Financier Option */}
                {userRole === 'financier' && (
                  <FormField
                    control={form.control}
                    name="isIndividualFinancier"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I am an individual financier (not representing a company)
                          </FormLabel>
                          <FormDescription>
                            Check this if you're investing as an individual rather than on behalf of a company or fund
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                {/* Business Email Field */}
                <FormField
                  control={form.control}
                  name="businessEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {isIndividualFinancier ? "Email Address" : "Official Business Email"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={isIndividualFinancier ? "your.email@example.com" : "your.name@company.com"} 
                          {...field} 
                          className="h-12"
                        />
                      </FormControl>
                      <FormDescription>
                        {isIndividualFinancier 
                          ? "You can use any email address you're comfortable with"
                          : "Please use your official company email address for verification"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Domain Verification */}
                {!isIndividualFinancier && currentDomain && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Domain: {currentDomain}</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      We'll send a verification email to confirm you have access to this business domain.
                    </p>
                  </div>
                )}

                {/* Domain Access Confirmation */}
                {!isIndividualFinancier && (
                  <FormField
                    control={form.control}
                    name="verifyDomain"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I confirm that I have access to this email domain and can receive verification emails
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {mutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Email...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Your email will be used for account verification and important business communications
          </p>
        </div>
      </div>
    </div>
  )
}