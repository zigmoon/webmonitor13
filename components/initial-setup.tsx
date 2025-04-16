"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function InitialSetup() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setupDatabase = async () => {
    if (loading) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/ping", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const { success } = await response.json()

      if (!success) {
        throw new Error("Échec de l'initialisation")
      }

      setSuccess(true)
    } catch (error) {
      console.error("Erreur:", error)
      setError(error instanceof Error ? error.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-green-700 dark:text-green-300">Configuration réussie</CardTitle>
          <CardDescription>
            La base de données a été initialisée avec succès. Vous pouvez maintenant utiliser l'application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Rafraîchissez la page pour commencer à utiliser l'application.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Rafraîchir la page</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration initiale</CardTitle>
        <CardDescription>
          Nous devons initialiser la base de données pour stocker l'historique des pings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">Erreur: {error}</p>}
        <p>
          Cliquez sur le bouton ci-dessous pour créer la table nécessaire dans Supabase et effectuer un premier ping de
          vos sites.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={setupDatabase} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Initialiser la base de données
        </Button>
      </CardFooter>
    </Card>
  )
}
