-- SCRIPT DEFINITIVO: Corrige tabela 'plans' (INGLÊS)
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- PASSO 1: Tornar price_id OPCIONAL
-- ============================================

ALTER TABLE plans ALTER COLUMN price_id DROP NOT NULL;

-- ============================================
-- PASSO 2: Adicionar colunas faltantes
-- ============================================

DO $$ 
BEGIN
    -- Adicionar 'description' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='plans' AND column_name='description') THEN
        ALTER TABLE plans ADD COLUMN description TEXT;
    END IF;

    -- Adicionar 'active' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='plans' AND column_name='active') THEN
        ALTER TABLE plans ADD COLUMN active BOOLEAN DEFAULT true;
    END IF;

    -- Adicionar 'interval' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='plans' AND column_name='interval') THEN
        ALTER TABLE plans ADD COLUMN interval VARCHAR(20) DEFAULT 'month';
    END IF;

    -- Adicionar 'max_professionals' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='plans' AND column_name='max_professionals') THEN
        ALTER TABLE plans ADD COLUMN max_professionals INTEGER;
    END IF;

    -- Adicionar 'created_at' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='plans' AND column_name='created_at') THEN
        ALTER TABLE plans ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Adicionar 'updated_at' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='plans' AND column_name='updated_at') THEN
        ALTER TABLE plans ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ============================================
-- PASSO 3: Garantir default UUID para id
-- ============================================

ALTER TABLE plans ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- ============================================
-- PASSO 4: Limpar dados antigos
-- ============================================

DELETE FROM plans;

-- ============================================
-- PASSO 5: Inserir os 3 novos planos
-- ============================================

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

-- ============================================
-- PASSO 6: Criar índices
-- ============================================

CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(active);

-- ============================================
-- PASSO 7: Atualizar RLS
-- ============================================

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Allow public read access to plans" ON plans;
DROP POLICY IF EXISTS "Anyone can view active plans" ON plans;

-- Criar nova política
CREATE POLICY "Anyone can view active plans" 
    ON plans FOR SELECT 
    USING (active = true);

-- ============================================
-- PASSO 8: Verificação
-- ============================================

SELECT 
    '✅ Migração concluída com sucesso!' as status,
    (SELECT COUNT(*) FROM plans) as total_plans,
    (SELECT COUNT(*) FROM plans WHERE active = true) as plans_ativos;

-- Mostrar planos criados
SELECT 
    name,
    price / 100.0 as price_brl,
    max_professionals,
    active,
    features
FROM plans
ORDER BY price;
