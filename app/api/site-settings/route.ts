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

    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: `Échec du chargement des paramètres du site : ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: data ?? null })
  } catch (e) {
    console.error("Erreur GET /api/site-settings:", e)
    return NextResponse.json(
      { error: "Erreur interne lors du chargement des paramètres du site." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const payload = (await request.json()) as Record<string, unknown>

    const id = typeof payload.id === "string" ? payload.id : undefined

    if (typeof payload.site_name !== "string" || !payload.site_name.trim()) {
      return NextResponse.json(
        { error: "Veuillez saisir le nom du site." },
        { status: 400 }
      )
    }

    if (id) {
      const { data, error } = await supabaseAdmin
        .from("site_settings")
        .update({ ...payload, id: undefined })
        .eq("id", id)
        .select("*")
        .maybeSingle()

      if (error) {
        return NextResponse.json(
          { error: `Échec de la mise à jour des paramètres du site : ${error.message}` },
          { status: 400 }
        )
      }

      if (data) {
        return NextResponse.json({ data })
      }
    }

    const { data: created, error: createError } = await supabaseAdmin
      .from("site_settings")
      .insert([
        {
          ...payload,
          id: undefined,
        },
      ])
      .select("*")
      .single()

    if (createError) {
      return NextResponse.json(
        { error: `Échec de la création des paramètres du site : ${createError.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: created })
  } catch (e) {
    console.error("Erreur POST /api/site-settings:", e)
    return NextResponse.json(
      { error: "Erreur interne lors de l'enregistrement des paramètres du site." },
      { status: 500 }
    )
  }
}
