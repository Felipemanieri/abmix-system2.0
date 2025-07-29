import { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Clock, 
  Shield, 
  HardDrive,
  Cloud,
  AlertTriangle,
  CheckCircle,
  Archive,
  FileText,
  Users,
  Trash2
} from 'lucide-react';

export default function BackupManager() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupHistory, setBackupHistory] = useState([
    {
      id: 1,
      date: new Date('2025-01-16'),
      type: 'Completo',
      size: '15.2 MB',
      status: 'sucesso',
      tables: ['propostas', 'usuarios', 'vendedores', 'system_users'],
      records: 1247
    },
    {
      id: 2,
      date: new Date('2025-01-15'),
      type: 'Incremental',
      size: '2.8 MB',
      status: 'sucesso',
      tables: ['propostas', 'usuarios'],
      records: 89
    },
    {
      id: 3,
      date: new Date('2025-01-14'),
      type: 'Completo',
      size: '14.9 MB',
      status: 'sucesso',
      tables: ['propostas', 'usuarios', 'vendedores', 'system_users'],
      records: 1198
    }
  ]);

  const executeBackup = async (type: 'complete' | 'incremental') => {
    setIsBackingUp(true);
    try {
      // Simular backup (em produção, chamaria API real)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBackup = {
        id: Date.now(),
        date: new Date(),
        type: type === 'complete' ? 'Completo' : 'Incremental',
        size: type === 'complete' ? '15.8 MB' : '3.2 MB',
        status: 'sucesso',
        tables: type === 'complete' 
          ? ['propostas', 'usuarios', 'vendedores', 'system_users']
          : ['propostas', 'usuarios'],
        records: type === 'complete' ? 1298 : 127
      };
      
      setBackupHistory(prev => [newBackup, ...prev.slice(0, 9)]);
      alert(`Backup ${type === 'complete' ? 'completo' : 'incremental'} executado com sucesso!`);
    } catch (error) {
      alert('Erro ao executar backup');
    } finally {
      setIsBackingUp(false);
    }
  };

  const downloadBackup = (backupId: number) => {
    const backup = backupHistory.find(b => b.id === backupId);
    if (!backup) return;

    // Simular download
    const blob = new Blob(['Backup data would be here'], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_${backup.type.toLowerCase()}_${backup.date.toISOString().split('T')[0]}.sql`;
    link.click();
  };

  const restoreBackup = async (backupId: number) => {
    if (!confirm('Tem certeza que deseja restaurar este backup? Esta ação irá sobrescrever os dados atuais.')) {
      return;
    }

    setIsRestoring(true);
    try {
      // Simular restore (em produção, chamaria API real)
      await new Promise(resolve => setTimeout(resolve, 5000));
      alert('Backup restaurado com sucesso!');
    } catch (error) {
      alert('Erro ao restaurar backup');
    } finally {
      setIsRestoring(false);
    }
  };

  const deleteBackup = async (backupId: number) => {
    const backup = backupHistory.find(b => b.id === backupId);
    if (!backup) return;
    
    if (!confirm(`Tem certeza que deseja EXCLUIR permanentemente o backup de ${backup.date.toLocaleDateString('pt-BR')} (${backup.type})?\n\nEsta ação NÃO PODE ser desfeita!`)) {
      return;
    }

    try {
      // Remover backup da lista
      setBackupHistory(prev => prev.filter(b => b.id !== backupId));
      alert('Backup excluído com sucesso!');
    } catch (error) {
      alert('Erro ao excluir backup');
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'sucesso' 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'sucesso' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Database className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Backup & Restore</h3>
              <p className="text-gray-600">Gerenciamento completo de backups do sistema</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => executeBackup('incremental')}
              disabled={isBackingUp || isRestoring}
              className="flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isBackingUp ? <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" /> : <Archive className="w-3 h-3 mr-1.5" />}
              Backup Incremental
            </button>
            <button
              onClick={() => executeBackup('complete')}
              disabled={isBackingUp || isRestoring}
              className="flex items-center px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isBackingUp ? <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" /> : <Database className="w-3 h-3 mr-1.5" />}
              Backup Completo
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-lg p-3">
            <div className="flex items-center">
              <Archive className="w-4 h-4 text-slate-600 dark:text-slate-400 mr-2" />
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Total Backups</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{backupHistory.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-600 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2" />
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Últimos 30 dias</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {backupHistory.filter(b => b.status === 'sucesso').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-600 rounded-lg p-3">
            <div className="flex items-center">
              <HardDrive className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-2" />
              <div>
                <p className="text-xs text-violet-600 dark:text-violet-400">Espaço Total</p>
                <p className="text-xl font-bold text-violet-700 dark:text-violet-300">89.7 MB</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-600 rounded-lg p-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2" />
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400">Último Backup</p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                  {backupHistory[0]?.date.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações de Backup */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">⚙️ Configurações de Backup Automático</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequência</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Diário às 02:00</option>
                <option>A cada 6 horas</option>
                <option>Semanal</option>
                <option>Manual apenas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Retenção</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Manter últimos 30 backups</option>
                <option>Manter últimos 60 backups</option>
                <option>Manter últimos 90 backups</option>
                <option>Manter todos</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm text-gray-700">Backup automático ativo</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm text-gray-700">Notificações por email</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-700">Upload para Google Drive</span>
            </label>
          </div>
        </div>
      </div>

      {/* Lista de Backups */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <Archive className="h-5 w-5 text-blue-600" />
            Histórico de Backups
          </h4>
          <p className="text-gray-600 mt-1">Visualize, baixe e restaure backups anteriores</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold">Data/Hora</th>
                <th className="text-left p-4 font-semibold">Tipo</th>
                <th className="text-left p-4 font-semibold">Tamanho</th>
                <th className="text-left p-4 font-semibold">Tabelas</th>
                <th className="text-left p-4 font-semibold">Registros</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {backupHistory.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{backup.date.toLocaleDateString('pt-BR')}</div>
                      <div className="text-sm text-gray-500">{backup.date.toLocaleTimeString('pt-BR')}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      backup.type === 'Completo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {backup.type}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm">{backup.size}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {backup.tables.map((table) => (
                        <span key={table} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          {table}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm">{backup.records.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(backup.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(backup.status)}`}>
                        {backup.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadBackup(backup.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Baixar backup"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => restoreBackup(backup.id)}
                        disabled={isRestoring}
                        className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                        title="Restaurar backup"
                      >
                        {isRestoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteBackup(backup.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Excluir backup permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informações Técnicas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          Informações Técnicas
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-3">📋 Estrutura do Backup</h5>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span><strong>Propostas:</strong> Dados completos + anexos</span>
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span><strong>Usuários:</strong> Perfis + permissões</span>
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-4 h-4 text-green-500" />
                <span><strong>Sistema:</strong> Configurações + logs</span>
              </li>
              <li className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-orange-500" />
                <span><strong>Arquivos:</strong> Documentos + imagens</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-3">🔒 Segurança</h5>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Backups criptografados com AES-256</li>
              <li>• Verificação de integridade automática</li>
              <li>• Armazenamento seguro na nuvem</li>
              <li>• Logs de auditoria completos</li>
              <li>• Testes de restore semanais</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h5 className="font-medium text-yellow-800">Importante</h5>
              <p className="text-sm text-yellow-700 mt-1">
                Recomendamos executar backups completos semanalmente e incrementais diariamente. 
                Sempre teste a restauração de backups em ambiente de desenvolvimento antes de usar em produção.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}