// SISTEMA DE PLANILHA HORIZONTAL COM EXPANSÃO AUTOMÁTICA ILIMITADA
// 
// REGRA 1: UMA EMPRESA = UMA LINHA ÚNICA - Cada proposta ocupa apenas uma linha horizontal
// REGRA 2: CAMPOS CRIADOS AUTOMATICAMENTE - TITULAR1, TITULAR2... DEPENDENTE1, DEPENDENTE2... (SEM LIMITE)
// REGRA 3: CAMPOS VAZIOS PERMITIDOS - Campos não preenchidos ficam em branco
// REGRA 4: JAMAIS CRIAR NOVA LINHA PARA MESMA EMPRESA - Sempre atualizar linha existente
// REGRA 5: ESTRUTURA HORIZONTAL - Todos os dados lado a lado na mesma linha
// REGRA 6: CAMPOS AGRUPADOS - Titular1_Nome, Titular1_CPF ficam juntos
// 
// TITULARES E DEPENDENTES: SEM LIMITES - Sistema cria campos automaticamente conforme necessário

export interface DynamicSheetData {
  headers: string[];
  data: any[][];
  maxTitulares: number;
  maxDependentes: number;
  totalColumns: number;
  lastUpdated: Date;
}

export function analyzeDynamicStructure(proposals: any[]): {
  maxTitulares: number;
  maxDependentes: number;
  maxVendorAttachments: number;
  maxClientAttachments: number;
  totalColumns: number;
} {
  // REGRA 2: CAMPOS FIXOS PRÉ-DEFINIDOS com estrutura mínima garantida
  let maxTitulares = 3; // TITULAR1, TITULAR2, TITULAR3 sempre criados
  let maxDependentes = 5; // DEPENDENTE1, DEPENDENTE2, DEPENDENTE3, DEPENDENTE4, DEPENDENTE5 sempre criados
  let maxVendorAttachments = 3; // Mínimo 3 anexos do vendedor
  let maxClientAttachments = 3; // Mínimo 3 anexos do cliente
  
  // DETECÇÃO AUTOMÁTICA ILIMITADA - EXPANDE CONFORME NECESSÁRIO
  // REGRA 2: Estrutura mínima garantida + expansão automática
  for (const proposal of proposals) {
    const titulares = proposal.titulares || [];
    const dependentes = proposal.dependentes || [];
    
    // Se tem mais titulares que o mínimo, expande automaticamente
    if (titulares.length > maxTitulares) {
      maxTitulares = titulares.length;
    }
    
    // Se tem mais dependentes que o mínimo, expande automaticamente  
    if (dependentes.length > maxDependentes) {
      maxDependentes = dependentes.length;
    }
    
    // Detectar máximo de anexos para expansão automática
    if (proposal.vendorAttachments?.length > maxVendorAttachments) {
      maxVendorAttachments = proposal.vendorAttachments.length;
    }
    if (proposal.clientAttachments?.length > maxClientAttachments) {
      maxClientAttachments = proposal.clientAttachments.length;
    }
  }
  
  // Calcular total de colunas baseado na detecção automática
  const baseColumns = 10; // ID, LINK, EMPRESA, CNPJ, VENDEDOR, PLANO, VALOR, STATUS, NOME_DA_PASTA, LINK_DA_PASTA
  const contractColumns = 6; // ODONTO, LIVRE_ADESAO, COMPULSORIO, APROVEITAMENTO, INICIO, PERIODO
  const internalColumns = 11; // REUNIÃO, NOME_REUNIÃO, VENDA_DUPLA, VENDEDOR_DUPLA, DESCONTO, ORIGEM, AUTORIZADOR, OBS_FINANCEIRAS, OBS_CLIENTE, OBS_SUPERVISOR, OBS_IMPLEMENTACAO
  const workflowColumns = 4; // PRIORITY, CLIENT_COMPLETED, VENDOR_NAME, UPDATED_AT
  const comissionColumns = 12; // VENDEDOR_1, VENDEDOR_1_PERCENT, VENDEDOR_2, VENDEDOR_2_PERCENT, COMISSAO_REUNIAO_PERCENT, PREMIACAO_VALOR, COMISSAO_SUPERVISOR_PERCENT, SUPERVISOR_RESPONSAVEL, STATUS_PAGAMENTO, DATA_PAGAMENTO, STATUS_PAGAMENTO_PREMIACAO, OBSERVACOES_COMISSAO
  const attachmentColumns = 3; // VENDOR_ATTACHMENTS_COUNT, CLIENT_ATTACHMENTS_COUNT, TOTAL_DOCUMENTS
  const titularColumns = maxTitulares * 5; // NOME, CPF, RG, EMAIL, TELEFONE para cada titular
  const dependenteColumns = maxDependentes * 3; // NOME, CPF, PARENTESCO para cada dependente
  const extraColumns = 3; // ANEXOS, DATA_CRIACAO, HORA_CRIACAO
  
  const vendorAttachmentLinks = maxVendorAttachments * 2; // NOME, LINK para cada anexo do vendedor
  const clientAttachmentLinks = maxClientAttachments * 2; // NOME, LINK para cada anexo do cliente
  
  const totalColumns = baseColumns + contractColumns + internalColumns + workflowColumns + comissionColumns + attachmentColumns + vendorAttachmentLinks + clientAttachmentLinks + titularColumns + dependenteColumns + extraColumns;
  
  return {
    maxTitulares,
    maxDependentes,
    maxVendorAttachments,
    maxClientAttachments,
    totalColumns
  };
}

