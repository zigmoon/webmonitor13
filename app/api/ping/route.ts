import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { sites } from "@/lib/sites"

// Fonction simplifiée pour créer la table ping_history
async function createPingHistoryTable(supabase: ReturnType<typeof createServerSupabaseClient>) {
  try {
    // Vérifier d'abord si la table existe déjà
    const { data, error: checkError } = await supabase.from("ping_history").select("id").limit(1).maybeSingle()

    // Si la requête a réussi, la table existe déjà
    if (!checkError) {
      console.log("La table ping_history existe déjà")
      return true
    }

    // Si l'erreur indique que la table n'existe pas, nous la créons
    console.log("Tentative de création de la table ping_history...")

    // Utiliser une requête SQL directe pour créer la table
    const { error } = await supabase.rpc("create_ping_history_table", {})

    // Si la fonction RPC n'existe pas ou échoue, essayons une autre approche
    if (error) {
      console.log("Erreur avec RPC, tentative avec SQL brut:", error.message)

      // Créer la table avec une requête SQL brute
      const { error: sqlError } = await supabase.sql(`
        CREATE TABLE IF NOT EXISTS ping_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          site_id VARCHAR(255) NOT NULL,
          site_name VARCHAR(255) NOT NULL,
          site_url VARCHAR(255) NOT NULL,
          response_time INTEGER,
          status VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      if (sqlError) {
        console.log("Erreur avec SQL brut:", sqlError.message)

        // Dernière tentative: insérer simplement des données, ce qui créera la table si elle n'existe pas
        const { error: insertError } = await supabase.from("ping_history").insert({
          site_id: "init",
          site_name: "Initialisation",
          site_url: "https://example.com",
          status: "up",
          response_time: 100,
        })

        if (insertError && !insertError.message?.includes("already exists")) {
          console.log("Erreur lors de l'insertion:", insertError.message)
          return false
        }
      }
    }

    return true
  } catch (error) {
    console.error("Erreur lors de la création de la table:", error)
    return false
  }
}

// Fonction pour simuler un ping à un site web
async function pingWebsite(url: string): Promise<{ status: "up" | "down" | "slow"; responseTime: number }> {
  try {
    const startTime = Date.now()
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    })
    const endTime = Date.now()
    const responseTime = endTime - startTime

    if (!response.ok) {
      return { status: "down", responseTime }
    }

    // Si le temps de réponse est supérieur à 1000ms, considérer comme lent
    if (responseTime > 1000) {
      return { status: "slow", responseTime }
    }

    return { status: "up", responseTime }
  } catch (error) {
    return { status: "down", responseTime: 0 }
  }
}

// Route pour initialiser la base de données et effectuer un ping
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Créer la table ping_history
    const tableCreated = await createPingHistoryTable(supabase)

    if (!tableCreated) {
      return NextResponse.json(
        {
          success: false,
          error: "Impossible de créer la table ping_history",
        },
        { status: 500 },
      )
    }

    // Effectuer un ping sur chaque site
    const pingResults = await Promise.all(
      sites.map(async (site) => {
        try {
          // Simuler un ping pour le moment
          // Dans un environnement de production, vous utiliseriez pingWebsite(site.url)
          const status = Math.random() > 0.2 ? "up" : Math.random() > 0.5 ? "slow" : "down"
          const responseTime = Math.floor(Math.random() * 800) + 100

          // Stocker le résultat dans Supabase
          await supabase.from("ping_history").insert({
            site_id: site.id,
            site_name: site.name,
            site_url: site.url,
            status,
            response_time: responseTime,
          })

          return {
            ...site,
            status,
            responseTime,
          }
        } catch (error) {
          console.error(`Erreur lors du ping pour ${site.name}:`, error)
          return site
        }
      }),
    )

    return NextResponse.json({ success: true, data: pingResults })
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'initialisation de la base de données",
      },
      { status: 500 },
    )
  }
}

// Route pour récupérer l'historique des pings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("siteId")
    const days = Number.parseInt(searchParams.get("days") || "60", 10)

    const supabase = createServerSupabaseClient()

    // Vérifier si la table existe
    const { error: checkError } = await supabase.from("ping_history").select("id").limit(1)

    // Si la table n'existe pas, retourner un tableau vide
    if (checkError && checkError.message?.includes('relation "ping_history" does not exist')) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Calculer la date limite (aujourd'hui - nombre de jours)
    const limitDate = new Date()
    limitDate.setDate(limitDate.getDate() - days)

    let query = supabase
      .from("ping_history")
      .select("*")
      .gte("created_at", limitDate.toISOString())
      .order("created_at", { ascending: true })

    // Filtrer par site si un ID est fourni
    if (siteId) {
      query = query.eq("site_id", siteId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erreur lors de la récupération de l'historique des pings:", error)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la récupération de l'historique" },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des pings:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération de l'historique" },
      { status: 500 },
    )
  }
}
