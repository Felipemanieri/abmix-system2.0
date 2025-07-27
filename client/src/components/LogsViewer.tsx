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
  const [autoScroll, setAutoScroll] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Simular logs do sistema (em produção, viria do backend)
  const generateMockLog = (): LogEntry => {
    const levels: ('info' | 'warning' | 'error' | 'success')[] = ['info', 'warning', 'error', 'success'];
    const modules = ['API', 'Database', 'Auth', 'FileUpload', 'GoogleSheets', 'WhatsApp', 'Email', 'Proposal', 'User'];
    const messages = {
      info: [
        'Sistema iniciado com sucesso',
        'Conectado ao banco de dados',
        'Usuário autenticado',
        'Proposta criada com ID: PROP-{id}',
        'Arquivo enviado para Google Drive',
        'Sincronização com Google Sheets concluída'
      ],
      warning: [
        'Taxa de uso da API próxima do limite',
        'Conexão lenta detectada',
        'Cache invalidado',
        'Sessão expirando em 5 minutos',
        'Memória em 85% de uso'
      ],
      error: [
        'Falha ao conectar com Google Drive API',
        'Erro de validação nos dados do formulário',
        'Timeout na conexão com banco de dados',
        'Falha na autenticação do usuário',
        'Erro ao processar upload de arquivo'
      ],
      success: [
        'Proposta enviada com sucesso',
        'Usuário criado com sucesso',
        'Backup concluído',
        'Integração configurada corretamente',
        'Email enviado com sucesso'
      ]
    };

    const level = levels[Math.floor(Math.random() * levels.length)];
    const module = modules[Math.floor(Math.random() * modules.length)];
    const messageTemplates = messages[level];
    const message = messageTemplates[Math.floor(Math.random() * messageTemplates.length)]
      .replace('{id}', Math.random().toString(36).substring(7));

    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      level,
      module,
      message,
      details: level === 'error' ? { 
        stack: 'Error stack trace would appear here...',
        code: 'ERR_' + Math.floor(Math.random() * 1000)
      } : undefined
    };
  };

  // Adicionar logs em tempo real
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newLog = generateMockLog();
      setLogs(prev => [...prev.slice(-49), newLog]); // Manter últimos 50 logs
    }, Math.random() * 3000 + 1000); // Entre 1-4 segundos

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

  // Estado para controlar se o usuário está interagindo manualmente
  const [userScrolling, setUserScrolling] = useState(false);
  const userScrollTimeout = useRef<NodeJS.Timeout>();

  // Auto scroll inteligente - só rola se usuário não estiver navegando manualmente
  useEffect(() => {
    if (autoScroll && !userScrolling && logsEndRef.current && logsContainerRef.current) {
      const container = logsContainerRef.current;
      
      // Para os primeiros logs, NÃO faz auto-scroll para evitar movimento indesejado
      if (filteredLogs.length <= 4) {
        // Não faz nada - deixa o usuário controlar manualmente
        return;
      } else {
        // Para listas maiores, verifica se está realmente no final
        const isAtBottom = Math.abs(container.scrollTop + container.clientHeight - container.scrollHeight) <= 5;
        if (isAtBottom) {
          setTimeout(() => {
            if (logsEndRef.current && !userScrolling && autoScroll) {
              logsEndRef.current.scrollIntoView({ behavior: 'auto' });
            }
          }, 100);
        }
      }
    }
  }, [filteredLogs, autoScroll, userScrolling]);

  // Detectar quando usuário está rolando manualmente
  useEffect(() => {
    const container = logsContainerRef.current;
    if (!container) return;

    let isUserScrolling = false;

    const handleUserInteraction = () => {
      isUserScrolling = true;
      setUserScrolling(true);
      
      // Limpa timeout anterior
      if (userScrollTimeout.current) {
        clearTimeout(userScrollTimeout.current);
      }
      
      // Define que parou de rolar após 3 segundos de inatividade
      userScrollTimeout.current = setTimeout(() => {
        isUserScrolling = false;
        setUserScrolling(false);
        
        // Só reativa auto-scroll se tiver mais de 4 logs e estiver no final
        if (container.scrollHeight > container.clientHeight) {
          const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
          if (isAtBottom) {
            setAutoScroll(true);
          }
        }
      }, 3000);
    };

    const handleScroll = (e: Event) => {
      // Se não foi um scroll programático, marca como interação do usuário
      if (!e.isTrusted) return;
      
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
      
      // Se o usuário saiu do final da lista, desabilita auto-scroll
      if (!isAtBottom) {
        setAutoScroll(false);
        handleUserInteraction();
      }
    };

    // Detecta todos os tipos de interação do usuário
    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('wheel', handleUserInteraction, { passive: true });
    container.addEventListener('touchstart', handleUserInteraction, { passive: true });
    container.addEventListener('touchmove', handleUserInteraction, { passive: true });
    container.addEventListener('mousedown', handleUserInteraction, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleUserInteraction);
      container.removeEventListener('touchstart', handleUserInteraction);
      container.removeEventListener('touchmove', handleUserInteraction);
      container.removeEventListener('mousedown', handleUserInteraction);
      if (userScrollTimeout.current) {
        clearTimeout(userScrollTimeout.current);
      }
    };
  }, []);

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
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const logContent = filteredLogs.map(log => 
      `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] [${log.module}] ${log.message}`
    ).join('\n');

    const blob = new Blob([logContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `system_logs_${new Date().toISOString().split('T')[0]}.log`;
    link.click();
  };

  const uniqueModules = [...new Set(logs.map(log => log.module))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Monitor className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Logs do Sistema em Tempo Real</h3>
              <p className="text-gray-600">Monitoramento completo das operações do sistema</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isLive 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              <Monitor className="w-4 h-4 mr-2" />
              {isLive ? 'Pausar' : 'Ativar'} Live
            </button>
            <button
              onClick={clearLogs}
              className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar
            </button>
            <button
              onClick={exportLogs}
              disabled={filteredLogs.length === 0}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-700">Info</p>
                <p className="text-xl font-bold text-blue-900">
                  {logs.filter(l => l.level === 'info').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-700">Success</p>
                <p className="text-xl font-bold text-green-900">
                  {logs.filter(l => l.level === 'success').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-700">Warning</p>
                <p className="text-xl font-bold text-yellow-900">
                  {logs.filter(l => l.level === 'warning').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-red-700">Error</p>
                <p className="text-xl font-bold text-red-900">
                  {logs.filter(l => l.level === 'error').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar nos logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg w-64"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Todos os níveis</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Todos os módulos</option>
              {uniqueModules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoscroll"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoscroll" className="text-sm text-gray-700">
              Auto scroll
            </label>
          </div>
        </div>
      </div>

      {/* Console de Logs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-600" />
              Console de Logs ({filteredLogs.length} entradas)
            </h4>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isLive ? 'Monitoramento ativo' : 'Pausado'}
              </span>
            </div>
          </div>
        </div>

        <div 
          ref={logsContainerRef}
          className="max-h-96 overflow-y-auto bg-gray-900 text-gray-100 font-mono text-sm"
        >
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum log encontrado</p>
              {searchTerm && <p className="text-xs mt-2">Tente ajustar os filtros de busca</p>}
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 p-3 rounded border-l-4 ${getLevelColor(log.level)}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getLevelIcon(log.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs text-gray-500 font-mono">
                        {log.timestamp.toLocaleTimeString('pt-BR')}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded font-semibold ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        log.level === 'success' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded font-medium">
                        {log.module}
                      </span>
                    </div>
                    <p className="text-gray-800 break-words">{log.message}</p>
                    {log.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                          Detalhes técnicos
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}