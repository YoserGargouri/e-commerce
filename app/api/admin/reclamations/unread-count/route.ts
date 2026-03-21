import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Configuration manquante. Définis NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans les variables d'environnement."
    )
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { count, error } = await supabaseAdmin
      .from("reclamations")
      .select("id", { count: "exact" })
      .or("is_read.is.null,is_read.eq.false")

    if (error) {
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch (e) {
    return NextResponse.json(
      { error: "Erreur interne lors du chargement des réclamations non lues." },
      { status: 500 }
    )
  }
}
