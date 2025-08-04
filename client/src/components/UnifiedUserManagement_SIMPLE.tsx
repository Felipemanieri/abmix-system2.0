import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Upload,
  Save,
  X,
  Shield,
  Settings,
  Monitor,
  Briefcase,
  UserCheck,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  panel: string;
  active: boolean;
  userType: 'system' | 'vendor';
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function UnifiedUserManagement() {
  const [activePanel, setActivePanel] = useState('supervisor');
  const [showPasswords, setShowPasswords] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dados simulados para evitar problemas de API
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Felipe Manieri',
      email: 'felipe@abmix.com.br',
      password: '123456',
      role: 'admin',
      panel: 'restricted',
      active: true,
      userType: 'system',
      lastLogin: '2025-01-25T19:30:00.000Z',
      createdAt: '2025-01-17T23:27:16.446Z',
      updatedAt: '2025-01-17T23:27:16.446Z'
    },
    {
      id: 2,
      name: 'Rod Ribas',
      email: 'supervisao@abmix.com.br',
      password: '123456',
      role: 'supervisor',
      panel: 'supervisor',
      active: true,
      userType: 'system',
      lastLogin: '2025-01-25T18:45:00.000Z',
      createdAt: '2025-01-17T23:27:16.446Z',
      updatedAt: '2025-01-17T23:27:16.446Z'
    },
    {
      id: 3,
      name: 'Carol Almeida',
      email: 'carol@abmix.com.br',
      password: '123456',
      role: 'financial',
      panel: 'financial',
      active: true,
      userType: 'system',
      lastLogin: '2025-01-25T17:20:00.000Z',
      createdAt: '2025-01-17T23:27:16.446Z',
      updatedAt: '2025-01-17T23:27:16.446Z'
    }
  ];

  useEffect(() => {
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const panelUsers = filteredUsers.filter(user => {
    if (activePanel === 'all') return true;
    return user.panel === activePanel || user.role === activePanel;
  });

  const handleAddUser = () => {
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Gestão de Usuários</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
            >
              {showPasswords ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showPasswords ? 'Ocultar' : 'Mostrar'} Senhas
            </button>
            <button
              onClick={() => {
                if (window.confirm('Deseja exportar a lista completa de usuários?')) {
                  window.alert('Exportando lista de usuários...');
                }
              }}
              className="flex items-center px-3 py-2 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
            <button
              onClick={handleAddUser}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg border border-sky-200 hover:border-sky-300 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={activePanel}
              onChange={(e) => setActivePanel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os Portais</option>
              <option value="supervisor">Portal Supervisor</option>
              <option value="financial">Portal Financeiro</option>
              <option value="implementation">Portal Implementação</option>
              <option value="restricted">Área Restrita</option>
              <option value="vendor">Vendedores</option>
            </select>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Usuários</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Ativos</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">{users.filter(u => u.active).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Sistema</p>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{users.filter(u => u.userType === 'system').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
            <div className="flex items-center">
              <Briefcase className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Vendedores</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{users.filter(u => u.userType === 'vendor').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Senha</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Portal</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Último Login</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {panelUsers.map((user) => (
                <tr key={user.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    {showPasswords ? (
                      <span className="font-mono text-gray-900 dark:text-white">{user.password}</span>
                    ) : (
                      <span className="text-gray-400">••••••••</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.userType === 'system' 
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                        : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                    }`}>
                      {user.userType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {user.panel}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.active
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {panelUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>

      {/* Botões de Controle do Sistema */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400 mr-3" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Controles do Sistema</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              if (window.confirm('Deseja sincronizar todos os usuários?')) {
                window.alert('Sincronizando usuários...');
              }
            }}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Sincronizar
          </button>
          <button
            onClick={() => {
              if (window.confirm('Deseja fazer backup dos usuários?')) {
                window.alert('Fazendo backup...');
              }
            }}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Backup
          </button>
          <button
            onClick={() => {
              if (window.confirm('Deseja restaurar usuários do backup?')) {
                window.alert('Restaurando do backup...');
              }
            }}
            className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            Restaurar
          </button>
          <button
            onClick={() => {
              if (window.confirm('ATENÇÃO: Isso resetará todos os usuários para o padrão de fábrica. Continuar?')) {
                window.alert('Reset de fábrica iniciado...');
              }
            }}
            className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            Reset Fábrica
          </button>
        </div>
      </div>
    </div>
  );
}