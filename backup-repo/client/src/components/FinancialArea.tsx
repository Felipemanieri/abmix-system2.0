import React, { useState } from 'react';
import { DollarSign, TrendingUp, CheckCircle, AlertCircle, Eye, Send, Calendar, FileText, User, Download, Mail, MessageSquare, Share2, Link, ExternalLink, Search, Filter, Clock, Zap, ArrowRight, X, Copy, Trash2, Edit, Plus, BarChart3, CreditCard, PieChart, Wallet, Calculator } from 'lucide-react';
import ActionButtons from './ActionButtons';
import FinancialAutomationModal from './FinancialAutomationModal';

interface Proposal {
  id: string;
  client: string;
  vendor: string;
  plan: string;
  value: string;
  status: 'pending_validation' | 'validated' | 'sent_to_automation';
  submissionDate: string;
  documents: number;
  observations?: string;
  email?: string;
  phone?: string;
}

const FinancialArea: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState('pending_validation');
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [observations, setObservations] = useState('');
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [selectedProposalForAutomation, setSelectedProposalForAutomation] = useState<Proposal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showFinancialStats, setShowFinancialStats] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showCategoryPerformance, setShowCategoryPerformance] = useState(true);

  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 'VEND001-PROP123',
      client: 'Empresa ABC Ltda',
      vendor: 'Ana Caroline',
      plan: 'Plano Empresarial Premium',
      value: 'R$ 1.250,00',
      status: 'pending_validation',
      submissionDate: '2024-01-15',
      documents: 8,
      email: 'contato@empresaabc.com.br',
      phone: '11999999999'
    },
    {
      id: 'VEND002-PROP124',
      client: 'Tech Solutions SA',
      vendor: 'Bruna Garcia',
      plan: 'Plano Família Básico',
      value: 'R$ 650,00',
      status: 'pending_validation',
      submissionDate: '2024-01-14',
      documents: 6,
      email: 'contato@techsolutions.com.br',
      phone: '11888888888'
    },
    {
      id: 'VEND001-PROP125',
      client: 'Consultoria XYZ',
      vendor: 'Ana Caroline',
      plan: 'Plano Individual',
      value: 'R$ 320,00',
      status: 'validated',
      submissionDate: '2024-01-13',
      documents: 5,
      observations: 'Documentação completa e validada',
      email: 'contato@consultoriaxyz.com.br',
      phone: '11777777777'
    },
    {
      id: 'VEND003-PROP126',
      client: 'Inovação Digital',
      vendor: 'Carlos Silva',
      plan: 'Plano Empresarial',
      value: 'R$ 890,00',
      status: 'sent_to_automation',
      submissionDate: '2024-01-12',
      documents: 7,
      observations: 'Enviado para automação Make/Zapier',
      email: 'contato@inovacaodigital.com.br',
      phone: '11666666666'
    },
    {
      id: 'VEND004-PROP127',
      client: 'Startup Moderna',
      vendor: 'Diana Santos',
      plan: 'Plano Família Premium',
      value: 'R$ 980,00',
      status: 'pending_validation',
      submissionDate: '2024-01-11',
      documents: 9,
      email: 'contato@startupmoderna.com.br',
      phone: '11555555555'
    },
    {
      id: 'VEND005-PROP128',
      client: 'Consultoria Avançada',
      vendor: 'Eduardo Lima',
      plan: 'Plano Individual Plus',
      value: 'R$ 450,00',
      status: 'validated',
      submissionDate: '2024-01-10',
      documents: 6,
      observations: 'Aguardando envio para automação',
      email: 'contato@consultoriaavancada.com.br',
      phone: '11444444444'
    },
    {
      id: 'VEND006-PROP129',
      client: 'Empresa Tecnológica',
      vendor: 'Fernanda Oliveira',
      plan: 'Plano Empresarial Premium',
      value: 'R$ 1.450,00',
      status: 'pending_validation',
      submissionDate: '2024-01-09',
      documents: 10,
      email: 'contato@empresatecnologica.com.br',
      phone: '11333333333'
    }
  ]);

  const financialStats = [
    {
      name: 'Aguardando Validação',
      value: proposals.filter(p => p.status === 'pending_validation').length.toString(),
      change: 'Para revisar',
      changeType: 'warning',
      icon: AlertCircle,
      color: 'orange',
    },
    {
      name: 'Validadas Hoje',
      value: proposals.filter(p => p.status === 'validated').length.toString(),
      change: 'Prontas para envio',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'green',
    },
    {
      name: 'Enviadas p/ Automação',
      value: proposals.filter(p => p.status === 'sent_to_automation').length.toString(),
      change: 'Processadas',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      name: 'Valor Total Validado',
      value: 'R$ 3.110,00',
      change: 'Este mês',
      changeType: 'positive',
      icon: DollarSign,
      color: 'blue',
    },
  ];

  const categoryStats = [
    { name: 'Planos Empresariais', value: 'R$ 28.500', percentage: 62 },
    { name: 'Planos Familiares', value: 'R$ 12.800', percentage: 28 },
    { name: 'Planos Individuais', value: 'R$ 4.380', percentage: 10 },
  ];

  const validateProposal = (proposalId: string) => {
    setProposals(prev => prev.map(proposal => 
      proposal.id === proposalId 
        ? { ...proposal, status: 'validated', observations }
        : proposal
    ));
    setSelectedProposal(null);
    setObservations('');
    showNotification('Proposta validada com sucesso!', 'success');
  };

  const sendToAutomation = (proposalId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
      setSelectedProposalForAutomation(proposal);
      setShowAutomationModal(true);
    }
  };

  const handleAutomationComplete = () => {
    if (selectedProposalForAutomation) {
      setProposals(prev => prev.map(proposal => 
        proposal.id === selectedProposalForAutomation.id 
          ? { 
              ...proposal, 
              status: 'sent_to_automation',
              observations: observations || 'Enviado para automação Make/Zapier'
            }
          : proposal
      ));
    }
    setShowAutomationModal(false);
    setSelectedProposalForAutomation(null);
    setSelectedProposal(null);
    setObservations('');
    showNotification('Proposta enviada para automação com sucesso!', 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_validation':
        return 'bg-orange-100 text-orange-800';
      case 'validated':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'sent_to_automation':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 dark:text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_validation':
        return 'Aguardando Validação';
      case 'validated':
        return 'Validado';
      case 'sent_to_automation':
        return 'Enviado p/ Automação';
      default:
        return 'Desconhecido';
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    // Filtrar por status
    if (selectedStatus !== 'all' && proposal.status !== selectedStatus) {
      return false;
    }
    
    // Filtrar por termo de busca
    if (searchTerm && !proposal.client.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !proposal.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !proposal.vendor.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtrar por data
    if (filterDate && proposal.submissionDate !== filterDate) {
      return false;
    }
    
    return true;
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg dark:shadow-gray-900/50 text-white font-medium ${
      type === 'success' ? 'bg-green-50 dark:bg-green-9000' : 
      type === 'error' ? 'bg-red-50 dark:bg-red-9000' : 'bg-blue-50 dark:bg-blue-9000'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Área Financeira</h1>
        <p className="text-teal-100">Valide propostas e controle o fluxo para automação</p>
      </div>

      {/* Stats Grid */}
      {showFinancialStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {financialStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'warning' ? 'text-orange-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <Calculator className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Calculadora</h3>
                <p className="text-sm text-gray-500 dark:text-white">Cálculos financeiros</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Análises</h3>
                <p className="text-sm text-gray-500 dark:text-white">Gráficos e métricas</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Projeções</h3>
                <p className="text-sm text-gray-500 dark:text-white">Previsões financeiras</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                <Wallet className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Fluxo de Caixa</h3>
                <p className="text-sm text-gray-500 dark:text-white">Controle financeiro</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Performance */}
      {showCategoryPerformance && (
        <div className="bg-white rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance por Categoria</h2>
          <div className="space-y-4">
            {categoryStats.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-50 dark:bg-green-9000 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 dark:bg-gray-600 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-50 dark:bg-green-9000 h-2 rounded-full" 
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">{category.value}</span>
                  <span className="text-sm text-gray-500 dark:text-white w-12 text-right">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Propostas para Validação</h2>
            <p className="text-sm text-gray-600">Gerencie o fluxo de validação financeira</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 dark:text-white" />
              <input
                type="text"
                placeholder="Buscar propostas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="pending_validation">Aguardando Validação</option>
              <option value="validated">Validadas</option>
              <option value="sent_to_automation">Enviadas p/ Automação</option>
              <option value="all">Todas</option>
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button 
              onClick={() => {setSearchTerm(''); setFilterDate(''); setSelectedStatus('all');}}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:bg-gray-600 transition-colors"
            >
              <Filter className="w-4 h-4 inline mr-1" />
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Proposta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Documentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{proposal.client}</div>
                      <div className="text-sm text-gray-500 dark:text-white">{proposal.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm text-gray-900">{proposal.vendor}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{proposal.plan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{proposal.value}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                      {getStatusText(proposal.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 dark:text-white mr-1" />
                      <span className="text-sm text-gray-900">{proposal.documents}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">
                    {new Date(proposal.submissionDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ActionButtons 
                      onView={() => setSelectedProposal(proposal.id)}
                      onCopyLink={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/proposta/${proposal.id}`);
                        showNotification('Link copiado para a área de transferência!', 'success');
                      }}
                      onWhatsApp={() => window.open(`https://wa.me/55${proposal.phone}?text=${encodeURIComponent(`Olá! Sobre a proposta ${proposal.id}...`)}`)}
                      onEmail={() => window.open(`mailto:${proposal.email}?subject=Proposta ${proposal.id}`)}
                      onDownload={() => showNotification('Baixando documentos da proposta...', 'success')}
                      onExternalLink={() => window.open(`${window.location.origin}/proposta/${proposal.id}`, '_blank')}
                      onMessage={() => showNotification('Enviando mensagem interna...', 'info')}
                      onSend={proposal.status === 'validated' ? () => sendToAutomation(proposal.id) : undefined}
                      onShare={() => {
                        navigator.share?.({
                          title: `Proposta ${proposal.id}`,
                          text: `Proposta para ${proposal.client}`,
                          url: `${window.location.origin}/proposta/${proposal.id}`
                        }) || showNotification('Compartilhando proposta...', 'info');
                      }}
                      onAutomate={proposal.status === 'validated' ? () => sendToAutomation(proposal.id) : undefined}
                      onApprove={proposal.status === 'pending_validation' ? () => {
                        validateProposal(proposal.id);
                        showNotification('Proposta aprovada com sucesso!', 'success');
                      } : undefined}
                      onReject={proposal.status === 'pending_validation' ? () => {
                        showNotification('Proposta rejeitada. Notificação enviada ao vendedor.', 'error');
                      } : undefined}
                      onForward={() => showNotification('Proposta encaminhada para análise adicional', 'info')}
                      onEdit={() => showNotification('Editando proposta...', 'info')}
                      onDelete={() => {
                        if (confirm(`Tem certeza que deseja excluir a proposta ${proposal.id}?`)) {
                          showNotification('Proposta excluída com sucesso', 'success');
                        }
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Validação da Proposta
                </h3>
                <button 
                  onClick={() => setSelectedProposal(null)}
                  className="text-gray-400 dark:text-gray-500 dark:text-white hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {(() => {
                const proposal = proposals.find(p => p.id === selectedProposal);
                if (!proposal) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Cliente:</span>
                        <span className="ml-2">{proposal.client}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Vendedor:</span>
                        <span className="ml-2">{proposal.vendor}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Plano:</span>
                        <span className="ml-2">{proposal.plan}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Valor:</span>
                        <span className="ml-2">{proposal.value}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                          {getStatusText(proposal.status)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Data:</span>
                        <span className="ml-2">{new Date(proposal.submissionDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="ml-2">{proposal.email}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Telefone:</span>
                        <span className="ml-2">{proposal.phone}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Documentos</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">RG/CPF</span>
                          <span className="text-sm text-green-600">✓ Verificado</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Comprovante de Residência</span>
                          <span className="text-sm text-green-600">✓ Verificado</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Carteirinha Plano Atual</span>
                          <span className="text-sm text-green-600">✓ Verificado</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Contrato Social</span>
                          <span className="text-sm text-green-600">✓ Verificado</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Declaração de Saúde</span>
                          <span className="text-sm text-green-600">✓ Verificado</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Comprovante de Faturamento</span>
                          <span className="text-sm text-green-600">✓ Verificado</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Termo de Adesão</span>
                          <span className="text-sm text-green-600">✓ Verificado</span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button 
                          onClick={() => showNotification('Baixando todos os documentos...', 'success')}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Baixar todos
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observações Financeiras
                      </label>
                      <textarea
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Adicione observações sobre a validação..."
                      />
                    </div>
                    
                    <div className="flex justify-between pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`mailto:${proposal.email}?subject=Proposta ${proposal.id}`)}
                          className="flex items-center px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200"
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </button>
                        <button
                          onClick={() => window.open(`https://wa.me/55${proposal.phone}?text=${encodeURIComponent(`Olá! Sobre a proposta ${proposal.id}...`)}`)}
                          className="flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                        >
                          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                          WhatsApp
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedProposal(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:bg-gray-600"
                        >
                          Cancelar
                        </button>
                        {proposal.status === 'pending_validation' && (
                          <>
                            <button
                              onClick={() => {
                                showNotification('Proposta rejeitada. Notificação enviada ao vendedor.', 'error');
                                setSelectedProposal(null);
                              }}
                              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                              title="Rejeitar proposta"
                            >
                              Rejeitar
                            </button>
                            <button
                              onClick={() => validateProposal(proposal.id)}
                              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                              title="Validar proposta"
                            >
                              Validar Proposta
                            </button>
                          </>
                        )}
                        {proposal.status === 'validated' && (
                          <button
                            onClick={() => sendToAutomation(proposal.id)}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                            title="Enviar para Make/Zapier"
                          >
                            <Zap className="w-4 h-4 mr-1 inline-block" />
                            Enviar para Automação
                          </button>
                        )}
                        {proposal.status === 'sent_to_automation' && (
                          <button
                            onClick={() => showNotification('Visualizando status da automação...', 'info')}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                          >
                            <Clock className="w-4 h-4 mr-1 inline-block" />
                            Ver Status
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      
      {/* Automation Modal */}
      {showAutomationModal && selectedProposalForAutomation && (
        <FinancialAutomationModal
          isOpen={showAutomationModal}
          onClose={handleAutomationComplete}
          proposalId={selectedProposalForAutomation.id}
          clientName={selectedProposalForAutomation.client}
        />
      )}

      {/* Toggle Controls */}
      <div className="bg-white rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Personalizar Dashboard</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showStats"
              checked={showFinancialStats}
              onChange={() => setShowFinancialStats(!showFinancialStats)}
              className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="showStats" className="ml-2 text-sm text-gray-600">
              Mostrar Estatísticas
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showQuickActions"
              checked={showQuickActions}
              onChange={() => setShowQuickActions(!showQuickActions)}
              className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="showQuickActions" className="ml-2 text-sm text-gray-600">
              Mostrar Ações Rápidas
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showCategoryPerformance"
              checked={showCategoryPerformance}
              onChange={() => setShowCategoryPerformance(!showCategoryPerformance)}
              className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="showCategoryPerformance" className="ml-2 text-sm text-gray-600">
              Mostrar Performance por Categoria
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialArea;