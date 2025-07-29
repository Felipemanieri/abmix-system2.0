import { useState } from 'react';
import { FolderOpen, Settings, CheckCircle, Plus, X } from 'lucide-react';

export default function GoogleDriveSetup() {
  const [showAddDriveModal, setShowAddDriveModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    url: '',
    proprietario: '',
    linkCompartilhamento: '',
    observacao: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    setShowAddDriveModal(false);
    setFormData({
      nome: '',
      url: '',
      proprietario: '',
      linkCompartilhamento: '',
      observacao: ''
    });
  };

  const handleAddDrive = () => {
    // Aqui implementar a lógica para adicionar o drive
    console.log('Dados do novo drive:', formData);
    handleCancel();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configuração Google Drive
            </h3>
          </div>
          <button
            onClick={() => setShowAddDriveModal(true)}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Novo Drive
          </button>
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

      {/* Modal Adicionar Novo Drive */}
      {showAddDriveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header do Modal */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Adicionar Novo Drive
                  </h3>
                </div>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                {/* Nome do Drive */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Drive *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Drive Principal"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>

                {/* URL do Google Drive */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL do Google Drive *
                  </label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>

                {/* Proprietário */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Proprietário *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Felipe Manieri"
                    value={formData.proprietario}
                    onChange={(e) => handleInputChange('proprietario', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>

                {/* Link de Compartilhamento (Opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link de Compartilhamento (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Link de compartilhamento do drive"
                    value={formData.linkCompartilhamento}
                    onChange={(e) => handleInputChange('linkCompartilhamento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>

                {/* Observação (Opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observação (Opcional)
                  </label>
                  <textarea
                    placeholder="Ex: Drive para documentos principais"
                    value={formData.observacao}
                    onChange={(e) => handleInputChange('observacao', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                  />
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddDrive}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                >
                  Adicionar Drive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}