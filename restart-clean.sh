
#!/bin/bash

echo "🧹 LIMPEZA COMPLETA DO SISTEMA..."

# 1. Matar todos os processos
pkill -f node 2>/dev/null || true
pkill -f tsx 2>/dev/null || true
pkill -f git 2>/dev/null || true

# 2. Limpar locks do Git
rm -f .git/index.lock 2>/dev/null || true
rm -f .git/refs/heads/main.lock 2>/dev/null || true

# 3. Resetar Git para estado limpo
git reset --hard HEAD 2>/dev/null || true

# 4. Limpar cache e reinstalar
npm cache clean --force 2>/dev/null || true

# 5. Aguardar limpeza
sleep 2

echo "✅ SISTEMA LIMPO - Reiniciando..."

# 6. Reiniciar desenvolvimento
npm run dev
