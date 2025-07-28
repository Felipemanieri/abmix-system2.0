import { useState, useEffect } from 'react';
import { 
  Settings, 
  LogOut, 
  Users, 
  Eye, 
  EyeOff,
  Zap,
  Database,
  Cloud,
  Globe,
  FileText,
  BarChart3,
  Bot,
  Link,
  Shield,
  Monitor,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  Calendar,
  Search,
  Download,
  Upload,
  Clock,
  RefreshCw,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Folder,
  Sun,
  Moon,
  Play,
  Pause,
  Info,
  Copy,
  Bell,
  Save,
  Book,
  FolderOpen,
  Terminal,
  Archive,
  TestTube,
  RotateCcw,
  DollarSign,
  MessageCircle,
  MessageSquare,
  X
} from 'lucide-react';

// Importações dos componentes criados
import GoogleSheetsManager from './GoogleSheetsManager';
import IntegrationManual from './IntegrationManual';
import SpreadsheetEditor from './SpreadsheetEditor';
import RealTimeSpreadsheetEditor from './RealTimeSpreadsheetEditor';
import AdvancedInternalMessage from './AdvancedInternalMessage';
import AutomationManager from './AutomationManager';
import GoogleDriveSetup from './GoogleDriveSetup';
import UserManagementDashboard from './UserManagementDashboard';
import LogsViewer from './LogsViewer';
import BackupManager from './BackupManager';
import TestCreator from './TestCreator';
import PlanilhaViewer from './PlanilhaViewer';
import InternalMessage from './InternalMessage';
import SystemFooter from './SystemFooter';
import { getDynamicGreeting } from '../utils/greetingHelper';

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface RestrictedAreaPortalProps {
  user: User;
  onLogout: () => void;
}

