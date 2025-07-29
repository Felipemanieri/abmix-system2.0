import { useState, useEffect } from 'react';
import { 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TestTube, 
  Edit, 
  Play, 
  Pause, 
  Trash2, 
  Plus,
  Wifi,
  WifiOff,
  X
} from 'lucide-react';

interface ApiStatus {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  lastTest: string;
  result: 'success' | 'error';
  clientId?: string;
  clientSecret?: string;
  isActive: boolean;
}

export default function ApiManagementPanel() {
  const [apis, setApis] = useState<ApiStatus[]>([
    {
      id: 'viacep-api',
      name: 'ViaCEP API',
      type: 'ENDEREÇOS',
      url: 'https://viacep.com.br/ws/{cep}/json/',
      status: 'connected',
      lastTest: '29/07/2025, 10:55:56',
      result: 'success',
      isActive: true
    },
    {
      id: 'brasilapi-cnpj',
      name: 'Brasil API - CNPJ',
      type: 'DADOS EMPRESARIAIS',
      url: 'https://brasilapi.com.br/api/cnpj/v1/{cnpj}',
      status: 'connected',
      lastTest: '29/07/2025, 10:55:56',
      result: 'success',
      isActive: true
    },
    {
      id: 'google-drive',
      name: 'Google Drive API - PRODUÇÃO',
      type: 'GOOGLE DRIVE',
      url: 'https://www.googleapis.com/auth/drive',
      status: 'connected',
      lastTest: '29/07/2025, 10:55:56',
      result: 'success',
      clientId: '754195061143-fe16am2k6rvenmnn4gfe4Q9kI3p7D00.apps.googleusercontent.com',
      clientSecret: 'GOCSPK-fyhHMpJTmxkyptOILLyWrAZXBld',
      isActive: false
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets API - PRODUÇÃO',
      type: 'GOOGLE SHEETS',
      url: 'https://www.googleapis.com/auth/spreadsheets',
      status: 'connected',
      lastTest: '29/07/2025, 10:55:56',
      result: 'success',
      isActive: false
    },
    {
      id: 'sendgrid',
      name: 'SendGrid Email API',
      type: 'EMAIL',
      url: 'https://api.sendgrid.com/v3/mail/send',
      status: 'disconnected',
      lastTest: 'Nunca testado',
      result: 'error',
      isActive: false
    },
    {
      id: 'whatsapp-business',
      name: 'WhatsApp Business API',
      type: 'MENSAGENS',
      url: 'https://graph.facebook.com/v18.0',
      status: 'disconnected',
      lastTest: 'Nunca testado',
      result: 'error',
      isActive: false
    },
    {
      id: 'make-webhooks',
      name: 'Make.com Webhooks',
      type: 'AUTOMAÇÃO',
      url: 'Vários endpoints configurados',
      status: 'disconnected',
      lastTest: 'Nunca testado',
      result: 'error',
      isActive: false
    },
    {
      id: 'neon-db',
      name: 'Neon PostgreSQL',
      type: 'DATABASE',
      url: 'Banco de dados serverless',
      status: 'connected',
      lastTest: '29/07/2025, 10:55:56',
      result: 'success',
      isActive: true
    }
  ]);

  // Estados para modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiStatus | null>(null);
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    clientId: '',
    clientSecret: '',
    apiKey: '',
    activateImmediately: true
  });

  // Contadores para o dashboard
  const connectedApis = apis.filter(api => api.status === 'connected').length;
  const errorApis = apis.filter(api => api.status === 'error').length;
  const disconnectedApis = apis.filter(api => api.status === 'disconnected').length;
  const totalApis = apis.length;

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleTestApi = async (apiId: string) => {
    const api = apis.find(a => a.id === apiId);
    if (!api) return;

    // Simular teste de API
    const isSuccess = Math.random() > 0.3; // 70% de chance de sucesso
    const now = new Date().toLocaleString('pt-BR');

    setApis(prev => prev.map(a => 
      a.id === apiId 
        ? { 
            ...a, 
            lastTest: now, 
            result: isSuccess ? 'success' : 'error',
            status: isSuccess ? 'connected' : 'error'
          }
        : a
    ));

    // Mostrar notificação
    if (isSuccess) {
      showNotification(`API ${api.name} testada com sucesso! Conexão funcionando corretamente.`, 'success');
    } else {
      showNotification(`Falha no teste da API ${api.name}. Verifique as credenciais e configurações.`, 'error');
    }
  };

  const handleToggleActive = (apiId: string) => {
    setApis(prev => prev.map(a => 
      a.id === apiId ? { ...a, isActive: !a.isActive } : a
    ));
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      type: 'Google Drive',
      clientId: '',
      clientSecret: '',
      apiKey: '',
      activateImmediately: true
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (api: ApiStatus) => {
    setEditingApi(api);
    setFormData({
      name: api.name,
      type: api.type,
      clientId: api.clientId || '',
      clientSecret: api.clientSecret || '',
      apiKey: api.url,
      activateImmediately: api.isActive
    });
    setShowEditModal(true);
  };

  const handleAddApi = () => {
    const newApi: ApiStatus = {
      id: `api-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      url: formData.apiKey,
      status: 'disconnected',
      lastTest: 'Nunca testado',
      result: 'error',
      clientId: formData.clientId,
      clientSecret: formData.clientSecret,
      isActive: formData.activateImmediately
    };

    setApis(prev => [...prev, newApi]);
    setShowAddModal(false);
    showNotification(`API ${formData.name} adicionada com sucesso!`, 'success');
  };

  const handleEditApi = () => {
    if (!editingApi) return;

    setApis(prev => prev.map(a => 
      a.id === editingApi.id 
        ? {
            ...a,
            name: formData.name,
            type: formData.type,
            url: formData.apiKey,
            clientId: formData.clientId,
            clientSecret: formData.clientSecret,
            isActive: formData.activateImmediately
          }
        : a
    ));

    setShowEditModal(false);
    setEditingApi(null);
    showNotification(`API ${formData.name} editada com sucesso!`, 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'disconnected': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertTriangle className="w-5 h-5" />;
      case 'disconnected': return <XCircle className="w-5 h-5" />;
      default: return <XCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wifi className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciamento de APIs
          </h2>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar API
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Conectadas</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{connectedApis}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Com Erro</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">{errorApis}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Desconectadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{disconnectedApis}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center">
            <Wifi className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalApis}</p>
            </div>
          </div>
        </div>
      </div>

      {/* APIs List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">APIs Configuradas</h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {apis.map((api) => (
            <div key={api.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(api.status)}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {api.name}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Tipo: {api.type}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(api.status)}`}>
                          {api.status === 'connected' ? 'Conectada' : 
                           api.status === 'error' ? 'Inativa' : 'Desconectada'}
                        </span>
                        {api.isActive && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-800 bg-green-100 border border-green-200">
                            Ativa
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {api.clientId && (
                      <div>
                        <span className="font-medium">Client ID:</span> {api.clientId}
                      </div>
                    )}
                    {api.clientSecret && (
                      <div>
                        <span className="font-medium">Client Secret:</span> {api.clientSecret}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">API Key:</span> {api.url}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="font-medium">Último teste:</span> {api.lastTest}
                      </div>
                      <div>
                        <span className="font-medium">Resultado:</span>
                        <span className={`ml-1 ${api.result === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {api.result === 'success' ? 'Sucesso' : 'Erro'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <span className={`ml-1 ${
                          api.status === 'connected' ? 'text-green-600' : 
                          api.status === 'error' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {api.isActive ? 'Inativa' : 'Ativa'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleTestApi(api.id)}
                    className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Testar"
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    Testar
                  </button>

                  <button 
                    onClick={() => handleOpenEditModal(api)}
                    className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </button>

                  <button
                    onClick={() => handleToggleActive(api.id)}
                    className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      api.isActive 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {api.isActive ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Ativar
                      </>
                    )}
                  </button>

                  <button className="flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notificação */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}
              <span className="text-sm font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar API */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Adicionar Nova API
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da API *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Google Drive API"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Google Drive">Google Drive</option>
                  <option value="Google Sheets">Google Sheets</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="Pagamento">Pagamento</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  placeholder="Ex: 123456789.apps.googleusercontent.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client Secret
                </label>
                <input
                  type="text"
                  value={formData.clientSecret}
                  onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                  placeholder="Ex: GOCSPX-123456789abcdefghijk"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="Ex: AlzaSyB123456789abcdefghijklmnopqrstuvwxyz"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activate"
                  checked={formData.activateImmediately}
                  onChange={(e) => setFormData({ ...formData, activateImmediately: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="activate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Ativar API imediatamente
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddApi}
                disabled={!formData.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Adicionar API
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar API */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Editar API
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da API *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client Secret
                </label>
                <input
                  type="text"
                  value={formData.clientSecret}
                  onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="Ex: AlzaSyB123456789abcdefghijklmnopqrstuvwxyz"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditApi}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}