# Sistema de Processos Trabalhistas

Sistema para consulta e gestão de processos trabalhistas integrado com a API do Escavador e Supabase.

## 🚀 Funcionalidades

- **Autenticação de Clientes**: Cada cliente cadastra apenas 1 CNPJ
- **Importação Automática**: Dados da empresa via API do Escavador
- **Processos Trabalhistas**: Foco apenas em processos da área trabalhista
- **Arquivamento**: Opção de arquivar processos resolvidos
- **Dashboard Personalizado**: Interface dedicada para cada cliente
- **Segurança**: Isolamento de dados por cliente (RLS)

## 📋 Pré-requisitos

- Node.js 18.18 ou superior
- Conta no Supabase
- Token da API do Escavador

## 🛠️ Instalação

1. **Clone o repositório**
\`\`\`bash
git clone <url-do-repositorio>
cd sistema-processos
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
\`\`\`

3. **Configure as variáveis de ambiente**
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edite o arquivo `.env.local` com suas configurações:
- `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `ESCAVADOR_TOKEN`: Token da API do Escavador

4. **Configure o banco de dados**

Execute os scripts SQL na seguinte ordem no Supabase:
\`\`\`sql
-- 1. Criar tabelas básicas
scripts/create-tables-fixed.sql

-- 2. Criar tabelas de autenticação
scripts/create-auth-tables.sql

-- 3. Criar tabela de estatísticas
scripts/create-estatisticas-table.sql
\`\`\`

5. **Teste a API do Escavador**
\`\`\`bash
npm run dev
# Em outro terminal:
node scripts/test-escavador-api.js
\`\`\`

6. **Execute o projeto**
\`\`\`bash
npm run dev
\`\`\`

Acesse `http://localhost:3000` e será redirecionado para `/login`.

## 📱 Como Usar

### 1. Cadastro
1. Acesse `/cadastro`
2. Preencha seus dados e o CNPJ da empresa
3. O sistema importará automaticamente os dados da empresa
4. Conta criada com sucesso

### 2. Login
1. Acesse `/login`
2. Use email e senha cadastrados
3. Redirecionamento automático para o dashboard

### 3. Dashboard
1. Visualize dados da sua empresa
2. Consulte processos trabalhistas ativos
3. Arquive processos que foram resolvidos
4. Atualize dados quando necessário

## 🔧 Estrutura do Projeto

\`\`\`
├── app/
│   ├── api/                    # APIs do Next.js
│   │   ├── auth/              # Autenticação
│   │   ├── busca-processos/   # Busca de processos
│   │   └── processos/         # Gestão de processos
│   ├── cadastro/              # Página de cadastro
│   ├── login/                 # Página de login
│   ├── dashboard/             # Dashboard principal
│   └── layout.tsx             # Layout principal
├── components/ui/             # Componentes da interface
├── lib/                       # Utilitários e configurações
│   ├── supabase/             # Cliente Supabase
│   └── types.ts              # Tipos TypeScript
└── scripts/                  # Scripts de banco e testes
\`\`\`

## 🔒 Segurança

- **RLS (Row Level Security)**: Cada cliente acessa apenas seus dados
- **Autenticação JWT**: Tokens seguros para sessões
- **Validação de CNPJ**: Apenas um CNPJ por cliente
- **Isolamento de Dados**: Políticas de segurança no banco

## 🧪 Testes

Para testar a integração com a API do Escavador:

\`\`\`bash
node scripts/test-escavador-api.js
\`\`\`

## 📊 API Endpoints

- `POST /api/auth/cadastro` - Cadastro de cliente
- `POST /api/auth/login` - Login
- `GET /api/busca-processos` - Buscar processos trabalhistas
- `GET /api/processos-trabalhistas` - Estatísticas de processos
- `POST /api/processos/arquivar` - Arquivar processo

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
