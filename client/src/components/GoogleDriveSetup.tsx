import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FolderOpen, 
  RefreshCw, 
  CheckCircle, 
  Pencil, 
  PlusCircle,
  X,
  Trash2,
  Settings 
} from 'lucide-react';

interface DriveTab {
  id: string;
  nome: string;
  tipo: 'drive' | 'backup';
  url?: string;
  ativo: boolean;
  dados?: {
    status: 'connected' | 'loading' | 'error';
    arquivos: number;
    pastas: number;
    capacidade: string;
    totalCapacidade: string;
    ultimaModificacao: string;
    ultimaSync: string;
  };
}

interface DriveData {
  status: 'connected' | 'loading' | 'error';
  arquivos: number;
  pastas: number;
  capacidade: string;
  totalCapacidade: string;
  ultimaModificacao: string;
  ultimaSync: string;
}

interface BackupData {
  status: 'connected' | 'loading' | 'error';
  arquivos: number;
  pastas: number;
  capacidade: string;
  totalCapacidade: string;
  ultimaModificacao: string;
  ultimaSync: string;
}

export default function GoogleDriveSetup() {
  const [activeTab, setActiveTab] = useState<string>('principal');
  const [showAddDriveModal, setShowAddDriveModal] = useState(false);
  const [newDriveForm, setNewDriveForm] = useState({
    nome: '',
    url: '',
    proprietario: '',
    linkCompartilhamento: '',
    observacao: ''
  });
  const [tabs, setTabs] = useState<DriveTab[]>([
    {
      id: 'backup',
      nome: 'Pasta de Backup do Sistema',
      tipo: 'backup',
      url: 'https://drive.google.com/drive/folders/1dnCgM8L4Qd9Fpkq-Xwdbd4X0-S7Mqhnu',
      ativo: true,
      dados: {
        status: 'loading',
        arquivos: 0,
        pastas: 0,
        capacidade: '0 GB',
        totalCapacidade: '15 GB',
        ultimaModificacao: '-',
        ultimaSync: '-'
      }
    },
    {
      id: 'principal',
      nome: 'Planilha Principal',
      tipo: 'drive',
      url: 'https://drive.google.com/drive/folders/1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb',
      ativo: true,
      dados: {
        status: 'loading',
        arquivos: 0,
        pastas: 0,
        capacidade: '0 GB',
        totalCapacidade: '15 GB',
        ultimaModificacao: '-',
        ultimaSync: '-'
      }
    }
  ]);

  // Estados para os dados dos drives
  const [driveData, setDriveData] = useState<DriveData>({
    status: 'loading',
    arquivos: 0,
    pastas: 0,
    capacidade: '0 GB',
    totalCapacidade: '15 GB',
    ultimaModificacao: '-',
    ultimaSync: '-'
  });

  const [backupData, setBackupData] = useState<BackupData>({
    status: 'loading',
    arquivos: 0,
    pastas: 0,
    capacidade: '0 GB',
    totalCapacidade: '15 GB',
    ultimaModificacao: '-',
    ultimaSync: '-'
  });

  const [isLoadingDriveData, setIsLoadingDriveData] = useState(false);
  const [isLoadingBackupData, setIsLoadingBackupData] = useState(false);

  // Função para buscar dados do Google Drive principal
  const fetchDriveData = async () => {
    setIsLoadingDriveData(true);
    try {
      const response = await fetch('/api/google/drive-info');
      if (response.ok) {
        const data = await response.json();
        setDriveData({
          status: 'connected',
          arquivos: data.fileCount || 0,
          pastas: data.folderCount || 0,
          capacidade: data.usedStorage || '0 GB',
          totalCapacidade: data.totalStorage || '15 GB',
          ultimaModificacao: data.lastModified || 'Nunca',
          ultimaSync: new Date().toLocaleString('pt-BR')
        });
      } else {
        setDriveData(prev => ({ ...prev, status: 'error' }));
      }
    } catch (error) {
      console.error('Erro ao buscar dados do drive:', error);
      setDriveData(prev => ({ ...prev, status: 'error' }));
    } finally {
      setIsLoadingDriveData(false);
    }
  };

  // Função para buscar dados da pasta de backup
  const fetchBackupData = async () => {
    setIsLoadingBackupData(true);
    try {
      const response = await fetch('/api/google/backup-drive-info');
      if (response.ok) {
        const data = await response.json();
        const newBackupData = {
          status: 'connected' as const,
          arquivos: data.fileCount || 0,
          pastas: data.folderCount || 0,
          capacidade: data.usedStorage || '0 GB',
          totalCapacidade: data.totalStorage || '15 GB',
          ultimaModificacao: data.lastModified || 'Nunca',
          ultimaSync: new Date().toLocaleString('pt-BR')
        };
        
        setBackupData(newBackupData);
        
        // Atualizar dados na aba de backup
        setTabs(prevTabs => 
          prevTabs.map(tab => 
            tab.id === 'backup' 
              ? { ...tab, dados: newBackupData }
              : tab
          )
        );
      } else {
        setBackupData(prev => ({ ...prev, status: 'error' }));
      }
    } catch (error) {
      console.error('Erro ao buscar dados do backup:', error);
      setBackupData(prev => ({ ...prev, status: 'error' }));
    } finally {
      setIsLoadingBackupData(false);
    }
  };

  // Buscar dados na inicialização
  useEffect(() => {
    fetchDriveData();
    fetchBackupData();
  }, []);

  // Sincronização automática a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDriveData();
      fetchBackupData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleEditDrive = () => {
    console.log('Editar configurações do drive');
  };

  const handleAddNewDrive = () => {
    setShowAddDriveModal(true);
  };

  const handleSaveNewDrive = () => {
    if (!newDriveForm.nome || !newDriveForm.url) {
      alert('Nome e URL são obrigatórios');
      return;
    }

    const newDriveId = `drive-${Date.now()}`;
    const newTab: DriveTab = {
      id: newDriveId,
      nome: newDriveForm.nome,
      tipo: 'drive',
      url: newDriveForm.url,
      ativo: true,
      dados: {
        status: 'connected',
        arquivos: 0,
        pastas: 0,
        capacidade: '0 GB',
        totalCapacidade: '15 GB',
        ultimaModificacao: 'Agora',
        ultimaSync: new Date().toLocaleString('pt-BR')
      }
    };
    
    setTabs([...tabs, newTab]);
    setActiveTab(newDriveId);
    setShowAddDriveModal(false);
    setNewDriveForm({
      nome: '',
      url: '',
      proprietario: '',
      linkCompartilhamento: '',
      observacao: ''
    });
  };

  const handleRemoveDrive = (driveId: string) => {
    if (driveId === 'backup') {
      alert('Não é possível remover a pasta de backup do sistema');
      return;
    }
    
    if (confirm('Tem certeza que deseja remover este drive?')) {
      const newTabs = tabs.filter(tab => tab.id !== driveId);
      setTabs(newTabs);
      
      if (activeTab === driveId) {
        setActiveTab(newTabs.length > 0 ? newTabs[0].id : 'backup');
      }
    }
  };

  const renderTabContent = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (!currentTab) return null;

    if (currentTab.tipo === 'backup') {
      return (
        <div className="space-y-6">
          {/* Seção de Informações da Pasta de Backup */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h5 className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                  Informações da Pasta de Backup
                </h5>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Sincronização automática com Google Drive
                </p>
              </div>
              <button
                onClick={fetchBackupData}
                disabled={isLoadingBackupData}
                className="px-3 py-2 bg-orange-100 hover:bg-orange-200 dark:bg-orange-700 dark:hover:bg-orange-600 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-600 rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50"
                title="Atualizar dados da pasta de backup"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingBackupData ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-orange-100 dark:bg-orange-800/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
                  {backupData.pastas}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Pastas</div>
              </div>
              <div className="bg-orange-100 dark:bg-orange-800/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
                  {backupData.arquivos.toLocaleString()}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Arquivos</div>
              </div>
              <div className="bg-orange-100 dark:bg-orange-800/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
                  {backupData.capacidade}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Espaço Usado</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-700 dark:text-orange-300">Status da Conexão</span>
                <div className="flex items-center">
                  <CheckCircle className={`w-4 h-4 mr-1 ${
                    backupData.status === 'connected' ? 'text-green-500' : 
                    backupData.status === 'loading' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                  <span className={`text-sm ${
                    backupData.status === 'connected' ? 'text-green-600 dark:text-green-400' : 
                    backupData.status === 'loading' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {backupData.status === 'connected' ? 'Conectado' : 
                     backupData.status === 'loading' ? 'Sincronizando...' : 'Erro'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-700 dark:text-orange-300">Última Sincronização</span>
                <span className="text-sm text-orange-800 dark:text-orange-200">{backupData.ultimaSync}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-700 dark:text-orange-300">Pasta de Backup</span>
                <span className="text-sm text-orange-800 dark:text-orange-200">Sistema Abmix</span>
              </div>
            </div>
          </div>

          {/* Ações da Pasta de Backup */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.open('https://drive.google.com/drive/folders/1dnCgM8L4Qd9Fpkq-Xwdbd4X0-S7Mqhnu?usp=drive_link', '_blank')}
                className="px-4 py-2 bg-orange-100 hover:bg-orange-200 dark:bg-orange-700 dark:hover:bg-orange-600 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                title="Abrir pasta de backup no Google Drive"
              >
                <FolderOpen className="w-4 h-4" />
                Abrir no Google Drive
              </button>
            </div>
            
            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
              backupData.status === 'connected' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
              backupData.status === 'loading' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
              'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              {backupData.status === 'connected' ? 'Sincronizado' : 
               backupData.status === 'loading' ? 'Sincronizando...' : 'Erro de Conexão'}
            </div>
          </div>
        </div>
      );
    }

    // Conteúdo para abas de drive normais
    const currentTabData = currentTab.tipo === 'backup' ? backupData : driveData;
    const isCurrentTabLoading = currentTab.tipo === 'backup' ? isLoadingBackupData : isLoadingDriveData;
    const fetchCurrentTabData = currentTab.tipo === 'backup' ? fetchBackupData : fetchDriveData;
    const driveUrl = currentTab.tipo === 'backup' 
      ? 'https://drive.google.com/drive/folders/1dnCgM8L4Qd9Fpkq-Xwdbd4X0-S7Mqhnu?usp=drive_link'
      : 'https://drive.google.com/drive/folders/1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb?usp=drive_link';

    return (
      <div className="space-y-6">
        {/* Seção de Informações do Drive */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                {currentTab.nome}
              </h5>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Conectado: {driveUrl}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Proprietário: Felipe Manieri | Auto: 5 minutos
              </p>
            </div>
            <button
              onClick={fetchCurrentTabData}
              disabled={isCurrentTabLoading}
              className="px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50"
              title="Atualizar dados do drive"
            >
              <RefreshCw className={`w-4 h-4 ${isCurrentTabLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-100 dark:bg-blue-800/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {currentTabData.pastas}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Pastas</div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-800/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {currentTabData.arquivos.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Arquivos</div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-800/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {currentTabData.capacidade}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Capacidade</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">Status da Conexão</span>
              <div className="flex items-center">
                <CheckCircle className={`w-4 h-4 mr-1 ${
                  currentTabData.status === 'connected' ? 'text-green-500' : 
                  currentTabData.status === 'loading' ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <span className={`text-sm ${
                  currentTabData.status === 'connected' ? 'text-green-600 dark:text-green-400' : 
                  currentTabData.status === 'loading' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {currentTabData.status === 'connected' ? 'Conectado' : 
                   currentTabData.status === 'loading' ? 'Sincronizando...' : 'Erro'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">Última Sincronização</span>
              <span className="text-sm text-blue-800 dark:text-blue-200">{currentTabData.ultimaSync}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">Última modificação</span>
              <span className="text-sm text-blue-800 dark:text-blue-200">{currentTabData.ultimaModificacao}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">Backup</span>
              <span className="text-sm text-blue-800 dark:text-blue-200">5 minutos</span>
            </div>
          </div>
        </div>

        {/* Ações do Drive */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.open('https://drive.google.com/drive/folders/1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb?usp=drive_link', '_blank')}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              title="Abrir no Google Drive"
            >
              <FolderOpen className="w-4 h-4" />
              Abrir no Google Drive
            </button>
            
            <button
              onClick={handleEditDrive}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              title="Editar configurações"
            >
              <Pencil className="w-4 h-4" />
              Editar
            </button>
          </div>
          
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            driveData.status === 'connected' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
            driveData.status === 'loading' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
            'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}>
            {driveData.status === 'connected' ? 'Conectado' : 
             driveData.status === 'loading' ? 'Sincronizando...' : 'Erro de Conexão'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de adicionar drive */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuração do Google Drive
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gerencie suas conexões com o Google Drive
          </p>
        </div>
        <button
          onClick={handleAddNewDrive}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          title="Adicionar novo drive"
        >
          <PlusCircle className="w-4 h-4" />
          Adicionar Novo Drive
        </button>
      </div>

      {/* Container principal com abas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Sistema de abas */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <div key={tab.id} className="flex items-center group">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? tab.tipo === 'backup' 
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                        : 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center`}
                >
                  {tab.nome}
                  {tab.tipo === 'backup' && (
                    <span className="ml-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded text-xs font-medium">
                      Backup
                    </span>
                  )}
                  {tab.tipo === 'drive' && tab.id !== 'principal' && (
                    <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded text-xs font-medium">
                      Sistema
                    </span>
                  )}
                  
                  {/* Status em tempo real */}
                  <div className={`ml-2 w-2 h-2 rounded-full ${
                    (tab.tipo === 'backup' ? backupData.status : driveData.status) === 'connected' ? 'bg-green-500' :
                    (tab.tipo === 'backup' ? backupData.status : driveData.status) === 'loading' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </button>
                
                {/* Botão remover (apenas para drives criados pelo usuário) */}
                {tab.tipo === 'drive' && tab.id !== 'principal' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDrive(tab.id);
                    }}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
                    title="Remover drive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Conteúdo da aba ativa */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Modal Adicionar Novo Drive */}
      {showAddDriveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <PlusCircle className="w-5 h-5 mr-2 text-blue-600" />
                Adicionar Novo Drive
              </h3>
              <button
                onClick={() => setShowAddDriveModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Drive *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Drive Principal"
                  value={newDriveForm.nome}
                  onChange={(e) => setNewDriveForm({...newDriveForm, nome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL do Google Drive *
                </label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={newDriveForm.url}
                  onChange={(e) => setNewDriveForm({...newDriveForm, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Proprietário *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Felipe Manieri"
                  value={newDriveForm.proprietario}
                  onChange={(e) => setNewDriveForm({...newDriveForm, proprietario: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link de Compartilhamento (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Link de compartilhamento do drive"
                  value={newDriveForm.linkCompartilhamento}
                  onChange={(e) => setNewDriveForm({...newDriveForm, linkCompartilhamento: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observação (Opcional)
                </label>
                <textarea
                  placeholder="Ex: Drive para documentos principais"
                  value={newDriveForm.observacao}
                  onChange={(e) => setNewDriveForm({...newDriveForm, observacao: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddDriveModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNewDrive}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Adicionar Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seção de informações em tempo real */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Drive Principal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Drive Principal</h4>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                driveData.status === 'connected' ? 'bg-green-500' :
                driveData.status === 'loading' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {driveData.status === 'connected' ? 'Conectado' :
                 driveData.status === 'loading' ? 'Carregando...' : 'Erro'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {driveData.arquivos}
              </div>
              <div className="text-xs text-blue-500 dark:text-blue-400">Arquivos</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {driveData.pastas}
              </div>
              <div className="text-xs text-green-500 dark:text-green-400">Pastas</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {driveData.capacidade}
              </div>
              <div className="text-xs text-purple-500 dark:text-purple-400">Usado</div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Última sync: {driveData.ultimaSync}
          </div>
        </div>

        {/* Card Backup */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Pasta de Backup</h4>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                backupData.status === 'connected' ? 'bg-green-500' :
                backupData.status === 'loading' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {backupData.status === 'connected' ? 'Conectado' :
                 backupData.status === 'loading' ? 'Carregando...' : 'Erro'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-2">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {backupData.arquivos}
              </div>
              <div className="text-xs text-orange-500 dark:text-orange-400">Arquivos</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-2">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {backupData.pastas}
              </div>
              <div className="text-xs text-orange-500 dark:text-orange-400">Pastas</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-2">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {backupData.capacidade}
              </div>
              <div className="text-xs text-orange-500 dark:text-orange-400">Usado</div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Última sync: {backupData.ultimaSync}
          </div>
        </div>
      </div>
    </div>
  );
}