export default function RestrictedAreaPortal({ user, onLogout }: RestrictedAreaPortalProps) {
  // Tratamento de erro para evitar tela branca
  if (!user) {
    console.error('❌ RestrictedAreaPortal: usuário não encontrado');
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro de Autenticação</h1>
          <p className="text-gray-600 mb-4">Usuário não encontrado</p>
          <button 
            onClick={onLogout}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Fazer Login Novamente
          </button>
        </div>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState('interface');
  const [darkMode, setDarkMode] = useState(false);

  // Estado para controle de visibilidade dos portais
  const [portalVisibility, setPortalVisibility] = useState({
    showClientPortal: true,
    showVendorPortal: true,
    showFinancialPortal: true,
    showImplementationPortal: true,
    showSupervisorPortal: true
  });

  // Estado para notificações internas
  const [internalNotification, setInternalNotification] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info'
  });

  // Estado para Sistema de Mensagens Internas
  const [showAdvancedMessage, setShowAdvancedMessage] = useState(false);



  // Função para mostrar notificação interna
  const showInternalNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setInternalNotification({
      show: true,
      message,
      type
    });

    setTimeout(() => {
      setInternalNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };



  // Carrega configurações globais dos portais - PRIORIZA ESTADO LOCAL
  useEffect(() => {
    const loadPortalVisibility = async () => {
      try {
        // PRIMEIRO: Tenta carregar do localStorage (estado persistente local)
        const localData = localStorage.getItem('abmix_portal_visibility');
        if (localData) {
          const localConfig = JSON.parse(localData);
          console.log('🔥 CARREGANDO ESTADO PERSISTENTE LOCAL:', localConfig);
          setPortalVisibility(localConfig);
          return; // PARA AQUI - não busca da API se tem estado local
        }

        // SEGUNDO: Só busca da API se não tem estado local
        const response = await fetch('/api/portal-visibility');
        if (response.ok) {
          const data = await response.json();
          const converted = {
            showClientPortal: data.client === true,
            showVendorPortal: data.vendor === true,
            showFinancialPortal: data.financial === true,
            showImplementationPortal: data.implementation === true,
            showSupervisorPortal: data.supervisor === true
          };
          setPortalVisibility(converted);
          // Salva no localStorage para persistir
          localStorage.setItem('abmix_portal_visibility', JSON.stringify(converted));
        }
      } catch (error) {
        console.error('Erro ao carregar visibilidade dos portais:', error);
      }
    };

    loadPortalVisibility();
  }, []);

  // Atualizar visibilidade dos portais SEM RELOAD - FORÇA PERSISTÊNCIA
  const updatePortalVisibility = async (newVisibility: any) => {
    try {
      // FORÇA atualização imediata dos estados
      setPortalVisibility(newVisibility);
      localStorage.setItem('abmix_portal_visibility', JSON.stringify(newVisibility));

      // Chama a API para persistir GLOBALMENTE
      const apiData = {
        client: newVisibility.showClientPortal,
        vendor: newVisibility.showVendorPortal,
        financial: newVisibility.showFinancialPortal,
        implementation: newVisibility.showImplementationPortal,
        supervisor: newVisibility.showSupervisorPortal,
        restricted: true
      };

      const response = await fetch('/api/portal-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error('Falha na API');
      }

      // FORÇA evento para todos os componentes
      window.dispatchEvent(new CustomEvent('portalVisibilityChanged', { 
        detail: newVisibility 
      }));

      // FORÇA reload dos estados em toda aplicação
      window.dispatchEvent(new CustomEvent('storage', {
        detail: { key: 'abmix_portal_visibility', value: JSON.stringify(newVisibility) }
      }));

    } catch (error) {
      console.error('ERRO CRÍTICO ao atualizar configurações:', error);
      showInternalNotification('Erro ao salvar configuração', 'error');
    }
  };

  // Definição das abas do sistema
  const tabs = [
    { id: 'interface', name: 'Interface', icon: Monitor },
    { id: 'gestao-usuarios-unificada', name: 'Gestão Unificada de Usuários', icon: Users },
    { id: 'visualizar-planilha', name: 'Visualizar Planilha', icon: FileText },
    { id: 'logs-sistema', name: 'Logs Sistema', icon: Terminal },
    { id: 'automacao', name: 'Automação', icon: Zap },
    { id: 'integracoes', name: 'Manual de Integrações', icon: Book },
    { id: 'config-planilhas', name: 'Edição de Planilhas', icon: Edit },
    { id: 'google-drive', name: 'Google Drive', icon: FolderOpen },
    { id: 'backup-restore', name: 'Backup & Restore', icon: Archive },
    { id: 'sistema', name: 'Sistema', icon: Settings }
  ];

  // Renderizar conteúdo da aba ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'interface':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Eye className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Configurações de Interface
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Portal do Cliente */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Portal do Cliente</span>
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {portalVisibility.showClientPortal ? 'Visível' : 'Oculto'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const newVisibility = { ...portalVisibility, showClientPortal: !portalVisibility.showClientPortal };
                    updatePortalVisibility(newVisibility);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    portalVisibility.showClientPortal 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      portalVisibility.showClientPortal ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Portal Vendedor */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Portal Vendedor</span>
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {portalVisibility.showVendorPortal ? 'Visível' : 'Oculto'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const newVisibility = { ...portalVisibility, showVendorPortal: !portalVisibility.showVendorPortal };
                    updatePortalVisibility(newVisibility);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    portalVisibility.showVendorPortal 
                      ? 'bg-green-600' 
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      portalVisibility.showVendorPortal ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Portal Financeiro */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Portal Financeiro</span>
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {portalVisibility.showFinancialPortal ? 'Visível' : 'Oculto'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const newVisibility = { ...portalVisibility, showFinancialPortal: !portalVisibility.showFinancialPortal };
                    updatePortalVisibility(newVisibility);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    portalVisibility.showFinancialPortal 
                      ? 'bg-purple-600' 
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      portalVisibility.showFinancialPortal ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Portal Implantação */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <Zap className="w-5 h-5 text-teal-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Portal Implantação</span>
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {portalVisibility.showImplementationPortal ? 'Visível' : 'Oculto'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const newVisibility = { ...portalVisibility, showImplementationPortal: !portalVisibility.showImplementationPortal };
                    updatePortalVisibility(newVisibility);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    portalVisibility.showImplementationPortal 
                      ? 'bg-teal-600' 
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      portalVisibility.showImplementationPortal ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Portal Supervisor */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Portal Supervisor</span>
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {portalVisibility.showSupervisorPortal ? 'Visível' : 'Oculto'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const newVisibility = { ...portalVisibility, showSupervisorPortal: !portalVisibility.showSupervisorPortal };
                    updatePortalVisibility(newVisibility);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    portalVisibility.showSupervisorPortal 
                      ? 'bg-gray-600' 
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      portalVisibility.showSupervisorPortal ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Separação visual entre portais */}
              <div className="my-6 border-t border-gray-200 dark:border-gray-600"></div>

              {/* Botões de Controle do Sistema - Compactos e Discretos */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Controles do Sistema</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {/* Restaurar Padrão */}
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-2">
                    <button
                      onClick={() => {
                        const defaultVisibility = {
                          showClientPortal: true,
                          showVendorPortal: true,
                          showFinancialPortal: true,
                          showImplementationPortal: true,
                          showSupervisorPortal: true
                        };
                        updatePortalVisibility(defaultVisibility);
                        showInternalNotification('Sistema restaurado para configuração padrão de fábrica - todos os portais ativados', 'success');
                      }}
                      className="w-full flex flex-col items-center text-center p-1"
                    >
                      <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Restaurar Padrão</span>
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 leading-tight">
                      Ativa todos os 5 portais (Cliente, Vendedor, Financeiro, Implantação, Supervisor) restaurando a configuração original de fábrica do sistema
                    </p>

                  </div>

                  {/* Restaurar de Fábrica */}
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-2">
                    <button
                      onClick={() => {
                        const factoryDefaults = {
                          showClientPortal: true,
                          showVendorPortal: true,
                          showFinancialPortal: true,
                          showImplementationPortal: true,
                          showSupervisorPortal: true
                        };
                        updatePortalVisibility(factoryDefaults);
                        localStorage.clear();
                        showInternalNotification('Reset total executado - cache limpo, sessões removidas, configurações zeradas', 'success');
                      }}
                      className="w-full flex flex-col items-center text-center p-1"
                    >
                      <RefreshCw className="w-4 h-4 text-red-600 dark:text-red-400 mb-1" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Restaurar de Fábrica</span>
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 leading-tight">
                      Executa limpeza total do localStorage, remove todas as sessões salvas, credenciais e configurações personalizadas. Reset completo do sistema
                    </p>

                  </div>

                  {/* Backup do Site */}
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-2">
                    <button
                      onClick={() => {
                        try {
                          const backupData = {
                            timestamp: new Date().toISOString(),
                            portalVisibility: portalVisibility,
                            version: '1.0',
                            type: 'user_backup'
                          };
                          localStorage.setItem('abmix_user_backup', JSON.stringify(backupData));
                          showInternalNotification('Backup criado em localStorage com timestamp atual e configurações de visibilidade', 'success');
                        } catch (error) {
                          showInternalNotification('Falha ao criar backup - erro no localStorage', 'error');
                        }
                      }}
                      className="w-full flex flex-col items-center text-center p-1"
                    >
                      <Save className="w-4 h-4 text-green-600 dark:text-green-400 mb-1" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Backup do Site</span>
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 leading-tight">
                      Salva no localStorage a configuração atual de visibilidade dos portais com timestamp para posterior restauração via botão "Desfazer Última Ação"
                    </p>

                  </div>

                  {/* Desfazer Última Ação */}
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-2">
                    <button
                      onClick={() => {
                        try {
                          const backupData = localStorage.getItem('abmix_user_backup');
                          if (backupData) {
                            const backup = JSON.parse(backupData);
                            if (backup.portalVisibility) {
                              updatePortalVisibility(backup.portalVisibility);
                              showInternalNotification('Configuração anterior restaurada do backup localStorage', 'success');
                            }
                          } else {
                            showInternalNotification('Nenhum backup encontrado - execute Backup do Site primeiro', 'error');
                          }
                        } catch (error) {
                          showInternalNotification('Erro ao ler backup do localStorage', 'error');
                        }
                      }}
                      className="w-full flex flex-col items-center text-center p-1"
                    >
                      <Upload className="w-4 h-4 text-orange-600 dark:text-orange-400 mb-1" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Desfazer Última Ação</span>
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 leading-tight">
                      Desfaz a última modificação que foi feita no sistema, revertendo para o estado anterior antes da alteração
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );





      case 'visualizar-planilha':
        return <PlanilhaViewer />;

      case 'logs-sistema':
        return <LogsViewer />;

      case 'automacao':
        return <AutomationManager />;

      case 'integracoes':
        return <IntegrationManual />;

      case 'config-planilhas':
        return <RealTimeSpreadsheetEditor />;

      case 'google-drive':
        return <GoogleDriveSetup />;

      case 'backup-restore':
        return <BackupManager />;

      case 'gestao-usuarios-unificada':
        return <UserManagementDashboard />;

      case 'sistema':
        return (
          <div className="space-y-6">
            <TestCreator />
            <InternalMessage />
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Selecione uma aba para começar
            </p>
          </div>
        );
    }
  };

  // Testar conexões Google ao carregar COM TRATAMENTO DE ERRO
  useEffect(() => {
    const testConnections = async () => {
      try {
        const response = await fetch('/api/google/test-connections');
        const result = await response.json();

        if (result.success) {
          console.log('✅ Conexões Google OK');
        } else {
          console.warn('⚠️ Problemas nas conexões Google:', result);
        }
      } catch (error) {
        console.error('❌ Erro ao testar conexões:', error);
        // Tratar erro silenciosamente para não quebrar a interface
      }
    };

    // Executar com tratamento de promise rejeitada
    testConnections().catch(error => {
      console.error('❌ Promise rejeitada tratada - Conexões Google:', error);
    });
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/attached_assets/65be871e-f7a6-4f31-b1a9-cd0729a73ff8 copy copy.png" 
                alt="Abmix Logo" 
                className="h-8 w-auto"
                onError={(e) => {
                  console.log('Logo failed to load, trying alternative path');
                  e.currentTarget.src = '/65be871e-f7a6-4f31-b1a9-cd0729a73ff8 copy copy.png';
                }}
              />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Área Restrita
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {getDynamicGreeting(user.name)}
              </span>

              <button
                onClick={() => setShowAdvancedMessage(true)}
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="Sistema de Mensagens Internas"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title={darkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>

      {/* Notificação Interna */}
      {internalNotification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${
            internalNotification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : internalNotification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center">
              {internalNotification.type === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
              {internalNotification.type === 'error' && <AlertTriangle className="w-4 h-4 mr-2" />}
              {internalNotification.type === 'info' && <Info className="w-4 h-4 mr-2" />}
              <span className="text-sm font-medium">{internalNotification.message}</span>
              <button
                onClick={() => setInternalNotification(prev => ({ ...prev, show: false }))}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sistema de Mensagens Internas */}
      <AdvancedInternalMessage
        isOpen={showAdvancedMessage}
        onClose={() => setShowAdvancedMessage(false)}
        currentUser={user}
      />



      {/* System Footer */}
      <SystemFooter />
    </div>
  );
}