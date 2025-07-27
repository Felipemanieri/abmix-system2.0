import React, { useState } from 'react';
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

export default function AttachmentManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Dados simulados para evitar problemas de API
  const mockAttachments: Attachment[] = [
    {
      id: 1,
      proposalId: 'PROP-001',
      filename: 'documento_empresa_abc.pdf',
      originalName: 'Contrato Social - Empresa ABC.pdf',
      fileType: 'application/pdf',
      fileSize: 2048576,
      category: 'documentos_empresa',
      status: 'approved',
      driveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      driveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
      uploadedBy: 'cliente@empresa.com',
      uploadedAt: '2025-01-25T14:30:00.000Z',
      approvedBy: 'implementacao@abmix.com.br',
      approvedAt: '2025-01-25T15:15:00.000Z'
    },
    {
      id: 2,
      proposalId: 'PROP-002',
      filename: 'rg_titular_xyz.jpg',
      originalName: 'RG - João Silva.jpg',
      fileType: 'image/jpeg',
      fileSize: 1536000,
      category: 'documentos_pessoais',
      status: 'pending',
      uploadedBy: 'cliente2@empresa.com',
      uploadedAt: '2025-01-25T16:45:00.000Z'
    },
    {
      id: 3,
      proposalId: 'PROP-003',
      filename: 'planilha_funcionarios.xlsx',
      originalName: 'Lista de Funcionários.xlsx',
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileSize: 512000,
      category: 'planilhas',
      status: 'rejected',
      uploadedBy: 'rh@empresa.com',
      uploadedAt: '2025-01-25T11:20:00.000Z',
      approvedBy: 'financeiro@abmix.com.br',
      approvedAt: '2025-01-25T12:10:00.000Z'
    }
  ];

  const [attachments] = useState<Attachment[]>(mockAttachments);

  const filteredAttachments = attachments.filter(attachment => {
    const matchesSearch = attachment.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attachment.proposalId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || attachment.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || attachment.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleApprove = (attachmentId: number) => {
    alert(`Anexo ${attachmentId} aprovado com sucesso!`);
  };

  const handleReject = (attachmentId: number) => {
    if (window.confirm('Tem certeza que deseja rejeitar este anexo?')) {
      alert(`Anexo ${attachmentId} rejeitado.`);
    }
  };

  const handleDownload = (attachment: Attachment) => {
    alert(`Iniciando download: ${attachment.originalName}`);
  };

  const handleViewInDrive = (attachment: Attachment) => {
    if (attachment.driveUrl) {
      window.open(attachment.driveUrl, '_blank');
    } else {
      alert('Link do Google Drive não disponível');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Paperclip className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciar Anexos</h3>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar anexos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todas as Categorias</option>
            <option value="documentos_empresa">Documentos da Empresa</option>
            <option value="documentos_pessoais">Documentos Pessoais</option>
            <option value="planilhas">Planilhas</option>
            <option value="comprovantes">Comprovantes</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
          </select>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{attachments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendentes</p>
                <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">{attachments.filter(a => a.status === 'pending').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Aprovados</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">{attachments.filter(a => a.status === 'approved').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Rejeitados</p>
                <p className="text-lg font-bold text-red-900 dark:text-red-100">{attachments.filter(a => a.status === 'rejected').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Anexos */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">Arquivo</th>
                <th className="px-6 py-3">Proposta</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Tamanho</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Enviado por</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttachments.map((attachment) => (
                <tr key={attachment.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-gray-500 dark:text-gray-400 mr-3">
                        {getFileIcon(attachment.fileType)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{attachment.originalName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{attachment.fileType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-300">
                    {attachment.proposalId}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {attachment.category.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {formatFileSize(attachment.fileSize)}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(attachment.status)}`}>
                      {getStatusIcon(attachment.status)}
                      <span className="ml-1 capitalize">{attachment.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {attachment.uploadedBy}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownload(attachment)}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {attachment.driveUrl && (
                        <button
                          onClick={() => handleViewInDrive(attachment)}
                          className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                          title="Ver no Drive"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      {attachment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(attachment.id)}
                            className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                            title="Aprovar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(attachment.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            title="Rejeitar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttachments.length === 0 && (
          <div className="text-center py-8">
            <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum anexo encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}