import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import axios from "axios"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

// Cliente Supabase com Service Role Key (para bypass do RLS)
const supabaseAdmin = createSupabaseAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CadastroData {
  email: string
  password: string
  nome: string
  cnpj: string
  telefone?: string
}

interface EscavadorEmpresaResponse {
  dados?: {
    nome?: string
    razao_social?: string
    endereco?: {
      logradouro?: string
      numero?: string
      bairro?: string
      cidade?: string
      uf?: string
      cep?: string
    }
    telefone?: string
    email?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CadastroData = await request.json()
    const { email, password, nome, cnpj, telefone } = body

    if (!email || !password || !nome || !cnpj) {
      return NextResponse.json({ error: "Todos os campos obrigatórios devem ser preenchidos" }, { status: 400 })
    }

    const cnpjLimpo = cnpj.replace(/[^\d]/g, "")
    if (cnpjLimpo.length !== 14) {
      return NextResponse.json({ error: "CNPJ deve ter 14 dígitos" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: cnpjExistente } = await supabase.from("clientes").select("id").eq("cnpj", cnpjLimpo).single()

    if (cnpjExistente) {
      return NextResponse.json({ error: "Este CNPJ já está cadastrado no sistema" }, { status: 400 })
    }

    let dadosEmpresa = {
      nome: "",
      razao_social: "",
      endereco: "",
      telefone_empresa: "",
      email_empresa: "",
    }

    try {
      const escavadorResponse = await axios.get(`https://api.escavador.com/api/v1/pessoas/juridica/${cnpjLimpo}`, {
        headers: {
          Authorization: `Bearer ${process.env.ESCAVADOR_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000,
      })

      const empresa: EscavadorEmpresaResponse = escavadorResponse.data

      if (empresa.dados) {
        dadosEmpresa = {
          nome: empresa.dados.nome || `Empresa ${cnpjLimpo}`,
          razao_social: empresa.dados.razao_social || empresa.dados.nome || "",
          endereco: empresa.dados.endereco
            ? `${empresa.dados.endereco.logradouro || ""} ${empresa.dados.endereco.numero || ""}, ${empresa.dados.endereco.bairro || ""}, ${empresa.dados.endereco.cidade || ""} - ${empresa.dados.endereco.uf || ""}, CEP: ${empresa.dados.endereco.cep || ""}`
            : "",
          telefone_empresa: empresa.dados.telefone || "",
          email_empresa: empresa.dados.email || "",
        }
      }
    } catch (escavadorError) {
      console.error("Erro ao buscar dados da empresa no Escavador:", escavadorError)
      dadosEmpresa.nome = `Empresa ${cnpjLimpo}`
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Erro ao criar conta: " + (authError?.message || "Usuário inválido") }, { status: 400 })
    }

    // 🔐 Usando supabaseAdmin para inserir com Service Role (bypass no RLS)
    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from("clientes")
      .insert({
        id: authData.user.id,
        email,
        nome,
        cnpj: cnpjLimpo,
        telefone,
        empresa_nome: dadosEmpresa.nome,
      })
      .select()
      .single()

    if (clienteError) {
      console.error("Erro ao criar cliente:", clienteError)

      try {
        await supabase.auth.admin.deleteUser(authData.user.id)
        console.log("Usuário deletado após erro de cliente")
      } catch (deleteError) {
        console.error("Erro ao deletar usuário:", deleteError)
      }

      return NextResponse.json(
        { error: `Erro ao criar perfil do cliente: ${clienteError.message}`, details: clienteError.details },
        { status: 500 },
      )
    }

    const { data: empresa, error: empresaError } = await supabaseAdmin
      .from("empresas")
      .insert({
        cnpj: cnpjLimpo,
        cliente_id: cliente.id,
        nome: dadosEmpresa.nome,
        razao_social: dadosEmpresa.razao_social,
        endereco: dadosEmpresa.endereco,
        telefone: dadosEmpresa.telefone_empresa,
        email: dadosEmpresa.email_empresa,
      })
      .select()
      .single()

    if (empresaError) {
      console.error("Erro ao criar empresa:", empresaError)
      return NextResponse.json({ error: "Erro ao criar dados da empresa" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Cadastro realizado com sucesso!",
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        cnpj: cliente.cnpj,
        empresa: dadosEmpresa.nome,
      },
    })
  } catch (error) {
    console.error("Erro geral no cadastro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
