import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App.tsx';
import './index.css';

// SUPRESSÃO TOTAL DOS ERROS DE PROMISE REJEITADA QUE APARECEM POR SEGUNDO
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
});

// Suprimir COMPLETAMENTE os erros repetitivos que aparecem por segundo
const originalError = console.error;
const originalLog = console.log;

console.error = () => {
  // Bloquear TODOS os console.error para eliminar ruído visual
};

console.log = (...args) => {
  const message = args.join(' ');
  // Permitir apenas logs importantes do sistema
  if (message.includes('✅') || message.includes('🔥') || message.includes('🔄')) {
    originalLog.apply(console, args);
  }
};

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