export function generateDynamicHeaders(maxTitulares: number, maxDependentes: number, maxVendorAttachments = 3, maxClientAttachments = 3): string[] {
  const headers = [];
  
  // CAMPOS FIXOS OBRIGATÓRIOS - REGRA 5
  headers.push('ID', 'LINK_CLIENTE', 'EMPRESA', 'CNPJ', 'VENDEDOR', 'PLANO', 'VALOR', 'STATUS', 'NOME_DA_PASTA', 'LINK_DA_PASTA');
  
  // INFORMAÇÕES DO CONTRATO
  headers.push('ODONTO_CONJUGADO', 'LIVRE_ADESAO', 'COMPULSORIO', 'APROVEITAMENTO_CONGENERE', 'INICIO_VIGENCIA', 'PERIODO_MINIMO');
  
  // INFORMAÇÕES INTERNAS E OBSERVAÇÕES DOS PORTAIS
  headers.push('REUNIAO_REALIZADA', 'REUNIAO', 'VENDA_DUPLA', 'VENDEDOR_DUPLA', 'DESCONTO_PERCENT', 'ORIGEM_VENDA', 'AUTORIZADOR_DESCONTO', 'OBS_FINANCEIRAS', 'OBS_CLIENTE', 'OBS_SUPERVISOR', 'OBS_IMPLEMENTACAO');
  
  // CAMPOS DE CONTROLE E WORKFLOW (que os portais podem alterar)
  headers.push('PRIORITY', 'CLIENT_COMPLETED', 'VENDOR_NAME', 'UPDATED_AT');
  
  // CAMPOS DE COMISSÕES E CONTROLES DO SUPERVISOR (do Portal Supervisor - Relatórios)
  headers.push('VENDEDOR_1', 'VENDEDOR_1_PERCENT', 'VENDEDOR_2', 'VENDEDOR_2_PERCENT', 'COMISSAO_REUNIAO_PERCENT', 'PREMIACAO_VALOR', 'COMISSAO_SUPERVISOR_PERCENT', 'SUPERVISOR_RESPONSAVEL', 'STATUS_PAGAMENTO', 'DATA_PAGAMENTO', 'STATUS_PAGAMENTO_PREMIACAO', 'OBSERVACOES_COMISSAO');
  
  // CAMPOS DE ANEXOS E DOCUMENTOS + LINKS DINÂMICOS
  headers.push('VENDOR_ATTACHMENTS_COUNT', 'CLIENT_ATTACHMENTS_COUNT', 'TOTAL_DOCUMENTS');
  
  // LINKS DE ANEXOS DINÂMICOS - EXPANDE CONFORME QUANTIDADE DE DOCUMENTOS
  // Criar campos dinâmicos para links de anexos do vendedor (mínimo 3)
  for (let i = 1; i <= maxVendorAttachments; i++) {
    headers.push(`VENDOR_ANEXO${i}_NOME`, `VENDOR_ANEXO${i}_LINK`);
  }
  
  // Criar campos dinâmicos para links de anexos do cliente (mínimo 3)
  for (let i = 1; i <= maxClientAttachments; i++) {
    headers.push(`CLIENT_ANEXO${i}_NOME`, `CLIENT_ANEXO${i}_LINK`);
  }
  
  // TITULARES - REGRA 6 (CAMPOS AGRUPADOS) - EXPANSÃO ILIMITADA
  // Cria automaticamente quantos titulares forem necessários (1, 2, 5, 10, 50...)
  for (let i = 1; i <= maxTitulares; i++) {
    headers.push(
      `TITULAR${i}_NOME`,
      `TITULAR${i}_CPF`,
      `TITULAR${i}_RG`,
      `TITULAR${i}_EMAIL`,
      `TITULAR${i}_TELEFONE`
    );
  }
  
  // DEPENDENTES - REGRA 6 (CAMPOS AGRUPADOS) - EXPANSÃO ILIMITADA
  // Cria automaticamente quantos dependentes forem necessários (0, 1, 3, 20, 100...)
  for (let i = 1; i <= maxDependentes; i++) {
    headers.push(
      `DEPENDENTE${i}_NOME`,
      `DEPENDENTE${i}_CPF`,
      `DEPENDENTE${i}_PARENTESCO`
    );
  }
  
  // CAMPOS EXTRAS
  headers.push('ANEXOS', 'DATA_CRIACAO', 'HORA_CRIACAO');
  
  return headers;
}

export function formatProposalToDynamicRow(proposal: any, maxTitulares: number, maxDependentes: number, maxVendorAttachments: number, maxClientAttachments: number): any[] {
  const row = [];
  const contractData = proposal.contractData || {};
  const internalData = proposal.internalData || {};
  const titulares = proposal.titulares || [];
  const dependentes = proposal.dependentes || [];
  
  // REGRA 1: UMA EMPRESA = UMA LINHA ÚNICA
  // CAMPOS FIXOS OBRIGATÓRIOS
  row.push(
    proposal.abmId || `ABM${proposal.id?.slice(-3) || '001'}`,
    `https://abmix.com/client-proposal/${proposal.clientToken}`,
    contractData.nomeEmpresa || '',
    contractData.cnpj || '',
    proposal.vendorName || '',
    contractData.planoContratado || '',
    contractData.valor || '',
    proposal.status || 'observacao',
    proposal.folderName || contractData.nomeEmpresa || 'Nome não definido', // NOME DA PASTA EDITÁVEL
    proposal.driveFolder || 'Pasta não criada' // LINK DA PASTA NO DRIVE
  );
  
  // INFORMAÇÕES DO CONTRATO (preenchidas pelo vendedor)
  row.push(
    contractData.odontoConjugado ? 'Sim' : 'Não',
    contractData.livreAdesao ? 'Sim' : 'Não',
    contractData.compulsorio ? 'Sim' : 'Não',
    contractData.aproveitamentoCongenere ? 'Sim' : 'Não',
    contractData.inicioVigencia || '',
    contractData.periodoMinimo || ''
  );
  
  // INFORMAÇÕES INTERNAS E OBSERVAÇÕES DOS PORTAIS
  row.push(
    internalData.reuniao ? 'Sim' : 'Não',
    internalData.nomeVendaDupla || '', // Nome do Parceiro (campo corrigido)
    internalData.vendaDupla ? 'Sim' : 'Não',
    internalData.nomeVendaDupla || '',
    internalData.desconto || '',
    internalData.origemVenda || '',
    internalData.autorizadorDesconto || '',
    internalData.observacoesFinanceiras || '',
    internalData.observacoesCliente || '',
    internalData.observacoesSupervisor || '',
    internalData.observacoesImplementacao || ''
  );
  
  // CAMPOS DE CONTROLE E WORKFLOW
  row.push(
    proposal.priority || 'medium',
    proposal.clientCompleted ? 'Sim' : 'Não',
    proposal.vendorName || '',
    proposal.updatedAt ? new Date(proposal.updatedAt).toLocaleDateString('pt-BR') : ''
  );
  
  // CAMPOS DE COMISSÕES E CONTROLES DO SUPERVISOR (vindos do Portal Supervisor - Relatórios)
  const vendedor1 = proposal.vendorName || '';
  const vendedor2 = internalData.nomeVendaDupla || '';
  const nomeReuniao = internalData.nomeReuniao || '';
  
  row.push(
    vendedor1, // VENDEDOR_1 (principal)
    internalData.vendaDupla ? '50%' : '100%', // VENDEDOR_1_PERCENT
    vendedor2, // VENDEDOR_2 (parceiro)
    internalData.vendaDupla ? '50%' : '', // VENDEDOR_2_PERCENT
    nomeReuniao ? '10%' : '', // COMISSAO_REUNIAO_PERCENT (se tem reunião)
    '', // PREMIACAO_VALOR (preenchido pelo supervisor)
    '5%', // COMISSAO_SUPERVISOR_PERCENT (Rod Ribas sempre 5%)
    'Rod Ribas', // SUPERVISOR_RESPONSAVEL (único supervisor cadastrado)
    '', // STATUS_PAGAMENTO (PENDENTE/PAGO/AGUARDANDO)
    '', // DATA_PAGAMENTO (data quando pago)
    '', // STATUS_PAGAMENTO_PREMIACAO
    '' // OBSERVACOES_COMISSAO
  );
  
  // CAMPOS DE ANEXOS E DOCUMENTOS
  row.push(
    proposal.vendorAttachments?.length || 0,
    proposal.clientAttachments?.length || 0,
    (proposal.vendorAttachments?.length || 0) + (proposal.clientAttachments?.length || 0)
  );
  
  // LINKS DE ANEXOS DO VENDEDOR - DINÂMICOS
  const vendorAttachments = proposal.vendorAttachments || [];
  for (let i = 0; i < maxVendorAttachments; i++) {
    const attachment = vendorAttachments[i];
    if (attachment) {
      row.push(attachment.name || '', attachment.url || '');
    } else {
      row.push('', ''); // REGRA 3: Campos vazios permitidos
    }
  }
  
  // LINKS DE ANEXOS DO CLIENTE - DINÂMICOS
  const clientAttachments = proposal.clientAttachments || [];
  for (let i = 0; i < maxClientAttachments; i++) {
    const attachment = clientAttachments[i];
    if (attachment) {
      row.push(attachment.name || '', attachment.url || '');
    } else {
      row.push('', ''); // REGRA 3: Campos vazios permitidos
    }
  }
  
  // REGRA 3: CAMPOS VAZIOS PERMITIDOS
  // REGRA 6: CAMPOS AGRUPADOS - TITULARES
  for (let i = 0; i < maxTitulares; i++) {
    const titular = titulares[i];
    if (titular && titular.nomeCompleto) {
      // Titular existe - preencher dados
      row.push(
        titular.nomeCompleto || '',
        titular.cpf || '',
        titular.rg || '',
        titular.emailPessoal || '',
        titular.telefonePessoal || ''
      );
    } else {
      // REGRA 3: Titular não existe - campos ficam em branco
      row.push('', '', '', '', '');
    }
  }
  
  // REGRA 3: CAMPOS VAZIOS PERMITIDOS
  // REGRA 6: CAMPOS AGRUPADOS - DEPENDENTES
  for (let i = 0; i < maxDependentes; i++) {
    const dependente = dependentes[i];
    if (dependente && dependente.nomeCompleto) {
      // Dependente existe - preencher dados
      row.push(
        dependente.nomeCompleto || '',
        dependente.cpf || '',
        dependente.parentesco || ''
      );
    } else {
      // REGRA 3: Dependente não existe - campos ficam em branco
      row.push('', '', '');
    }
  }
  
  // CAMPOS EXTRAS - DATA E HORA QUANDO VENDEDOR GERA LINK
  const dataHoraCriacao = proposal.createdAt ? new Date(proposal.createdAt) : new Date();
  row.push(
    'Ver Anexos',
    dataHoraCriacao.toLocaleDateString('pt-BR'),
    dataHoraCriacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
  
  return row;
}

export function generateDynamicSheet(proposals: any[]): DynamicSheetData {
  // ANÁLISE AUTOMÁTICA DA ESTRUTURA
  const { maxTitulares, maxDependentes, maxVendorAttachments, maxClientAttachments, totalColumns } = analyzeDynamicStructure(proposals);
  
  // GERAR CABEÇALHOS DINÂMICOS
  const headers = generateDynamicHeaders(maxTitulares, maxDependentes, maxVendorAttachments, maxClientAttachments);
  
  // GERAR DADOS DINÂMICOS
  const data = proposals.map(proposal => 
    formatProposalToDynamicRow(proposal, maxTitulares, maxDependentes, maxVendorAttachments, maxClientAttachments)
  );
  
  return {
    headers,
    data,
    maxTitulares,
    maxDependentes,
    totalColumns,
    lastUpdated: new Date()
  };
}

// FUNÇÃO PARA EXPORTAR PARA GOOGLE SHEETS
export function formatForGoogleSheets(sheetData: DynamicSheetData): any[][] {
  return [
    sheetData.headers,
    ...sheetData.data
  ];
}