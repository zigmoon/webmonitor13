import { createClient } from "@supabase/supabase-js"

// Création du client Supabase pour le côté serveur
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Les variables d'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies")
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Création du client Supabase pour le côté client
let clientSupabaseInstance: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseInstance) return clientSupabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Les variables d'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies",
    )
  }

  clientSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return clientSupabaseInstance
}
