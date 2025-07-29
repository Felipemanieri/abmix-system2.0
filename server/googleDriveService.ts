import { google } from 'googleapis';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private drive: any;
  private auth: any;
  private readonly BACKUP_FOLDER_ID = '1dnCgM8L4Qd9Fpkq-Xwdbd4X0-S7Mqhnu';

  constructor() {
    this.initializeAuth();
  }

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  private async initializeAuth() {
    try {
      const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
      const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

      if (!privateKey || !clientEmail) {
        console.error('❌ GoogleDriveService: Credenciais não encontradas');
        return;
      }

      this.auth = new google.auth.JWT(
        clientEmail,
        undefined,
        privateKey,
        [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file'
        ]
      );

      this.drive = google.drive({ version: 'v3', auth: this.auth });
      console.log('✅ GoogleDriveService: Autenticação configurada');
    } catch (error) {
      console.error('❌ GoogleDriveService: Erro na autenticação:', error);
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.drive) {
        await this.initializeAuth();
      }

      // Testar listando arquivos na pasta de backup
      const response = await this.drive.files.list({
        q: `'${this.BACKUP_FOLDER_ID}' in parents`,
        pageSize: 1,
        fields: 'files(id, name)'
      });

      return {
        success: true,
        message: `Conectado com sucesso. Pasta de backup acessível com ${response.data.files?.length || 0} arquivos.`
      };
    } catch (error: any) {
      console.error('❌ Erro no teste Google Drive:', error);
      return {
        success: false,
        message: `Erro na conexão: ${error?.message || 'Erro desconhecido'}`
      };
    }
  }

  async uploadBackup(filePath: string, fileName: string): Promise<{ success: boolean; fileId?: string; message: string }> {
    try {
      if (!this.drive) {
        await this.initializeAuth();
      }

      const fileMetadata = {
        name: fileName,
        parents: [this.BACKUP_FOLDER_ID]
      };

      const media = {
        mimeType: 'application/sql',
        body: createReadStream(filePath)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      });

      return {
        success: true,
        fileId: response.data.id,
        message: `Backup enviado para Google Drive: ${fileName}`
      };
    } catch (error: any) {
      console.error('❌ Erro no upload para Drive:', error);
      return {
        success: false,
        message: `Erro no upload: ${error?.message || 'Erro desconhecido'}`
      };
    }
  }

  async listBackups(): Promise<{ success: boolean; files: any[]; message: string }> {
    try {
      if (!this.drive) {
        await this.initializeAuth();
      }

      const response = await this.drive.files.list({
        q: `'${this.BACKUP_FOLDER_ID}' in parents and name contains 'backup-abmix'`,
        pageSize: 100,
        fields: 'files(id, name, size, createdTime, modifiedTime)',
        orderBy: 'createdTime desc'
      });

      return {
        success: true,
        files: response.data.files || [],
        message: `${response.data.files?.length || 0} backups encontrados no Google Drive`
      };
    } catch (error: any) {
      console.error('❌ Erro ao listar backups do Drive:', error);
      return {
        success: false,
        files: [],
        message: `Erro ao listar: ${error?.message || 'Erro desconhecido'}`
      };
    }
  }

  async downloadBackup(fileId: string, destinationPath: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.drive) {
        await this.initializeAuth();
      }

      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      await fs.writeFile(destinationPath, response.data);

      return {
        success: true,
        message: `Backup baixado do Google Drive para: ${destinationPath}`
      };
    } catch (error: any) {
      console.error('❌ Erro no download do Drive:', error);
      return {
        success: false,
        message: `Erro no download: ${error?.message || 'Erro desconhecido'}`
      };
    }
  }

  async deleteBackup(fileId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.drive) {
        await this.initializeAuth();
      }

      await this.drive.files.delete({
        fileId: fileId
      });

      return {
        success: true,
        message: 'Backup removido do Google Drive'
      };
    } catch (error: any) {
      console.error('❌ Erro ao deletar do Drive:', error);
      return {
        success: false,
        message: `Erro ao deletar: ${error?.message || 'Erro desconhecido'}`
      };
    }
  }
}

export const googleDriveService = GoogleDriveService.getInstance();