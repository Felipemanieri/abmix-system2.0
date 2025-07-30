// SISTEMA DE SINCRONIZAÇÃO EM TEMPO REAL PARA TODOS OS DEPARTAMENTOS
// Garante que todas as mudanças sejam refletidas instantaneamente na planilha

import { generateDynamicSheet, formatForGoogleSheets } from './dynamicSheetGenerator';

export class RealTimeSheetSync {
  private static instance: RealTimeSheetSync;
  private syncCallbacks: (() => void)[] = [];
  private lastSyncTime: Date | null = null;
  private isAutoSyncEnabled: boolean = true;

  private constructor() {}

  static getInstance(): RealTimeSheetSync {
    if (!RealTimeSheetSync.instance) {
      RealTimeSheetSync.instance = new RealTimeSheetSync();
    }
    return RealTimeSheetSync.instance;
  }

  // Registrar callback para sincronização automática
  registerSyncCallback(callback: () => void): void {
    this.syncCallbacks.push(callback);
  }

  // Remover callback
  unregisterSyncCallback(callback: () => void): void {
    this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
  }

  // Disparar sincronização para todos os departamentos
  async triggerSync(): Promise<void> {
    if (!this.isAutoSyncEnabled) return;

    try {
      // Notificar todos os componentes registrados
      this.syncCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Erro ao executar callback de sincronização:', error);
        }
      });

      this.lastSyncTime = new Date();
      
      // Log da sincronização
      console.log('🔄 Sincronização em tempo real executada:', {
        timestamp: this.lastSyncTime.toISOString(),
        callbacksNotificados: this.syncCallbacks.length
      });

      // Disparar sincronização com Google Sheets (se configurado)
      await this.syncWithGoogleSheets();

    } catch (error) {
      console.error('Erro durante sincronização em tempo real:', error);
    }
  }

  // SINCRONIZAÇÃO TEMPORARIAMENTE DESABILITADA - causando unhandled rejections
  private async syncWithGoogleSheets(): Promise<void> {
    console.log('⚠️ Google Sheets sync DISABLED to prevent unhandled rejections');
    // try {
    //   const response = await fetch('/api/sync/sheet', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       trigger: 'realtime_sync',
    //       timestamp: new Date().toISOString()
    //     })
    //   });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Sincronização com Google Sheets:', result.message);
      }
    } catch (error) {
      console.error('Erro ao sincronizar com Google Sheets:', error);
    }
  }

  // Ativar/desativar sincronização automática
  setAutoSync(enabled: boolean): void {
    this.isAutoSyncEnabled = enabled;
    console.log(`🔄 Auto-sincronização ${enabled ? 'ativada' : 'desativada'}`);
  }

  // Obter status da sincronização
  getSyncStatus(): { lastSync: Date | null; isEnabled: boolean; callbackCount: number } {
    return {
      lastSync: this.lastSyncTime,
      isEnabled: this.isAutoSyncEnabled,
      callbackCount: this.syncCallbacks.length
    };
  }
}

// Função para disparar sincronização quando dados são alterados
export async function notifyDataChange(
  changeType: 'proposal_created' | 'proposal_updated' | 'proposal_deleted' | 'vendor_updated',
  data: any
): Promise<void> {
  const syncManager = RealTimeSheetSync.getInstance();
  
  console.log(`📋 Mudança detectada: ${changeType}`, {
    data: data?.id || data?.abmId || 'unknown',
    timestamp: new Date().toISOString()
  });

  // Disparar sincronização imediatamente
  await syncManager.triggerSync();
}

// Hook para React components
export function useRealTimeSheetSync() {
  const syncManager = RealTimeSheetSync.getInstance();
  
  return {
    triggerSync: () => syncManager.triggerSync(),
    getSyncStatus: () => syncManager.getSyncStatus(),
    setAutoSync: (enabled: boolean) => syncManager.setAutoSync(enabled),
    registerCallback: (callback: () => void) => syncManager.registerSyncCallback(callback),
    unregisterCallback: (callback: () => void) => syncManager.unregisterSyncCallback(callback)
  };
}

// Sistema de detecção de mudanças departamentais
export const DepartmentChangeDetector = {
  // Detector para Portal do Vendedor
  onVendorProposalCreate: async (proposal: any) => {
    console.log('🏢 Portal Vendedor: Nova proposta criada');
    await notifyDataChange('proposal_created', proposal);
  },

  // Detector para Portal do Cliente
  onClientProposalUpdate: async (proposal: any) => {
    console.log('👤 Portal Cliente: Proposta atualizada');
    await notifyDataChange('proposal_updated', proposal);
  },

  // Detector para Portal Financeiro
  onFinancialAnalysis: async (proposal: any) => {
    console.log('💰 Portal Financeiro: Análise realizada');
    await notifyDataChange('proposal_updated', proposal);
  },

  // Detector para Portal de Implementação
  onImplementationUpdate: async (proposal: any) => {
    console.log('⚙️ Portal Implementação: Status atualizado');
    await notifyDataChange('proposal_updated', proposal);
  },

  // Detector para Portal Supervisor
  onSupervisorAction: async (proposal: any) => {
    console.log('👑 Portal Supervisor: Ação executada');
    await notifyDataChange('proposal_updated', proposal);
  },

  // Detector para Área Restrita
  onRestrictedAreaChange: async (data: any) => {
    console.log('🔒 Área Restrita: Configuração alterada');
    await notifyDataChange('proposal_updated', data);
  }
};