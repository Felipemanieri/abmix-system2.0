import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

async function testBackupToDrive() {
  try {
    console.log('🔄 Testando backup para Google Drive...');
    
    // Configurar autenticação
    const auth = new GoogleAuth({
      credentials: {
        type: 'service_account',
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // ID da pasta que você especificou
    const targetFolderId = '1dnCgM8L4Qd9Fpkq-Xwdbd4X0-S7Mqhnu';
    
    // Criar arquivo de backup de teste
    const backupData = {
      sistema: 'Abmix System',
      timestamp: new Date().toISOString(),
      dados: {
        usuarios: 21,
        propostas: 1,
        tabelas: ['drive_configs', 'attachments', 'proposals', 'vendors']
      }
    };
    
    const fileName = `backup-teste-${Date.now()}.json`;
    
    // Upload para o Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [targetFolderId]
      },
      media: {
        mimeType: 'application/json',
        body: JSON.stringify(backupData, null, 2)
      }
    });
    
    console.log('✅ Backup enviado com sucesso!');
    console.log('📄 Arquivo:', fileName);
    console.log('🆔 ID:', response.data.id);
    console.log('🔗 Link:', `https://drive.google.com/file/d/${response.data.id}/view`);
    
    return {
      success: true,
      fileId: response.data.id,
      fileName: fileName,
      link: `https://drive.google.com/file/d/${response.data.id}/view`
    };
    
  } catch (error) {
    console.error('❌ Erro no backup:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

testBackupToDrive().then(result => {
  console.log('📊 Resultado final:', result);
  process.exit(result.success ? 0 : 1);
});