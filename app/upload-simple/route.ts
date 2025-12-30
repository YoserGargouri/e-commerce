import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

function sanitizeExtension(ext: string) {
  return ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
}

function buildFileName(params: {
  originalName: string
  productId?: string
  type?: string
}) {
  const { originalName, productId, type } = params

  const extension = originalName.includes(".") ? originalName.split(".").pop() ?? "" : ""
  const safeExtension = extension ? sanitizeExtension(extension) : ""
  const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  const parts = [productId, type, uuid].filter(Boolean)
  return `${parts.join("-")}${safeExtension ? `.${safeExtension}` : ""}`
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()

    const file = form.get("image")
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier reçu (champ 'image')." },
        { status: 400 }
      )
    }

    if (!file.type?.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image." },
        { status: 400 }
      )
    }

    const bucket = (form.get("bucket") as string) || "product-images"
    const folder = (form.get("folder") as string) || "produits"
    const productId = (form.get("productId") as string) || undefined
    const type = (form.get("type") as string) || undefined

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            "Configuration manquante. Définis NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans les variables d'environnement.",
        },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // S'assurer que le bucket existe. Si absent, le créer automatiquement.
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    if (bucketsError) {
      return NextResponse.json(
        { error: `Impossible de lire la liste des buckets : ${bucketsError.message}` },
        { status: 500 }
      )
    }

    const bucketExists = (buckets || []).some((b) => b.name === bucket)
    if (!bucketExists) {
      const { error: createBucketError } = await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
      })

      if (createBucketError) {
        return NextResponse.json(
          {
            error: `Bucket introuvable et création impossible : ${createBucketError.message}`,
          },
          { status: 500 }
        )
      }
    }

    const fileName = buildFileName({ originalName: file.name, productId, type })
    const path = `${folder}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
      upsert: true,
      contentType: file.type,
    })

    if (uploadError) {
      return NextResponse.json(
        {
          error: `Échec de l'envoi de l'image : ${uploadError.message}`,
        },
        { status: 400 }
      )
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
    if (!data?.publicUrl) {
      return NextResponse.json(
        { error: "Impossible de récupérer l'URL publique de l'image." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, url: data.publicUrl, path, bucket })
  } catch (e) {
    return NextResponse.json(
      { error: "Erreur interne lors de l'upload." },
      { status: 500 }
    )
  }
}
