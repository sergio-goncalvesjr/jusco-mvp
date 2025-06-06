import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cnpj = searchParams.get("cnpj") || "11222333000181" // CNPJ de teste

    console.log(`Testando API do Escavador com CNPJ: ${cnpj}`)

    const endpoints = [
      `https://api.escavador.com/api/v1/lawsuits/search?cnpj=${cnpj}`,
      `https://api.escavador.com/api/v2/processos?cnpj=${cnpj}`,
      `https://api.escavador.com/v1/processos/buscar?cnpj=${cnpj}`,
    ]

    const results = []

    for (const endpoint of endpoints) {
      try {
        console.log(`Testando endpoint: ${endpoint}`)

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.ESCAVADOR_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000,
        })

        const responseText = await response.text()

        results.push({
          endpoint,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText.substring(0, 1000), // Primeiros 1000 caracteres
          success: response.ok,
        })

        if (response.ok) {
          console.log(`✅ Endpoint funcionando: ${endpoint}`)
        } else {
          console.log(`❌ Endpoint com erro: ${endpoint} - Status: ${response.status}`)
        }
      } catch (error) {
        console.error(`Erro no endpoint ${endpoint}:`, error)
        results.push({
          endpoint,
          error: error instanceof Error ? error.message : "Erro desconhecido",
          success: false,
        })
      }
    }

    return NextResponse.json({
      message: "Teste da API do Escavador concluído",
      token_configured: !!process.env.ESCAVADOR_TOKEN,
      token_preview: process.env.ESCAVADOR_TOKEN
        ? `${process.env.ESCAVADOR_TOKEN.substring(0, 50)}...`
        : "Não configurado",
      cnpj_testado: cnpj,
      results,
    })
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
