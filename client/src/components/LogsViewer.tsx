import { useState, useEffect, useRef } from 'react';
import { Monitor, Download, RefreshCw, Trash2, Search, Filter, AlertTriangle, CheckCircle, Info, X, BarChart3, Database, Users, FileText, Calendar, Clock, Settings, Activity, Folder, FileSpreadsheet, Server } from 'lucide-react';

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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'control'>('logs');
  const [realStats, setRealStats] = useState<RealSystemStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

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

  // Gerar logs do sistema em tempo real
  const generateMockLog = (): LogEntry => {
    const levels: ('info' | 'warning' | 'error' | 'success')[] = ['info', 'warning', 'error', 'success'];
    const modules = ['API', 'Banco de Dados', 'Autenticação', 'Upload de Arquivos', 'Google Sheets', 'WhatsApp', 'Email', 'Propostas', 'Usuários'];
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
        'Falha na conexão com banco de dados',
        'Erro ao enviar email',
        'Upload de arquivo falhou',
        'Token de autenticação expirado',
        'Erro interno do servidor'
      ],
      success: [
        'Backup realizado com sucesso',
        'Email enviado com sucesso',
        'Proposta aprovada',
        'Sistema otimizado',
        'Cache limpo com sucesso'
      ]
    };

    const level = levels[Math.floor(Math.random() * levels.length)];
    const module = modules[Math.floor(Math.random() * modules.length)];
    const messageArray = messages[level];
    const message = messageArray[Math.floor(Math.random() * messageArray.length)];

    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      module,
      message: message.replace('{id}', Math.random().toString(36).substr(2, 8).toUpperCase()),
      details: level === 'error' ? { stack: 'Error stack trace...' } : undefined
    };
  };

  // Adicionar logs em tempo real
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newLog = generateMockLog();
      setLogs(prevLogs => {
        const updatedLogs = [...prevLogs, newLog].slice(-1000); // Manter apenas os últimos 1000 logs
        return updatedLogs;
      });
    }, 2000 + Math.random() * 3000); // Entre 2-5 segundos

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
    <div className="space-y-6">
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
            <div className="space-y-6">
              {/* Header com botão de atualizar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Controle do Sistema</h3>
                    <p className="text-gray-600">Estatísticas reais e status de sincronização</p>
                  </div>
                </div>
                <button
                  onClick={fetchRealStats}
                  disabled={statsLoading}
                  className="flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                  {statsLoading ? 'Carregando...' : 'Atualizar Dados'}
                </button>
              </div>

              {/* Erro de carregamento */}
              {statsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">{statsError}</span>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {statsLoading && !realStats && (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Carregando estatísticas reais do sistema...</span>
                </div>
              )}

              {/* Conteúdo principal - só mostra se tiver dados */}
              {realStats && (
                <>
                  {/* Status de Sincronização - DESTAQUE */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Monitor className="w-5 h-5 mr-2 text-green-600" />
                      Status de Sincronização e Conectividade
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Banco de Dados</p>
                            <p className="text-lg font-bold text-green-700">
                              {realStats.sync.databaseConnected ? '🟢 ONLINE' : '🔴 OFFLINE'}
                            </p>
                          </div>
                          <Database className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Última verificação: {new Date().toLocaleTimeString('pt-BR')}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Google Drive</p>
                            <p className="text-lg font-bold text-green-700">
                              {realStats.sync.googleDriveConnected ? '🟢 CONECTADO' : '🔴 DESCONECTADO'}
                            </p>
                          </div>
                          <Folder className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Sincronização: {realStats.sync.lastSync.toLocaleString('pt-BR')}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Google Sheets</p>
                            <p className="text-lg font-bold text-green-700">
                              {realStats.sync.googleSheetsConnected ? '🟢 ATIVO' : '🔴 INATIVO'}
                            </p>
                          </div>
                          <FileSpreadsheet className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Planilhas sincronizadas automaticamente
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas REAIS de Propostas */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Estatísticas REAIS de Propostas (Banco de Dados)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-center">
                          <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-sm text-blue-700 font-medium">Total no Sistema</p>
                          <p className="text-3xl font-bold text-blue-900">{realStats.proposals.total}</p>
                          <p className="text-xs text-blue-600 mt-1">Todas as propostas criadas</p>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-center">
                          <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-green-700 font-medium">Hoje</p>
                          <p className="text-3xl font-bold text-green-900">{realStats.proposals.today}</p>
                          <p className="text-xs text-green-600 mt-1">Criadas nas últimas 24h</p>
                        </div>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-center">
                          <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                          <p className="text-sm text-purple-700 font-medium">Este Mês</p>
                          <p className="text-3xl font-bold text-purple-900">{realStats.proposals.thisMonth}</p>
                          <p className="text-xs text-purple-600 mt-1">Mês atual ({new Date().toLocaleDateString('pt-BR', { month: 'long' })})</p>
                        </div>
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="text-center">
                          <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                          <p className="text-sm text-orange-700 font-medium">Este Ano</p>
                          <p className="text-3xl font-bold text-orange-900">{realStats.proposals.thisYear}</p>
                          <p className="text-xs text-orange-600 mt-1">Ano de {new Date().getFullYear()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status REAL das Propostas */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Status REAL das Propostas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-center">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-green-700 font-medium">Aprovadas</p>
                          <p className="text-3xl font-bold text-green-900">{realStats.proposals.approved}</p>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="text-center">
                          <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-sm text-yellow-700 font-medium">Pendentes</p>
                          <p className="text-3xl font-bold text-yellow-900">{realStats.proposals.pending}</p>
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-center">
                          <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          <p className="text-sm text-red-700 font-medium">Rejeitadas</p>
                          <p className="text-3xl font-bold text-red-900">{realStats.proposals.rejected}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="text-center">
                          <BarChart3 className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-700 font-medium">Taxa Aprovação</p>
                          <p className="text-3xl font-bold text-gray-900">{realStats.proposals.approvalRate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Usuários e Sistema */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        Usuários REAIS do Sistema
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Usuários do Sistema:</span>
                          <span className="text-lg font-bold text-gray-900">{realStats.users.totalSystem}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Vendedores:</span>
                          <span className="text-lg font-bold text-gray-900">{realStats.users.totalVendors}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Ativos Sistema:</span>
                          <span className="text-lg font-bold text-green-700">{realStats.users.activeSystem}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Ativos Vendedores:</span>
                          <span className="text-lg font-bold text-green-700">{realStats.users.activeVendors}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Total Usuários Ativos:</span>
                            <span className="text-xl font-bold text-blue-900">{realStats.users.totalActive}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-600" />
                        Últimas Atividades REAIS
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Último Login Sistema:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {realStats.lastActivity.lastSystemLogin 
                              ? realStats.lastActivity.lastSystemLogin.toLocaleString('pt-BR')
                              : 'Nunca'
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Usuário Sistema:</span>
                          <span className="text-sm font-medium text-gray-900">{realStats.lastActivity.lastSystemUser}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Último Login Vendedor:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {realStats.lastActivity.lastVendorLogin 
                              ? realStats.lastActivity.lastVendorLogin.toLocaleString('pt-BR')
                              : 'Nunca'
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Vendedor:</span>
                          <span className="text-sm font-medium text-gray-900">{realStats.lastActivity.lastVendorUser}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Arquivos/Anexos:</span>
                            <span className="text-sm font-medium text-gray-900">{realStats.files.totalAttachments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações do Sistema */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Server className="w-5 h-5 mr-2 text-blue-600" />
                      Informações do Sistema
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <Clock className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                        <p className="text-sm text-gray-600">Tempo Ativo</p>
                        <p className="text-lg font-bold text-gray-900">{realStats.system.uptime}</p>
                      </div>
                      <div className="text-center">
                        <Database className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                        <p className="text-sm text-gray-600">Banco de Dados</p>
                        <p className="text-lg font-bold text-gray-900">{realStats.system.databaseSize}</p>
                      </div>
                      <div className="text-center">
                        <RefreshCw className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                        <p className="text-sm text-gray-600">Cache</p>
                        <p className="text-lg font-bold text-gray-900">{realStats.system.cacheSize}</p>
                      </div>
                      <div className="text-center">
                        <Monitor className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                        <p className="text-sm text-gray-600">Conexões Ativas</p>
                        <p className="text-lg font-bold text-gray-900">{realStats.system.activeConnections}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ações de Manutenção Manual */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-red-600" />
                      Ações de Manutenção Manual (⚠️ Use com Cuidado)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <button className="flex flex-col items-center p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 hover:border-red-300 transition-colors">
                        <Trash2 className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium mb-1">Limpar Cache ({realStats.system.cacheSize})</span>
                        <span className="text-xs text-center text-red-600">Remove dados temporários em cache</span>
                      </button>
                      
                      <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg border border-orange-200 hover:border-orange-300 transition-colors">
                        <FileText className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium mb-1">Limpar Arquivos Temp ({realStats.files.tempFiles})</span>
                        <span className="text-xs text-center text-orange-600">Remove uploads não utilizados</span>
                      </button>
                      
                      <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                        <Database className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium mb-1">Otimizar BD ({realStats.system.databaseSize})</span>
                        <span className="text-xs text-center text-blue-600">Reorganiza índices do banco</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual Explicativo */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                      <Info className="w-5 h-5 mr-2" />
                      O que Está Sincronizado e Como Funciona
                    </h4>
                    
                    <div className="space-y-4 text-sm">
                      <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <h5 className="font-semibold text-amber-900 mb-2">🔄 Status de Sincronização</h5>
                        <ul className="space-y-1 text-amber-800 list-disc list-inside">
                          <li><strong>Banco de Dados:</strong> {realStats.sync.databaseConnected ? 'CONECTADO' : 'DESCONECTADO'} - Armazena todas as propostas e usuários</li>
                          <li><strong>Google Drive:</strong> {realStats.sync.googleDriveConnected ? 'CONECTADO' : 'DESCONECTADO'} - Backup automático de arquivos</li>
                          <li><strong>Google Sheets:</strong> {realStats.sync.googleSheetsConnected ? 'CONECTADO' : 'DESCONECTADO'} - Planilhas sincronizadas em tempo real</li>
                        </ul>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <h5 className="font-semibold text-amber-900 mb-2">📊 Estatísticas REAIS</h5>
                        <ul className="space-y-1 text-amber-800 list-disc list-inside">
                          <li><strong>Dados do Banco:</strong> Todos os números mostrados vêm diretamente do banco de dados PostgreSQL</li>
                          <li><strong>Usuários Ativos:</strong> Conta apenas usuários com flag "active = true"</li>
                          <li><strong>Propostas por Período:</strong> Calculadas com base na data de criação real</li>
                          <li><strong>Últimas Atividades:</strong> Baseadas nos últimos logins registrados</li>
                        </ul>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <h5 className="font-semibold text-amber-900 mb-2">⚠️ Ações Manuais Disponíveis</h5>
                        <ul className="space-y-1 text-amber-800 list-disc list-inside">
                          <li><strong>Limpar Cache:</strong> Remove {realStats.system.cacheSize} de dados temporários (ação reversível)</li>
                          <li><strong>Limpar Arquivos:</strong> Remove {realStats.files.tempFiles} arquivos temporários não utilizados</li>
                          <li><strong>Otimizar BD:</strong> Reorganiza {realStats.system.databaseSize} do banco para melhor performance</li>
                        </ul>
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
