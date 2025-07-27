// TESTADOR DA PLANILHA DINÂMICA - DEMONSTRAÇÃO DO SISTEMA COMPLETO
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

export default function DynamicSheetTester() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Buscar dados para teste
  const { data: proposals = [] } = useQuery({
    queryKey: ['/api/proposals'],
    refetchInterval: 1000
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
    refetchInterval: 5000
  });

  const { data: sheetData } = useQuery({
    queryKey: ['/api/proposals/sheet'],
    refetchInterval: 2000
  });

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Teste 1: Verificar se há propostas
    results.push({
      test: 'Verificar Propostas',
      status: proposals.length > 0 ? 'success' : 'warning',
      message: `${proposals.length} propostas encontradas`,
      data: { count: proposals.length }
    });

    // Teste 2: Verificar se há vendedores
    results.push({
      test: 'Verificar Vendedores',
      status: vendors.length > 0 ? 'success' : 'warning',
      message: `${vendors.length} vendedores encontrados`,
      data: { count: vendors.length }
    });

    // Teste 3: Verificar estrutura dinâmica
    if (sheetData) {
      results.push({
        test: 'Estrutura Dinâmica',
        status: 'success',
        message: `Planilha gerada: ${sheetData.maxTitulares} titulares máx., ${sheetData.maxDependentes} dependentes máx., ${sheetData.totalColumns} colunas`,
        data: {
          maxTitulares: sheetData.maxTitulares,
          maxDependentes: sheetData.maxDependentes,
          totalColumns: sheetData.totalColumns
        }
      });
    } else {
      results.push({
        test: 'Estrutura Dinâmica',
        status: 'error',
        message: 'Não foi possível gerar a planilha dinâmica'
      });
    }

    // Teste 4: Testar sincronização
    try {
      const syncResponse = await fetch('/api/sync/sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trigger: 'manual_test',
          timestamp: new Date().toISOString()
        })
      });

      if (syncResponse.ok) {
        const syncResult = await syncResponse.json();
        results.push({
          test: 'Sincronização',
          status: 'success',
          message: 'Sincronização executada com sucesso',
          data: syncResult.stats
        });
      } else {
        results.push({
          test: 'Sincronização',
          status: 'error',
          message: 'Falha na sincronização'
        });
      }
    } catch (error) {
      results.push({
        test: 'Sincronização',
        status: 'error',
        message: 'Erro na sincronização: ' + error.message
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    // Executar testes automaticamente ao carregar
    if (proposals.length > 0 || vendors.length > 0) {
      runTests();
    }
  }, [proposals, vendors]);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Database className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Testador da Planilha Dinâmica
        </h3>
        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Testando...' : 'Executar Testes'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                result.status === 'success'
                  ? 'bg-green-50 border-green-500 dark:bg-green-900/20'
                  : result.status === 'warning'
                  ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20'
                  : 'bg-red-50 border-red-500 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className={`w-5 h-5 ${
                      result.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                    }`} />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h4 className={`font-medium ${
                    result.status === 'success'
                      ? 'text-green-800 dark:text-green-300'
                      : result.status === 'warning'
                      ? 'text-yellow-800 dark:text-yellow-300'
                      : 'text-red-800 dark:text-red-300'
                  }`}>
                    {result.test}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    result.status === 'success'
                      ? 'text-green-700 dark:text-green-400'
                      : result.status === 'warning'
                      ? 'text-yellow-700 dark:text-yellow-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}>
                    {result.message}
                  </p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                        Ver detalhes
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {testResults.length === 0 && !isRunning && (
        <div className="text-center py-8">
          <Database className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Clique em "Executar Testes" para verificar o sistema</p>
        </div>
      )}
    </div>
  );
}