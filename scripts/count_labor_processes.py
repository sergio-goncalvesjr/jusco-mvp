# -*- coding: utf-8 -*-
"""
Script para contar processos trabalhistas para um CNPJ usando a API V2 do Escavador.

Este script foca em:
1. Buscar todos os processos associados a um CNPJ.
2. Filtrar e contar apenas os processos cuja área seja identificada como "TRABALHISTA".

Requer a biblioteca 'escavador' e uma chave de API configurada via .env.
"""

import escavador
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente (para a chave da API)
load_dotenv()

# Configura a chave da API do Escavador
api_key = os.getenv("ESCAVADOR_TOKEN", "SUA_API_KEY_AQUI")

if api_key == "SUA_API_KEY_AQUI" or not api_key:
    print("AVISO: Chave da API do Escavador não configurada.")
    print("Por favor, defina a variável de ambiente ESCAVADOR_TOKEN ou substitua 'SUA_API_KEY_AQUI' no script.")
    # Tenta configurar com string vazia, mas chamadas à API provavelmente falharão.
    try:
        escavador.config("")
    except Exception as e:
        print(f"Erro durante configuração inicial (chave ausente?): {e}")
else:
    try:
        escavador.config(api_key)
        print("Chave da API do Escavador configurada com sucesso.")
    except Exception as e:
        print(f"Erro ao configurar a chave da API do Escavador: {e}")
        exit()

# Importa módulos necessários do Escavador após tentativa de configuração
try:
    from escavador.v2 import Processo
    from escavador.exceptions import ApiKeyNotFoundException, InvalidParamsException, RateLimitExceededException, EscavadorException
except ImportError:
    print("Erro: Não foi possível importar módulos do Escavador. Verifique se a biblioteca está instalada.")
    exit()
except Exception as e:
    print(f"Erro inesperado durante a importação: {e}")
    exit()

def get_attribute_safe(obj, attr_path, default=None):
    """Obtém um atributo aninhado ou item de forma segura."""
    try:
        value = obj
        # Divide o caminho por '.' para acessar atributos aninhados
        keys = attr_path.split('.')
        for key in keys:
            if isinstance(value, dict):
                # Se for dicionário, usa get()
                value = value.get(key)
            elif isinstance(value, list) and key.isdigit():
                # Se for lista e a chave for um índice numérico
                try:
                    value = value[int(key)]
                except IndexError:
                    return default
            else:
                # Senão, tenta getattr()
                value = getattr(value, key, None)
            
            # Se em qualquer ponto o valor for None, retorna o padrão
            if value is None:
                return default
        return value
    except AttributeError:
        # Se getattr() falhar
        return default
    except Exception:
        # Outros erros inesperados
        return default

