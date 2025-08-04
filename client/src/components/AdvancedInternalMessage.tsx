import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Users, 
  X, 
  Inbox, 
  Trash2, 
  Download,
  ExternalLink,
  Mail,
  Phone,
  Eye,
  Edit,
  Calendar,
  Building2,
  User,
  FileText,
  DollarSign,
  Hash,
  ChevronDown,
  ChevronUp,
  Archive,
  UserCheck,
  Settings,
  CheckCircle
} from 'lucide-react';

interface InternalMessage {
  id: number;
  from: string;
  to: string;
  subject: string;
  message: string;
  attachedProposal?: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

interface ProposalData {
  id: string;
  abmId?: string;
  contractId?: string;
  vendorId?: string;
  vendor?: string;
  vendorName?: string;
  contractData?: {
    nomeEmpresa?: string;
    empresa?: string;
    razaoSocial?: string;
    cnpj?: string;
    cnpjEmpresa?: string;
    valor?: string;
    valorContrato?: string;
    valorProposta?: string;
    plano?: string;
    planoContratado?: string;
    tipoPlano?: string;
    vendedor?: string;
    vendorName?: string;
  };
  internalData?: {
    vendedorResponsavel?: string;
  };
  status?: string;
  createdAt?: string;
  actions?: any[];
  clientLink?: string;
}

interface User {
  id?: string;
  name: string;
  email: string;
  type: 'system' | 'vendor';
  role?: string;
}

interface AdvancedInternalMessageProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    email: string;
  };
  attachedProposal?: ProposalData | null;
}

