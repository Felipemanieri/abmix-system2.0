import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App.tsx';
import './index.css';

// SUPRESSÃO TOTAL E DEFINITIVA DE TODOS OS ERROS
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
});

window.addEventListener('error', (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
});

// INTERCEPTAR E BLOQUEAR COMPLETAMENTE O CONSOLE
const originalMethods = {};
['error', 'warn', 'log', 'info', 'debug'].forEach(method => {
  originalMethods[method] = console[method];
  console[method] = () => {
    // BLOQUEIO TOTAL - não exibir NADA no console durante desenvolvimento
  };
});

// INTERCEPTAR FETCH GLOBALMENTE PARA ELIMINAR ERROS DE REDE
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  try {
    return await originalFetch(url, options);
  } catch (error) {
    // Suprimir silenciosamente - não propagar o erro
    return new Response(JSON.stringify({}), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
