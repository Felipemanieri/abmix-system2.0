import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, RefreshCw, Eye, Clock, Users, Database } from 'lucide-react';

export default function PlanilhaViewer() {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Buscar todas as propostas para gerar planilha
  const { data: proposals = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/proposals"],
    queryFn: async () => {
      const response = await fetch("/api/proposals");
      if (!response.ok) throw new Error("Erro ao buscar propostas");
      return response.json();
    },
    refetchInterval: 5000 // Atualiza a cada 5 segundos
  });

  // Buscar dados dos vendedores
  const { data: vendors = [] } = useQuery({
    queryKey: ["/api/vendors"],
    queryFn: async () => {
      const response = await fetch("/api/vendors");
      if (!response.ok) throw new Error("Erro ao buscar vendedores");
      return response.json();
    }
  });

  useEffect(() => {
    if (proposals.length > 0) {
      setLastUpdate(new Date());
    }
  }, [proposals.length]);

  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find((v: any) => v.id === vendorId);
    return vendor ? vendor.name : 'Vendedor não encontrado';
  };

  // REGRA ILIMITADA: Detecta automaticamente 1-99+ titulares e dependentes
  const getMaxCounts = () => {
    let maxTitulares = 1; // Mínimo 1 (sem limite máximo)
    let maxDependentes = 0; // Mínimo 0 (pode não ter dependentes)
    
    proposals.forEach((proposal: any) => {
      const titulares = proposal.titulares || [];
      const dependentes = proposal.dependentes || [];
      
      // Detecta até 99+ titulares automaticamente
      if (titulares.length > maxTitulares) {
        maxTitulares = Math.min(titulares.length, 99); // Máximo 99
      }
      
      // Detecta até 99+ dependentes automaticamente  
      if (dependentes.length > maxDependentes) {
        maxDependentes = Math.min(dependentes.length, 99); // Máximo 99
      }
    });
    
    // Garantir pelo menos 1 titular (obrigatório)
    maxTitulares = Math.max(maxTitulares, 1);
    
    return { maxTitulares, maxDependentes };
  };

  const { maxTitulares, maxDependentes } = getMaxCounts();

  // Função para extrair TODOS os campos dinâmicos automaticamente
  const extrairTodosCamposDinamicos = (obj: any, prefix: string = ''): any => {
    const campos: any = {};
    
    if (!obj || typeof obj !== 'object') return campos;
    
    Object.keys(obj).forEach(key => {
      const valor = obj[key];
      const nomeCompleto = prefix ? `${prefix}_${key.toUpperCase()}` : key.toUpperCase();
      
      if (valor !== null && valor !== undefined) {
        if (typeof valor === 'object' && !Array.isArray(valor)) {
          // Expandir objetos aninhados
          const camposAninhados = extrairTodosCamposDinamicos(valor, nomeCompleto);
          Object.assign(campos, camposAninhados);
        } else if (Array.isArray(valor)) {
          // Arrays - contar quantidade e extrair dados
          campos[`${nomeCompleto}_QUANTIDADE`] = valor.length;
          if (valor.length > 0) {
            campos[`${nomeCompleto}_LISTA`] = valor.map((item: any) => 
              typeof item === 'object' ? JSON.stringify(item) : String(item)
            ).join('; ');
          }
        } else {
          // Valores primitivos
          campos[nomeCompleto] = String(valor);
        }
      }
    });
    
    return campos;
  };

  const formatarDados = () => {
    return proposals.map((proposal: any) => {
      const contractData = proposal.contractData || {};
      const titulares = proposal.titulares || [];
      const dependentes = proposal.dependentes || [];
      const internalData = proposal.internalData || {};
      const vendorAttachments = proposal.vendorAttachments || [];
      const clientAttachments = proposal.clientAttachments || [];

      // ESTRUTURA HORIZONTAL COMPLETA - UMA EMPRESA = UMA LINHA
      const linhaUnica = {
        // === IDENTIFICAÇÃO BÁSICA ===
        ID: proposal.abmId || proposal.id?.substring(0, 8) || '',
        ID_COMPLETO: proposal.id || '',
        CLIENT_TOKEN: proposal.clientToken || '',
        
        // === DADOS EMPRESA ===
        EMPRESA: contractData.nomeEmpresa || '',
        CNPJ: contractData.cnpj || '',
        PLANO: contractData.planoContratado || '',
        VALOR: contractData.valor || '',
        
        // === CONTROLE ===
        VENDEDOR_ID: proposal.vendorId || '',
        VENDEDOR: getVendorName(proposal.vendorId),
        STATUS: proposal.status || '',
        PRIORIDADE: proposal.priority || '',
        
        // === DATAS ===
        DATA_CRIACAO: new Date(proposal.createdAt).toLocaleDateString('pt-BR'),
        DATA_ATUALIZACAO: new Date(proposal.updatedAt).toLocaleDateString('pt-BR'),
        INICIO_VIGENCIA: contractData.inicioVigencia || '',
        
        // === CONFIGURAÇÕES PLANO ===
        COMPULSORIO: contractData.compulsorio ? 'SIM' : 'NÃO',
        ODONTO_CONJUGADO: contractData.odontoConjugado ? 'SIM' : 'NÃO',
        LIVRE_ADESAO: contractData.livreAdesao ? 'SIM' : 'NÃO',
        PERIODO_MIN_VIGENCIA: contractData.periodoMinVigencia || '',
        
        // === DADOS INTERNOS VENDEDOR ===
        DATA_REUNIAO: internalData.dataReuniao || '',
        OBSERVACOES_VENDEDOR: internalData.observacoesVendedor || '',
        AUTORIZADOR_DESCONTO: internalData.autorizadorDesconto || '',
        NOTAS_FINANCEIRAS: internalData.notasFinanceiras || '',
        
        // === STATUS COMPLETUDE ===
        CLIENTE_COMPLETOU: proposal.clientCompleted ? 'SIM' : 'NÃO',
        PROGRESSO_PERCENT: proposal.progresso || 0,
        
        // === CONTADORES ===
        TOTAL_TITULARES: titulares.length,
        TOTAL_DEPENDENTES: dependentes.length,
        TOTAL_ANEXOS_VENDEDOR: vendorAttachments.length,
        TOTAL_ANEXOS_CLIENTE: clientAttachments.length,
        
        // === DADOS DE COTAÇÃO ===
        COTACAO_VIDAS: contractData.cotacao?.numeroVidas || '',
        COTACAO_OPERADORA: contractData.cotacao?.operadoraSeguro || '',
        COTACAO_ARQUIVO: contractData.cotacao?.arquivoCotacao || '',
        COTACAO_BENEFICIARIOS: contractData.cotacao?.beneficiarios ? JSON.stringify(contractData.cotacao.beneficiarios) : '',
        
        // === DADOS ADICIONAIS ===
        FORMA_PAGAMENTO: contractData.formaPagamento || '',
        OBSERVACOES_GERAIS: contractData.observacoesGerais || '',
        CONDICOES_ESPECIAIS: contractData.condicoesEspeciais || '',
        TIPO_CONTRATO: contractData.tipoContrato || '',
        DESCONTO_APLICADO: contractData.descontoAplicado || '',
        VALOR_ORIGINAL: contractData.valorOriginal || '',
        VALOR_FINAL: contractData.valorFinal || '',
        
        // === DADOS DE CONTROLE AVANÇADO ===
        SITUACAO_PROPOSTA: proposal.situacao || '',
        MOTIVO_PENDENCIA: proposal.motivoPendencia || '',
        DATA_APROVACAO: proposal.dataAprovacao || '',
        DATA_ASSINATURA: proposal.dataAssinatura || '',
        DATA_VIGENCIA_INICIO: proposal.dataVigenciaInicio || '',
        DATA_VIGENCIA_FIM: proposal.dataVigenciaFim || '',
        RESPONSAVEL_APROVACAO: proposal.responsavelAprovacao || '',
        
        // === ARQUIVOS E DOCUMENTOS ===
        LISTA_ARQUIVOS_VENDEDOR: vendorAttachments.map(a => a.name || a.fileName || '').join('; '),
        LISTA_ARQUIVOS_CLIENTE: clientAttachments.map(a => a.name || a.fileName || '').join('; '),
        DOCUMENTOS_PENDENTES: proposal.documentosPendentes ? JSON.stringify(proposal.documentosPendentes) : '',
        
        // === LOGS E HISTÓRICO ===
        HISTORICO_STATUS: proposal.historicoStatus ? JSON.stringify(proposal.historicoStatus) : '',
        HISTORICO_MUDANCAS: proposal.historicoMudancas ? JSON.stringify(proposal.historicoMudancas) : '',
        ULTIMA_INTERACAO: proposal.ultimaInteracao || '',
        TOTAL_ALTERACOES: proposal.totalAlteracoes || 0,
      };

      // === TITULARES DINÂMICOS (CAMPOS BASEADOS NOS DADOS REAIS) ===
      for (let i = 1; i <= maxTitulares; i++) {
        const titular = titulares[i - 1] || {}; // Array começa em 0, mas numeração em 1
        Object.assign(linhaUnica, {
          [`TITULAR${i}_NOME_COMPLETO`]: titular.nomeCompleto || '',
          [`TITULAR${i}_CPF`]: titular.cpf || '',
          [`TITULAR${i}_RG`]: titular.rg || '',
          [`TITULAR${i}_DATA_NASCIMENTO`]: titular.dataNascimento || '',
          [`TITULAR${i}_NOME_MAE`]: titular.nomeMae || '',
          [`TITULAR${i}_SEXO`]: titular.sexo || '',
          [`TITULAR${i}_ESTADO_CIVIL`]: titular.estadoCivil || '',
          [`TITULAR${i}_PESO`]: titular.peso || '',
          [`TITULAR${i}_ALTURA`]: titular.altura || '',
          [`TITULAR${i}_EMAIL_PESSOAL`]: titular.emailPessoal || '',
          [`TITULAR${i}_TELEFONE_PESSOAL`]: titular.telefonePessoal || '',
          [`TITULAR${i}_EMAIL_EMPRESA`]: titular.emailEmpresa || '',
          [`TITULAR${i}_TELEFONE_EMPRESA`]: titular.telefoneEmpresa || '',
          [`TITULAR${i}_CEP`]: titular.cep || '',
          [`TITULAR${i}_ENDERECO_COMPLETO`]: titular.enderecoCompleto || '',
          [`TITULAR${i}_DADOS_REEMBOLSO`]: titular.dadosReembolso || '',
        });
      }

      // === DEPENDENTES DINÂMICOS (CAMPOS BASEADOS NOS DADOS REAIS) ===
      for (let i = 1; i <= maxDependentes; i++) {
        const dependente = dependentes[i - 1] || {}; // Array começa em 0, mas numeração em 1
        Object.assign(linhaUnica, {
          [`DEPENDENTE${i}_NOME_COMPLETO`]: dependente.nomeCompleto || '',
          [`DEPENDENTE${i}_CPF`]: dependente.cpf || '',
          [`DEPENDENTE${i}_RG`]: dependente.rg || '',
          [`DEPENDENTE${i}_DATA_NASCIMENTO`]: dependente.dataNascimento || '',
          [`DEPENDENTE${i}_PARENTESCO`]: dependente.parentesco || '',
          [`DEPENDENTE${i}_NOME_MAE`]: dependente.nomeMae || '',
          [`DEPENDENTE${i}_SEXO`]: dependente.sexo || '',
          [`DEPENDENTE${i}_ESTADO_CIVIL`]: dependente.estadoCivil || '',
          [`DEPENDENTE${i}_PESO`]: dependente.peso || '',
          [`DEPENDENTE${i}_ALTURA`]: dependente.altura || '',
          [`DEPENDENTE${i}_EMAIL_PESSOAL`]: dependente.emailPessoal || '',
          [`DEPENDENTE${i}_TELEFONE_PESSOAL`]: dependente.telefonePessoal || '',
          [`DEPENDENTE${i}_EMAIL_EMPRESA`]: dependente.emailEmpresa || '',
          [`DEPENDENTE${i}_TELEFONE_EMPRESA`]: dependente.telefoneEmpresa || '',
          [`DEPENDENTE${i}_CEP`]: dependente.cep || '',
          [`DEPENDENTE${i}_ENDERECO_COMPLETO`]: dependente.enderecoCompleto || '',
          [`DEPENDENTE${i}_DADOS_REEMBOLSO`]: dependente.dadosReembolso || '',
        });
      }

      // === CAMPOS EXTRAS DINÂMICOS ===
      // Tentar extrair qualquer campo adicional que possa estar no objeto proposal
      const extraFields = {};
      
      // Verificar se há dados adicionais no objeto principal
      Object.keys(proposal).forEach(key => {
        if (!['id', 'clientToken', 'contractData', 'vendorId', 'status', 'priority', 'createdAt', 'updatedAt', 'clientCompleted', 'progresso'].includes(key)) {
          const value = proposal[key];
          if (value !== null && value !== undefined) {
            if (typeof value === 'object') {
              extraFields[`EXTRA_${key.toUpperCase()}`] = JSON.stringify(value);
            } else {
              extraFields[`EXTRA_${key.toUpperCase()}`] = String(value);
            }
          }
        }
      });

      // Verificar se há dados adicionais no contractData
      Object.keys(contractData).forEach(key => {
        if (!['nomeEmpresa', 'cnpj', 'planoContratado', 'valor', 'inicioVigencia', 'compulsorio', 'odontoConjugado', 'livreAdesao', 'periodoMinVigencia', 'cotacao'].includes(key)) {
          const value = contractData[key];
          if (value !== null && value !== undefined) {
            if (typeof value === 'object') {
              extraFields[`CONTRACT_${key.toUpperCase()}`] = JSON.stringify(value);
            } else {
              extraFields[`CONTRACT_${key.toUpperCase()}`] = String(value);
            }
          }
        }
      });

      // Verificar se há dados adicionais no internalData
      Object.keys(internalData).forEach(key => {
        if (!['dataReuniao', 'observacoesVendedor', 'autorizadorDesconto', 'notasFinanceiras'].includes(key)) {
          const value = internalData[key];
          if (value !== null && value !== undefined) {
            if (typeof value === 'object') {
              extraFields[`INTERNAL_${key.toUpperCase()}`] = JSON.stringify(value);
            } else {
              extraFields[`INTERNAL_${key.toUpperCase()}`] = String(value);
            }
          }
        }
      });

      // === EXTRAÇÃO AUTOMÁTICA DE TODOS OS CAMPOS DINÂMICOS ===
      // Usar a função de extração dinâmica para pegar TODOS os campos automaticamente
      const camposContractData = extrairTodosCamposDinamicos(contractData, 'CONTRACT');
      const camposInternalData = extrairTodosCamposDinamicos(internalData, 'INTERNAL');
      const camposProposalExtra = extrairTodosCamposDinamicos(proposal, 'PROPOSAL');
      
      // Adicionar todos os campos extras e dinâmicos encontrados
      Object.assign(linhaUnica, extraFields, camposContractData, camposInternalData, camposProposalExtra);

      return linhaUnica;
    });
  };

  const dadosFormatados = formatarDados();
  const colunas = dadosFormatados.length > 0 ? Object.keys(dadosFormatados[0]) : [];

  const exportarCSV = () => {
    if (dadosFormatados.length === 0) return;

    const csvContent = [
      colunas.join(','),
      ...dadosFormatados.map(linha => 
        colunas.map(coluna => `"${linha[coluna] || '[vazio]'}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `planilha_sistema_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const forcarAtualizacao = () => {
    refetch();
    setLastUpdate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Visualizador de Planilha em Tempo Real</h3>
              <p className="text-gray-600">Formato de dados antes da integração com Google Sheets</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={forcarAtualizacao}
              disabled={isLoading}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={exportarCSV}
              disabled={dadosFormatados.length === 0}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar CSV
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-700">Total de Propostas</p>
                <p className="text-2xl font-bold text-blue-900">{proposals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-700">Colunas Geradas</p>
                <p className="text-2xl font-bold text-green-900">{colunas.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-700">Última Atualização</p>
                <p className="text-sm font-semibold text-purple-900">
                  {lastUpdate.toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações sobre estrutura dinâmica */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">📋 Estrutura Dinâmica - Uma Empresa = Uma Linha</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white rounded p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Máximo Titulares</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{maxTitulares}</p>
              <p className="text-xs text-gray-600">campos criados dinamicamente</p>
            </div>

            <div className="bg-white rounded p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-900">Máximo Dependentes</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{maxDependentes}</p>
              <p className="text-xs text-gray-600">campos criados dinamicamente</p>
            </div>

            <div className="bg-white rounded p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">Total Colunas</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{colunas.length}</p>
              <p className="text-xs text-gray-600">campos por linha</p>
            </div>

            <div className="bg-white rounded p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-900">Campos Dinâmicos</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">AUTO</p>
              <p className="text-xs text-gray-600">detectados automaticamente</p>
            </div>
          </div>
        </div>

        {/* Detalhamento Completo dos Campos - OCULTO */}
        <div className="hidden bg-white border rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">🗂️ Campos Incluídos na Planilha (Total: {colunas.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium text-blue-800">📋 Campos Básicos (30+)</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• ID_COMPLETO, CLIENT_TOKEN</div>
                <div>• EMPRESA, CNPJ, PLANO, VALOR</div>
                <div>• VENDEDOR_ID, VENDEDOR</div>
                <div>• STATUS, PRIORIDADE</div>
                <div>• DATAS (Criação, Atualização, Vigência)</div>
                <div>• CONFIGURAÇÕES (Compulsório, Odonto, etc.)</div>
                <div>• DADOS INTERNOS (Reunião, Observações)</div>
                <div>• COTAÇÃO (Vidas, Operadora, Arquivo)</div>
                <div>• FINANCEIRO (Pagamento, Descontos)</div>
                <div>• STATUS COMPLETUDE, PROGRESSO</div>
                <div>• CONTADORES (Titulares, Dependentes, Anexos)</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium text-purple-800">👥 Pessoas ({maxTitulares * 16 + maxDependentes * 17})</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• <strong>Titulares ({maxTitulares} × 16 campos):</strong></div>
                <div>  Nome, CPF, RG, Data Nascimento</div>
                <div>  Nome Mãe, Sexo, Estado Civil</div>
                <div>  Peso, Altura, Emails, Telefones</div>
                <div>  CEP, Endereço, Dados Reembolso</div>
                <div className="mt-2">• <strong>Dependentes ({maxDependentes} × 17 campos):</strong></div>
                <div>  Todos os campos dos titulares +</div>
                <div>  Parentesco (específico para dependentes)</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium text-green-800">📊 Dados Extras (30+)</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• <strong>Cotação (4):</strong> Vidas, Operadora, Arquivo, Beneficiários</div>
                <div>• <strong>Financeiro (7):</strong> Forma Pagamento, Descontos, Valores</div>
                <div>• <strong>Controle (7):</strong> Situação, Aprovação, Assinatura</div>
                <div>• <strong>Documentos (3):</strong> Listas de Arquivos, Pendências</div>
                <div>• <strong>Histórico (3):</strong> Status, Interações, Alterações</div>
                <div>• <strong>Campos Dinâmicos:</strong> Detectados automaticamente</div>
                <div>  dos dados reais (EXTRA_, CONTRACT_, INTERNAL_)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview da Planilha */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              Preview dos Dados da Planilha
            </h4>
            <span className="text-gray-600 text-sm">
              Visualização em tempo real dos dados formatados para Google Sheets
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              ↔️ Role horizontalmente para ver todos os {colunas.length} campos
            </span>
            <span className="flex items-center gap-1">
              🔄 Atualização automática a cada 5 segundos
            </span>
            <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded">
              📊 {proposals.length} propostas carregadas
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando dados...</p>
          </div>
        ) : dadosFormatados.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma proposta encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-60 border border-gray-300 rounded-lg">
            <table className="min-w-max w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {colunas.map((coluna, index) => (
                    <th 
                      key={coluna} 
                      className="px-3 py-2 text-left text-xs font-bold text-gray-800 border-r border-gray-300 min-w-[100px] max-w-[150px] whitespace-nowrap"
                      style={{ position: 'sticky', top: 0, backgroundColor: '#f3f4f6' }}
                    >
                      <div className="truncate" title={coluna}>
                        {index + 1}. {coluna}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dadosFormatados.map((linha, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}
                  >
                    {colunas.map((coluna) => (
                      <td 
                        key={coluna} 
                        className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200 min-w-[100px] max-w-[150px] whitespace-nowrap overflow-hidden"
                        title={String(linha[coluna] || '[vazio]')}
                      >
                        <div className="truncate">
                          {linha[coluna] ? (
                            <span className="text-gray-900">{String(linha[coluna])}</span>
                          ) : (
                            <span className="text-gray-400 italic text-xs">[vazio]</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">
                Role horizontalmente para navegar pelos {colunas.length} campos
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controle de Planilhas Conectadas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h4 className="text-base font-semibold">Planilhas Conectadas (1)</h4>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span className="font-medium text-gray-900">Planilha Principal</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">Sistema</span>
              </div>
              
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">URL:</span>
                  <span className="ml-2 text-blue-600">https://docs.google.com/spreadsheets/d/1JiC3ksTCdnY3uL9GhG9u8gJO...</span>
                </div>
                <div className="flex items-center gap-4">
                  <span><span className="font-medium">👤 Proprietário:</span> Admin</span>
                  <span><span className="font-medium">🔗 Link Compartilhamento:</span> <span className="text-green-600">Acessar</span></span>
                </div>
                <div className="flex items-center gap-4">
                  <span><span className="font-medium">🔌 Conectado</span></span>
                  <span><span className="font-medium">📅 2025-07-28T12:23:44.325Z</span></span>
                  <span><span className="font-medium">🔗 Conectada</span></span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
                📂 Abrir
              </button>
              <button className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors">
                🗑️ Remover
              </button>
              <button className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors">
                ✏️ Editar
              </button>
              <button className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors">
                💾 Backup Manual
              </button>
              <select className="px-2 py-1 border border-gray-300 rounded text-xs">
                <option>5 minutos</option>
                <option>10 minutos</option>
                <option>30 minutos</option>
                <option>1 hora</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Estrutura Completa das Colunas - OCULTO */}
      <div className="hidden bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold mb-4">📊 Estrutura Completa das Colunas</h4>
        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {colunas.map((coluna, index) => (
              <div key={coluna} className="flex items-center justify-between py-1 px-2 bg-white rounded border">
                <span className="font-mono text-gray-700">{coluna}</span>
                <span className="text-xs text-gray-500">#{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Total de {colunas.length} colunas sendo geradas automaticamente
        </p>
      </div>
    </div>
  );
}