import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
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
          if (vendor && vendor.password === password && vendor.active) {
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
        } else {
          // Check system users table
          const systemUser = await storage.getSystemUserByEmail(email);
          if (systemUser && systemUser.password === password && systemUser.active) {
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
            role: user.role,
            panel: user.panel,
            active: user.active,
            type: 'system'
          })),
          ...vendors.map(vendor => ({
            id: vendor.id,
            name: vendor.name,
            email: vendor.email,
            role: vendor.role,
            panel: 'vendor',
            active: vendor.active,
            type: 'vendor'
          }))
        ];
        
        res.json(allUsers);
      } catch (error) {
        console.error('Erro ao buscar todos os usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
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