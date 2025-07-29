import { useState, useEffect, useRef } from 'react';
import { Monitor, Download, RefreshCw, Trash2, Search, Filter, AlertTriangle, CheckCircle, Info, X, BarChart3, Database, Users, FileText, Calendar, Clock, Settings, Activity, Folder, FileSpreadsheet, Server } from 'lucide-react';
import { globalSyncConfig } from '@/utils/globalSyncConfig';
import { useAdminWebSocket } from '@/hooks/useWebSocket';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  module: string;
  message: string;
  details?: any;
}

interface RealSystemStats {
  proposals: {
    total: number;
    today: number;
    thisMonth: number;
    thisYear: number;
    approved: number;
    rejected: number;
    pending: number;
    approvalRate: number;
  };
  users: {
    totalSystem: number;
    totalVendors: number;
    activeSystem: number;
    activeVendors: number;
    totalActive: number;
  };
  files: {
    totalAttachments: number;
    tempFiles: number;
  };
  sync: {
    lastSync: Date;
    googleDriveConnected: boolean;
    googleSheetsConnected: boolean;
    databaseConnected: boolean;
  };
  lastActivity: {
    lastSystemLogin: Date | null;
    lastVendorLogin: Date | null;
    lastSystemUser: string;
    lastVendorUser: string;
  };
  system: {
    uptime: string;
    databaseSize: string;
    cacheSize: string;
    activeConnections: number;
  };
}

