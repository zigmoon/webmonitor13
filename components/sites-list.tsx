"use client"

import { Check, ExternalLink, XCircle } from "lucide-react"
import type { SiteStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SitesListProps {
  sites: SiteStatus[]
  selectedSite: string | null
  onSelectSite: (siteId: string | null) => void
}

export default function SitesList({ sites, selectedSite, onSelectSite }: SitesListProps) {
  return (
    <div className="space-y-2">
      {sites.map((site) => (
        <div
          key={site.id}
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border transition-colors",
            selectedSite === site.id ? "border-purple-500 bg-purple-500/10" : "border-muted hover:border-purple-500/50",
          )}
          onClick={() => onSelectSite(selectedSite === site.id ? null : site.id)}
        >
          <div className="flex items-center gap-3">
            <div className={cn("w-3 h-3 rounded-full", site.status === "up" ? "bg-green-500" : "bg-red-500")} />
            <div>
              <div className="font-medium">{site.name}</div>
              <div className="text-xs text-muted-foreground">{site.url}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm">
              {site.status === "up" ? (
                <span className="text-green-500 flex items-center gap-1">
                  <Check className="h-4 w-4" /> En ligne
                </span>
              ) : (
                <span className="text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> Hors ligne
                </span>
              )}
            </div>
            <Button variant="ghost" size="icon" asChild>
              <a href={site.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
