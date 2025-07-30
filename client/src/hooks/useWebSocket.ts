// HOOK PARA WEBSOCKET - TEMPO REAL VERDADEIRO
import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: string;
  channel?: string;
  action?: string;
  data?: any;
  timestamp?: string;
}

interface UseWebSocketOptions {
  userId?: number;
  userType?: string;
  channels?: string[];
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const queryClient = useQueryClient();

  const { userId, userType, channels = [], onMessage, onConnect, onDisconnect } = options;

  // Função para conectar ao WebSocket
  const connect = useCallback(() => {
    // EVITAR MÚLTIPLAS CONEXÕES
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return; // Já conectado ou conectando
    }

    // Fechar conexão anterior se existir
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      // Determinar protocolo e URL
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log('🔗 Conectando ao WebSocket:', wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket conectado');
        setIsConnected(true);
        setConnectionAttempts(0);

        // Autenticar usuário se fornecido
        if (userId && userType) {
          ws.send(JSON.stringify({
            type: 'authenticate',
            userId,
            userType
          }));
        }

        // Inscrever em canais se fornecido
        if (channels.length > 0) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            channels
          }));
        }

        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 Mensagem WebSocket recebida:', message);

          // Processar mensagens do sistema
          handleSystemMessage(message);

          // Callback personalizado
          onMessage?.(message);
        } catch (error) {
          console.error('❌ Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket desconectado:', event.reason);
        setIsConnected(false);
        wsRef.current = null;

        onDisconnect?.();

        // Reconectar automaticamente se não foi fechamento intencional
        if (event.code !== 1000) {
          scheduleReconnect();
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Erro WebSocket:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('❌ Erro ao criar conexão WebSocket:', error);
      scheduleReconnect();
    }
  }, [userId, userType, channels, onMessage, onConnect, onDisconnect]);

  // Agendar reconexão com backoff exponencial - LIMITADO
  const scheduleReconnect = useCallback(() => {
    // LIMITAR TENTATIVAS DE RECONEXÃO
    if (connectionAttempts >= 5) {
      console.log('❌ Máximo de tentativas de reconexão atingido');
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000); // Max 30 segundos
    console.log(`🔄 Reagendando conexão em ${delay}ms (tentativa ${connectionAttempts + 1}/5)`);

    reconnectTimeoutRef.current = setTimeout(() => {
      setConnectionAttempts(prev => prev + 1);
      connect();
    }, delay);
  }, [connectionAttempts, connect]);

  // Processar mensagens do sistema
  const handleSystemMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'proposal_change':
      case 'proposal_created':
      case 'proposal_updated':
      case 'proposal_approved':
      case 'proposal_rejected':
        // Invalidar cache de propostas
        queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
        queryClient.invalidateQueries({ queryKey: ['/api/proposals/sheet'] });
        console.log(`🔄 Cache de propostas invalidado via WebSocket: ${message.type}`);
        break;

      case 'sheet_change':
        // Invalidar cache de planilhas
        queryClient.invalidateQueries({ queryKey: ['/api/proposals/sheet'] });
        queryClient.invalidateQueries({ queryKey: ['/api/sheets'] });
        console.log('🔄 Cache de planilhas invalidado via WebSocket');
        break;

      case 'new_message':
        // Invalidar cache de mensagens
        queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
        queryClient.invalidateQueries({ queryKey: ['/api/internal-messages'] });
        console.log('🔄 Cache de mensagens invalidado via WebSocket');
        break;

      case 'target_change':
        // Invalidar cache de metas
        queryClient.invalidateQueries({ queryKey: ['/api/vendor-targets'] });
        queryClient.invalidateQueries({ queryKey: ['/api/team-targets'] });
        console.log('🔄 Cache de metas invalidado via WebSocket');
        break;

      case 'connection_established':
        console.log('🎉 Conexão WebSocket estabelecida:', message.message);
        break;

      case 'pong':
        // Resposta ao ping - conexão ativa
        break;

      default:
        console.log('📦 Mensagem WebSocket não processada:', message);
    }
  }, [queryClient]);

  // Enviar mensagem
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('⚠️ WebSocket não conectado - mensagem não enviada');
      return false;
    }
  }, []);

  // PING TEMPORARIAMENTE DESABILITADO - pode estar causando unhandled rejections
  useEffect(() => {
    // if (!isConnected) return;
    // const pingInterval = setInterval(() => {
    //   sendMessage({ type: 'ping' });
    // }, 30000);
    // return () => clearInterval(pingInterval);
    console.log('⚠️ WebSocket ping DISABLED to prevent unhandled rejections');
  }, [isConnected, sendMessage]);

  // DESABILITADO TEMPORARIAMENTE - múltiplas conexões causando problemas
  // useEffect(() => {
  //   connect();

  //   return () => {
  //     if (reconnectTimeoutRef.current) {
  //       clearTimeout(reconnectTimeoutRef.current);
  //     }
  //     if (wsRef.current) {
  //       wsRef.current.close(1000, 'Component unmounted');
  //     }
  //   };
  // }, [connect]);

  return {
    isConnected,
    sendMessage,
    reconnect: connect,
    connectionAttempts
  };
}

// HOOKS WEBSOCKET TEMPORARIAMENTE DESABILITADOS - corrigindo múltiplas conexões
export function useVendorWebSocket(userId: number) {
  // return useWebSocket({
  //   userId,
  //   userType: 'vendor',
  //   channels: ['proposals', 'messages', 'targets', 'sheets']
  // });
  return { isConnected: false, sendMessage: () => false, reconnect: () => {}, connectionAttempts: 0 };
}

export function useSupervisorWebSocket(userId: number) {
  // return useWebSocket({
  //   userId,
  //   userType: 'supervisor',
  //   channels: ['proposals', 'messages', 'targets', 'sheets', 'analytics']
  // });
  return { isConnected: false, sendMessage: () => false, reconnect: () => {}, connectionAttempts: 0 };
}

export function useAdminWebSocket(userId: number) {
  // return useWebSocket({
  //   userId,
  //   userType: 'admin',
  //   channels: ['proposals', 'messages', 'targets', 'sheets', 'analytics', 'system']
  // });
  return { isConnected: false, sendMessage: () => false, reconnect: () => {}, connectionAttempts: 0 };
}