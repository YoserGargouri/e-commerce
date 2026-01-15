"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Loader2 } from "lucide-react"

import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function AdminForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail) {
      toast({
        title: "Champs requis",
        description: "Veuillez saisir votre email.",
        variant: "destructive",
      })
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      toast({
        title: "Email invalide",
        description: "Veuillez saisir une adresse email valide.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      const json = (await res.json().catch(() => null)) as { exists?: boolean; error?: string } | null

      if (!res.ok) {
        toast({
          title: "Erreur",
          description: json?.error || "Impossible de vérifier l'email.",
          variant: "destructive",
        })
        return
      }

      const exists = Boolean(json?.exists)

      if (!exists) {
        toast({
          title: "Email introuvable",
          description: "Aucun compte n'est associé à cet email. Veuillez vous inscrire.",
          variant: "destructive",
        })
        router.push(`/X/admin/login?email=${encodeURIComponent(trimmedEmail)}`)
        return
      }

      const redirectTo = `${window.location.origin}/X/admin/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      })

      if (error) {
        toast({
          title: "Échec",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Email envoyé",
        description: "Un lien de réinitialisation a été envoyé à votre email.",
      })

      router.push(`/X/admin/login?email=${encodeURIComponent(trimmedEmail)}`)
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#c3aa8c] hover:bg-[#b39977] rounded-2xl shadow-lg mb-3 sm:mb-4 transition-colors">
            <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié</h1>
          <p className="text-sm sm:text-base text-gray-600">Recevoir un lien de réinitialisation</p>
        </div>

        <Card className="shadow-xl border border-gray-200 bg-white">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center text-gray-900">Réinitialisation</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base text-gray-600">
              Saisissez votre email. Si le compte existe, nous vous envoyons un lien.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full h-11 bg-[#c3aa8c] hover:bg-[#b39977]" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le lien"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                <Link href="/X/admin/login" className="hover:text-gray-900 underline underline-offset-4">
                  Retour à la connexion
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
