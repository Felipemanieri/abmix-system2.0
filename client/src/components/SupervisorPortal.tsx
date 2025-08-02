import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BarChart3, Users, TrendingUp, DollarSign, FileText, Target, Calculator, UserPlus, Bell, MessageSquare, MessageCircle, LogOut, X, CheckCircle, XCircle, AlertCircle, Calendar, PieChart, Settings, Award, Plus, Edit, Trash2, Save, Filter, Search, Download, Eye, ExternalLink, Share, Share2, Clock, User, RefreshCw, Zap, AlertTriangle, Heart, TrendingDown, Mail, Phone, Copy } from 'lucide-react';
import { format, isWithinInterval, subDays, subMonths, subWeeks, parseISO } from 'date-fns';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart, Pie } from 'recharts';
// import AbmixLogo from './AbmixLogo';
import SimpleProgressBar from './SimpleProgressBar';
import ProgressBar from './ProgressBar';
import ActionButtons from './ActionButtons';
import NotificationCenter from './NotificationCenter';
import AdvancedInternalMessage from './AdvancedInternalMessage';
import MessageNotificationBadge from './MessageNotificationBadge';
import { WelcomeMessage } from './WelcomeMessage';

import SystemFooter from './SystemFooter';
import ThemeToggle from './ThemeToggle';
import StatusManager, { ProposalStatus, STATUS_CONFIG } from '@shared/statusSystem';
import StatusBadge from './StatusBadge';
import FolderNameEditor from './FolderNameEditor';
import { apiRequest } from '@/lib/queryClient';
import { queryClient as queryClientInstance } from '@/lib/queryClient';
// import { showNotification } from '@/utils/notifications';
import { realTimeSync } from '@/utils/realTimeSync';
import { useSupervisorReport } from '@/hooks/useSupervisorReport';
import { getDynamicGreeting } from '../utils/greetingHelper';
import { globalSyncConfig } from '@/utils/globalSyncConfig';
import { useSupervisorWebSocket } from '@/hooks/useWebSocket';
import { useProposals } from '@/hooks/useProposals';
import { calculateProposalProgress } from '@shared/progressCalculator';

interface SupervisorPortalProps {
  user: any;
  onLogout: () => void;
}

type SupervisorView = 'dashboard' | 'metas' | 'premiacao' | 'analytics' | 'team' | 'propostas' | 'relatorios';

interface VendorTarget {
  id: number;
  vendorId: number;
  month: number;
  year: number;
  targetValue: string;
  targetProposals: number;
  bonus: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamTarget {
  id: number;
  month: number;
  year: number;
  targetValue: string;
  targetProposals: number;
  teamBonus: string;
  createdAt: string;
  updatedAt: string;
}

interface Award {
  id: number;
  vendorId: number;
  title: string;
  description: string;
  value: string;
  type: 'monetary' | 'recognition' | 'bonus';
  dateAwarded: string;
  createdAt: string;
}

export function SupervisorPortal({ user, onLogout }: SupervisorPortalProps) {
  const [activeView, setActiveView] = useState<SupervisorView>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  const getMotivationalMessage = (progress: number) => {
    if (progress >= 100) {
      return "🎉 Parabéns! Meta alcançada!";
    } else if (progress >= 90) {
      return "💪 Quase lá! Força total!";
    } else if (progress >= 70) {
      return "🚀 Ótimo ritmo! Continue!";
    } else if (progress >= 50) {
      return "⭐ Bom progresso! Vamos lá!";
    } else if (progress >= 30) {
      return "📈 Acelere o passo!";
    } else if (progress >= 10) {
      return "🎯 Foque na meta!";
    } else {
      return "💪 Comece com tudo!";
    }
  };

  // Função local para notificações
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Implementação simples via console por enquanto
  };
  
  // WEBSOCKET TEMPORARIAMENTE DESABILITADO - corrigindo múltiplas conexões
  // const { isConnected: isWebSocketConnected } = useSupervisorWebSocket(user.id);
  const isWebSocketConnected = false;
  
