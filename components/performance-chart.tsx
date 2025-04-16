"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import type { SiteStatus } from "@/lib/types"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface PerformanceChartProps {
  sites: SiteStatus[]
  detailed?: boolean
}

export default function PerformanceChart({ sites, detailed = false }: PerformanceChartProps) {
  // Générer des données de performance pour chaque site
  const generatePerformanceData = () => {
    const days = detailed ? 30 : 7
    const data = []

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))

      const entry: any = {
        date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      }

      sites.forEach((site) => {
        // Simuler des temps de chargement entre 200ms et 1500ms
        const baseLoadTime = site.performance?.loadTime || Math.floor(Math.random() * 1000) + 200
        const variation = Math.floor(Math.random() * 300) - 150
        entry[site.id] = Math.max(100, baseLoadTime + variation)
      })

      data.push(entry)
    }

    return data
  }

  const performanceData = generatePerformanceData()

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
        <LineChart data={performanceData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis unit="ms" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          {sites.map((site, index) => (
            <Line
              key={site.id}
              type="monotone"
              dataKey={site.id}
              name={site.name}
              stroke={`var(--color-${site.id})`}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
