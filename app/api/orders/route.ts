import { NextResponse } from "next/server"
import { writeFile, mkdir, readFile, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export const dynamic = "force-dynamic"

interface OrderItem {
  id: number | string
  name: string
  category: string
  price: string
  quantity: number
  image?: string
}

interface OrderData {
  firstName: string
  lastName: string
  email: string
  phone: string
  streetAddress: string
  city: string
  state: string
  zipCode: string
  country: string
  orderNotes: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  orderDate: string
}

// Fonction pour enregistrer dans un fichier CSV
async function saveToCSV(orderData: OrderData) {
  try {
    const dataDir = join(process.cwd(), "data", "orders")
    
    // Créer le dossier s'il n'existe pas
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true })
    }

    // Créer le nom de fichier avec timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const csvFile = join(dataDir, `order-${timestamp}.csv`)

    // Préparer les données CSV
    const csvHeader = [
      "Date de commande",
      "Prénom",
      "Nom",
      "Email",
      "Téléphone",
      "Adresse",
      "Ville",
      "Région",
      "Code postal",
      "Pays",
      "Notes",
      "Articles",
      "Sous-total",
      "TVA",
      "Total",
    ].join(",")

    const itemsString = orderData.items
      .map((item) => `${item.name} (x${item.quantity})`)
      .join("; ")

    const csvRow = [
      orderData.orderDate,
      orderData.firstName,
      orderData.lastName,
      orderData.email,
      orderData.phone,
      orderData.streetAddress,
      orderData.city,
      orderData.state,
      orderData.zipCode,
      orderData.country,
      `"${orderData.orderNotes.replace(/"/g, '""')}"`,
      `"${itemsString.replace(/"/g, '""')}"`,
      orderData.subtotal.toFixed(2),
      orderData.tax.toFixed(2),
      orderData.total.toFixed(2),
    ].join(",")

    const csvContent = `${csvHeader}\n${csvRow}`

    await writeFile(csvFile, csvContent, "utf-8")

    return csvFile
  } catch (error) {
    throw error
  }
}

// Fonction pour enregistrer dans un fichier JSON (pour historique complet)
async function saveToJSON(orderData: OrderData) {
  try {
    const dataDir = join(process.cwd(), "data", "orders")
    
    // Créer le dossier s'il n'existe pas
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true })
    }

    // Fichier JSON pour toutes les commandes
    const jsonFile = join(dataDir, "orders.json")

    let orders: OrderData[] = []
    
    // Lire les commandes existantes si le fichier existe
    if (existsSync(jsonFile)) {
      try {
        const { readFile } = await import("fs/promises")
        const content = await readFile(jsonFile, "utf-8")
        orders = JSON.parse(content)
      } catch (error) {
      }
    }

    // Ajouter la nouvelle commande
    orders.push(orderData)

    // Sauvegarder toutes les commandes
    await writeFile(jsonFile, JSON.stringify(orders, null, 2), "utf-8")

    return jsonFile
  } catch (error) {
    throw error
  }
}

// Fonction pour enregistrer dans Google Sheets (optionnel)
async function saveToGoogleSheets(orderData: OrderData) {
  // Cette fonction nécessite la configuration Google Sheets API
  // Pour l'activer, vous devez:
  // 1. Installer: npm install googleapis
  // 2. Configurer les credentials Google dans .env
  // 3. Décommenter et configurer cette fonction

  /*
  const { google } = require('googleapis')
  
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID

  const values = [[
    orderData.orderDate,
    orderData.firstName,
    orderData.lastName,
    orderData.email,
    orderData.phone,
    orderData.streetAddress,
    orderData.city,
    orderData.state,
    orderData.zipCode,
    orderData.country,
    orderData.orderNotes,
    JSON.stringify(orderData.items),
    orderData.subtotal.toFixed(2),
    orderData.tax.toFixed(2),
    orderData.total.toFixed(2),
  ]]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Commandes!A:O',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  })
  */

  return null
}

// Fonction pour lire toutes les commandes depuis le fichier JSON
async function readOrders(): Promise<OrderData[]> {
  try {
    const dataDir = join(process.cwd(), "data", "orders")
    const jsonFile = join(dataDir, "orders.json")

    if (!existsSync(jsonFile)) {
      return []
    }

    const content = await readFile(jsonFile, "utf-8")
    return JSON.parse(content) as OrderData[]
  } catch (error) {
    return []
  }
}

// Fonction pour supprimer une commande
async function deleteOrder(orderId: string): Promise<boolean> {
  try {
    const orders = await readOrders()
    const filteredOrders = orders.filter((order) => order.orderDate !== orderId)

    const dataDir = join(process.cwd(), "data", "orders")
    const jsonFile = join(dataDir, "orders.json")

    await writeFile(jsonFile, JSON.stringify(filteredOrders, null, 2), "utf-8")
    return true
  } catch (error) {
    return false
  }
}

// GET: Récupérer les commandes (pour admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const orderId = searchParams.get("orderId")

    if (action === "stats") {
      const orders = await readOrders()
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
      const recentOrders = orders.filter((order) => {
        const orderDate = new Date(order.orderDate)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return orderDate >= yesterday
      }).length

      return NextResponse.json({
        totalOrders,
        totalRevenue,
        recentOrders,
      })
    }

    if (action === "list") {
      const orders = await readOrders()
      return NextResponse.json({ orders })
    }

    if (action === "get" && orderId) {
      const orders = await readOrders()
      const order = orders.find((o) => o.orderDate === orderId)
      if (!order) {
        return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 })
      }
      return NextResponse.json({ order })
    }

    return NextResponse.json({ error: "Action non valide" }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    )
  }
}

// DELETE: Supprimer une commande (pour admin)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 })
    }

    const success = await deleteOrder(orderId)
    if (!success) {
      return NextResponse.json(
        { error: "Erreur lors de la suppression" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: "Commande supprimée avec succès" })
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la commande" },
      { status: 500 }
    )
  }
}

// POST: Créer une nouvelle commande
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      state,
      zipCode,
      country,
      orderNotes,
      items,
      subtotal,
      tax,
      total,
    } = body

    // Validation
    if (!firstName || !lastName || !email || !phone || !streetAddress || !city) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Le panier est vide" },
        { status: 400 }
      )
    }

    const orderData: OrderData = {
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      state: state || "",
      zipCode: zipCode || "",
      country: country || "Maroc",
      orderNotes: orderNotes || "",
      items,
      subtotal: parseFloat(subtotal) || 0,
      tax: parseFloat(tax) || 0,
      total: parseFloat(total) || 0,
      orderDate: new Date().toISOString(),
    }

    // Enregistrer dans les fichiers
    const csvFile = await saveToCSV(orderData)
    const jsonFile = await saveToJSON(orderData)

    // Optionnel: Enregistrer dans Google Sheets si configuré
    // await saveToGoogleSheets(orderData)

    return NextResponse.json({
      success: true,
      message: "Commande enregistrée avec succès",
      orderId: orderData.orderDate,
      files: {
        csv: csvFile,
        json: jsonFile,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de la commande" },
      { status: 500 }
    )
  }
}

