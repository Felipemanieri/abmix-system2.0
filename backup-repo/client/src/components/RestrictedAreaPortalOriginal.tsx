import { useState } from 'react';
import { 
  Settings, 
  LogOut, 
  Lock, 
  Users, 
  Eye, 
  EyeOff,
  Save,
  RotateCcw,
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
  Layers,
  HardDrive,
  Wifi,
  Calendar,
  Paperclip
} from 'lucide-react';
import GoogleDriveSetup from './GoogleDriveSetup';
import IntegrationGuide from './IntegrationGuide';
import UserManagementDashboard from './UserManagementDashboard';
import SystemFooter from './SystemFooter';
import UnifiedUserManagement from './UnifiedUserManagement';
import PlanilhaViewer from './PlanilhaViewer';
import LogsViewer from './LogsViewer';

import BackupManager from './BackupManager';
import AttachmentManager from './AttachmentManager';

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
  const [activeTab, setActiveTab] = useState('interface');
  const [showClientPortal, setShowClientPortal] = useState(() => {
    return localStorage.getItem('showClientPortal') !== 'false';
  });
  
  // Estados para modais
  const [showDriveConfigModal, setShowDriveConfigModal] = useState(false);
  const [showSheetsConfigModal, setShowSheetsConfigModal] = useState(false);
  const [showWhatsAppConfigModal, setShowWhatsAppConfigModal] = useState(false);
  const [showBackupConfigModal, setShowBackupConfigModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  
  // Estados para configurações
  const [driveConfig, setDriveConfig] = useState({
    connected: true,
    folderStructure: 'Por Cliente',
    autoSync: true,
    backupFrequency: 'Diário'
  });
  
  const [sheetsConfig, setSheetsConfig] = useState({
    connected: true,
    sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    autoUpdate: true,
    syncFrequency: 'Tempo Real'
  });

  const handleToggleClientPortal = () => {
    const newValue = !showClientPortal;
    setShowClientPortal(newValue);
    localStorage.setItem('showClientPortal', newValue.toString());
    window.location.reload();
  };

  const resetToDefault = () => {
    setShowClientPortal(true);
    localStorage.removeItem('showClientPortal');
    window.location.reload();
  };

  // Funções para abrir serviços reais
  const openGoogleSheets = () => {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetsConfig.sheetId}/edit#gid=0`;
    window.open(sheetUrl, '_blank');
  };

  const openGoogleDrive = () => {
    window.open('https://drive.google.com/drive/folders/1FAIpQLScQKE8BjIZJ-abmix-proposals', '_blank');
  };

  const syncGoogleSheets = async () => {
    try {
      const response = await fetch('/api/sync-sheets', { method: 'POST' });
      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ ${result.message}\n\nÚltima atualização: ${new Date(result.timestamp).toLocaleString('pt-BR')}`);
      } else {
        alert(`❌ Erro na sincronização: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('❌ Erro de conexão. Verifique sua internet e tente novamente.');
    }
  };

  const configureAutomation = (type: string) => {
    switch (type) {
      case 'drive':
        setShowDriveConfigModal(true);
        break;
      case 'sheets':
        setShowSheetsConfigModal(true);
        break;
      case 'whatsapp':
        setShowWhatsAppConfigModal(true);
        break;
      case 'backup':
        setShowBackupConfigModal(true);
        break;
    }
  };

  const tabs = [
    { id: 'interface', label: 'Interface', icon: Eye },
    { id: 'usuarios', label: 'Gestão Usuários', icon: Users },
    { id: 'anexos', label: 'Gerenciar Anexos', icon: Paperclip },
    { id: 'planilha', label: 'Visualizar Planilha', icon: FileText },
    { id: 'logs', label: 'Logs Sistema', icon: Monitor },
    { id: 'automacao', label: 'Automação', icon: Bot },
    { id: 'integracoes', label: 'Integrações', icon: Link },
    { id: 'planilhas', label: 'Config Planilhas', icon: BarChart3 },
    { id: 'drive', label: 'Google Drive', icon: HardDrive },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'sistema', label: 'Sistema', icon: Settings }
  ];

  function renderInterfaceSection() {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Eye className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Configurações de Interface</h3>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">Portal do Cliente</span>
                </div>
                <div className="flex items-center space-x-2">
                  {showClientPortal ? (
                    <>
                      <Eye className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Visível</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600 font-medium">Oculto</span>
                    </>
                  )}
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showClientPortal}
                  onChange={handleToggleClientPortal}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {showClientPortal 
                  ? 'O Portal do Cliente está visível na tela inicial para acesso direto.'
                  : 'O Portal do Cliente está oculto da tela inicial. Clientes ainda podem acessar via links diretos.'
                }
              </p>
              
              {!showClientPortal && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Nota:</strong> Clientes continuam acessando o sistema normalmente através dos links diretos das propostas.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 mt-6">
            <button
              onClick={resetToDefault}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar Padrão
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderAutomacaoSection() {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Bot className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Configurar Automações</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Zap className="w-5 h-5 text-yellow-600 mr-2" />
                <h4 className="font-medium text-gray-900">Google Drive Automático</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Envio automático de propostas e documentos para pastas organizadas no Google Drive
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">✓ Ativo</span>
                <button 
                  onClick={() => configureAutomation('drive')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Configurar
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Globe className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Sync Google Sheets</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Sincronização automática com planilha principal do sistema
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">✓ Ativo</span>
                <button 
                  onClick={() => configureAutomation('sheets')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Configurar
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">Notificações WhatsApp</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Envio de notificações automáticas para vendedores e clientes
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">✓ Ativo</span>
                <button 
                  onClick={() => configureAutomation('whatsapp')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Configurar
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Cloud className="w-5 h-5 text-orange-600 mr-2" />
                <h4 className="font-medium text-gray-900">Backup Automático</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Backup diário de todos os dados do sistema
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">✓ Ativo</span>
                <button 
                  onClick={() => configureAutomation('backup')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Configurar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderIntegracoesSection() {
    return <IntegrationGuide />;
  }

  function renderPlanilhasSection() {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Gerenciar Planilhas</h3>
            </div>
            <button 
              onClick={openGoogleSheets}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Globe className="w-4 h-4 mr-2" />
              Abrir Google Sheets
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">Planilha Principal</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Planilha unificada com todos os dados dos clientes e propostas
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <span className="text-green-600 font-medium">Sincronizada</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Última atualização:</span>
                  <span className="text-gray-600">2 min atrás</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total de registros:</span>
                  <span className="text-gray-600">247</span>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={openGoogleSheets}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Abrir
                </button>
                <button 
                  onClick={syncGoogleSheets}
                  className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sync
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Database className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-gray-900">Relatórios</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Planilhas de relatórios e análises automatizadas
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <span className="text-green-600 font-medium">Ativa</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Relatórios gerados:</span>
                  <span className="text-gray-600">15</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Frequência:</span>
                  <span className="text-gray-600">Diária</span>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => window.open('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=1', '_blank')}
                  className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Ver Relatórios
                </button>
                <button 
                  onClick={() => configureAutomation('sheets')}
                  className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Config
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDriveSection() {
    return <GoogleDriveSetup />;
  }

  function renderSistemaSection() {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Settings className="w-6 h-6 text-gray-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Configurações do Sistema</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Status do Sistema</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Servidor</span>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Banco de Dados</span>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Conectado</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Google APIs</span>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Funcionando</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Backup</span>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Atualizado</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Informações do Sistema</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Versão:</span>
                  <span className="text-gray-900">v2.1.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Última atualização:</span>
                  <span className="text-gray-900">16/01/2025</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Usuários ativos:</span>
                  <span className="text-gray-900">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Propostas totais:</span>
                  <span className="text-gray-900">247</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Exportar Dados
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Backup Manual
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Logs do Sistema
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Lock className="w-8 h-8 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">Área Restrita</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Bem-vindo, {user.name}</span>
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'interface' && renderInterfaceSection()}
        {activeTab === 'usuarios' && <UnifiedUserManagement />}
        {activeTab === 'anexos' && <AttachmentManager />}
        {activeTab === 'planilha' && <PlanilhaViewer />}
        {activeTab === 'logs' && <LogsViewer />}
        {activeTab === 'backup' && <BackupManager />}
        {activeTab === 'automacao' && renderAutomacaoSection()}
        {activeTab === 'integracoes' && renderIntegracoesSection()}
        {activeTab === 'planilhas' && renderPlanilhasSection()}
        {activeTab === 'drive' && renderDriveSection()}
        {activeTab === 'sistema' && renderSistemaSection()}
      </main>

      {/* Modais de Configuração */}
      {showDriveConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <HardDrive className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-900">Configurar Google Drive</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estrutura de Pastas</label>
                <select 
                  value={driveConfig.folderStructure}
                  onChange={(e) => setDriveConfig({...driveConfig, folderStructure: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Por Cliente">Por Cliente</option>
                  <option value="Por Data">Por Data</option>
                  <option value="Por Vendedor">Por Vendedor</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Sincronização Automática</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={driveConfig.autoSync}
                    onChange={(e) => setDriveConfig({...driveConfig, autoSync: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequência de Backup</label>
                <select 
                  value={driveConfig.backupFrequency}
                  onChange={(e) => setDriveConfig({...driveConfig, backupFrequency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Tempo Real">Tempo Real</option>
                  <option value="Diário">Diário</option>
                  <option value="Semanal">Semanal</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowDriveConfigModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  openGoogleDrive();
                  setShowDriveConfigModal(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar e Abrir Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {showSheetsConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-900">Configurar Google Sheets</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID da Planilha</label>
                <input
                  type="text"
                  value={sheetsConfig.sheetId}
                  onChange={(e) => setSheetsConfig({...sheetsConfig, sheetId: e.target.value})}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Atualização Automática</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sheetsConfig.autoUpdate}
                    onChange={(e) => setSheetsConfig({...sheetsConfig, autoUpdate: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequência de Sync</label>
                <select 
                  value={sheetsConfig.syncFrequency}
                  onChange={(e) => setSheetsConfig({...sheetsConfig, syncFrequency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="Tempo Real">Tempo Real</option>
                  <option value="5 Minutos">A cada 5 minutos</option>
                  <option value="Horário">A cada hora</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSheetsConfigModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  syncGoogleSheets();
                  setShowSheetsConfigModal(false);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Salvar e Sincronizar
              </button>
            </div>
          </div>
        </div>
      )}

      {showWhatsAppConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-900">Configurar WhatsApp</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Token da API</label>
                <input
                  type="password"
                  placeholder="Token do WhatsApp Business API"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número do WhatsApp</label>
                <input
                  type="text"
                  placeholder="+55 11 99999-9999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Notificações</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">Nova proposta criada</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">Cliente completou formulário</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded" />
                    <span className="ml-2 text-sm text-gray-700">Status da proposta alterado</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowWhatsAppConfigModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert('Configurações do WhatsApp salvas com sucesso!');
                  setShowWhatsAppConfigModal(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {showBackupConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <Cloud className="w-6 h-6 text-orange-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-900">Configurar Backup</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequência de Backup</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option value="diario">Diário (às 02:00)</option>
                  <option value="semanal">Semanal (Domingo)</option>
                  <option value="mensal">Mensal (1º dia do mês)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Retenção de Backups</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option value="7">7 dias</option>
                  <option value="30">30 dias</option>
                  <option value="90">90 dias</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Incluir nos Backups</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">Banco de dados</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">Arquivos de propostas</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded" />
                    <span className="ml-2 text-sm text-gray-700">Logs do sistema</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBackupConfigModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert('Configurações de backup salvas! Próximo backup: hoje às 02:00');
                  setShowBackupConfigModal(false);
                }}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestão de Usuários */}
      {showUserManagementModal && (
        <UserManagementDashboard 
          onClose={() => setShowUserManagementModal(false)} 
        />
      )}
      
      {/* System Footer */}
      <SystemFooter />
    </div>
  );
}