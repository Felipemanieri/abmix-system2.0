import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000, // 1 segundo - cache mínimo para resposta imediata
      retry: false, // Sem retry
      refetchOnWindowFocus: true, // Recarregar no foco para dados frescos
      refetchOnMount: true, // Carregar imediatamente no mount
      refetchOnReconnect: true, // Reconectar imediatamente
      queryFn: async ({ queryKey }) => {
        const url = Array.isArray(queryKey) ? queryKey[0] : queryKey;
        try {
          return await apiRequest(url as string);
        } catch (error) {
          // Suprimir logs de erro - já tratado no error handler global
          throw error;
        }
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export async function apiRequest(url: string, options: RequestInit = {}) {
  try {
    const requestOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: 10000, // 10 segundos timeout
      ...options,
    };

    // Serialize body to JSON if it's an object
    if (options.body && typeof options.body === 'object') {
      requestOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      console.error(`❌ API Error ${url}:`, error.message);
      throw error;
    }

    return response.json();
  } catch (error) {
    // Log específico para diferentes tipos de erro
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`🌐 Network Error ${url}:`, 'Conexão falhou - servidor pode estar offline');
    } else {
      console.error(`⚠️ Request Error ${url}:`, error);
    }
    throw error;
  }
}