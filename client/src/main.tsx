import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App.tsx';
import './index.css';

// SUPRIMIR COMPLETAMENTE ERROS DO VITE DURANTE DESENVOLVIMENTO
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || event.reason?.toString() || '';
  const stack = event.reason?.stack || '';
  
  // Suprimir TODOS os erros do Vite (ping, fetch, websocket)
  if (errorMessage.includes('Failed to fetch') || 
      stack.includes('@vite/client') ||
      stack.includes('ping') ||
      stack.includes('waitForSuccessfulPing')) {
    event.preventDefault();
    return false;
  }
  
  // Mostrar apenas erros reais do sistema
  console.error('❌ SISTEMA - ERRO REAL:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
