-- Script SQL para adicionar tabelas de Subscriptions e Plans
-- Execute este script no SQL Editor do Supabase

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- em centavos
    interval VARCHAR(20) NOT NULL DEFAULT 'month', -- 'month' ou 'year'
    max_professionals INTEGER, -- NULL = ilimitado
    features JSONB DEFAULT '[]',
    stripe_price_id VARCHAR(255), -- ID do preço no Stripe
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Subscriptions (Assinaturas)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'trialing', 'past_due', 'canceled', 'unpaid'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(barbershop_id) -- Uma barbearia só pode ter uma assinatura ativa por vez
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_barbershop_id ON subscriptions(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(active);

-- Trigger para updated_at
CREATE TRIGGER update_plans_updated_at 
    BEFORE UPDATE ON plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies para Plans
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Todos podem ver os planos ativos
CREATE POLICY "Anyone can view active plans" 
    ON plans FOR SELECT 
    USING (active = true);

-- Apenas platform admins podem modificar planos
CREATE POLICY "Platform admins can manage plans" 
    ON plans FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'platform_admin'
        )
    );

-- RLS Policies para Subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver a assinatura da própria barbearia
CREATE POLICY "Users can view their barbershop subscription" 
    ON subscriptions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.barbershop_id = subscriptions.barbershop_id
        )
    );

-- Platform admins podem ver todas as assinaturas
CREATE POLICY "Platform admins can view all subscriptions" 
    ON subscriptions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'platform_admin'
        )
    );

-- Apenas platform admins podem modificar assinaturas
CREATE POLICY "Platform admins can manage subscriptions" 
    ON subscriptions FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'platform_admin'
        )
    );

-- Inserir planos padrão
INSERT INTO plans (name, description, price, interval, max_professionals, features) VALUES
(
    'Básico',
    'Ideal para barbearias pequenas',
    7900, -- R$ 79,00
    'month',
    2,
    '["Até 2 profissionais", "Agendamentos ilimitados", "Notificações WhatsApp", "Suporte por email"]'::jsonb
),
(
    'Pro',
    'Para barbearias em crescimento',
    14900, -- R$ 149,00
    'month',
    5,
    '["Até 5 profissionais", "Agendamentos ilimitados", "Notificações WhatsApp + SMS", "Relatórios avançados", "Suporte prioritário"]'::jsonb
),
(
    'Enterprise',
    'Para grandes barbearias',
    29900, -- R$ 299,00
    'month',
    NULL, -- ilimitado
    '["Profissionais ilimitados", "Agendamentos ilimitados", "Todas as notificações", "Relatórios personalizados", "Suporte 24/7", "API dedicada"]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Função para verificar se a barbearia pode adicionar mais profissionais
CREATE OR REPLACE FUNCTION check_professional_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    max_allowed INTEGER;
BEGIN
    -- Buscar o limite de profissionais do plano atual
    SELECT p.max_professionals INTO max_allowed
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.barbershop_id = NEW.barbershop_id
    AND s.status IN ('active', 'trialing')
    LIMIT 1;

    -- Se não houver limite (NULL), permitir
    IF max_allowed IS NULL THEN
        RETURN NEW;
    END IF;

    -- Contar profissionais atuais
    SELECT COUNT(*) INTO current_count
    FROM users
    WHERE barbershop_id = NEW.barbershop_id;

    -- Verificar se excede o limite
    IF current_count >= max_allowed THEN
        RAISE EXCEPTION 'Limite de profissionais atingido. Faça upgrade do seu plano.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar limite ao adicionar profissional
CREATE TRIGGER check_professional_limit_trigger
    BEFORE INSERT ON users
    FOR EACH ROW
    WHEN (NEW.barbershop_id IS NOT NULL)
    EXECUTE FUNCTION check_professional_limit();

COMMENT ON TABLE plans IS 'Planos de assinatura disponíveis no BarberFlow';
COMMENT ON TABLE subscriptions IS 'Assinaturas ativas das barbearias';
COMMENT ON FUNCTION check_professional_limit() IS 'Verifica se a barbearia pode adicionar mais profissionais baseado no plano';
