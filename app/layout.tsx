import type React from "react"
import { Audiowide, Mona_Sans as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import "@/app/globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

// Police web3 moderne depuis Google Fonts
const fontWeb3 = Audiowide({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-web3",
})

export const metadata = {
  title: "Agence 2.13 - Monitoring",
  description: "Plateforme de monitoring de sites web pour l'agence 2.13",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen font-sans antialiased", fontSans.variable, fontWeb3.variable)}>{children}</body>
    </html>
  )
}


import './globals.css'