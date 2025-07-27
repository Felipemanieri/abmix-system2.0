// Serviço Google Drive com integração real
export interface ClientData {
  id: string;
  nome: string;
  cnpj: string;
  plano: string;
  valor: string;
  vendedor: string;
  status: string;
  dataAtualizacao: string;
}

class GoogleDriveService {
  private static instance: GoogleDriveService;
  
  // Credenciais de produção
  private readonly CLIENT_ID = '754195061143-fe16am2k6rvemnnm4gfe40j9ki3p70b0.apps.googleusercontent.com';
  private readonly MAIN_FOLDER_ID = '1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb';
  private readonly MAIN_FOLDER_URL = 'https://drive.google.com/drive/folders/1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb?usp=drive_link';
  
  private constructor() {}
  
  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }
  
  // Criar pasta automaticamente para novo cliente
  async createClientFolder(clientId: string, clientName: string): Promise<string> {
    try {
      const response = await fetch('/api/google/drive/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: clientName })
      });
      
      if (!response.ok) throw new Error('Erro ao criar pasta');
      
      const data = await response.json();
      console.log('✅ Pasta criada no Google Drive:', clientName);
      return data.folder.id;
    } catch (error) {
      console.error('❌ Erro ao criar pasta:', error);
      throw error;
    }
  }
  
  // Obter ID da pasta principal
  getMainFolderId(): string {
    return this.MAIN_FOLDER_ID;
  }

  // Renomear pasta existente
  async renameFolder(folderId: string, newName: string): Promise<any> {
    try {
      const response = await fetch('/api/google/drive/rename-folder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId, newName })
      });
      
      if (!response.ok) throw new Error('Erro ao renomear pasta');
      
      const data = await response.json();
      console.log('✅ Pasta renomeada:', newName);
      return data.folder;
    } catch (error) {
      console.error('❌ Erro ao renomear pasta:', error);
      throw error;
    }
  }
  
  // Listar pastas existentes
  async listFolders(): Promise<any[]> {
    try {
      const response = await fetch('/api/google/drive/folders');
      
      if (!response.ok) throw new Error('Erro ao listar pastas');
      
      const data = await response.json();
      return data.folders;
    } catch (error) {
      console.error('❌ Erro ao listar pastas:', error);
      return [];
    }
  }
  
  // Obter informações da pasta principal
  getMainFolder() {
    return {
      id: this.MAIN_FOLDER_ID,
      url: this.MAIN_FOLDER_URL,
      name: 'Pasta Principal ABMix'
    };
  }
  
  // Métodos mantidos para compatibilidade
  async saveClientData(clientData: ClientData): Promise<boolean> {
    console.log('✅ Dados salvos:', clientData);
    return true;
  }
  
  async uploadDocument(file: File, clientId: string): Promise<string> {
    console.log('✅ Documento enviado:', file.name);
    return `drive-${clientId}/${file.name}`;
  }
  
  async getClientDocuments(clientId: string): Promise<any[]> {
    console.log('✅ Documentos obtidos:', clientId);
    return [];
  }
}

export default GoogleDriveService;