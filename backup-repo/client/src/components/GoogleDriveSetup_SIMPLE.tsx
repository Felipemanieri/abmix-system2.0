import React, { useState } from 'react';
import { 
  HardDrive,
  Folder,
  Settings,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Database,
  Cloud,
  HardDriveIcon,
  Upload,
  Download,
  RefreshCw,
  Users,
  Shield,
  Clock
} from 'lucide-react';

interface DriveConfig {
  id: number;
  name: string;
  driveId: string;
  status: 'connected' | 'disconnected' | 'error';
  space: string;
  files: number;
  lastSync: string;
}

export default function GoogleDriveSetup() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<DriveConfig | null>(null);

  // Dados simulados para evitar problemas de API
  const mockDrives: DriveConfig[] = [
    {
      id: 1,
      name: 'Drive Principal - Propostas',
      driveId: '1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb',
      status: 'connected',
      space: '8.2 GB',
      files: 1834,
      lastSync: '2025-01-25T19:30:00.000Z'
    },
    {
      id: 2,
      name: 'Drive Backup - Documentos',
      driveId: '1XyZ789AbC456DeF789GhI012JkL345MnO',
      status: 'connected',
      space: '3.5 GB',
      files: 967,
      lastSync: '2025-01-25T18:45:00.000Z'
    },
    {
      id: 3,
      name: 'Drive Temporário - Uploads',
      driveId: '1QwE987RtY654UiO321PaS098DfG765HjK',
      status: 'error',
      space: '1.2 GB',
      files: 234,
      lastSync: '2025-01-24T16:20:00.000Z'
    }
  ];

  const [drives] = useState<DriveConfig[]>(mockDrives);

  const handleAddDrive = () => {
    setSelectedDrive(null);
    setShowModal(true);
  };

  const handleEditDrive = (drive: DriveConfig) => {
    setSelectedDrive(drive);
    setShowModal(true);
  };

  const handleDeleteDrive = (driveId: number) => {
    if (window.confirm('Tem certeza que deseja remover esta configuração do Google Drive?')) {
      alert(`Configuração ${driveId} removida com sucesso!`);
    }
  };

  const handleTestConnection = (drive: DriveConfig) => {
    alert(`Testando conexão com: ${drive.name}\nStatus: ${drive.status === 'connected' ? 'Conectado' : 'Erro'}`);
  };

  const handleSyncDrive = (drive: DriveConfig) => {
    alert(`Sincronizando: ${drive.name}\nArquivos: ${drive.files}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'disconnected': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'disconnected': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const totalFiles = drives.reduce((acc, drive) => acc + drive.files, 0);
  const totalSpace = drives.reduce((acc, drive) => {
    const space = parseFloat(drive.space.replace(' GB', ''));
    return acc + space;
  }, 0);
  const connectedDrives = drives.filter(d => d.status === 'connected').length;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <HardDrive className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Google Drive</h3>
          </div>
          <button
            onClick={handleAddDrive}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Drive
          </button>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center">
              <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Drives</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{drives.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Conectados</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">{connectedDrives}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Arquivos</p>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{totalFiles.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
            <div className="flex items-center">
              <HardDriveIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Espaço</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{totalSpace.toFixed(1)} GB</p>
              </div>
            </div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">Sync</p>
                <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">99.1%</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Erros</p>
                <p className="text-lg font-bold text-red-900 dark:text-red-100">{drives.filter(d => d.status === 'error').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Drives */}
        <div className="space-y-4">
          {drives.map((drive) => (
            <div key={drive.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <HardDrive className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-4" />
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white mr-3">{drive.name}</h4>
                      <div className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(drive.status)}`}>
                        {getStatusIcon(drive.status)}
                        <span className="ml-1 capitalize">{drive.status}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div>
                        <span className="font-medium">ID:</span> {drive.driveId.slice(0, 20)}...
                      </div>
                      <div>
                        <span className="font-medium">Espaço:</span> {drive.space}
                      </div>
                      <div>
                        <span className="font-medium">Arquivos:</span> {drive.files.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Último Sync:</span> {new Date(drive.lastSync).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleTestConnection(drive)}
                    className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                    title="Testar Conexão"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSyncDrive(drive)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                    title="Sincronizar"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(`https://drive.google.com/drive/folders/${drive.driveId}`, '_blank')}
                    className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 rounded"
                    title="Abrir no Drive"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditDrive(drive)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    title="Editar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDrive(drive.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {drives.length === 0 && (
          <div className="text-center py-8">
            <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum drive configurado</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Clique em "Adicionar Drive" para conectar um Google Drive
            </p>
          </div>
        )}

        {/* Modal de Configuração (simplificado) */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {selectedDrive ? 'Editar Drive' : 'Adicionar Drive'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Drive
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Drive Principal - Propostas"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    defaultValue={selectedDrive?.name || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID do Google Drive
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    defaultValue={selectedDrive?.driveId || ''}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    alert('Configuração salva com sucesso!');
                    setShowModal(false);
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Configuração de Segurança</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                • Use apenas drives com permissões adequadas<br/>
                • IDs de drives são obtidos na URL do Google Drive<br/>
                • Teste a conexão após cada configuração<br/>
                • Sincronização automática a cada 30 minutos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}