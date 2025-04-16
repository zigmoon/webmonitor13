"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PingControllerProps {
  onPingComplete?: () => void
}

export default function PingController({ onPingComplete }: PingControllerProps) {
  const [loading, setLoading] = useState(false)
  const [lastPing, setLastPing] = useState<string | null>(null)
  const [autoPing, setAutoPing] = useState(false)
  const [interval, setInterval] = useState("5") // minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Effectuer un ping manuel
  const pingAllSites = async () => {
    if (loading) return

    try {
      setLoading(true)

      const response = await fetch("/api/ping", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors du ping des sites")
      }

      setLastPing(new Date().toLocaleString())

      // Notifier le composant parent que le ping est terminé
      if (onPingComplete) {
        onPingComplete()
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  // Gérer l'activation/désactivation du ping automatique
  useEffect(() => {
    if (autoPing) {
      // Démarrer le ping automatique
      pingAllSites()

      timerRef.current = setInterval(
        () => {
          pingAllSites()
        },
        Number.parseInt(interval) * 60 * 1000,
      )
    } else {
      // Arrêter le ping automatique
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    // Nettoyer l'intervalle lors du démontage du composant
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [autoPing, interval])

  // Mettre à jour l'intervalle lorsqu'il change
  useEffect(() => {
    if (autoPing && timerRef.current) {
      // Réinitialiser l'intervalle
      clearInterval(timerRef.current)
      timerRef.current = setInterval(
        () => {
          pingAllSites()
        },
        Number.parseInt(interval) * 60 * 1000,
      )
    }
  }, [interval])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contrôle des pings</CardTitle>
        <CardDescription>Effectuez des pings manuels ou automatiques pour surveiller vos sites</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="auto-ping" checked={autoPing} onCheckedChange={setAutoPing} />
          <Label htmlFor="auto-ping">Ping automatique</Label>
        </div>

        {autoPing && (
          <div className="space-y-2">
            <Label htmlFor="interval-select">Intervalle de ping</Label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger id="interval-select" className="w-full">
                <SelectValue placeholder="Sélectionner un intervalle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 minutes</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 heure</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">Ping automatique toutes les {interval} minutes</div>
          </div>
        )}

        {lastPing && <div className="text-sm">Dernier ping: {lastPing}</div>}
      </CardContent>
      <CardFooter>
        <Button onClick={pingAllSites} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Ping manuel
        </Button>
      </CardFooter>
    </Card>
  )
}
