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
  WifiOff
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

  // Contadores para o dashboard
  const connectedApis = apis.filter(api => api.status === 'connected').length;
  const errorApis = apis.filter(api => api.status === 'error').length;
  const disconnectedApis = apis.filter(api => api.status === 'disconnected').length;
  const totalApis = apis.length;

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
  };

  const handleToggleActive = (apiId: string) => {
    setApis(prev => prev.map(a => 
      a.id === apiId ? { ...a, isActive: !a.isActive } : a
    ));
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
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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

                  <button className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
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
    </div>
  );
}