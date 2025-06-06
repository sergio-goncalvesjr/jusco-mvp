-- Script para corrigir colunas que devem permitir NULL
-- Execute este script se você já criou as tabelas anteriormente

-- Remover a coluna valor_provisionado se existir
ALTER TABLE processos DROP COLUMN IF EXISTS valor_provisionado;

-- Alterar outras colunas que devem ser opcionais
ALTER TABLE processos ALTER COLUMN vara DROP NOT NULL;
ALTER TABLE processos ALTER COLUMN fase_processual DROP NOT NULL;
ALTER TABLE processos ALTER COLUMN data_ajuizamento DROP NOT NULL;
ALTER TABLE processos ALTER COLUMN valor_causa DROP NOT NULL;
ALTER TABLE processos ALTER COLUMN risco_geral DROP NOT NULL;
ALTER TABLE processos ALTER COLUMN proxima_audiencia DROP NOT NULL;
ALTER TABLE processos ALTER COLUMN tipo_audiencia DROP NOT NULL;
ALTER TABLE processos ALTER COLUMN observacoes DROP NOT NULL;

-- Verificar a estrutura da tabela
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'processos' 
ORDER BY ordinal_position;
