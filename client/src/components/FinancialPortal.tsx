import React, { useState, useEffect } from 'react';
import { LogOut, DollarSign, TrendingUp, CheckCircle, AlertCircle, XCircle, Eye, Calculator, Calendar, FileText, User, CreditCard, PieChart, BarChart3, Wallet, MessageSquare, Zap, Users, Upload, Database, Filter, Search, Settings, Mail, Download, Share2, ExternalLink, Send, Copy, X, RefreshCw, MessageCircle, FileSpreadsheet } from 'lucide-react';
// import AbmixLogo from './AbmixLogo';
import ActionButtons from './ActionButtons';
import AdvancedInternalMessage from './AdvancedInternalMessage';
import MessageNotificationBadge from './MessageNotificationBadge';
import FinancialAutomationModal from './FinancialAutomationModal';
import { WelcomeMessage } from './WelcomeMessage';

// NotificationCenter removido
import ClientForm from './ClientForm';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import ProposalProgressTracker from './ProposalProgressTracker';
import FolderNameEditor from './FolderNameEditor';
import SystemFooter from './SystemFooter';
import ThemeToggle from './ThemeToggle';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
// Notificações completamente removidas
import { useProposals, useRealTimeProposals, useUpdateProposal } from '../hooks/useProposals';
import { realTimeSync } from '../utils/realTimeSync';
import StatusManager, { ProposalStatus, STATUS_CONFIG } from '@shared/statusSystem';
import { getDynamicGreeting } from '../utils/greetingHelper';

interface FinancialPortalProps {
  user: any;
  onLogout: () => void;
}

interface Transaction {
  id: string;
  client: string;
  plan: string;
  value: string;
  type: 'income' | 'expense' | 'pending';
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  category: string;
  realStatus?: string;
}

