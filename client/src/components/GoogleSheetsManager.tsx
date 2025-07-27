import { useState, useEffect } from 'react';
import { Sheet, RefreshCw, Settings, Plus, Trash2, Link, CheckCircle, AlertTriangle } from 'lucide-react';

interface SheetConfig {
  id: string;
  name: string;
  sheetId: string;
  range: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  columns: number;
  rows: number;
}

export default function GoogleSheetsManager() {
  const [sheets, setSheets] = useState<SheetConfig[]>([
    {
      id: '1',
      name: 'Planilha Principal Sistema Abmix',
      sheetId: '1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw',
      range: 'A:Z',
      status: 'active',
      lastSync: new Date().toISOString(),
      columns: 338,
      rows: 156
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSheet, setEditingSheet] = useState<SheetConfig | null>(null);

  const syncSheet = async (sheetId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/google/sheets/sync/${sheetId}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setSheets(prev => prev.map(sheet => 
          sheet.id === sheetId 
            ? { ...sheet, lastSync: new Date().toISOString(), status: 'active' }
            : sheet
        ));
      }
    } catch (error) {
      console.error('Erro ao sincronizar planilha:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncAllSheets = async () => {
    setLoading(true);
    for (const sheet of sheets) {
      await syncSheet(sheet.id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay entre sync
    }
    setLoading(false);
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/google/test-connections');
      const data = await response.json();
      
      if (data.success) {
        alert('Conexão testada com sucesso!');
      } else {
        alert('Erro na conexão: ' + data.error);
      }
    } catch (error) {
      alert('Erro ao testar conexão');
    } finally {
      setLoading(false);
    }
  };

  const saveSheet = () => {
    if (!editingSheet) return;

    if (editingSheet.id && editingSheet.id !== 'new') {
      // Update existing
      setSheets(prev => prev.map(sheet => 
        sheet.id === editingSheet.id ? editingSheet : sheet
      ));
    } else {
      // Create new
      const newSheet = {
        ...editingSheet,
        id: Date.now().toString(),
        status: 'inactive' as const,
        lastSync: '',
        columns: 0,
        rows: 0
      };
      setSheets(prev => [...prev, newSheet]);
    }

    setEditingSheet(null);
    setShowModal(false);
  };

  const deleteSheet = (sheetId: string) => {
    if (!confirm('Tem certeza que deseja remover esta planilha?')) return;
    setSheets(prev => prev.filter(sheet => sheet.id !== sheetId));
  };

  const openModal = (sheet?: SheetConfig) => {
    setEditingSheet(sheet || {
      id: 'new',
      name: '',
      sheetId: '',
      range: 'A:Z',
      status: 'inactive',
      lastSync: '',
      columns: 0,
      rows: 0
    });
    setShowModal(true);
  };

  const getStatusIcon = (status: SheetConfig['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const getStatusColor = (status: SheetConfig['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Sheet className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Gerenciador Google Sheets
            </h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Settings className="w-4 h-4 mr-2 inline" />
              Testar Conexão
            </button>
            <button
              onClick={syncAllSheets}
              disabled={loading}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 inline ${loading ? 'animate-spin' : ''}`} />
              Sincronizar Todas
            </button>
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Nova Planilha
            </button>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {sheets.length}
            </div>
            <div className="text-sm text-green-500 dark:text-green-400">Total Planilhas</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {sheets.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-blue-500 dark:text-blue-400">Ativas</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {sheets.reduce((acc, sheet) => acc + sheet.columns, 0)}
            </div>
            <div className="text-sm text-purple-500 dark:text-purple-400">Total Colunas</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {sheets.reduce((acc, sheet) => acc + sheet.rows, 0)}
            </div>
            <div className="text-sm text-orange-500 dark:text-orange-400">Total Linhas</div>
          </div>
        </div>

        {/* Lista de Planilhas */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID da Planilha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Colunas/Linhas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Última Sync
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sheets.map((sheet) => (
                <tr key={sheet.id}>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(sheet.status)}
                      <span className={`ml-2 text-sm font-medium ${getStatusColor(sheet.status)}`}>
                        {sheet.status === 'active' ? 'Ativa' : sheet.status === 'error' ? 'Erro' : 'Inativa'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    {sheet.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                    {sheet.sheetId.substring(0, 20)}...
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {sheet.columns} cols / {sheet.rows} linhas
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {sheet.lastSync ? new Date(sheet.lastSync).toLocaleString('pt-BR') : 'Nunca'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => syncSheet(sheet.id)}
                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                        title="Sincronizar"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${sheet.sheetId}`, '_blank')}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        title="Abrir no Google Sheets"
                      >
                        <Link className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal(sheet)}
                        className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Editar"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSheet(sheet.id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sheets.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhuma planilha configurada. Clique em "Nova Planilha" para começar.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {showModal && editingSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingSheet.id === 'new' ? 'Nova Planilha' : 'Editar Planilha'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da Planilha
                </label>
                <input
                  type="text"
                  value={editingSheet.name}
                  onChange={(e) => setEditingSheet(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nome identificador da planilha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID da Planilha Google
                </label>
                <input
                  type="text"
                  value={editingSheet.sheetId}
                  onChange={(e) => setEditingSheet(prev => prev ? { ...prev, sheetId: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  placeholder="1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Range de Células
                </label>
                <input
                  type="text"
                  value={editingSheet.range}
                  onChange={(e) => setEditingSheet(prev => prev ? { ...prev, range: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="A:Z"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveSheet}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}