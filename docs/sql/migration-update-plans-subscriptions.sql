-- MIGRAÇÃO CORRIGIDA: Funciona com tabelas em INGLÊS ou PORTUGUÊS
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- DETECTAR NOME DAS TABELAS
-- ============================================

DO $$
DECLARE
    plans_table_name TEXT;
    subscriptions_table_name TEXT;
BEGIN
    -- Detectar se tabela é 'plans' ou 'planos'
    SELECT table_name INTO plans_table_name
    FROM information_schema.tables
    WHERE table_name IN ('plans', 'planos')
    AND table_schema = 'public'
    LIMIT 1;

    -- Detectar se tabela é 'subscriptions' ou 'assinaturas'
    SELECT table_name INTO subscriptions_table_name
    FROM information_schema.tables
    WHERE table_name IN ('subscriptions', 'assinaturas')
    AND table_schema = 'public'
    LIMIT 1;

    RAISE NOTICE 'Tabela de planos: %', COALESCE(plans_table_name, 'NÃO ENCONTRADA');
    RAISE NOTICE 'Tabela de assinaturas: %', COALESCE(subscriptions_table_name, 'NÃO ENCONTRADA');
END $$;

-- ============================================
-- OPÇÃO 1: Se suas tabelas estão em PORTUGUÊS
-- ============================================

-- Adicionar colunas faltantes em 'planos'
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'planos') THEN
        -- Adicionar 'description' ou 'descricao'
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='planos' AND column_name IN ('description', 'descricao')) THEN
            ALTER TABLE planos ADD COLUMN descricao TEXT;
        END IF;

        -- Adicionar 'active' ou 'ativo'
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='planos' AND column_name IN ('active', 'ativo')) THEN
            ALTER TABLE planos ADD COLUMN ativo BOOLEAN DEFAULT true;
        END IF;

        -- Adicionar 'interval' ou 'intervalo'
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='planos' AND column_name IN ('interval', 'intervalo')) THEN
            ALTER TABLE planos ADD COLUMN intervalo VARCHAR(20) DEFAULT 'month';
        END IF;

        -- Adicionar 'max_professionals'
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='planos' AND column_name='max_professionals') THEN
            ALTER TABLE planos ADD COLUMN max_professionals INTEGER;
        END IF;

        -- Adicionar 'created_at' ou 'criado_em'
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='planos' AND column_name IN ('created_at', 'criado_em')) THEN
            ALTER TABLE planos ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;

        -- Adicionar 'updated_at' ou 'atualizado_em'
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='planos' AND column_name IN ('updated_at', 'atualizado_em')) THEN
            ALTER TABLE planos ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;

        -- Garantir que 'id' tem default UUID
        ALTER TABLE planos ALTER COLUMN id SET DEFAULT uuid_generate_v4();
    END IF;
END $$;

-- ============================================
-- OPÇÃO 2: Se suas tabelas estão em INGLÊS
-- ============================================

-- Adicionar colunas faltantes em 'plans'
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plans') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='plans' AND column_name='description') THEN
            ALTER TABLE plans ADD COLUMN description TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='plans' AND column_name='active') THEN
            ALTER TABLE plans ADD COLUMN active BOOLEAN DEFAULT true;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='plans' AND column_name='interval') THEN
            ALTER TABLE plans ADD COLUMN interval VARCHAR(20) DEFAULT 'month';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='plans' AND column_name='max_professionals') THEN
            ALTER TABLE plans ADD COLUMN max_professionals INTEGER;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='plans' AND column_name='created_at') THEN
            ALTER TABLE plans ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='plans' AND column_name='updated_at') THEN
            ALTER TABLE plans ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;

        -- Garantir que 'id' tem default UUID
        ALTER TABLE plans ALTER COLUMN id SET DEFAULT uuid_generate_v4();
    END IF;
END $$;

-- ============================================
-- INSERIR PLANOS (PORTUGUÊS)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'planos') THEN
        -- Deletar planos antigos se existirem
        DELETE FROM planos WHERE nome IN ('Básico', 'Pro', 'Enterprise');

        -- Inserir novos planos
        INSERT INTO planos (nome, descricao, preco, intervalo, max_professionals, recursos, ativo)
        VALUES 
        (
            'Básico',
            'Ideal para barbearias pequenas',
            7900,
            'month',
            2,
            '["Até 2 profissionais", "Agendamentos ilimitados", "Notificações WhatsApp", "Suporte por email"]'::jsonb,
            true
        ),
        (
            'Pro',
            'Para barbearias em crescimento',
            14900,
            'month',
            5,
            '["Até 5 profissionais", "Agendamentos ilimitados", "Notificações WhatsApp + SMS", "Relatórios avançados", "Suporte prioritário"]'::jsonb,
            true
        ),
        (
            'Enterprise',
            'Para grandes barbearias',
            29900,
            'month',
            NULL,
            '["Profissionais ilimitados", "Agendamentos ilimitados", "Todas as notificações", "Relatórios personalizados", "Suporte 24/7", "API dedicada"]'::jsonb,
            true
        );
        
        RAISE NOTICE 'Planos inseridos na tabela PLANOS (português)';
    END IF;
END $$;

-- ============================================
-- INSERIR PLANOS (INGLÊS)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plans') THEN
        -- Deletar planos antigos se existirem
        DELETE FROM plans WHERE name IN ('Básico', 'Pro', 'Enterprise');

        -- Inserir novos planos
        INSERT INTO plans (name, description, price, interval, max_professionals, features, active)
        VALUES 
        (
            'Básico',
            'Ideal para barbearias pequenas',
            7900,
            'month',
            2,
            '["Até 2 profissionais", "Agendamentos ilimitados", "Notificações WhatsApp", "Suporte por email"]'::jsonb,
            true
        ),
        (
            'Pro',
            'Para barbearias em crescimento',
            14900,
            'month',
            5,
            '["Até 5 profissionais", "Agendamentos ilimitados", "Notificações WhatsApp + SMS", "Relatórios avançados", "Suporte prioritário"]'::jsonb,
            true
        ),
        (
            'Enterprise',
            'Para grandes barbearias',
            29900,
            'month',
            NULL,
            '["Profissionais ilimitados", "Agendamentos ilimitados", "Todas as notificações", "Relatórios personalizados", "Suporte 24/7", "API dedicada"]'::jsonb,
            true
        );
        
        RAISE NOTICE 'Planos inseridos na tabela PLANS (inglês)';
    END IF;
END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar planos (português)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'planos') THEN
        RAISE NOTICE 'Total de planos: %', (SELECT COUNT(*) FROM planos);
    END IF;
END $$;

-- Verificar planos (inglês)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plans') THEN
        RAISE NOTICE 'Total de plans: %', (SELECT COUNT(*) FROM plans);
    END IF;
END $$;

-- Mostrar resultado
SELECT 
    'Migração concluída!' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'planos') 
        THEN 'PORTUGUÊS (planos)'
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plans')
        THEN 'INGLÊS (plans)'
        ELSE 'TABELA NÃO ENCONTRADA'
    END as idioma_tabela;
