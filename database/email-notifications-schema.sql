-- =====================================================
-- EMAIL NOTIFICATIONS SCHEMA
-- =====================================================
-- This schema manages email templates and notification logs
-- for the Shafar platform
--
-- Tables:
-- 1. email_templates - HTML templates for different email types
-- 2. email_logs - History of all emails sent
--
-- Created: 2025-12-30
-- Version: 1.0
-- =====================================================

-- =====================================================
-- 1. EMAIL TEMPLATES TABLE
-- =====================================================
-- Stores reusable email templates with variable substitution

CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Template identification
    template_key VARCHAR(100) NOT NULL UNIQUE, -- 'appointment_confirmation', 'appointment_reminder', etc.
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Email content
    subject VARCHAR(500) NOT NULL, -- Can contain {{variables}}
    html_body TEXT NOT NULL, -- HTML template with {{variables}}
    text_body TEXT, -- Plain text fallback

    -- Template variables (for documentation)
    variables JSONB DEFAULT '[]'::jsonb, -- ['client_name', 'appointment_date', etc.]

    -- Metadata
    category VARCHAR(50), -- 'appointment', 'auth', 'payment', 'system'
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);

-- =====================================================
-- 2. EMAIL LOGS TABLE
-- =====================================================
-- Logs all emails sent (for debugging and compliance)

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Recipients
    to_email VARCHAR(255) NOT NULL,
    to_name VARCHAR(255),
    from_email VARCHAR(255) NOT NULL DEFAULT 'noreply@shafar.com.br',
    from_name VARCHAR(255) DEFAULT 'Shafar',

    -- Email content
    subject VARCHAR(500) NOT NULL,
    template_key VARCHAR(100), -- Reference to email_templates
    template_variables JSONB, -- Variables used in this email

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'bounced'
    provider VARCHAR(50), -- 'resend', 'sendgrid', 'smtp'
    provider_message_id VARCHAR(255), -- External provider's message ID

    -- Error handling
    error_code VARCHAR(100),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- References (optional)
    barbershop_id UUID REFERENCES barbershops(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_barbershop ON email_logs(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_key);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3.1. EMAIL TEMPLATES POLICIES
-- =====================================================

-- Anyone can view active templates (for testing/preview)
DROP POLICY IF EXISTS "email_templates_select_active" ON email_templates;
CREATE POLICY "email_templates_select_active"
    ON email_templates FOR SELECT
    USING (is_active = TRUE OR is_platform_admin());

-- Only platform admins can modify templates
DROP POLICY IF EXISTS "email_templates_modify_admin" ON email_templates;
CREATE POLICY "email_templates_modify_admin"
    ON email_templates FOR ALL
    USING (is_platform_admin())
    WITH CHECK (is_platform_admin());

-- =====================================================
-- 3.2. EMAIL LOGS POLICIES
-- =====================================================

-- Users can only see logs for their barbershop
DROP POLICY IF EXISTS "email_logs_select_own_barbershop" ON email_logs;
CREATE POLICY "email_logs_select_own_barbershop"
    ON email_logs FOR SELECT
    USING (
        barbershop_id IN (
            SELECT barbershop_id FROM users WHERE id = auth.uid()
        ) OR
        is_platform_admin()
    );

-- Only system/platform admins can insert logs (via Edge Functions)
DROP POLICY IF EXISTS "email_logs_insert_system" ON email_logs;
CREATE POLICY "email_logs_insert_system"
    ON email_logs FOR INSERT
    WITH CHECK (is_platform_admin());

-- No one can delete logs (audit trail)
DROP POLICY IF EXISTS "email_logs_delete_none" ON email_logs;
CREATE POLICY "email_logs_delete_none"
    ON email_logs FOR DELETE
    USING (FALSE);

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- =====================================================
-- 4.1. Get email template by key
-- =====================================================

CREATE OR REPLACE FUNCTION get_email_template(p_template_key VARCHAR(100))
RETURNS TABLE (
    subject VARCHAR(500),
    html_body TEXT,
    text_body TEXT,
    variables JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.subject,
        t.html_body,
        t.text_body,
        t.variables
    FROM email_templates t
    WHERE t.template_key = p_template_key
      AND t.is_active = TRUE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4.2. Log email sent
-- =====================================================

CREATE OR REPLACE FUNCTION log_email_sent(
    p_to_email VARCHAR(255),
    p_subject VARCHAR(500),
    p_template_key VARCHAR(100) DEFAULT NULL,
    p_template_variables JSONB DEFAULT NULL,
    p_barbershop_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_appointment_id UUID DEFAULT NULL,
    p_provider VARCHAR(50) DEFAULT 'resend',
    p_provider_message_id VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO email_logs (
        to_email,
        subject,
        template_key,
        template_variables,
        barbershop_id,
        user_id,
        appointment_id,
        provider,
        provider_message_id,
        status,
        sent_at
    ) VALUES (
        p_to_email,
        p_subject,
        p_template_key,
        p_template_variables,
        p_barbershop_id,
        p_user_id,
        p_appointment_id,
        p_provider,
        p_provider_message_id,
        'sent',
        NOW()
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4.3. Log email failed
-- =====================================================

CREATE OR REPLACE FUNCTION log_email_failed(
    p_to_email VARCHAR(255),
    p_subject VARCHAR(500),
    p_error_message TEXT,
    p_template_key VARCHAR(100) DEFAULT NULL,
    p_barbershop_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO email_logs (
        to_email,
        subject,
        template_key,
        barbershop_id,
        user_id,
        status,
        error_message,
        failed_at
    ) VALUES (
        p_to_email,
        p_subject,
        p_template_key,
        p_barbershop_id,
        p_user_id,
        'failed',
        p_error_message,
        NOW()
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. SEED DATA - Default Email Templates
-- =====================================================

-- Template: Confirmação de Agendamento
INSERT INTO email_templates (template_key, name, description, subject, html_body, text_body, variables, category)
VALUES (
    'appointment_confirmation',
    'Confirmação de Agendamento',
    'Enviado quando um cliente faz um agendamento',
    'Agendamento Confirmado - {{barbershop_name}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">✅ Agendamento Confirmado!</h1>
    </div>

    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Olá <strong>{{client_name}}</strong>,</p>

        <p>Seu agendamento foi confirmado com sucesso!</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #667eea; margin-top: 0;">📋 Detalhes do Agendamento</h2>
            <p><strong>Barbearia:</strong> {{barbershop_name}}</p>
            <p><strong>Serviço:</strong> {{service_name}}</p>
            <p><strong>Profissional:</strong> {{professional_name}}</p>
            <p><strong>Data:</strong> {{appointment_date}}</p>
            <p><strong>Horário:</strong> {{appointment_time}}</p>
            <p><strong>Duração:</strong> {{service_duration}} minutos</p>
            <p><strong>Valor:</strong> {{service_price}}</p>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0;"><strong>⏰ Lembrete:</strong> Chegue com 5 minutos de antecedência.</p>
        </div>

        <p>Se precisar cancelar ou remarcar, entre em contato com a barbearia.</p>

        <div style="text-align: center; margin-top: 30px;">
            <a href="{{barbershop_url}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Detalhes</a>
        </div>
    </div>

    <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>{{barbershop_name}}<br>
        {{barbershop_address}}<br>
        {{barbershop_phone}}</p>
        <p style="margin-top: 20px;">© 2025 Shafar. Todos os direitos reservados.</p>
    </div>
</body>
</html>',
    'Olá {{client_name}},

Seu agendamento foi confirmado!

Detalhes:
- Barbearia: {{barbershop_name}}
- Serviço: {{service_name}}
- Profissional: {{professional_name}}
- Data: {{appointment_date}}
- Horário: {{appointment_time}}
- Valor: {{service_price}}

Chegue com 5 minutos de antecedência.

Atenciosamente,
{{barbershop_name}}',
    '["client_name", "barbershop_name", "service_name", "professional_name", "appointment_date", "appointment_time", "service_duration", "service_price", "barbershop_url", "barbershop_address", "barbershop_phone"]'::jsonb,
    'appointment'
)
ON CONFLICT (template_key) DO NOTHING;

-- Template: Lembrete de Agendamento (24h antes)
INSERT INTO email_templates (template_key, name, description, subject, html_body, text_body, variables, category)
VALUES (
    'appointment_reminder',
    'Lembrete de Agendamento',
    'Enviado 24 horas antes do agendamento',
    '⏰ Lembrete: Seu agendamento é amanhã - {{barbershop_name}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #667eea; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">⏰ Lembrete de Agendamento</h1>
    </div>

    <div style="background: #f8f9fa; padding: 30px;">
        <p>Olá <strong>{{client_name}}</strong>,</p>

        <p style="font-size: 18px; color: #667eea;"><strong>Seu agendamento é amanhã!</strong></p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Data:</strong> {{appointment_date}}</p>
            <p><strong>🕐 Horário:</strong> {{appointment_time}}</p>
            <p><strong>💈 Serviço:</strong> {{service_name}}</p>
            <p><strong>👨‍💼 Profissional:</strong> {{professional_name}}</p>
        </div>

        <p>Estamos te esperando!</p>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">Precisa cancelar ou remarcar? Entre em contato: {{barbershop_phone}}</p>
    </div>

    <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>{{barbershop_name}} - {{barbershop_address}}</p>
    </div>
</body>
</html>',
    'Olá {{client_name}},

Lembrete: Seu agendamento é amanhã!

Data: {{appointment_date}}
Horário: {{appointment_time}}
Serviço: {{service_name}}
Profissional: {{professional_name}}

Te esperamos!
{{barbershop_name}}',
    '["client_name", "barbershop_name", "appointment_date", "appointment_time", "service_name", "professional_name", "barbershop_phone", "barbershop_address"]'::jsonb,
    'appointment'
)
ON CONFLICT (template_key) DO NOTHING;

-- Template: Pagamento Confirmado
INSERT INTO email_templates (template_key, name, description, subject, html_body, text_body, variables, category)
VALUES (
    'payment_confirmed',
    'Pagamento Confirmado',
    'Enviado quando um pagamento é confirmado',
    '✅ Pagamento Confirmado - {{barbershop_name}}',
    '<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #4CAF50; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">✅ Pagamento Confirmado</h1>
    </div>

    <div style="background: #f8f9fa; padding: 30px;">
        <p>Olá <strong>{{customer_name}}</strong>,</p>

        <p>Recebemos seu pagamento com sucesso!</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #4CAF50; margin-top: 0;">Detalhes do Pagamento</h3>
            <p><strong>Plano:</strong> {{plan_name}}</p>
            <p><strong>Valor:</strong> {{amount}}</p>
            <p><strong>Data:</strong> {{payment_date}}</p>
            <p><strong>Próximo pagamento:</strong> {{next_payment_date}}</p>
        </div>

        <p>Obrigado por escolher o Shafar!</p>

        <div style="text-align: center; margin-top: 30px;">
            <a href="{{dashboard_url}}" style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Acessar Dashboard</a>
        </div>
    </div>

    <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>© 2025 Shafar. Todos os direitos reservados.</p>
    </div>
</body>
</html>',
    'Pagamento confirmado!

Plano: {{plan_name}}
Valor: {{amount}}
Próximo pagamento: {{next_payment_date}}

Obrigado por escolher o Shafar!',
    '["customer_name", "plan_name", "amount", "payment_date", "next_payment_date", "dashboard_url"]'::jsonb,
    'payment'
)
ON CONFLICT (template_key) DO NOTHING;

-- =====================================================
-- 7. COMMENTS
-- =====================================================

COMMENT ON TABLE email_templates IS 'Reusable email templates with variable substitution';
COMMENT ON TABLE email_logs IS 'Audit trail of all emails sent by the system';

COMMENT ON FUNCTION get_email_template(VARCHAR) IS 'Retrieves an active email template by key';
COMMENT ON FUNCTION log_email_sent IS 'Logs a successfully sent email';
COMMENT ON FUNCTION log_email_failed IS 'Logs a failed email attempt';

-- =====================================================
-- 8. VERIFICATION
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    template_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('email_templates', 'email_logs');

    IF table_count = 2 THEN
        RAISE NOTICE '✅ All 2 email tables created successfully!';
    ELSE
        RAISE WARNING '⚠️  Only % of 2 tables created', table_count;
    END IF;

    SELECT COUNT(*) INTO template_count FROM email_templates;

    IF template_count >= 3 THEN
        RAISE NOTICE '✅ % email templates created', template_count;
    ELSE
        RAISE WARNING '⚠️  Only % email templates created', template_count;
    END IF;
END $$;

RAISE NOTICE '✅ Email notifications schema installation complete!';
