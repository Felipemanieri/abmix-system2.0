import { useState } from 'react';
import { Pencil, Check, X, Folder, ExternalLink } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FolderNameEditorProps {
  proposalId: string;
  currentFolderName: string;
  driveFolder?: string;
  canEdit?: boolean; // Permite ou não edição (baseado no portal)
  className?: string;
}

export default function FolderNameEditor({ 
  proposalId, 
  currentFolderName, 
  driveFolder,
  canEdit = true,
  className = ""
}: FolderNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newFolderName, setNewFolderName] = useState(currentFolderName);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // MUTAÇÃO PARA ATUALIZAR NOME DA PASTA
  const updateFolderNameMutation = useMutation({
    mutationFn: async ({ proposalId, folderName }: { proposalId: string, folderName: string }) => {
      return await apiRequest(`/api/proposals/${proposalId}/folder-name`, {
        method: 'PATCH',
        body: JSON.stringify({ folderName }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      // INVALIDAR CACHE PARA ATUALIZAÇÃO EM TEMPO REAL
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
      queryClient.invalidateQueries({ queryKey: [`/api/proposals/${proposalId}`] });
      
      toast({
        title: "✅ Nome da pasta atualizado",
        description: `Pasta renomeada para: "${data.folderName}"`,
        variant: "default",
      });
      
      setIsEditing(false);
      console.log("📁 Pasta renomeada com sucesso:", data);
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao renomear pasta",
        description: "Não foi possível atualizar o nome da pasta",
        variant: "destructive",
      });
      console.error("Erro ao renomear pasta:", error);
      setNewFolderName(currentFolderName); // Reverter para nome original
    }
  });

  const handleSave = () => {
    if (newFolderName.trim() === '') {
      toast({
        title: "⚠️ Nome da pasta obrigatório",
        description: "O nome da pasta não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    if (newFolderName.trim() === currentFolderName) {
      setIsEditing(false);
      return;
    }

    updateFolderNameMutation.mutate({
      proposalId,
      folderName: newFolderName.trim()
    });
  };

  const handleCancel = () => {
    setNewFolderName(currentFolderName);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!canEdit) {
    // MODO SOMENTE LEITURA (para portais sem permissão)
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Folder className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {currentFolderName || 'Nome não definido'}
        </span>
        {driveFolder && driveFolder !== 'Pasta não criada' && (
          <a 
            href={driveFolder} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isEditing ? (
        // MODO DE EDIÇÃO
        <>
          <Folder className="h-4 w-4 text-blue-500" />
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 
                       rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nome da pasta..."
            autoFocus
            disabled={updateFolderNameMutation.isPending}
          />
          <button
            onClick={handleSave}
            disabled={updateFolderNameMutation.isPending}
            className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title="Salvar nome da pasta"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={handleCancel}
            disabled={updateFolderNameMutation.isPending}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title="Cancelar edição"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        // MODO DE VISUALIZAÇÃO COM EDIÇÃO
        <>
          <Folder className="h-4 w-4 text-gray-500" />
          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
            {currentFolderName || 'Nome não definido'}
          </span>
          {driveFolder && driveFolder !== 'Pasta não criada' && (
            <a 
              href={driveFolder} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400"
              title="Abrir pasta no Google Drive"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Editar nome da pasta"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}