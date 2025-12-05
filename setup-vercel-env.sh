#!/bin/bash

# Script para configurar variáveis de ambiente no Vercel
# Execute este script para configurar automaticamente as variáveis no Vercel

echo "🚀 Configurando variáveis de ambiente no Vercel..."
echo ""
echo "⚠️  IMPORTANTE: Você precisa ter o Vercel CLI instalado e estar logado"
echo "   Se não tiver, execute: npm install -g vercel"
echo "   Depois faça login: vercel login"
echo ""

read -p "Pressione Enter para continuar ou Ctrl+C para cancelar..."

# Variáveis OBRIGATÓRIAS do Supabase
echo ""
echo "📦 Configurando variáveis OBRIGATÓRIAS do Supabase..."

vercel env add VITE_SUPABASE_URL production preview development <<EOF
https://jrggwhlbvsyvcqvywrmy.supabase.co
EOF

vercel env add VITE_SUPABASE_ANON_KEY production preview development <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ2d3aGxidnN5dmNxdnl3cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg4MTEsImV4cCI6MjA3NjAzNDgxMX0.Y4bUnGmgGgPnwO1SVFbq6k2yZJN7wcY01JxKBAImQKk
EOF

# Variáveis OPCIONAIS (somente se o usuário quiser)
echo ""
echo "📌 Deseja configurar variáveis OPCIONAIS? (Sentry, Stripe, etc.)"
read -p "Digite 's' para sim ou 'n' para pular: " CONFIGURAR_OPCIONAIS

if [ "$CONFIGURAR_OPCIONAIS" = "s" ]; then
    echo ""
    echo "⚙️  Configurando Sentry..."
    read -p "Digite o DSN do Sentry (ou deixe vazio para pular): " SENTRY_DSN
    if [ ! -z "$SENTRY_DSN" ]; then
        vercel env add VITE_SENTRY_DSN production preview development <<EOF
$SENTRY_DSN
EOF
    fi

    vercel env add VITE_ENVIRONMENT production preview development <<EOF
production
EOF

    echo ""
    echo "💳 Configurando Stripe..."
    read -p "Digite a chave publicável do Stripe (ou deixe vazio para pular): " STRIPE_KEY
    if [ ! -z "$STRIPE_KEY" ]; then
        vercel env add VITE_STRIPE_PUBLISHABLE_KEY production preview development <<EOF
$STRIPE_KEY
EOF
    fi

    echo ""
    echo "📱 Configurando PIX..."
    read -p "Digite a chave PIX (ou deixe vazio para pular): " PIX_KEY
    if [ ! -z "$PIX_KEY" ]; then
        vercel env add VITE_PIX_KEY production preview development <<EOF
$PIX_KEY
EOF
    fi
fi

echo ""
echo "✅ Variáveis configuradas com sucesso!"
echo ""
echo "🔄 Fazendo redeploy para aplicar as mudanças..."
vercel --prod

echo ""
echo "🎉 Pronto! Seu projeto está no ar com as novas configurações!"
echo "   Acesse o site e teste o login/cadastro"
