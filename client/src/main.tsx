import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { setupGlobalErrorHandling } from './lib/globalErrorHandler';
import App from './App.tsx';
import './index.css';

// Configurar error handling global antes de inicializar a aplicação
setupGlobalErrorHandling();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
