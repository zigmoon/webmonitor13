export interface SiteStatus {
  id: string
  name: string
  url: string
  status: "up" | "down" | "slow"
  lastChecked?: string
  responseTime?: number
  uptime?: {
    percentage: number
    last24h?: number
    last7d?: number
    last30d?: number
  }
  performance?: {
    loadTime: number
    ttfb?: number
  }
}

export interface PingHistoryEntry {
  id: string
  site_id: string
  site_name: string
  site_url: string
  status: "up" | "down" | "slow"
  response_time: number
  created_at: string
}
