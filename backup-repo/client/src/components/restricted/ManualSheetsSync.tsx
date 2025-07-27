import React, { useState } from 'react';
import { RefreshCw, Download, Upload, Database, AlertCircle, CheckCircle } from 'lucide-react';

export default function ManualSheetsSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [syncType, setSyncType] = useState<'full' | 'incremental' | 'custom'>('full');
  const [lastSync, setLastSync] = useState('2025-01-25 19:30:00');
  const [totalRecords, setTotalRecords] = useState(247);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/google/sheets/manual-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setLastSync(new Date().toLocaleString('pt-BR'));
        alert(`✅ Sincronização ${syncType} concluída!\n\nRegistros processados: ${result.records || totalRecords}`);
      } else {
        alert(`❌ Erro na sincronização: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('❌ Erro de conexão. Verifique sua internet e tente novamente.');
    }
    setIsLoading(false);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/google/sheets/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abmix-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('❌ Erro ao exportar dados');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <RefreshCw className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sincronização Manual</h3>
        </div>

        {/* Sync Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Tipo de Sincronização
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="syncType"
                value="full"
                checked={syncType === 'full'}
                onChange={(e) => setSyncType(e.target.value as any)}
                className="mr-3 text-purple-600"
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Sincronização Completa</span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Sincroniza todos os dados do sistema (pode demorar mais)
                </p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="syncType"
                value="incremental"
                checked={syncType === 'incremental'}
                onChange={(e) => setSyncType(e.target.value as any)}
                className="mr-3 text-purple-600"
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Sincronização Incremental</span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Sincroniza apenas dados modificados desde a última sincronização
                </p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="syncType"
                value="custom"
                checked={syncType === 'custom'}
                onChange={(e) => setSyncType(e.target.value as any)}
                className="mr-3 text-purple-600"
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Sincronização Customizada</span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Seleciona dados específicos para sincronizar
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Status Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Registros no Sistema</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalRecords}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Última Sincronização</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{lastSync}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSync}
            disabled={isLoading}
            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Sincronizando...' : 'Iniciar Sincronização'}
          </button>

          <button
            onClick={handleExport}
            className="flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </button>

          <button
            onClick={() => alert('Upload de dados em desenvolvimento')}
            className="flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Dados
          </button>
        </div>

        {/* Warning */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Atenção</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                A sincronização completa pode demorar alguns minutos dependendo da quantidade de dados. 
                Não feche esta janela durante o processo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}