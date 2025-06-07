"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import type { Processo, Empresa } from "@/lib/types"

interface BuscaResponse {
  empresa: Empresa
  processos: Processo[]
  fonte: "cache" | "escavador" | "simulado"
  message?: string
  warning?: string
}

interface EstatisticasResponse {
  empresa: Empresa
  total_processos: number
  processos_trabalhistas: number
  percentual_trabalhista: number
  fonte: "cache" | "api" | "simulado"
  warning?: string
  error?: boolean
  message?: string
}

export default function Home() {
  const router = useRouter()
  const [cnpj, setCnpj] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [testingApi, setTestingApi] = useState(false)
  const [resultado, setResultado] = useState<BuscaResponse | null>(null)
  const [estatisticas, setEstatisticas] = useState<EstatisticasResponse | null>(null)
  const [erro, setErro] = useState("")
  const [erroEstatisticas, setErroEstatisticas] = useState("")

  useEffect(() => {
    // Verificar se usuário está logado
    const userData = localStorage.getItem("user")
    if (userData) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [router])

  const formatarCNPJ = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "")
    return apenasNumeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
  }

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    const valorFormatado = formatarCNPJ(valor)
    setCnpj(valorFormatado)
  }

  const testarApiEscavador = async () => {
    setTestingApi(true)
    try {
      const response = await fetch(`/api/test-escavador?cnpj=${encodeURIComponent(cnpj || "11222333000181")}`)
      const data = await response.json()

      console.log("Resultado do teste da API:", data)

      // Mostra o resultado em um alert simples (em produção, seria um modal)
      const successfulEndpoints = data.results?.filter((r: any) => r.success).length || 0
      const totalEndpoints = data.results?.length || 0

      alert(
        `Teste da API do Escavador:\n\nToken configurado: ${data.token_configured ? "Sim" : "Não"}\nEndpoints funcionando: ${successfulEndpoints}/${totalEndpoints}\n\nVerifique o console para detalhes completos.`,
      )
    } catch (error) {
      console.error("Erro ao testar API:", error)
      alert("Erro ao testar a API do Escavador. Verifique o console para detalhes.")
    } finally {
      setTestingApi(false)
    }
  }

  const buscarProcessos = async () => {
    if (!cnpj.trim()) {
      setErro("Digite um CNPJ válido")
      return
    }

    setLoading(true)
    setErro("")
    setErroEstatisticas("")
    setResultado(null)
    setEstatisticas(null)

    try {
      const response = await fetch(`/api/busca-processos?cnpj=${encodeURIComponent(cnpj)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar processos")
      }

      setResultado(data)

      // Após buscar processos, busca estatísticas automaticamente
      setTimeout(() => {
        buscarEstatisticas()
      }, 500)
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const buscarEstatisticas = async () => {
    if (!cnpj.trim()) return

    setLoadingStats(true)
    setErroEstatisticas("")

    try {
      const response = await fetch(`/api/processos-trabalhistas?cnpj=${encodeURIComponent(cnpj)}`)

      // Verifica se a resposta é JSON válido
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta inválida do servidor")
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "Erro ao buscar estatísticas")
      }

      if (data.error) {
        throw new Error(data.message || "Erro ao processar estatísticas")
      }

      setEstatisticas(data)
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
      setErroEstatisticas(error instanceof Error ? error.message : "Erro desconhecido ao buscar estatísticas")
    } finally {
      setLoadingStats(false)
    }
  }

  const formatarData = (data: string | null) => {
    if (!data) return "N/A"
    return new Date(data).toLocaleDateString("pt-BR")
  }

  const formatarValor = (valor: number | null) => {
    if (!valor) return "N/A"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const formatarPercentual = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(valor / 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="text-gray-600">Redirecionando...</span>
      </div>
    </div>
  )
}
