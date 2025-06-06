"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Search,
  FileText,
  Building2,
  BarChart3,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Settings,
} from "lucide-react"
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
  const [cnpj, setCnpj] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [testingApi, setTestingApi] = useState(false)
  const [resultado, setResultado] = useState<BuscaResponse | null>(null)
  const [estatisticas, setEstatisticas] = useState<EstatisticasResponse | null>(null)
  const [erro, setErro] = useState("")
  const [erroEstatisticas, setErroEstatisticas] = useState("")

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sistema de Consulta de Processos</h1>
          <p className="text-gray-600">Consulte processos jurídicos por CNPJ usando a API do Escavador</p>

          {/* Indicador de API Real */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">API Real do Escavador Configurada</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={testarApiEscavador}
              disabled={testingApi}
              className="flex items-center gap-2"
            >
              {testingApi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
              Testar API
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Processos
            </CardTitle>
            <CardDescription>Digite o CNPJ da empresa para consultar os processos na API do Escavador</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={handleCNPJChange}
                  maxLength={18}
                  className="text-lg"
                />
              </div>
              <Button onClick={buscarProcessos} disabled={loading} className="px-8">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
            {erro && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{erro}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {resultado && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">CNPJ</label>
                    <p className="text-lg">{formatarCNPJ(resultado.empresa.cnpj)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fonte dos Dados</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          resultado.fonte === "cache"
                            ? "secondary"
                            : resultado.fonte === "simulado"
                              ? "outline"
                              : "default"
                        }
                      >
                        {resultado.fonte === "cache"
                          ? "Cache Local"
                          : resultado.fonte === "simulado"
                            ? "Dados Simulados"
                            : "API Escavador (Real)"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {resultado.message && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-blue-600 text-sm">{resultado.message}</p>
                  </div>
                )}

                {resultado.warning && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-600 text-sm">{resultado.warning}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas de Processos Trabalhistas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estatísticas de Processos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-600">Analisando processos trabalhistas...</span>
                  </div>
                ) : erroEstatisticas ? (
                  <div className="text-center py-6">
                    <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm">{erroEstatisticas}</p>
                    </div>
                    <Button variant="outline" onClick={buscarEstatisticas} className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Tentar Novamente
                    </Button>
                  </div>
                ) : estatisticas ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-blue-600 mb-1">Total de Processos</p>
                          <p className="text-3xl font-bold text-blue-700">{estatisticas.total_processos}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-amber-50">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Briefcase className="h-4 w-4 text-amber-600" />
                            <p className="text-sm font-medium text-amber-600">Processos Trabalhistas</p>
                          </div>
                          <p className="text-3xl font-bold text-amber-700">{estatisticas.processos_trabalhistas}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-green-600 mb-1">Percentual Trabalhista</p>
                          <p className="text-3xl font-bold text-green-700">
                            {formatarPercentual(estatisticas.percentual_trabalhista)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {estatisticas.message && (
                      <div className="col-span-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-blue-600 text-sm">{estatisticas.message}</p>
                      </div>
                    )}

                    {estatisticas.warning && (
                      <div className="col-span-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-600 text-sm">{estatisticas.warning}</p>
                      </div>
                    )}

                    <div className="col-span-3 text-right">
                      <p className="text-xs text-gray-500">
                        Fonte:{" "}
                        {estatisticas.fonte === "cache"
                          ? "Cache Local"
                          : estatisticas.fonte === "simulado"
                            ? "Dados Simulados"
                            : "API Escavador (Real)"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Button variant="outline" onClick={buscarEstatisticas} className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Carregar Estatísticas
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Processos Encontrados ({resultado.processos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resultado.processos.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">{resultado.message || "Nenhum processo encontrado para este CNPJ"}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resultado.processos.map((processo) => (
                      <Card key={processo.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Número do Processo</label>
                              <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                                {processo.numero_cnj}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Vara</label>
                              <p className="mt-1">{processo.vara || "N/A"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Fase Processual</label>
                              <Badge variant="outline" className="mt-1">
                                {processo.fase_processual || "N/A"}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Data de Ajuizamento</label>
                              <p className="mt-1">{formatarData(processo.data_ajuizamento)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Valor da Causa</label>
                              <p className="mt-1">{formatarValor(processo.valor_causa)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Risco Geral</label>
                              <Badge
                                variant={
                                  processo.risco_geral === "Alto"
                                    ? "destructive"
                                    : processo.risco_geral === "Baixo"
                                      ? "default"
                                      : "secondary"
                                }
                                className="mt-1"
                              >
                                {processo.risco_geral || "N/A"}
                              </Badge>
                            </div>
                          </div>
                          {processo.observacoes && (
                            <div className="mt-4">
                              <label className="text-sm font-medium text-gray-500">Observações</label>
                              <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{processo.observacoes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