  // DESABILITAR TODAS AS NOTIFICAÇÕES DO SUPERVISOR PORTAL
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // FORÇAR NOTIFICAÇÕES VAZIAS SEMPRE
    setNotifications([]);
    // Notificações removidas
  }, [user.name]);
  const [showInternalMessage, setShowInternalMessage] = useState(false);
  const [selectedProposalForMessage, setSelectedProposalForMessage] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Buscar propostas com tratamento robusto
  const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ['/api/proposals'],
    queryFn: () => apiRequest('/api/proposals'),
    refetchInterval: 1000, // 1 segundo - resposta imediata
    retry: false, // Sem retry para evitar erros
  });

  // Buscar vendedores com tratamento robusto
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ['/api/vendors'],
    queryFn: () => apiRequest('/api/vendors'),
    refetchInterval: 1000, // 1 segundo - resposta imediata
    retry: false, // Sem retry para evitar erros
  });
  
  // REALTIME SYNC TEMPORARIAMENTE DESABILITADO - causando erros repetidos
  // useEffect(() => {
  //   realTimeSync.enableAggressivePolling();
  // }, []);

  // useEffect(() => {
  //   if (vendors.length > 0 && proposals.length > 0) {
  //     console.log('Sincronizando dados: Vendedores atualizado:', vendors.length, 'Propostas:', proposals.length);
  //     setTimeout(() => {
  //       realTimeSync.forceRefresh();
  //     }, 100);
  //   }
  // }, [vendors.length, proposals.length]);



  // Funções para os botões de relatório
  const generateReportData = (filteredData: any[]) => {
    if (!filteredData || !Array.isArray(filteredData)) {
      console.log('Dados filtrados inválidos:', filteredData);
      return [];
    }
    
    console.log('Gerando dados do relatório para:', filteredData.length, 'propostas');
    
    return filteredData.map(proposal => {
      // Buscar o nome do vendedor pelos dados do vendorId
      let vendorName = 'N/A';
      if (proposal.vendorId && vendors?.length > 0) {
        const vendor = vendors.find(v => v.id === proposal.vendorId);
        vendorName = vendor?.name || 'N/A';
      }

      // Extrair dados de venda dupla dos controles internos
      const internalData = proposal.internalData || {};
      const isVendaDupla = internalData.vendaDupla || false;
      const vendedor2Name = internalData.nomeVendaDupla || '';
      const nomeReuniao = internalData.nomeReuniao || '';
      const desconto = internalData.desconto || '0%';
      const autorizadorDesconto = internalData.autorizadorDesconto || '';
      
      const reportItem = {
        abmId: proposal.abmId || proposal.id || 'N/A',
        numeroProposta: proposal.numeroProposta || null,
        numeroApolice: proposal.numeroApolice || null,
        cliente: proposal.contractData?.nomeEmpresa || proposal.folderName || proposal.cliente || 'Empresa não informada',
        cnpj: proposal.contractData?.cnpj || 'CNPJ não informado', 
        valor: proposal.contractData?.valor || proposal.valor || '0',
        plano: proposal.contractData?.planoContratado || proposal.plano || 'N/A',
        status: proposal.status || 'pendente',
        desconto: desconto,
        autorizadorDesconto: autorizadorDesconto,
        observacoes: proposal.observacoes || '',
        vendedor: vendorName,
        // Dados de venda dupla vindos dos controles internos
        vendaDupla: isVendaDupla,
        vendedor2: vendedor2Name,
        // Dados de reunião vindos dos controles internos
        reuniao: nomeReuniao
      };

      console.log('Item do relatório:', reportItem);
      return reportItem;
    });
  };

  // Estado para o modal de visualização
  const [showReportModal, setShowReportModal] = useState(false);
  
  // HOOK PERSISTENTE PARA DADOS DO RELATÓRIO - NUNCA SE PERDEM AO RECARREGAR
  const {
    reportData,
    reportObservations,
    reportPaymentDates,
    reportVendaDupla,
    reportVendedor1,
    reportVendedor1Percent,
    reportVendedor2,
    reportVendedor2Percent,
    reportComissaoReuniao,
    reportPremiacao,
    reportComissaoSupervisor,
    reportSupervisor,
    reportSupervisorPercent,
    reportReuniao,
    reportStatusPagamento,
    setReportData,
    setReportObservations,
    setReportPaymentDates,
    setReportVendaDupla,
    setReportVendedor1,
    setReportVendedor1Percent,
    setReportVendedor2,
    setReportVendedor2Percent,
    setReportComissaoReuniao,
    setReportPremiacao,
    setReportComissaoSupervisor,
    setReportSupervisor,
    setReportSupervisorPercent,
    setReportReuniao,
    setReportStatusPagamento,
    isLoading: reportIsLoading,
    error: reportError
  } = useSupervisorReport('current_report');
  
  // Estados adicionais para compatibilidade (usando fields existentes do hook)
  const setReportDataPagamento = setReportStatusPagamento; // Mapeamento compatível
  const reportDataPagamento = reportStatusPagamento; // Mapeamento compatível
  const [reportStatusPagamentoPremiacao, setReportStatusPagamentoPremiacao] = useState<{[key: string]: string}>({});

  // Função para calcular total de comissões
  const calculateTotalComission = (abmId: string) => {
    const vendedor1Percent = parseInt(reportVendedor1Percent[abmId]?.replace('%', '') || '0');
    const vendedor2Percent = parseInt(reportVendedor2Percent[abmId]?.replace('%', '') || '0');
    const reuniaoPercent = parseInt(reportComissaoReuniao[abmId]?.replace('%', '') || '0');
    const supervisorPercent = parseInt(reportComissaoSupervisor[abmId]?.replace('%', '') || '0');
    
    const total = vendedor1Percent + vendedor2Percent + reuniaoPercent + supervisorPercent;
    return total + '%';
  };

  const showReportPreview = (data: any[]) => {
    setReportData(data);
    
    // Inicializar automaticamente os dados de venda dupla baseados nos controles internos
    const vendaDuplaData: {[key: string]: boolean} = {};
    const vendedor1Data: {[key: string]: string} = {};
    const vendedor2Data: {[key: string]: string} = {};
    const vendedor1PercentData: {[key: string]: string} = {};
    const vendedor2PercentData: {[key: string]: string} = {};
    const comissaoReuniaoData: {[key: string]: string} = {};
    const comissaoSupervisorData: {[key: string]: string} = {};
    const supervisorPercentData: {[key: string]: string} = {};
    const reuniaoData: {[key: string]: string} = {};
    
    data.forEach(item => {
      const abmId = item.abmId;
      // Sincronizar dados automaticamente dos controles internos
      vendaDuplaData[abmId] = item.vendaDupla || false;
      vendedor1Data[abmId] = item.vendedor1 || item.vendedor; // Dono da venda
      vendedor2Data[abmId] = item.vendedor2 || '';
      // Porcentagens iniciais (supervisor pode editar)
      vendedor1PercentData[abmId] = item.vendaDupla ? '50%' : '100%';
      vendedor2PercentData[abmId] = item.vendaDupla ? '50%' : '';
      // Porcentagem de comissão de reunião (supervisor pode editar)
      // Se houver organizador de reunião, definir percentual padrão
      comissaoReuniaoData[abmId] = item.reuniao && item.reuniao !== '-' && item.reuniao !== '' ? '10%' : '';
      // Comissão supervisor: 5% automático para Rod Ribas (único supervisor cadastrado)
      // Sistema atual tem apenas Rod Ribas como supervisor
      comissaoSupervisorData[abmId] = '5%';
      supervisorPercentData[abmId] = '5%';
      // Dados da reunião vindos dos controles internos
      reuniaoData[abmId] = item.reuniao || '';
    });
    
    setReportVendaDupla(vendaDuplaData);
    setReportVendedor1(vendedor1Data);
    setReportVendedor2(vendedor2Data);
    setReportVendedor1Percent(vendedor1PercentData);
    setReportVendedor2Percent(vendedor2PercentData);
    setReportComissaoReuniao(comissaoReuniaoData);
    setReportComissaoSupervisor(comissaoSupervisorData);
    setReportSupervisorPercent(supervisorPercentData);
    setReportReuniao(reuniaoData);
    
    setShowReportModal(true);
  };

  const sendToFinanceiro = () => {
    // Calcular dados do relatório
    const totalValue = reportData.reduce((sum, item) => 
      sum + (parseFloat(item.valor.toString().replace(/[^0-9,]/g, '').replace(',', '.')) || 0), 0
    );
    
    const reportPayload = {
      id: `report-${Date.now()}`,
      title: `Relatório de Performance - ${format(new Date(), 'dd/MM/yyyy')}`,
      status: 'received',
      receivedAt: new Date().toISOString(),
      data: {
        period: `${format(new Date(), 'MMMM yyyy')}`,
        totalProposals: reportData.length.toString(),
        totalValue: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        conversionRate: `${Math.round((reportData.filter(r => r.status === 'implantado').length / reportData.length) * 100)}%`
      },
      rawData: reportData
    };

    // Enviar para localStorage para simular comunicação entre portais
    const existingReports = JSON.parse(localStorage.getItem('financialReports') || '[]');
    existingReports.unshift(reportPayload);
    localStorage.setItem('financialReports', JSON.stringify(existingReports));
    
    // Disparar evento customizado para notificar o FinancialPortal
    window.dispatchEvent(new CustomEvent('newFinancialReport', { detail: reportPayload }));
    
    showNotification('Relatório enviado para o painel financeiro!', 'success');
    setShowReportModal(false);
  };

  const sendViaWhatsApp = () => {
    const message = `*Relatório de Propostas ABMIX*\n\nTotal: ${reportData.length} propostas\nFaturamento: R$ ${reportData.reduce((sum, item) => sum + (parseFloat(item.valor.toString().replace(/[^0-9,]/g, '').replace(',', '.')) || 0), 0).toFixed(2)}\n\nDetalhes: ${window.location.origin}/relatorio`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    showNotification('Compartilhado via WhatsApp!', 'success');
  };

  const sendViaEmail = () => {
    const subject = 'Relatório de Propostas ABMIX';
    const body = `Relatório gerado em ${new Date().toLocaleString('pt-BR')}\n\nTotal de propostas: ${reportData.length}\nFaturamento total: R$ ${reportData.reduce((sum, item) => sum + (parseFloat(item.valor.toString().replace(/[^0-9,]/g, '').replace(',', '.')) || 0), 0).toFixed(2)}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    showNotification('Email preparado!', 'success');
  };

  const downloadReport = () => {
    const csvContent = [
      ['ID', 'Nº Proposta', 'Nº Apólice', 'Cliente', 'CNPJ', 'Vendedor', 'Valor', 'Plano', 'Status', 'Desconto', 'Autorizador do Desconto', 'Observações'].join(';'),
      ...reportData.map(item => [
        item.abmId,
        (item as any).numeroProposta || '-',
        (item as any).numeroApolice || '-',
        item.cliente,
        item.cnpj,
        item.vendedor,
        `R$ ${item.valor}`,
        item.plano,
        item.status.toUpperCase(),
        (item as any).desconto || '0%',
        (item as any).autorizadorDesconto || '-',
        reportObservations[item.abmId] || ''
      ].join(';'))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_abmix_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showNotification('Relatório baixado!', 'success');
  };

  const exportToSheets = (data: any[]) => {
    const csvContent = [
      ['ID', 'Cliente', 'CNPJ', 'Vendedor', 'Valor', 'Plano', 'Status', 'Data'].join(','),
      ...data.map(item => [
        item.abmId || item.id,
        item.contractData?.nomeEmpresa || 'N/A',
        item.contractData?.cnpj || 'N/A',
        item.vendedor || 'N/A',
        item.contractData?.valor || '0',
        item.contractData?.planoContratado || 'N/A',
        item.status || 'pendente',
        new Date(item.createdAt).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');
    
    console.log('Dados preparados para Google Sheets:', csvContent);
    window.open('https://sheets.google.com/create', '_blank');
  };

  const exportToExcel = (data: any[]) => {
    const csvContent = [
      ['ID', 'Cliente', 'CNPJ', 'Vendedor', 'Valor', 'Plano', 'Status', 'Data'].join(';'),
      ...data.map(item => [
        item.abmId || item.id,
        item.contractData?.nomeEmpresa || 'N/A',
        item.contractData?.cnpj || 'N/A',
        item.vendedor || 'N/A',
        item.contractData?.valor || '0',
        item.contractData?.planoContratado || 'N/A',
        item.status || 'pendente',
        new Date(item.createdAt).toLocaleDateString('pt-BR')
      ].join(';'))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_abmix_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const openGoogleDrive = () => {
    window.open('https://drive.google.com/drive/folders/1cLvVhS7X9YQZ3K8N2M5P6R7T', '_blank');
  };

  // Função para obter propostas filtradas baseada nos filtros do relatório
  const getFilteredProposals = () => {
    if (!proposals || !Array.isArray(proposals)) {
      console.log('Propostas não disponíveis:', proposals);
      return [];
    }
    
    console.log('Filtrando propostas com filtros:', reportFilters);
    console.log('Total de propostas disponíveis:', proposals.length);
    
    const filtered = proposals.filter(proposal => {
      // Filtro por vendedor - NOVA LÓGICA DE COMPARTILHAMENTO
      if (reportFilters.vendedor) {
        let vendedorParticipaVenda = false;
        
        // 1. Venda Original (Dono): Verificar se é o vendedor principal
        let proposalVendorName = 'N/A';
        if (proposal.vendorId && vendors?.length > 0) {
          const vendor = vendors.find(v => v.id === proposal.vendorId);
          proposalVendorName = vendor?.name || 'N/A';
        }
        if (proposalVendorName === reportFilters.vendedor) {
          vendedorParticipaVenda = true;
        }
        
        // 2. Vendas em Dupla: Verificar se aparece como Vendedor 2
        const internalData = proposal.internalData || {};
        const vendedor2Name = internalData.nomeVendaDupla || '';
        if (vendedor2Name === reportFilters.vendedor) {
          vendedorParticipaVenda = true;
        }
        
        // 3. Comissão de Reunião: Verificar se aparece na coluna Reunião
        const nomeReuniao = internalData.nomeReuniao || '';
        if (nomeReuniao === reportFilters.vendedor) {
          vendedorParticipaVenda = true;
        }
        
        // Se o vendedor não participa de nenhuma forma da venda, filtrar fora
        if (!vendedorParticipaVenda) {
          return false;
        }
      }
      
      // Filtro por status
      if (reportFilters.status) {
        if (proposal.status !== reportFilters.status) {
          return false;
        }
      }
      
      // Filtro por data de início
      if (reportFilters.dataInicio) {
        const proposalDate = new Date(proposal.createdAt);
        const startDate = new Date(reportFilters.dataInicio);
        if (proposalDate < startDate) {
          return false;
        }
      }
      
      // Filtro por data fim
      if (reportFilters.dataFim) {
        const proposalDate = new Date(proposal.createdAt);
        const endDate = new Date(reportFilters.dataFim);
        if (proposalDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
    
    console.log('Propostas filtradas:', filtered.length);
    console.log('Dados das propostas filtradas:', filtered);
    
    return filtered;
  };

  const clearAllFilters = () => {
    setSelectedVendors([]);
    setSelectedStatuses([]);
    setSelectedOperadora('');
    setSelectedTipoPlano('');
    setDataInicio('');
    setDataFim('');
    setValorMin('');
    setValorMax('');
    setSearchQuery('');
    setCidade('');
    setUf('');
  };

  const saveCurrentFilter = () => {
    if (!filterName.trim()) return;
    
    const filter = {
      id: Date.now(),
      name: filterName,
      selectedVendors,
      selectedStatuses,
      selectedOperadora,
      selectedTipoPlano,
      dataInicio,
      dataFim,
      valorMin,
      valorMax,
      searchQuery,
      cidade,
      uf
    };
    
    setSavedFilters(prev => [...prev, filter]);
    setFilterName('');
    setShowSaveFilter(false);
    showNotification('Filtro salvo com sucesso!', 'success');
  };

  const exportReport = () => {
    showNotification(`Relatório exportado em ${exportFormat}!`, 'success');
    setShowExportModal(false);
  };

  const refreshData = () => {
    queryClientInstance.invalidateQueries({ queryKey: ['/api/proposals'] });
    showNotification('Dados atualizados!', 'success');
  };
  
  // Estados para filtros com persistência
  const [filterVendor, setFilterVendor] = useState(() => localStorage.getItem('supervisor_filterVendor') || '');
  const [filterStatus, setFilterStatus] = useState(() => localStorage.getItem('supervisor_filterStatus') || '');
  const [filterDate, setFilterDate] = useState(() => localStorage.getItem('supervisor_filterDate') || '');

  // Estados para Analytics - movidos para nível principal
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedOperadora, setSelectedOperadora] = useState('');
  const [selectedTipoPlano, setSelectedTipoPlano] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [valorMin, setValorMin] = useState('');
  const [valorMax, setValorMax] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [filterName, setFilterName] = useState('');
  const [showSaveFilter, setShowSaveFilter] = useState(false);
  
  // Estados para gerenciamento de vendedores
  const [showAddVendorForm, setShowAddVendorForm] = useState(false);
  

  
  // Estados para Analytics (movidos para o nível do componente)
  const [selectedVendorAnalytics, setSelectedVendorAnalytics] = useState('');
  const [dateRangeAnalytics, setDateRangeAnalytics] = useState('');
  const [selectedStatusForChart, setSelectedStatusForChart] = useState<string>('');
  const [selectedVendorForChart, setSelectedVendorForChart] = useState<string>('');
  const [showChart, setShowChart] = useState(false);

  const [visualMode, setVisualMode] = useState<'individual' | 'equipe'>('equipe');
  const [selectedPeriod, setSelectedPeriod] = useState('todos');

  // Estados para Relatórios - movidos para nível principal
  const [reportFilters, setReportFilters] = useState({
    dataInicio: '',
    dataFim: '',
    vendedor: '',
    status: '',
    tipo: 'completo'
  });
  const [reportFormat, setReportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [layoutHorizontal, setLayoutHorizontal] = useState(false);

  // Salvar filtros no localStorage quando alterados
  useEffect(() => {
    localStorage.setItem('supervisor_filterVendor', filterVendor);
  }, [filterVendor]);

  useEffect(() => {
    localStorage.setItem('supervisor_filterStatus', filterStatus);
  }, [filterStatus]);

  useEffect(() => {
    localStorage.setItem('supervisor_filterDate', filterDate);
  }, [filterDate]);
  
  // Função para alterar prioridade - corrigida sem reload
  const handlePriorityChange = async (proposalId: string, priority: 'alta' | 'media' | 'baixa') => {
    try {
      // Converter para formato do backend
      const backendPriority = priority === 'alta' ? 'high' : priority === 'media' ? 'medium' : 'low';
      
      // Enviar para o backend usando PUT (conforme rota existente no servidor)
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PUT',
        body: JSON.stringify({ priority: backendPriority }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar prioridade');
      }

      // Invalidar cache usando React Query para forçar recarregamento dos dados
      queryClientInstance.invalidateQueries({ queryKey: ["/api/proposals"] });
      
      showNotification(`Prioridade alterada para ${getPriorityText(priority)}`, 'success');
    } catch (error) {
      console.error('Erro ao alterar prioridade:', error);
      showNotification('Erro ao alterar prioridade', 'error');
    }
  };
  
  // Função para obter cor da prioridade
  const getPriorityColor = (priority: 'alta' | 'media' | 'baixa') => {
    switch (priority) {
      case 'alta':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'media':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'baixa':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white';
    }
  };
  
  // Função para obter texto da prioridade
  const getPriorityText = (priority: 'alta' | 'media' | 'baixa') => {
    switch (priority) {
      case 'alta':
        return 'Alta';
      case 'media':
        return 'Média';
      case 'baixa':
        return 'Baixa';
      default:
        return 'Média';
    }
  }



  // USAR A MESMA CALCULADORA DOS OUTROS PORTAIS PARA SINCRONIZAÇÃO
  const calculateProgress = (proposal: any) => {
    if (!proposal) return 0;
    
    // Usar a calculadora oficial (mesma do ProgressBar)
    const proposalData = {
      contractData: proposal.contractData || {},
      titulares: proposal.titulares || [],
      dependentes: proposal.dependentes || [],
      clientAttachments: proposal.clientAttachments || [],
      clientCompleted: proposal.clientCompleted || false,
      status: proposal.status
    };
    
    try {
      // USAR A CALCULADORA OFICIAL (mesma dos outros portais)
      const progressResult = calculateProposalProgress(proposalData);
      return progressResult.overallProgress;
    } catch (error) {
      console.warn('Erro ao calcular progresso:', error);
      
      // FALLBACK: cálculo simples como backup
      let completedFields = 0;
      let totalFields = 9; // Total fixo para consistência
      
      const contractData = proposalData.contractData || {};
      if (contractData.nomeEmpresa) completedFields++;
      if (contractData.cnpj) completedFields++;
      if (contractData.planoContratado) completedFields++;
      if (contractData.valor) completedFields++;
      
      if (proposalData.titulares.length > 0) {
        const titular = proposalData.titulares[0];
        if (titular?.nomeCompleto) completedFields++;
        if (titular?.cpf) completedFields++;
        if (titular?.emailPessoal) completedFields++;
        if (titular?.telefonePessoal) completedFields++;
      }
      
      if (proposalData.clientAttachments.length > 0) completedFields++;
      
      const progress = Math.round((completedFields / totalFields) * 100);
      
      // Calibração: máximo 99% até ser implantado
      if (progress >= 99 && proposal.status !== 'implantado') {
        return 99;
      }
      
      if (proposal.status === 'implantado') {
        return 100;
      }
      
      return Math.min(99, progress);
    }
  };

  // Funções para as ações da tabela
  const handleSendInternalMessage = (proposal: any) => {
    // Selecionar o vendedor dono da proposta para a mensagem interna
    const vendorName = getVendorName(proposal.vendorId);
    setSelectedVendor(vendorName);
    setSelectedProposalForMessage(proposal);
    setShowInternalMessage(true);
    showNotification(`Abrindo mensagem interna para ${vendorName} sobre proposta ${proposal.abmId || proposal.id}`, 'info');
  };

  const handleSendEmail = (proposal: any) => {
    const subject = `Proposta ${proposal.abmId || proposal.id} - ${proposal.contractData?.nomeEmpresa || proposal.cliente}`;
    const body = `Informações da proposta:
Cliente: ${proposal.contractData?.nomeEmpresa || proposal.cliente}
CNPJ: ${proposal.contractData?.cnpj || 'N/A'}
Valor: ${proposal.contractData?.valor || 'N/A'}
Plano: ${proposal.contractData?.planoContratado || proposal.plano || 'N/A'}
Status: ${proposal.status}
Link do cliente: ${window.location.origin}/client/${proposal.clientToken}`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    showNotification('Email preparado com dados da proposta', 'success');
  };

  const handleSendWhatsApp = (proposal: any) => {
    const message = `*Proposta ${proposal.abmId || proposal.id}*
Cliente: ${proposal.contractData?.nomeEmpresa || proposal.cliente}
Valor: ${proposal.contractData?.valor || 'N/A'}
Status: ${proposal.status}
Link: ${window.location.origin}/client/${proposal.clientToken}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    showNotification('WhatsApp aberto com dados da proposta', 'success');
  };

  const handleCopyLink = (proposal: any) => {
    const link = `${window.location.origin}/client/${proposal.clientToken}`;
    navigator.clipboard.writeText(link).then(() => {
      showNotification('Link copiado para a área de transferência', 'success');
    }).catch(() => {
      showNotification('Erro ao copiar link', 'error');
    });
  };

  const handleDownloadProposal = (proposal: any) => {
    const data = {
      'ID da Proposta': proposal.abmId || proposal.id,
      'Cliente/Empresa': proposal.contractData?.nomeEmpresa || proposal.cliente || 'Não informado',
      'CNPJ': proposal.contractData?.cnpj || 'Não informado',
      'Vendedor Responsável': getVendorName(proposal.vendorId),
      'Plano Contratado': proposal.contractData?.planoContratado || proposal.plano || 'Não informado',
      'Valor da Proposta': proposal.contractData?.valor || 'R$ 0,00',
      'Status Atual': proposal.status || 'Não definido',
      'Prioridade': proposal.priority || 'Média',
      'Progresso': `${Math.round(proposal.progresso || calculateProgress(proposal))}%`,
      'Data de Criação': new Date(proposal.createdAt).toLocaleDateString('pt-BR'),
      'Link do Cliente': `${window.location.origin}/client/${proposal.clientToken}`,
      'Anexos do Vendedor': (proposal.vendorAttachments || []).length > 0 ? (proposal.vendorAttachments || []).map((file: any) => file.name || 'Arquivo').join(', ') : 'Nenhum anexo',
      'Anexos do Cliente': (proposal.clientAttachments || []).length > 0 ? (proposal.clientAttachments || []).map((file: any) => file.name || 'Arquivo').join(', ') : 'Nenhum anexo',
      'Observações do Vendedor': proposal.internalData?.observacoesVendedor || 'Nenhuma observação'
    };
    
    const csvContent = Object.entries(data).map(([key, value]) => `${key}: ${value || 'Não informado'}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `proposta_completa_${proposal.abmId || proposal.id}.txt`;
    link.click();
    showNotification(`Proposta ${proposal.abmId || proposal.id} baixada com dados completos`, 'success');
  };
  const [newVendorData, setNewVendorData] = useState({ name: '', email: '', password: '120784' });
  
  // Estados para metas
  const [showAddTargetForm, setShowAddTargetForm] = useState(false);
  const [showAddTeamTargetForm, setShowAddTeamTargetForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<VendorTarget | null>(null);
  const [newTargetData, setNewTargetData] = useState({
    vendorId: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    targetValue: '',
    targetProposals: 0,
    bonus: '0'
  });
  
  // Estados para premiações
  const [showAddAwardForm, setShowAddAwardForm] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [newAwardData, setNewAwardData] = useState({
    vendorId: 0,
    title: '',
    description: '',
    value: '',
    targetValue: '',
    type: 'recognition' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });



  // Buscar metas dos vendedores
  const { data: vendorTargets = [], isLoading: targetsLoading } = useQuery({
    queryKey: ['/api/vendor-targets'],
    queryFn: () => apiRequest('/api/vendor-targets'),
    refetchInterval: globalSyncConfig.getReactQueryInterval(),
  });

  // Buscar metas da equipe
  const { data: teamTargets = [], isLoading: teamTargetsLoading } = useQuery({
    queryKey: ['/api/team-targets'],
    queryFn: () => apiRequest('/api/team-targets'),
    refetchInterval: globalSyncConfig.getReactQueryInterval(),
  });

  // Buscar premiações
  const { data: awards = [], isLoading: awardsLoading } = useQuery({
    queryKey: ['/api/awards'],
    queryFn: () => apiRequest('/api/awards'),
    refetchInterval: globalSyncConfig.getReactQueryInterval(),
  });

  // Buscar estatísticas da equipe
  const { data: teamStats = {}, isLoading: teamStatsLoading } = useQuery({
    queryKey: ['/api/analytics/team', selectedMonth, selectedYear],
    queryFn: () => apiRequest(`/api/analytics/team?month=${selectedMonth}&year=${selectedYear}`),
    refetchInterval: globalSyncConfig.getReactQueryInterval(),
  });

  // Mutation para criar vendedor
  const addVendorMutation = useMutation({
    mutationFn: async (vendorData: { name: string; email: string; password: string; role: string; active: boolean }) => {
      return apiRequest('/api/vendors', {
        method: 'POST',
        body: JSON.stringify(vendorData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas quando vendedor é adicionado
      queryClientInstance.invalidateQueries({ queryKey: ['/api/vendors'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/proposals'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/vendor-targets'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/analytics/team'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/awards'] });
      
      // Forçar sincronização em tempo real
      realTimeSync.forceRefresh();
      
      setShowAddVendorForm(false);
      setNewVendorData({ name: '', email: '', password: '120784' });
      showNotification('Vendedor adicionado com sucesso! Todos os gráficos atualizados.', 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Erro ao adicionar vendedor', 'error');
    },
  });

  // Mutation para remover vendedor
  const removeVendorMutation = useMutation({
    mutationFn: async (vendorId: number) => {
      return apiRequest(`/api/vendors/${vendorId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas quando vendedor é removido
      queryClientInstance.invalidateQueries({ queryKey: ['/api/vendors'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/proposals'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/vendor-targets'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/analytics/team'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/awards'] });
      
      // Forçar sincronização em tempo real
      realTimeSync.forceRefresh();
      
      showNotification('Vendedor removido com sucesso! Todos os gráficos atualizados.', 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Erro ao remover vendedor', 'error');
    },
  });

  // Mutation para criar meta de vendedor
  const addTargetMutation = useMutation({
    mutationFn: async (targetData: any) => {
      return apiRequest('/api/vendor-targets', {
        method: 'POST',
        body: JSON.stringify(targetData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      // SINCRONIZAÇÃO EM TEMPO REAL TOTAL - Invalidar TODAS as queries relacionadas
      queryClientInstance.invalidateQueries({ queryKey: ['/api/vendor-targets'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/proposals'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/vendors'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/analytics/team'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/team-targets'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/awards'] });
      
      // Forçar atualização imediata em TODOS os portais
      realTimeSync.forceRefresh();
      
      setShowAddTargetForm(false);
      setNewTargetData({
        vendorId: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        targetValue: '',
        targetProposals: 0,
        bonus: '0'
      });
      showNotification('Meta criada com sucesso! Performance atualizada.', 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Erro ao criar meta', 'error');
    },
  });

  // Mutation para criar meta da equipe
  const addTeamTargetMutation = useMutation({
    mutationFn: async (teamTargetData: any) => {
      return apiRequest('/api/team-targets', {
        method: 'POST',
        body: JSON.stringify(teamTargetData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      // Invalidar múltiplas queries para sincronização completa
      queryClientInstance.invalidateQueries({ queryKey: ['/api/team-targets'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/proposals'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/vendors'] });
      setShowAddTeamTargetForm(false);
      showNotification('Meta da equipe criada com sucesso! Performance atualizada.', 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Erro ao criar meta da equipe', 'error');
    },
  });

  // Mutation para criar premiação
  const addAwardMutation = useMutation({
    mutationFn: async (awardData: any) => {
      return apiRequest('/api/awards', {
        method: 'POST',
        body: JSON.stringify(awardData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['/api/awards'] });
      setShowAddAwardForm(false);
      setNewAwardData({
        vendorId: 0,
        title: '',
        description: '',
        value: '',
        targetValue: '',
        type: 'recognition',
        startDate: '',
        endDate: ''
      });
      showNotification('Premiação criada com sucesso!', 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Erro ao criar premiação', 'error');
    },
  });

  // Mutation para deletar meta
  const deleteTargetMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/vendor-targets/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // SINCRONIZAÇÃO EM TEMPO REAL TOTAL - Invalidar TODAS as queries relacionadas
      queryClientInstance.invalidateQueries({ queryKey: ['/api/vendor-targets'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/proposals'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/vendors'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/analytics/team'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/team-targets'] });
      queryClientInstance.invalidateQueries({ queryKey: ['/api/awards'] });
      
      // Forçar atualização imediata em TODOS os portais
      realTimeSync.forceRefresh();
      
      showNotification('Meta removida com sucesso! Atualização em tempo real ativada.', 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Erro ao remover meta', 'error');
    },
  });

  // Mutation para deletar premiação
  const deleteAwardMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/awards/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['/api/awards'] });
      showNotification('Premiação removida com sucesso!', 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Erro ao remover premiação', 'error');
    },
  });

  const handleAddVendor = () => {
    if (newVendorData.name && newVendorData.email && newVendorData.password) {
      addVendorMutation.mutate({
        name: newVendorData.name,
        email: newVendorData.email,
        password: newVendorData.password,
        role: "vendor",
        active: true
      });
    }
  };

  const handleRemoveVendor = (vendorId: number) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor && window.confirm(`Tem certeza que deseja remover o vendedor ${vendor.name}?`)) {
      removeVendorMutation.mutate(vendorId);
    }
  };

  const handleAddTarget = () => {
    if (newTargetData.vendorId && newTargetData.targetValue && newTargetData.targetProposals) {
      // Se "Todos os Vendedores" foi selecionado (valor -1)
      if (newTargetData.vendorId === -1) {
        // Criar uma meta para cada vendedor
        vendors.forEach(vendor => {
          const targetData = {
            ...newTargetData,
            vendorId: vendor.id
          };
          addTargetMutation.mutate(targetData);
        });
        
        // Mostrar notificação especial para todos os vendedores
        showNotification(`Metas criadas para todos os ${vendors.length} vendedores!`, 'success');
        
        // Fechar modal e resetar formulário
        setShowAddTargetForm(false);
        setNewTargetData({
          vendorId: 0,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          targetValue: '',
          targetProposals: 0,
          bonus: '0'
        });
      } else {
        // Criar meta para vendedor individual
        addTargetMutation.mutate(newTargetData);
      }
    }
  };

  const handleAddTeamTarget = () => {
    const teamTargetData = {
      month: selectedMonth,
      year: selectedYear,
      targetValue: newTargetData.targetValue,
      targetProposals: newTargetData.targetProposals,
      teamBonus: newTargetData.bonus
    };
    addTeamTargetMutation.mutate(teamTargetData);
  };

  const handleAddAward = () => {
    if (newAwardData.vendorId && newAwardData.title && newAwardData.value) {
      // Se "Todos os Vendedores" foi selecionado (valor -1)
      if (newAwardData.vendorId === -1) {
        // Criar uma premiação para cada vendedor
        vendors.forEach(vendor => {
          const awardData = {
            ...newAwardData,
            vendorId: vendor.id
          };
          addAwardMutation.mutate(awardData);
        });
        
        // Mostrar notificação especial para todos os vendedores
        showNotification(`Premiações criadas para todos os ${vendors.length} vendedores!`, 'success');
        
        // Fechar modal e resetar formulário
        setShowAddAwardForm(false);
        setNewAwardData({
          vendorId: 0,
          title: '',
          description: '',
          value: '',
          targetValue: '',
          type: 'recognition' as const,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        });
      } else {
        // Criar premiação para vendedor individual
        addAwardMutation.mutate(newAwardData);
      }
    }
  };

  const formatCurrency = (value: string | number) => {
    if (!value || value === '0' || value === 0) return 'R$ 0,00';
    
    // Se for string, tentar converter para número
    let numValue: number;
    if (typeof value === 'string') {
      // Lidar com formato brasileiro: "1.000,00" 
      if (value.includes('.') && value.includes(',')) {
        // Formato: "1.000,00" -> remove pontos de milhares e substitui vírgula por ponto
        numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
      } else if (value.includes(',')) {
        // Formato: "1000,00" -> substitui vírgula por ponto
        numValue = parseFloat(value.replace(',', '.'));
      } else if (value.includes('R$')) {
        // Remove símbolos de moeda e tenta novamente
        const cleanValue = value.replace(/[R$\s]/g, '');
        if (cleanValue.includes('.') && cleanValue.includes(',')) {
          numValue = parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
        } else if (cleanValue.includes(',')) {
          numValue = parseFloat(cleanValue.replace(',', '.'));
        } else {
          numValue = parseFloat(cleanValue);
        }
      } else {
        numValue = parseFloat(value);
      }
    } else {
      numValue = value;
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : 'Vendedor não encontrado';
  };

  const getVendorTargetValue = (vendorId: number) => {
    // Buscar meta do vendedor para o mês/ano selecionado
    const vendorTarget = vendorTargets.find(target => 
      target.vendorId === vendorId && 
      target.month === selectedMonth && 
      target.year === selectedYear
    );
    return vendorTarget ? vendorTarget.targetValue : 'R$ 0,00';
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[month - 1];
  };



  const filteredProposals = proposals.filter(proposal => {
    const vendorMatch = !filterVendor || proposal.vendorId?.toString() === filterVendor;
    const statusMatch = !filterStatus || proposal.status === filterStatus;
    const dateMatch = !filterDate || new Date(proposal.createdAt).toDateString() === new Date(filterDate).toDateString();
    return vendorMatch && statusMatch && dateMatch;
  }).sort((a, b) => {
    // Manter ordem cronológica de criação mesmo após filtros
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Funções auxiliares para Analytics (definidas após filteredProposals)
  const toggleVendor = (vendor: string) => {
    setSelectedVendors(prev => 
      prev.includes(vendor) 
        ? prev.filter(v => v !== vendor)
        : [...prev, vendor]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const selectAllVendors = () => {
    const vendorNames = filteredProposals.map(p => {
      const vendor = vendors.find(v => v.id === p.vendorId);
      return vendor ? vendor.name : null;
    }).filter(Boolean);
    const uniqueVendors = [...new Set(vendorNames)];
    setSelectedVendors(selectedVendors.length === uniqueVendors.length ? [] : uniqueVendors);
  };

  const selectAllStatuses = () => {
    const allStatuses = Object.keys(STATUS_CONFIG);
    setSelectedStatuses(selectedStatuses.length === allStatuses.length ? [] : allStatuses);
  };

  // Calcular estatísticas em tempo real baseadas nas propostas locais
  const calculateRealTimeStats = () => {
    if (!proposals || proposals.length === 0) {
      return { totalProposals: 0, totalValue: 0, averageValue: 0, totalVendors: 0 };
    }

    // Propostas implantadas para faturamento
    const implantedProposals = proposals.filter(p => p.status === 'implantado');
    
    // Total de propostas
    const totalProposals = proposals.length;
    
    // Faturamento total (apenas implantadas)
    const totalValue = implantedProposals.reduce((sum, p) => {
      const value = p.contractData?.valor || "R$ 0";
      const cleanValue = value.toString().replace(/[R$\s\.]/g, '').replace(',', '.');
      const numericValue = parseFloat(cleanValue) || 0;
      return sum + numericValue;
    }, 0);

    // Ticket médio (baseado nas implantadas)
    const averageValue = implantedProposals.length > 0 ? totalValue / implantedProposals.length : 0;
    
    // Vendedores ativos (com propostas)
    const totalVendors = new Set(proposals.filter(p => p.vendorId).map(p => p.vendorId)).size;

    return { totalProposals, totalValue, averageValue, totalVendors };
  };

  const realTimeStats = calculateRealTimeStats();

  // Função para calcular progresso de metas individuais
  const calculateMetaProgress = (vendorId: number, target: any) => {
    if (!proposals || !target) {
      return 0;
    }

    // Buscar propostas do vendedor específico no mês/ano da meta
    const vendorProposals = proposals.filter((p: any) => {
      const proposalDate = new Date(p.createdAt);
      return (
        p.vendorId === vendorId &&
        proposalDate.getMonth() + 1 === target.month &&
        proposalDate.getFullYear() === target.year
      );
    });

    // Calcular valor total das propostas implantadas
    const implantedProposals = vendorProposals.filter((p: any) => p.status === 'implantado');
    const totalValue = implantedProposals.reduce((sum: number, p: any) => {
      const value = p.contractData?.valor || "0";
      const cleanValue = value.toString().replace(/[R$\s\.]/g, '').replace(',', '.');
      const numericValue = parseFloat(cleanValue) || 0;
      return sum + numericValue;
    }, 0);

    // Extrair valor numérico da meta com verificação de segurança
    const targetValue = target.targetValue ? parseFloat(target.targetValue.toString().replace(/[R$\s\.]/g, '').replace(',', '.')) || 1 : 1;
    const targetProposals = target.targetProposals || 1;

    // Calcular progressos individuais
    const valueProgress = Math.min((totalValue / targetValue) * 100, 100);
    const proposalProgress = Math.min((vendorProposals.length / targetProposals) * 100, 100);

    // Priorizar valor das vendas, mas permitir que propostas compensem se valor for baixo
    // Se o progresso por valor for maior que 50%, usar apenas valor
    // Se o progresso por valor for menor, usar o maior entre os dois
    if (valueProgress >= 50) {
      return Math.round(valueProgress);
    } else {
      return Math.round(Math.max(valueProgress, proposalProgress));
    }
  };

  // Função para calcular valor acumulado de vendas de cada vendedor
  const calculateVendorAccumulatedValue = (vendorId: number) => {
    if (!proposals) {
      return 0;
    }

    // Buscar TODAS as propostas implantadas do vendedor
    const vendorProposals = proposals.filter((p: any) => 
      p.vendorId === vendorId && p.status === 'implantado'
    );

    // Calcular valor total acumulado
    const totalAccumulated = vendorProposals.reduce((sum: number, p: any) => {
      const value = p.contractData?.valor || "0";
      const cleanValue = value.toString().replace(/[R$\s\.]/g, '').replace(',', '.');
      const numericValue = parseFloat(cleanValue) || 0;
      return sum + numericValue;
    }, 0);

    return totalAccumulated;
  };

  // Função para calcular valor total acumulado de TODA a equipe
  const calculateTeamTotalAccumulatedValue = () => {
    if (!proposals) {
      return 0;
    }

    // Buscar TODAS as propostas implantadas da equipe
    const allImplantedProposals = proposals.filter((p: any) => p.status === 'implantado');

    // Calcular valor total acumulado da equipe
    const totalAccumulated = allImplantedProposals.reduce((sum: number, p: any) => {
      const value = p.contractData?.valor || "0";
      const cleanValue = value.toString().replace(/[R$\s\.]/g, '').replace(',', '.');
      const numericValue = parseFloat(cleanValue) || 0;
      return sum + numericValue;
    }, 0);

    return totalAccumulated;
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header com botão de reset */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <button
          onClick={() => {
            // Reset das estatísticas forçando refresh
            queryClientInstance.invalidateQueries({ queryKey: ['/api/proposals'] });
            queryClientInstance.invalidateQueries({ queryKey: ['/api/analytics/team'] });
            realTimeSync.forceRefresh();
            showNotification('Dashboard atualizado!', 'success');
          }}
          className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
          title="Atualizar Dashboard"
        >
          ⟲ Atualizar
        </button>
      </div>

      {/* KPIs - Usando estatísticas em tempo real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Faturamento Total</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">(apenas implantadas)</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(realTimeStats.totalValue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Propostas</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{realTimeStats.totalProposals}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Ticket Médio</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">(das implantadas)</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(realTimeStats.averageValue)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Vendedores Ativos</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{realTimeStats.totalVendors}</p>
            </div>
            <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Performance por Vendedor - INTEGRADO 100% COM METAS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance por Vendedor</h3>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {getMonthName(selectedMonth)}/{selectedYear} - Sincronizado com Metas
          </div>
        </div>
        <div className="space-y-4">
          {(() => {
            // INTEGRAÇÃO TOTAL: Mostrar APENAS vendedores com metas para o mês/ano selecionado
            const vendorsWithTargets = vendorTargets
              .filter(target => target.month === selectedMonth && target.year === selectedYear)
              .map(target => {
                const vendor = vendors.find(v => v.id === target.vendorId);
                if (!vendor) return null;

                const vendorProposals = proposals.filter(p => p.vendorId === vendor.id);
                const vendorImplantadas = vendorProposals.filter(p => p.status === 'implantado');
                const totalProposals = vendorProposals.length;
                const totalValue = vendorImplantadas.reduce((sum, p) => {
                  const value = p.contractData?.valor || "R$ 0";
                  const cleanValue = value.toString().replace(/[R$\s\.]/g, '').replace(',', '.');
                  const numericValue = parseFloat(cleanValue) || 0;
                  return sum + numericValue;
                }, 0);

                // Usar a mesma lógica de cálculo da aba Metas (Math.max)
                const progress = calculateMetaProgress(target.vendorId, target);
                
                return {
                  vendor,
                  target,
                  totalProposals,
                  totalValue,
                  progress
                };
              })
              .filter(Boolean);

            // Se não há vendedores com metas para este mês, mostrar mensagem
            if (vendorsWithTargets.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Nenhum vendedor com metas definidas para {getMonthName(selectedMonth)}/{selectedYear}</p>
                  <p className="text-sm mt-2">Configure metas na aba "Metas" para visualizar performance aqui</p>
                </div>
              );
            }

            return vendorsWithTargets.map(({ vendor, target, totalProposals, totalValue, progress }) => (
              <div key={vendor.id} className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{vendor.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{totalProposals} propostas</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Meta: {formatCurrency(target.targetValue)} | {target.targetProposals} propostas
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{progress}% atingido</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Faturamento: {formatCurrency(totalValue)} <span className="text-xs">(só implantadas)</span>
                  </span>
                </div>
                <SimpleProgressBar percentage={progress} />
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );

  const renderMetas = () => (
    <div className="space-y-6">
      {/* Controles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gerenciar Metas</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddTargetForm(true)}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2 border border-blue-200"
            >
              <Plus size={16} />
              Meta Individual
            </button>
            <button
              onClick={() => setShowAddTeamTargetForm(true)}
              className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 flex items-center gap-2 border border-green-200"
            >
              <Plus size={16} />
              Meta da Equipe
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex space-x-4 mb-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option className="text-black bg-white" key={i + 1} value={i + 1}>
                {getMonthName(i + 1)}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      {/* Metas dos Vendedores */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Metas Individuais</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-2 text-gray-900 dark:text-white">Vendedor</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Período</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Meta Valor</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Valor Acumulado</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Meta Propostas</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Bônus</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Progresso</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Agrupar metas por vendedor para evitar duplicatas
                const vendorGroups = vendorTargets.reduce((acc, target) => {
                  const vendorId = target.vendorId;
                  if (!acc[vendorId]) {
                    acc[vendorId] = [];
                  }
                  acc[vendorId].push(target);
                  return acc;
                }, {} as Record<number, typeof vendorTargets>);

                // Renderizar apenas uma linha por vendedor (com a meta mais recente)
                return Object.entries(vendorGroups).map(([vendorId, targets]) => {
                  // Pegar a meta mais recente (ordenar por ano/mês e pegar a última)
                  const latestTarget = targets.sort((a, b) => {
                    if (a.year !== b.year) return b.year - a.year;
                    return b.month - a.month;
                  })[0];

                  // Calcular valor acumulado do vendedor
                  const accumulatedValue = calculateVendorAccumulatedValue(latestTarget.vendorId);

                  return (
                    <tr key={`vendor-${vendorId}`} className="border-b border-gray-200 dark:border-gray-600">
                      <td className="py-2 text-gray-900 dark:text-white">
                        {getVendorName(latestTarget.vendorId)}
                      </td>
                      <td className="py-2 text-gray-900 dark:text-white">
                        {getMonthName(latestTarget.month)}/{latestTarget.year}
                        {targets.length > 1 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            (mais recente)
                          </div>
                        )}
                      </td>
                      <td className="py-2 text-gray-900 dark:text-white">{formatCurrency(latestTarget.targetValue)}</td>
                      <td className="py-2 text-gray-900 dark:text-white font-semibold text-green-600">
                        {formatCurrency(accumulatedValue)}
                      </td>
                      <td className="py-2 text-gray-900 dark:text-white">{latestTarget.targetProposals}</td>
                      <td className="py-2 text-gray-900 dark:text-white">{formatCurrency(latestTarget.bonus)}</td>
                      <td className="py-2">
                        <div className="w-24">
                          <SimpleProgressBar percentage={calculateMetaProgress(latestTarget.vendorId, latestTarget)} />
                        </div>
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => deleteTargetMutation.mutate(latestTarget.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title={targets.length > 1 ? `Remover meta mais recente (${targets.length} metas total)` : 'Remover meta'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metas da Equipe */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Metas da Equipe</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-2 text-gray-900 dark:text-white">Período</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Meta Valor</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Valor Acumulado</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Meta Propostas</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Bônus da Equipe</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Progresso</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {teamTargets.map(target => {
                // CORREÇÃO: Progresso baseado APENAS na soma de todas as vendas da equipe
                const targetValue = parseFloat(target.targetValue.toString().replace(/[R$\s\.]/g, '').replace(',', '.')) || 1;
                
                // Calcular valor total da equipe no período da meta
                const targetDate = { month: target.month, year: target.year };
                const teamTotalValue = proposals.filter((p: any) => {
                  const proposalDate = new Date(p.createdAt);
                  return (
                    p.status === 'implantado' &&
                    proposalDate.getMonth() + 1 === targetDate.month &&
                    proposalDate.getFullYear() === targetDate.year
                  );
                }).reduce((sum: number, p: any) => {
                  const value = p.contractData?.valor || "0";
                  const cleanValue = value.toString().replace(/[R$\s\.]/g, '').replace(',', '.');
                  const numericValue = parseFloat(cleanValue) || 0;
                  return sum + numericValue;
                }, 0);
                
                const teamProgress = teamTotalValue > 0 
                  ? Math.min((teamTotalValue / targetValue) * 100, 100)
                  : 0;
                
                return (
                  <tr key={target.id} className="border-b border-gray-200 dark:border-gray-600">
                    <td className="py-2 text-gray-900 dark:text-white">{getMonthName(target.month)}/{target.year}</td>
                    <td className="py-2 text-gray-900 dark:text-white">{formatCurrency(target.targetValue)}</td>
                    <td className="py-2 text-gray-900 dark:text-white font-semibold text-blue-600">
                      {formatCurrency(calculateTeamTotalAccumulatedValue())}
                    </td>
                    <td className="py-2 text-gray-900 dark:text-white">{target.targetProposals}</td>
                    <td className="py-2 text-gray-900 dark:text-white">{formatCurrency(target.teamBonus)}</td>
                    <td className="py-2">
                      <div className="w-24">
                        <SimpleProgressBar percentage={Math.min(teamProgress, 100)} />
                      </div>
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir esta meta da equipe?')) {
                            console.log('Delete team target', target.id);
                            // TODO: Implementar exclusão real da meta da equipe
                            showNotification('Meta da equipe excluída!', 'success');
                          }
                        }}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Excluir meta da equipe"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para adicionar meta individual */}
      {showAddTargetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-900 text-lg font-semibold">Nova Meta Individual</h3>
              <button
                onClick={() => setShowAddTargetForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 block text-sm font-medium mb-1">Vendedor</label>
                <select
                  value={newTargetData.vendorId}
                  onChange={(e) => setNewTargetData(prev => ({ ...prev, vendorId: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Selecione um vendedor</option>
                  <option value={-1}>Todos os Vendedores</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 block text-sm font-medium mb-1">Mês</label>
                  <select
                    value={newTargetData.month}
                    onChange={(e) => setNewTargetData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-gray-700 block text-sm font-medium mb-1">Ano</label>
                  <select
                    value={newTargetData.year}
                    onChange={(e) => setNewTargetData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-gray-700 block text-sm font-medium mb-1">Meta de Valor (R$)</label>
                <input
                  type="text"
                  value={newTargetData.targetValue}
                  onChange={(e) => setNewTargetData(prev => ({ ...prev, targetValue: e.target.value }))}
                  placeholder="Ex: 50000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="text-gray-700 block text-sm font-medium mb-1">Meta de Propostas</label>
                <input
                  type="number"
                  value={newTargetData.targetProposals}
                  onChange={(e) => setNewTargetData(prev => ({ ...prev, targetProposals: parseInt(e.target.value) }))}
                  placeholder="Ex: 10"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="text-gray-700 block text-sm font-medium mb-1">Bônus (R$)</label>
                <input
                  type="text"
                  value={newTargetData.bonus}
                  onChange={(e) => setNewTargetData(prev => ({ ...prev, bonus: e.target.value }))}
                  placeholder="Ex: 5000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddTargetForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTarget}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors border border-blue-200"
              >
                Salvar Meta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para adicionar meta da equipe */}
      {showAddTeamTargetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-900 text-lg font-semibold">Nova Meta da Equipe</h3>
              <button
                onClick={() => setShowAddTeamTargetForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 block text-sm font-medium mb-1">Mês</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-gray-700 block text-sm font-medium mb-1">Ano</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-gray-700 block text-sm font-medium mb-1">Meta de Valor (R$)</label>
                <input
                  type="text"
                  value={newTargetData.targetValue}
                  onChange={(e) => setNewTargetData(prev => ({ ...prev, targetValue: e.target.value }))}
                  placeholder="Ex: 500000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="text-gray-700 block text-sm font-medium mb-1">Meta de Propostas</label>
                <input
                  type="number"
                  value={newTargetData.targetProposals}
                  onChange={(e) => setNewTargetData(prev => ({ ...prev, targetProposals: parseInt(e.target.value) }))}
                  placeholder="Ex: 100"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="text-gray-700 block text-sm font-medium mb-1">Bônus da Equipe (R$)</label>
                <input
                  type="text"
                  value={newTargetData.bonus}
                  onChange={(e) => setNewTargetData(prev => ({ ...prev, bonus: e.target.value }))}
                  placeholder="Ex: 20000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddTeamTargetForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTeamTarget}
                className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors border border-green-200"
              >
                Salvar Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPremiacao = () => (
    <div className="space-y-6">
      {/* Controles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sistema de Premiação</h3>
          <button
            onClick={() => setShowAddAwardForm(true)}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2 transition-colors"
          >
            <Award size={16} />
            Criar Premiação
          </button>
        </div>
      </div>

      {/* Lista de Premiações */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-600 max-w-md">
        <h3 className="text-sm font-medium mb-3 text-gray-600 dark:text-white">premiação estipulada</h3>
        <div className="space-y-2">
          {awards.map(award => {
            // Calcular progresso da premiação baseado em dados reais de vendas
            const vendorProps = proposals.filter(p => p.vendorId === award.vendorId && p.status === 'implantado');
            
            // Usar a função formatCurrency para converter corretamente os valores
            const vendorValue = vendorProps.reduce((sum, p) => {
              const valor = p.contractData?.valor || '0';
              // Converter string brasileira para número
              let numValue = 0;
              if (typeof valor === 'string') {
                if (valor.includes('.') && valor.includes(',')) {
                  numValue = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
                } else if (valor.includes(',')) {
                  numValue = parseFloat(valor.replace(',', '.'));
                } else {
                  numValue = parseFloat(valor);
                }
              }
              return sum + numValue;
            }, 0);
            
            // Converter valores da premiação
            const targetValue = (() => {
              const target = award.targetValue || '0';
              if (typeof target === 'string') {
                if (target.includes('.') && target.includes(',')) {
                  return parseFloat(target.replace(/\./g, '').replace(',', '.'));
                } else if (target.includes(',')) {
                  return parseFloat(target.replace(',', '.'));
                } else {
                  return parseFloat(target);
                }
              }
              return parseFloat(target);
            })();
            
            const superPremium = (() => {
              const premium = award.value || '0';
              if (typeof premium === 'string') {
                if (premium.includes('.') && premium.includes(',')) {
                  return parseFloat(premium.replace(/\./g, '').replace(',', '.'));
                } else if (premium.includes(',')) {
                  return parseFloat(premium.replace(',', '.'));
                } else {
                  return parseFloat(premium);
                }
              }
              return parseFloat(premium);
            })();
            const progress = targetValue > 0 ? Math.min((vendorValue / targetValue) * 100, 100) : 0;
            
            return (
              <div key={award.id} className="border border-gray-200 bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded-full ${
                      award.type === 'monetary' ? 'bg-green-50 text-green-600' :
                      award.type === 'bonus' ? 'bg-amber-50 text-amber-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      <Award size={14} />
                    </div>
                    <h4 className="font-medium text-gray-800 text-sm">{award.title}</h4>
                  </div>
                  <button
                    onClick={() => deleteAwardMutation.mutate(award.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                
                <div className="text-xs text-gray-600 mb-2">
                  <div className="flex justify-between">
                    <span>Vendedor: <span className="text-gray-800">{getVendorName(award.vendorId)}</span></span>
                    <span>Tipo: <span className="text-gray-800 capitalize">{award.type === 'monetary' ? 'Monetária' : award.type === 'bonus' ? 'Bônus' : 'Reconhecimento'}</span></span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Data Início: <span className="text-gray-800">{award.startDate ? new Date(award.startDate).toLocaleDateString('pt-BR') : 'N/A'}</span></span>
                    <span>Data Fim: <span className="text-gray-800">{award.endDate ? new Date(award.endDate).toLocaleDateString('pt-BR') : 'N/A'}</span></span>
                  </div>
                  <div className="mt-1">
                    <span>Meta: <span className="text-gray-800">{formatCurrency(targetValue)}</span></span>
                    <span className="ml-3">Atual: <span className="text-gray-800">{formatCurrency(vendorValue)}</span></span>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progresso</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress >= 100 ? 'bg-green-500' :
                        progress >= 70 ? 'bg-yellow-500' :
                        progress >= 50 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                    {/* Super premiação no final da barra */}
                    <div className="absolute right-0 top-0 h-2 flex items-center">
                      <span className="text-xs font-medium text-green-600 ml-2 whitespace-nowrap">
                        {formatCurrency(superPremium)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Mensagem motivacional */}
                  <div className="mt-2 text-center">
                    <span className={`text-xs font-medium ${
                      progress >= 100 ? 'text-green-600' :
                      progress >= 70 ? 'text-yellow-600' :
                      progress >= 50 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {getMotivationalMessage(progress)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">{new Date(award.dateAwarded).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para adicionar premiação */}
      {showAddAwardForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Nova Premiação</h3>
              <button
                onClick={() => setShowAddAwardForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 block text-sm font-medium mb-1">Vendedor</label>
                <select
                  value={newAwardData.vendorId}
                  onChange={(e) => setNewAwardData(prev => ({ ...prev, vendorId: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                >
                  <option value={0}>Selecione um vendedor</option>
                  <option value={-1}>🎯 Todos os Vendedores</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-gray-700 block text-sm font-medium mb-1">Tipo de Premiação</label>
                <select
                  value={newAwardData.type}
                  onChange={(e) => setNewAwardData(prev => ({ ...prev, type: e.target.value as 'monetary' | 'recognition' | 'bonus' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                >
                  <option value="recognition">Reconhecimento</option>
                  <option value="monetary">Monetária</option>
                  <option value="bonus">Bônus</option>
                </select>
              </div>
              
              <div>
                <label className="text-gray-700 block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={newAwardData.title}
                  onChange={(e) => setNewAwardData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Vendedor do Mês"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              
              <div>
                <label className="text-gray-700 block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={newAwardData.description}
                  onChange={(e) => setNewAwardData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalhes da premiação..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 block text-sm font-medium mb-1">Valor da Meta (R$)</label>
                  <input
                    type="text"
                    value={newAwardData.targetValue || ''}
                    onChange={(e) => setNewAwardData(prev => ({ ...prev, targetValue: e.target.value }))}
                    placeholder="Ex: 50000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-gray-700 block text-sm font-medium mb-1">Super Premiação (R$)</label>
                  <input
                    type="text"
                    value={newAwardData.value}
                    onChange={(e) => setNewAwardData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Ex: 5000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 block text-sm font-medium mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={newAwardData.startDate}
                    onChange={(e) => setNewAwardData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                  <div className="mt-1 flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setNewAwardData(prev => ({ ...prev, startDate: new Date().toISOString().split('T')[0] }))}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        setNewAwardData(prev => ({ ...prev, startDate: nextWeek.toISOString().split('T')[0] }));
                      }}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      +7 dias
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-gray-700 block text-sm font-medium mb-1">Data de Fim</label>
                  <input
                    type="date"
                    value={newAwardData.endDate}
                    onChange={(e) => setNewAwardData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                  <div className="mt-1 flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const nextMonth = new Date();
                        nextMonth.setMonth(nextMonth.getMonth() + 1);
                        setNewAwardData(prev => ({ ...prev, endDate: nextMonth.toISOString().split('T')[0] }));
                      }}
                      className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      +1 mês
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextYear = new Date();
                        nextYear.setFullYear(nextYear.getFullYear() + 1);
                        setNewAwardData(prev => ({ ...prev, endDate: nextYear.toISOString().split('T')[0] }));
                      }}
                      className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
                    >
                      +1 ano
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddAwardForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddAward}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Conceder Premiação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Analytics Simplificado para resolver tela branca
  const renderAnalytics = () => {
    // Dados básicos das propostas
    const totalProposals = filteredProposals.length;
    const implantadas = filteredProposals.filter((p: any) => p.status === 'implantado').length;
    const pendentes = filteredProposals.filter((p: any) => p.status === 'pendente').length;
    const rejeitadas = filteredProposals.filter((p: any) => p.status === 'rejeitado').length;
    
    // Dados mensais simples para o gráfico de ondas
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toISOString().slice(0, 7);
      const monthName = month.toLocaleDateString('pt-BR', { month: 'short' });
      
      const monthProposals = filteredProposals.filter((p: any) => {
        const proposalDate = new Date(p.createdAt || Date.now());
        return proposalDate.toISOString().slice(0, 7) === monthKey;
      });
      
      monthlyData.push({
        month: monthName,
        total: monthProposals.length,
        implantadas: monthProposals.filter((p: any) => p.status === 'implantado').length,
        faturamento: monthProposals.length * 50 // Mock simples para visualização
      });
    }



    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Analytics & Performance</h2>
              <p className="text-gray-600 mt-1">Análise de {totalProposals} propostas</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">T</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{totalProposals}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-medium">I</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Implantadas</p>
                <p className="text-2xl font-semibold text-gray-900">{implantadas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-medium">P</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-semibold text-gray-900">{pendentes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-medium">R</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Rejeitadas</p>
                <p className="text-2xl font-semibold text-gray-900">{rejeitadas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Ondas Mensais */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Comparação Mensal - Últimos 12 Meses</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'total') return [`${value} propostas`, 'Total'];
                    if (name === 'implantadas') return [`${value} convertidas`, 'Implantadas'];
                    if (name === 'faturamento') return [`${value}k`, 'Faturamento'];
                    return [value, name];
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="total"
                />
                <Line 
                  type="monotone" 
                  dataKey="implantadas" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="implantadas"
                />
                <Line 
                  type="monotone" 
                  dataKey="faturamento" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  name="faturamento"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header e Navegação */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img className="h-8 w-8" src="/logo.png" alt="Logo" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Portal Supervisor</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'propostas', label: 'Propostas', count: filteredProposals.length },
              { key: 'analytics', label: 'Analytics', count: null }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'propostas' && <div>Conteúdo das propostas</div>}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
}

export default SupervisorPortal;
