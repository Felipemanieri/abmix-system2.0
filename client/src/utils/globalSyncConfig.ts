// Configuração Global de Intervalos de Sincronização
export class GlobalSyncConfig {
  private static instance: GlobalSyncConfig;
  private _syncInterval: number = 1000; // Padrão: 1 segundo
  private listeners: ((interval: number) => void)[] = [];

  private constructor() {
    // Carregar configuração salva do localStorage
    const saved = localStorage.getItem('globalSyncInterval');
    if (saved) {
      this._syncInterval = parseInt(saved) * 1000; // Converter para ms
    }
  }

  static getInstance(): GlobalSyncConfig {
    if (!GlobalSyncConfig.instance) {
      GlobalSyncConfig.instance = new GlobalSyncConfig();
    }
    return GlobalSyncConfig.instance;
  }

  get syncInterval(): number {
    return this._syncInterval;
  }

  setSyncInterval(seconds: number): void {
    this._syncInterval = seconds * 1000; // Converter para ms
    localStorage.setItem('globalSyncInterval', seconds.toString());
    
    // Notificar todos os ouvintes sobre a mudança
    this.listeners.forEach(listener => listener(this._syncInterval));
    
    console.log(`🔄 Intervalo global alterado para: ${seconds}s (${this._syncInterval}ms)`);
  }

  // Para componentes que precisam reagir a mudanças de intervalo
  addListener(listener: (interval: number) => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (interval: number) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Para React Query - sistema híbrido inteligente
  getReactQueryInterval(isWebSocketConnected: boolean = false): number | false {
    if (isWebSocketConnected) {
      // WebSocket conectado = reduzir polling drasticamente (apenas fallback)
      return this._syncInterval > 10000 ? false : Math.max(this._syncInterval * 10, 60000); // Mín 60s
    } else {
      // WebSocket desconectado = usar polling normal
      return this._syncInterval > 30000 ? false : this._syncInterval;
    }
  }

  // Invalidar todas as queries quando intervalo muda
  invalidateAllQueries(): void {
    // Disparar evento para notificar React Query
    window.dispatchEvent(new CustomEvent('globalSyncIntervalChanged', { 
      detail: { interval: this._syncInterval } 
    }));
  }
}

export const globalSyncConfig = GlobalSyncConfig.getInstance();