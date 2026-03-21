"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Lock, User, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const router = useRouter()
  const { isAuthenticated, login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/X/admin")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const emailFromQuery = params.get("email")
    if (emailFromQuery && !email) {
      setEmail(emailFromQuery)
    }
  }, [email])

  const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmedEmail = email.trim()

    // Validation basique
    if (!trimmedEmail || !password.trim()) {
      const msg = "Veuillez remplir tous les champs"
      setError(msg)
      toast({ title: "Champs requis", description: msg, variant: "destructive" })
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      const msg = "Veuillez saisir une adresse email valide"
      setError(msg)
      toast({ title: "Email invalide", description: msg, variant: "destructive" })
      return
    }

    if (password.length < 6) {
      const msg = "Le mot de passe doit contenir au moins 6 caractères"
      setError(msg)
      toast({ title: "Mot de passe invalide", description: msg, variant: "destructive" })
      return
    }

    setIsLoading(true)

    // Simuler un délai pour une meilleure UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = await login(trimmedEmail, password)

    if (result.success) {
      setAttempts(0)
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans le panneau d'administration.",
      })
      router.push("/X/admin")
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      if (newAttempts >= 3) {
        setError("Trop de tentatives échouées. Veuillez réessayer plus tard.")
      } else {
        setError(result.error || `Email ou mot de passe incorrect. Tentative ${newAttempts}/3`)
      }

      toast({
        title: "Connexion échouée",
        description: result.error || "Email ou mot de passe incorrect.",
        variant: "destructive",
      })
      
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: "email" | "password", value: string) => {
    setError("") // Clear error when user starts typing
    if (field === "email") {
      setEmail(value)
    } else {
      setPassword(value)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#c3aa8c] hover:bg-[#b39977] rounded-2xl shadow-lg mb-3 sm:mb-4 transition-colors">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Administration</h1>
          <p className="text-sm sm:text-base text-gray-600">Panneau de contrôle</p>
        </div>

        <Card className="shadow-xl border border-gray-200 bg-white">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center text-gray-900">Connexion</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base text-gray-600">
              Entrez vos identifiants pour accéder au panneau d'administration
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-11 h-11 border-gray-300 focus:border-[#c3aa8c] focus:ring-[#c3aa8c]"
                    required
                    autoFocus
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-11 pr-11 h-11 border-gray-300 focus:border-[#c3aa8c] focus:ring-[#c3aa8c]"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#8B7355] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-[#c3aa8c] hover:bg-[#b39977] text-white font-medium shadow-md transition-colors"
                disabled={isLoading || attempts >= 3}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Se connecter
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/X/admin/forgot-password"
                  className="text-sm text-gray-600 hover:text-[#8B7355] transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <div className="text-center text-sm text-gray-600">
                <span>Pas de compte ? </span>
                <Link href="/X/admin/signup" className="hover:text-[#8B7355] underline underline-offset-4">
                  Créer un compte
                </Link>
              </div>

              {/* Help Text */}
              {/* Back to Site Link */}
              <div className="text-center pt-2">
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-[#8B7355] transition-colors"
                >
                  ← Retour au site
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>© 2024 Administration - Tous droits réservés</p>
        </div>
      </div>
    </div>
  )
}

