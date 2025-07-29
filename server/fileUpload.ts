import multer from 'multer';
import path from 'path';
import fs from 'fs';

// SISTEMA OTIMIZADO: APENAS DRIVE SEM LIMITAÇÕES
// Armazenamento temporário em memória para envio direto ao Drive
const storage = multer.memoryStorage();

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

// CONFIGURAÇÃO OTIMIZADA: SEM LIMITAÇÕES DE TAMANHO
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB limite (bem generoso)
  }
});

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

// Função para formatar tamanho do arquivo
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}