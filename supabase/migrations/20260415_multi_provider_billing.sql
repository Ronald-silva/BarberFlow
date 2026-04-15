-- Multi-provider billing foundation (Stripe + Asaas).
-- Safe to run in existing environments.

ALTER TABLE IF EXISTS subscription_plans
    ADD COLUMN IF NOT EXISTS asaas_plan_id_monthly VARCHAR(255),
    ADD COLUMN IF NOT EXISTS asaas_plan_id_yearly VARCHAR(255);

ALTER TABLE IF EXISTS subscriptions
    ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'stripe',
    ADD COLUMN IF NOT EXISTS provider_customer_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS provider_subscription_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS provider_price_id VARCHAR(255);

ALTER TABLE IF EXISTS subscriptions
    ALTER COLUMN stripe_customer_id DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'subscriptions_provider_check'
  ) THEN
    ALTER TABLE subscriptions
      ADD CONSTRAINT subscriptions_provider_check
      CHECK (provider IN ('stripe', 'asaas'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_provider ON subscriptions(provider);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_subscription_id
  ON subscriptions(provider, provider_subscription_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_provider_subscription_id
  ON subscriptions(provider, provider_subscription_id)
  WHERE provider_subscription_id IS NOT NULL;

ALTER TABLE IF EXISTS payment_history
    ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'stripe',
    ADD COLUMN IF NOT EXISTS provider_customer_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS provider_invoice_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS provider_payment_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS provider_charge_id VARCHAR(255);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'payment_history_provider_check'
  ) THEN
    ALTER TABLE payment_history
      ADD CONSTRAINT payment_history_provider_check
      CHECK (provider IN ('stripe', 'asaas'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payment_history_provider ON payment_history(provider);

CREATE TABLE IF NOT EXISTS payment_provider_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL UNIQUE REFERENCES barbershops(id) ON DELETE CASCADE,
    subscription_provider VARCHAR(20) NOT NULL DEFAULT 'stripe',
    booking_provider VARCHAR(20) NOT NULL DEFAULT 'stripe',
    fallback_provider VARCHAR(20) NOT NULL DEFAULT 'stripe',
    rollout_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT payment_provider_configs_subscription_provider_check CHECK (subscription_provider IN ('stripe', 'asaas')),
    CONSTRAINT payment_provider_configs_booking_provider_check CHECK (booking_provider IN ('stripe', 'asaas')),
    CONSTRAINT payment_provider_configs_fallback_provider_check CHECK (fallback_provider IN ('stripe', 'asaas'))
);

CREATE INDEX IF NOT EXISTS idx_payment_provider_configs_barbershop
  ON payment_provider_configs(barbershop_id);

CREATE TABLE IF NOT EXISTS payment_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    provider VARCHAR(20) NOT NULL,
    provider_customer_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT payment_customers_provider_check CHECK (provider IN ('stripe', 'asaas')),
    CONSTRAINT payment_customers_provider_customer_unique UNIQUE(provider, provider_customer_id),
    CONSTRAINT payment_customers_barbershop_provider_unique UNIQUE(barbershop_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_payment_customers_barbershop_provider
  ON payment_customers(barbershop_id, provider);

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(20) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'received',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT webhook_events_provider_check CHECK (provider IN ('stripe', 'asaas')),
    CONSTRAINT webhook_events_status_check CHECK (status IN ('received', 'processed', 'failed')),
    CONSTRAINT webhook_events_provider_event_unique UNIQUE(provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_status
  ON webhook_events(provider, status, created_at DESC);

ALTER TABLE IF EXISTS payment_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_provider_configs_select_own" ON payment_provider_configs;
CREATE POLICY "payment_provider_configs_select_own"
    ON payment_provider_configs FOR SELECT
    USING (
      barbershop_id IN (SELECT barbershop_id FROM users WHERE id = auth.uid()) OR
      is_platform_admin()
    );

DROP POLICY IF EXISTS "payment_provider_configs_modify_admin" ON payment_provider_configs;
CREATE POLICY "payment_provider_configs_modify_admin"
    ON payment_provider_configs FOR ALL
    USING (
      barbershop_id IN (
        SELECT barbershop_id
        FROM users
        WHERE id = auth.uid() AND role = 'admin'
      ) OR is_platform_admin()
    )
    WITH CHECK (
      barbershop_id IN (
        SELECT barbershop_id
        FROM users
        WHERE id = auth.uid() AND role = 'admin'
      ) OR is_platform_admin()
    );

DROP POLICY IF EXISTS "payment_customers_select_own" ON payment_customers;
CREATE POLICY "payment_customers_select_own"
    ON payment_customers FOR SELECT
    USING (
      barbershop_id IN (SELECT barbershop_id FROM users WHERE id = auth.uid()) OR
      is_platform_admin()
    );

DROP POLICY IF EXISTS "webhook_events_platform_admin_only" ON webhook_events;
CREATE POLICY "webhook_events_platform_admin_only"
    ON webhook_events FOR SELECT
    USING (is_platform_admin());
