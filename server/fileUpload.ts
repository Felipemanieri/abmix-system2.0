import multer from 'multer';
import path from 'path';
import fs from 'fs';

// SISTEMA HÍBRIDO: Local + Drive (Fase de Construção)
// Arquivos pequenos ficam locais, grandes vão direto para Drive
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

// CONFIGURAÇÃO HÍBRIDA: Limites flexíveis para fase de construção
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limite (generoso para testes)
  }
});

// ESTRATÉGIA HÍBRIDA: Definir quando usar local vs Drive
export const shouldUseLocalStorage = (fileSize: number): boolean => {
  const SMALL_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB
  return fileSize <= SMALL_FILE_THRESHOLD;
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

// GERENCIAMENTO HÍBRIDO DE ARMAZENAMENTO
export class HybridStorageManager {
  static SMALL_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB
  
  // Decidir onde armazenar o arquivo
  static shouldUseLocalStorage(fileSize: number): boolean {
    return fileSize <= this.SMALL_FILE_THRESHOLD;
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