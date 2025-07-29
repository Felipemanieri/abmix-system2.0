import { useState, useEffect, useRef } from 'react';
import { Monitor, Download, RefreshCw, Trash2, Search, Filter, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  module: string;
  message: string;
  details?: any;
}

export default function LogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'control'>('logs');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Gerar log de exemplo
  const generateLog = (message: string, level: LogEntry['level'], module: string): LogEntry => ({
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    level,
    module,
    message,
  });

  // Sistema simplificado de logs
  useEffect(() => {
    if (!isLive) return;

    // Logs iniciais do sistema
    const initialLogs = [
      generateLog('Sistema Abmix iniciado com sucesso', 'success', 'Sistema'),
      generateLog('Conexão com banco de dados estabelecida', 'info', 'Database'),
      generateLog('Google Sheets integração ativa', 'success', 'Google'),
      generateLog('Portais carregados corretamente', 'info', 'Portais'),
      generateLog('Servidor rodando na porta 5000', 'info', 'Servidor')
    ];

    setLogs(initialLogs);
    setFilteredLogs(initialLogs);

    // Simular logs periódicos
    const interval = setInterval(() => {
      const randomLogs = [
        generateLog('Usuário acessou portal vendedor', 'info', 'Login'),
        generateLog('Nova proposta criada', 'success', 'Propostas'),
        generateLog('Sincronização Google Sheets realizada', 'info', 'Google'),
        generateLog('Backup automático executado', 'success', 'Sistema'),
        generateLog('Conexão WebSocket ativa', 'info', 'WebSocket')
      ];
      
      const randomLog = randomLogs[Math.floor(Math.random() * randomLogs.length)];
      setLogs(prevLogs => [...prevLogs, randomLog].slice(-100));
    }, 5000);

    return () => clearInterval(interval);
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
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `logs_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
      case 'error': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'success': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const modules = [...new Set(logs.map(log => log.module))];

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Monitor className="w-4 h-4 inline mr-2" />
          Logs do Sistema
        </button>
        <button
          onClick={() => setActiveTab('control')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'control'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Controles
        </button>
      </div>

      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Controles superiores */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos os níveis</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>

              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos os módulos</option>
                {modules.map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsLive(!isLive)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {isLive ? 'Live' : 'Pausado'}
              </button>
              
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoScroll
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                Auto Scroll
              </button>
              
              <button
                onClick={exportLogs}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
              
              <button
                onClick={clearLogs}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar
              </button>
            </div>
          </div>

          {/* Lista de logs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum log encontrado</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 border-l-4 ${getLevelColor(log.level)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getLevelIcon(log.level)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                              {log.module}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white break-words">
                            {log.message}
                          </p>
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
      )}

      {activeTab === 'control' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Controles do Sistema
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Status do sistema de logs
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Ativo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Total de logs capturados
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {logs.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}