import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileSpreadsheet, 
  Save, 
  RefreshCw, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Edit3,
  Check,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  DollarSign,
  Hash,
  Type,
  Mail,
  Phone,
  Building,
  User
} from 'lucide-react';

interface SheetCell {
  value: string;
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'currency';
  editable: boolean;
  formula?: string;
}

interface SheetRow {
  [key: string]: SheetCell;
}

interface SpreadsheetData {
  sheetId: string;
  sheetName: string;
  range: string;
  headers: string[];
  data: SheetRow[];
  lastSync: string;
  totalRows: number;
  totalColumns: number;
  isReadOnly: boolean;
}

interface RealTimeSpreadsheetEditorProps {
  className?: string;
}

export default function RealTimeSpreadsheetEditor({ className = '' }: RealTimeSpreadsheetEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchByCNPJ, setSearchByCNPJ] = useState('');
  const [filterColumn, setFilterColumn] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('PLANILHA_PRINCIPAL');
  const [editingCell, setEditingCell] = useState<{row: number, column: string} | null>(null);
  const [editValue, setEditValue] = useState('');
  const [pendingChanges, setPendingChanges] = useState<Map<string, SheetCell>>(new Map());
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'info' });

  const queryClient = useQueryClient();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Buscar planilhas disponíveis
  const { data: availableSheets } = useQuery({
    queryKey: ['/api/sheets/available-sheets'],
    queryFn: async () => {
      const response = await fetch('/api/sheets/available-sheets');
      if (!response.ok) {
        throw new Error('Falha ao carregar planilhas disponíveis');
      }
      const data = await response.json();
      return data.sheets || [];
    },
    refetchInterval: 60000, // Verificar novas planilhas a cada minuto
    staleTime: 30000,
  });

  // Buscar dados da planilha em tempo real
  const { data: spreadsheetData, isLoading, error, refetch } = useQuery<SpreadsheetData>({
    queryKey: ['/api/sheets/realtime-data'],
    queryFn: async () => {
      console.log('📊 Buscando dados da planilha em tempo real...');
      const response = await fetch('/api/sheets/realtime-data');
      if (!response.ok) {
        throw new Error('Falha ao carregar dados da planilha');
      }
      const data = await response.json();
      console.log(`✅ Dados carregados: ${data.totalRows} linhas, ${data.totalColumns} colunas`);
      return data;
    },
    refetchInterval: 30000, // Sincronizar a cada 30 segundos
    staleTime: 10000, // Dados considerados frescos por 10 segundos
    refetchOnWindowFocus: true,
  });

  // Mutação para salvar alterações na planilha
  const saveChangesMutation = useMutation({
    mutationFn: async (changes: Array<{row: number, column: string, value: string}>) => {
      console.log('💾 Salvando alterações na planilha:', changes);
      const response = await fetch('/api/sheets/update-cells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes })
      });
      if (!response.ok) {
        throw new Error('Falha ao salvar alterações');
      }
      return response.json();
    },
    onSuccess: () => {
      showNotification('Alterações salvas na planilha com sucesso!', 'success');
      setPendingChanges(new Map());
      queryClient.invalidateQueries({ queryKey: ['/api/sheets/realtime-data'] });
    },
    onError: (error) => {
      console.error('❌ Erro ao salvar alterações:', error);
      showNotification('Erro ao salvar alterações na planilha', 'error');
    }
  });

  // Auto-save com debounce
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (pendingChanges.size > 0) {
        setIsAutoSaving(true);
        const changes = Array.from(pendingChanges.entries()).map(([key, cell]) => {
          const [row, column] = key.split('|');
          return { row: parseInt(row), column, value: cell.value };
        });
        saveChangesMutation.mutate(changes);
        setIsAutoSaving(false);
      }
    }, 2000); // Auto-save após 2 segundos de inatividade
  }, [pendingChanges, saveChangesMutation]);

  useEffect(() => {
    scheduleAutoSave();
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [scheduleAutoSave]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  const handleCellEdit = (rowIndex: number, column: string, value: string) => {
    if (!spreadsheetData || spreadsheetData.isReadOnly) return;

    const key = `${rowIndex}|${column}`;
    const currentCell = spreadsheetData.data[rowIndex][column];
    
    if (currentCell && currentCell.editable) {
      const updatedCell = { ...currentCell, value };
      setPendingChanges(prev => new Map(prev.set(key, updatedCell)));
      
      // Atualizar dados localmente para resposta imediata
      const updatedData = { ...spreadsheetData };
      updatedData.data[rowIndex][column] = updatedCell;
      queryClient.setQueryData(['/api/sheets/realtime-data'], updatedData);
    }
  };

  const startEdit = (rowIndex: number, column: string) => {
    if (!spreadsheetData || spreadsheetData.isReadOnly) return;
    
    const cell = spreadsheetData.data[rowIndex][column];
    if (cell && cell.editable) {
      setEditingCell({ row: rowIndex, column });
      setEditValue(cell.value);
    }
  };

  const confirmEdit = () => {
    if (editingCell) {
      handleCellEdit(editingCell.row, editingCell.column, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'number': return <Hash className="w-3 h-3 text-blue-500" />;
      case 'date': return <Calendar className="w-3 h-3 text-green-500" />;
      case 'currency': return <DollarSign className="w-3 h-3 text-yellow-500" />;
      case 'email': return <Mail className="w-3 h-3 text-purple-500" />;
      case 'phone': return <Phone className="w-3 h-3 text-orange-500" />;
      default: return <Type className="w-3 h-3 text-gray-500" />;
    }
  };

  const getCellStyles = (cell: SheetCell, hasChanges: boolean) => {
    let baseStyles = "px-3 py-2 text-sm border-r border-gray-200 ";
    
    if (!cell.editable) {
      baseStyles += "bg-gray-50 text-gray-600 ";
    } else {
      baseStyles += "hover:bg-blue-50 cursor-pointer ";
    }
    
    if (hasChanges) {
      baseStyles += "bg-yellow-50 border-yellow-200 ";
    }
    
    return baseStyles;
  };

  const filteredData = spreadsheetData?.data.filter(row => {
    // Filtro por CNPJ tem prioridade
    if (searchByCNPJ.trim()) {
      const cnpjCell = row['CNPJ'] || row['cnpj'] || Object.values(row).find(cell => 
        cell.value.includes('/') && cell.value.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/)
      );
      return cnpjCell?.value.toLowerCase().includes(searchByCNPJ.toLowerCase()) || false;
    }
    
    // Filtro geral se não há busca por CNPJ
    if (!searchTerm) return true;
    return Object.values(row).some(cell => 
      cell.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-6 ${className}`}>
        <div className="flex items-center text-red-600 mb-4">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <h3 className="font-semibold">Erro ao carregar planilha</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Não foi possível carregar os dados da planilha. Verifique a configuração do Google Sheets.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileSpreadsheet className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edição de Planilhas em Tempo Real</h2>
              <p className="text-gray-600">
                {spreadsheetData ? 
                  `${spreadsheetData.sheetName} • ${spreadsheetData.totalRows} linhas • ${spreadsheetData.totalColumns} colunas` :
                  'Carregando dados da planilha...'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {pendingChanges.size > 0 && (
              <div className="flex items-center text-orange-600 text-sm">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse" />
                {pendingChanges.size} alteração(ões) pendente(s)
                {isAutoSaving && <span className="ml-2">(salvando...)</span>}
              </div>
            )}
            
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
          </div>
        </div>

        {/* Controles de busca e filtro */}
        <div className="space-y-4">
          {/* Linha superior com seleção de planilha e filtro CNPJ */}
          <div className="flex items-center space-x-4">
            {/* Seleção de planilha */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Planilha:</span>
              <select 
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm min-w-[200px]"
              >
                {availableSheets?.map((sheet: any) => (
                  <option key={sheet.name} value={sheet.name}>
                    {sheet.name}
                  </option>
                )) || (
                  <option value="PLANILHA_PRINCIPAL">PLANILHA_PRINCIPAL</option>
                )}
              </select>
            </div>
            
            {/* Filtro CNPJ - Compacto */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-orange-600">CNPJ:</span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={searchByCNPJ}
                  onChange={(e) => setSearchByCNPJ(e.target.value)}
                  className="w-[180px] px-3 py-2 text-sm border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-orange-50 placeholder-orange-400"
                  maxLength={18}
                />
              </div>
            </div>
          </div>
          
          {/* Busca geral */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar em toda a planilha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={searchByCNPJ.trim().length > 0}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            
            <select
              value={filterColumn}
              onChange={(e) => setFilterColumn(e.target.value)}
              disabled={searchByCNPJ.trim().length > 0}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Todas as colunas</option>
              {spreadsheetData?.headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status da sincronização */}
        {spreadsheetData && (
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Última sincronização: {new Date(spreadsheetData.lastSync).toLocaleString('pt-BR')}
          </div>
        )}
      </div>

      {/* Tabela da planilha */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Carregando dados da planilha...</span>
          </div>
        </div>
      ) : spreadsheetData && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  {spreadsheetData.headers.map((header, index) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(filteredData[0]?.[header]?.type || 'text')}
                        <span>{header}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500 font-medium bg-gray-50">
                      {rowIndex + 1}
                    </td>
                    {spreadsheetData.headers.map(header => {
                      const cell = row[header];
                      const key = `${rowIndex}|${header}`;
                      const hasChanges = pendingChanges.has(key);
                      const isEditing = editingCell?.row === rowIndex && editingCell?.column === header;
                      
                      return (
                        <td
                          key={header}
                          className={getCellStyles(cell, hasChanges)}
                          onClick={() => !isEditing && startEdit(rowIndex, header)}
                        >
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 px-2 py-1 border border-blue-300 rounded focus:ring-1 focus:ring-blue-500"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') confirmEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                              />
                              <button
                                onClick={confirmEdit}
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className={cell.editable ? "" : "text-gray-500"}>
                                {cell.value || "-"}
                              </span>
                              {cell.editable && (
                                <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                              )}
                              {hasChanges && (
                                <div className="w-2 h-2 bg-orange-400 rounded-full ml-2" />
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 
                'Nenhum resultado encontrado para a busca.' :
                'Nenhum dado disponível na planilha.'
              }
            </div>
          )}
        </div>
      )}

      {/* Notificação */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center">
              {notification.type === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
              {notification.type === 'error' && <AlertTriangle className="w-4 h-4 mr-2" />}
              {notification.type === 'info' && <Info className="w-4 h-4 mr-2" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}