
export interface ProposalData {
  id: string;
  contractData: any;
  vendorName: string;
}

export class RealTimeIntegration {
  private static instance: RealTimeIntegration;
  private listeners: Set<() => void> = new Set();
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): RealTimeIntegration {
    if (!RealTimeIntegration.instance) {
      RealTimeIntegration.instance = new RealTimeIntegration();
    }
    return RealTimeIntegration.instance;
  }

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(): void {
    this.listeners.forEach(listener => listener());
  }

  startPolling(interval: number = 5000): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.notify();
    }, interval);
  }

  stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async onProposalCreated(proposalData: ProposalData): Promise<void> {
    try {
      console.log('🔄 Sincronizando proposta criada:', proposalData.id);
      
      // Simular sincronização com Google Drive e Sheets
      await this.syncWithGoogleDrive(proposalData);
      await this.syncWithGoogleSheets(proposalData);
      
      // Notificar listeners sobre a atualização
      this.notify();
      
      console.log('✅ Sincronização concluída para proposta:', proposalData.id);
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      throw error;
    }
  }

  private async syncWithGoogleDrive(proposalData: ProposalData): Promise<void> {
    // Simulação de sincronização com Google Drive
    console.log('📁 Sincronizando com Google Drive...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async syncWithGoogleSheets(proposalData: ProposalData): Promise<void> {
    // Simulação de sincronização com Google Sheets
    console.log('📊 Sincronizando com Google Sheets...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

export const realTimeIntegration = RealTimeIntegration.getInstance();
