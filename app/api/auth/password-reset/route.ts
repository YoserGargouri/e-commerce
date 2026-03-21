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

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { email?: unknown } | null
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""

    if (!email) {
      return NextResponse.json({ error: "Email manquant" }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const exists = (data.users ?? []).some((u) => (u.email ?? "").toLowerCase() === email)
    return NextResponse.json({ exists })
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}
