// Hook para integrações externas (Make.com, Google APIs, Sistema Financeiro)
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface IntegrationStatus {
  makeWebhook: boolean;
  googleSheets: boolean;
  financialSystem: boolean;
  lastSync: string | null;
}

export interface FinancialIntegrationData {
  proposalId: string;
  contractValue: number;
  paymentTerms: string;
  customerData: any;
}

// Hook para verificar status das integrações
export function useIntegrationStatus() {
  return useQuery({
    queryKey: ['/api/integration/status'],
    queryFn: async (): Promise<IntegrationStatus> => {
      // Verificar status das integrações
      const response = await fetch('/api/integration/status');
      if (!response.ok) {
        throw new Error('Erro ao verificar status das integrações');
      }
      return response.json();
    },
    refetchInterval: 30000, // Verificar a cada 30 segundos
  });
}

// Hook para sincronização com Google Sheets
export function useGoogleSheetsSync() {
  return useMutation({
    mutationFn: async ({ proposalId, action = 'update' }: { proposalId: string; action?: string }) => {
      return apiRequest('/api/sync/sheets', 'POST', {
        proposalId,
        action
      });
    },
    onSuccess: () => {
      console.log('✅ Google Sheets sincronizado com sucesso');
    },
    onError: (error) => {
      console.error('❌ Erro ao sincronizar Google Sheets:', error);
    }
  });
}

// Hook para integração com sistema financeiro
export function useFinancialIntegration() {
  return useMutation({
    mutationFn: async ({ proposalId, action, financialData }: {
      proposalId: string;
      action: string;
      financialData: FinancialIntegrationData;
    }) => {
      return apiRequest('/api/integration/financial', 'POST', {
        proposalId,
        action,
        financialData
      });
    },
    onSuccess: (data) => {
      console.log('✅ Integração financeira realizada:', data);
    },
    onError: (error) => {
      console.error('❌ Erro na integração financeira:', error);
    }
  });
}

// Hook para notificações via webhook (Make.com)
export function useWebhookNotification() {
  return useMutation({
    mutationFn: async ({ type, data, proposalId, vendorId }: {
      type: string;
      data: any;
      proposalId?: string;
      vendorId?: number;
    }) => {
      return apiRequest('/api/webhook/notify', 'POST', {
        type,
        data,
        proposalId,
        vendorId
      });
    },
    onSuccess: (result) => {
      console.log('✅ Webhooks notificados:', result);
    },
    onError: (error) => {
      console.error('❌ Erro ao notificar webhooks:', error);
    }
  });
}

// Hook para forçar sincronização completa
export function useFullSync() {
  const sheetsSync = useGoogleSheetsSync();
  const webhookNotify = useWebhookNotification();
  
  return useMutation({
    mutationFn: async ({ proposalId }: { proposalId: string }) => {
      // Executar todas as sincronizações em paralelo
      const results = await Promise.allSettled([
        sheetsSync.mutateAsync({ proposalId, action: 'full_sync' }),
        webhookNotify.mutateAsync({
          type: 'full_sync_requested',
          data: { proposalId },
          proposalId
        })
      ]);
      
      return results;
    },
    onSuccess: () => {
      console.log('✅ Sincronização completa realizada');
    }
  });
}

// Hook para configurar variáveis de ambiente das integrações
export function useIntegrationConfig() {
  return useQuery({
    queryKey: ['/api/integration/config'],
    queryFn: async () => {
      const response = await fetch('/api/integration/config');
      if (!response.ok) {
        throw new Error('Erro ao obter configurações de integração');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
}