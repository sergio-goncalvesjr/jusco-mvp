import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface ArquivarData {
  processo_id: number
  observacoes?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ArquivarData = await request.json()
    const { processo_id, observacoes } = body

    if (!processo_id) {
      return NextResponse.json({ error: "ID do processo é obrigatório" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    // Verificar se o processo pertence ao cliente
    const { data: processo, error: processoError } = await supabase
      .from("processos")
      .select(`
        *,
        empresas!inner (
          clientes!inner (
            id
          )
        )
      `)
      .eq("id", processo_id)
      .eq("empresas.clientes.id", user.id)
      .single()

    if (processoError || !processo) {
      return NextResponse.json({ error: "Processo não encontrado ou sem permissão" }, { status: 404 })
    }

    if (processo.arquivado) {
      return NextResponse.json({ error: "Processo já está arquivado" }, { status: 400 })
    }

    // Arquivar o processo
    const { data: processoArquivado, error: arquivarError } = await supabase
      .from("processos")
      .update({
        arquivado: true,
        data_arquivamento: new Date().toISOString(),
        observacoes_arquivamento: observacoes || "Processo arquivado pelo cliente",
      })
      .eq("id", processo_id)
      .select()
      .single()

    if (arquivarError) {
      console.error("Erro ao arquivar processo:", arquivarError)
      return NextResponse.json({ error: "Erro ao arquivar processo" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Processo arquivado com sucesso",
      processo: processoArquivado,
    })
  } catch (error) {
    console.error("Erro geral ao arquivar processo:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
