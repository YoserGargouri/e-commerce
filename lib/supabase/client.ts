// src/lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js"

// Client Supabase côté navigateur
// Utilise les variables d'environnement NEXT_PUBLIC_
export const supabase = (() => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    if (typeof window !== "undefined") {
      // En environnement navigateur, on log juste un warning pour ne pas casser le rendu
      console.warn(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars"
      )
    }
    // On crée tout de même un client "vide" pour éviter les crashes,
    // mais les appels échoueront côté réseau.
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  )
})()


