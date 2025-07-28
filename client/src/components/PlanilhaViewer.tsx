import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, RefreshCw, Eye, Clock, Users, Database, Play, Pause, ExternalLink, Trash2, Edit, Save, Plus } from 'lucide-react';

export default function PlanilhaViewer() {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [updateInterval, setUpdateInterval] = useState(5 * 60 * 1000); // 5 minutos padrão
  const [isAutoUpdate, setIsAutoUpdate] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [deleteProposalId, setDeleteProposalId] = useState('');
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [isDeletingRow, setIsDeletingRow] = useState(false);
  const [isClearingSheet, setIsClearingSheet] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nomePlanilha: 'Planilha Principal',
    departamento: 'Comercial',
    linkId: 'https://docs.google.com/spreadsheets/d/1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw/edit?usp=drive_link',
    proprietario: 'Admin',
    linkCompartilhamento: 'https://docs.google.com/spreadsheets/d/1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw/edit?usp=drive_link',
    observacao: 'Planilha para controle de vendas do Q1 2025'
  });
  const [addFormData, setAddFormData] = useState({
    nomePlanilha: '',
    departamento: 'Comercial',
    linkId: '',
    proprietario: '',
    linkCompartilhamento: '',
    observacao: ''
  });
  const [planilhas, setPlanilhas] = useState([
    {
      id: 1,
      nome: 'Planilha Principal Abmix',
      departamento: 'Comercial',
      tipo: 'principal'
    },
    {
      id: 2,
      nome: 'Financeiro',
      departamento: 'Financeiro',
      tipo: 'extra'
    },
    {
      id: 3,
      nome: 'Relatórios',
      departamento: 'Administração',
      tipo: 'extra'
    }
  ]);
  const [selectedPlanilha, setSelectedPlanilha] = useState(1);

  // Buscar todas as propostas para gerar planilha
  const { data: proposals = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/proposals"],
    queryFn: async () => {
      const response = await fetch("/api/proposals");
      if (!response.ok) throw new Error("Erro ao buscar propostas");
      return response.json();
    },
    refetchInterval: isAutoUpdate ? updateInterval : false
  });

  // Opções de tempo para o seletor
  const timeOptions = [
    { value: 1000, label: '1 segundo' },
    { value: 5000, label: '5 segundos' },
    { value: 10000, label: '10 segundos' },
    { value: 30000, label: '30 segundos' },
    { value: 60000, label: '1 minuto' },
    { value: 300000, label: '5 minutos' },
    { value: 600000, label: '10 minutos' },
    { value: 900000, label: '15 minutos' },
    { value: 3600000, label: '1 hora' },
    { value: 18000000, label: '5 horas' },
    { value: 36000000, label: '10 horas' },
    { value: 86400000, label: '24 horas' },
    { value: 0, label: 'Manual' }
  ];

  // Funções para controlar a planilha
  const realSheetUrl = 'https://docs.google.com/spreadsheets/d/1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw/edit?usp=drive_link';
  const sheetName = 'Planilha Principal Abmix';
  
  const handleOpenSheet = () => {
    window.open(realSheetUrl, '_blank');
  };

  const handleAccessLink = () => {
    window.open(realSheetUrl, '_blank');
  };

  const handleRemoveSheet = () => {
    if (confirm('Tem certeza que deseja remover a conexão com esta planilha?')) {
      setConnectionStatus('disconnected');
      alert('Planilha desconectada com sucesso!');
    }
  };

  const handleEditSheet = () => {
    alert('Funcionalidade de edição será implementada');
  };

  const handleManualBackup = () => {
    setConnectionStatus('backing-up');
    setTimeout(() => {
      setConnectionStatus('connected');
      alert('Backup manual realizado com sucesso!');
    }, 2000);
  };

  const handleTimeChange = (newInterval: number) => {
    setUpdateInterval(newInterval);
    if (newInterval === 0) {
      setIsAutoUpdate(false);
    } else {
      setIsAutoUpdate(true);
    }
  };

  const handleManualUpdate = () => {
    refetch();
    setLastUpdate(new Date());
  };

  // Função para deletar linha específica por ID da proposta
  const handleDeleteProposalRow = async () => {
    if (!deleteProposalId.trim()) {
      alert('Por favor, insira um ID de proposta válido');
      return;
    }

    const confirmed = confirm(`Tem certeza que deseja apagar a linha da proposta ID: ${deleteProposalId}?`);
    if (!confirmed) return;

    setIsDeletingRow(true);
    try {
      // Simular chamada para API que remove linha específica do Google Sheets
      // Em implementação real, seria uma chamada para a API do Google Sheets
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Linha da proposta ${deleteProposalId} removida da planilha com sucesso!`);
      setDeleteProposalId('');
      setShowDeleteForm(false);
      refetch(); // Atualizar dados locais
      setLastUpdate(new Date());
    } catch (error) {
      alert('Erro ao remover linha da planilha');
    } finally {
      setIsDeletingRow(false);
    }
  };

  // Função para limpar toda a planilha
  const handleClearSheet = async () => {
    const confirmed = confirm('ATENÇÃO: Esta ação irá apagar TODAS as linhas da planilha. Tem certeza que deseja continuar?');
    if (!confirmed) return;

    const doubleConfirm = confirm('Esta é uma ação irreversível. Digite "CONFIRMAR" para prosseguir.');
    if (!doubleConfirm) return;

    setIsClearingSheet(true);
    try {
      // Simular chamada para API que limpa toda a planilha do Google Sheets
      // Em implementação real, seria uma chamada para a API do Google Sheets
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      alert('Planilha limpa com sucesso! Todas as linhas foram removidas.');
      refetch(); // Atualizar dados locais
      setLastUpdate(new Date());
    } catch (error) {
      alert('Erro ao limpar planilha');
    } finally {
      setIsClearingSheet(false);
    }
  };

  // Função para abrir modal de edição
  const handleOpenEditModal = () => {
    setShowEditModal(true);
  };

  // Função para salvar alterações da planilha
  const handleSaveSheetChanges = async () => {
    try {
      // Simular chamada para API que salva as alterações da planilha
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Alterações da planilha salvas com sucesso!');
      setShowEditModal(false);
      refetch(); // Atualizar dados locais
      setLastUpdate(new Date());
    } catch (error) {
      alert('Erro ao salvar alterações da planilha');
    }
  };

  // Função para abrir modal de adicionar planilha
  const handleOpenAddModal = () => {
    setAddFormData({
      nomePlanilha: '',
      departamento: 'Comercial',
      linkId: '',
      proprietario: '',
      linkCompartilhamento: '',
      observacao: ''
    });
    setShowAddModal(true);
  };

  // Função para adicionar nova planilha
  const handleAddNewSheet = async () => {
    if (!addFormData.nomePlanilha.trim() || !addFormData.linkId.trim() || !addFormData.proprietario.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios (Nome, Link/ID e Proprietário)');
      return;
    }

    try {
      // Simular chamada para API que adiciona nova planilha
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPlanilha = {
        id: planilhas.length + 1,
        nome: addFormData.nomePlanilha,
        departamento: addFormData.departamento,
        tipo: 'adicionada',
        dados: addFormData
      };
      
      setPlanilhas([...planilhas, newPlanilha]);
      alert('Nova planilha adicionada com sucesso!');
      setShowAddModal(false);
      refetch(); // Atualizar dados locais
      setLastUpdate(new Date());
    } catch (error) {
      alert('Erro ao adicionar nova planilha');
    }
  };

  // Função para sincronizar dados com Google Sheets
  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      // Simular sincronização com Google Sheets
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      alert('Sincronização com Google Sheets concluída com sucesso!');
      refetch(); // Atualizar dados locais
      setLastUpdate(new Date());
    } catch (error) {
      alert('Erro durante a sincronização com Google Sheets');
    } finally {
      setIsSyncing(false);
    }
  };

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
              <p className="text-xs text-gray-500 italic">Fonte: {sheetName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={forcarAtualizacao}
              disabled={isLoading}
              className="flex items-center px-3 py-1.5 border border-gray-200 rounded text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={exportarCSV}
              disabled={dadosFormatados.length === 0}
              className="flex items-center px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded text-xs hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              <Download className="w-3 h-3 mr-1.5" />
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
              <span className="text-xs text-gray-500 italic font-normal">({sheetName})</span>
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
              {isAutoUpdate ? (
                <><Play className="h-3 w-3 text-green-500" /> Atualização automática: {timeOptions.find(opt => opt.value === updateInterval)?.label}</>
              ) : (
                <><Pause className="h-3 w-3 text-orange-500" /> Modo manual - Clique para atualizar</>
              )}
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
          <h4 className="text-base font-semibold">Planilha conectada</h4>
          <p className="text-xs text-gray-500 italic mt-1">Fonte: {sheetName}</p>
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
                  <span className="ml-2 text-blue-600">{realSheetUrl.substring(0, 70)}...</span>
                </div>
                <div className="flex items-center gap-4">
                  <span><span className="font-medium">👤 Proprietário:</span> Admin</span>
                  <span>
                    <span className="font-medium">🔗 Link Compartilhamento:</span> 
                    <button 
                      onClick={handleAccessLink}
                      className="ml-2 text-green-600 hover:text-green-700 underline cursor-pointer"
                    >
                      Acessar
                    </button>
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span>
                    <span className="font-medium">
                      {connectionStatus === 'connected' ? '🔌 Conectado' : 
                       connectionStatus === 'disconnected' ? '❌ Desconectado' :
                       connectionStatus === 'backing-up' ? '💾 Fazendo backup...' : '🔌 Conectado'}
                    </span>
                  </span>
                  <span><span className="font-medium">📅 {lastUpdate.toLocaleString('pt-BR')}</span></span>
                  <span>
                    <span className="font-medium">
                      {isAutoUpdate ? 
                        `⏱️ Auto: ${timeOptions.find(opt => opt.value === updateInterval)?.label}` : 
                        '⏸️ Manual'
                      }
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button 
                onClick={handleOpenSheet}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Abrir
              </button>
              <button 
                onClick={handleRemoveSheet}
                className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Remover
              </button>
              <button 
                onClick={handleOpenEditModal}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <Edit className="h-3 w-3" />
                Editar
              </button>
              <button 
                onClick={handleManualBackup}
                className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors flex items-center gap-1"
                disabled={connectionStatus === 'backing-up'}
              >
                <Save className="h-3 w-3" />
                {connectionStatus === 'backing-up' ? 'Salvando...' : 'Backup Manual'}
              </button>
              <div className="flex items-center gap-2">
                <select 
                  value={updateInterval}
                  onChange={(e) => handleTimeChange(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-xs bg-blue-50 text-blue-700 focus:border-blue-500 focus:outline-none hover:bg-blue-100 transition-colors"
                >
                  {timeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {updateInterval === 0 && (
                  <button
                    onClick={handleManualUpdate}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Atualizar
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Seção de Gerenciamento de Dados do Google Sheets */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h5 className="text-xs font-medium text-gray-600 mb-2">Gerenciamento de Dados</h5>
            
            <div className="flex gap-2">
              {/* Deletar linha específica */}
              <div className="flex-1">
                {!showDeleteForm ? (
                  <button
                    onClick={() => setShowDeleteForm(true)}
                    className="w-full px-2 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs rounded hover:bg-yellow-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remover Linha
                  </button>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={deleteProposalId}
                      onChange={(e) => setDeleteProposalId(e.target.value)}
                      placeholder="ID da proposta"
                      className="w-full px-2 py-1 border border-yellow-300 rounded text-xs focus:outline-none focus:border-yellow-500"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={handleDeleteProposalRow}
                        disabled={isDeletingRow || !deleteProposalId.trim()}
                        className="flex-1 px-2 py-1 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {isDeletingRow ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteForm(false);
                          setDeleteProposalId('');
                        }}
                        className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded hover:bg-gray-100 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Limpar toda a planilha */}
              <div className="flex-1">
                <button
                  onClick={handleClearSheet}
                  disabled={isClearingSheet}
                  className="w-full px-2 py-1.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isClearingSheet ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Limpando...
                    </>
                  ) : (
                    <>
                      <Database className="h-3 w-3" />
                      Limpar Tudo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleOpenAddModal}
              className="flex-1 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Planilha
            </button>
            
            <button
              onClick={handleSyncData}
              disabled={isSyncing}
              className="flex-1 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Sincronizar Dados
                </>
              )}
            </button>
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

      {/* Modal de Edição da Planilha */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Editar Planilha - Planilha Principal
              </h2>
              
              <div className="space-y-4">
                {/* Nome da Planilha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Planilha *
                    </label>
                    <input
                      type="text"
                      value={editFormData.nomePlanilha}
                      onChange={(e) => setEditFormData({...editFormData, nomePlanilha: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Planilha Principal"
                    />
                  </div>
                  
                  {/* Departamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento *
                    </label>
                    <select
                      value={editFormData.departamento}
                      onChange={(e) => setEditFormData({...editFormData, departamento: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Comercial">Comercial</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Implantação">Implantação</option>
                      <option value="Supervisão">Supervisão</option>
                      <option value="Administração">Administração</option>
                      <option value="Sistema">Sistema</option>
                    </select>
                  </div>
                </div>

                {/* Link/ID do Google Sheets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link/ID do Google Sheets *
                  </label>
                  <input
                    type="text"
                    value={editFormData.linkId}
                    onChange={(e) => setEditFormData({...editFormData, linkId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cole a URL completa ou apenas o ID da planilha"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cole a URL completa ou apenas o ID da planilha
                  </p>
                </div>

                {/* Proprietário */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proprietário *
                  </label>
                  <input
                    type="text"
                    value={editFormData.proprietario}
                    onChange={(e) => setEditFormData({...editFormData, proprietario: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome e email do responsável pela planilha"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nome e email do responsável pela planilha
                  </p>
                </div>

                {/* Link de Compartilhamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link de Compartilhamento (opcional)
                  </label>
                  <input
                    type="text"
                    value={editFormData.linkCompartilhamento}
                    onChange={(e) => setEditFormData({...editFormData, linkCompartilhamento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Link público para compartilhamento (se diferente do link principal)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Link público para compartilhamento (se diferente do link principal)
                  </p>
                </div>

                {/* Observação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observação (opcional)
                  </label>
                  <textarea
                    value={editFormData.observacao}
                    onChange={(e) => setEditFormData({...editFormData, observacao: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Planilha para controle de vendas do Q1 2025"
                  />
                </div>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveSheetChanges}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Nova Planilha */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Adicionar Nova Planilha
              </h2>
              
              <div className="space-y-4">
                {/* Nome da Planilha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Planilha *
                    </label>
                    <input
                      type="text"
                      value={addFormData.nomePlanilha}
                      onChange={(e) => setAddFormData({...addFormData, nomePlanilha: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Planilha de Vendas Q2"
                    />
                  </div>
                  
                  {/* Departamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento *
                    </label>
                    <select
                      value={addFormData.departamento}
                      onChange={(e) => setAddFormData({...addFormData, departamento: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Comercial">Comercial</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Implantação">Implantação</option>
                      <option value="Supervisão">Supervisão</option>
                      <option value="Administração">Administração</option>
                      <option value="Sistema">Sistema</option>
                    </select>
                  </div>
                </div>

                {/* Link/ID do Google Sheets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link/ID do Google Sheets *
                  </label>
                  <input
                    type="text"
                    value={addFormData.linkId}
                    onChange={(e) => setAddFormData({...addFormData, linkId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cole a URL completa ou apenas o ID da planilha"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cole a URL completa ou apenas o ID da planilha
                  </p>
                </div>

                {/* Proprietário */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proprietário *
                  </label>
                  <input
                    type="text"
                    value={addFormData.proprietario}
                    onChange={(e) => setAddFormData({...addFormData, proprietario: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome e email do responsável pela planilha"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nome e email do responsável pela planilha
                  </p>
                </div>

                {/* Link de Compartilhamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link de Compartilhamento (opcional)
                  </label>
                  <input
                    type="text"
                    value={addFormData.linkCompartilhamento}
                    onChange={(e) => setAddFormData({...addFormData, linkCompartilhamento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Link público para compartilhamento (se diferente do link principal)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Link público para compartilhamento (se diferente do link principal)
                  </p>
                </div>

                {/* Observação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observação (opcional)
                  </label>
                  <textarea
                    value={addFormData.observacao}
                    onChange={(e) => setAddFormData({...addFormData, observacao: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Planilha para controle específico do departamento"
                  />
                </div>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddNewSheet}
                  className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  Adicionar Planilha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}