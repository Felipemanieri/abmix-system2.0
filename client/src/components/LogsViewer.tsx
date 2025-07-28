import { useState, useEffect, useRef } from 'react';
import { Monitor, Download, RefreshCw, Trash2, Search, Filter, AlertTriangle, CheckCircle, Info, X, BarChart3, Database, Users, FileText, Calendar, Clock, Settings } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  module: string;
  message: string;
  details?: any;
}

interface SystemStats {
  totalProposals: number;
  todayProposals: number;
  monthProposals: number;
  yearProposals: number;
  totalUsers: number;
  totalVendors: number;
  lastSync: Date | null;
  systemUptime: string;
  databaseSize: string;
  activeConnections: number;
  lastBackup: Date | null;
  cacheSize: string;
  tempFiles: number;
  sessionsActive: number;
}

interface ProposalStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  thisMonth: number;
  thisYear: number;
  byMonth: Record<string, number>;
  byYear: Record<string, number>;
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
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalProposals: 125,
    todayProposals: 8,
    monthProposals: 23,
    yearProposals: 89,
    totalUsers: 22,
    totalVendors: 13,
    lastSync: new Date(),
    systemUptime: '5h 32m',
    databaseSize: '45 MB',
    activeConnections: 3,
    lastBackup: new Date(),
    cacheSize: '12 MB',
    tempFiles: 45,
    sessionsActive: 7
  });
  const [proposalStats, setProposalStats] = useState<ProposalStats>({
    total: 125,
    approved: 89,
    pending: 28,
    rejected: 8,
    thisMonth: 23,
    thisYear: 89,
    byMonth: {
      '2025-01': 15,
      '2025-02': 22,
      '2025-03': 18,
      '2025-04': 25,
      '2025-05': 20,
      '2025-06': 17,
      '2025-07': 23
    },
    byYear: {
      '2023': 156,
      '2024': 289,
      '2025': 89
    }
  });
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

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
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Controle do Sistema</h3>
                    <p className="text-gray-600">Estatísticas completas e controle de operações do sistema</p>
                  </div>
                </div>
              </div>

              {/* Filtros de Ano/Mês */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Filtrar dados:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os Meses</option>
                    <option value="01">Janeiro</option>
                    <option value="02">Fevereiro</option>
                    <option value="03">Março</option>
                    <option value="04">Abril</option>
                    <option value="05">Maio</option>
                    <option value="06">Junho</option>
                    <option value="07">Julho</option>
                    <option value="08">Agosto</option>
                    <option value="09">Setembro</option>
                    <option value="10">Outubro</option>
                    <option value="11">Novembro</option>
                    <option value="12">Dezembro</option>
                  </select>
                </div>
              </div>

              {/* Estatísticas Principais de Propostas */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Estatísticas de Propostas
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Total Geral</p>
                        <p className="text-2xl font-bold text-blue-900">{proposalStats.total}</p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                    <button className="mt-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors">
                      Exportar Relatório
                    </button>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Hoje</p>
                        <p className="text-2xl font-bold text-green-900">{systemStats.todayProposals}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-green-500" />
                    </div>
                    <button className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors">
                      Zerar Contador (00:00h)
                    </button>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-700 font-medium">Este Mês</p>
                        <p className="text-2xl font-bold text-purple-900">{systemStats.monthProposals}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-purple-500" />
                    </div>
                    <button className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors">
                      Limpar Mês Atual
                    </button>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-700 font-medium">Este Ano</p>
                        <p className="text-2xl font-bold text-orange-900">{systemStats.yearProposals}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-orange-500" />
                    </div>
                    <button className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors">
                      Limpar Ano Atual
                    </button>
                  </div>
                </div>
              </div>

              {/* Status das Propostas */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Status das Propostas</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-green-700 font-medium">Aprovadas</p>
                      <p className="text-2xl font-bold text-green-900">{proposalStats.approved}</p>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm text-yellow-700 font-medium">Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-900">{proposalStats.pending}</p>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-center">
                      <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-red-700 font-medium">Rejeitadas</p>
                      <p className="text-2xl font-bold text-red-900">{proposalStats.rejected}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <BarChart3 className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-medium">Taxa Aprovação</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round((proposalStats.approved / proposalStats.total) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações de Manutenção */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  Ações de Manutenção do Sistema
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="flex flex-col items-center p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 hover:border-red-300 transition-colors">
                    <Trash2 className="w-8 h-8 mb-3" />
                    <span className="text-sm font-medium mb-2">Limpar Logs do Sistema</span>
                    <span className="text-xs text-center text-red-600 leading-tight">
                      Remove todos os logs de auditoria, debug e monitoramento. Use com cuidado.
                    </span>
                  </button>
                  
                  <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg border border-orange-200 hover:border-orange-300 transition-colors">
                    <RefreshCw className="w-8 h-8 mb-3" />
                    <span className="text-sm font-medium mb-2">Limpar Cache do Sistema</span>
                    <span className="text-xs text-center text-orange-600 leading-tight">
                      Limpa cache de aplicação ({systemStats.cacheSize}) e dados temporários.
                    </span>
                  </button>
                  
                  <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                    <Database className="w-8 h-8 mb-3" />
                    <span className="text-sm font-medium mb-2">Otimizar Banco de Dados</span>
                    <span className="text-xs text-center text-blue-600 leading-tight">
                      Reorganiza índices e compacta tabelas ({systemStats.databaseSize}).
                    </span>
                  </button>
                  
                  <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 hover:border-green-300 transition-colors">
                    <FileText className="w-8 h-8 mb-3" />
                    <span className="text-sm font-medium mb-2">Limpar Arquivos Temporários</span>
                    <span className="text-xs text-center text-green-600 leading-tight">
                      Remove {systemStats.tempFiles} arquivos temporários e uploads não utilizados.
                    </span>
                  </button>
                  
                  <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                    <Users className="w-8 h-8 mb-3" />
                    <span className="text-sm font-medium mb-2">Limpar Sessões Expiradas</span>
                    <span className="text-xs text-center text-purple-600 leading-tight">
                      Remove sessões antigas, tokens inválidos e cookies expirados.
                    </span>
                  </button>
                  
                  <button className="flex flex-col items-center p-4 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg border border-red-300 hover:border-red-400 transition-colors">
                    <AlertTriangle className="w-8 h-8 mb-3" />
                    <span className="text-sm font-medium mb-2">⚠️ LIMPAR TUDO</span>
                    <span className="text-xs text-center text-red-700 leading-tight">
                      Executa TODAS as limpezas acima. Ação irreversível!
                    </span>
                  </button>
                </div>
              </div>

              {/* Manual de Uso */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Manual de Uso - Controle do Sistema
                </h4>
                
                <div className="space-y-4 text-sm">
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <h5 className="font-semibold text-amber-900 mb-2">📊 Estatísticas de Propostas</h5>
                    <ul className="space-y-1 text-amber-800 list-disc list-inside">
                      <li><strong>Total Geral:</strong> Todas as propostas já criadas no sistema</li>
                      <li><strong>Hoje:</strong> Propostas criadas hoje (zera automaticamente à meia-noite)</li>
                      <li><strong>Este Mês:</strong> Propostas do mês atual (pode ser limpo manualmente)</li>
                      <li><strong>Este Ano:</strong> Propostas do ano atual (pode ser limpo manualmente)</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <h5 className="font-semibold text-amber-900 mb-2">🧹 Ações de Limpeza</h5>
                    <ul className="space-y-1 text-amber-800 list-disc list-inside">
                      <li><strong>Limpar Logs:</strong> Remove histórico de atividades (recomendado mensalmente)</li>
                      <li><strong>Limpar Cache:</strong> Acelera o sistema removendo dados temporários</li>
                      <li><strong>Otimizar BD:</strong> Melhora performance do banco de dados</li>
                      <li><strong>Arquivos Temp:</strong> Libera espaço removendo uploads antigos</li>
                      <li><strong>Sessões:</strong> Remove usuários inativos e tokens expirados</li>
                      <li><strong>Limpar Tudo:</strong> ⚠️ Faz todas as limpezas de uma vez (cuidado!)</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <h5 className="font-semibold text-amber-900 mb-2">⚠️ Cuidados Importantes</h5>
                    <ul className="space-y-1 text-amber-800 list-disc list-inside">
                      <li>Sempre faça backup antes de limpar dados importantes</li>
                      <li>Evite limpezas durante horário comercial (pode afetar usuários)</li>
                      <li>A ação "Limpar Tudo" não pode ser desfeita</li>
                      <li>Logs são importantes para auditoria - limpe apenas quando necessário</li>
                      <li>Use filtros de ano/mês para analisar dados específicos</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <h5 className="font-semibold text-amber-900 mb-2">📅 Programação Automática</h5>
                    <p className="text-amber-800">
                      • <strong>Contador "Hoje":</strong> Zera automaticamente todo dia às 00:00h<br/>
                      • <strong>Backup:</strong> Executado automaticamente todas as noites<br/>
                      • <strong>Limpeza de Cache:</strong> Executada automaticamente a cada 6 horas<br/>
                      • <strong>Sessões:</strong> Limpeza automática de sessões expiradas a cada hora
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
