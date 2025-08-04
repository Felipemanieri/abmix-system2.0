import { useState } from 'react';
import { Lock, Eye, EyeOff, Key, Shield, Download, RefreshCw } from 'lucide-react';

export default function SimplePasswordManagement() {
  const [showPasswords, setShowPasswords] = useState(false);
  
  const systemUsers = [
    { id: 1, name: 'Felipe Administrador', email: 'felipe@abmix.com.br', password: '123456', type: 'Administrador' },
    { id: 2, name: 'Supervisor', email: 'supervisao@abmix.com.br', password: '123456', type: 'Sistema' },
    { id: 3, name: 'Financeiro', email: 'financeiro@abmix.com.br', password: '123456', type: 'Sistema' },
    { id: 4, name: 'Implementação', email: 'implementacao@abmix.com.br', password: '123456', type: 'Sistema' },
    { id: 5, name: 'Cliente', email: 'cliente@abmix.com.br', password: '123456', type: 'Sistema' },
  ];

  const vendors = [
    { id: 1, name: 'Fabiana Godinho', email: 'comercial@abmix.com.br', password: '123456' },
    { id: 2, name: 'Monique Silva', email: 'comercial2@abmix.com.br', password: '123456' },
    { id: 3, name: 'Gabrielle Fernandes', email: 'comercial3@abmix.com.br', password: '123456' },
    { id: 4, name: 'Isabela Velasquez', email: 'comercial4@abmix.com.br', password: '123456' },
    { id: 5, name: 'Juliana Araujo', email: 'comercial6@abmix.com.br', password: '123456' },
    { id: 6, name: 'Sara Mattos', email: 'comercial8@abmix.com.br', password: '123456' },
  ];

  const exportUsers = () => {
    const allUsers = [
      ...systemUsers.map(u => ({ ...u, categoria: 'Sistema' })),
      ...vendors.map(u => ({ ...u, categoria: 'Vendedor' }))
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Nome,Email,Senha,Tipo,Categoria\n" +
      allUsers.map(u => `${u.name},${u.email},${u.password},${u.type || 'Vendedor'},${u.categoria}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "usuarios_senhas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Controle de Senhas</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportUsers}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showPasswords ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPasswords ? 'Ocultar' : 'Mostrar'} Senhas
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Usuários</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{systemUsers.length + vendors.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <div className="flex items-center">
              <Key className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Usuários Sistema</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{systemUsers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Vendedores</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{vendors.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Senhas Ativas</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{systemUsers.length + vendors.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Usuários do Sistema */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usuários do Sistema</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Nome</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Senha</th>
                  <th scope="col" className="px-6 py-3">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {systemUsers.map((user) => (
                  <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {showPasswords ? user.password : '••••••'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                        user.type === 'Administrador' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {user.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendedores */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vendedores</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Nome</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Senha</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{vendor.name}</td>
                    <td className="px-6 py-4">{vendor.email}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {showPasswords ? vendor.password : '••••••'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}