import React, { useState, useEffect } from 'react';
import { Users, FileText, DollarSign, Zap, Shield, ArrowRight, CheckCircle, MessageCircle, Bot, X, Send, Phone, Mail, MapPin, Globe, Crown, Database, Clock, Award, Lock } from 'lucide-react';
import MobileRefreshButton from './components/MobileRefreshButton';
import LoginPage from './components/LoginPage';
import VendorPortal from './components/VendorPortal';
import ClientPortal from './components/ClientPortal';
import FinancialPortal from './components/FinancialPortal';
import ImplantacaoPortal from './components/ImplantacaoPortal';
import SupervisorPortal from './components/SupervisorPortal';
import RestrictedAreaPortal from './components/RestrictedAreaPortal';
import ClientProposalView from './components/ClientProposalView';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

type Portal = 'home' | 'client' | 'vendor' | 'financial' | 'implementation' | 'supervisor' | 'restricted';
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

function App() {
  const [currentPortal, setCurrentPortal] = useState<Portal>('home');
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [selectedPortal, setSelectedPortal] = useState<Portal | null>(null);
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
  const [showClientPortal, setShowClientPortal] = useState(() => {
    return localStorage.getItem('showClientPortal') !== 'false';
  });

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
      setSelectedPortal(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPortal('home');
    setSelectedPortal(null);
  };

  const handlePortalSelect = (portal: Portal) => {
    setSelectedPortal(portal);
  };

  const handleBackToHome = () => {
    setSelectedPortal(null);
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
    setNewMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Obrigado pela sua mensagem! Nossa equipe está analisando e retornará em breve.',
        isBot: true,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  // Main App wrapper with theme support and responsive design
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Show client proposal view if token exists */}
        {clientProposalToken ? (
          <ClientProposalView token={clientProposalToken} />
        ) : (
          <>
            {/* Show portal selection or login page */}
            {!currentUser && selectedPortal ? (
              <LoginPage 
                portal={selectedPortal} 
                onLogin={handleLogin} 
                onBack={handleBackToHome}
              />
            ) : !currentUser ? (
              // Home page with portal selection
              <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Header */}
                <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src="/65be871e-f7a6-4f31-b1a9-cd0729a73ff8 copy copy.png" 
                        alt="Abmix" 
                        className="h-12 w-auto"
                      />
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Abmix Consultoria
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Sistema de Gestão de Benefícios
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <ThemeToggle />
                      <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>(11) 99999-9999</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>contato@abmix.com.br</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Main Content */}
                <main className="px-6 py-12">
                  <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Bem-vindo ao Sistema
                        <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent"> Abmix</span>
                      </h2>
                      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                        Plataforma completa de gestão de propostas, clientes e benefícios. 
                        Acesse seu portal para começar.
                      </p>
                    </div>

                    {/* Portal Selection Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                      {/* Client Portal */}
                      {showClientPortal && (
                        <div 
                          onClick={() => handlePortalSelect('client')}
                          className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 transform hover:-translate-y-2"
                        >
                          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Portal do Cliente</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Acompanhe suas propostas, envie documentos e gerencie seu perfil.
                          </p>
                          <div className="flex items-center text-teal-600 dark:text-teal-400 font-semibold group-hover:text-teal-700 dark:group-hover:text-teal-300">
                            <span>Acessar Portal</span>
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      )}

                      {/* Vendor Portal */}
                      <div 
                        onClick={() => handlePortalSelect('vendor')}
                        className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transform hover:-translate-y-2"
                      >
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                          <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Portal do Vendedor</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          Crie propostas, gerencie clientes e acompanhe suas vendas.
                        </p>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          <span>Acessar Portal</span>
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Financial Portal */}
                      <div 
                        onClick={() => handlePortalSelect('financial')}
                        className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transform hover:-translate-y-2"
                      >
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                          <DollarSign className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Portal Financeiro</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          Validação financeira, aprovações e análise de propostas.
                        </p>
                        <div className="flex items-center text-green-600 dark:text-green-400 font-semibold group-hover:text-green-700 dark:group-hover:text-green-300">
                          <span>Acessar Portal</span>
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Implementation Portal */}
                      <div 
                        onClick={() => handlePortalSelect('implementation')}
                        className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transform hover:-translate-y-2"
                      >
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                          <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Portal de Implementação</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          Automação, processamento e implementação de propostas.
                        </p>
                        <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:text-purple-700 dark:group-hover:text-purple-300">
                          <span>Acessar Portal</span>
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Supervisor Portal */}
                      <div 
                        onClick={() => handlePortalSelect('supervisor')}
                        className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 transform hover:-translate-y-2"
                      >
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                          <Crown className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Portal do Supervisor</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          Supervisão de equipe, relatórios e análise de performance.
                        </p>
                        <div className="flex items-center text-orange-600 dark:text-orange-400 font-semibold group-hover:text-orange-700 dark:group-hover:text-orange-300">
                          <span>Acessar Portal</span>
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Restricted Area */}
                      <div 
                        onClick={() => handlePortalSelect('restricted')}
                        className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transform hover:-translate-y-2"
                      >
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Área Restrita</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          Administração do sistema, configurações e integrações.
                        </p>
                        <div className="flex items-center text-red-600 dark:text-red-400 font-semibold group-hover:text-red-700 dark:group-hover:text-red-300">
                          <span>Acessar Portal</span>
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            ) : (
              // Show appropriate portal based on user role
              <div className="min-h-screen">
                {currentPortal === 'vendor' && <VendorPortal user={currentUser} onLogout={handleLogout} />}
                {currentPortal === 'client' && <ClientPortal user={currentUser} onLogout={handleLogout} />}
                {currentPortal === 'financial' && <FinancialPortal user={currentUser} onLogout={handleLogout} />}
                {currentPortal === 'implementation' && <ImplantacaoPortal user={currentUser} onLogout={handleLogout} />}
                {currentPortal === 'supervisor' && <SupervisorPortal user={currentUser} onLogout={handleLogout} />}
                {currentPortal === 'restricted' && <RestrictedAreaPortal user={currentUser} onLogout={handleLogout} />}
              </div>
            )}
          </>
        )}

        {/* Mobile refresh button for logged users */}
        {currentUser && !clientProposalToken && (
          <div className="fixed top-4 right-4 z-40 lg:hidden">
            <MobileRefreshButton />
          </div>
        )}

        {/* Global chat assistant - only show for logged in users and not on client proposal view */}
        {currentUser && !clientProposalToken && (
          <>
            {/* Chat toggle button */}
            <button
              onClick={() => setShowChat(!showChat)}
              className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50"
              title="Assistente Virtual"
            >
              <MessageCircle className="w-6 h-6" />
            </button>

            {/* Chat window */}
            {showChat && (
              <div className="fixed bottom-24 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50 flex flex-col">
                {/* Chat header */}
                <div className="p-4 bg-blue-600 text-white rounded-t-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <span className="font-medium">Assistente Virtual</span>
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Chat messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          message.isBot
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat input */}
                <div className="p-4 border-t dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;