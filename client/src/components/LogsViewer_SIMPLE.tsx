import React, { useState, useEffect } from 'react';
import { FileText, Filter, Download, Play, Pause, Trash2, Search, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  module: string;
  message: string;
  details?: string;
}

export default function LogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Dados simulados para evitar problemas de API
  const mockLogs: LogEntry[] = [
    {
      id: 1,
      timestamp: '2025-01-25T19:30:15.123Z',
      level: 'info',
      module: 'Authentication',
      message: 'Usuário felipe@abmix.com.br realizou login com sucesso',
      details: 'IP: 192.168.1.100, User-Agent: Mozilla/5.0'
    },
    {
      id: 2,
      timestamp: '2025-01-25T19:29:45.456Z',
      level: 'info',
      module: 'Google Drive',
      message: 'Pasta criada com sucesso para cliente: Empresa ABC',
      details: 'Folder ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
    },
    {
      id: 3,
      timestamp: '2025-01-25T19:28:30.789Z',
      level: 'warning',
      module: 'Google Sheets',
      message: 'Tentativa de sincronização falhou, tentando novamente',
      details: 'Erro: Rate limit exceeded, aguardando 30 segundos'
    },
    {
      id: 4,
      timestamp: '2025-01-25T19:27:12.321Z',
      level: 'error',
      module: 'Database',
      message: 'Erro ao conectar com PostgreSQL',
      details: 'ECONNREFUSED: Connection refused at port 5432'
    },
    {
      id: 5,
      timestamp: '2025-01-25T19:26:45.654Z',
      level: 'debug',
      module: 'API Routes',
      message: 'POST /api/proposals - Proposta criada',
      details: 'Proposal ID: PROP-12345, Vendor: comercial14@abmix.com.br'
    },
    {
      id: 6,
      timestamp: '2025-01-25T19:25:30.987Z',
      level: 'info',
      module: 'Backup System',
      message: 'Backup automático executado com sucesso',
      details: 'Tamanho: 127MB, Arquivos: 1,247'
    }
  ];

  useEffect(() => {
    setLogs(mockLogs);
  }, []);

  // Simular logs em tempo real
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        level: ['info', 'warning', 'error', 'debug'][Math.floor(Math.random() * 4)] as LogEntry['level'],
        module: ['Authentication', 'Google Drive', 'Google Sheets', 'Database', 'API Routes', 'Backup System'][Math.floor(Math.random() * 6)],
        message: `Evento simulado ${Math.floor(Math.random() * 1000)}`,
        details: 'Detalhes do evento simulado'
      };

      setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Manter apenas 100 logs
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredLogs = logs.filter(log => {
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesLevel && matchesModule && matchesSearch;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'debug': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'debug': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os logs?')) {
      setLogs([]);
    }
  };

  const handleExportLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.module}] ${log.message}${log.details ? '\n  Details: ' + log.details : ''}`
    ).join('\n\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sistema_logs_${new Date().toISOString().slice(0, 10)}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueModules = [...new Set(logs.map(log => log.module))];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Logs do Sistema</h3>
            <div className="ml-4 flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {isLive ? 'Ao vivo' : 'Pausado'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                isLive 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isLive ? 'Pausar' : 'Continuar'}
            </button>
            <button
              onClick={handleExportLogs}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
            <button
              onClick={handleClearLogs}
              className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos os Níveis</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos os Módulos</option>
            {uniqueModules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Info</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{logs.filter(l => l.level === 'info').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Warning</p>
                <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">{logs.filter(l => l.level === 'warning').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Error</p>
                <p className="text-lg font-bold text-red-900 dark:text-red-100">{logs.filter(l => l.level === 'error').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Debug</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{logs.filter(l => l.level === 'debug').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Console de Logs */}
        <div className="bg-black rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
          {filteredLogs.length === 0 ? (
            <p className="text-gray-500">Nenhum log encontrado</p>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="mb-3 border-b border-gray-800 pb-2">
                <div className="flex items-center mb-1">
                  <span className="text-gray-500 mr-2">
                    [{new Date(log.timestamp).toLocaleString('pt-BR')}]
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full mr-2 ${getLevelColor(log.level)}`}>
                    {getLevelIcon(log.level)}
                    <span className="ml-1 uppercase">{log.level}</span>
                  </span>
                  <span className="text-purple-400 mr-2">[{log.module}]</span>
                </div>
                <p className="text-white mb-1">{log.message}</p>
                {log.details && (
                  <p className="text-gray-400 text-xs pl-4 border-l-2 border-gray-700">
                    {log.details}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Mostrando {filteredLogs.length} de {logs.length} logs
        </div>
      </div>
    </div>
  );
}