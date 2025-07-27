import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, AlertTriangle, CheckCircle, X, Settings, RefreshCw } from 'lucide-react';
import { useClientTimeConfig } from '../utils/timeConfigClient';

interface TimeConfigModuleProps {
  onNotification?: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export default function TimeConfigModuleSafe({ onNotification }: TimeConfigModuleProps) {
  const timeConfig = useClientTimeConfig();
  const [timeConfigs, setTimeConfigs] = useState(timeConfig.getAllConfigs());
  const [googleConnections, setGoogleConnections] = useState(timeConfig.getGoogleConnections());
  const [systemStats, setSystemStats] = useState(timeConfig.getSystemStats());
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<number>(0);

  // Atualizar dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeConfigs(timeConfig.getAllConfigs());
      setGoogleConnections(timeConfig.getGoogleConnections());
      setSystemStats(timeConfig.getSystemStats());
    }, 5000);

    return () => clearInterval(interval);
  }, [timeConfig]);

  const handleConfigUpdate = (id: string, value: number) => {
    timeConfig.updateConfig(id, value);
    setTimeConfigs(timeConfig.getAllConfigs());
    setEditingConfig(null);
    onNotification?.('Sistema de Tempo', 'Configuração atualizada com sucesso!', 'success');
  };

  const handleManualStop = (moduleId: string) => {
    timeConfig.manualStop(moduleId);
    setTimeConfigs(timeConfig.getAllConfigs());
    setGoogleConnections(timeConfig.getGoogleConnections());
    onNotification?.('Sistema de Tempo', 'Módulo parado manualmente!', 'info');
  };

  const handleManualStart = (moduleId: string) => {
    timeConfig.manualStart(moduleId);
    setTimeConfigs(timeConfig.getAllConfigs());
    setGoogleConnections(timeConfig.getGoogleConnections());
    onNotification?.('Sistema de Tempo', 'Módulo reiniciado!', 'success');
  };

  const handleStopAll = () => {
    timeConfig.stopAll();
    setTimeConfigs(timeConfig.getAllConfigs());
    setGoogleConnections(timeConfig.getGoogleConnections());
    onNotification?.('Sistema de Tempo', 'TODOS os módulos foram parados!', 'info');
  };

  const handleStartAll = () => {
    timeConfig.startAll();
    setTimeConfigs(timeConfig.getAllConfigs());
    setGoogleConnections(timeConfig.getGoogleConnections());
    onNotification?.('Sistema de Tempo', 'TODOS os módulos foram reiniciados!', 'success');
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const getModuleColor = (module: string): string => {
    switch (module) {
      case 'google_drive': return 'blue';
      case 'google_sheets': return 'green';
      case 'google_forms': return 'purple';
      case 'google_docs': return 'orange';
      case 'backup': return 'red';
      default: return 'gray';
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'google_drive': return Clock;
      case 'google_sheets': return RefreshCw;
      case 'google_forms': return CheckCircle;
      case 'google_docs': return Settings;
      case 'backup': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sistema de Configurações de Tempo</h3>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleStopAll}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Pause className="w-4 h-4 mr-2" />
              Parar Todos
            </button>
            <button
              onClick={handleStartAll}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Todos
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{systemStats.totalConfigs}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total de Módulos</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{systemStats.enabledConfigs}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Módulos Ativos</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{systemStats.connectedModules}</div>
            <div className="text-sm text-orange-600 dark:text-orange-400">Conectados</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{systemStats.totalRequests}</div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Total Requests</div>
          </div>
        </div>
      </div>

      {/* Lista de configurações */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configurações de Tempo dos Módulos
          </h4>
          <div className="space-y-4">
            {timeConfigs.map((config) => {
              const color = getModuleColor(config.module);
              const Icon = getModuleIcon(config.module);
              
              return (
                <div key={config.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400 mr-3`} />
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{config.name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{config.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {editingConfig === config.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={tempValue}
                            onChange={(e) => setTempValue(Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Segundos"
                          />
                          <button
                            onClick={() => handleConfigUpdate(config.id, tempValue)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingConfig(null)}
                            className="text-gray-600 hover:text-gray-800 dark:text-gray-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatTime(config.currentValue)}
                          </span>
                          <button
                            onClick={() => {
                              setEditingConfig(config.id);
                              setTempValue(config.currentValue);
                            }}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          {config.manualStopActive ? (
                            <button
                              onClick={() => handleManualStart(config.id)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleManualStop(config.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Status do módulo */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${ 
                        config.enabled 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {config.enabled ? 'Ativado' : 'Desativado'}
                      </span>
                      {config.manualStopActive && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                          Parada Manual
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Atualizado: {config.lastUpdated.toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}