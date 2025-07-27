import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building, FileText, User, Upload, Camera, CheckCircle, Lock, Save, Download, Eye, EyeOff, Plus, Trash2, Users, Phone, Mail, MapPin, Calendar, Shield, Check, Image } from 'lucide-react';
import { showNotification } from '../utils/notifications';
import { buscarCEPLocal, formatarCEP } from '../utils/cepHandler';

interface ClientProposalViewProps {
  token: string;
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

interface Proposal {
  id: string;
  contractData: ContractData;
  titulares: PersonData[];
  dependentes: PersonData[];
  attachments: any[];
  status: string;
  vendorObservations?: string;
}

const ClientProposalView: React.FC<ClientProposalViewProps> = ({ token }) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [titulares, setTitulares] = useState<PersonData[]>([]);
  const [dependentes, setDependentes] = useState<PersonData[]>([]);
  const [clientAttachments, setClientAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showVendorObservations, setShowVendorObservations] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'camera' | 'gallery'>('file');
  const [lastSaved, setLastSaved] = useState<string | null>(new Date().toISOString());
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isClearingDraft, setIsClearingDraft] = useState(false);

  useEffect(() => {
    fetchProposal();
  }, [token]);

  // Auto-save DESABILITADO temporariamente para corrigir problema dos campos sumindo
  // useEffect(() => {
  //   if (proposal && !loading && !isSubmitting && !isLoadingDraft && !isClearingDraft) {
  //     const timeoutId = setTimeout(() => {
  //       // Verificar se há dados realmente preenchidos antes de salvar
  //       const hasData = titulares.some(t => t.nomeCompleto) ||
  //                       dependentes.some(d => d.nomeCompleto);
        
  //       if (hasData) {
  //         const now = new Date().toISOString();
  //         const draftData = {
  //           titulares: titulares,
  //           dependentes: dependentes,
  //           isDraft: true,
  //           lastSaved: now
  //         };

  //         const draftKey = `client_draft_${token}`;
  //         localStorage.setItem(draftKey, JSON.stringify(draftData));
  //         setLastSaved(now);
  //       }
  //     }, 500); // Debounce de 500ms

  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [titulares, dependentes, token, proposal, loading, isSubmitting, isLoadingDraft, isClearingDraft]);

  const initializeWithProposalData = (proposalData: any) => {
    if (proposalData.titulares && proposalData.titulares.length > 0) {
      setTitulares(proposalData.titulares);
    } else {
      setTitulares([createEmptyPerson('1')]);
    }
    
    if (proposalData.dependentes) {
      setDependentes(proposalData.dependentes);
    }
  };

  const fetchProposal = async () => {
    try {
      const response = await fetch(`/api/proposals/client/${token}`);
      
      if (!response.ok) {
        throw new Error('Proposta não encontrada');
      }

      const proposalData = await response.json();
      setProposal(proposalData);
      
      // Verificar se existe rascunho salvo no localStorage
      setIsLoadingDraft(true);
      const draftKey = `client_draft_${token}`;
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          
          // Verificar se há dados realmente preenchidos
          const hasData = draftData.titulares?.some((t: any) => t.nomeCompleto) ||
                          draftData.dependentes?.some((d: any) => d.nomeCompleto);
          
          if (hasData) {
            // Usar dados do rascunho se existirem
            if (draftData.titulares && draftData.titulares.length > 0) {
              setTitulares(draftData.titulares);
            } else if (proposalData.titulares && proposalData.titulares.length > 0) {
              setTitulares(proposalData.titulares);
            } else {
              setTitulares([createEmptyPerson('1')]);
            }
            
            if (draftData.dependentes) {
              setDependentes(draftData.dependentes);
            } else if (proposalData.dependentes) {
              setDependentes(proposalData.dependentes);
            }
            
            setLastSaved(draftData.lastSaved);
          } else {
            // Se não há rascunho, definir um lastSaved inicial para mostrar o botão
            setLastSaved(new Date().toISOString());
            localStorage.removeItem(draftKey);
            initializeWithProposalData(proposalData);
          }
        } catch (error) {
          console.error('Erro ao carregar rascunho:', error);
          // Usar dados originais da proposta se o rascunho falhar
          initializeWithProposalData(proposalData);
        }
      } else {
        // Inicializar com dados da proposta se não há rascunho
        initializeWithProposalData(proposalData);
        // Definir um lastSaved inicial para mostrar o botão
        setLastSaved(new Date().toISOString());
      }
      
      setIsLoadingDraft(false);

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar proposta:', error);
      showNotification('Erro ao carregar proposta', 'error');
      setLoading(false);
    }
  };

  const createEmptyPerson = (id: string, parentesco?: string): PersonData => ({
    id,
    nomeCompleto: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    parentesco,
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
  });

  const addTitular = () => {
    if (titulares.length < 10) {
      const newTitular = createEmptyPerson(`titular-${Date.now()}`);
      setTitulares([...titulares, newTitular]);
    }
  };

  const removeTitular = (id: string) => {
    if (titulares.length > 1) {
      setTitulares(titulares.filter(titular => titular.id !== id));
    }
  };

  const addDependente = () => {
    if (dependentes.length < 20) {
      const newDependente = createEmptyPerson(`dependente-${Date.now()}`, 'Cônjuge');
      setDependentes([...dependentes, newDependente]);
    }
  };

  const removeDependente = (id: string) => {
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
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(file => {
        const isValidType = file.type.includes('pdf') || file.type.includes('image');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
        return isValidType && isValidSize;
      });
      
      if (validFiles.length !== fileArray.length) {
        showNotification('Alguns arquivos foram ignorados por não atenderem aos requisitos', 'error');
      }
      
      setClientAttachments(prev => [...prev, ...validFiles]);
      if (validFiles.length > 0) {
        showNotification(`${validFiles.length} arquivo(s) adicionado(s)`, 'success');
      }
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      handleFileUpload(files);
    };
    input.click();
  };

  const handleGallerySelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      handleFileUpload(files);
    };
    input.click();
  };

  const removeAttachment = (index: number) => {
    setClientAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearDraft = () => {
    setIsClearingDraft(true);
    
    const draftKey = `client_draft_${token}`;
    localStorage.removeItem(draftKey);
    setLastSaved(null);
    
    // Limpar todos os dados dos formulários
    setTitulares([createEmptyPerson('1')]);
    setDependentes([]);
    
    showNotification('Rascunho limpo com sucesso', 'success');
    
    setTimeout(() => {
      setIsClearingDraft(false);
    }, 1000);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const updateData = {
        titulares,
        dependentes,
        clientAttachments: clientAttachments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        clientCompleted: false // Indica que é apenas um salvamento, não envio final
      };

      const response = await fetch(`/api/proposals/client/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar dados');
      }

      showNotification('Dados salvos com sucesso! Você pode continuar mais tarde.', 'success');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      showNotification('Erro ao salvar dados', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    // Validar campos obrigatórios
    const firstTitular = titulares[0];
    if (!firstTitular.nomeCompleto || !firstTitular.cpf || !firstTitular.rg) {
      showNotification('Preencha todos os campos obrigatórios do primeiro titular', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        titulares,
        dependentes,
        clientAttachments: clientAttachments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      };

      const response = await fetch(`/api/proposals/client/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar proposta');
      }

      // Limpar rascunho após envio bem-sucedido
      const draftKey = `client_draft_${token}`;
      localStorage.removeItem(draftKey);
      setLastSaved(null);
      
      setIsCompleted(true);
      showNotification('Proposta enviada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      showNotification('Erro ao enviar proposta', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPersonForm = (person: PersonData, type: 'titular' | 'dependente', index: number) => (
    <div key={person.id} className="bg-gray-50 p-6 rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {type === 'titular' ? `Titular ${index + 1}` : `Dependente ${index + 1}`}
        </h3>
        {(type === 'titular' && titulares.length > 1) || type === 'dependente' ? (
          <button
            onClick={() => type === 'titular' ? removeTitular(person.id) : removeDependente(person.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {type === 'dependente' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parentesco *
            </label>
            <select
              value={person.parentesco || ''}
              onChange={(e) => type === 'dependente' ? updateDependente(index, 'parentesco', e.target.value) : updateTitular(index, 'parentesco', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione o parentesco</option>
              <option value="Cônjuge">Cônjuge</option>
              <option value="Filho(a)">Filho(a)</option>
              <option value="Enteado(a)">Enteado(a)</option>
              <option value="Pai">Pai</option>
              <option value="Mãe">Mãe</option>
              <option value="Sogro(a)">Sogro(a)</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            value={person.nomeCompleto}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'nomeCompleto', e.target.value) : updateDependente(index, 'nomeCompleto', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF *
          </label>
          <input
            type="text"
            value={person.cpf}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'cpf', e.target.value) : updateDependente(index, 'cpf', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="000.000.000-00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RG *
          </label>
          <input
            type="text"
            value={person.rg}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'rg', e.target.value) : updateDependente(index, 'rg', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Nascimento *
          </label>
          <input
            type="date"
            value={person.dataNascimento}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'dataNascimento', e.target.value) : updateDependente(index, 'dataNascimento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Mãe *
          </label>
          <input
            type="text"
            value={person.nomeMae}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'nomeMae', e.target.value) : updateDependente(index, 'nomeMae', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sexo *
          </label>
          <select
            value={person.sexo}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'sexo', e.target.value) : updateDependente(index, 'sexo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado Civil
          </label>
          <select
            value={person.estadoCivil}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'estadoCivil', e.target.value) : updateDependente(index, 'estadoCivil', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione</option>
            <option value="Solteiro(a)">Solteiro(a)</option>
            <option value="Casado(a)">Casado(a)</option>
            <option value="Divorciado(a)">Divorciado(a)</option>
            <option value="Viúvo(a)">Viúvo(a)</option>
            <option value="União Estável">União Estável</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail Pessoal *
          </label>
          <input
            type="email"
            value={person.emailPessoal}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'emailPessoal', e.target.value) : updateDependente(index, 'emailPessoal', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone Pessoal *
          </label>
          <input
            type="tel"
            value={person.telefonePessoal}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'telefonePessoal', e.target.value) : updateDependente(index, 'telefonePessoal', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(11) 99999-9999"
            required
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
              type === 'titular' ? updateTitular(index, 'cep', formattedCep) : updateDependente(index, 'cep', formattedCep);
            }}
            onBlur={(e) => {
              // Handler melhorado que não gera erro
              const cepValue = e.target.value;
              const cepLimpo = cepValue.replace(/\D/g, '');
              
              // Só executa se CEP tem 8 dígitos
              if (cepLimpo.length === 8) {
                const endereco = buscarCEPLocal(cepValue);
                if (endereco && endereco.enderecoCompleto) {
                  type === 'titular' ? updateTitular(index, 'enderecoCompleto', endereco.enderecoCompleto) : updateDependente(index, 'enderecoCompleto', endereco.enderecoCompleto);
                  showNotification('CEP encontrado! Endereço preenchido automaticamente.', 'success');
                } else {
                  showNotification('CEP não encontrado. Preencha o endereço manualmente.', 'info');
                }
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="00000-000"
            maxLength={9}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço Completo *
          </label>
          <input
            type="text"
            value={person.enderecoCompleto}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'enderecoCompleto', e.target.value) : updateDependente(index, 'enderecoCompleto', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rua, número, complemento, bairro, cidade, estado"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail Empresa
          </label>
          <input
            type="email"
            value={person.emailEmpresa}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'emailEmpresa', e.target.value) : updateDependente(index, 'emailEmpresa', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone Empresa
          </label>
          <input
            type="tel"
            value={person.telefoneEmpresa}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'telefoneEmpresa', e.target.value) : updateDependente(index, 'telefoneEmpresa', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Peso (kg)
          </label>
          <input
            type="text"
            value={person.peso}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'peso', e.target.value) : updateDependente(index, 'peso', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 70"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Altura (m)
          </label>
          <input
            type="text"
            value={person.altura}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'altura', e.target.value) : updateDependente(index, 'altura', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 1.70"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dados para Reembolso
          </label>
          <textarea
            value={person.dadosReembolso}
            onChange={(e) => type === 'titular' ? updateTitular(index, 'dadosReembolso', e.target.value) : updateDependente(index, 'dadosReembolso', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Banco, agência, conta corrente, PIX, etc."
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Proposta não encontrada</h1>
          <p className="text-gray-600">O link pode ter expirado ou ser inválido.</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-green-900">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg dark:shadow-gray-900/50 max-w-md">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-600 mb-2">Proposta Enviada!</h1>
          <p className="text-gray-600 mb-4">
            Sua proposta foi enviada com sucesso e está sendo processada por nossa equipe.
          </p>
          <p className="text-sm text-gray-500 dark:text-white">
            Você receberá atualizações por e-mail sobre o status da sua proposta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg dark:shadow-gray-900/50 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white dark:bg-blue-50 dark:bg-blue-9000 dark:text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('clientProposalToken');
                    window.location.href = '/';
                  }}
                  className="hover:opacity-80 transition-opacity flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Sistema
                </button>
                <div>
                  <h1 className="text-2xl font-bold">Completar Proposta de Plano de Saúde</h1>
                  <p className="text-blue-100 mt-2">Preencha seus dados pessoais para finalizar a proposta</p>
                </div>
              </div>

            </div>
          </div>

          {/* Contract Data - Read Only */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center mb-6">
              <Building className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Dados do Contrato</h2>
              <Lock className="h-4 w-4 text-gray-500 dark:text-white ml-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa *</label>
                <input
                  type="text"
                  value={proposal.contractData.nomeEmpresa}
                  placeholder="Ex: Empresa ABC Ltda"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ *</label>
                <input
                  type="text"
                  value={proposal.contractData.cnpj}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plano Contratado *</label>
                <input
                  type="text"
                  value={proposal.contractData.planoContratado}
                  placeholder="Ex: Plano Empresarial Premium - Cobertura"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor Mensal (R$) *</label>
                <input
                  type="text"
                  value={proposal.contractData.valor?.toString() || "0,00"}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Início da Vigência *</label>
                <input
                  type="text"
                  value={proposal.contractData.inicioVigencia}
                  placeholder="dd/mm/aaaa"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Período mínimo de vigência *</label>
                <input
                  type="text"
                  value={proposal.contractData.periodoMinimo || "Selecione o período"}
                  placeholder="Selecione o período"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600"
                  readOnly
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={proposal.contractData.odontoConjugado}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded mr-3"
                  disabled
                />
                <label className="text-sm text-gray-700">Inclui cobertura odontológica</label>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={proposal.contractData.livreAdesao}
                    className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded mr-3"
                    disabled
                  />
                  <label className="text-sm text-gray-700">Livre adesão</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={proposal.contractData.compulsorio}
                    className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded mr-3"
                    disabled
                  />
                  <label className="text-sm text-gray-700">Compulsório</label>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={proposal.contractData.aproveitamentoCongenere}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded mr-3"
                  disabled
                />
                <label className="text-sm text-gray-700">Aproveitamento de carência congênere</label>
              </div>
            </div>
          </div>

          {/* Vendor Observations */}
          {proposal.vendorObservations && (
            <div className="p-6 border-b bg-yellow-50 dark:bg-yellow-900">
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <User className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Observações do Vendedor</h2>
                  <button
                    onClick={() => setShowVendorObservations(!showVendorObservations)}
                    className="ml-2 text-gray-500 dark:text-white hover:text-gray-700"
                  >
                    {showVendorObservations ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              {showVendorObservations && (
                <div className="bg-white border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {proposal.vendorObservations}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Personal Data Form */}
          <div className="p-6">
            {/* Titulares */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <User className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Dados dos Titulares</h2>
                </div>
                <button
                  onClick={addTitular}
                  className="bg-blue-600 text-white dark:bg-blue-50 dark:bg-blue-9000 dark:text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  disabled={titulares.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  + Adicionar Titular
                </button>
              </div>
              
              <div className="space-y-6">
                {titulares.map((titular, index) => renderPersonForm(titular, 'titular', index))}
              </div>
            </div>

            {/* Dependentes */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Dependentes</h2>
                </div>
                <button
                  onClick={addDependente}
                  className="bg-green-600 text-white dark:bg-green-50 dark:bg-green-9000 dark:text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                  disabled={dependentes.length >= 20}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Dependente
                </button>
              </div>
              
              <div className="space-y-6">
                {dependentes.map((dependente, index) => renderPersonForm(dependente, 'dependente', index))}
              </div>
            </div>

            {/* Required Documents - Sincronizada com vendedor */}
            {(() => {
              // Lista de todos os documentos com suas chaves exatas do vendedor
              const todosDocumentos = [
                { key: 'cnpj', texto: '• CNPJ' },
                { key: 'contratoSocial', texto: '• Contrato social' },
                { key: 'rgCpf', texto: '• RG/CPF de todos (pode ser CNH)' },
                { key: 'certidaoNascimento', texto: '• Certidão de Nascimento para menores de 12 anos' },
                { key: 'relatorioAlta', texto: '• Relatório de alta / Declaração de saúde pediátrica (até 3 anos)' },
                { key: 'certidaoCasamento', texto: '• Certidão de casamento' },
                { key: 'comprovanteResidencia', texto: '• Comprovante de residência do(s) titular(es)' },
                { key: 'carteirinhasPlano', texto: '• Carteirinhas do plano atual' },
                { key: 'cartaPermanencia', texto: '• Carta de permanência' },
                { key: 'analiticoPlano', texto: '• Analítico do plano atual' }
              ];

              // Filtrar documentos não marcados pelo vendedor
              const documentosRecebidos = proposal?.documentosRecebidos || {};
              const documentosVisivos = todosDocumentos.filter(doc => 
                !documentosRecebidos[doc.key]
              );

              // Só exibir a seção se há documentos visíveis
              if (documentosVisivos.length === 0) {
                return null;
              }

              return (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <FileText className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Documentos Necessários</h2>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-blue-900 mb-2">Documentos obrigatórios para todos os beneficiários:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {documentosVisivos.map(doc => (
                        <li key={doc.key}>{doc.texto}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}

            {/* Document Upload */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Upload className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Enviar Documentos</h2>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <div className="text-center mb-4">
                  <p className="text-lg text-gray-600 mb-2">Escolha como enviar seus documentos</p>
                  <p className="text-sm text-gray-500 dark:text-white mb-4">
                    Aceitos: PDF, JPG, PNG (máx. 10MB cada)
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <label className="bg-blue-600 text-white dark:bg-blue-50 dark:bg-blue-9000 dark:text-white px-6 py-3 rounded-md hover:bg-blue-700 cursor-pointer inline-flex items-center">
                      <Upload className="h-5 w-5 mr-2" />
                      Escolher Arquivo
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>
                    
                    <button
                      onClick={handleCameraCapture}
                      className="bg-green-600 text-white dark:bg-green-50 dark:bg-green-9000 dark:text-white px-6 py-3 rounded-md hover:bg-green-700 inline-flex items-center"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Tirar Foto
                    </button>
                    
                    <button
                      onClick={handleGallerySelect}
                      className="bg-purple-600 text-white dark:bg-purple-50 dark:bg-purple-9000 dark:text-white px-6 py-3 rounded-md hover:bg-purple-700 inline-flex items-center"
                    >
                      <Image className="h-5 w-5 mr-2" />
                      Da Galeria
                    </button>
                  </div>
                </div>
                
                {clientAttachments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Arquivos selecionados:</h4>
                    <ul className="space-y-2">
                      {clientAttachments.map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 dark:text-white mr-2" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500 dark:text-white ml-2">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>



            {/* Additional Contract Information */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Informações do Plano</h2>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-700">
                      Odonto Conjugado: {proposal.contractData.odontoConjugado ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-700">
                      Compulsório: {proposal.contractData.compulsorio ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-700">
                      Livre Adesão: {proposal.contractData.livreAdesao ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Início de Vigência</label>
                    <input
                      type="text"
                      value={proposal.contractData.inicioVigencia}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Período Mínimo</label>
                    <input
                      type="text"
                      value={proposal.contractData.periodoMinimo || '12 meses'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving || isSubmitting}
                className="bg-blue-600 text-white dark:bg-blue-50 dark:bg-blue-9000 dark:text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg font-medium"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Salvar
                  </>
                )}
              </button>

              <button
                onClick={handleClearDraft}
                disabled={isClearingDraft}
                className="bg-red-600 text-white dark:bg-red-50 dark:bg-red-9000 dark:text-white px-8 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg font-medium"
              >
                {isClearingDraft ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Limpando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5 mr-2" />
                    Limpar Rascunho
                  </>
                )}
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isSaving}
                className="bg-green-600 text-white dark:bg-green-50 dark:bg-green-9000 dark:text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Enviar Proposta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de Salvamento Manual - Fixo no canto inferior direito */}
      {lastSaved && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center space-x-2 bg-white shadow-lg dark:shadow-gray-900/50 border border-gray-200 rounded-lg px-3 py-2">
            <button
              onClick={() => {
                const now = new Date().toISOString();
                const draftData = {
                  titulares: titulares,
                  dependentes: dependentes,
                  isDraft: true,
                  lastSaved: now
                };

                const draftKey = `client_draft_${token}`;
                localStorage.setItem(draftKey, JSON.stringify(draftData));
                setLastSaved(now);
                showNotification('Rascunho salvo manualmente', 'success');
              }}
              disabled={isLoadingDraft}
              className="flex items-center px-3 py-2 bg-green-600 text-white dark:bg-green-50 dark:bg-green-9000 dark:text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              title="Salvar rascunho manualmente"
            >
              {isLoadingDraft ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Salvar Rascunho
                </>
              )}
            </button>
            <button
              onClick={handleClearDraft}
              disabled={isClearingDraft}
              className="flex items-center px-3 py-2 bg-red-600 text-white dark:bg-red-50 dark:bg-red-9000 dark:text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              title="Limpar rascunho salvo"
            >
              {isClearingDraft ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Limpar Rascunho
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProposalView;