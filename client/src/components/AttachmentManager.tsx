import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Paperclip, 
  Download, 
  Trash2, 
  Eye,
  Upload,
  FileText,
  Image,
  File,
  Search,
  Filter,
  Plus,
  HardDrive,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  FolderOpen,
  Database,
  Cloud
} from 'lucide-react';

interface Attachment {
  id: number;
  proposalId: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  driveFileId?: string;
  driveUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

interface DriveConfig {
  id: string;
  name: string;
  email: string;
  folderId: string;
  isActive: boolean;
  createdAt: string;
}

export default function AttachmentManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProposal, setSelectedProposal] = useState('all');
  const [selectedDrive, setSelectedDrive] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [newDrive, setNewDrive] = useState({ name: '', email: '', folderId: '' });
  
  const queryClient = useQueryClient();

  // Fetch attachments
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['/api/attachments'],
    queryFn: async () => {
      const response = await fetch('/api/attachments');
      if (!response.ok) throw new Error('Failed to fetch attachments');
      return response.json();
    },
    refetchInterval: false // DESABILITADO - causando unhandled rejections
  });

  // Fetch proposals for filter
  const { data: proposals = [] } = useQuery({
    queryKey: ['/api/proposals'],
    queryFn: async () => {
      const response = await fetch('/api/proposals');
      if (!response.ok) throw new Error('Failed to fetch proposals');
      return response.json();
    }
  });

  // Fetch drive configurations
  const { data: drives = [] } = useQuery({
    queryKey: ['/api/drives'],
    queryFn: async () => {
      const response = await fetch('/api/drives');
      if (!response.ok) throw new Error('Failed to fetch drives');
      return response.json();
    }
  });

  // Filter attachments
  const filteredAttachments = attachments.filter((attachment: Attachment) => {
    const matchesSearch = attachment.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attachment.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || attachment.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || attachment.status === selectedStatus;
    const matchesProposal = selectedProposal === 'all' || attachment.proposalId === selectedProposal;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesProposal;
  });

  // Statistics
  const stats = {
    total: attachments.length,
    pending: attachments.filter((a: Attachment) => a.status === 'pending').length,
    approved: attachments.filter((a: Attachment) => a.status === 'approved').length,
    rejected: attachments.filter((a: Attachment) => a.status === 'rejected').length,
    totalSize: attachments.reduce((sum: number, a: Attachment) => sum + a.fileSize, 0)
  };

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/attachments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attachments'] });
    }
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/attachments/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete attachment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attachments'] });
    }
  });

  const addDriveMutation = useMutation({
    mutationFn: async (driveData: any) => {
      const response = await fetch('/api/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driveData)
      });
      if (!response.ok) throw new Error('Failed to add drive');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drives'] });
      setShowDriveModal(false);
      setNewDrive({ name: '', email: '', folderId: '' });
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Paperclip className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Gerenciamento de Anexos</h3>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDriveModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <HardDrive className="w-4 h-4 mr-2" />
              Configurar Drives
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Arquivo
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Database className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Aprovados</p>
                <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Rejeitados</p>
                <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Tamanho Total</p>
                <p className="text-lg font-bold text-blue-900">{formatFileSize(stats.totalSize)}</p>
              </div>
              <Cloud className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar arquivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas as categorias</option>
            <option value="document">Documentos</option>
            <option value="image">Imagens</option>
            <option value="contract">Contratos</option>
            <option value="identification">Identificação</option>
            <option value="proof">Comprovantes</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
          </select>
          <select
            value={selectedProposal}
            onChange={(e) => setSelectedProposal(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas as propostas</option>
            {proposals.map((proposal: any) => (
              <option key={proposal.id} value={proposal.id}>
                {proposal.contractData?.nomeEmpresa || `Proposta ${proposal.id}`}
              </option>
            ))}
          </select>
          <select
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos os drives</option>
            {drives.map((drive: DriveConfig) => (
              <option key={drive.id} value={drive.id}>
                {drive.name} ({drive.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attachments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arquivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proposta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamanho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enviado por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <span className="ml-2 text-gray-600">Carregando anexos...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAttachments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    Nenhum anexo encontrado
                  </td>
                </tr>
              ) : (
                filteredAttachments.map((attachment: Attachment) => (
                  <tr key={attachment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(attachment.fileType)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {attachment.originalName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attachment.fileType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {proposals.find((p: any) => p.id === attachment.proposalId)?.contractData?.nomeEmpresa || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {attachment.proposalId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {attachment.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(attachment.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(attachment.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(attachment.status)}`}>
                          {attachment.status === 'pending' ? 'Pendente' : 
                           attachment.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attachment.uploadedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {attachment.driveUrl && (
                          <button
                            onClick={() => window.open(attachment.driveUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Abrir no Google Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => window.open(`/api/attachments/${attachment.id}/download`, '_blank')}
                          className="text-green-600 hover:text-green-900"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {attachment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: attachment.id, status: 'approved' })}
                              className="text-green-600 hover:text-green-900"
                              title="Aprovar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: attachment.id, status: 'rejected' })}
                              className="text-red-600 hover:text-red-900"
                              title="Rejeitar"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteAttachmentMutation.mutate(attachment.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drive Configuration Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Configurar Google Drives</h3>
              <button
                onClick={() => setShowDriveModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Current Drives */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Drives Configurados</h4>
              <div className="space-y-3">
                {drives.map((drive: DriveConfig) => (
                  <div key={drive.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <HardDrive className="w-5 h-5 text-blue-500 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{drive.name}</div>
                        <div className="text-sm text-gray-500">{drive.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        drive.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {drive.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                      <button
                        onClick={() => window.open(`https://drive.google.com/drive/folders/${drive.folderId}`, '_blank')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Drive */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Adicionar Novo Drive</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Drive</label>
                  <input
                    type="text"
                    value={newDrive.name}
                    onChange={(e) => setNewDrive({ ...newDrive, name: e.target.value })}
                    placeholder="Ex: Drive Principal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email do Google</label>
                  <input
                    type="email"
                    value={newDrive.email}
                    onChange={(e) => setNewDrive({ ...newDrive, email: e.target.value })}
                    placeholder="email@gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID da Pasta (Google Drive)</label>
                  <input
                    type="text"
                    value={newDrive.folderId}
                    onChange={(e) => setNewDrive({ ...newDrive, folderId: e.target.value })}
                    placeholder="1FAIpQLScQKE8BjIZJ-abmix-proposals"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDriveModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => addDriveMutation.mutate(newDrive)}
                    disabled={!newDrive.name || !newDrive.email || !newDrive.folderId}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Adicionar Drive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}