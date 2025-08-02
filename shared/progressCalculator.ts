// Sistema de cálculo de progresso baseado no preenchimento de campos obrigatórios

export interface PersonData {
  id: string;
  nomeCompleto: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  parentesco?: string;
  nomeMae: string;
  sexo: 'masculino' | 'feminino' | '';
  estadoCivil: string;
  peso: string;
  altura: string;
  emailPessoal: string;
  telefonePessoal: string;
  emailEmpresa: string;
  telefoneEmpresa: string;
  cep: string;
  enderecoCompleto: string;
  dadosReembolso: string;
}

export interface ProposalData {
  titulares: PersonData[];
  dependentes: PersonData[];
  clientAttachments?: any[];
  clientCompleted?: boolean;
}

// Campos obrigatórios para titular
const REQUIRED_TITULAR_FIELDS = [
  'nomeCompleto',
  'cpf',
  'rg', 
  'dataNascimento',
  'nomeMae',
  'sexo',
  'estadoCivil',
  'emailPessoal',
  'telefonePessoal',
  'cep',
  'enderecoCompleto',
  'dadosReembolso'
];

// Campos obrigatórios para dependente (inclui parentesco)
const REQUIRED_DEPENDENTE_FIELDS = [
  'nomeCompleto',
  'cpf',
  'rg',
  'dataNascimento', 
  'parentesco',
  'nomeMae',
  'sexo',
  'estadoCivil',
  'emailPessoal',
  'telefonePessoal',
  'cep',
  'enderecoCompleto',
  'dadosReembolso'
];

/**
 * Calcula a porcentagem de campos preenchidos para uma pessoa
 */
export function calculatePersonProgress(person: PersonData, isTitular: boolean = true): number {
  const requiredFields = isTitular ? REQUIRED_TITULAR_FIELDS : REQUIRED_DEPENDENTE_FIELDS;
  
  let filledFields = 0;
  
  for (const field of requiredFields) {
    const value = person[field as keyof PersonData];
    if (value && value.toString().trim() !== '') {
      filledFields++;
    }
  }
  
  return Math.round((filledFields / requiredFields.length) * 100);
}

/**
 * Calcula o progresso geral de uma proposta
 * Sistema calibrado para: 99% = cliente completou tudo | 100% = aprovado na implantação
 */
export function calculateProposalProgress(proposal: ProposalData & { status?: string }): {
  overallProgress: number;
  titularesProgress: number;
  dependentesProgress: number;
  attachmentsProgress: number;
  completed: boolean;
} {
  const { titulares = [], dependentes = [], clientAttachments = [], status } = proposal;
  
  // SE JÁ FOI APROVADO NA IMPLANTAÇÃO = 100%
  if (status === 'implantado') {
    return {
      overallProgress: 100,
      titularesProgress: 100,
      dependentesProgress: 100,
      attachmentsProgress: 100,
      completed: true
    };
  }
  
  // Progresso dos titulares
  let totalTitularesProgress = 0;
  if (titulares.length > 0) {
    const titularesProgressSum = titulares.reduce((sum, titular) => {
      return sum + calculatePersonProgress(titular, true);
    }, 0);
    totalTitularesProgress = titularesProgressSum / titulares.length;
  }
  
  // Progresso dos dependentes
  let totalDependentesProgress = 0;
  if (dependentes.length > 0) {
    const dependentesProgressSum = dependentes.reduce((sum, dependente) => {
      return sum + calculatePersonProgress(dependente, false);
    }, 0);
    totalDependentesProgress = dependentesProgressSum / dependentes.length;
  }
  
  // Progresso dos anexos (consideramos 100% se existir pelo menos 1 anexo)
  const attachmentsProgress = clientAttachments.length > 0 ? 100 : 0;
  
  // Cálculo do progresso geral
  let overallProgress = 0;
  let weightSum = 0;
  
  // Titulares sempre contam (peso 0.7 - mais importante)
  if (titulares.length > 0) {
    overallProgress += totalTitularesProgress * 0.7;
    weightSum += 0.7;
  }
  
  // Dependentes contam se existirem (peso 0.2)
  if (dependentes.length > 0) {
    overallProgress += totalDependentesProgress * 0.2;
    weightSum += 0.2;
  }
  
  // Anexos sempre contam (peso 0.1)
  overallProgress += attachmentsProgress * 0.1;
  weightSum += 0.1;
  
  // Normalizar se necessário
  if (weightSum > 0) {
    overallProgress = overallProgress / weightSum;
  }
  
  // CALIBRAÇÃO FINAL: Máximo 99% até ser aprovado na implantação
  if (overallProgress >= 99 && status !== 'implantado') {
    overallProgress = 99;
  }
  
  overallProgress = Math.round(overallProgress);
  
  return {
    overallProgress,
    titularesProgress: Math.round(totalTitularesProgress),
    dependentesProgress: Math.round(totalDependentesProgress),
    attachmentsProgress,
    completed: status === 'implantado'
  };
}

