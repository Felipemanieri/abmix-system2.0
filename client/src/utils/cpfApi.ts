// Utility para consulta de CPF via API
export interface CPFApiResponse {
  resultado: string;
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
  [key: string]: any; // Para outros campos que possam vir no response
}

export const consultarCPF = async (cpf: string): Promise<CPFApiResponse | null> => {
  try {
    // Limpar formatação do CPF (remover pontos e hífen)
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    
    // Validar se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
      return null;
    }

    const response = await fetch(`https://patronhost.online/apis/cpf.php?cpf=${cpfLimpo}`);
    
    if (!response.ok) {
      console.log('Erro na consulta CPF:', response.status);
      return null;
    }

    const data: CPFApiResponse = await response.json();
    
    if (data.resultado === 'success') {
      return data;
    }
    
    return null;
  } catch (error) {
    console.log('Erro ao consultar CPF:', error);
    return null;
  }
};

export const formatarTelefone = (ddd?: string, numero?: string): string => {
  if (!ddd || !numero) return '';
  return `(${ddd}) ${numero}`;
};

export const formatarEndereco = (data: CPFApiResponse): string => {
  const partes = [];
  
  if (data.logradouro) partes.push(data.logradouro);
  if (data.numero) partes.push(data.numero);
  if (data.complemento) partes.push(data.complemento);
  if (data.bairro) partes.push(data.bairro);
  if (data.municipio_residencia) partes.push(data.municipio_residencia);
  if (data.pais_residencia) partes.push(data.pais_residencia);
  
  return partes.join(', ');
};