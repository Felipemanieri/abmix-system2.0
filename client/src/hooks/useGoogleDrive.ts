import { useState, useCallback } from 'react';
import GoogleDriveService, { ClientData } from '../services/GoogleDriveService';

export const useGoogleDrive = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const driveService = GoogleDriveService.getInstance();

  // Salvar dados do cliente no Google Sheets
  const saveClientData = useCallback(async (clientData: ClientData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await driveService.saveClientData(clientData);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados do cliente');
      setIsLoading(false);
      return false;
    }
  }, []);

  // Fazer upload de documento para o Google Drive
  const uploadDocument = useCallback(async (file: File, clientId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const documentUrl = await driveService.uploadDocument(file, clientId);
      setIsLoading(false);
      return documentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload do documento');
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Criar pasta para o cliente no Google Drive
  const createClientFolder = useCallback(async (clientId: string, clientName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const folderId = await driveService.createClientFolder(clientId, clientName);
      setIsLoading(false);
      return folderId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pasta para o cliente');
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Obter documentos do cliente
  const getClientDocuments = useCallback(async (clientId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const documents = await driveService.getClientDocuments(clientId);
      setIsLoading(false);
      return documents;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter documentos do cliente');
      setIsLoading(false);
      return [];
    }
  }, []);

  return {
    isLoading,
    error,
    saveClientData,
    uploadDocument,
    createClientFolder,
    getClientDocuments
  };
};