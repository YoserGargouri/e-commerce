// src/lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js"

// Client Supabase côté navigateur
// Utilise les variables d'environnement NEXT_PUBLIC_
export const supabase = (() => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    // On crée tout de même un client "vide" pour éviter les crashes,
    // mais les appels échoueront côté réseau.
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  )
})()


