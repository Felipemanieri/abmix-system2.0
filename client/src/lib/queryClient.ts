import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
      queryFn: async ({ queryKey }) => {
        const url = Array.isArray(queryKey) ? queryKey[0] : queryKey;
        return apiRequest(url as string);
      },
    },
  },
});

export async function apiRequest(url: string, options: RequestInit = {}) {
  const requestOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Serialize body to JSON if it's an object
  if (options.body && typeof options.body === 'object') {
    requestOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `${response.status}: ${response.statusText}`);
  }

  return response.json();
}