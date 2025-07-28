
#!/bin/bash
echo "🔨 Iniciando build de produção..."

# Limpar dist anterior
rm -rf dist

# Build do frontend
echo "📦 Fazendo build do frontend..."
npm run build

# Verificar se build foi criado
if [ ! -d "dist" ]; then
  echo "❌ Erro: pasta dist não foi criada"
  exit 1
fi

echo "✅ Build de produção concluído!"
echo "📁 Arquivos em dist:"
ls -la dist/

echo "🚀 Pronto para deploy!"
