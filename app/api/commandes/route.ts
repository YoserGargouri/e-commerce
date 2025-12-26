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

function buildOrderNumber() {
  // Exemple: CMD-20251226-123456-4821
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const hh = String(now.getHours()).padStart(2, "0")
  const mi = String(now.getMinutes()).padStart(2, "0")
  const ss = String(now.getSeconds()).padStart(2, "0")
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `CMD-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${rand}`
}

function parsePrice(value: unknown) {
  if (typeof value !== "string") return 0
  const cleaned = value.replace(/\s*DTN\s*/gi, "").replace(",", ".")
  const n = Number.parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

type IncomingCartItem = {
  id?: string
  name?: string
  category?: string
  price?: string
  quantity?: number
  image?: string
}

type IncomingOrder = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  streetAddress?: string
  city?: string
  zipCode?: string
  country?: string
  items?: IncomingCartItem[]
  subtotal?: number
  total?: number
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const body = (await request.json()) as IncomingOrder

    const firstName = (body.firstName ?? "").trim()
    const lastName = (body.lastName ?? "").trim()
    const email = (body.email ?? "").trim()
    const phone = (body.phone ?? "").trim()
    const address = (body.streetAddress ?? "").trim()

    if (!firstName || !lastName || !email || !phone || !address) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires." },
        { status: 400 }
      )
    }

    const items = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) {
      return NextResponse.json({ error: "Votre panier est vide." }, { status: 400 })
    }

    const numero_commande = buildOrderNumber()

    const sous_total = typeof body.subtotal === "number" && Number.isFinite(body.subtotal) ? body.subtotal : 0
    const total_commande = typeof body.total === "number" && Number.isFinite(body.total) ? body.total : sous_total

    const formattedItems = items.map((it) => {
      const quantity = typeof it.quantity === "number" && it.quantity > 0 ? it.quantity : 1
      return {
        id: it.id ?? null,
        name: it.name ?? null,
        category: it.category ?? null,
        price: it.price ?? null,
        price_number: parsePrice(it.price),
        quantity,
        image: it.image ?? null,
      }
    })

    const payload = {
      numero_commande,
      client_name: `${firstName} ${lastName}`.trim(),
      client_email: email,
      client_phone: phone,
      client_address: address,
      client_city: (body.city ?? "").trim() || null,
      client_zipcode: (body.zipCode ?? "").trim() || null,
      client_country: (body.country ?? "").trim() || null,
      sous_total,
      frais_livraison: 0,
      total_commande,
      items: formattedItems,
      // statut_commande / statut_paiement: defaults en base
    }

    const { data, error } = await supabaseAdmin
      .from("commandes")
      .insert([payload])
      .select("id, numero_commande")
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Échec de l'enregistrement de la commande : ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, id: data.id, numero_commande: data.numero_commande })
  } catch (e) {
    console.error("Erreur POST /api/commandes:", e)
    return NextResponse.json(
      { error: "Erreur interne lors de l'enregistrement de la commande." },
      { status: 500 }
    )
  }
}
