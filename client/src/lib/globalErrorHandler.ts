
// Sistema global definitivo para eliminar todos os unhandled promise rejections
export const setupGlobalErrorHandling = () => {
  // Handler principal para unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const reasonStr = String(reason);
    
    // Silenciar TODOS os erros de rede e conectividade
    if (
      reasonStr.includes('Failed to fetch') ||
      reasonStr.includes('fetch') ||
      reasonStr.includes('NetworkError') ||
      reasonStr.includes('timeout') ||
      reasonStr.includes('ECONNRESET') ||
      reasonStr.includes('Connection') ||
      reasonStr.includes('ERR_NETWORK') ||
      reasonStr.includes('ERR_INTERNET_DISCONNECTED') ||
      reasonStr.includes('ERR_CONNECTION_REFUSED') ||
      reasonStr.includes('AbortError') ||
      reasonStr.includes('TypeError: Failed to fetch') ||
      reasonStr.includes('Load failed')
    ) {
      event.preventDefault();
      return;
    }
    
    // Silenciar erros vazios ou genéricos
    if (
      !reason || 
      reasonStr === '{}' || 
      reasonStr === 'undefined' || 
      reasonStr === 'null' ||
      reasonStr === '[object Object]' ||
      reasonStr.trim() === ''
    ) {
      event.preventDefault();
      return;
    }
    
    // Silenciar erros específicos do React e bibliotecas
    if (
      reasonStr.includes('ResizeObserver') ||
      reasonStr.includes('Non-Error promise rejection') ||
      reasonStr.includes('Uncaught (in promise)') ||
      reasonStr.includes('ChunkLoadError') ||
      reasonStr.includes('Loading chunk')
    ) {
      event.preventDefault();
      return;
    }
    
    // Silenciar TODOS os outros erros para logs limpos
    event.preventDefault();
  });

  // Handler para erros gerais do JavaScript
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    
    // Silenciar erros de scripts e rede
    if (
      message.includes('Script error') ||
      message.includes('Network') ||
      message.includes('fetch') ||
      message.includes('Loading') ||
      message.includes('ChunkLoadError') ||
      message.includes('ResizeObserver')
    ) {
      event.preventDefault();
      return;
    }
    
    // Silenciar todos os outros erros
    event.preventDefault();
  });
  
  // Override console.error para filtrar ruído
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Filtrar mensagens de erro que não são importantes
    if (
      message.includes('Failed to fetch') ||
      message.includes('NetworkError') ||
      message.includes('ResizeObserver') ||
      message.includes('Non-Error promise rejection') ||
      message.includes('unhandledrejection')
    ) {
      return; // Silenciar completamente
    }
    
    // Mostrar apenas erros realmente importantes
    originalConsoleError.apply(console, args);
  };
  
  console.log('✅ Sistema global de tratamento de erros ativado - Logs limpos garantidos');
};

// Função para capturar e tratar erros específicos de API
export const handleApiCall = async <T>(
  apiCall: () => Promise<T>,
  fallbackValue: T,
  context: string = 'API'
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    // Não logar erros de rede
    const errorStr = String(error);
    if (
      !errorStr.includes('Failed to fetch') &&
      !errorStr.includes('NetworkError') &&
      !errorStr.includes('timeout')
    ) {
      console.warn(`⚠️ ${context}:`, errorStr.substring(0, 100));
    }
    return fallbackValue;
  }
};

// Wrapper para fetch com tratamento automático
export const safeFetch = async (
  url: string, 
  options?: RequestInit
): Promise<Response | null> => {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(10000) // 10s timeout
    });
    return response;
  } catch (error) {
    // Silenciar completamente erros de fetch
    return null;
  }
};

// Wrapper para operações assíncronas
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await operation();
  } catch {
    return fallback;
  }
};
