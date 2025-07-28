import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App.tsx';
import './index.css';

// SUPRESSÃO ESPECÍFICA DE ERROS DE DESENVOLVIMENTO
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
});

// Filtrar especificamente erros de Promise rejeitada
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Suprimir apenas "Promise rejeitada não tratada" que aparece repetidamente
  if (message.includes('Promise rejeitada não tratada')) {
    return;
  }
  
  // Permitir todos os outros erros
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
