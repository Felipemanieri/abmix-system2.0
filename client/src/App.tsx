import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, FileText, DollarSign, Zap, Shield, ArrowRight, CheckCircle, MessageCircle, Bot, X, Send, Phone, Mail, MapPin, Globe, Crown, Database, Clock, Award, Lock, Calculator, BarChart3, TrendingUp, PieChart, Briefcase, Settings, RefreshCw } from 'lucide-react';
import LoginPage from './components/LoginPage';
import VendorPortal from './components/VendorPortal';
import ClientPortal from './components/ClientPortal';
import FinancialPortal from './components/FinancialPortal';
import ImplantacaoPortal from './components/ImplantacaoPortal';
import SupervisorPortal from './components/SupervisorPortal';
import RestrictedAreaPortal from './components/RestrictedAreaPortal';
import RestrictedAreaPortalSimple from './components/RestrictedAreaPortalSimple';
import ClientProposalView from './components/ClientProposalView';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import { BrowserRouter as Router } from 'react-router-dom';

// Handler único para unhandled promise rejections
// Sistema global de tratamento de erros já configurado em main.tsx

type Portal = 'home' | 'client' | 'vendor' | 'financial' | 'implementation' | 'supervisor' | 'restricted' | 'admin';
type User = {
  id: string;
  name: string;
  role: Portal;
  email: string;
} | null;

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

// Componente para estatísticas do rodapé com dados reais
function FooterStats() {
  const [proposalsToday, setProposalsToday] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Função para buscar propostas de hoje
  const fetchProposalsToday = async () => {
    try {
      const response = await fetch('/api/proposals');
      if (response.ok) {
        const proposals = await response.json();
        const today = new Date().toISOString().split('T')[0];
        
        // Filtrar propostas criadas hoje
        const todayProposals = proposals.filter((proposal: any) => {
          const createdAt = proposal.createdAt || proposal.created_at;
          if (!createdAt) return false;
          
          const proposalDate = new Date(createdAt).toISOString().split('T')[0];
          return proposalDate === today;
        });
        
        console.log(`📊 FooterStats - Total propostas: ${proposals.length}`);
        console.log(`📊 FooterStats - Propostas hoje (${today}): ${todayProposals.length}`);
        
        setProposalsToday(todayProposals.length);
      }
    } catch (error) {
      console.error('Erro ao buscar propostas de hoje:', error);
    }
  };

  useEffect(() => {
    // Atualizar tempo a cada 30 segundos
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    
    // Buscar propostas imediatamente
    fetchProposalsToday();
    
    // Configurar WebSocket para atualizações em tempo real
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('🔌 WebSocket conectado no FooterStats');
    };
    
    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'proposal_created' || message.type === 'proposal_updated') {
          console.log('🔄 Atualizando contador FooterStats após evento:', message.type);
          setTimeout(fetchProposalsToday, 500);
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    };
    
    // Atualizar a cada 2 minutos como backup
    const proposalsTimer = setInterval(fetchProposalsToday, 120000);
    
    return () => {
      clearInterval(timer);
      clearInterval(proposalsTimer);
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-end space-y-1">
      <span>Última Sync: <span className="font-medium">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></span>
      <span>Propostas Hoje: <span className="font-medium text-blue-600">{proposalsToday}</span></span>
      <span>Backup: <span className="font-medium text-green-600">Ativo</span></span>
    </div>
  );
}

