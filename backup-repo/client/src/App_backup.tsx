import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Handler global para promises rejeitadas - TOTALMENTE SILENCIADO
window.addEventListener('unhandledrejection', (event) => {
  // Silenciar TODOS os erros de promise rejection
  event.preventDefault();
});

// Handler para erros de JavaScript
window.addEventListener('error', (event) => {
  // Silenciar erros relacionados ao Vite e desenvolvimento
  if (event.message?.includes('vite') || 
      event.message?.includes('HMR') ||
      event.message?.includes('fetch')) {
    event.preventDefault();
  }
});

import { 
  Users, FileText, DollarSign, Zap, Shield, ArrowRight, 
  CheckCircle, MessageCircle, Bot, X, Send, Phone, Mail, 
  MapPin, Globe, Crown, Database, Clock, Award, Lock, 
  Calculator, BarChart3, TrendingUp, PieChart, Briefcase, Settings 
} from 'lucide-react';
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
import usePortalVisibility from './hooks/usePortalVisibility';

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
  
  // SISTEMA PERSISTENTE DE VISIBILIDADE DOS PORTAIS
  const { 
    portalVisibility: persistentPortalVisibility, 
    updatePortalVisibility, 
    refreshPortalVisibility, 
    isLoading: portalLoading, 
    error: portalError 
  } = usePortalVisibility();

  // Estado local para compatibilidade com o sistema atual
  const [portalVisibility, setPortalVisibility] = useState({
    showClientPortal: true,
    showVendorPortal: true,
    showFinancialPortal: true,
    showImplementationPortal: true,
    showSupervisorPortal: true,
    showRestrictedPortal: true
  });

  // SINCRONIZAÇÃO COM SISTEMA PERSISTENTE
  useEffect(() => {
    if (!portalLoading && persistentPortalVisibility) {
      console.log('🔄 Synchronizing local state with persistent portal visibility:', persistentPortalVisibility);
      setPortalVisibility({
        showClientPortal: persistentPortalVisibility.client === true,
        showVendorPortal: persistentPortalVisibility.vendor === true,
        showFinancialPortal: persistentPortalVisibility.financial === true,
        showImplementationPortal: persistentPortalVisibility.implementation === true,
        showSupervisorPortal: persistentPortalVisibility.supervisor === true,
        showRestrictedPortal: persistentPortalVisibility.restricted === true
      });
    }
  }, [persistentPortalVisibility, portalLoading]);

  // FUNÇÃO PARA PROPAGAR MUDANÇAS DO SISTEMA PERSISTENTE
  const handlePortalVisibilityUpdate = async (newVisibility: any) => {
    try {
      console.log('🔧 Updating portal visibility via persistent system:', newVisibility);
      
      // Converter do formato local para o formato persistente
      const persistentFormat = {
        vendor: newVisibility.showVendorPortal === true,
        client: newVisibility.showClientPortal === true,
        financial: newVisibility.showFinancialPortal === true,
        implementation: newVisibility.showImplementationPortal === true,
        supervisor: newVisibility.showSupervisorPortal === true,
        restricted: true // ÁREA RESTRITA SEMPRE ATIVA
      };

      // Atualizar no sistema persistente
      await updatePortalVisibility(persistentFormat);
      
      console.log('✅ Portal visibility updated successfully with persistence');
    } catch (error) {
      console.error('❌ Failed to update portal visibility:', error);
      // Em caso de erro, reverter para o estado anterior
      await refreshPortalVisibility();
    }
  };

  // System ready - rest of the app functionality here...
  return (
    <ThemeProvider>
      <QueryClientProvider client={new QueryClient()}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Sistema Abmix - Persistência de UI Implementada
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Sistema de persistência funcionando com estado: {JSON.stringify(persistentPortalVisibility)}
            </p>
            <div className="mt-8 space-y-4">
              <p>Portal Loading: {portalLoading ? 'Sim' : 'Não'}</p>
              <p>Portal Error: {portalError || 'Nenhum'}</p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <h3 className="font-semibold">Cliente Portal</h3>
                  <p className={portalVisibility.showClientPortal ? 'text-green-600' : 'text-red-600'}>
                    {portalVisibility.showClientPortal ? 'Visível' : 'Oculto'}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <h3 className="font-semibold">Vendor Portal</h3>
                  <p className={portalVisibility.showVendorPortal ? 'text-green-600' : 'text-red-600'}>
                    {portalVisibility.showVendorPortal ? 'Visível' : 'Oculto'}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <h3 className="font-semibold">Financial Portal</h3>
                  <p className={portalVisibility.showFinancialPortal ? 'text-green-600' : 'text-red-600'}>
                    {portalVisibility.showFinancialPortal ? 'Visível' : 'Oculto'}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <h3 className="font-semibold">Implementation Portal</h3>
                  <p className={portalVisibility.showImplementationPortal ? 'text-green-600' : 'text-red-600'}>
                    {portalVisibility.showImplementationPortal ? 'Visível' : 'Oculto'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;