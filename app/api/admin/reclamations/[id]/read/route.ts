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

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const rawId = params?.id
    const id = rawId ? Number(rawId) : NaN

    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "ID invalide." }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { error } = await supabaseAdmin
      .from("reclamations")
      .update({ is_read: true, date_modification: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      return NextResponse.json(
        { error: `Échec de la mise à jour de la réclamation : ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { error: "Erreur interne lors de la mise à jour de la réclamation." },
      { status: 500 }
    )
  }
}
