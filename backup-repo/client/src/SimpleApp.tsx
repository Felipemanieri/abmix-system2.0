import { useState } from 'react';

export default function SimpleApp() {
  const [portal, setPortal] = useState('home');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Sistema Abmix</h1>
        
        {portal === 'home' && (
          <div className="space-y-4">
            <h2 className="text-2xl mb-4">Escolha seu portal:</h2>
            <button 
              onClick={() => setPortal('cliente')}
              className="block w-64 mx-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Portal do Cliente
            </button>
            <button 
              onClick={() => setPortal('comercial')}
              className="block w-64 mx-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Portal Comercial
            </button>
            <button 
              onClick={() => setPortal('financeiro')}
              className="block w-64 mx-auto px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Portal Financeiro
            </button>
            <button 
              onClick={() => setPortal('implementacao')}
              className="block w-64 mx-auto px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Portal Implementação
            </button>
            <button 
              onClick={() => setPortal('supervisor')}
              className="block w-64 mx-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Portal Supervisor
            </button>
          </div>
        )}
        
        {portal !== 'home' && (
          <div>
            <h2 className="text-2xl mb-4">Portal {portal}</h2>
            <button 
              onClick={() => setPortal('home')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}