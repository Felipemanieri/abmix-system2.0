import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface DeploymentStatusProps {
  deployId?: string;
  onRefresh?: () => void;
}

const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ deployId, onRefresh }) => {
  const [status, setStatus] = useState<'pending' | 'success' | 'error' | 'loading'>('loading');
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('Verificando status da implantação...');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Simulação de verificação de status
    const checkStatus = () => {
      setStatus('loading');
      
      // Simulação de progresso
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 5;
        setProgress(Math.min(currentProgress, 95));
        
        if (currentProgress >= 95) {
          clearInterval(interval);
        }
      }, 300);
      
      // Simulação de resposta após 3 segundos
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        
        // Simulação de sucesso
        setStatus('success');
        setDeployUrl('https://abmix-system.netlify.app');
        setMessage('Implantação concluída com sucesso!');
      }, 3000);
    };
    
    checkStatus();
    
    // Limpar intervalos ao desmontar
    return () => {
      // Limpar quaisquer timers ou intervalos
    };
  }, [deployId]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      setStatus('loading');
      setProgress(0);
      setMessage('Atualizando status da implantação...');
      
      // Simulação de nova verificação
      setTimeout(() => {
        setStatus('success');
        setProgress(100);
        setMessage('Implantação concluída com sucesso!');
      }, 1500);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Status da Implantação</h3>
        <button 
          onClick={handleRefresh}
          className="p-2 text-gray-400 dark:text-gray-500 dark:text-white hover:text-gray-600 rounded-full hover:bg-gray-100 dark:bg-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        {status === 'loading' && (
          <div className="flex items-center space-x-3">
            <div className="animate-spin">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-gray-700">{message}</span>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">{message}</span>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-700">{message}</span>
          </div>
        )}
        
        {status === 'loading' && (
          <div className="w-full bg-gray-200 dark:bg-gray-600 dark:bg-gray-600 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        
        {deployUrl && status === 'success' && (
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <p className="text-sm text-green-700 mb-2">
              Seu site está disponível em:
            </p>
            <a 
              href={deployUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
            >
              {deployUrl}
            </a>
          </div>
        )}
        
        {deployId && (
          <div className="text-xs text-gray-500 dark:text-white mt-2">
            ID da implantação: {deployId}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeploymentStatus;