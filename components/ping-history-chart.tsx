"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface PingHistoryChartProps {
  siteId?: string
  days?: number
  refreshTrigger?: number
}

export default function PingHistoryChart({ siteId, days = 60, refreshTrigger = 0 }: PingHistoryChartProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pingData, setPingData] = useState<any[]>([])

  useEffect(() => {
    async function fetchPingHistory() {
      try {
        setLoading(true)
        setError(null)

        // Récupérer l'historique des pings depuis l'API avec un paramètre de cache-busting
        const cacheBuster = new Date().getTime()
        const response = await fetch(`/api/ping?${siteId ? `siteId=${siteId}&` : ""}days=${days}&_=${cacheBuster}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const { success, data, error } = await response.json()

        if (!success || error) {
          throw new Error(error || "Erreur lors de la récupération de l'historique des pings")
        }

        // Si aucune donnée n'est disponible, définir un tableau vide
        if (!data || data.length === 0) {
          setPingData([])
          return
        }

        // Traiter les données pour le graphique
        const processedData = processDataForChart(data)
        setPingData(processedData)
      } catch (err) {
        console.error("Erreur:", err)
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    }

    fetchPingHistory()
  }, [siteId, days, refreshTrigger])

  // Fonction pour traiter les données pour le graphique
  function processDataForChart(data: any[]) {
    if (!data || data.length === 0) return []

    // Regrouper les données par jour
    const groupedByDay = data.reduce((acc: Record<string, any>, ping: any) => {
      const date = new Date(ping.created_at)
      const day = date.toISOString().split("T")[0]

      if (!acc[day]) {
        acc[day] = {
          day,
          date: day,
          sites: {},
        }
      }

      if (!acc[day].sites[ping.site_id]) {
        acc[day].sites[ping.site_id] = {
          count: 0,
          totalResponseTime: 0,
          upCount: 0,
        }
      }

      const site = acc[day].sites[ping.site_id]
      site.count++
      site.totalResponseTime += ping.response_time || 0
      if (ping.status === "up") {
        site.upCount++
      }

      return acc
    }, {})

    // Convertir les données groupées en format pour le graphique
    return Object.values(groupedByDay).map((dayData: any) => {
      const result: any = { date: dayData.day }

      Object.entries(dayData.sites).forEach(([siteId, siteData]: [string, any]) => {
        // Calculer le temps de réponse moyen
        result[`${siteId}_responseTime`] = siteData.totalResponseTime / siteData.count

        // Calculer le taux de disponibilité
        result[`${siteId}_uptime`] = (siteData.upCount / siteData.count) * 100
      })

      return result
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des pings sur {days} jours</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des pings sur {days} jours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] w-full items-center justify-center">
            <p className="text-destructive">Erreur: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (pingData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des pings sur {days} jours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] w-full items-center justify-center">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des pings sur {days} jours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                yAxisId="responseTime"
                label={{ value: "Temps de réponse (ms)", angle: -90, position: "insideLeft" }}
              />
              <YAxis
                yAxisId="uptime"
                orientation="right"
                domain={[0, 100]}
                label={{ value: "Disponibilité (%)", angle: 90, position: "insideRight" }}
              />
              <Tooltip />
              <Legend />

              {/* Afficher les lignes pour chaque site */}
              {Object.keys(pingData[0] || {})
                .filter((key) => key.endsWith("_responseTime"))
                .map((key, index) => {
                  const siteId = key.replace("_responseTime", "")
                  const site = siteId // Vous pourriez avoir besoin de mapper l'ID à un nom plus lisible

                  return (
                    <Line
                      key={`${siteId}_responseTime`}
                      type="monotone"
                      dataKey={key}
                      name={`${site} - Temps de réponse`}
                      stroke={`hsl(${index * 30}, 70%, 50%)`}
                      yAxisId="responseTime"
                      dot={false}
                    />
                  )
                })}

              {Object.keys(pingData[0] || {})
                .filter((key) => key.endsWith("_uptime"))
                .map((key, index) => {
                  const siteId = key.replace("_uptime", "")
                  const site = siteId // Vous pourriez avoir besoin de mapper l'ID à un nom plus lisible

                  return (
                    <Line
                      key={`${siteId}_uptime`}
                      type="monotone"
                      dataKey={key}
                      name={`${site} - Disponibilité`}
                      stroke={`hsl(${index * 30 + 15}, 70%, 50%)`}
                      strokeDasharray="5 5"
                      yAxisId="uptime"
                      dot={false}
                    />
                  )
                })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
