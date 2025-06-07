// Script para testar a API do Escavador sem dependências externas
import axios from "axios"

// Configuração
const ESCAVADOR_TOKEN = process.env.ESCAVADOR_TOKEN || "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiN2ViNGNhNjI1MDExNmYwOGQxZTkwOTNiYTViY2VlN2E1MjdkZWFiMzJiNWE4MTZmZDdjYTUxOTIyODhlMTk0OGQyMTE3ZjU1NzNhYTk5NGQiLCJpYXQiOjE3NDkwODk4OTQuMDM3ODQxLCJuYmYiOjE3NDkwODk4OTQuMDM3ODQyLCJleHAiOjIwNjQ2MjI2OTQuMDM0ODM3LCJzdWIiOiIyNTM3NDA2Iiwic2NvcGVzIjpbImFjZXNzYXJfYXBpX3BhZ2EiXX0.LqG8wBm5Iz-WkatufFsRdRyKmIyw51mtRq9mOmQIPDcLyYK_YPusb-iqkYOyAyrMtkzw2lTEsik9Mao4IXYUdFAJ6MpVB6Z4IZRl6wm4vxlCeLzn2surRmiaT8l0kzp8zjVMAmwYHGOXLSzq4G-UEi-MSRAMmFmOxolXtvU41nVLcN1-aTzNVAUc-HvsV8czhKBkw4HwI8zpgtkkhhoQKYxbqHoU_0uBr1kinlqu9g2dQ9ryDWIr9qDjGp6JTFVJtDENWCsGR_JFTcOmmrbBa0Y-MT8uC5qa6JRP24B6-EeNgsCpQtC3rjt8YpKzsIIzy7SFXCRNX5C7D6xld8pFQzP82eoWMNPlEZLGOiezNNu_6Sb19m3IWGiXOj6mRD6AaAtcAwhpAm47zg-t6HvSbgzaVBBTzEeE59NqBVWXY5r-yrYh8NNTGi0XZeIvDST7YFNRfg5AqjprwHWJJQ06pGsL6efaj25DhDG1Vh7w8SeYT9iypbPt_C6xBBsynBlWL6INLWABvnqzH5DxB6oLYfltxX6NSK6TZW6hrpVoxKGzu5PJoTqjpj62M8gNmntMz_HEuWniilocX6PDDoBvIVwiDEXzFuAfRY6UskqYkjw34bIvrI53PdGLOgFSvlGEG5pEEQAeRTTgT52OlGiqa_1edsz48MZrKiMbQZpW0Zc"
const CNPJ_TESTE = "11222333000181" // CNPJ de teste

