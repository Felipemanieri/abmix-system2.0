import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App.tsx';
import './index.css';

// CAPTURAR COMPLETAMENTE os unhandled rejections do React Query
window.addEventListener('unhandledrejection', (event) => {
  // Suprimir completamente para eliminar logs no console
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  
  // Não fazer log nenhum para manter console limpo
  return false;
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
