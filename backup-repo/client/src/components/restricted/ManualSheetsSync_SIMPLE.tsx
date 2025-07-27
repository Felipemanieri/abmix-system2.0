import React, { useState } from 'react';
import { RefreshCw, Upload, Download, Settings } from 'lucide-react';

export default function ManualSheetsSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [syncMode, setSyncMode] = useState('full');

  const handleSync = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Sincronização ${syncMode === 'full' ? 'completa' : 'incremental'} concluída!`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sincronização Manual</h3>
        </div>

        {/* Configurações de Sincronização */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Configurações</h4>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modo de Sincronização
              </label>
              <select
                value={syncMode}
                onChange={(e) => setSyncMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="full">Sincronização Completa</option>
                <option value="incremental">Sincronização Incremental</option>
                <option value="selective">Sincronização Seletiva</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleSync}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Sincronizando...' : 'Sincronizar'}
          </button>
          
          <button
            onClick={() => alert('Exportação iniciada...')}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar Dados
          </button>
          
          <button
            onClick={() => alert('Importação iniciada...')}
            className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            Importar Dados
          </button>
        </div>

        {/* Status da Última Sincronização */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Última Sincronização</h4>
          <div className="text-sm text-green-700 dark:text-green-200">
            <p><strong>Data:</strong> 25/01/2025 19:30:00</p>
            <p><strong>Tipo:</strong> Sincronização Completa</p>
            <p><strong>Registros:</strong> 8 propostas sincronizadas</p>
            <p><strong>Status:</strong> ✅ Concluída com sucesso</p>
          </div>
        </div>
      </div>
    </div>
  );
}