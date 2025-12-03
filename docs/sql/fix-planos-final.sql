-- SCRIPT FINAL: Corrige tabela 'planos' e insere dados
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- PASSO 1: Tornar price_id OPCIONAL
-- ============================================

ALTER TABLE planos ALTER COLUMN price_id DROP NOT NULL;

-- ============================================
-- PASSO 2: Adicionar colunas faltantes
-- ============================================

DO $$ 
BEGIN
    -- Adicionar 'descricao' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='planos' AND column_name='descricao') THEN
        ALTER TABLE planos ADD COLUMN descricao TEXT;
    END IF;

    -- Adicionar 'ativo' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='planos' AND column_name='ativo') THEN
        ALTER TABLE planos ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;

    -- Adicionar 'intervalo' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='planos' AND column_name='intervalo') THEN
        ALTER TABLE planos ADD COLUMN intervalo VARCHAR(20) DEFAULT 'month';
    END IF;

    -- Adicionar 'max_professionals' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='planos' AND column_name='max_professionals') THEN
        ALTER TABLE planos ADD COLUMN max_professionals INTEGER;
    END IF;

    -- Adicionar 'criado_em' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='planos' AND column_name='criado_em') THEN
        ALTER TABLE planos ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Adicionar 'atualizado_em' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='planos' AND column_name='atualizado_em') THEN
        ALTER TABLE planos ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ============================================
-- PASSO 3: Garantir default UUID para id
-- ============================================

ALTER TABLE planos ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- ============================================
-- PASSO 4: Limpar dados antigos
-- ============================================

DELETE FROM planos;

-- ============================================
-- PASSO 5: Inserir os 3 novos planos
-- ============================================

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

-- ============================================
-- PASSO 6: Criar índices
-- ============================================

CREATE INDEX IF NOT EXISTS idx_planos_ativo ON planos(ativo);

-- ============================================
-- PASSO 7: Atualizar RLS
-- ============================================

ALTER TABLE planos ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Allow public read access to plans" ON planos;
DROP POLICY IF EXISTS "Anyone can view active plans" ON planos;

-- Criar nova política
CREATE POLICY "Anyone can view active plans" 
    ON planos FOR SELECT 
    USING (ativo = true);

-- ============================================
-- PASSO 8: Verificação
-- ============================================

SELECT 
    '✅ Migração concluída com sucesso!' as status,
    (SELECT COUNT(*) FROM planos) as total_planos,
    (SELECT COUNT(*) FROM planos WHERE ativo = true) as planos_ativos;

-- Mostrar planos criados
SELECT 
    nome,
    preco / 100.0 as preco_brl,
    max_professionals,
    ativo,
    recursos
FROM planos
ORDER BY preco;
