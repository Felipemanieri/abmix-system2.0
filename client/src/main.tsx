import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App.tsx';
import './index.css';

// MOSTRAR TODOS OS LOGS - REMOVER SUPRESSÃO
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ UNHANDLED REJECTION:', event.reason);
  console.error('❌ PROMISE:', event.promise);
  console.error('❌ STACK:', event.reason?.stack);
  // NÃO SUPRIMIR - deixar o erro aparecer para diagnóstico
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
