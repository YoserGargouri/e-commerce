import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const ReclamationSchema = z.object({
  nom: z.string().trim().min(2).max(100),
  client_email: z.string().trim().email().max(255),
  sujet: z.string().trim().min(2).max(200),
  message: z.string().trim().min(5).max(5000),
})

type RateState = { count: number; resetAt: number }
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 5
const rateStore = new Map<string, RateState>()

function getClientIp(request: Request) {
  const xff = request.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  const realIp = request.headers.get("x-real-ip")
  return realIp?.trim() || "unknown"
}

function checkRateLimit(key: string) {
  const now = Date.now()
  const entry = rateStore.get(key)

  if (!entry || entry.resetAt <= now) {
    rateStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { ok: true, remaining: RATE_LIMIT_MAX - 1 }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  rateStore.set(key, entry)
  return { ok: true, remaining: RATE_LIMIT_MAX - entry.count }
}

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
    const ip = getClientIp(request)
    const rateKey = `reclamations:${ip}`
    const rate = checkRateLimit(rateKey)

    if (!rate.ok) {
      return NextResponse.json(
        { error: "Trop de demandes. Réessaie plus tard." },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = ReclamationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from("reclamations")
      .insert([
        {
          nom: parsed.data.nom,
          client_email: parsed.data.client_email,
          sujet: parsed.data.sujet,
          message: parsed.data.message,
        },
      ])
      .select("id")
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Échec de la création de la réclamation : ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (e) {
    return NextResponse.json(
      { error: "Erreur interne lors de la création de la réclamation." },
      { status: 500 }
    )
  }
}
