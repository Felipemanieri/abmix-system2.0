// Sistema de tratamento robusto para erros de conectividade
export class ConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConnectionError';
  }
}

// Cache local para dados quando backend está indisponível
const localCache = new Map<string, { data: any; timestamp: number }>();

export const cacheData = (key: string, data: any) => {
  localCache.set(key, { data, timestamp: Date.now() });
};

export const getCachedData = (key: string, maxAge = 60000) => {
  const cached = localCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < maxAge) {
    return cached.data;
  }
  return null;
};

export const handleApiError = (error: any, url: string) => {
  // Retornar dados em cache se disponível
  const cached = getCachedData(url);
  if (cached) {
    return cached;
  }
  
  // Retornar estrutura vazia apropriada para não quebrar a UI
  if (url.includes('/api/proposals')) {
    return [];
  }
  if (url.includes('/api/vendors')) {
    return [];
  }
  if (url.includes('/api/systemUsers')) {
    return [];
  }
  
  return [];
};