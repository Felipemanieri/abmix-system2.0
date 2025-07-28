// SISTEMA DE WEBSOCKETS PARA TEMPO REAL - MANTÉM TODAS AS FUNCIONALIDADES
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface WebSocketClient {
  ws: WebSocket;
  userId?: number;
  userType?: string;
  subscriptions: Set<string>;
}

class RealTimeManager {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, WebSocketClient> = new Map();

  constructor(server: Server) {
    // WebSocket server na rota /ws para não conflitar com Vite HMR
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      perMessageDeflate: false 
    });

    this.setupWebSocketServer();
    console.log('🚀 WebSocket server iniciado em /ws');
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('🔗 Nova conexão WebSocket estabelecida');
      
      // Criar cliente
      const client: WebSocketClient = {
        ws,
        subscriptions: new Set()
      };
      
      this.clients.set(ws, client);

      // Configurar handlers
      ws.on('message', (data) => this.handleMessage(ws, data));
      ws.on('close', () => this.handleDisconnect(ws));
      ws.on('error', (error) => {
        console.error('❌ Erro WebSocket:', error);
        this.handleDisconnect(ws);
      });

      // Confirmar conexão
      this.sendToClient(ws, {
        type: 'connection_established',
        message: 'Conectado ao sistema de tempo real'
      });
    });
  }

  private handleMessage(ws: WebSocket, data: any) {
    try {
      const message = JSON.parse(data.toString());
      const client = this.clients.get(ws);
      
      if (!client) return;

      switch (message.type) {
        case 'authenticate':
          client.userId = message.userId;
          client.userType = message.userType;
          console.log(`👤 Cliente autenticado: ${message.userId} (${message.userType})`);
          break;

        case 'subscribe':
          message.channels?.forEach((channel: string) => {
            client.subscriptions.add(channel);
          });
          console.log(`📡 Cliente inscrito em: ${Array.from(client.subscriptions).join(', ')}`);
          break;

        case 'unsubscribe':
          message.channels?.forEach((channel: string) => {
            client.subscriptions.delete(channel);
          });
          break;

        case 'ping':
          this.sendToClient(ws, { type: 'pong' });
          break;
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem WebSocket:', error);
    }
  }

  private handleDisconnect(ws: WebSocket) {
    const client = this.clients.get(ws);
    if (client) {
      console.log(`👋 Cliente desconectado: ${client.userId || 'desconhecido'}`);
      this.clients.delete(ws);
    }
  }

  private sendToClient(ws: WebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  // MÉTODOS PÚBLICOS PARA BROADCASTING

  // Broadcast para todos os clientes conectados
  public broadcastToAll(data: any) {
    const message = JSON.stringify(data);
    this.clients.forEach((client, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Broadcast para clientes inscritos em canal específico
  public broadcastToChannel(channel: string, data: any) {
    const message = JSON.stringify({ ...data, channel });
    this.clients.forEach((client, ws) => {
      if (client.subscriptions.has(channel) && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Broadcast para tipo específico de usuário
  public broadcastToUserType(userType: string, data: any) {
    const message = JSON.stringify(data);
    this.clients.forEach((client, ws) => {
      if (client.userType === userType && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Notificar mudança em propostas
  public notifyProposalChange(proposalId: string, action: 'created' | 'updated' | 'deleted', data?: any) {
    this.broadcastToChannel('proposals', {
      type: 'proposal_change',
      action,
      proposalId,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Notificar mudança em planilhas
  public notifySheetChange(sheetId: string, data?: any) {
    this.broadcastToChannel('sheets', {
      type: 'sheet_change',
      sheetId,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Notificar nova mensagem interna
  public notifyInternalMessage(message: any) {
    this.broadcastToChannel('messages', {
      type: 'new_message',
      data: message,
      timestamp: new Date().toISOString()
    });
  }

  // Notificar mudanças nas metas
  public notifyTargetChange(targetType: 'vendor' | 'team', data: any) {
    this.broadcastToChannel('targets', {
      type: 'target_change',
      targetType,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Obter estatísticas de conexões
  public getStats() {
    return {
      totalConnections: this.clients.size,
      activeConnections: Array.from(this.clients.values()).filter(
        client => client.ws.readyState === WebSocket.OPEN
      ).length,
      userTypes: Array.from(this.clients.values()).reduce((acc, client) => {
        if (client.userType) {
          acc[client.userType] = (acc[client.userType] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export default RealTimeManager;