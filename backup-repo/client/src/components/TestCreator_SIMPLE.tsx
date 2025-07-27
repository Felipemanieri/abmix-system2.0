import React, { useState } from 'react';
import { TestTube, Play, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

export default function TestCreator() {
  const [testMessage, setTestMessage] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleSendTest = () => {
    if (!testMessage.trim()) return;
    
    setIsRunning(true);
    setTimeout(() => {
      const newResult = {
        id: Date.now(),
        message: testMessage,
        timestamp: new Date().toLocaleString('pt-BR'),
        status: 'success'
      };
      setTestResults(prev => [newResult, ...prev]);
      setTestMessage('');
      setIsRunning(false);
      alert('Teste enviado com sucesso!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <TestTube className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Criador de Testes</h3>
        </div>

        {/* Formulário de Teste */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensagem de Teste
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Digite sua mensagem de teste aqui..."
            />
          </div>
          
          <button
            onClick={handleSendTest}
            disabled={isRunning || !testMessage.trim()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Enviando...' : 'Executar Teste'}
          </button>
        </div>

        {/* Resultados dos Testes */}
        {testResults.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Histórico de Testes</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {testResults.map((result) => (
                <div key={result.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">{result.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{result.timestamp}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 ml-2 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {testResults.length === 0 && (
          <div className="mt-6 text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum teste executado ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}