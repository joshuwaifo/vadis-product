import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Building2, Megaphone, DollarSign, User } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { apiRequest } from "@/lib/queryClient"
import type { UserRole } from "@shared/schema"

const roleOptions = [
  {
    value: "production" as UserRole,
    icon: Building2,
    title: "Production Company",
    description: "Manage film/TV projects, talent matching, and location scouting",
    features: ["Project Management", "Talent Database", "Location Tools", "Brand Partnerships"]
  },
  {
    value: "brand" as UserRole,
    icon: Megaphone,
    title: "Brand/Agency",
    description: "Connect with production companies and manage marketing campaigns",
    features: ["Campaign Dashboard", "Production Marketplace", "Analytics", "ROI Tracking"]
  },
  {
    value: "financier" as UserRole,
    icon: DollarSign,
    title: "Financier",
    description: "Investment opportunities and portfolio management for entertainment",
    features: ["Investment Pipeline", "ROI Analytics", "Risk Assessment", "Portfolio Tools"]
  },
  {
    value: "creator" as UserRole,
    icon: User,
    title: "Individual Creator",
    description: "Collaboration network and monetization opportunities",
    features: ["Creator Network", "Monetization Tools", "Content Analytics", "Brand Collaborations"]
  }
]

export default function RoleSelection() {
  const { user } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (role: UserRole) => {
      await apiRequest("POST", "/api/auth/select-role", { role })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] })
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setError(null)
  }

  const handleConfirm = () => {
    if (selectedRole) {
      mutation.mutate(selectedRole)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">VadisAI</h1>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">
              Welcome, {user?.firstName || user?.email}!
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose your role to personalize your VadisAI experience. This will determine which tools and features you have access to.
            </p>
          </div>
        </div>

        {/* Role Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roleOptions.map((role) => {
            const Icon = role.icon
            const isSelected = selectedRole === role.value
            
            return (
              <Card 
                key={role.value}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50/50' 
                    : 'hover:border-blue-300'
                }`}
                onClick={() => handleRoleSelect(role.value)}
              >
                <CardHeader className="text-center space-y-4">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                    isSelected 
                      ? 'bg-blue-600' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600'
                  }`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{role.title}</CardTitle>
                    <CardDescription className="mt-2">{role.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Key Features:</h4>
                    <ul className="space-y-1">
                      {role.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Confirm Button */}
        {selectedRole && (
          <div className="text-center space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleConfirm}
              disabled={mutation.isPending}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {mutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Setting Up Your Account...</span>
                </div>
              ) : (
                `Continue as ${roleOptions.find(r => r.value === selectedRole)?.title}`
              )}
            </Button>
            
            <p className="text-sm text-gray-500">
              You can change your role later in account settings
            </p>
          </div>
        )}
      </div>
    </div>
  )
}