import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface LoginData {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginData = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fazer login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("Erro no login:", authError)
      return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Erro ao fazer login" }, { status: 401 })
    }

    // Buscar dados do cliente
    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select(`
        *,
        empresas (
          id,
          cnpj,
          nome,
          razao_social,
          endereco,
          telefone,
          email
        )
      `)
      .eq("id", authData.user.id)
      .single()

    if (clienteError || !cliente) {
      console.error("Erro ao buscar dados do cliente:", clienteError)
      return NextResponse.json({ error: "Dados do cliente não encontrados" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Login realizado com sucesso!",
      user: {
        id: cliente.id,
        email: cliente.email,
        nome: cliente.nome,
        cnpj: cliente.cnpj,
        telefone: cliente.telefone,
        empresa: cliente.empresas[0] || null,
      },
    })
  } catch (error) {
    console.error("Erro geral no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