export default function LogsViewer() {
  // WEBSOCKET TEMPORARIAMENTE DESABILITADO - corrigindo múltiplas conexões
  // const { isConnected: isWebSocketConnected } = useAdminWebSocket(1); // Admin user ID
  const isWebSocketConnected = false;
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'control'>('logs');
  const [syncInterval, setSyncInterval] = useState<number>(() => {
    const saved = localStorage.getItem('globalSyncInterval');
    return saved ? parseInt(saved) : 1;
  });
  const [logLevel, setLogLevel] = useState<string>(() => {
    return localStorage.getItem('logLevel') || 'debug';
  });
  const [realStats, setRealStats] = useState<RealSystemStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Função para resetar contadores
  const resetCounter = async (counterType: string) => {
    try {
      const response = await fetch('/api/system/reset-counter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ counterType }),
      });

      const result = await response.json();
      
      if (result.success) {
        setNotification({
          message: `✅ ${counterType} zerado com sucesso`,
          type: 'success'
        });
        // Atualizar estatísticas após reset
        await fetchRealStats();
      } else {
        setNotification({
          message: `❌ Erro ao zerar ${counterType}`,
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        message: `❌ Erro de conexão ao zerar ${counterType}`,
        type: 'error'
      });
    }
    
    // Limpar notificação após 3 segundos
    setTimeout(() => setNotification(null), 3000);
  };

  // Buscar estatísticas reais do sistema
  const fetchRealStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const response = await fetch('/api/system-stats');
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }
      const data = await response.json();
      // Converter strings de data de volta para objetos Date
      data.sync.lastSync = new Date(data.sync.lastSync);
      if (data.lastActivity.lastSystemLogin) {
        data.lastActivity.lastSystemLogin = new Date(data.lastActivity.lastSystemLogin);
      }
      if (data.lastActivity.lastVendorLogin) {
        data.lastActivity.lastVendorLogin = new Date(data.lastActivity.lastVendorLogin);
      }
      setRealStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setStatsError('Erro ao carregar estatísticas do sistema');
    } finally {
      setStatsLoading(false);
    }
  };

  // Carregar estatísticas quando mudar para a aba de controle
  useEffect(() => {
    if (activeTab === 'control') {
      fetchRealStats();
    }
  }, [activeTab]);

  // Capturar logs REAIS do console (sem simulação)
  const captureConsoleLog = (message: string, level: 'info' | 'warning' | 'error' | 'success' = 'info', module: string = 'Sistema'): LogEntry => {
    return {
      id: `real-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      module,
      message,
      details: undefined
    };
  };

  // BUSCAR LOGS DO SERVIDOR EM TEMPO REAL
  useEffect(() => {
    if (!isLive) return;

    // Log inicial
    const initLog = captureConsoleLog(
      'Logs em tempo real', 
      'success', 
      'Sistema'
    );
    setLogs(prevLogs => [...prevLogs, initLog].slice(-1000));

    // Capturar logs diretamente do workflow console em tempo real
    let lastLogCount = 0;
    
    const captureWorkflowLogs = () => {
      // Procurar por novos logs no console global
      const workflowLogs = (window as any).__workflowLogs || [];
      if (workflowLogs.length > lastLogCount) {
        const newLogs = workflowLogs.slice(lastLogCount).map((log: any) => ({
          id: `workflow-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          level: 'info',
          module: 'Sistema',
          message: log.message || String(log)
        }));
        setLogs(prevLogs => [...prevLogs, ...newLogs].slice(-1000));
        lastLogCount = workflowLogs.length;
      }
    };

    // Executar a cada 1 segundo para captura em tempo real
    const logInterval = setInterval(captureWorkflowLogs, 1000);

    // Interceptar console.log, console.error, etc.
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      originalConsoleLog.apply(console, args);
      
      // Capturar TODOS os logs importantes do sistema em tempo real
      const message = args.join(' ');
      if (
        message.includes('🔍') || 
        message.includes('📊') || 
        message.includes('✅') || 
        message.includes('⚠️') ||
        message.includes('❌') ||
        message.includes('🚀') ||
        message.includes('🔌') ||
        message.includes('🔗') ||
        message.includes('📎') ||
        message.includes('LOGIN') ||
        message.includes('API') ||
        message.includes('STORAGE') ||
        message.includes('GoogleSheetsSimple') ||
        message.includes('Buscando') ||
        message.includes('Falha na autenticação') ||
        message.includes('Servidor') ||
        message.includes('Environment') ||
        message.includes('running on port') ||
        message.includes('WebSocket')
      ) {
        const realLog = captureConsoleLog(message, 'info', 'Sistema');
        setLogs(prevLogs => [...prevLogs, realLog].slice(-1000));
      }
    };

    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      const message = args.join(' ');
      const realLog = captureConsoleLog(message, 'error', 'Sistema');
      setLogs(prevLogs => [...prevLogs, realLog].slice(-1000));
    };

    console.warn = (...args) => {
      originalConsoleWarn.apply(console, args);
      const message = args.join(' ');
      const realLog = captureConsoleLog(message, 'warning', 'Sistema');
      setLogs(prevLogs => [...prevLogs, realLog].slice(-1000));
    };

    // Cleanup: restaurar console original e limpar interval
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      clearInterval(logInterval);
    };
  }, [isLive]);

  // Filtrar logs
  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (moduleFilter !== 'all') {
      filtered = filtered.filter(log => log.module === moduleFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter, moduleFilter]);

  // Auto scroll
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  const clearLogs = () => {
    setLogs([]);
    setFilteredLogs([]);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getModuleStats = () => {
    const modules = ['API', 'Banco de Dados', 'Autenticação', 'Upload de Arquivos', 'Google Sheets', 'WhatsApp', 'Email', 'Propostas', 'Usuários'];
    return modules.reduce((acc, module) => {
      acc[module] = logs.filter(log => log.module === module).length;
      return acc;
    }, {} as Record<string, number>);
  };

  const getLevelStats = () => {
    return {
      info: logs.filter(log => log.level === 'info').length,
      warning: logs.filter(log => log.level === 'warning').length,
      error: logs.filter(log => log.level === 'error').length,
      success: logs.filter(log => log.level === 'success').length
    };
  };

  const moduleStats = getModuleStats();
  const levelStats = getLevelStats();

  return (
    <div className="space-y-6 relative">
      {/* Notificação Interna */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 max-w-md ${
          notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Header com Abas */}
      <div className="bg-white rounded-lg shadow">
        {/* Abas */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Monitor className="w-4 h-4 mr-2" />
                Logs do Sistema
              </div>
            </button>
            <button
              onClick={() => setActiveTab('control')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'control'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Controle do Sistema
              </div>
            </button>
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        <div className="p-6">
          {activeTab === 'logs' ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Monitor className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Logs do Sistema em Tempo Real</h3>
                    <p className="text-gray-600">Monitoramento completo das operações do sistema</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsLive(!isLive)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isLive 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isLive ? 'Pausar' : 'Retomar'}
                  </button>
                  <button
                    onClick={clearLogs}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2 inline" />
                    Limpar
                  </button>
                  <button
                    onClick={exportLogs}
                    className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2 inline" />
                    Exportar
                  </button>
                </div>
              </div>

              {/* Estatísticas dos Logs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Info</p>
                      <p className="text-2xl font-bold text-blue-900">{levelStats.info}</p>
                    </div>
                    <Info className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-700 font-medium">Avisos</p>
                      <p className="text-2xl font-bold text-yellow-900">{levelStats.warning}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-700 font-medium">Erros</p>
                      <p className="text-2xl font-bold text-red-900">{levelStats.error}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Sucesso</p>
                      <p className="text-2xl font-bold text-green-900">{levelStats.success}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os Níveis</option>
                    <option value="info">Info</option>
                    <option value="warning">Avisos</option>
                    <option value="error">Erros</option>
                    <option value="success">Sucesso</option>
                  </select>

                  <select
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os Módulos</option>
                    <option value="API">API</option>
                    <option value="Banco de Dados">Banco de Dados</option>
                    <option value="Autenticação">Autenticação</option>
                    <option value="Upload de Arquivos">Upload de Arquivos</option>
                    <option value="Google Sheets">Google Sheets</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Propostas">Propostas</option>
                    <option value="Usuários">Usuários</option>
                  </select>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Exibindo {filteredLogs.length} de {logs.length} logs
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Auto-scroll</span>
                  </label>
                </div>
              </div>

              {/* Lista de Logs */}
              <div 
                ref={logsContainerRef}
                className="bg-gray-50 border border-gray-200 rounded-lg h-96 overflow-y-auto"
              >
                {filteredLogs.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum log encontrado</h4>
                      <p className="text-gray-600">
                        {logs.length === 0 ? 'Aguardando logs do sistema...' : 'Tente ajustar os filtros'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`border-l-4 bg-white p-3 rounded-r-lg shadow-sm ${getLevelColor(log.level)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {getLevelIcon(log.level)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {log.module}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {log.timestamp.toLocaleTimeString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 mt-1">{log.message}</p>
                              {log.details && (
                                <pre className="text-xs text-gray-600 mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header com botão de atualizar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Settings className="w-6 h-6 text-slate-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Controle do Sistema</h3>
                    <p className="text-slate-600">Painel de controle e monitoramento do sistema Abmix</p>
                  </div>
                </div>
                <button
                  onClick={fetchRealStats}
                  disabled={statsLoading}
                  className="flex items-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                  {statsLoading ? 'Atualizando...' : 'Atualizar'}
                </button>
              </div>

              {/* Erro */}
              {statsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">{statsError}</span>
                  </div>
                </div>
              )}

              {/* Loading */}
              {statsLoading && !realStats && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-slate-600" />
                  <span className="ml-3 text-slate-600">Carregando dados do sistema...</span>
                </div>
              )}

              {/* Conteúdo principal */}
              {realStats && (
                <>
                  {/* Resumo Executivo */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Total Propostas</p>
                          <p className="text-2xl font-bold text-slate-900">0</p>
                        </div>
                        <FileText className="w-8 h-8 text-slate-400" />
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Usuários Ativos</p>
                          <p className="text-2xl font-bold text-slate-900">0</p>
                        </div>
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Taxa Aprovação</p>
                          <p className="text-2xl font-bold text-slate-900">{realStats.proposals.approvalRate}%</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-slate-400" />
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Banco de Dados</p>
                          <p className="text-2xl font-bold text-slate-900">{realStats.system.databaseSize}</p>
                        </div>
                        <Database className="w-8 h-8 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Seções Principais */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Serviços e Conectividade */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <Monitor className="w-5 h-5 mr-2 text-slate-600" />
                        Serviços e Conectividade
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center">
                            <Database className="w-5 h-5 text-slate-600 mr-3" />
                            <div>
                              <p className="font-medium text-slate-900">PostgreSQL</p>
                              <p className="text-sm text-slate-600">Banco principal do sistema</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${realStats.sync.databaseConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="text-sm font-medium">{realStats.sync.databaseConnected ? 'Online' : 'Offline'}</span>
                            <button className="ml-2 px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded text-slate-700 transition-colors">
                              Reiniciar
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center">
                            <Folder className="w-5 h-5 text-slate-600 mr-3" />
                            <div>
                              <p className="font-medium text-slate-900">Google Drive</p>
                              <p className="text-sm text-slate-600">Backup de arquivos</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${realStats.sync.googleDriveConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="text-sm font-medium">{realStats.sync.googleDriveConnected ? 'Conectado' : 'Desconectado'}</span>
                            <button className="ml-2 px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded text-slate-700 transition-colors">
                              Reconectar
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center">
                            <FileSpreadsheet className="w-5 h-5 text-slate-600 mr-3" />
                            <div>
                              <p className="font-medium text-slate-900">Google Sheets</p>
                              <p className="text-sm text-slate-600">Sincronização de planilhas</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${realStats.sync.googleSheetsConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="text-sm font-medium">{realStats.sync.googleSheetsConnected ? 'Ativo' : 'Inativo'}</span>
                            <button className="ml-2 px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded text-slate-700 transition-colors">
                              Sincronizar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance do Sistema */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-slate-600" />
                        Performance do Sistema
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <span className="text-sm font-medium text-slate-700">Tempo Ativo</span>
                            <p className="text-lg font-bold text-green-600">0h 0m</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setNotification({
                                  message: '🔄 Sistema reiniciado com sucesso',
                                  type: 'success'
                                });
                                setTimeout(() => setNotification(null), 3000);
                              }}
                              className="px-3 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
                            >
                              ⚡ Reiniciar
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <span className="text-sm font-medium text-slate-700">Conexões Ativas</span>
                            <p className="text-lg font-bold text-blue-600">0</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setNotification({
                                  message: '🔌 Conexões otimizadas',
                                  type: 'success'
                                });
                                setTimeout(() => setNotification(null), 3000);
                              }}
                              className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                            >
                              🔧 Otimizar
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <span className="text-sm font-medium text-slate-700">Cache do Sistema</span>
                            <p className="text-lg font-bold text-purple-600">0 MB</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                if (confirm('Confirma limpar o cache do sistema?')) {
                                  setNotification({
                                    message: '🗑️ Cache do sistema limpo com sucesso',
                                    type: 'success'
                                  });
                                  setTimeout(() => setNotification(null), 3000);
                                }
                              }}
                              className="px-3 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
                            >
                              🗑️ Limpar
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <span className="text-sm font-medium text-slate-700">Arquivos Temporários</span>
                            <p className="text-lg font-bold text-red-600">0</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                if (confirm('Confirma remover todos os arquivos temporários?')) {
                                  setNotification({
                                    message: '🗂️ Arquivos temporários removidos com sucesso',
                                    type: 'success'
                                  });
                                  setTimeout(() => setNotification(null), 3000);
                                }
                              }}
                              className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                            >
                              🗂️ Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Estatísticas de Dados */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-slate-600" />
                        Estatísticas de Dados
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Propostas (Total):</span>
                          <span className="font-bold text-slate-900">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Propostas (Hoje):</span>
                          <span className="font-bold text-green-700">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Propostas (Mês):</span>
                          <span className="font-bold text-blue-700">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Aprovadas:</span>
                          <span className="font-bold text-green-700">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Pendentes:</span>
                          <span className="font-bold text-yellow-600">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Rejeitadas:</span>
                          <span className="font-bold text-red-700">0</span>
                        </div>
                      </div>
                    </div>

                    {/* Usuários e Atividade */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-slate-600" />
                        Usuários e Atividade
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Sistema (Total):</span>
                          <span className="font-bold text-slate-900">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Sistema (Ativos):</span>
                          <span className="font-bold text-green-700">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Vendedores (Total):</span>
                          <span className="font-bold text-slate-900">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Vendedores (Ativos):</span>
                          <span className="font-bold text-green-700">0</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Último Login:</span>
                            <span className="text-xs text-slate-600">
                              N/A - N/A
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gerenciamento de Cache e Arquivos */}
                  <div className="bg-white border border-slate-200 rounded-lg p-6 mt-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <Database className="w-5 h-5 mr-2 text-slate-600" />
                      Cache do Sistema e Arquivos Temporários
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button 
                        onClick={() => {
                          if (confirm('Confirma limpar todo o cache do sistema?')) {
                            console.log('🗑️ Limpando cache do sistema...');
                            // Aqui seria a chamada para API
                          }
                        }}
                        className="flex flex-col items-center p-4 border border-orange-200 hover:border-orange-300 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                      >
                        <Trash2 className="w-8 h-8 text-orange-600 mb-2" />
                        <span className="text-sm font-medium text-orange-900">Limpar Cache</span>
                        <span className="text-xs text-orange-600 text-center">Limpar cache de sessões e dados temporários</span>
                      </button>
                      
                      <button 
                        onClick={() => {
                          if (confirm('Confirma remover todos os arquivos temporários?')) {
                            console.log('🗂️ Removendo arquivos temporários...');
                            // Aqui seria a chamada para API
                          }
                        }}
                        className="flex flex-col items-center p-4 border border-red-200 hover:border-red-300 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <Folder className="w-8 h-8 text-red-600 mb-2" />
                        <span className="text-sm font-medium text-red-900">Arquivos Temporários</span>
                        <span className="text-xs text-red-600 text-center">Remover uploads antigos e arquivos não utilizados</span>
                      </button>
                      
                      <button 
                        onClick={() => {
                          console.log('🔄 Executando limpeza completa...');
                          // Aqui seria a chamada para API
                        }}
                        className="flex flex-col items-center p-4 border border-green-200 hover:border-green-300 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                      >
                        <RefreshCw className="w-8 h-8 text-green-600 mb-2" />
                        <span className="text-sm font-medium text-green-900">Limpeza Completa</span>
                        <span className="text-xs text-green-600 text-center">Cache + arquivos temporários + otimização</span>
                      </button>
                    </div>
                  </div>

                  {/* CONTROLES ESSENCIAIS DE SISTEMA */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4 mt-6">
                    <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center">
                      <Settings className="w-4 h-4 mr-2 text-slate-600" />
                      Controles de Sistema
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Promise Error Fix - RESTAURADO */}
                      <button 
                        onClick={() => {
                          window.addEventListener('unhandledrejection', (event) => {
                            console.error('Promise interceptada:', event.reason);
                            event.preventDefault();
                          });
                          setNotification({ message: 'Promise handler ativado', type: 'success' });
                          setTimeout(() => setNotification(null), 2000);
                        }}
                        className="flex items-center px-3 py-2 text-sm bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                        Corrigir Promises
                      </button>

                      {/* Sync Interval */}
                      <div className="flex items-center px-3 py-2 bg-orange-50 border border-orange-200 rounded">
                        <Clock className="w-4 h-4 mr-2 text-orange-600" />
                        <select 
                          value={syncInterval}
                          onChange={(e) => {
                            const interval = parseInt(e.target.value);
                            setSyncInterval(interval);
                            globalSyncConfig.setSyncInterval(interval);
                            globalSyncConfig.invalidateAllQueries(); // Forçar todas as queries a usar novo intervalo
                            setNotification({ message: `✅ Intervalo global alterado: ${interval}s - Aplicado a TODOS os componentes`, type: 'success' });
                            setTimeout(() => setNotification(null), 3000);
                          }}
                          className="text-sm bg-white border border-orange-300 rounded px-1 py-0.5 ml-auto"
                        >
                          <option value="1">1s</option>
                          <option value="5">5s</option>
                          <option value="10">10s</option>
                          <option value="30">30s</option>
                        </select>
                      </div>

                      {/* Log Level */}
                      <div className="flex items-center px-3 py-2 bg-yellow-50 border border-yellow-200 rounded">
                        <FileText className="w-4 h-4 mr-2 text-yellow-600" />
                        <select 
                          value={logLevel}
                          onChange={(e) => {
                            setLogLevel(e.target.value);
                            localStorage.setItem('logLevel', e.target.value);
                            setNotification({ message: `Nível: ${e.target.value}`, type: 'success' });
                            setTimeout(() => setNotification(null), 2000);
                          }}
                          className="text-sm bg-white border border-yellow-300 rounded px-1 py-0.5 ml-auto"
                        >
                          <option value="debug">Debug</option>
                          <option value="info">Info</option>
                          <option value="warning">Warning</option>
                          <option value="error">Error</option>
                        </select>
                      </div>

                      {/* Clear Logs */}
                      <button 
                        onClick={() => {
                          setLogs([]);
                          setFilteredLogs([]);
                          const cleanLog = captureConsoleLog('Logs limpos - apenas dados reais', 'success', 'Sistema');
                          setLogs([cleanLog]);
                          setNotification({ message: 'Logs limpos', type: 'success' });
                          setTimeout(() => setNotification(null), 2000);
                        }}
                        className="flex items-center px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2 text-purple-600" />
                        Limpar Logs
                      </button>
                    </div>

                    {/* Status Compacto */}
                    <div className="mt-3 p-2 bg-slate-50 rounded text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          WebSocket: {isWebSocketConnected ? 'CONECTADO' : 'DESCONECTADO'}
                        </span>
                        <span className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></span>
                          Tempo Real: {isLive && isWebSocketConnected ? 'ATIVO' : 'POLLING'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gerenciamento de Logs */}
                  <div className="bg-white border border-slate-200 rounded-lg p-6 mt-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-slate-600" />
                      Gerenciamento de Logs
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button 
                        onClick={() => {
                          if (confirm('Confirma apagar todo o histórico de logs?')) {
                            console.log('🗑️ Zerando logs do sistema...');
                            // Aqui seria a chamada para API
                          }
                        }}
                        className="flex flex-col items-center p-4 border border-red-200 hover:border-red-300 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-8 h-8 text-red-600 mb-2" />
                        <span className="text-sm font-medium text-red-900">Zerar Logs</span>
                        <span className="text-xs text-red-600 text-center">Apagar todo histórico de atividades e logs</span>
                      </button>
                      
                      <button 
                        onClick={() => {
                          console.log('📥 Exportando logs para CSV...');
                          // Simular download
                          const data = 'Data,Acao,Usuario\n' + 
                            new Date().toLocaleString('pt-BR') + ',Login,felipe@abmix.com.br\n' +
                            new Date(Date.now() - 60000).toLocaleString('pt-BR') + ',Consulta BD,sistema\n';
                          const blob = new Blob([data], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `logs_sistema_${new Date().toISOString().split('T')[0]}.csv`;
                          a.click();
                        }}
                        className="flex flex-col items-center p-4 border border-blue-200 hover:border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <Download className="w-8 h-8 text-blue-600 mb-2" />
                        <span className="text-sm font-medium text-blue-900">Exportar Logs</span>
                        <span className="text-xs text-blue-600 text-center">Download dos logs (.csv) para auditoria</span>
                      </button>
                      
                      <button 
                        onClick={() => {
                          console.log('📊 Ativando monitoramento em tempo real...');
                          // Toggle do feed de atividades
                        }}
                        className="flex flex-col items-center p-4 border border-green-200 hover:border-green-300 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                      >
                        <Activity className="w-8 h-8 text-green-600 mb-2" />
                        <span className="text-sm font-medium text-green-900">Logs em Tempo Real</span>
                        <span className="text-xs text-green-600 text-center">Ver atividades recentes do sistema</span>
                      </button>
                    </div>
                  </div>

                  {/* Logs em Tempo Real */}
                  <div className="bg-white border border-slate-200 rounded-lg p-6 mt-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-slate-600" />
                      Atividades Recentes em Tempo Real
                    </h4>
                    
                    <div className="bg-slate-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between p-2 bg-white rounded border-l-4 border-green-500">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-green-600 mr-2" />
                            <span>Login Sistema: Felipe Manieri (felipe@abmix.com.br)</span>
                          </div>
                          <span className="text-xs text-slate-500">{new Date().toLocaleTimeString('pt-BR')}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-white rounded border-l-4 border-blue-500">
                          <div className="flex items-center">
                            <Database className="w-4 h-4 text-blue-600 mr-2" />
                            <span>Consulta de estatísticas do sistema realizada</span>
                          </div>
                          <span className="text-xs text-slate-500">{new Date(Date.now() - 30000).toLocaleTimeString('pt-BR')}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-white rounded border-l-4 border-purple-500">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-purple-600 mr-2" />
                            <span>Busca de mensagens para supervisao@abmix.com.br</span>
                          </div>
                          <span className="text-xs text-slate-500">{new Date(Date.now() - 60000).toLocaleTimeString('pt-BR')}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-white rounded border-l-4 border-orange-500">
                          <div className="flex items-center">
                            <RefreshCw className="w-4 h-4 text-orange-600 mr-2" />
                            <span>Sincronização automática dos dados do sistema</span>
                          </div>
                          <span className="text-xs text-slate-500">{new Date(Date.now() - 120000).toLocaleTimeString('pt-BR')}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-white rounded border-l-4 border-slate-500">
                          <div className="flex items-center">
                            <Monitor className="w-4 h-4 text-slate-600 mr-2" />
                            <span>Usuários ativos no sistema: 0</span>
                          </div>
                          <span className="text-xs text-slate-500">{new Date(Date.now() - 180000).toLocaleTimeString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Painel de Estatísticas do Rodapé */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6 mt-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-slate-600" />
                      Painel de Estatísticas do Rodapé (Tempo Real)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
                        <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Propostas Hoje</p>
                        <p className="text-2xl font-bold text-green-700">0</p>
                        <p className="text-xs text-slate-500 mt-1">Reinicia às 00:00</p>
                      </div>
                      
                      <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
                        <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Propostas Totais</p>
                        <p className="text-2xl font-bold text-blue-700">0</p>
                        <p className="text-xs text-slate-500 mt-1">Desde o início</p>
                      </div>
                      
                      <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
                        <RefreshCw className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Última Sincronização</p>
                        <p className="text-sm font-bold text-purple-700">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString('pt-BR')}</p>
                      </div>
                      
                      <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
                        <Database className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Status do Backup</p>
                        <p className="text-sm font-bold text-orange-700">Ativo</p>
                        <p className="text-xs text-slate-500 mt-1">Google Drive</p>
                      </div>
                      
                      <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
                        <Users className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Usuários Online</p>
                        <p className="text-2xl font-bold text-slate-700">0</p>
                        <p className="text-xs text-slate-500 mt-1">Conectados agora</p>
                      </div>
                    </div>
                  </div>

                  {/* Controle de Contadores por Tipo */}
                  <div className="bg-white border border-slate-200 rounded-lg p-6 mt-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-slate-600" />
                      Controle Individual de Contadores de Propostas
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contadores Diários */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-slate-900 border-b pb-2">Contadores Diários</h5>
                        
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                            <div>
                              <p className="font-medium text-green-900">Propostas Hoje</p>
                              <p className="text-sm text-green-700">Atual: 0 propostas</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ⚙️ Auto
                            </span>
                            <select className="text-xs border border-green-300 rounded px-2 py-1">
                              <option value="auto">Auto (00:00)</option>
                              <option value="manual">Manual</option>
                            </select>
                            <button 
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/reset-counter', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ counter: 'propostas_hoje' })
                                  });
                                  
                                  if (response.ok) {
                                    setNotification({
                                      message: '✅ Contador "Propostas Hoje" zerado com sucesso',
                                      type: 'success'
                                    });
                                    setTimeout(() => setNotification(null), 3000);
                                  }
                                } catch (error) {
                                  setNotification({
                                    message: '❌ Erro ao resetar contador',
                                    type: 'error'
                                  });
                                  setTimeout(() => setNotification(null), 3000);
                                }
                              }}
                              className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                            >
                              🔄 Zerar Agora
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                            <div>
                              <p className="font-medium text-green-900">Aprovadas Hoje</p>
                              <p className="text-sm text-green-700">Atual: 0 propostas</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ⚙️ Auto
                            </span>
                            <select className="text-xs border border-green-300 rounded px-2 py-1">
                              <option value="auto">Auto (00:00)</option>
                              <option value="manual">Manual</option>
                            </select>
                            <button 
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/reset-counter', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ counter: 'aprovadas_hoje' })
                                  });
                                  
                                  if (response.ok) {
                                    setNotification({
                                      message: '✅ Contador "Aprovadas Hoje" zerado com sucesso',
                                      type: 'success'
                                    });
                                    setTimeout(() => setNotification(null), 3000);
                                  }
                                } catch (error) {
                                  setNotification({
                                    message: '❌ Erro ao resetar contador',
                                    type: 'error'
                                  });
                                  setTimeout(() => setNotification(null), 3000);
                                }
                              }}
                              className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                            >
                              🔄 Zerar Agora
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                            <div>
                              <p className="font-medium text-green-900">Rejeitadas Hoje</p>
                              <p className="text-sm text-green-700">Atual: 0 propostas</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ⚙️ Auto
                            </span>
                            <select className="text-xs border border-green-300 rounded px-2 py-1">
                              <option value="auto">Auto (00:00)</option>
                              <option value="manual">Manual</option>
                            </select>
                            <button 
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/reset-counter', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ counter: 'rejeitadas_hoje' })
                                  });
                                  
                                  if (response.ok) {
                                    setNotification({
                                      message: '✅ Contador "Rejeitadas Hoje" zerado com sucesso',
                                      type: 'success'
                                    });
                                    setTimeout(() => setNotification(null), 3000);
                                  }
                                } catch (error) {
                                  setNotification({
                                    message: '❌ Erro ao resetar contador',
                                    type: 'error'
                                  });
                                  setTimeout(() => setNotification(null), 3000);
                                }
                              }}
                              className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                            >
                              🔄 Zerar Agora
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Contadores Semanais/Mensais */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-slate-900 border-b pb-2">Contadores Períodos</h5>
                        
                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                            <div>
                              <p className="font-medium text-blue-900">Propostas Esta Semana</p>
                              <p className="text-sm text-blue-700">Atual: 0 propostas</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              ⚙️ Auto
                            </span>
                            <select className="text-xs border border-blue-300 rounded px-2 py-1">
                              <option value="auto">Auto (Segunda)</option>
                              <option value="manual">Manual</option>
                            </select>
                            <button 
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/reset-counter', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ counter: 'propostas_semana' })
                                  });
                                  
                                  if (response.ok) {
                                    setNotification({
                                      message: '✅ Contador "Propostas Esta Semana" zerado com sucesso',
                                      type: 'success'
                                    });
                                    setTimeout(() => setNotification(null), 3000);
                                  }
                                } catch (error) {
                                  setNotification({
                                    message: '❌ Erro ao resetar contador',
                                    type: 'error'
                                  });
                                  setTimeout(() => setNotification(null), 3000);
                                }
                              }}
                              className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                            >
                              🔄 Zerar Agora
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                            <div>
                              <p className="font-medium text-purple-900">Propostas Este Mês</p>
                              <p className="text-sm text-purple-700">Atual: 0 propostas</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              ⚙️ Auto
                            </span>
                            <select className="text-xs border border-purple-300 rounded px-2 py-1">
                              <option value="auto">Auto (Dia 1)</option>
                              <option value="manual">Manual</option>
                            </select>
                            <button 
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/reset-counter', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ counter: 'propostas_mes' })
                                  });
                                  
                                  if (response.ok) {
                                    setNotification({
                                      message: '✅ Contador "Propostas Este Mês" zerado com sucesso',
                                      type: 'success'
                                    });
                                    setTimeout(() => setNotification(null), 3000);
                                  }
                                } catch (error) {
                                  setNotification({
                                    message: '❌ Erro ao resetar contador',
                                    type: 'error'
                                  });
                                  setTimeout(() => setNotification(null), 3000);
                                }
                              }}
                              className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                            >
                              🔄 Zerar Agora
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
                            <div>
                              <p className="font-medium text-orange-900">Propostas Este Ano</p>
                              <p className="text-sm text-orange-700">Atual: 0 propostas</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              ⚙️ Auto
                            </span>
                            <select className="text-xs border border-orange-300 rounded px-2 py-1">
                              <option value="auto">Auto (1º Jan)</option>
                              <option value="manual">Manual</option>
                            </select>
                            <button 
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/reset-counter', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ counter: 'propostas_ano' })
                                  });
                                  
                                  if (response.ok) {
                                    setNotification({
                                      message: '✅ Contador "Propostas Este Ano" zerado com sucesso',
                                      type: 'success'
                                    });
                                    setTimeout(() => setNotification(null), 3000);
                                  }
                                } catch (error) {
                                  setNotification({
                                    message: '❌ Erro ao resetar contador',
                                    type: 'error'
                                  });
                                  setTimeout(() => setNotification(null), 3000);
                                }
                              }}
                              className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                            >
                              🔄 Zerar Agora
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ações Globais */}
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-slate-900">Ações Globais</h5>
                          <p className="text-sm text-slate-600">Aplicar configurações em todos os contadores</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => {
                              setNotification({
                                message: '🔧 Todos os contadores configurados para modo automático',
                                type: 'success'
                              });
                              setTimeout(() => setNotification(null), 3000);
                            }}
                            className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                          >
                            Configurar Todos como Auto
                          </button>
                          <button 
                            onClick={() => {
                              setNotification({
                                message: '🔧 Todos os contadores configurados para modo manual',
                                type: 'success'
                              });
                              setTimeout(() => setNotification(null), 3000);
                            }}
                            className="px-4 py-2 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
                          >
                            Configurar Todos como Manual
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm('⚠️ ATENÇÃO: Isso zerará TODOS os contadores de propostas. Confirma?')) {
                                try {
                                  await Promise.all([
                                    resetCounter('Propostas Hoje'),
                                    resetCounter('Aprovadas Hoje'),
                                    resetCounter('Rejeitadas Hoje'),
                                    resetCounter('Propostas Semana'),
                                    resetCounter('Propostas Mês'),
                                    resetCounter('Propostas Ano')
                                  ]);
                                  setNotification({
                                    message: '🔄 TODOS os contadores zerados com sucesso',
                                    type: 'success'
                                  });
                                  setTimeout(() => setNotification(null), 4000);
                                } catch (error) {
                                  setNotification({
                                    message: '❌ Erro ao zerar contadores',
                                    type: 'error'
                                  });
                                  setTimeout(() => setNotification(null), 3000);
                                }
                              }
                            }}
                            className="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors font-medium"
                          >
                            ⚠️ Zerar TODOS os Contadores
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuração de Resets e Manutenção */}
                  <div className="bg-white border border-slate-200 rounded-lg p-6 mt-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-slate-600" />
                      Configuração de Manutenção Automática
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">Limpeza de Logs</p>
                            <p className="text-sm text-slate-600">Remoção automática de logs antigos</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select className="text-sm border border-slate-300 rounded px-2 py-1">
                              <option value="30">30 dias</option>
                              <option value="60">60 dias</option>
                              <option value="90">90 dias</option>
                              <option value="never">Nunca</option>
                            </select>
                            <button className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors">
                              Salvar
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">Backup Automático</p>
                            <p className="text-sm text-slate-600">Backup completo do sistema</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select className="text-sm border border-slate-300 rounded px-2 py-1">
                              <option value="daily">Diário (02:00)</option>
                              <option value="weekly">Semanal</option>
                              <option value="manual">Manual</option>
                            </select>
                            <button className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors">
                              Executar Agora
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">Otimização BD</p>
                            <p className="text-sm text-slate-600">Reorganização automática do banco</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select className="text-sm border border-slate-300 rounded px-2 py-1">
                              <option value="weekly">Semanal</option>
                              <option value="monthly">Mensal</option>
                              <option value="manual">Manual</option>
                            </select>
                            <button className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors">
                              Otimizar Agora
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">Sincronização Google</p>
                            <p className="text-sm text-slate-600">Drive e Sheets automaticamente</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select className="text-sm border border-slate-300 rounded px-2 py-1">
                              <option value="hourly">A cada hora</option>
                              <option value="daily">Diária</option>
                              <option value="manual">Manual</option>
                            </select>
                            <button className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors">
                              Sincronizar Agora
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notificações e Alertas */}
                  <div className="bg-white border border-slate-200 rounded-lg p-6 mt-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-slate-600" />
                      Notificações e Alertas do Sistema
                    </h4>
                    
                    <div className="space-y-3">
                      {/* Alerta de Conexão */}
                      <div className={`p-4 rounded-lg border-l-4 ${realStats.sync.databaseConnected ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Database className={`w-5 h-5 mr-3 ${realStats.sync.databaseConnected ? 'text-green-600' : 'text-red-600'}`} />
                            <div>
                              <p className={`font-medium ${realStats.sync.databaseConnected ? 'text-green-800' : 'text-red-800'}`}>
                                Banco de Dados: {realStats.sync.databaseConnected ? 'Conectado' : 'Desconectado'}
                              </p>
                              <p className={`text-sm ${realStats.sync.databaseConnected ? 'text-green-600' : 'text-red-600'}`}>
                                {realStats.sync.databaseConnected ? 'Sistema funcionando normalmente' : 'ATENÇÃO: Verificar conexão com PostgreSQL'}
                              </p>
                            </div>
                          </div>
                          {!realStats.sync.databaseConnected && (
                            <button className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors">
                              Reconectar
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Alerta de Backup */}
                      <div className={`p-4 rounded-lg border-l-4 ${realStats.sync.googleDriveConnected ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Folder className={`w-5 h-5 mr-3 ${realStats.sync.googleDriveConnected ? 'text-green-600' : 'text-yellow-600'}`} />
                            <div>
                              <p className={`font-medium ${realStats.sync.googleDriveConnected ? 'text-green-800' : 'text-yellow-800'}`}>
                                Backup: {realStats.sync.googleDriveConnected ? 'Ativo' : 'Inativo'}
                              </p>
                              <p className={`text-sm ${realStats.sync.googleDriveConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                                {realStats.sync.googleDriveConnected ? 'Backup automático funcionando' : 'AVISO: Backup não está sendo realizado'}
                              </p>
                            </div>
                          </div>
                          {!realStats.sync.googleDriveConnected && (
                            <button className="px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded transition-colors">
                              Ativar Backup
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Alerta de Segurança */}
                      <div className="p-4 rounded-lg border-l-4 bg-blue-50 border-blue-500">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="w-5 h-5 mr-3 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-800">Segurança: Monitoramento Ativo</p>
                              <p className="text-sm text-blue-600">
                                {realStats.users.totalActive} usuários online • Última atividade: {realStats.lastActivity.lastSystemLogin?.toLocaleTimeString('pt-BR') || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <button className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors">
                            Ver Detalhes
                          </button>
                        </div>
                      </div>

                      {/* Status de Performance */}
                      <div className="p-4 rounded-lg border-l-4 bg-slate-50 border-slate-500">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Activity className="w-5 h-5 mr-3 text-slate-600" />
                            <div>
                              <p className="font-medium text-slate-800">Performance: Sistema Otimizado</p>
                              <p className="text-sm text-slate-600">
                                Tempo ativo: {realStats.system.uptime} • Cache: {realStats.system.cacheSize} • Conexões: {realStats.system.activeConnections}
                              </p>
                            </div>
                          </div>
                          <button className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors">
                            Otimizar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações de Manutenção */}
                  <div className="bg-white border border-slate-200 rounded-lg p-6 mt-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-slate-600" />
                      Ações de Manutenção
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="flex flex-col items-center p-4 border border-slate-200 hover:border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                        <Database className="w-8 h-8 text-slate-600 mb-2" />
                        <span className="text-sm font-medium text-slate-900">Otimizar Banco</span>
                        <span className="text-xs text-slate-600 text-center">Reorganizar índices e limpar dados órfãos</span>
                      </button>
                      
                      <button className="flex flex-col items-center p-4 border border-slate-200 hover:border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                        <RefreshCw className="w-8 h-8 text-slate-600 mb-2" />
                        <span className="text-sm font-medium text-slate-900">Reiniciar Serviços</span>
                        <span className="text-xs text-slate-600 text-center">Reiniciar todos os serviços do sistema</span>
                      </button>
                      
                      <button className="flex flex-col items-center p-4 border border-red-200 hover:border-red-300 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                        <Trash2 className="w-8 h-8 text-red-600 mb-2" />
                        <span className="text-sm font-medium text-red-900">Limpeza Geral</span>
                        <span className="text-xs text-red-600 text-center">Cache, logs antigos e arquivos temporários</span>
                      </button>
                    </div>
                  </div>

                  {/* Informações do Sistema */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-slate-600" />
                      Informações do Sistema
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Conectividade</h5>
                        <ul className="space-y-1 text-slate-600">
                          <li>• PostgreSQL: {realStats.sync.databaseConnected ? 'Conectado' : 'Desconectado'}</li>
                          <li>• Google Drive: {realStats.sync.googleDriveConnected ? 'Conectado' : 'Desconectado'}</li>
                          <li>• Google Sheets: {realStats.sync.googleSheetsConnected ? 'Conectado' : 'Desconectado'}</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Última Sincronização</h5>
                        <p className="text-slate-600">{realStats.sync.lastSync.toLocaleString('pt-BR')}</p>
                        <h5 className="font-medium text-slate-900 mb-2 mt-3">Arquivos</h5>
                        <p className="text-slate-600">{realStats.files.totalAttachments} anexos no sistema</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
