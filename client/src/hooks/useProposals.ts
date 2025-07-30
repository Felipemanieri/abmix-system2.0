import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { calculateProposalProgress } from '@shared/progressCalculator';

export interface ProposalData {
  id: string;
  abmId: string;
  vendorId: number;
  clientToken: string;
  contractData: {
    nomeEmpresa: string;
    cnpj: string;
    planoContratado: string;
    valor: string;
    inicioVigencia: string;
    odontoConjugado: boolean;
    compulsorio: boolean;
    periodoMinimo: string;
    livreAdesao: boolean;
    aproveitamentoCongenere: boolean;
    periodoVigencia: {
      inicio: string;
      fim: string;
    };
  };
  titulares: any[];
  dependentes: any[];
  internalData: any;
  vendorAttachments: any[];
  clientAttachments: any[];
  clientCompleted: boolean;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  // Campos calculados
  cliente: string;
  plano: string;
  valor: string;
  vendedor?: string;
  progresso: number;
}

export function useProposals() {
  const queryClient = useQueryClient();

  const { data: proposals = [], isLoading, error } = useQuery({
    queryKey: ['/api/proposals'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/proposals');
        if (!response.ok) {
          console.warn('Erro ao carregar propostas:', response.status);
          return []; // Retornar array vazio em caso de erro
        }
        return response.json();
      } catch (error) {
        console.warn('Fetch failed for proposals:', error instanceof Error ? error.message : String(error));
        return []; // Retornar array vazio em caso de erro
      }
    },
    select: (data: any[]) => {
      console.log('Dados recebidos da API:', data);
      return data.map((proposal): ProposalData => ({
        ...proposal,
        cliente: proposal.contractData?.nomeEmpresa || 'N/A',
        plano: proposal.contractData?.planoContratado || 'N/A',
        valor: proposal.contractData?.valor || '0',
        progresso: calculateProposalProgress({
          titulares: proposal.titulares || [],
          dependentes: proposal.dependentes || [],
          clientAttachments: proposal.clientAttachments || [],
          clientCompleted: proposal.clientCompleted || false
        }).overallProgress,
        priority: proposal.priority || 'medium' // Garantir que priority existe
      }));
    },
    refetchInterval: 60000, // Reduzido de 30s para 60s para evitar sobrecarga
    refetchIntervalInBackground: false, // NÃO atualizar em background
    refetchOnWindowFocus: false, // Desabilitado para reduzir requisições
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/vendors');
        if (!response.ok) {
          console.warn('Erro ao carregar vendedores:', response.status);
          return []; // Retornar array vazio em caso de erro
        }
        return response.json();
      } catch (error) {
        console.warn('Fetch failed for vendors:', error.message);
        return []; // Retornar array vazio em caso de erro
      }
    },
    retry: false, // Desabilitar retry para evitar loops
  });

  // Adicionar nome do vendedor às propostas
  const proposalsWithVendor = proposals.map(proposal => ({
    ...proposal,
    vendedor: Array.isArray(vendors) ? vendors.find((v: any) => v.id === proposal.vendorId)?.name || 'N/A' : 'N/A'
  }));

  // Mutation para atualizar status da proposta com sincronização em tempo real
  const updateProposal = useMutation({
    mutationFn: async ({ id, status, priority }: { id: string, status?: string, priority?: string }) => {
      console.log(`UPDATING PROPOSAL STATUS: ${id} -> ${status}`);
      try {
        const response = await fetch(`/api/proposals/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, priority })
        });
        if (!response.ok) {
          console.warn(`Erro ao atualizar proposta ${id}:`, response.status);
          return null;
        }
        return response.json();
      } catch (error) {
        console.warn(`Update failed for proposal ${id}:`, error.message);
        return null;
      }
    },
    onSuccess: (data) => {
      console.log(`STATUS UPDATE SUCCESS:`, data);
      // Invalidar e forçar refetch imediato de todas as consultas relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
      queryClient.refetchQueries({ queryKey: ['/api/proposals'] });

      // Sincronização completa após mudança
      console.log(`🔄 Forcing immediate update of all proposals`);
      console.log(`✅ All proposal queries invalidated and refetched`);
    },
    onError: (error) => {
      console.error(`STATUS UPDATE ERROR:`, error);
    }
  });

  // Mutation para rejeitar proposta com sincronização em tempo real
  const rejectProposal = useMutation({
    mutationFn: async (proposalId: string) => {
      console.log(`❌ REJECTING PROPOSAL: ${proposalId}`);
      try {
        const response = await fetch(`/api/proposals/${proposalId}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          console.warn(`Erro ao rejeitar proposta ${proposalId}:`, response.status);
          return null;
        }
        return response.json();
      } catch (error) {
        console.warn(`Reject failed for proposal ${proposalId}:`, error.message);
        return null;
      }
    },
    onSuccess: (data) => {
      console.log(`❌ REJECTION SUCCESS:`, data);
      // Invalidar e forçar refetch imediato de todas as consultas relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
      queryClient.refetchQueries({ queryKey: ['/api/proposals'] });

      // Sincronização completa após rejeição
      console.log(`🔄 Forcing immediate update after rejection`);
      console.log(`✅ All proposal queries invalidated and refetched after rejection`);
    },
    onError: (error) => {
      console.error(`❌ REJECTION ERROR:`, error);
    }
  });

  return {
    proposals: proposalsWithVendor,
    isLoading,
    error,
    updateProposal,
    rejectProposal,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['/api/proposals'] })
  };
}