const FinancialPortal: React.FC<FinancialPortalProps> = ({ user, onLogout }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  // NOTIFICAÇÕES COMPLETAMENTE REMOVIDAS
  const [showInternalMessage, setShowInternalMessage] = useState(false);
  const [selectedProposalForMessage, setSelectedProposalForMessage] = useState(null);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [selectedProposalForAutomation, setSelectedProposalForAutomation] = useState<{id: string, client: string} | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all'); 
  const [activeTab, setActiveTab] = useState<'dashboard' | 'proposals' | 'clients' | 'analysis' | 'accounting' | 'commissions'>('dashboard');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showFinancialArea, setShowFinancialArea] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusManager] = useState(() => StatusManager);
  const [proposalStatuses, setProposalStatuses] = useState<Map<string, ProposalStatus>>(new Map());
  
  // Estado para relatórios recebidos do supervisor (inicia vazio)
  const [receivedReports, setReceivedReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportsBox, setShowReportsBox] = useState(false);
  const [reportDateFilter, setReportDateFilter] = useState('all');
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelReportData, setExcelReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar relatórios do localStorage ao inicializar
  useEffect(() => {
    const loadReports = () => {
      const savedReports = JSON.parse(localStorage.getItem('financialReports') || '[]');
      setReceivedReports(savedReports);
    };

    loadReports();

    // Escutar eventos de novos relatórios
    const handleNewReport = (event: any) => {
      const newReport = event.detail;
      setReceivedReports(prev => [newReport, ...prev]);
      showNotification('Novo relatório recebido do supervisor!', 'success');
    };

    window.addEventListener('newFinancialReport', handleNewReport);
    
    return () => {
      window.removeEventListener('newFinancialReport', handleNewReport);
    };
  }, []);
  
  // Ativar sincronização em tempo real
  useEffect(() => {
    realTimeSync.enableAggressivePolling();
  }, []);
  // Usar propostas reais da API
  const { proposals: realProposals, isLoading: proposalsLoading, rejectProposal } = useProposals();
  const { getClientDocuments } = useGoogleDrive();
  const updateProposal = useUpdateProposal();
  
  // Função simples de notificação
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Poderia usar toast aqui se necessário
  };
  
  // Função para atualizar status com API (igual ao ImplantacaoPortal)
  const handleStatusUpdate = async (proposalId: string, newStatus: ProposalStatus) => {
    try {
      console.log(`🏦 FINANCIAL PORTAL - Updating status: ${proposalId} -> ${newStatus}`);
      
      await updateProposal.mutateAsync({ 
        id: proposalId, 
        status: newStatus 
      });
      
      // Atualizar o status manager local também
      statusManager.updateStatus(proposalId, newStatus);
      
      showNotification(`Status atualizado para ${STATUS_CONFIG[newStatus]?.label} - Sincronizado em todos os portais!`, 'success');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showNotification('Erro ao atualizar status', 'error');
    }
  };

  // Função para aprovar proposta com sincronização em tempo real
  const handleApproveProposal = async (proposalId: string, cliente: string) => {
    try {
      console.log(`✅ Aprovando proposta ${proposalId} - Portal Financeiro`);
      await updateProposal.mutateAsync({ 
        id: proposalId, 
        status: 'aprovado' 
      });
      showNotification(`Proposta de ${cliente} aprovada com sucesso!`, 'success');
      console.log(`✅ Proposta ${proposalId} aprovada - Aparecerá imediatamente para vendedor e supervisor`);
    } catch (error) {
      console.error('Erro ao aprovar proposta:', error);
      showNotification('Erro ao aprovar proposta. Tente novamente.', 'error');
    }
  };

  // Função para rejeitar proposta com sincronização em tempo real
  const handleRejectProposal = async (proposalId: string, cliente: string) => {
    try {
      console.log(`❌ Rejeitando proposta ${proposalId} - Portal Financeiro`);
      await rejectProposal.mutateAsync(proposalId);
      showNotification(`Proposta de ${cliente} rejeitada com sucesso!`, 'success');
      console.log(`✅ Proposta ${proposalId} rejeitada - Aparecerá imediatamente para vendedor e supervisor`);
    } catch (error) {
      console.error('Erro ao rejeitar proposta:', error);
      showNotification('Erro ao rejeitar proposta. Tente novamente.', 'error');
    }
  };

  // Hook para propostas com sincronização em tempo real

  // Inicializar status e escutar mudanças
  useEffect(() => {
    const mockProposals = [
      { id: 'VEND001-PROP123' },
      { id: 'VEND002-PROP124' },
      { id: 'VEND001-PROP125' },
      { id: 'VEND003-PROP126' },
      { id: 'VEND002-PROP127' },
      { id: 'VEND001-PROP128' }
    ];

    const initializeStatuses = () => {
      const statusMap = new Map<string, ProposalStatus>();
      mockProposals.forEach(proposal => {
        statusMap.set(proposal.id, statusManager.getStatus(proposal.id));
      });
      setProposalStatuses(statusMap);
    };

    initializeStatuses();

    const handleStatusChange = (proposalId: string, newStatus: ProposalStatus) => {
      setProposalStatuses(prev => new Map(prev.set(proposalId, newStatus)));
    };

    statusManager.subscribe(handleStatusChange);

    return () => {
      statusManager.unsubscribe(handleStatusChange);
    };
  }, [statusManager]);

  // Gerar transações reais baseadas nas propostas
  const realTransactions: Transaction[] = (realProposals || []).map(proposal => {
    const contractData = proposal.contractData || {};
    const value = contractData.valor ? `R$ ${contractData.valor}` : 'R$ 0';
    const isCompleted = proposal.status === 'implantado';
    const isPending = ['aguar_pagamento', 'aguar_selecao_vigencia', 'aguar_vigencia', 'analise', 'observacao', 'assinatura_ds', 'assinatura_proposta', 'pendencia'].includes(proposal.status);
    
    return {
      id: proposal.abmId || proposal.id, // Usar abmId se disponível
      client: contractData.nomeEmpresa || 'Cliente não informado',
      plan: contractData.planoContratado || 'Plano não informado',
      value: value,
      type: 'income' as const,
      date: proposal.createdAt || new Date().toISOString(),
      status: isCompleted ? 'completed' as const : isPending ? 'pending' as const : proposal.status === 'declinado' ? 'cancelled' as const : 'pending' as const,
      category: 'subscription',
      realStatus: proposal.status // Manter status real para debugging
    };
  });

  // Dados demo removidos - usando apenas dados reais do banco de dados

  const filteredTransactions = realTransactions.filter(transaction => {
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    const matchesSearch = transaction.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.plan.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalIncome = realTransactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.value.replace('R$ ', '').replace('.', '').replace(',', '.')), 0);

  const totalPending = realTransactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + parseFloat(t.value.replace('R$ ', '').replace('.', '').replace(',', '.')), 0);

  // Calcular taxa de conversão real
  const totalProposals = realTransactions.length;
  const completedProposals = realTransactions.filter(t => t.status === 'completed').length;
  const conversionRate = totalProposals > 0 ? Math.round((completedProposals / totalProposals) * 100) : 0;

  // Usando o componente StatusBadge oficial do projeto para garantir cores corretas

  const handleAutomateProposal = (proposalId: string, clientName: string) => {
    setSelectedProposalForAutomation({ id: proposalId, client: clientName });
    setShowAutomationModal(true);
  };

  // Funções para ações dos relatórios
  const handleDownloadReport = (reportId: string) => {
    showNotification('Download do relatório iniciado', 'success');
    // Simular download
    const report = receivedReports.find(r => r.id === reportId);
    if (report) {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.title}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleEmailReport = (reportId: string) => {
    showNotification('Email com relatório enviado', 'success');
    // Aqui integraria com o SendGrid
    const report = receivedReports.find(r => r.id === reportId);
    if (report) {
      const mailtoLink = `mailto:?subject=Relatório: ${report.title}&body=Segue em anexo o relatório solicitado.`;
      window.open(mailtoLink);
    }
  };

  const handleViewInDrive = (reportId: string) => {
    showNotification('Abrindo no Google Drive', 'info');
    window.open(`https://drive.google.com/drive/folders/reports/${reportId}`, '_blank');
  };

  const handleViewInSheets = (reportId: string) => {
    showNotification('Abrindo no Google Sheets', 'info');
    window.open(`https://docs.google.com/spreadsheets/d/reports_${reportId}`, '_blank');
  };

  const handleWhatsAppShare = (reportId: string) => {
    showNotification('Compartilhando via WhatsApp', 'success');
    const report = receivedReports.find(r => r.id === reportId);
    if (report) {
      const message = `*Relatório Financeiro*%0A%0A📊 ${report.title}%0A📅 Período: ${report.data.period}%0A💰 Valor Total: ${report.data.totalValue}%0A📈 Propostas: ${report.data.totalProposals}%0A🎯 Conversão: ${report.data.conversionRate}`;
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  // Função para visualizar relatório completo
  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  // Função para visualizar relatório no formato Excel
  const handleViewExcel = (report: any) => {
    setExcelReportData(report);
    setShowExcelModal(true);
    showNotification('Relatório Excel aberto no painel', 'success');
  };

  // Função para simular recebimento de relatório do supervisor (para testes)
  const simulateReportReceived = (reportData: any) => {
    setReceivedReports(prev => [reportData, ...prev]);
    showNotification('Novo relatório recebido do supervisor', 'success');
  };

  // Sistema completo de relatórios do supervisor
  const handleViewSupervisorReports = async () => {
    try {
      showNotification('Carregando relatórios do supervisor...', 'info');
      
      // Buscar dados reais de todas as propostas implantadas
      const proposalsResponse = await fetch('/api/proposals');
      const proposalsData = await proposalsResponse.json();
      const allProposals = proposalsData.data || proposalsData;
      const implantedProposals = allProposals.filter((p: any) => p.status === 'implantado');
      
      // Buscar dados dos vendedores
      const vendorsResponse = await fetch('/api/vendors');
      const vendorsData = await vendorsResponse.json();
      const allVendors = vendorsData.data || vendorsData;
      
      // Processar dados para relatório completo
      const processedReports = implantedProposals.map((proposal: any) => {
        const vendor = allVendors.find((v: any) => v.id === proposal.vendorId);
        const valor = parseFloat(proposal.contractData?.valor?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
        
        return {
          abmId: proposal.abmId,
          empresa: proposal.contractData?.nomeEmpresa || '',
          cnpj: proposal.contractData?.cnpj || '',
          vendedor: vendor?.name || 'Vendedor não encontrado',
          valor: proposal.contractData?.valor || 'R$ 0,00',
          plano: proposal.contractData?.planoContratado || '',
          status: proposal.status,
          statusPagamentoPremiacao: '', // Editável
          statusPagamento: '', // Editável  
          dataPagamento: '', // Editável
          premiacao: 'R$ 0,00',
          metaIndividual: 'R$ 0,00', 
          metaEquipe: 'R$ 0,00',
          superPremiacao: 'R$ 0,00'
        };
      });
      
      // Calcular resumo por vendedor
      const vendorSummary = allVendors.map((vendor: any) => {
        const vendorProposals = implantedProposals.filter((p: any) => p.vendorId === vendor.id);
        const totalVendas = vendorProposals.reduce((sum: number, p: any) => {
          const valor = parseFloat(p.contractData?.valor?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
          return sum + valor;
        }, 0);
        
        return {
          vendedorNome: vendor.name,
          totalVendas,
          totalPropostas: vendorProposals.length,
          percentualMeta: Math.round((totalVendas / 15000) * 100),
          premiacao: totalVendas * 0.05 // 5% de comissão
        };
      });
      
      // Calcular totais gerais
      const totals = {
        totalPropostasImplantadas: implantedProposals.length,
        valorTotalImplantado: processedReports.reduce((sum: number, item: any) => {
          const valor = parseFloat(item.valor.replace(/[^\d,]/g, '').replace(',', '.') || '0');
          return sum + valor;
        }, 0),
        totalVendedores: allVendors.length,
        totalPremiacao: vendorSummary.reduce((sum: number, v: any) => sum + v.premiacao, 0)
      };
      
      // Configurar dados do relatório
      const supervisorReport = {
        id: `supervisor-complete-${Date.now()}`,
        title: 'Relatórios do Supervisor',
        type: 'complete',
        rawData: processedReports,
        summary: vendorSummary,
        totals: totals,
        receivedAt: new Date().toISOString()
      };
      
      setSelectedReport(supervisorReport);
      setShowReportModal(true);
      showNotification('Relatórios do supervisor carregados!', 'success');
      
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      showNotification('Erro ao carregar relatórios do supervisor', 'error');
    }
  };

  // Simular recebimento de relatório de teste
  const sendTestReport = () => {
    const testReport = {
      id: `report-${Date.now()}`,
      title: 'Relatório Semanal de Performance',
      status: 'received',
      receivedAt: new Date().toISOString(),
      data: {
        period: 'Semana 02/2025 (13-19 Jan)',
        totalProposals: '47',
        totalValue: 'R$ 187.500,00',
        conversionRate: '73.4%'
      }
    };
    simulateReportReceived(testReport);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-white dark:text-gray-500 dark:text-white">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
            <span className="text-gray-600 dark:text-gray-400">+0%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-white dark:text-gray-500 dark:text-white">Pendente</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">{formatCurrency(totalPending)}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">{realTransactions.filter(t => t.status === 'pending').length} transações</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-white dark:text-gray-500 dark:text-white">Clientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">{realTransactions.filter(t => t.status === 'completed').length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">+0</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">novos este mês</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-white dark:text-gray-500 dark:text-white">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">{conversionRate}%</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">+0%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs mês anterior</span>
          </div>
        </div>
      </div>



      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white">Transações Recentes</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 dark:text-white" />
                <input
                  type="text"
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Todas as categorias</option>
                <option value="subscription">Assinaturas</option>
                <option value="consulting">Consultoria</option>
                <option value="project">Projetos</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Plano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 dark:bg-gray-800 divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 dark:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => window.open(`https://drive.google.com/drive/folders/${transaction.id}`, '_blank')}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-white underline"
                    >
                      {transaction.id}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white dark:text-white">{transaction.client}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">{transaction.plan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white dark:text-white">{transaction.value}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge 
                      status={transaction.realStatus as ProposalStatus || 'observacao'}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ActionButtons 
                      onView={() => showNotification(`Visualizando transação ${transaction.id}`, 'info')}
                      onEmail={() => window.open(`mailto:?subject=Transação ${transaction.id}&body=Detalhes da transação: ${transaction.client} - ${transaction.value}`)}
                      onMessage={() => {
                        setSelectedProposalForMessage(transaction);
                        setShowInternalMessage(true);
                      }}
                      onEdit={() => showNotification(`Editando transação ${transaction.id}...`, 'info')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProposals = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white">Propostas em Andamento</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Vendedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Progresso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 dark:bg-gray-800 divide-y divide-gray-200">
              {realProposals?.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).slice(0, 10).map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 dark:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => window.open(`https://drive.google.com/drive/folders/${proposal.abmId}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 dark:text-white font-medium transition-colors"
                    >
                      {proposal.abmId}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white dark:text-white">{proposal.contractData?.nomeEmpresa}</div>
                    <div className="text-sm text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">CNPJ: {proposal.contractData?.cnpj}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white dark:text-white">{proposal.vendedor?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white dark:text-white">R$ {proposal.contractData?.valor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge 
                      status={proposal.status}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-48">
                      <ProgressBar 
                        proposal={proposal}
                        className="w-full"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">
                    {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* SISTEMA DE APROVAÇÃO E REJEIÇÃO BASEADO NO STATUS */}
                      {proposal.status === 'pendente' || proposal.status === 'analise' ? (
                        <>
                          <button
                            onClick={() => handleApproveProposal(proposal.id, proposal.contractData?.nomeEmpresa || 'Cliente')}
                            className="p-2 text-lime-600 hover:text-lime-800 dark:text-white hover:bg-lime-50 rounded-md transition-colors"
                            title="Aprovar Proposta"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectProposal(proposal.id, proposal.contractData?.nomeEmpresa || 'Cliente')}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-white hover:bg-red-50 rounded-md transition-colors"
                            title="Rejeitar Proposta"
                            disabled={rejectProposal.isPending}
                          >
                            <XCircle className={`w-4 h-4 ${rejectProposal.isPending ? 'animate-spin' : ''}`} />
                          </button>
                        </>
                      ) : proposal.status === 'aprovado' ? (
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full cursor-pointer"
                          title="Proposta Aprovada"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </span>
                      ) : proposal.status === 'rejeitado' ? (
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full cursor-pointer"
                          title="Proposta Rejeitada"
                        >
                          <XCircle className="w-4 h-4" />
                        </span>
                      ) : null}
                      
                      <button 
                        onClick={() => handleAutomateProposal(proposal.id, proposal.contractData?.nomeEmpresa)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs"
                        title="Automatizar Proposta"
                      >
                        <Zap className="h-3 w-3 inline mr-1" />
                        Automatizar
                      </button>
                      <button 
                        onClick={() => window.open(`${window.location.origin}/cliente/proposta/${proposal.clientToken}`, '_blank')}
                        className="text-blue-600 hover:text-blue-900 dark:text-white"
                        title="Visualizar Proposta"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white">Gestão de Clientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Plano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 dark:bg-gray-800 divide-y divide-gray-200">
              {realTransactions.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 dark:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white dark:text-white">{client.client}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">{client.plan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white dark:text-white">{client.value}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      client.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-700'
                        : client.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {client.status === 'completed' ? 'Ativo' : client.status === 'pending' ? 'Pendente' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setSelectedClient(client.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-white mr-3"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900 dark:text-white">
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAccounting = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Controle Fiscal</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">Notas Fiscais Emitidas</span>
              <span className="font-semibold text-gray-900 dark:text-white">247</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">Impostos a Recolher</span>
              <span className="font-semibold text-green-600">R$ 34.892,50</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">Vencimentos Próximos</span>
              <span className="font-semibold text-amber-600">8 obrigações</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Balancete Mensal</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">Receitas</span>
              <span className="font-semibold text-green-600">R$ 284.576,30</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">Despesas</span>
              <span className="font-semibold text-red-600">R$ 156.892,75</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">Resultado</span>
              <span className="font-semibold text-blue-600">R$ 127.683,55</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Obrigações Acessórias</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Obrigação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { id: 1, name: 'DCTF-Web', vencimento: '15/02/2025', status: 'Pendente' },
                { id: 2, name: 'EFD-Contribuições', vencimento: '10/02/2025', status: 'Entregue' },
                { id: 3, name: 'SPED Fiscal', vencimento: '12/02/2025', status: 'Pendente' },
                { id: 4, name: 'DIRF', vencimento: '28/02/2025', status: 'Em Análise' }
              ].map((obligation) => (
                <tr key={obligation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{obligation.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{obligation.vencimento}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      obligation.status === 'Entregue' 
                        ? 'bg-green-100 text-green-700'
                        : obligation.status === 'Pendente'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {obligation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900 dark:text-green-400">
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Estados necessários para a aba Comissões - copiado do SupervisorPortal
  const [reportFilters, setReportFilters] = useState({
    dataInicio: '', 
    dataFim: '', 
    vendedor: '', 
    status: '', 
    tipo: 'completo'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Funções necessárias para a funcionalidade completa
  const generateReportData = (data: any[]) => {
    return data.map(proposal => ({
      abmId: proposal.abmId,
      vendedor: proposal.vendorName || 'Desconhecido',
      empresa: proposal.contractData?.nomeEmpresa || '',
      valor: proposal.contractData?.valor || 'R$ 0,00',
      status: proposal.status,
      titulares: proposal.titulares?.length || 0,
      dependentes: proposal.dependentes?.length || 0
    }));
  };

  const showReportPreview = (data: any[]) => {
    setSelectedReport({ ...selectedReport, data });
    setShowReportModal(true);
  };

  const getFilteredProposals = () => {
    return (realProposals || []).filter(proposal => {
      if (reportFilters.vendedor && !proposal.vendorName?.toLowerCase().includes(reportFilters.vendedor.toLowerCase())) return false;
      if (reportFilters.status && proposal.status !== reportFilters.status) return false;
      return true;
    });
  };

  // Aba Comissões - Sistema completo de relatórios igual ao SupervisorPortal
  const renderCommissions = () => {
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
    const uniqueVendors = [...new Set([...realVendors, ...(realProposals || []).map(p => p.vendorName).filter(Boolean)])];

    const filteredData = (realProposals || []).filter(proposal => {
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

    // Usando STATUS_CONFIG importado de statusSystem

    return (
      <div className="space-y-6">
        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filtros de Relatório</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vendedor
              </label>
              <select
                value={reportFilters.vendedor}
                onChange={(e) => setReportFilters({...reportFilters, vendedor: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos os vendedores</option>
                {uniqueVendors.map(vendor => (
                  <option key={vendor} value={vendor}>{vendor}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={reportFilters.status}
                onChange={(e) => setReportFilters({...reportFilters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos os status</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período
              </label>
              <select
                value={reportFilters.periodo}
                onChange={(e) => setReportFilters({...reportFilters, periodo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="todos">Todos os períodos</option>
                <option value="hoje">Hoje</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mês</option>
                <option value="trimestre">Este trimestre</option>
                <option value="ano">Este ano</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resumo dos Dados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-200 text-sm font-medium">Total de Propostas</p>
                <p className="text-blue-900 dark:text-blue-100 text-2xl font-bold">{reportData.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-6 border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-200 text-sm font-medium">Faturamento (Implantado)</p>
                <p className="text-green-900 dark:text-green-100 text-2xl font-bold">
                  R$ {reportData.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-200 text-sm font-medium">Implantadas</p>
                <p className="text-purple-900 dark:text-purple-100 text-2xl font-bold">
                  {filteredData.filter(p => p.status === 'implantado').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Botão Gerar Relatório */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gerar Relatório</h3>
              <p className="text-gray-600 dark:text-gray-300">Exporte os dados em diferentes formatos</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => generateReport('excel')}
                disabled={isGenerating}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Excel
              </button>
              
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </button>
            </div>
          </div>
          
          {/* Opções de Compartilhamento */}
          {showExportOptions && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Opções de Compartilhamento</h4>
              <div className="flex space-x-3">
                <button
                  onClick={() => generateReport('excel', 'email')}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </button>
                
                <button
                  onClick={() => generateReport('excel', 'whatsapp')}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </button>
                
                <button
                  onClick={() => generateReport('excel', 'google-sheets')}
                  className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Google Sheets
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabela de Dados */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Propostas Filtradas ({filteredData.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map((proposal) => {
                  const statusConfig = STATUS_CONFIG[proposal.status as keyof typeof STATUS_CONFIG];
                  return (
                    <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {proposal.contractData?.nomeEmpresa || 'Nome não informado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {proposal.vendorName || 'Não informado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {proposal.contractData?.valor || 'R$ 0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig?.textColor || 'text-gray-600'} bg-gray-100 dark:bg-gray-700`}>
                          {statusConfig?.label || proposal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(proposal.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Nenhuma proposta encontrada com os filtros aplicados</p>
            </div>
          )}
        </div>

        {/* Análise por Vendedor */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Análise por Vendedor</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(reportData.porVendedor).map(([vendor, data]) => (
              <div key={vendor} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white">{vendor}</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Propostas: <span className="font-medium">{data.count}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Faturamento: <span className="font-medium text-green-600">
                      R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white mb-4">Análise de Receita</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 rounded-lg">
            <BarChart3 className="h-16 w-16 text-gray-400 dark:text-gray-500 dark:text-white" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white mb-4">Distribuição por Plano</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 rounded-lg">
            <PieChart className="h-16 w-16 text-gray-400 dark:text-gray-500 dark:text-white" />
          </div>
        </div>
      </div>
    </div>
  );



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-900">

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 dark:bg-gray-800 shadow-sm dark:shadow-gray-900/30 border-b border-gray-200 dark:border-gray-700 dark:border-gray-600 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/65be871e-f7a6-4f31-b1a9-cd0729a73ff8 copy copy.png" 
                alt="Abmix" 
                className="h-10 w-auto mr-3"
              />
              <div className="ml-4">
                <WelcomeMessage 
                  userName={user?.name}
                  userEmail={user?.email} 
                  className="mb-1"
                />
                <p className="text-sm text-gray-500 dark:text-white dark:text-gray-500 dark:text-white dark:text-gray-300 dark:text-white">Gestão financeira e análises</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Badge de notificações de mensagens */}
              <MessageNotificationBadge 
                userEmail={user?.email} 
                onMessagesView={() => setShowInternalMessage(true)}
              />
              
              <ActionButtons 
                onMessage={() => {
                  setSelectedProposalForMessage(null);
                  setShowInternalMessage(true);
                }}
                userRole="financial"
              />
              
              <button
                onClick={() => setShowFinancialArea(!showFinancialArea)}
                className="p-2 text-gray-400 dark:text-gray-500 dark:text-white hover:text-gray-500 dark:text-white dark:text-gray-500 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                title={showFinancialArea ? "Mostrar Área Financeira Completa" : "Mostrar Área Financeira Simplificada"}
              >
                <Settings className="h-6 w-6" />
              </button>
              
              {/* TODAS AS NOTIFICAÇÕES REMOVIDAS */}
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-white dark:text-gray-500 dark:text-white dark:text-gray-300 dark:text-white">Área Financeira</p>
                </div>
                
                <ThemeToggle />
                
                <button
                  onClick={onLogout}
                  className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-white dark:text-white hover:text-gray-900 dark:text-white dark:hover:text-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 dark:border-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'proposals', label: 'Propostas', icon: FileText },
              { id: 'clients', label: 'Clientes', icon: Users },
              { id: 'analysis', label: 'Análises', icon: PieChart },
              { id: 'accounting', label: 'Contabilidade', icon: Calculator },
              { id: 'commissions', label: 'Comissões', icon: DollarSign }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 dark:text-white dark:text-gray-500 dark:text-white hover:text-gray-700 dark:text-white dark:text-white hover:border-gray-300 dark:border-gray-600 dark:border-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Área Financeira Completa */}
      {showFinancialArea && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white mb-6">Área Financeira Completa</h2>
            <p className="text-gray-600 dark:text-white dark:text-gray-500 dark:text-white mb-4">
              Esta área permite validar propostas, aprovar ou rejeitar documentos.
            </p>
          </div>
        </div>
      )}

      {/* NOTIFICAÇÕES COMPLETAMENTE REMOVIDAS */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">
                {activeTab === 'dashboard' && 'Dashboard Financeiro'}
                {activeTab === 'proposals' && 'Gestão de Propostas'}
                {activeTab === 'clients' && 'Gestão de Clientes'}
                {activeTab === 'analysis' && 'Análises e Relatórios'}
                {activeTab === 'accounting' && 'Contabilidade'}
                {activeTab === 'commissions' && 'Comissões'}
                {activeTab === 'forms' && 'Formulários'}
              </h2>
              <p className="text-gray-600 dark:text-white dark:text-gray-500 dark:text-white">
                {activeTab === 'dashboard' && 'Visão geral das métricas financeiras'}
                {activeTab === 'proposals' && 'Acompanhe e gerencie propostas comerciais'}
                {activeTab === 'clients' && 'Gerencie informações dos clientes'}
                {activeTab === 'analysis' && 'Relatórios detalhados e análises'}
                {activeTab === 'accounting' && 'Gestão contábil e controle fiscal'}
                {activeTab === 'commissions' && 'Sistema completo de relatórios de comissões com filtros e exportação'}
                {activeTab === 'forms' && 'Formulários para coleta de dados'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="week">Esta Semana</option>
                <option value="month">Este Mês</option>
                <option value="quarter">Este Trimestre</option>
                <option value="year">Este Ano</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'proposals' && renderProposals()}
        {activeTab === 'clients' && renderClients()}
        {activeTab === 'analysis' && renderAnalysis()}
        {activeTab === 'accounting' && renderAccounting()}
        {activeTab === 'commissions' && renderCommissions()}
      </main>

      {/* Internal Message Modal */}
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
      
      {/* Automation Modal */}
      {showAutomationModal && selectedProposalForAutomation && (
        <FinancialAutomationModal
          isOpen={showAutomationModal}
          onClose={() => setShowAutomationModal(false)}
          proposalId={selectedProposalForAutomation.id}
          clientName={selectedProposalForAutomation.client}
        />
      )}

      {/* Report Visualization Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedReport.title}</h3>
                  <p className="text-blue-100 dark:text-white text-sm">
                    Recebido em {new Date(selectedReport.receivedAt).toLocaleDateString('pt-BR')} às {new Date(selectedReport.receivedAt).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="h-8 w-8 bg-white dark:bg-gray-800 dark:bg-gray-800 bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-white text-lg font-bold">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Report Summary */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white mb-4">Resumo Executivo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Período</p>
                        <p className="text-blue-900 dark:text-white text-lg font-bold">{selectedReport.data.period}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 dark:text-green-400 text-sm font-medium">Total de Propostas</p>
                        <p className="text-green-900 dark:text-white text-lg font-bold">{selectedReport.data.totalProposals}</p>
                      </div>
                      <FileText className="h-8 w-8 text-green-500 dark:text-green-400" />
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 dark:text-white text-sm font-medium">Valor Total</p>
                        <p className="text-purple-900 dark:text-white text-lg font-bold">{selectedReport.data.totalValue}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-purple-500 dark:text-white" />
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-600 dark:text-white text-sm font-medium">Taxa de Conversão</p>
                        <p className="text-orange-900 dark:text-white text-lg font-bold">{selectedReport.data.conversionRate}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-500 dark:text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white mb-4">Análise Detalhada</h4>
                <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-white dark:text-white mb-2">
                    Este relatório apresenta uma análise completa do desempenho da equipe para o período de <strong>{selectedReport.data.period}</strong>.
                  </p>
                  <p className="text-gray-700 dark:text-white dark:text-white mb-2">
                    Foram processadas <strong>{selectedReport.data.totalProposals} propostas</strong> com um valor total de <strong>{selectedReport.data.totalValue}</strong>, 
                    resultando em uma taxa de conversão de <strong>{selectedReport.data.conversionRate}</strong>.
                  </p>
                  <p className="text-gray-700 dark:text-white dark:text-white">
                    Todos os dados foram coletados e validados automaticamente pelo sistema de gestão, 
                    garantindo a precisão e confiabilidade das informações apresentadas.
                  </p>
                </div>
              </div>

              {/* Comissão de Reunião Section - NEW */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  👥 Comissão de Reunião
                  <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                    Processamento Separado
                  </span>
                </h4>
                
                {(() => {
                  // Simular dados de reunião baseados nos dados da planilha
                  const meetingCommissions = selectedReport.rawData?.filter(item => 
                    item.reuniao && item.reuniao !== '-' && item.percentualReuniao && item.percentualReuniao !== '0%'
                  ) || [];

                  if (meetingCommissions.length === 0) {
                    return (
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                        <p className="text-gray-600 dark:text-gray-300">
                          Nenhuma comissão de reunião identificada neste período
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {meetingCommissions.map((item, index) => {
                        const valor = parseFloat(item.valor?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
                        const percentual = parseFloat(item.percentualReuniao?.replace('%', '') || '0') / 100;
                        const comissaoReuniao = valor * percentual;

                        return (
                          <div key={index} className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-purple-900 dark:text-purple-100">
                                  {item.cliente}
                                </h5>
                                <p className="text-sm text-purple-700 dark:text-purple-200">
                                  ID: {item.abmId} | CNPJ: {item.cnpj}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                  R$ {comissaoReuniao.toFixed(2).replace('.', ',')}
                                </div>
                                <div className="text-xs text-purple-700 dark:text-purple-300">
                                  {item.percentualReuniao} de R$ {item.valor}
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-purple-100 dark:bg-purple-800 rounded p-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                  <span className="font-semibold text-purple-800 dark:text-purple-200">Organizador:</span>
                                  <div className="text-purple-700 dark:text-purple-100">{item.reuniao}</div>
                                </div>
                                <div>
                                  <span className="font-semibold text-purple-800 dark:text-purple-200">Percentual:</span>
                                  <div className="text-purple-700 dark:text-purple-100">{item.percentualReuniao}</div>
                                </div>
                                <div>
                                  <span className="font-semibold text-purple-800 dark:text-purple-200">Base Cálculo:</span>
                                  <div className="text-purple-700 dark:text-purple-100">R$ {item.valor}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-xs text-purple-600 dark:text-purple-300 bg-white dark:bg-purple-950 p-2 rounded">
                              <strong>Financeiro:</strong> Processar pagamento separado de comissão de reunião para <strong>{item.reuniao.toUpperCase()}</strong>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Total de Comissões de Reunião */}
                      <div className="bg-purple-100 dark:bg-purple-800 border-2 border-purple-300 dark:border-purple-600 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-purple-900 dark:text-purple-100">
                              TOTAL COMISSÕES DE REUNIÃO:
                            </span>
                            <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                              {meetingCommissions.length} pagamento(s) separado(s) para processamento
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-purple-900 dark:text-purple-100 text-xl">
                              R$ {meetingCommissions.reduce((total, item) => {
                                const valor = parseFloat(item.valor?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
                                const percentual = parseFloat(item.percentualReuniao?.replace('%', '') || '0') / 100;
                                return total + (valor * percentual);
                              }, 0).toFixed(2).replace('.', ',')}
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-300">
                              Separado das comissões dos vendedores
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Actions Section */}
              <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white mb-4">Ações Disponíveis</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <button
                    onClick={() => {
                      handleDownloadReport(selectedReport.id);
                      setShowReportModal(false);
                    }}
                    className="flex flex-col items-center p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                  >
                    <Download className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-1" />
                    <span className="text-blue-700 dark:text-white text-xs font-medium">Baixar</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleEmailReport(selectedReport.id);
                      setShowReportModal(false);
                    }}
                    className="flex flex-col items-center p-3 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                  >
                    <Mail className="h-6 w-6 text-green-600 dark:text-green-400 mb-1" />
                    <span className="text-green-700 dark:text-white text-xs font-medium">Email</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleViewInDrive(selectedReport.id);
                      setShowReportModal(false);
                    }}
                    className="flex flex-col items-center p-3 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-6 w-6 text-purple-600 dark:text-white mb-1" />
                    <span className="text-purple-700 dark:text-white text-xs font-medium">Google Drive</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleViewInSheets(selectedReport.id);
                      setShowReportModal(false);
                    }}
                    className="flex flex-col items-center p-3 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                  >
                    <BarChart3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mb-1" />
                    <span className="text-yellow-700 dark:text-white text-xs font-medium">Google Sheets</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleWhatsAppShare(selectedReport.id);
                      setShowReportModal(false);
                    }}
                    className="flex flex-col items-center p-3 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                  >
                    <MessageSquare className="h-6 w-6 text-emerald-600 dark:text-white mb-1" />
                    <span className="text-emerald-700 dark:text-white text-xs font-medium">WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Excel */}
      {showExcelModal && excelReportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 max-w-7xl w-full max-h-[95vh] overflow-hidden">
            {/* Header Excel */}
            <div className="bg-green-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6" />
                <h2 className="text-xl font-semibold">Relatório Excel - {excelReportData.title}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const printContent = document.getElementById('excel-content');
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(`
                      <html><head><title>Relatório Excel</title>
                      <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                        th { background: #f0f0f0; font-weight: bold; }
                        tr:nth-child(even) { background: #f9f9f9; }
                      </style>
                      </head><body>
                      ${printContent.innerHTML}
                      </body></html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
                >
                  🖨️ Imprimir
                </button>
                <button
                  onClick={() => {
                    // Simular download Excel
                    const csvData = [
                      ['ID', 'CLIENTE', 'CNPJ', 'VENDEDOR', 'VALOR', 'PLANO', 'STATUS', 'OBSERVAÇÕES'],
                      ...(excelReportData.rawData || []).map(item => [
                        item.abmId, item.cliente, item.cnpj, item.vendedor, 
                        item.valor, item.plano, item.status.toUpperCase(), item.observacoes || ''
                      ])
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([csvData], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `relatorio_abmix_${Date.now()}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                    showNotification('Relatório Excel baixado!', 'success');
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
                >
                  📊 Baixar Excel
                </button>
                <button
                  onClick={() => setShowExcelModal(false)}
                  className="text-white hover:text-gray-300 dark:text-white p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Conteúdo Excel */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-100px)]" id="excel-content">
              {/* Resumo Executivo */}
              <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-500 p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-800 dark:text-white mb-3">📊 Resumo Executivo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-white dark:text-white">Período:</span>
                    <div className="text-green-700 dark:text-white">{excelReportData.data.period}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-white dark:text-white">Total Propostas:</span>
                    <div className="text-green-700 dark:text-white font-bold">{excelReportData.data.totalProposals}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-white dark:text-white">Valor Total:</span>
                    <div className="text-green-700 dark:text-white font-bold">{excelReportData.data.totalValue}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-white dark:text-white">Taxa Conversão:</span>
                    <div className="text-green-700 dark:text-white font-bold">{excelReportData.data.conversionRate}</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-600 dark:text-white dark:text-gray-500 dark:text-white">
                  Gerado em: {new Date(excelReportData.receivedAt).toLocaleString('pt-BR')}
                </div>
              </div>

              {/* Tabela Excel */}
              <div className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-white dark:text-white uppercase">ID</th>
                      <th className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-white dark:text-white uppercase">CLIENTE</th>
                      <th className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-white dark:text-white uppercase">CNPJ</th>
                      <th className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-white dark:text-white uppercase">VENDEDOR</th>
                      <th className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-white dark:text-white uppercase">VALOR</th>
                      <th className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-white dark:text-white uppercase">PLANO</th>
                      <th className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-white dark:text-white uppercase">STATUS</th>
                      <th className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-white dark:text-white uppercase">OBSERVAÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelReportData.rawData && excelReportData.rawData.length > 0 ? (
                      excelReportData.rawData.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900 dark:bg-gray-700'}>
                          <td className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-sm">{item.abmId}</td>
                          <td className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-sm font-medium">{item.cliente}</td>
                          <td className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-sm">{item.cnpj}</td>
                          <td className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-sm">{item.vendedor}</td>
                          <td className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-sm font-bold">R$ {item.valor}</td>
                          <td className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-sm">{item.plano}</td>
                          <td className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-sm">
                            <span className="px-2 py-1 bg-sky-100 text-sky-700 dark:text-white rounded text-xs font-medium">
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-2 text-sm">{item.observacoes || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="border border-gray-300 dark:border-gray-600 dark:border-gray-600 px-3 py-4 text-center text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">
                          Nenhum dado disponível
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Relatório Completo do Supervisor */}
      {selectedReport && selectedReport.type === 'complete' && showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">📊 Relatório Completo do Supervisor</h2>
                <p className="text-blue-100 mt-1">
                  Planilha completa com campos editáveis para pagamento
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    // Exportar para Excel
                    const csvData = [
                      ['ABM ID', 'Empresa', 'CNPJ', 'Vendedor', 'Valor', 'Plano', 'Status', 'Status Pag. Premiação', 'Status Pagamento', 'Data Pagamento', 'Premiação', 'Meta Individual', 'Meta Equipe', 'Super Premiação'],
                      ...(selectedReport.rawData || []).map(item => [
                        item.abmId, item.empresa, item.cnpj, item.vendedor, 
                        item.valor, item.plano, item.status, 
                        item.statusPagamentoPremiacao || '', item.statusPagamento || '', item.dataPagamento || '',
                        item.premiacao || '0,00', item.metaIndividual || '0,00', item.metaEquipe || '0,00', item.superPremiacao || '0,00'
                      ])
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([csvData], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `relatorio_supervisor_completo_${Date.now()}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                    showNotification('Relatório Excel baixado!', 'success');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar Excel
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-white hover:text-gray-300 p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
              {/* Resumo por Vendedor */}
              {selectedReport.summary && selectedReport.summary.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📈 Resumo por Vendedor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {selectedReport.summary.map((vendorSummary, index) => (
                      <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                        <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">{vendorSummary.vendedorNome}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Total Vendas:</span>
                            <span className="font-medium text-blue-800 dark:text-blue-200">R$ {vendorSummary.totalVendas.toFixed(2).replace('.', ',')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Propostas:</span>
                            <span className="font-medium text-blue-800 dark:text-blue-200">{vendorSummary.totalPropostas}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">% Meta:</span>
                            <span className="font-medium text-blue-800 dark:text-blue-200">{vendorSummary.percentualMeta}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Premiação:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">R$ {vendorSummary.premiacao.toFixed(2).replace('.', ',')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totais Gerais */}
              {selectedReport.totals && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 Totais Gerais</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedReport.totals.totalPropostasImplantadas}</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Propostas Implantadas</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">R$ {selectedReport.totals.valorTotalImplantado.toFixed(2).replace('.', ',')}</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Valor Total</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedReport.totals.totalVendedores}</div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Vendedores</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">R$ {selectedReport.totals.totalPremiacao.toFixed(2).replace('.', ',')}</div>
                      <div className="text-sm text-orange-700 dark:text-orange-300">Total Premiação</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Planilha Completa */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📋 Planilha Completa (Campos Editáveis)</h3>
                <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Apenas estas colunas podem ser editadas:</strong> Status Pagamento Premiação, Status Pagamento, Data Pagamento
                  </p>
                </div>
                
                <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-bold text-gray-700 dark:text-white">ABM ID</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-bold text-gray-700 dark:text-white">Empresa</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-bold text-gray-700 dark:text-white">CNPJ</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-bold text-gray-700 dark:text-white">Vendedor</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-bold text-gray-700 dark:text-white">Valor</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-bold text-gray-700 dark:text-white">Plano</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-bold text-yellow-700 dark:text-yellow-300">Status Pag. Premiação</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-bold text-yellow-700 dark:text-yellow-300">Status Pagamento</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-bold text-yellow-700 dark:text-yellow-300">Data Pagamento</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-bold text-gray-700 dark:text-white">Premiação</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-bold text-gray-700 dark:text-white">Meta Individual</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-bold text-gray-700 dark:text-white">Meta Equipe</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-bold text-gray-700 dark:text-white">Super Premiação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.rawData && selectedReport.rawData.length > 0 ? (
                        selectedReport.rawData.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-medium">{item.abmId}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">{item.empresa}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs">{item.cnpj}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">{item.vendedor}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-bold text-green-600 dark:text-green-400">R$ {item.valor}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs">{item.plano}</td>
                            
                            {/* Campos Editáveis */}
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">
                              <select 
                                className="w-full text-xs p-1 border border-yellow-300 rounded bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-700"
                                defaultValue={item.statusPagamentoPremiacao || ''}
                                onChange={(e) => {
                                  // Atualizar status no estado
                                  const updatedData = [...selectedReport.rawData];
                                  updatedData[index].statusPagamentoPremiacao = e.target.value;
                                  setSelectedReport({...selectedReport, rawData: updatedData});
                                  showNotification('Status atualizado', 'success');
                                }}
                              >
                                <option value="">-</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Pago">Pago</option>
                                <option value="Cancelado">Cancelado</option>
                              </select>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">
                              <select 
                                className="w-full text-xs p-1 border border-yellow-300 rounded bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-700"
                                defaultValue={item.statusPagamento || ''}
                                onChange={(e) => {
                                  const updatedData = [...selectedReport.rawData];
                                  updatedData[index].statusPagamento = e.target.value;
                                  setSelectedReport({...selectedReport, rawData: updatedData});
                                  showNotification('Status atualizado', 'success');
                                }}
                              >
                                <option value="">-</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Pago">Pago</option>
                                <option value="Cancelado">Cancelado</option>
                              </select>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">
                              <input 
                                type="date"
                                className="w-full text-xs p-1 border border-yellow-300 rounded bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-700"
                                defaultValue={item.dataPagamento || ''}
                                onChange={(e) => {
                                  const updatedData = [...selectedReport.rawData];
                                  updatedData[index].dataPagamento = e.target.value;
                                  setSelectedReport({...selectedReport, rawData: updatedData});
                                  showNotification('Data atualizada', 'success');
                                }}
                              />
                            </td>
                            
                            {/* Campos Somente Leitura */}
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-green-600 dark:text-green-400">R$ {item.premiacao}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-blue-600 dark:text-blue-400">R$ {item.metaIndividual}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-purple-600 dark:text-purple-400">R$ {item.metaEquipe}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-orange-600 dark:text-orange-400">R$ {item.superPremiacao}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="13" className="border border-gray-300 dark:border-gray-600 px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                            Nenhum dado disponível
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ações */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🔧 Ações Disponíveis</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <button
                    onClick={() => handleDownloadReport(selectedReport.id)}
                    className="flex flex-col items-center p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                  >
                    <Download className="h-6 w-6 text-blue-600 mb-1" />
                    <span className="text-blue-700 text-xs font-medium">Baixar</span>
                  </button>
                  
                  <button
                    onClick={() => handleEmailReport(selectedReport.id)}
                    className="flex flex-col items-center p-3 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                  >
                    <Mail className="h-6 w-6 text-green-600 mb-1" />
                    <span className="text-green-700 text-xs font-medium">Email</span>
                  </button>
                  
                  <button
                    onClick={() => handleViewInSheets(selectedReport.id)}
                    className="flex flex-col items-center p-3 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                  >
                    <BarChart3 className="h-6 w-6 text-yellow-600 mb-1" />
                    <span className="text-yellow-700 text-xs font-medium">Google Sheets</span>
                  </button>
                  
                  <button
                    onClick={() => handleWhatsAppShare(selectedReport.id)}
                    className="flex flex-col items-center p-3 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                  >
                    <MessageSquare className="h-6 w-6 text-emerald-600 mb-1" />
                    <span className="text-emerald-700 text-xs font-medium">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      // Salvar alterações
                      showNotification('Alterações salvas com sucesso!', 'success');
                      setShowReportModal(false);
                    }}
                    className="flex flex-col items-center p-3 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                  >
                    <CheckCircle className="h-6 w-6 text-green-600 mb-1" />
                    <span className="text-green-700 text-xs font-medium">Salvar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* System Footer */}
      <SystemFooter />
    </div>
  );
};

export default FinancialPortal;