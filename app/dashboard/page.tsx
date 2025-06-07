"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building2, LogOut, Archive, RefreshCw, CheckCircle, Briefcase } from "lucide-react"

interface Processo {
  id: number
  numero_cnj: string
  vara: string | null
  fase_processual: string | null
  data_ajuizamento: string | null
  valor_causa: number | null
  risco_geral: string | null
  observacoes: string | null
  arquivado: boolean
  created_at: string
}

interface BuscaResponse {
  empresa: any
  cliente: any
  processos: Processo[]
  fonte: "cache" | "escavador" | "simulado"
  message?: string
  warning?: string
}

interface UserData {
  id: string
  nome: string
  email: string
  cnpj: string
  telefone?: string
  empresa: {
    id: number
    nome: string
    razao_social: string
    endereco: string
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [processos, setProcessos] = useState<Processo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProcessos, setLoadingProcessos] = useState(false)
  const [erro, setErro] = useState("")
  const [resultado, setResultado] = useState<BuscaResponse | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar se usuário está logado
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      buscarProcessos()
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error)
      router.push("/login")
    }
  }, [router])

  const buscarProcessos = async () => {
    setLoadingProcessos(true)
    setErro("")

    try {
      const response = await fetch("/api/busca-processos")
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login")
          return
        }
        throw new Error(data.error || "Erro ao buscar processos")
      }

      setResultado(data)
      setProcessos(data.processos || [])
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setLoadingProcessos(false)
      setLoading(false)
    }
  }

  const arquivarProcesso = async (processoId: number, observacoes?: string) => {
    try {
      const response = await fetch("/api/processos/arquivar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          processo_id: processoId,
          observacoes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao arquivar processo")
      }

      // Remover processo da lista
      setProcessos((prev) => prev.filter((p) => p.id !== processoId))

      // Mostrar mensagem de sucesso (você pode implementar um toast aqui)
      alert("Processo arquivado com sucesso!")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao arquivar processo")
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    router.push("/login")
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

  const formatarCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema de Processos Trabalhistas</h1>
                <p className="text-sm text-gray-600">Bem-vindo, {user.nome}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Informações do Cliente e Empresa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Nome:</span>
                <p className="text-lg">{user.nome}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p>{user.email}</p>
              </div>
              {user.telefone && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Telefone:</span>
                  <p>{user.telefone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">CNPJ:</span>
                <p className="text-lg font-mono">{formatarCNPJ(user.cnpj)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Nome:</span>
                <p>{user.empresa?.nome || "N/A"}</p>
              </div>
              {user.empresa?.razao_social && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Razão Social:</span>
                  <p>{user.empresa.razao_social}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Processos Trabalhistas */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Processos Trabalhistas ({processos.length})
                </CardTitle>
                <CardDescription>Processos trabalhistas ativos da sua empresa</CardDescription>
              </div>
              <Button onClick={buscarProcessos} disabled={loadingProcessos} className="flex items-center gap-2">
                {loadingProcessos ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {resultado?.message && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-600 text-sm">{resultado.message}</p>
              </div>
            )}

            {resultado?.warning && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-600 text-sm">{resultado.warning}</p>
              </div>
            )}

            {erro && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{erro}</p>
              </div>
            )}

            {loadingProcessos ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Buscando processos trabalhistas...</span>
              </div>
            ) : processos.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-gray-500 text-lg">Nenhum processo trabalhista ativo encontrado!</p>
                <p className="text-gray-400 text-sm mt-2">
                  Isso é uma boa notícia - sua empresa não possui processos trabalhistas pendentes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {processos.map((processo) => (
                  <Card key={processo.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
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
                              <label className="text-sm font-medium text-gray-500">Risco</label>
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
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const observacoes = prompt("Observações sobre o arquivamento (opcional):")
                            if (observacoes !== null) {
                              arquivarProcesso(processo.id, observacoes)
                            }
                          }}
                          className="ml-4 flex items-center gap-2"
                        >
                          <Archive className="h-4 w-4" />
                          Arquivar
                        </Button>
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

            {resultado && (
              <div className="mt-4 text-right">
                <p className="text-xs text-gray-500">
                  Fonte:{" "}
                  {resultado.fonte === "cache"
                    ? "Cache Local"
                    : resultado.fonte === "simulado"
                      ? "Dados Simulados"
                      : "API Escavador (Real)"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