function App() {
  const [currentPortal, setCurrentPortal] = useState<Portal>('home');
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [clientProposalToken, setClientProposalToken] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Olá! Sou o assistente virtual do sistema. Como posso ajudá-lo hoje?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  // Configuração padrão dos portais
  const defaultPortalVisibility = {
    showClientPortal: true,
    showVendorPortal: true,
    showFinancialPortal: true,
    showImplementationPortal: true,
    showSupervisorPortal: true,
    showRestrictedPortal: true
  };

  const [portalVisibility, setPortalVisibility] = useState(defaultPortalVisibility);

  // Sistema de carregamento da visibilidade persistente dos portais
  useEffect(() => {
    // Não adicionar handler duplicado - já existe no escopo global acima

    // PRIMEIRO: Carrega do localStorage (ESTADO PERMANENTE)
    const loadPortalVisibility = async () => {
      try {
        // PRIORIDADE 1: Estado local persistente
        const localData = localStorage.getItem('abmix_portal_visibility');
        if (localData) {
          const localConfig = JSON.parse(localData);
          console.log('🔥 App.tsx MANTENDO ESTADO PERSISTENTE:', localConfig);
          const converted = {
            showClientPortal: localConfig.showClientPortal === true,
            showVendorPortal: localConfig.showVendorPortal === true,
            showFinancialPortal: localConfig.showFinancialPortal === true,
            showImplementationPortal: localConfig.showImplementationPortal === true,
            showSupervisorPortal: localConfig.showSupervisorPortal === true,
            showRestrictedPortal: true
          };
          setPortalVisibility(converted);
          return; // PARA AQUI - NÃO BUSCA API
        }

        // PRIORIDADE 2: API só se não tem estado local
        const response = await fetch('/api/portal-visibility');
        if (response.ok) {
          const apiData = await response.json();
          const newVisibility = {
            showClientPortal: apiData.client,
            showVendorPortal: apiData.vendor,
            showFinancialPortal: apiData.financial,
            showImplementationPortal: apiData.implementation,
            showSupervisorPortal: apiData.supervisor,
            showRestrictedPortal: apiData.restricted
          };
          setPortalVisibility(newVisibility);

          // Salva para persistir nas próximas sessões
          const localFormat = {
            showClientPortal: newVisibility.showClientPortal,
            showVendorPortal: newVisibility.showVendorPortal,
            showFinancialPortal: newVisibility.showFinancialPortal,
            showImplementationPortal: newVisibility.showImplementationPortal,
            showSupervisorPortal: newVisibility.showSupervisorPortal
          };
          localStorage.setItem('abmix_portal_visibility', JSON.stringify(localFormat));
        }
      } catch (error) {
        console.error('Erro ao carregar visibilidade:', error);
      }
    };

    loadPortalVisibility();

    // Escuta eventos de mudança de visibilidade dos portais
    const handlePortalVisibilityChanged = (event: any) => {
      setPortalVisibility(event.detail);
      // FORÇA persistência imediata do estado
      localStorage.setItem('abmix_portal_visibility', JSON.stringify(event.detail));
    };

    window.addEventListener('portalVisibilityChanged', handlePortalVisibilityChanged);

    // Sistema de persistência estável
    console.log('✅ Sistema Abmix carregado com sucesso');
    console.log('🔄 Portal visibility:', portalVisibility);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('portalVisibilityChanged', handlePortalVisibilityChanged);
    };
  }, []); // Removido portalVisibility das dependências para evitar loop infinito

  // Verificar URLs específicas para acesso direto aos portais
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;

    // URLs específicas para cada portal
    if (path === '/portal/cliente' || hash === '#cliente') {
      setCurrentPortal('client');
    } else if (path === '/portal/vendedor' || hash === '#vendedor') {
      setCurrentPortal('vendor');
    } else if (path === '/portal/financeiro' || hash === '#financeiro') {
      setCurrentPortal('financial');
    } else if (path === '/portal/implantacao' || hash === '#implantacao') {
      setCurrentPortal('implementation');
    } else if (path === '/portal/supervisor' || hash === '#supervisor') {
      setCurrentPortal('supervisor');
    } else if (path === '/portal/restrito' || hash === '#restrito') {
      setCurrentPortal('restricted');
    }
  }, []);

  // Check for client proposal token in URL
  useEffect(() => {
    const path = window.location.pathname;
    const clientProposalMatch = path.match(/\/cliente\/proposta\/(.+)/);

    if (clientProposalMatch) {
      setClientProposalToken(clientProposalMatch[1]);
    }
  }, []);

  // Set correct page title
  useEffect(() => {
    document.title = "Abmix Consultoria em Benefícios";
  }, [currentPortal]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user) {
      setCurrentPortal(user.role);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPortal('home');
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      isBot: false,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const response = getBotResponse(newMessage);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);

    setNewMessage('');
  };

  const getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('plano') || lowerMessage.includes('saúde')) {
      return 'Oferecemos diversos planos de saúde empresariais e individuais com coberturas completas. Nossos especialistas podem fazer uma apresentação personalizada para sua empresa. Gostaria de agendar?';
    }
    if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('cotação')) {
      return 'Os valores são calculados conforme o perfil da empresa e número de colaboradores. Nossa equipe comercial faz cotações gratuitas em até 24h. Posso conectá-lo com um consultor?';
    }
    if (lowerMessage.includes('documento') || lowerMessage.includes('anexo') || lowerMessage.includes('papelada')) {
      return 'O processo é 100% digital! Você precisará apenas de: CNPJ da empresa, RG e CPF dos beneficiários, e comprovante de endereço. Tudo pode ser enviado pelo sistema online.';
    }
    if (lowerMessage.includes('contato') || lowerMessage.includes('telefone') || lowerMessage.includes('whatsapp')) {
      return 'Você pode falar conosco por WhatsApp: (11) 98888-8888, telefone: (11) 99999-9999 ou email: contato@abmix.com.br. Atendemos com suporte especializado para sua comodidade!';
    }
    if (lowerMessage.includes('portal') || lowerMessage.includes('acesso') || lowerMessage.includes('login')) {
      return 'Cada usuário tem acesso ao seu portal específico: Cliente (acompanhar propostas), Vendedor (criar propostas), Financeiro (análises) e Supervisor (relatórios). Qual portal você precisa acessar?';
    }
    if (lowerMessage.includes('como funciona') || lowerMessage.includes('processo')) {
      return 'É muito simples: 1) Vendedor cria a proposta, 2) Cliente preenche os dados online, 3) Sistema valida automaticamente, 4) Aprovação em até 48h. Todo processo é acompanhado em tempo real!';
    }

    return 'Estou aqui para ajudar! Posso esclarecer sobre planos, preços, documentação, processo de contratação ou conectá-lo com nossa equipe especializada. Como posso auxiliá-lo?';
  };

  // If accessing client proposal via direct link
  if (clientProposalToken) {
    return (
      <ThemeProvider>
        <ClientProposalView token={clientProposalToken} />
      </ThemeProvider>
    );
  }

  // Se não está logado e não está na home, mostrar login
  if (!currentUser && currentPortal !== 'home') {
    const loginPortal = currentPortal === 'admin' ? 'restricted' : currentPortal;
    return (
      <ThemeProvider>
        <LoginPage portal={loginPortal as any} onLogin={handleLogin} onBack={() => setCurrentPortal('home')} />
      </ThemeProvider>
    );
  }

  // Se está logado, mostrar o portal correspondente
  if (currentUser) {
    return (
      <ThemeProvider>
        {(() => {
          switch (currentUser.role) {
            case 'vendor':
              return <VendorPortal user={currentUser} onLogout={handleLogout} />;
            case 'client':
              return <ClientPortal user={currentUser} onLogout={handleLogout} />;
            case 'financial':
              return <FinancialPortal user={currentUser} onLogout={handleLogout} />;
            case 'implementation':
              return <ImplantacaoPortal user={currentUser} onLogout={handleLogout} />;
            case 'supervisor':
              return <SupervisorPortal user={currentUser} onLogout={handleLogout} />;
            case 'restricted':
            case 'admin':
              console.log('🔥 CARREGANDO RestrictedAreaPortal para user:', currentUser);
              try {
                return <RestrictedAreaPortal user={currentUser} onLogout={handleLogout} />;
              } catch (error) {
                console.error('❌ Erro no RestrictedAreaPortal, usando versão simplificada:', error);
                return <RestrictedAreaPortalSimple user={currentUser} onLogout={handleLogout} />;
              }
            default:
              return null;
          }
        })()}
      </ThemeProvider>
    );
  }

  // Página inicial com seleção de portais
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="/65be871e-f7a6-4f31-b1a9-cd0729a73ff8 copy copy.png" 
                  alt="Abmix" 
                  className="h-16 w-auto"
                />
              </div>
              <button
                onClick={() => setCurrentPortal('restricted')}
                className="text-gray-700 dark:text-white hover:text-teal-600 dark:hover:text-teal-300 font-medium transition-colors"
              >
                Área Restrita
              </button>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-6">
                <a href="#" className="text-gray-700 dark:text-white hover:text-teal-600 dark:hover:text-teal-300 font-medium transition-colors">Sobre</a>
                <a href="#" className="text-gray-700 dark:text-white hover:text-teal-600 dark:hover:text-teal-300 font-medium transition-colors">Suporte</a>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Title */}
        <div className="text-center mb-20 relative">
          {/* Logo como marca d'água */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img 
              src="/6078b216-6252-4ede-8d9b-4c2164c3ed8f copy copy.png" 
              alt="Abmix Logo Watermark" 
              className="w-96 h-96 opacity-20 object-contain"
            />
          </div>

          {/* Texto principal com z-index maior */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-600 dark:text-gray-300 mb-6 leading-tight">
            Sistema Abmix de Propostas
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-bold max-w-4xl mx-auto leading-relaxed relative z-10">
            Plataforma completa para gestão de propostas de planos de saúde empresariais. 
            Acesse sua área específica e gerencie todo o processo de forma simples, segura e eficiente.
          </p>

          <div className="flex items-center justify-center space-x-8 mt-8 relative z-10">
            <div className="flex items-center text-gray-600 dark:text-gray-400 font-bold">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span>100% Digital</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400 font-bold">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span>Seguro e Rápido</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400 font-bold">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span>Suporte Especializado</span>
            </div>
          </div>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 px-8">
          {/* Portal do Cliente - Condicional */}
          {portalVisibility.showClientPortal && (
            <div 
              onClick={() => setCurrentPortal('client')}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-teal-300 dark:border-teal-600 hover:border-teal-400 dark:hover:border-teal-500 transform hover:-translate-y-2 relative"
            >
              <div className="absolute top-4 right-4 flex items-center bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Online
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-2xl mb-4 mx-auto">
                <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-2 text-center">Portal do Cliente</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm text-center">
                Acompanhe suas propostas e documentos
              </p>
              <div className="flex items-center justify-center text-teal-600 dark:text-teal-400 font-semibold">
                <ArrowRight className="w-4 h-4 mr-2" />
                Acessar Portal
              </div>
            </div>
          )}

          {/* Portal Vendedor */}
          {portalVisibility.showVendorPortal && (
          <div 
            onClick={() => setCurrentPortal('vendor')}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 transform hover:-translate-y-2 relative"
          >
            <div className="absolute top-4 right-4 flex items-center bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Online
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-2xl mb-4 mx-auto">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-2 text-center">Portal Vendedor</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm text-center">
              Gerencie propostas e clientes
            </p>
            <div className="flex items-center justify-center text-green-600 dark:text-green-400 font-semibold">
              <ArrowRight className="w-4 h-4 mr-2" />
              Acessar Portal
            </div>
          </div>
          )}

          {/* Portal Implantação */}
          {portalVisibility.showImplementationPortal && (
          <div 
            onClick={() => setCurrentPortal('implementation')}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-orange-300 dark:border-orange-600 hover:border-orange-400 dark:hover:border-orange-500 transform hover:-translate-y-2 relative"
          >
            <div className="absolute top-4 right-4 flex items-center bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Online
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-2xl mb-4 mx-auto">
              <Settings className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-2 text-center">Portal Implantação</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm text-center">
              Validação e automação de propostas
            </p>
            <div className="flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold">
              <ArrowRight className="w-4 h-4 mr-2" />
              Acessar Portal
            </div>
          </div>
          )}

          {/* Portal Financeiro */}
          {portalVisibility.showFinancialPortal && (
          <div 
            onClick={() => setCurrentPortal('financial')}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 transform hover:-translate-y-2 relative"
          >
            <div className="absolute top-4 right-4 flex items-center bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Online
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-2xl mb-4 mx-auto">
              <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-2 text-center">Portal Financeiro</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm text-center">
              Análise financeira e relatórios
            </p>
            <div className="flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold">
              <ArrowRight className="w-4 h-4 mr-2" />
              Acessar Portal
            </div>
          </div>
          )}

          {/* Portal Supervisor */}
          {portalVisibility.showSupervisorPortal && (
          <div 
            onClick={() => setCurrentPortal('supervisor')}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500 transform hover:-translate-y-2 relative"
          >
            <div className="absolute top-4 right-4 flex items-center bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Online
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl mb-4 mx-auto">
              <Crown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2 text-center">Portal Supervisor</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm text-center">
              Supervisão e relatórios gerenciais
            </p>
            <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
              <ArrowRight className="w-4 h-4 mr-2" />
              Acessar Portal
            </div>
          </div>
          )}
        </div>

        {/* Features Section */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-12 mb-16 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-12">

            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Tecnologia de ponta para simplificar seus processos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Database className="w-10 h-10 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">Gestão Centralizada</h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Sistema integrado para controle total de propostas e documentos</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">Eficiência Operacional</h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Automação inteligente reduz o tempo de processamento</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">Excelência Corporativa</h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Padrões empresariais com conformidade e segurança</p>
            </div>
          </div>
        </div>


      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
        <div className="max-w-full mx-auto">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">

            {/* Seção Esquerda - Logo e Info do Sistema */}
            <div className="flex items-center space-x-3">
              <img 
                src="/65be871e-f7a6-4f31-b1a9-cd0729a73ff8 copy copy.png" 
                alt="Abmix" 
                className="h-16 w-auto"
              />
              <div className="flex flex-col space-y-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Sistema Interno v2.0</span>
                <span className="text-gray-500 dark:text-gray-400">© 2025 Abmix Consultoria</span>
              </div>
            </div>

            {/* Seção Centro - Suporte e Links */}
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center space-x-1">
                <span>Suporte:</span>
                <a 
                  href="mailto:suporte@abmix.com.br" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  suporte@abmix.com.br
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Manual do Sistema
                </a>
                <span className="text-gray-400">|</span>
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  FAQ
                </a>
                <span className="text-gray-400">|</span>
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Configurações
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <span>Status:</span>
                <span className="text-green-600 font-medium">🟢 Online</span>
              </div>
            </div>

            {/* Seção Direita - Informações do Sistema */}
            <FooterStats />

          </div>
        </div>
      </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;