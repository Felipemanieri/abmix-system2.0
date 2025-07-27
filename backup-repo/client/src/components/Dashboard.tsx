import React from 'react';
import { TrendingUp, Users, FileText, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Link, Eye } from 'lucide-react';

interface DashboardProps {
  userRole: 'vendor' | 'financial' | 'client';
}

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const vendorStats = [
    {
      name: 'Propostas Criadas',
      value: '23',
      change: '+3 hoje',
      changeType: 'positive',
      icon: FileText,
    },
    {
      name: 'Clientes Preenchendo',
      value: '8',
      change: 'Em andamento',
      changeType: 'neutral',
      icon: Users,
    },
    {
      name: 'Aguardando Documentos',
      value: '5',
      change: 'Pendente',
      changeType: 'warning',
      icon: Clock,
    },
    {
      name: 'Enviadas p/ Financeiro',
      value: '12',
      change: '+2 hoje',
      changeType: 'positive',
      icon: CheckCircle,
    },
  ];

  const financialStats = [
    {
      name: 'Aguardando Validação',
      value: '15',
      change: 'Para revisar',
      changeType: 'warning',
      icon: AlertCircle,
    },
    {
      name: 'Validadas Hoje',
      value: '7',
      change: '+7 hoje',
      changeType: 'positive',
      icon: CheckCircle,
    },
    {
      name: 'Enviadas p/ Automação',
      value: '45',
      change: 'Este mês',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Taxa de Aprovação',
      value: '92%',
      change: '+5% mês passado',
      changeType: 'positive',
      icon: DollarSign,
    },
  ];

  const recentProposals = [
    {
      id: 'VEND001-PROP123',
      client: 'Empresa ABC Ltda',
      vendor: 'Ana Caroline',
      plan: 'Plano Empresarial Premium',
      status: userRole === 'vendor' ? 'client_filling' : 'pending_validation',
      date: '2024-01-15',
      progress: 75,
    },
    {
      id: 'VEND002-PROP124',
      client: 'Tech Solutions SA',
      vendor: 'Bruna Garcia',
      plan: 'Plano Família Básico',
      status: userRole === 'vendor' ? 'docs_pending' : 'validated',
      date: '2024-01-14',
      progress: 45,
    },
    {
      id: 'VEND001-PROP125',
      client: 'Consultoria XYZ',
      vendor: 'Ana Caroline',
      plan: 'Plano Individual',
      status: userRole === 'vendor' ? 'sent_to_financial' : 'sent_to_automation',
      date: '2024-01-13',
      progress: 100,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'client_filling':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'docs_pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'sent_to_financial':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending_validation':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'validated':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'sent_to_automation':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500 dark:text-white" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'client_filling':
        return 'Cliente Preenchendo';
      case 'docs_pending':
        return 'Documentos Pendentes';
      case 'sent_to_financial':
        return 'Enviado p/ Financeiro';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'client_filling':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'docs_pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'sent_to_financial':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
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

  const stats = userRole === 'vendor' ? vendorStats : financialStats;
  const title = userRole === 'vendor' ? 'Dashboard do Vendedor' : 'Dashboard Financeiro';
  const subtitle = userRole === 'vendor' ? 'Gerencie suas propostas e acompanhe o progresso' : 'Valide propostas e controle o fluxo financeiro';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-teal-100">{subtitle}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-full">
                  <Icon className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'warning' ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Proposals */}
      <div className="bg-white rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {userRole === 'vendor' ? 'Minhas Propostas Recentes' : 'Propostas para Validação'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  ID / Cliente
                </th>
                {userRole === 'financial' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    Vendedor
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Status
                </th>
                {userRole === 'vendor' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    Progresso
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{proposal.client}</div>
                      <div className="text-sm text-gray-500 dark:text-white">{proposal.id}</div>
                    </div>
                  </td>
                  {userRole === 'financial' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{proposal.vendor}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{proposal.plan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(proposal.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                        {getStatusText(proposal.status)}
                      </span>
                    </div>
                  </td>
                  {userRole === 'vendor' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 dark:bg-gray-600 rounded-full h-2 mr-2">
                          <div 
                            className="bg-teal-600 h-2 rounded-full" 
                            style={{ width: `${proposal.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{proposal.progress}%</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">
                    {new Date(proposal.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-teal-600 hover:text-teal-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      {userRole === 'vendor' && (
                        <button className="text-blue-600 hover:text-blue-900">
                          <Link className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userRole === 'vendor' ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-teal-100 rounded-full">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Nova Proposta</h3>
                  <p className="text-sm text-gray-500 dark:text-white">Criar proposta para cliente</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Link className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Gerar Links</h3>
                  <p className="text-sm text-gray-500 dark:text-white">Links únicos para clientes</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Acompanhar</h3>
                  <p className="text-sm text-gray-500 dark:text-white">Status das propostas</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Validar Propostas</h3>
                  <p className="text-sm text-gray-500 dark:text-white">15 aguardando validação</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Enviar Automação</h3>
                  <p className="text-sm text-gray-500 dark:text-white">Para Make/Zapier</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Relatórios</h3>
                  <p className="text-sm text-gray-500 dark:text-white">Análise financeira</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;