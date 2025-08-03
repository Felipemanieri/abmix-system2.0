import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Users, Shield, Check, Plus, Upload, Camera, FileText } from 'lucide-react';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import { buscarCEP, formatarCEP } from '../utils/cepHandler';
import { consultarCPF, formatarCPF } from '../utils/cpfApi';

interface PersonData {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  nomeMae: string;
  sexo: string;
  estadoCivil: string;
  peso: string;
  altura: string;
  emailPessoal: string;
  telefonePessoal: string;
  emailEmpresa: string;
  telefoneEmpresa: string;
  cep: string;
  endereco: string;
  dadosReembolso: string;
  parentesco?: string;
}

interface ContractInfo {
  nomeEmpresa: string;
  cnpj: string;
  planoContratado: string;
  valor: string;
  odontoConjugado: boolean;
  compulsorio: boolean;
  inicioVigencia: string;
}

const ClientForm: React.FC = () => {
  const [titulares, setTitulares] = useState<PersonData[]>([{
    id: '1',
    nome: '',
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
    endereco: '',
    dadosReembolso: '',
  }]);

  const [dependentes, setDependentes] = useState<PersonData[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { saveClientData, uploadDocument, createClientFolder } = useGoogleDrive();

  // Dados do contrato (simulados - viriam da URL/API)
  const contractInfo: ContractInfo = {
    nomeEmpresa: 'Empresa ABC Ltda',
    cnpj: '12.345.678/0001-90',
    planoContratado: 'Plano Empresarial Premium',
    valor: 'R$ 1.250,00',
    odontoConjugado: true,
    compulsorio: false,
    inicioVigencia: '01/02/2024',
  };

  const addTitular = () => {
    if (titulares.length < 99) {
      const newTitular: PersonData = {
        id: Date.now().toString(),
        nome: '',
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
        endereco: '',
        dadosReembolso: '',
      };
      setTitulares([...titulares, newTitular]);
    }
  };

  const addDependente = () => {
    if (dependentes.length < 50) {
      const newDependente: PersonData = {
        id: Date.now().toString(),
        nome: '',
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
        endereco: '',
        dadosReembolso: '',
        parentesco: '',
      };
      setDependentes([...dependentes, newDependente]);
    }
  };

  const updatePerson = (type: 'titular' | 'dependente', id: string, field: keyof PersonData, value: string) => {
    if (type === 'titular') {
      setTitulares(prev => prev.map(person => 
        person.id === id ? { ...person, [field]: value } : person
      ));
    } else {
      setDependentes(prev => prev.map(person => 
        person.id === id ? { ...person, [field]: value } : person
      ));
    }
  };

  // Função para consultar CPF automaticamente no ClientForm
  const handleCPFChange = async (cpf: string, type: 'titular' | 'dependente', id: string) => {
    // Aplicar formatação automática no CPF
    const cpfFormatado = formatarCPF(cpf);
    updatePerson(type, id, 'cpf', cpfFormatado);

    // Só consultar se o CPF tem 11 dígitos
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length === 11) {
      try {
        const dados = await consultarCPF(cpfLimpo);
        if (dados && dados.dados) {
          const d = dados.dados;

          // Preencher Nome Completo
          if (d.nome) {
            updatePerson(type, id, 'nome', d.nome);
          }

          // Preencher Nome da Mãe  
          if (d.mae) {
            updatePerson(type, id, 'nomeMae', d.mae);
          }

          // Preencher Sexo
          if (d.sexo) {
            const sexoFormatado = d.sexo.toLowerCase() === 'masculino' ? 'masculino' : 'feminino';
            updatePerson(type, id, 'sexo', sexoFormatado);
          }

          // Processar data de nascimento
          if (d.data_nascimento) {
            const dataMatch = d.data_nascimento.match(/(\d{2})\/(\d{2})\/(\d{4})/);
            if (dataMatch) {
              const [, dia, mes, ano] = dataMatch;
              const dataFormatada = `${ano}-${mes}-${dia}`;
              updatePerson(type, id, 'dataNascimento', dataFormatada);
            }
          }
        }
      } catch (error) {
        console.error('❌ ClientForm - Erro ao consultar CPF:', error);
      }
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Iniciar processo de upload e salvamento
    handleSaveToGoogleDrive();
  };

  const handleSaveToGoogleDrive = async () => {
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // Gerar ID único para o cliente
      const clientId = `CLIENT-${Date.now()}`;
      
      // Criar pasta para o cliente no Google Drive
      setUploadProgress(20);
      const folderId = await createClientFolder(clientId, titulares[0].nome);
      
      // Upload de documentos
      setUploadProgress(40);
      const documentUrls: string[] = [];
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const documentUrl = await uploadDocument(file, clientId);
        documentUrls.push(documentUrl);
        
        // Atualizar progresso de upload
        setUploadProgress(40 + Math.floor((i + 1) / uploadedFiles.length * 30));
      }
      
      // Preparar dados do cliente para salvar no Google Sheets
      setUploadProgress(80);
      const clientData = {
        id: clientId,
        nome: titulares[0].nome,
        cpf: titulares[0].cpf,
        rg: titulares[0].rg,
        dataNascimento: titulares[0].dataNascimento,
        email: titulares[0].emailPessoal,
        telefone: titulares[0].telefonePessoal,
        empresa: contractInfo.nomeEmpresa,
        plano: contractInfo.planoContratado,
        documentos: documentUrls,
        dataEnvio: new Date().toISOString(),
        cnpj: contractInfo.cnpj || '',
        valor: contractInfo.valor || '',
        vendedor: '',
        status: 'analise',
        dataAtualizacao: new Date().toISOString()
      };
      
      // Salvar dados no Google Sheets
      setUploadProgress(90);
      await saveClientData(clientData);
      
      // Finalizar
      setUploadProgress(100);
      setIsUploading(false);
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Erro ao salvar dados no Google Drive:', error);
      setIsUploading(false);
      alert('Ocorreu um erro ao enviar os dados. Por favor, tente novamente.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dados Enviados e Armazenados com Sucesso!</h2>
          <p className="text-gray-600 mb-6">
            Seus dados foram enviados para análise e armazenados com segurança no Google Drive. O vendedor organizará os documentos e enviará para aprovação.
          </p>
          <div className="bg-teal-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-teal-700">
              <strong>Protocolo:</strong> #ABMIX-2024-{Math.floor(Math.random() * 10000)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderPersonForm = (person: PersonData, type: 'titular' | 'dependente', index: number) => (
    <div key={person.id} className="bg-gray-50 p-6 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {type === 'titular' ? `Titular ${index + 1}` : `Dependente ${index + 1}`}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
          <input
            type="text"
            required
            value={person.nome}
            onChange={(e) => updatePerson(type, person.id, 'nome', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
          <input
            type="text"
            required
            value={person.cpf}
            onChange={(e) => {
              console.log('🔄 ClientForm - CPF onChange disparado:', e.target.value);
              handleCPFChange(e.target.value, type, person.id);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            placeholder="000.000.000-00"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RG *</label>
          <input
            type="text"
            required
            value={person.rg}
            onChange={(e) => updatePerson(type, person.id, 'rg', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
          <input
            type="date"
            required
            value={person.dataNascimento}
            onChange={(e) => updatePerson(type, person.id, 'dataNascimento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>

        {type === 'dependente' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco *</label>
            <select
              required
              value={person.parentesco || ''}
              onChange={(e) => updatePerson(type, person.id, 'parentesco', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            >
              <option value="">Selecione</option>
              <option value="conjuge">Cônjuge</option>
              <option value="filho">Filho(a)</option>
              <option value="enteado">Enteado(a)</option>
              <option value="pai">Pai</option>
              <option value="mae">Mãe</option>
              <option value="sogro">Sogro(a)</option>
            </select>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Mãe *</label>
          <input
            type="text"
            required
            value={person.nomeMae}
            onChange={(e) => updatePerson(type, person.id, 'nomeMae', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sexo *</label>
          <select
            required
            value={person.sexo}
            onChange={(e) => updatePerson(type, person.id, 'sexo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          >
            <option value="">Selecione</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil *</label>
          <select
            required
            value={person.estadoCivil}
            onChange={(e) => updatePerson(type, person.id, 'estadoCivil', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          >
            <option value="">Selecione</option>
            <option value="solteiro">Solteiro(a)</option>
            <option value="casado">Casado(a)</option>
            <option value="divorciado">Divorciado(a)</option>
            <option value="viuvo">Viúvo(a)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
          <input
            type="text"
            value={person.peso}
            onChange={(e) => updatePerson(type, person.id, 'peso', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Altura (m)</label>
          <input
            type="text"
            value={person.altura}
            onChange={(e) => updatePerson(type, person.id, 'altura', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Pessoal *</label>
          <input
            type="email"
            required
            value={person.emailPessoal}
            onChange={(e) => updatePerson(type, person.id, 'emailPessoal', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Pessoal *</label>
          <input
            type="tel"
            required
            value={person.telefonePessoal}
            onChange={(e) => updatePerson(type, person.id, 'telefonePessoal', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
          <input
            type="text"
            required
            value={person.cep}
            onChange={(e) => {
              const formattedCep = formatarCEP(e.target.value);
              updatePerson(type, person.id, 'cep', formattedCep);
            }}
            onBlur={async (e) => {
              const cepValue = e.target.value;
              const cepLimpo = cepValue.replace(/\D/g, '');
              
              if (cepLimpo.length === 8) {
                try {
                  const endereco = await buscarCEP(cepValue);
                  if (endereco && endereco.enderecoCompleto) {
                    updatePerson(type, person.id, 'endereco', endereco.enderecoCompleto);
                  }
                } catch (error) {
                  console.error('Erro ao buscar CEP:', error);
                }
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            placeholder="00000-000"
            maxLength={9}
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo *</label>
          <input
            type="text"
            required
            value={person.endereco}
            onChange={(e) => updatePerson(type, person.id, 'endereco', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            placeholder="Rua, número, complemento, bairro, cidade, estado"
          />
        </div>
      </div>
    </div>
  );

  if (isUploading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enviando Dados...</h2>
          <p className="text-gray-600 mb-6">
            Seus dados estão sendo enviados e armazenados no Google Drive. Por favor, não feche esta janela.
          </p>
          
          <div className="mb-4">
            <div className="w-full bg-gray-200 dark:bg-gray-600 dark:bg-gray-600 rounded-full h-3">
              <div 
                className="bg-teal-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{uploadProgress}% concluído</p>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-white">
            {uploadProgress < 30 ? 'Criando pasta para seus documentos...' : 
             uploadProgress < 70 ? 'Enviando documentos...' : 
             'Salvando informações...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 text-gray-700 dark:text-gray-300 mb-6 border border-gray-300 dark:border-gray-600">
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">Formulário do Cliente</h1>
        <p className="text-gray-600 dark:text-gray-400">Preencha seus dados pessoais e anexe os documentos</p>
      </div>

      {/* Contract Info (Read Only) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dados do Contrato</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Empresa:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{contractInfo.nomeEmpresa}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">CNPJ:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{contractInfo.cnpj}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Plano:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{contractInfo.planoContratado}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Valor:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{contractInfo.valor}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Odonto:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{contractInfo.odontoConjugado ? 'Sim' : 'Não'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Início:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{contractInfo.inicioVigencia}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titulares */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Titulares</h2>
            <button
              type="button"
              onClick={addTitular}
              disabled={titulares.length >= 99}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Titular ({titulares.length}/99)
            </button>
          </div>
          
          {titulares.map((titular, index) => renderPersonForm(titular, 'titular', index))}
        </div>

        {/* Dependentes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dependentes</h2>
            <button
              type="button"
              onClick={addDependente}
              disabled={dependentes.length >= 50}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Dependente ({dependentes.length}/50)
            </button>
          </div>
          
          {dependentes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum dependente adicionado</p>
          ) : (
            dependentes.map((dependente, index) => renderPersonForm(dependente, 'dependente', index))
          )}
        </div>

        {/* Document Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documentos</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Anexe todos os documentos em um só lugar. O vendedor organizará depois.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 dark:text-white" />
                <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500 dark:text-white" />
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500 dark:text-white" />
              </div>
              
              <div>
                <label className="cursor-pointer">
                  <span className="text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 font-medium">
                    Clique para selecionar arquivos
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
                <span className="text-gray-500 dark:text-gray-400"> ou arraste e solte aqui</span>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PDF, JPG, PNG, DOC, DOCX até 10MB cada
              </p>
            </div>
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Arquivos Anexados ({uploadedFiles.length})
              </h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            disabled={isUploading}
            type="submit"
            className="px-8 py-3 text-lg font-medium text-white bg-gray-600 dark:bg-gray-700 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Enviando...' : 'Enviar Dados'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;