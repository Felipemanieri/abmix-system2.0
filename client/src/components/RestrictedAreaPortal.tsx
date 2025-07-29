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
import ApiManagementPanel from './ApiManagementPanel';
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
    { id: 'api', name: 'API', icon: Globe },
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

      case 'api':
        return <ApiManagementPanel />;

      case 'gestao-usuarios-unificada':
        return <UserManagementDashboard />;

      case 'sistema':
        return (
          <div className="space-y-6">
            {/* Configurações Centralizadas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Configurações Centralizadas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Gerencie configurações globais que afetam todo o sistema
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Seção: Identidade Visual */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Identidade Visual
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        defaultValue="Abmix Sistema"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cor Principal do Sistema
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          defaultValue="#4F46E5"
                          className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">#4F46E5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção: Configurações de Email */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                    Configurações de Email Automático
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Remetente Padrão
                      </label>
                      <input
                        type="email"
                        defaultValue="sistema@abmix.digital"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nome do Remetente
                      </label>
                      <input
                        type="text"
                        defaultValue="Sistema Abmix"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Enviar email quando nova proposta for criada
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Notificar supervisores sobre propostas pendentes
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Enviar relatório diário por email
                      </span>
                    </label>
                  </div>
                </div>

                {/* Seção: Armazenamento Híbrido */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <HardDrive className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400" />
                    Sistema de Armazenamento Local Primeiro
                  </h4>
                  
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>Sistema Local Primeiro:</strong> TODOS os arquivos ficam no sistema local independente do tamanho. Após o tempo configurado (ex: 15 segundos), são enviados para o Drive automaticamente.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Sem limite de tamanho de arquivo
                          </span>
                        </label>
                        <p className="text-xs text-gray-500">Quando ativado, permite arquivos de qualquer tamanho</p>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tempo para Envio ao Drive (segundos)
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                          <option value="0">NUNCA - Arquivos ficam sempre locais</option>
                          <option value="5">5 segundos</option>
                          <option value="10">10 segundos</option>
                          <option value="15" selected>15 segundos</option>
                          <option value="30">30 segundos</option>
                          <option value="60">1 minuto</option>
                          <option value="300">5 minutos</option>
                          <option value="900">15 minutos</option>
                        </select>
                        <p className="text-xs text-gray-500">Tempo que arquivo fica local antes de ir para Drive</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/centralized-configs', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                unlimited_files: true,
                                local_file_limit_mb: 0,
                                session_timeout_minutes: 0,
                                updated_by: 'sistema@abmix.com.br'
                              })
                            });
                            
                            if (response.ok) {
                              showInternalNotification('💾 Configurações de armazenamento salvas!', 'success');
                            } else {
                              showInternalNotification('❌ Erro ao salvar', 'error');
                            }
                          } catch (error) {
                            showInternalNotification('❌ Erro de conexão', 'error');
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        💾 Salvar Armazenamento
                      </button>
                    </div>
                  </div>
                </div>

                {/* Seção: Configurações de Sessão */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Configurações de Sessão
                  </h4>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Timeout de Sessão
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                      <option value="0">SEM LIMITES - Nunca expira</option>
                      <option value="15">15 minutos</option>
                      <option value="30">30 minutos</option>
                      <option value="60">1 hora</option>
                      <option value="120">2 horas</option>
                      <option value="240">4 horas</option>
                      <option value="480">8 horas</option>
                      <option value="720">12 horas</option>
                      <option value="1440">24 horas</option>
                      <option value="2880">48 horas</option>
                      <option value="10080">1 semana</option>
                    </select>
                    <p className="text-xs text-gray-500">Recomendado: SEM LIMITES para desenvolvimento</p>
                  </div>
                </div>

                {/* Seção: Configurações Regionais */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                    Configurações Regionais
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Timezone
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                        <option value="America/Sao_Paulo">América/São Paulo (BRT)</option>
                        <option value="America/New_York">América/Nova York (EST)</option>
                        <option value="Europe/London">Europa/London (GMT)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Formato de Data
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                        <option value="DD/MM/YYYY">DD/MM/AAAA (Brasil)</option>
                        <option value="MM/DD/YYYY">MM/DD/AAAA (EUA)</option>
                        <option value="YYYY-MM-DD">AAAA-MM-DD (ISO)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Moeda Padrão
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                        <option value="BRL">Real Brasileiro (R$)</option>
                        <option value="USD">Dólar Americano ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => showInternalNotification('Configurações restauradas para padrão', 'info')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Restaurar Padrão
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        // Salvar todas as configurações centralizadas
                        const response = await fetch('/api/centralized-configs', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            unlimited_files: true,
                            local_file_limit_mb: 0,
                            session_timeout_minutes: 0,
                            company_name: 'Abmix Sistema',
                            primary_color: '#4F46E5',
                            updated_by: 'felipe@abmix.com.br'
                          })
                        });
                        
                        if (response.ok) {
                          showInternalNotification('✅ Configurações salvas com sucesso!', 'success');
                        } else {
                          showInternalNotification('❌ Erro ao salvar configurações', 'error');
                        }
                      } catch (error) {
                        console.error('Erro:', error);
                        showInternalNotification('❌ Erro de conexão', 'error');
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Todas as Configurações
                  </button>
                </div>
              </div>
            </div>


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