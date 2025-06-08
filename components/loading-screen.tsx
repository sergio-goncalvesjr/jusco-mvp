"use client"

import { Loader2, Building2 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = "Carregando..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Building2 className="h-12 w-12 text-blue-600" />
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-lg text-gray-700">{message}</span>
        </div>
        <p className="text-sm text-gray-500">Sistema de Processos Trabalhistas</p>
      </div>
    </div>
  )
}
