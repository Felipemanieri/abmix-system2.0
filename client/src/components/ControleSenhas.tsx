import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  Shield, 
  Users, 
  RefreshCw, 
  Download,
  Search,
  Edit,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

export default function ControleSenhas() {
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const queryClient = useQueryClient();

  // Buscar usuários do sistema
  const { data: systemUsers = [], isLoading: loadingSystemUsers } = useQuery({
    queryKey: ["/api/system-users"],
    queryFn: async () => {
      const response = await fetch("/api/system-users");
      if (!response.ok) throw new Error("Erro ao buscar usuários do sistema");
      return response.json();
    }
  });

  // Buscar vendedores
  const { data: vendors = [], isLoading: loadingVendors } = useQuery({
    queryKey: ["/api/vendors"],
    queryFn: async () => {
      const response = await fetch("/api/vendors");
      if (!response.ok) throw new Error("Erro ao buscar vendedores");
      return response.json();
    }
  });

  // Mutation para atualizar senha
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ id, password, type }: { id: number; password: string; type: 'system' | 'vendor' }) => {
      const endpoint = type === 'system' ? `/api/system-users/${id}` : `/api/vendors/${id}`;
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!response.ok) throw new Error("Erro ao atualizar senha");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: variables.type === 'system' ? ["/api/system-users"] : ["/api/vendors"] 
      });
      setEditingUser(null);
      setNewPassword('');
      alert("Senha atualizada com sucesso!");
    },
    onError: () => {
      alert("Erro ao atualizar senha.");
    },
  });

  const handleUpdatePassword = (id: number, type: 'system' | 'vendor') => {
    if (!newPassword.trim()) {
      alert("Digite uma nova senha");
      return;
    }
    updatePasswordMutation.mutate({ id, password: newPassword, type });
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const exportPasswordList = () => {
    const allUsers = [
      ...systemUsers.map((u: any) => ({ ...u, type: 'Sistema' })),
      ...vendors.map((v: any) => ({ ...v, type: 'Vendedor' }))
    ];

    const csvContent = [
      'Nome,Email,Senha,Tipo,Painel,Status',
      ...allUsers.map((user: any) => 
        `"${user.name}","${user.email}","${user.password}","${user.type}","${user.panel || 'N/A'}","${user.active ? 'Ativo' : 'Inativo'}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `controle_senhas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredSystemUsers = systemUsers.filter((user: any) => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendors = vendors.filter((vendor: any) => 
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = systemUsers.length + vendors.length;
  const activeUsers = systemUsers.filter((u: any) => u.active).length + vendors.filter((v: any) => v.active !== false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Lock className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Controle Total de Senhas</h3>
              <p className="text-gray-600">Gerenciamento de senhas para todos os usuários do sistema</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAllPasswords(!showAllPasswords)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                showAllPasswords 
                  ? 'bg-red-600 text-white dark:bg-red-50 dark:bg-red-9000 dark:text-white hover:bg-red-700' 
                  : 'bg-gray-200 dark:bg-gray-600 dark:bg-gray-600 text-gray-700 hover:bg-gray-300 dark:bg-gray-600'
              }`}
            >
              {showAllPasswords ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showAllPasswords ? 'Ocultar' : 'Mostrar'} Senhas
            </button>
            <button
              onClick={exportPasswordList}
              className="flex items-center px-4 py-2 bg-blue-600 text-white dark:bg-blue-50 dark:bg-blue-9000 dark:text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Lista
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-700">Total Usuários</p>
                <p className="text-2xl font-bold text-blue-900">{totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-700">Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-900">{activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-700">Usuários Sistema</p>
                <p className="text-2xl font-bold text-purple-900">{systemUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <Key className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm text-orange-700">Vendedores</p>
                <p className="text-2xl font-bold text-orange-900">{vendors.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Busca */}
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-4 h-4 text-gray-500 dark:text-white" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-2 hover:bg-gray-100 dark:bg-gray-700 rounded"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-white" />
            </button>
          )}
        </div>

        {/* Aviso de Segurança */}
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Aviso de Segurança</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Esta área permite visualizar e alterar senhas de todos os usuários. Use com responsabilidade e mantenha essas informações seguras.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Usuários do Sistema */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b bg-purple-50 dark:bg-purple-900">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Usuários do Sistema ({filteredSystemUsers.length})
          </h4>
          <p className="text-gray-600 mt-1">Controle de acesso aos painéis administrativos</p>
        </div>

        {loadingSystemUsers ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500 dark:text-white mx-auto mb-4" />
            <p className="text-gray-600">Carregando usuários...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Nome</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Senha</th>
                  <th className="text-left p-4 font-semibold">Painel</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSystemUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">
                      {editingUser === user.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nova senha"
                            className="px-2 py-1 border rounded text-sm w-32"
                          />
                          <button
                            onClick={() => generateRandomPassword()}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-800 dark:bg-blue-900 rounded"
                            title="Gerar senha aleatória"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                          {showAllPasswords ? user.password : '••••••••'}
                        </code>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        {user.panel}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.active ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 dark:text-white'
                      }`}>
                        {user.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4">
                      {editingUser === user.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdatePassword(user.id, 'system')}
                            disabled={updatePasswordMutation.isPending}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-800 dark:bg-green-900 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(null);
                              setNewPassword('');
                            }}
                            className="p-1 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUser(user.id);
                            setNewPassword(user.password);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-800 dark:bg-blue-900 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vendedores */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b bg-orange-50">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5 text-orange-600" />
            Vendedores ({filteredVendors.length})
          </h4>
          <p className="text-gray-600 mt-1">Controle de acesso ao portal de vendas</p>
        </div>

        {loadingVendors ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500 dark:text-white mx-auto mb-4" />
            <p className="text-gray-600">Carregando vendedores...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Nome</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Senha</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVendors.map((vendor: any) => (
                  <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-4 font-medium">{vendor.name}</td>
                    <td className="p-4 text-gray-600">{vendor.email}</td>
                    <td className="p-4">
                      {editingUser === `vendor-${vendor.id}` ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nova senha"
                            className="px-2 py-1 border rounded text-sm w-32"
                          />
                          <button
                            onClick={() => generateRandomPassword()}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-800 dark:bg-blue-900 rounded"
                            title="Gerar senha aleatória"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                          {showAllPasswords ? (vendor.password || '123456') : '••••••••'}
                        </code>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                        Ativo
                      </span>
                    </td>
                    <td className="p-4">
                      {editingUser === `vendor-${vendor.id}` ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdatePassword(vendor.id, 'vendor')}
                            disabled={updatePasswordMutation.isPending}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-800 dark:bg-green-900 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(null);
                              setNewPassword('');
                            }}
                            className="p-1 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUser(`vendor-${vendor.id}`);
                            setNewPassword(vendor.password || '123456');
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-800 dark:bg-blue-900 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}