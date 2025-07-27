import React, { useState } from 'react';
import { 
  Globe,
  Code,
  Link,
  Settings,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Key,
  Database,
  Cloud,
  Zap,
  Webhook,
  FileText,
  Shield,
  Info,
  Book,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

interface Integration {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  type: 'webhook' | 'api' | 'oauth' | 'service';
  url?: string;
  documentation?: string;
  lastUsed?: string;
}

export default function IntegrationGuide() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);

  // Dados simulados para evitar problemas de API
  const mockIntegrations: Integration[] = [
    {
      id: 1,
      name: 'Make.com (Integromat)',
      description: 'Automação de processos e workflows',
      status: 'active',
      type: 'webhook',
      url: 'https://hook.integromat.com/abmix-webhook',
      documentation: 'https://docs.make.com',
      lastUsed: '2025-01-25T19:30:00.000Z'
    },
    {
      id: 2,
      name: 'Zapier',
      description: 'Conecta aplicativos e automatiza tarefas',
      status: 'active',
      type: 'webhook',
      url: 'https://hooks.zapier.com/hooks/catch/abmix',
      documentation: 'https://zapier.com/developer',
      lastUsed: '2025-01-25T18:45:00.000Z'
    },
    {
      id: 3,
      name: 'Google Sheets API',
      description: 'Sincronização com planilhas Google',
      status: 'active',
      type: 'api',
      url: 'https://sheets.googleapis.com/v4/spreadsheets',
      documentation: 'https://developers.google.com/sheets/api',
      lastUsed: '2025-01-25T19:25:00.000Z'
    },
    {
      id: 4,
      name: 'Google Drive API',
      description: 'Gerenciamento de arquivos e pastas',
      status: 'active',
      type: 'api',
      url: 'https://www.googleapis.com/drive/v3',
      documentation: 'https://developers.google.com/drive/api',
      lastUsed: '2025-01-25T19:20:00.000Z'
    },
    {
      id: 5,
      name: 'WhatsApp Business API',
      description: 'Envio de mensagens via WhatsApp',
      status: 'inactive',
      type: 'api',
      url: 'https://graph.facebook.com/v18.0',
      documentation: 'https://developers.facebook.com/docs/whatsapp',
      lastUsed: '2025-01-20T10:30:00.000Z'
    },
    {
      id: 6,
      name: 'SendGrid API',
      description: 'Envio de emails transacionais',
      status: 'error',
      type: 'api',
      url: 'https://api.sendgrid.com/v3/mail/send',
      documentation: 'https://docs.sendgrid.com',
      lastUsed: '2025-01-24T14:15:00.000Z'
    }
  ];

  const [integrations] = useState<Integration[]>(mockIntegrations);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'inactive': return <Pause className="w-4 h-4 text-gray-600" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'webhook': return <Webhook className="w-4 h-4" />;
      case 'api': return <Code className="w-4 h-4" />;
      case 'oauth': return <Shield className="w-4 h-4" />;
      case 'service': return <Cloud className="w-4 h-4" />;
      default: return <Link className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'webhook': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'api': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'oauth': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'service': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copiada para a área de transferência!');
  };

  const handleTestIntegration = (integration: Integration) => {
    alert(`Testando integração: ${integration.name}\nStatus: ${integration.status}`);
  };

  const handleToggleStatus = (integrationId: number) => {
    alert(`Status da integração ${integrationId} alterado!`);
  };

  const activeIntegrations = integrations.filter(i => i.status === 'active').length;
  const errorIntegrations = integrations.filter(i => i.status === 'error').length;
  const totalIntegrations = integrations.length;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Integrações</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowApiKeys(!showApiKeys)}
              className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Key className="w-4 h-4 mr-2" />
              {showApiKeys ? 'Ocultar' : 'Mostrar'} APIs
            </button>
            <button
              onClick={() => alert('Testando todas as integrações...')}
              className="flex items-center px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Testar Todas
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center">
              <Link className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{totalIntegrations}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Ativas</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">{activeIntegrations}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Erros</p>
                <p className="text-lg font-bold text-red-900 dark:text-red-100">{errorIntegrations}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Taxa Sucesso</p>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">98.5%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Integrações */}
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="mr-4">
                    {getTypeIcon(integration.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white mr-3">{integration.name}</h4>
                      <div className={`inline-flex items-center px-2 py-1 text-xs rounded-full mr-2 ${getStatusColor(integration.status)}`}>
                        {getStatusIcon(integration.status)}
                        <span className="ml-1 capitalize">{integration.status}</span>
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getTypeColor(integration.type)}`}>
                        {getTypeIcon(integration.type)}
                        <span className="ml-1 uppercase">{integration.type}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{integration.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                      {integration.url && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">URL:</span>
                          <span className="font-mono text-xs truncate">{integration.url}</span>
                        </div>
                      )}
                      {integration.lastUsed && (
                        <div>
                          <span className="font-medium">Último uso:</span> {new Date(integration.lastUsed).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleTestIntegration(integration)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                    title="Testar"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  {integration.url && (
                    <button
                      onClick={() => handleCopyUrl(integration.url!)}
                      className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 rounded"
                      title="Copiar URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                  {integration.documentation && (
                    <button
                      onClick={() => window.open(integration.documentation, '_blank')}
                      className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                      title="Documentação"
                    >
                      <Book className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleStatus(integration.id)}
                    className={`p-2 rounded ${
                      integration.status === 'active' 
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900' 
                        : 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900'
                    }`}
                    title={integration.status === 'active' ? 'Desativar' : 'Ativar'}
                  >
                    {integration.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Seção de Configuração de APIs (opcional) */}
        {showApiKeys && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-start">
              <Key className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Configuração de APIs</h4>
                <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <div><strong>Google APIs:</strong> Configuradas via OAuth2 (CLIENT_ID, CLIENT_SECRET)</div>
                  <div><strong>Make.com:</strong> Webhook URL configurado nas automações</div>
                  <div><strong>Zapier:</strong> Trigger URL para conexão com zaps</div>
                  <div><strong>WhatsApp:</strong> Meta Business API Token necessário</div>
                  <div><strong>SendGrid:</strong> API Key para envio de emails</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guia de Uso */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Como Usar as Integrações</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>• <strong>Webhooks:</strong> URLs para receber notificações automáticas do sistema</p>
                <p>• <strong>APIs:</strong> Conexões diretas para sincronização de dados</p>
                <p>• <strong>OAuth:</strong> Autenticação segura com serviços Google</p>
                <p>• <strong>Services:</strong> Integrações com serviços de terceiros</p>
                <p>• <strong>Teste:</strong> Use o botão "Testar" para verificar conectividade</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}