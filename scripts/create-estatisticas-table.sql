-- Criar tabela para estatísticas de processos
CREATE TABLE IF NOT EXISTS estatisticas_processos (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  total_processos INTEGER NOT NULL DEFAULT 0,
  processos_trabalhistas INTEGER NOT NULL DEFAULT 0,
  percentual_trabalhista DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_estatisticas_empresa_id ON estatisticas_processos(empresa_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE estatisticas_processos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para permitir leitura/escrita
CREATE POLICY "Allow all operations on estatisticas_processos" ON estatisticas_processos
  FOR ALL USING (true) WITH CHECK (true);
