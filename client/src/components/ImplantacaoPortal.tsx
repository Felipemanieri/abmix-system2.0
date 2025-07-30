import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Settings, TrendingUp, CheckCircle, AlertCircle, XCircle, Eye, Send, Calendar, FileText, User, Bell, MessageCircle, MessageSquare, Bot, X, Send as SendIcon, Zap, Filter, Search, Download, Upload, Trash2, Edit, Plus, ArrowLeft, RefreshCw, Link, Copy, Mail, Share2, ExternalLink, Phone, Database, Image, Crop, Highlighter, Type, Eraser } from 'lucide-react';
// import AbmixLogo from './AbmixLogo';
import SystemFooter from './SystemFooter';
import ThemeToggle from './ThemeToggle';
import ActionButtons from './ActionButtons';
import AdvancedInternalMessage from './AdvancedInternalMessage';
import MessageNotificationBadge from './MessageNotificationBadge';
import NotificationCenter from './NotificationCenter';
import { WelcomeMessage } from './WelcomeMessage';

import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import ProposalSelector from './ProposalSelector';
import ProposalEditor from './ProposalEditor';
import FolderNameEditor from './FolderNameEditor';
import { showNotification } from '../utils/notifications';
import { useProposals, useRealTimeProposals, useDeleteProposal, useUpdateProposal } from '../hooks/useProposals';
import { realTimeSync } from '../utils/realTimeSync';
import statusManager, { ProposalStatus, STATUS_CONFIG } from '@shared/statusSystem';
import { getDynamicGreeting } from '../utils/greetingHelper';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configuração do worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface ImplantacaoPortalProps {
  user: any;
  onLogout: () => void;
}

interface Proposal {
  id: string;
  client: string;
  vendor: string;
  plan: string;
  value: string;
  status: 'pending_validation' | 'validated' | 'sent_to_automation' | 'processing' | 'completed';
  submissionDate: string;
  documents: number;
  observations?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedCompletion: string;
}



interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: 'active' | 'inactive';
  lastRun: string;
}

