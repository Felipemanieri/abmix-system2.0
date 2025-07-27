import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { apiRequest } from '@/lib/queryClient';

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

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  panel: string;
  active: boolean;
}

export default function UnifiedUserManagement() {
  const queryClient = useQueryClient();
  const [activePanel, setActivePanel] = useState('supervisor');
  const [showPasswords, setShowPasswords] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: '',
    panel: '',
    active: true
  });

  // Função simples e robusta para toggle de senhas - FIXED v2
  const handlePasswordToggle = () => {
    setShowPasswords(!showPasswords);
  };

  // Configuração dos painéis
  const panels = {
    supervisor: {
      name: 'Supervisor',
      icon: Shield,
      color: 'blue',
      description: 'Gestão de equipe e relatórios'
    },
    financial: {
      name: 'Financeiro',
      icon: Briefcase,
      color: 'green',
      description: 'Validação e análises financeiras'
    },
    implementation: {
      name: 'Implantação',
      icon: Settings,
      color: 'purple',
      description: 'Processamento e implementação'
    },
    vendor: {
      name: 'Vendedor',
      icon: UserCheck,
      color: 'orange',
      description: 'Criação de propostas'
    },
    client: {
      name: 'Cliente',
      icon: Users,
      color: 'pink',
      description: 'Portal do cliente'
    },
    restricted: {
      name: 'Área Restrita',
      icon: Monitor,
      color: 'red',
      description: 'Administração do sistema'
    }
  };

  // Fetch all users using unified API - otimizado para performance máxima
  const { data: allCombinedUsers = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/users'],
    queryFn: async () => {
      const response = await fetch('/api/auth/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados frescos
    gcTime: 10 * 60 * 1000, // 10 minutos no cache
    refetchOnWindowFocus: false, // Nunca refetch automático
    refetchInterval: false, // Nunca polling automático
    retry: 1,
    retryDelay: 1000
  });

  const filteredUsers = allCombinedUsers.filter((user: User) => {
    const matchesPanel = user.panel === activePanel;
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPanel && matchesSearch;
  });

  // Calculate user counts for each panel
  const getUserCountByPanel = (panelKey: string) => {
    return allCombinedUsers.filter(user => user.panel === panelKey).length;
  };

  // Debug: Only log when data is loading
  if (isLoading) {
    console.log('Loading user data...');
  }

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      return apiRequest('/api/auth/users', {
        method: 'POST',
        body: { ...userData, userType: userData.panel === 'vendor' ? 'vendor' : 'system' }
      });
    },
    onSuccess: () => {
      // Sincronização instantânea com múltiplas invalidações
      queryClient.invalidateQueries({ queryKey: ['/api/auth/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/system-users'] });
      queryClient.refetchQueries({ queryKey: ['/api/auth/users'] });
      queryClient.refetchQueries({ queryKey: ['/api/system-users'] });
      
      setShowUserModal(false);
      resetForm();
      console.log("🚀 Usuário criado e todos os painéis sincronizados instantaneamente!");
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: Partial<UserFormData> }) => {
      const userToUpdate = allCombinedUsers.find(u => u.id === id);
      if (!userToUpdate) throw new Error('User not found');
      
      return apiRequest(`/api/auth/users/${id}`, {
        method: 'PATCH',
        body: { ...userData, userType: userToUpdate.userType }
      });
    },
    onSuccess: () => {
      // Sincronização instantânea com múltiplas invalidações
      queryClient.invalidateQueries({ queryKey: ['/api/auth/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/system-users'] });
      queryClient.refetchQueries({ queryKey: ['/api/auth/users'] });
      queryClient.refetchQueries({ queryKey: ['/api/system-users'] });
      
      setShowUserModal(false);
      setEditingUser(null);
      resetForm();
      console.log("🚀 Usuário atualizado e todos os painéis sincronizados instantaneamente!");
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const userToDelete = allCombinedUsers.find(u => u.id === id);
      if (!userToDelete) throw new Error('User not found');
      
      return apiRequest(`/api/auth/users/${id}?userType=${userToDelete.userType}`, { 
        method: 'DELETE' 
      });
    },
    onSuccess: () => {
      // Sincronização instantânea com múltiplas invalidações e refetch forçado
      queryClient.invalidateQueries({ queryKey: ['/api/auth/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/system-users'] });
      queryClient.refetchQueries({ queryKey: ['/api/auth/users'] });
      queryClient.refetchQueries({ queryKey: ['/api/system-users'] });
      refetch(); // Force immediate UI update
      
      console.log("🚀 Usuário removido e todos os painéis sincronizados instantaneamente!");
    }
  });

  // Update password mutation using unified API
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ id, password, userType }: { id: number; password: string; userType: 'system' | 'vendor' }) => {
      return apiRequest(`/api/auth/users/${id}/password`, {
        method: 'PATCH',
        body: { password, userType }
      });
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['/api/auth/users'] });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      panel: activePanel,
      active: true
    });
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Handle password editing for specific user
  const handleEditPassword = (user: User) => {
    const newPassword = generatePassword();
    updatePasswordMutation.mutate({
      id: user.id,
      password: newPassword,
      userType: user.userType
    });
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '120784', // Default password
      role: activePanel === 'vendor' ? 'vendor' : activePanel,
      panel: activePanel,
      active: true
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      panel: user.panel,
      active: user.active
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, userData: formData });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      'Nome,Email,Senha,Painel,Status,Criado em',
      ...filteredUsers.map(user => 
        `"${user.name}","${user.email}","${user.password}","${user.panel}","${user.active ? 'Ativo' : 'Inativo'}","${new Date(user.createdAt).toLocaleDateString('pt-BR')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${activePanel}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const currentPanel = panels[activePanel as keyof typeof panels];
  const PanelIcon = currentPanel.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Gestão Unificada de Usuários</h3>
              <p className="text-gray-600">Gerenciar usuários de todos os painéis do sistema</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={exportUsers}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Panel Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
          {Object.entries(panels).map(([key, panel]) => {
            const Icon = panel.icon;
            const isActive = activePanel === key;
            return (
              <button
                key={key}
                onClick={() => setActivePanel(key)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isActive
                    ? panel.color === 'blue' ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : panel.color === 'green' ? 'border-green-500 bg-green-50 text-green-700'
                    : panel.color === 'purple' ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : panel.color === 'orange' ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : panel.color === 'pink' ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : panel.color === 'red' ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-500 bg-gray-50 text-gray-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">{panel.name}</div>
                <div className="text-xs opacity-75">{getUserCountByPanel(key)}</div>
              </button>
            );
          })}
        </div>

        {/* Current Panel Info */}
        <div className={`rounded-lg p-4 mb-6 ${
          currentPanel.color === 'blue' ? 'bg-blue-50 border border-blue-200'
          : currentPanel.color === 'green' ? 'bg-green-50 border border-green-200'
          : currentPanel.color === 'purple' ? 'bg-purple-50 border border-purple-200'
          : currentPanel.color === 'orange' ? 'bg-orange-50 border border-orange-200'
          : currentPanel.color === 'pink' ? 'bg-pink-50 border border-pink-200'
          : currentPanel.color === 'red' ? 'bg-red-50 border border-red-200'
          : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center">
            <PanelIcon className={`w-5 h-5 mr-3 ${
              currentPanel.color === 'blue' ? 'text-blue-600'
              : currentPanel.color === 'green' ? 'text-green-600'
              : currentPanel.color === 'purple' ? 'text-purple-600'
              : currentPanel.color === 'orange' ? 'text-orange-600'
              : currentPanel.color === 'pink' ? 'text-pink-600'
              : currentPanel.color === 'red' ? 'text-red-600'
              : 'text-gray-600'
            }`} />
            <div>
              <h4 className={`font-semibold ${
                currentPanel.color === 'blue' ? 'text-blue-900'
                : currentPanel.color === 'green' ? 'text-green-900'
                : currentPanel.color === 'purple' ? 'text-purple-900'
                : currentPanel.color === 'orange' ? 'text-orange-900'
                : currentPanel.color === 'pink' ? 'text-pink-900'
                : currentPanel.color === 'red' ? 'text-red-900'
                : 'text-gray-900'
              }`}>
                Painel {currentPanel.name}
              </h4>
              <p className={`text-sm ${
                currentPanel.color === 'blue' ? 'text-blue-700'
                : currentPanel.color === 'green' ? 'text-green-700'
                : currentPanel.color === 'purple' ? 'text-purple-700'
                : currentPanel.color === 'orange' ? 'text-orange-700'
                : currentPanel.color === 'pink' ? 'text-pink-700'
                : currentPanel.color === 'red' ? 'text-red-700'
                : 'text-gray-700'
              }`}>
                {currentPanel.description} • {filteredUsers.length} usuários
              </p>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="flex items-center px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              type="button"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar Lista
            </button>
            <button
              onClick={handlePasswordToggle}
              className={`flex items-center px-4 py-2 border rounded-lg transition-colors font-medium ${
                showPasswords
                  ? 'border-orange-500 bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400'
              }`}
              type="button"
            >
              {showPasswords ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Ocultar Senhas
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Mostrar Senhas
                </>
              )}
            </button>
            <button
              onClick={handleCreateUser}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Senha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Carregando usuários...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    Nenhum usuário encontrado para este painel
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full bg-${currentPanel.color}-100 flex items-center justify-center mr-3`}>
                          <PanelIcon className={`w-4 h-4 text-${currentPanel.color}-600`} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {showPasswords ? (
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {user.password || (user.role === 'vendor' ? '120784' : 'N/A')}
                        </span>
                      ) : (
                        <span className="text-gray-400">••••••••</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Inativo
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString('pt-BR')
                        : 'Nunca'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Painel
                  </label>
                  <select
                    value={formData.panel}
                    onChange={(e) => setFormData({ ...formData, panel: e.target.value, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {Object.entries(panels).map(([key, panel]) => (
                      <option key={key} value={key}>
                        {panel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                    Usuário ativo
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2 inline" />
                    {editingUser ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}