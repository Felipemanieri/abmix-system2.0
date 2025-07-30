import React, { useState, useEffect } from 'react';

const SystemFooter: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [proposalsToday, setProposalsToday] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  // Função para buscar propostas de hoje
  const fetchProposalsToday = async () => {
    try {
      const response = await fetch('/api/proposals');
      if (response.ok) {
        const proposals = await response.json();
        const today = new Date().toISOString().split('T')[0];
        
        // Filtrar propostas criadas hoje
        const todayProposals = proposals.filter((proposal: any) => {
          // Tentar ambos os formatos de data (createdAt e created_at)
          const createdAt = proposal.createdAt || proposal.created_at;
          if (!createdAt) return false;
          
          const proposalDate = new Date(createdAt).toISOString().split('T')[0];
          return proposalDate === today;
        });
        
        console.log(`📊 SystemFooter - Total propostas: ${proposals.length}`);
        console.log(`📊 SystemFooter - Propostas hoje (${today}): ${todayProposals.length}`);
        console.log('📊 SystemFooter - Amostra das propostas:', proposals.slice(0, 2));
        
        setProposalsToday(todayProposals.length);
      }
    } catch (error) {
      console.error('Erro ao buscar propostas de hoje:', error);
    }
  };
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    
    // Buscar propostas de hoje imediatamente
    fetchProposalsToday();
    
    // Configurar WebSocket para atualizações em tempo real
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('🔌 WebSocket conectado no SystemFooter para contador');
      setWs(websocket);
    };
    
    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📨 Mensagem WebSocket recebida no SystemFooter:', message);
        
        // Atualizar contador quando proposta é criada ou atualizada
        if (message.type === 'proposal_created' || message.type === 'proposal_updated') {
          console.log('🔄 Atualizando contador de propostas após evento:', message.type);
          setTimeout(fetchProposalsToday, 500); // Pequeno delay para garantir que a proposta foi salva
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    };
    
    websocket.onclose = () => {
      console.log('❌ WebSocket desconectado no SystemFooter');
      setWs(null);
    };
    
    websocket.onerror = (error) => {
      console.error('❌ Erro WebSocket no SystemFooter:', error);
    };
    
    // Atualizar propostas a cada 2 minutos como backup
    // const proposalsTimer = setInterval(fetchProposalsToday, 120000); // DESABILITADO - causando unhandled rejections
    
    return () => {
      clearInterval(timer);
      // clearInterval(proposalsTimer); // Comentado junto com proposalsTimer
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-3 px-6">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between text-xs text-gray-600">
          
          {/* Seção Esquerda - Logo e Info do Sistema */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {/* Logo Abmix original */}
              <img 
                src="/65be871e-f7a6-4f31-b1a9-cd0729a73ff8 copy copy.png" 
                alt="Abmix" 
                className="h-6 w-auto flex-shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">Sistema Interno v2.0</span>
                <span className="text-gray-500">© 2025 Abmix Consultoria</span>
              </div>
            </div>
          </div>

          {/* Seção Centro - Suporte e Links */}
          <div className="flex flex-col items-center space-y-1">
            <div className="flex items-center space-x-1">
              <span>Suporte:</span>
              <a 
                href="mailto:suporte@abmix.com.br" 
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                suporte@abmix.com.br
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                Manual do Sistema
              </a>
              <span className="text-gray-400">|</span>
              <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                FAQ
              </a>
              <span className="text-gray-400">|</span>
              <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                Configurações
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <span>Status:</span>
              <span className="text-green-600 font-medium">🟢 Online</span>
            </div>
          </div>

          {/* Seção Direita - Informações do Sistema */}
          <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-4">
              <span>Última Sync: <span className="font-medium">{formatTime(currentTime)}</span></span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Propostas Hoje: <span className="font-medium text-blue-600">{proposalsToday}</span></span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Backup: <span className="font-medium text-green-600">Ativo</span></span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default SystemFooter;