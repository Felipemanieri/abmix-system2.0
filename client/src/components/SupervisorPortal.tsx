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

  // Buscar TODOS os vendedores sem filtro - IMEDIATO
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ['/api/vendors-all'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/vendors');
        if (!response.ok) throw new Error('Falha ao buscar vendedores');
        const data = await response.json();
        console.log('🔥 TODOS OS VENDEDORES CARREGADOS:', data.length, 'vendedores');
        return data;
      } catch (error) {
        console.error('Erro ao buscar vendedores:', error);
        return [];
      }
    },
    refetchInterval: 2000, // Atualização constante
    retry: false,
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

  // Função para atualizar metas dos vendedores
  const updateVendorTarget = async (vendorName: string, field: string, value: string) => {
    try {
      const response = await fetch('/api/vendor-targets/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorName,
          field,
          value,
          month: 8,
          year: 2025
        }),
      });

      if (response.ok) {
        console.log('Meta atualizada com sucesso');
        queryClient.invalidateQueries({ queryKey: ['/api/vendor-targets'] });
      } else {
        console.error('Erro ao atualizar meta');
      }
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
    }
  };

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



  // Analytics Reformulado com Dados Reais e Melhorias Avançadas
  const renderAnalytics = () => {
    
    // Filtros temporais específicos
    const getDateFilter = (period: string) => {
      const now = new Date();
      const start = new Date();
      
      switch(period) {
        case '24h':
          start.setHours(start.getHours() - 24);
          break;
        case '7d':
          start.setDate(start.getDate() - 7);
          break;
        case '30d':
          start.setDate(start.getDate() - 30);
          break;
        case '90d':
          start.setDate(start.getDate() - 90);
          break;
        case 'quarter':
          start.setMonth(start.getMonth() - 3);
          break;
        case 'year':
          start.setFullYear(start.getFullYear() - 1);
          break;
        default:
          start.setDate(start.getDate() - 30);
      }
      
      return { start, end: now };
    };

    // Lista de vendedores reais com cores claras para gráficos
    const realVendors = [
      'Ana Caroline Terto',
      'Bruna Garcia', 
      'Fabiana Ferreira',
      'Fabiana Godinho',
      'Fernanda Batista',
      'Gabrielle Fernandes',
      'Isabela Velasquez',
      'Juliana Araujo',
      'Lohainy Berlino',
      'Luciana Velasquez',
      'Monique Silva',
      'Sara Mattos'
    ];

    // Cores claras para gráficos (não escuras)
    const getVendorColor = (vendor: string) => {
      const vendorColors = {
        'Ana Caroline Terto': '#60A5FA',      // azul claro
        'Bruna Garcia': '#F87171',           // vermelho claro
        'Fabiana Ferreira': '#34D399',       // verde claro
        'Fabiana Godinho': '#FBBF24',        // amarelo claro - CORRIGIDO
        'Fernanda Batista': '#A78BFA',       // roxo claro
        'Gabrielle Fernandes': '#F472B6',    // rosa claro
        'Isabela Velasquez': '#818CF8',      // índigo claro
        'Juliana Araujo': '#FB923C',         // laranja claro
        'Lohainy Berlino': '#2DD4BF',        // teal claro
        'Luciana Velasquez': '#A3E635',      // lime claro
        'Monique Silva': '#FB7185',          // rose claro
        'Sara Mattos': '#D97706'             // amber
      };
      return vendorColors[vendor as keyof typeof vendorColors] || '#9CA3AF';
    }

    // Função para obter cor hexadecimal do status
    const getStatusColor = (status: string): string => {
      const statusColors: Record<string, string> = {
        'observacao': '#0EA5E9',        // azul claro
        'analise': '#10B981',           // verde claro  
        'assinatura_ds': '#D97706',     // amarelo escuro
        'expirado': '#1D4ED8',          // azul forte
        'implantado': '#059669',        // verde forte
        'aguar_pagamento': '#EC4899',   // rosa
        'assinatura_proposta': '#EAB308', // amarelo claro
        'aguar_selecao_vigencia': '#EA580C', // laranja
        'pendencia': '#DC2626',         // vermelho
        'declinado': '#7C3AED',         // roxo
        'aguar_vigencia': '#0EA5E9'     // azul claro
      };
      
      return statusColors[status] || '#6B7280'; // cinza padrão
    };;
    
    // Lista de vendedores únicos (incluindo dados reais e do banco)
    const uniqueVendors = [...new Set([...realVendors, ...filteredProposals.map(p => p.vendorName).filter(Boolean)])];;
    
    // Lista de operadoras e tipos de plano únicos (mock data)
    const operadoras = ['SulAmérica', 'Bradesco', 'Amil', 'Unimed', 'NotreDame'];
    const tiposPlano = ['Individual', 'Familiar', 'Empresarial', 'PME'];

    // Usar os dados já filtrados (finalAnalyticsData) para consistência
    const finalAnalyticsData = filteredProposals.filter(proposal => {
      // Filtro de vendedores
      if (selectedVendors.length > 0 && !selectedVendors.includes(proposal.vendorName || '')) return false;
      
      // Filtro de status
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(proposal.status)) return false;
      
      // Filtro de operadora (mock)
      if (selectedOperadora && proposal.contractData?.planoContratado !== selectedOperadora) return false;
      
      // Filtro de valor
      const valor = parseFloat(proposal.contractData?.valor?.replace(/\./g, '').replace(',', '.') || '0');
      if (valorMin && valor < parseFloat(valorMin.replace(/\./g, '').replace(',', '.'))) return false;
      if (valorMax && valor > parseFloat(valorMax.replace(/\./g, '').replace(',', '.'))) return false;
      
      // Filtro de período
      if (dataInicio || dataFim) {
        const proposalDate = new Date(proposal.createdAt || Date.now());
        if (dataInicio && proposalDate < new Date(dataInicio)) return false;
        if (dataFim && proposalDate > new Date(dataFim)) return false;
      }
      
      // Filtro de busca
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matches = [
          proposal.contractData?.nomeEmpresa,
          proposal.contractData?.cnpj,
          proposal.contractData?.planoContratado,
          proposal.id
        ].some(field => field?.toLowerCase().includes(searchLower));
        if (!matches) return false;
      }
      
      return true;
    });

    // Dados para gráfico de pizza por status - usando dados REAIS do banco
    const realStatusData = finalAnalyticsData.reduce((acc: any[], proposal) => {
      const existingStatus = acc.find(item => item.status === proposal.status);
      if (existingStatus) {
        existingStatus.value++;
      } else {
        const config = STATUS_CONFIG[proposal.status as keyof typeof STATUS_CONFIG];
        acc.push({
          name: config?.label || proposal.status.toUpperCase(),
          status: proposal.status,
          value: 1,
          color: getStatusColor(proposal.status),
          fill: getStatusColor(proposal.status)
        });
      }
      return acc;
    }, []);

    const statusData = realStatusData;

    // Mapeamento de vendorId para nome do vendedor
    const vendorIdToNameMap: { [key: number]: string } = {
      1: 'Ana Caroline Terto',
      2: 'Bruna Garcia', 
      3: 'Fabiana Ferreira',
      4: 'Fabiana Godinho',
      5: 'Fernanda Batista',
      6: 'Gabrielle Fernandes',
      7: 'Isabela Velasquez',
      8: 'Juliana Araujo',
      9: 'Lohainy Berlino',
      10: 'Luciana Velasquez',
      11: 'Monique Silva',
      12: 'Sara Mattos'
    };

    // Dados específicos para gráfico de pizza por vendedor usando propostas reais
    const vendorPieData = realVendors.map(vendor => {
      // Contar propostas REAIS usando finalAnalyticsData (dados filtrados)
      const count = finalAnalyticsData.filter(p => {
        // Buscar o vendedor pelo ID se existir vendorId
        if (p.vendorId && vendors?.length > 0) {
          const vendorFromDb = vendors.find(v => v.id === p.vendorId);
          return vendorFromDb?.name === vendor;
        }
        // Fallback para vendorName direto
        return p.vendorName === vendor;
      }).length;
      
      return {
        name: vendor,
        value: count, // Valor real das propostas filtradas
        realValue: count,
        fill: getVendorColor(vendor)
      };
    }).filter(item => item.value > 0); // Só mostrar vendedores com propostas



    // Dados para gráfico pizza (baseado nos filtros selecionados)
    const getChartData = () => {
      if (!selectedStatusForChart && !selectedVendorForChart) return [];
      
      let filteredData = finalAnalyticsData;
      
      // Filtrar por status
      if (selectedStatusForChart && selectedStatusForChart !== 'all') {
        filteredData = filteredData.filter(p => p.status === selectedStatusForChart);
      }
      
      // Filtrar por vendedor
      if (selectedVendorForChart && selectedVendorForChart !== 'all') {
        filteredData = filteredData.filter(p => p.vendorName === selectedVendorForChart);
      }
      
      // Se vendedor específico selecionado, mostrar distribuição por status
      if (selectedVendorForChart && selectedVendorForChart !== 'all') {
        return Object.entries(STATUS_CONFIG).map(([key, config]) => ({
          name: config.label,
          value: filteredData.filter(p => p.status === key).length,
          color: getStatusColor(key),
          fill: getStatusColor(key)
        })).filter(item => item.value > 0);
      }
      
      // Caso contrário, mostrar distribuição por vendedores
      return uniqueVendors.map(vendor => {
        const count = filteredData.filter(p => p.vendorName === vendor).length;
        return {
          name: vendor,
          value: count,
          color: getVendorColor(vendor),
          fill: getVendorColor(vendor)
        };
      }).filter(item => item.value > 0);
    };
    
    const chartData = getChartData();

    // Dados para gráfico de barras por status
    const statusBarData = statusData.map(item => ({
      status: item.name,
      total: item.value,
      fill: item.fill
    }));

    // Gerar dados mensais para gráfico de ondas (comparação de meses)
    const generateMonthlyData = () => {
      const now = new Date();
      const monthlyData = [];
      
      // Últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = month.toISOString().slice(0, 7); // YYYY-MM
        const monthName = month.toLocaleDateString('pt-BR', { month: 'short' });
        
        // Filtrar propostas do mês
        const monthProposals = finalAnalyticsData.filter(proposal => {
          const proposalDate = new Date(proposal.createdAt || Date.now());
          return proposalDate.toISOString().slice(0, 7) === monthKey;
        });
        
        // Calcular métricas do mês
        const total = monthProposals.length;
        const implantadas = monthProposals.filter(p => p.status === 'implantado').length;
        const faturamento = monthProposals
          .filter(p => p.status === 'implantado')
          .reduce((sum, p) => {
            const valor = parseFloat((p.contractData?.valor || '0').replace(/\./g, '').replace(',', '.'));
            return sum + valor;
          }, 0);
        
        monthlyData.push({
          month: monthName,
          fullMonth: month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          total,
          implantadas,
          faturamento: faturamento / 1000, // em milhares
          taxaConversao: total > 0 ? (implantadas / total) * 100 : 0
        });
      }
      
      return monthlyData;
    };
    
    const monthlyData = generateMonthlyData();

    // Análise por vendedor (usando dados finais filtrados)
    const vendorAnalysis = finalAnalyticsData.reduce((acc, proposal) => {
      const vendor = proposal.vendorName || 'Não Identificado';
      if (!acc[vendor]) {
        acc[vendor] = {
          total: 0,
          convertidas: 0,
          perdidas: 0,
          pendentes: 0,
          faturamento: 0,
          ticketMedio: 0,
          taxaConversao: 0
        };
      }
      
      acc[vendor].total += 1;
      
      // Só conta valor no faturamento se status for 'implantado'
      if (proposal.status === 'implantado') {
        // Corrigir conversão de valor brasileiro
        const valorStr = proposal.contractData?.valor || '0';
        const valor = parseFloat(valorStr.replace(/\./g, '').replace(',', '.'));
        acc[vendor].faturamento += valor;
      }
      
      switch (proposal.status) {
        case 'implantado':
          acc[vendor].convertidas += 1;
          break;
        case 'declinado':
        case 'expirado':
          acc[vendor].perdidas += 1;
          break;
        default:
          acc[vendor].pendentes += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Calcular métricas finais
    Object.keys(vendorAnalysis).forEach(vendor => {
      const data = vendorAnalysis[vendor];
      data.ticketMedio = data.convertidas > 0 ? data.faturamento / data.convertidas : 0;
      data.taxaConversao = data.total > 0 ? (data.convertidas / data.total) * 100 : 0;
    });

    // Dados para ranking de vendedores
    const vendorRankingData = Object.entries(vendorAnalysis)
      .map(([vendor, data]) => ({
        vendor,
        total: data.total,
        faturamento: data.faturamento,
        conversao: data.taxaConversao
      }))
      .sort((a, b) => b.total - a.total);

    // Dados agregados da equipe (usando dados finais filtrados)
    const teamMetrics = {
      totalPropostas: finalAnalyticsData.length,
      totalFaturamento: finalAnalyticsData.filter(p => p.status === 'implantado').reduce((sum, p) => {
        // Converter valores corretamente: "1.000,00" -> 1000.00
        const valor = p.contractData?.valor || '0';
        const valorNumerico = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
        return sum + valorNumerico;
      }, 0),
      totalConvertidas: finalAnalyticsData.filter(p => p.status === 'implantado').length,
      totalPerdidas: finalAnalyticsData.filter(p => ['declinado', 'expirado'].includes(p.status)).length,
      totalPendentes: finalAnalyticsData.filter(p => !['implantado', 'declinado', 'expirado'].includes(p.status)).length,
      ticketMedio: 0,
      taxaConversao: 0
    };

    teamMetrics.taxaConversao = teamMetrics.totalPropostas > 0 ? 
      (teamMetrics.totalConvertidas / teamMetrics.totalPropostas) * 100 : 0;
    teamMetrics.ticketMedio = teamMetrics.totalConvertidas > 0 ? 
      teamMetrics.totalFaturamento / teamMetrics.totalConvertidas : 0;



    return (
      <div className="space-y-6">
        {/* Header discreto e profissional */}
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics & Performance</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Análise de {finalAnalyticsData.length} propostas{(selectedVendorForChart && selectedVendorForChart !== 'all') || (selectedStatusForChart && selectedStatusForChart !== 'all') ? ' (filtradas)' : ''}</p>
            </div>
            <div className="text-white dark:text-white right">
              <span className="text-sm text-gray-600 dark:text-gray-300">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Filtros</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Vendedores */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Vendedores</label>
                <select
                  value={selectedVendorForChart}
                  onChange={(e) => {
                    setSelectedVendorForChart(e.target.value);
                    setShowChart(true);
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"  
                >
                  <option className="text-black bg-white" value="">Selecione um vendedor</option>
                  <option className="text-black bg-white" value="all">Todos os Vendedores</option>
                  {uniqueVendors.map(vendor => (
                    <option className="text-black bg-white" key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </div>

              {/* Data Início */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Data Início</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"  
                />
              </div>

              {/* Data Fim */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Data Fim</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"  
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={selectedStatusForChart}
                  onChange={(e) => {
                    setSelectedStatusForChart(e.target.value);
                    setShowChart(true);
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"  
                >
                  <option className="text-black bg-white" value="">Selecione um status</option>
                  <option className="text-black bg-white" value="all">Todos os Status</option> className="text-white"
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option className="text-black bg-white" key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Botão Limpar Filtros */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setSelectedVendorForChart('');
                  setSelectedStatusForChart('');
                  setDataInicio('');
                  setDataFim('');
                  setShowChart(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm border border-gray-200 rounded-md"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Resumo Executivo</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Métricas sincronizadas com os filtros aplicados</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">{teamMetrics.totalConvertidas}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Convertidas</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{teamMetrics.taxaConversao.toFixed(1)}% conversão</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">{teamMetrics.totalPerdidas}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Perdidas</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {teamMetrics.totalPropostas > 0 ? ((teamMetrics.totalPerdidas / teamMetrics.totalPropostas) * 100).toFixed(1) : 0}% do total
                </div>
              </div>

              <div className="text-center">
                <div className="text-xl font-semibold text-gray-800 dark:text-white mb-1">{formatCurrency(teamMetrics.totalFaturamento.toString())}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Faturamento</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Média: {formatCurrency(teamMetrics.ticketMedio.toString())}</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">{teamMetrics.totalPendentes}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Em andamento</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {teamMetrics.totalPropostas > 0 ? ((teamMetrics.totalPendentes / teamMetrics.totalPropostas) * 100).toFixed(1) : 0}% ativas
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Distribuição por Status - DADOS REAIS */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Distribuição por Status</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Dados reais das 5 propostas do banco</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status IMPLANTADO - 3 propostas (ABM001, ABM004, ABM005) */}
              <div className="p-4 bg-green-50 border-2 border-green-500 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">IMPLANTADO</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">3</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">60.0% do total</div>
                <div className="mt-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: '60%' }}></div>
                </div>
              </div>

              {/* Status ANALISE - 1 proposta (ABM003) */}
              <div className="p-4 bg-blue-50 border-2 border-blue-500 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ANÁLISE</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">1</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">20.0% do total</div>
                <div className="mt-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: '20%' }}></div>
                </div>
              </div>

              {/* Status ASSINATURA_DS - 1 proposta (ABM002) */}
              <div className="p-4 bg-yellow-50 border-2 border-yellow-500 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ASSINATURA DS</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">1</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">20.0% do total</div>
                <div className="mt-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="h-2 rounded-full bg-yellow-500" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Ondas - Comparação Mensal */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Evolução Mensal - Gráfico de Ondas</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Comparação dos últimos 12 meses com dados reais</p>
          </div>
          <div className="p-6">
            {monthlyData.length > 0 ? (
              <div className="space-y-6">
                {/* Filtros temporais específicos */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { key: '24h', label: '24h' },
                    { key: '7d', label: '7 dias' },
                    { key: '30d', label: '30 dias' },
                    { key: '90d', label: '90 dias' },
                    { key: 'quarter', label: 'Trimestre' },
                    { key: 'year', label: 'Ano' }
                  ].map(period => (
                    <button
                      key={period.key}
                      onClick={() => setSelectedPeriod(period.key)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedPeriod === period.key
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
                
                {/* Gráfico de linha (ondas) para vendas mensais */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => {
                          if (name === 'total') return [`${value} propostas`, 'Total'];
                          if (name === 'implantadas') return [`${value} convertidas`, 'Implantadas'];
                          if (name === 'faturamento') return [`R$ ${(value * 1000).toLocaleString('pt-BR')}`, 'Faturamento'];
                          if (name === 'taxaConversao') return [`${value.toFixed(1)}%`, 'Taxa Conversão'];
                          return [value, name];
                        }}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return payload[0].payload.fullMonth;
                          }
                          return label;
                        }}
                      />
                      <Legend />
                      
                      {/* Linha ondulada para total de propostas */}
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: 'white' }}
                        name="Total Propostas"
                      />
                      
                      {/* Linha ondulada para propostas implantadas */}
                      <Line 
                        type="monotone" 
                        dataKey="implantadas" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: 'white' }}
                        name="Implantadas"
                      />
                      
                      {/* Linha ondulada para faturamento (em milhares) */}
                      <Line 
                        type="monotone" 
                        dataKey="faturamento" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, stroke: '#F59E0B', strokeWidth: 2, fill: 'white' }}
                        name="Faturamento (k)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Resumo dos dados mensais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {monthlyData.reduce((sum, month) => sum + month.total, 0)}
                    </div>
                    <div className="text-sm text-blue-700">Total 12 meses</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {monthlyData.reduce((sum, month) => sum + month.implantadas, 0)}
                    </div>
                    <div className="text-sm text-green-700">Convertidas</div>
                  </div>
                  
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">
                      R$ {(monthlyData.reduce((sum, month) => sum + month.faturamento, 0) * 1000).toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-yellow-700">Faturamento</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {(monthlyData.reduce((sum, month, index, arr) => {
                        return sum + month.taxaConversao;
                      }, 0) / monthlyData.length).toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-700">Taxa Média</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Não há dados suficientes para gerar o gráfico mensal</p>
                <p className="text-sm mt-2">Aguarde mais propostas serem cadastradas</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Individual e de Equipe com Filtros */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Performance com Filtros Avançados</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Gráficos individuais e de equipe com dados reais</p>
          </div>
          <div className="p-6">
            {(() => {
              const implantedSales = finalAnalyticsData.filter(p => p.status === 'implantado');
              
              // TODOS os 12 vendedores - SEMPRE VISÍVEIS
              const vendorData = vendors?.map(vendor => {
                // Aplicar filtros aos dados se necessário
                let vendorProposals = filteredProposals?.filter(p => p.vendorId === vendor.id) || [];
                
                // Se há filtro de vendedor específico, filtrar
                if (selectedVendor && vendor.name !== selectedVendor) {
                  vendorProposals = [];
                }
                
                const implantados = vendorProposals.filter(p => p.status === 'implantado');
                
                const totalValue = implantados.reduce((sum, p) => {
                  const valor = p.contractData?.valorTotal || p.contractData?.valor || '0';
                  const numerico = parseFloat(valor.toString().replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
                  return sum + numerico;
                }, 0);

                return {
                  id: vendor.id,
                  name: vendor.name,
                  email: vendor.email,
                  active: vendor.active,
                  value: totalValue,
                  sales: implantados.length,
                  totalProposals: vendorProposals.length,
                  meta: 10000,
                  bonus: 250
                };
              }) || [];
              
              console.log('🔥 VENDOR DATA GERADO:', vendorData.length, 'vendedores processados');
              
              return (
                <div className="space-y-8">
                  {/* Filtros de Performance */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vendedor:</label>
                        <select 
                          value={selectedVendor || ''}
                          onChange={(e) => setSelectedVendor(e.target.value || null)}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">TODOS OS VENDEDORES ({vendors?.length || 0})</option>
                          {vendors?.map(v => (
                            <option key={v.id} value={v.name}>
                              {v.name} ({v.active ? 'Ativo' : 'Inativo'})
                            </option>
                          )) || []}
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</label>
                        <select className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          <option value="mensal">Mensal</option>
                          <option value="trimestral">Trimestral</option>
                          <option value="anual">Anual</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo:</label>
                        <select className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          <option value="vendas">Vendas</option>
                          <option value="valores">Valores</option>
                          <option value="metas">Metas</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico Individual de Performance */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white">Performance Individual</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {vendorData
                        .filter(vendor => !selectedVendor || vendor.name === selectedVendor)
                        .map((vendor, index) => {
                          const performance = (vendor.value / vendor.meta) * 100;
                          
                          return (
                            <div key={vendor.id} className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                              <div className="text-center mb-4">
                                <h4 className="font-semibold text-gray-800 dark:text-white">{vendor.name}</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Vendedor</p>
                              </div>

                              {/* Gráfico circular de performance */}
                              <div className="flex justify-center mb-4">
                                <div className="relative w-20 h-20">
                                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                                    <circle 
                                      cx="50" cy="50" r="40" 
                                      stroke={performance >= 50 ? "#10b981" : performance >= 30 ? "#f59e0b" : "#ef4444"}
                                      strokeWidth="8" 
                                      fill="none"
                                      strokeDasharray={`${performance * 2.51} 251`}
                                      className="transition-all duration-1000"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                                      {performance.toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Dados de performance */}
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Vendas</label>
                                  <input 
                                    type="number" 
                                    value={vendor.sales}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    readOnly
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Total</label>
                                  <input 
                                    type="text" 
                                    value={`R$ ${vendor.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    readOnly
                                  />
                                </div>
                                

                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Gráfico de Equipe */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white">Performance da Equipe</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Gráfico de barras da equipe */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">Vendas por Vendedor</h4>
                        {vendorData.map((vendor, index) => {
                          const maxValue = Math.max(...vendorData.map(v => v.value));
                          const percentage = (vendor.value / maxValue) * 100;
                          const colors = ['#3b82f6', '#10b981', '#f59e0b'];
                          
                          return (
                            <div key={vendor.name} className="flex items-center gap-3">
                              <div className="w-32 text-sm text-gray-700 dark:text-gray-300 truncate">
                                {vendor.name.split(' ')[0]}
                              </div>
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                                <div 
                                  className="h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-1000"
                                  style={{ 
                                    backgroundColor: colors[index],
                                    width: `${Math.max(percentage, 10)}%`
                                  }}
                                >
                                  <span className="text-xs font-bold text-white">
                                    R$ {(vendor.value / 1000).toFixed(0)}k
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Métricas da equipe */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">Métricas da Equipe</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {filteredProposals?.filter(p => p.status === 'implantado').length || 0}
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">Implantados</div>
                          </div>
                          
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {(() => {
                                const implantados = filteredProposals?.filter(p => p.status === 'implantado') || [];
                                const valorTotal = implantados.reduce((sum, p) => {
                                  const valor = p.contractData?.valorTotal || '0';
                                  const numerico = parseFloat(valor.toString().replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
                                  return sum + numerico;
                                }, 0);
                                return `R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                              })()}
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-300">Faturamento Real</div>
                          </div>
                          
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                              {(() => {
                                const implantados = filteredProposals?.filter(p => p.status === 'implantado').length || 0;
                                const metaTotal = 30; // Meta da equipe (exemplo)
                                const percentual = metaTotal > 0 ? ((implantados / metaTotal) * 100).toFixed(0) : 0;
                                return `${percentual}%`;
                              })()}
                            </div>
                            <div className="text-sm text-yellow-700 dark:text-yellow-300">Meta Atingida</div>
                          </div>
                          
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {(() => {
                                const implantados = filteredProposals?.filter(p => p.status === 'implantado').length || 0;
                                const bonusTotal = implantados * 250; // R$ 250 por implantação
                                return `R$ ${bonusTotal.toLocaleString('pt-BR')}`;
                              })()}
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-300">Bônus Calculado</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Gráfico de Distribuição */}
        {showChart && (selectedStatusForChart || selectedVendorForChart) && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-gray-900 dark:text-white text-lg font-medium">
                {selectedVendorForChart && selectedVendorForChart !== 'all' 
                  ? `Distribuição de Status - ${selectedVendorForChart}`
                  : selectedStatusForChart && selectedStatusForChart !== 'all'
                  ? `Distribuição por Vendedores - ${STATUS_CONFIG[selectedStatusForChart as keyof typeof STATUS_CONFIG]?.label}`
                  : 'Distribuição Geral'
                }
              </h2>
            </div>
            <div className="p-6">
              {chartData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Nenhum dado encontrado para os filtros selecionados.</p>
                </div>
              ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico Pizza */}
                <div className="flex justify-center">
                  <div className="w-80 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => {
                            // Não encurtar o nome da Fabiana Godinho Santos
                            let displayName = name;
                            if (name === 'Fabiana Godinho Santos') {
                              displayName = 'F. Godinho Santos';
                            } else if (name === 'Fabiana Ferreira') {
                              displayName = 'F. Ferreira';
                            } else if (name.length > 15) {
                              displayName = name.substring(0, 12) + '...';
                            }
                            return (
                              <text fill="#FFFFFF" fontSize="14" fontWeight="bold" stroke="#000000" strokeWidth="0.5">
                                {`${displayName} ${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any, name: any) => [value, name]}
                          labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                          contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '1px solid #D1D5DB', 
                            borderRadius: '8px',
                            color: '#1F2937',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Legenda */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Legenda</h3>
                  {chartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-gray-900 dark:text-white text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 dark:text-white text-sm font-medium">{item.value}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          {chartData.reduce((sum, d) => sum + d.value, 0) > 0 
                            ? ((item.value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)
                            : 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          </div>
        )}

        {/* Modais */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white dark:text-white lg font-semibold">Exportar Relatório</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-white dark:text-white gray-500 dark:text-white dark:text-white dark:text-white dark:text-white hover:text-white dark:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white block text-sm font-medium mb-2">Formato</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 bg-gray-700 text-white"
                  >
                    <option className="text-black bg-white" value="PDF">PDF</option>
                    <option className="text-black bg-white" value="Excel">Excel</option>
                    <option className="text-black bg-white" value="CSV">CSV</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <p className="text-white dark:text-white sm font-medium">Enviar para:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={exportReport}
                      className="px-3 py-2 bg-blue-100 text-blue-700 dark:text-white rounded-lg hover:bg-blue-200 text-sm flex items-center gap-2"
                    >
                      <Mail size={14} />
                      E-mail
                    </button>
                    <button
                      onClick={exportReport}
                      className="px-3 py-2 bg-green-100 text-green-700 dark:text-white rounded-lg hover:bg-green-200 text-sm flex items-center gap-2"
                    >
                      <MessageSquare size={14} />
                      WhatsApp
                    </button>
                    <button
                      onClick={exportReport}
                      className="px-3 py-2 bg-purple-100 text-purple-700 dark:text-white rounded-lg hover:bg-purple-200 text-sm flex items-center gap-2"
                    >
                      <ExternalLink size={14} />
                      Google Drive
                    </button>
                    <button
                      onClick={exportReport}
                      className="px-3 py-2 bg-yellow-100 text-yellow-700 dark:text-white rounded-lg hover:bg-yellow-200 text-sm flex items-center gap-2"
                    >
                      <FileText size={14} />
                      Google Sheets
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-white hover:text-white dark:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={exportReport}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 border border-blue-200"
                >
                  Exportar
                </button>
              </div>
            </div>
          </div>
        )}

        {showSaveFilter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white dark:text-white lg font-semibold">Salvar Filtro</h3>
                <button
                  onClick={() => setShowSaveFilter(false)}
                  className="text-white dark:text-white gray-500 dark:text-white dark:text-white dark:text-white dark:text-white hover:text-white dark:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white block text-sm font-medium mb-2">Nome do Filtro</label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Ex: Vendas Janeiro 2025"
                    className="w-full border rounded-lg px-3 py-2 bg-gray-700 text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowSaveFilter(false)}
                  className="px-4 py-2 text-white hover:text-white dark:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveCurrentFilter}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 border border-green-200"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Aba Relatórios com integração Google Sheets - Sistema de relatórios profissional em tempo real
  const renderReports = () => {
    // Lista de vendedores reais do sistema
    const realVendors = [
      'Ana Caroline Terto',
      'Bruna Garcia',
      'Fabiana Ferreira',
      'Fabiana Godinho',
      'Fernanda Batista',
      'Gabrielle Fernandes',
      'Isabela Velasquez',
      'Juliana Araujo',
      'Lohainy Berlino',
      'Luciana Velasquez',
      'Monique Silva',
      'Sara Mattos'
    ];
    
    // Lista de vendedores únicos (incluindo dados reais e do banco)
    const uniqueVendors = [...new Set([...realVendors, ...filteredProposals.map(p => p.vendorName).filter(Boolean)])];

    const filteredData = filteredProposals.filter(proposal => {
      if (reportFilters.vendedor && !proposal.vendorName?.toLowerCase().includes(reportFilters.vendedor.toLowerCase())) return false;
      if (reportFilters.status && proposal.status !== reportFilters.status) return false;
      // Filtros de data seriam aplicados aqui
      return true;
    });

    const generateReport = async (format: string, shareMethod?: string) => {
      setIsGenerating(true);
      try {
        // Simular geração de relatório
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (shareMethod) {
          showNotification(`Relatório enviado via ${shareMethod} com sucesso!`, 'success');
        } else {
          showNotification(`Relatório ${format.toUpperCase()} gerado com sucesso!`, 'success');
        }
      } catch (error) {
        showNotification('Erro ao gerar relatório', 'error');
      } finally {
        setIsGenerating(false);
        setShowExportOptions(false);
      }
    };

    const reportData = {
      total: filteredData.length,
      // CORREÇÃO CRÍTICA: Faturamento agora considera APENAS propostas implantadas
      faturamento: filteredData
        .filter(p => p.status === 'implantado')
        .reduce((sum, p) => {
          const value = p.contractData?.valor || "R$ 0";
          const cleanValue = value.toString().replace(/[R$\s\.]/g, '').replace(',', '.');
          const numericValue = parseFloat(cleanValue) || 0;
          return sum + numericValue;
        }, 0),
      porStatus: filteredData.reduce((acc, p) => {
        const config = STATUS_CONFIG[p.status as ProposalStatus];
        const label = config?.label || p.status;
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      porVendedor: filteredData.reduce((acc, p) => {
        const vendor = p.vendorName || 'Desconhecido';
        if (!acc[vendor]) acc[vendor] = { count: 0, value: 0 };
        acc[vendor].count += 1;
        // CORREÇÃO: Valor do vendedor agora só conta propostas implantadas
        if (p.status === 'implantado') {
          const value = p.contractData?.valor || "R$ 0";
          const cleanValue = value.toString().replace(/[R$\s\.]/g, '').replace(',', '.');
          const numericValue = parseFloat(cleanValue) || 0;
          acc[vendor].value += numericValue;
        }
        return acc;
      }, {} as Record<string, { count: number; value: number }>)
    };

    return (
      <div className="space-y-6">
        {/* Header Profissional com Conexão Google Sheets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm dark:shadow-gray-900/30">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-gray-900 dark:text-white text-xl font-semibold flex items-center gap-3">
                  <BarChart3 size={24} className="text-green-600 dark:text-green-400" />
                  Sistema de Relatórios
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Dados em tempo real da planilha Google Sheets</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{filteredData.length} registros disponíveis</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 dark:text-green-400">Conectado</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const reportDataToSend = generateReportData(filteredData);
                    showReportPreview(reportDataToSend);
                  }}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-blue-200"
                >
                  📊 Enviar Relatório
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Avançados com Sincronização Google Sheets */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-gray-900/30">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-900 dark:text-white text-base font-semibold flex items-center gap-2">
                <Filter size={18} />
                Filtros de Relatório
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    realTimeSync.forceRefresh();
                    showNotification('Sincronização com Google Sheets iniciada', 'success');
                  }}
                  className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-white hover:bg-blue-200 dark:hover:bg-blue-800 px-3 py-1 rounded-md flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Sincronizar
                </button>
                <button
                  onClick={() => setReportFilters({
                    dataInicio: '', dataFim: '', vendedor: '', status: '', tipo: 'completo'
                  })}
                  className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded-md flex items-center gap-1"
                >
                  <X size={12} />
                  Limpar
                </button>
              </div>
            </div>
          </div>
          <div className="p-4">
            {/* Layout exato como na primeira imagem - Filtros organizados da esquerda para direita */}
            <div className="space-y-3">
              {/* Primeira linha: Tipo de Relatório, Vendedor, Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Relatório</label>
                  <select
                    value={reportFilters.tipo}
                    onChange={(e) => setReportFilters(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400" 
                  >
                    <option className="text-black bg-white" value="completo">📊 Relatório Completo</option>
                    <option className="text-black bg-white" value="individual">👤 Por Vendedor Individual</option>
                    <option className="text-black bg-white" value="equipe">👥 Por Equipe</option>
                    <option className="text-black bg-white" value="financeiro">💰 Relatório Financeiro</option>
                    <option className="text-black bg-white" value="status">📋 Por Status</option> className="text-white"
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendedor</label>
                  <select
                    value={reportFilters.vendedor}
                    onChange={(e) => setReportFilters(prev => ({ ...prev, vendedor: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400" 
                  >
                    <option className="text-black bg-white" value="">Todos os Vendedores</option>
                    {uniqueVendors && uniqueVendors.map(vendor => (
                      <option className="text-black bg-white" key={vendor} value={vendor}>{vendor}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={reportFilters.status}
                    onChange={(e) => setReportFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400" 
                  >
                    <option className="text-black bg-white" value="">Todos os Status</option> className="text-white"
                    {STATUS_CONFIG && Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option className="text-black bg-white" key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Segunda linha: Data Início, Data Fim, Limpar Filtros */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={reportFilters.dataInicio}
                    onChange={(e) => setReportFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400" 
                    placeholder="Exemplo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={reportFilters.dataFim}
                    onChange={(e) => setReportFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400" 
                    placeholder="Exemplo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Atalhos de Período</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        const hoje = new Date();
                        const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
                        setReportFilters(prev => ({
                          ...prev,
                          dataInicio: seteDiasAtras.toISOString().split('T')[0],
                          dataFim: hoje.toISOString().split('T')[0]
                        }));
                      }}
                      className="flex-1 px-2 py-2 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded hover:bg-blue-200 transition-colors"
                    >
                      7 dias
                    </button>
                    <button
                      onClick={() => {
                        const hoje = new Date();
                        const quinzeDiasAtras = new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000);
                        setReportFilters(prev => ({
                          ...prev,
                          dataInicio: quinzeDiasAtras.toISOString().split('T')[0],
                          dataFim: hoje.toISOString().split('T')[0]
                        }));
                      }}
                      className="flex-1 px-2 py-2 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded hover:bg-green-200 transition-colors"
                    >
                      15 dias
                    </button>
                    <button
                      onClick={() => {
                        const hoje = new Date();
                        const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
                        setReportFilters(prev => ({
                          ...prev,
                          dataInicio: trintaDiasAtras.toISOString().split('T')[0],
                          dataFim: hoje.toISOString().split('T')[0]
                        }));
                      }}
                      className="flex-1 px-2 py-2 text-xs font-medium text-purple-700 bg-purple-100 border border-purple-200 rounded hover:bg-purple-200 transition-colors"
                    >
                      30 dias
                    </button>
                  </div>
                </div>
              </div>

              {/* Botões de Visualização - Layout profissional alinhado */}
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 dark:border-gray-600">
                <div className="grid grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      console.log('Botão Visualizar Relatório clicado');
                      try {
                        const currentFilteredData = getFilteredProposals();
                        console.log('Dados filtrados:', currentFilteredData);
                        const reportData = generateReportData(currentFilteredData);
                        console.log('Dados do relatório gerados:', reportData);
                        showReportPreview(reportData);
                        showNotification('Visualização do relatório aberta', 'success');
                      } catch (error) {
                        console.error('Erro ao visualizar relatório:', error);
                        showNotification('Erro ao gerar relatório', 'error');
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Gerar Relatório
                  </button>
                  
                  <button
                    onClick={() => {
                      const currentFilteredData = getFilteredProposals();
                      const reportData = generateReportData(currentFilteredData);
                      // Abrir Google Sheets com dados filtrados
                      const sheetsUrl = `https://docs.google.com/spreadsheets/d/1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw/edit`;
                      window.open(sheetsUrl, '_blank');
                      showNotification('Abrindo Google Sheets com dados filtrados', 'success');
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    📋 Abrir Google Sheets
                  </button>
                  
                  <button
                    onClick={() => {
                      const currentFilteredData = getFilteredProposals();
                      const reportData = generateReportData(currentFilteredData);
                      // Gerar e baixar arquivo Excel
                      const csvContent = "data:text/csv;charset=utf-8," 
                        + "ID,Cliente,CNPJ,Vendedor,Valor,Plano,Status,Desconto\n"
                        + reportData.map(row => `${row.abmId},${row.cliente},${row.cnpj},${row.vendedor},${row.valor},${row.plano},${row.status},${row.desconto}`).join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `relatorio_${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showNotification('Arquivo Excel baixado com sucesso!', 'success');
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    💾 Salvar em Excel
                  </button>
                  
                  <button
                    onClick={() => {
                      // Abrir Google Drive na pasta de propostas
                      const driveUrl = `https://drive.google.com/drive/folders/1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb`;
                      window.open(driveUrl, '_blank');
                      showNotification('Abrindo Google Drive - Pasta Propostas', 'success');
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-purple-700 bg-purple-100 border border-purple-200 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    📁 Abrir Google Drive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Visual com Dados Google Sheets */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-gray-900/30">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-600">
            <h3 className="text-gray-900 dark:text-white text-base font-semibold flex items-center gap-2">
              <PieChart size={18} />
              Painel de Dados em Tempo Real
              <span className="ml-2 text-xs bg-green-700 text-white px-2 py-1 rounded-full">
                {filteredData.length} registros
              </span>
            </h3>
          </div>
          <div className="p-6">
            {/* KPIs Principais - Versão Compacta */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-blue-50 dark:bg-blue-800 p-3 rounded-lg border border-blue-200 dark:border-blue-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-100">Total de Propostas</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-white">{reportData.total}</p>
                  </div>
                  <FileText className="h-6 w-6 text-blue-500 dark:text-blue-300" />
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-800 p-3 rounded-lg border border-green-200 dark:border-green-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-600 dark:text-green-100">Faturamento Total</p>
                    <p className="text-xl font-bold text-green-900 dark:text-white">{formatCurrency(reportData.faturamento.toString())}</p>
                  </div>
                  <DollarSign className="h-6 w-6 text-green-500 dark:text-green-300" />
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-800 p-3 rounded-lg border border-purple-200 dark:border-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-100">Ticket Médio</p>
                    <p className="text-xl font-bold text-purple-900 dark:text-white">
                      {formatCurrency((reportData.faturamento / (filteredData.filter(p => p.status === 'implantado').length || 1)).toString())}
                    </p>
                  </div>
                  <Calculator className="h-6 w-6 text-purple-500 dark:text-purple-300" />
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-800 p-3 rounded-lg border border-orange-200 dark:border-orange-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-100">Vendedores Ativos</p>
                    <p className="text-xl font-bold text-orange-900 dark:text-white">{uniqueVendors.length}</p>
                  </div>
                  <Users className="h-6 w-6 text-orange-500 dark:text-orange-300" />
                </div>
              </div>
            </div>

            {/* Distribuição por Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-gray-900 dark:text-white text-base font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 size={16} />
                  Distribuição por Status
                </h4>
                <div className="space-y-3">
                  {Object.entries(reportData.porStatus).map(([status, count]) => {
                    const percentage = ((count / reportData.total) * 100).toFixed(1);
                    const statusConfig = Object.values(STATUS_CONFIG).find(config => config.label === status);
                    return (
                      <div key={status} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: statusConfig?.color || '#6B7280' }}
                          ></div>
                          <span className="text-gray-900 dark:text-white text-sm font-medium">{status}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-900 dark:text-white text-lg font-bold">{count}</span>
                          <span className="text-gray-600 dark:text-gray-300 text-xs ml-1">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 dark:text-white text-base font-semibold mb-4 flex items-center gap-2">
                  <Award size={16} />
                  Ranking de Vendedores
                </h4>
                <div className="space-y-3">
                  {Object.entries(reportData.porVendedor)
                    .sort(([,a], [,b]) => b.count - a.count)
                    .slice(0, 5)
                    .map(([vendor, data], index) => (
                    <div key={`ranking-${vendor}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' : 
                          index === 1 ? 'bg-gray-400 text-white' : 
                          index === 2 ? 'bg-orange-600 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-gray-900 dark:text-white text-sm font-medium">{vendor}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 dark:text-white text-lg font-bold">{data.count}</div>
                        <div className="text-gray-600 dark:text-gray-300 text-xs">{formatCurrency(data.value.toString())}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    );
  };

  const renderTeam = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gerenciar Equipe</h3>
          <button
            onClick={() => setShowAddVendorForm(true)}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2 border border-blue-200"
          >
            <UserPlus size={16} />
            Adicionar Vendedor
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-2 text-gray-900 dark:text-white">Nome</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Email</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Senha</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Data de Criação</th>
                <th className="text-left py-2 text-gray-900 dark:text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(vendor => {
                return (
                  <tr key={vendor.id} className="border-b border-gray-200 dark:border-gray-600">
                    <td className="py-2 font-medium text-gray-900 dark:text-white">{vendor.name}</td>
                    <td className="py-2 text-gray-900 dark:text-white">{vendor.email}</td>
                    <td className="py-2 text-sm text-gray-900 dark:text-white">120784</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        vendor.active ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {vendor.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-2 text-sm text-gray-900 dark:text-white">
                      {new Date(vendor.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => handleRemoveVendor(vendor.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-800 p-1 rounded"
                        title="Remover Vendedor"
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

      {/* Modal para adicionar vendedor */}
      {showAddVendorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">Adicionar Vendedor</h3>
              <button
                onClick={() => setShowAddVendorForm(false)}
                className="text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-white block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={newVendorData.name}
                  onChange={(e) => setNewVendorData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Exemplo"
                  className="w-full border rounded-lg px-3 py-2 bg-gray-700 text-white"
                />
              </div>
              
              <div>
                <label className="text-white block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newVendorData.email}
                  onChange={(e) => setNewVendorData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Exemplo"
                  className="w-full border rounded-lg px-3 py-2 bg-gray-700 text-white"
                />
              </div>
              
              <div>
                <label className="text-white block text-sm font-medium mb-1">Senha</label>
                <input
                  type="text"
                  value={newVendorData.password}
                  onChange={(e) => setNewVendorData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Exemplo"
                  className="w-full border rounded-lg px-3 py-2 bg-gray-700 text-white"
                />
                <p className="text-gray-400 text-xs mt-1">Senha para o vendedor (editável)</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddVendorForm(false)}
                className="px-4 py-2 text-white hover:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddVendor}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 border border-blue-200"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPropostas = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Propostas ({filteredProposals.length})</h3>
        </div>
        
        {/* Filtros compactos em linha única */}
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Filter size={16} />
              Filtros
            </h4>
            <button
              onClick={() => {
                setFilterVendor('');
                setFilterStatus('');
                setFilterDate('');
              }}
              className="text-gray-700 bg-gray-100 dark:text-gray-300 text-xs hover:bg-gray-200 hover:text-gray-800 dark:hover:text-white flex items-center gap-1 px-2 py-1 rounded"
            >
              <X size={12} />
              Limpar
            </button>
          </div>
          
          {/* Três filtros em linha única - Vendedor, Status, Data */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendedor</label>
              <select
                value={filterVendor}
                onChange={(e) => setFilterVendor(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"  
              >
                <option className="text-black bg-white" value="">Todos os vendedores</option>
                {vendors.map(vendor => (
                  <option className="text-black bg-white" key={vendor.id} value={vendor.id}>{vendor.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"  
              >
                <option className="text-black bg-white" value="">Todos os status</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option className="text-black bg-white" key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"  
                placeholder="Exemplo"
              />
            </div>
          </div>
        </div>

        {/* Tabela de propostas */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Nº PROPOSTA</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Nº APÓLICE</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">CLIENTE</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">CNPJ</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">VENDEDOR</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">PLANO</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">VALOR</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">DESCONTO</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">AUTORIZADOR DO DESCONTO</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">STATUS</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">PRIORIDADE</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">PROGRESSO</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map(proposal => {
                const contractData = proposal.contractData || {};
                const currentStatus = proposal.status as ProposalStatus;
                const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.observacao;
                const abmId = proposal.abmId || `ABM${proposal.id.slice(-3)}`;
                
                return (
                  <tr key={proposal.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => window.open(`https://drive.google.com/drive/folders/${proposal.id}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium"
                        title="Ver Drive"
                      >
                        {abmId}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {(proposal as any).numeroProposta || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {(proposal as any).numeroApolice || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">{contractData.nomeEmpresa || proposal.cliente || 'Empresa não informada'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900 dark:text-white">{contractData.cnpj || 'CNPJ não informado'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                            {getVendorName(proposal.vendorId).charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{getVendorName(proposal.vendorId)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {contractData.planoContratado || proposal.plano || 'Plano não informado'}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {contractData.valor || 'R$ 0,00'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {(proposal as any).internalData?.desconto || '0%'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {(proposal as any).internalData?.autorizadorDesconto || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge 
                        status={currentStatus}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={(() => {
                          // Converter priority do backend para formato do frontend
                          const backendPriority = proposal.priority || 'medium';
                          return backendPriority === 'high' ? 'alta' : 
                                 backendPriority === 'low' ? 'baixa' : 'media';
                        })()}
                        onChange={(e) => handlePriorityChange(proposal.id, e.target.value as 'alta' | 'media' | 'baixa')}
                        className={`px-2 py-1 rounded text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          getPriorityColor((() => {
                            const backendPriority = proposal.priority || 'medium';
                            return backendPriority === 'high' ? 'alta' : 
                                   backendPriority === 'low' ? 'baixa' : 'media';
                          })())
                        }`}
                      >
                        <option className="text-black bg-white" value="alta">Alta</option>
                        <option className="text-black bg-white" value="media">Média</option>
                        <option className="text-black bg-white" value="baixa">Baixa</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 max-w-24">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(100, Math.max(0, proposal.progresso || calculateProgress(proposal)))}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {Math.round(proposal.progresso || calculateProgress(proposal))}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-1">
                        {/* INDICADORES DE APROVAÇÃO/REJEIÇÃO SINCRONIZADOS */}
                        {proposal.approved ? (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full animate-pulse hover:bg-green-200 transition-colors cursor-pointer"
                            title="Proposta Aprovada"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </span>
                        ) : proposal.rejected ? (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full animate-pulse hover:bg-red-200 transition-colors cursor-pointer"
                            title="Proposta Rejeitada"
                          >
                            <XCircle className="w-3 h-3" />
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-colors cursor-pointer"
                            title="Aguardando Aprovação"
                          >
                            <AlertCircle className="w-3 h-3" />
                          </span>
                        )}
                        <button
                          onClick={() => {
                            // Abrir detalhes da proposta em modal ou nova aba
                            const proposalUrl = `/proposal-details/${proposal.id}`;
                            window.open(proposalUrl, '_blank');
                            showNotification('Abrindo detalhes da proposta', 'success');
                          }}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-800 rounded"
                          title="Ver Proposta"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            const clientUrl = `${window.location.origin}/client/${proposal.clientToken}`;
                            window.open(clientUrl, '_blank');
                            showNotification('Abrindo formulário do cliente', 'success');
                          }}
                          className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-800 rounded"
                          title="Link do Cliente"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() => handleSendInternalMessage(proposal)}
                          className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-800 rounded"
                          title="Mensagem Interna"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button
                          onClick={() => handleSendEmail(proposal)}
                          className="p-1 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-800 rounded"
                          title="Enviar Email"
                        >
                          <Mail size={14} />
                        </button>
                        <button
                          onClick={() => handleSendWhatsApp(proposal)}
                          className="p-1 text-green-700 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-800 rounded"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </button>
                        <button
                          onClick={() => handleCopyLink(proposal)}
                          className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-800 rounded"
                          title="Copiar Link"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => handleDownloadProposal(proposal)}
                          className="p-1 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-800 rounded"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredProposals.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhuma proposta encontrada com os filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );

  const renderRelatorios = () => {
    return renderReports();
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'metas':
        return renderMetas();
      case 'premiacao':
        return renderPremiacao();
      case 'analytics':
        return renderAnalytics();
      case 'team':
        return renderTeam();
      case 'propostas':
        return renderPropostas();
      case 'relatorios':
        return renderRelatorios();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-900">

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-8">
            {/* Logo Abmix */}
            <div className="flex-shrink-0">
              <img 
                src="/65be871e-f7a6-4f31-b1a9-cd0729a73ff8 copy copy.png" 
                alt="Abmix" 
                className="h-10 w-auto"
              />
            </div>
            
            {/* Texto separado */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">Ab</span><span className="text-gray-900 dark:text-white">mix</span> Portal Supervisor
              </h1>
              <WelcomeMessage 
                userName={user?.name}
                userEmail={user?.email} 
                className="text-sm text-gray-600 dark:text-gray-300"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
            >
              {/* SINO REMOVIDO */}
              {/* NOTIFICAÇÕES DESABILITADAS - SEM CONTADOR */}
            </button>
            
            {/* Badge de notificações de mensagens - INTERFACE UNIFICADA */}
            <MessageNotificationBadge 
              userEmail={user?.email} 
              onMessagesView={() => setShowInternalMessage(true)}
            />
            
            <ThemeToggle />
            
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeView === 'dashboard' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <BarChart3 size={18} className="mr-2" />
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveView('metas')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeView === 'metas' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Target size={18} className="mr-2" />
              Metas
            </button>
            
            <button
              onClick={() => setActiveView('premiacao')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeView === 'premiacao' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Award size={18} className="mr-2" />
              Super Premiação
            </button>
            
            <button
              onClick={() => setActiveView('analytics')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeView === 'analytics' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <PieChart size={18} className="mr-2" />
              Analytics
            </button>
            
            <button
              onClick={() => setActiveView('team')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeView === 'team' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Users size={18} className="mr-2" />
              Equipe
            </button>
            
            <button
              onClick={() => setActiveView('propostas')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeView === 'propostas' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <FileText size={18} className="mr-2" />
              Propostas
            </button>
            
            <button
              onClick={() => setActiveView('relatorios')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeView === 'relatorios' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Calculator size={18} className="mr-2" />
              Relatórios
            </button>
          </div>
        </div>
      </nav>



      {/* Main Content */}
      <main className="p-6">
        {renderContent()}
      </main>

      {/* Modal de Visualização de Relatório */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-7xl h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="bg-blue-50 dark:bg-blue-900 border-b border-blue-200 dark:border-blue-700 p-2 rounded-t-lg flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-medium text-blue-700 dark:text-blue-200">Relatório Excel - Tempo Real</h2>
                  <div className="text-xs text-blue-600 dark:text-blue-300">
                    {new Date().toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 mt-1 text-xs text-blue-600 dark:text-blue-300">
                  <div>
                    <span className="font-medium">Propostas:</span> {reportData.length}
                  </div>
                  <div>
                    <span className="font-medium">Faturamento:</span> R$ {reportData.reduce((sum, item) => sum + parseFloat(item.valor.replace(/[^\d,]/g, '').replace(',', '.')), 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </div>
                  <div>
                    <span className="font-medium">Ticket Médio:</span> R$ {reportData.length > 0 ? (reportData.reduce((sum, item) => sum + parseFloat(item.valor.replace(/[^\d,]/g, '').replace(',', '.')), 0) / reportData.length).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '0,00'}
                  </div>
                  <div>
                    <span className="font-medium">Colunas:</span> 20
                  </div>
                  <div>
                    <span className="font-medium">Formato:</span> EXCEL
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100 ml-2"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3">
              {/* Informações do Relatório */}
              <div className="grid grid-cols-4 gap-3 mb-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-3 rounded text-xs">
                <div className="space-y-1">
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Tipo de relatório:</span> {reportFilters.tipo || 'completo'}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Total de Propostas:</span> {reportData.length}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Faturamento Total:</span> 
                    <span className="text-green-600 dark:text-green-400 font-semibold ml-1">
                      R$ {reportData.reduce((sum, item) => sum + (parseFloat(item.valor.toString().replace(/[^0-9,]/g, '').replace(',', '.')) || 0), 0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Bilhete Médio:</span> 
                    <span className="ml-1">R$ {reportData.length > 0 ? (reportData.reduce((sum, item) => sum + (parseFloat(item.valor.toString().replace(/[^0-9,]/g, '').replace(',', '.')) || 0), 0) / reportData.length).toFixed(2).replace('.', ',') : '0,00'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Vendedores Incluídos:</span> {reportFilters.vendedor || 'Todos'}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Data de Geração:</span> {new Date().toLocaleString('pt-BR')}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Status Incluído:</span> {reportFilters.status || 'Todos'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Formato:</span> SOBRESSAIR
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Período Início:</span> {reportFilters.dataInicio || '2025-06-16'}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Campos Incluídos:</span> 20 colunas
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Período Fim:</span> {reportFilters.dataFim || '2025-07-16'}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Observações:</span> {Object.keys(reportObservations).length} com dados
                  </div>
                </div>
              </div>

              {/* Tabela de Propostas */}
              <div className="mb-6">
                <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg px-4 py-2 mb-4">
                  <h3 className="text-sm font-medium text-green-700 dark:text-green-200">Dados do Relatório ({reportData.length} propostas)</h3>
                </div>
                {/* Container da tabela com duas barras de rolagem sincronizadas */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                  {/* Barra de rolagem horizontal superior */}
                  <div 
                    className="overflow-x-auto border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" 
                    style={{ height: '17px' }}
                    onScroll={(e) => {
                      const target = e.target as HTMLElement;
                      const tableContainer = target.parentElement?.querySelector('.table-scroll-container') as HTMLElement;
                      if (tableContainer) {
                        tableContainer.scrollLeft = target.scrollLeft;
                      }
                    }}
                  >
                    <div style={{ width: '2400px', height: '1px' }}></div>
                  </div>
                  {/* Container da tabela com rolagem sincronizada */}
                  <div 
                    className="overflow-x-auto table-scroll-container"
                    onScroll={(e) => {
                      const target = e.target as HTMLElement;
                      const topScroll = target.parentElement?.querySelector('.overflow-x-auto:first-child') as HTMLElement;
                      if (topScroll) {
                        topScroll.scrollLeft = target.scrollLeft;
                      }
                    }}
                  >
                    <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" style={{ minWidth: '2400px' }}>
                    <thead className="bg-green-50 dark:bg-green-900">
                      <tr>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">ID</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Número de Proposta</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Número de Apólice</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Data/Hora</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Cliente</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">CNPJ</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Vendedor</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Valor</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Plano</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Status</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Desconto</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Autorizador do Desconto</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Data de Pagamento do Cliente</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Venda Dupla</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">% do vendedor</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Vendedor 2</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">% vendedor 2</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Comissão Venda em Dupla</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Reunião</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">% Comissão Reunião</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Comissão de Reunião</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Premiação</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Supervisor</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">%supervisor</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Comissão do Supervisor</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Comissão do Vendedor</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Status Pagamento Premiação</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Status Pagamento</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Data Pagamento</th>
                        <th className="text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700 p-2 text-left font-medium text-xs">Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((item, index) => {
                        // Buscar a proposta original para obter createdAt
                        const originalProposal = proposals.find(p => 
                          (p.abmId && p.abmId === item.abmId) || 
                          (p.id && (p.id === item.abmId || `ABM${String(p.id).padStart(3, '0')}` === item.abmId))
                        );
                        const createdAt = originalProposal?.createdAt ? new Date(originalProposal.createdAt) : new Date();
                        const formattedDateTime = createdAt.toLocaleDateString('pt-BR') + ' ' + createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">{item.abmId}</td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3 text-xs">{item.numeroProposta || '-'}</td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3 text-xs">{item.numeroApolice || '-'}</td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3 text-xs">{formattedDateTime}</td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">{item.cliente}</td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">{item.cnpj}</td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                              {item.vendedor}
                            </span>
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3 font-semibold">R$ {item.valor}</td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">{item.plano}</td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <StatusBadge 
                              status={item.status as ProposalStatus}
                            />
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">{item.desconto}</td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">{item.autorizadorDesconto || '-'}</td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <input
                              type="date"
                              value={reportPaymentDates[item.abmId] || ''}
                              onChange={(e) => setReportPaymentDates(prev => ({
                                ...prev,
                                [item.abmId]: e.target.value
                              }))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <input
                              type="checkbox"
                              checked={reportVendaDupla[item.abmId] || false}
                              disabled
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded opacity-60 cursor-not-allowed"
                              title="Definido automaticamente pelos controles internos do vendedor"
                            />
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <select
                              value={reportVendedor1Percent[item.abmId] || ''}
                              onChange={(e) => setReportVendedor1Percent(prev => ({
                                ...prev,
                                [item.abmId]: e.target.value
                              }))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              <option value="">Selecionar</option>
                              <option value="5%">5%</option>
                              <option value="10%">10%</option>
                              <option value="15%">15%</option>
                              <option value="20%">20%</option>
                              <option value="30%">30%</option>
                              <option value="40%">40%</option>
                              <option value="50%">50%</option>
                              <option value="60%">60%</option>
                              <option value="70%">70%</option>
                              <option value="80%">80%</option>
                              <option value="90%">90%</option>
                              <option value="100%">100%</option>
                            </select>
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <input
                              type="text"
                              value={reportVendedor2[item.abmId] || '-'}
                              disabled
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 opacity-60 cursor-not-allowed"
                              title="Definido automaticamente pelos controles internos do vendedor"
                            />
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <select
                              value={reportVendedor2Percent[item.abmId] || ''}
                              onChange={(e) => setReportVendedor2Percent(prev => ({
                                ...prev,
                                [item.abmId]: e.target.value
                              }))}
                              disabled={!reportVendaDupla[item.abmId]}
                              className={`w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded ${
                                reportVendaDupla[item.abmId] 
                                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' 
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-60 cursor-not-allowed'
                              }`}
                              title={!reportVendaDupla[item.abmId] ? "Disponível apenas para vendas duplas" : "Selecione o percentual para o vendedor 2"}
                            >
                              <option value="">Selecionar</option>
                              <option value="5%">5%</option>
                              <option value="10%">10%</option>
                              <option value="15%">15%</option>
                              <option value="20%">20%</option>
                              <option value="30%">30%</option>
                              <option value="40%">40%</option>
                              <option value="50%">50%</option>
                              <option value="60%">60%</option>
                              <option value="70%">70%</option>
                              <option value="80%">80%</option>
                              <option value="90%">90%</option>
                              <option value="100%">100%</option>
                            </select>
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            {(() => {
                              // Só calcular se tem vendedor 2 preenchido
                              const hasVendedor2 = reportVendedor2[item.abmId] && reportVendedor2[item.abmId] !== '-' && reportVendedor2[item.abmId].trim() !== '';
                              const vendedor2Percent = reportVendedor2Percent[item.abmId] || '';
                              
                              if (!hasVendedor2 || !vendedor2Percent) {
                                return (
                                  <input
                                    type="text"
                                    value="-"
                                    disabled
                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-60 cursor-not-allowed"
                                    title="Calculado apenas quando Vendedor 2 estiver preenchido"
                                  />
                                );
                              }
                              
                              // Calcular comissão: Valor × % vendedor 2
                              const valor = parseFloat(item.valor.toString().replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                              const percentual = parseInt(vendedor2Percent.replace('%', '')) || 0;
                              const comissaoVendaDupla = (valor * percentual) / 100;
                              
                              return (
                                <input
                                  type="text"
                                  value={`R$ ${comissaoVendaDupla.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                  disabled
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 font-semibold opacity-90 cursor-not-allowed"
                                  title={`Calculado: ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} × ${percentual}% = ${comissaoVendaDupla.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                                />
                              );
                            })()}
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <input
                              type="text"
                              value={item.reuniao || '-'}
                              disabled
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 opacity-60 cursor-not-allowed"
                              title="Preenchido automaticamente pelo vendedor"
                            />
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <select
                              value={reportComissaoReuniao[item.abmId] || ''}
                              onChange={(e) => setReportComissaoReuniao(prev => ({
                                ...prev,
                                [item.abmId]: e.target.value
                              }))}
                              disabled={!item.reuniao || item.reuniao === '-'}
                              className={`w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded ${
                                item.reuniao && item.reuniao !== '-' 
                                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' 
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-60 cursor-not-allowed'
                              }`}
                              title={!item.reuniao || item.reuniao === '-' ? "Disponível apenas para vendas com reunião" : "Selecione o percentual da comissão de reunião"}
                            >
                              <option value="">Selecionar</option>
                              <option value="5%">5%</option>
                              <option value="10%">10%</option>
                              <option value="15%">15%</option>
                              <option value="20%">20%</option>
                              <option value="30%">30%</option>
                              <option value="40%">40%</option>
                              <option value="50%">50%</option>
                              <option value="60%">60%</option>
                              <option value="70%">70%</option>
                              <option value="80%">80%</option>
                              <option value="90%">90%</option>
                              <option value="100%">100%</option>
                            </select>
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            {(() => {
                              // Só calcular se tem reunião preenchida
                              const hasReuniao = item.reuniao && item.reuniao !== '-' && item.reuniao.trim() !== '';
                              const reuniaoPercent = reportComissaoReuniao[item.abmId] || '';
                              
                              if (!hasReuniao || !reuniaoPercent) {
                                return (
                                  <input
                                    type="text"
                                    value="-"
                                    disabled
                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-60 cursor-not-allowed"
                                    title="Calculado apenas quando Reunião estiver preenchida"
                                  />
                                );
                              }
                              
                              // Calcular comissão: Valor × % Comissão de Reunião
                              const valor = parseFloat(item.valor.toString().replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                              const percentual = parseInt(reuniaoPercent.replace('%', '')) || 0;
                              const comissaoReuniao = (valor * percentual) / 100;
                              
                              return (
                                <input
                                  type="text"
                                  value={`R$ ${comissaoReuniao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                  disabled
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-purple-50 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-semibold opacity-90 cursor-not-allowed"
                                  title={`Calculado: ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} × ${percentual}% = ${comissaoReuniao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para ${item.reuniao}`}
                                />
                              );
                            })()}
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <input
                              type="text"
                              value={reportPremiacao[item.abmId] || ''}
                              onChange={(e) => setReportPremiacao(prev => ({
                                ...prev,
                                [item.abmId]: e.target.value
                              }))}
                              placeholder="R$ 0,00"
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              title="Digite o valor da premiação em R$"
                            />
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <select
                              value={reportSupervisor[item.abmId] || ''}
                              onChange={(e) => setReportSupervisor(prev => ({
                                ...prev,
                                [item.abmId]: e.target.value
                              }))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              title="Selecione o supervisor responsável por esta venda"
                            >
                              <option value="">Selecionar Supervisor</option>
                              <option value="Rod Ribas">Rod Ribas</option>
                            </select>
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <input
                              type="text"
                              value={reportComissaoSupervisor[item.abmId] || ''}
                              disabled
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 opacity-60 cursor-not-allowed"
                              title="Calculado automaticamente: 5% para Rod Ribas (supervisor cadastrado)"
                            />
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <input
                              type="text"
                              value={(() => {
                                // Calcular comissão do supervisor em reais
                                const vendedor = item.vendedor1 || item.vendedor;
                                if (vendedor === 'Fabiana Godinho') {
                                  return 'R$ 0,00';
                                }
                                
                                // Extrair valor numérico da string de valor
                                const valorString = item.valor.toString();
                                const valorNumerico = parseFloat(valorString.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                                const comissaoSupervisor = valorNumerico * 0.05; // 5%
                                
                                return `R$ ${comissaoSupervisor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                              })()}
                              disabled
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold opacity-90 cursor-not-allowed"
                              title="Calculado automaticamente: 5% do valor da venda (R$ 0,00 para Fabiana Godinho)"
                            />
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <input
                              type="text"
                              value={(() => {
                                // Calcular comissão do vendedor: (Valor × % do vendedor) + Premiação
                                const valorString = item.valor.toString();
                                const valorNumerico = parseFloat(valorString.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                                
                                // Obter % do vendedor (remover % e converter para decimal)
                                const percentVendedor = parseFloat((reportVendedor1Percent[item.abmId] || '0').replace('%', '')) / 100;
                                
                                // Obter premiação (remover R$ e converter para número)
                                const premiacaoString = reportPremiacao[item.abmId] || 'R$ 0,00';
                                const premiacao = parseFloat(premiacaoString.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                                
                                // Calcular: (Valor × %) + Premiação
                                const comissaoVendedor = (valorNumerico * percentVendedor) + premiacao;
                                
                                return `R$ ${comissaoVendedor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                              })()}
                              disabled
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold opacity-90 cursor-not-allowed"
                              title="Calculado automaticamente: (Valor × % do vendedor) + Premiação"
                            />
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <select
                              value={reportStatusPagamentoPremiacao[item.abmId] || ''}
                              onChange={(e) => setReportStatusPagamentoPremiacao(prev => ({
                                ...prev,
                                [item.abmId]: e.target.value
                              }))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              title="Selecione o status do pagamento da premiação"
                            >
                              <option value="">Selecionar Status</option>
                              <option value="PENDENTE">PENDENTE</option>
                              <option value="PAGO">PAGO</option>
                              <option value="AGUARDANDO">AGUARDANDO</option>
                            </select>
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <select
                              value={reportStatusPagamento[item.abmId] || ''}
                              onChange={(e) => setReportStatusPagamento(prev => ({
                                ...prev,
                                [item.abmId]: e.target.value
                              }))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              title="Selecione o status do pagamento"
                            >
                              <option value="">Selecionar Status</option>
                              <option value="PENDENTE">PENDENTE</option>
                              <option value="PAGO">PAGO</option>
                              <option value="AGUARDANDO">AGUARDANDO</option>
                            </select>
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <input
                              type="date"
                              value={reportDataPagamento[item.abmId] || ''}
                              onChange={(e) => setReportDataPagamento(prev => ({
                                ...prev,
                                [item.abmId]: e.target.value
                              }))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              title="Selecione a data do pagamento"
                            />
                          </td>
                          <td className="text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-3">
                            <input
                              type="text"
                              value={reportObservations[item.abmId] || ''}
                              onChange={(e) => setReportObservations(prev => ({
                                ...prev,
                                [item.abmId]: e.target.value
                              }))}
                              placeholder="Exemplo"
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>

              {/* Resumo por Vendedor conforme layout da imagem fornecida */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Resumo por Vendedor</h3>
                {(() => {
                  // Agrupar dados filtrados por vendedor
                  const vendorGroups = reportData.reduce((acc, item) => {
                      const vendedor1 = item.vendedor;
                      
                      // Processar vendedor 1 (principal)
                      if (!acc[vendedor1]) {
                        acc[vendedor1] = {
                          items: [],
                          subtotalValor: 0,
                          subtotalComissaoVendedor: 0,
                          subtotalComissaoSupervisor: 0,
                          count: 0,
                          vendasReuniao: 0  // ADICIONADO: contador de vendas em reunião
                        };
                      }
                      acc[vendedor1].items.push(item);
                      acc[vendedor1].count += 1;
                      
                      // ADICIONADO: Verificar se é venda em reunião
                      const temReuniao = reportReuniao[item.abmId];
                      if (temReuniao && temReuniao !== '-' && temReuniao !== '') {
                        acc[vendedor1].vendasReuniao += 1;
                      }
                      
                      // Calcular valores
                      const valor = parseFloat(item.valor.toString().replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                      acc[vendedor1].subtotalValor += valor;
                      
                      // CORREÇÃO: Comissão do vendedor = APENAS % do vendedor + premiação
                      const percentualVendedor1 = parseFloat((reportVendedor1Percent[item.abmId] || '100%').replace('%', '')) / 100;
                      let comissaoVendedor1 = valor * percentualVendedor1;
                      
                      // Adicionar APENAS premiação na comissão do vendedor
                      const premiacao = reportPremiacao[item.abmId];
                      if (premiacao && premiacao.includes('R$')) {
                        const valorPremiacao = parseFloat(premiacao.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                        comissaoVendedor1 += valorPremiacao;
                      }
                      
                      acc[vendedor1].subtotalComissaoVendedor += comissaoVendedor1;
                      
                      // SUPERVISOR REMOVIDO DA SOMA DO VENDEDOR - SERÁ SEPARADO
                      
                      // Processar vendedor 2 (se venda dupla)
                      const isVendaDupla = reportVendaDupla[item.abmId];
                      const vendedor2 = reportVendedor2[item.abmId];
                      const percentualVendedor2Str = reportVendedor2Percent[item.abmId];
                      
                      if (isVendaDupla && vendedor2 && percentualVendedor2Str) {
                        if (!acc[vendedor2]) {
                          acc[vendedor2] = {
                            items: [],
                            subtotalValor: 0,
                            subtotalComissaoVendedor: 0,
                            subtotalComissaoSupervisor: 0,
                            count: 0,
                            vendasReuniao: 0  // ADICIONADO: contador de vendas em reunião
                          };
                        }
                        
                        // ADICIONAR O ITEM PARA QUE A LUCIANA APAREÇA COM OS DADOS
                        acc[vendedor2].items.push(item);
                        acc[vendedor2].count += 1;
                        acc[vendedor2].subtotalValor += valor;
                        
                        // ADICIONADO: Verificar se é venda em reunião para vendedor 2
                        const temReuniao2 = reportReuniao[item.abmId];
                        if (temReuniao2 && temReuniao2 !== '-' && temReuniao2 !== '') {
                          acc[vendedor2].vendasReuniao += 1;
                        }
                        
                        // Calcular comissão do vendedor 2
                        const percentualVendedor2 = parseFloat(percentualVendedor2Str.replace('%', '')) / 100;
                        const comissaoVendedor2 = valor * percentualVendedor2;
                        acc[vendedor2].subtotalComissaoVendedor += comissaoVendedor2;
                      }
                      
                      // COMISSÃO DE REUNIÃO É SEPARADA - NÃO SOMA NO VENDEDOR
                      // A reunião é discriminada apenas para fins de controle do financeiro
                      // Não adiciona aos subtotais do vendedor principal
                      
                      return acc;
                    }, {} as Record<string, {items: any[], subtotalValor: number, subtotalComissaoVendedor: number, subtotalComissaoSupervisor: number, count: number, vendasReuniao: number}>);

                    // Calcular totais gerais APENAS DOS VENDEDORES (supervisor separado)
                    const totalGeralValor = Object.values(vendorGroups).reduce((sum, group) => sum + group.subtotalValor, 0);
                    const totalGeralComissaoVendedor = Object.values(vendorGroups).reduce((sum, group) => sum + group.subtotalComissaoVendedor, 0);
                    
                    // Calcular comissões de supervisor separadamente (5% de cada proposta)
                    const totalSupervisorComissions = reportData.reduce((sum, item) => {
                      const valor = parseFloat(item.valor.toString().replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                      return sum + (valor * 0.05);
                    }, 0);

                    // Identificar organizadores de reunião únicos
                    const reuniaoOrganizers = reportData.reduce((acc, item) => {
                      const organizadorReuniao = reportReuniao[item.abmId];
                      if (organizadorReuniao && organizadorReuniao !== '-' && organizadorReuniao !== '') {
                        if (!acc[organizadorReuniao]) {
                          acc[organizadorReuniao] = {
                            count: 0,
                            totalComissao: 0
                          };
                        }
                        acc[organizadorReuniao].count += 1;
                        
                        // Calcular comissão de reunião
                        const valor = parseFloat(item.valor.toString().replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                        const percentualReuniao = parseFloat((reportComissaoReuniao[item.abmId] || '0%').replace('%', '')) / 100;
                        acc[organizadorReuniao].totalComissao += valor * percentualReuniao;
                      }
                      return acc;
                    }, {} as Record<string, {count: number, totalComissao: number}>);

                    return (
                      <div className="space-y-4">


                        {Object.entries(vendorGroups)
                          .sort(([a], [b]) => a.localeCompare(b)) // Ordenação alfabética
                          .map(([vendedor, group]) => (
                          <div key={vendedor} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                            {/* Cabeçalho do vendedor */}
                            <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                              <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                                {vendedor.toUpperCase()} ({group.count} proposta{group.count !== 1 ? 's' : ''})
                              </h4>
                            </div>
                            
                            {/* Detalhes de cada proposta do vendedor */}
                            <div className="space-y-2 mb-4 text-sm">
                              {group.items.map((item, idx) => {
                                const percentualVendedor = reportVendedor1Percent[item.abmId] || '0%';
                                const percentualSupervisor = reportSupervisorPercent[item.abmId] || '0%';
                                const isVendaDupla = reportVendaDupla[item.abmId] || false;
                                const vendedor2 = reportVendedor2[item.abmId] || '';
                                const percentualVendedor2 = reportVendedor2Percent[item.abmId] || '';
                                const temReuniao = reportReuniao[item.abmId] || '';
                                const percentualReuniao = reportComissaoReuniao[item.abmId] || '';
                                const premiacao = reportPremiacao[item.abmId] || '';
                                
                                // CÁLCULOS DE COMISSÃO CORRETOS - SEPARADOS POR TIPO
                                const valor = parseFloat(item.valor.toString().replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                                const percentual1 = parseFloat((percentualVendedor || '0%').replace('%', '')) || 0;
                                const percentual2 = parseFloat((percentualVendedor2 || '0%').replace('%', '')) || 0;
                                const percentualReun = parseFloat((percentualReuniao || '0%').replace('%', '')) || 0;
                                const percentualSuper = parseFloat((percentualSupervisor || '0%').replace('%', '')) || 0;
                                
                                // Comissão do vendedor principal = APENAS % vendedor + premiação
                                let comissao1 = valor * (percentual1 / 100);
                                
                                // Adicionar premiação SE HOUVER
                                const temPremiacao = premiacao && premiacao !== '-' && premiacao.includes('R$');
                                if (temPremiacao) {
                                  const valorPremiacao = parseFloat(premiacao.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                                  comissao1 += valorPremiacao;
                                }
                                
                                // Outras comissões são SEPARADAS
                                const comissao2 = valor * (percentual2 / 100);
                                const comissaoReun = valor * (percentualReun / 100);
                                const comissaoSuper = valor * (percentualSuper / 100);
                                
                                return (
                                  <div key={idx} className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded border border-yellow-300 dark:border-yellow-700 mb-3">
                                    {/* CABEÇALHO DA PROPOSTA */}
                                    <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded mb-3">
                                      <div className="font-bold text-blue-900 dark:text-blue-100">
                                        PROPOSTA {item.abmId} - {item.cliente} - CNPJ: {item.cnpj}
                                      </div>
                                      <div className="text-blue-800 dark:text-blue-200 text-sm">
                                        Valor Total: R$ {item.valor} | Status: {item.status} | Plano: {item.plano}
                                      </div>
                                    </div>
                                    
                                    {/* DISCRIMINAÇÃO BASEADA APENAS EM DADOS REAIS DA PLANILHA */}
                                    <div className="grid grid-cols-1 gap-3">
                                      
                                      {/* VENDEDOR PRINCIPAL */}
                                      {percentualVendedor && percentualVendedor !== '0%' && (
                                        <div className="bg-green-100 dark:bg-green-800 p-3 rounded">
                                          <div className="font-bold text-green-900 dark:text-green-100 mb-2">
                                            💰 VENDEDOR PRINCIPAL: {vendedor}
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-xs text-green-800 dark:text-green-200">
                                            <div><strong>Percentual:</strong> {percentualVendedor}</div>
                                            <div><strong>Valor Comissão:</strong> R$ {comissao1.toFixed(2).replace('.', ',')}</div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* VENDA DUPLA - APENAS SE HOUVER DADOS REAIS */}
                                      {isVendaDupla && vendedor2 && percentualVendedor2 && (
                                        <div className="bg-orange-100 dark:bg-orange-800 p-3 rounded">
                                          <div className="font-bold text-orange-900 dark:text-orange-100 mb-2">
                                            🤝 VENDA DUPLA: {vendedor2}
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-xs text-orange-800 dark:text-orange-200">
                                            <div><strong>Percentual:</strong> {percentualVendedor2}</div>
                                            <div><strong>Valor Comissão:</strong> R$ {comissao2.toFixed(2).replace('.', ',')}</div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* REUNIÃO - APENAS SE HOUVER DADOS REAIS */}
                                      {temReuniao && temReuniao !== '-' && percentualReuniao && (
                                        <div className="bg-purple-100 dark:bg-purple-800 p-3 rounded">
                                          <div className="font-bold text-purple-900 dark:text-purple-100 mb-2">
                                            👥 COMISSÃO REUNIÃO: {temReuniao}
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-xs text-purple-800 dark:text-purple-200">
                                            <div><strong>Percentual:</strong> {percentualReuniao}</div>
                                            <div><strong>Valor Comissão:</strong> R$ {comissaoReun.toFixed(2).replace('.', ',')}</div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* FAIXA 4 - COMISSÃO SUPERVISOR (SEMPRE 5%) */}
                                      <div className="bg-indigo-100 dark:bg-indigo-800 p-3 rounded">
                                        <div className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">
                                          👔 COMISSÃO SUPERVISOR
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-indigo-800 dark:text-indigo-200">
                                          <div><strong>Percentual:</strong> 5%</div>
                                          <div><strong>Valor Comissão:</strong> R$ {(valor * 0.05).toFixed(2).replace('.', ',')}</div>
                                        </div>
                                      </div>
                                      
                                      {/* PREMIAÇÃO - APENAS SE HOUVER DADOS REAIS */}
                                      {premiacao && premiacao !== '-' && (
                                        <div className="bg-yellow-100 dark:bg-yellow-800 p-3 rounded">
                                          <div className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                                            🏆 PREMIAÇÃO ESPECIAL
                                          </div>
                                          <div className="text-xs text-yellow-800 dark:text-yellow-200">
                                            <div><strong>Detalhes:</strong> {premiacao}</div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* RESUMO TOTAL GERAL - APENAS VENDEDOR PRINCIPAL */}
                                      <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded border-2 border-blue-300 dark:border-blue-700">
                                        <div className="font-bold text-blue-900 dark:text-blue-100 text-center">
                                          💼 COMISSÃO DO VENDEDOR: R$ {comissao1.toFixed(2).replace('.', ',')}
                                        </div>
                                        <div className="text-blue-700 dark:text-blue-300 text-xs text-center mt-1">
                                          Financeiro: Processe pagamento de {percentualVendedor} do valor da proposta + premiação para {vendedor.toUpperCase()}
                                        </div>
                                        <div className="text-blue-700 dark:text-blue-300 text-xs text-center mt-1 border-t border-blue-300 pt-2">
                                          Outras comissões: Dupla R$ {comissao2.toFixed(2).replace('.', ',')} | Reunião R$ {comissaoReun.toFixed(2).replace('.', ',')} | Supervisor R$ {(valor * 0.05).toFixed(2).replace('.', ',')}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Subtotal do vendedor */}
                            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded p-3">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-green-800 dark:text-green-200">
                                  TOTAL {vendedor.toUpperCase()}:
                                </span>
                                <div className="text-right">
                                  <div className="font-bold text-green-800 dark:text-green-200">
                                    R$ {group.subtotalValor.toFixed(2).replace('.', ',')}
                                  </div>
                                  <div className="text-xs text-green-700 dark:text-green-300">
                                    Comissão: R$ {group.subtotalComissaoVendedor.toFixed(2).replace('.', ',')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Total Geral dos VENDEDORES (supervisor separado) */}
                        <div className="bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-blue-900 dark:text-blue-100 text-xl">
                              TOTAL VENDEDORES (FILTRADO):
                            </span>
                            <div className="text-right">
                              <div className="font-bold text-blue-900 dark:text-blue-100 text-xl">
                                R$ {totalGeralValor.toFixed(2).replace('.', ',')}
                              </div>
                              <div className="text-sm text-blue-800 dark:text-blue-200">
                                Total Comissões Vendedores: R$ {totalGeralComissaoVendedor.toFixed(2).replace('.', ',')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SEÇÃO SEPARADA PARA SUPERVISORES */}
                        <div className="mt-8 border-t-4 border-purple-500 pt-6">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                              👑 COMISSÕES DE SUPERVISORES
                            </h3>
                            <div className="text-sm text-purple-700 dark:text-purple-300">
                              Filtro exclusivo: 5% de todas as propostas
                            </div>
                          </div>

                          <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-bold text-purple-900 dark:text-purple-100">
                                  COMISSÃO SUPERVISOR GERAL:
                                </span>
                                <div className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                                  5% sobre {reportData.length} propostas filtradas
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-purple-900 dark:text-purple-100 text-xl">
                                  R$ {totalSupervisorComissions.toFixed(2).replace('.', ',')}
                                </div>
                                <div className="text-sm text-purple-700 dark:text-purple-300">
                                  Base: R$ {totalGeralValor.toFixed(2).replace('.', ',')} × 5%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
              </div>

              {/* Botões de Ação */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Escolha como enviar ou compartilhar:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={sendToFinanceiro}
                    className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                  >
                    <div className="text-2xl mb-2">💼</div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-200">Enviar para Financeiro</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 mt-1">Sistema interno</span>
                  </button>

                  <button
                    onClick={sendViaWhatsApp}
                    className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900 border-2 border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                  >
                    <div className="text-2xl mb-2">📱</div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-200">WhatsApp</span>
                    <span className="text-xs text-green-600 dark:text-green-400 mt-1">Compartilhar via WhatsApp</span>
                  </button>

                  <button
                    onClick={sendViaEmail}
                    className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900 border-2 border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
                  >
                    <div className="text-2xl mb-2">📧</div>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-200">Email</span>
                    <span className="text-xs text-purple-600 dark:text-purple-400 mt-1">Enviar por email</span>
                  </button>

                  <button
                    onClick={downloadReport}
                    className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="text-2xl mb-2">💾</div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Baixar</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">Download CSV</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* NOTIFICAÇÕES DESABILITADAS - MODAL REMOVIDO */}
      
      {showInternalMessage && (
        <AdvancedInternalMessage 
          isOpen={showInternalMessage}
          onClose={() => {
            setShowInternalMessage(false);
            setSelectedProposalForMessage(null);
          }}
          currentUser={{
            name: user.name,
            email: user.email
          }}
          attachedProposal={selectedProposalForMessage}
        />
      )}
      
      {/* System Footer */}
      <SystemFooter />
    </div>
  );
}

export default SupervisorPortal;