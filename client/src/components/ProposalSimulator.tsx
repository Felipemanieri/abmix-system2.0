import { useState, useEffect, useRef } from 'react';
import { 
  TestTube, 
  Users, 
  Upload, 
  FileText, 
  Play, 
  CheckCircle, 
  AlertCircle,
  X,
  Plus,
  UserPlus,
  Building,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Hash,
  Clock,
  Save,
  Loader
} from 'lucide-react';

interface ProposalSimulatorProps {
  onSimulationCreated?: (result: any) => void;
}

interface SimulatedVendor {
  id: number;
  name: string;
  email: string;
}

interface SimulatedTitular {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  rg: string;
  nomeMae: string;
  estadoCivil: string;
  telefoneEmpresa: string;
  telefonePessoal: string;
  emailEmpresa: string;
  emailPessoal: string;
  enderecoCompleto: string;
  cep: string;
  peso: string;
  altura: string;
  dadosReembolso: string;
}

interface SimulatedDependente {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  parentesco: string;
  peso: string;
  altura: string;
}

const ProposalSimulator: React.FC<ProposalSimulatorProps> = ({ onSimulationCreated }) => {
  const [vendors, setVendors] = useState<SimulatedVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dados realistas pré-preenchidos
  const [proposalData, setProposalData] = useState({
    // Dados da empresa
    nomeEmpresa: 'Empresa Simulada LTDA',
    cnpj: '12.345.678/0001-90',
    valor: '2.500,00',
    planoContratado: 'Plano Premium',
    periodoMinimo: '12 meses',
    inicioVigencia: new Date().toISOString().split('T')[0],
    compulsorio: true,
    livreAdesao: false,
    odontoConjugado: true,
    aproveitamentoCongenere: false,
  });

  // Titular com dados realistas
  const [titular, setTitular] = useState<SimulatedTitular>({
    nomeCompleto: 'João Carlos da Silva',
    cpf: '123.456.789-10',
    dataNascimento: '1985-03-15',
    sexo: 'masculino',
    rg: '12.345.678-9',
    nomeMae: 'Maria da Silva Santos',
    estadoCivil: 'casado',
    telefoneEmpresa: '11 3456-7890',
    telefonePessoal: '11 98765-4321',
    emailEmpresa: 'joao.silva@empresasimulada.com.br',
    emailPessoal: 'joao.silva@gmail.com',
    enderecoCompleto: 'Rua das Flores, 123, Centro',
    cep: '01234-567',
    peso: '80',
    altura: '1.75',
    dadosReembolso: 'Banco do Brasil - Ag: 1234 - CC: 56789-0'
  });

  // Dependentes com dados realistas
  const [dependentes, setDependentes] = useState<SimulatedDependente[]>([
    {
      nomeCompleto: 'Ana Paula da Silva',
      cpf: '987.654.321-00',
      dataNascimento: '1988-07-22',
      sexo: 'feminino',
      parentesco: 'cônjuge',
      peso: '65',
      altura: '1.65'
    },
    {
      nomeCompleto: 'Pedro da Silva Junior',
      cpf: '456.789.123-45',
      dataNascimento: '2015-11-10',
      sexo: 'masculino',
      parentesco: 'filho',
      peso: '30',
      altura: '1.20'
    }
  ]);

  // Carregar vendedores disponíveis
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors');
        if (response.ok) {
          const vendorData = await response.json();
          setVendors(vendorData);
          if (vendorData.length > 0) {
            setSelectedVendor(vendorData[0].id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar vendedores:', error);
      }
    };
    fetchVendors();
  }, []);

  // Funções de drag and drop para anexos
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setAttachments(prev => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addDependente = () => {
    const newDependente: SimulatedDependente = {
      nomeCompleto: 'Novo Dependente',
      cpf: '000.000.000-00',
      dataNascimento: '2000-01-01',
      sexo: 'masculino',
      parentesco: 'filho',
      peso: '50',
      altura: '1.50'
    };
    setDependentes(prev => [...prev, newDependente]);
  };

  const removeDependente = (index: number) => {
    setDependentes(prev => prev.filter((_, i) => i !== index));
  };

  const simulateProposal = async () => {
    if (!selectedVendor) {
      alert('Selecione um vendedor para simular a proposta');
      return;
    }

    setIsSimulating(true);
    
    try {
      // Primeiro, criar a proposta
      const proposalPayload = {
        vendorId: selectedVendor,
        contractData: proposalData,
        titulares: [{ id: "1", ...titular }],
        dependentes: dependentes.map((dep, index) => ({ id: `dep-${index + 1}`, ...dep })),
        internalData: {
          reuniao: false,
          desconto: '',
          vendaDupla: false,
          nomeReuniao: '',
          origemVenda: 'Simulação Sistema',
          nomeVendaDupla: '',
          observacoesCliente: 'Proposta criada através do simulador do sistema para testes'
        }
      };

      console.log('🧪 Criando proposta simulada:', proposalPayload);

      const proposalResponse = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposalPayload)
      });

      if (!proposalResponse.ok) {
        throw new Error('Erro ao criar proposta');
      }

      const proposalResult = await proposalResponse.json();
      console.log('✅ Proposta criada:', proposalResult);

      // Depois, fazer upload dos anexos (se houver)
      if (attachments.length > 0) {
        for (const file of attachments) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('category', 'identity');

          await fetch(`/api/proposals/${proposalResult.id}/attachments`, {
            method: 'POST',
            body: formData
          });
        }
      }

      setSimulationResult(proposalResult);
      onSimulationCreated?.(proposalResult);

    } catch (error) {
      console.error('❌ Erro na simulação:', error);
      alert('Erro ao simular proposta. Verifique os logs.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Seleção de Vendedor */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Users className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
          Selecionar Vendedor
        </h4>
        <select
          value={selectedVendor || ''}
          onChange={(e) => setSelectedVendor(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
        >
          <option value="">Selecione um vendedor...</option>
          {vendors.map(vendor => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name} ({vendor.email})
            </option>
          ))}
        </select>
      </div>

      {/* Dados da Empresa */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Building className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
          Dados da Empresa
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={proposalData.nomeEmpresa}
              onChange={(e) => setProposalData(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CNPJ
            </label>
            <input
              type="text"
              value={proposalData.cnpj}
              onChange={(e) => setProposalData(prev => ({ ...prev, cnpj: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor
            </label>
            <input
              type="text"
              value={proposalData.valor}
              onChange={(e) => setProposalData(prev => ({ ...prev, valor: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plano Contratado
            </label>
            <input
              type="text"
              value={proposalData.planoContratado}
              onChange={(e) => setProposalData(prev => ({ ...prev, planoContratado: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Período Mínimo
            </label>
            <select
              value={proposalData.periodoMinimo}
              onChange={(e) => setProposalData(prev => ({ ...prev, periodoMinimo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="01 mês">01 mês</option>
              <option value="06 meses">06 meses</option>
              <option value="12 meses">12 meses</option>
              <option value="24 meses">24 meses</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Início da Vigência
            </label>
            <input
              type="date"
              value={proposalData.inicioVigencia}
              onChange={(e) => setProposalData(prev => ({ ...prev, inicioVigencia: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={proposalData.compulsorio}
              onChange={(e) => setProposalData(prev => ({ ...prev, compulsorio: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Compulsório</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={proposalData.livreAdesao}
              onChange={(e) => setProposalData(prev => ({ ...prev, livreAdesao: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Livre Adesão</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={proposalData.odontoConjugado}
              onChange={(e) => setProposalData(prev => ({ ...prev, odontoConjugado: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Odonto Conjugado</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={proposalData.aproveitamentoCongenere}
              onChange={(e) => setProposalData(prev => ({ ...prev, aproveitamentoCongenere: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Aproveitamento Congênere</span>
          </label>
        </div>
      </div>

      {/* Dados do Titular */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <User className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
          Titular
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={titular.nomeCompleto}
              onChange={(e) => setTitular(prev => ({ ...prev, nomeCompleto: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CPF
            </label>
            <input
              type="text"
              value={titular.cpf}
              onChange={(e) => setTitular(prev => ({ ...prev, cpf: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={titular.dataNascimento}
              onChange={(e) => setTitular(prev => ({ ...prev, dataNascimento: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Pessoal
            </label>
            <input
              type="email"
              value={titular.emailPessoal}
              onChange={(e) => setTitular(prev => ({ ...prev, emailPessoal: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Telefone Pessoal
            </label>
            <input
              type="text"
              value={titular.telefonePessoal}
              onChange={(e) => setTitular(prev => ({ ...prev, telefonePessoal: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CEP
            </label>
            <input
              type="text"
              value={titular.cep}
              onChange={(e) => setTitular(prev => ({ ...prev, cep: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Dependentes */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
            <UserPlus className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400" />
            Dependentes ({dependentes.length})
          </h4>
          <button
            onClick={addDependente}
            className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors text-sm flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </button>
        </div>

        {dependentes.map((dependente, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dependente {index + 1}
              </span>
              <button
                onClick={() => removeDependente(index)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={dependente.nomeCompleto}
                  onChange={(e) => {
                    const newDeps = [...dependentes];
                    newDeps[index].nomeCompleto = e.target.value;
                    setDependentes(newDeps);
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={dependente.cpf}
                  onChange={(e) => {
                    const newDeps = [...dependentes];
                    newDeps[index].cpf = e.target.value;
                    setDependentes(newDeps);
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Parentesco
                </label>
                <select
                  value={dependente.parentesco}
                  onChange={(e) => {
                    const newDeps = [...dependentes];
                    newDeps[index].parentesco = e.target.value;
                    setDependentes(newDeps);
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="cônjuge">Cônjuge</option>
                  <option value="filho">Filho(a)</option>
                  <option value="pai">Pai</option>
                  <option value="mãe">Mãe</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Anexos */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Upload className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
          Anexar Documentos ({attachments.length})
        </h4>

        {/* Área de drag and drop */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors text-sm"
          >
            Selecionar Arquivos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
        </div>

        {/* Lista de arquivos anexados */}
        {attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Arquivos Anexados:
            </h5>
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resultado da Simulação */}
      {simulationResult && (
        <div className="border border-emerald-200 dark:border-emerald-600 rounded-lg p-4 bg-emerald-50 dark:bg-emerald-900/20">
          <h4 className="text-md font-medium text-emerald-900 dark:text-emerald-100 mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Simulação Concluída com Sucesso
          </h4>
          <div className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
            <p><strong>ID da Proposta:</strong> {simulationResult.id}</p>
            <p><strong>ABM ID:</strong> {simulationResult.abmId}</p>
            <p><strong>Token do Cliente:</strong> {simulationResult.clientToken}</p>
            <p><strong>Empresa:</strong> {simulationResult.contractData?.nomeEmpresa}</p>
            <p><strong>Valor:</strong> R$ {simulationResult.contractData?.valor}</p>
            <p><strong>Titulares:</strong> {simulationResult.titulares?.length || 0}</p>
            <p><strong>Dependentes:</strong> {simulationResult.dependentes?.length || 0}</p>
          </div>
        </div>
      )}

      {/* Botão de Simulação */}
      <div className="flex justify-center pt-4">
        <button
          onClick={simulateProposal}
          disabled={isSimulating || !selectedVendor}
          className={`px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors ${
            isSimulating || !selectedVendor
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isSimulating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Simulando...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Simular Proposta Completa</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProposalSimulator;