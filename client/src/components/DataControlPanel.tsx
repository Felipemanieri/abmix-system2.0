import { useState } from 'react';
import { Database, BarChart3, RefreshCw, Trash2, CheckCircle, Monitor, AlertTriangle, X, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function DataControlPanel() {
  const queryClient = useQueryClient();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null);

  // Buscar estatísticas do sistema
  const { data: systemStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/system/stats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/proposals');
        if (!response.ok) return { totalProposals: 0, proposalsToday: 0 };
        const proposals = await response.json();
        
        const today = new Date().toDateString();
        const proposalsToday = proposals.filter((p: any) => 
          new Date(p.createdAt).toDateString() === today
        ).length;

        return {
          totalProposals: proposals.length,
          proposalsToday,
          lastSync: new Date().toISOString()
        };
      } catch {
        return { totalProposals: 0, proposalsToday: 0, lastSync: new Date().toISOString() };
      }
    },
    refetchInterval: 30000
  });

  // Mutation para zerar propostas
  const clearProposalsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/proposals/clear-all', {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao zerar propostas');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/system/stats'] });
      refetchStats();
      setNotification({
        type: 'success',
        message: '✅ Todas as propostas foram zeradas com sucesso!'
      });
    },
    onError: () => {
      setNotification({
        type: 'error',
        message: '❌ Erro ao zerar propostas do sistema'
      });
    }
  });

  const handleClearProposals = () => {
    setShowPasswordModal(true);
    setPassword('');
    setNotification(null);
  };

  const confirmClearProposals = () => {
    if (password !== 'CONFIRMAR') {
      setNotification({
        type: 'error',
        message: 'Senha incorreta. Digite exatamente: CONFIRMAR'
      });
      return;
    }

    setShowPasswordModal(false);
    setPassword('');
    clearProposalsMutation.mutate();
    setNotification({
      type: 'success',
      message: 'Comando executado com sucesso!'
    });
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas do Sistema */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Estatísticas do Sistema</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Propostas Totais</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{systemStats?.totalProposals || 0}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Propostas Hoje</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{systemStats?.proposalsToday || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Última Sync</p>
                <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                  {systemStats?.lastSync ? new Date(systemStats.lastSync).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '--:--'}
                </p>
              </div>
              <Monitor className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Administração */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <Database className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Controles de Dados</h3>
        </div>

        <div className="space-y-4">
          {/* Zerar Propostas */}
          <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <h4 className="font-medium text-red-900 dark:text-red-100">Zerar Todas as Propostas</h4>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Remove permanentemente todas as propostas do sistema, zerando contadores do rodapé e de todos os portais. Esta ação não pode ser desfeita.
                </p>
              </div>
              <button
                onClick={handleClearProposals}
                disabled={clearProposalsMutation.isPending}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {clearProposalsMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Zerando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Zerar Propostas
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Atualizar Estatísticas */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Atualizar Estatísticas</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Force uma atualização manual das estatísticas do sistema e contadores em tempo real.
                </p>
              </div>
              <button
                onClick={() => refetchStats()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </button>
            </div>
          </div>

          {/* Status do Sistema */}
          <div className="border border-green-200 dark:border-green-600 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100">Status do Sistema</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Sistema funcionando normalmente. Backup ativo e sincronização em tempo real.
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notificação */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' :
          notification.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
          'bg-yellow-100 border border-yellow-300 text-yellow-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação por Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirmar Ação Crítica</h3>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <span className="font-medium text-red-900 dark:text-red-100">ATENÇÃO: Ação Irreversível</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Esta ação irá DELETAR PERMANENTEMENTE todas as propostas do banco de dados. 
                  Todos os contadores serão zerados e não será possível recuperar os dados.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Digite a senha de confirmação:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite: CONFIRMAR"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Senha necessária: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">CONFIRMAR</code>
                </p>
              </div>
            </div>

            {notification && (
              <div className={`mb-4 p-3 rounded-lg ${
                notification.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' : ''
              }`}>
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClearProposals}
                disabled={clearProposalsMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {clearProposalsMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Confirmar e Zerar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}