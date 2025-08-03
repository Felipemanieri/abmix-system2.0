import React, { useState, useEffect } from 'react';
import { Building, FileText, User, Phone, Mail, MapPin, Calendar, Plus, Trash2, Upload, Camera, Save, Send, Info, Users, Lock, Check } from 'lucide-react';
import { showNotification } from '../utils/notifications';
import { consultarCPF, formatarTelefone, formatarEndereco, formatarCPF } from '../utils/cpfApi';
import { buscarCEPLocal, formatarCEP } from '../utils/cepHandler';
import ProposalProgressTracker from './ProposalProgressTracker';

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

interface ProposalFormProps {
  isVendor: boolean;
  proposalId?: string;
  onSave?: (data: any) => void;
  onSend?: (data: any) => void;
  prefilledData?: {
    contractData?: ContractData;
    attachments?: File[];
    vendorObservations?: string;
  };
}

const ProposalForm: React.FC<ProposalFormProps> = ({ 
  isVendor, 
  proposalId, 
  onSave, 
  onSend, 
  prefilledData 
}) => {
  // Dados do contrato (preenchidos pelo vendedor, read-only para cliente)
  const [contractData, setContractData] = useState<ContractData>({
    nomeEmpresa: 'Tech Solutions Ltda',
    cnpj: '12.345.678/0001-90',
    planoContratado: 'Plano Empresarial',
    valor: '1.250,00',
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
  }]);

  const [dependentes, setDependentes] = useState<PersonData[]>([]);
  
  // Arquivos anexados pelo vendedor (read-only para cliente)
  const [vendorAttachments] = useState<File[]>([]);
  
  // Arquivos do cliente
  const [clientAttachments, setClientAttachments] = useState<File[]>([]);
  
  // Observações do vendedor
  const [vendorObservations, setVendorObservations] = useState<string>('Lembre-se de enviar todos os documentos solicitados em boa qualidade. Para dúvidas sobre documentos específicos, entre em contato através do chat.');
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Carregar dados pré-preenchidos quando for cliente
  useEffect(() => {
    if (!isVendor && prefilledData) {
      if (prefilledData.contractData) {
        setContractData(prefilledData.contractData);
      }
      if (prefilledData.vendorObservations) {
        setVendorObservations(prefilledData.vendorObservations);
      }
    }
  }, [isVendor, prefilledData]);

  const adicionarTitular = () => {
    const newTitular: PersonData = {
      id: `tit_${Date.now()}`,
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
    setTitulares([...titulares, newTitular]);
  };

  const removerTitular = (id: string) => {
    if (titulares.length > 1) {
      setTitulares(titulares.filter(tit => tit.id !== id));
    }
  };

  const adicionarDependente = () => {
    const newDependente: PersonData = {
      id: `dep_${Date.now()}`,
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
    setDependentes([...dependentes, newDependente]);
  };

  const removerDependente = (id: string) => {
    setDependentes(dependentes.filter(dep => dep.id !== id));
  };

  const updateTitular = (index: number, field: keyof PersonData, value: string) => {
    const newTitulares = [...titulares];
    newTitulares[index] = { ...newTitulares[index], [field]: value };
    setTitulares(newTitulares);
  };

  const updateDependente = (index: number, field: keyof PersonData, value: string) => {
    const newDependentes = [...dependentes];
    newDependentes[index] = { ...newDependentes[index], [field]: value };
    setDependentes(newDependentes);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setClientAttachments(prev => [...prev, ...newFiles]);
      showNotification(`${newFiles.length} arquivo(s) adicionado(s)`, 'success');
    }
  };

  const removeClientAttachment = (index: number) => {
    setClientAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const formData = {
      contractData,
      titulares,
      dependentes,
      clientAttachments
    };
    onSave?.(formData);
    showNotification('Dados salvos com sucesso!', 'success');
  };

  const handleSubmit = () => {
    // Validação básica
    const hasIncompleteTitular = titulares.some(t => 
      !t.nomeCompleto || !t.cpf || !t.rg || !t.dataNascimento || !t.emailPessoal || !t.telefonePessoal
    );
    
    if (hasIncompleteTitular) {
      showNotification('Preencha todos os campos obrigatórios dos titulares', 'error');
      return;
    }

    const hasIncompleteDependente = dependentes.some(d => 
      !d.nomeCompleto || !d.cpf || !d.rg || !d.dataNascimento || !d.parentesco
    );
    
    if (hasIncompleteDependente) {
      showNotification('Preencha todos os campos obrigatórios dos dependentes', 'error');
      return;
    }

    const formData = {
      contractData,
      titulares,
      dependentes,
      clientAttachments
    };
    
    setIsSubmitted(true);
    onSend?.(formData);
    showNotification('Proposta enviada com sucesso!', 'success');
  };

  // Função para consultar CPF automaticamente
  const handleCPFChange = async (cpf: string, type: 'titular' | 'dependente', index: number) => {
    // Aplicar formatação automática no CPF
    const cpfFormatado = formatarCPF(cpf);
    
    // Atualizar o campo CPF com formatação
    if (type === 'titular') {
      updateTitular(index, 'cpf', cpfFormatado);
    } else {
      updateDependente(index, 'cpf', cpfFormatado);
    }

    // Se CPF tem 11 dígitos (limpo), consultar API
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    if (cpfLimpo.length === 11) {
      const dados = await consultarCPF(cpf);
      
      if (dados && dados.dados) {
        // Preencher campos automaticamente
        const updates: Partial<PersonData> = {};
        const d = dados.dados;
        
        if (d.nome) updates.nomeCompleto = d.nome;
        if (d.mae) updates.nomeMae = d.mae;
        if (d.sexo) updates.sexo = d.sexo.toLowerCase() === 'masculino' ? 'masculino' : 'feminino';
        
        // Processar data de nascimento (formato: "02/08/1984 (41 anos)" -> "1984-08-02")
        if (d.data_nascimento) {
          const dataMatch = d.data_nascimento.match(/(\d{2})\/(\d{2})\/(\d{4})/);
          if (dataMatch) {
            const [, dia, mes, ano] = dataMatch;
            updates.dataNascimento = `${ano}-${mes}-${dia}`;
          }
        }
        
        // Montar endereço completo
        const endereco = formatarEndereco(dados);
        if (endereco) updates.enderecoCompleto = endereco;
        
        // Montar telefone
        const telefone = formatarTelefone(d.telefone_ddd, d.telefone_numero);
        if (telefone) updates.telefonePessoal = telefone;
        
        if (d.cep) updates.cep = d.cep;

        // Aplicar as atualizações
        Object.entries(updates).forEach(([campo, valor]) => {
          if (type === 'titular') {
            updateTitular(index, campo as keyof PersonData, valor);
          } else {
            updateDependente(index, campo as keyof PersonData, valor);
          }
        });

        showNotification('Dados preenchidos automaticamente via CPF', 'success');
      }
    }
  };

  const renderPersonForm = (person: PersonData, type: 'titular' | 'dependente', index: number) => (
    <div key={person.id} className="bg-gray-50 p-6 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <User className="w-5 h-5 mr-2" />
          {type === 'titular' ? `Titular ${index + 1}` : `Dependente ${index + 1}`}
        </h3>
        {(type === 'dependente' || (type === 'titular' && titulares.length > 1)) && (
          <button
            onClick={() => type === 'titular' ? removerTitular(person.id) : removerDependente(person.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            value={person.nomeCompleto}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'nomeCompleto', e.target.value);
              } else {
                updateDependente(index, 'nomeCompleto', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nome completo sem abreviações"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF *
          </label>
          <input
            type="text"
            value={person.cpf}
            onChange={(e) => handleCPFChange(e.target.value, type, index)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="000.000.000-00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RG *
          </label>
          <input
            type="text"
            value={person.rg}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'rg', e.target.value);
              } else {
                updateDependente(index, 'rg', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="00.000.000-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Nascimento *
          </label>
          <input
            type="date"
            value={person.dataNascimento}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'dataNascimento', e.target.value);
              } else {
                updateDependente(index, 'dataNascimento', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {type === 'dependente' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parentesco *
            </label>
            <select
              value={person.parentesco || ''}
              onChange={(e) => updateDependente(index, 'parentesco', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione</option>
              <option value="cônjuge">Cônjuge</option>
              <option value="filho(a)">Filho(a)</option>
              <option value="pai">Pai</option>
              <option value="mãe">Mãe</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        )}

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Mãe *
          </label>
          <input
            type="text"
            value={person.nomeMae}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'nomeMae', e.target.value);
              } else {
                updateDependente(index, 'nomeMae', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nome completo da mãe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sexo *
          </label>
          <select
            value={person.sexo}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'sexo', e.target.value);
              } else {
                updateDependente(index, 'sexo', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado Civil *
          </label>
          <select
            value={person.estadoCivil}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'estadoCivil', e.target.value);
              } else {
                updateDependente(index, 'estadoCivil', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione</option>
            <option value="solteiro">Solteiro(a)</option>
            <option value="casado">Casado(a)</option>
            <option value="divorciado">Divorciado(a)</option>
            <option value="viuvo">Viúvo(a)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Peso (kg)
          </label>
          <input
            type="text"
            value={person.peso}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'peso', e.target.value);
              } else {
                updateDependente(index, 'peso', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 70"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Altura (cm)
          </label>
          <input
            type="text"
            value={person.altura}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'altura', e.target.value);
              } else {
                updateDependente(index, 'altura', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 170"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Pessoal *
          </label>
          <input
            type="email"
            value={person.emailPessoal}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'emailPessoal', e.target.value);
              } else {
                updateDependente(index, 'emailPessoal', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="email@exemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone Pessoal *
          </label>
          <input
            type="tel"
            value={person.telefonePessoal}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'telefonePessoal', e.target.value);
              } else {
                updateDependente(index, 'telefonePessoal', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Empresa
          </label>
          <input
            type="email"
            value={person.emailEmpresa}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'emailEmpresa', e.target.value);
              } else {
                updateDependente(index, 'emailEmpresa', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="email@empresa.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone Empresa
          </label>
          <input
            type="tel"
            value={person.telefoneEmpresa}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'telefoneEmpresa', e.target.value);
              } else {
                updateDependente(index, 'telefoneEmpresa', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(00) 0000-0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CEP *
          </label>
          <input
            type="text"
            value={person.cep}
            onChange={(e) => {
              const formattedCep = formatarCEP(e.target.value);
              if (type === 'titular') {
                updateTitular(index, 'cep', formattedCep);
              } else {
                updateDependente(index, 'cep', formattedCep);
              }
            }}
            onBlur={(e) => {
              // Handler melhorado que não gera erro
              const cepValue = e.target.value;
              const cepLimpo = cepValue.replace(/\D/g, '');
              
              // Só executa se CEP tem 8 dígitos
              if (cepLimpo.length === 8) {
                const endereco = buscarCEPLocal(cepValue);
                if (endereco && endereco.enderecoCompleto) {
                  if (type === 'titular') {
                    updateTitular(index, 'enderecoCompleto', endereco.enderecoCompleto);
                  } else {
                    updateDependente(index, 'enderecoCompleto', endereco.enderecoCompleto);
                  }
                  showNotification('CEP encontrado! Endereço preenchido automaticamente.', 'success');
                } else {
                  showNotification('CEP não encontrado. Preencha o endereço manualmente.', 'warning');
                }
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="00000-000"
            maxLength={9}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço Completo *
          </label>
          <input
            type="text"
            value={person.enderecoCompleto}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'enderecoCompleto', e.target.value);
              } else {
                updateDependente(index, 'enderecoCompleto', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Rua, número, complemento, bairro, cidade, estado"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dados para Reembolso
          </label>
          <textarea
            value={person.dadosReembolso}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'dadosReembolso', e.target.value);
              } else {
                updateDependente(index, 'dadosReembolso', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Banco, agência, conta, PIX..."
          />
        </div>
      </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Proposta Enviada com Sucesso!</h2>
          <p className="text-gray-600 mb-6">
            Seus dados foram enviados e serão analisados pela nossa equipe.
          </p>
          <p className="text-sm text-gray-500 dark:text-white">
            Em breve você receberá um retorno sobre sua proposta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isVendor ? 'Nova Proposta de Plano de Saúde' : 'Complete seus Dados Pessoais'}
          </h1>
          <p className="text-gray-600">
            {isVendor 
              ? 'Preencha todos os dados para gerar uma proposta completa'
              : 'Preencha seus dados pessoais para finalizar a proposta'
            }
          </p>
        </div>

        {/* Barra de Progresso */}
        <ProposalProgressTracker
          contractData={contractData}
          titulares={titulares}
          dependentes={dependentes}
          attachments={clientAttachments}
          className="mb-6"
        />

        <div className="space-y-8">
          {/* Dados do Contrato - Read Only para Cliente */}
          <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Building className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Dados do Contrato
              </h2>
              {!isVendor && (
                <div className="ml-auto flex items-center text-sm text-gray-500 dark:text-white">
                  <Lock className="w-4 h-4 mr-1" />
                  Preenchido pelo vendedor
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={contractData.nomeEmpresa}
                  readOnly={!isVendor}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg ${
                    !isVendor ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={contractData.cnpj}
                  readOnly={!isVendor}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg ${
                    !isVendor ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plano Contratado
                </label>
                <input
                  type="text"
                  value={contractData.planoContratado}
                  readOnly={!isVendor}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg ${
                    !isVendor ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Mensal (R$)
                </label>
                <input
                  type="text"
                  value={contractData.valor}
                  readOnly={!isVendor}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg ${
                    !isVendor ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Início da Vigência
                </label>
                <input
                  type="date"
                  value={contractData.inicioVigencia}
                  readOnly={!isVendor}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg ${
                    !isVendor ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período mínimo de vigência
                </label>
                <input
                  type="text"
                  value={contractData.periodoMinimo || ''}
                  readOnly={!isVendor}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg ${
                    !isVendor ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={contractData.odontoConjugado}
                    readOnly={!isVendor}
                    disabled={!isVendor}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Inclui cobertura odontológica
                  </label>
                </div>
                
                <div className="flex items-center space-x-8">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={contractData.livreAdesao || false}
                      readOnly={!isVendor}
                      disabled={!isVendor}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Livre adesão
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={contractData.compulsorio}
                      readOnly={!isVendor}
                      disabled={!isVendor}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Compulsório
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={contractData.aproveitamentoCongenere}
                    readOnly={!isVendor}
                    disabled={!isVendor}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Aproveitamento de carência congênere
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Dados dos Titulares */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <User className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Dados dos Titulares
                </h2>
              </div>
              <button
                onClick={adicionarTitular}
                className="flex items-center px-4 py-2 bg-green-600 text-white dark:bg-green-50 dark:bg-green-9000 dark:text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Titular
              </button>
            </div>
            
            <div className="space-y-4">
              {titulares.map((titular, index) => 
                renderPersonForm(titular, 'titular', index)
              )}
            </div>
          </div>

          {/* Dependentes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Dependentes
                </h2>
              </div>
              <button
                onClick={adicionarDependente}
                className="flex items-center px-4 py-2 bg-purple-600 text-white dark:bg-purple-50 dark:bg-purple-9000 dark:text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Dependente
              </button>
            </div>
            
            {dependentes.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-500 dark:text-white">Nenhum dependente adicionado</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 dark:text-white mt-1">
                  Clique em "Adicionar Dependente" para incluir familiares
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dependentes.map((dependente, index) => 
                  renderPersonForm(dependente, 'dependente', index)
                )}
              </div>
            )}
          </div>

          {/* Documentos anexados pelo vendedor */}
          {!isVendor && vendorAttachments.length > 0 && (
            <div className="bg-teal-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-teal-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Documentos do Vendedor
                </h2>
              </div>
              <div className="space-y-2">
                {vendorAttachments.map((file, index) => (
                  <div key={index} className="flex items-center p-3 bg-white border border-teal-200 rounded-lg">
                    <FileText className="w-4 h-4 text-teal-500 mr-2" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload de Documentos do Cliente */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Documentos
              </h2>
            </div>

            {/* Texto discreto dos documentos necessários */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-100">
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-medium text-gray-700">Documentos necessários:</span> CNPJ • Contrato social • RG/CPF de todos (pode ser CNH) • Certidão de Nascimento para menores de 12 anos • Relatório de alta / Declaração de saúde pediátrica (até 3 anos) • Certidão de casamento • Comprovante de residência do(s) titular(es) • Carteirinhas do plano atual • Carta de permanência • Analítico do plano atual
              </p>
            </div>

            <div className="space-y-4">
              {/* Área de Upload com Drag & Drop */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-4">
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload-cliente"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload-cliente" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 dark:text-white mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Arraste arquivos aqui ou escolha uma opção
                  </p>
                  <p className="text-sm text-gray-500 dark:text-white">
                    Suporte para PDF, DOC, DOCX, JPG, PNG - Sem limite de quantidade
                  </p>
                </label>
              </div>

              {/* Botões de Upload */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <label htmlFor="escolher-arquivo-cliente" className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="escolher-arquivo-cliente"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <FileText className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-blue-700">Escolher Arquivo</span>
                  <span className="text-xs text-blue-600">Do computador/celular</span>
                </label>

                <label htmlFor="tirar-foto-cliente" className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="tirar-foto-cliente"
                  />
                  <Camera className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-green-700">Tirar Foto</span>
                  <span className="text-xs text-green-600">Câmera do dispositivo</span>
                </label>

                <label htmlFor="da-galeria-cliente" className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="da-galeria-cliente"
                  />
                  <User className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-purple-700">Da Galeria</span>
                  <span className="text-xs text-purple-600">Fotos salvas</span>
                </label>
              </div>

              {clientAttachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Arquivos Anexados ({clientAttachments.length})
                  </p>
                  <div className="space-y-2">
                    {clientAttachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-500 dark:text-white mr-2" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeClientAttachment(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Campo de Observações do Vendedor */}
          <div className="bg-orange-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Info className="w-5 h-5 text-orange-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Observações do Vendedor
              </h2>
              {!isVendor && (
                <div className="ml-auto flex items-center text-sm text-gray-500 dark:text-white">
                  <Lock className="w-4 h-4 mr-1" />
                  Somente leitura
                </div>
              )}
            </div>
            
            {isVendor ? (
              <textarea
                value={vendorObservations}
                onChange={(e) => setVendorObservations(e.target.value)}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Adicione observações importantes para o cliente sobre os documentos ou processo..."
              />
            ) : (
              <div className="bg-white p-4 rounded-lg border border-orange-200 min-h-[100px]">
                {vendorObservations ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {vendorObservations}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-white italic">
                    Nenhuma observação específica do vendedor para esta proposta.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-between">
            <button
              onClick={handleSave}
              className="flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Dados
            </button>

            <button
              onClick={handleSubmit}
              className="flex items-center px-6 py-3 bg-blue-600 text-white dark:bg-blue-50 dark:bg-blue-9000 dark:text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Send className="w-4 h-4 mr-2" />
              {isVendor ? 'Gerar Link para Cliente' : 'Enviar Proposta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalForm;