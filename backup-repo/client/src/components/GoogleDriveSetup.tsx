import { FolderOpen, Settings, CheckCircle } from 'lucide-react';

export default function GoogleDriveSetup() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuração Google Drive
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">247</div>
            <div className="text-sm text-blue-500 dark:text-blue-400">Pastas</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">1,834</div>
            <div className="text-sm text-green-500 dark:text-green-400">Documentos</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">8.2 GB</div>
            <div className="text-sm text-purple-500 dark:text-purple-400">Espaço Usado</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Status da Conexão</span>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">Conectado</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Pasta Principal</span>
            <span className="text-sm text-gray-900 dark:text-white">Sistema Abmix</span>
          </div>
        </div>
      </div>
    </div>
  );
}