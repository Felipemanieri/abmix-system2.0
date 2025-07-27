import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

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
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
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