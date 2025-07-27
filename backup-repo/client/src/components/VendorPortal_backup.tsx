import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Users, FileText, Link, Eye, BarChart3, Clock, CheckCircle, AlertCircle, Copy, ExternalLink, Download, Search, Filter, ArrowLeft, Home, Bell, Calculator, Target, TrendingUp, DollarSign, X, Mail, Image, MessageSquare, MessageCircle, Trash2, Camera, Upload, Paperclip } from 'lucide-react';
// import AbmixLogo from './AbmixLogo';
import ActionButtons from './ActionButtons';
import InternalMessage from './InternalMessage';
import NotificationCenter from './NotificationCenter';
import ProposalGenerator from './ProposalGenerator';
import ProposalTracker from './ProposalTracker';
import QuotationPanel from './QuotationPanel';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import SystemFooter from './SystemFooter';
import ThemeToggle from './ThemeToggle';

import { showNotification } from '../utils/notifications';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import { useVendorProposals, useRealTimeProposals, useDeleteProposal } from '../hooks/useProposals';
import StatusManager, { ProposalStatus } from '@shared/statusSystem';

interface VendorPortalProps {
  user: any;
  onLogout: () => void;
}

type VendorView = 'dashboard' | 'new-proposal' | 'tracker' | 'clients' | 'spreadsheet' | 'quotation' | 'cotacoes' | 'quotations';

interface Proposal {
  id: string;
  client: string;
  plan: string;
  status: string;
  progress: number;
  date: string;
  link: string;
  value: string;
  empresa: string;
  cnpj: string;
  vendedor: string;
  documents: number;
  lastActivity: string;
  email: string;
  phone: string;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
}

interface QuotationData {
  numeroVidas: number;
  operadora: string;
  idades: number[];
}

interface Cotacao {
  id: string;
  operadora: string;
  tipoplano: string;
  numeroVidas: number;
  valor: string;
  validade: string;
  dataEnvio: string;
  arquivos: File[];
  clienteId?: string;
  proposalId?: string;
}

