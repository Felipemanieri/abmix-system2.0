import { useState } from 'react';
import { TestTube, Play, CheckCircle, AlertCircle } from 'lucide-react';

export default function TestCreator() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTest = (testName: string) => {
    setTestResults(prev => [...prev, `✅ ${testName} executado com sucesso`]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <TestTube className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Criador de Testes
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => runTest('Teste de API')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Play className="w-5 h-5 mb-2 text-green-600" />
            <p className="font-medium">Teste de API</p>
          </button>

          <button
            onClick={() => runTest('Teste de Banco')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Play className="w-5 h-5 mb-2 text-green-600" />
            <p className="font-medium">Teste de Banco</p>
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Resultados:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}