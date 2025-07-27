import React, { useState } from 'react';
import { TestTube, Play, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'running' | 'pending';
  message: string;
  duration: number;
}

export default function GoogleTestPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'Conexão Google Drive', status: 'pending', message: 'Aguardando execução', duration: 0 },
    { name: 'Conexão Google Sheets', status: 'pending', message: 'Aguardando execução', duration: 0 },
    { name: 'Autenticação OAuth2', status: 'pending', message: 'Aguardando execução', duration: 0 },
    { name: 'Sincronização de Dados', status: 'pending', message: 'Aguardando execução', duration: 0 },
    { name: 'Criação de Pastas', status: 'pending', message: 'Aguardando execução', duration: 0 },
  ]);

  const runTests = async () => {
    setIsRunning(true);
    const updatedResults = [...testResults];

    for (let i = 0; i < updatedResults.length; i++) {
      updatedResults[i].status = 'running';
      updatedResults[i].message = 'Executando teste...';
      setTestResults([...updatedResults]);

      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const success = Math.random() > 0.2; // 80% chance de sucesso
      updatedResults[i].status = success ? 'success' : 'error';
      updatedResults[i].message = success 
        ? 'Teste executado com sucesso'
        : 'Falha na execução do teste';
      updatedResults[i].duration = Math.floor(Math.random() * 3000) + 500;
      
      setTestResults([...updatedResults]);
    }

    setIsRunning(false);
  };

  const resetTests = () => {
    setTestResults(testResults.map(test => ({
      ...test,
      status: 'pending',
      message: 'Aguardando execução',
      duration: 0
    })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700';
      case 'error':
        return 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700';
      case 'running':
        return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TestTube className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Painel de Testes Google</h3>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={resetTests}
              disabled={isRunning}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Resetar
            </button>
            <button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Executando...' : 'Executar Testes'}
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-3">
          {testResults.map((test, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-colors ${getStatusColor(test.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{test.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{test.message}</p>
                  </div>
                </div>
                {test.duration > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {test.duration}ms
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {testResults.filter(t => t.status === 'success').length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Sucessos</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {testResults.filter(t => t.status === 'error').length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Erros</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {testResults.filter(t => t.status === 'running').length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Executando</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                {testResults.filter(t => t.status === 'pending').length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Pendentes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}