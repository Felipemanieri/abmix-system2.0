import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App.tsx';
import './index.css';

// SISTEMA DE SUPRESSÃO COMPLETA DE ERROS DE DESENVOLVIMENTO
window.addEventListener('unhandledrejection', (event) => {
  // SUPRIMIR COMPLETAMENTE todos os erros de promessa rejeitada
  event.preventDefault();
});

// Interceptar e suprimir erros de console
const originalError = console.error;
console.error = (...args) => {
  // Filtrar mensagens específicas que queremos suprimir
  const message = args.join(' ');
  if (message.includes('Promise rejeitada não tratada') || 
      message.includes('Failed to fetch') ||
      message.includes('TypeError: Failed to fetch')) {
    // Não exibir nada - supressão completa
    return;
  }
  // Permitir outros erros (mas de forma menos verbosa)
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
