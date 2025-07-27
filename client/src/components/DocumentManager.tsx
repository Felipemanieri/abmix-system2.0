import React, { useState } from 'react';
import { FileText, Image, Download, Eye, Check, ArrowRight, Contrast as DragDropContext, Droplet as Droppable, Cable as Draggable } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  assigned?: string;
}

interface DocumentField {
  id: string;
  label: string;
  required: boolean;
  assignedDoc?: Document;
}

const DocumentManager: React.FC = () => {
  const [selectedProposal, setSelectedProposal] = useState('VEND001-PROP123');
  
  const [uploadedDocs] = useState<Document[]>([
    { id: '1', name: 'cnpj_empresa_abc.pdf', type: 'pdf', size: '2.1 MB', uploadDate: '2024-01-15' },
    { id: '2', name: 'rg_titular_joao.jpg', type: 'image', size: '1.8 MB', uploadDate: '2024-01-15' },
    { id: '3', name: 'cpf_titular_joao.pdf', type: 'pdf', size: '0.9 MB', uploadDate: '2024-01-15' },
    { id: '4', name: 'rg_dependente_maria.jpg', type: 'image', size: '2.2 MB', uploadDate: '2024-01-15' },
    { id: '5', name: 'certidao_nascimento_pedro.pdf', type: 'pdf', size: '1.5 MB', uploadDate: '2024-01-15' },
    { id: '6', name: 'carteirinha_atual.jpg', type: 'image', size: '1.2 MB', uploadDate: '2024-01-15' },
    { id: '7', name: 'comprovante_residencia.pdf', type: 'pdf', size: '0.8 MB', uploadDate: '2024-01-15' },
    { id: '8', name: 'contrato_social.pdf', type: 'pdf', size: '3.2 MB', uploadDate: '2024-01-15' },
  ]);

  const [documentFields, setDocumentFields] = useState<DocumentField[]>([
    { id: 'cnpj', label: 'CNPJ da Empresa', required: true },
    { id: 'contrato_social', label: 'Contrato Social', required: true },
    { id: 'rg_titular', label: 'RG do Titular', required: true },
    { id: 'cpf_titular', label: 'CPF do Titular', required: true },
    { id: 'rg_dependente_1', label: 'RG Dependente 1', required: false },
    { id: 'certidao_nascimento', label: 'Certidão de Nascimento', required: false },
    { id: 'carteirinha_atual', label: 'Carteirinha Plano Atual', required: true },
    { id: 'comprovante_residencia', label: 'Comprovante de Residência', required: true },
    { id: 'carta_permanencia', label: 'Carta de Permanência', required: false },
    { id: 'analitico_atual', label: 'Analítico Plano Atual', required: true },
  ]);

  const proposals = [
    { id: 'VEND001-PROP123', client: 'Empresa ABC Ltda', status: 'docs_pending' },
    { id: 'VEND001-PROP124', client: 'Tech Solutions SA', status: 'docs_ready' },
    { id: 'VEND001-PROP125', client: 'Consultoria XYZ', status: 'sent_to_financial' },
  ];

  const assignDocument = (fieldId: string, document: Document) => {
    setDocumentFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, assignedDoc: document } : field
    ));
  };

  const removeAssignment = (fieldId: string) => {
    setDocumentFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, assignedDoc: undefined } : field
    ));
  };

  const sendToFinancial = () => {
    const requiredFields = documentFields.filter(field => field.required);
    const missingDocs = requiredFields.filter(field => !field.assignedDoc);
    
    if (missingDocs.length > 0) {
      alert(`Documentos obrigatórios faltando: ${missingDocs.map(f => f.label).join(', ')}`);
      return;
    }
    
    alert('Proposta enviada para o financeiro com sucesso!');
  };

  const getDocumentIcon = (type: string) => {
    return type === 'image' ? <Image className="w-5 h-5" /> : <FileText className="w-5 h-5" />;
  };

  const selectedProposalData = proposals.find(p => p.id === selectedProposal);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Organização de Documentos</h1>
        <p className="text-teal-100">Organize os documentos enviados pelos clientes</p>
      </div>

      {/* Proposal Selector */}
      <div className="bg-white rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Selecionar Proposta</h2>
            <p className="text-sm text-gray-600">Escolha a proposta para organizar os documentos</p>
          </div>
          <select
            value={selectedProposal}
            onChange={(e) => setSelectedProposal(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {proposals.map(proposal => (
              <option key={proposal.id} value={proposal.id}>
                {proposal.client} - {proposal.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uploaded Documents */}
        <div className="bg-white rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Documentos Enviados pelo Cliente
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Arraste os documentos para os campos correspondentes
          </p>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {uploadedDocs.map((doc) => (
              <div
                key={doc.id}
                draggable
                className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100 dark:bg-gray-700 transition-colors"
              >
                <div className="text-gray-500 dark:text-white mr-3">
                  {getDocumentIcon(doc.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white">
                    {doc.size} • {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-400 dark:text-gray-500 dark:text-white hover:text-gray-600">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 dark:text-gray-500 dark:text-white hover:text-gray-600">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Fields */}
        <div className="bg-white rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Campos de Documentos
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Solte os documentos nos campos apropriados
          </p>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {documentFields.map((field) => (
              <div
                key={field.id}
                className={`p-4 border-2 border-dashed rounded-lg transition-colors ${
                  field.assignedDoc 
                    ? 'border-green-300 bg-green-50 dark:bg-green-900' 
                    : field.required 
                      ? 'border-red-300 bg-red-50 dark:bg-red-900' 
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {field.label}
                    </span>
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </div>
                  {field.assignedDoc && (
                    <button
                      onClick={() => removeAssignment(field.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <span className="text-xs">Remover</span>
                    </button>
                  )}
                </div>
                
                {field.assignedDoc ? (
                  <div className="flex items-center p-2 bg-white rounded border">
                    <div className="text-green-600 mr-2">
                      {getDocumentIcon(field.assignedDoc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {field.assignedDoc.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-white">
                        {field.assignedDoc.size}
                      </p>
                    </div>
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-white">
                      {field.required ? 'Documento obrigatório' : 'Documento opcional'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-white mt-1">
                      Arraste um documento aqui
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Status da Organização</h3>
            <p className="text-sm text-gray-600">
              {documentFields.filter(f => f.required && f.assignedDoc).length} de {documentFields.filter(f => f.required).length} documentos obrigatórios organizados
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:bg-gray-600 transition-colors">
              Salvar Progresso
            </button>
            <button
              onClick={sendToFinancial}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors"
            >
              Enviar para Financeiro
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-600 dark:bg-gray-600 rounded-full h-2">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-300" 
              style={{ 
                width: `${(documentFields.filter(f => f.required && f.assignedDoc).length / documentFields.filter(f => f.required).length) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;