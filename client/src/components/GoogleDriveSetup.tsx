import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FolderOpen, 
  RefreshCw, 
  CheckCircle, 
  Pencil, 
  PlusCircle 
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
  const [activeTab, setActiveTab] = useState<string>('backup');
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
    const newDriveId = `drive-${tabs.length}`;
    const newTab: DriveTab = {
      id: newDriveId,
      nome: `Drive ${tabs.length}`,
      tipo: 'drive',
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
    };
    
    setTabs([...tabs, newTab]);
    setActiveTab(newDriveId);
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
    return (
      <div className="space-y-6">
        {/* Seção de Informações do Drive */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Informações do Drive
              </h5>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Fonte: Sistema Abmix
              </p>
            </div>
            <button
              onClick={fetchDriveData}
              disabled={isLoadingDriveData}
              className="px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50"
              title="Atualizar dados do drive"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingDriveData ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-100 dark:bg-blue-800/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {driveData.pastas}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Pastas</div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-800/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {driveData.arquivos.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Documentos</div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-800/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {driveData.capacidade}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Espaço Usado</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">Status da Conexão</span>
              <div className="flex items-center">
                <CheckCircle className={`w-4 h-4 mr-1 ${
                  driveData.status === 'connected' ? 'text-green-500' : 
                  driveData.status === 'loading' ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <span className={`text-sm ${
                  driveData.status === 'connected' ? 'text-green-600 dark:text-green-400' : 
                  driveData.status === 'loading' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {driveData.status === 'connected' ? 'Conectado' : 
                   driveData.status === 'loading' ? 'Sincronizando...' : 'Erro'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">Última Sincronização</span>
              <span className="text-sm text-blue-800 dark:text-blue-200">{driveData.ultimaSync}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">Pasta Principal</span>
              <span className="text-sm text-blue-800 dark:text-blue-200">Sistema Abmix</span>
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
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? tab.tipo === 'backup' 
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                {tab.nome}
                {tab.tipo === 'backup' && (
                  <span className="ml-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded text-xs font-medium">
                    Backup
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo da aba ativa */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}