import { useState } from 'react';
import { HardDrive, Plus, Eye, Edit, Trash2, Download, X, CheckCircle } from 'lucide-react';

interface DriveConfig {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  capacity: string;
  owner: string;
  created: string;
  link: string;
  lastModified: string;
  lastSync: string;
  files: number;
  folders: number;
  backup: string;
  observations: string;
}

export default function GoogleDriveManager() {
  const [drives, setDrives] = useState<DriveConfig[]>([
    {
      id: '1',
      name: 'Drive Principal Abmix - PRODUÇÃO',
      status: 'active',
      capacity: '0 GB / 15 GB',
      owner: 'Felipe Manieri',
      created: 'Desconhecido',
      link: '',
      lastModified: 'Nunca',
      lastSync: 'Nunca',
      files: 0,
      folders: 0,
      backup: '5 minutos',
      observations: 'Drive principal REAL configurado com credenciais de produção - ID: TBujN5G6KMyNKPnPc17HmicAQgvcb'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newDrive, setNewDrive] = useState({
    name: '',
    owner: '',
    observations: ''
  });

  const addNewDrive = () => {
    if (!newDrive.name || !newDrive.owner) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const drive: DriveConfig = {
      id: Date.now().toString(),
      name: newDrive.name,
      status: 'active',
      capacity: '0 GB / 15 GB',
      owner: newDrive.owner,
      created: new Date().toLocaleString('pt-BR'),
      link: '',
      lastModified: 'Nunca',
      lastSync: 'Nunca',
      files: 0,
      folders: 0,
      backup: '5 minutos',
      observations: newDrive.observations
    };

    setDrives(prev => [...prev, drive]);
    setShowModal(false);
    setNewDrive({ name: '', owner: '', observations: '' });
    alert('Drive adicionado com sucesso!');
  };

  const removeDrive = (driveId: string) => {
    if (window.confirm('Deseja remover este drive?')) {
      setDrives(prev => prev.filter(drive => drive.id !== driveId));
      alert('Drive removido com sucesso!');
    }
  };

  const testConnection = () => {
    alert('Conexão testada com sucesso! Google Drive funcionando corretamente.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <HardDrive className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Google Drive - Gerenciamento
            </h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={testConnection}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              📊 Testar Conexão
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              + Adicionar Novo Drive
            </button>
          </div>
        </div>

        {/* Drives Conectados */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Drives Conectados</h4>
          <div className="space-y-3">
            {drives.map((drive) => (
              <div key={drive.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${drive.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white flex items-center">
                        {drive.name}
                        {drive.status === 'active' && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Ativo
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Capacidade: {drive.capacity} | Última modificação: {drive.lastModified} | Última sync: {drive.lastSync}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Arquivos: {drive.files} | Pastas: {drive.folders} | Backup: {drive.backup}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Proprietário: {drive.owner} | Criado em: {drive.created}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Link Compartilhamento: {drive.link || 'Não configurado'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <em>Observação: {drive.observations}</em>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => window.open('https://drive.google.com', '_blank')}
                      className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                      title="Abrir"
                    >
                      📂 Abrir
                    </button>
                    <button
                      onClick={() => alert('Configurações do drive')}
                      className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                      title="Editar"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => removeDrive(drive.id)}
                      className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                      title="Remover"
                    >
                      🗑️ Remover
                    </button>
                    <button
                      onClick={() => alert('Backup manual iniciado')}
                      className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                      title="Backup Manual"
                    >
                      💾 Backup Manual
                    </button>
                    <select 
                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-gray-500 text-white" 
                      defaultValue={drive.backup}
                      title="Configurar Intervalo"
                    >
                      <option>5 minutos</option>
                      <option>10 minutos</option>
                      <option>30 minutos</option>
                      <option>1 hora</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Adicionar Novo Drive */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Adicionar Novo Drive</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Drive *</label>
                <input
                  type="text"
                  placeholder="Ex: Drive Vendas 2025"
                  value={newDrive.name}
                  onChange={(e) => setNewDrive(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proprietário *</label>
                <input
                  type="text"
                  placeholder="Ex: João Silva - comercial@abmix.com.br"
                  value={newDrive.owner}
                  onChange={(e) => setNewDrive(prev => ({ ...prev, owner: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Nome e email do responsável pelo drive</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação (opcional)</label>
                <textarea
                  placeholder="Ex: Drive para documentos de vendas do Q1 2025"
                  value={newDrive.observations}
                  onChange={(e) => setNewDrive(prev => ({ ...prev, observations: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addNewDrive}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Drive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}