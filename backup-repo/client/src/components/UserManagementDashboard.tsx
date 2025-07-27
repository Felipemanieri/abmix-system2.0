import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Crown,
  Building2,
  Settings,
  Star,
  UserCheck,
  Shield,
  RefreshCw,
  Download,
  Search,
  Loader2
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'system' | 'vendor';
  panel?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export default function UserManagementDashboard() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'system',
    status: 'active' as 'active' | 'inactive'
  });

  // Auto-remover notificação após 5 segundos
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Buscar usuários usando React Query
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/users'],
    refetchInterval: 30000
  });

  // Buscar vendedores
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
    refetchInterval: 30000
  });

  // Combinar usuários do sistema e vendedores
  const allUsers = [
    ...users.map((u: any) => ({ ...u, type: 'system' })),
    ...vendors.map((v: any) => ({ ...v, type: 'vendor' }))
  ];

  // FUNÇÃO DE FILTRO CORRIGIDA - CRÍTICA
  const getUsersByPanel = (panel: string) => {
    console.log(`🔍 FILTRO: Buscando usuários do painel '${panel}'`);
    console.log(`🔍 FILTRO: Total de usuários disponíveis: ${allUsers.length}`);
    
    let filtered = [];
    
    switch (panel) {
      case 'supervisao':
        filtered = allUsers.filter((u: any) => {
          const match = u.email === 'supervisao@abmix.com.br' || u.name === 'Rod Ribas';
          if (match) console.log(`✅ SUPERVISÃO: ${u.name} (${u.email})`);
          return match;
        });
        break;
        
      case 'financeiro':
        filtered = allUsers.filter((u: any) => {
          const match = u.email === 'financeiro@abmix.com.br' || 
                      u.email === 'carol@abmix.com.br' ||
                      u.email === 'michelle@abmix.com.br' ||
                      u.name === 'Carol Almeida' ||
                      u.name === 'Michelle Manieri' ||
                      u.name === 'Financeiro';
          if (match) console.log(`✅ FINANCEIRO: ${u.name} (${u.email})`);
          return match;
        });
        break;
        
      case 'implementacao':
        filtered = allUsers.filter((u: any) => {
          const match = u.email === 'implementacao@abmix.com.br' ||
                      u.email === 'adm2@abmix.com.br' ||
                      u.name === 'Amanda Fernandes' ||
                      u.name === 'Implementação';
          if (match) console.log(`✅ IMPLANTAÇÃO: ${u.name} (${u.email})`);
          return match;
        });
        break;
        
      case 'comercial':
        filtered = allUsers.filter((u: any) => {
          const match = u.type === 'vendor' || u.email?.includes('comercial');
          if (match) console.log(`✅ COMERCIAL: ${u.name} (${u.email})`);
          return match;
        });
        break;
        
      case 'cliente':
        filtered = allUsers.filter((u: any) => {
          const match = u.email === 'cliente@abmix.com.br' || u.name === 'Cliente';
          if (match) console.log(`✅ CLIENTE: ${u.name} (${u.email})`);
          return match;
        });
        break;
        
      case 'area-restrita':
        filtered = allUsers.filter((u: any) => {
          const match = u.email === 'felipe@abmix.com.br' || 
                      u.name === 'Felipe Manieri' ||
                      (u.role === 'admin' && u.email === 'felipe@abmix.com.br');
          if (match) console.log(`✅ ÁREA RESTRITA: ${u.name} (${u.email})`);
          return match;
        });
        break;
        
      default:
        console.log(`❌ FILTRO: Painel '${panel}' não reconhecido - retornando array vazio`);
        filtered = [];
    }
    
    console.log(`🔍 FILTRO RESULTADO: ${filtered.length} usuários encontrados para '${panel}'`);
    return filtered;
  };

  // SISTEMA DE FILTRO COMPLETAMENTE REFEITO
  const filteredUsers = React.useMemo(() => {
    console.log('🔧 FILTRO EXECUTANDO:', { selectedPanel, searchTerm, totalUsers: allUsers?.length });
    
    // SE NÃO TEM PAINEL SELECIONADO = LISTA VAZIA
    if (!selectedPanel) {
      console.log('🔧 FILTRO: Nenhum painel selecionado - retornando lista vazia');
      return [];
    }
    
    // APLICAR FILTRO DE PAINEL
    let resultado = [];
    
    if (selectedPanel === 'comercial') {
      resultado = allUsers.filter((u: any) => u.type === 'vendor');
      console.log('🔧 FILTRO COMERCIAL: Encontrados', resultado.length, 'vendedores');
    } else if (selectedPanel === 'supervisao') {
      resultado = allUsers.filter((u: any) => u.name === 'Rod Ribas' || u.email === 'supervisao@abmix.com.br');
      console.log('🔧 FILTRO SUPERVISÃO: Encontrados', resultado.length, 'supervisores');
    } else if (selectedPanel === 'financeiro') {
      resultado = allUsers.filter((u: any) => 
        u.email === 'carol@abmix.com.br' || 
        u.email === 'michelle@abmix.com.br' || 
        u.email === 'financeiro@abmix.com.br'
      );
      console.log('🔧 FILTRO FINANCEIRO: Encontrados', resultado.length, 'usuários');
    } else if (selectedPanel === 'implementacao') {
      resultado = allUsers.filter((u: any) => 
        u.email === 'adm2@abmix.com.br' || 
        u.email === 'implementacao@abmix.com.br'
      );
      console.log('🔧 FILTRO IMPLEMENTAÇÃO: Encontrados', resultado.length, 'usuários');
    } else if (selectedPanel === 'area-restrita') {
      resultado = allUsers.filter((u: any) => u.email === 'felipe@abmix.com.br');
      console.log('🔧 FILTRO ÁREA RESTRITA: Encontrados', resultado.length, 'usuários');
    } else if (selectedPanel === 'cliente') {
      resultado = allUsers.filter((u: any) => u.email === 'cliente@abmix.com.br');
      console.log('🔧 FILTRO CLIENTE: Encontrados', resultado.length, 'usuários');
    }
    
    // APLICAR BUSCA
    if (searchTerm.trim()) {
      resultado = resultado.filter((user: any) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('🔧 FILTRO BUSCA: Após busca, restaram', resultado.length, 'usuários');
    }
    
    console.log('🔧 FILTRO FINAL:', resultado.map(u => u.name + ' (' + u.email + ')'));
    return resultado;
  }, [selectedPanel, allUsers, searchTerm]);

  // Contadores por tipo
  const supervisaoCount = getUsersByPanel('supervisao').length;
  const financeiroCount = getUsersByPanel('financeiro').length;
  const implementacaoCount = getUsersByPanel('implementacao').length;
  const comercialCount = getUsersByPanel('comercial').length;
  const clienteCount = getUsersByPanel('cliente').length;
  const areaRestritaCount = getUsersByPanel('area-restrita').length;

  const addUser = async () => {
    console.log('🔧 CRIAR USUÁRIO: Iniciando processo...');
    console.log('🔧 DADOS:', newUser);
    
    if (!newUser.name || !newUser.email || !newUser.password) {
      setNotification({
        type: 'error',
        message: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    try {
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        panel: newUser.role === 'vendor' ? 'comercial' : newUser.role,
        active: newUser.status === 'active',
        status: newUser.status
      };
      
      console.log('🔧 ENVIANDO DADOS:', userData);
      
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      console.log('🔧 RESPOSTA STATUS:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔧 SUCESSO:', result);
        
        setNewUser({ name: '', email: '', password: '', role: 'system', status: 'active' });
        setShowAddModal(false);
        
        // FORÇA MÚLTIPLAS ATUALIZAÇÕES PARA GARANTIR QUE APAREÇA
        refetch();
        setTimeout(() => refetch(), 200);
        setTimeout(() => refetch(), 500);
        setTimeout(() => refetch(), 1000);
        setNotification({
          type: 'success',
          message: 'Usuário criado com sucesso!'
        });
      } else {
        const errorData = await response.json();
        console.log('🔧 ERRO:', errorData);
        setNotification({
          type: 'error',
          message: errorData.message || 'Erro ao criar usuário'
        });
      }
    } catch (error) {
      console.log('🔧 ERRO EXCEPTION:', error);
      setNotification({
        type: 'error',
        message: 'Erro ao criar usuário - ' + error.message
      });
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, password });
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'null' || dateString === null || dateString === undefined) {
      return 'Nunca';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Nunca';
      }
      // 🇧🇷 CORRIGIR PARA FUSO BRASILEIRO (UTC-3)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo' // Fuso brasileiro
      });
    } catch (error) {
      return 'Nunca';
    }
  };

  const exportUsers = () => {
    const csv = [
      ['USUÁRIO', 'EMAIL', 'SENHA', 'STATUS', 'ÚLTIMO LOGIN'],
      ...filteredUsers.map((user: any) => [
        user.name || 'N/A',
        user.email || 'N/A',
        user.password || '120784',
        user.status === 'active' ? 'Ativo' : 'Inativo',
        formatDate(user.lastLogin)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios_sistema.csv';
    a.click();
  };

  // FUNÇÃO EXCLUIR USUÁRIO
  const deleteUser = async (user: any) => {
    const confirmed = window.confirm('Tem certeza que deseja excluir este usuário?');
    if (!confirmed) return;
    
    console.log('🔧 EXCLUINDO USUÁRIO:', user);
    try {
      const response = await fetch(`/api/auth/users/${user.id}?type=${user.type}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        refetch();
        setNotification({
          type: 'success',
          message: 'Usuário excluído com sucesso!'
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Erro ao excluir usuário'
        });
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      setNotification({
        type: 'error',
        message: 'Erro ao excluir usuário'
      });
    }
  };

  // FUNÇÃO EDITAR USUÁRIO
  const updateUser = async () => {
    if (!editingUser) return;
    
    console.log('🔧 EDITANDO USUÁRIO:', editingUser);
    try {
      const response = await fetch(`/api/auth/users/${editingUser.id}?type=${editingUser.type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingUser(null);
        refetch();
        setNotification({
          type: 'success',
          message: 'Usuário atualizado com sucesso!'
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Erro ao atualizar usuário'
        });
      }
    } catch (error) {
      console.error('Erro ao editar:', error);
      setNotification({
        type: 'error',
        message: 'Erro ao atualizar usuário'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando usuários...</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Gestão Unificada de Usuários
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerenciar usuários de todos os painéis do sistema
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Atualizar
          </button>
          <button
            onClick={exportUsers}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-6 gap-4">
          <button
            onClick={() => setSelectedPanel(selectedPanel === 'supervisao' ? null : 'supervisao')}
            className={`text-center p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              selectedPanel === 'supervisao' 
                ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400' 
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Crown className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900 dark:text-white">{supervisaoCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Supervisão</div>
          </button>
          
          <button
            onClick={() => setSelectedPanel(selectedPanel === 'financeiro' ? null : 'financeiro')}
            className={`text-center p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              selectedPanel === 'financeiro' 
                ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400' 
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Building2 className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900 dark:text-white">{financeiroCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Financeiro</div>
          </button>
          
          <button
            onClick={() => setSelectedPanel(selectedPanel === 'implementacao' ? null : 'implementacao')}
            className={`text-center p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              selectedPanel === 'implementacao' 
                ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400' 
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Settings className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900 dark:text-white">{implementacaoCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Implantação</div>
          </button>
          
          <button
            onClick={() => {
              const novoValor = selectedPanel === 'comercial' ? null : 'comercial';
              console.log('🔧 COMERCIAL CLICADO: Mudando de', selectedPanel, 'para', novoValor);
              setSelectedPanel(novoValor);
            }}
            className={`text-center p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              selectedPanel === 'comercial' 
                ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/30 ring-2 ring-orange-400' 
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Star className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900 dark:text-white">{comercialCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Comercial</div>
          </button>
          
          <button
            onClick={() => setSelectedPanel(selectedPanel === 'cliente' ? null : 'cliente')}
            className={`text-center p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              selectedPanel === 'cliente' 
                ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400' 
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <UserCheck className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900 dark:text-white">{clienteCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cliente</div>
          </button>
          
          <button
            onClick={() => setSelectedPanel(selectedPanel === 'area-restrita' ? null : 'area-restrita')}
            className={`text-center p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              selectedPanel === 'area-restrita' 
                ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400' 
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Shield className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900 dark:text-white">{areaRestritaCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Área Restrita</div>
          </button>
        </div>
      </div>

      {/* Painel Selecionado */}
      {selectedPanel && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Filtro ativo: {selectedPanel === 'supervisao' ? 'Supervisão' : 
                        selectedPanel === 'financeiro' ? 'Financeiro' :
                        selectedPanel === 'implementacao' ? 'Implantação' :
                        selectedPanel === 'comercial' ? 'Comercial' :
                        selectedPanel === 'cliente' ? 'Cliente' :
                        selectedPanel === 'area-restrita' ? 'Área Restrita' : ''}
              </h4>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                • Mostrando {filteredUsers.length} usuário(s) do setor
              </span>
            </div>
            <button
              onClick={() => setSelectedPanel(null)}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Limpar filtro
            </button>
          </div>
        </div>
      )}

      {/* Search and New User */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                console.log('🔧 BOTÃO SENHAS CLICADO: Atual =', showPasswords, '-> Novo =', !showPasswords);
                setShowPasswords(!showPasswords);
              }}
              className="flex items-center px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors border border-purple-300 dark:border-purple-700"
            >
              {showPasswords ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showPasswords ? 'Ocultar Senhas' : 'Mostrar Senhas'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                USUÁRIO
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                EMAIL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                SENHA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                STATUS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ÚLTIMO LOGIN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                AÇÕES
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Crown className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {selectedPanel ? 'Nenhum usuário encontrado neste setor' : 'Selecione uma caixa acima para ver os usuários'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user: any) => (
                <tr key={user.id || user.email} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name || 'Usuário sem nome'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="font-mono bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded border">
                      {showPasswords ? (user.password || '120784') : '••••••••'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' || user.active !== false
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {user.status === 'active' || user.active !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {(() => {
                      // 🔧 VERIFICAR AMBOS OS CAMPOS POSSÍVEIS
                      const lastLoginTime = user.lastLogin || user.last_login;
                      if (!lastLoginTime) return 'Nunca';
                      try {
                        const date = new Date(lastLoginTime);
                        return date.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'America/Sao_Paulo' // Fuso brasileiro
                        });
                      } catch {
                        return 'Nunca';
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          console.log('🔧 EDITAR USUÁRIO:', user.id, user.name);
                          setEditingUser(user);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        title="Editar usuário"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('🔧 EXCLUIR USUÁRIO:', user.id, user.name);
                          deleteUser(user);
                        }}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                        title="Excluir usuário"
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

      {/* Modal Novo Usuário - CORRIGIDO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Criar Novo Usuário
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="usuario@abmix.com.br"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Senha
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Senha do usuário"
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center"
                    title="Gerar senha aleatória"
                  >
                    🎲
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Usuário
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="system">Sistema</option>
                  <option value="vendor">Vendedor</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="financial">Financeiro</option>
                  <option value="implementation">Implantação</option>
                  <option value="client">Cliente</option>
                  <option value="admin">Administrador</option>
                  <option value="restricted">Área Restrita</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser({ ...newUser, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addUser}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Criar Usuário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Editar Usuário
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Senha
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                      let password = '';
                      for (let i = 0; i < 8; i++) {
                        password += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setEditingUser({ ...editingUser, password });
                    }}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    🎲
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={updateUser}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Salvar Alterações
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificação Interna */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}