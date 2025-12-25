"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"

type Mode = "user" | "admin"

interface ModeContextType {
  mode: Mode
  isAdmin: boolean
  toggleMode: () => void
  setMode: (mode: Mode) => void
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

const ADMIN_MODE_KEY = "ecommerce_admin_mode"

interface ModeProviderProps {
  children: ReactNode
}

export function ModeProvider({ children }: ModeProviderProps) {
  const [storedMode, setStoredMode] = useLocalStorage<Mode>(ADMIN_MODE_KEY, "user")
  const [mode, setModeState] = useState<Mode>(storedMode)

  // Sync with localStorage
  useEffect(() => {
    setModeState(storedMode)
  }, [storedMode])

  const setMode = (newMode: Mode) => {
    setStoredMode(newMode)
    setModeState(newMode)
  }

  const toggleMode = () => {
    const newMode = mode === "user" ? "admin" : "user"
    setMode(newMode)
  }

  const value: ModeContextType = {
    mode,
    isAdmin: mode === "admin",
    toggleMode,
    setMode,
  }

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}

export function useMode() {
  const context = useContext(ModeContext)
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider")
  }
  return context
}

