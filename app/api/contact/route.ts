import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const ContactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(2).max(160),
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

async function getAdminEmailFromSettings() {
  const fallback = process.env.CONTACT_ADMIN_EMAIL

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("email")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const fromDb = data && typeof (data as any).email === "string" ? String((data as any).email).trim() : ""
    if (fromDb) return fromDb
  } catch {
    // ignore
  }

  return typeof fallback === "string" && fallback.trim() ? fallback.trim() : null
}

async function resendSendEmail(params: {
  to: string
  subject: string
  html: string
  replyTo?: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL

  if (!apiKey) {
    throw new Error("RESEND_API_KEY manquant.")
  }
  if (!from) {
    throw new Error("RESEND_FROM_EMAIL manquant (ex: no-reply@ton-domaine.com).")
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { reply_to: params.replyTo } : {}),
    }),
  })

  const json = (await res.json().catch(() => null)) as any

  if (!res.ok) {
    const message = json?.message || json?.error || `Erreur Resend (HTTP ${res.status}).`
    throw new Error(String(message))
  }

  return json
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateKey = `contact:${ip}`
    const rate = checkRateLimit(rateKey)

    if (!rate.ok) {
      return NextResponse.json(
        { error: "Trop de demandes. Réessaie plus tard." },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = ContactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, subject, message } = parsed.data

    const adminEmail = await getAdminEmailFromSettings()
    if (!adminEmail) {
      return NextResponse.json(
        { error: "Email admin non configuré. Renseigne-le dans Site Settings (email) ou CONTACT_ADMIN_EMAIL." },
        { status: 500 }
      )
    }

    const safeMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const safeSubject = subject.replace(/</g, "&lt;").replace(/>/g, "&gt;")

    const adminHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Nouveau message depuis le formulaire de contact</h2>
        <p><strong>Nom:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sujet:</strong> ${safeSubject}</p>
        <hr />
        <p style="white-space:pre-wrap">${safeMessage}</p>
      </div>
    `.trim()

    await resendSendEmail({
      to: adminEmail,
      subject: `[Contact] ${subject}`,
      html: adminHtml,
      replyTo: email,
    })

    const clientHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <p>Bonjour ${safeName},</p>
        <p>Nous avons bien reçu votre message. Nous vous répondrons dès que possible.</p>
        <p><strong>Rappel de votre sujet:</strong> ${safeSubject}</p>
        <hr />
        <p style="white-space:pre-wrap">${safeMessage}</p>
        <hr />
        <p>Merci.</p>
      </div>
    `.trim()

    await resendSendEmail({
      to: email,
      subject: "Confirmation: nous avons reçu votre message",
      html: clientHtml,
      replyTo: adminEmail,
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur lors de l'envoi du message." },
      { status: 500 }
    )
  }
}
