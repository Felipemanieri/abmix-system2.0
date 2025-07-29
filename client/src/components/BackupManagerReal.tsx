import { useState, useEffect } from 'react';
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
  Trash2,
  Plus
} from 'lucide-react';

interface RealBackup {
  folder: string;
  size: number;
  date: string;
  timestamp: number;
}

export default function BackupManagerReal() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupHistory, setBackupHistory] = useState<RealBackup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // segundos

  // Sincronização real com sistema de backup
  const loadRealBackups = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/backup/list');
      const data = await response.json();
      
      if (data.success) {
        setBackupHistory(data.backups);
        console.log(`📊 Carregados ${data.backups.length} backups reais do sistema`);
      } else {
        console.error('❌ Erro ao carregar backups:', data.error);
      }
    } catch (error) {
      console.error('❌ Erro na comunicação com API de backup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar backups na inicialização
  useEffect(() => {
    loadRealBackups();
  }, []);

  // Atualizar lista automaticamente conforme configuração
  useEffect(() => {
    const interval = setInterval(loadRealBackups, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const createBackup = async (type: 'complete' | 'incremental' | 'manual') => {
    setIsBackingUp(true);
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadRealBackups();
        
        // Notificação integrada ao sistema
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center animate-bounce';
        notification.innerHTML = `
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          ✅ Backup criado: ${data.backupName}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.transition = 'opacity 0.5s ease-out';
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 500);
        }, 3500);
        
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
      errorNotification.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        Erro ao criar backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}
      `;
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        errorNotification.remove();
      }, 3000);
    } finally {
      setIsBackingUp(false);
    }
  };

  const deleteBackup = async (backupFolder: string) => {
    const backup = backupHistory.find(b => b.folder === backupFolder);
    if (!backup) return;
    
    // Modal de confirmação integrado
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center mb-4">
          <svg class="w-6 h-6 text-amber-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <h3 class="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
        </div>
        <p class="text-gray-600 mb-6">
          Tem certeza que deseja <strong>EXCLUIR permanentemente</strong> o backup 
          <strong>"${backup.folder}" (${backup.date})</strong>?
          <br><br>
          <span class="text-red-600 font-medium">Esta ação NÃO PODE ser desfeita!</span>
        </p>
        <div class="flex gap-3 justify-end">
          <button id="cancelBtn" class="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
          <button id="confirmBtn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Excluir Backup
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    const userConfirmed = await new Promise<boolean>((resolve) => {
      const confirmBtn = modal.querySelector('#confirmBtn');
      const cancelBtn = modal.querySelector('#cancelBtn');
      
      confirmBtn?.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(true);
      });
      
      cancelBtn?.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(false);
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          resolve(false);
        }
      });
    });
    
    if (!userConfirmed) return;

    try {
      const response = await fetch(`/api/backup/${backup.folder}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await loadRealBackups();
        
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        notification.innerHTML = `
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          ✅ Backup "${backup.folder}" excluído permanentemente!
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 3000);
        
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
      
    } catch (error) {
      console.error('❌ Erro ao excluir backup:', error);
      
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
      errorNotification.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        Erro ao excluir backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}
      `;
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        errorNotification.remove();
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com sincronização real */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Database className="h-6 w-6 text-blue-600" />
              Sistema de Backup Real
            </h3>
            <p className="text-gray-600 mt-1">
              Sincronização automática com arquivos reais do sistema • 
              Atualização a cada {refreshInterval}s
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadRealBackups}
              disabled={isLoading}
              className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1min</option>
              <option value={300}>5min</option>
            </select>
          </div>
        </div>

        {/* Controles de Backup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => createBackup('complete')}
            disabled={isBackingUp}
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isBackingUp ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
            Backup Completo
          </button>
          <button
            onClick={() => createBackup('incremental')}
            disabled={isBackingUp}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isBackingUp ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
            Backup Incremental
          </button>
          <button
            onClick={() => createBackup('manual')}
            disabled={isBackingUp}
            className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isBackingUp ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
            Backup Manual
          </button>
        </div>
      </div>

      {/* Lista de Backups Reais */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <Archive className="h-5 w-5 text-blue-600" />
            Backups do Sistema ({backupHistory.length})
          </h4>
          <p className="text-gray-600 mt-1">
            Backups reais armazenados no Replit • Sincronização automática ativa
          </p>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Carregando backups reais do sistema...</span>
            </div>
          ) : backupHistory.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum backup encontrado no sistema</p>
              <p className="text-sm text-gray-500 mt-1">Execute um backup manual para começar</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Nome do Backup</th>
                  <th className="text-left p-4 font-semibold">Data/Hora</th>
                  <th className="text-left p-4 font-semibold">Tamanho</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {backupHistory.map((backup) => (
                  <tr key={backup.folder} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium font-mono text-sm">{backup.folder}</span>
                        <span className="text-xs text-gray-500">Sistema Abmix</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{backup.date}</span>
                        <span className="text-sm text-gray-600">Replit Backup</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm">
                      {backup.size > 0 ? `${(backup.size / 1024 / 1024).toFixed(1)} MB` : 'Calculando...'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Disponível
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteBackup(backup.folder)}
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
          )}
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          Informações do Sistema
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-3">📋 Estrutura do Backup</h5>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span><strong>attached_assets/:</strong> Arquivos e documentos</span>
              </li>
              <li className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-green-500" />
                <span><strong>.cache/:</strong> Cache do sistema</span>
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-500" />
                <span><strong>package.json:</strong> Configurações</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span><strong>replit.md:</strong> Documentação</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-3">🔄 Sincronização</h5>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Primário:</strong> Replit (sistema principal)</li>
              <li>• <strong>Secundário:</strong> Google Drive (precaução)</li>
              <li>• <strong>Frequência:</strong> Configurável (10s - 5min)</li>
              <li>• <strong>Exclusão:</strong> Permanente via API</li>
              <li>• <strong>Notificações:</strong> Sistema integrado</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <HardDrive className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-800">Sistema de Backup Real</h5>
              <p className="text-sm text-blue-700 mt-1">
                Este sistema trabalha com arquivos reais do Replit. Backups são criados e excluídos 
                fisicamente no sistema de arquivos, garantindo sincronização total entre a interface 
                e os dados reais armazenados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}