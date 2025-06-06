export interface Empresa {
  id: number
  cnpj: string
  created_at: string
}

export interface Processo {
  id: number
  numero_cnj: string
  empresa_id: number
  vara: string | null
  fase_processual: string | null
  data_ajuizamento: string | null
  valor_causa: number | null
  risco_geral: string | null
  proxima_audiencia: string | null
  tipo_audiencia: string | null
  observacoes: string | null
  created_at: string
}

export interface ProcessoCompleto extends Processo {
  empresa: Empresa
}
