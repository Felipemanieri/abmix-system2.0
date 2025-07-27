import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, Mail, Info, Shield, AlertCircle, User, FileText, DollarSign, Settings, Users, Calculator, Crown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
// import AbmixLogo from './AbmixLogo';

interface LoginPageProps {
  portal: 'client' | 'vendor' | 'financial' | 'supervisor' | 'implementation' | 'restricted';
  onLogin: (user: any) => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ portal, onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Buscar dados reais do sistema
  const { data: proposals = [] } = useQuery({
    queryKey: ['/api/proposals'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/proposals');
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    },
    retry: false,
    refetchInterval: 30000
  });

  // Atualizar hora a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Calcular propostas de hoje
  const proposalsToday = proposals.filter((p: any) => {
    const proposalDate = new Date(p.createdAt);
    const today = new Date();
    return proposalDate.toDateString() === today.toDateString();
  }).length;

  // Status do backup (simulado - poderia vir de uma API de status)
  const backupStatus = {
    active: true, // Poderia vir de /api/system/status
    lastBackup: new Date()
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Load saved credentials on component mount
  useEffect(() => {
    const storageKey = `abmix_credentials_${portal}`;
    const savedCredentials = localStorage.getItem(storageKey);
    console.log(`[${portal}] Loading credentials from storage:`, storageKey, savedCredentials ? 'Found' : 'Not found');
    
    if (savedCredentials) {
      try {
        const { email: savedEmail, password: savedPassword, remember } = JSON.parse(savedCredentials);
        console.log(`[${portal}] Parsed credentials:`, { email: savedEmail, hasPassword: !!savedPassword, remember });
        
        if (remember) {
          setEmail(savedEmail || '');
          setPassword(savedPassword || '');
          setRememberMe(true);
          console.log(`[${portal}] Credentials loaded successfully`);
        }
      } catch (error) {
        console.error(`[${portal}] Error loading saved credentials:`, error);
      }
    }
  }, [portal]);

  // Save or remove credentials based on "remember me" checkbox
  const saveCredentials = (email: string, password: string, remember: boolean) => {
    const storageKey = `abmix_credentials_${portal}`;
    console.log(`[${portal}] Saving credentials:`, { email, hasPassword: !!password, remember, storageKey });
    
    if (remember) {
      const credentialsData = {
        email,
        password,
        remember: true,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(credentialsData));
      console.log(`[${portal}] Credentials saved to localStorage`);
    } else {
      localStorage.removeItem(storageKey);
      console.log(`[${portal}] Credentials removed from localStorage`);
    }
  };

  const portalConfig = {
    client: {
      title: 'Portal do Cliente',
      subtitle: 'Acesse sua área para acompanhar propostas e documentos',
      icon: User,
      gradient: 'from-cyan-400 via-teal-500 to-cyan-600',
      accent: 'teal',
    },
    vendor: {
      title: 'Portal do Vendedor',
      subtitle: 'Gerencie propostas, clientes e acompanhe vendas',
      icon: FileText,
      gradient: 'from-cyan-500 via-blue-500 to-teal-600',
      accent: 'cyan',
    },
    financial: {
      title: 'Portal Financeiro',
      subtitle: 'Validação, aprovação e análise financeira',
      icon: Calculator,
      gradient: 'from-teal-400 via-cyan-500 to-blue-600',
      accent: 'blue',
    },
    supervisor: {
      title: 'Portal Supervisor',
      subtitle: 'Supervisão, relatórios e gestão de equipe',
      icon: Crown,
      gradient: 'from-blue-500 via-teal-500 to-cyan-600',
      accent: 'slate',
    },
    implementation: {
      title: 'Portal de Implantação',
      subtitle: 'Gestão de implantação e automação de processos',
      icon: Settings,
      gradient: 'from-teal-500 via-cyan-500 to-blue-500',
      accent: 'teal',
    },
    restricted: {
      title: 'Área Restrita',
      subtitle: 'Acesso exclusivo para administradores do sistema',
      icon: Shield,
      gradient: 'from-slate-600 via-gray-700 to-slate-800',
      accent: 'slate',
    },
  };

  const config = portalConfig[portal];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Use unified authentication API for all portals
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, portal }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        
        console.log('✅ Login success from frontend:', userData);
        
        // Save credentials if "remember me" is checked
        saveCredentials(email, password, rememberMe);
        
        onLogin(userData);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Credenciais inválidas');
      }
    } catch (error) {
      setErrorMessage('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fundo geométrico sutil inspirado no logo Abmix */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-100/30 to-teal-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-blue-100/30 to-cyan-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-teal-50/20 to-cyan-50/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-lg w-full relative z-10">
        {/* Botão voltar minimalista */}
        <button
          onClick={onBack}
          className="flex items-center text-slate-600 dark:text-white dark:text-white hover:text-slate-800 dark:text-white dark:text-white mb-8 transition-colors bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm dark:shadow-gray-900/30 hover:shadow-md border border-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Portais
        </button>

        {/* Card principal de login */}
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700 overflow-hidden">
          {/* Seção superior com logo e identificação do portal */}
          <div className="p-8 text-center border-b border-gray-100/50 dark:border-gray-700">
            {/* Logo Abmix */}
            <div className="flex justify-center mb-6">
              <img 
                src="/65be871e-f7a6-4f31-b1a9-cd0729a73ff8 copy copy.png" 
                alt="Abmix" 
                className="h-12 w-auto opacity-90 brightness-125 contrast-110"
              />
            </div>
            
            {/* Ícone do portal com gradiente */}
            <div className={`w-16 h-16 ${portal === 'restricted' ? 'bg-gradient-to-br from-gray-200 to-gray-300' : `bg-gradient-to-br ${config.gradient}`} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg dark:shadow-gray-900/50`}>
              <IconComponent className={`w-8 h-8 ${portal === 'restricted' ? 'text-gray-600' : 'text-white'}`} />
            </div>
            
            {/* Título e subtítulo */}
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white dark:text-white mb-2">{config.title}</h1>
            <p className="text-slate-600 dark:text-white dark:text-white text-sm leading-relaxed max-w-sm mx-auto">{config.subtitle}</p>
          </div>

          {/* Formulário de login */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white dark:text-gray-200 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black dark:text-white z-10" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm transition-all duration-200 text-slate-700 dark:text-white dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Campo de senha */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white dark:text-gray-200 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black dark:text-white z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 border border-slate-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm transition-all duration-200 text-slate-700 dark:text-white dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Opções de login */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                  />
                  <span className="ml-2 text-sm text-slate-600 dark:text-white dark:text-white">Lembrar-me</span>
                </label>
                <a href="#" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>

              {/* Botão de login */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r ${config.gradient} text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            {/* Mensagem de erro */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 text-red-700 rounded-xl text-sm border border-red-100 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {errorMessage}
              </div>
            )}


          </div>

          {/* System Status - Discreto e Profissional */}
          <div className="px-8 py-4 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-600">
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-3">
                <span>Última Sync: <span className="font-medium text-gray-700 dark:text-gray-300">{formatTime(currentTime)}</span></span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span>Propostas Hoje: <span className="font-medium text-blue-600 dark:text-blue-400">{proposalsToday}</span></span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Backup:</span>
                <span className={`font-medium ${backupStatus.active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {backupStatus.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 pt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sistema Interno v2.0<br />
              © 2025 Abmix Consultoria
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;