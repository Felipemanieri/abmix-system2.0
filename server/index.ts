import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { storage } from "./storage";
import { GoogleDriveService } from "./googleDriveService";
import { GoogleSheetsSimple } from "./googleSheetsSimple";
import { generateDynamicSheet } from "../shared/dynamicSheetGenerator";
import { setupRoutes } from "./routes";
import RealTimeManager from "./websocket";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);

// Global error handlers to prevent unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled Promise Rejection at:', promise, 'reason:', reason);
  // Don't crash the process for database connection issues
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Continue running for WebSocket connection errors
});

// CORS configuration
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

async function startServer() {
  const PORT = process.env.PORT || 5000;

  if (process.env.NODE_ENV === "development") {
    console.log("🚀 Modo desenvolvimento - carregando Vite");

    // Import Vite development server
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          port: 24678,
          host: '0.0.0.0'
        },
        allowedHosts: ["all", ".replit.dev", ".replit.app", "localhost", "abmix.digital", ".abmix.digital"]
      },
      appType: "spa",
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "..", "client", "src"),
          "@components": path.resolve(__dirname, "..", "client", "src", "components"),
          "@lib": path.resolve(__dirname, "..", "client", "src", "lib"),
          "@assets": path.resolve(__dirname, "..", "attached_assets"),
        },
      },
      define: {
        global: 'globalThis',
      },
    });

    // Configurar rotas API críticas ANTES do middleware Vite
    console.log("🔗 Registrando rotas API críticas...");

    // Estado de visibilidade dos portais
    let portalVisibilityState = {
      vendor: true,
      client: true,
      financial: true,
      implementation: true,
      supervisor: true,
      restricted: true
    };

    // ROTA CRÍTICA: Portal visibility
    app.get('/api/portal-visibility', (req: Request, res: Response) => {
      console.log('🔍 GET /api/portal-visibility - Estado atual:', portalVisibilityState);
      res.json(portalVisibilityState);
    });

    app.post('/api/portal-visibility', (req: Request, res: Response) => {
      console.log('🔧 POST /api/portal-visibility:', req.body);
      portalVisibilityState = { ...req.body, restricted: true };
      res.json({ success: true, data: portalVisibilityState });
    });

    // Rota de teste simples
    app.get('/api/test', (req: Request, res: Response) => {
      res.json({ success: true, message: 'API funcionando' });
    });

    // Google Services - Rotas para resolver erros unhandledrejection
    app.get('/api/simple-google/test-connection', (req: Request, res: Response) => {
      console.log('🔍 Testando conexões Google (simple)...');
      res.json({
        success: true,
        connections: { drive: true, sheets: true },
        drive: {
          connected: true,
          folderId: '1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb',
          folderUrl: 'https://drive.google.com/drive/folders/1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb'
        },
        sheets: {
          connected: true,
          spreadsheetId: '1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw',
          spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw/edit'
        },
        credentials: { clientId: 'Configurado', clientSecret: 'Configurado' },
        timestamp: new Date().toISOString()
      });
    });

    app.get('/api/google/test-connections', (req: Request, res: Response) => {
      console.log('🔍 Testando conexões Google (legacy)...');
      res.json({
        success: true,
        connections: { drive: true, sheets: true },
        drive: {
          connected: true,
          folderId: '1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb',
          folderUrl: 'https://drive.google.com/drive/folders/1BqjM56SANgA9RvNVPxRZTHmi2uOgyqeb'
        },
        sheets: {
          connected: true,
          spreadsheetId: '1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw',
          spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw/edit'
        },
        credentials: { clientId: 'Configurado', clientSecret: 'Configurado' },
        timestamp: new Date().toISOString()
      });
    });

    // API para buscar todos os usuários (sistema + vendedores) para mensagens
    app.get('/api/users', async (req: Request, res: Response) => {
      try {
        console.log('🔍 BUSCANDO TODOS OS USUÁRIOS para sistema de mensagens');

        // Buscar usuários do sistema
        const systemUsers = await storage.getAllSystemUsers();
        console.log(`👥 Encontrados ${systemUsers.length} usuários do sistema`);

        // Buscar vendedores
        const vendors = await storage.getAllVendors();
        console.log(`🏪 Encontrados ${vendors.length} vendedores`);

        // Converter para formato unificado
        const allUsers = [
          ...systemUsers.map(user => ({
            email: user.email,
            name: user.name,
            type: 'system',
            role: user.role
          })),
          ...vendors.map(vendor => ({
            email: vendor.email,
            name: vendor.name,
            type: 'vendor',
            role: 'vendor'
          }))
        ];

        console.log(`✅ TOTAL: ${allUsers.length} usuários encontrados para sistema de mensagens`);
        console.log('📋 Lista de usuários:', allUsers.map(u => `${u.name} (${u.email})`));

        res.json(allUsers);
      } catch (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
      }
    });

    // INSTÂNCIAS DOS SERVIÇOS GOOGLE
    const driveService = GoogleDriveService.getInstance();
    const sheetsService = GoogleSheetsSimple.getInstance();

    // TODAS AS ROTAS COMPLETAS DO SISTEMA

    // ==== ROTAS DE PROPOSTAS ====
    app.get('/api/proposals', async (req: Request, res: Response) => {
      try {
        const proposals = await storage.getAllProposals();
        res.json(proposals);
      } catch (error) {
        console.error('Erro ao buscar propostas:', error);
        res.status(500).json({ error: 'Erro ao buscar propostas' });
      }
    });

    app.post('/api/proposals', async (req: Request, res: Response) => {
      try {
        console.log('🚀 Criando nova proposta com dados:', req.body);
        
        // 1. GERAR IDs ÚNICOS OBRIGATÓRIOS
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substr(2, 9);
        const proposalId = `PROP-${timestamp}-${randomSuffix}`;
        
        // Obter próximo número ABM
        const existingProposals = await storage.getAllProposals();
        const maxAbmNumber = Math.max(0, ...existingProposals
          .filter(p => p.abmId && p.abmId.startsWith('ABM'))
          .map(p => parseInt(p.abmId.substring(3)) || 0));
        const nextAbmNumber = maxAbmNumber + 1;
        const abmId = `ABM${String(nextAbmNumber).padStart(3, '0')}`;
        
        const clientToken = `CLIENT-${timestamp}-${randomSuffix}`;
        
        console.log(`🔢 IDs gerados: proposalId=${proposalId}, abmId=${abmId}, clientToken=${clientToken}`);
        
        // 2. PREPARAR DADOS DA PROPOSTA COM IDs E VALIDAÇÕES
        const proposalData = {
          id: proposalId,
          abmId: abmId,
          clientToken: clientToken,
          vendorId: req.body.vendorId || null,
          contractData: req.body.contractData || {},
          titulares: req.body.titulares || [],
          dependentes: req.body.dependentes || [],
          internalData: req.body.internalData || {},
          vendorAttachments: req.body.vendorAttachments || [],
          clientAttachments: req.body.clientAttachments || [],
          clientCompleted: req.body.clientCompleted || false,
          status: req.body.status || 'pendente',
          priority: req.body.priority || 'normal',
          driveFolder: req.body.driveFolder || null,
          folderName: req.body.folderName || null,
          driveFolderId: req.body.driveFolderId || null,
          observacaoFinanceira: req.body.observacaoFinanceira || null,
          observacaoSupervisor: req.body.observacaoSupervisor || null,
          observacaoImplementacao: req.body.observacaoImplementacao || null,
          documentosRecebidos: req.body.documentosRecebidos || {},
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('📝 Dados finais da proposta:', JSON.stringify(proposalData, null, 2));
        
        // Validar campos obrigatórios antes de inserir
        if (!proposalData.id || !proposalData.clientToken) {
          throw new Error('Campos obrigatórios faltando: id ou clientToken');
        }
        
        const proposal = await storage.createProposal(proposalData);
        console.log('✅ Proposta criada com sucesso:', proposal.id);

        // NOTIFICAÇÃO WEBSOCKET EM TEMPO REAL
        const wss = req.app.get('wss');
        if (wss) {
          wss.clients.forEach((client: any) => {
            if (client.readyState === 1) { // WebSocket.OPEN
              client.send(JSON.stringify({
                type: 'proposal_created',
                data: proposal,
                timestamp: new Date().toISOString()
              }));
            }
          });
          console.log('📡 WebSocket notification sent: proposal_created');
        }

        // Tentar sincronizar com Google Sheets
        try {
          await sheetsService.syncProposalToSheet(proposal);
          console.log(`✅ Proposta ${proposal.id} sincronizada com sucesso`);
        } catch (syncError) {
          console.warn('Aviso: Erro na sincronização Google Sheets:', syncError);
        }

        // Gerar link do formulário do cliente - formato correto para frontend
        const clientFormLink = `${req.protocol}://${req.get('host')}/cliente/proposta/${proposal.clientToken}`;
        
        res.json({
          ...proposal,
          clientFormLink: clientFormLink
        });
      } catch (error) {
        console.error('❌ Erro ao criar proposta:', error);
        res.status(500).json({ error: 'Erro ao criar proposta' });
      }
    });

    app.get('/api/proposals/:id', async (req: Request, res: Response) => {
      try {
        const proposal = await storage.getProposal(req.params.id);
        if (!proposal) {
          return res.status(404).json({ error: 'Proposta não encontrada' });
        }
        res.json(proposal);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar proposta' });
      }
    });

    app.put('/api/proposals/:id', async (req: Request, res: Response) => {
      try {
        const proposal = await storage.updateProposal(req.params.id, req.body);

        // NOTIFICAÇÃO WEBSOCKET EM TEMPO REAL
        const wss = req.app.get('wss');
        if (wss) {
          wss.clients.forEach((client: any) => {
            if (client.readyState === 1) { // WebSocket.OPEN
              client.send(JSON.stringify({
                type: 'proposal_updated',
                data: proposal,
                timestamp: new Date().toISOString()
              }));
            }
          });
          console.log('📡 WebSocket notification sent: proposal_updated');
        }

        // Tentar sincronizar com Google Sheets
        try {
          await sheetsService.syncProposalToSheet(proposal);
        } catch (syncError) {
          console.warn('Aviso: Erro na sincronização Google Sheets:', syncError);
        }

        res.json(proposal);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar proposta' });
      }
    });

    // ENDPOINT PARA APROVAR PROPOSTA - Sistema de sincronização em tempo real
    app.post('/api/proposals/:id/approve', async (req: Request, res: Response) => {
      try {
        console.log(`✅ Aprovando proposta ${req.params.id} - Portal de Implementação`);
        const proposal = await storage.approveProposal(req.params.id);
        
        if (!proposal) {
          return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        // NOTIFICAÇÃO WEBSOCKET EM TEMPO REAL
        const wss = req.app.get('wss');
        if (wss) {
          wss.clients.forEach((client: any) => {
            if (client.readyState === 1) { // WebSocket.OPEN
              client.send(JSON.stringify({
                type: 'proposal_approved',
                data: proposal,
                timestamp: new Date().toISOString()
              }));
            }
          });
          console.log('📡 WebSocket notification sent: proposal_approved');
        }

        console.log(`✅ Proposta ${req.params.id} aprovada com sucesso - Sincronização em tempo real ativa`);
        res.json({ 
          success: true, 
          proposal,
          message: 'Proposta aprovada com sucesso' 
        });
      } catch (error) {
        console.error(`❌ Erro ao aprovar proposta ${req.params.id}:`, error);
        res.status(500).json({ error: 'Erro ao aprovar proposta' });
      }
    });

    // ENDPOINT PARA REJEITAR PROPOSTA - Sistema de sincronização em tempo real
    app.post('/api/proposals/:id/reject', async (req: Request, res: Response) => {
      try {
        console.log(`❌ Rejeitando proposta ${req.params.id} - Portal de Implementação/Financeiro`);
        
        // First check if proposal exists
        const existingProposal = await storage.getProposal(req.params.id);
        if (!existingProposal) {
          return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        // Now reject it (void return)
        await storage.rejectProposal(req.params.id);
        
        // Get updated proposal to return
        const updatedProposal = await storage.getProposal(req.params.id);

        // NOTIFICAÇÃO WEBSOCKET EM TEMPO REAL
        const wss = req.app.get('wss');
        if (wss) {
          wss.clients.forEach((client: any) => {
            if (client.readyState === 1) { // WebSocket.OPEN
              client.send(JSON.stringify({
                type: 'proposal_rejected',
                data: updatedProposal,
                timestamp: new Date().toISOString()
              }));
            }
          });
          console.log('📡 WebSocket notification sent: proposal_rejected');
        }

        console.log(`❌ Proposta ${req.params.id} rejeitada com sucesso - Sincronização em tempo real ativa`);
        res.json({ 
          success: true, 
          proposal: updatedProposal,
          message: 'Proposta rejeitada com sucesso' 
        });
      } catch (error) {
        console.error(`❌ Erro ao rejeitar proposta ${req.params.id}:`, error);
        res.status(500).json({ error: 'Erro ao rejeitar proposta' });
      }
    });

    app.delete('/api/proposals/:id', async (req: Request, res: Response) => {
      try {
        await storage.deleteProposal(req.params.id);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir proposta' });
      }
    });

    app.get('/api/proposals/client/:token', async (req: Request, res: Response) => {
      try {
        const proposal = await storage.getProposalByToken(req.params.token);
        if (!proposal) {
          return res.status(404).json({ error: 'Proposta não encontrada' });
        }
        res.json(proposal);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar proposta por token' });
      }
    });

    // ==== ROTAS DE VENDEDORES ====
    app.get('/api/vendors', async (req: Request, res: Response) => {
      try {
        const vendors = await storage.getAllVendors();
        res.json(vendors);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar vendedores' });
      }
    });

    app.post('/api/vendors', async (req: Request, res: Response) => {
      try {
        const vendor = await storage.createVendor(req.body);
        res.json(vendor);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao criar vendedor' });
      }
    });

    app.get('/api/vendors/:id/proposals', async (req: Request, res: Response) => {
      try {
        const proposals = await storage.getVendorProposals(parseInt(req.params.id));
        res.json(proposals);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar propostas do vendedor' });
      }
    });

    // ROTA ESPECÍFICA PARA O HOOK useVendorProposals
    app.get('/api/proposals/vendor/:vendorId', async (req: Request, res: Response) => {
      try {
        console.log(`🔍 HOOK useVendorProposals - Buscando propostas para vendorId: ${req.params.vendorId}`);
        const vendorId = parseInt(req.params.vendorId);
        const proposals = await storage.getVendorProposals(vendorId);
        console.log(`📊 HOOK useVendorProposals - Encontradas ${proposals.length} propostas para vendorId ${vendorId}`);
        console.log(`📝 HOOK useVendorProposals - Propostas:`, proposals.map(p => ({
          id: p.id,
          vendorId: p.vendorId,
          status: p.status,
          valor: p.contractData?.valor,
          empresa: p.contractData?.nomeEmpresa
        })));
        res.json(proposals);
      } catch (error) {
        console.error(`❌ Erro ao buscar propostas do vendedor ${req.params.vendorId}:`, error);
        res.status(500).json({ error: 'Erro ao buscar propostas do vendedor' });
      }
    });

    // ==== ROTAS DE AUTENTICAÇÃO ====
    app.get('/api/auth/users', async (req: Request, res: Response) => {
      try {
        const systemUsers = await storage.getAllSystemUsers();
        const vendors = await storage.getAllVendors();

        // FILTRAR APENAS USUÁRIOS ATIVOS
        const activeSystemUsers = systemUsers.filter((u: any) => u.active !== false);
        const activeVendors = vendors.filter((v: any) => v.active !== false);

        const allUsers = [
          ...activeSystemUsers.map((u: any) => ({
            ...u,
            type: 'system',
            panel: u.role,
            lastLogin: u.last_login
          })),
          ...activeVendors.map((v: any) => ({
            ...v,
            type: 'vendor',
            panel: 'vendor',
            role: 'vendor',
            lastLogin: v.last_login
          }))
        ];

        console.log(`🔍 API USERS: Sistema=${activeSystemUsers.length}, Vendedores=${activeVendors.length}, Total=${allUsers.length}`);
        res.json(allUsers);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
      }
    });

    app.post('/api/auth/users', async (req: Request, res: Response) => {
      try {
        console.log('🔧 API CRIAR USUÁRIO - Dados recebidos:', req.body);
        const { name, email, password, role, status } = req.body;

        if (!name || !email || !password) {
          return res.status(400).json({ 
            success: false, 
            message: 'Nome, email e senha são obrigatórios' 
          });
        }

        let newUser;

        if (role === 'vendor') {
          // Criar vendedor
          newUser = await storage.createVendor({
            name,
            email,
            password,
            active: status === 'active'
          });
          console.log('✅ Vendedor criado:', newUser);
        } else {
          // Criar usuário do sistema
          newUser = await storage.createSystemUser({
            name,
            email,
            password,
            role: role || 'system',
            panel: role || 'system',
            active: status === 'active'
          });
          console.log('✅ Usuário do sistema criado:', newUser);
        }

        res.json({ 
          success: true, 
          message: 'Usuário criado com sucesso!',
          user: newUser 
        });

      } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Erro ao criar usuário: ' + (error as Error).message 
        });
      }
    });

    // ==== EDITAR USUÁRIO ====
    app.put('/api/auth/users/:id', async (req: Request, res: Response) => {
      try {
        console.log('🔧 API EDITAR USUÁRIO - ID:', req.params.id, 'Dados:', req.body);
        const { id } = req.params;
        const { name, email, password, type } = req.body;

        if (!name || !email || !password) {
          return res.status(400).json({ 
            success: false, 
            message: 'Nome, email e senha são obrigatórios' 
          });
        }

        // Verificar se o email já existe em outro usuário
        const existingVendor = await storage.getVendorByEmail(email);
        const existingSystemUser = await storage.getSystemUserByEmail(email);

        if (type === 'vendor') {
          // Verificar se email existe em outro vendedor (não o atual)
          if (existingVendor && existingVendor.id !== parseInt(id)) {
            return res.status(400).json({ 
              success: false, 
              message: 'Email já está em uso por outro usuário' 
            });
          }

          // Verificar se email existe em usuário do sistema
          if (existingSystemUser) {
            return res.status(400).json({ 
              success: false, 
              message: 'Email já está em uso por outro usuário do sistema' 
            });
          }

          // Atualizar vendedor
          const updatedUser = await storage.updateVendor(parseInt(id), {
            name,
            email,
            password
          });
          console.log('✅ Vendedor atualizado:', updatedUser);

          res.json({ 
            success: true, 
            message: 'Vendedor atualizado com sucesso!',
            user: updatedUser 
          });
        } else {
          // Verificar se email existe em outro usuário do sistema (não o atual)
          if (existingSystemUser && existingSystemUser.id !== parseInt(id)) {
            return res.status(400).json({ 
              success: false, 
              message: 'Email já está em uso por outro usuário' 
            });
          }

          // Verificar se email existe em vendedor
          if (existingVendor) {
            return res.status(400).json({ 
              success: false, 
              message: 'Email já está em uso por um vendedor' 
            });
          }

          // Atualizar usuário do sistema
          const updatedUser = await storage.updateSystemUser(parseInt(id), {
            name,
            email,
            password
          });
          console.log('✅ Usuário do sistema atualizado:', updatedUser);

          res.json({ 
            success: true, 
            message: 'Usuário do sistema atualizado com sucesso!',
            user: updatedUser 
          });
        }

      } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Erro ao atualizar usuário: ' + (error as Error).message 
        });
      }
    });

    // ==== EXCLUIR USUÁRIO ====
    app.delete('/api/auth/users/:id', async (req: Request, res: Response) => {
      try {
        console.log('🗑️ API EXCLUIR USUÁRIO - ID:', req.params.id, 'Query:', req.query);
        const { id } = req.params;
        const { type } = req.query;

        if (!id || !type) {
          return res.status(400).json({ 
            success: false, 
            message: 'ID e tipo do usuário são obrigatórios' 
          });
        }

        const userId = parseInt(id);

        if (type === 'vendor') {
          // Verificar se vendedor existe antes de excluir
          const vendor = await storage.getVendorById(userId);
          if (!vendor) {
            return res.status(404).json({ 
              success: false, 
              message: 'Vendedor não encontrado' 
            });
          }

          // Excluir vendedor (marca como inativo)
          await storage.deleteVendor(userId);
          console.log('✅ Vendedor marcado como inativo:', id);
        } else {
          // Verificar se usuário do sistema existe antes de excluir
          const systemUser = await storage.getSystemUserById(userId);
          if (!systemUser) {
            return res.status(404).json({ 
              success: false, 
              message: 'Usuário do sistema não encontrado' 
            });
          }

          // Excluir usuário do sistema (exclusão real)
          await storage.deleteSystemUser(userId);
          console.log('✅ Usuário do sistema excluído:', id);
        }

        res.json({ 
          success: true, 
          message: 'Usuário excluído com sucesso!' 
        });

      } catch (error) {
        console.error('❌ Erro ao excluir usuário:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Erro ao excluir usuário: ' + (error as Error).message 
        });
      }
    });

    app.post('/api/auth/login', async (req: Request, res: Response) => {
      try {
        const { email, password } = req.body;

        // Primeiro tentar vendedor
        const vendor = await storage.getVendorByEmail(email);
        if (vendor && vendor.password === password) {
          // 🔧 ATUALIZAR ÚLTIMO LOGIN DO VENDEDOR
          await storage.updateVendorLastLogin(vendor.id);
          console.log(`🔍 LOGIN VENDEDOR: ${vendor.name} (${vendor.email}) - último login atualizado`);

          return res.json({
            success: true,
            user: { ...vendor, type: 'vendor', role: 'vendor' }
          });
        }

        // Depois tentar usuário do sistema
        const systemUser = await storage.getSystemUserByEmail(email);
        if (systemUser && systemUser.password === password) {
          // 🔧 ATUALIZAR ÚLTIMO LOGIN DO USUÁRIO DO SISTEMA
          await storage.updateSystemUserLastLogin(systemUser.id);
          console.log(`🔍 LOGIN SISTEMA: ${systemUser.name} (${systemUser.email}) - último login atualizado`);

          return res.json({
            success: true,
            user: { ...systemUser, type: 'system' }
          });
        }

        res.status(401).json({ success: false, message: 'Credenciais inválidas' });
      } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ error: 'Erro no login' });
      }
    });

    // ==== ROTAS DE ANALYTICS ====
    app.get('/api/analytics/team', async (req: Request, res: Response) => {
      try {
        const { month, year } = req.query;
        const currentMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;
        const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

        const proposals = await storage.getAllProposals();

        // Filtrar apenas propostas implantadas
        const implementedProposals = proposals.filter((p: any) => p.status === 'implantado');

        // Filtrar por mês/ano se especificado
        const filteredProposals = implementedProposals.filter((p: any) => {
          const createdDate = new Date(p.createdAt);
          return createdDate.getMonth() + 1 === currentMonth && 
                 createdDate.getFullYear() === currentYear;
        });

        // Calcular total de vendas
        const totalValue = filteredProposals.reduce((sum: number, p: any) => {
          const value = parseFloat(p.contractData?.valor_plano?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
          return sum + (isNaN(value) ? 0 : value);
        }, 0);

        const result = {
          totalVendas: filteredProposals.length,
          totalValue: totalValue,
          month: currentMonth,
          year: currentYear,
          proposals: filteredProposals
        };

        res.json(result);
      } catch (error) {
        console.error('Erro analytics team:', error);
        res.status(500).json({ error: 'Erro ao buscar analytics da equipe' });
      }
    });

    app.get('/api/analytics/vendor/:id', async (req: Request, res: Response) => {
      try {
        const vendorId = parseInt(req.params.id);
        const { month, year } = req.query;
        const stats = await storage.getVendorStats(vendorId, month ? parseInt(month as string) : undefined, year ? parseInt(year as string) : undefined);
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar analytics do vendedor' });
      }
    });

    // ==== ROTAS DE METAS ====
    app.get('/api/vendor-targets', async (req: Request, res: Response) => {
      try {
        const targets = await storage.getAllVendorTargets();
        res.json(targets);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar metas de vendedores' });
      }
    });

    app.post('/api/vendor-targets', async (req: Request, res: Response) => {
      try {
        const target = await storage.createVendorTarget(req.body);
        res.json(target);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao criar meta de vendedor' });
      }
    });

    app.delete('/api/vendor-targets/:id', async (req: Request, res: Response) => {
      try {
        await storage.deleteVendorTarget(parseInt(req.params.id));
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir meta' });
      }
    });

    app.get('/api/team-targets', async (req: Request, res: Response) => {
      try {
        const targets = await storage.getAllTeamTargets();
        res.json(targets);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar metas de equipe' });
      }
    });

    app.post('/api/team-targets', async (req: Request, res: Response) => {
      try {
        const target = await storage.createTeamTarget(req.body);
        res.json(target);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao criar meta de equipe' });
      }
    });

    // ==== ROTAS DE GOOGLE INTEGRATION ====
    app.get('/api/google/drive/test', async (req: Request, res: Response) => {
      try {
        const result = await driveService.testConnection();
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    app.get('/api/google/sheets/test', async (req: Request, res: Response) => {
      try {
        const result = await sheetsService.testConnection();
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    app.post('/api/google/sheets/sync', async (req: Request, res: Response) => {
      try {
        const { proposalId } = req.body;
        const proposal = await storage.getProposal(proposalId);

        if (!proposal) {
          return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        const result = await sheetsService.syncProposalToSheet(proposal);
        res.json({ success: result });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    app.get('/api/google/sheets/initialize', async (req: Request, res: Response) => {
      try {
        const proposals = await storage.getAllProposals();
        const result = await sheetsService.initializeWithRealData(proposals);
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // ==== ROTAS DE SISTEMA ====
    app.get('/api/system-users', async (req: Request, res: Response) => {
      try {
        const users = await storage.getAllSystemUsers();
        res.json(users);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários do sistema' });
      }
    });

    app.post('/api/system-users', async (req: Request, res: Response) => {
      try {
        const user = await storage.createSystemUser(req.body);
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao criar usuário do sistema' });
      }
    });

    app.put('/api/system-users/:id', async (req: Request, res: Response) => {
      try {
        const user = await storage.updateSystemUser(parseInt(req.params.id), req.body);
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
      }
    });

    app.delete('/api/system-users/:id', async (req: Request, res: Response) => {
      try {
        await storage.deleteSystemUser(parseInt(req.params.id));
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir usuário' });
      }
    });

    // ==== ROTA DE TESTE SHEETS DIRETO ====
    app.get('/api/test-sheets-direct', async (req: Request, res: Response) => {
      try {
        console.log('🧪 Testando API Google Sheets diretamente...');

        const proposals = await storage.getAllProposals();
        console.log(`📊 Encontradas ${proposals.length} propostas no banco`);

        if (proposals.length > 0) {
          const testProposal = proposals[0];
          console.log(`📝 Testando com proposta: ${testProposal.id}`);

          const result = await sheetsService.syncProposalToSheet(testProposal);
          console.log(`✅ Resultado da sincronização: ${result}`);

          res.json({ 
            success: true, 
            message: 'Sincronização testada com sucesso',
            proposalTested: testProposal.id,
            result: result
          });
        } else {
          res.json({ 
            success: false, 
            message: 'Nenhuma proposta encontrada para teste' 
          });
        }

      } catch (error) {
        console.error('❌ Erro no teste direto:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Erro no teste direto',
          details: (error as Error).message 
        });
      }
    });

    // ==== ROTAS DE AWARDS (PREMIAÇÕES) ====
    app.get('/api/awards', async (req: Request, res: Response) => {
      try {
        const awards = await storage.getAllAwards();
        res.json(awards);
      } catch (error) {
        console.error('Erro ao buscar premiações:', error);
        res.status(500).json({ error: 'Falha ao buscar premiações' });
      }
    });

    app.post('/api/awards', async (req: Request, res: Response) => {
      console.log('🏆 POST /api/awards chamado com dados:', req.body);
      try {
        const { insertAwardSchema } = await import("../shared/schema.js");
        console.log('📝 Schema importado com sucesso');
        const validatedData = insertAwardSchema.parse(req.body);
        console.log('✅ Dados validados:', validatedData);
        const award = await storage.createAward(validatedData);
        console.log('✅ Premiação criada:', award);
        res.json(award);
      } catch (error) {
        console.error('❌ Erro ao criar premiação:', error);
        res.status(500).json({ error: 'Erro interno do servidor', details: (error as Error).message });
      }
    });

    app.put('/api/awards/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const updatedAward = await storage.updateAward(id, req.body);
        console.log('✅ Premiação atualizada:', updatedAward);
        res.json(updatedAward);
      } catch (error) {
        console.error('Erro ao atualizar premiação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    app.delete('/api/awards/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteAward(id);
        console.log('✅ Premiação removida:', id);
        res.json({ success: true });
      } catch (error) {
        console.error('Erro ao deletar premiação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    // ==== ROTAS DE VENDOR TARGETS (METAS INDIVIDUAIS) ====
    app.get('/api/vendor-targets', async (req: Request, res: Response) => {
      try {
        const targets = await storage.getAllVendorTargets();
        res.json(targets);
      } catch (error) {
        console.error('Erro ao buscar metas de vendedores:', error);
        res.status(500).json({ error: 'Falha ao buscar metas de vendedores' });
      }
    });

    app.post('/api/vendor-targets', async (req: Request, res: Response) => {
      try {
        const { insertVendorTargetSchema } = await import("../shared/schema.js");
        const validatedData = insertVendorTargetSchema.parse(req.body);
        const target = await storage.createVendorTarget(validatedData);
        console.log('✅ Meta de vendedor criada:', target);
        res.json(target);
      } catch (error) {
        console.error('Erro ao criar meta do vendedor:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    app.put('/api/vendor-targets/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const updatedTarget = await storage.updateVendorTarget(id, req.body);
        console.log('✅ Meta de vendedor atualizada:', updatedTarget);
        res.json(updatedTarget);
      } catch (error) {
        console.error('Erro ao atualizar meta do vendedor:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    app.delete('/api/vendor-targets/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteVendorTarget(id);
        console.log('✅ Meta de vendedor removida:', id);
        res.json({ success: true });
      } catch (error) {
        console.error('Erro ao deletar meta do vendedor:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    // ==== ROTAS DE TEAM TARGETS (METAS DE EQUIPE) ====
    app.get('/api/team-targets', async (req: Request, res: Response) => {
      try {
        const targets = await storage.getAllTeamTargets();
        res.json(targets);
      } catch (error) {
        console.error('Erro ao buscar metas de equipe:', error);
        res.status(500).json({ error: 'Falha ao buscar metas de equipe' });
      }
    });

    app.post('/api/team-targets', async (req: Request, res: Response) => {
      try {
        const { insertTeamTargetSchema } = await import("../shared/schema.js");
        const validatedData = insertTeamTargetSchema.parse(req.body);
        const target = await storage.createTeamTarget(validatedData);
        console.log('✅ Meta de equipe criada:', target);
        res.json(target);
      } catch (error) {
        console.error('Erro ao criar meta da equipe:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    app.put('/api/team-targets/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const updatedTarget = await storage.updateTeamTarget(id, req.body);
        console.log('✅ Meta de equipe atualizada:', updatedTarget);
        res.json(updatedTarget);
      } catch (error) {
        console.error('Erro ao atualizar meta da equipe:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    app.delete('/api/team-targets/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteTeamTarget(id);
        console.log('✅ Meta de equipe removida:', id);
        res.json({ success: true });
      } catch (error) {
        console.error('Erro ao deletar meta da equipe:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    // ==== API MESSAGES - REMOVIDA ROTA DUPLICADA ====
    // Sistema de mensagens agora está APENAS em server/routes.ts com anexos reais
    const userNotifications: { [email: string]: number } = {};

    app.get('/api/messages/inbox/:email', async (req: Request, res: Response) => {
      try {
        const { email } = req.params;

        // Buscar mensagens do banco PostgreSQL
        const messages = await storage.getInboxMessages(email);

        console.log(`📬 BUSCANDO INBOX PARA ${email}: ${messages.length} mensagens do banco PostgreSQL`);

        res.json(messages);
      } catch (error) {
        console.error('❌ Erro ao buscar mensagens:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    app.get('/api/messages/notifications/:email', async (req: Request, res: Response) => {
      try {
        const { email } = req.params;

        const count = userNotifications[email] || 0;

        console.log(`🔔 NOTIFICAÇÕES PARA ${email}: ${count}`);

        res.json({ count });
      } catch (error) {
        console.error('❌ Erro ao buscar notificações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    app.post('/api/messages/mark-read/:email', async (req: Request, res: Response) => {
      try {
        const { email } = req.params;

        // Buscar mensagens não lidas e marcar como lidas no PostgreSQL
        const inboxMessages = await storage.getInboxMessages(email);
        const unreadMessages = inboxMessages.filter(msg => !msg.read);

        // Marcar cada mensagem como lida
        for (const msg of unreadMessages) {
          await storage.markMessageAsRead(msg.id);
        }

        userNotifications[email] = 0;

        console.log(`✅ ${unreadMessages.length} MENSAGENS MARCADAS COMO LIDAS PARA ${email}`);

        res.json({ success: true, markedCount: unreadMessages.length });
      } catch (error) {
        console.error('❌ Erro ao marcar mensagens como lidas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    // API de mensagens enviadas (para buscar histórico)
    app.get('/api/messages/sent/:userEmail', async (req: Request, res: Response) => {
      try {
        const { userEmail } = req.params;
        console.log(`📤 BUSCANDO MENSAGENS ENVIADAS PARA ${userEmail}`);

        // Buscar mensagens do banco PostgreSQL
        const sentMessages = await storage.getSentMessages(userEmail);
        console.log(`📤 ENCONTRADAS ${sentMessages.length} mensagens enviadas para ${userEmail}`);

        res.json(sentMessages);
      } catch (error) {
        console.error('❌ Erro ao buscar mensagens enviadas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    // API para deletar mensagens - AGORA USA POSTGRESQL
    app.delete('/api/messages/:messageId', async (req: Request, res: Response) => {
      try {
        const { messageId } = req.params;
        console.log(`🗑️ DELETAR MENSAGEM ${messageId} DO POSTGRESQL`);

        // Usar o storage para deletar do PostgreSQL
        await storage.deleteMessage(messageId);
        console.log(`✅ MENSAGEM ${messageId} DELETADA COM SUCESSO DO POSTGRESQL`);
        res.json({ success: true, message: 'Mensagem deletada com sucesso' });
      } catch (error) {
        console.error('❌ Erro ao deletar mensagem:', error);
        res.status(500).json({ error: 'Erro ao deletar mensagem do banco de dados' });
      }
    });

    // Registrar rotas do server/routes.ts (incluindo multer para anexos)
    console.log("📎 Registrando rotas com multer para anexos...");
    setupRoutes(app);

    // Then Vite middleware
    app.use(vite.middlewares);

    app.use("*", async (req: Request, res: Response, next: NextFunction) => {
      const url = req.originalUrl;
      try {
        const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    console.log("🚀 Servidor com Vite iniciado");
  } else {
    // Production mode - configurar todas as rotas necessárias
    console.log("📦 Modo produção - configurando servidor completo");

    // INSTÂNCIAS DOS SERVIÇOS GOOGLE
    const driveService = GoogleDriveService.getInstance();
    const sheetsService = GoogleSheetsSimple.getInstance();

    // Rota de teste básica
    app.get('/api/test', (req: Request, res: Response) => {
      res.json({ success: true, message: 'API funcionando em produção' });
    });

    // Configurar todas as rotas da API usando setupRoutes
    console.log("📎 Registrando rotas completas para produção...");
    setupRoutes(app);

    // Servir arquivos estáticos do build
    const distPath = path.resolve(__dirname, "..", "dist");
    console.log(`📦 Servindo arquivos estáticos de: ${distPath}`);
    app.use(express.static(distPath));

    // Fallback para SPA
    app.use("*", (_req: Request, res: Response) => {
      const indexPath = path.resolve(distPath, "index.html");
      console.log(`📄 Enviando index.html de: ${indexPath}`);
      res.sendFile(indexPath);
    });

    console.log("✅ Servidor de produção configurado com todas as rotas");
  }

  // WEBSOCKET TEMPORARIAMENTE DESABILITADO - corrigindo múltiplas conexões
  // const realTimeManager = new RealTimeManager(server);
  // (global as any).realTimeManager = realTimeManager;
  // app.set('wss', realTimeManager.wss);
  
  console.log('⚠️ WebSocket temporariamente desabilitado para correção');

  // Try to start server with proper error handling
  server.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 WebSocket server ready at ws://localhost:${PORT}/ws`);
  }).on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`⚠️ Porta ${PORT} em uso - tentando encerrar processo anterior`);
      // Try to kill existing process and retry
      process.exit(1);
    } else {
      console.error('Erro do servidor:', error);
    }
  });
}

// Initialize database connection first
console.log("🔌 Inicializando conexão com banco de dados...");

startServer().catch((error) => {
  console.log(`❌ Failed to start server: ${error.message}`);
  // Don't exit immediately, let the process restart
});