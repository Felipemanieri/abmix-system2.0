import React, { useState } from 'react';
import { Clock, Play, Pause, RotateCcw, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

interface TimeConfigModuleProps {
  onNotification?: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

// Dados estáticos e seguros para evitar qualquer problema de promise rejection
const staticTimeConfigs = [
  {
    id: 'google_drive',
    name: 'Google Drive',
    description: 'Sincronização de arquivos e pastas',
    interval: 30,
    enabled: true,
    color: 'blue',
    stats: { requests: 1247, success: 99.1, lastRun: 'há 23s' }
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    description: 'Atualização de planilhas',
    interval: 5,
    enabled: true,
    color: 'green',
    stats: { requests: 8432, success: 98.3, lastRun: 'há 12s' }
  },
  {
    id: 'google_forms',
    name: 'Google Forms',
    description: 'Integração com formulários',
    interval: 300,
    enabled: false,
    color: 'purple',
    stats: { requests: 234, success: 97.8, lastRun: 'há 5m' }
  }
];

const staticSystemStats = {
  totalConfigs: 6,
  enabledConfigs: 5,
  connectedModules: 3,
  totalRequests: 10247,
  successRate: 98.7,
  lastUpdate: new Date().toLocaleString('pt-BR')
};

export default function TimeConfigModuleUltraSafe({ onNotification }: TimeConfigModuleProps) {
  const [timeConfigs, setTimeConfigs] = useState(staticTimeConfigs);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<number>(0);

  const handleConfigUpdate = (id: string, value: number) => {
    setTimeConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, interval: value } : config
    ));
    setEditingConfig(null);
    onNotification?.('Sistema de Tempo', 'Configuração atualizada com sucesso!', 'success');
  };

  const handleToggleModule = (id: string) => {
    setTimeConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, enabled: !config.enabled } : config
    ));
    onNotification?.('Sistema de Tempo', 'Estado do módulo alterado!', 'info');
  };

  const handleStopAll = () => {
    setTimeConfigs(prev => prev.map(config => ({ ...config, enabled: false })));
    onNotification?.('Sistema de Tempo', 'TODOS os módulos foram parados!', 'info');
  };

  const handleStartAll = () => {
    setTimeConfigs(prev => prev.map(config => ({ ...config, enabled: true })));
    onNotification?.('Sistema de Tempo', 'TODOS os módulos foram reiniciados!', 'success');
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const getModuleColor = (color: string): string => {
    const colors = {
      blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
      green: 'border-green-500 bg-green-50 dark:bg-green-900/20',
      purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
      orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sistema de Tempo Integrado</h2>
              <p className="text-gray-600 dark:text-gray-300">Controle manual das requisições e tempos de sincronização</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Última atualização</div>
            <div className="font-semibold text-gray-800 dark:text-white">{staticSystemStats.lastUpdate}</div>
          </div>
        </div>

        {/* Estatísticas gerais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{staticSystemStats.totalConfigs}</div>
            <div className="text-sm text-blue-500">Módulos Totais</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{staticSystemStats.enabledConfigs}</div>
            <div className="text-sm text-green-500">Ativos</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{staticSystemStats.connectedModules}</div>
            <div className="text-sm text-purple-500">Google Conectados</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{staticSystemStats.successRate}%</div>
            <div className="text-sm text-orange-500">Taxa de Sucesso</div>
          </div>
        </div>

        {/* Controles gerais */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleStopAll}
            className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <Pause className="w-5 h-5" />
            <span>Parar Todos</span>
          </button>
          <button
            onClick={handleStartAll}
            className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>Iniciar Todos</span>
          </button>
        </div>

        <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Controle manual das requisições para manutenção e controle de quotas da API Google</span>
          </div>
        </div>
      </div>

      {/* Lista de configurações de módulos */}
      <div className="space-y-4">
        {timeConfigs.map((config) => (
          <div key={config.id} className={`border-2 rounded-lg p-6 ${getModuleColor(config.color)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  config.enabled ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  {config.enabled ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Pause className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{config.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{config.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleModule(config.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    config.enabled
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {config.enabled ? 'Pausar' : 'Iniciar'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Intervalo</div>
                <div className="font-semibold text-gray-800 dark:text-white">
                  {editingConfig === config.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={tempValue}
                        onChange={(e) => setTempValue(parseInt(e.target.value) || 0)}
                        className="w-16 p-1 border rounded text-center"
                        min="1"
                        max="3600"
                      />
                      <button
                        onClick={() => handleConfigUpdate(config.id, tempValue)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingConfig(null)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>{formatTime(config.interval)}</span>
                      <button
                        onClick={() => {
                          setEditingConfig(config.id);
                          setTempValue(config.interval);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Requisições</div>
                <div className="font-semibold text-gray-800 dark:text-white">{config.stats.requests.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Sucesso</div>
                <div className="font-semibold text-gray-800 dark:text-white">{config.stats.success}%</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Última Execução</div>
                <div className="font-semibold text-gray-800 dark:text-white">{config.stats.lastRun}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}