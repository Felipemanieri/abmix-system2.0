// GERENCIADOR DE CONFIGURAÇÕES DE TEMPO PARA INTEGRAÇÃO COM GOOGLE MODULES
// Sistema central para controlar todos os tempos de sincronização e conexões

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
        id: 'backup_auto',
        name: 'Backup Automático',
        description: 'Intervalo de backup automático',
        currentValue: 86400, // 24 horas
        enabled: true,
        module: 'backup',
        manualStopActive: false
      },
      {
        id: 'api_requests',
        name: 'API Google - Requisições',
        description: 'Controle de requisições à API',
        currentValue: 5,
        enabled: true,
        module: 'api',
        manualStopActive: false
      },
      {
        id: 'real_time_sync',
        name: 'Sincronização Tempo Real',
        description: 'Atualização em tempo real dos portais',
        currentValue: 1,
        enabled: true,
        module: 'real_time',
        manualStopActive: false
      },
      {
        id: 'processing_queue',
        name: 'Processamento de Filas',
        description: 'Processamento de filas de documentos',
        currentValue: 10,
        enabled: true,
        module: 'processing',
        manualStopActive: false
      },
      {
        id: 'cleanup_auto',
        name: 'Limpeza Automática',
        description: 'Limpeza de arquivos temporários',
        currentValue: 86400, // 24 horas
        enabled: true,
        module: 'cleanup',
        manualStopActive: false
      }
    ];

    defaultConfigs.forEach(config => {
      this.timeConfigs.set(config.id, {
        ...config,
        lastUpdated: new Date()
      });
    });

    // Inicializar conexões do Google
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

  // Atualizar configuração de tempo
  updateTimeConfig(id: string, newValue: number, enabled: boolean = true): void {
    const config = this.timeConfigs.get(id);
    if (config) {
      // Parar intervalo anterior se existir
      this.stopInterval(id);
      
      // Atualizar configuração
      config.currentValue = newValue;
      config.enabled = enabled;
      config.lastUpdated = new Date();
      config.manualStopActive = false;
      
      // Reiniciar intervalo se habilitado
      if (enabled) {
        this.startInterval(id);
      }
      
      console.log(`⏱️ Configuração atualizada: ${config.name} - ${newValue}s`);
    }
  }

  // Parar manualmente um módulo específico
  manualStopModule(moduleId: string): void {
    const config = this.timeConfigs.get(moduleId);
    if (config) {
      config.manualStopActive = true;
      config.enabled = false;
      this.stopInterval(moduleId);
      
      // Atualizar conexão do Google se aplicável
      const connection = this.googleConnections.get(config.module);
      if (connection) {
        connection.manualStop = true;
        connection.connected = false;
      }
      
      console.log(`🛑 Módulo parado manualmente: ${config.name}`);
    }
  }

  // Reiniciar um módulo parado manualmente
  manualStartModule(moduleId: string): void {
    const config = this.timeConfigs.get(moduleId);
    if (config) {
      config.manualStopActive = false;
      config.enabled = true;
      this.startInterval(moduleId);
      
      // Atualizar conexão do Google se aplicável
      const connection = this.googleConnections.get(config.module);
      if (connection) {
        connection.manualStop = false;
        connection.connected = true;
      }
      
      console.log(`▶️ Módulo reiniciado: ${config.name}`);
    }
  }

  // INTERVALOS TEMPORARIAMENTE DESABILITADOS - causando unhandled rejections
  private startInterval(id: string): void {
    const config = this.timeConfigs.get(id);
    if (!config || !config.enabled) return;

    console.log(`⚠️ Interval for ${config.name} DISABLED to prevent unhandled rejections`);
    // const interval = setInterval(() => {
    //   this.executeModuleSync(id);
    // }, config.currentValue * 1000);
    // this.intervalMap.set(id, interval);
    
    // Atualizar próximo sync
    const connection = this.googleConnections.get(config.module);
    if (connection) {
      connection.nextSync = new Date(Date.now() + config.currentValue * 1000);
    }
  }

  // Parar intervalo de um módulo
  private stopInterval(id: string): void {
    const interval = this.intervalMap.get(id);
    if (interval) {
      clearInterval(interval);
      this.intervalMap.delete(id);
    }
  }

  // Executar sincronização do módulo
  private async executeModuleSync(id: string): Promise<void> {
    const config = this.timeConfigs.get(id);
    if (!config || !config.enabled || config.manualStopActive) return;

    const connection = this.googleConnections.get(config.module);
    if (!connection || connection.manualStop) return;

    try {
      console.log(`🔄 Executando sincronização: ${config.name}`);
      
      // Simular sincronização baseada no módulo
      await this.syncModuleWithGoogle(config.module);
      
      // Atualizar estatísticas
      connection.lastSync = new Date();
      connection.requestsCount++;
      connection.nextSync = new Date(Date.now() + config.currentValue * 1000);
      
      // Disparar evento de sincronização com planilha principal
      if (config.module === 'google_sheets') {
        await this.syncWithMainSheet();
      }
      
    } catch (error) {
      console.error(`❌ Erro na sincronização ${config.name}:`, error);
    }
  }

  // Sincronizar com módulo específico do Google
  private async syncModuleWithGoogle(module: GoogleModuleConnection['module']): Promise<void> {
    const connection = this.googleConnections.get(module);
    if (!connection) return;

    switch (module) {
      case 'google_drive':
        // Sincronizar com Google Drive
        await this.syncGoogleDrive();
        break;
      case 'google_sheets':
        // Sincronizar com Google Sheets
        await this.syncGoogleSheets();
        break;
      case 'google_forms':
        // Sincronizar com Google Forms
        await this.syncGoogleForms();
        break;
      case 'google_docs':
        // Sincronizar com Google Docs
        await this.syncGoogleDocs();
        break;
      case 'backup':
        // Executar backup
        await this.executeBackup();
        break;
      case 'api':
        // Monitorar API
        await this.monitorAPI();
        break;
    }
  }

  // Sincronizar com planilha principal
  private async syncWithMainSheet(): Promise<void> {
    try {
      const response = await fetch('/api/sync/sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trigger: 'time_config_sync',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('✅ Planilha principal sincronizada via módulo tempo');
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar planilha principal:', error);
    }
  }

  // Métodos de sincronização específicos (placeholders para implementação futura)
  private async syncGoogleDrive(): Promise<void> {
    console.log('📁 Sincronizando Google Drive...');
  }

  private async syncGoogleSheets(): Promise<void> {
    console.log('📊 Sincronizando Google Sheets...');
  }

  private async syncGoogleForms(): Promise<void> {
    console.log('📝 Sincronizando Google Forms...');
  }

  private async syncGoogleDocs(): Promise<void> {
    console.log('📄 Sincronizando Google Docs...');
  }

  private async executeBackup(): Promise<void> {
    console.log('💾 Executando backup...');
  }

  private async monitorAPI(): Promise<void> {
    console.log('🔍 Monitorando API Google...');
  }

  // Obter todas as configurações
  getAllConfigs(): TimeConfig[] {
    return Array.from(this.timeConfigs.values());
  }

  // Obter configuração específica
  getConfig(id: string): TimeConfig | undefined {
    return this.timeConfigs.get(id);
  }

  // Obter todas as conexões do Google
  getAllGoogleConnections(): GoogleModuleConnection[] {
    return Array.from(this.googleConnections.values());
  }

  // Obter conexão específica do Google
  getGoogleConnection(module: GoogleModuleConnection['module']): GoogleModuleConnection | undefined {
    return this.googleConnections.get(module);
  }

  // Parar todas as sincronizações
  stopAllSync(): void {
    this.timeConfigs.forEach((config, id) => {
      this.manualStopModule(id);
    });
    console.log('🛑 Todas as sincronizações foram paradas');
  }

  // Reiniciar todas as sincronizações
  startAllSync(): void {
    this.timeConfigs.forEach((config, id) => {
      this.manualStartModule(id);
    });
    console.log('▶️ Todas as sincronizações foram reiniciadas');
  }

  // Obter estatísticas do sistema
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
export const timeConfigManager = TimeConfigManager.getInstance();

// Hook para React components
export function useTimeConfig() {
  return {
    getAllConfigs: () => timeConfigManager.getAllConfigs(),
    getConfig: (id: string) => timeConfigManager.getConfig(id),
    updateConfig: (id: string, value: number, enabled: boolean = true) => 
      timeConfigManager.updateTimeConfig(id, value, enabled),
    manualStop: (moduleId: string) => timeConfigManager.manualStopModule(moduleId),
    manualStart: (moduleId: string) => timeConfigManager.manualStartModule(moduleId),
    stopAll: () => timeConfigManager.stopAllSync(),
    startAll: () => timeConfigManager.startAllSync(),
    getGoogleConnections: () => timeConfigManager.getAllGoogleConnections(),
    getSystemStats: () => timeConfigManager.getSystemStats()
  };
}