/**
 * Utilitário para formatação de dados em planilha única horizontal
 * Uma empresa = Uma linha completa na planilha
 */

export interface SheetRow {
  // Dados principais
  ID: string;
  EMPRESA: string;
  CNPJ: string;
  PLANO: string;
  VALOR: string;
  VENDEDOR: string;
  STATUS: string;
  DATA_CRIACAO: string;
  
  // Dados contratuais
  INICIO_VIGENCIA: string;
  ODONTO_CONJUGADO: string;
  COMPULSORIO: string;
  LIVRE_ADESAO: string;
  PERIODO_MINIMO: string;
  
  // Controle interno
  OBSERVACOES_VENDEDOR: string;
  DESCONTO_APLICADO: string;
  AUTORIZADOR_DESCONTO: string;
  DATA_REUNIAO: string;
  NOTAS_FINANCEIRO: string;
  PRIORIDADE: string;
  PROGRESSO_PERCENT: string;
  
  // Titulares (até 5 titulares)
  TITULAR1_NOME: string;
  TITULAR1_CPF: string;
  TITULAR1_RG: string;
  TITULAR1_NASCIMENTO: string;
  TITULAR1_EMAIL: string;
  TITULAR1_TELEFONE: string;
  TITULAR1_SEXO: string;
  TITULAR1_ESTADO_CIVIL: string;
  TITULAR1_PESO: string;
  TITULAR1_ALTURA: string;
  TITULAR1_NOME_MAE: string;
  TITULAR1_CEP: string;
  TITULAR1_ENDERECO: string;
  TITULAR1_EMAIL_EMPRESA: string;
  TITULAR1_TELEFONE_EMPRESA: string;
  TITULAR1_DADOS_REEMBOLSO: string;
  
  TITULAR2_NOME: string;
  TITULAR2_CPF: string;
  TITULAR2_RG: string;
  TITULAR2_NASCIMENTO: string;
  TITULAR2_EMAIL: string;
  TITULAR2_TELEFONE: string;
  TITULAR2_SEXO: string;
  TITULAR2_ESTADO_CIVIL: string;
  TITULAR2_PESO: string;
  TITULAR2_ALTURA: string;
  TITULAR2_NOME_MAE: string;
  TITULAR2_CEP: string;
  TITULAR2_ENDERECO: string;
  TITULAR2_EMAIL_EMPRESA: string;
  TITULAR2_TELEFONE_EMPRESA: string;
  TITULAR2_DADOS_REEMBOLSO: string;
  
  TITULAR3_NOME: string;
  TITULAR3_CPF: string;
  TITULAR3_RG: string;
  TITULAR3_NASCIMENTO: string;
  TITULAR3_EMAIL: string;
  TITULAR3_TELEFONE: string;
  TITULAR3_SEXO: string;
  TITULAR3_ESTADO_CIVIL: string;
  TITULAR3_PESO: string;
  TITULAR3_ALTURA: string;
  TITULAR3_NOME_MAE: string;
  TITULAR3_CEP: string;
  TITULAR3_ENDERECO: string;
  TITULAR3_EMAIL_EMPRESA: string;
  TITULAR3_TELEFONE_EMPRESA: string;
  TITULAR3_DADOS_REEMBOLSO: string;
  
  TITULAR4_NOME: string;
  TITULAR4_CPF: string;
  TITULAR4_RG: string;
  TITULAR4_NASCIMENTO: string;
  TITULAR4_EMAIL: string;
  TITULAR4_TELEFONE: string;
  TITULAR4_SEXO: string;
  TITULAR4_ESTADO_CIVIL: string;
  TITULAR4_PESO: string;
  TITULAR4_ALTURA: string;
  TITULAR4_NOME_MAE: string;
  TITULAR4_CEP: string;
  TITULAR4_ENDERECO: string;
  TITULAR4_EMAIL_EMPRESA: string;
  TITULAR4_TELEFONE_EMPRESA: string;
  TITULAR4_DADOS_REEMBOLSO: string;
  
