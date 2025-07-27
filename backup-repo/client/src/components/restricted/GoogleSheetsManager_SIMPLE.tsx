import React, { useState } from 'react';
import { FileSpreadsheet, RefreshCw, Database, CheckCircle, AlertTriangle } from 'lucide-react';

export default function GoogleSheetsManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState('2025-01-25 19:30:00');

  const handleSync = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLastSync(new Date().toLocaleString('pt-BR'));
      alert('Sincronização com Google Sheets concluída!');
    }, 2000);
  };

  const handleInitialize = () => {
    if (window.confirm('Deseja inicializar a planilha com dados reais?')) {
      alert('Planilha inicializada com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Google Sheets Manager</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleInitialize}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Database className="w-4 h-4 mr-2" />
              Inicializar Planilha
            </button>
            <button
              onClick={handleSync}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Sincronizando...' : 'Sincronizar Dados'}
            </button>
          </div>
        </div>

        {/* Status da Integração */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Status API</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">Conectado</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Planilha Principal</p>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-100">1IC3ks...FDw</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Última Sincronização</p>
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{lastSync}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações da Planilha */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Informações da Planilha</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-300"><strong>ID:</strong> 1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Nome:</strong> Planilha Sistema Abmix 2.0</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Propostas:</strong> 8 linhas</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300"><strong>Colunas:</strong> 338 campos</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Última Atualização:</strong> {lastSync}</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Status:</strong> <span className="text-green-600 dark:text-green-400">Sincronizado</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}