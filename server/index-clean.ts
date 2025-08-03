import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { storage } from "./storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);

// Global error handlers to prevent unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  // Silently ignore common network errors
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

// Database connection check
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

    // API Routes - Basic ones first
    console.log("🔗 Registrando rotas API básicas...");

    // Health check
    app.get('/api/test', (req: Request, res: Response) => {
      res.json({ success: true, message: 'API funcionando', timestamp: new Date().toISOString() });
    });

    // Basic proposal routes
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

    // Portal visibility state
    let portalVisibilityState = {
      vendor: true,
      client: true,
      financial: true,
      implementation: true,
      supervisor: true,
      restricted: true
    };

    app.get('/api/portal-visibility', (req: Request, res: Response) => {
      res.json(portalVisibilityState);
    });

    app.post('/api/portal-visibility', (req: Request, res: Response) => {
      portalVisibilityState = { ...req.body, restricted: true };
      res.json({ success: true, data: portalVisibilityState });
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
    
    // Basic API routes for production
    app.get('/api/test', (req: Request, res: Response) => {
      res.json({ success: true, message: 'API funcionando (produção)', timestamp: new Date().toISOString() });
    });

    // Serve static files
    const distPath = path.resolve(__dirname, "public");
    app.use(express.static(distPath));

    // Catch all other routes and serve index.html
    app.use("*", (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  server.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Servidor iniciado na porta ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Banco de dados: Conectado`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
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