async function testarApiEscavador() {
  console.log("🚀 Iniciando teste da API do Escavador...")
  console.log(`📋 CNPJ de teste: ${CNPJ_TESTE}`)
  console.log(`🔑 Token configurado: ${ESCAVADOR_TOKEN ? "Sim" : "Não"}`)

  if (!ESCAVADOR_TOKEN || ESCAVADOR_TOKEN === "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiN2ViNGNhNjI1MDExNmYwOGQxZTkwOTNiYTViY2VlN2E1MjdkZWFiMzJiNWE4MTZmZDdjYTUxOTIyODhlMTk0OGQyMTE3ZjU1NzNhYTk5NGQiLCJpYXQiOjE3NDkwODk4OTQuMDM3ODQxLCJuYmYiOjE3NDkwODk4OTQuMDM3ODQyLCJleHAiOjIwNjQ2MjI2OTQuMDM0ODM3LCJzdWIiOiIyNTM3NDA2Iiwic2NvcGVzIjpbImFjZXNzYXJfYXBpX3BhZ2EiXX0.LqG8wBm5Iz-WkatufFsRdRyKmIyw51mtRq9mOmQIPDcLyYK_YPusb-iqkYOyAyrMtkzw2lTEsik9Mao4IXYUdFAJ6MpVB6Z4IZRl6wm4vxlCeLzn2surRmiaT8l0kzp8zjVMAmwYHGOXLSzq4G-UEi-MSRAMmFmOxolXtvU41nVLcN1-aTzNVAUc-HvsV8czhKBkw4HwI8zpgtkkhhoQKYxbqHoU_0uBr1kinlqu9g2dQ9ryDWIr9qDjGp6JTFVJtDENWCsGR_JFTcOmmrbBa0Y-MT8uC5qa6JRP24B6-EeNgsCpQtC3rjt8YpKzsIIzy7SFXCRNX5C7D6xld8pFQzP82eoWMNPlEZLGOiezNNu_6Sb19m3IWGiXOj6mRD6AaAtcAwhpAm47zg-t6HvSbgzaVBBTzEeE59NqBVWXY5r-yrYh8NNTGi0XZeIvDST7YFNRfg5AqjprwHWJJQ06pGsL6efaj25DhDG1Vh7w8SeYT9iypbPt_C6xBBsynBlWL6INLWABvnqzH5DxB6oLYfltxX6NSK6TZW6hrpVoxKGzu5PJoTqjpj62M8gNmntMz_HEuWniilocX6PDDoBvIVwiDEXzFuAfRY6UskqYkjw34bIvrI53PdGLOgFSvlGEG5pEEQAeRTTgT52OlGiqa_1edsz48MZrKiMbQZpW0Zc") {
    console.error("❌ Token do Escavador não configurado!")
    console.log("💡 Configure a variável ESCAVADOR_TOKEN no ambiente")
    return
  }

  try {
    // Teste 1: Buscar dados da empresa
    console.log("\n📊 Teste 1: Buscando dados da empresa...")

    const empresaResponse = await axios.get(`https://api.escavador.com/api/v1/pessoas/juridica/${CNPJ_TESTE}`, {
      headers: {
        Authorization: `Bearer ${ESCAVADOR_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    })

    console.log(`✅ Status: ${empresaResponse.status}`)
    console.log(`📄 Dados da empresa:`, JSON.stringify(empresaResponse.data, null, 2).substring(0, 500))

    // Teste 2: Buscar processos da empresa
    console.log("\n⚖️ Teste 2: Buscando processos da empresa...")

    const processosResponse = await axios.get(
      `https://api.escavador.com/api/v1/pessoas/juridica/${CNPJ_TESTE}/processos`,
      {
        headers: {
          Authorization: `Bearer ${ESCAVADOR_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
      },
    )

    console.log(`✅ Status: ${processosResponse.status}`)

    const processos =
      processosResponse.data.dados ||
      processosResponse.data.data ||
      processosResponse.data.processos ||
      processosResponse.data

    if (Array.isArray(processos)) {
      console.log(`📈 Total de processos encontrados: ${processos.length}`)

      // Analisar processos trabalhistas
      const palavrasChaveTrabalhista = [
        "TRT",
        "TRABALHISTA",
        "TRABALHO",
        "VARA DO TRABALHO",
        "RECLAMAÇÃO TRABALHISTA",
        "RESCISÃO",
        "FGTS",
        "HORAS EXTRAS",
      ]

      const processosTrabalhistasCount = processos.filter((processo) => {
        const textoCompleto =
          `${processo.area || ""} ${processo.tribunal || ""} ${processo.vara || ""} ${processo.classe || ""} ${processo.assunto || ""}`.toUpperCase()
        return palavrasChaveTrabalhista.some((palavra) => textoCompleto.includes(palavra))
      }).length

      console.log(`⚖️ Processos trabalhistas: ${processosTrabalhistasCount}`)
      console.log(`📊 Percentual trabalhista: ${((processosTrabalhistasCount / processos.length) * 100).toFixed(1)}%`)

      // Mostrar alguns exemplos
      if (processos.length > 0) {
        console.log("\n📋 Exemplos de processos encontrados:")
        processos.slice(0, 3).forEach((processo, index) => {
          console.log(`\n${index + 1}. Número: ${processo.numero || processo.numero_cnj || "N/A"}`)
          console.log(`   Tribunal: ${processo.tribunal || "N/A"}`)
          console.log(`   Vara: ${processo.vara || "N/A"}`)
          console.log(`   Classe: ${processo.classe || "N/A"}`)
          console.log(`   Assunto: ${processo.assunto || "N/A"}`)
          console.log(`   Área: ${processo.area || "N/A"}`)
        })
      }
    } else {
      console.log("⚠️ Resposta não contém array de processos")
      console.log("📄 Estrutura da resposta:", Object.keys(processosResponse.data))
    }

    console.log("\n✅ Teste concluído com sucesso!")
  } catch (error) {
    console.error("\n❌ Erro durante o teste:", error.message)

    if (error.response) {
      console.error(`📊 Status HTTP: ${error.response.status}`)
      console.error(`📄 Dados do erro:`, error.response.data)

      if (error.response.status === 401) {
        console.log("💡 Erro de autenticação - verifique se o token está correto")
      } else if (error.response.status === 403) {
        console.log("💡 Erro de permissão - verifique se o token tem acesso a esta API")
      } else if (error.response.status === 429) {
        console.log("💡 Limite de requisições excedido - aguarde antes de tentar novamente")
      }
    } else if (error.request) {
      console.error("🌐 Erro de rede - não foi possível conectar com a API")
    }
  }
}

// Executar o teste
testarApiEscavador()
