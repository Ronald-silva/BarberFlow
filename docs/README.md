# 📚 Documentação BarberFlow

## 🎯 Guias Principais

### 🏗️ Arquitetura
- **[Arquitetura da Plataforma](guides/PLATFORM_ARCHITECTURE.md)** - Nova arquitetura multi-tenant explicada
- **[Resumo da Arquitetura](guides/ARCHITECTURE_SUMMARY.md)** - Visão executiva das mudanças implementadas
- **[Multi-Tenant](guides/MULTI_TENANT_ARCHITECTURE.md)** - Arquitetura multi-inquilino detalhada

### 📁 Organização
- **[Estrutura do Projeto](guides/PROJECT_STRUCTURE.md)** - Organização completa dos arquivos
- **[Relatório de Limpeza](guides/CLEANUP_REPORT.md)** - Processo de organização do código

## ⚙️ Configuração e Setup

### 🚀 Deploy e Produção
- **[Deploy na Vercel](guides/VERCEL_DEPLOY_GUIDE.md)** - Guia completo de deploy
- **[Status do Deploy](guides/DEPLOY_STATUS.md)** - Status atual do deploy
- **[Guia Geral de Deploy](guides/DEPLOY_GUIDE.md)** - Instruções gerais

### 🗄️ Banco de Dados
- **[Setup do Supabase](guides/SUPABASE_SETUP.md)** - Configuração completa do banco
- **[Configuração de Ambiente](guides/ENVIRONMENT_SETUP.md)** - Variáveis de ambiente
- **[Setup Manual do Storage](guides/STORAGE_SETUP_MANUAL.md)** - Configuração de arquivos

### 💰 Pagamentos
- **[Configuração de Pagamentos](guides/PAYMENT_SETUP.md)** - PIX e Bitcoin
- **[Upload de Logo](guides/LOGO_UPLOAD_GUIDE.md)** - Configuração de storage de imagens

## 🎨 Interface e UX

### 📱 Mobile
- **[Melhorias Mobile](guides/MOBILE_IMPROVEMENTS.md)** - Otimizações para dispositivos móveis

### 👥 Usuários
- **[Onboarding](guides/ONBOARDING_GUIDE.md)** - Fluxo de cadastro de usuários
- **[Visão Geral de Funcionalidades](guides/FEATURES_OVERVIEW.md)** - Todas as funcionalidades implementadas

## 🗄️ Scripts SQL

Todos os scripts SQL estão organizados na pasta [`sql/`](sql/):

- **[Schema Principal](sql/supabase-schema.sql)** - Estrutura do banco
- **[Dados Iniciais](sql/supabase-seed.sql)** - Dados de exemplo
- **[Configuração de Storage](sql/supabase-storage-setup.sql)** - Setup de arquivos
- **[Políticas RLS](sql/supabase-rls-policies.sql)** - Segurança do banco
- **[Schema de Pagamentos](sql/supabase-payment-schema.sql)** - Estrutura de pagamentos
- **[Verificação](sql/verify-schema.sql)** - Scripts de verificação

## 🛠️ Utilitários

### ✅ Verificação
- **[Status do Supabase](sql/CHECK_SUPABASE_STATUS.sql)** - Verificar configuração
- **[Exemplo de Nova Barbearia](sql/ADD_NEW_BARBERSHOP_EXAMPLE.sql)** - Como adicionar barbearias

### 🔧 Correções
- **[Correção de Acesso Público](sql/fix-public-access.sql)** - Corrigir permissões
- **[Migrações](sql/supabase-migration.sql)** - Scripts de migração

---

## 🚀 Como Usar Esta Documentação

### Para Desenvolvedores
1. Comece com [Estrutura do Projeto](guides/PROJECT_STRUCTURE.md)
2. Configure o ambiente com [Setup do Supabase](guides/SUPABASE_SETUP.md)
3. Entenda a arquitetura em [Arquitetura da Plataforma](guides/PLATFORM_ARCHITECTURE.md)

### Para Deploy
1. Leia o [Guia de Deploy](guides/VERCEL_DEPLOY_GUIDE.md)
2. Configure as [Variáveis de Ambiente](guides/ENVIRONMENT_SETUP.md)
3. Execute os [Scripts SQL](sql/) na ordem correta

### Para Entender o Sistema
1. Veja o [Resumo da Arquitetura](guides/ARCHITECTURE_SUMMARY.md)
2. Explore as [Funcionalidades](guides/FEATURES_OVERVIEW.md)
3. Entenda o [Multi-Tenant](guides/MULTI_TENANT_ARCHITECTURE.md)

---

**Documentação mantida atualizada e organizada para facilitar o desenvolvimento e manutenção do BarberFlow!** 📖