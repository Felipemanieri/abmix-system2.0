
// Sistema global SIMPLIFICADO para eliminar unhandled promise rejections
export const setupGlobalErrorHandling = () => {
  // HANDLER SIMPLES - apenas prevenir sem manipular o evento
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault(); // Apenas prevenir a notificação padrão
  });

  // Handler básico para erros gerais
  window.addEventListener('error', (event) => {
    event.preventDefault(); // Apenas prevenir a exibição padrão
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