  TITULAR5_NOME: string;
  TITULAR5_CPF: string;
  TITULAR5_RG: string;
  TITULAR5_NASCIMENTO: string;
  TITULAR5_EMAIL: string;
  TITULAR5_TELEFONE: string;
  TITULAR5_SEXO: string;
  TITULAR5_ESTADO_CIVIL: string;
  TITULAR5_PESO: string;
  TITULAR5_ALTURA: string;
  TITULAR5_NOME_MAE: string;
  TITULAR5_CEP: string;
  TITULAR5_ENDERECO: string;
  TITULAR5_EMAIL_EMPRESA: string;
  TITULAR5_TELEFONE_EMPRESA: string;
  TITULAR5_DADOS_REEMBOLSO: string;
  
  // Dependentes (até 10 dependentes)
  DEPENDENTE1_NOME: string;
  DEPENDENTE1_CPF: string;
  DEPENDENTE1_RG: string;
  DEPENDENTE1_NASCIMENTO: string;
  DEPENDENTE1_PARENTESCO: string;
  DEPENDENTE1_SEXO: string;
  DEPENDENTE1_EMAIL: string;
  DEPENDENTE1_TELEFONE: string;
  DEPENDENTE1_NOME_MAE: string;
  DEPENDENTE1_CEP: string;
  DEPENDENTE1_ENDERECO: string;
  
  DEPENDENTE2_NOME: string;
  DEPENDENTE2_CPF: string;
  DEPENDENTE2_RG: string;
  DEPENDENTE2_NASCIMENTO: string;
  DEPENDENTE2_PARENTESCO: string;
  DEPENDENTE2_SEXO: string;
  DEPENDENTE2_EMAIL: string;
  DEPENDENTE2_TELEFONE: string;
  DEPENDENTE2_NOME_MAE: string;
  DEPENDENTE2_CEP: string;
  DEPENDENTE2_ENDERECO: string;
  
  DEPENDENTE3_NOME: string;
  DEPENDENTE3_CPF: string;
  DEPENDENTE3_RG: string;
  DEPENDENTE3_NASCIMENTO: string;
  DEPENDENTE3_PARENTESCO: string;
  DEPENDENTE3_SEXO: string;
  DEPENDENTE3_EMAIL: string;
  DEPENDENTE3_TELEFONE: string;
  DEPENDENTE3_NOME_MAE: string;
  DEPENDENTE3_CEP: string;
  DEPENDENTE3_ENDERECO: string;
  
  DEPENDENTE4_NOME: string;
  DEPENDENTE4_CPF: string;
  DEPENDENTE4_RG: string;
  DEPENDENTE4_NASCIMENTO: string;
  DEPENDENTE4_PARENTESCO: string;
  DEPENDENTE4_SEXO: string;
  DEPENDENTE4_EMAIL: string;
  DEPENDENTE4_TELEFONE: string;
  DEPENDENTE4_NOME_MAE: string;
  DEPENDENTE4_CEP: string;
  DEPENDENTE4_ENDERECO: string;
  
  DEPENDENTE5_NOME: string;
  DEPENDENTE5_CPF: string;
  DEPENDENTE5_RG: string;
  DEPENDENTE5_NASCIMENTO: string;
  DEPENDENTE5_PARENTESCO: string;
  DEPENDENTE5_SEXO: string;
  DEPENDENTE5_EMAIL: string;
  DEPENDENTE5_TELEFONE: string;
  DEPENDENTE5_NOME_MAE: string;
  DEPENDENTE5_CEP: string;
  DEPENDENTE5_ENDERECO: string;
  
  DEPENDENTE6_NOME: string;
  DEPENDENTE6_CPF: string;
  DEPENDENTE6_RG: string;
  DEPENDENTE6_NASCIMENTO: string;
  DEPENDENTE6_PARENTESCO: string;
  DEPENDENTE6_SEXO: string;
  DEPENDENTE6_EMAIL: string;
  DEPENDENTE6_TELEFONE: string;
  DEPENDENTE6_NOME_MAE: string;
  DEPENDENTE6_CEP: string;
  DEPENDENTE6_ENDERECO: string;
  
  DEPENDENTE7_NOME: string;
  DEPENDENTE7_CPF: string;
  DEPENDENTE7_RG: string;
  DEPENDENTE7_NASCIMENTO: string;
  DEPENDENTE7_PARENTESCO: string;
  DEPENDENTE7_SEXO: string;
  DEPENDENTE7_EMAIL: string;
  DEPENDENTE7_TELEFONE: string;
  DEPENDENTE7_NOME_MAE: string;
  DEPENDENTE7_CEP: string;
  DEPENDENTE7_ENDERECO: string;
  