const VendorPortal: React.FC<VendorPortalProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<VendorView>('dashboard');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [generatedLinks, setGeneratedLinks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Hook para propostas do vendedor
  const { proposals: realProposals, isLoading: proposalsLoading } = useVendorProposals(user?.id || 0);
  useRealTimeProposals(user?.id); // Ativa a atualização em tempo real para este vendedor
  
  // Hook para exclusão de propostas
  const deleteProposal = useDeleteProposal();

  // Função para confirmar e excluir proposta
  const handleDeleteProposal = async (proposalId: string, cliente: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a proposta de ${cliente}?\n\nEsta ação não pode ser desfeita e os valores deixarão de ser considerados nas estatísticas.`
    );
    
    if (confirmed) {
      try {
        await deleteProposal.mutateAsync(proposalId);
        showNotification('Proposta excluída com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao excluir proposta:', error);
        showNotification('Erro ao excluir proposta. Tente novamente.', 'error');
      }
    }
  };
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInternalMessage, setShowInternalMessage] = useState(false);
  const [statusManager] = useState(() => StatusManager.getInstance());
  const [proposalStatuses, setProposalStatuses] = useState<Map<string, ProposalStatus>>(new Map());
  const [quotationData, setQuotationData] = useState<QuotationData>({
    numeroVidas: 1,
    operadora: '',
    idades: [25]
  });
  const [arquivosAnexados, setArquivosAnexados] = useState<File[]>([]);
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [novaCotacao, setNovaCotacao] = useState<Cotacao>({
    id: '',
    operadora: '',
    tipoplano: '',
    numeroVidas: 1,
    valor: '',
    validade: '',
    dataEnvio: new Date().toISOString().split('T')[0],
    arquivos: []
  });
  const [dragActive, setDragActive] = useState(false);
  const { getClientDocuments } = useGoogleDrive();

  // Inicializar status e escutar mudanças
  useEffect(() => {
    const mockProposals = [
      { id: 'VEND001-PROP123' },
      { id: 'VEND001-PROP124' },
      { id: 'VEND001-PROP125' }
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

  // Sistema de notificações limpo
  const [notifications, setNotifications] = useState([]);

  const stats = [
    {
      name: 'Propostas Ativas',
      value: realProposals?.length?.toString() || '0',
      change: '0',
      changeType: 'positive',
      icon: FileText,
      color: 'blue',
    },
    {
      name: 'Clientes Preenchendo',
      value: realProposals?.filter(p => !p.clientCompleted)?.length?.toString() || '0',
      change: 'Em andamento',
      changeType: 'neutral',
      icon: Users,
      color: 'yellow',
    },
    {
      name: 'Aguardando Documentos',
      value: realProposals?.filter(p => p.clientAttachments?.length === 0)?.length?.toString() || '0',
      change: 'Pendente',
      changeType: 'warning',
      icon: Clock,
      color: 'orange',
    },
    {
      name: 'Finalizadas',
      value: realProposals?.filter(p => p.clientCompleted)?.length?.toString() || '0',
      change: '0',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'green',
    },
  ];

  const recentProposals: Proposal[] = [
    {
      id: 'VEND001-PROP123',
      client: 'Empresa ABC Ltda',
      plan: 'Plano Empresarial Premium',
      status: 'client_filling',
      progress: 75,
      date: '2024-01-15',
      link: `${window.location.origin}/cliente/VEND001-PROP123`,
      value: 'R$ 1.250,00',
      empresa: 'Empresa ABC Ltda',
      cnpj: '12.345.678/0001-90',
      vendedor: user.name,
      documents: 8,
      lastActivity: '2 horas atrás',
      email: 'contato@empresaabc.com.br',
      phone: '11999999999',
      attachments: [
        { id: '1', name: 'cnpj_empresa_abc.pdf', type: 'pdf', size: '2.1 MB', url: '/docs/cnpj_empresa_abc.pdf' },
        { id: '2', name: 'rg_titular.jpg', type: 'image', size: '1.8 MB', url: '/docs/rg_titular.jpg' },
        { id: '3', name: 'cpf_titular.pdf', type: 'pdf', size: '0.9 MB', url: '/docs/cpf_titular.pdf' },
      ]
    },
    {
      id: 'VEND001-PROP124',
      client: 'Tech Solutions SA',
      plan: 'Plano Família Básico',
      status: 'docs_pending',
      progress: 45,
      date: '2024-01-14',
      link: `${window.location.origin}/cliente/VEND001-PROP124`,
      value: 'R$ 650,00',
      empresa: 'Tech Solutions SA',
      cnpj: '98.765.432/0001-10',
      vendedor: user.name,
      documents: 6,
      lastActivity: '1 dia atrás',
      email: 'admin@techsolutions.com',
      phone: '11888888888',
      attachments: [
        { id: '4', name: 'contrato_social.pdf', type: 'pdf', size: '3.2 MB', url: '/docs/contrato_social.pdf' },
        { id: '5', name: 'comprovante_residencia.pdf', type: 'pdf', size: '0.8 MB', url: '/docs/comprovante_residencia.pdf' },
      ]
    },
    {
      id: 'VEND001-PROP125',
      client: 'Consultoria XYZ',
      plan: 'Plano Individual',
      status: 'completed',
      progress: 100,
      date: '2024-01-13',
      link: `${window.location.origin}/cliente/VEND001-PROP125`,
      value: 'R$ 320,00',
      empresa: 'Consultoria XYZ',
      cnpj: '11.222.333/0001-44',
      vendedor: user.name,
      documents: 5,
      lastActivity: '3 dias atrás',
      email: 'contato@consultoriaxyz.com.br',
      phone: '11777777777',
      attachments: [
        { id: '6', name: 'carteirinha_atual.jpg', type: 'image', size: '1.2 MB', url: '/docs/carteirinha_atual.jpg' },
        { id: '7', name: 'analitico_plano.pdf', type: 'pdf', size: '1.5 MB', url: '/docs/analitico_plano.pdf' },
      ]
    },
  ];

  const addIdade = () => {
    setQuotationData(prev => ({
      ...prev,
      idades: [...prev.idades, 25]
    }));
  };

  const removeIdade = (index: number) => {
    setQuotationData(prev => ({
      ...prev,
      idades: prev.idades.filter((_, i) => i !== index)
    }));
  };

  const updateIdade = (index: number, value: number) => {
    setQuotationData(prev => ({
      ...prev,
      idades: prev.idades.map((idade, i) => i === index ? value : idade)
    }));
  };

  const generateQuotation = () => {
    // Simular geração de cotação
    const baseValue = 150;
    const ageMultiplier = quotationData.idades.reduce((acc, idade) => {
      if (idade < 30) return acc + 1;
      if (idade < 50) return acc + 1.5;
      return acc + 2;
    }, 0);
    
    const totalValue = baseValue * ageMultiplier * quotationData.numeroVidas;
    
    showNotification(`Cotação gerada: R$ ${totalValue.toFixed(2)}`, 'success');
  };

  const downloadQuotation = () => {
    // Simular download da cotação
    const quotationDataExport = {
      numeroVidas: quotationData.numeroVidas,
      operadora: quotationData.operadora,
      idades: quotationData.idades,
      valorTotal: 'R$ 2.450,00',
      dataGeracao: new Date().toLocaleDateString('pt-BR')
    };
    
    const dataStr = JSON.stringify(quotationDataExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cotacao.json';
    link.click();
    
    showNotification('Cotação baixada com sucesso!', 'success');
  };

  const handleAnexarArquivo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const novosArquivos = Array.from(files);
      setArquivosAnexados(prev => [...prev, ...novosArquivos]);
      showNotification(`${novosArquivos.length} arquivo(s) anexado(s) com sucesso!`, 'success');
    }
  };

  const removerArquivo = (index: number) => {
    setArquivosAnexados(prev => prev.filter((_, i) => i !== index));
    showNotification('Arquivo removido com sucesso!', 'success');
  };

  const salvarCotacao = () => {
    if (!novaCotacao.operadora || !novaCotacao.tipoplano || !novaCotacao.valor) {
      showNotification('Preencha todos os campos obrigatórios da cotação', 'error');
      return;
    }

    const cotacao: Cotacao = {
      ...novaCotacao,
      id: Date.now().toString(),
    };

    setCotacoes(prev => [...prev, cotacao]);
    
    // Limpar formulário após salvar
    setNovaCotacao({
      id: '',
      operadora: '',
      tipoplano: '',
      numeroVidas: 1,
      valor: '',
      validade: '',
      dataEnvio: new Date().toISOString().split('T')[0],
      arquivos: []
    });
    
    showNotification('Cotação adicionada com sucesso!', 'success');
  };

  const limparFormulario = () => {
    setQuotationData({
      numeroVidas: 1,
      operadora: '',
      idades: [25]
    });
    setArquivosAnexados([]);
    showNotification('Formulário limpo com sucesso!', 'success');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Funções para gerenciar cotações
  const adicionarCotacao = () => {
    if (!novaCotacao.operadora || !novaCotacao.tipoplano || !novaCotacao.valor || !novaCotacao.validade || !novaCotacao.dataEnvio) {
      showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    const cotacao: Cotacao = {
      ...novaCotacao,
      id: Date.now().toString(),
    };

    setCotacoes(prev => [...prev, cotacao]);
    setNovaCotacao({
      id: '',
      operadora: '',
      tipoplano: '',
      numeroVidas: 1,
      valor: '',
      validade: '',
      dataEnvio: new Date().toISOString().split('T')[0],
      arquivos: []
    });
    showNotification('Cotação adicionada com sucesso!', 'success');
  };

  const removerCotacao = (id: string) => {
    setCotacoes(prev => prev.filter(cotacao => cotacao.id !== id));
    showNotification('Cotação removida com sucesso!', 'success');
  };

  const handleArquivoCotacao = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const novosArquivos = Array.from(files);
      setNovaCotacao(prev => ({
        ...prev,
        arquivos: [...prev.arquivos, ...novosArquivos]
      }));
      showNotification(`${novosArquivos.length} arquivo(s) anexado(s)!`, 'success');
    }
  };





  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const novosArquivos = Array.from(e.dataTransfer.files);
      setNovaCotacao(prev => ({
        ...prev,
        arquivos: [...prev.arquivos, ...novosArquivos]
      }));
      showNotification(`${novosArquivos.length} arquivo(s) anexado(s) via drag & drop!`, 'success');
    }
  };

  const tirarFoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Usa câmera traseira no mobile
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const novosArquivos = Array.from(files);
        setNovaCotacao(prev => ({
          ...prev,
          arquivos: [...prev.arquivos, ...novosArquivos]
        }));
        showNotification('Foto capturada com sucesso!', 'success');
      }
    };
    input.click();
  };

  const removerArquivoCotacao = (cotacaoId: string, arquivoIndex: number) => {
    if (cotacaoId === '') {
      // Removendo arquivo da nova cotação
      setNovaCotacao(prev => ({
        ...prev,
        arquivos: prev.arquivos.filter((_, i) => i !== arquivoIndex)
      }));
    } else {
      // Removendo arquivo de cotação existente
      setCotacoes(prev => prev.map(cotacao => 
        cotacao.id === cotacaoId 
          ? { ...cotacao, arquivos: cotacao.arquivos.filter((_, i) => i !== arquivoIndex) }
          : cotacao
      ));
    }
    showNotification('Arquivo removido!', 'success');
  };

  const enviarWhatsAppCotacao = (cotacao: Cotacao) => {
    const mensagem = `Olá! Segue cotação:\n\nOperadora: ${cotacao.operadora}\nTipo: ${cotacao.tipoplano}\nNº de vidas: ${cotacao.numeroVidas}\nValor: R$ ${cotacao.valor}\nValidade: ${new Date(cotacao.validade).toLocaleDateString('pt-BR')}\nData de Envio: ${new Date(cotacao.dataEnvio).toLocaleDateString('pt-BR')}\nArquivos: ${cotacao.arquivos.length} anexo(s)\n\nQualquer dúvida, estou à disposição!`;
    
    // Para demonstração, vamos usar um número padrão
    const numeroWhatsApp = '5511999999999';
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    showNotification('Redirecionando para WhatsApp...', 'success');
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

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    
    // Quando visualizar uma proposta, buscar documentos do Google Drive
    if (proposal.id) {
      getClientDocuments(proposal.id)
        .then(documents => {
          console.log('Documentos do cliente no Google Drive:', documents);
          // Aqui você poderia atualizar a lista de documentos da proposta
        })
        .catch(error => {
          console.error('Erro ao buscar documentos do Google Drive:', error);
        });
    }
    
    // Quando visualizar uma proposta, buscar documentos do Google Drive
    if (proposal.id) {
      getClientDocuments(proposal.id)
        .then(documents => {
          console.log('Documentos do cliente no Google Drive:', documents);
          // Aqui você poderia atualizar a lista de documentos da proposta
        })
        .catch(error => {
          console.error('Erro ao buscar documentos do Google Drive:', error);
        });
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      showNotification('Link copiado para a área de transferência!', 'success');
    } catch (err) {
      showNotification('Erro ao copiar link. Tente novamente.', 'error');
    }
  };

  const renderQuotationModule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center text-white dark:text-white hover:text-gray-200 dark:hover:text-gray-300 transition-colors bg-black/20 px-3 py-2 rounded-lg hover:bg-black/30"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Módulo de Cotação</h1>
        <p className="text-gray-600 dark:text-gray-300">Gere cotações personalizadas para seus clientes</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Dados da Cotação</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Número de Vidas
            </label>
            <input
              type="number"
              min="1"
              value={quotationData.numeroVidas}
              onChange={(e) => setQuotationData(prev => ({ ...prev, numeroVidas: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Operadora
            </label>
            <select
              value={quotationData.operadora}
              onChange={(e) => setQuotationData(prev => ({ ...prev, operadora: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecione a operadora</option>
              <option value="unimed">Unimed</option>
              <option value="bradesco">Bradesco Saúde</option>
              <option value="amil">Amil</option>
              <option value="sulamerica">SulAmérica</option>
              <option value="notredame">Notre Dame</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-white">
              Idades dos Beneficiários
            </label>
            <button
              onClick={addIdade}
              className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Idade
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quotationData.idades.map((idade, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={idade}
                  onChange={(e) => updateIdade(index, parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Idade"
                />
                {quotationData.idades.length > 1 && (
                  <button
                    onClick={() => removeIdade(index)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-white hover:bg-red-50 dark:hover:bg-red-800 dark:bg-red-900 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Seção Adicionar Nova Cotação */}
        <div className="border-t border-gray-200 dark:border-gray-700 dark:border-gray-600 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-white dark:text-white mb-6">Adicionar Nova Cotação</h3>
          
          {/* Campos da Nova Cotação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Operadora */}
            <div>
              <label className="block text-sm font-medium text-white dark:text-white mb-2">
                Operadora *
              </label>
              <select
                value={novaCotacao.operadora}
                onChange={(e) => setNovaCotacao(prev => ({ ...prev, operadora: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione a operadora</option>
                <option value="Amil">Amil</option>
                <option value="Bradesco">Bradesco</option>
                <option value="Sulamérica">Sulamérica</option>
                <option value="Porto Seguro">Porto Seguro</option>
                <option value="Omint">Omint</option>
                <option value="Careplus">Careplus</option>
                <option value="Hapvida">Hapvida</option>
                <option value="Alice">Alice</option>
                <option value="Seguros Unimed">Seguros Unimed</option>
              </select>
            </div>

            {/* Tipo do Plano */}
            <div>
              <label className="block text-sm font-medium text-white dark:text-white mb-2">
                Tipo do Plano *
              </label>
              <select
                value={novaCotacao.tipoplano}
                onChange={(e) => setNovaCotacao(prev => ({ ...prev, tipoplano: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o tipo</option>
                <option value="Empresarial">Empresarial</option>
                <option value="Individual">Individual</option>
                <option value="Adesão">Adesão</option>
                <option value="Familiar">Familiar</option>
              </select>
            </div>

            {/* Número de Vidas */}
            <div>
              <label className="block text-sm font-medium text-white dark:text-white mb-2">
                Número de Vidas *
              </label>
              <input
                type="number"
                min="1"
                value={novaCotacao.numeroVidas}
                onChange={(e) => setNovaCotacao(prev => ({ ...prev, numeroVidas: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-white dark:text-white mb-2">
                Valor (R$) *
              </label>
              <input
                type="text"
                value={novaCotacao.valor}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.,]/g, '');
                  setNovaCotacao(prev => ({ ...prev, valor: value }));
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 1.250,00"
              />
            </div>

            {/* Validade da Cotação */}
            <div>
              <label className="block text-sm font-medium text-white dark:text-white mb-2">
                Validade da Cotação *
              </label>
              <input
                type="date"
                value={novaCotacao.validade}
                onChange={(e) => setNovaCotacao(prev => ({ ...prev, validade: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Data de Envio */}
            <div>
              <label className="block text-sm font-medium text-white dark:text-white mb-2">
                Data de Envio *
              </label>
              <input
                type="date"
                value={novaCotacao.dataEnvio}
                onChange={(e) => setNovaCotacao(prev => ({ ...prev, dataEnvio: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Anexar Cotação */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white dark:text-white mb-4">Anexar Cotação</h4>
            
            {/* Área de Upload com Drag & Drop */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg p-8 text-center mb-4">
              <input
                type="file"
                multiple
                onChange={handleAnexarArquivo}
                className="hidden"
                id="file-upload-cotacao"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-upload-cotacao" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 dark:text-white mx-auto mb-4" />
                <p className="text-lg font-medium text-white dark:text-white mb-2">
                  Arraste arquivos aqui ou escolha uma opção
                </p>
                <p className="text-sm text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">
                  Suporte para PDF, DOC, DOCX, JPG, PNG - Sem limite de quantidade
                </p>
              </label>
            </div>

            {/* Botões de Upload */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <label htmlFor="file-upload-cotacao" className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <FileText className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Escolher Arquivo</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Do computador/celular</span>
              </label>

              <button
                onClick={tirarFoto}
                className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
              >
                <Camera className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Tirar Foto</span>
                <span className="text-xs text-green-500 dark:text-green-400">Câmera do dispositivo</span>
              </button>

              <label htmlFor="gallery-upload" className="flex flex-col items-center justify-center p-6 bg-purple-50 dark:bg-purple-900 border-2 border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAnexarArquivo}
                  className="hidden"
                  id="gallery-upload"
                />
                <Image className="w-8 h-8 text-purple-600 dark:text-white mb-2" />
                <span className="text-sm font-medium text-purple-600 dark:text-white">Da Galeria</span>
                <span className="text-xs text-purple-500 dark:text-white">Fotos salvas</span>
              </label>
            </div>

            {/* Arquivos anexados */}
            {novaCotacao.arquivos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-white dark:text-white">
                  Arquivos Anexados ({novaCotacao.arquivos.length})
                </p>
                <div className="space-y-2">
                  {novaCotacao.arquivos.map((arquivo, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-500 dark:text-white dark:text-gray-500 dark:text-white mr-2" />
                        <span className="text-sm text-white dark:text-white">{arquivo.name}</span>
                      </div>
                      <button
                        onClick={() => removerArquivoCotacao('', index)}
                        className="text-red-600 hover:text-red-800 dark:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botão Adicionar Cotação */}
            <div className="flex justify-end mt-6">
              <button
                onClick={salvarCotacao}
                className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cotação
              </button>
            </div>
          </div>

          {/* Seção Cotações Cadastradas */}
          {cotacoes.length > 0 && (
            <div className="bg-gray-800 dark:bg-gray-900 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-white dark:text-white mb-4">
                Cotações Cadastradas ({cotacoes.length})
              </h3>

              <div className="space-y-4">
                {cotacoes.map((cotacao) => (
                  <div key={cotacao.id} className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:border-gray-600">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-medium text-white dark:text-gray-500 dark:text-white">Operadora</span>
                        <p className="text-sm text-white dark:text-white">{cotacao.operadora}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white dark:text-gray-500 dark:text-white">Tipo do Plano</span>
                        <p className="text-sm text-white dark:text-white">{cotacao.tipoplano}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white dark:text-gray-500 dark:text-white">Nº de Vidas</span>
                        <p className="text-sm text-white dark:text-white">{cotacao.numeroVidas}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white dark:text-gray-500 dark:text-white">Valor</span>
                        <p className="text-sm text-white dark:text-white">R$ {cotacao.valor}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-medium text-white dark:text-gray-500 dark:text-white">Validade</span>
                        <p className="text-sm text-white dark:text-white">{cotacao.validade ? new Date(cotacao.validade).toLocaleDateString('pt-BR') : '-'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white dark:text-gray-500 dark:text-white">Data de Envio</span>
                        <p className="text-sm text-white dark:text-white">{new Date(cotacao.dataEnvio).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white dark:text-gray-500 dark:text-white">Arquivos Anexados</span>
                        <p className="text-sm text-white dark:text-white">{cotacao.arquivos.length} arquivo(s)</p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => enviarWhatsAppCotacao(cotacao)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white dark:bg-green-50 dark:bg-green-9000 dark:text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => removerCotacao(cotacao.id)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white dark:bg-red-50 dark:bg-red-9000 dark:text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={limparFormulario}
            className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Formulário
          </button>

          <button
            onClick={generateQuotation}
            className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Gerar Cotação
          </button>

          <button
            onClick={salvarCotacao}
            className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Salvar Cotação
          </button>
          
          <button
            onClick={downloadQuotation}
            className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Cotação
          </button>
        </div>
      </div>
    </div>
  );

  // Módulo de Cotações
  const renderCotacoesModule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white dark:text-white">Cotações</h1>
          <p className="text-white dark:text-gray-500 dark:text-white">Gerencie cotações para suas propostas</p>
        </div>
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center px-4 py-2 text-white dark:text-gray-500 dark:text-white hover:text-white dark:text-white hover:bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </button>
      </div>

      {/* Formulário para Nova Cotação */}
      <div className="bg-gray-800 dark:bg-gray-900 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white dark:text-white mb-6">Adicionar Nova Cotação</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Operadora */}
          <div>
            <label className="block text-sm font-medium text-white dark:text-white mb-2">
              Operadora *
            </label>
            <select
              value={novaCotacao.operadora}
              onChange={(e) => setNovaCotacao(prev => ({ ...prev, operadora: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione a operadora</option>
              <option value="Amil">Amil</option>
              <option value="Bradesco">Bradesco</option>
              <option value="Sulamérica">Sulamérica</option>
              <option value="Porto Seguro">Porto Seguro</option>
              <option value="Omint">Omint</option>
              <option value="Careplus">Careplus</option>
              <option value="Hapvida">Hapvida</option>
              <option value="Alice">Alice</option>
              <option value="Seguros Unimed">Seguros Unimed</option>
            </select>
          </div>

          {/* Tipo do Plano */}
          <div>
            <label className="block text-sm font-medium text-white dark:text-white mb-2">
              Tipo do Plano *
            </label>
            <select
              value={novaCotacao.tipoplano}
              onChange={(e) => setNovaCotacao(prev => ({ ...prev, tipoplano: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione o tipo</option>
              <option value="Empresarial">Empresarial</option>
              <option value="Individual">Individual</option>
              <option value="Adesão">Adesão</option>
              <option value="Familiar">Familiar</option>
            </select>
          </div>

          {/* Número de Vidas */}
          <div>
            <label className="block text-sm font-medium text-white dark:text-white mb-2">
              Número de Vidas *
            </label>
            <input
              type="number"
              min="1"
              value={novaCotacao.numeroVidas}
              onChange={(e) => setNovaCotacao(prev => ({ ...prev, numeroVidas: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 10"
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-white dark:text-white mb-2">
              Valor (R$) *
            </label>
            <input
              type="text"
              value={novaCotacao.valor}
              onChange={(e) => {
                // Permitir apenas números e vírgula/ponto
                const value = e.target.value.replace(/[^\d.,]/g, '');
                setNovaCotacao(prev => ({ ...prev, valor: value }));
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 1.250,00"
            />
          </div>

          {/* Validade */}
          <div>
            <label className="block text-sm font-medium text-white dark:text-white mb-2">
              Validade da Cotação *
            </label>
            <input
              type="date"
              value={novaCotacao.validade}
              onChange={(e) => setNovaCotacao(prev => ({ ...prev, validade: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Data de Envio */}
          <div>
            <label className="block text-sm font-medium text-white dark:text-white mb-2">
              Data de Envio *
            </label>
            <input
              type="date"
              value={novaCotacao.dataEnvio}
              onChange={(e) => setNovaCotacao(prev => ({ ...prev, dataEnvio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Upload de Arquivos Avançado */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-white dark:text-white mb-4">
            Anexar Cotação
          </label>
          
          {/* Área de Drag & Drop */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-gray-800 dark:bg-gray-900' 
                : 'border-gray-300 dark:border-gray-600 dark:border-gray-600 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 dark:text-white mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white dark:text-white mb-2">
              Arraste arquivos aqui ou escolha uma opção
            </h3>
            <p className="text-sm text-white dark:text-gray-500 dark:text-white mb-6">
              Suporte para PDF, DOC, DOCX, JPG, PNG - Sem limite de quantidade
            </p>

            {/* Botões de Upload */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Escolher Arquivo */}
              <label className="flex flex-col items-center p-4 bg-gray-800 dark:bg-gray-900 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors">
                <Paperclip className="w-6 h-6 text-blue-300 dark:text-blue-200 dark:text-blue-400 mb-2" />
                <span className="text-sm font-medium text-blue-700 dark:text-white">Escolher Arquivo</span>
                <span className="text-xs text-blue-300 dark:text-blue-200 dark:text-blue-400">Do computador/celular</span>
                <input
                  type="file"
                  multiple
                  onChange={handleArquivoCotacao}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </label>

              {/* Tirar Foto */}
              <button
                type="button"
                onClick={tirarFoto}
                className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Camera className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                <span className="text-sm font-medium text-green-700 dark:text-white">Tirar Foto</span>
                <span className="text-xs text-green-600 dark:text-green-400">Câmera do dispositivo</span>
              </button>

              {/* Upload da Galeria */}
              <label className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900 hover:bg-purple-100 rounded-lg cursor-pointer transition-colors">
                <Image className="w-6 h-6 text-purple-600 dark:text-white mb-2" />
                <span className="text-sm font-medium text-purple-700 dark:text-white">Da Galeria</span>
                <span className="text-xs text-purple-600 dark:text-white">Fotos salvas</span>
                <input
                  type="file"
                  multiple
                  onChange={handleArquivoCotacao}
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Arquivos Anexados na Nova Cotação */}
        {novaCotacao.arquivos.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-white dark:text-white mb-2">Arquivos Anexados:</h4>
            <div className="space-y-2">
              {novaCotacao.arquivos.map((arquivo, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500 dark:text-white dark:text-gray-500 dark:text-white" />
                    <span className="text-sm text-white dark:text-white">{arquivo.name}</span>
                    <span className="text-xs text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">({formatFileSize(arquivo.size)})</span>
                  </div>
                  <button 
                    onClick={() => removerArquivoCotacao('', index)}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-white hover:bg-red-50 dark:hover:bg-red-800 dark:bg-red-900 rounded"
                    title="Remover arquivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão Adicionar */}
        <div className="flex justify-end mt-6">
          <button
            onClick={adicionarCotacao}
            className="flex items-center px-6 py-2 bg-blue-800 dark:bg-blue-900 text-white dark:bg-gray-800 dark:bg-gray-9000 dark:text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Cotação
          </button>
        </div>
      </div>

      {/* Lista de Cotações */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white dark:text-white">
          Cotações Cadastradas ({cotacoes.length})
        </h2>
        
        {cotacoes.length === 0 ? (
          <div className="bg-gray-800 dark:bg-gray-900 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 dark:text-white mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white dark:text-white mb-2">Nenhuma cotação cadastrada</h3>
            <p className="text-white dark:text-gray-500 dark:text-white">Adicione sua primeira cotação usando o formulário acima.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cotacoes.map((cotacao) => (
              <div key={cotacao.id} className="bg-gray-800 dark:bg-gray-900 dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-white dark:text-white">Operadora</label>
                    <p className="text-sm text-white dark:text-white">{cotacao.operadora}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white dark:text-white">Tipo do Plano</label>
                    <p className="text-sm text-white dark:text-white">{cotacao.tipoplano}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white dark:text-white">Nº de Vidas</label>
                    <p className="text-sm text-white dark:text-white">{cotacao.numeroVidas}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white dark:text-white">Valor</label>
                    <p className="text-sm text-white dark:text-white">R$ {cotacao.valor}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-white dark:text-white">Validade</label>
                    <p className="text-sm text-white dark:text-white">
                      {new Date(cotacao.validade).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white dark:text-white">Data de Envio</label>
                    <p className="text-sm text-white dark:text-white">
                      {new Date(cotacao.dataEnvio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white dark:text-white">Arquivos Anexados</label>
                    <p className="text-sm text-white dark:text-white">{cotacao.arquivos.length} arquivo(s)</p>
                  </div>
                </div>

                {/* Arquivos da Cotação */}
                {cotacao.arquivos.length > 0 && (
                  <div className="mb-4">
                    <div className="space-y-2">
                      {cotacao.arquivos.map((arquivo, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-500 dark:text-white dark:text-gray-500 dark:text-white" />
                            <span className="text-sm text-white dark:text-white">{arquivo.name}</span>
                            <span className="text-xs text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">({formatFileSize(arquivo.size)})</span>
                          </div>
                          <button 
                            onClick={() => removerArquivoCotacao(cotacao.id, index)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-white hover:bg-red-50 dark:hover:bg-red-800 dark:bg-red-900 rounded"
                            title="Remover arquivo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => enviarWhatsAppCotacao(cotacao)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white dark:bg-green-50 dark:bg-green-9000 dark:text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => removerCotacao(cotacao.id)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white dark:bg-red-50 dark:bg-red-9000 dark:text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Removido - agora usa StatusBadge para cores uniformes

  const getStatusText = (status: string) => {
    switch (status) {
      case 'client_filling':
        return 'Cliente Preenchendo';
      case 'docs_pending':
        return 'Documentos Pendentes';
      case 'completed':
        return 'Finalizada';
      default:
        return 'Desconhecido';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'new-proposal':
        return <ProposalGenerator 
          onBack={() => setActiveView('dashboard')} 
          currentVendor={{
            id: user.id,
            name: user.name,
            email: user.email
          }}
        />;
      case 'tracker':
        return <ProposalTracker onBack={() => setActiveView('dashboard')} />;
      case 'quotations':
        return renderQuotationModule();
      default:
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.name}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                      <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                        <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'warning' ? 'text-yellow-600' : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setActiveView('new-proposal')}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 text-left group hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nova Proposta</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Criar proposta e cotações</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveView('tracker')}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 text-left group hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                    <BarChart3 className="w-6 h-6 text-purple-600 dark:text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Acompanhar</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status propostas</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveView('quotations')}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 text-left group hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Painel de Cotações</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Gerenciar cotações</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Recent Proposals */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-600 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Propostas Recentes ({realProposals?.length || 0})</h2>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  Atualização em tempo real • Suas propostas exclusivas
                </div>
              </div>
              <div className="overflow-x-auto">
                {realProposals?.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 dark:text-white mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma proposta criada</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Crie sua primeira proposta para começar a acompanhar o progresso.</p>
                    <button
                      onClick={() => setActiveView('new-proposal')}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Proposta
                    </button>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">
                          ID Único
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">
                          Plano
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">
                          Progresso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white dark:text-gray-500 dark:text-white uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 dark:bg-gray-900 dark:bg-gray-800 divide-y divide-gray-200">
                      {realProposals?.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((proposal) => (
                        <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 dark:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              onClick={() => window.open(`https://drive.google.com/drive/folders/${proposal.abmId}`, '_blank')}
                              className="text-sm font-bold text-blue-300 dark:text-blue-200 hover:text-blue-800 dark:text-white underline bg-gray-800 dark:bg-gray-900 px-2 py-1 rounded"
                              title="Abrir pasta no Google Drive"
                            >
                              {proposal.abmId}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-white dark:text-white">{proposal.cliente}</div>
                                <div className="text-sm text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">CNPJ: {proposal.contractData?.cnpj}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white dark:text-white">{proposal.plano}</div>
                            <div className="text-sm text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">R$ {proposal.valor}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge 
                              status={proposal.status}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">
                            <div className="text-sm text-white dark:text-white">
                              {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">
                              {new Date(proposal.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <ProgressBar 
                              proposal={proposal} 
                              size="md" 
                              orientation="horizontal"
                              showDetails={false}
                              className="w-full"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <ActionButtons 
                              onView={() => window.open(`${window.location.origin}/cliente/proposta/${proposal.clientToken}`, '_blank')}
                              onCopyLink={() => {
                                const link = `${window.location.origin}/cliente/proposta/${proposal.clientToken}`;
                                navigator.clipboard.writeText(link);
                                showNotification('Link copiado para área de transferência', 'success');
                              }}
                              onWhatsApp={() => {
                                const link = `${window.location.origin}/cliente/proposta/${proposal.clientToken}`;
                                const message = `🏥 *Proposta de Plano de Saúde*\n\nEmpresa: ${proposal.cliente}\nPlano: ${proposal.plano}\nValor: R$ ${proposal.valor}\n\n🔗 Link: ${link}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                              }}
                              onEmail={() => {
                                const link = `${window.location.origin}/cliente/proposta/${proposal.clientToken}`;
                                const subject = `Proposta de Plano - ${proposal.cliente}`;
                                const body = `Olá!\n\nSegue a proposta de plano de saúde:\n\nEmpresa: ${proposal.cliente}\nPlano: ${proposal.plano}\nValor: R$ ${proposal.valor}\n\nLink: ${link}`;
                                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                              }}
                              onMessage={() => setShowInternalMessage(true)}
                             onEdit={() => showNotification(`Editando proposta ${proposal.abmId}...`, 'info')}
                             onDelete={() => handleDeleteProposal(proposal.id, proposal.cliente)}
                              onExternalLink={() => window.open(`${window.location.origin}/cliente/proposta/${proposal.clientToken}`, '_blank')}
                              onDownload={() => showNotification('Baixando documentos da proposta...', 'success')}
                             onShare={() => {
                               const link = `${window.location.origin}/cliente/proposta/${proposal.clientToken}`;
                               navigator.clipboard.writeText(link);
                               showNotification('Link de compartilhamento copiado!', 'success');
                             }}
                             onSend={() => {
                               if (proposal.status === 'docs_pending') {
                                 showNotification('Enviando lembrete para o cliente...', 'success');
                               } else {
                                 showNotification('Enviando proposta para o financeiro...', 'success');
                               }
                             }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {realProposals?.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 dark:border-gray-600">
                  <div className="flex items-center justify-between text-sm text-white dark:text-gray-500 dark:text-white">
                    <span>
                      Mostrando {realProposals.length} proposta{realProposals.length !== 1 ? 's' : ''} sua{realProposals.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-50 dark:bg-green-9000 rounded-full mr-2 animate-pulse"></div>
                      Atualização automática ativa
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="/65be871e-f7a6-4f31-b1a9-cd0729a73ff8 copy copy.png" 
                  alt="Abmix" 
                  className="h-10 w-auto mr-3"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Portal Vendedor</h1>
                  <p className="text-sm text-gray-600">
                    Bem-vinda(o), <span className="font-medium text-teal-600">{user?.name || 'Vendedor'}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <NotificationCenter 
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDeleteNotification={handleDeleteNotification}
                  onClose={() => setShowNotifications(false)}
                />
              )}
              
              <button
                onClick={() => setShowInternalMessage(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              
              <span className="text-sm text-gray-600">Olá, {user.name}</span>
              
              <ThemeToggle />
              
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard do Vendedor</h1>
            <p className="text-gray-600 dark:text-gray-300">Gerencie suas propostas e acompanhe o progresso dos clientes</p>
          </div>
        )}
        
        {renderContent()}
      </main>

      {/* Modal de Visualização da Proposta */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 dark:bg-gray-900 dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white dark:text-white">
                  Detalhes da Proposta
                </h3>
                <button 
                  onClick={() => setSelectedProposal(null)}
                  className="text-gray-400 dark:text-gray-500 dark:text-white hover:text-white dark:text-gray-500 dark:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white dark:text-white border-b dark:border-gray-600 pb-2">Informações Básicas</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium text-white dark:text-white">ID:</span> <span className="ml-2">{selectedProposal.id}</span></div>
                      <div><span className="font-medium text-white dark:text-white">Cliente:</span> <span className="ml-2">{selectedProposal.client}</span></div>
                      <div><span className="font-medium text-white dark:text-white">CNPJ:</span> <span className="ml-2">{selectedProposal.cnpj}</span></div>
                      <div><span className="font-medium text-white dark:text-white">Plano:</span> <span className="ml-2">{selectedProposal.plan}</span></div>
                      <div><span className="font-medium text-white dark:text-white">Valor:</span> <span className="ml-2">{selectedProposal.value}</span></div>
                      <div><span className="font-medium text-white dark:text-white">Progresso:</span> <span className="ml-2">{selectedProposal.progress}%</span></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-white dark:text-white border-b pb-2">Contato</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium text-white dark:text-white">Email:</span> <span className="ml-2">{selectedProposal.email}</span></div>
                      <div><span className="font-medium text-white dark:text-white">Telefone:</span> <span className="ml-2">({selectedProposal.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')})</span></div>
                      <div><span className="font-medium text-white dark:text-white">Documentos:</span> <span className="ml-2">{selectedProposal.documents}</span></div>
                      <div><span className="font-medium text-white dark:text-white">Última Atividade:</span> <span className="ml-2">{selectedProposal.lastActivity}</span></div>
                    </div>
                  </div>
                </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-white dark:text-white border-b pb-2">Anexos</h4>
                <div className="space-y-2">
                  {selectedProposal.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded">
                          {attachment.type === 'pdf' ? (
                            <FileText className="w-4 h-4 text-blue-300 dark:text-blue-200 dark:text-blue-400" />
                          ) : (
                            <Image className="w-4 h-4 text-blue-300 dark:text-blue-200 dark:text-blue-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white dark:text-white">{attachment.name}</p>
                          <p className="text-xs text-gray-500 dark:text-white dark:text-gray-500 dark:text-white">{attachment.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = attachment.url;
                          link.download = attachment.name;
                          link.click();
                        }}
                        className="flex items-center px-3 py-1 text-sm bg-blue-800 dark:bg-blue-900 text-white dark:bg-gray-800 dark:bg-gray-9000 dark:text-white rounded hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Baixar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 p-4 rounded-lg">
                  <span className="font-medium text-white dark:text-white">Link do Cliente:</span>
                  <div className="flex items-center mt-2 space-x-2">
                    <input
                      type="text"
                      value={selectedProposal.link}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md text-sm bg-gray-800 dark:bg-gray-900 dark:bg-gray-800"
                    />
                    <button
                      onClick={() => handleCopyLink(selectedProposal.link)}
                      className="px-3 py-2 bg-blue-800 dark:bg-blue-900 text-white dark:bg-gray-800 dark:bg-gray-9000 dark:text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setSelectedProposal(null)}
                    className="px-4 py-2 text-sm font-medium text-white dark:text-white bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:bg-gray-600"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => window.open(`mailto:${selectedProposal.email}?subject=Proposta de Plano de Saúde&body=Olá! Segue o link da proposta: ${selectedProposal.link}`)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                    title="Enviar email para o cliente"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email
                  </button>
                  <button
                    onClick={() => window.open(`https://wa.me/55${selectedProposal.phone}?text=${encodeURIComponent(`Olá! Segue o link da proposta: ${selectedProposal.link}`)}`)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    title="Enviar mensagem via WhatsApp"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Enviar WhatsApp
                  </button>
                  <button
                    onClick={() => window.open(`https://drive.google.com/drive/folders/client-${selectedProposal.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, '_blank')}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
                    title="Ver documentos no Google Drive"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Ver no Drive
                  </button>
                  <button
                    onClick={() => window.open(selectedProposal.link, '_blank')}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-800 dark:bg-blue-900 rounded-md hover:bg-blue-700"
                    title="Abrir link da proposta"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Internal Message Modal */}
      {showInternalMessage && (
        <InternalMessage 
          isOpen={showInternalMessage}
          onClose={() => setShowInternalMessage(false)}
          currentUser={{
            name: user.name,
            role: 'vendor'
          }}
        />
      )}
      
      {/* System Footer */}
      <SystemFooter />
    </div>
  );
};

export default VendorPortal;