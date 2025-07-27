import React, { useState } from 'react';
import { Zap, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export default function SimpleGoogleTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    details?: any;
  }>({ status: 'idle', message: 'Clique em "Testar" para verificar as conexões Google' });

  const runSimpleTest = async () => {
    setIsLoading(true);
    setTestResult({ status: 'idle', message: 'Executando testes...' });

    try {
      const response = await fetch('/api/simple-google/test-connection');
      const result = await response.json();

      if (response.ok && result.success) {
        setTestResult({
          status: 'success',
          message: 'Todas as conexões Google estão funcionando!',
          details: result
        });
      } else {
        setTestResult({
          status: 'error',
          message: 'Falha em uma ou mais conexões',
          details: result
        });
      }
    } catch (error) {
      setTestResult({
        status: 'error',
        message: 'Erro de conectividade com o servidor',
        details: { error: error.message }
      });
    }

    setIsLoading(false);
  };

  const getStatusIcon = () => {
    if (isLoading) return <Clock className="w-6 h-6 text-blue-500 animate-spin" />;
    
    switch (testResult.status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (testResult.status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700';
      case 'error':
        return 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Teste Simples Google</h3>
        </div>

        {/* Test Button */}
        <div className="text-center mb-6">
          <button
            onClick={runSimpleTest}
            disabled={isLoading}
            className="px-8 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isLoading ? 'Testando...' : 'Testar Conexões Google'}
          </button>
        </div>

        {/* Result Panel */}
        <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
          <div className="flex items-center space-x-3 mb-3">
            {getStatusIcon()}
            <h4 className="font-medium text-gray-900 dark:text-white">
              Status da Conexão
            </h4>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {testResult.message}
          </p>

          {testResult.details && (
            <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded border">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                DETALHES DO TESTE:
              </p>
              <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            O que este teste verifica:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Conectividade com Google Drive API</li>
            <li>• Autenticação OAuth2</li>
            <li>• Acesso à planilha principal</li>
            <li>• Permissões de leitura e escrita</li>
            <li>• Status geral dos serviços Google</li>
          </ul>
        </div>
      </div>
    </div>
  );
}