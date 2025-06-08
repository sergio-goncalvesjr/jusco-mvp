/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suprimir avisos sobre variáveis de ambiente do npm
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Configurações de build
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // Configurações de imagem (se necessário)
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  
  // Configurações de webpack para suprimir avisos
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Suprimir avisos sobre módulos não encontrados no cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  
  // Configurações para ignorar erros durante builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
