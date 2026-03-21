"use client"
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getLoginErrorMessage = (message: string) => {
    const m = message.toLowerCase()
    if (m.includes("invalid") && m.includes("login") && m.includes("credentials")) {
      return "Aucun compte n'existe avec cet email, ou le mot de passe est incorrect."
    }
    return message
  }

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(data.session)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void init()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const login: AuthContextType["login"] = async (email, password) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: getLoginErrorMessage(error.message) }
      }

      return { success: true }
    } finally {
      setIsLoading(false)
    }
  }

  const logout: AuthContextType["logout"] = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = useMemo(
    () => ({
      isAuthenticated: Boolean(session?.user),
      isLoading,
      login,
      logout,
    }),
    [session?.user, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

