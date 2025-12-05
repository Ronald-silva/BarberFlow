@echo off
REM Script para configurar variáveis de ambiente no Vercel (Windows)
REM Execute este script para configurar automaticamente as variáveis no Vercel

echo.
echo 🚀 Configurando variáveis de ambiente no Vercel...
echo.
echo ⚠️  IMPORTANTE: Você precisa ter o Vercel CLI instalado e estar logado
echo    Se não tiver, execute: npm install -g vercel
echo    Depois faça login: vercel login
echo.
pause

REM Variáveis OBRIGATÓRIAS do Supabase
echo.
echo 📦 Configurando variáveis OBRIGATÓRIAS do Supabase...

echo https://jrggwhlbvsyvcqvywrmy.supabase.co | vercel env add VITE_SUPABASE_URL production preview development

echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ2d3aGxidnN5dmNxdnl3cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg4MTEsImV4cCI6MjA3NjAzNDgxMX0.Y4bUnGmgGgPnwO1SVFbq6k2yZJN7wcY01JxKBAImQKk | vercel env add VITE_SUPABASE_ANON_KEY production preview development

echo production | vercel env add VITE_ENVIRONMENT production preview development

echo.
echo ✅ Variáveis configuradas com sucesso!
echo.
echo 🔄 Fazendo redeploy para aplicar as mudanças...
vercel --prod

echo.
echo 🎉 Pronto! Seu projeto está no ar com as novas configurações!
echo    Acesse o site e teste o login/cadastro
echo.
pause
