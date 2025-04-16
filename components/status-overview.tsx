import { CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SiteStatus } from "@/lib/types"

interface StatusOverviewProps {
  sites: SiteStatus[]
}

export default function StatusOverview({ sites }: StatusOverviewProps) {
  const upSites = sites.filter((site) => site.status === "up").length
  const downSites = sites.filter((site) => site.status === "down").length
  const upPercentage = sites.length > 0 ? Math.round((upSites / sites.length) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sites monitorés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sites.length}</div>
          <p className="text-xs text-muted-foreground">Total des sites web</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sites en ligne</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upSites}</div>
          <p className="text-xs text-muted-foreground">Sites fonctionnant normalement</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sites hors ligne</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{downSites}</div>
          <p className="text-xs text-muted-foreground">Sites rencontrant des problèmes</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Disponibilité globale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upPercentage}%</div>
          <div className="mt-2 h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
              style={{ width: `${upPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
