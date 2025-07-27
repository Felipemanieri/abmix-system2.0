import React, { useState, useEffect } from 'react';
import { FileText, Database, RefreshCw, Settings, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface GoogleSheetsManagerProps {
  onClose?: () => void;
}

export default function GoogleSheetsManager({ onClose }: GoogleSheetsManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('connected');
  const [lastSync, setLastSync] = useState<string>('2025-01-25 19:30:00');
  const [totalRecords, setTotalRecords] = useState(247);

  const handleSyncSheets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/google/sheets/sync', { method: 'POST' });
      const result = await response.json();
      
      if (response.ok) {
        setLastSync(new Date().toLocaleString('pt-BR'));
        setConnectionStatus('connected');
        alert(`✅ Sincronização concluída!\n\nRegistros processados: ${result.records || totalRecords}`);
      } else {
        setConnectionStatus('error');
        alert(`❌ Erro na sincronização: ${result.error}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Erro ao sincronizar:', error);
      alert('❌ Erro de conexão. Verifique sua internet e tente novamente.');
    }
    setIsLoading(false);
  };

  const openGoogleSheets = () => {
    window.open('https://docs.google.com/spreadsheets/d/1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw/edit', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Google Sheets Manager</h3>
          </div>
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' && (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">Conectado</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">Erro de Conexão</span>
              </>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total de Registros</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalRecords}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Última Sincronização</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{lastSync}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Automático</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSyncSheets}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>

          <button
            onClick={openGoogleSheets}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir Planilha
          </button>

          <button
            onClick={() => alert('Configurações do Google Sheets em desenvolvimento')}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </button>
        </div>

        {/* Information Panel */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Informações da Planilha</h4>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <p><strong>ID:</strong> 1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw</p>
            <p><strong>Nome:</strong> Sistema Abmix - Planilha Principal</p>
            <p><strong>Colunas:</strong> 338 (Dinâmicas)</p>
            <p><strong>Sincronização:</strong> Automática a cada mudança</p>
          </div>
        </div>
      </div>
    </div>
  );
}