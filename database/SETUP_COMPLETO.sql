-- =====================================================
-- Shafar - SETUP COMPLETO DO BANCO DE DADOS
-- =====================================================
-- Este arquivo consolida TUDO que precisa ser executado
-- Execute APENAS ESTE ARQUIVO no Supabase SQL Editor
--
-- Inclui:
-- 1. RLS Policies (segurança)
-- 2. Consent Logs (LGPD)
-- 3. Subscriptions (Stripe)
-- 4. Email Notifications (Resend)
--
-- Versão: 1.0
-- Data: 30 de dezembro de 2025
-- =====================================================

-- =====================================================
-- PARTE 1: LIMPAR TODAS AS POLICIES ANTIGAS
-- =====================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop todas as policies em barbershops
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'barbershops') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON barbershops';
    END LOOP;

    -- Drop todas as policies em users
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON users';
    END LOOP;

    -- Drop todas as policies em services
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'services') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON services';
    END LOOP;

    -- Drop todas as policies em clients
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'clients') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON clients';
    END LOOP;

    -- Drop todas as policies em appointments
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON appointments';
    END LOOP;

    -- Drop todas as policies em plans (se a tabela existir)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'plans') THEN
        FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'plans') LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON plans';
        END LOOP;
    END IF;

    -- Drop todas as policies em subscriptions (se a tabela existir)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
        FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscriptions') LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON subscriptions';
        END LOOP;
    END IF;
END $$;

-- =====================================================
-- PARTE 2: HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS nas tabelas que podem ainda não existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'plans') THEN
        ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
        ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =====================================================
-- PARTE 3: FUNÇÕES AUXILIARES
-- =====================================================

