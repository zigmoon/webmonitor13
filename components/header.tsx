"use client"

import { Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  darkMode: boolean
  toggleDarkMode: () => void
}

export default function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-50 w-full border-b ${darkMode ? "bg-black border-gray-800" : "bg-white border-gray-200"}`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className={`text-3xl font-extrabold tracking-tighter ${darkMode ? "text-white" : "text-black"}`}>
            MONITOR<span className="text-green-500">_2.13</span>
          </h1>
          <div className={`h-1 w-16 ${darkMode ? "bg-white" : "bg-black"} hidden sm:block`}></div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={darkMode ? "ghost" : "outline"}
            size="icon"
            className={
              darkMode
                ? "text-white hover:text-white hover:bg-gray-800"
                : "text-black hover:text-black hover:bg-gray-100"
            }
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant={darkMode ? "ghost" : "outline"}
            size="icon"
            className={
              darkMode
                ? "text-white hover:text-white hover:bg-gray-800"
                : "text-black hover:text-black hover:bg-gray-100"
            }
          >
            <Settings className="h-5 w-5" />
          </Button>
          <button
            onClick={toggleDarkMode}
            className={`p-2 border-2 rounded-full ${
              darkMode
                ? "border-white text-white hover:bg-white hover:text-black"
                : "border-black text-black hover:bg-black hover:text-white"
            } transition-colors duration-200`}
          >
            {darkMode ? "LIGHT" : "DARK"}
          </button>
        </div>
      </div>
    </header>
  )
}
