import { useEffect, useState } from "react"
import { useLocation } from "wouter"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import vadisLogoLight from "@assets/Vadis FINAL LOGO large size Without Background.png"

export default function AuthCallback() {
  const [, setLocation] = useLocation()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) throw error

        if (data.session) {
          // Get signup data from localStorage if it exists
          const signupData = localStorage.getItem('vadis_signup_data')
          
          if (signupData) {
            const userData = JSON.parse(signupData)
            // Store user data in user metadata or database
            // For now, redirect to role selection
            localStorage.removeItem('vadis_signup_data')
            setStatus('success')
            setMessage('Account created successfully! Redirecting...')
            setTimeout(() => setLocation('/role-selection'), 2000)
          } else {
            // Existing user signing in
            setStatus('success')
            setMessage('Signed in successfully! Redirecting...')
            setTimeout(() => setLocation('/'), 2000)
          }
        } else {
          throw new Error('No session found')
        }
      } catch (error: any) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(error.message || 'Authentication failed')
        setTimeout(() => setLocation('/login'), 3000)
      }
    }

    handleAuthCallback()
  }, [setLocation])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={vadisLogoLight} 
              alt="VadisAI" 
              className="h-16 w-auto drop-shadow-xl"
            />
          </div>
        </div>

        <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
              {status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
              <span>
                {status === 'loading' && 'Authenticating...'}
                {status === 'success' && 'Welcome to VadisAI!'}
                {status === 'error' && 'Authentication Failed'}
              </span>
            </CardTitle>
            <CardDescription>
              {status === 'loading' && 'Verifying your magic link...'}
              {status === 'success' && 'Your account has been verified.'}
              {status === 'error' && 'There was an issue with your authentication.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert variant={status === 'error' ? 'destructive' : 'default'}>
              <AlertDescription className="text-center">
                {message}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}