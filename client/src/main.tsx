import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App.tsx';
import './index.css';

// CAPTURAR E FILTRAR UNHANDLED REJECTIONS
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || event.reason?.toString() || '';
  const stack = event.reason?.stack || '';
  
  // Suprimir APENAS erros do Vite HMR (ping durante reconexão)
  if (errorMessage.includes('Failed to fetch') && 
      stack.includes('ping') && 
      stack.includes('@vite/client')) {
    // Suprimir erros do Vite HMR durante reconexão
    event.preventDefault();
    return;
  }
  
  // Mostrar todos os outros erros
  console.error('❌ UNHANDLED REJECTION:', event.reason);
  console.error('❌ PROMISE:', event.promise);
  console.error('❌ STACK:', event.reason?.stack);
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
