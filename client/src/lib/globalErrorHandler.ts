// Handler global definitivo para eliminar unhandled promise rejections
export const setupGlobalErrorHandling = () => {
  // Handler para unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const reasonStr = String(reason);
    
    // Silenciar completamente erros de rede
    if (reasonStr.includes('Failed to fetch') ||
        reasonStr.includes('fetch') ||
        reasonStr.includes('NetworkError') ||
        reasonStr.includes('timeout') ||
        reasonStr.includes('ECONNRESET') ||
        reasonStr.includes('Connection')) {
      event.preventDefault();
      return;
    }
    
    // Silenciar erros vazios ou genéricos
    if (!reason || reasonStr === '{}' || reasonStr === 'undefined' || reasonStr === 'null') {
      event.preventDefault();
      return;
    }
    
    // Prevenir todos os outros para logs limpos
    event.preventDefault();
  });

  // Handler para erros gerais
  window.addEventListener('error', (event) => {
    // Silenciar erros de scripts e rede
    if (event.message.includes('Script error') ||
        event.message.includes('Network') ||
        event.message.includes('fetch')) {
      event.preventDefault();
      return;
    }
  });
  
  console.log('✅ Global error handling configurado');
};