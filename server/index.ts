import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from "bcrypt";
import { storage } from "./storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  const reasonStr = String(reason);
  if (reasonStr.includes('ECONNRESET') || 
      reasonStr.includes('socket hang up') || 
      reasonStr.includes('WebSocket') ||
      reasonStr.includes('fetch') ||
      reasonStr.includes('network') ||
      reasonStr.includes('timeout')) {
    return;
  }
  console.warn('⚠️ Promise rejeitada:', reasonStr.substring(0, 200));
});

process.on('uncaughtException', (error) => {
  const errorStr = String(error);
  if (errorStr.includes('ECONNRESET') || 
      errorStr.includes('socket hang up') || 
      errorStr.includes('WebSocket') ||
      errorStr.includes('EADDRINUSE')) {
    return;
  }
  console.error('❌ Exception crítica:', errorStr.substring(0, 200));
});

// CORS configuration - Replit production fix
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://abmixsystem.replit.app',
    'https://abmixsystem-' + process.env.REPL_OWNER + '.replit.app',
    req.headers.host ? `https://${req.headers.host}` : null
  ].filter(Boolean);
  
  if (!origin || allowedOrigins.some(allowed => allowed === origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Rota para consultar CPF via proxy (evita CORS)
app.get('/api/cpf/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;
    const cpfLimpo = cpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    console.log('🔍 Consultando CPF via backend:', cpfLimpo);
    const response = await fetch(`https://patronhost.online/apis/cpf.php?cpf=${cpfLimpo}`, {
      method: 'GET',
      headers: {
        'cache-control': 'max-age=0',
        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Microsoft Edge";v="138"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'dnt': '1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'sec-fetch-site': 'none',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        'sec-fetch-dest': 'document',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'priority': 'u=0, i'
      }
    });

    if (!response.ok) {
      console.log('❌ Erro HTTP na consulta CPF:', response.status);
      return res.status(response.status).json({ error: 'Erro na API externa' });
    }

    const data = await response.json();
    console.log('✅ Resposta da API CPF:', data);

    if (data.status && data.resultado === 'success' && data.dados) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'CPF não encontrado', response: data });
    }

  } catch (error) {
    console.error('❌ Erro ao consultar CPF:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Database initialization
async function initializeDatabase() {
  try {
    console.log("🔌 Inicializando conexão com banco de dados...");
    const proposals = await storage.getAllProposals();
    console.log(`✅ Conexão com banco configurada - ${proposals.length} propostas encontradas`);
    return true;
  } catch (error) {
    console.error("❌ Erro na conexão com banco:", error);
    return false;
  }
}

async function startServer() {
  const PORT = process.env.PORT || 5000;
  
  // Initialize database first
  const dbReady = await initializeDatabase();
  if (!dbReady) {
    console.error("❌ Não foi possível conectar ao banco de dados");
    process.exit(1);
  }

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
        allowedHosts: ["all", ".replit.dev", ".replit.app", "localhost"]
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

    console.log("🔗 Registrando rotas API básicas...");

    // IMPORTANTE: Registrar rotas essenciais para portais
    console.log("🔗 Registrando rotas essenciais dos portais...");
    
    // Rotas essenciais para portal do vendedor
    app.get('/api/vendor-targets', async (req: Request, res: Response) => {
      try {
        const targets = await storage.getAllVendorTargets();
        res.json(targets);
      } catch (error) {
        console.error('Erro ao buscar metas de vendedores:', error);
        res.status(500).json({ error: 'Erro ao buscar metas' });
      }
    });

    app.get('/api/team-targets', async (req: Request, res: Response) => {
      try {
        const targets = await storage.getAllTeamTargets();
        res.json(targets);
      } catch (error) {
        console.error('Erro ao buscar metas de equipe:', error);
        res.status(500).json({ error: 'Erro ao buscar metas' });
      }
    });

    app.get('/api/awards', async (req: Request, res: Response) => {
      try {
        const awards = await storage.getAllAwards();
        res.json(awards);
      } catch (error) {
        console.error('Erro ao buscar prêmios:', error);
        res.status(500).json({ error: 'Erro ao buscar prêmios' });
      }
    });

    app.get('/api/analytics/team', async (req: Request, res: Response) => {
      try {
        const { month, year } = req.query;
        // Retornar analytics básicos da equipe
        const proposals = await storage.getAllProposals();
        const vendors = await storage.getAllVendors();
        
        res.json({
          proposals: proposals.length,
          vendors: vendors.length,
          month: month || new Date().getMonth() + 1,
          year: year || new Date().getFullYear()
        });
      } catch (error) {
        console.error('Erro ao buscar analytics:', error);
        res.status(500).json({ error: 'Erro ao buscar analytics' });
      }
    });

    // Rota para propostas do vendedor - CORRIGIR 404
    app.get('/api/proposals/vendor/:vendorId', async (req: Request, res: Response) => {
      try {
        const vendorId = parseInt(req.params.vendorId);
        console.log(`🔍 Buscando propostas para vendedor ${vendorId}...`);
        
        if (isNaN(vendorId)) {
          return res.status(400).json({ error: 'ID do vendedor inválido' });
        }
        
        const proposals = await storage.getVendorProposals(vendorId);
        console.log(`✅ Encontradas ${proposals.length} propostas para vendedor ${vendorId}`);
        
        res.json(proposals);
      } catch (error) {
        console.error(`❌ Erro ao buscar propostas do vendedor ${req.params.vendorId}:`, error);
        res.status(500).json({ error: 'Erro ao buscar propostas do vendedor' });
      }
    });

    // ROTA CRÍTICA: Buscar proposta por token do cliente (DEVE ESTAR ANTES DO CATCH-ALL)
    app.get('/api/proposals/client/:clientToken', async (req: Request, res: Response) => {
      try {
        const { clientToken } = req.params;
        console.log(`🔍 Buscando proposta para token do cliente: ${clientToken}`);
        
        const proposal = await storage.getProposalByToken(clientToken);
        
        if (!proposal) {
          console.log(`❌ Proposta não encontrada para token: ${clientToken}`);
          return res.status(404).json({ error: 'Proposta não encontrada' });
        }
        
        console.log(`✅ Proposta encontrada: ${proposal.id} - ${proposal.contractData?.nomeEmpresa}`);
        res.json(proposal);
      } catch (error) {
        console.error('❌ Erro ao buscar proposta por token do cliente:', error);
        res.status(500).json({ error: 'Falha ao buscar proposta' });
      }
    });

    console.log("✅ Rotas essenciais registradas com sucesso");

    // Portal visibility state
    let portalVisibilityState = {
      vendor: true,
      client: true,
      financial: true,
      implementation: true,
      supervisor: true,
      restricted: true
    };

    // Health check
    app.get('/api/test', (req: Request, res: Response) => {
      res.json({ success: true, message: 'API funcionando', timestamp: new Date().toISOString() });
    });

    // Portal visibility endpoints
    app.get('/api/portal-visibility', (req: Request, res: Response) => {
      console.log('🔍 GET /api/portal-visibility - Estado atual:', portalVisibilityState);
      res.json(portalVisibilityState);
    });

    app.post('/api/portal-visibility', (req: Request, res: Response) => {
      console.log('🔧 POST /api/portal-visibility:', req.body);
      portalVisibilityState = { ...req.body, restricted: true };
      res.json({ success: true, data: portalVisibilityState });
    });

    // Basic data endpoints
    app.get('/api/proposals', async (req: Request, res: Response) => {
      try {
        const proposals = await storage.getAllProposals();
        res.json(proposals);
      } catch (error) {
        console.error('Erro ao buscar propostas:', error);
        res.status(500).json({ error: 'Erro ao buscar propostas' });
      }
    });

    app.get('/api/vendors', async (req: Request, res: Response) => {
      try {
        const vendors = await storage.getAllVendors();
        res.json(vendors);
      } catch (error) {
        console.error('Erro ao buscar vendedores:', error);
        res.status(500).json({ error: 'Erro ao buscar vendedores' });
      }
    });

    app.get('/api/users', async (req: Request, res: Response) => {
      try {
        const systemUsers = await storage.getAllSystemUsers();
        const vendors = await storage.getAllVendors();

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

        res.json(allUsers);
      } catch (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
      }
    });

    // Google services (simplified)
    app.get('/api/google/test-connections', (req: Request, res: Response) => {
      res.json({
        success: true,
        connections: { drive: false, sheets: false },
        drive: { connected: false },
        sheets: { connected: false },
        credentials: { clientId: 'Not configured', clientSecret: 'Not configured' },
        timestamp: new Date().toISOString()
      });
    });

    // Proposal creation (simplified)
    app.post('/api/proposals', async (req: Request, res: Response) => {
      try {
        console.log('🚀 Criando nova proposta com dados:', req.body);
        
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substr(2, 9);
        const proposalId = `PROP-${timestamp}-${randomSuffix}`;
        
        const existingProposals = await storage.getAllProposals();
        const maxAbmNumber = Math.max(0, ...existingProposals
          .filter(p => p.abmId && p.abmId.startsWith('ABM'))
          .map(p => parseInt(p.abmId.substring(3)) || 0));
        const nextAbmNumber = maxAbmNumber + 1;
        const abmId = `ABM${String(nextAbmNumber).padStart(3, '0')}`;
        
        const clientToken = `CLIENT-${timestamp}-${randomSuffix}`;
        
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
        
        const proposal = await storage.createProposal(proposalData);
        console.log('✅ Proposta criada com sucesso:', proposal.id);

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

    // Proposal endpoints
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
        res.json(proposal);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar proposta' });
      }
    });

    app.delete('/api/proposals/:id', async (req: Request, res: Response) => {
      try {
        await storage.deleteProposal(req.params.id);
        res.json({ success: true, message: 'Proposta excluída com sucesso' });
      } catch (error) {
        console.error('❌ Erro ao excluir proposta:', error);
        res.status(500).json({ error: 'Erro ao excluir proposta' });
      }
    });

    // Authentication endpoints
    app.post('/api/auth/login', async (req: Request, res: Response) => {
      try {
        const { email, password, portal } = req.body;
        console.log(`🔐 Login attempt for ${email} on portal ${portal} from ${req.headers.host}`);

        let user = null;

        if (portal === 'vendor') {
          // Check vendors table
          const vendor = await storage.getVendorByEmail(email);
          if (vendor && vendor.active) {
            // Verificar se a senha é texto puro ou hash bcrypt
            let passwordMatch = false;
            if (vendor.password.startsWith('$2b$')) {
              // Senha hasheada com bcrypt
              passwordMatch = await bcrypt.compare(password, vendor.password);
            } else {
              // Senha em texto puro
              passwordMatch = vendor.password === password;
            }
            
            if (passwordMatch) {
              user = {
                id: vendor.id.toString(),
                name: vendor.name,
                email: vendor.email,
                role: 'vendor',
                portal: 'vendor'
              };
              await storage.updateVendor(vendor.id, { last_login: new Date() });
              console.log(`✅ Vendor login successful: ${vendor.name}`);
            }
          }
        } else {
          // Check system users table
          const systemUser = await storage.getSystemUserByEmail(email);
          if (systemUser && systemUser.active) {
            // Verificar se a senha é texto puro ou hash bcrypt
            let passwordMatch = false;
            if (systemUser.password.startsWith('$2b$')) {
              // Senha hasheada com bcrypt
              passwordMatch = await bcrypt.compare(password, systemUser.password);
            } else {
              // Senha em texto puro
              passwordMatch = systemUser.password === password;
            }
            
            if (passwordMatch) {
              user = {
                id: systemUser.id.toString(),
                name: systemUser.name,
                email: systemUser.email,
                role: systemUser.role,
                portal: systemUser.panel
              };
              await storage.updateLastLogin(systemUser.id);
              console.log(`✅ System user login successful: ${systemUser.name} (${systemUser.role})`);
            }
          }
        }

        if (user) {
          res.json({ 
            success: true, 
            user,
            message: 'Login realizado com sucesso'
          });
        } else {
          console.log(`❌ Login failed for ${email} - Invalid credentials`);
          res.status(401).json({ 
            success: false, 
            error: 'Email ou senha inválidos' 
          });
        }
      } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Erro interno do servidor' 
        });
      }
    });

    app.post('/api/auth/logout', (req: Request, res: Response) => {
      console.log('👋 Logout request received');
      res.json({ success: true, message: 'Logout realizado com sucesso' });
    });

    // Vendor specific endpoints
    app.get('/api/vendors/:id/proposals', async (req: Request, res: Response) => {
      try {
        const vendorId = parseInt(req.params.id);
        const proposals = await storage.getVendorProposals(vendorId);
        res.json(proposals);
      } catch (error) {
        console.error('Erro ao buscar propostas do vendedor:', error);
        res.status(500).json({ error: 'Erro ao buscar propostas do vendedor' });
      }
    });

    // System users endpoints
    app.get('/api/system-users', async (req: Request, res: Response) => {
      try {
        const systemUsers = await storage.getAllSystemUsers();
        res.json(systemUsers);
      } catch (error) {
        console.error('Erro ao buscar usuários do sistema:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários do sistema' });
      }
    });

    // API that the frontend is looking for
    app.get('/api/auth/users', async (req: Request, res: Response) => {
      try {
        const systemUsers = await storage.getAllSystemUsers();
        const vendors = await storage.getAllVendors();
        
        // Combine both user types for the admin interface
        const allUsers = [
          ...systemUsers.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password || '123456',
            role: user.role,
            panel: user.panel,
            active: user.active,
            type: 'system',
            userType: 'system',
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          })),
          ...vendors.map(vendor => ({
            id: vendor.id,
            name: vendor.name,
            email: vendor.email,
            password: vendor.password || '123456',
            role: vendor.role,
            panel: 'vendor',
            active: vendor.active,
            type: 'vendor',
            userType: 'vendor',
            lastLogin: vendor.last_login,
            createdAt: vendor.createdAt,
            updatedAt: vendor.updatedAt
          }))
        ];
        
        res.json(allUsers);
      } catch (error) {
        console.error('Erro ao buscar todos os usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
      }
    });

    // API para criar usuário
    app.post('/api/auth/users', async (req: Request, res: Response) => {
      try {
        const userData = req.body;
        console.log('🆕 Criando novo usuário:', userData);

        if (userData.userType === 'vendor' || userData.panel === 'vendor') {
          // Criar vendedor
          const newVendor = await storage.createVendor({
            name: userData.name,
            email: userData.email,
            password: userData.password || '123456',
            role: 'vendor',
            active: userData.active !== false
          });
          console.log('✅ Vendedor criado:', newVendor);
          res.json(newVendor);
        } else {
          // Criar usuário do sistema
          const newUser = await storage.createSystemUser({
            name: userData.name,
            email: userData.email,
            password: userData.password || '123456',
            role: userData.role,
            panel: userData.panel,
            active: userData.active !== false
          });
          console.log('✅ Usuário do sistema criado:', newUser);
          res.json(newUser);
        }
      } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
      }
    });

    // API para atualizar usuário
    app.put('/api/auth/users/:id', async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.id);
        const userData = req.body;
        console.log(`🔄 Atualizando usuário ${userId}:`, userData);

        if (userData.userType === 'vendor' || userData.type === 'vendor') {
          // Atualizar vendedor
          const updatedVendor = await storage.updateVendor(userId, {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            active: userData.active
          });
          console.log('✅ Vendedor atualizado:', updatedVendor);
          res.json(updatedVendor);
        } else {
          // Atualizar usuário do sistema
          const updatedUser = await storage.updateSystemUser(userId, {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            panel: userData.panel,
            active: userData.active
          });
          console.log('✅ Usuário do sistema atualizado:', updatedUser);
          res.json(updatedUser);
        }
      } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
      }
    });

    // API para deletar usuário
    app.delete('/api/auth/users/:id', async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.id);
        const userType = req.query.type as string;
        console.log(`🗑️ Deletando usuário ${userId} (${userType})`);

        if (userType === 'vendor') {
          await storage.deleteVendor(userId);
        } else {
          await storage.deleteSystemUser(userId);
        }
        
        console.log('✅ Usuário deletado com sucesso');
        res.json({ success: true });
      } catch (error) {
        console.error('❌ Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
      }
    });

    // Catch invalid POST requests to root
    app.post('/', (req: Request, res: Response) => {
      console.log('❌ Invalid POST request to root - redirecting to appropriate endpoint');
      res.status(400).json({ 
        error: 'Invalid request',
        message: 'Use specific API endpoints for authentication and data operations'
      });
    });

    // Endpoint para sincronizar documentos recebidos
    app.post('/api/proposals/sync-documents', async (req: Request, res: Response) => {
      try {
        const { clientToken, documentosRecebidos } = req.body;
        console.log(`🔄 Sincronizando documentos para token: ${clientToken}`);
        
        if (!clientToken) {
          return res.status(400).json({ error: 'Token do cliente é obrigatório' });
        }
        
        const proposal = await storage.getProposalByToken(clientToken);
        if (!proposal) {
          return res.status(404).json({ error: 'Proposta não encontrada' });
        }
        
        // Atualizar documentos recebidos
        const updatedProposal = await storage.updateProposal(proposal.id, {
          documentosRecebidos: documentosRecebidos,
          updatedAt: new Date()
        });
        
        console.log(`✅ Documentos sincronizados para proposta ${proposal.abmId}`);
        res.json({ success: true, proposal: updatedProposal });
      } catch (error) {
        console.error('❌ Erro ao sincronizar documentos:', error);
        res.status(500).json({ error: 'Erro ao sincronizar documentos' });
      }
    });

    // API 404 handler
    app.use('/api/*', (req: Request, res: Response) => {
      console.log(`❌ API REQUEST NOT HANDLED: ${req.method} ${req.url}`);
      res.status(404).json({ error: 'API endpoint not found' });
    });

    // Use Vite middleware for non-API routes
    app.use(vite.middlewares);

    // Catch all other routes and serve index.html
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

    console.log("✅ Servidor de desenvolvimento configurado");
  } else {
    // Production setup
    console.log("📦 Configurando servidor de produção");
    
    app.get('/api/test', (req: Request, res: Response) => {
      res.json({ success: true, message: 'API funcionando (produção)', timestamp: new Date().toISOString() });
    });

    // ROTAS DE AUTENTICAÇÃO PARA PRODUÇÃO (usando banco de dados)
    app.post('/api/auth/login', async (req: Request, res: Response) => {
      try {
        console.log('🔐 Login em produção:', req.body);
        
        const { email, password, portal } = req.body;
        
        if (!email || !password) {
          return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        console.log(`🔍 Verificando credenciais para ${email} no portal ${portal}`);

        // Primeiro, tentar buscar usuário do sistema
        const systemUser = await storage.getSystemUserByEmail(email);
        if (systemUser && systemUser.password === password && systemUser.active) {
          console.log('✅ Login bem-sucedido - Usuário do sistema:', systemUser);
          await storage.updateLastLogin(systemUser.id);
          
          const user = { 
            id: systemUser.id.toString(), 
            email: systemUser.email, 
            name: systemUser.name,
            role: systemUser.role
          };
          
          return res.json({ success: true, user });
        }

        // Se não encontrou no sistema, tentar buscar nos vendedores
        const vendor = await storage.getVendorByEmail(email);
        if (vendor && vendor.password === password && vendor.active) {
          console.log('✅ Login bem-sucedido - Vendedor:', vendor);
          
          const user = { 
            id: vendor.id.toString(), 
            email: vendor.email, 
            name: vendor.name,
            role: 'vendor'
          };
          
          return res.json({ success: true, user });
        }

        console.log('❌ Credenciais inválidas para:', email);
        return res.status(401).json({ error: 'Credenciais inválidas' });
        
      } catch (error) {
        console.error('❌ Erro no login em produção:', error);
        res.status(500).json({ error: 'Erro de conexão. Tente novamente.' });
      }
    });

    // Outras rotas essenciais para produção
    app.get('/api/proposals', async (req: Request, res: Response) => {
      try {
        const proposals = await storage.getAllProposals();
        res.json(proposals);
      } catch (error) {
        console.error('Erro ao buscar propostas:', error);
        res.status(500).json({ error: 'Erro ao buscar propostas' });
      }
    });

    app.get('/api/vendors', async (req: Request, res: Response) => {
      try {
        const vendors = await storage.getAllVendors();
        res.json(vendors);
      } catch (error) {
        console.error('Erro ao buscar vendedores:', error);
        res.status(500).json({ error: 'Erro ao buscar vendedores' });
      }
    });



    const distPath = path.resolve(__dirname, "public");
    app.use(express.static(distPath));

    app.use("*", (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  server.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Servidor iniciado na porta ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Banco de dados: Conectado`);
    console.log(`🔗 URL Local: http://localhost:${PORT}`);
    if (process.env.REPL_SLUG) {
      console.log(`🌐 URL Produção: https://${process.env.REPL_SLUG}.replit.app`);
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando servidor...');
    server.close(() => {
      console.log('✅ Servidor encerrado');
      process.exit(0);
    });
  });
}

// Error handling for server startup
startServer().catch(error => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});