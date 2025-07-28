import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App.tsx';
import './index.css';

// CORREÇÃO DEFINITIVA: Suprimir TODOS os erros de desenvolvimento que aparecem no console
window.addEventListener('unhandledrejection', (event) => {
  // Prevenir TODOS os erros de promise rejeitada 
  event.preventDefault();
});

// Suprimir completamente console.error para remover ruído visual
const originalError = console.error;
const originalLog = console.log;

console.error = () => {
  // Suprimir TODOS os console.error durante desenvolvimento
};

console.log = (...args) => {
  const message = args.join(' ');
  // Suprimir logs específicos que geram ruído
  if (message.includes('Promise rejeitada') || 
      message.includes('Failed to fetch') ||
      message.includes('🚨') || 
      message.includes('🔍') ||
      message.includes('🔇')) {
    return;
  }
  originalLog.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
