"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import PingHistoryChart from "./ping-history-chart"
import PingController from "./ping-controller"
import Header from "./header"
import { sites } from "@/lib/sites"

export default function Dashboard() {
  // État pour le thème
  const [darkMode, setDarkMode] = useState(true)

  // État pour l'initialisation
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  // État pour le rafraîchissement des données
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fonction pour initialiser la base de données
  const initializeDatabase = async () => {
    if (isInitializing) return

    try {
      setIsInitializing(true)
      setInitError(null)

      const response = await fetch("/api/ping", {
        method: "POST",
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Échec de l'initialisation")
      }

      setIsInitialized(true)
      // Déclencher un rafraîchissement des données
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error("Erreur d'initialisation:", error)
      setInitError(error instanceof Error ? error.message : "Erreur inconnue")
    } finally {
      setIsInitializing(false)
    }
  }

  // Fonction appelée après un ping réussi
  const handlePingComplete = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Statistiques
  const [stats, setStats] = useState({
    upSites: 0,
    downSites: 0,
    slowSites: 0,
    totalSites: 0,
    averagePingTime: 0,
  })

  // Calculer les statistiques
  useEffect(() => {
    const upSites = sites.filter((site) => site.status === "up").length
    const downSites = sites.filter((site) => site.status === "down").length
    const slowSites = sites.filter((site) => site.status === "slow").length
    const totalSites = sites.length

    const sitesWithResponse = sites.filter((site) => site.responseTime)
    const totalPingTime = sitesWithResponse.reduce((sum, site) => sum + site.responseTime, 0)
    const averagePingTime = sitesWithResponse.length > 0 ? Math.round(totalPingTime / sitesWithResponse.length) : 0

    setStats({
      upSites,
      downSites,
      slowSites,
      totalSites,
      averagePingTime,
    })
  }, [])

  // Basculer le mode sombre
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
  }

  // Obtenir la couleur de la bordure selon le statut
  const getBorderColor = (status) => {
    switch (status) {
      case "up":
        return "border-green-500"
      case "down":
        return "border-red-500"
      case "slow":
        return "border-yellow-500"
      default:
        return darkMode ? "border-gray-700" : "border-gray-300"
    }
  }

  // Obtenir la classe de badge selon le statut
  const getBadgeClass = (status) => {
    switch (status) {
      case "up":
        return "bg-green-500 text-white"
      case "down":
        return "bg-red-500 text-white"
      case "slow":
        return "bg-yellow-500 text-white"
      default:
        return darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-300 text-gray-800"
    }
  }

  // Obtenir le texte de statut
  const getStatusText = (status) => {
    switch (status) {
      case "up":
        return "En ligne"
      case "down":
        return "Hors ligne"
      case "slow":
        return "Lent"
      default:
        return "Inconnu"
    }
  }

  // Composant d'initialisation
  const InitializationCard = () => (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Initialisation requise</CardTitle>
        <CardDescription>
          Nous devons initialiser la base de données pour stocker l'historique des pings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {initError && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md">
            Erreur: {initError}
          </div>
        )}
        <p>
          Cliquez sur le bouton ci-dessous pour créer la table nécessaire dans Supabase et effectuer un premier ping de
          vos sites.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={initializeDatabase} disabled={isInitializing}>
          {isInitializing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Initialiser la base de données
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className={`min-h-screen font-mono ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats - Quatre colonnes en desktop, empilé en mobile */}
        <div className={`p-6 border-2 rounded-lg ${darkMode ? "border-white" : "border-black"} mb-10`}>
          <div className="flex flex-col sm:flex-row justify-between">
            <div className="mb-4 sm:mb-0">
              <p className="text-xs uppercase tracking-wider opacity-70">En ligne</p>
              <p className="text-3xl font-bold text-green-500">
                {stats.upSites}/{stats.totalSites}
              </p>
            </div>

            <div className="mb-4 sm:mb-0">
              <p className="text-xs uppercase tracking-wider opacity-70">Lent</p>
              <p className="text-3xl font-bold text-yellow-500">
                {stats.slowSites}/{stats.totalSites}
              </p>
            </div>

            <div className="mb-4 sm:mb-0">
              <p className="text-xs uppercase tracking-wider opacity-70">Hors ligne</p>
              <p className="text-3xl font-bold text-red-500">
                {stats.downSites}/{stats.totalSites}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider opacity-70">Latence moyenne</p>
              <p className="text-3xl font-bold">{stats.averagePingTime} ms</p>
            </div>
          </div>

          {/* Légende des barres */}
          <div className="flex justify-end mt-4 space-x-4 text-xs uppercase tracking-wider">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Normal</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span>Interruption</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span>Coupure</span>
            </div>
          </div>
        </div>

        {/* Contrôleur de ping et historique */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {!isInitialized ? (
            <InitializationCard />
          ) : (
            <>
              <div className="md:col-span-1">
                <PingController onPingComplete={handlePingComplete} />
              </div>
              <div className="md:col-span-2">
                <PingHistoryChart days={60} refreshTrigger={refreshTrigger} />
              </div>
            </>
          )}
        </div>

        {/* Sites */}
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-6">
          Sites Monitorés
          <span className="ml-3 text-sm font-normal opacity-70">{sites.length} services • 60 jours d'historique</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {sites.map((site) => (
            <div
              key={site.id}
              className={`border-2 rounded-lg ${getBorderColor(site.status)} hover:border-opacity-80 transition-colors duration-200 p-6`}
            >
              <div className="flex justify-between items-start mb-4">
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-lg tracking-tight hover:text-green-500 transition-colors duration-200"
                >
                  {site.name}
                </a>

                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeClass(site.status)}`}>
                  {getStatusText(site.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-70">Disponibilité</p>
                  <p className="text-lg font-bold">
                    {typeof site.uptime === "object" ? site.uptime.percentage : site.uptime}%
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-70">Latence</p>
                  <p className="text-lg font-bold">{site.responseTime ? `${site.responseTime} ms` : "-"}</p>
                </div>
              </div>

              {/* Représentation de 60 jours */}
              <div className="mt-4 pt-4 border-t border-opacity-30 border-gray-500">
                <div className="text-xs uppercase tracking-wider opacity-70 mb-2">60 jours</div>
                <div className="flex h-8 space-x-px">
                  {Array.from({ length: 60 }).map((_, i) => {
                    // Simuler des statuts basés sur l'uptime
                    const rand = Math.random() * 100
                    let color
                    if (rand < (typeof site.uptime === "object" ? site.uptime.percentage : site.uptime) - 3) {
                      color = "bg-green-500" // Normal
                    } else if (rand < (typeof site.uptime === "object" ? site.uptime.percentage : site.uptime)) {
                      color = "bg-yellow-500" // Interruption
                    } else {
                      color = "bg-red-500" // Coupure
                    }
                    return <div key={i} className={`flex-1 ${color} rounded-sm`}></div>
                  })}
                </div>

                {/* Indicateurs de jour */}
                <div className="flex h-4 mt-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex-1 flex justify-center">
                      <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{i * 10}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`mt-10 pt-6 border-t-2 ${darkMode ? "border-white" : "border-black"} rounded-t-sm`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm uppercase tracking-wider">
              © 2025 <span className="text-green-500">2.13</span> | Agence Digitale Créative
            </p>
            <div className="mt-4 md:mt-0 text-xs uppercase tracking-wider opacity-70">
              Dernière mise à jour: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