/**
 * Obtém a lista de campos faltantes para uma pessoa
 */
export function getMissingFields(person: PersonData, isTitular: boolean = true): string[] {
  const requiredFields = isTitular ? REQUIRED_TITULAR_FIELDS : REQUIRED_DEPENDENTE_FIELDS;
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    const value = person[field as keyof PersonData];
    if (!value || value.toString().trim() === '') {
      missingFields.push(field);
    }
  }
  
  return missingFields;
}

/**
 * Converte nome do campo para label legível
 */
export function getFieldLabel(fieldName: string): string {
  const fieldLabels: Record<string, string> = {
    nomeCompleto: 'Nome Completo',
    cpf: 'CPF',
    rg: 'RG',
    dataNascimento: 'Data de Nascimento',
    parentesco: 'Grau de Parentesco',
    nomeMae: 'Nome da Mãe',
    sexo: 'Sexo',
    estadoCivil: 'Estado Civil',
    peso: 'Peso',
    altura: 'Altura',
    emailPessoal: 'Email Pessoal',
    telefonePessoal: 'Telefone Pessoal',
    emailEmpresa: 'Email Empresa',
    telefoneEmpresa: 'Telefone Empresa',
    cep: 'CEP',
    enderecoCompleto: 'Endereço Completo',
    dadosReembolso: 'Dados para Reembolso'
  };
  
  return fieldLabels[fieldName] || fieldName;
}

/**
 * Obtém a cor da barra de progresso baseada na porcentagem
 */
export function getProgressColor(progress: number): string {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 75) return 'bg-blue-500';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Obtém o texto descritivo do progresso
 */
export function getProgressText(progress: number): string {
  if (progress >= 100) return 'Completo';
  if (progress >= 75) return 'Quase Completo';
  if (progress >= 50) return 'Em Andamento';
  if (progress >= 25) return 'Iniciado';
  return 'Pendente';
}

/**
 * Obtém detalhes completos do progresso incluindo campos faltantes
 */
export function getProgressDetails(proposal: ProposalData): {
  progress: number;
  color: string;
  text: string;
  missingFieldsCount: number;
  totalRequiredFields: number;
  missingFields: string[];
} {
  const progressData = calculateProposalProgress(proposal);
  const { titulares = [], dependentes = [] } = proposal;
  
  let allMissingFields: string[] = [];
  let totalRequiredFields = 0;
  
  // Calcular campos faltantes para titulares
  titulares.forEach((titular, index) => {
    const missingFields = getMissingFields(titular, true);
    totalRequiredFields += REQUIRED_TITULAR_FIELDS.length;
    allMissingFields.push(...missingFields.map(field => `Titular ${index + 1}: ${getFieldLabel(field)}`));
  });
  
  // Calcular campos faltantes para dependentes
  dependentes.forEach((dependente, index) => {
    const missingFields = getMissingFields(dependente, false);
    totalRequiredFields += REQUIRED_DEPENDENTE_FIELDS.length;
    allMissingFields.push(...missingFields.map(field => `Dependente ${index + 1}: ${getFieldLabel(field)}`));
  });
  
  return {
    progress: progressData.overallProgress,
    color: getProgressColor(progressData.overallProgress),
    text: getProgressText(progressData.overallProgress),
    missingFieldsCount: allMissingFields.length,
    totalRequiredFields,
    missingFields: allMissingFields
  };
}