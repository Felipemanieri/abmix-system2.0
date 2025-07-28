import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "../shared/schema";
import WebSocket from 'ws';

// Configure WebSocket for Neon database with proper error handling
try {
  // Configure WebSocket for Neon in Node.js environment
  neonConfig.webSocketConstructor = WebSocket;
} catch (error) {
  console.warn('WebSocket configuration warning - using HTTP fallback:', error);
  // Neon will fallback to HTTP if WebSocket fails
}

// Configuração mais robusta para produção
let pool: Pool | null = null;
let db: any = null;

function initializeDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL não configurado. Configuração necessária para produção.");
      return null;
    }
    
    console.log("🔌 Inicializando conexão com banco de dados...");
    
    // Configure pool with better error handling
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // Add error handler to pool
    pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
    
    db = drizzle({ client: pool, schema });
    console.log("✅ Conexão com banco configurada");
    return db;
  } catch (error) {
    console.error("❌ Erro ao inicializar banco:", error);
    return null;
  }
}

// Inicializar na primeira importação
db = initializeDatabase();

export { pool, db };

// Função para verificar se o banco está disponível
export function isDatabaseAvailable(): boolean {
  return db !== null && pool !== null;
}