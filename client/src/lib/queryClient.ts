import { QueryClient } from '@tanstack/react-query';
import { cacheData, getCachedData, handleApiError } from './errorHandler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 segundos
      retry: false, // DESABILITAR retry
      refetchOnWindowFocus: false, 
      refetchOnMount: true,
      // REMOVER queryFn global que estava causando problemas
    },
    mutations: {
      retry: false,
    },
  },
});

export async function apiRequest(url: string, options: RequestInit = {}) {
  // Garantir URL absoluta correta
  const absoluteUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout

    const requestOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    };

    // Serialize body to JSON if it's an object
    if (options.body && typeof options.body === 'object') {
      requestOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(absoluteUrl, requestOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Salvar dados válidos no cache local
    cacheData(absoluteUrl, data);
    
    return data;
  } catch (error) {
    // TRATAR COMPLETAMENTE sem throw para evitar unhandled rejections
    console.warn(`Requisição falhou: ${absoluteUrl}`, error.message);
    return handleApiError(error, absoluteUrl);
  }
}