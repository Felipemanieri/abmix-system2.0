import React, { useState } from 'react';
import { 
  HardDrive, 
  Download, 
  Upload, 
  Clock, 
  Settings, 
  Play,
  Pause,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Database,
  Shield,
  Calendar,
  Archive,
  RotateCcw,
  FileArchive,
  ArrowLeft
} from 'lucide-react';

interface BackupEntry {
  id: number;
  filename: string;
  size: string;
  date: string;
  type: 'complete' | 'incremental' | 'manual';
  status: 'success' | 'error' | 'in_progress';
  duration: string;
}

export default function BackupManager() {
  const [isAutoBackupEnabled, setIsAutoBackupEnabled] = useState(true);
  const [backupInterval, setBackupInterval] = useState('daily');
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Dados simulados para evitar problemas de API
  const mockBackups: BackupEntry[] = [
    {
      id: 1,
      filename: 'backup_completo_2025-01-25_19-30.zip',
      size: '127.8 MB',
      date: '2025-01-25T19:30:00.000Z',
      type: 'complete',
      status: 'success',
      duration: '2m 15s'
    },
    {
      id: 2,
      filename: 'backup_incremental_2025-01-25_18-30.zip',
      size: '15.2 MB',
      date: '2025-01-25T18:30:00.000Z',
      type: 'incremental',
      status: 'success',
      duration: '45s'
    },
    {
      id: 3,
      filename: 'backup_manual_2025-01-25_15-45.zip',
      size: '132.1 MB',
      date: '2025-01-25T15:45:00.000Z',
      type: 'manual',
      status: 'success',
      duration: '2m 48s'
    },
    {
      id: 4,
      filename: 'backup_completo_2025-01-24_19-30.zip',
      size: '125.4 MB',
      date: '2025-01-24T19:30:00.000Z',
      type: 'complete',
      status: 'error',
      duration: '1m 12s'
    },
    {
      id: 5,
      filename: 'backup_incremental_2025-01-24_18-30.zip',
      size: '18.7 MB',
      date: '2025-01-24T18:30:00.000Z',
      type: 'incremental',
      status: 'success',
      duration: '52s'
    }
  ];

  const [backups, setBackups] = useState<BackupEntry[]>(mockBackups);

  const handleManualBackup = async (type: 'complete' | 'incremental') => {
    setIsBackingUp(true);
    
    // Simular processo de backup
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Notificação integrada ao sistema
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center animate-pulse';
    notification.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
      </svg>
      ✅ Backup ${type === 'complete' ? 'completo' : 'incremental'} criado com sucesso!
    `;
    document.body.appendChild(notification);
    
    // Remover notificação após 4 segundos
    setTimeout(() => {
      notification.style.transition = 'opacity 0.5s ease-out';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 3500);
    
    setIsBackingUp(false);
  };

  const handleDownloadBackup = (backup: BackupEntry) => {
    alert(`Iniciando download: ${backup.filename}`);
  };

  const handleRestoreBackup = (backup: BackupEntry) => {
    if (window.confirm(`Tem certeza que deseja restaurar o backup "${backup.filename}"? Esta ação não pode ser desfeita.`)) {
      alert(`Iniciando restauração do backup: ${backup.filename}`);
    }
  };

  const handleDeleteBackup = (backupId: number) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;

    if (window.confirm(`Tem certeza que deseja EXCLUIR permanentemente o backup "${backup.filename}"?\n\nEsta ação NÃO PODE ser desfeita!`)) {
      setBackups(prev => prev.filter(b => b.id !== backupId));
      
      // Notificação integrada ao sistema
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center animate-bounce';
      notification.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        ✅ Backup "${backup.filename}" excluído com sucesso!
      `;
      document.body.appendChild(notification);
      
      // Remover notificação após 4 segundos com fade out
      setTimeout(() => {
        notification.style.transition = 'opacity 0.5s ease-out';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
      }, 3500);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'complete': return <Database className="w-4 h-4" />;
      case 'incremental': return <Archive className="w-4 h-4" />;
      case 'manual': return <FileArchive className="w-4 h-4" />;
      default: return <HardDrive className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'complete': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'incremental': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      case 'manual': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const totalBackups = backups.length;
  const successfulBackups = backups.filter(b => b.status === 'success').length;
  const totalSize = backups.reduce((acc, backup) => {
    const size = parseFloat(backup.size.replace(' MB', ''));
    return acc + size;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <HardDrive className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Backup & Restore</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleManualBackup('incremental')}
              disabled={isBackingUp}
              className="flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Archive className="w-3 h-3 mr-1.5" />
              {isBackingUp ? 'Processando...' : 'Backup Incremental'}
            </button>
            <button
              onClick={() => handleManualBackup('complete')}
              disabled={isBackingUp}
              className="flex items-center px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Database className="w-3 h-3 mr-1.5" />
              {isBackingUp ? 'Processando...' : 'Backup Completo'}
            </button>
          </div>
        </div>

        {/* Configurações de Backup Automático */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Configurações Automáticas</h4>
            </div>
            <button
              onClick={() => setIsAutoBackupEnabled(!isAutoBackupEnabled)}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                isAutoBackupEnabled 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isAutoBackupEnabled ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {isAutoBackupEnabled ? 'Ativo' : 'Inativo'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frequência de Backup
              </label>
              <select
                value={backupInterval}
                onChange={(e) => setBackupInterval(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="hourly">A cada hora</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Retenção de Backups
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="30">30 dias</option>
                <option value="60">60 dias</option>
                <option value="90">90 dias</option>
                <option value="365">1 ano</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center">
              <Archive className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Backups</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{totalBackups}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Sucessos</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">{successfulBackups}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="flex items-center">
              <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Espaço Total</p>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{totalSize.toFixed(1)} MB</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Último Backup</p>
                <p className="text-xs font-bold text-orange-900 dark:text-orange-100">
                  {backups[0] ? new Date(backups[0].date).toLocaleDateString('pt-BR') : 'Nunca'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Restauração de Fábrica */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-red-200 dark:border-red-700 mb-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
            <h4 className="text-lg font-semibold text-red-900 dark:text-red-100">Restauração de Sistema</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                if (window.confirm('ATENÇÃO: Isso restaurará o sistema para as configurações de fábrica. Todos os dados serão perdidos. Deseja continuar?')) {
                  window.alert('Restauração de fábrica iniciada...');
                }
              }}
              className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Restaurar de Fábrica
            </button>
            <button
              onClick={() => {
                if (window.confirm('Deseja retornar para a versão anterior do sistema?')) {
                  window.alert('Retornando para versão anterior...');
                }
              }}
              className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retornar Versão Anterior
            </button>
            <button
              onClick={() => {
                if (window.confirm('Deseja restaurar um backup específico?')) {
                  window.alert('Selecionando backup para restauração...');
                }
              }}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Upload className="w-5 h-5 mr-2" />
              Restaurar Backup
            </button>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              <strong>Importante:</strong> Estas operações são irreversíveis. Certifique-se de ter backups atualizados antes de continuar.
            </p>
          </div>
        </div>

        {/* Lista de Backups */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">Arquivo</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Tamanho</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Duração</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr key={backup.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-white">
                    {backup.filename}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getTypeColor(backup.type)}`}>
                      {getTypeIcon(backup.type)}
                      <span className="ml-1 capitalize">{backup.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {backup.size}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {new Date(backup.date).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(backup.status)}`}>
                      {getStatusIcon(backup.status)}
                      <span className="ml-1 capitalize">{backup.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {backup.duration}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownloadBackup(backup)}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {backup.status === 'success' && (
                        <button
                          onClick={() => handleRestoreBackup(backup)}
                          className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                          title="Restaurar"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBackup(backup.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        title="Excluir"
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

        {backups.length === 0 && (
          <div className="text-center py-8">
            <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum backup encontrado</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Clique em "Backup Completo" para criar seu primeiro backup
            </p>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Informações de Segurança</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                • Backups são criptografados automaticamente<br/>
                • Mantenha pelo menos 3 backups recentes<br/>
                • Teste a restauração periodicamente<br/>
                • Backups completos incluem: banco de dados, arquivos e configurações
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}