  DEPENDENTE8_NOME: string;
  DEPENDENTE8_CPF: string;
  DEPENDENTE8_RG: string;
  DEPENDENTE8_NASCIMENTO: string;
  DEPENDENTE8_PARENTESCO: string;
  DEPENDENTE8_SEXO: string;
  DEPENDENTE8_EMAIL: string;
  DEPENDENTE8_TELEFONE: string;
  DEPENDENTE8_NOME_MAE: string;
  DEPENDENTE8_CEP: string;
  DEPENDENTE8_ENDERECO: string;
  
  DEPENDENTE9_NOME: string;
  DEPENDENTE9_CPF: string;
  DEPENDENTE9_RG: string;
  DEPENDENTE9_NASCIMENTO: string;
  DEPENDENTE9_PARENTESCO: string;
  DEPENDENTE9_SEXO: string;
  DEPENDENTE9_EMAIL: string;
  DEPENDENTE9_TELEFONE: string;
  DEPENDENTE9_NOME_MAE: string;
  DEPENDENTE9_CEP: string;
  DEPENDENTE9_ENDERECO: string;
  
  DEPENDENTE10_NOME: string;
  DEPENDENTE10_CPF: string;
  DEPENDENTE10_RG: string;
  DEPENDENTE10_NASCIMENTO: string;
  DEPENDENTE10_PARENTESCO: string;
  DEPENDENTE10_SEXO: string;
  DEPENDENTE10_EMAIL: string;
  DEPENDENTE10_TELEFONE: string;
  DEPENDENTE10_NOME_MAE: string;
  DEPENDENTE10_CEP: string;
  DEPENDENTE10_ENDERECO: string;
  
  // Cotações
  OPERADORA_COTACAO: string;
  TIPO_PLANO_COTACAO: string;
  NUMERO_VIDAS: string;
  VALOR_COTACAO: string;
  VALIDADE_COTACAO: string;
  ARQUIVO_COTACAO: string;
  
  // Documentos
  DOCUMENTOS_ENVIADOS: string;
  DOCUMENTOS_VALIDADOS: string;
}

/**
 * Converte dados da proposta para formato de linha única na planilha
 */
export function formatProposalToSheetRow(proposal: any): SheetRow {
  const contractData = proposal.contractData || {};
  const titulares = proposal.titulares || [];
  const dependentes = proposal.dependentes || [];
  const internalData = proposal.internalData || {};
  
  // Função auxiliar para preencher dados de pessoa
  const fillPersonData = (person: any, prefix: string) => {
    if (!person) {
      return {
        [`${prefix}_NOME`]: '[vazio]',
        [`${prefix}_CPF`]: '[vazio]',
        [`${prefix}_RG`]: '[vazio]',
        [`${prefix}_NASCIMENTO`]: '[vazio]',
        [`${prefix}_EMAIL`]: '[vazio]',
        [`${prefix}_TELEFONE`]: '[vazio]',
        [`${prefix}_SEXO`]: '[vazio]',
        [`${prefix}_ESTADO_CIVIL`]: '[vazio]',
        [`${prefix}_PESO`]: '[vazio]',
        [`${prefix}_ALTURA`]: '[vazio]',
        [`${prefix}_NOME_MAE`]: '[vazio]',
        [`${prefix}_CEP`]: '[vazio]',
        [`${prefix}_ENDERECO`]: '[vazio]',
        [`${prefix}_EMAIL_EMPRESA`]: '[vazio]',
        [`${prefix}_TELEFONE_EMPRESA`]: '[vazio]',
        [`${prefix}_DADOS_REEMBOLSO`]: '[vazio]'
      };
    }
    
    return {
      [`${prefix}_NOME`]: person.nomeCompleto || person.nome || '[vazio]',
      [`${prefix}_CPF`]: person.cpf || '[vazio]',
      [`${prefix}_RG`]: person.rg || '[vazio]',
      [`${prefix}_NASCIMENTO`]: person.dataNascimento || '[vazio]',
      [`${prefix}_EMAIL`]: person.emailPessoal || '[vazio]',
      [`${prefix}_TELEFONE`]: person.telefonePessoal || '[vazio]',
      [`${prefix}_SEXO`]: person.sexo || '[vazio]',
      [`${prefix}_ESTADO_CIVIL`]: person.estadoCivil || '[vazio]',
      [`${prefix}_PESO`]: person.peso || '[vazio]',
      [`${prefix}_ALTURA`]: person.altura || '[vazio]',
      [`${prefix}_NOME_MAE`]: person.nomeMae || '[vazio]',
      [`${prefix}_CEP`]: person.cep || '[vazio]',
      [`${prefix}_ENDERECO`]: person.enderecoCompleto || person.endereco || '[vazio]',
      [`${prefix}_EMAIL_EMPRESA`]: person.emailEmpresa || '[vazio]',
      [`${prefix}_TELEFONE_EMPRESA`]: person.telefoneEmpresa || '[vazio]',
      [`${prefix}_DADOS_REEMBOLSO`]: person.dadosReembolso || '[vazio]'
    };
  };
  
  // Função auxiliar para preencher dados de dependente
  const fillDependentData = (person: any, prefix: string) => {
    if (!person) {
      return {
        [`${prefix}_NOME`]: '[vazio]',
        [`${prefix}_CPF`]: '[vazio]',
        [`${prefix}_RG`]: '[vazio]',
        [`${prefix}_NASCIMENTO`]: '[vazio]',
        [`${prefix}_PARENTESCO`]: '[vazio]',
        [`${prefix}_SEXO`]: '[vazio]',
        [`${prefix}_EMAIL`]: '[vazio]',
        [`${prefix}_TELEFONE`]: '[vazio]',
        [`${prefix}_NOME_MAE`]: '[vazio]',
        [`${prefix}_CEP`]: '[vazio]',
        [`${prefix}_ENDERECO`]: '[vazio]'
      };
    }
    
    return {
      [`${prefix}_NOME`]: person.nomeCompleto || person.nome || '[vazio]',
      [`${prefix}_CPF`]: person.cpf || '[vazio]',
      [`${prefix}_RG`]: person.rg || '[vazio]',
      [`${prefix}_NASCIMENTO`]: person.dataNascimento || '[vazio]',
      [`${prefix}_PARENTESCO`]: person.parentesco || '[vazio]',
      [`${prefix}_SEXO`]: person.sexo || '[vazio]',
      [`${prefix}_EMAIL`]: person.emailPessoal || '[vazio]',
      [`${prefix}_TELEFONE`]: person.telefonePessoal || '[vazio]',
      [`${prefix}_NOME_MAE`]: person.nomeMae || '[vazio]',
      [`${prefix}_CEP`]: person.cep || '[vazio]',
      [`${prefix}_ENDERECO`]: person.enderecoCompleto || person.endereco || '[vazio]'
    };
  };
  
  // Dados principais
  const baseData = {
    ID: proposal.abmId || '[vazio]',
    EMPRESA: contractData.nomeEmpresa || '[vazio]',
    CNPJ: contractData.cnpj || '[vazio]',
    PLANO: contractData.planoContratado || '[vazio]',
    VALOR: contractData.valor || '[vazio]',
    VENDEDOR: proposal.vendedor || '[vazio]',
    STATUS: proposal.status || '[vazio]',
    DATA_CRIACAO: proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString('pt-BR') : '[vazio]',
    
    // Dados contratuais
    INICIO_VIGENCIA: contractData.inicioVigencia || '[vazio]',
    ODONTO_CONJUGADO: contractData.odontoConjugado ? 'Sim' : 'Não',
    COMPULSORIO: contractData.compulsorio ? 'Sim' : 'Não',
    LIVRE_ADESAO: contractData.livreAdesao ? 'Sim' : 'Não',
    PERIODO_MINIMO: contractData.periodoMinimo || '[vazio]',
    
    // Controle interno
    OBSERVACOES_VENDEDOR: internalData.observacoesVendedor || '[vazio]',
    DESCONTO_APLICADO: internalData.desconto || '[vazio]',
    AUTORIZADOR_DESCONTO: internalData.autorizadorDesconto || '[vazio]',
    DATA_REUNIAO: internalData.dataReuniao || '[vazio]',
    NOTAS_FINANCEIRO: internalData.notasFinanceiro || '[vazio]',
    PRIORIDADE: proposal.priority || '[vazio]',
    PROGRESSO_PERCENT: `${proposal.progresso || 0}%`,
    
    // Cotações
    OPERADORA_COTACAO: internalData.operadoraCotacao || '[vazio]',
    TIPO_PLANO_COTACAO: internalData.tipoplanoCotacao || '[vazio]',
    NUMERO_VIDAS: internalData.numeroVidas || '[vazio]',
    VALOR_COTACAO: internalData.valorCotacao || '[vazio]',
    VALIDADE_COTACAO: internalData.validadeCotacao || '[vazio]',
    ARQUIVO_COTACAO: internalData.arquivoCotacao || '[vazio]',
    
    // Documentos
    DOCUMENTOS_ENVIADOS: (proposal.clientAttachments || []).map((doc: any) => doc.name).join(', ') || '[vazio]',
    DOCUMENTOS_VALIDADOS: proposal.documentosValidados || '[vazio]'
  };
  
  // Preencher dados dos titulares (até 5)
  const titularesData = {};
  for (let i = 1; i <= 5; i++) {
    const titular = titulares[i - 1];
    Object.assign(titularesData, fillPersonData(titular, `TITULAR${i}`));
  }
  
  // Preencher dados dos dependentes (até 10)
  const dependentesData = {};
  for (let i = 1; i <= 10; i++) {
    const dependente = dependentes[i - 1];
    Object.assign(dependentesData, fillDependentData(dependente, `DEPENDENTE${i}`));
  }
  
  return {
    ...baseData,
    ...titularesData,
    ...dependentesData
  } as SheetRow;
}

