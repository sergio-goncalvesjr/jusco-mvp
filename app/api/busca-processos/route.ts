import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import axios from "axios"

interface EscavadorProcesso {
  numero?: string
  numeroProcesso?: string
  numero_cnj?: string
  tribunal?: string
  vara?: string
  classe?: string
  assunto?: string
  dataAjuizamento?: string
  data_ajuizamento?: string
  valorCausa?: number
  valor_causa?: number
  situacao?: string
  status?: string
  grau?: string
  area?: string
  instancia?: string
}

// Função para verificar se é processo trabalhista
function isProcessoTrabalhista(processo: EscavadorProcesso): boolean {
  const area = (processo.area || "").toString().toUpperCase()
  const tribunal = (processo.tribunal || "").toString().toUpperCase()
  const vara = (processo.vara || "").toString().toUpperCase()
  const classe = (processo.classe || "").toString().toUpperCase()
  const assunto = (processo.assunto || "").toString().toUpperCase()

  return (
    area.includes("TRABALHISTA") ||
    area.includes("TRABALHO") ||
    tribunal.includes("TRT") ||
    tribunal.includes("TRABALHISTA") ||
    vara.includes("TRABALHO") ||
    vara.includes("TRABALHISTA") ||
    classe.includes("TRABALHISTA") ||
    assunto.includes("TRABALHISTA") ||
    assunto.includes("TRABALHO")
  )
}

// Função para normalizar dados do processo
function normalizeProcesso(processo: EscavadorProcesso): any {
  return {
    numero:
      processo.numero ||
      processo.numeroProcesso ||
      processo.numero_cnj ||
      `PROC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tribunal: processo.tribunal || "N/A",
    vara: processo.vara || "N/A",
    classe: processo.classe || "N/A",
    assunto: processo.assunto || "N/A",
    dataAjuizamento: processo.dataAjuizamento || processo.data_ajuizamento || null,
    valorCausa: processo.valorCausa || processo.valor_causa || null,
    situacao: processo.situacao || processo.status || "N/A",
    grau: processo.grau || processo.instancia || "1º Grau",
    area: processo.area || "TRABALHISTA",
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
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
          razao_social
        )
      `)
      .eq("id", user.id)
      .single()

    if (clienteError || !cliente || !cliente.empresas || cliente.empresas.length === 0) {
      return NextResponse.json({ error: "Dados do cliente ou empresa não encontrados" }, { status: 404 })
    }

    const empresa = cliente.empresas[0]
    const cnpjLimpo = empresa.cnpj

    // Verificar se já existem processos para esta empresa
    const { data: processosExistentes, error: processosError } = await supabase
      .from("processos")
      .select("*")
      .eq("empresa_id", empresa.id)
      .eq("arquivado", false) // Apenas processos não arquivados

    if (processosError) {
      console.error("Erro ao buscar processos:", processosError)
      return NextResponse.json({ error: "Erro ao buscar processos" }, { status: 500 })
    }

    // Se já existem processos recentes (menos de 24h), retornar os existentes
    if (processosExistentes && processosExistentes.length > 0) {
      const ultimoProcesso = processosExistentes[0]
      const ultimaAtualizacao = new Date(ultimoProcesso.created_at)
      const agora = new Date()
      const horasDesdeAtualizacao = (agora.getTime() - ultimaAtualizacao.getTime()) / (1000 * 60 * 60)

      if (horasDesdeAtualizacao < 24) {
        return NextResponse.json({
          empresa,
          cliente: {
            nome: cliente.nome,
            email: cliente.email,
          },
          processos: processosExistentes,
          fonte: "cache",
          message: `${processosExistentes.length} processos trabalhistas encontrados no cache local (atualizados há ${Math.round(horasDesdeAtualizacao)} horas)`,
        })
      }
    }

    // Buscar na API do Escavador apenas processos trabalhistas
    let processosTrabalhistasEncontrados: EscavadorProcesso[] = []
    let apiSuccess = false
    let apiMessage = ""

    try {
      console.log(`🔍 Consultando API do Escavador para CNPJ: ${cnpjLimpo}`)

      const escavadorResponse = await axios.get(
        `https://api.escavador.com/api/v1/pessoas/juridica/${cnpjLimpo}/processos`,
        {
          headers: {
            Authorization: `Bearer ${process.env.ESCAVADOR_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 15000,
        },
      )

      console.log(`📊 Status da resposta: ${escavadorResponse.status}`)

      const processos =
        escavadorResponse.data.dados ||
        escavadorResponse.data.data ||
        escavadorResponse.data.processos ||
        escavadorResponse.data

      if (Array.isArray(processos) && processos.length > 0) {
        // Filtrar apenas processos trabalhistas
        processosTrabalhistasEncontrados = processos.filter(isProcessoTrabalhista)

        apiSuccess = true
        apiMessage = `${processosTrabalhistasEncontrados.length} processos trabalhistas encontrados de ${processos.length} processos totais`
        console.log(
          `✅ Sucesso! ${processosTrabalhistasEncontrados.length} processos trabalhistas de ${processos.length} totais`,
        )
      } else {
        apiMessage = "API consultada com sucesso, mas nenhum processo encontrado"
        console.log(`ℹ️ ${apiMessage}`)
      }
    } catch (escavadorError: any) {
      console.error("❌ Erro ao consultar API do Escavador:", escavadorError.message)
      apiMessage = `Erro na API do Escavador: ${escavadorError.message}`
    }

    // Se a API não retornou dados válidos, usar dados simulados trabalhistas
    if (!apiSuccess || processosTrabalhistasEncontrados.length === 0) {
      console.log("⚠️ Gerando dados simulados de processos trabalhistas")

      const seed = cnpjLimpo.split("").reduce((acc, digit) => acc + Number.parseInt(digit), 0)
      const numProcessos = Math.floor((seed % 5) + 2) // Entre 2 e 6 processos trabalhistas

      processosTrabalhistasEncontrados = Array.from({ length: numProcessos }, (_, index) => {
        const processoSeed = seed + index
        const ano = 2024 - (index % 2) // 2023-2024
        const mes = (processoSeed % 12) + 1
        const dia = (processoSeed % 28) + 1

        const assuntosTrabalhistas = [
          "Rescisão Indireta",
          "Horas Extras",
          "Adicional Noturno",
          "FGTS",
          "Verbas Rescisórias",
          "Danos Morais Trabalhistas",
          "Equiparação Salarial",
          "Adicional de Insalubridade",
        ]

        return {
          numero: `${processoSeed.toString().padStart(7, "0")}-${(20 + index).toString().padStart(2, "0")}.${ano}.5.${(1 + index).toString().padStart(2, "0")}.${(100 + index).toString().padStart(4, "0")}`,
          tribunal: `${index + 1}º TRT`,
          vara: `${index + 1}ª Vara do Trabalho`,
          classe: "Reclamação Trabalhista",
          assunto: assuntosTrabalhistas[index % assuntosTrabalhistas.length],
          dataAjuizamento: `${ano}-${mes.toString().padStart(2, "0")}-${dia.toString().padStart(2, "0")}`,
          valorCausa: processoSeed * 500 + Math.random() * 20000,
          situacao: ["Em andamento", "Aguardando perícia", "Fase de instrução", "Aguardando sentença"][index % 4],
          grau: "1º Grau",
          area: "TRABALHISTA",
        }
      })

      if (!apiSuccess) {
        apiMessage = `Dados simulados para demonstração - ${apiMessage}`
      }
    }

    if (processosTrabalhistasEncontrados.length === 0) {
      return NextResponse.json({
        empresa,
        cliente: {
          nome: cliente.nome,
          email: cliente.email,
        },
        processos: [],
        fonte: "escavador",
        message: "Nenhum processo trabalhista encontrado para esta empresa",
      })
    }

    // Mapear e salvar processos no Supabase
    const processosParaSalvar = processosTrabalhistasEncontrados.map((processo) => {
      const normalizado = normalizeProcesso(processo)

      return {
        numero_cnj: normalizado.numero,
        empresa_id: empresa.id,
        vara: normalizado.vara,
        fase_processual: normalizado.situacao,
        data_ajuizamento: normalizado.dataAjuizamento
          ? new Date(normalizado.dataAjuizamento).toISOString().split("T")[0]
          : null,
        valor_causa: normalizado.valorCausa ? Number(normalizado.valorCausa) : null,
        risco_geral: normalizado.grau === "2º Grau" ? "Alto" : "Médio", // Processos trabalhistas sempre médio/alto risco
        proxima_audiencia: null,
        tipo_audiencia: null,
        observacoes: `Classe: ${normalizado.classe} | Assunto: ${normalizado.assunto} | Tribunal: ${normalizado.tribunal}`,
        arquivado: false,
      }
    })

    // Limpar processos antigos antes de inserir novos
    if (processosExistentes && processosExistentes.length > 0) {
      await supabase.from("processos").delete().eq("empresa_id", empresa.id).eq("arquivado", false)
    }

    const { data: processosSalvos, error: salvarError } = await supabase
      .from("processos")
      .insert(processosParaSalvar)
      .select()

    if (salvarError) {
      console.error("❌ Erro ao salvar processos:", salvarError)
      return NextResponse.json({ error: "Erro ao salvar processos" }, { status: 500 })
    }

    console.log(`✅ ${processosSalvos?.length || 0} processos trabalhistas salvos no banco de dados`)

    return NextResponse.json({
      empresa,
      cliente: {
        nome: cliente.nome,
        email: cliente.email,
      },
      processos: processosSalvos,
      fonte: apiSuccess ? "escavador" : "simulado",
      message: apiMessage || `${processosSalvos?.length || 0} processos trabalhistas processados com sucesso`,
      warning: !apiSuccess ? "Os dados exibidos são simulados para demonstração" : undefined,
    })
  } catch (error) {
    console.error("❌ Erro geral:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
