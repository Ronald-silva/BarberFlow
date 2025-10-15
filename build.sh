#!/bin/bash
set -e

echo "🔧 Iniciando build do BarberFlow..."

# Verificar versões
echo "📋 Node.js: $(node --version)"
echo "📋 npm: $(npm --version)"

# Limpar cache npm se necessário
echo "🧹 Limpando cache..."
npm cache clean --force

# Instalar dependências exatas
echo "📦 Instalando dependências..."
npm ci

# Verificar se vite está disponível
echo "🔍 Verificando Vite..."
npx vite --version

# Executar build
echo "🏗️ Executando build..."
npx vite build

echo "✅ Build concluído!"