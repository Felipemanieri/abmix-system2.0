import { useState, useEffect } from 'react';
import { FolderOpen, Settings, CheckCircle, Plus, X, RefreshCw, Pencil } from 'lucide-react';

export default function GoogleDriveSetup() {
  const [showAddDriveModal, setShowAddDriveModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [driveData, setDriveData] = useState({
    capacidade: '0 GB',
    totalCapacidade: '15 GB',
    arquivos: 0,
    pastas: 0,
    ultimaModificacao: 'Carregando...',
    ultimaSync: 'Carregando...',
    status: 'loading'
  });
  const [isLoadingDriveData, setIsLoadingDriveData] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    url: '',
    proprietario: '',
    linkCompartilhamento: '',
    observacao: ''
  });
  const [folderStructure, setFolderStructure] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderContents, setFolderContents] = useState({});
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    setShowAddDriveModal(false);
    setIsEditMode(false);
    setFormData({
      nome: '',
      url: '',
      proprietario: '',
      linkCompartilhamento: '',
      observacao: ''
    });
  };

  const handleAddDrive = () => {
    // Aqui implementar a lógica para adicionar o drive
    console.log('Dados do novo drive:', formData);
    handleCancel();
  };

  const handleEditDrive = () => {
    // Carregar dados atuais do drive para edição
    setFormData({
      nome: 'Drive Principal',
      url: 'https://drive.google.com/drive/folders/1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb',
      proprietario: 'Admin',
      linkCompartilhamento: 'https://drive.google.com/drive/folders/1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb?usp=drive_link',
      observacao: 'Drive principal do sistema Abmix'
    });
    setIsEditMode(true);
    setShowAddDriveModal(true);
  };

  const handleSaveDrive = () => {
    // Aqui implementar a lógica para salvar as alterações do drive
    console.log('Dados editados do drive:', formData);
    handleCancel();
  };

  const handleRemoveDrive = () => {
    if (confirm('Tem certeza que deseja remover este drive? Esta ação não pode ser desfeita.')) {
      // Aqui implementar a lógica para remover o drive
      console.log('Drive removido');
      // Pode adicionar lógica para atualizar o estado e remover da interface
    }
  };

  // Função para buscar dados reais do Google Drive
  const fetchDriveData = async () => {
    setIsLoadingDriveData(true);
    try {
      // Buscar dados reais do Google Drive
      const response = await fetch('/api/google/drive-info');
      const data = await response.json();
      
      if (data.success) {
        setDriveData({
          capacidade: data.usedStorage || '0 GB',
          totalCapacidade: data.totalStorage || '15 GB',
          arquivos: data.filesCount || 0,
          pastas: data.foldersCount || 0,
          ultimaModificacao: data.lastModified || 'Agora',
          ultimaSync: new Date().toLocaleString('pt-BR'),
          status: 'connected'
        });
      } else {
        setDriveData(prev => ({
          ...prev,
          status: 'error',
          ultimaModificacao: 'Erro ao carregar',
          ultimaSync: 'Erro ao sincronizar'
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar dados do Drive:', error);
      setDriveData(prev => ({
        ...prev,
        status: 'error',
        ultimaModificacao: 'Erro ao carregar',
        ultimaSync: 'Erro ao sincronizar'
      }));
    } finally {
      setIsLoadingDriveData(false);
    }
  };

  // Função para buscar pastas reais do Google Drive
  const fetchFolderStructure = async () => {
    setIsLoadingFolders(true);
    try {
      const response = await fetch('/api/google/drive-folders');
      const data = await response.json();
      
      if (data.success && data.folders) {
        setFolderStructure(data.folders);
      } else {
        setFolderStructure([]);
      }
    } catch (error) {
      console.error('Erro ao buscar pastas do Drive:', error);
      setFolderStructure([]);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  // Função para buscar conteúdo de uma pasta específica
  const fetchFolderContents = async (folderId: string) => {
    try {
      const response = await fetch(`/api/google/drive-folder-contents/${folderId}`);
      const data = await response.json();
      
      if (data.success && data.files) {
        setFolderContents(prev => ({
          ...prev,
          [folderId]: data.files
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar conteúdo da pasta:', error);
    }
  };

  // Carregar dados do Drive ao montar o componente
  useEffect(() => {
    fetchDriveData();
    fetchFolderStructure();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(() => {
      fetchDriveData();
      fetchFolderStructure();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configuração Google Drive
            </h3>
          </div>
          <button
            onClick={() => setShowAddDriveModal(true)}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Novo Drive
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{driveData.pastas}</div>
            <div className="text-sm text-blue-500 dark:text-blue-400">Pastas</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{driveData.arquivos.toLocaleString()}</div>
            <div className="text-sm text-green-500 dark:text-green-400">Documentos</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{driveData.capacidade}</div>
            <div className="text-sm text-purple-500 dark:text-purple-400">Espaço Usado</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Status da Conexão</span>
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
            <span className="text-sm text-gray-600 dark:text-gray-300">Última Sincronização</span>
            <span className="text-sm text-gray-900 dark:text-white">{driveData.ultimaSync}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Pasta Principal</span>
            <span className="text-sm text-gray-900 dark:text-white">Sistema Abmix</span>
          </div>
        </div>
      </div>

      {/* Seção Drive Conectado - Baseada na aba Visualizar Planilha */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 dark:bg-gray-700">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Drive conectado</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">Fonte: Sistema Abmix</p>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-sm ${
                  driveData.status === 'connected' ? 'bg-green-500' :
                  driveData.status === 'loading' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium text-gray-900 dark:text-white">Drive Principal</span>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">Sistema</span>
                {isLoadingDriveData && (
                  <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                )}
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>
                  <span className="font-medium">URL:</span>
                  <span className="ml-2 text-blue-600 dark:text-blue-400">https://drive.google.com/drive/folders/1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb...</span>
                </div>
                <div className="flex items-center gap-4">
                  <span><span className="font-medium">👤 Proprietário:</span> Admin</span>
                  <span>
                    <span className="font-medium">📁 Capacidade:</span> {driveData.capacidade} / {driveData.totalCapacidade}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span><span className="font-medium">📄 Arquivos:</span> {driveData.arquivos.toLocaleString()}</span>
                  <span><span className="font-medium">📂 Pastas:</span> {driveData.pastas.toLocaleString()}</span>
                  <span><span className="font-medium">🔄 Backup:</span> 5 minutos</span>
                </div>
                <div className="flex items-center gap-4">
                  <span><span className="font-medium">⏰ Última modificação:</span> {driveData.ultimaModificacao}</span>
                  <span><span className="font-medium">🔄 Última sync:</span> {driveData.ultimaSync}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Botão Abrir */}
              <button
                onClick={() => window.open('https://drive.google.com/drive/folders/1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb?usp=drive_link', '_blank')}
                className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-xs flex items-center gap-1"
                title="Abrir Drive"
              >
                <FolderOpen className="w-3 h-3" />
                Abrir
              </button>
              
              {/* Botão Remover */}
              <button
                onClick={handleRemoveDrive}
                className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs flex items-center gap-1"
                title="Remover Drive"
              >
                <X className="w-3 h-3" />
                Remover
              </button>
              
              {/* Botão Editar */}
              <button
                onClick={handleEditDrive}
                className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-xs flex items-center gap-1"
                title="Editar Drive"
              >
                <Pencil className="w-3 h-3" />
                Editar
              </button>
              
              {/* Botão Backup Manual */}
              <button
                onClick={() => console.log('Backup Manual')}
                className="px-2 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-xs flex items-center gap-1"
                title="Backup Manual"
              >
                <RefreshCw className="w-3 h-3" />
                Backup Manual
              </button>
              
              {/* Dropdown de Tempo */}
              <select
                className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="5 minutos"
              >
                <option value="1 segundo">1 segundo</option>
                <option value="5 segundos">5 segundos</option>
                <option value="10 segundos">10 segundos</option>
                <option value="30 segundos">30 segundos</option>
                <option value="1 minuto">1 minuto</option>
                <option value="5 minutos">5 minutos</option>
                <option value="10 minutos">10 minutos</option>
                <option value="15 minutos">15 minutos</option>
                <option value="1 hora">1 hora</option>
                <option value="5 horas">5 horas</option>
                <option value="10 horas">10 horas</option>
                <option value="24 horas">24 horas</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>
          
          {/* Botões de Ação - Baseados na aba Visualizar Planilha */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowAddDriveModal(true)}
              className="flex-1 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
            >
              Adicionar Drive
            </button>
            <button
              onClick={fetchDriveData}
              disabled={isLoadingDriveData}
              className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoadingDriveData ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                'Sincronizar'
              )}
            </button>
            <button
              onClick={() => console.log('Configurar Drive')}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Configurar
            </button>
          </div>
        </div>
      </div>

      {/* Seção Pastas e Arquivos Navegáveis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 dark:bg-gray-700">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Estrutura de Pastas</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">Navegue pelas pastas do Google Drive</p>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {folderStructure.map((folder) => (
              <div
                key={folder.id}
                onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{folder.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {folder.files} arquivos • {folder.size} • {folder.lastModified}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://drive.google.com/drive/folders/1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb`, '_blank');
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    title="Abrir pasta"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>
                  <div className={`w-2 h-2 rounded-full transition-transform ${
                    selectedFolder === folder.id ? 'rotate-90 bg-blue-500' : 'bg-gray-400'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Conteúdo da pasta selecionada */}
          {selectedFolder && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-3">
                Conteúdo da pasta: {folderStructure.find(f => f.id === selectedFolder)?.name}
              </h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span className="text-gray-900 dark:text-white">documento_proposta_001.pdf</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">2.3 MB</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                    <span className="text-gray-900 dark:text-white">contrato_cliente_xyz.docx</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">1.8 MB</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                    <span className="text-gray-900 dark:text-white">planilha_dados.xlsx</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">945 KB</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  + {folderStructure.find(f => f.id === selectedFolder)?.files - 3} mais arquivos
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Adicionar Novo Drive */}
      {showAddDriveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header do Modal */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  {isEditMode ? (
                    <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  ) : (
                    <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isEditMode ? 'Editar Drive' : 'Adicionar Novo Drive'}
                  </h3>
                </div>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                {/* Nome do Drive */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Drive *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Drive Principal"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>

                {/* URL do Google Drive */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL do Google Drive *
                  </label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>

                {/* Proprietário */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Proprietário *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Felipe Manieri"
                    value={formData.proprietario}
                    onChange={(e) => handleInputChange('proprietario', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>

                {/* Link de Compartilhamento (Opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link de Compartilhamento (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Link de compartilhamento do drive"
                    value={formData.linkCompartilhamento}
                    onChange={(e) => handleInputChange('linkCompartilhamento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>

                {/* Observação (Opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observação (Opcional)
                  </label>
                  <textarea
                    placeholder="Ex: Drive para documentos principais"
                    value={formData.observacao}
                    onChange={(e) => handleInputChange('observacao', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                  />
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={isEditMode ? handleSaveDrive : handleAddDrive}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                >
                  {isEditMode ? 'Salvar' : 'Adicionar Drive'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}