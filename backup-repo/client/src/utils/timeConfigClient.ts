// VERSÃO SEGURA PARA BROWSER DO GERENCIADOR DE CONFIGURAÇÕES DE TEMPO
// Esta versão não usa NodeJS.Timeout e é segura para o cliente

export interface TimeConfig {
  id: string;
  name: string;
  description: string;
  currentValue: number; // em segundos
  enabled: boolean;
  module: 'google_drive' | 'google_sheets' | 'google_forms' | 'google_docs' | 'backup' | 'api' | 'real_time' | 'processing' | 'cleanup';
  lastUpdated: Date;
  manualStopActive: boolean;
}

export interface GoogleModuleConnection {
  module: 'google_drive' | 'google_sheets' | 'google_forms' | 'google_docs' | 'backup' | 'api';
  connected: boolean;
  lastSync: Date | null;
  nextSync: Date | null;
  requestsCount: number;
  manualStop: boolean;
}

// Versão simplificada e segura para o cliente
class ClientTimeConfigManager {
  private static instance: ClientTimeConfigManager;
  private timeConfigs: Map<string, TimeConfig> = new Map();
  private googleConnections: Map<string, GoogleModuleConnection> = new Map();

  private constructor() {
    this.initializeDefaultConfigs();
  }

  static getInstance(): ClientTimeConfigManager {
    if (!ClientTimeConfigManager.instance) {
      ClientTimeConfigManager.instance = new ClientTimeConfigManager();
    }
    return ClientTimeConfigManager.instance;
  }

  private initializeDefaultConfigs(): void {
    // Configurações padrão do sistema (versão cliente)
    const defaultConfigs: Omit<TimeConfig, 'lastUpdated'>[] = [
      {
        id: 'google_drive_sync',
        name: 'Google Drive - Sincronização',
        description: 'Tempo de sincronização com Google Drive',
        currentValue: 30,
        enabled: true,
        module: 'google_drive',
        manualStopActive: false
      },
      {
        id: 'google_sheets_sync',
        name: 'Google Sheets - Atualização',
        description: 'Tempo de atualização da planilha principal',
        currentValue: 10,
        enabled: true,
        module: 'google_sheets',
        manualStopActive: false
      },
      {
        id: 'google_forms_sync',
        name: 'Google Forms - Verificação',
        description: 'Tempo de verificação de novos formulários',
        currentValue: 60,
        enabled: true,
        module: 'google_forms',
        manualStopActive: false
      },
      {
        id: 'google_docs_sync',
        name: 'Google Docs - Documentos',
        description: 'Tempo de sincronização de documentos',
        currentValue: 120,
        enabled: true,
        module: 'google_docs',
        manualStopActive: false
      },
      {
        id: 'backup_sync',
        name: 'Backup - Sistema',
        description: 'Tempo de backup automático',
        currentValue: 3600,
        enabled: true,
        module: 'backup',
        manualStopActive: false
      }
    ];

    defaultConfigs.forEach(config => {
      this.timeConfigs.set(config.id, {
        ...config,
        lastUpdated: new Date()
      });
    });

    // Inicializar conexões
    this.initializeGoogleConnections();
  }

  private initializeGoogleConnections(): void {
    const modules: GoogleModuleConnection['module'][] = [
      'google_drive', 'google_sheets', 'google_forms', 'google_docs', 'backup', 'api'
    ];

    modules.forEach(module => {
      this.googleConnections.set(module, {
        module,
        connected: false,
        lastSync: null,
        nextSync: null,
        requestsCount: 0,
        manualStop: false
      });
    });
  }

  // Métodos públicos seguros
  getAllConfigs(): TimeConfig[] {
    return Array.from(this.timeConfigs.values());
  }

  getConfig(id: string): TimeConfig | undefined {
    return this.timeConfigs.get(id);
  }

  updateTimeConfig(id: string, value: number, enabled: boolean = true): boolean {
    const config = this.timeConfigs.get(id);
    if (!config) return false;

    config.currentValue = value;
    config.enabled = enabled;
    config.lastUpdated = new Date();
    
    console.log(`⏰ Configuração atualizada: ${config.name} = ${value}s`);
    return true;
  }

  manualStopModule(moduleId: string): void {
    const config = this.timeConfigs.get(moduleId);
    if (config) {
      config.manualStopActive = true;
      config.enabled = false;
      console.log(`⏸️ Módulo parado manualmente: ${config.name}`);
    }
  }

  manualStartModule(moduleId: string): void {
    const config = this.timeConfigs.get(moduleId);
    if (config) {
      config.manualStopActive = false;
      config.enabled = true;
      console.log(`▶️ Módulo reiniciado: ${config.name}`);
    }
  }

  getGoogleConnections(): GoogleModuleConnection[] {
    return Array.from(this.googleConnections.values());
  }

  getGoogleConnection(module: GoogleModuleConnection['module']): GoogleModuleConnection | undefined {
    return this.googleConnections.get(module);
  }

  stopAllSync(): void {
    this.timeConfigs.forEach((config, id) => {
      this.manualStopModule(id);
    });
    console.log('🛑 Todas as sincronizações foram paradas');
  }

  startAllSync(): void {
    this.timeConfigs.forEach((config, id) => {
      this.manualStartModule(id);
    });
    console.log('▶️ Todas as sincronizações foram reiniciadas');
  }

  getSystemStats(): {
    totalConfigs: number;
    enabledConfigs: number;
    connectedModules: number;
    totalRequests: number;
    lastUpdate: Date;
  } {
    const configs = Array.from(this.timeConfigs.values());
    const connections = Array.from(this.googleConnections.values());
    
    return {
      totalConfigs: configs.length,
      enabledConfigs: configs.filter(c => c.enabled).length,
      connectedModules: connections.filter(c => c.connected).length,
      totalRequests: connections.reduce((sum, c) => sum + c.requestsCount, 0),
      lastUpdate: new Date(Math.max(...configs.map(c => c.lastUpdated.getTime())))
    };
  }
}

// Exportar instância singleton
export const clientTimeConfigManager = ClientTimeConfigManager.getInstance();

// Hook seguro para React components
export function useClientTimeConfig() {
  return {
    getAllConfigs: () => clientTimeConfigManager.getAllConfigs(),
    getConfig: (id: string) => clientTimeConfigManager.getConfig(id),
    updateConfig: (id: string, value: number, enabled: boolean = true) => 
      clientTimeConfigManager.updateTimeConfig(id, value, enabled),
    manualStop: (moduleId: string) => clientTimeConfigManager.manualStopModule(moduleId),
    manualStart: (moduleId: string) => clientTimeConfigManager.manualStartModule(moduleId),
    stopAll: () => clientTimeConfigManager.stopAllSync(),
    startAll: () => clientTimeConfigManager.startAllSync(),
    getGoogleConnections: () => clientTimeConfigManager.getGoogleConnections(),
    getGoogleConnection: (module: GoogleModuleConnection['module']) => 
      clientTimeConfigManager.getGoogleConnection(module),
    getSystemStats: () => clientTimeConfigManager.getSystemStats()
  };
}