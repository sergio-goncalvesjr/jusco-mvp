// Script para verificar se o sistema está configurado corretamente
console.log("🔍 Verificando configuração do sistema...")

// Verificar variáveis de ambiente essenciais
const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "ESCAVADOR_TOKEN"]

console.log("\n📋 Verificando variáveis de ambiente:")
let allConfigured = true

requiredEnvVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: Configurada`)
    if (varName === "ESCAVADOR_TOKEN") {
      console.log(`   Preview: ${value.substring(0, 50)}...`)
    }
  } else {
    console.log(`❌ ${varName}: NÃO CONFIGURADA`)
    allConfigured = false
  }
})

if (!allConfigured) {
  console.log("\n⚠️ ATENÇÃO: Algumas variáveis de ambiente não estão configuradas!")
  console.log("📝 Crie um arquivo .env.local na raiz do projeto com:")
  console.log("   NEXT_PUBLIC_SUPABASE_URL=https://pyirruqrwtasrdfzlbfx.supabase.co")
  console.log("   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5aXJydXFyd3Rhc3JkZnpsYmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODc4MjYsImV4cCI6MjA2NDY2MzgyNn0.IxR-aIZF3NyiIi-uMQYG8FXKk4uZ3jq-U-SXFV-0hAg")
  console.log("   ESCAVADOR_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiN2ViNGNhNjI1MDExNmYwOGQxZTkwOTNiYTViY2VlN2E1MjdkZWFiMzJiNWE4MTZmZDdjYTUxOTIyODhlMTk0OGQyMTE3ZjU1NzNhYTk5NGQiLCJpYXQiOjE3NDkwODk4OTQuMDM3ODQxLCJuYmYiOjE3NDkwODk4OTQuMDM3ODQyLCJleHAiOjIwNjQ2MjI2OTQuMDM0ODM3LCJzdWIiOiIyNTM3NDA2Iiwic2NvcGVzIjpbImFjZXNzYXJfYXBpX3BhZ2EiXX0.LqG8wBm5Iz-WkatufFsRdRyKmIyw51mtRq9mOmQIPDcLyYK_YPusb-iqkYOyAyrMtkzw2lTEsik9Mao4IXYUdFAJ6MpVB6Z4IZRl6wm4vxlCeLzn2surRmiaT8l0kzp8zjVMAmwYHGOXLSzq4G-UEi-MSRAMmFmOxolXtvU41nVLcN1-aTzNVAUc-HvsV8czhKBkw4HwI8zpgtkkhhoQKYxbqHoU_0uBr1kinlqu9g2dQ9ryDWIr9qDjGp6JTFVJtDENWCsGR_JFTcOmmrbBa0Y-MT8uC5qa6JRP24B6-EeNgsCpQtC3rjt8YpKzsIIzy7SFXCRNX5C7D6xld8pFQzP82eoWMNPlEZLGOiezNNu_6Sb19m3IWGiXOj6mRD6AaAtcAwhpAm47zg-t6HvSbgzaVBBTzEeE59NqBVWXY5r-yrYh8NNTGi0XZeIvDST7YFNRfg5AqjprwHWJJQ06pGsL6efaj25DhDG1Vh7w8SeYT9iypbPt_C6xBBsynBlWL6INLWABvnqzH5DxB6oLYfltxX6NSK6TZW6hrpVoxKGzu5PJoTqjpj62M8gNmntMz_HEuWniilocX6PDDoBvIVwiDEXzFuAfRY6UskqYkjw34bIvrI53PdGLOgFSvlGEG5pEEQAeRTTgT52OlGiqa_1edsz48MZrKiMbQZpW0Zc")
} else {
  console.log("\n✅ Todas as variáveis essenciais estão configuradas!")
}

// Verificar estrutura de arquivos
console.log("\n📁 Verificando estrutura de arquivos:")

const fs = await import("fs")
const path = await import("path")

const criticalFiles = [
  "app/api/auth/cadastro/route.ts",
  "app/api/auth/login/route.ts",
  "app/api/busca-processos/route.ts",
  "app/login/page.tsx",
  "app/cadastro/page.tsx",
  "app/dashboard/page.tsx",
  "lib/supabase/client.ts",
  "lib/supabase/server.ts",
]

criticalFiles.forEach((filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${filePath}`)
    } else {
      console.log(`❌ ${filePath} - ARQUIVO AUSENTE`)
    }
  } catch (error) {
    console.log(`⚠️ ${filePath} - Erro ao verificar: ${error.message}`)
  }
})

console.log("\n🎯 Status do Sistema:")
if (allConfigured) {
  console.log("✅ Sistema pronto para uso!")
  console.log("🚀 Execute 'npm run dev' para iniciar")
  console.log("🌐 Acesse http://localhost:3000")
} else {
  console.log("⚠️ Configure as variáveis de ambiente antes de continuar")
}

console.log("\n📚 Próximos passos:")
console.log("1. Configure as variáveis de ambiente (.env.local)")
console.log("2. Execute os scripts SQL no Supabase")
console.log("3. Teste o cadastro de um cliente")
console.log("4. Verifique a busca de processos trabalhistas")