CREATE OR REPLACE FUNCTION is_barbershop_admin(barbershop_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE barbershop_id = barbershop_uuid
    AND id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_barbershop_member(barbershop_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE barbershop_id = barbershop_uuid
    AND id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'platform_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_barbershop_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT barbershop_id FROM users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PARTE 4: POLÍTICAS RLS - BARBERSHOPS
-- =====================================================

CREATE POLICY "barbershops_select_public"
  ON barbershops FOR SELECT
  USING (true);

CREATE POLICY "barbershops_insert_public"
  ON barbershops FOR INSERT
  WITH CHECK (auth.uid() IS NULL OR is_platform_admin());

CREATE POLICY "barbershops_update_admin"
  ON barbershops FOR UPDATE
  USING (is_barbershop_admin(id) OR is_platform_admin())
  WITH CHECK (is_barbershop_admin(id) OR is_platform_admin());

CREATE POLICY "barbershops_delete_platform_admin"
  ON barbershops FOR DELETE
  USING (is_platform_admin());

-- =====================================================
-- PARTE 5: POLÍTICAS RLS - USERS
-- =====================================================

CREATE POLICY "users_select_same_barbershop"
  ON users FOR SELECT
  USING (
    id = auth.uid() OR
    barbershop_id = current_user_barbershop_id() OR
    is_platform_admin()
  );

CREATE POLICY "users_insert_registration_or_admin"
  ON users FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL OR
    is_barbershop_admin(barbershop_id) OR
    is_platform_admin()
  );

CREATE POLICY "users_update_self_or_admin"
  ON users FOR UPDATE
  USING (
    id = auth.uid() OR
    is_barbershop_admin(barbershop_id) OR
    is_platform_admin()
  )
  WITH CHECK (
    id = auth.uid() OR
    is_barbershop_admin(barbershop_id) OR
    is_platform_admin()
  );

CREATE POLICY "users_delete_admin"
  ON users FOR DELETE
  USING (
    is_barbershop_admin(barbershop_id) OR
    is_platform_admin()
  );

-- =====================================================
-- PARTE 6: POLÍTICAS RLS - SERVICES
-- =====================================================

CREATE POLICY "services_select_public"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "services_insert_barbershop_member"
  ON services FOR INSERT
  WITH CHECK (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

CREATE POLICY "services_update_barbershop_member"
  ON services FOR UPDATE
  USING (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  )
  WITH CHECK (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

CREATE POLICY "services_delete_admin"
  ON services FOR DELETE
  USING (
    is_barbershop_admin(barbershop_id) OR
    is_platform_admin()
  );

-- =====================================================
-- PARTE 7: POLÍTICAS RLS - CLIENTS
-- =====================================================

CREATE POLICY "clients_select_barbershop_member"
  ON clients FOR SELECT
  USING (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

CREATE POLICY "clients_insert_barbershop_or_public"
  ON clients FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL OR
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

CREATE POLICY "clients_update_barbershop_member"
  ON clients FOR UPDATE
  USING (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  )
  WITH CHECK (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

CREATE POLICY "clients_delete_admin"
  ON clients FOR DELETE
  USING (
    is_barbershop_admin(barbershop_id) OR
    is_platform_admin()
  );

-- =====================================================
-- PARTE 8: POLÍTICAS RLS - APPOINTMENTS
-- =====================================================

CREATE POLICY "appointments_select_barbershop_member"
  ON appointments FOR SELECT
  USING (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

CREATE POLICY "appointments_insert_barbershop_or_public"
  ON appointments FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL OR
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

CREATE POLICY "appointments_update_barbershop_member"
  ON appointments FOR UPDATE
  USING (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  )
  WITH CHECK (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

CREATE POLICY "appointments_delete_admin"
  ON appointments FOR DELETE
  USING (
    is_barbershop_admin(barbershop_id) OR
    is_platform_admin()
  );

-- =====================================================
-- PARTE 9: TRIGGER DE PROTEÇÃO
-- =====================================================

CREATE OR REPLACE FUNCTION prevent_unauthorized_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF is_platform_admin() THEN
    RETURN NEW;
  END IF;

  IF is_barbershop_admin(OLD.barbershop_id) THEN
    RETURN NEW;
  END IF;

  IF OLD.id = auth.uid() THEN
    IF OLD.role != NEW.role THEN
      RAISE EXCEPTION 'Apenas administradores podem alterar roles de usuários';
    END IF;

    IF OLD.barbershop_id != NEW.barbershop_id THEN
      RAISE EXCEPTION 'Apenas administradores podem transferir usuários entre barbearias';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_user_changes ON users;
CREATE TRIGGER protect_user_changes
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_unauthorized_user_changes();

-- =====================================================
-- PARTE 10: CONSENT LOGS (LGPD)
-- =====================================================

CREATE TABLE IF NOT EXISTS consent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL,
    consent_version VARCHAR(20) NOT NULL,
    consent_action VARCHAR(20) NOT NULL DEFAULT 'accepted',
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    consented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revocation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_logs_user ON consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_type ON consent_logs(consent_type);

ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consent_logs_select_own" ON consent_logs;
CREATE POLICY "consent_logs_select_own"
    ON consent_logs FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "consent_logs_insert_own" ON consent_logs;
CREATE POLICY "consent_logs_insert_own"
    ON consent_logs FOR INSERT
    WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE OR REPLACE FUNCTION register_consent(
    p_user_id UUID,
    p_consent_type VARCHAR(50),
    p_consent_version VARCHAR(20),
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_device_info JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_consent_id UUID;
BEGIN
    INSERT INTO consent_logs (
        user_id,
        consent_type,
        consent_version,
        consent_action,
        ip_address,
        user_agent,
        device_info
    ) VALUES (
        p_user_id,
        p_consent_type,
        p_consent_version,
        'accepted',
        p_ip_address,
        p_user_agent,
        p_device_info
    )
    RETURNING id INTO v_consent_id;

    RETURN v_consent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PARTE 11: SUBSCRIPTIONS (STRIPE)
-- =====================================================

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'BRL',
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    stripe_product_id VARCHAR(255),
    max_professionals INTEGER DEFAULT 1,
    max_services INTEGER DEFAULT 10,
    max_monthly_appointments INTEGER,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON subscription_plans(slug);

-- Stripe Customers
CREATE TABLE IF NOT EXISTS stripe_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    name VARCHAR(255),
    default_payment_method_id VARCHAR(255),
    payment_method_type VARCHAR(50),
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_barbershop_stripe UNIQUE(barbershop_id)
);

CREATE INDEX IF NOT EXISTS idx_stripe_customers_barbershop ON stripe_customers(barbershop_id);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    stripe_customer_id UUID NOT NULL REFERENCES stripe_customers(id) ON DELETE RESTRICT,
    stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_price_id VARCHAR(255),
    billing_cycle VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL DEFAULT 'incomplete',
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    canceled_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_barbershop ON subscriptions(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Payment History
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    stripe_customer_id UUID REFERENCES stripe_customers(id) ON DELETE SET NULL,
    stripe_invoice_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL,
    payment_method_type VARCHAR(50),
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),
    payment_date TIMESTAMP WITH TIME ZONE,
    failure_code VARCHAR(100),
    failure_message TEXT,
    invoice_url TEXT,
    invoice_pdf TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_barbershop ON payment_history(barbershop_id);

-- RLS Policies para Subscriptions
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscription_plans_select_all" ON subscription_plans;
CREATE POLICY "subscription_plans_select_all"
    ON subscription_plans FOR SELECT
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "subscription_plans_modify_admin" ON subscription_plans;
CREATE POLICY "subscription_plans_modify_admin"
    ON subscription_plans FOR ALL
    USING (is_platform_admin())
    WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS "stripe_customers_select_own" ON stripe_customers;
CREATE POLICY "stripe_customers_select_own"
    ON stripe_customers FOR SELECT
    USING (barbershop_id IN (SELECT barbershop_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
CREATE POLICY "subscriptions_select_own"
    ON subscriptions FOR SELECT
    USING (barbershop_id IN (SELECT barbershop_id FROM users WHERE id = auth.uid()) OR is_platform_admin());

DROP POLICY IF EXISTS "payment_history_select_own" ON payment_history;
CREATE POLICY "payment_history_select_own"
    ON payment_history FOR SELECT
    USING (barbershop_id IN (SELECT barbershop_id FROM users WHERE id = auth.uid()));

-- Seed Data: Planos
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, max_professionals, max_services, max_monthly_appointments, features, is_featured, sort_order)
VALUES
    ('Básico', 'basic', 'Ideal para barbearias iniciantes', 49.90, 539.00, 2, 10, 100, '["Até 2 profissionais", "Até 10 serviços", "100 agendamentos/mês", "Agendamento online", "Notificações WhatsApp", "Relatórios básicos"]'::jsonb, FALSE, 1),
    ('Profissional', 'professional', 'Para barbearias em crescimento', 99.90, 1079.00, 5, 30, 500, '["Até 5 profissionais", "Até 30 serviços", "500 agendamentos/mês", "Agendamento online", "Notificações WhatsApp", "Relatórios avançados", "Múltiplas unidades", "Suporte prioritário"]'::jsonb, TRUE, 2),
    ('Premium', 'premium', 'Solução completa para redes de barbearias', 199.90, 2159.00, NULL, NULL, NULL, '["Profissionais ilimitados", "Serviços ilimitados", "Agendamentos ilimitados", "Agendamento online", "Notificações WhatsApp", "Relatórios completos", "Múltiplas unidades", "API de integração", "Suporte VIP 24/7", "Consultoria personalizada"]'::jsonb, FALSE, 3)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- PARTE 12: EMAIL NOTIFICATIONS
-- =====================================================

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(500) NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(template_key);

-- Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_email VARCHAR(255) NOT NULL,
    to_name VARCHAR(255),
    from_email VARCHAR(255) NOT NULL DEFAULT 'noreply@shafar.com.br',
    from_name VARCHAR(255) DEFAULT 'Shafar',
    subject VARCHAR(500) NOT NULL,
    template_key VARCHAR(100),
    template_variables JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    provider VARCHAR(50),
    provider_message_id VARCHAR(255),
    error_code VARCHAR(100),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    barbershop_id UUID REFERENCES barbershops(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- RLS Policies para Emails
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_templates_select_active" ON email_templates;
CREATE POLICY "email_templates_select_active"
    ON email_templates FOR SELECT
    USING (is_active = TRUE OR is_platform_admin());

DROP POLICY IF EXISTS "email_logs_select_own" ON email_logs;
CREATE POLICY "email_logs_select_own"
    ON email_logs FOR SELECT
    USING (
        barbershop_id IN (SELECT barbershop_id FROM users WHERE id = auth.uid()) OR
        is_platform_admin()
    );

-- Seed Data: Templates de Email
INSERT INTO email_templates (template_key, name, description, subject, html_body, text_body, variables, category)
VALUES
    ('appointment_confirmation', 'Confirmação de Agendamento', 'Enviado quando um cliente faz um agendamento',
     'Agendamento Confirmado - {{barbershop_name}}',
     '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif"><h1>Agendamento Confirmado!</h1><p>Olá {{client_name}}, seu agendamento foi confirmado!</p><p><strong>Data:</strong> {{appointment_date}}<br><strong>Horário:</strong> {{appointment_time}}<br><strong>Serviço:</strong> {{service_name}}<br><strong>Profissional:</strong> {{professional_name}}</p></body></html>',
     'Olá {{client_name}}, seu agendamento foi confirmado! Data: {{appointment_date}}, Horário: {{appointment_time}}',
     '["client_name", "barbershop_name", "service_name", "professional_name", "appointment_date", "appointment_time"]'::jsonb,
     'appointment'),
    ('appointment_reminder', 'Lembrete de Agendamento', 'Enviado 24 horas antes do agendamento',
     'Lembrete: Seu agendamento é amanhã - {{barbershop_name}}',
     '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif"><h1>Lembrete de Agendamento</h1><p>Olá {{client_name}}, seu agendamento é amanhã!</p><p><strong>Data:</strong> {{appointment_date}}<br><strong>Horário:</strong> {{appointment_time}}</p></body></html>',
     'Olá {{client_name}}, lembrete: seu agendamento é amanhã às {{appointment_time}}',
     '["client_name", "barbershop_name", "appointment_date", "appointment_time"]'::jsonb,
     'appointment'),
    ('payment_confirmed', 'Pagamento Confirmado', 'Enviado quando um pagamento é confirmado',
     'Pagamento Confirmado - {{barbershop_name}}',
     '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif"><h1>Pagamento Confirmado</h1><p>Olá {{customer_name}}, recebemos seu pagamento!</p><p><strong>Plano:</strong> {{plan_name}}<br><strong>Valor:</strong> {{amount}}</p></body></html>',
     'Pagamento confirmado! Plano: {{plan_name}}, Valor: {{amount}}',
     '["customer_name", "plan_name", "amount"]'::jsonb,
     'payment')
ON CONFLICT (template_key) DO NOTHING;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
    policy_count INTEGER;
    table_count INTEGER;
BEGIN
    -- Contar policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('barbershops', 'users', 'services', 'clients', 'appointments', 'subscription_plans', 'subscriptions');

    -- Contar tabelas novas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('consent_logs', 'subscription_plans', 'stripe_customers', 'subscriptions', 'payment_history', 'email_templates', 'email_logs');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  SETUP COMPLETO - Shafar';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ % RLS policies criadas', policy_count;
    RAISE NOTICE '✅ % tabelas novas criadas', table_count;
    RAISE NOTICE '✅ 4 funções auxiliares criadas';
    RAISE NOTICE '✅ 3 planos de assinatura inseridos';
    RAISE NOTICE '✅ 3 templates de email inseridos';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '1. Configurar Secrets no Supabase (RESEND_API_KEY, STRIPE_SECRET_KEY)';
    RAISE NOTICE '2. Criar produtos no Stripe Dashboard';
    RAISE NOTICE '3. Atualizar Price IDs no banco';
    RAISE NOTICE '4. Deploy das Edge Functions';
    RAISE NOTICE '5. Testar localmente (npm run dev)';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
