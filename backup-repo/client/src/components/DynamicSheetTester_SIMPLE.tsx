import React, { useState } from 'react';
import { FileSpreadsheet, RefreshCw, Database, Eye, Download } from 'lucide-react';

export default function DynamicSheetTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [sheetData, setSheetData] = useState<any[]>([]);

  const handleSync = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSheetData([
        { id: 1, empresa: 'Empresa A', titular: 'João Silva', status: 'implantado' },
        { id: 2, empresa: 'Empresa B', titular: 'Maria Santos', status: 'analise' },
        { id: 3, empresa: 'Empresa C', titular: 'Pedro Lima', status: 'pendencia' }
      ]);
      setIsLoading(false);
      alert('Sincronização concluída!');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Testador de Planilha Dinâmica</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSync}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Propostas</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{sheetData.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Colunas</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">338</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Sincronizações</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">247</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="flex items-center">
              <Download className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Exports</p>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">89</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dados da Planilha */}
        {sheetData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Empresa</th>
                  <th className="px-6 py-3">Titular</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {sheetData.map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.id}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.empresa}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.titular}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.status === 'implantado' ? 'bg-green-100 text-green-800' :
                        item.status === 'analise' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {sheetData.length === 0 && (
          <div className="text-center py-8">
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum dado carregado. Clique em "Sincronizar" para carregar dados.</p>
          </div>
        )}
      </div>
    </div>
  );
}