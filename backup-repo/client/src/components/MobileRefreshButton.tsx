import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

interface MobileRefreshButtonProps {
  className?: string;
}

export default function MobileRefreshButton({ className = '' }: MobileRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log('📱 Refresh manual iniciado');
    
    try {
      // Invalidar e refetch todas as queries ativas
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries({ type: 'active' });
      
      setLastRefresh(new Date());
      
      // Feedback visual
      setTimeout(() => setIsRefreshing(false), 1000);
      
    } catch (error) {
      console.error('Erro no refresh:', error);
      setIsRefreshing(false);
    }
  };

  const formatLastRefresh = () => {
    if (!lastRefresh) return '';
    return `Atualizado às ${lastRefresh.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg
          bg-green-600 hover:bg-green-700 text-white text-sm font-medium
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${isRefreshing ? 'animate-pulse' : ''}
        `}
        title="Atualizar dados manualmente"
      >
        <RefreshCw 
          className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
        />
        <span className="hidden sm:inline">
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </span>
      </button>
      
      {lastRefresh && (
        <span className="text-xs text-gray-500 dark:text-white dark:text-gray-400 dark:text-gray-500 dark:text-white hidden md:inline">
          {formatLastRefresh()}
        </span>
      )}
    </div>
  );
}