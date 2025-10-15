#!/bin/bash
set -e

echo "🔧 Iniciando build do BarberFlow..."

# Verificar se o Node.js está disponível
echo "📋 Versão do Node.js:"
node --version

echo "📋 Versão do npm:"
npm --version

# Instalar dependências se necessário
echo "📦 Instalando dependências..."
npm ci

# Executar build
echo "🏗️ Executando build..."
npx vite build

echo "✅ Build concluído com sucesso!"