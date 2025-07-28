import React, { useState, useEffect } from 'react';
import { LogOut, Settings, Users, Database, FileText, Shield } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface RestrictedAreaPortalProps {
  user: User;
  onLogout: () => void;
}

export default function RestrictedAreaPortalSimple({ user, onLogout }: RestrictedAreaPortalProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  console.log('🔥 RestrictedAreaPortalSimple carregado para:', user);

  // Testar conexões Google simplificadas COM TRATAMENTO DE ERRO
  useEffect(() => {
    const testSimpleConnections = async () => {
      try {
        const response = await fetch('/api/simple-google/test-connection');
        const result = await response.json();

        if (result.success) {
          console.log('✅ Conexões Google Simples OK');
        } else {
          console.warn('⚠️ Problemas nas conexões simples:', result);
        }
      } catch (error) {
        console.error('❌ Erro ao testar conexões simples:', error);
        // Tratar erro silenciosamente para não quebrar a interface
      }
    };

    // Executar com tratamento de promise rejeitada
    testSimpleConnections().catch(error => {
      console.error('❌ Promise rejeitada tratada - Conexões Simples:', error);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/65be871e-f7a6-4f31-b1a9-cd0729a73ff8 copy copy.png" 
                alt="Abmix" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Área Restrita</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bem-vindo, {user.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: Settings },
              { key: 'users', label: 'Usuários', icon: Users },
              { key: 'database', label: 'Banco de Dados', icon: Database },
              { key: 'reports', label: 'Relatórios', icon: FileText },
              { key: 'security', label: 'Segurança', icon: Shield }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {activeTab === 'dashboard' && 'Dashboard do Sistema'}
            {activeTab === 'users' && 'Gerenciamento de Usuários'}
            {activeTab === 'database' && 'Banco de Dados'}
            {activeTab === 'reports' && 'Relatórios'}
            {activeTab === 'security' && 'Configurações de Segurança'}
          </h2>

          <div className="text-gray-600 dark:text-gray-300">
            {activeTab === 'dashboard' && (
              <div>
                <p className="mb-4">Sistema funcionando corretamente!</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 dark:text-green-200">Status</h3>
                    <p className="text-green-600 dark:text-green-300">Online</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">Usuários Ativos</h3>
                    <p className="text-blue-600 dark:text-blue-300">5</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200">Propostas</h3>
                    <p className="text-purple-600 dark:text-purple-300">12</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <p>Interface de gerenciamento de usuários em desenvolvimento.</p>
              </div>
            )}

            {activeTab === 'database' && (
              <div>
                <p>Configurações do banco de dados PostgreSQL.</p>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <p>Relatórios do sistema em desenvolvimento.</p>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <p>Configurações de segurança do sistema.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}