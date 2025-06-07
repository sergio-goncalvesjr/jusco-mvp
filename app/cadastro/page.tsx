"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, Building2, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CadastroPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
    cnpj: "",
    telefone: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState(false)
  const router = useRouter()

  const formatarCNPJ = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "")
    return apenasNumeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
  }

  const formatarTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "")
    if (apenasNumeros.length <= 10) {
      return apenasNumeros.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3")
    }
    return apenasNumeros.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "cnpj") {
      value = formatarCNPJ(value)
    } else if (field === "telefone") {
      value = formatarTelefone(value)
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro("")

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setErro("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    const cnpjLimpo = formData.cnpj.replace(/\D/g, "")
    if (cnpjLimpo.length !== 14) {
      setErro("CNPJ deve ter 14 dígitos")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          password: formData.password,
          cnpj: formData.cnpj,
          telefone: formData.telefone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta")
      }

      setSucesso(true)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">Cadastro Realizado!</h2>
              <p className="text-green-600 mb-4">
                Sua conta foi criada com sucesso. Você será redirecionado para a página de login.
              </p>
              <div className="text-sm text-gray-600">Redirecionando em 3 segundos...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>Cadastre sua empresa para consultar processos trabalhistas</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCadastro} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ da Empresa</Label>
              <Input
                id="cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => handleInputChange("cnpj", e.target.value)}
                maxLength={18}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone (opcional)</Label>
              <Input
                id="telefone"
                type="text"
                placeholder="(11) 99999-9999"
                value={formData.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {erro && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{erro}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Faça login aqui
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