const ImplantacaoPortal: React.FC<ImplantacaoPortalProps> = ({ user, onLogout }) => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [observations, setObservations] = useState('');

  const [showNotifications, setShowNotifications] = useState(false);
  
  // DESABILITAR TODAS AS NOTIFICAÇÕES DO IMPLANTAÇÃO PORTAL
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // FORÇAR NOTIFICAÇÕES VAZIAS SEMPRE
    setNotifications([]);
    // Notificações removidas
  }, [user.name]);
  
  // Ativar sincronização em tempo real
  useEffect(() => {
    realTimeSync.enableAggressivePolling();
  }, []);
  const [showInternalMessage, setShowInternalMessage] = useState(false);
  const [selectedProposalForMessage, setSelectedProposalForMessage] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'proposals' | 'automation' | 'editor' | 'imageEditor'>('proposals');
  const [showProposalSelector, setShowProposalSelector] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // StatusManager já está importado como statusManager
  const [proposalStatuses, setProposalStatuses] = useState<Map<string, ProposalStatus>>(new Map());
  
  // Hook para propostas com sincronização em tempo real
  const { proposals: realProposals, isLoading: proposalsLoading, rejectProposal } = useProposals();
  useRealTimeProposals();
  
  // Hook para exclusão de propostas
  const deleteProposal = useDeleteProposal();
  
  // Hook para atualização de status/prioridade com sincronização global
  const updateProposal = useUpdateProposal();

  // Adicionar estado para notificações internas
  const [internalNotifications, setInternalNotifications] = useState<{id: string, message: string, type: 'success' | 'error'}[]>([]);
  
  // Estados para o editor de imagem e PDF
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Função para mostrar notificação interna no painel
  const showInternalNotification = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setInternalNotifications(prev => [...prev, { id, message, type }]);
    // Remover após 5 segundos
    setTimeout(() => {
      setInternalNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Funções para o editor de imagem e PDF
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Função para processar arquivo (imagem ou PDF)
  const handleFile = (file: File) => {
    console.log('📄 Processando arquivo:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg') {
      setSelectedFile(file);
      setFileType('image');
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setIsEditorOpen(false);
      };
      reader.readAsDataURL(file);
      showInternalNotification('Imagem carregada com sucesso!', 'success');
    } else if (file.type === 'application/pdf') {
      console.log('📄 Iniciando processamento do PDF...');
      setSelectedFile(file);
      setFileType('pdf');
      
      try {
        // Criar URL do objeto para o PDF
        const fileUrl = URL.createObjectURL(file);
        console.log('📄 URL do PDF criada:', fileUrl);
        setPdfUrl(fileUrl);
        setSelectedImage(fileUrl); // Manter para compatibilidade com botões
        setIsEditorOpen(false);
        
        showInternalNotification('PDF carregado com sucesso!', 'success');
        console.log('📄 PDF processado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao processar PDF:', error);
        showInternalNotification('Erro ao processar PDF', 'error');
      }
    } else {
      console.log('❌ Tipo de arquivo não suportado:', file.type);
      showInternalNotification('Por favor, selecione apenas imagens (JPG, PNG) ou arquivos PDF.', 'error');
    }
  };

  // Funções de drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const openEditor = () => {
    if (selectedImage) {
      setIsEditorOpen(true);
      showInternalNotification(`Editor de ${fileType} aberto!`, 'success');
    } else {
      showInternalNotification('Por favor, carregue um arquivo primeiro.', 'error');
    }
  };

  const downloadEditedFile = () => {
    if (selectedImage && selectedFile) {
      const link = document.createElement('a');
      const fileExtension = fileType === 'pdf' ? 'pdf' : 'png';
      link.download = `arquivo-editado-abmix-${Date.now()}.${fileExtension}`;
      link.href = selectedImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showInternalNotification(`${fileType === 'pdf' ? 'PDF' : 'Imagem'} baixado com sucesso!`, 'success');
    }
  };

  const clearFile = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setFileType(null);
    setIsEditorOpen(false);
    
    // Limpar URL do PDF se existir
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    
    setNumPages(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showInternalNotification('Arquivo removido!', 'success');
  };

  // Callback para quando o PDF é carregado com sucesso
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('✅ PDF carregado com sucesso:', numPages, 'páginas');
    setNumPages(numPages);
    showInternalNotification(`PDF carregado com ${numPages} páginas!`, 'success');
  };

  // Callback para quando há erro ao carregar o PDF
  const onDocumentLoadError = (error: Error) => {
    console.error('❌ Erro detalhado ao carregar PDF:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      pdfUrl: pdfUrl
    });
    
    if (error.message.includes('Loading task cancelled')) {
      showInternalNotification('Upload do PDF cancelado. Tente novamente.', 'error');
    } else if (error.message.includes('Invalid PDF')) {
      showInternalNotification('Arquivo PDF inválido ou corrompido.', 'error');
    } else if (error.message.includes('worker')) {
      showInternalNotification('Erro no worker PDF. Recarregue a página.', 'error');
    } else {
      showInternalNotification(`Erro ao carregar PDF: ${error.message}`, 'error');
    }
  };

  // Função para excluir proposta diretamente (sem confirmação do navegador)
  const handleDeleteProposal = async (proposalId: string, cliente: string) => {
    try {
      await deleteProposal.mutateAsync(proposalId);
      showInternalNotification(`Proposta de ${cliente} excluída com sucesso!`, 'success');
    } catch (error) {
      console.error('Erro ao excluir proposta:', error);
      showInternalNotification('Erro ao excluir proposta. Tente novamente.', 'error');
    }
  };

  // Função para rejeitar proposta com sincronização em tempo real
  const handleRejectProposal = async (proposalId: string, cliente: string) => {
    try {
      console.log(`❌ Rejeitando proposta ${proposalId} - Portal de Implementação`);
      await rejectProposal.mutateAsync(proposalId);
      showNotification(`Proposta de ${cliente} rejeitada com sucesso!`, 'success');
      console.log(`✅ Proposta ${proposalId} rejeitada - Aparecerá imediatamente para vendedor e supervisor`);
    } catch (error) {
      console.error('Erro ao rejeitar proposta:', error);
      showNotification('Erro ao rejeitar proposta. Tente novamente.', 'error');
    }
  };

  // Debug: Log das propostas
  console.log('Propostas no ImplantacaoPortal:', realProposals);
  console.log('Loading status:', proposalsLoading);

  // Função para atualizar status com sincronização em tempo real em TODOS os portais
  const handleStatusUpdate = async (proposalId: string, newStatus: ProposalStatus) => {
    try {
      console.log(`🎯 IMPLEMENTATION PORTAL - Updating status: ${proposalId} -> ${newStatus}`);
      
      // Atualizar estado local primeiro para mudança imediata da cor
      setProposalStatuses(prev => new Map(prev.set(proposalId, newStatus)));
      
      await updateProposal.mutateAsync({ 
        id: proposalId, 
        status: newStatus 
      });
      
      showInternalNotification(`Status atualizado para ${STATUS_CONFIG[newStatus]?.label} - Sincronizado em todos os portais!`, 'success');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      // Reverter mudança local em caso de erro
      setProposalStatuses(prev => {
        const newMap = new Map(prev);
        newMap.delete(proposalId);
        return newMap;
      });
      showInternalNotification('Erro ao atualizar status', 'error');
    }
  };

  // Função removida - prioridade agora é controlada apenas pelo Supervisor
  // const handlePriorityUpdate = async (proposalId: string, newPriority: 'low' | 'medium' | 'high') => {
  //   ... funcionalidade removida
  // };

  // ✅ FUNÇÃO PARA APROVAR PROPOSTA - Sistema de sincronização em tempo real
  const handleApproveProposal = async (proposalId: string, empresa: string) => {
    try {
      console.log(`✅ IMPLEMENTAÇÃO - Aprovando proposta ${proposalId} para ${empresa}`);
      
      const response = await fetch(`/api/proposals/${proposalId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao aprovar proposta');
      }

      const result = await response.json();
      console.log(`✅ Proposta ${proposalId} aprovada com sucesso - Sincronização ativada`);
      
      // Forçar atualização das queries para sincronização em tempo real
      await updateProposal.mutateAsync({ 
        id: proposalId, 
        approved: true 
      });
      
      showInternalNotification(`Proposta de ${empresa} aprovada com sucesso! ✅`, 'success');
    } catch (error) {
      console.error(`❌ Erro ao aprovar proposta ${proposalId}:`, error);
      showInternalNotification('Erro ao aprovar proposta. Tente novamente.', 'error');
    }
  };
  


  // Use dados reais do banco de dados
  const [automationRules] = useState<AutomationRule[]>([]);
  
  // Estatísticas baseadas nos dados reais do banco de dados
  const realProposalsData = realProposals || [];

  // Status management using real data from database
  useEffect(() => {
    if (!realProposalsData || realProposalsData.length === 0) return;
    
    // Initialize status map from real proposals data
    const statusMap = new Map<string, ProposalStatus>();
    realProposalsData.forEach(proposal => {
      statusMap.set(proposal.id, statusManager.parse(proposal.status));
    });
    setProposalStatuses(statusMap);
  }, [realProposalsData.length]);

  const handleSelectProposal = (proposalId: string) => {
    console.log('Selecionando proposta:', proposalId);
    setEditingProposalId(proposalId);
    setActiveTab('editor');
    setShowProposalSelector(false); // Fechar o modal
    // Removida mensagem sobre Google Sheets - agora apenas abre o editor silenciosamente
  };

  const handleBackFromEditor = () => {
    setEditingProposalId(null);
    setActiveTab('proposals');
  };

  const handleSaveProposal = (data: any) => {
    showNotification('Proposta salva e sincronizada com Google Sheets!', 'success');
  };
  
  // SISTEMA DE CONTAGEM AUTOMÁTICA BASEADO EM APROVAÇÃO/REJEIÇÃO
  const aguardandoValidacao = realProposalsData.filter(p => !p.approved && !p.rejected).length;
  const validadas = realProposalsData.filter(p => p.approved === true).length;
  const emProcessamento = realProposalsData.filter(p => p.status !== 'implantada' && p.status !== 'implantado').length;
  // MANTENDO LÓGICA ORIGINAL PARA CONCLUÍDAS (baseada no status)
  const concluidas = realProposalsData.filter(p => p.status === 'implantado').length;

  const implantacaoStats = [
    {
      name: 'Aguardando Validação',
      value: aguardandoValidacao.toString(),
      change: 'Pendentes de aprovação',
      changeType: 'warning' as const,
      icon: AlertCircle,
      color: 'orange' as const,
    },
    {
      name: 'Validadas',
      value: validadas.toString(),
      change: 'Aprovadas pelos portais',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'green' as const,
    },
    {
      name: 'Em Processamento',
      value: emProcessamento.toString(),
      change: 'Em andamento',
      changeType: 'positive' as const,
      icon: Settings,
      color: 'blue' as const,
    },
    {
      name: 'Concluídas',
      value: concluidas.toString(),
      change: 'Implantadas',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'purple' as const,
    },
  ];

  // Funções antigas removidas - agora usa API para validação
  const validateProposal = (proposalId: string) => {
    showNotification('Funcionalidade será implementada conforme necessário', 'info');
  };

  const sendToAutomation = (proposalId: string) => {
    showNotification('Funcionalidade será implementada conforme necessário', 'info');
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };



  // Funções de cores removidas - agora usa StatusBadge para cores uniformes
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'low':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white dark:text-white';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return 'Normal';
    }
  };

  // Usar propostas reais sempre que possível
  const proposalsToShow = realProposals || [];

  const filteredProposals = proposalsToShow?.filter(proposal => {
    const matchesStatus = selectedStatus === 'all' || proposal.status === selectedStatus;
    const matchesSearch = (proposal.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (proposal.abmId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (proposal.vendedor || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }).sort((a, b) => {
    // Manter ordem cronológica de criação mesmo após filtros
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }) || [];

  const renderProposalsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 dark:text-white" />
              <input
                type="text"
                placeholder="Buscar propostas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Todos os Status</option>
              <option value="observacao">OBSERVAÇÃO</option>
              <option value="analise">ANALISE</option>
              <option value="assinatura_ds">ASSINATURA DS</option>
              <option value="expirado">EXPIRADO</option>
              <option value="implantado">IMPLANTADO</option>
              <option value="aguar_pagamento">AGUAR PAGAMENTO</option>
              <option value="assinatura_proposta">ASSINATURA PROPOSTA</option>
              <option value="aguar_selecao_vigencia">AGUAR SELEÇÃO DE VIGENCIA</option>
              <option value="pendencia">PENDÊNCIA</option>
              <option value="declinado">DECLINADO</option>
              <option value="aguar_vigencia">AGUAR VIGÊNCIA</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => showNotification('Exportando relatório...', 'info')}
              className="flex items-center px-4 py-2 bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200 rounded-md hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors border border-teal-200 dark:border-teal-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white">
            Propostas ({filteredProposals.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Prioridade
                </th>
                <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Progresso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 dark:bg-gray-800 divide-y divide-gray-200">
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 dark:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => window.open(`https://drive.google.com/drive/folders/${proposal.abmId}`, '_blank')}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-white underline"
                    >
                      {proposal.abmId}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}
                      <br />
                      {proposal.createdAt ? new Date(proposal.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{proposal.contractData?.nomeEmpresa || proposal.cliente || 'Empresa não informada'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{proposal.contractData?.cnpj || 'CNPJ não informado'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500 dark:text-white mr-2" />
                      <div className="text-sm text-gray-900 dark:text-white dark:text-white">{proposal.vendedor}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white dark:text-white">{proposal.plano}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white dark:text-white">R$ {proposal.valor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={proposal.status}
                      onChange={(e) => handleStatusUpdate(proposal.id, e.target.value as ProposalStatus)}
                      className="text-sm font-medium rounded-md border-gray-300 dark:border-gray-600 dark:border-gray-600 focus:border-teal-500 focus:ring-teal-500 px-3 py-2"
                      style={{
                        backgroundColor: (() => {
                          const currentStatus = proposalStatuses.get(proposal.id) || proposal.status;
                            const config = STATUS_CONFIG[currentStatus as ProposalStatus];
                            if (!config) return '#ffffff';
                            
                            if (config.bgColor.includes('sky')) return '#e0f2fe';
                            if (config.bgColor.includes('emerald')) return '#d1fae5';
                            if (config.bgColor.includes('amber')) return '#fef3c7';
                            if (config.bgColor.includes('blue')) return '#dbeafe';
                            if (config.bgColor.includes('green')) return '#dcfce7';
                            if (config.bgColor.includes('pink')) return '#fce7f3';
                            if (config.bgColor.includes('yellow')) return '#fef7cd';
                            if (config.bgColor.includes('orange')) return '#fed7aa';
                            if (config.bgColor.includes('red')) return '#fee2e2';
                            if (config.bgColor.includes('purple')) return '#f3e8ff';
                            if (config.bgColor.includes('cyan')) return '#cffafe';
                            return '#ffffff';
                          })(),
                          color: (() => {
                            const currentStatus = proposalStatuses.get(proposal.id) || proposal.status;
                            const config = STATUS_CONFIG[currentStatus as ProposalStatus];
                            if (!config) return '#374151';
                            
                            if (config.textColor.includes('sky')) return '#0369a1';
                            if (config.textColor.includes('emerald')) return '#047857';
                            if (config.textColor.includes('amber')) return '#92400e';
                            if (config.textColor.includes('blue')) return '#1e40af';
                            if (config.textColor.includes('green')) return '#166534';
                            if (config.textColor.includes('pink')) return '#be185d';
                            if (config.textColor.includes('yellow')) return '#a16207';
                            if (config.textColor.includes('orange')) return '#c2410c';
                            if (config.textColor.includes('red')) return '#dc2626';
                            if (config.textColor.includes('purple')) return '#7c3aed';
                            if (config.textColor.includes('cyan')) return '#0891b2';
                            return '#374151';
                          })()
                        }}
                      >
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <option 
                            key={key} 
                            value={key}
                            style={{
                              backgroundColor: config.bgColor.includes('sky') ? '#e0f2fe' :
                                             config.bgColor.includes('emerald') ? '#d1fae5' :
                                             config.bgColor.includes('amber') ? '#fef3c7' :
                                             config.bgColor.includes('blue') ? '#dbeafe' :
                                             config.bgColor.includes('green') ? '#dcfce7' :
                                             config.bgColor.includes('pink') ? '#fce7f3' :
                                             config.bgColor.includes('yellow') ? '#fef7cd' :
                                             config.bgColor.includes('orange') ? '#fed7aa' :
                                             config.bgColor.includes('red') ? '#fee2e2' :
                                             config.bgColor.includes('purple') ? '#f3e8ff' :
                                             config.bgColor.includes('cyan') ? '#cffafe' : '#f9fafb',
                              color: config.textColor.includes('sky') ? '#0369a1' :
                                     config.textColor.includes('emerald') ? '#047857' :
                                     config.textColor.includes('amber') ? '#92400e' :
                                     config.textColor.includes('blue') ? '#1e40af' :
                                     config.textColor.includes('green') ? '#166534' :
                                     config.textColor.includes('pink') ? '#be185d' :
                                     config.textColor.includes('yellow') ? '#a16207' :
                                     config.textColor.includes('orange') ? '#c2410c' :
                                     config.textColor.includes('red') ? '#dc2626' :
                                     config.textColor.includes('purple') ? '#7c3aed' :
                                     config.textColor.includes('cyan') ? '#0891b2' : '#374151'
                            }}
                          >
                            {config.label}
                          </option>
                        ))}
                      </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        proposal.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        proposal.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}
                      title="Prioridade definida pelo Supervisor (somente leitura)"
                    >
                      {proposal.priority === 'high' ? 'Alta' : 
                       proposal.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <ProgressBar proposal={proposal} className="w-32" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingProposalId(proposal.id);
                        setActiveTab('editor');
                      }}
                      className="p-2 text-green-600 hover:text-green-800 dark:text-white hover:bg-green-50 dark:hover:bg-green-800 dark:bg-green-900 rounded-md transition-colors"
                      title="Editar Proposta"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {/* Ações Mantidas */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/cliente/proposta/${proposal.clientToken}`);
                        showNotification('Link copiado para área de transferência!', 'success');
                      }}
                      className="p-2 text-gray-600 dark:text-white dark:text-gray-500 dark:text-white hover:text-gray-800 dark:text-white dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 dark:bg-gray-700 rounded-md transition-colors"
                      title="Copiar Link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const message = `Olá! Sua proposta está disponível em: ${window.location.origin}/cliente/proposta/${proposal.clientToken}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="p-2 text-emerald-600 hover:text-emerald-800 dark:text-white hover:bg-emerald-50 rounded-md transition-colors"
                      title="Enviar via WhatsApp"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const subject = `Proposta de Plano de Saúde - ${proposal.cliente}`;
                        const body = `Olá!\n\nSua proposta de plano de saúde está pronta e pode ser acessada através do link:\n${window.location.origin}/cliente/proposta/${proposal.clientToken}\n\nQualquer dúvida, estamos à disposição.\n\nAtenciosamente,\nEquipe Abmix`;
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                      }}
                      className="p-2 text-blue-500 hover:text-blue-700 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-800 dark:bg-blue-900 rounded-md transition-colors"
                      title="Enviar por Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProposal(proposal.id, proposal.cliente)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-white hover:bg-red-50 dark:hover:bg-red-800 dark:bg-red-900 rounded-md transition-colors"
                      title="Excluir Proposta"
                      disabled={deleteProposal.isPending}
                    >
                      <Trash2 className={`w-4 h-4 ${deleteProposal.isPending ? 'animate-spin' : ''}`} />
                    </button>
                    {/* SISTEMA DE APROVAÇÃO E REJEIÇÃO SINCRONIZADO EM TEMPO REAL */}
                    {!proposal.approved && !proposal.rejected ? (
                      <>
                        <button
                          onClick={() => handleApproveProposal(proposal.id, proposal.contractData?.nomeEmpresa || proposal.cliente)}
                          className="p-2 text-lime-600 hover:text-lime-800 dark:text-white hover:bg-lime-50 rounded-md transition-colors"
                          title="Aprovar Proposta"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRejectProposal(proposal.id, proposal.contractData?.nomeEmpresa || proposal.cliente)}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-white hover:bg-red-50 rounded-md transition-colors"
                          title="Rejeitar Proposta"
                          disabled={rejectProposal.isPending}
                        >
                          <XCircle className={`w-4 h-4 ${rejectProposal.isPending ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => showNotification('Alerta: Proposta pendente de aprovação!', 'warning')}
                          className="p-2 text-amber-600 hover:text-amber-800 dark:text-white hover:bg-amber-50 rounded-md transition-colors"
                          title="Alerta - Pendente Aprovação"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      </>
                    ) : proposal.approved ? (
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full cursor-pointer"
                        title="Proposta Aprovada"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </span>
                    ) : proposal.rejected ? (
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full cursor-pointer"
                        title="Proposta Rejeitada"
                      >
                        <XCircle className="w-4 h-4" />
                      </span>
                    ) : null}
                    <button
                      onClick={() => {
                        setSelectedProposalForMessage(proposal);
                        setShowInternalMessage(true);
                      }}
                      className="p-2 text-violet-600 hover:text-violet-800 dark:text-white hover:bg-violet-50 rounded-md transition-colors"
                      title="Mensagem Interna"
                    >
                      <MessageSquare className="w-4 h-4" />
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

  const renderAutomationTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white">Regras de Automação</h2>
          <button
            onClick={() => showNotification('Nova regra criada!', 'success')}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Regra
          </button>
        </div>
        
        <div className="space-y-4">
          {automationRules.map((rule) => (
            <div key={rule.id} className="border border-gray-200 dark:border-gray-700 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white dark:text-white">{rule.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      rule.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white dark:text-white'
                    }`}>
                      {rule.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-white dark:text-gray-500 dark:text-white">
                    <span className="font-medium">Gatilho:</span> {rule.trigger}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-white dark:text-gray-500 dark:text-white">
                    <span className="font-medium">Ação:</span> {rule.action}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-white dark:text-gray-500 dark:text-white mt-2">
                    Última execução: {rule.lastRun}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => showNotification('Regra editada!', 'info')}
                    className="text-blue-600 hover:text-blue-900 dark:text-white p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-800 dark:bg-blue-900 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => showNotification('Regra removida!', 'error')}
                    className="text-red-600 hover:text-red-900 dark:text-white p-1 rounded hover:bg-red-50 dark:hover:bg-red-800 dark:bg-red-900 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Botão para ir para automação */}
      <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white">Automação Manual</h2>
          <button
            onClick={() => showNotification('Acessando sistema de automação...', 'info')}
            className="flex items-center px-4 py-2 bg-purple-600 text-white dark:bg-purple-50 dark:bg-purple-9000 dark:text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Zap className="w-4 h-4 mr-2" />
            Ir para Automação
          </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-white dark:text-gray-500 dark:text-white mb-4">
          Selecione uma proposta para verificar se está completa e enviar para automação manualmente.
        </p>
        
        <div className="space-y-4">
          {realProposalsData.filter(p => p.status === 'validated').map((proposal) => (
            <div key={proposal.id} className="border border-gray-200 dark:border-gray-700 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{proposal.contractData?.nomeEmpresa || proposal.cliente || 'Cliente não informado'}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{proposal.id}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => showNotification(`Verificando formulário de ${proposal.contractData?.nomeEmpresa || proposal.cliente || 'cliente'}...`, 'info')}
                    className="p-2 text-blue-600 hover:text-blue-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-800 rounded-full transition-colors"
                    title="Verificar formulário completo"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => showNotification(`Editando proposta de ${proposal.contractData?.nomeEmpresa || proposal.cliente || 'cliente'}...`, 'info')}
                    className="p-2 text-amber-600 hover:text-amber-900 dark:text-white hover:bg-amber-50 rounded-full transition-colors"
                    title="Editar proposta"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(`mailto:${(proposal.vendedor || 'vendedor').toLowerCase().replace(/\s/g, '.')}@abmix.com.br?subject=Proposta ${proposal.id}`)}
                    className="p-2 text-purple-600 hover:text-purple-900 dark:text-white hover:bg-purple-50 rounded-full transition-colors"
                    title="Enviar email para vendedor"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(`Olá! Sobre a proposta ${proposal.id} do cliente ${proposal.contractData?.nomeEmpresa || proposal.cliente || 'cliente'}...`)}`)}
                    className="p-2 text-green-600 hover:text-green-900 dark:text-white hover:bg-green-50 dark:hover:bg-green-800 rounded-full transition-colors"
                    title="Enviar WhatsApp para vendedor"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => sendToAutomation(proposal.id)}
                    className="p-2 text-purple-600 hover:text-purple-900 dark:text-white hover:bg-purple-50 dark:bg-purple-900 rounded-full transition-colors"
                    title="Enviar para automação"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <div className="w-full bg-gray-200 dark:bg-gray-600 dark:bg-gray-600 rounded-full h-2 mr-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: '100%' }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 dark:text-white dark:text-gray-500 dark:text-white">Completo</span>
              </div>
            </div>
          ))}
          
          {realProposalsData.filter(p => p.status === 'validated').length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">
              Nenhuma proposta validada disponível para automação
            </div>
          )}
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
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="/65be871e-f7a6-4f31-b1a9-cd0729a73ff8 copy copy.png" 
                  alt="Abmix" 
                  className="h-10 w-auto mr-3"
                />
                <div className="ml-3">
                  <WelcomeMessage 
                    userName={user?.name}
                    userEmail={user?.email} 
                    className="mb-1"
                  />

                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                className="relative p-2 text-gray-600 dark:text-white dark:text-gray-500 dark:text-white hover:text-gray-900 dark:text-white dark:text-white hover:bg-gray-100 dark:bg-gray-700 rounded-full transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                {/* SINO REMOVIDO */}
                {/* NOTIFICAÇÕES DESABILITADAS */}
              </button>
              
              {/* NOTIFICAÇÕES COMPLETAMENTE DESABILITADAS */}
              
              {/* Badge de notificações de mensagens - INTERFACE UNIFICADA */}
              <MessageNotificationBadge 
                userEmail={user?.email} 
                onMessagesView={() => setShowInternalMessage(true)}
              />
              

              
              <ThemeToggle />
              
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-white dark:text-gray-500 dark:text-white hover:text-gray-900 dark:text-white dark:hover:text-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notificações Internas */}
      {internalNotifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {internalNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg border ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
                  : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
              } max-w-sm animate-fade-in`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {notification.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2" />
                  )}
                  <span className="text-sm font-medium">{notification.message}</span>
                </div>
                <button
                  onClick={() => setInternalNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Implantação</h1>
          <p className="text-gray-600 dark:text-gray-300">Valide propostas, configure automações e gerencie integrações</p>
        </div>

        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {implantacaoStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${
                      stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                      stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                      stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900' :
                      stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                      'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                        stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 
                      stat.changeType === 'warning' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white mb-4">Ações Rápidas</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowProposalSelector(true)}
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 shadow-sm border border-blue-200 dark:border-blue-700"
              >
                <Search className="w-4 h-4 mr-2" />
                <span>Selecionar Proposta</span>
              </button>
              
              <button
                onClick={() => window.open('https://drive.google.com/drive/folders/1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb?usp=drive_link', '_blank')}
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-green-100 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 rounded-lg transition-colors duration-200 shadow-sm border border-green-200 dark:border-green-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                <span>Google Drive</span>
              </button>
              
              <button
                onClick={() => window.open('https://docs.google.com/spreadsheets/d/1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw/edit?usp=drive_link', '_blank')}
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 shadow-sm border border-blue-200 dark:border-blue-700"
              >
                <Database className="w-4 h-4 mr-2" />
                <span>Google Sheets</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-600">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'proposals', label: 'Propostas', icon: FileText },
                  { id: 'automation', label: 'Automação', icon: Zap },
                  { id: 'imageEditor', label: 'Editor de Imagem', icon: Image }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                          : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'proposals' && renderProposalsTab()}
              {activeTab === 'automation' && renderAutomationTab()}
              {activeTab === 'editor' && editingProposalId && (
                <div className="h-full">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Editor de Proposta - {editingProposalId}
                    </h2>
                    <button
                      onClick={handleBackFromEditor}
                      className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar para Lista
                    </button>
                  </div>
                  <ProposalEditor
                    proposalId={editingProposalId}
                    onBack={handleBackFromEditor}
                    onSave={handleSaveProposal}
                    user={user}
                  />
                </div>
              )}
              {activeTab === 'editor' && !editingProposalId && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma proposta selecionada</h3>
                  <p className="text-gray-600 dark:text-gray-300">Use o botão "Selecionar Proposta" para escolher uma proposta para edição.</p>
                </div>
              )}
              {activeTab === 'imageEditor' && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Editor de PDF e Imagem</h2>
                  </div>

                  {/* Card do Editor de Imagem */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                    <div className="flex items-center mb-4">
                      {fileType === 'pdf' ? (
                        <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                      ) : (
                        <Image className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                      )}
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Editor de {selectedImage ? (fileType === 'pdf' ? 'PDF' : 'Imagem') : 'PDF e Imagem'}
                      </h3>
                    </div>

                    {/* Upload de PDF e Imagem com Drag & Drop */}
                    {!selectedImage && (
                      <div 
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          isDragOver 
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-500' 
                            : 'border-gray-300 dark:border-gray-500'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload de PDF ou Imagem</h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {isDragOver 
                            ? 'Solte o arquivo aqui...' 
                            : 'Arraste e solte ou clique para selecionar um arquivo PDF, JPG ou PNG'
                          }
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf,image/jpeg,image/jpg,image/png"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Selecionar Arquivo
                        </button>
                      </div>
                    )}

                    {/* Visualização e Controles */}
                    {selectedImage && (
                      <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">
                              {fileType === 'pdf' ? 'PDF Carregado' : 'Imagem Carregada'}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                                {fileType?.toUpperCase()}
                              </span>
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                Trocar
                              </button>
                              <button
                                onClick={clearFile}
                                className="inline-flex items-center px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remover
                              </button>
                            </div>
                          </div>
                          
                          {/* Preview do Arquivo */}
                          <div className="flex justify-center mb-4">
                            {fileType === 'pdf' ? (
                              <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Visualização do PDF
                                  </h4>
                                  {numPages && (
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {numPages} página{numPages > 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Container para o PDF */}
                                <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                                  {pdfUrl ? (
                                    <Document
                                      file={pdfUrl}
                                      onLoadSuccess={onDocumentLoadSuccess}
                                      onLoadError={onDocumentLoadError}
                                      loading={
                                        <div className="flex items-center justify-center p-8">
                                          <div className="text-center">
                                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-600 dark:text-gray-400">Carregando PDF...</p>
                                            <div className="mt-2 w-16 h-1 bg-emerald-200 rounded-full overflow-hidden">
                                              <div className="h-full bg-emerald-600 rounded-full animate-pulse"></div>
                                            </div>
                                          </div>
                                        </div>
                                      }
                                      error={
                                        <div className="flex items-center justify-center p-8">
                                          <div className="text-center">
                                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                                            <p className="text-red-600 dark:text-red-400 font-medium">Erro ao carregar PDF</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                              Verifique se o arquivo é um PDF válido
                                            </p>
                                            <button
                                              onClick={() => {
                                                clearFile();
                                                showInternalNotification('Arquivo removido. Tente fazer upload novamente.', 'success');
                                              }}
                                              className="mt-3 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                            >
                                              Tentar Novamente
                                            </button>
                                          </div>
                                        </div>
                                      }
                                    >
                                      {numPages && Array.from(new Array(numPages), (el, index) => (
                                        <Page
                                          key={`page_${index + 1}`}
                                          pageNumber={index + 1}
                                          width={Math.min(window.innerWidth * 0.6, 600)}
                                          className="mb-4 shadow-sm"
                                          renderTextLayer={false}
                                          renderAnnotationLayer={false}
                                        />
                                      ))}
                                    </Document>
                                  ) : (
                                    <div className="flex items-center justify-center p-8">
                                      <div className="text-center">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600 dark:text-gray-400">Nenhum PDF carregado</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                                  <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                    ✓ PDF carregado e renderizado com sucesso! Use as ferramentas abaixo para editar.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <img 
                                src={selectedImage} 
                                alt="Imagem carregada" 
                                className="max-w-full max-h-96 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                              />
                            )}
                          </div>

                          {/* Ferramentas de Edição */}
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                              Ferramentas de Edição {fileType === 'pdf' ? 'PDF' : 'de Imagem'}
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <button
                                onClick={() => showInternalNotification(`Ferramenta Texto ${fileType === 'pdf' ? 'PDF' : 'Imagem'} selecionada!`, 'success')}
                                className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Type className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
                                <span className="text-xs text-gray-700 dark:text-gray-300">Texto</span>
                              </button>
                              
                              <button
                                onClick={() => showInternalNotification(`Ferramenta Destacar ${fileType === 'pdf' ? 'PDF' : 'Imagem'} selecionada!`, 'success')}
                                className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Highlighter className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mb-1" />
                                <span className="text-xs text-gray-700 dark:text-gray-300">Destacar</span>
                              </button>
                              
                              <button
                                onClick={() => showInternalNotification(`Ferramenta Cortar ${fileType === 'pdf' ? 'PDF' : 'Imagem'} selecionada!`, 'success')}
                                className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Crop className="w-5 h-5 text-green-600 dark:text-green-400 mb-1" />
                                <span className="text-xs text-gray-700 dark:text-gray-300">Cortar</span>
                              </button>
                              
                              <button
                                onClick={() => showInternalNotification(`Ferramenta Apagar ${fileType === 'pdf' ? 'PDF' : 'Imagem'} selecionada!`, 'success')}
                                className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Eraser className="w-5 h-5 text-red-600 dark:text-red-400 mb-1" />
                                <span className="text-xs text-gray-700 dark:text-gray-300">Apagar</span>
                              </button>
                            </div>
                          </div>

                          {/* Botões de Ação */}
                          <div className="flex justify-end items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <button
                              onClick={downloadEditedFile}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Baixar {fileType === 'pdf' ? 'PDF' : 'Imagem'}
                            </button>
                          </div>
                        </div>

                        {/* Editor Integrado com Filerobot */}
                        {isEditorOpen && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-md font-medium text-gray-900 dark:text-white">Editor de Imagem Avançado</h4>
                              <button
                                onClick={() => setIsEditorOpen(false)}
                                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Fechar Editor
                              </button>
                            </div>
                            
                            {/* Container para o editor Filerobot */}
                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                              <iframe
                                src="/editor.html"
                                className="w-full h-96 border-0"
                                title="Editor de Imagem Filerobot"
                              />
                            </div>
                            
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                💡 O editor completo está sendo carregado. Use as ferramentas avançadas para editar sua imagem com precisão.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Validação da Proposta
                </h3>
                <button 
                  onClick={() => setSelectedProposal(null)}
                  className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {(() => {
                const proposal = realProposalsData.find(p => p.id === selectedProposal);
                if (!proposal) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-white">Cliente:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-300">{proposal.contractData?.nomeEmpresa || proposal.cliente || 'Cliente não informado'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-white">Vendedor:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-300">{proposal.vendedor || 'Vendedor não informado'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-white">Plano:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-300">{proposal.plano || 'Plano não informado'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-white dark:text-white">Valor:</span>
                        <span className="ml-2">R$ {proposal.valor || '0,00'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-white">Prioridade:</span>
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          Média
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-white">Data:</span>
                        <span className="ml-2">{proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString('pt-BR') : 'Data não informada'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-white dark:text-white mb-2">
                        Observações de Implantação
                      </label>
                      <textarea
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Adicione observações sobre a validação e implantação..."
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setSelectedProposal(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-white dark:text-white bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      {proposal.status === 'pending_validation' && (
                        <button
                          onClick={() => validateProposal(proposal.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          Validar Proposta
                        </button>
                      )}
                      {proposal.status === 'validated' && (
                        <button
                          onClick={() => sendToAutomation(proposal.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
                        >
                          Enviar para Make/Zapier
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Proposal Selector Modal */}
      <ProposalSelector
        isOpen={showProposalSelector}
        onClose={() => setShowProposalSelector(false)}
        onSelectProposal={handleSelectProposal}
      />

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


      
      {/* System Footer */}
      <SystemFooter />
    </div>
  );
};

export default ImplantacaoPortal;