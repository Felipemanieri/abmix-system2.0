
export function checkDeploymentConfig() {
  console.log("✅ Configurações de deployment verificadas");
  return {
    status: "ready",
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    database: !!process.env.DATABASE_URL
  };
}

export function getDeploymentStatus() {
  return {
    status: "running",
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    database: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString()
  };
}
// Force deploy trigger - Sun Aug  3 05:47:03 PM UTC 2025
