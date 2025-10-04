"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function BackToHome() {
  return (
    <div className="top-4 left-4 z-50">
      <Link href="/">
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-900/80 border-slate-700 hover:bg-slate-800/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux Labs
        </Button>
      </Link>
    </div>
  )
}