export default function AdvancedInternalMessage({
  isOpen,
  onClose,
  currentUser,
  attachedProposal
}: AdvancedInternalMessageProps) {
  const [activeTab, setActiveTab] = useState<'compose' | 'inbox' | 'sent'>('compose');
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  
  // Debug para monitorar mudanças no selectedPanel
  console.log('🔄 ESTADO selectedPanel atual:', selectedPanel);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedMessageForActions, setSelectedMessageForActions] = useState<InternalMessage | null>(null);
  const [showProposalDetails, setShowProposalDetails] = useState(false);
  
  // SISTEMA DE NOTIFICAÇÕES INTERNAS
  const [internalNotifications, setInternalNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    timestamp: number;
  }>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Função para mostrar notificação no painel em vez do navegador
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: Date.now()
    };
    
    setInternalNotifications(prev => [...prev, notification]);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
      setInternalNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Buscar usuários da Gestão Unificada de Usuários (mesmo endpoint usado na Área Restrita)
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/auth/users'],
    queryFn: async () => {
      const response = await fetch('/api/auth/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: isOpen, // Só buscar quando modal aberto
    refetchOnWindowFocus: false, // Não refetch automaticamente
    staleTime: 10 * 60 * 1000 // 10 minutos - dados de usuários são estáticos
  });

  // Buscar mensagens do inbox - USAR URL CORRETA
  const { data: inboxMessages = [], isLoading: isLoadingInbox, refetch: refetchInboxMessages } = useQuery<InternalMessage[]>({
    queryKey: ['/api/messages/inbox', currentUser.email],
    queryFn: async () => {
      console.log('📬 BUSCANDO MENSAGENS INBOX REACT QUERY:', currentUser.email);
      const response = await fetch(`/api/messages/inbox/${currentUser.email}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar mensagens do inbox');
      }
      const data = await response.json();
      console.log('📬 MENSAGENS INBOX RECEBIDAS:', data.length, 'mensagens');
      
      // AUTO-MARCAR MENSAGENS COMO LIDAS QUANDO O PAINEL É ABERTO
      if (activeTab === 'inbox' && data.length > 0) {
        data.forEach(async (message: InternalMessage) => {
          if (!message.read) {
            try {
              await fetch(`/api/messages/${message.id}/read`, { method: 'PUT' });
              console.log(`✅ Mensagem ${message.id} marcada como lida automaticamente`);
            } catch (error) {
              console.error('Erro ao marcar mensagem como lida:', error);
            }
          }
        });
      }
      
      return data;
    },
    enabled: isOpen && activeTab === 'inbox',
    refetchOnWindowFocus: false,
    staleTime: 5000 // 5 segundos - atualizar mais frequentemente para notificações
  });

  // Buscar mensagens enviadas - USAR URL CORRETA
  const { data: sentMessages = [], isLoading: isLoadingSent, refetch: refetchSentMessages } = useQuery<InternalMessage[]>({
    queryKey: ['/api/messages/sent', currentUser.email],
    queryFn: async () => {
      console.log('📤 BUSCANDO MENSAGENS ENVIADAS REACT QUERY:', currentUser.email);
      const response = await fetch(`/api/messages/sent/${currentUser.email}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar mensagens enviadas');
      }
      const data = await response.json();
      console.log('📤 MENSAGENS ENVIADAS RECEBIDAS:', data.length, 'mensagens');
      return data;
    },
    enabled: isOpen && activeTab === 'sent',
    refetchOnWindowFocus: false,
    staleTime: 30000 // 30 segundos - mensagens enviadas são estáticas
  });

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      console.log('💌 ENVIANDO MENSAGEM:', messageData);
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
      
      console.log('📡 RESPOSTA DO SERVIDOR:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ERRO NA RESPOSTA:', errorText);
        throw new Error(`Erro ao enviar mensagem: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ MENSAGEM ENVIADA COM SUCESSO:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('🎉 SUCCESS CALLBACK EXECUTADO:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/sent'] });
      
      setFormData({ to: '', subject: '', message: '' });
      setSelectedRecipients([]);
      setSelectedPanel(null);
      setAttachments([]);
      setActiveTab('sent'); // Mudar para "enviadas" para confirmar que foi enviada
      showNotification('Mensagem enviada com sucesso!', 'success');
    },
    onError: (error) => {
      console.error('❌ ERROR CALLBACK EXECUTADO:', error);
      showNotification(`Erro ao enviar mensagem: ${error.message}`, 'error');
    }
  });

  // Mutation para marcar TODAS as mensagens como lidas (limpar notificação)
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      console.log('🧹 LIMPANDO TODAS AS NOTIFICAÇÕES PARA:', currentUser.email);
      const response = await fetch(`/api/messages/mark-read/${currentUser.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Erro ao limpar notificações');
      const result = await response.json();
      console.log('✅ NOTIFICAÇÕES LIMPAS:', result);
      return result;
    },
    onSuccess: () => {
      console.log('🔄 INVALIDANDO CACHE APÓS LIMPEZA DE NOTIFICAÇÕES');
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
    }
  });

  // LIMPEZA AUTOMÁTICA ao mudar para inbox
  useEffect(() => {
    if (isOpen && activeTab === 'inbox') {
      console.log('📬 ABRINDO INBOX - LIMPANDO NOTIFICAÇÕES AUTOMATICAMENTE');
      markAllAsReadMutation.mutate();
    }
  }, [isOpen, activeTab]);

  // Mutation para marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await fetch(`/api/messages/mark-read/${messageId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: currentUser.email })
      });
      if (!response.ok) throw new Error('Erro ao marcar como lida');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    }
  });

  // Filtrar usuários por departamento baseado no role real do usuário
  const filterUsersByPanel = (panel: string) => {
    console.log('🔍 FILTRANDO USUARIOS PARA PANEL:', panel);
    console.log('📊 Total de usuários disponíveis:', users.length);
    
    if (panel === 'todos') {
      console.log('✅ RETORNANDO TODOS OS USUÁRIOS:', users.length);
      return users; // Retorna todos os usuários
    }
    
    const filteredUsers = users.filter(user => {
      console.log('🔍 Verificando usuário:', user.name, user.email, user.type, user.role);
      
      // Para vendedores (tipo vendor)
      if (user.type === 'vendor' && panel === 'comercial') {
        console.log('✅ VENDEDOR INCLUÍDO:', user.name);
        return true;
      }
      
      // Para usuários do sistema (tipo system)
      if (user.type === 'system') {
        // Usar o campo role que vem da API para filtrar corretamente
        const userRole = user.role || user.email.split('@')[0];
        console.log('🏢 Usuario sistema - role:', userRole, 'email:', user.email);
        
        switch (panel) {
          case 'supervisao':
            if (userRole === 'supervisor' || user.email.includes('supervisao')) {
              console.log('✅ SUPERVISÃO INCLUÍDO:', user.name);
              return true;
            }
            break;
          case 'financeiro':
            if (userRole === 'financial' || ['michelle', 'carol', 'financeiro'].includes(user.email.split('@')[0])) {
              console.log('✅ FINANCEIRO INCLUÍDO:', user.name);
              return true;
            }
            break;
          case 'implementacao':
            if (userRole === 'implementation' || ['adm2', 'implementacao'].includes(user.email.split('@')[0])) {
              console.log('✅ IMPLEMENTAÇÃO INCLUÍDO:', user.name);
              return true;
            }
            break;
          case 'cliente':
            if (userRole === 'client' || user.email.includes('cliente')) {
              console.log('✅ CLIENTE INCLUÍDO:', user.name);
              return true;
            }
            break;
          case 'area-restrita':
            if (userRole === 'admin' || userRole === 'restricted' || user.email.includes('felipe')) {
              console.log('✅ ÁREA RESTRITA INCLUÍDO:', user.name);
              return true;
            }
            break;
        }
      }
      
      return false;
    });
    
    console.log('📋 RESULTADO FINAL - Usuários filtrados:', filteredUsers.length);
    return filteredUsers;
  };

  const availableUsers = selectedPanel ? filterUsersByPanel(selectedPanel) : [];
  
  // Debug: Log para verificar o que está acontecendo
  console.log('🔍 DEBUG Sistema Mensagens:');
  console.log('Total users:', users.length);
  console.log('selectedPanel:', selectedPanel);
  console.log('availableUsers:', availableUsers.length);
  console.log('Users structure:', users.slice(0, 2));

  // UseEffect para monitorar mudanças no selectedPanel
  useEffect(() => {
    console.log('🎯 useEffect selectedPanel MUDOU:', selectedPanel);
    if (selectedPanel) {
      console.log('🎯 Executando filtro para panel:', selectedPanel);
      const testFilter = filterUsersByPanel(selectedPanel);
      console.log('🎯 Resultado do filtro:', testFilter.length, 'usuários');
    }
  }, [selectedPanel, users]);

  const handleRecipientSelect = (userEmail: string) => {
    if (selectedRecipients.includes(userEmail)) {
      setSelectedRecipients(prev => prev.filter(email => email !== userEmail));
    } else {
      setSelectedRecipients(prev => [...prev, userEmail]);
    }
  };

  const handleSendMessage = async () => {
    if (selectedRecipients.length === 0) {
      showNotification('Selecione pelo menos um destinatário', 'error');
      return;
    }
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      showNotification('Preencha o assunto e a mensagem', 'error');
      return;
    }

    console.log('🚀 INICIANDO ENVIO DE MENSAGEM');
    console.log('📤 Destinatários selecionados:', selectedRecipients);
    console.log('👤 Remetente:', currentUser.email);
    console.log('📋 Assunto:', formData.subject);
    console.log('💬 Mensagem:', formData.message);
    console.log('📎 Arquivos anexados:', attachments.length, 'arquivo(s)');

    // Enviar mensagem separada para cada destinatário
    for (const recipient of selectedRecipients) {
      const formData_multipart = new FormData();
      
      // Adicionar dados básicos da mensagem
      formData_multipart.append('from', currentUser.email);
      formData_multipart.append('to', recipient);
      formData_multipart.append('subject', formData.subject);
      formData_multipart.append('message', formData.message);

      // ANEXAR ARQUIVOS REAIS - NÃO JSON!
      if (attachments.length > 0) {
        console.log(`📎 ANEXANDO ${attachments.length} ARQUIVOS REAIS para ${recipient}`);
        attachments.forEach((file, index) => {
          formData_multipart.append('attachments', file);  // Nome correto para o multer
          console.log(`📄 Arquivo ${index + 1}: ${file.name} (${file.type}, ${file.size} bytes)`);
        });
      } else if (attachedProposal) {
        // Se não há arquivos, mas há proposta anexada, usar dados da proposta
        const proposalData = JSON.stringify({
          proposalData: attachedProposal,
          type: 'proposal'
        });
        formData_multipart.append('proposalData', proposalData);
        console.log('📋 PROPOSTA ANEXADA como dados JSON');
      }

      console.log(`📬 Enviando mensagem para: ${recipient}`);
      console.log(`📎 Tipo de anexo:`, attachments.length > 0 ? 'ARQUIVOS REAIS' : 'DADOS JSON');
      
      try {
        const response = attachments.length === 0 ? 
          await fetch('/api/messages/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: currentUser.email,
              to: recipient,
              subject: formData.subject,
              message: formData.message,
              proposalData: attachedProposal ? JSON.stringify(attachedProposal) : null
            })
          }) :
          await fetch('/api/messages/send', {
            method: 'POST',
            body: formData_multipart
          });

        console.log('📡 RESPOSTA DO SERVIDOR:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ ERRO NA RESPOSTA:', errorText);
          throw new Error(`Erro ao enviar mensagem: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`✅ Mensagem enviada com sucesso para: ${recipient}`, result);
      } catch (error) {
        console.error(`❌ Erro ao enviar para ${recipient}:`, error);
        showNotification(`Erro ao enviar para ${recipient}`, 'error');
        break;
      }
    }
    
    // Limpar formulário após envio bem-sucedido
    setFormData({ to: '', subject: '', message: '' });
    setSelectedRecipients([]);
    setSelectedPanel(null);
    setAttachments([]);
    setActiveTab('sent');
    showNotification('Mensagem(s) enviada(s) com sucesso!', 'success');
    
    // Invalidar queries para atualizar listas
    queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
    queryClient.invalidateQueries({ queryKey: ['/api/messages/sent'] });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Função showNotification já definida acima no sistema de notificações internas

  const unreadCount = inboxMessages.filter(msg => !msg.read).length;

  const renderProposalInfo = (proposal: ProposalData) => {
    const contractData = proposal.contractData || {};
    
    // Busca robusta do nome do vendedor usando vendorId para encontrar o vendedor real
    const vendorFromList = users.find(user => 
      user.type === 'vendor' && user.id === proposal.vendorId
    );
    
    const vendorName = 
      vendorFromList?.name ||
      contractData.vendorName || 
      contractData.vendedor || 
      proposal.internalData?.vendedorResponsavel ||
      (typeof proposal.vendor === 'object' ? proposal.vendor?.name : proposal.vendor) ||
      proposal.vendorName ||
      `Vendedor ID: ${proposal.vendorId}`;
    
    // Busca robusta do plano contratado
    const plano = 
      contractData.planoContratado || 
      contractData.plano || 
      contractData.tipoPlano ||
      'Plano não informado';
    
    // Busca robusta do nome da empresa
    const empresa = 
      contractData.nomeEmpresa || 
      contractData.empresa || 
      contractData.razaoSocial ||
      'Empresa não informada';
    
    // Busca robusta do CNPJ
    const cnpj = 
      contractData.cnpj || 
      contractData.cnpjEmpresa ||
      'CNPJ não informado';
    
    // Busca robusta do valor
    const valor = 
      contractData.valor || 
      contractData.valorContrato ||
      contractData.valorProposta ||
      'Valor não informado';
    
    return (
      <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Informações da Proposta
          </h4>
          <button
            onClick={() => setShowProposalDetails(!showProposalDetails)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showProposalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">ID:</span>
            <span className="ml-1 text-gray-900 dark:text-white">{proposal.abmId || proposal.contractId || proposal.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
            <span className="ml-1 text-gray-900 dark:text-white">{proposal.status || 'N/A'}</span>
          </div>
          <div className="col-span-2">
            <span className="font-medium text-gray-600 dark:text-gray-400">Empresa:</span>
            <span className="ml-1 text-gray-900 dark:text-white">{empresa}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">CNPJ:</span>
            <span className="ml-1 text-gray-900 dark:text-white">{cnpj}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Vendedor:</span>
            <span className="ml-1 text-gray-900 dark:text-white">{vendorName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Plano:</span>
            <span className="ml-1 text-gray-900 dark:text-white">{plano}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Valor:</span>
            <span className="ml-1 text-gray-900 dark:text-white">{valor}</span>
          </div>
        </div>

        {showProposalDetails && proposal.actions && (
          <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
            <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Ações Disponíveis:</h5>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors">
                <MessageSquare className="w-3 h-3 mr-1" />
                Responder
              </button>
              <button className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors">
                <Eye className="w-3 h-3 mr-1" />
                Ver Drive
              </button>
              <button className="inline-flex items-center px-3 py-1 bg-orange-500 text-white text-xs rounded-md hover:bg-orange-600 transition-colors">
                <Edit className="w-3 h-3 mr-1" />
                Editar
              </button>
              <button className="inline-flex items-center px-3 py-1 bg-purple-500 text-white text-xs rounded-md hover:bg-purple-600 transition-colors">
                <ExternalLink className="w-3 h-3 mr-1" />
                Link Cliente
              </button>
              <button className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors">
                <Phone className="w-3 h-3 mr-1" />
                WhatsApp
              </button>
              <button className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors">
                <Mail className="w-3 h-3 mr-1" />
                Email
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMessageActions = (message: InternalMessage) => {
    let proposalData: ProposalData | null = null;
    
    try {
      if (message.attachedProposal) {
        // CORREÇÃO: attachedProposal já vem como objeto do banco, não precisa parsear
        if (typeof message.attachedProposal === 'string') {
          proposalData = JSON.parse(message.attachedProposal);
        } else {
          proposalData = message.attachedProposal as ProposalData;
        }
        console.log('📎 PROPOSTA ANEXADA PROCESSADA:', proposalData);
      }
    } catch (error) {
      console.error('❌ ERRO ao processar proposta anexada:', error);
      console.error('❌ DADOS ORIGINAIS:', message.attachedProposal);
    }

    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
        {/* INDICADOR DE ANEXO DISCRETO */}
        {message.attachedProposal && (
          <div className="mb-3 flex items-center text-xs text-gray-600 dark:text-gray-400">
            <Paperclip className="w-3 h-3 mr-1" />
            {(() => {
              try {
                const attachmentData = typeof message.attachedProposal === 'string' 
                  ? JSON.parse(message.attachedProposal) 
                  : message.attachedProposal;
                
                if (attachmentData.files && attachmentData.files.length > 0) {
                  return `${attachmentData.files.length} arquivo(s) anexado(s)`;
                } else {
                  return 'Dados de proposta anexados';
                }
              } catch (error) {
                return 'Anexo disponível';
              }
            })()}
            <button
              onClick={() => {
                if (message.attachedProposal) {
                  try {
                    // Parse dos dados anexados para verificar se são arquivos reais
                    const attachmentData = typeof message.attachedProposal === 'string' 
                      ? JSON.parse(message.attachedProposal) 
                      : message.attachedProposal;
                    
                    console.log('📎 DADOS DO ANEXO:', attachmentData);
                    
                    // Verificar se existem arquivos reais anexados
                    if (attachmentData.files && attachmentData.files.length > 0) {
                      // Baixar ARQUIVOS REAIS em vez de JSON
                      console.log('📎 BAIXANDO ARQUIVOS REAIS:', attachmentData.files);
                      
                      // Para cada arquivo real, fazer download direto do servidor
                      attachmentData.files.forEach((file: any, index: number) => {
                        const downloadUrl = `/api/download/${file.filename}`;
                        console.log(`📥 Baixando arquivo ${index + 1}/${attachmentData.files.length}: ${file.originalName}`);
                        
                        // Criar link para download direto do arquivo real
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = file.originalName; // Nome original do arquivo
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        console.log(`✅ Download iniciado: ${file.originalName}`);
                      });
                      
                      showNotification(`Download de ${attachmentData.files.length} arquivo(s) real(is) iniciado!`, 'success');
                    } else {
                      // Fallback para dados de proposta (JSON)
                      const blob = new Blob([JSON.stringify(attachmentData, null, 2)], { 
                        type: 'application/json' 
                      });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `anexo-${message.id}.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      
                      showNotification('Anexo baixado!', 'success');
                    }
                  } catch (error) {
                    console.error('Erro ao processar anexo:', error);
                    showNotification('Erro ao processar anexo', 'error');
                  }
                } else {
                  showNotification('Nenhum anexo encontrado', 'error');
                }
              }}
              className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Baixar anexo"
            >
              <Download className="w-3 h-3" />
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400">Ações:</h4>
          
          {/* Botão de exclusão (lixeira) - USAR API CORRETA */}
          <button 
            onClick={async () => {
              try {
                const response = await fetch(`/api/messages/${message.id}`, { 
                  method: 'DELETE' 
                });
                
                if (response.ok) {
                  console.log(`✅ Mensagem ${message.id} excluída`);
                  
                  // Atualizar queries para remover da UI
                  queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/messages/sent'] });
                  
                  // Refetch para garantir dados atualizados
                  await refetchInboxMessages();
                  
                  showNotification('Mensagem excluída com sucesso!', 'success');
                } else {
                  showNotification('Erro ao excluir mensagem', 'error');
                }
              } catch (error) {
                console.error('Erro ao excluir mensagem:', error);
                showNotification('Erro ao excluir mensagem', 'error');
              }
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Excluir mensagem"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-1 mt-2">
          {/* BOTÃO 1: Responder */}
          <button 
            onClick={() => {
              setFormData({
                to: message.from,
                subject: `Re: ${message.subject}`,
                message: `\n\n--- Mensagem original de ${message.from} ---\n${message.message}`
              });
              setSelectedRecipients([message.from]);
              setActiveTab('compose');
              showNotification('Resposta preparada!', 'success');
            }}
            className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Responder mensagem"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Responder
          </button>
          
          {/* BOTÃO 2: WhatsApp */}
          <button 
            onClick={() => {
              const phoneNumber = '5511999999999';
              const text = encodeURIComponent(
                `Mensagem via Sistema Abmix:\n\nAssunto: ${message.subject}\n\nMensagem: ${message.message}\n\nDe: ${message.from}`
              );
              const whatsappUrl = `https://wa.me/${phoneNumber}?text=${text}`;
              window.open(whatsappUrl, '_blank');
              showNotification('WhatsApp aberto!', 'success');
            }}
            className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Enviar via WhatsApp"
          >
            <Phone className="w-3 h-3 mr-1" />
            WhatsApp
          </button>
          
          {/* BOTÃO 3: Link Cliente */}
          <button 
            onClick={() => {
              if (message.attachedProposal) {
                try {
                  // Usar os dados reais anexados na mensagem
                  const realProposal = typeof message.attachedProposal === 'string' 
                    ? JSON.parse(message.attachedProposal) 
                    : message.attachedProposal;
                  
                  let clientLink = 'https://abmix.digital/client-portal';
                  
                  // Tentar diferentes campos para obter o link correto
                  if (realProposal.clientLink) {
                    clientLink = realProposal.clientLink;
                  } else if (realProposal.abmId) {
                    clientLink = `https://abmix.digital/proposal/${realProposal.abmId}`;
                  } else if (realProposal.id) {
                    clientLink = `https://abmix.digital/proposal/${realProposal.id}`;
                  } else if (realProposal.contractData && realProposal.contractData.abmId) {
                    clientLink = `https://abmix.digital/proposal/${realProposal.contractData.abmId}`;
                  }
                  
                  // Abrir link em nova aba
                  window.open(clientLink, '_blank');
                  showNotification('Link da proposta aberto!', 'success');
                } catch (error) {
                  console.error('Erro ao processar anexo:', error);
                  window.open('https://abmix.digital/client-portal', '_blank');
                  showNotification('Link padrão aberto (anexo inválido)', 'info');
                }
              } else {
                // Link padrão se não há anexo
                window.open('https://abmix.digital/client-portal', '_blank');
                showNotification('Portal do cliente aberto!', 'success');
              }
            }}
            className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Abrir link do cliente"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Link Cliente
          </button>
          
          {/* BOTÃO 4: Email */}
          <button 
            onClick={() => {
              const emailSubject = encodeURIComponent(`Sistema Abmix: ${message.subject}`);
              const emailBody = encodeURIComponent(
                `Mensagem do Sistema Abmix:\n\nAssunto: ${message.subject}\n\nMensagem: ${message.message}\n\nRemetente: ${message.from}\n\nData: ${new Date(message.createdAt).toLocaleString('pt-BR')}`
              );
              const emailUrl = `mailto:${message.from}?subject=${emailSubject}&body=${emailBody}`;
              window.location.href = emailUrl;
              showNotification('Email preparado!', 'success');
            }}
            className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Enviar por email"
          >
            <Mail className="w-3 h-3 mr-1" />
            Email
          </button>
        </div>

        {proposalData && (
          <div className="mt-3">
            {renderProposalInfo(proposalData)}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sistema de Mensagens Internas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'compose'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Nova Mensagem
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'inbox'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Inbox className="w-4 h-4 mr-1 inline" />
            Caixa de Entrada
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'sent'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Enviadas
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'compose' && (
            <div className="space-y-6">
              {attachedProposal && renderProposalInfo(attachedProposal)}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Destinatários ({selectedRecipients.length} selecionados)
                </label>
                
                <div>
                  <select
                    value={selectedRecipients.length > 0 ? selectedRecipients[0] : ''}
                    onChange={(e) => {
                      if (e.target.value === 'todos') {
                        // Mensagem Geral - Todos os usuários
                        setSelectedRecipients(users.map(u => u.email));
                      } else if (e.target.value) {
                        setSelectedRecipients([e.target.value]);
                      } else {
                        setSelectedRecipients([]);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um destinatário</option>
                    
                    {/* Mensagem Geral */}
                    <option value="todos" className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      📢 Mensagem Geral - Todos os usuários
                    </option>
                    
                    {/* Comercial */}
                    <optgroup label="Comercial">
                      {users.filter(u => u.type === 'vendor').map((user) => (
                        <option key={user.email} value={user.email}>
                          {user.name} - Comercial
                        </option>
                      ))}
                    </optgroup>
                    
                    {/* Supervisor */}
                    <optgroup label="Supervisor">
                      {users.filter(u => u.type === 'system' && u.email.includes('supervisao')).map((user) => (
                        <option key={user.email} value={user.email}>
                          {user.name} - Supervisor
                        </option>
                      ))}
                    </optgroup>
                    
                    {/* Implantação */}
                    <optgroup label="Implantação">
                      {users.filter(u => u.type === 'system' && (u.email.includes('implementacao') || u.email.includes('adm2'))).map((user) => (
                        <option key={user.email} value={user.email}>
                          {user.name} - Implantação
                        </option>
                      ))}
                    </optgroup>
                    
                    {/* Financeiro */}
                    <optgroup label="Financeiro">
                      {users.filter(u => u.type === 'system' && (u.email.includes('financeiro') || u.email.includes('carol') || u.email.includes('michelle'))).map((user) => (
                        <option key={user.email} value={user.email}>
                          {user.name} - Financeiro
                        </option>
                      ))}
                    </optgroup>
                    
                    {/* Administrador (Área Restrita) */}
                    <optgroup label="Administrador">
                      {users.filter(u => u.type === 'system' && u.email.includes('felipe')).map((user) => (
                        <option key={user.email} value={user.email}>
                          {user.name} - Administrador
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                  
                  {selectedRecipients.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Destinatários Selecionados ({selectedRecipients.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecipients.map((email) => {
                          const user = users.find(u => u.email === email);
                          return (
                            <span
                              key={email}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                            >
                              {user?.name || email}
                              <button
                                onClick={() => handleRecipientSelect(email)}
                                className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assunto
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Digite o assunto da mensagem"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mensagem
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={6}
                  placeholder="Digite sua mensagem..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Anexos
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 transition-all"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Clique para adicionar arquivos ou arraste aqui
                </button>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Todos os formatos de arquivo são aceitos
                </div>
                
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Arquivos Anexados ({attachments.length}):
                    </div>
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center flex-1">
                          <FileText className="w-4 h-4 text-blue-600 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {(file.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendMessageMutation.isPending ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="space-y-4">
              {inboxMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Nenhuma mensagem na caixa de entrada</p>
                </div>
              ) : (
                inboxMessages.map((message) => {
                  const senderUser = users.find(u => u.email === message.from);
                  const senderName = senderUser?.name || message.from;
                  
                  return (
                    <div key={message.id} className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                      !message.read 
                        ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-700' 
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-semibold text-lg text-gray-900 dark:text-white">
                              {message.subject}
                            </span>

                            {!message.read && (
                              <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                Nova
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              <span className="font-medium">{senderName}</span>
                            </div>
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              <span>{message.from}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{new Date(message.createdAt).toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        {!message.read && (
                          <button
                            onClick={() => markAsReadMutation.mutate(message.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          {message.message}
                        </p>
                      </div>
                      
                      {renderMessageActions(message)}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="space-y-4">
              {sentMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Nenhuma mensagem enviada</p>
                </div>
              ) : (
                sentMessages.map((message) => {
                  const recipients = message.to.split(',');
                  const recipientNames = recipients.map(email => {
                    const user = users.find(u => u.email === email.trim());
                    return user?.name || email.trim();
                  });
                  
                  return (
                    <div key={message.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-semibold text-lg text-gray-900 dark:text-white">
                              {message.subject}
                            </span>
                            <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                              Enviada
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              <span className="font-medium">
                                Para: {recipientNames.join(', ')}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{new Date(message.createdAt).toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          {message.message}
                        </p>
                        
                        {/* Indicador de anexo discreto para mensagens enviadas */}
                        {message.attachedProposal && (
                          <div className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-400">
                            <Paperclip className="w-3 h-3 mr-1" />
                            Mensagem enviada com anexo de proposta
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400">Ações:</h4>
                          
                          {/* Botão de exclusão (lixeira) */}
                          <button 
                            onClick={() => {
                              if (window.confirm('Deseja realmente excluir esta mensagem?')) {
                                fetch(`/api/messages/${message.id}`, { method: 'DELETE' })
                                  .then(() => {
                                    queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
                                    showNotification('Mensagem excluída com sucesso!', 'success');
                                  })
                                  .catch(() => showNotification('Erro ao excluir mensagem', 'error'));
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Excluir mensagem"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-1">
                          <button className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Responder
                          </button>
                          <button className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Phone className="w-3 h-3 mr-1" />
                            WhatsApp
                          </button>
                          <button className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Link Cliente
                          </button>
                          <button className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </button>
                          <button className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Download className="w-3 h-3 mr-1" />
                            Baixar Anexo
                          </button>
                        </div>
                        
                        {message.attachedProposal && (
                          <div className="mt-3">
                            {renderProposalInfo(
                              typeof message.attachedProposal === 'string' 
                                ? JSON.parse(message.attachedProposal) 
                                : message.attachedProposal as ProposalData
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* NOTIFICAÇÕES INTERNAS DO PAINEL */}
      {internalNotifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {internalNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg border max-w-sm animate-fade-in ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
                  : notification.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
                  : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {notification.type === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
                  {notification.type === 'error' && <X className="w-4 h-4 mr-2" />}
                  {notification.type === 'info' && <MessageSquare className="w-4 h-4 mr-2" />}
                  <span className="text-sm font-medium">{notification.message}</span>
                </div>
                <button
                  onClick={() => setInternalNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}