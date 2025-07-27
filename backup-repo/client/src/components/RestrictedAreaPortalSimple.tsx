import { Shield, LogOut } from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface RestrictedAreaPortalProps {
  user: User;
  onLogout: () => void;
}

export default function RestrictedAreaPortalSimple({ user, onLogout }: RestrictedAreaPortalProps) {
  console.log('🔥 RestrictedAreaPortalSimple CARREGADO:', user);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Área Restrita - FUNCIONANDO
                </h1>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ✅ SUCESSO: Área Restrita Carregada
                </h3>
                <p className="text-green-700">
                  Bem-vindo, <strong>{user.name}</strong>! A área restrita está funcionando corretamente.
                </p>
                <div className="mt-2 text-sm text-green-600">
                  Email: {user.email}<br/>
                  Role: {user.role}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">✓</div>
                  <div className="text-sm text-blue-500">Login OK</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-sm text-green-500">Componente OK</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">✓</div>
                  <div className="text-sm text-purple-500">Render OK</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}