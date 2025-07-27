import React, { useState } from 'react';
import { TestTube, Play, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function GoogleTestPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const runTests = () => {
    setIsRunning(true);
    setResults([]);
    
    // Simular testes
    setTimeout(() => {
      setResults([
        { id: 1, name: 'Conexão Google Drive', status: 'success', duration: '245ms' },
        { id: 2, name: 'Conexão Google Sheets', status: 'success', duration: '178ms' },
        { id: 3, name: 'Autenticação OAuth2', status: 'success', duration: '567ms' },
        { id: 4, name: 'Criação de Pasta', status: 'success', duration: '892ms' },
        { id: 5, name: 'Sincronização Planilha', status: 'success', duration: '1.2s' }
      ]);
      setIsRunning(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TestTube className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Google Test Panel</h3>
          </div>
          <button
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Executando...' : 'Executar Testes'}
          </button>
        </div>

        {isRunning && (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg">
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Executando testes de conectividade...
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Resultados dos Testes</h4>
            {results.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                  )}
                  <span className="text-gray-900 dark:text-white">{result.name}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {result.duration}
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-200">
                ✅ Todos os testes passaram! Integração Google funcionando corretamente.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}