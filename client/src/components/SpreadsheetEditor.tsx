import { useState, useEffect } from 'react';
import { 
  FileText, 
  Edit, 
  Save, 
  Plus, 
  Trash2, 
  Search, 
  Download, 
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  Filter,
  MoreHorizontal,
  X,
  Calendar,
  User,
  DollarSign,
  Phone,
  Mail,
  Building,
  Hash,
  Type,
  ToggleLeft
} from 'lucide-react';

interface CellData {
  id: string;
  row: number;
  column: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'currency';
  editable: boolean;
  required?: boolean;
}

interface SpreadsheetData {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  rowCount: number;
  columnCount: number;
  size: string;
  status: 'active' | 'readonly' | 'archived';
  data: CellData[][];
  headers: string[];
}

interface SpreadsheetEditorProps {
  onSave?: (data: SpreadsheetData) => void;
  onCancel?: () => void;
}

export default function SpreadsheetEditor({ onSave, onCancel }: SpreadsheetEditorProps) {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetData[]>([]);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<SpreadsheetData | null>(null);
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });

  // Dados simulados de planilhas existentes (em produção, viria da API)
  useEffect(() => {
    loadSpreadsheets();
  }, []);

  const loadSpreadsheets = async () => {
    setIsLoading(true);
    try {
      // Simulando dados reais das planilhas do sistema
      const mockSpreadsheets: SpreadsheetData[] = [
        {
          id: 'planilha_propostas',
          name: 'Propostas de Seguro',
          description: 'Controle de todas as propostas de seguros e planos de saúde',
          lastModified: '2025-01-28 14:30:00',
          rowCount: 847,
          columnCount: 15,
          size: '2.4 MB',
          status: 'active',
          headers: ['ID', 'Cliente', 'CPF/CNPJ', 'Email', 'Telefone', 'Plano', 'Valor', 'Status', 'Vendedor', 'Data Criação', 'Data Vencimento', 'Observações', 'Aprovado', 'Implementado', 'Pagamento'],
          data: [
            [
              { id: '1-1', row: 1, column: 'A', value: 'PROP001', type: 'text', editable: false },
              { id: '1-2', row: 1, column: 'B', value: 'Maria Silva Santos', type: 'text', editable: true },
              { id: '1-3', row: 1, column: 'C', value: '123.456.789-00', type: 'text', editable: true },
              { id: '1-4', row: 1, column: 'D', value: 'maria@email.com', type: 'email', editable: true },
              { id: '1-5', row: 1, column: 'E', value: '(11) 99999-9999', type: 'phone', editable: true },
              { id: '1-6', row: 1, column: 'F', value: 'Plano Saúde Premium', type: 'text', editable: true },
              { id: '1-7', row: 1, column: 'G', value: 'R$ 450,00', type: 'currency', editable: true },
              { id: '1-8', row: 1, column: 'H', value: 'Em Análise', type: 'text', editable: true },
              { id: '1-9', row: 1, column: 'I', value: 'João Vendedor', type: 'text', editable: true },
              { id: '1-10', row: 1, column: 'J', value: '2025-01-25', type: 'date', editable: true },
              { id: '1-11', row: 1, column: 'K', value: '2025-02-25', type: 'date', editable: true },
              { id: '1-12', row: 1, column: 'L', value: 'Cliente interessado em cobertura completa', type: 'text', editable: true },
              { id: '1-13', row: 1, column: 'M', value: 'Pendente', type: 'text', editable: true },
              { id: '1-14', row: 1, column: 'N', value: 'Não', type: 'text', editable: true },
              { id: '1-15', row: 1, column: 'O', value: 'Aguardando', type: 'text', editable: true }
            ],
            [
              { id: '2-1', row: 2, column: 'A', value: 'PROP002', type: 'text', editable: false },
              { id: '2-2', row: 2, column: 'B', value: 'Carlos Oliveira', type: 'text', editable: true },
              { id: '2-3', row: 2, column: 'C', value: '987.654.321-00', type: 'text', editable: true },
              { id: '2-4', row: 2, column: 'D', value: 'carlos@empresa.com', type: 'email', editable: true },
              { id: '2-5', row: 2, column: 'E', value: '(21) 88888-8888', type: 'phone', editable: true },
              { id: '2-6', row: 2, column: 'F', value: 'Seguro Auto Completo', type: 'text', editable: true },
              { id: '2-7', row: 2, column: 'G', value: 'R$ 1.200,00', type: 'currency', editable: true },
              { id: '2-8', row: 2, column: 'H', value: 'Aprovado', type: 'text', editable: true },
              { id: '2-9', row: 2, column: 'I', value: 'Ana Vendedora', type: 'text', editable: true },
              { id: '2-10', row: 2, column: 'J', value: '2025-01-24', type: 'date', editable: true },
              { id: '2-11', row: 2, column: 'K', value: '2025-02-24', type: 'date', editable: true },
              { id: '2-12', row: 2, column: 'L', value: 'Renovação de apólice existente', type: 'text', editable: true },
              { id: '2-13', row: 2, column: 'M', value: 'Aprovado', type: 'text', editable: true },
              { id: '2-14', row: 2, column: 'N', value: 'Sim', type: 'text', editable: true },
              { id: '2-15', row: 2, column: 'O', value: 'Pago', type: 'text', editable: true }
            ]
          ]
        },
        {
          id: 'planilha_vendedores',
          name: 'Controle de Vendedores',
          description: 'Gestão de equipe de vendas e metas',
          lastModified: '2025-01-28 11:15:00',
          rowCount: 23,
          columnCount: 12,
          size: '156 KB',
          status: 'active',
          headers: ['ID', 'Nome', 'Email', 'Telefone', 'CPF', 'Meta Mensal', 'Vendas Mês', 'Comissão %', 'Status', 'Data Admissão', 'Supervisor', 'Observações'],
          data: [
            [
              { id: '1-1', row: 1, column: 'A', value: 'VEND001', type: 'text', editable: false },
              { id: '1-2', row: 1, column: 'B', value: 'João Silva', type: 'text', editable: true },
              { id: '1-3', row: 1, column: 'C', value: 'joao@abmix.com.br', type: 'email', editable: true },
              { id: '1-4', row: 1, column: 'D', value: '(11) 99999-1111', type: 'phone', editable: true },
              { id: '1-5', row: 1, column: 'E', value: '111.222.333-44', type: 'text', editable: true },
              { id: '1-6', row: 1, column: 'F', value: 'R$ 50.000,00', type: 'currency', editable: true },
              { id: '1-7', row: 1, column: 'G', value: 'R$ 38.500,00', type: 'currency', editable: true },
              { id: '1-8', row: 1, column: 'H', value: '8%', type: 'text', editable: true },
              { id: '1-9', row: 1, column: 'I', value: 'Ativo', type: 'text', editable: true },
              { id: '1-10', row: 1, column: 'J', value: '2024-03-15', type: 'date', editable: true },
              { id: '1-11', row: 1, column: 'K', value: 'Felipe Manieri', type: 'text', editable: true },
              { id: '1-12', row: 1, column: 'L', value: 'Vendedor experiente, bom relacionamento', type: 'text', editable: true }
            ]
          ]
        },
        {
          id: 'planilha_clientes',
          name: 'Base de Clientes',
          description: 'Cadastro completo de todos os clientes',
          lastModified: '2025-01-28 16:45:00',
          rowCount: 1254,
          columnCount: 18,
          size: '3.8 MB',
          status: 'active',
          headers: ['ID', 'Nome/Razão Social', 'CPF/CNPJ', 'Email', 'Telefone', 'Endereço', 'Cidade', 'Estado', 'CEP', 'Tipo Cliente', 'Segmento', 'Status', 'Data Cadastro', 'Última Compra', 'Valor Total', 'Vendedor Responsável', 'Observações', 'Score'],
          data: []
        }
      ];
      
      setSpreadsheets(mockSpreadsheets);
    } catch (error) {
      showNotification('Erro ao carregar planilhas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  const handleCellEdit = (rowIndex: number, colIndex: number, newValue: string) => {
    if (!selectedSpreadsheet) return;

    const updatedData = selectedSpreadsheet.data.map((row, rIdx) => 
      rIdx === rowIndex 
        ? row.map((cell, cIdx) => 
            cIdx === colIndex 
              ? { ...cell, value: newValue }
              : cell
          )
        : row
    );

    setSelectedSpreadsheet({
      ...selectedSpreadsheet,
      data: updatedData
    });
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedSpreadsheet) return;

    try {
      // Em produção, aqui seria uma chamada para a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      showNotification('Planilha salva com sucesso!', 'success');
      
      if (onSave) {
        onSave(selectedSpreadsheet);
      }
    } catch (error) {
      showNotification('Erro ao salvar planilha', 'error');
    }
  };

  const handleAddRow = () => {
    if (!selectedSpreadsheet) return;

    const newRowIndex = selectedSpreadsheet.data.length + 1;
    const newRow = selectedSpreadsheet.headers.map((header, index) => ({
      id: `${newRowIndex}-${index + 1}`,
      row: newRowIndex,
      column: String.fromCharCode(65 + index),
      value: '',
      type: 'text' as const,
      editable: index !== 0 // Primeira coluna (ID) não editável
    }));

    setSelectedSpreadsheet({
      ...selectedSpreadsheet,
      data: [...selectedSpreadsheet.data, newRow],
      rowCount: selectedSpreadsheet.rowCount + 1
    });
    setHasChanges(true);
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (!selectedSpreadsheet) return;

    const updatedData = selectedSpreadsheet.data.filter((_, index) => index !== rowIndex);
    
    setSelectedSpreadsheet({
      ...selectedSpreadsheet,
      data: updatedData,
      rowCount: selectedSpreadsheet.rowCount - 1
    });
    setHasChanges(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'currency': return <DollarSign className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'number': return <Hash className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'readonly': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-gray-600">Carregando planilhas...</span>
        </div>
      </div>
    );
  }

  if (selectedSpreadsheet) {
    return (
      <div className="space-y-6">
        {/* Header da Planilha */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedSpreadsheet(null)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← Voltar às planilhas
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedSpreadsheet.name}</h2>
                <p className="text-gray-600">{selectedSpreadsheet.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <span className="text-orange-600 text-sm font-medium">
                  • Alterações não salvas
                </span>
              )}
              
              <button
                onClick={handleAddRow}
                className="flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Linha
              </button>
              
              <button
                onClick={handleSaveChanges}
                disabled={!hasChanges}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  hasChanges
                    ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Linhas:</span>
              <span className="ml-2 font-medium">{selectedSpreadsheet.rowCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Colunas:</span>
              <span className="ml-2 font-medium">{selectedSpreadsheet.columnCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Tamanho:</span>
              <span className="ml-2 font-medium">{selectedSpreadsheet.size}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSpreadsheet.status)}`}>
                {selectedSpreadsheet.status === 'active' ? 'Ativa' : selectedSpreadsheet.status === 'readonly' ? 'Somente Leitura' : 'Arquivada'}
              </span>
            </div>
          </div>
        </div>

        {/* Editor da Planilha */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  {selectedSpreadsheet.headers.map((header, index) => (
                    <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-l border-gray-200">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(selectedSpreadsheet.data[0]?.[index]?.type || 'text')}
                        <span>{header}</span>
                      </div>
                    </th>
                  ))}
                  <th className="w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedSpreadsheet.data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-500 font-medium bg-gray-50">
                      {rowIndex + 1}
                    </td>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="px-4 py-2 border-l border-gray-200">
                        {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                          <input
                            type="text"
                            value={cell.value}
                            onChange={(e) => handleCellEdit(rowIndex, colIndex, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingCell(null);
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            autoFocus
                            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div
                            onClick={() => cell.editable && setEditingCell({ row: rowIndex, col: colIndex })}
                            className={`text-sm p-1 rounded ${
                              cell.editable 
                                ? 'cursor-pointer hover:bg-blue-50' 
                                : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {cell.value || (cell.editable ? 'Clique para editar' : '-')}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleDeleteRow(rowIndex)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Deletar linha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Lista de Planilhas
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Edit className="w-8 h-8 mr-3 text-blue-600" />
            Edição de Planilhas
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie e edite todas as planilhas do sistema em tempo real
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadSpreadsheets}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button>
          
          <button className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </button>
          
          <button className="flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Nova Planilha
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar planilhas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de Planilhas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spreadsheets
          .filter(sheet => 
            sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sheet.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((sheet) => (
          <div
            key={sheet.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedSpreadsheet(sheet)}
          >
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sheet.status)}`}>
                {sheet.status === 'active' ? 'Ativa' : sheet.status === 'readonly' ? 'Somente Leitura' : 'Arquivada'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{sheet.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{sheet.description}</p>

            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Linhas:</span>
                <span className="font-medium">{sheet.rowCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Colunas:</span>
                <span className="font-medium">{sheet.columnCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Tamanho:</span>
                <span className="font-medium">{sheet.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Modificado:</span>
                <span className="font-medium">{sheet.lastModified}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Download functionality
                }}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </button>
              
              <div className="flex items-center text-blue-600">
                <span className="text-sm font-medium mr-1">Editar</span>
                <Edit className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notificação */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {notification.type === 'success' ? 
                <CheckCircle className="w-4 h-4 mr-2" /> : 
                <AlertTriangle className="w-4 h-4 mr-2" />
              }
              <span className="text-sm font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}