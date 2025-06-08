-- Remover políticas existentes que estão causando problemas
DROP POLICY IF EXISTS "Clientes podem ver apenas seus próprios dados" ON clientes;
DROP POLICY IF EXISTS "Empresas por cliente" ON empresas;
DROP POLICY IF EXISTS "Processos por cliente" ON processos;
DROP POLICY IF EXISTS "Estatisticas por cliente" ON estatisticas_processos;

-- Criar políticas mais flexíveis para clientes
-- Permitir inserção durante cadastro (sem autenticação) e leitura/atualização para o próprio usuário
CREATE POLICY "Permitir inserção de clientes" ON clientes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Clientes podem ver e atualizar seus próprios dados" ON clientes
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Clientes podem atualizar seus próprios dados" ON clientes
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para empresas - permitir operações mais flexíveis
CREATE POLICY "Permitir todas operações em empresas" ON empresas
  FOR ALL USING (true) WITH CHECK (true);

-- Políticas para processos - permitir operações mais flexíveis
CREATE POLICY "Permitir todas operações em processos" ON processos
  FOR ALL USING (true) WITH CHECK (true);

-- Políticas para estatísticas - permitir operações mais flexíveis
CREATE POLICY "Permitir todas operações em estatisticas" ON estatisticas_processos
  FOR ALL USING (true) WITH CHECK (true);

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('clientes', 'empresas', 'processos', 'estatisticas_processos')
ORDER BY tablename, policyname;
