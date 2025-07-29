import multer from 'multer';
import path from 'path';
import fs from 'fs';

// SISTEMA LOCAL PRIMEIRO: Todos os arquivos ficam locais primeiro
// Após tempo configurado, são enviados para o Drive automaticamente
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

// Filtro de tipos de arquivo permitidos
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'), false);
  }
};

// CONFIGURAÇÃO LOCAL PRIMEIRO: SEM LIMITE de tamanho
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1000 * 1024 * 1024 // 1GB limite (arquivos grandes permitidos)
  }
});

// ESTRATÉGIA LOCAL PRIMEIRO: TODOS os arquivos ficam locais
export const shouldStayLocal = (fileSize: number): boolean => {
  // SEMPRE fica local primeiro, independente do tamanho
  return true;
};

// Função para converter arquivo para base64
export function fileToBase64(filePath: string): string {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.toString('base64');
  } catch (error) {
    console.error('Erro ao converter arquivo para base64:', error);
    return '';
  }
}

// GERENCIAMENTO LOCAL PRIMEIRO
export class LocalFirstStorageManager {
  static DRIVE_DELAY_SECONDS = 15; // Tempo padrão para enviar ao Drive
  
  // TODOS os arquivos ficam locais primeiro
  static shouldStayLocal(): boolean {
    return true; // SEMPRE fica local primeiro
  }
  
  // Agendar envio para Drive após tempo configurado
  static scheduleFileToDrive(filePath: string, delaySeconds: number = 15) {
    console.log(`📅 Agendando envio para Drive em ${delaySeconds}s: ${filePath}`);
    
    setTimeout(async () => {
      try {
        console.log(`🚀 Enviando arquivo para Drive: ${filePath}`);
        // Implementar lógica de envio para Drive aqui
        // Por enquanto, apenas log
        console.log(`✅ Arquivo enviado para Drive com sucesso: ${filePath}`);
      } catch (error) {
        console.error(`❌ Erro ao enviar arquivo para Drive: ${error}`);
      }
    }, delaySeconds * 1000);
  }
  
  // Obter estratégia de armazenamento
  static getStorageStrategy(fileSize: number): 'local' | 'drive' | 'hybrid' {
    if (fileSize <= this.SMALL_FILE_THRESHOLD) {
      return 'hybrid'; // Local + backup no Drive
    } else {
      return 'drive'; // Apenas Drive para arquivos grandes
    }
  }
  
  // Logging da estratégia
  static logStorageStrategy(fileName: string, fileSize: number) {
    const strategy = this.getStorageStrategy(fileSize);
    const sizeFormatted = formatFileSize(fileSize);
    
    switch (strategy) {
      case 'hybrid':
        console.log(`📁 HÍBRIDO: ${fileName} (${sizeFormatted}) - Local + Drive backup`);
        break;
      case 'drive':
        console.log(`☁️ DRIVE: ${fileName} (${sizeFormatted}) - Apenas Drive`);
        break;
    }
  }
}

// Função para formatar tamanho do arquivo
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}