import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, AlertTriangle, CheckCircle, X, Settings, RefreshCw } from 'lucide-react';

interface TimeConfigModuleProps {
  onNotification?: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export default function TimeConfigModule({ onNotification }: TimeConfigModuleProps) {
  // Safe fallback data to prevent crashes
  const [timeConfigs, setTimeConfigs] = useState([]);
  const [googleConnections, setGoogleConnections] = useState([]);
  const [systemStats, setSystemStats] = useState({
    totalConfigs: 0,
    enabledConfigs: 0,
    connectedModules: 0,
    totalRequests: 0,
    lastUpdate: new Date()
  });
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<number>(0);

  // Initialize with safe data
  useEffect(() => {
    console.log('TimeConfigModule: Sistema de tempo inicializado com dados seguros');
    onNotification?.('Sistema de Tempo', 'Módulo carregado com dados seguros', 'info');
  }, []);

  const handleConfigUpdate = (id: string, value: number) => {
    console.log(`TimeConfig: Atualizando configuração ${id} para ${value}`);
    setEditingConfig(null);
    onNotification?.('Sistema de Tempo', 'Configuração simulada com sucesso!', 'success');
  };

  const handleManualStop = (moduleId: string) => {
    console.log(`TimeConfig: Parando módulo ${moduleId}`);
    onNotification?.('Sistema de Tempo', 'Módulo parado (simulado)!', 'info');
  };

  const handleManualStart = (moduleId: string) => {
    console.log(`TimeConfig: Iniciando módulo ${moduleId}`);
    onNotification?.('Sistema de Tempo', 'Módulo reiniciado (simulado)!', 'success');
  };

  const handleStopAll = () => {
    console.log('TimeConfig: Parando todos os módulos');
    onNotification?.('Sistema de Tempo', 'TODOS os módulos foram parados (simulado)!', 'info');
  };

  const handleStartAll = () => {
    console.log('TimeConfig: Iniciando todos os módulos');
    onNotification?.('Sistema de Tempo', 'TODOS os módulos foram reiniciados (simulado)!', 'success');
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
      case 'api': return 'indigo';
      case 'real_time': return 'yellow';
      case 'processing': return 'pink';
      case 'cleanup': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sistema de Tempo Integrado</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Controle total das configurações de tempo e sincronização com Google Modules</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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

        {/* Estatísticas do Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-900 dark:text-white">{systemStats.totalConfigs}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total Módulos</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-900 dark:text-white">{systemStats.enabledConfigs}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Módulos Ativos</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-900 dark:text-white">{systemStats.connectedModules}</div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Google Conectados</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-900 dark:text-white">{systemStats.totalRequests}</div>
            <div className="text-sm text-orange-600 dark:text-orange-400">Requests Realizados</div>
          </div>
        </div>
      </div>

      {/* Configurações dos Módulos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300 mr-3" />
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Configurações dos Módulos</h4>
        </div>

        <div className="space-y-4">
          {timeConfigs.map((config) => {
            const color = getModuleColor(config.module);
            const isEditing = editingConfig === config.id;
            const connection = googleConnections.find(c => c.module === config.module);

            return (
              <div
                key={config.id}
                className={`bg-${color}-50 dark:bg-${color}-900 rounded-lg p-4 border-l-4 border-${color}-500`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        config.enabled && !config.manualStopActive 
                          ? `bg-${color}-500` 
                          : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{config.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{config.description}</div>
                      </div>
                    </div>

                    <div className="ml-6 flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Intervalo: </span>
                        {isEditing ? (
                          <input
                            type="number"
                            value={tempValue}
                            onChange={(e) => setTempValue(parseInt(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="1"
                            max="86400"
                          />
                        ) : (
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatTime(config.currentValue)}
                          </span>
                        )}
                      </div>

                      {connection && (
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Próximo: </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {connection.nextSync ? new Date(connection.nextSync).toLocaleTimeString() : 'N/A'}
                          </span>
                        </div>
                      )}

                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Status: </span>
                        <span className={`font-medium ${
                          config.enabled && !config.manualStopActive 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {config.enabled && !config.manualStopActive ? 'Ativo' : 'Parado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleConfigUpdate(config.id, tempValue)}
                          className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Salvar"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingConfig(null)}
                          className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingConfig(config.id);
                          setTempValue(config.currentValue);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Editar Tempo"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}

                    {config.enabled && !config.manualStopActive ? (
                      <button
                        onClick={() => handleManualStop(config.id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Parar Módulo"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleManualStart(config.id)}
                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="Iniciar Módulo"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        timeConfig.updateConfig(config.id, config.currentValue);
                        setTimeConfigs(timeConfig.getAllConfigs());
                        onNotification?.('Sistema de Tempo', `Módulo ${config.name} reiniciado!`, 'success');
                      }}
                      className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Forçar Reinicialização"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conexões Google em Tempo Real */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Conexões Google em Tempo Real</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {googleConnections.map((connection) => {
            const color = getModuleColor(connection.module);
            const config = timeConfigs.find(c => c.module === connection.module);

            return (
              <div
                key={connection.module}
                className={`bg-${color}-50 dark:bg-${color}-900 rounded-lg p-4 border border-${color}-200 dark:border-${color}-700`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      connection.connected && !connection.manualStop
                        ? `bg-${color}-500`
                        : 'bg-gray-400'
                    }`}></div>
                    <div className="font-medium text-gray-900 dark:text-white capitalize">
                      {connection.module.replace('_', ' ')}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    connection.connected && !connection.manualStop
                      ? `bg-${color}-100 text-${color}-800 dark:bg-${color}-800 dark:text-${color}-200`
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {connection.connected && !connection.manualStop ? 'Conectado' : 'Desconectado'}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Requisições:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{connection.requestsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Última Sync:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {connection.lastSync ? new Date(connection.lastSync).toLocaleTimeString() : 'Nunca'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Intervalo:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {config ? formatTime(config.currentValue) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Informações Importantes */}
      <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4 border-l-4 border-yellow-500">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
          <div>
            <h5 className="font-medium text-yellow-800 dark:text-yellow-200">Controle Manual de Requisições</h5>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Use os botões de "Parar" para interromper manualmente as requisições quando necessário. 
              Isso é útil para manutenção ou para evitar excesso de requisições às APIs do Google.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}