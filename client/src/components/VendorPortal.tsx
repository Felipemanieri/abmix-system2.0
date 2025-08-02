import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Users, FileText, Link, Eye, BarChart3, Clock, CheckCircle, AlertCircle, XCircle, Copy, ExternalLink, Download, Search, Filter, ArrowLeft, Home, Bell, Calculator, Target, TrendingUp, DollarSign, X, Mail, Image, MessageSquare, MessageCircle, Trash2, Camera, Upload, Paperclip, User, Award } from 'lucide-react';
// import AbmixLogo from './AbmixLogo';
import ActionButtons from './ActionButtons';
import AdvancedInternalMessage from './AdvancedInternalMessage';
import MessageNotificationBadge from './MessageNotificationBadge';
import ProposalEditor from './ProposalEditor';
import NotificationCenter from './NotificationCenter';
import { WelcomeMessage } from './WelcomeMessage';

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
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import StatusManager, { ProposalStatus } from '@shared/statusSystem';
import { getDynamicGreeting } from '../utils/greetingHelper';
import { globalSyncConfig } from '@/utils/globalSyncConfig';
import { useVendorWebSocket } from '@/hooks/useWebSocket';

interface VendorPortalProps {
  user: any;
  onLogout: () => void;
}

type VendorView = 'dashboard' | 'new-proposal' | 'tracker' | 'clients' | 'spreadsheet' | 'quotation' | 'cotacoes' | 'quotations' | 'edit-proposal' | 'metas' | 'premiacoes';

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
  
  // WEBSOCKET TEMPORARIAMENTE DESABILITADO - corrigindo múltiplas conexões
  // const { isConnected: isWebSocketConnected } = useVendorWebSocket(user.id);
  const isWebSocketConnected = false;
  
  // Hook para propostas do vendedor
  const { proposals: realProposals, isLoading: proposalsLoading } = useVendorProposals(user?.id || 0);
  // useRealTimeProposals(user?.id); // DESABILITADO - causando erros repetidos
  
  // Hook para exclusão de propostas
  const deleteProposal = useDeleteProposal();

  // Função para excluir proposta diretamente (sem confirmação do navegador)
  const handleDeleteProposal = async (proposalId: string, cliente: string) => {
    console.log('🗑️ VENDEDOR: Excluindo proposta SEM confirmação do navegador:', proposalId, cliente);
    try {
      await deleteProposal.mutateAsync(proposalId);
      showNotification('Proposta excluída com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao excluir proposta:', error);
      showNotification('Erro ao excluir proposta. Tente novamente.', 'error');
    }
  };

  // Função para abrir proposta (botão olho)
  const handleViewProposal = (proposal: any) => {
    console.log('🔍 VENDEDOR - handleViewProposal chamado:', proposal);
    console.log('🔗 Token do cliente:', proposal.clientToken);
    const clientUrl = `${window.location.origin}/cliente/proposta/${proposal.clientToken}`;
    console.log('🌐 URL a ser aberta:', clientUrl);
    window.open(clientUrl, '_blank');
    showNotification(`Abrindo proposta de ${proposal.contractData?.nomeEmpresa || proposal.cliente}`, 'info');
  };

  // Função para copiar link
  const handleCopyLink = (proposal: any) => {
    console.log('📋 VENDEDOR - handleCopyLink chamado:', proposal);
    console.log('🔗 Token do cliente:', proposal.clientToken);
    console.log('🌐 window.location.origin:', window.location.origin);
    
    // Verificar se o clientToken existe
    if (!proposal.clientToken) {
      console.error('❌ Token do cliente não encontrado na proposta');
      showNotification('Erro: Token do cliente não encontrado', 'error');
      return;
    }
    
    const link = `${window.location.origin}/cliente/proposta/${proposal.clientToken}`;
    console.log('📄 Link completo a ser copiado:', link);
    
    try {
      // Usar fallback para navegadores mais antigos
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => {
          showNotification(`Link da proposta ${proposal.contractData?.nomeEmpresa || proposal.cliente} copiado!`, 'success');
          console.log('✅ Link copiado com sucesso via navigator.clipboard:', link);
        }).catch((error) => {
          console.error('❌ Erro ao copiar via clipboard API:', error);
          fallbackCopyTextToClipboard(link);
        });
      } else {
        fallbackCopyTextToClipboard(link);
      }
    } catch (error) {
      console.error('❌ Erro geral ao copiar link:', error);
      fallbackCopyTextToClipboard(link);
    }
  };

  // Função fallback para copiar texto
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showNotification('Link copiado para área de transferência!', 'success');
        console.log('✅ Link copiado com sucesso via fallback:', text);
      } else {
        showNotification('Erro ao copiar link. Tente manualmente.', 'error');
        console.error('❌ Falha no execCommand copy');
      }
    } catch (err) {
      showNotification('Erro ao copiar link. Tente manualmente.', 'error');
      console.error('❌ Erro no fallback copy:', err);
    }
    
    document.body.removeChild(textArea);
  };

  // Função para enviar via WhatsApp
  const handleWhatsAppShare = (proposal: any) => {
    const link = `${window.location.origin}/cliente/proposta/${proposal.clientToken}`;
    const message = `🏥 *Proposta de Plano de Saúde*\n\nEmpresa: ${proposal.cliente}\nPlano: ${proposal.contractData?.planoContratado || proposal.plano}\nValor: R$ ${proposal.contractData?.valor || proposal.valor}\n\n🔗 Complete sua proposta: ${link}\n\n_Atenciosamente, ${user.name}_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    showNotification(`Compartilhando proposta de ${proposal.cliente} via WhatsApp`, 'success');
  };

  // Função para enviar via email
  const handleEmailShare = (proposal: any) => {
    const link = `${window.location.origin}/cliente/proposta/${proposal.clientToken}`;
    const subject = `Proposta de Plano de Saúde - ${proposal.cliente}`;
    const body = `Prezado(a) cliente,

Segue sua proposta de plano de saúde:

📋 Detalhes da Proposta:
• Empresa: ${proposal.cliente}
• Plano: ${proposal.contractData?.planoContratado || proposal.plano}
• Valor: R$ ${proposal.contractData?.valor || proposal.valor}
• ID: ${proposal.abmId}

🔗 Para completar sua proposta, acesse: ${link}

Caso tenha dúvidas, estou à disposição.

Atenciosamente,
${user.name}
Vendedor Abmix`;

    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    showNotification(`Enviando proposta de ${proposal.cliente} por email`, 'success');
  };

  // Função para mensagem interna com proposta anexada
  const handleInternalMessage = (proposal: any) => {
    setSelectedProposalForMessage(proposal);
    setShowInternalMessage(true);
  };

  // Função para editar proposta
  const handleEditProposal = (proposal: any) => {
    setEditingProposal(proposal);
    setActiveView('edit-proposal');
    showNotification(`Editando proposta ${proposal.abmId}`, 'info');
  };
  const [showNotifications, setShowNotifications] = useState(false);
  
  // DESABILITAR TODAS AS NOTIFICAÇÕES DO VENDOR PORTAL
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // FORÇAR NOTIFICAÇÕES VAZIAS SEMPRE
    setNotifications([]);
    // Notificações removidas
  }, [user.name]);
  const [showInternalMessage, setShowInternalMessage] = useState(false);
  const [selectedProposalForMessage, setSelectedProposalForMessage] = useState(null);
  const [editingProposal, setEditingProposal] = useState(null);
  const [showLinkCopyModal, setShowLinkCopyModal] = useState(false);
  const [currentProposalLink, setCurrentProposalLink] = useState('');
  const [statusManagerInstance] = useState(() => StatusManager);
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
        statusMap.set(proposal.id, StatusManager.getStatus(proposal.id));
      });
      setProposalStatuses(statusMap);
    };

    initializeStatuses();

    const handleStatusChange = (proposalId: string, newStatus: ProposalStatus) => {
      setProposalStatuses(prev => new Map(prev.set(proposalId, newStatus)));
    };

    StatusManager.subscribe(handleStatusChange);

    return () => {
      StatusManager.unsubscribe(handleStatusChange);
    };
  }, []);

  // Sistema de notificações já definido acima

  // FORÇAR LIMPEZA TOTAL AO CARREGAR
  useEffect(() => {
    localStorage.removeItem('internalMessages');
    localStorage.removeItem('notifications');
    localStorage.removeItem('userNotifications');
    setNotifications([]);
    console.log('NOTIFICAÇÕES COMPLETAMENTE LIMPAS PARA:', user.name);
  }, [user.name]);

  // DESABILITADO: Sistema de notificações automáticas
  // Não carregar nenhuma mensagem automaticamente
  useEffect(() => {
    // FORÇAR NOTIFICAÇÕES VAZIAS SEMPRE
    setNotifications([]);
    // Notificações removidas
  }, [user.name]);

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
    // SISTEMA CORRIGIDO: Marcar mensagem como lida e REMOVER da lista de notificações
    try {
      const storedMessages = localStorage.getItem('internalMessages');
      if (storedMessages) {
        const messages = JSON.parse(storedMessages);
        const updatedMessages = messages.map((msg: any) => 
          msg.id === id ? { ...msg, read: true } : msg
        );
        localStorage.setItem('internalMessages', JSON.stringify(updatedMessages));
        console.log(`Mensagem ${id} marcada como lida para ${user.name}`);
      }
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
    
    // REMOVER completamente da lista de notificações
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleMarkAllAsRead = () => {
    // SISTEMA CORRIGIDO: Marcar todas como lidas e LIMPAR lista de notificações
    try {
      const storedMessages = localStorage.getItem('internalMessages');
      if (storedMessages) {
        const messages = JSON.parse(storedMessages);
        const updatedMessages = messages.map((msg: any) => 
          msg.recipient === user.name ? { ...msg, read: true } : msg
        );
        localStorage.setItem('internalMessages', JSON.stringify(updatedMessages));
        console.log(`Todas as mensagens de ${user.name} marcadas como lidas`);
      }
    } catch (error) {
      console.error('Erro ao marcar todas as mensagens como lidas:', error);
    }
    
    // LIMPAR completamente a lista de notificações
    setNotifications([]);
  };

  const handleDeleteNotification = (id: string) => {
    // SISTEMA CORRIGIDO: Deletar mensagem completamente
    try {
      const storedMessages = localStorage.getItem('internalMessages');
      if (storedMessages) {
        const messages = JSON.parse(storedMessages);
        const updatedMessages = messages.filter(msg => msg.id !== id);
        localStorage.setItem('internalMessages', JSON.stringify(updatedMessages));
        console.log(`Mensagem ${id} deletada completamente`);
      }
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
    }
    
    // REMOVER da lista de notificações
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Hook para buscar metas do vendedor - Sistema híbrido WebSocket + polling
  const { data: vendorTargets = [], isLoading: vendorTargetsLoading } = useQuery({
    queryKey: ['/api/vendor-targets'],
    queryFn: () => apiRequest('/api/vendor-targets'),
    refetchInterval: globalSyncConfig.getReactQueryInterval(isWebSocketConnected),
  });

  // Hook para buscar metas de equipe - Sistema híbrido WebSocket + polling
  const { data: teamTargets = [], isLoading: teamTargetsLoading } = useQuery({
    queryKey: ['/api/team-targets'],
    queryFn: () => apiRequest('/api/team-targets'),
    refetchInterval: globalSyncConfig.getReactQueryInterval(isWebSocketConnected),
  });

  // Hook para buscar premiações - Sistema híbrido WebSocket + polling
  const { data: awards = [], isLoading: awardsLoading } = useQuery({
    queryKey: ['/api/awards'],
    queryFn: () => apiRequest('/api/awards'),
    refetchInterval: globalSyncConfig.getReactQueryInterval(isWebSocketConnected),
  });

  // Filtrar apenas as metas individuais DO VENDEDOR LOGADO E PEGAR APENAS A MAIS RECENTE
  const myVendorTargets = vendorTargets
    .filter(target => target.vendorId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 1); // APENAS 1 META - A MAIS RECENTE

  // Filtrar apenas as premiações DO VENDEDOR LOGADO - SEGURANÇA TOTAL
  const myAwards = awards.filter(award => award.vendorId === user.id);
  
  // Debug: Log para verificar filtros
  console.log('🎯 DEBUG METAS VENDEDOR:');
  console.log('User ID:', user.id);
  console.log('Todas as metas:', vendorTargets);
  console.log('APENAS A META MAIS RECENTE:', myVendorTargets);
  console.log('🏆 DEBUG PREMIAÇÕES VENDEDOR:');
  console.log('Todas as premiações:', awards);
  console.log('PREMIAÇÕES DO VENDEDOR:', myAwards);

  // Função para calcular valor acumulado total de vendas implantadas
  const calculateAccumulatedValue = (vendorId?: number) => {
    if (!realProposals || realProposals.length === 0) {
      console.log('💰 DEBUG VALOR ACUMULADO: Nenhuma proposta encontrada');
      return 0;
    }
    
    // Se vendorId é fornecido, filtrar apenas propostas desse vendedor
    // Se não, calcular para toda a equipe
    const filteredProposals = vendorId 
      ? realProposals.filter(p => p.vendorId === vendorId && p.status === 'implantado')
      : realProposals.filter(p => p.status === 'implantado');
    
    console.log('💰 DEBUG VALOR ACUMULADO:');
    console.log('VendorId solicitado:', vendorId);
    console.log('User ID atual:', user.id);
    console.log('Total propostas no sistema:', realProposals.length);
    console.log('Propostas filtradas (implantadas):', filteredProposals.length);
    console.log('Propostas filtradas:', filteredProposals.map(p => ({
      id: p.id,
      vendorId: p.vendorId,
      status: p.status,
      valor: p.contractData?.valor,
      empresa: p.contractData?.empresa
    })));
    
    // Calcular valor total das vendas implantadas
    const totalValue = filteredProposals.reduce((sum, proposal) => {
      const rawValue = proposal.contractData?.valor || '0';
      const cleanValue = rawValue.replace(/[^0-9,]/g, '').replace(',', '.');
      const value = parseFloat(cleanValue);
      console.log(`Proposta ${proposal.id}: valor bruto="${rawValue}" → limpo="${cleanValue}" → número=${value}`);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    
    console.log('Valor total calculado:', totalValue);
    return totalValue;
  };

  // Função para calcular progresso das metas
  const calculateMetaProgress = (targetValue: string, targetProposals: number, vendorId: number) => {
    if (!realProposals || realProposals.length === 0) return { valueProgress: 0, proposalProgress: 0 };
    
    // Filtrar propostas implantadas do vendedor específico
    const vendorImplantedProposals = realProposals.filter(p => 
      p.vendorId === vendorId && p.status === 'implantado'
    );
    
    // Calcular valor total das vendas implantadas
    const totalValue = vendorImplantedProposals.reduce((sum, proposal) => {
      const value = parseFloat(proposal.contractData?.valor?.replace(/[^0-9,]/g, '').replace(',', '.') || '0');
      return sum + value;
    }, 0);
    
    // Calcular progresso de valor (%)
    const targetValueNumber = parseFloat(targetValue.replace(/[^0-9,]/g, '').replace(',', '.') || '0');
    const valueProgress = targetValueNumber > 0 ? Math.min((totalValue / targetValueNumber) * 100, 100) : 0;
    
    // Calcular progresso de propostas (%)
    const proposalProgress = targetProposals > 0 ? Math.min((vendorImplantedProposals.length / targetProposals) * 100, 100) : 0;
    
    return { valueProgress, proposalProgress };
  };

  // Função para renderizar premiações do vendedor
  const renderVendorPremiacoes = () => (
    <div className="space-y-6">
      {/* Header */}
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
        <div className="flex items-center mb-4">
          <Award className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suas Premiações</h1>
            <p className="text-gray-600 dark:text-gray-300">Acompanhe suas premiações e reconhecimentos</p>
          </div>
        </div>

        {/* Premiações do Vendedor com Valor Acumulado e Meta */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Super Premiação - Progresso ({myAwards.length})</h3>
          
          {myAwards.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma premiação encontrada
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Suas premiações aparecerão aqui quando forem atribuídas pelo supervisor.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-white dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor Acumulado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Meta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor Premiação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Progresso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {myAwards.map((award) => {
                    // Calcular valor acumulado das propostas implantadas do vendedor
                    const accumulatedValue = calculateAccumulatedValue(user.id);
                    
                    // Obter meta target se disponível
                    const targetValue = award.targetValue ? 
                      parseFloat(award.targetValue.replace(/[^0-9,]/g, '').replace(',', '.')) : 0;
                    
                    // Calcular progresso percentual
                    const progressPercentage = targetValue > 0 ? 
                      Math.min((accumulatedValue / targetValue) * 100, 100) : 0;
                    
                    // Determinar cor da barra de progresso
                    const getProgressColor = (percentage: number) => {
                      if (percentage >= 100) return 'bg-green-500 dark:bg-green-600';
                      if (percentage >= 75) return 'bg-yellow-500 dark:bg-yellow-600';
                      if (percentage >= 50) return 'bg-orange-500 dark:bg-orange-600';
                      return 'bg-red-500 dark:bg-red-600';
                    };

                    return (
                      <tr key={award.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            award.type === 'monetary' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                            award.type === 'recognition' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          }`}>
                            {award.type === 'monetary' ? 'Monetária' : 
                             award.type === 'recognition' ? 'Reconhecimento' : 'Bônus'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {award.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {award.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-600 dark:text-green-400">
                            R$ {accumulatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Vendas implantadas
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {award.targetValue ? `R$ ${award.targetValue}` : 'Não definida'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Meta supervisor
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            {award.value ? `R$ ${award.value}` : '-'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Valor da premiação
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {targetValue > 0 ? (
                            <div className="w-full">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-900 dark:text-white">
                                  {progressPercentage.toFixed(1)}%
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  R$ {(targetValue - accumulatedValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} restantes
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
                                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-center mt-1 text-gray-600 dark:text-gray-300">
                                {progressPercentage >= 100 ? '🎉 Meta atingida!' : 
                                 progressPercentage >= 75 ? '🔥 Quase lá!' :
                                 progressPercentage >= 50 ? '💪 No caminho!' : '📈 Continue!'}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Meta não definida
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            progressPercentage >= 100 ? 
                              'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                            progressPercentage >= 50 ? 
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                              'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          }`}>
                            {progressPercentage >= 100 ? 'Concluída' : 
                             progressPercentage >= 50 ? 'Em Progresso' : 'Iniciando'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Função para renderizar metas do vendedor
  const renderVendorMetas = () => (
    <div className="space-y-6">
      {/* Header */}
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
        <div className="flex items-center mb-4">
          <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suas Metas</h1>
            <p className="text-gray-600 dark:text-gray-300">Acompanhe seu progresso individual e da equipe</p>
          </div>
        </div>
      </div>

      {/* Metas Individuais - SOMENTE DO VENDEDOR LOGADO */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <User className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Meta Individual</h2>
        </div>

        {vendorTargetsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Carregando suas metas...</p>
          </div>
        ) : myVendorTargets.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma meta definida</h3>
            <p className="text-gray-600 dark:text-gray-400">Suas metas individuais aparecerão aqui quando definidas pelo supervisor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Período</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Valor Acumulado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Meta Valor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Meta Propostas</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Bônus</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Progresso</th>
                </tr>
              </thead>
              <tbody>
                {myVendorTargets.map((target) => {
                  const { valueProgress, proposalProgress } = calculateMetaProgress(target.targetValue, target.targetProposals, user.id);
                  const overallProgress = Math.max(valueProgress, proposalProgress);
                  
                  return (
                    <tr key={target.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(target.year, target.month - 1).toLocaleDateString('pt-BR', { 
                            month: 'short', 
                            year: 'numeric' 
                          }).replace('.', '')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">(mais recente)</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          R$ {calculateAccumulatedValue(user.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">vendas implantadas</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          R$ {parseFloat(target.targetValue.replace(/[^0-9,]/g, '').replace(',', '.')).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900 dark:text-white">{target.targetProposals}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          R$ {parseFloat(target.bonus.replace(/[^0-9,]/g, '').replace(',', '.')).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                              <span>Progresso</span>
                              <span>{overallProgress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  overallProgress >= 100 ? 'bg-green-500 dark:bg-green-600' :
                                  overallProgress >= 70 ? 'bg-yellow-500 dark:bg-yellow-600' :
                                  'bg-red-500 dark:bg-red-600'
                                }`}
                                style={{ width: `${Math.min(overallProgress, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            overallProgress >= 100 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            overallProgress >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {overallProgress.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Metas da Equipe - TODAS AS METAS DE EQUIPE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Metas da Equipe</h2>
        </div>

        {teamTargetsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Carregando metas da equipe...</p>
          </div>
        ) : teamTargets.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma meta de equipe definida</h3>
            <p className="text-gray-600 dark:text-gray-400">As metas da equipe aparecerão aqui quando definidas pelo supervisor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Período</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Valor Acumulado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Meta Valor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Meta Propostas</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Bônus da Equipe</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Progresso</th>
                </tr>
              </thead>
              <tbody>
                {teamTargets.map((target) => {
                  // Calcular progresso da equipe baseado em todas as propostas implantadas de todos os vendedores
                  const allImplantedProposals = realProposals?.filter(p => p.status === 'implantado') || [];
                  const totalTeamValue = allImplantedProposals.reduce((sum, proposal) => {
                    const value = parseFloat(proposal.contractData?.valor?.replace(/[^0-9,]/g, '').replace(',', '.') || '0');
                    return sum + value;
                  }, 0);
                  
                  const targetValueNumber = parseFloat(target.targetValue.replace(/[^0-9,]/g, '').replace(',', '.') || '0');
                  const teamValueProgress = targetValueNumber > 0 ? Math.min((totalTeamValue / targetValueNumber) * 100, 100) : 0;
                  const teamProposalProgress = target.targetProposals > 0 ? Math.min((allImplantedProposals.length / target.targetProposals) * 100, 100) : 0;
                  
                  // Priorizar valor das vendas, mas permitir que propostas compensem se valor for baixo
                  const teamOverallProgress = teamValueProgress >= 50 
                    ? teamValueProgress 
                    : Math.max(teamValueProgress, teamProposalProgress);
                  
                  return (
                    <tr key={target.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(target.year, target.month - 1).toLocaleDateString('pt-BR', { 
                            month: 'short', 
                            year: 'numeric' 
                          }).replace('.', '')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-green-600 dark:text-green-400">
                          R$ {calculateAccumulatedValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">vendas da equipe</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          R$ {parseFloat(target.targetValue.replace(/[^0-9,]/g, '').replace(',', '.')).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900 dark:text-white">{target.targetProposals}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          R$ {parseFloat(target.teamBonus.replace(/[^0-9,]/g, '').replace(',', '.')).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                              <span>Progresso</span>
                              <span>{teamOverallProgress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  teamOverallProgress >= 100 ? 'bg-green-500 dark:bg-green-600' :
                                  teamOverallProgress >= 70 ? 'bg-yellow-500 dark:bg-yellow-600' :
                                  'bg-red-500 dark:bg-red-600'
                                }`}
                                style={{ width: `${Math.min(teamOverallProgress, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            teamOverallProgress >= 100 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            teamOverallProgress >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {teamOverallProgress.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );



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

        {/* Botões de Ação - 5 botões incluindo Adicionar Cotação */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={adicionarCotacao}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Cotação
          </button>
          <button
            onClick={limparFormulario}
            className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <X className="w-5 h-5 mr-2" />
            Limpar Formulário
          </button>
          <button
            onClick={generateQuotation}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Gerar Cotação
          </button>
          <button
            onClick={salvarCotacao}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Salvar Cotação
          </button>
          <button
            onClick={downloadQuotation}
            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Download className="w-5 h-5 mr-2" />
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
      case 'metas':
        return renderVendorMetas();
      case 'premiacoes':
        return renderVendorPremiacoes();
      case 'edit-proposal':
        return editingProposal ? (
          <ProposalEditor 
            proposalId={editingProposal.id}
            onBack={() => {
              setActiveView('dashboard');
              setEditingProposal(null);
            }}
            onSave={(data) => {
              // Implementar salvamento da proposta editada
              showNotification('Proposta atualizada com sucesso!', 'success');
              setActiveView('dashboard');
              setEditingProposal(null);
            }}
            user={user}
          />
        ) : null;
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                onClick={() => setActiveView('metas')}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 text-left group hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                    <Target className="w-6 h-6 text-purple-600 dark:text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Acompanhar Metas</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Suas metas individuais e equipe</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveView('premiacoes')}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 text-left group hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full group-hover:bg-yellow-200 transition-colors">
                    <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Acompanhar Super Premiação</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Suas premiações e reconhecimentos</p>
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
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          ID ÚNICO
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          EMPRESA
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          CNPJ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          PLANO
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          STATUS
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          DATA
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          PROGRESSO
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          AÇÕES
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {realProposals?.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((proposal) => (
                        <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              onClick={() => window.open(`https://drive.google.com/drive/folders/${proposal.abmId}`, '_blank')}
                              className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded"
                              title="Abrir pasta no Google Drive"
                            >
                              {proposal.abmId}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {proposal.contractData?.nomeEmpresa || proposal.cliente}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-300">
                              {proposal.contractData?.cnpj || 'Não informado'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{proposal.contractData?.planoContratado || proposal.plano}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">R$ {proposal.contractData?.valor || proposal.valor}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge 
                              status={proposal.status as ProposalStatus}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
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
                            <div className="flex items-center space-x-2">
                              {/* INDICADOR DE APROVAÇÃO/REJEIÇÃO SINCRONIZADO EM TEMPO REAL - SOMENTE SÍMBOLOS */}
                              {proposal.approved ? (
                                <span
                                  className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full animate-pulse hover:bg-green-200 transition-colors cursor-pointer"
                                  title="Proposta Aprovada pelo Portal de Implementação"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </span>
                              ) : proposal.rejected ? (
                                <span
                                  className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full animate-pulse hover:bg-red-200 transition-colors cursor-pointer"
                                  title="Proposta Rejeitada"
                                >
                                  <XCircle className="w-4 h-4" />
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-colors cursor-pointer"
                                  title="Aguardando Aprovação"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </span>
                              )}
                              
                              <ActionButtons 
                                onView={() => handleViewProposal(proposal)}
                                onCopyLink={() => handleCopyLink(proposal)}
                                onWhatsApp={() => handleWhatsAppShare(proposal)}
                                onEmail={() => handleEmailShare(proposal)}
                                onMessage={() => handleInternalMessage(proposal)}
                                onEdit={() => handleEditProposal(proposal)}
                                onDelete={() => handleDeleteProposal(proposal.id, proposal.cliente)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {realProposals?.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-300">
                    <span>
                      Mostrando {realProposals.length} proposta{realProposals.length !== 1 ? 's' : ''} sua{realProposals.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-2 animate-pulse"></div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
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
                  <WelcomeMessage 
                    userName={user?.name}
                    userEmail={user?.email} 
                    className="mb-1"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Gerencie suas propostas e acompanhe o progresso dos clientes</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Badge de notificações de mensagens */}
              <MessageNotificationBadge 
                userEmail={user?.email} 
                onMessagesView={() => setShowInternalMessage(true)}
              />
              
              <ThemeToggle />
              
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
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

export default VendorPortal;