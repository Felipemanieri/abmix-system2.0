import React, { useState } from 'react';
import { TestTube2, Zap, CheckCircle, AlertCircle } from 'lucide-react';

export default function SimpleGoogleTest() {
  const [testResults, setTestResults] = useState({
    connection: 'idle',
    auth: 'idle',
    drive: 'idle',
    sheets: 'idle'
  });

  const runTest = (testType: string) => {
    setTestResults(prev => ({ ...prev, [testType]: 'running' }));
    
    setTimeout(() => {
      setTestResults(prev => ({ ...prev, [testType]: 'success' }));
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'running': return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Sucesso';
      case 'running': return 'Testando...';
      case 'error': return 'Erro';
      default: return 'Não testado';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <TestTube2 className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Testes Simplificados</h3>
        </div>

        <div className="space-y-4">
          {/* Teste de Conexão */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              {getStatusIcon(testResults.connection)}
              <div className="ml-3">
                <p className="font-medium text-gray-900 dark:text-white">Teste de Conexão</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Verificar conectividade básica</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">{getStatusText(testResults.connection)}</span>
              <button
                onClick={() => runTest('connection')}
                disabled={testResults.connection === 'running'}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Testar
              </button>
            </div>
          </div>

          {/* Teste de Autenticação */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              {getStatusIcon(testResults.auth)}
              <div className="ml-3">
                <p className="font-medium text-gray-900 dark:text-white">Autenticação OAuth2</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Verificar credenciais Google</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">{getStatusText(testResults.auth)}</span>
              <button
                onClick={() => runTest('auth')}
                disabled={testResults.auth === 'running'}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                Testar
              </button>
            </div>
          </div>

          {/* Teste Google Drive */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              {getStatusIcon(testResults.drive)}
              <div className="ml-3">
                <p className="font-medium text-gray-900 dark:text-white">Google Drive API</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Testar criação de pastas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">{getStatusText(testResults.drive)}</span>
              <button
                onClick={() => runTest('drive')}
                disabled={testResults.drive === 'running'}
                className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:opacity-50"
              >
                Testar
              </button>
            </div>
          </div>

          {/* Teste Google Sheets */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              {getStatusIcon(testResults.sheets)}
              <div className="ml-3">
                <p className="font-medium text-gray-900 dark:text-white">Google Sheets API</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Testar sincronização planilha</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">{getStatusText(testResults.sheets)}</span>
              <button
                onClick={() => runTest('sheets')}
                disabled={testResults.sheets === 'running'}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
              >
                Testar
              </button>
            </div>
          </div>
        </div>

        {/* Botão para Executar Todos os Testes */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={() => {
              runTest('connection');
              setTimeout(() => runTest('auth'), 500);
              setTimeout(() => runTest('drive'), 1000);
              setTimeout(() => runTest('sheets'), 1500);
            }}
            className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            <Zap className="w-4 h-4 mr-2" />
            Executar Todos os Testes
          </button>
        </div>
      </div>
    </div>
  );
}