export function useVendorProposals(vendorId: number) {
  const queryClient = useQueryClient();

  const { data: proposals = [], isLoading, error } = useQuery({
    queryKey: ['/api/proposals/vendor', vendorId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/proposals/vendor/${vendorId}`);
        if (!response.ok) {
          console.warn(`Erro ao carregar propostas do vendedor ${vendorId}:`, response.status);
          return []; // Retornar array vazio em caso de erro
        }
        return response.json();
      } catch (error) {
        console.warn(`Fetch failed for vendor ${vendorId} proposals:`, error.message);
        return []; // Retornar array vazio em caso de erro
      }
    },
    select: (data: any[]) => {
      console.log(`Propostas do vendedor ${vendorId}:`, data);
      return data.map((proposal): ProposalData => ({
        ...proposal,
        cliente: proposal.contractData?.nomeEmpresa || 'N/A',
        plano: proposal.contractData?.planoContratado || 'N/A',
        valor: proposal.contractData?.valor || '0',
        progresso: calculateProposalProgress({
          titulares: proposal.titulares || [],
          dependentes: proposal.dependentes || [],
          clientAttachments: proposal.clientAttachments || [],
          clientCompleted: proposal.clientCompleted || false
        }).overallProgress,
        priority: proposal.priority || 'medium'
      }));
    },
    refetchInterval: 1000, // 1 segundo - resposta imediata
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 30,
    retry: false, // Sem retry para evitar erros
    enabled: vendorId > 0, // Só fazer a consulta se o vendorId for válido
  });

  return {
    proposals,
    isLoading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['/api/proposals/vendor', vendorId] })
  };
}

// Removed duplicate progress calculation - now using standardized function from shared/progressCalculator

// Hook para atualização em tempo real via polling
export function useRealTimeProposals(vendorId?: number) {
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      // Invalidar consultas gerais
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });

      // Se for um vendedor específico, invalidar também suas propostas
      if (vendorId) {
        queryClient.invalidateQueries({ queryKey: ['/api/proposals/vendor', vendorId] });
      }

      setLastUpdate(Date.now());
    }, 60000); // Atualizar a cada 1 minuto

    return () => clearInterval(interval);
  }, [queryClient, vendorId]);

  return { lastUpdate };
}

// Hook para atualizar status/prioridade das propostas (USADO EM TODOS OS PORTAIS)
export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, priority }: { id: string, status?: string, priority?: string }) => {
      console.log(`🔄 GLOBAL UPDATE PROPOSAL: ${id} -> Status: ${status}, Priority: ${priority}`);
      try {
        const response = await fetch(`/api/proposals/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, priority })
        });
        if (!response.ok) {
          console.warn(`Erro global ao atualizar proposta ${id}:`, response.status);
          return null;
        }
        return response.json();
      } catch (error) {
        console.warn(`Global update failed for proposal ${id}:`, error.message);
        return null;
      }
    },
    onSuccess: (data) => {
      console.log(`✅ GLOBAL STATUS UPDATE SUCCESS:`, data);
      // SINCRONIZAÇÃO FORÇADA EM TODOS OS PORTAIS

      // 1. Invalidar consultas gerais (para todos os portais)
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });

      // 2. Invalidar consultas por vendedor (para portal vendedor)
      queryClient.invalidateQueries({ queryKey: ['/api/proposals/vendor'] });

      // 3. Refetch imediato para garantir sincronização
      queryClient.refetchQueries({ queryKey: ['/api/proposals'] });

      // Refetch único para garantir sincronização
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/proposals'] });
        console.log(`🚀 SYNC COMPLETE - All portals synchronized`);
      }, 2000);
    },
    onError: (error) => {
      console.error(`❌ GLOBAL STATUS UPDATE ERROR:`, error);
    }
  });
}

// Hook para deletar propostas com sincronização forçada em todos os portais
export function useDeleteProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: string) => {
      console.log(`🗑️ DELETING PROPOSAL: ${proposalId}`);
      try {
        const response = await fetch(`/api/proposals/${proposalId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          console.warn(`Erro ao excluir proposta ${proposalId}:`, response.status);
          return null;
        }

        return response.json();
      } catch (error) {
        console.warn(`Delete failed for proposal ${proposalId}:`, error.message);
        return null;
      }
    },
    onSuccess: (data, proposalId) => {
      console.log(`✅ PROPOSAL DELETED SUCCESSFULLY: ${proposalId}`, data);

      // SINCRONIZAÇÃO FORÇADA IMEDIATA EM TODOS OS PORTAIS
      // 1. Invalidar todas as consultas de propostas
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/proposals/vendor'] });

      // 2. Refetch imediato para garantir remoção visual
      queryClient.refetchQueries({ queryKey: ['/api/proposals'] });
      queryClient.refetchQueries({ queryKey: ['/api/proposals/vendor'] });

      // Refetch único após delay para garantir sincronização
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/proposals'] });
        console.log(`🎯 DELETION COMPLETE - Proposal ${proposalId} removed`);
      }, 1000);
    },
    onError: (error, proposalId) => {
      console.error(`❌ DELETE PROPOSAL ERROR for ${proposalId}:`, error);
    }
  });
}