import { useState } from 'react';
import { 
  Plus, 
  Settings, 
  Zap, 
  Check, 
  X,
  ExternalLink,
  Play,
  Pause,
  AlertCircle,
  Calendar,
  Clock
} from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  platform: 'make' | 'zapier' | 'n8n';
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  activeScenarios: number;
  lastExecution: string;
  webhookUrl?: string;
  apiKey?: string;
  configurations: AutomationConfig[];
}

interface AutomationConfig {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused';
  executions: number;
  lastRun: string;
}

interface NewAutomationModal {
  isOpen: boolean;
  platform: 'make' | 'zapier' | 'n8n' | null;
}

export default function AutomationManager() {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Make.com',
      platform: 'make',
      description: 'Plataforma de automação visual para conectar aplicativos e automatizar fluxos de trabalho complexos',
      status: 'connected',
      activeScenarios: 0,
      lastExecution: 'Nunca',
      configurations: []
    },
    {
      id: '2',
      name: 'Zapier',
      platform: 'zapier',
      description: 'Conecte seus aplicativos favoritos e automatize tarefas repetitivas sem código',
      status: 'connected',
      activeScenarios: 0,
      lastExecution: 'Nunca',
      configurations: []
    },
    {
      id: '3',
      name: 'n8n',
      platform: 'n8n',
      description: 'Plataforma de automação de código aberto para conectar qualquer coisa a qualquer coisa',
      status: 'disconnected',
      activeScenarios: 0,
      lastExecution: 'Nunca',
      configurations: []
    }
  ]);

  const [newAutomationModal, setNewAutomationModal] = useState<NewAutomationModal>({
    isOpen: false,
    platform: null
  });

  const [configModal, setConfigModal] = useState<{
    isOpen: boolean;
    automation: Automation | null;
  }>({
    isOpen: false,
    automation: null
  });

  const [formData, setFormData] = useState({
    name: '',
    webhookUrl: '',
    apiKey: '',
    secretKey: '',
    teamId: '',
    organizationId: '',
    trigger: '',
    action: '',
    description: ''
  });

  const getPlatformColor = (platform: string, status: string) => {
    if (status === 'connected') {
      switch (platform) {
        case 'make':
          return 'border-purple-200 bg-purple-50';
        case 'zapier':
          return 'border-orange-200 bg-orange-50';
        case 'n8n':
          return 'border-blue-200 bg-blue-50';
        default:
          return 'border-gray-200 bg-gray-50';
      }
    }
    return 'border-gray-200 bg-gray-50';
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'make':
        return '🟣';
      case 'zapier':
        return '🟠';
      case 'n8n':
        return '🔵';
      default:
        return '⚙️';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'disconnected':
        return <X className="w-4 h-4 text-gray-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const handleOpenConfig = (automation: Automation) => {
    setConfigModal({
      isOpen: true,
      automation
    });
  };

  const handleSaveConfig = () => {
    if (!configModal.automation) return;

    // Aqui você salvaria a configuração no backend
    console.log('Salvando configuração:', formData);
    
    setConfigModal({ isOpen: false, automation: null });
    setFormData({
      name: '',
      webhookUrl: '',
      apiKey: '',
      secretKey: '',
      teamId: '',
      organizationId: '',
      trigger: '',
      action: '',
      description: ''
    });
  };

  const renderConfigForm = () => {
    if (!configModal.automation) return null;

    const { platform } = configModal.automation;

    return (
      <div className="space-y-6">
        {/* Configurações específicas por plataforma */}
        {platform === 'make' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key do Make.com
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Insira sua API Key do Make.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team ID (Opcional)
              </label>
              <input
                type="text"
                value={formData.teamId}
                onChange={(e) => setFormData({...formData, teamId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="ID do time no Make.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://hook.make.com/..."
              />
            </div>
          </>
        )}

        {platform === 'zapier' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key do Zapier
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Insira sua API Key do Zapier"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
              />
            </div>
          </>
        )}

        {platform === 'n8n' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do n8n
              </label>
              <input
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-n8n-instance.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key / Token
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Token de autenticação do n8n"
              />
            </div>
          </>
        )}

        {/* Configurações de automação */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Configuração da Automação</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Automação
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Notificar Nova Proposta"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gatilho
              </label>
              <select
                value={formData.trigger}
                onChange={(e) => setFormData({...formData, trigger: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um gatilho</option>
                <option value="nova_proposta">Nova Proposta Criada</option>
                <option value="proposta_aprovada">Proposta Aprovada</option>
                <option value="proposta_rejeitada">Proposta Rejeitada</option>
                <option value="novo_usuario">Novo Usuário Criado</option>
                <option value="backup_concluido">Backup Concluído</option>
                <option value="agendamento">Agendamento (Cron)</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ação
            </label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({...formData, action: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione uma ação</option>
              <option value="enviar_email">Enviar Email</option>
              <option value="enviar_whatsapp">Enviar WhatsApp</option>
              <option value="atualizar_planilha">Atualizar Google Sheets</option>
              <option value="criar_backup">Criar Backup</option>
              <option value="notificar_slack">Notificar Slack</option>
              <option value="webhook_personalizado">Webhook Personalizado</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva o que esta automação faz..."
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            <Zap className="inline-block w-8 h-8 mr-3 text-blue-600" />
            Sistema de Automação
          </h1>
          <p className="text-gray-600 mt-2">
            Configure automações com Make.com, Zapier e n8n para otimizar seus processos
          </p>
        </div>
        
        <button
          onClick={() => setNewAutomationModal({ isOpen: true, platform: null })}
          className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors border border-gray-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Adicionar Automação
        </button>
      </div>

      {/* Plataformas de Automação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {automations.map((automation) => (
          <div 
            key={automation.id}
            className={`rounded-lg border p-6 ${getPlatformColor(automation.platform, automation.status)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getPlatformIcon(automation.platform)}</span>
                <h3 className="text-lg font-bold text-gray-900">{automation.name}</h3>
              </div>
              {getStatusIcon(automation.status)}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {automation.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  automation.status === 'connected' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {getStatusText(automation.status)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cenários ativos:</span>
                <span className="font-medium text-gray-900">{automation.activeScenarios}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Última execução:</span>
                <span className="font-medium text-gray-900">{automation.lastExecution}</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenConfig(automation)}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                automation.platform === 'make' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : automation.platform === 'zapier'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Configurar {automation.name}
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Configuração */}
      {configModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Configurar {configModal.automation?.name}
              </h3>
              <button
                onClick={() => setConfigModal({ isOpen: false, automation: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {renderConfigForm()}

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
              <button
                onClick={() => setConfigModal({ isOpen: false, automation: null })}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Salvar Configuração
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Automação */}
      {newAutomationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Adicionar Nova Automação
              </h3>
              <button
                onClick={() => setNewAutomationModal({ isOpen: false, platform: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Selecione uma plataforma de automação para configurar uma nova integração:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['make', 'zapier', 'n8n'].map((platform) => (
                <button
                  key={platform}
                  onClick={() => {
                    const automation = automations.find(a => a.platform === platform);
                    if (automation) {
                      setNewAutomationModal({ isOpen: false, platform: null });
                      handleOpenConfig(automation);
                    }
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <span className="text-2xl block mb-2">
                    {getPlatformIcon(platform)}
                  </span>
                  <span className="font-medium text-gray-900 capitalize">
                    {platform === 'n8n' ? 'n8n' : platform}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setNewAutomationModal({ isOpen: false, platform: null })}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}