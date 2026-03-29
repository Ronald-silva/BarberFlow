-- =====================================================
-- SUBSCRIPTIONS SCHEMA - Stripe Integration
-- =====================================================
-- This schema manages subscription plans, customer data, and payment history
-- for the Shafar SaaS platform using Stripe as payment processor.
--
-- Tables:
-- 1. subscription_plans - Available subscription tiers
-- 2. stripe_customers - Links barbershops to Stripe customer IDs
-- 3. subscriptions - Active and historical subscriptions
-- 4. payment_history - Payment transactions log
--
-- Created: 2025-12-30
-- Version: 1.0
-- =====================================================

-- =====================================================
-- 1. SUBSCRIPTION PLANS TABLE
-- =====================================================
-- Stores the available subscription tiers (Básico, Profissional, Premium)

CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Plan identification
    name VARCHAR(100) NOT NULL UNIQUE, -- 'Básico', 'Profissional', 'Premium'
    slug VARCHAR(50) NOT NULL UNIQUE, -- 'basic', 'professional', 'premium'
    description TEXT,

    -- Pricing
    price_monthly DECIMAL(10, 2) NOT NULL, -- Monthly price in BRL
    price_yearly DECIMAL(10, 2), -- Yearly price (with discount)
    currency VARCHAR(3) DEFAULT 'BRL',

    -- Stripe IDs
    stripe_price_id_monthly VARCHAR(255), -- Stripe Price ID for monthly billing
    stripe_price_id_yearly VARCHAR(255), -- Stripe Price ID for yearly billing
    stripe_product_id VARCHAR(255), -- Stripe Product ID

    -- Plan limits
    max_professionals INTEGER NOT NULL DEFAULT 1, -- Max barbeiros
    max_services INTEGER NOT NULL DEFAULT 10, -- Max serviços
    max_monthly_appointments INTEGER, -- Null = unlimited

    -- Features (JSONB for flexibility)
    features JSONB DEFAULT '[]'::jsonb, -- ['Agendamentos ilimitados', 'Relatórios', etc.]

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE, -- Highlight this plan
    sort_order INTEGER DEFAULT 0, -- Display order (0 = first)

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON subscription_plans(slug);

-- =====================================================
-- 2. STRIPE CUSTOMERS TABLE
-- =====================================================
-- Links barbershops to their Stripe customer IDs

