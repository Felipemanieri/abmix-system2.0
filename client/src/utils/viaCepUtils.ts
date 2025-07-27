import { getMockCepData } from './mockCepData';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface EnderecoFields {
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  enderecoCompleto?: string;
}

/**
 * Busca dados do CEP na API ViaCEP e retorna as informações do endereço
 * @param cep - CEP a ser consultado (com ou sem máscara)
 * @returns Promise com os dados do endereço ou null se não encontrado
 */
export const buscarCEP = async (cep: string): Promise<EnderecoFields | null> => {
  // Remove caracteres não numéricos
  const cepLimpo = cep.replace(/\D/g, '');
  
  // Verifica se o CEP tem 8 dígitos
  if (cepLimpo.length !== 8) {
    return null;
  }
  
  try {
    console.log('Buscando CEP:', cepLimpo);
    
    // Timeout para evitar travamentos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn('CEP não encontrado ou erro na API');
      return null;
    }
    
    const data: ViaCepResponse = await response.json();
    
    // Verifica se houve erro na consulta
    if (data.erro) {
      console.warn('CEP não encontrado:', cepLimpo);
      return null;
    }
    
    // Monta o endereço completo
    const enderecoCompleto = [
      data.logradouro,
      data.bairro,
      data.localidade,
      data.uf
    ].filter(Boolean).join(', ');
    
    console.log('CEP encontrado:', enderecoCompleto);
    
    return {
      endereco: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || '',
      enderecoCompleto: enderecoCompleto
    };
    
  } catch (error) {
    // Não exibe erro para timeout ou abortar - é normal durante digitação
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Busca CEP cancelada (normal durante digitação)');
      return null;
    }
    
    console.log('API ViaCEP indisponível, tentando dados locais para CEP:', cepLimpo);
    
    // Fallback para dados locais quando API não funciona
    const mockData = getMockCepData(cepLimpo);
    
    if (mockData) {
      const enderecoCompleto = `${mockData.logradouro}, ${mockData.bairro}, ${mockData.localidade}, ${mockData.uf}`;
      
      console.log('CEP encontrado nos dados locais:', enderecoCompleto);
      
      return {
        endereco: mockData.logradouro,
        bairro: mockData.bairro,
        cidade: mockData.localidade,
        estado: mockData.uf,
        enderecoCompleto: enderecoCompleto
      };
    }
    
    console.log('CEP não encontrado nem na API nem nos dados locais');
    return null;
  }
};

/**
 * Formata CEP com máscara (00000-000)
 * @param cep - CEP sem formatação
 * @returns CEP formatado
 */
export const formatarCEP = (cep: string): string => {
  const cepLimpo = cep.replace(/\D/g, '');
  
  if (cepLimpo.length <= 5) {
    return cepLimpo;
  }
  
  return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5, 8)}`;
};

/**
 * Função auxiliar para criar handler de busca de CEP que não gera erro
 * @param updateFunction - Função para atualizar os campos do formulário
 * @param showNotification - Função para mostrar notificações (opcional)
 * @returns Handler para onBlur do campo CEP
 */
export const createCepHandler = (
  updateFunction: (field: string, value: string) => void,
  showNotification?: (message: string, type: 'success' | 'error' | 'warning') => void
) => {
  return async (cep: string) => {
    // Só busca se o CEP tem 8 dígitos
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      return; // Não faz nada se CEP incompleto
    }

    try {
      const endereco = await buscarCEP(cep);
      
      if (endereco && endereco.enderecoCompleto) {
        // Atualiza os campos com os dados encontrados
        updateFunction('enderecoCompleto', endereco.enderecoCompleto);
        
        // Se houver campos separados, também atualiza
        if (endereco.endereco) {
          updateFunction('endereco', endereco.endereco);
        }
        if (endereco.bairro) {
          updateFunction('bairro', endereco.bairro);
        }
        if (endereco.cidade) {
          updateFunction('cidade', endereco.cidade);
        }
        if (endereco.estado) {
          updateFunction('estado', endereco.estado);
        }
        
        // Mostra notificação de sucesso se disponível
        if (showNotification) {
          showNotification('CEP encontrado! Endereço preenchido automaticamente.', 'success');
        }
      } else {
        // Mostra aviso se CEP não encontrado
        if (showNotification) {
          showNotification('CEP não encontrado. Preencha o endereço manualmente.', 'warning');
        }
      }
    } catch (error) {
      // Em caso de erro, não faz nada - falha silenciosa
      console.log('Busca CEP falhou silenciosamente:', error);
    }
  };
};