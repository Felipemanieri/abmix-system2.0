import { useState } from 'react';
import { Users, Plus, Edit, Trash2, Eye, EyeOff, Shield, UserPlus, Mail, Key, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function SimpleUserManagement() {
  const [showPasswords, setShowPasswords] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Gestão de Usuários</h3>
          </div>
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showPasswords ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPasswords ? 'Ocultar' : 'Mostrar'} Senhas
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Usuários</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">5</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Ativos</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">5</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Administradores</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">1</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Vendedores</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Nome</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Senha</th>
                <th scope="col" className="px-6 py-3">Tipo</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* Usuário Principal */}
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  Felipe Administrador
                </td>
                <td className="px-6 py-4">felipe@abmix.com.br</td>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {showPasswords ? '123456' : '••••••'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">
                    Administrador
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                    Ativo
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Usuários do Sistema */}
              {[
                { name: 'Supervisor', email: 'supervisao@abmix.com.br', type: 'Sistema' },
                { name: 'Financeiro', email: 'financeiro@abmix.com.br', type: 'Sistema' },
                { name: 'Implementação', email: 'implementacao@abmix.com.br', type: 'Sistema' },
                { name: 'Cliente', email: 'cliente@abmix.com.br', type: 'Sistema' },
              ].map((user, index) => (
                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {showPasswords ? '123456' : '••••••'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                      {user.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                      Ativo
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botão Adicionar Usuário */}
        <div className="mt-6 flex justify-between items-center">
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Usuário
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sistema funcionando corretamente
          </p>
        </div>
      </div>
    </div>
  );
}