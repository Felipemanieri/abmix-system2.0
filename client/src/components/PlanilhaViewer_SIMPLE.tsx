import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, RefreshCw, Eye, Filter, Search } from 'lucide-react';

interface ProposalData {
  id: string;
  empresa: string;
  cnpj: string;
  vendedor: string;
  plano: string;
  valor: string;
  status: string;
  dataContrato: string;
  titular1_nome?: string;
  titular1_cpf?: string;
  dependente1_nome?: string;
  dependente1_cpf?: string;
}

export default function PlanilhaViewer() {
  const [proposalData, setProposalData] = useState<ProposalData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dados simulados para evitar problemas de API
  const mockData: ProposalData[] = [
    {
      id: 'PROP-001',
      empresa: 'Empresa ABC Ltda',
      cnpj: '12.345.678/0001-90',
      vendedor: 'Ana Caroline Terto',
      plano: 'Plano Empresarial Plus',
      valor: 'R$ 15.000,00',
      status: 'implantado',
      dataContrato: '2025-01-20',
      titular1_nome: 'João Silva',
      titular1_cpf: '123.456.789-00',
      dependente1_nome: 'Maria Silva',
      dependente1_cpf: '987.654.321-00'
    },
    {
      id: 'PROP-002',
      empresa: 'Tech Solutions S.A.',
      cnpj: '98.765.432/0001-10',
      vendedor: 'Bruna Garcia',
      plano: 'Plano Executivo',
      valor: 'R$ 25.500,00',
      status: 'analise',
      dataContrato: '2025-01-22',
      titular1_nome: 'Carlos Santos',
      titular1_cpf: '456.789.123-00'
    },
    {
      id: 'PROP-003',
      empresa: 'Indústria XYZ Ltda',
      cnpj: '11.222.333/0001-44',
      vendedor: 'Fabiana Ferreira',
      plano: 'Plano Corporativo',
      valor: 'R$ 45.800,00',
      status: 'pendencia',
      dataContrato: '2025-01-23',
      titular1_nome: 'Ana Costa',
      titular1_cpf: '789.123.456-00',
      dependente1_nome: 'Pedro Costa',
      dependente1_cpf: '321.654.987-00'
    }
  ];

  useEffect(() => {
    setProposalData(mockData);
  }, []);

  const filteredData = proposalData.filter(proposal => {
    const matchesSearch = proposal.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.cnpj.includes(searchTerm) ||
                         proposal.vendedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setProposalData(mockData);
      setIsLoading(false);
    }, 1000);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Empresa', 'CNPJ', 'Vendedor', 'Plano', 'Valor', 'Status', 'Data Contrato', 'Titular Nome', 'Titular CPF', 'Dependente Nome', 'Dependente CPF'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        row.id,
        `"${row.empresa}"`,
        row.cnpj,
        `"${row.vendedor}"`,
        `"${row.plano}"`,
        `"${row.valor}"`,
        row.status,
        row.dataContrato,
        `"${row.titular1_nome || ''}"`,
        row.titular1_cpf || '',
        `"${row.dependente1_nome || ''}"`,
        row.dependente1_cpf || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `planilha_propostas_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implantado': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'analise': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'pendencia': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'assinatura': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Visualizar Planilha</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por empresa, CNPJ ou vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos os Status</option>
            <option value="implantado">Implantado</option>
            <option value="analise">Em Análise</option>
            <option value="pendencia">Pendência</option>
            <option value="assinatura">Assinatura</option>
          </select>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Registros</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{proposalData.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Filtrados</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">{filteredData.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Colunas Dinâmicas</p>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">12</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
            <div className="flex items-center">
              <Download className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Última Atualização</p>
                <p className="text-xs font-bold text-orange-900 dark:text-orange-100">Agora</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Dados */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Empresa</th>
                <th className="px-6 py-3">CNPJ</th>
                <th className="px-6 py-3">Vendedor</th>
                <th className="px-6 py-3">Plano</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Titular</th>
                <th className="px-6 py-3">CPF Titular</th>
                <th className="px-6 py-3">Dependente</th>
                <th className="px-6 py-3">CPF Dependente</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((proposal) => (
                <tr key={proposal.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900 dark:text-white">
                    {proposal.id}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {proposal.empresa}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                    {proposal.cnpj}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {proposal.vendedor}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {proposal.plano}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-900 dark:text-white">
                    {proposal.valor}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(proposal.status)}`}>
                      {proposal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {new Date(proposal.dataContrato).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {proposal.titular1_nome || '-'}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                    {proposal.titular1_cpf || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {proposal.dependente1_nome || '-'}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                    {proposal.dependente1_cpf || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum registro encontrado</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Tente ajustar os filtros de busca
            </p>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Estrutura da Planilha:</strong> {filteredData.length} registros exibidos com estrutura horizontal dinâmica.
            Cada empresa ocupa uma linha única com múltiplas colunas para titulares e dependentes.
          </p>
        </div>
      </div>
    </div>
  );
}