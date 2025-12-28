import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { url?: unknown } | null
    const rawUrl = body?.url

    if (typeof rawUrl !== "string" || !rawUrl.trim()) {
      return NextResponse.json({ error: "URL manquante." }, { status: 400 })
    }

    let parsed: URL
    try {
      parsed = new URL(rawUrl.trim())
    } catch {
      return NextResponse.json({ error: "URL invalide." }, { status: 400 })
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ error: "Protocole URL non supporté." }, { status: 400 })
    }

    const res = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    })

    return NextResponse.json({ url: res.url })
  } catch (e) {
    return NextResponse.json({ error: "Erreur interne lors de la résolution du lien." }, { status: 500 })
  }
}
