"use client"
import { Button } from "@/components/ui/button"
import { useAdminMode } from "@/hooks/useAdminMode"
import { Shield, User } from "lucide-react"

export function ModeToggle() {
  const { isAdmin, toggleMode } = useAdminMode()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleMode}
      className="flex items-center gap-2"
      title={isAdmin ? "Passer en mode utilisateur" : "Passer en mode admin"}
    >
      {isAdmin ? (
        <>
          <Shield className="w-4 h-4 text-red-600" />
          <span className="hidden sm:inline">Admin</span>
        </>
      ) : (
        <>
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">User</span>
        </>
      )}
    </Button>
  )
}