/**
 * Converte array de propostas para formato de planilha
 */
export function formatProposalsToSheet(proposals: any[]): SheetRow[] {
  return proposals.map(proposal => formatProposalToSheetRow(proposal));
}

/**
 * Gera cabeçalhos da planilha
 */
export function getSheetHeaders(): string[] {
  const headers = [
    'ID', 'EMPRESA', 'CNPJ', 'PLANO', 'VALOR', 'VENDEDOR', 'STATUS', 'DATA_CRIACAO',
    'INICIO_VIGENCIA', 'ODONTO_CONJUGADO', 'COMPULSORIO', 'LIVRE_ADESAO', 'PERIODO_MINIMO',
    'OBSERVACOES_VENDEDOR', 'DESCONTO_APLICADO', 'AUTORIZADOR_DESCONTO', 'DATA_REUNIAO', 
    'NOTAS_FINANCEIRO', 'PRIORIDADE', 'PROGRESSO_PERCENT'
  ];
  
  // Adicionar cabeçalhos dos titulares
  for (let i = 1; i <= 5; i++) {
    headers.push(
      `TITULAR${i}_NOME`, `TITULAR${i}_CPF`, `TITULAR${i}_RG`, `TITULAR${i}_NASCIMENTO`,
      `TITULAR${i}_EMAIL`, `TITULAR${i}_TELEFONE`, `TITULAR${i}_SEXO`, `TITULAR${i}_ESTADO_CIVIL`,
      `TITULAR${i}_PESO`, `TITULAR${i}_ALTURA`, `TITULAR${i}_NOME_MAE`, `TITULAR${i}_CEP`,
      `TITULAR${i}_ENDERECO`, `TITULAR${i}_EMAIL_EMPRESA`, `TITULAR${i}_TELEFONE_EMPRESA`,
      `TITULAR${i}_DADOS_REEMBOLSO`
    );
  }
  
  // Adicionar cabeçalhos dos dependentes
  for (let i = 1; i <= 10; i++) {
    headers.push(
      `DEPENDENTE${i}_NOME`, `DEPENDENTE${i}_CPF`, `DEPENDENTE${i}_RG`, `DEPENDENTE${i}_NASCIMENTO`,
      `DEPENDENTE${i}_PARENTESCO`, `DEPENDENTE${i}_SEXO`, `DEPENDENTE${i}_EMAIL`, `DEPENDENTE${i}_TELEFONE`,
      `DEPENDENTE${i}_NOME_MAE`, `DEPENDENTE${i}_CEP`, `DEPENDENTE${i}_ENDERECO`
    );
  }
  
  // Adicionar cabeçalhos de cotações e documentos
  headers.push(
    'OPERADORA_COTACAO', 'TIPO_PLANO_COTACAO', 'NUMERO_VIDAS', 'VALOR_COTACAO',
    'VALIDADE_COTACAO', 'ARQUIVO_COTACAO', 'DOCUMENTOS_ENVIADOS', 'DOCUMENTOS_VALIDADOS'
  );
  
  return headers;
}