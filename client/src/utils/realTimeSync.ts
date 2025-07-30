// Sistema de sincronização em tempo real para propagação instantânea de dados
import { queryClient } from '@/lib/queryClient';

class RealTimeSync {
  private static instance: RealTimeSync;
  
  public static getInstance(): RealTimeSync {
    if (!RealTimeSync.instance) {
      RealTimeSync.instance = new RealTimeSync();
    }
    return RealTimeSync.instance;
  }
  
  // Força atualização imediata de todas as consultas de propostas
  public forceUpdateAllProposals(): void {
    console.log('🔄 Forcing immediate update of all proposals');
    
    // Invalidar todas as consultas de propostas
    queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
    
    // Invalidar consultas específicas de vendedores
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === '/api/proposals/vendor';
      }
    });
    
    // Invalidar consultas de propostas individuais
    queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey[0] === '/api/proposals/client';
      }
    });
    
    // Forçar refetch imediato
    queryClient.refetchQueries({ queryKey: ['/api/proposals'] });
    
    console.log('✅ All proposal queries invalidated and refetched');
  }
  
  // Força atualização quando vendedor específico cria proposta
  public notifyProposalCreated(vendorId: number, proposalId?: string): void {
    console.log(`🆕 New proposal created by vendor ${vendorId}`);
    
    // Atualizar imediatamente todas as consultas
    this.forceUpdateAllProposals();
    
    // Atualizar especificamente as propostas do vendedor
    queryClient.invalidateQueries({ queryKey: ['/api/proposals/vendor', vendorId] });
    queryClient.refetchQueries({ queryKey: ['/api/proposals/vendor', vendorId] });
    
    // Notificar Make.com sobre nova proposta
    if (proposalId) {
      this.notifyMakeWebhook('proposal_created', { vendorId, proposalId });
    }
    
    console.log(`✅ Vendor ${vendorId} proposals updated immediately`);
  }
  
  // Notifica Make.com via webhook
  private async notifyMakeWebhook(type: string, data: any): Promise<void> {
    try {
      await fetch('/api/webhook/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          timestamp: new Date().toISOString()
        })
      });
      console.log(`🔗 Make.com notified: ${type}`);
    } catch (error) {
      console.error('Erro ao notificar Make.com:', error);
    }
  }
  
  // Força atualização quando status de proposta muda
  public notifyProposalUpdated(proposalId: string, updateType?: string): void {
    console.log(`📝 Proposal ${proposalId} updated`);
    this.forceUpdateAllProposals();
    
    // Notificar Make.com sobre atualização
    this.notifyMakeWebhook('proposal_updated', { proposalId, updateType });
    
    // Sincronizar com Google Sheets
    this.syncWithGoogleSheets(proposalId);
  }
  
  // Sincroniza proposta específica com Google Sheets
  private async syncWithGoogleSheets(proposalId: string): Promise<void> {
    try {
      await fetch('/api/sync/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          action: 'update'
        })
      });
      console.log(`📊 Google Sheets sync initiated for proposal ${proposalId}`);
    } catch (error) {
      console.error('Erro ao sincronizar com Google Sheets:', error);
    }
  }
  
  // Alias para forceUpdateAllProposals - usado pelos portais
  public forceRefresh(): void {
    this.forceUpdateAllProposals();
  }
  
  // Configurar polling agressivo para tempo real
  public enableAggressivePolling(): void {
    console.log('⚡ Enabling aggressive polling for real-time updates');
    
    setInterval(() => {
      // Invalidar queries sem fazer refetch completo
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] }, { refetchType: 'none' });
    }, 500); // A cada 500ms
  }
}

export const realTimeSync = RealTimeSync.getInstance();

// Hook personalizado para notificações de mudança
export function useRealTimeNotifications() {
  const notifyCreated = (vendorId: number) => {
    realTimeSync.notifyProposalCreated(vendorId);
  };
  
  const notifyUpdated = (proposalId: string) => {
    realTimeSync.notifyProposalUpdated(proposalId);
  };
  
  const forceUpdate = () => {
    realTimeSync.forceUpdateAllProposals();
  };
  
  return {
    notifyCreated,
    notifyUpdated,
    forceUpdate
  };
}