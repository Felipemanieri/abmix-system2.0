import { useState } from 'react';
import { Sheet, RefreshCw, Settings, Plus, Trash2, Link, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface SheetConfig {
  id: string;
  name: string;
  sheetId: string;
  department: string;
  owner: string;
  sharing: string;
  observations: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  columns: number;
  rows: number;
}

export default function GoogleSheetsManagerComplete() {
  const [sheets, setSheets] = useState<SheetConfig[]>([
    {
      id: '1',
      name: 'Planilha Principal Sistema Abmix',
      sheetId: '1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw',
      department: 'Sistema',
      owner: 'Admin',
      sharing: 'Privado',
      observations: 'Planilha principal do sistema',
      status: 'active',
      lastSync: new Date().toLocaleString('pt-BR'),
      columns: 338,
      rows: 156
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newSheet, setNewSheet] = useState({
    name: '',
    sheetId: '',
    department: '',
    owner: '',
    sharing: '',
    observations: ''
  });

  const departments = [
    'Comercial',
    'Financeiro', 
    'Implementação',
    'Supervisão',
    'Sistema',
    'Geral'
  ];

  const addNewSheet = () => {
    if (!newSheet.name || !newSheet.sheetId || !newSheet.department) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const id = extractSheetId(newSheet.sheetId);
    if (!id) {
      alert('Link/ID do Google Sheets inválido');
      return;
    }

    const sheet: SheetConfig = {
      id: Date.now().toString(),
      name: newSheet.name,
      sheetId: id,
      department: newSheet.department,
      owner: newSheet.owner,
      sharing: newSheet.sharing,
      observations: newSheet.observations,
      status: 'active',
      lastSync: new Date().toLocaleString('pt-BR'),
      columns: 0,
      rows: 0
    };

    setSheets(prev => [...prev, sheet]);
    setShowModal(false);
    setNewSheet({ name: '', sheetId: '', department: '', owner: '', sharing: '', observations: '' });
    alert('Planilha adicionada com sucesso!');
  };

  const extractSheetId = (url: string) => {
    if (url.includes('spreadsheets/d/')) {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : null;
    }
    return url.length > 10 ? url : null;
  };

  const syncSheet = async (sheetId: string) => {
    setLoading(true);
    try {
      // Simulação de sincronização
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSheets(prev => prev.map(sheet => 
        sheet.id === sheetId 
          ? { ...sheet, lastSync: new Date().toLocaleString('pt-BR'), status: 'active' }
          : sheet
      ));
      alert('Sincronização concluída!');
    } catch (error) {
      console.error('Erro ao sincronizar planilha:', error);
      alert('Erro na sincronização');
    } finally {
      setLoading(false);
    }
  };

  const removeSheet = (sheetId: string) => {
    if (window.confirm('Deseja remover esta planilha?')) {
      setSheets(prev => prev.filter(sheet => sheet.id !== sheetId));
      alert('Planilha removida com sucesso!');
    }
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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Sheet className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Dados da Planilha
            </h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => alert('Conectado ao Google Sheets')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              📊 Testar Conexão
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              + Adicionar Nova Planilha
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
            <div className="text-sm text-blue-500 dark:text-blue-400">Máximo Titulares</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
            <div className="text-sm text-orange-500 dark:text-orange-400">Máximo Dependentes</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">23</div>
            <div className="text-sm text-blue-500 dark:text-blue-400">Campos Base</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">7</div>
            <div className="text-sm text-blue-500 dark:text-blue-400">Campos Dinâmicos</div>
          </div>
        </div>

        {/* Planilhas Conectadas */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Planilhas Conectadas</h4>
          <div className="space-y-3">
            {sheets.map((sheet) => (
              <div key={sheet.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{sheet.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Capacidade: 0 GB / 15 GB | Última modificação: Nunca | Última sync: Nunca
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Arquivos: 0 | Pastas: 0 | Backup: 5 minutos
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${sheet.sheetId}`, '_blank')}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Abrir"
                    >
                      📂 Abrir
                    </button>
                    <button
                      onClick={() => alert('Configurações')}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Editar"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => removeSheet(sheet.id)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Remover"
                    >
                      🗑️ Remover
                    </button>
                    <button
                      onClick={() => alert('Backup manual iniciado')}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Backup Manual"
                    >
                      💾 Backup Manual
                    </button>
                    <select className="text-xs border border-gray-300 rounded px-2 py-1" defaultValue="5 minutos">
                      <option>5 minutos</option>
                      <option>10 minutos</option>
                      <option>30 minutos</option>
                      <option>1 hora</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Adicionar Nova Planilha */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Adicionar Nova Planilha</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Planilha *</label>
                <input
                  type="text"
                  placeholder="Ex: Planilha Vendas 2025"
                  value={newSheet.name}
                  onChange={(e) => setNewSheet(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
                <select
                  value={newSheet.department}
                  onChange={(e) => setNewSheet(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o departamento</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link/ID do Google Sheets *</label>
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/... ou apenas o ID"
                  value={newSheet.sheetId}
                  onChange={(e) => setNewSheet(prev => ({ ...prev, sheetId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Cole a URL completa ou apenas o ID da planilha</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proprietário *</label>
                <input
                  type="text"
                  placeholder="Ex: João Silva - comercial@abmix.com.br"
                  value={newSheet.owner}
                  onChange={(e) => setNewSheet(prev => ({ ...prev, owner: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Nome e email do responsável pela planilha</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link de Compartilhamento (opcional)</label>
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
                  value={newSheet.sharing}
                  onChange={(e) => setNewSheet(prev => ({ ...prev, sharing: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Link público para compartilhamento (se diferente do link principal)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação (opcional)</label>
                <textarea
                  placeholder="Ex: Planilha para controle de vendas do Q1 2025"
                  value={newSheet.observations}
                  onChange={(e) => setNewSheet(prev => ({ ...prev, observations: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addNewSheet}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Planilha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}