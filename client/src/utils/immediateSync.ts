import { queryClient } from '@/lib/queryClient';

// Sistema de sincronização imediata após ações
export const forceImmediateSync = () => {
  // Invalidar TODAS as queries para forçar recarga imediata
  queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
  queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
  queryClient.invalidateQueries({ queryKey: ['/api/systemUsers'] });
  queryClient.invalidateQueries({ queryKey: ['/api/vendorTargets'] });
  queryClient.invalidateQueries({ queryKey: ['/api/teamTargets'] });
  queryClient.invalidateQueries({ queryKey: ['/api/awards'] });
};

// Helper para usar após mutações
export const syncAfterMutation = (mutation: any) => {
  mutation.onSuccess = () => {
    forceImmediateSync();
  };
  return mutation;
};