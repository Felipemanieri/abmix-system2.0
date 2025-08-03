// Utility para consulta de CPF via API
export interface CPFApiResponse {
  status: boolean;
  resultado: string;
  mensagem: string;
  dados?: {
    nome?: string;
    nome_social?: string;
    mae?: string;
    sexo?: string;
    data_nascimento?: string;
    logradouro?: string;
    complemento?: string;
    numero?: string;
    bairro?: string;
    cep?: string;
    municipio_residencia?: string;
    pais_residencia?: string;
    telefone_ddd?: string;
    telefone_numero?: string;
    [key: string]: any;
  };
}

// Função para formatar CPF automaticamente (000.000.000-00)
export const formatarCPF = (cpf: string): string => {
  // Remove tudo que não é dígito
  const limpo = cpf.replace(/\D/g, '');
  
  // Aplica formatação enquanto digita
  if (limpo.length <= 3) return limpo;
  if (limpo.length <= 6) return `${limpo.slice(0, 3)}.${limpo.slice(3)}`;
  if (limpo.length <= 9) return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6)}`;
  return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
};

export const consultarCPF = async (cpf: string): Promise<CPFApiResponse | null> => {
  try {
    // Limpar formatação do CPF (remover pontos e hífen)
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    
    // Validar se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
      console.log('CPF deve ter 11 dígitos:', cpfLimpo.length);
      return null;
    }

    console.log('Consultando CPF via backend:', cpfLimpo);
    const url = `/api/cpf/${cpfLimpo}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log('Erro HTTP na consulta CPF:', response.status);
      return null;
    }

    const responseText = await response.text();
    console.log('Resposta bruta da API CPF:', responseText);
    
    let data: CPFApiResponse;
    try {
      data = JSON.parse(responseText);
      console.log('Resposta parseada da API CPF:', data);
    } catch (parseError) {
      console.log('Erro ao fazer parse do JSON:', parseError);
      console.log('Conteúdo recebido:', responseText);
      return null;
    }
    
    if (data.status && data.resultado === 'success' && data.dados) {
      console.log('CPF encontrado com sucesso:', data.dados.nome);
      return data;
    } else {
      console.log('CPF não encontrado ou erro:', data.resultado);
      return null;
    }
    
  } catch (error) {
    console.log('Erro ao consultar CPF:', error);
    return null;
  }
};

export const formatarTelefone = (ddd?: string, numero?: string): string => {
  if (!ddd || !numero) return '';
  // Remove caracteres não numéricos do número
  const numeroLimpo = numero.replace(/\D/g, '');
  // Formatar número dependendo do tamanho
  if (numeroLimpo.length === 9) {
    return `(${ddd}) ${numeroLimpo.slice(0, 5)}-${numeroLimpo.slice(5)}`;
  } else if (numeroLimpo.length === 8) {
    return `(${ddd}) ${numeroLimpo.slice(0, 4)}-${numeroLimpo.slice(4)}`;
  }
  return `(${ddd}) ${numero}`;
};

export const formatarEndereco = (data: CPFApiResponse): string => {
  if (!data.dados) return '';
  
  const partes = [];
  const d = data.dados;
  
  // Montar endereço: Tipo Logradouro + Logradouro + Número + Complemento, Bairro, Cidade
  if (d.tipo_logradouro && d.logradouro) {
    partes.push(`${d.tipo_logradouro} ${d.logradouro}`);
  } else if (d.logradouro) {
    partes.push(d.logradouro);
  }
  
  if (d.numero) partes.push(d.numero);
  if (d.complemento && d.complemento !== '---') partes.push(d.complemento);
  if (d.bairro) partes.push(d.bairro);
  if (d.municipio_residencia) partes.push(d.municipio_residencia);
  
  return partes.join(', ');
};