-- Criar tabela de clientes (usuários do sistema)
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  empresa_nome VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atualizar tabela empresas para referenciar clientes
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS nome VARCHAR(255);
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS razao_social VARCHAR(255);
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Adicionar coluna para arquivar processos
ALTER TABLE processos ADD COLUMN IF NOT EXISTS arquivado BOOLEAN DEFAULT FALSE;
ALTER TABLE processos ADD COLUMN IF NOT EXISTS data_arquivamento TIMESTAMP WITH TIME ZONE;
ALTER TABLE processos ADD COLUMN IF NOT EXISTS observacoes_arquivamento TEXT;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_cnpj ON clientes(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_cliente_id ON empresas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_processos_arquivado ON processos(arquivado);

-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clientes (cada cliente só vê seus próprios dados)
DROP POLICY IF EXISTS "Clientes podem ver apenas seus próprios dados" ON clientes;
CREATE POLICY "Clientes podem ver apenas seus próprios dados" ON clientes
  FOR ALL USING (auth.uid()::text = id::text);

-- Atualizar políticas para empresas (baseado no cliente)
DROP POLICY IF EXISTS "Allow all operations on empresas" ON empresas;
CREATE POLICY "Empresas por cliente" ON empresas
  FOR ALL USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE auth.uid()::text = id::text
    )
  );

-- Atualizar políticas para processos (baseado no cliente da empresa)
DROP POLICY IF EXISTS "Allow all operations on processos" ON processos;
CREATE POLICY "Processos por cliente" ON processos
  FOR ALL USING (
    empresa_id IN (
      SELECT e.id FROM empresas e 
      JOIN clientes c ON e.cliente_id = c.id 
      WHERE auth.uid()::text = c.id::text
    )
  );

-- Atualizar políticas para estatísticas
DROP POLICY IF EXISTS "Allow all operations on estatisticas_processos" ON estatisticas_processos;
CREATE POLICY "Estatisticas por cliente" ON estatisticas_processos
  FOR ALL USING (
    empresa_id IN (
      SELECT e.id FROM empresas e 
      JOIN clientes c ON e.cliente_id = c.id 
      WHERE auth.uid()::text = c.id::text
    )
  );
