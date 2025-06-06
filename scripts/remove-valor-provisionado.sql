-- Script para remover a coluna valor_provisionado da tabela processos
ALTER TABLE processos DROP COLUMN IF EXISTS valor_provisionado;

-- Verificar a estrutura da tabela após a remoção
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'processos' 
ORDER BY ordinal_position;
