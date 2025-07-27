import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";

// Handler global para erros não capturados - CORRIGIDO
process.on('unhandledRejection', (reason, promise) => {
  if (reason && typeof reason === 'string') {
    if (reason.includes('EADDRINUSE') || 
        reason.includes('connection') ||
        reason.includes('network')) {
      return; // Silenciar erros de rede comuns
    }
  }
  console.warn('Promise rejeitada:', reason);
});

process.on('uncaughtException', (error) => {
  if (error.message.includes('EADDRINUSE')) {
    console.log('Porta já em uso - tentando continuar...');
    return;
  }
  console.error('Exceção crítica:', error);
  process.exit(1);
});
import { fileURLToPath } from "url";
import fs from "fs";
// import { createServer as createViteServer } from "vite";
// import { registerRoutes } from "./routes";
// import testRoutes from "./test-routes";
// import simpleGoogleRoutes from "./routes/simpleGoogle.js";
import { checkDeploymentConfig, getDeploymentStatus } from "./deployment-check";
import { domainRedirectMiddleware } from "./middleware/domainRedirect";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);

// CORS configuration for all origins
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

// Middleware de redirecionamento de domínio (PRIMEIRO)
app.use(domainRedirectMiddleware);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Replit Deploy expects port 5000 - avoid using database port 5432
const PORT = process.env.NODE_ENV === 'production' 
  ? (process.env.PORT || 5000) 
  : (process.env.PORT || 5000);

// Prevent excessive logging
let lastLogTime = 0;
const logThrottle = (message: string) => {
  const now = Date.now();
  if (now - lastLogTime > 5000) { // Only log every 5 seconds
    console.log(message);
    lastLogTime = now;
  }
};

async function startServer() {
  const PORT = process.env.PORT || 5000;

  // Matar processos na porta automaticamente
  try {
    const { exec } = await import('child_process');
    exec(`pkill -f "port ${PORT}"`, () => {});
    exec(`pkill -f "tsx server"`, () => {});
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    // Ignora erros de limpeza
  }

  // Verificar se é deploy ou desenvolvimento
  const isProduction = process.env.NODE_ENV === 'production';
  const isDeployment = process.env.REPLIT_DEPLOYMENT === '1';
  // Verificar configurações de deployment
  console.log("🔍 Verificando configurações de deployment...");
  console.log(`🔌 Configurando servidor para porta: ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);

  const deploymentStatus = checkDeploymentConfig();

  // Adicionar rota de status de deployment
  app.get('/api/deployment-status', (req: Request, res: Response) => {
    res.json(getDeploymentStatus());
  });

  if (process.env.NODE_ENV === "development") {
    console.log("🚀 Modo desenvolvimento - carregando Vite para interface completa");

    // Import Vite development server
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          port: 24678,
          clientPort: 24678
        },
        allowedHosts: [
          "all",
          "0b9dc262-d94f-4205-ae6f-4654c93ab584-00-ultt68ws1yda.riker.replit.dev",
          ".replit.dev",
          ".replit.app", 
          "abmix.digital",
          "localhost"
        ]
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

    // CRITICAL: API routes MUST come BEFORE vite.middlewares
    console.log("Setting up /api routes BEFORE Vite middleware");

    // ROTAS BÁSICAS TEMPORÁRIAS
    app.get('/api/test', (req: Request, res: Response) => {
      res.json({ success: true, message: 'API funcionando' });
    });
    
    app.get('/api/proposals', (req: Request, res: Response) => {
      res.json([]);
    });
    
    app.get('/api/vendors', (req: Request, res: Response) => {
      res.json([]);
    });

    // Google Sheets routes removidas - usando routes.ts principal

    // Depois usar o middleware Vite APENAS para rotas não-API
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Se é uma rota API que não foi capturada, não deve chegar aqui
      if (req.url.startsWith('/api/')) {
        console.log(`❌ API REQUEST NOT HANDLED: ${req.method} ${req.url}`);
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      next();
    });

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

    console.log("🚀 Servidor de desenvolvimento com Vite iniciado - interface completa carregada");
  } else {
    // Production setup - register API routes first
    console.log("Setting up production API routes");
    
    app.get('/api/test', (req: Request, res: Response) => {
      res.json({ success: true, message: 'API funcionando' });
    });
    
    app.get('/api/proposals', (req: Request, res: Response) => {
      res.json([]);
    });
    
    app.get('/api/vendors', (req: Request, res: Response) => {
      res.json([]);
    });

    // Then serve static files
    const distPath = path.resolve(__dirname, "public");
    app.use(express.static(distPath));

    // Catch all other routes and serve index.html
    app.use("*", (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
    console.log("📦 Production server ready with API routes");
  }

  server.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  }).on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`⚠️ Porta ${PORT} em uso - tentando novamente...`);
      setTimeout(() => {
        server.close();
        server.listen(Number(PORT) + 1, "0.0.0.0");
      }, 1000);
    } else {
      console.error('Erro do servidor:', error);
    }
  });
}

startServer().catch((error) => {
  console.log(`❌ Failed to start server: ${error.message}`);
  process.exit(1);
});