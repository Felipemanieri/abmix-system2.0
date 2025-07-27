// GERENCIADOR DE CONFIGURAÇÕES DE TEMPO PARA INTEGRAÇÃO COM GOOGLE MODULES
// Sistema central para controlar todos os tempos de sincronização e conexões
// VERSÃO SILENCIOSA - SEM MENSAGENS DE CONSOLE

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
  intervalId?: NodeJS.Timeout;
  manualStop: boolean;
}

class TimeConfigManager {
  private static instance: TimeConfigManager;
  private timeConfigs: Map<string, TimeConfig> = new Map();
  private googleConnections: Map<string, GoogleModuleConnection> = new Map();
  private intervalMap: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.initializeDefaultConfigs();
  }

  static getInstance(): TimeConfigManager {
    if (!TimeConfigManager.instance) {
      TimeConfigManager.instance = new TimeConfigManager();
    }
    return TimeConfigManager.instance;
  }

  private initializeDefaultConfigs(): void {
    // Configurações padrão do sistema
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
        id: 'backup_process',
        name: 'Backup - Processo',
        description: 'Tempo de execução do backup automático',
        currentValue: 300,
        enabled: true,
        module: 'backup',
        manualStopActive: false
      },
      {
        id: 'api_requests',
        name: 'API - Requisições',
        description: 'Tempo entre requisições à API Google',
        currentValue: 1,
        enabled: true,
        module: 'api',
        manualStopActive: false
      },
      {
        id: 'real_time_sync',
        name: 'Real Time - Sincronização',
        description: 'Tempo de sincronização em tempo real',
        currentValue: 2,
        enabled: true,
        module: 'real_time',
        manualStopActive: false
      },
      {
        id: 'data_processing',
        name: 'Processamento - Dados',
        description: 'Tempo de processamento de dados',
        currentValue: 5,
        enabled: true,
        module: 'processing',
        manualStopActive: false
      },
      {
        id: 'cleanup_process',
        name: 'Limpeza - Sistema',
        description: 'Tempo de limpeza do sistema',
        currentValue: 600,
        enabled: true,
        module: 'cleanup',
        manualStopActive: false
      }
    ];

    // Inicializar configurações
    defaultConfigs.forEach(config => {
      this.timeConfigs.set(config.id, {
        ...config,
        lastUpdated: new Date()
      });
    });

    // Inicializar conexões Google
    this.initializeGoogleConnections();
  }

  private initializeGoogleConnections(): void {
    const googleModules: GoogleModuleConnection['module'][] = [
      'google_drive', 'google_sheets', 'google_forms', 'google_docs', 'backup', 'api'
    ];

    googleModules.forEach(module => {
      this.googleConnections.set(module, {
        module,
        connected: true,
        lastSync: new Date(),
        nextSync: new Date(Date.now() + 30000), // 30 segundos
        requestsCount: 0,
        manualStop: false
      });
    });
  }

  // Métodos públicos
  getTimeConfig(id: string): TimeConfig | undefined {
    return this.timeConfigs.get(id);
  }

  getAllTimeConfigs(): TimeConfig[] {
    return Array.from(this.timeConfigs.values());
  }

  updateTimeConfig(id: string, updates: Partial<TimeConfig>): boolean {
    const config = this.timeConfigs.get(id);
    if (!config) return false;

    const updatedConfig = {
      ...config,
      ...updates,
      lastUpdated: new Date()
    };

    this.timeConfigs.set(id, updatedConfig);
    return true;
  }

  // Controle manual de sistemas
  stopModule(moduleId: string): boolean {
    const config = this.timeConfigs.get(moduleId);
    if (!config) return false;

    this.updateTimeConfig(moduleId, {
      enabled: false,
      manualStopActive: true
    });

    // Parar interval se existir
    const interval = this.intervalMap.get(moduleId);
    if (interval) {
      clearInterval(interval);
      this.intervalMap.delete(moduleId);
    }

    return true;
  }

  startModule(moduleId: string): boolean {
    const config = this.timeConfigs.get(moduleId);
    if (!config) return false;

    this.updateTimeConfig(moduleId, {
      enabled: true,
      manualStopActive: false
    });

    return true;
  }

  // Controle geral
  stopAllModules(): void {
    this.timeConfigs.forEach((config, id) => {
      this.stopModule(id);
    });
  }

  startAllModules(): void {
    this.timeConfigs.forEach((config, id) => {
      this.startModule(id);
    });
  }

  // Conexões Google
  getGoogleConnection(module: string): GoogleModuleConnection | undefined {
    return this.googleConnections.get(module);
  }

  getAllGoogleConnections(): GoogleModuleConnection[] {
    return Array.from(this.googleConnections.values());
  }

  updateGoogleConnection(module: string, updates: Partial<GoogleModuleConnection>): boolean {
    const connection = this.googleConnections.get(module);
    if (!connection) return false;

    const updatedConnection = {
      ...connection,
      ...updates
    };

    this.googleConnections.set(module, updatedConnection);
    return true;
  }

  // Estatísticas
  getSystemStats() {
    const totalModules = this.timeConfigs.size;
    const activeModules = Array.from(this.timeConfigs.values()).filter(c => c.enabled && !c.manualStopActive).length;
    const googleConnected = Array.from(this.googleConnections.values()).filter(c => c.connected).length;
    const manualStops = Array.from(this.timeConfigs.values()).filter(c => c.manualStopActive).length;

    return {
      totalModules,
      activeModules,
      googleConnected,
      manualStops
    };
  }
}

// Export singleton
export const timeConfigManager = TimeConfigManager.getInstance();
export default timeConfigManager;