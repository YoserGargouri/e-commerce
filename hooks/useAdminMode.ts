"use client"
import { useMode } from "@/context/ModeContext"

export function useAdminMode() {
  const { mode, isAdmin, toggleMode, setMode } = useMode()

  return {
    mode,
    isAdmin,
    toggleMode,
    setMode,
    enterAdminMode: () => setMode("admin"),
    exitAdminMode: () => setMode("user"),
  }
}

