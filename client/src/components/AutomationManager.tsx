import { useState } from 'react';
import { Zap, Play, Pause, Settings, BarChart3, Clock, AlertCircle } from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused' | 'error';
  lastRun: string;
  successRate: number;
  executions: number;
}

export default function AutomationManager() {
  const [automations, setAutomations] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Make.com - Processamento de Propostas',
      description: 'Automatiza o processamento de novas propostas criadas pelos vendedores',
      trigger: 'Nova proposta criada',
      action: 'Enviar para Make.com → Google Sheets → Notificação',
      status: 'active',
      lastRun: new Date(Date.now() - 300000).toISOString(), // 5 min ago
      successRate: 98.5,
      executions: 247
    },
    {
      id: '2',
      name: 'Zapier - Backup Automático',
      description: 'Realiza backup diário dos dados do banco PostgreSQL',
      trigger: 'Todos os dias às 02:00',
      action: 'Backup PostgreSQL → Upload Google Drive',
      status: 'active',
      lastRun: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
      successRate: 100,
      executions: 127
    },
    {
      id: '3',
      name: 'Make.com - Notificações WhatsApp',
      description: 'Envia notificações automáticas via WhatsApp para clientes',
      trigger: 'Status da proposta alterado',
      action: 'Enviar mensagem WhatsApp personalizada',
      status: 'error',
      lastRun: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      successRate: 85.2,
      executions: 89
    },
    {
      id: '4',
      name: 'Zapier - Sincronização Vendedores',
      description: 'Sincroniza dados de vendedores com sistema externo de CRM',
      trigger: 'Vendedor criado/editado',
      action: 'Atualizar CRM → Enviar email boas-vindas',
      status: 'paused',
      lastRun: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      successRate: 92.1,
      executions: 34
    },
    {
      id: '5',
      name: 'Make.com - Relatórios Automáticos',
      description: 'Gera relatórios mensais e envia para supervisores',
      trigger: 'Todo dia 1º do mês às 08:00',
      action: 'Gerar relatório → Enviar por email',
      status: 'active',
      lastRun: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
      successRate: 96.8,
      executions: 12
    }
  ]);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(automation => 
      automation.id === id 
        ? { 
            ...automation, 
            status: automation.status === 'active' ? 'paused' : 'active' 
          }
        : automation
    ));
  };

  const runAutomation = async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;

    // Simular execução
    setAutomations(prev => prev.map(a => 
      a.id === id 
        ? { 
            ...a, 
            lastRun: new Date().toISOString(),
            executions: a.executions + 1
          }
        : a
    ));

    // Simular notificação de sucesso
    setTimeout(() => {
      alert(`Automação "${automation.name}" executada com sucesso!`);
    }, 2000);
  };

  const getStatusIcon = (status: AutomationRule['status']) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: AutomationRule['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'paused':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600 dark:text-green-400';
    if (rate >= 85) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAutomationType = (name: string) => {
    if (name.includes('Make.com')) {
      return { type: 'Make.com', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200' };
    } else if (name.includes('Zapier')) {
      return { type: 'Zapier', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200' };
    }
    return { type: 'Sistema', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' };
  };

  const totalExecutions = automations.reduce((acc, auto) => acc + auto.executions, 0);
  const activeCount = automations.filter(a => a.status === 'active').length;
  const averageSuccessRate = automations.reduce((acc, auto) => acc + auto.successRate, 0) / automations.length;

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Automações</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{automations.length}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ativas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</p>
            </div>
            <Play className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa Sucesso</p>
              <p className={`text-2xl font-bold ${getSuccessRateColor(averageSuccessRate)}`}>
                {averageSuccessRate.toFixed(1)}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Execuções</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalExecutions}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Lista de Automações */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Gerenciador de Automações
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {activeCount} de {automations.length} ativas
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {automations.map((automation) => {
            const automationType = getAutomationType(automation.name);
            
            return (
              <div key={automation.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(automation.status)}
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {automation.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${automationType.color}`}>
                        {automationType.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(automation.status).split(' ').slice(2).join(' ')}`}>
                        {automation.status === 'active' ? 'Ativa' : 
                         automation.status === 'paused' ? 'Pausada' : 'Erro'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {automation.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Trigger: </span>
                        <span className="text-gray-600 dark:text-gray-400">{automation.trigger}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Ação: </span>
                        <span className="text-gray-600 dark:text-gray-400">{automation.action}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        Última execução: {new Date(automation.lastRun).toLocaleString('pt-BR')}
                      </span>
                      <span>
                        Execuções: {automation.executions}
                      </span>
                      <span className={getSuccessRateColor(automation.successRate)}>
                        Taxa de sucesso: {automation.successRate}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => runAutomation(automation.id)}
                      disabled={automation.status === 'error'}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center text-sm"
                      title="Executar agora"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Executar
                    </button>
                    
                    <button
                      onClick={() => toggleAutomation(automation.id)}
                      className={`px-3 py-2 rounded-lg transition-colors flex items-center text-sm ${
                        automation.status === 'active'
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      title={automation.status === 'active' ? 'Pausar' : 'Ativar'}
                    >
                      {automation.status === 'active' ? (
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

                    <button
                      onClick={() => alert(`Configurações da automação: ${automation.name}`)}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center text-sm"
                      title="Configurações"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Informações Importantes */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Informações Importantes:
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Automações Make.com processam dados em tempo real</li>
          <li>• Automações Zapier têm intervalo mínimo de 15 minutos</li>
          <li>• Verifique logs regularmente para identificar erros</li>
          <li>• Taxa de sucesso abaixo de 85% indica problemas na automação</li>
          <li>• Pause automações com problemas para evitar loops de erro</li>
        </ul>
      </div>
    </div>
  );
}