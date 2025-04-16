import type { Metadata } from "next"
import Dashboard from "@/components/dashboard"
import { sites } from "@/lib/sites"

export const metadata: Metadata = {
  title: "Agence 2.13 - Monitoring",
  description: "Plateforme de monitoring de sites web pour l'agence 2.13",
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Dashboard sites={sites} />
    </main>
  )
}
