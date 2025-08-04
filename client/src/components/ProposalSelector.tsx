import React, { useState, useEffect } from 'react';
import { X, Search, Filter, User, Calendar, FileText, Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { ProposalStatus } from '@shared/statusSystem';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

interface ProposalSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProposal: (proposalId: string) => void;
}

interface ProposalItem {
  id: string;
  abmId: string;
  client: string;
  vendor: string;
  plan: string;
  value: string;
  status: ProposalStatus;
  submissionDate: string;
  documents: number;
  priority: 'low' | 'medium' | 'high';
  progress: number;
}

const ProposalSelector: React.FC<ProposalSelectorProps> = ({ isOpen, onClose, onSelectProposal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem('proposalSelector_statusFilter') || 'all');
  const [priorityFilter, setPriorityFilter] = useState(() => localStorage.getItem('proposalSelector_priorityFilter') || 'all');
  const [vendorFilter, setVendorFilter] = useState(() => localStorage.getItem('proposalSelector_vendorFilter') || 'all');

  // Salvar filtros no localStorage quando alterados
  useEffect(() => {
    localStorage.setItem('proposalSelector_statusFilter', statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    localStorage.setItem('proposalSelector_priorityFilter', priorityFilter);
  }, [priorityFilter]);

  useEffect(() => {
    localStorage.setItem('proposalSelector_vendorFilter', vendorFilter);
  }, [vendorFilter]);

  // Buscar vendedores reais do banco de dados
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
    queryFn: async () => {
      const response = await fetch('/api/vendors');
      if (!response.ok) throw new Error('Failed to fetch vendors');
      return response.json();
    },
    retry: false,
  });

  // Buscar propostas reais do banco de dados
  const { data: apiProposals = [], isLoading } = useQuery({
    queryKey: ['/api/proposals'],
    queryFn: () => apiRequest('/api/proposals'),
    retry: false,
  });

  // Debug: Log das propostas da API
  console.log('🔍 ProposalSelector - Propostas da API:', apiProposals);
  console.log('🔍 ProposalSelector - Loading:', isLoading);

  // Converter propostas da API para formato do selector
  const realProposals: ProposalItem[] = apiProposals.map((proposal: any) => {
    const contractData = proposal.contractData || {};
    const vendor = vendors.find((v: any) => v.id === proposal.vendorId);
    
    // Melhor busca do nome do vendedor com múltiplas fontes
    let vendorName = 'Vendedor';
    if (vendor && vendor.name) {
      vendorName = vendor.name;
    } else if (proposal.vendorName) {
      vendorName = proposal.vendorName;
    } else if (proposal.vendor) {
      vendorName = proposal.vendor;
    } else if (contractData.vendedor) {
      vendorName = contractData.vendedor;
    } else if (proposal.internalData?.vendedorResponsavel) {
      vendorName = proposal.internalData.vendedorResponsavel;
    }
    
    return {
      id: proposal.id,
      abmId: proposal.abmId || `ABM${proposal.id.slice(-3)}`,
      client: contractData.nomeEmpresa || contractData.empresa || proposal.cliente || proposal.contractData?.nomeEmpresa || 'cliente não identificado',
      vendor: vendorName,
      plan: contractData.planoContratado || contractData.plano || proposal.plano || proposal.contractData?.planoContratado || 'plano não especificado',
      value: contractData.valor || proposal.valor || 'Valor Não Definido',
      status: proposal.status || 'observacao',
      submissionDate: proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
      documents: (proposal.vendorAttachments?.length || 0) + (proposal.clientAttachments?.length || 0),
      priority: proposal.priority || 'medium',
      progress: proposal.clientCompleted ? 100 : 20
    };
  });

  // Obter lista única de vendedores das propostas + vendedores do banco de dados
  const allVendorNames = Array.from(new Set([
    ...realProposals.map(p => p.vendor),
    ...vendors.map((v: any) => v.name)
  ]));

  const filteredProposals = realProposals.filter(proposal => {
    const matchesSearch = 
      proposal.abmId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || proposal.priority === priorityFilter;
    const matchesVendor = vendorFilter === 'all' || proposal.vendor === vendorFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesVendor;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 dark:text-white';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return 'Normal';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70" onClick={onClose}></div>
      <div className="absolute inset-0 flex">
        <div className="w-full h-full">
          <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-900/50">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Selecionar Proposta</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300" />
                  <input
                    type="text"
                    placeholder="Buscar por ID, cliente ou vendedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Status</option>
                  <option value="observacao">OBSERVAÇÃO</option>
                  <option value="analise">ANALISE</option>
                  <option value="assinatura_ds">ASSINATURA DS</option>
                  <option value="expirado">EXPIRADO</option>
                  <option value="implantado">IMPLANTADO</option>
                  <option value="aguar_pagamento">AGUAR PAGAMENTO</option>
                  <option value="assinatura_proposta">ASSINATURA PROPOSTA</option>
                  <option value="aguar_selecao_vigencia">AGUAR SELEÇÃO DE VIGENCIA</option>
                  <option value="pendencia">PENDÊNCIA</option>
                  <option value="declinado">DECLINADO</option>
                  <option value="aguar_vigencia">AGUAR VIGÊNCIA</option>
                </select>

                {/* Priority Filter */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas as Prioridades</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>

                {/* Vendor Filter */}
                <select
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Vendedores</option>
                  {allVendorNames.map(vendorName => (
                    <option key={vendorName} value={vendorName}>{vendorName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
              <div className="px-6 py-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-300">Carregando propostas...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {filteredProposals.length} proposta(s) encontrada(s)
                    </div>

                    <div className="space-y-4">
                  {filteredProposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => {
                        onSelectProposal(proposal.id);
                        onClose();
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                              {proposal.abmId}
                            </span>
                            <StatusBadge status={proposal.status} />
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(proposal.priority)}`}>
                              {getPriorityText(proposal.priority)}
                            </span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{proposal.client}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{proposal.plan}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">{proposal.value}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(proposal.submissionDate).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {proposal.vendor}
                          </div>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {proposal.documents} docs
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Progresso: {proposal.progress}%
                          </div>
                          <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${proposal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {proposal.id}
                          </div>
                          <button className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                            <Eye className="w-4 h-4 mr-1" />
                            Abrir para Edição
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                    </div>

                    {filteredProposals.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma proposta encontrada</h3>
                        <p className="text-gray-600 dark:text-gray-300">Tente ajustar os filtros de busca</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalSelector;