-- Criar tabela empresas
CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela processos com colunas opcionais
CREATE TABLE IF NOT EXISTS processos (
  id SERIAL PRIMARY KEY,
  numero_cnj VARCHAR(25) NOT NULL,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  vara TEXT,
  fase_processual TEXT,
  data_ajuizamento DATE,
  valor_causa DECIMAL(15,2),
  risco_geral TEXT,
  proxima_audiencia DATE,
  tipo_audiencia TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX IF NOT EXISTS idx_processos_empresa_id ON processos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_processos_numero_cnj ON processos(numero_cnj);

-- Habilitar RLS (Row Level Security)
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para permitir leitura/escrita
CREATE POLICY "Allow all operations on empresas" ON empresas
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on processos" ON processos
  FOR ALL USING (true) WITH CHECK (true);
