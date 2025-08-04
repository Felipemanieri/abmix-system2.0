import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building, FileText, DollarSign, Check, Copy, Plus, Trash2, Upload, Camera, User, Eye, EyeOff, Settings, Save, Send, Users, Phone, Mail, MapPin, Calendar, Calculator, CheckCircle, Download, Info, Edit, History, RefreshCw, X } from 'lucide-react';
import { showNotification } from '../utils/notifications';

interface ProposalEditorProps {
  proposalId: string;
  onBack: () => void;
  onSave: (data: any) => void;
  user: any;
}

interface ContractData {
  nomeEmpresa: string;
  cnpj: string;
  planoContratado: string;
  valor: string;
  periodoVigencia: {
    inicio: string;
    fim: string;
  };
  odontoConjugado: boolean;
  compulsorio: boolean;
  livreAdesao: boolean;
  inicioVigencia: string;
  periodoMinimo: string;
  aproveitamentoCongenere: boolean;
}

interface PersonData {
  id: string;
  nomeCompleto: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  parentesco?: string;
  nomeMae: string;
  sexo: 'masculino' | 'feminino' | '';
  estadoCivil: string;
  peso: string;
  altura: string;
  emailPessoal: string;
  telefonePessoal: string;
  emailEmpresa: string;
  telefoneEmpresa: string;
  cep: string;
  enderecoCompleto: string;
  dadosReembolso: string;
}

interface InternalData {
  reuniao: boolean;
  nomeReuniao: string;
  vendaDupla: boolean;
  nomeVendaDupla: string;
  desconto: string;
  origemVenda: string;
  autorizadorDesconto: string;
  observacoesFinanceiras: string;
  observacoesCliente: string;
}

interface AttachmentData {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  category: 'vendor' | 'client';
  url?: string;
}

interface ChangeLog {
  id: string;
  timestamp: Date;
  user: string;
  field: string;
  oldValue: string;
  newValue: string;
  section: string;
}

const ProposalEditor: React.FC<ProposalEditorProps> = ({ proposalId, onBack, onSave, user }) => {
  const [contractData, setContractData] = useState<ContractData>({
    nomeEmpresa: 'Tech Solutions Ltda',
    cnpj: '12.345.678/0001-90',
    planoContratado: 'Plano Empresarial Premium',
    valor: 'R$ 1.250,00',
    periodoVigencia: { inicio: '2024-02-01', fim: '2025-01-31' },
    odontoConjugado: true,
    compulsorio: false,
    livreAdesao: true,
    inicioVigencia: '2024-02-01',
    periodoMinimo: '12 meses',
    aproveitamentoCongenere: true,
  });

  const [titulares, setTitulares] = useState<PersonData[]>([{
    id: '1',
    nomeCompleto: 'João Silva Santos',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    dataNascimento: '1985-05-15',
    nomeMae: 'Maria Silva Santos',
    sexo: 'masculino',
    estadoCivil: 'Casado',
    peso: '75',
    altura: '1.75',
    emailPessoal: 'joao@gmail.com',
    telefonePessoal: '(11) 99999-1234',
    emailEmpresa: 'joao@techsolutions.com',
    telefoneEmpresa: '(11) 3333-5555',
    cep: '01234-567',
    enderecoCompleto: 'Rua das Flores, 123, Apto 45, Centro, São Paulo - SP',
    dadosReembolso: 'Banco Itaú, Ag: 1234, CC: 56789-0'
  }]);

  const [dependentes, setDependentes] = useState<PersonData[]>([{
    id: '1',
    nomeCompleto: 'Ana Santos Silva',
    cpf: '987.654.321-00',
    rg: '98.765.432-1',
    dataNascimento: '1990-08-20',
    parentesco: 'Cônjuge',
    nomeMae: 'Rita Santos Silva',
    sexo: 'feminino',
    estadoCivil: 'Casada',
    peso: '60',
    altura: '1.65',
    emailPessoal: 'ana@gmail.com',
    telefonePessoal: '(11) 99999-5678',
    emailEmpresa: '',
    telefoneEmpresa: '',
    cep: '01234-567',
    enderecoCompleto: 'Rua das Flores, 123, Apto 45, Centro, São Paulo - SP',
    dadosReembolso: ''
  }]);

  const [internalData, setInternalData] = useState<InternalData>({
    reuniao: true,
    nomeReuniao: 'Reunião de fechamento - Carlos Vendedor',
    vendaDupla: false,
    nomeVendaDupla: '',
    desconto: '5%',
    origemVenda: 'Base Abmix',
    autorizadorDesconto: 'Gerente Regional',
    observacoesFinanceiras: 'Cliente com bom histórico de pagamento. Desconto autorizado.',
    observacoesCliente: 'Enviar todos os documentos digitalizados em boa qualidade.'
  });

  const [attachments, setAttachments] = useState<AttachmentData[]>([
    {
      id: '1',
      name: 'contrato-social.pdf',
      type: 'PDF',
      size: '2.3 MB',
      uploadDate: '2024-01-15',
      uploadedBy: 'Carlos Vendedor',
      category: 'vendor',
      url: '#'
    },
    {
      id: '2',
      name: 'cpf-titular.pdf',
      type: 'PDF',
      size: '850 KB',
      uploadDate: '2024-01-16',
      uploadedBy: 'João Silva Santos',
      category: 'client',
      url: '#'
    },
    {
      id: '3',
      name: 'rg-dependente.jpg',
      type: 'JPG',
      size: '1.2 MB',
      uploadDate: '2024-01-16',
      uploadedBy: 'Ana Santos Silva',
      category: 'client',
      url: '#'
    }
  ]);

  const [changeLog, setChangeLog] = useState<ChangeLog[]>([
    {
      id: '1',
      timestamp: new Date('2024-01-15T10:30:00'),
      user: 'Carlos Vendedor',
      field: 'Valor do Plano',
      oldValue: 'R$ 1.500,00',
      newValue: 'R$ 1.250,00',
      section: 'Dados do Contrato'
    },
    {
      id: '2',
      timestamp: new Date('2024-01-16T14:20:00'),
      user: 'Ana Implantação',
      field: 'CPF Dependente',
      oldValue: '000.000.000-00',
      newValue: '987.654.321-00',
      section: 'Dados Pessoais'
    }
  ]);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Simular carregamento inicial dos dados da proposta
  useEffect(() => {
    setIsLoading(true);
    // Simular carregamento dos dados do Google Sheets
    setTimeout(() => {
      setIsLoading(false);
      // Dados carregados silenciosamente - sem notificação
    }, 1500);
  }, [proposalId]);

  const handleFieldEdit = (fieldName: string, value: any, section: string) => {
    // Registrar mudança no log
    const newChange: ChangeLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      user: user.name,
      field: fieldName,
      oldValue: 'Valor anterior',
      newValue: value,
      section: section
    };
    setChangeLog(prev => [newChange, ...prev]);

    // Simular atualização no Google Sheets
    showNotification(`Campo "${fieldName}" atualizado no Google Sheets`, 'success');
    setEditingField(null);
  };

  const handleSyncGoogleSheets = async () => {
    setIsSyncing(true);
    try {
      // Criar objeto com todos os dados da proposta para sincronização
      const proposalData = {
        id: proposalId,
        contractData,
        titulares,
        dependentes,
        internalData,
        attachments
      };

      // Fazer requisição para API de sincronização
      const response = await fetch('/api/google/sheets/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalData }),
      });

      if (response.ok) {
        showNotification('Dados sincronizados com Google Sheets com sucesso!', 'success');
      } else {
        throw new Error('Falha na sincronização');
      }
    } catch (error) {
      showNotification('Erro ao sincronizar com Google Sheets', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = (files: FileList | null, category: 'vendor' | 'client') => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const newAttachment: AttachmentData = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: user.name,
        category: category,
        url: URL.createObjectURL(file)
      };

      setAttachments(prev => [...prev, newAttachment]);
      
      // Registrar no log
      const newChange: ChangeLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        user: user.name,
        field: 'Novo Anexo',
        oldValue: '',
        newValue: file.name,
        section: 'Documentos'
      };
      setChangeLog(prev => [newChange, ...prev]);

      showNotification(`Arquivo "${file.name}" enviado para o Google Drive`, 'success');
    });
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    const attachment = attachments.find(a => a.id === attachmentId);
    if (!attachment) return;

    if (confirm(`Tem certeza que deseja excluir "${attachment.name}"?`)) {
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      
      // Registrar no log
      const newChange: ChangeLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        user: user.name,
        field: 'Anexo Removido',
        oldValue: attachment.name,
        newValue: '',
        section: 'Documentos'
      };
      setChangeLog(prev => [newChange, ...prev]);

      showNotification(`Arquivo "${attachment.name}" removido do Google Drive`, 'success');
    }
  };

  const renderEditableField = (label: string, value: string, fieldName: string, section: string, type: 'text' | 'email' | 'tel' | 'date' = 'text') => {
    const isEditing = editingField === fieldName;

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <div className="flex-1 flex items-center space-x-2">
              {label === 'Autorizador do Desconto' ? (
                <select
                  defaultValue={value}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onBlur={(e) => handleFieldEdit(label, e.target.value, section)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFieldEdit(label, e.currentTarget.value, section);
                    }
                    if (e.key === 'Escape') {
                      setEditingField(null);
                    }
                  }}
                  autoFocus
                >
                  <option value="">Selecione o autorizador</option>
                  <option value="Michelle Manieri">Michelle Manieri</option>
                  <option value="Carol Almeida">Carol Almeida</option>
                  <option value="Rod Ribas">Rod Ribas</option>
                </select>
              ) : (
                <input
                  type={type}
                  defaultValue={value}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onBlur={(e) => handleFieldEdit(label, e.target.value, section)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFieldEdit(label, e.currentTarget.value, section);
                    }
                    if (e.key === 'Escape') {
                      setEditingField(null);
                    }
                  }}
                  autoFocus
                />
              )}
              <button
                onClick={() => setEditingField(null)}
                className="p-1 text-gray-400 dark:text-gray-500 dark:text-white hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center space-x-2">
              <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                {value || 'Não informado'}
              </span>
              <button
                onClick={() => setEditingField(fieldName)}
                className="p-1 text-blue-600 hover:text-blue-800"
                title="Editar campo"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPersonForm = (person: PersonData, type: 'titular' | 'dependente', index: number) => (
    <div key={person.id} className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          {type === 'titular' ? `Titular ${index + 1}` : `Dependente ${index + 1}`}
        </h3>
        {((type === 'titular' && titulares.length > 1) || (type === 'dependente' && dependentes.length > 0)) && (
          <button
            onClick={() => {
              if (type === 'titular') {
                setTitulares(prev => prev.filter((_, i) => i !== index));
              } else {
                setDependentes(prev => prev.filter((_, i) => i !== index));
              }
            }}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderEditableField('Nome Completo', person.nomeCompleto, `${type}-${index}-nome`, 'Dados Pessoais')}
        {renderEditableField('CPF', person.cpf, `${type}-${index}-cpf`, 'Dados Pessoais')}
        {renderEditableField('RG', person.rg, `${type}-${index}-rg`, 'Dados Pessoais')}
        {renderEditableField('Data de Nascimento', person.dataNascimento, `${type}-${index}-nascimento`, 'Dados Pessoais', 'date')}
        {type === 'dependente' && renderEditableField('Parentesco', person.parentesco || '', `${type}-${index}-parentesco`, 'Dados Pessoais')}
        {renderEditableField('Nome da Mãe', person.nomeMae, `${type}-${index}-mae`, 'Dados Pessoais')}
        {renderEditableField('Email Pessoal', person.emailPessoal, `${type}-${index}-email-pessoal`, 'Contato', 'email')}
        {renderEditableField('Telefone Pessoal', person.telefonePessoal, `${type}-${index}-tel-pessoal`, 'Contato', 'tel')}
        {renderEditableField('CEP', person.cep, `${type}-${index}-cep`, 'Endereço')}
        {renderEditableField('Endereço Completo', person.enderecoCompleto, `${type}-${index}-endereco`, 'Endereço')}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados da proposta {proposalId}...</p>
          <p className="text-sm text-gray-500 dark:text-white mt-2">Sincronizando com Google Sheets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm dark:shadow-gray-900/30 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                Editor de Proposta {proposal?.abmId || `ABM${proposalId?.slice(-3) || '000'}`}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSyncGoogleSheets}
                disabled={isSyncing}
                className={`flex items-center px-4 py-2 text-sm text-white rounded-md transition-colors ${
                  isSyncing 
                    ? 'bg-green-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Google Sheets'}
              </button>
              <button
                onClick={() => onSave({ contractData, titulares, dependentes, internalData, attachments })}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Dados do Contrato */}
            <div className="bg-white rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Building className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Dados do Contrato</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderEditableField('Nome da Empresa', contractData.nomeEmpresa, 'empresa', 'Dados do Contrato')}
                {renderEditableField('CNPJ', contractData.cnpj, 'cnpj', 'Dados do Contrato')}
                {renderEditableField('Plano Contratado', contractData.planoContratado, 'plano', 'Dados do Contrato')}
                {renderEditableField('Valor', contractData.valor, 'valor', 'Dados do Contrato')}
                {renderEditableField('Início da Vigência', contractData.inicioVigencia, 'inicio-vigencia', 'Dados do Contrato', 'date')}
                {renderEditableField('Período Mínimo', contractData.periodoMinimo, 'periodo-minimo', 'Dados do Contrato')}
              </div>
            </div>

            {/* Dados dos Titulares */}
            <div className="bg-white rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Users className="w-6 h-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Titulares ({titulares.length})</h2>
                </div>
                <button
                  onClick={() => {
                    const newTitular: PersonData = {
                      id: Date.now().toString(),
                      nomeCompleto: '',
                      cpf: '',
                      rg: '',
                      dataNascimento: '',
                      nomeMae: '',
                      sexo: '',
                      estadoCivil: '',
                      peso: '',
                      altura: '',
                      emailPessoal: '',
                      telefonePessoal: '',
                      emailEmpresa: '',
                      telefoneEmpresa: '',
                      cep: '',
                      enderecoCompleto: '',
                      dadosReembolso: ''
                    };
                    setTitulares(prev => [...prev, newTitular]);
                  }}
                  className="flex items-center px-3 py-2 text-sm bg-green-600 text-white dark:bg-green-50 dark:bg-green-9000 dark:text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Titular
                </button>
              </div>
              <div className="space-y-6">
                {titulares.map((titular, index) => renderPersonForm(titular, 'titular', index))}
              </div>
            </div>

            {/* Dados dos Dependentes */}
            <div className="bg-white rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <User className="w-6 h-6 text-purple-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Dependentes ({dependentes.length})</h2>
                </div>
                <button
                  onClick={() => {
                    const newDependente: PersonData = {
                      id: Date.now().toString(),
                      nomeCompleto: '',
                      cpf: '',
                      rg: '',
                      dataNascimento: '',
                      parentesco: '',
                      nomeMae: '',
                      sexo: '',
                      estadoCivil: '',
                      peso: '',
                      altura: '',
                      emailPessoal: '',
                      telefonePessoal: '',
                      emailEmpresa: '',
                      telefoneEmpresa: '',
                      cep: '',
                      enderecoCompleto: '',
                      dadosReembolso: ''
                    };
                    setDependentes(prev => [...prev, newDependente]);
                  }}
                  className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white dark:bg-purple-50 dark:bg-purple-9000 dark:text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Dependente
                </button>
              </div>
              {dependentes.length > 0 ? (
                <div className="space-y-6">
                  {dependentes.map((dependente, index) => renderPersonForm(dependente, 'dependente', index))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-white">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum dependente adicionado</p>
                </div>
              )}
            </div>

            {/* Controle Interno */}
            <div className="bg-white rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Settings className="w-6 h-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Controle Interno</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderEditableField('Desconto Aplicado', internalData.desconto, 'desconto', 'Controle Interno')}
                {renderEditableField('Origem da Venda', internalData.origemVenda, 'origem-venda', 'Controle Interno')}
                {renderEditableField('Autorizador do Desconto', internalData.autorizadorDesconto, 'autorizador', 'Controle Interno')}
                {renderEditableField('Observações Financeiras', internalData.observacoesFinanceiras, 'obs-financeiras', 'Controle Interno')}
                {renderEditableField('Observações para o Cliente', internalData.observacoesCliente, 'obs-cliente', 'Controle Interno')}
              </div>
            </div>

            {/* Anexos */}
            <div className="bg-white rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 text-indigo-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Documentos Anexados ({attachments.length})</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, 'vendor')}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Adicionar Arquivos
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 dark:text-white" />
                          <span className="text-sm font-medium text-gray-900 truncate">{attachment.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-white space-y-1">
                          <div>{attachment.type} • {attachment.size}</div>
                          <div>Por: {attachment.uploadedBy}</div>
                          <div>{attachment.uploadDate}</div>
                          <div className={`inline-flex px-2 py-1 rounded-full text-xs ${
                            attachment.category === 'vendor' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          }`}>
                            {attachment.category === 'vendor' ? 'Vendedor' : 'Cliente'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => attachment.url && window.open(attachment.url, '_blank')}
                          className="p-1 text-gray-400 dark:text-gray-500 dark:text-white hover:text-blue-600"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => showNotification(`Download de ${attachment.name} iniciado`, 'success')}
                          className="p-1 text-gray-400 dark:text-gray-500 dark:text-white hover:text-green-600"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAttachment(attachment.id)}
                          className="p-1 text-gray-400 dark:text-gray-500 dark:text-white hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default ProposalEditor;