def count_labor_processes_for_cnpj(cnpj: str):
    """
    Busca processos para um CNPJ e conta quantos são da área Trabalhista.

    Args:
        cnpj: O número do CNPJ da empresa.

    Returns:
        Uma tupla (total_processes, labor_processes_count) ou None em caso de erro.
    """
    all_processes_data = []
    labor_processes_count = 0
    total_processes = 0
    
    try:
        print(f"Buscando processos para o CNPJ: {cnpj}...")
        envolvido, processos_pagina = Processo.por_cnpj(cnpj=cnpj)
        
        if not envolvido:
            print(f"Nenhuma parte encontrada para o CNPJ: {cnpj}")
            return 0, 0 # Retorna 0 processos totais e 0 trabalhistas

        company_name = get_attribute_safe(envolvido, 'nome', 'N/A')
        print(f"Processos encontrados para a empresa: {company_name}")

        page_count = 0
        while processos_pagina:
            page_count += 1
            current_page_data = get_attribute_safe(processos_pagina, 'data', [])
            
            if not current_page_data:
                print(f"Nenhum dado de processo encontrado na página {page_count}.")
                if not processos_pagina.tem_mais_paginas():
                    break
                else:
                    print("Página atual vazia, tentando buscar a próxima...")
                    processos_pagina = processos_pagina.continuar_busca()
                    continue
            
            print(f"Processando página {page_count} com {len(current_page_data)} processos...")
            all_processes_data.extend(current_page_data)
            total_processes += len(current_page_data)

            # Filtra e conta processos trabalhistas na página atual
            for processo_data in current_page_data:
                # A área do processo parece estar dentro da lista 'fontes'
                # Vamos verificar a área na primeira fonte listada (fontes[0])
                area = get_attribute_safe(processo_data, 'fontes.0.area', default='Desconhecida')
                
                # Verifica se a área é 'Trabalhista' (ignorando maiúsculas/minúsculas)
                if area and isinstance(area, str) and area.strip().upper() == 'TRABALHISTA':
                    labor_processes_count += 1
                    # print(f"  -> Encontrado processo trabalhista: {get_attribute_safe(processo_data, 'numero_cnj', 'N/A')}") # Descomente para depurar

            # Busca a próxima página, se houver
            if processos_pagina.tem_mais_paginas():
                print("Buscando próxima página...")
                processos_pagina = processos_pagina.continuar_busca()
            else:
                print("Não há mais páginas.")
                processos_pagina = None # Termina o loop

        print(f"\nBusca concluída para {company_name}.")
        print(f"Total de processos encontrados: {total_processes}")
        print(f"Número de processos da área TRABALHISTA: {labor_processes_count}")
        
        return total_processes, labor_processes_count

    except ApiKeyNotFoundException:
        print("Erro: Chave da API do Escavador não encontrada ou inválida.")
        return None
    except InvalidParamsException as e:
        print(f"Erro: Parâmetros inválidos para o CNPJ {cnpj} - {e}")
        return None
    except RateLimitExceededException:
        print("Erro: Limite de requisições da API excedido. Tente novamente mais tarde.")
        return None
    except EscavadorException as e:
        print(f"Erro da API do Escavador ao buscar processos para o CNPJ {cnpj}: {e}")
        if "não encontrado" in str(e).lower():
            print(f"Nenhum processo encontrado para o CNPJ {cnpj}.")
            return 0, 0
        return None
    except Exception as e:
        print(f"Erro inesperado ao buscar processos para o CNPJ {cnpj}: {e}")
        import traceback
        traceback.print_exc()
        return None

# Função para ser chamada pela API
def get_labor_processes_count(cnpj):
    """
    Função para ser chamada pela API para contar processos trabalhistas.
    
    Args:
        cnpj: O número do CNPJ da empresa.
        
    Returns:
        Um dicionário com os resultados da contagem.
    """
    # Limpa o CNPJ para ter apenas números
    cnpj_limpo = ''.join(filter(str.isdigit, cnpj))
    
    result = count_labor_processes_for_cnpj(cnpj_limpo)
    
    if result is None:
        return {
            "error": True,
            "message": "Erro ao processar a contagem de processos trabalhistas",
            "total_processos": 0,
            "processos_trabalhistas": 0
        }
    
    total_count, labor_count = result
    
    return {
        "error": False,
        "cnpj": cnpj,
        "total_processos": total_count,
        "processos_trabalhistas": labor_count,
        "percentual_trabalhista": (labor_count / total_count * 100) if total_count > 0 else 0
    }

# --- Bloco Principal de Execução ---
if __name__ == "__main__":
    # IMPORTANTE: Substitua pelo CNPJ que você deseja testar.
    # Use um CNPJ válido para o qual você tenha permissão ou que seja público.
    target_cnpj_example = "00.000.000/0000-00" # CNPJ EXEMPLO - SUBSTITUA!

    print(f"\nIniciando contagem de processos trabalhistas para o CNPJ: {target_cnpj_example}")
    
    if api_key == "SUA_API_KEY_AQUI" or not api_key:
        print("\nExecução interrompida: Chave da API não configurada.")
    else:
        result = count_labor_processes_for_cnpj(target_cnpj_example)

        if result is not None:
            total_count, labor_count = result
            print("\n--- Resultado Final ---")
            print(f"CNPJ Testado: {target_cnpj_example}")
            print(f"Total de Processos Encontrados na API: {total_count}")
            print(f"Número de Processos Identificados como TRABALHISTA: {labor_count}")
        else:
            print(f"\nFalha ao buscar ou processar dados para o CNPJ {target_cnpj_example}. Verifique as mensagens de erro acima.")
