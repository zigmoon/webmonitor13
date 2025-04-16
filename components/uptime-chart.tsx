"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import type { SiteStatus } from "@/lib/types"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface UptimeChartProps {
  sites: SiteStatus[]
}

export default function UptimeChart({ sites }: UptimeChartProps) {
  // Générer des données d'uptime pour chaque site
  const generateUptimeData = () => {
    const days = 30
    const data = []

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))

      const entry: any = {
        date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      }

      sites.forEach((site) => {
        // Simuler des taux d'uptime entre 90% et 100%
        const baseUptime = site.uptime?.percentage || Math.floor(Math.random() * 10) + 90
        const variation = Math.random() * 2
        entry[site.id] = Math.min(100, Math.max(90, baseUptime + variation))
      })

      data.push(entry)
    }

    return data
  }

  const uptimeData = generateUptimeData()

  // Créer la configuration des couleurs pour le graphique
  const chartConfig: Record<string, any> = {}
  const colors = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

  sites.forEach((site, index) => {
    chartConfig[site.id] = {
      label: site.name,
      color: colors[index % colors.length],
    }
  })

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={uptimeData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis domain={[90, 100]} unit="%" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          {sites.map((site, index) => (
            <Area
              key={site.id}
              type="monotone"
              dataKey={site.id}
              name={site.name}
              stroke={`var(--color-${site.id})`}
              fill={`var(--color-${site.id})`}
              fillOpacity={0.2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