CREATE TABLE IF NOT EXISTS stripe_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Admin who created

    -- Stripe data
    stripe_customer_id VARCHAR(255) NOT NULL UNIQUE, -- Stripe Customer ID (cus_...)

    -- Customer info (synced from Stripe)
    email VARCHAR(255),
    name VARCHAR(255),

    -- Payment methods
    default_payment_method_id VARCHAR(255), -- Stripe Payment Method ID (pm_...)
    payment_method_type VARCHAR(50), -- 'card', 'pix', 'boleto'

    -- Card details (last 4 digits, brand)
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50), -- 'visa', 'mastercard', etc.
    card_exp_month INTEGER,
    card_exp_year INTEGER,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_barbershop_stripe UNIQUE(barbershop_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stripe_customers_barbershop ON stripe_customers(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);

-- =====================================================
-- 3. SUBSCRIPTIONS TABLE
-- =====================================================
-- Stores active and historical subscriptions

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    stripe_customer_id UUID NOT NULL REFERENCES stripe_customers(id) ON DELETE RESTRICT,

    -- Stripe data
    stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE, -- Stripe Subscription ID (sub_...)
    stripe_price_id VARCHAR(255), -- Current price ID

    -- Billing
    billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'yearly'
    amount DECIMAL(10, 2) NOT NULL, -- Amount charged
    currency VARCHAR(3) DEFAULT 'BRL',

    -- Status (synced from Stripe)
    status VARCHAR(50) NOT NULL DEFAULT 'incomplete', -- 'active', 'canceled', 'past_due', 'incomplete', 'trialing'

    -- Dates
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    canceled_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,

    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_barbershop ON subscriptions(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);

-- =====================================================
-- 4. PAYMENT HISTORY TABLE
-- =====================================================
-- Logs all payment transactions (successful and failed)

CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    stripe_customer_id UUID REFERENCES stripe_customers(id) ON DELETE SET NULL,

    -- Stripe data
    stripe_invoice_id VARCHAR(255), -- Stripe Invoice ID (in_...)
    stripe_payment_intent_id VARCHAR(255), -- Stripe Payment Intent ID (pi_...)
    stripe_charge_id VARCHAR(255), -- Stripe Charge ID (ch_...)

    -- Payment details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL, -- 'succeeded', 'failed', 'pending', 'refunded'

    -- Payment method
    payment_method_type VARCHAR(50), -- 'card', 'pix', 'boleto'
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),

    -- Dates
    payment_date TIMESTAMP WITH TIME ZONE,

    -- Failure details
    failure_code VARCHAR(100),
    failure_message TEXT,

    -- Invoice
    invoice_url TEXT, -- Stripe hosted invoice URL
    invoice_pdf TEXT, -- PDF download URL

    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_barbershop ON payment_history(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription ON payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_date ON payment_history(payment_date DESC);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5.1. SUBSCRIPTION PLANS POLICIES
-- =====================================================
-- Anyone can view active plans (public)

DROP POLICY IF EXISTS "subscription_plans_select_all" ON subscription_plans;
CREATE POLICY "subscription_plans_select_all"
    ON subscription_plans FOR SELECT
    USING (is_active = TRUE);

-- Only platform admins can modify plans
DROP POLICY IF EXISTS "subscription_plans_insert_admin" ON subscription_plans;
CREATE POLICY "subscription_plans_insert_admin"
    ON subscription_plans FOR INSERT
    WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS "subscription_plans_update_admin" ON subscription_plans;
CREATE POLICY "subscription_plans_update_admin"
    ON subscription_plans FOR UPDATE
    USING (is_platform_admin())
    WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS "subscription_plans_delete_admin" ON subscription_plans;
CREATE POLICY "subscription_plans_delete_admin"
    ON subscription_plans FOR DELETE
    USING (is_platform_admin());

-- =====================================================
-- 5.2. STRIPE CUSTOMERS POLICIES
-- =====================================================
-- Users can only see their own barbershop's Stripe customer data

DROP POLICY IF EXISTS "stripe_customers_select_own_barbershop" ON stripe_customers;
CREATE POLICY "stripe_customers_select_own_barbershop"
    ON stripe_customers FOR SELECT
    USING (
        barbershop_id IN (
            SELECT barbershop_id FROM users WHERE id = auth.uid()
        )
    );

-- Only barbershop admins can create Stripe customers
DROP POLICY IF EXISTS "stripe_customers_insert_admin" ON stripe_customers;
CREATE POLICY "stripe_customers_insert_admin"
    ON stripe_customers FOR INSERT
    WITH CHECK (
        is_barbershop_admin(barbershop_id)
    );

-- Only barbershop admins can update their Stripe customer data
DROP POLICY IF EXISTS "stripe_customers_update_own_barbershop" ON stripe_customers;
CREATE POLICY "stripe_customers_update_own_barbershop"
    ON stripe_customers FOR UPDATE
    USING (
        is_barbershop_admin(barbershop_id)
    )
    WITH CHECK (
        is_barbershop_admin(barbershop_id)
    );

-- =====================================================
-- 5.3. SUBSCRIPTIONS POLICIES
-- =====================================================
-- Users can only see their own barbershop's subscriptions

DROP POLICY IF EXISTS "subscriptions_select_own_barbershop" ON subscriptions;
CREATE POLICY "subscriptions_select_own_barbershop"
    ON subscriptions FOR SELECT
    USING (
        barbershop_id IN (
            SELECT barbershop_id FROM users WHERE id = auth.uid()
        )
    );

-- Only barbershop admins can create subscriptions
DROP POLICY IF EXISTS "subscriptions_insert_admin" ON subscriptions;
CREATE POLICY "subscriptions_insert_admin"
    ON subscriptions FOR INSERT
    WITH CHECK (
        is_barbershop_admin(barbershop_id)
    );

-- Only barbershop admins can update their subscriptions
DROP POLICY IF EXISTS "subscriptions_update_own_barbershop" ON subscriptions;
CREATE POLICY "subscriptions_update_own_barbershop"
    ON subscriptions FOR UPDATE
    USING (
        is_barbershop_admin(barbershop_id)
    )
    WITH CHECK (
        is_barbershop_admin(barbershop_id)
    );

-- =====================================================
-- 5.4. PAYMENT HISTORY POLICIES
-- =====================================================
-- Users can only see their own barbershop's payment history

DROP POLICY IF EXISTS "payment_history_select_own_barbershop" ON payment_history;
CREATE POLICY "payment_history_select_own_barbershop"
    ON payment_history FOR SELECT
    USING (
        barbershop_id IN (
            SELECT barbershop_id FROM users WHERE id = auth.uid()
        )
    );

-- Only system can insert payment history (via Edge Functions)
DROP POLICY IF EXISTS "payment_history_insert_system" ON payment_history;
CREATE POLICY "payment_history_insert_system"
    ON payment_history FOR INSERT
    WITH CHECK (
        is_platform_admin() OR
        is_barbershop_admin(barbershop_id)
    );

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- =====================================================
-- 6.1. Get active subscription for a barbershop
-- =====================================================

CREATE OR REPLACE FUNCTION get_active_subscription(p_barbershop_id UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan_name VARCHAR(100),
    plan_slug VARCHAR(50),
    status VARCHAR(50),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        sp.name,
        sp.slug,
        s.status,
        s.current_period_end,
        s.cancel_at_period_end
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.barbershop_id = p_barbershop_id
      AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6.2. Check if barbershop has active subscription
-- =====================================================

CREATE OR REPLACE FUNCTION has_active_subscription(p_barbershop_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM subscriptions
    WHERE barbershop_id = p_barbershop_id
      AND status IN ('active', 'trialing')
      AND current_period_end > NOW();

    RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6.3. Get subscription limits for barbershop
-- =====================================================

CREATE OR REPLACE FUNCTION get_subscription_limits(p_barbershop_id UUID)
RETURNS TABLE (
    max_professionals INTEGER,
    max_services INTEGER,
    max_monthly_appointments INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sp.max_professionals,
        sp.max_services,
        sp.max_monthly_appointments
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.barbershop_id = p_barbershop_id
      AND s.status IN ('active', 'trialing')
      AND s.current_period_end > NOW()
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- =====================================================
-- 7.1. Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_customers_updated_at ON stripe_customers;
CREATE TRIGGER update_stripe_customers_updated_at
    BEFORE UPDATE ON stripe_customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. SEED DATA - Default Subscription Plans
-- =====================================================

INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, max_professionals, max_services, max_monthly_appointments, features, is_active, is_featured, sort_order)
VALUES
    (
        'Básico',
        'basic',
        'Ideal para barbearias iniciantes',
        49.90,
        539.00, -- ~10% discount (49.90 * 12 = 598.80, yearly = 539.00)
        2, -- Max 2 barbeiros
        10, -- Max 10 serviços
        100, -- Max 100 agendamentos/mês
        '[
            "Até 2 profissionais",
            "Até 10 serviços",
            "100 agendamentos/mês",
            "Agendamento online",
            "Notificações WhatsApp",
            "Relatórios básicos"
        ]'::jsonb,
        TRUE,
        FALSE,
        1
    ),
    (
        'Profissional',
        'professional',
        'Para barbearias em crescimento',
        99.90,
        1079.00, -- ~10% discount
        5, -- Max 5 barbeiros
        30, -- Max 30 serviços
        500, -- Max 500 agendamentos/mês
        '[
            "Até 5 profissionais",
            "Até 30 serviços",
            "500 agendamentos/mês",
            "Agendamento online",
            "Notificações WhatsApp",
            "Relatórios avançados",
            "Múltiplas unidades",
            "Suporte prioritário"
        ]'::jsonb,
        TRUE,
        TRUE, -- Featured plan
        2
    ),
    (
        'Premium',
        'premium',
        'Solução completa para redes de barbearias',
        199.90,
        2159.00, -- ~10% discount
        NULL, -- Unlimited professionals
        NULL, -- Unlimited services
        NULL, -- Unlimited appointments
        '[
            "Profissionais ilimitados",
            "Serviços ilimitados",
            "Agendamentos ilimitados",
            "Agendamento online",
            "Notificações WhatsApp",
            "Relatórios completos",
            "Múltiplas unidades",
            "API de integração",
            "Suporte VIP 24/7",
            "Consultoria personalizada"
        ]'::jsonb,
        TRUE,
        FALSE,
        3
    )
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 9. COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE subscription_plans IS 'Available subscription tiers (Básico, Profissional, Premium)';
COMMENT ON TABLE stripe_customers IS 'Links barbershops to Stripe customer IDs';
COMMENT ON TABLE subscriptions IS 'Active and historical subscriptions with Stripe data';
COMMENT ON TABLE payment_history IS 'Payment transaction logs (successful and failed)';

COMMENT ON FUNCTION get_active_subscription(UUID) IS 'Returns the active subscription for a barbershop';
COMMENT ON FUNCTION has_active_subscription(UUID) IS 'Checks if a barbershop has an active subscription';
COMMENT ON FUNCTION get_subscription_limits(UUID) IS 'Returns the subscription limits (professionals, services, appointments) for a barbershop';

-- =====================================================
-- 10. VERIFICATION
-- =====================================================

-- Verify tables created
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('subscription_plans', 'stripe_customers', 'subscriptions', 'payment_history');

    IF table_count = 4 THEN
        RAISE NOTICE '✅ All 4 subscription tables created successfully!';
    ELSE
        RAISE WARNING '⚠️  Only % of 4 tables created', table_count;
    END IF;
END $$;

-- Verify subscription plans inserted
DO $$
DECLARE
    plan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO plan_count FROM subscription_plans;

    IF plan_count >= 3 THEN
        RAISE NOTICE '✅ % subscription plans created (Básico, Profissional, Premium)', plan_count;
    ELSE
        RAISE WARNING '⚠️  Only % subscription plans created', plan_count;
    END IF;
END $$;

RAISE NOTICE '✅ Subscriptions schema installation complete!';
