import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building, FileText, DollarSign, Check, Copy, Plus, Trash2, Upload, Camera, User, Eye, EyeOff, Settings, Save, Send, Users, Phone, Mail, MapPin, Calendar, Calculator, CheckCircle, Download, Info, Lock } from 'lucide-react';
import { showNotification } from '../utils/notifications';
import { useRealTimeNotifications } from '../utils/realTimeSync';
import { buscarCEPLocal, formatarCEP } from '../utils/cepHandler';
import ProposalProgressTracker from './ProposalProgressTracker';
import ProfessionalLinkShare from './ProfessionalLinkShare';
import { useQuery } from '@tanstack/react-query';
import { realTimeIntegration } from '../services/RealTimeIntegration';

interface ProposalGeneratorProps {
  onBack: () => void;
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

interface QuotationData {
  numeroVidas: number;
  operadora: string;
  tipoPlano?: string;
  valor?: string;
  validade?: string;
  dataEnvio?: string;
  idades: number[];
}



interface ProposalGeneratorProps {
  onBack: () => void;
  currentVendor?: {
    id: number;
    name: string;
    email: string;
  };
}

const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({ onBack, currentVendor }) => {
  // Hook para notificações em tempo real
  const { notifyCreated } = useRealTimeNotifications();
  
  // Query para buscar vendedores em tempo real
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
    refetchInterval: 3000 // Atualiza a cada 3 segundos
  });
  
  const [contractData, setContractData] = useState<ContractData>({
    nomeEmpresa: '',
    cnpj: '',
    planoContratado: '',
    valor: '',
    periodoVigencia: { inicio: '', fim: '' },
    odontoConjugado: false,
    compulsorio: false,
    livreAdesao: false,
    inicioVigencia: '',
    periodoMinimo: '',
    aproveitamentoCongenere: false,
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

  const [internalData, setInternalData] = useState<InternalData>({
    reuniao: false,
    nomeReuniao: '',
    vendaDupla: false,
    nomeVendaDupla: '',
    desconto: '',
    origemVenda: '',
    autorizadorDesconto: '',
    observacoesFinanceiras: '',
    observacoesCliente: 'Lembre-se de enviar todos os documentos solicitados em boa qualidade. Para dúvidas sobre documentos específicos, entre em contato através do chat.'
  });


  const [showInternalFields, setShowInternalFields] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [vendorAttachments, setVendorAttachments] = useState<File[]>([]);
  const [contractFieldsReadOnly, setContractFieldsReadOnly] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(new Date().toISOString());
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isClearingDraft, setIsClearingDraft] = useState(false);

  // Estados para cotação
  const [quotationData, setQuotationData] = useState<QuotationData>({
    numeroVidas: 1,
    operadora: '',
    tipoPlano: '',
    valor: '',
    validade: '',
    dataEnvio: new Date().toISOString().split('T')[0],
    idades: [25]
  });
  const [arquivosAnexados, setArquivosAnexados] = useState<File[]>([]);
  const [cotacoesCadastradas, setCotacoesCadastradas] = useState<any[]>([]);

  // Estados para documentos necessários
  const documentosNecessarios = {
    cnpj: 'CNPJ',
    contratoSocial: 'Contrato social',
    rgCpf: 'RG/CPF de todos (pode ser CNH)',
    certidaoNascimento: 'Certidão de nascimento para menores de 12 anos',
    relatorioAlta: 'Relatório de alta / Declaração de saúde pediátrica (até 3 anos)',
    certidaoCasamento: 'Certidão de casamento',
    comprovanteResidencia: 'Comprovante de residência do(s) titular(es)',
    carteirinhas: 'Carteirinhas do plano atual',
    cartaPermanencia: 'Carta de permanência',
    analiticoPlano: 'Analítico do plano atual'
  };

  const [documentosRecebidos, setDocumentosRecebidos] = useState<Record<string, boolean>>({});

  // Carregar rascunho salvo quando o componente for montado
  useEffect(() => {
    if (currentVendor) {
      setIsLoadingDraft(true);
      const draftKey = `proposal_draft_${currentVendor.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          
          // Verificar se há dados realmente preenchidos
          const hasData = draftData.contractData?.nomeEmpresa || 
                          draftData.titulares?.some((t: any) => t.nomeCompleto) ||
                          draftData.dependentes?.some((d: any) => d.nomeCompleto);
          
          if (hasData) {
            // Restaurar dados do contrato
            if (draftData.contractData) {
              setContractData(draftData.contractData);
            }
            
            // Restaurar titulares
            if (draftData.titulares && draftData.titulares.length > 0) {
              setTitulares(draftData.titulares);
            }
            
            // Restaurar dependentes
            if (draftData.dependentes && draftData.dependentes.length > 0) {
              setDependentes(draftData.dependentes);
            }
            
            // Restaurar dados internos
            if (draftData.internalData) {
              setInternalData(draftData.internalData);
            }
            
            // Restaurar lastSaved
            if (draftData.lastSaved) {
              setLastSaved(draftData.lastSaved);
            }
          } else {
            // Se não há rascunho, definir um lastSaved inicial para mostrar o botão
            setLastSaved(new Date().toISOString());
            

          }
        } catch (error) {
          console.error('Erro ao carregar rascunho:', error);
        }
      }
      
      setIsLoadingDraft(false);
    }
  }, [currentVendor]);

  // Auto-save DESABILITADO temporariamente para corrigir problema dos campos sumindo
  // useEffect(() => {
  //   if (currentVendor && !isSubmitted && !isLoadingDraft && !isClearingDraft) {
  //     const timeoutId = setTimeout(() => {
  //       // Verificar se há dados realmente preenchidos antes de salvar
  //       const hasData = contractData.nomeEmpresa || 
  //                       titulares.some(t => t.nomeCompleto) ||
  //                       dependentes.some(d => d.nomeCompleto);
        
  //       if (hasData) {
  //         const now = new Date().toISOString();
  //         const draftData = {
  //           vendorId: currentVendor.id,
  //           contractData: contractData,
  //           titulares: titulares,
  //           dependentes: dependentes,
  //           internalData: internalData,
  //           attachments: vendorAttachments,
  //           isDraft: true,
  //           lastSaved: now
  //         };

  //         const draftKey = `proposal_draft_${currentVendor.id}`;
  //         localStorage.setItem(draftKey, JSON.stringify(draftData));
  //         setLastSaved(now);
  //       }
  //     }, 500); // Debounce de 500ms

  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [contractData, titulares, dependentes, internalData, vendorAttachments, currentVendor, isSubmitted, isLoadingDraft, isClearingDraft]);


  const planosDisponiveis = [
    'Plano Básico Ambulatorial',
    'Plano Hospitalar com Obstetrícia',
    'Plano Referência',
    'Plano Master',
    'Plano Executivo',
    'Plano Premium',
    'Plano Empresarial',
    'Plano Individual',
    'Plano Familiar'
  ];

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

  // Função para controlar documentos recebidos
  const handleDocumentoChange = async (documentoKey: string, received: boolean) => {
    setDocumentosRecebidos(prev => ({
      ...prev,
      [documentoKey]: received
    }));
    
    showNotification(
      received 
        ? 'Documento marcado como recebido' 
        : 'Documento desmarcado', 
      'success'
    );

    // Sincronizar com o servidor apenas se há uma proposta gerada
    if (generatedLink) {
      try {
        const clientToken = generatedLink.split('/').pop();
        await fetch(`/api/proposals/sync-documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clientToken,
            documentosRecebidos: {
              ...documentosRecebidos,
              [documentoKey]: received
            }
          })
        });
      } catch (error) {
        console.error('Erro ao sincronizar documentos:', error);
      }
    }
  };

  const handleClearDraft = () => {
    if (!currentVendor) return;
    
    setIsClearingDraft(true);
    
    const draftKey = `proposal_draft_${currentVendor.id}`;
    localStorage.removeItem(draftKey);
    setLastSaved(null);
    
    // Limpar todos os dados dos formulários
    setContractData({
      nomeEmpresa: '',
      cnpj: '',
      planoContratado: '',
      valor: '',
      periodoVigencia: { inicio: '', fim: '' },
      odontoConjugado: false,
      compulsorio: false,
      livreAdesao: false,
      inicioVigencia: '',
      periodoMinimo: '',
      aproveitamentoCongenere: false,
    });
    
    setTitulares([{
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
    
    setDependentes([]);
    
    setInternalData({
      reuniao: false,
      nomeReuniao: '',
      vendaDupla: false,
      nomeVendaDupla: '',
      desconto: '',
      origemVenda: '',
      autorizadorDesconto: '',
      observacoesFinanceiras: '',
      observacoesCliente: ''
    });
    
    setVendorAttachments([]);
    
    showNotification('Rascunho limpo com sucesso', 'success');
    
    setTimeout(() => {
      setIsClearingDraft(false);
    }, 1000);
  };

  const handleSave = async () => {
    if (!currentVendor) {
      showNotification('Erro: Vendedor não identificado', 'error');
      return;
    }

    try {
      const now = new Date().toISOString();
      const draftData = {
        vendorId: currentVendor.id,
        contractData: contractData,
        titulares: titulares,
        dependentes: dependentes,
        internalData: internalData,
        attachments: vendorAttachments,
        isDraft: true,
        lastSaved: now
      };

      // Salvar no localStorage para manter enquanto não finaliza
      const draftKey = `proposal_draft_${currentVendor.id}`;
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setLastSaved(now);

      showNotification('Proposta salva como rascunho com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      showNotification('Erro ao salvar rascunho', 'error');
    }
  };

  const handleSend = async () => {
    if (!contractData.nomeEmpresa || !contractData.cnpj || !contractData.planoContratado) {
      showNotification('Preencha os campos obrigatórios do contrato', 'error');
      return;
    }

    if (!currentVendor) {
      showNotification('Erro: Vendedor não identificado', 'error');
      return;
    }

    try {
      const proposalData = {
        vendorId: currentVendor.id,
        contractData: contractData,
        titulares: titulares,
        dependentes: dependentes,
        internalData: internalData,
        attachments: vendorAttachments,
        documentosRecebidos: documentosRecebidos
      };

      console.log('Enviando dados da proposta:', proposalData);

      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(proposalData)
      });

      console.log('Resposta da API:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro na resposta:', errorData);
        throw new Error(`Erro ao criar proposta: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('Resultado da API:', result);
      
      // Notificar criação da proposta para atualização em tempo real
      if (currentVendor?.id) {
        console.log('🚀 Notificando criação da proposta para atualização em tempo real');
        notifyCreated(currentVendor.id);
        
        // Limpar rascunho salvo após envio bem-sucedido
        const draftKey = `proposal_draft_${currentVendor.id}`;
        localStorage.removeItem(draftKey);
      }
      
      setGeneratedLink(result.clientFormLink);
      setShowProfessionalModal(true);
      showNotification('Link exclusivo da proposta gerado com sucesso!', 'success');
      
      // Sincronização automática com Google Drive e Sheets
      try {
        const realTimeIntegration = RealTimeIntegration.getInstance();
        await realTimeIntegration.onProposalCreated({
          id: result.id || Date.now().toString(),
          contractData: contractData,
          vendorName: currentVendor?.name || ''
        });
        showNotification('Sincronização com Google realizada!', 'success');
      } catch (syncError) {
        console.error('Erro na sincronização Google:', syncError);
      }
    } catch (error) {
      console.error('Erro ao gerar proposta:', error);
      console.error('Detalhes do erro:', error.message);
      showNotification(`Erro ao gerar link da proposta: ${error.message}`, 'error');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    showNotification('Link copiado para a área de transferência', 'success');
  };

  const shareByEmail = () => {
    const subject = `Proposta de Plano de Saúde - ${contractData.nomeEmpresa}`;
    const body = `Olá!\n\nSegue o link para preenchimento da proposta de plano de saúde:\n\nEmpresa: ${contractData.nomeEmpresa}\nPlano: ${contractData.planoContratado}\nValor: R$ ${contractData.valor}\n\nLink: ${generatedLink}\n\nPor favor, acesse o link e preencha todos os dados solicitados.\n\nQualquer dúvida, estou à disposição.\n\nAtenciosamente,`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
    showNotification('Abrindo cliente de e-mail...', 'success');
  };

  const shareByWhatsApp = () => {
    const mensagem = `🏥 *Proposta de Plano de Saúde*\n\n📋 *Empresa:* ${contractData.nomeEmpresa}\n📊 *Plano:* ${contractData.planoContratado}\n💰 *Valor:* R$ ${contractData.valor}\n\n🔗 *Link para preenchimento:*\n${generatedLink}\n\nPor favor, acesse o link e preencha todos os dados solicitados. Qualquer dúvida, estou aqui para ajudar! 😊`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
    showNotification('Abrindo WhatsApp...', 'success');
  };

  const shareByInternalMessage = () => {
    showNotification('Funcionalidade de mensagem interna será implementada em breve', 'info');
  };

  const generateSameLinkProposal = () => {
    // Manter APENAS os dados do contrato inalterados e torná-los somente leitura
    setTitulares([{
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
    
    setDependentes([]);
    
    // Resetar dados internos, mantendo apenas observações padrão
    setInternalData({
      reuniao: false,
      nomeReuniao: '',
      vendaDupla: false,
      nomeVendaDupla: '',
      desconto: '',
      origemVenda: '',
      autorizadorDesconto: '',
      observacoesFinanceiras: '',
      observacoesCliente: 'Lembre-se de enviar todos os documentos solicitados em boa qualidade. Para dúvidas sobre documentos específicos, entre em contato através do chat.'
    });
    
    // Limpar anexos
    setVendorAttachments([]);
    setArquivosAnexados([]);
    setCotacoesCadastradas([]);
    
    // Resetar cotação
    setQuotationData({
      numeroVidas: 1,
      operadora: '',
      tipoPlano: '',
      valor: '',
      validade: '',
      dataEnvio: new Date().toISOString().split('T')[0],
      idades: [25]
    });
    
    // Tornar campos do contrato somente leitura
    setContractFieldsReadOnly(true);
    setIsSubmitted(false);
    
    showNotification('Nova proposta iniciada! Os dados do contrato foram mantidos como somente leitura.', 'success');
  };

  const resetForm = () => {
    setContractData({
      nomeEmpresa: '',
      cnpj: '',
      planoContratado: '',
      valor: '',
      periodoVigencia: { inicio: '', fim: '' },
      odontoConjugado: false,
      compulsorio: false,
      inicioVigencia: '',
      aproveitamentoCongenere: false,
    });
    setTitulares([{
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
    setDependentes([]);
    setInternalData({
      reuniao: false,
      nomeReuniao: '',
      vendaDupla: false,
      nomeVendaDupla: '',
      desconto: '',
      origemVenda: '',
      autorizadorDesconto: '',
      observacoesFinanceiras: '',
      observacoesCliente: ''
    });
    setAttachments([]);
    setIsSubmitted(false);
    setGeneratedLink('');
    setShowProfessionalModal(false);
    setQuotationData({
      numeroVidas: 1,
      operadora: '',
      tipoPlano: '',
      valor: '',
      validade: '',
      dataEnvio: new Date().toISOString().split('T')[0],
      idades: [25]
    });
    setArquivosAnexados([]);
  };

  // Funções para cotação
  const addIdade = () => {
    setQuotationData(prev => ({
      ...prev,
      idades: [...prev.idades, 25]
    }));
  };

  const removeIdade = (index: number) => {
    if (quotationData.idades.length > 1) {
      setQuotationData(prev => ({
        ...prev,
        idades: prev.idades.filter((_, i) => i !== index)
      }));
    }
  };

  const updateIdade = (index: number, value: number) => {
    setQuotationData(prev => ({
      ...prev,
      idades: prev.idades.map((idade, i) => i === index ? value : idade)
    }));
  };

  const handleAnexarArquivo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const novosArquivos = Array.from(files);
      setArquivosAnexados(prev => [...prev, ...novosArquivos]);
      showNotification(`${novosArquivos.length} arquivo(s) anexado(s)!`, 'success');
    }
  };

  const removerArquivo = (index: number) => {
    setArquivosAnexados(prev => prev.filter((_, i) => i !== index));
    showNotification('Arquivo removido!', 'success');
  };

  const generateQuotation = () => {
    if (!quotationData.operadora || quotationData.idades.length === 0) {
      showNotification('Preencha todos os campos da cotação', 'error');
      return;
    }

    const baseValue = 150;
    const ageMultiplier = quotationData.idades.reduce((acc, idade) => {
      if (idade < 30) return acc + 1;
      if (idade < 50) return acc + 1.5;
      return acc + 2;
    }, 0);
    
    const totalValue = baseValue * ageMultiplier * quotationData.numeroVidas;
    showNotification(`Cotação gerada: R$ ${totalValue.toFixed(2)}`, 'success');
  };

  const limparFormulario = () => {
    setQuotationData({
      numeroVidas: 1,
      operadora: '',
      tipoPlano: '',
      valor: '',
      validade: '',
      dataEnvio: new Date().toISOString().split('T')[0],
      idades: [25]
    });
    setArquivosAnexados([]);
    showNotification('Formulário de cotação limpo!', 'success');
  };

  const gerarCotacao = () => {
    if (!quotationData.operadora || !quotationData.tipoPlano) {
      showNotification('Preencha a operadora e tipo de plano para gerar a cotação', 'error');
      return;
    }
    
    // Simular cálculo de cotação baseado em dados
    const valorBase = 180;
    const multiplicador = quotationData.numeroVidas * (quotationData.tipoPlano === 'Empresarial' ? 0.8 : 1);
    const valorCalculado = (valorBase * multiplicador).toFixed(2);
    
    setQuotationData(prev => ({ ...prev, valor: valorCalculado }));
    showNotification(`Cotação gerada: R$ ${valorCalculado}`, 'success');
  };

  const salvarCotacao = () => {
    if (!quotationData.operadora || !quotationData.tipoPlano || !quotationData.valor) {
      showNotification('Preencha todos os campos obrigatórios da cotação', 'error');
      return;
    }

    // Salvar no localStorage ou banco de dados
    const cotacaoSalva = {
      ...quotationData,
      dataHora: new Date().toISOString(),
      arquivos: arquivosAnexados.length
    };
    
    // Aqui você poderia salvar no banco de dados
    localStorage.setItem(`cotacao_${Date.now()}`, JSON.stringify(cotacaoSalva));
    showNotification('Cotação salva com sucesso!', 'success');
  };

  const baixarCotacao = () => {
    if (!quotationData.operadora || !quotationData.valor) {
      showNotification('Gere uma cotação antes de baixar', 'error');
      return;
    }

    // Criar conteúdo do arquivo
    const conteudo = `
COTAÇÃO DE PLANO DE SAÚDE
========================
Data: ${new Date().toLocaleDateString('pt-BR')}
Operadora: ${quotationData.operadora}
Tipo de Plano: ${quotationData.tipoPlano}
Número de Vidas: ${quotationData.numeroVidas}
Valor: R$ ${quotationData.valor}
Validade: ${quotationData.validade ? new Date(quotationData.validade).toLocaleDateString('pt-BR') : 'N/A'}
    `;

    // Criar e baixar arquivo
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cotacao_${quotationData.operadora}_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Cotação baixada com sucesso!', 'success');
  };

  const adicionarCotacao = () => {
    if (!quotationData.operadora || !quotationData.tipoPlano || !quotationData.valor) {
      showNotification('Preencha todos os campos obrigatórios da cotação', 'error');
      return;
    }

    const novaCotacao = {
      id: Date.now().toString(),
      operadora: quotationData.operadora,
      tipoPlano: quotationData.tipoPlano,
      numeroVidas: quotationData.numeroVidas,
      valor: quotationData.valor,
      validade: quotationData.validade || '',
      dataEnvio: quotationData.dataEnvio || new Date().toISOString().split('T')[0],
      arquivos: arquivosAnexados.length
    };

    setCotacoesCadastradas(prev => [...prev, novaCotacao]);
    
    // Limpar formulário após adicionar
    setQuotationData({
      numeroVidas: 1,
      operadora: '',
      tipoPlano: '',
      valor: '',
      validade: '',
      dataEnvio: new Date().toISOString().split('T')[0],
      idades: [25]
    });
    setArquivosAnexados([]);
    
    showNotification('Cotação salva com sucesso!', 'success');
  };

  const removerCotacao = (id: string) => {
    setCotacoesCadastradas(prev => prev.filter(cotacao => cotacao.id !== id));
    showNotification('Cotação removida!', 'success');
  };

  const enviarWhatsApp = (cotacao: any) => {
    const mensagem = `Olá! Segue cotação:\n\nOperadora: ${cotacao.operadora}\nTipo: ${cotacao.tipoPlano}\nNº de vidas: ${cotacao.numeroVidas}\nValor: R$ ${cotacao.valor}\nValidade: ${cotacao.validade}\nData de Envio: ${cotacao.dataEnvio}\nArquivos: ${cotacao.arquivos} anexo(s)\n\nQualquer dúvida, estou à disposição!`;
    
    const numeroWhatsApp = '5511999999999';
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    showNotification('Redirecionando para WhatsApp...', 'success');
  };

  const downloadQuotation = () => {
    if (!quotationData.operadora || quotationData.idades.length === 0) {
      showNotification('Preencha todos os campos da cotação', 'error');
      return;
    }
    showNotification('Download da cotação iniciado!', 'success');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderPersonForm = (person: PersonData, type: 'titular' | 'dependente', index: number) => (
    <div key={person.id} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            placeholder="Nome completo sem abreviações"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            CPF *
          </label>
          <input
            type="text"
            value={person.cpf}
            onChange={(e) => {
              if (type === 'titular') {
                updateTitular(index, 'cpf', e.target.value);
              } else {
                updateDependente(index, 'cpf', e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            placeholder="000.000.000-00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            placeholder="00.000.000-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        {type === 'dependente' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parentesco *
            </label>
            <select
              value={person.parentesco || ''}
              onChange={(e) => updateDependente(index, 'parentesco', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            placeholder="Nome completo da mãe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          >
            <option value="">Selecione</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          >
            <option value="">Selecione</option>
            <option value="solteiro">Solteiro(a)</option>
            <option value="casado">Casado(a)</option>
            <option value="divorciado">Divorciado(a)</option>
            <option value="viuvo">Viúvo(a)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            placeholder="Ex: 70"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            placeholder="Ex: 170"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            placeholder="email@exemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            placeholder="email@empresa.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            placeholder="(00) 0000-0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            placeholder="00000-000"
            maxLength={9}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            placeholder="Rua, número, complemento, bairro, cidade, estado"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            rows={3}
            placeholder="Banco, agência, conta, PIX..."
          />
        </div>
      </div>
    </div>
  );



  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:text-gray-200 dark:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Dashboard
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Nova Proposta de Plano de Saúde
              </h1>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Preencha todos os dados para gerar uma proposta completa
              </p>
            </div>

          </div>
        </div>

        {/* Barra de Progresso */}
        <ProposalProgressTracker
          contractData={contractData}
          titulares={titulares}
          dependentes={dependentes}
          attachments={[]}
          className="mb-6"
        />

        <div className="space-y-8">
          {/* Dados do Contrato */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Building className="w-5 h-5 text-gray-600 dark:text-gray-600 dark:text-gray-300 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Dados do Contrato
                </h2>
              </div>
              {contractFieldsReadOnly && (
                <div className="flex items-center px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <Lock className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-700 font-medium">
                    Dados fixos - não editáveis
                  </span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={contractData.nomeEmpresa}
                  onChange={(e) => setContractData(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
                  readOnly={contractFieldsReadOnly}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg ${
                    contractFieldsReadOnly 
                      ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400 dark:text-gray-500' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent'
                  }`}
                  placeholder="Ex: Empresa ABC Ltda"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CNPJ *
                </label>
                <input
                  type="text"
                  value={contractData.cnpj}
                  onChange={(e) => setContractData(prev => ({ ...prev, cnpj: e.target.value }))}
                  readOnly={contractFieldsReadOnly}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg ${
                    contractFieldsReadOnly 
                      ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400 dark:text-gray-500' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent'
                  }`}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plano Contratado *
                </label>
                <input
                  type="text"
                  value={contractData.planoContratado}
                  onChange={(e) => setContractData(prev => ({ ...prev, planoContratado: e.target.value }))}
                  readOnly={contractFieldsReadOnly}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg ${
                    contractFieldsReadOnly 
                      ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400 dark:text-gray-500' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent'
                  }`}
                  placeholder="Ex: Plano Empresarial Premium - Cobertura Nacional"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor Mensal (R$) *
                </label>
                <input
                  type="text"
                  value={contractData.valor}
                  onChange={(e) => setContractData(prev => ({ ...prev, valor: e.target.value }))}
                  readOnly={contractFieldsReadOnly}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg ${
                    contractFieldsReadOnly 
                      ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400 dark:text-gray-500' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent'
                  }`}
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Início da Vigência *
                </label>
                <input
                  type="date"
                  value={contractData.inicioVigencia}
                  onChange={(e) => setContractData(prev => ({ ...prev, inicioVigencia: e.target.value }))}
                  readOnly={contractFieldsReadOnly}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg ${
                    contractFieldsReadOnly 
                      ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400 dark:text-gray-500' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período mínimo de vigência *
                </label>
                <select
                  value={contractData.periodoMinimo || ''}
                  onChange={(e) => setContractData(prev => ({ ...prev, periodoMinimo: e.target.value }))}
                  disabled={contractFieldsReadOnly}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg ${
                    contractFieldsReadOnly 
                      ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400 dark:text-gray-500' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent'
                  }`}
                >
                  <option value="">Selecione o período</option>
                  <option value="01 mês">01 mês</option>
                  <option value="12 meses">12 meses</option>
                  <option value="24 meses">24 meses</option>
                  <option value="36 meses">36 meses</option>
                </select>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="odontoConjugado"
                    checked={contractData.odontoConjugado}
                    onChange={(e) => setContractData(prev => ({ ...prev, odontoConjugado: e.target.checked }))}
                    disabled={contractFieldsReadOnly}
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 ${
                      contractFieldsReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <label htmlFor="odontoConjugado" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Inclui cobertura odontológica
                  </label>
                </div>
                
                <div className="flex items-center space-x-8">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="livreAdesao"
                      checked={contractData.livreAdesao}
                      onChange={(e) => setContractData(prev => ({ ...prev, livreAdesao: e.target.checked }))}
                      disabled={contractFieldsReadOnly}
                      className={`w-4 h-4 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 ${
                        contractFieldsReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    <label htmlFor="livreAdesao" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Livre adesão
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="compulsorio"
                      checked={contractData.compulsorio}
                      onChange={(e) => setContractData(prev => ({ ...prev, compulsorio: e.target.checked }))}
                      disabled={contractFieldsReadOnly}
                      className={`w-4 h-4 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 ${
                        contractFieldsReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    <label htmlFor="compulsorio" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Compulsório
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="aproveitamentoCongenere"
                    checked={contractData.aproveitamentoCongenere}
                    onChange={(e) => setContractData(prev => ({ ...prev, aproveitamentoCongenere: e.target.checked }))}
                    disabled={contractFieldsReadOnly}
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 ${
                      contractFieldsReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <label htmlFor="aproveitamentoCongenere" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Dados dos Titulares
                </h2>
              </div>
              <button
                onClick={adicionarTitular}
                className="flex items-center px-4 py-2 bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-150 transition-colors"
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Dependentes
                </h2>
              </div>
              <button
                onClick={adicionarDependente}
                className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-150 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Dependente
              </button>
            </div>
            
            {dependentes.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-white">Nenhum dependente adicionado</p>
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

          {/* Controles Internos do Vendedor */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Controles Internos
                </h2>
              </div>
              <button
                onClick={() => setShowInternalFields(!showInternalFields)}
                className="flex items-center text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
              >
                {showInternalFields ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Mostrar
                  </>
                )}
              </button>
            </div>

            {showInternalFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="reuniao"
                    checked={internalData.reuniao}
                    onChange={(e) => setInternalData(prev => ({ ...prev, reuniao: e.target.checked }))}
                    className="w-4 h-4 text-gray-600 border-gray-300 dark:border-gray-600 rounded focus:ring-gray-500"
                  />
                  <label htmlFor="reuniao" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Venda em reunião
                  </label>
                </div>

                {internalData.reuniao && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome da Reunião
                    </label>
                    <select
                      value={internalData.nomeReuniao}
                      onChange={(e) => setInternalData(prev => ({ ...prev, nomeReuniao: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="">Selecione o vendedor para a reunião</option>
                      {vendors.map((vendor: any) => (
                        <option key={vendor.id} value={vendor.name}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="vendaDupla"
                    checked={internalData.vendaDupla}
                    onChange={(e) => setInternalData(prev => ({ ...prev, vendaDupla: e.target.checked }))}
                    className="w-4 h-4 text-gray-600 border-gray-300 dark:border-gray-600 rounded focus:ring-gray-500"
                  />
                  <label htmlFor="vendaDupla" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Venda dupla
                  </label>
                </div>

                {internalData.vendaDupla && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome do Parceiro
                    </label>
                    <select
                      value={internalData.nomeVendaDupla}
                      onChange={(e) => setInternalData(prev => ({ ...prev, nomeVendaDupla: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="">Selecione o vendedor parceiro</option>
                      {vendors.filter((vendor: any) => vendor.id !== currentVendor?.id).map((vendor: any) => (
                        <option key={vendor.id} value={vendor.name}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Desconto (%)
                  </label>
                  <select
                    value={internalData.desconto}
                    onChange={(e) => setInternalData(prev => ({ ...prev, desconto: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">Selecione o desconto</option>
                    <option value="5%">5%</option>
                    <option value="10%">10%</option>
                    <option value="15%">15%</option>
                    <option value="20%">20%</option>
                    <option value="30%">30%</option>
                    <option value="40%">40%</option>
                    <option value="50%">50%</option>
                    <option value="60%">60%</option>
                    <option value="70%">70%</option>
                    <option value="80%">80%</option>
                    <option value="90%">90%</option>
                    <option value="100%">100%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Origem da Venda
                  </label>
                  <select
                    value={internalData.origemVenda}
                    onChange={(e) => setInternalData(prev => ({ ...prev, origemVenda: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">Selecione a origem</option>
                    <option value="Base Abmix">Base Abmix</option>
                    <option value="Lead Campanha">Lead Campanha</option>
                    <option value="Lead Supervisor">Lead Supervisor</option>
                    <option value="Indicação Pós Venda">Indicação Pós Venda</option>
                    <option value="Indicação Cliente">Indicação Cliente</option>
                    <option value="SITE">SITE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Autorizador do Desconto
                  </label>
                  <select
                    value={internalData.autorizadorDesconto}
                    onChange={(e) => setInternalData(prev => ({ ...prev, autorizadorDesconto: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">Selecione o autorizador</option>
                    <option value="Michelle Manieri">Michelle Manieri</option>
                    <option value="Carol Almeida">Carol Almeida</option>
                    <option value="Rod Ribas">Rod Ribas</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Observações Financeiras
                  </label>
                  <textarea
                    value={internalData.observacoesFinanceiras}
                    onChange={(e) => setInternalData(prev => ({ ...prev, observacoesFinanceiras: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    rows={3}
                    placeholder="Observações para o setor financeiro..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Observações para o Cliente */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Info className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Observações para o Cliente
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Escreva instruções específicas que aparecerão para o cliente ao completar a proposta.
              </p>
              
              <textarea
                value={internalData.observacoesCliente}
                onChange={(e) => setInternalData(prev => ({ ...prev, observacoesCliente: e.target.value }))}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Exemplo: Lembre-se de enviar todos os documentos em boa qualidade. Para dúvidas específicas, entre em contato através do chat..."
              />
              
              <div className="flex items-start space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <Info className="w-4 h-4 text-gray-600 dark:text-gray-300 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Estas observações aparecerão</strong> na seção "Observações do Vendedor" quando o cliente acessar o formulário de preenchimento de dados.
                </p>
              </div>
            </div>
          </div>

          {/* Seção de Cotações */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <Calculator className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Anexar Cotação
              </h2>
            </div>

            {/* Área de Upload com Drag & Drop */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg p-8 text-center mb-4">
              <input
                type="file"
                multiple
                onChange={handleAnexarArquivo}
                className="hidden"
                id="file-upload-cotacao"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-upload-cotacao" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 dark:text-white mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Arraste arquivos aqui ou escolha uma opção
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-white">
                  Suporte para PDF, DOC, DOCX, JPG, PNG - Sem limite de quantidade
                </p>
              </label>
            </div>

            {/* Botões de Upload */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <label htmlFor="escolher-arquivo" className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleAnexarArquivo}
                  className="hidden"
                  id="escolher-arquivo"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <FileText className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Escolher Arquivo</span>
                <span className="text-xs text-gray-500">Do computador/celular</span>
              </label>

              <label htmlFor="tirar-foto" className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleAnexarArquivo}
                  className="hidden"
                  id="tirar-foto"
                />
                <Camera className="w-8 h-8 text-gray-700 dark:text-gray-300 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tirar Foto</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Câmera do dispositivo</span>
              </label>

              <label htmlFor="da-galeria" className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAnexarArquivo}
                  className="hidden"
                  id="da-galeria"
                />
                <User className="w-8 h-8 text-gray-600 dark:text-gray-300 mb-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Da Galeria</span>
                <span className="text-xs text-gray-600 dark:text-gray-300">Fotos salvas</span>
              </label>
            </div>

            {/* Formulário de Cotação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Operadora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Operadora *
                </label>
                <select
                  value={quotationData.operadora}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, operadora: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <option value="">Selecione a operadora</option>
                  <option value="Amil">Amil</option>
                  <option value="Bradesco">Bradesco</option>
                  <option value="Sulamérica">Sulamérica</option>
                  <option value="Porto Seguro">Porto Seguro</option>
                  <option value="Omint">Omint</option>
                  <option value="Careplus">Careplus</option>
                  <option value="Hapvida">Hapvida</option>
                  <option value="Alice">Alice</option>
                  <option value="Seguros Unimed">Seguros Unimed</option>
                </select>
              </div>

              {/* Tipo do Plano */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo do Plano *
                </label>
                <select
                  value={quotationData.tipoPlano || ''}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, tipoPlano: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="Empresarial">Empresarial</option>
                  <option value="Individual">Individual</option>
                  <option value="Adesão">Adesão</option>
                  <option value="Familiar">Familiar</option>
                </select>
              </div>

              {/* Número de Vidas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Vidas *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quotationData.numeroVidas}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, numeroVidas: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="1"
                />
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor (R$) *
                </label>
                <input
                  type="text"
                  value={quotationData.valor || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d.,]/g, '');
                    setQuotationData(prev => ({ ...prev, valor: value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Ex: 1.250,00"
                />
              </div>

              {/* Validade da Cotação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Validade da Cotação *
                </label>
                <input
                  type="date"
                  value={quotationData.validade || ''}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, validade: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>

              {/* Data de Envio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data de Envio *
                </label>
                <input
                  type="date"
                  value={quotationData.dataEnvio || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, dataEnvio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Lista de Arquivos Anexados */}
            {arquivosAnexados.length > 0 && (
              <div className="mb-6 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Arquivos Anexados ({arquivosAnexados.length})
                </p>
                <div className="space-y-2">
                  {arquivosAnexados.map((arquivo, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-white mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{arquivo.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-white ml-2">({formatFileSize(arquivo.size)})</span>
                      </div>
                      <button
                        onClick={() => removerArquivo(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de Cotação */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={adicionarCotacao}
                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-150 transition-colors font-medium shadow-md text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cotação
              </button>
              <button
                onClick={limparFormulario}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-md hover:bg-gray-150 transition-colors font-medium shadow-md text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Formulário
              </button>
              <button
                onClick={gerarCotacao}
                className="flex items-center px-4 py-2 bg-green-100 text-green-700 border border-green-200 rounded-md hover:bg-green-150 transition-colors font-medium shadow-md text-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Gerar Cotação
              </button>
              <button
                onClick={salvarCotacao}
                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-150 transition-colors font-medium shadow-md text-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Cotação
              </button>
              <button
                onClick={baixarCotacao}
                className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 border border-purple-200 rounded-md hover:bg-purple-150 transition-colors font-medium shadow-md text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Cotação
              </button>
            </div>
          </div>

          {/* Seção Documentos Necessários */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Documentos Necessários
              </h3>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                {Object.values(documentosRecebidos || {}).filter(Boolean).length} de {Object.keys(documentosNecessarios).length} recebidos
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(documentosNecessarios).map(([key, documento]) => (
                <div key={key} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input
                    type="checkbox"
                    id={`doc-${key}`}
                    checked={documentosRecebidos?.[key] || false}
                    onChange={(e) => handleDocumentoChange(key, e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 accent-green-600"
                  />
                  <label
                    htmlFor={`doc-${key}`}
                    className={`text-sm cursor-pointer ${
                      documentosRecebidos?.[key]
                        ? 'text-green-600 dark:text-green-400 line-through'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {documento}
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>* Marque os documentos conforme for recebendo. Os documentos marcados não aparecerão mais no painel do cliente.</p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end">
            <button
              onClick={handleSend}
              className="flex items-center px-6 py-3 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-150 transition-colors font-medium"
            >
              <Send className="w-4 h-4 mr-2" />
              Gerar Link para Cliente
            </button>
          </div>
        </div>
      </div>

      {/* Modal Profissional de Compartilhamento */}
      {showProfessionalModal && (
        <ProfessionalLinkShare
          clientLink={generatedLink}
          clientName={contractData.nomeEmpresa}
          onClose={() => setShowProfessionalModal(false)}
          onGenerateNewProposal={generateSameLinkProposal}
        />
      )}

      {/* Indicador de Salvamento Automático - Fixo no canto inferior direito */}
      {lastSaved && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
              <button
                onClick={() => {
                  if (currentVendor) {
                    const now = new Date().toISOString();
                    const draftData = {
                      vendorId: currentVendor.id,
                      contractData: contractData,
                      titulares: titulares,
                      dependentes: dependentes,
                      internalData: internalData,
                      attachments: vendorAttachments,
                      isDraft: true,
                      lastSaved: now
                    };

                    const draftKey = `proposal_draft_${currentVendor.id}`;
                    localStorage.setItem(draftKey, JSON.stringify(draftData));
                    setLastSaved(now);
                    showNotification('Rascunho salvo manualmente', 'success');
                  }
                }}
                className="flex items-center hover:text-green-700 dark:hover:text-green-300 transition-colors"
                title="Salvar rascunho manualmente"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                <span>Salvo às {new Date(lastSaved).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </button>
            </div>
            <button
              onClick={handleClearDraft}
              className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-white hover:text-red-600 p-1 rounded transition-colors"
              title="Limpar rascunho salvo"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalGenerator;