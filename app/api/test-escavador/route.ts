import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cnpj = searchParams.get("cnpj") || "11222333000181" // CNPJ de teste

    console.log(`Testando API do Escavador com CNPJ: ${cnpj}`)

    const cnpjLimpo = cnpj.replace(/[^\d]/g, "")

    // Endpoint real da API do Escavador
    const endpoint = `https://api.escavador.com/api/v1/pessoas/juridica/${cnpjLimpo}/processos`

    try {
      console.log(`🌐 Testando endpoint: ${endpoint}`)

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${process.env.ESCAVADOR_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000,
      })

      console.log(`✅ Endpoint funcionando: ${endpoint}`)
      console.log(`📊 Status: ${response.status}`)
      console.log(`📄 Dados recebidos:`, JSON.stringify(response.data).substring(0, 500))

      // Extrair informações úteis da resposta
      const dados = response.data.dados || response.data.data || response.data.processos || response.data
      const totalProcessos = Array.isArray(dados) ? dados.length : response.data.total || response.data.count || 0

      return NextResponse.json({
        message: "Teste da API do Escavador concluído com sucesso",
        token_configured: !!process.env.ESCAVADOR_TOKEN,
        token_preview: process.env.ESCAVADOR_TOKEN
          ? `${process.env.ESCAVADOR_TOKEN.substring(0, 50)}...`
          : "Não configurado",
        cnpj_testado: cnpjLimpo,
        endpoint_testado: endpoint,
        resultado: {
          success: true,
          status: response.status,
          statusText: response.statusText,
          total_processos_encontrados: totalProcessos,
          estrutura_resposta: Object.keys(response.data),
          amostra_dados: JSON.stringify(response.data).substring(0, 1000),
        },
      })
    } catch (error: any) {
      console.error(`❌ Erro no endpoint ${endpoint}:`, error.message)

      let errorDetails = {
        success: false,
        endpoint: endpoint,
        error_message: error.message,
        error_type: "unknown",
      }

      if (error.response) {
        errorDetails = {
          ...errorDetails,
          error_type: "api_error",
          status: error.response.status,
          statusText: error.response.statusText,
          response_data: JSON.stringify(error.response.data).substring(0, 500),
        }
        console.error(`❌ Status: ${error.response.status}`)
        console.error(`❌ Dados do erro:`, error.response.data)
      } else if (error.request) {
        errorDetails = {
          ...errorDetails,
          error_type: "network_error",
          details: "Não foi possível conectar com a API",
        }
      }

      return NextResponse.json({
        message: "Teste da API do Escavador falhou",
        token_configured: !!process.env.ESCAVADOR_TOKEN,
        token_preview: process.env.ESCAVADOR_TOKEN
          ? `${process.env.ESCAVADOR_TOKEN.substring(0, 50)}...`
          : "Não configurado",
        cnpj_testado: cnpjLimpo,
        endpoint_testado: endpoint,
        resultado: errorDetails,
      })
    }
  } catch (error) {
    console.error("Erro geral no teste:", error)
    return NextResponse.json(
      {
        error: "Erro ao testar API do Escavador",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
