-- ============================================
-- CONSENT LOGS SCHEMA (LGPD)
-- ============================================
-- Tabela para registrar todos os consentimentos LGPD
-- Usado para comprovar que usuário consentiu com Termos e Política
-- ============================================

-- Criar tabela de logs de consentimento
CREATE TABLE IF NOT EXISTS consent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL, -- 'terms', 'privacy', 'cookies', 'marketing'
    consent_version VARCHAR(20) NOT NULL, -- Ex: '1.0', '2.0'
    consent_action VARCHAR(20) NOT NULL DEFAULT 'accepted', -- 'accepted', 'rejected', 'revoked'
    ip_address INET, -- Endereço IP do usuário (se disponível)
    user_agent TEXT, -- Browser/device info
    device_info JSONB, -- Informações adicionais do dispositivo
    consented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revocation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id ON consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_type ON consent_logs(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_logs_consented_at ON consent_logs(consented_at);
CREATE INDEX IF NOT EXISTS idx_consent_logs_action ON consent_logs(consent_action);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios logs de consentimento
CREATE POLICY "consent_logs_select_own"
    ON consent_logs FOR SELECT
    USING (user_id = auth.uid());

-- Permitir inserção para sistema (quando usuário aceita termos)
CREATE POLICY "consent_logs_insert_system"
    ON consent_logs FOR INSERT
    WITH CHECK (
        -- Permitir se está inserindo próprio log
        user_id = auth.uid() OR
        -- Ou se auth.uid() é NULL (durante registro inicial)
        auth.uid() IS NULL
    );

-- Platform admins podem ver todos os logs (para auditoria)
CREATE POLICY "consent_logs_select_platform_admin"
    ON consent_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'platform_admin'
        )
    );

-- Platform admins podem atualizar logs (para marcar revogação)
CREATE POLICY "consent_logs_update_platform_admin"
    ON consent_logs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'platform_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'platform_admin'
        )
    );

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para registrar consentimento
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

-- Função para revogar consentimento
CREATE OR REPLACE FUNCTION revoke_consent(
    p_user_id UUID,
    p_consent_type VARCHAR(50),
    p_revocation_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_latest_consent consent_logs%ROWTYPE;
BEGIN
    -- Buscar consentimento mais recente deste tipo
    SELECT * INTO v_latest_consent
    FROM consent_logs
    WHERE user_id = p_user_id
      AND consent_type = p_consent_type
      AND consent_action = 'accepted'
    ORDER BY consented_at DESC
    LIMIT 1;

    -- Se não encontrou, retornar false
    IF v_latest_consent.id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Marcar como revogado
    UPDATE consent_logs
    SET revoked_at = NOW(),
        revocation_reason = p_revocation_reason
    WHERE id = v_latest_consent.id;

    -- Criar novo registro de revogação
    INSERT INTO consent_logs (
        user_id,
        consent_type,
        consent_version,
        consent_action,
        revoked_at,
        revocation_reason
    ) VALUES (
        p_user_id,
        p_consent_type,
        v_latest_consent.consent_version,
        'revoked',
        NOW(),
        p_revocation_reason
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário tem consentimento ativo
CREATE OR REPLACE FUNCTION has_active_consent(
    p_user_id UUID,
    p_consent_type VARCHAR(50),
    p_consent_version VARCHAR(20) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_consent BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM consent_logs
        WHERE user_id = p_user_id
          AND consent_type = p_consent_type
          AND consent_action = 'accepted'
          AND revoked_at IS NULL
          AND (p_consent_version IS NULL OR consent_version = p_consent_version)
    ) INTO v_has_consent;

    RETURN v_has_consent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE consent_logs IS
    'Registra todos os consentimentos LGPD dos usuários (termos, privacidade, cookies, etc.)';

COMMENT ON COLUMN consent_logs.user_id IS
    'UUID do usuário que consentiu';

COMMENT ON COLUMN consent_logs.consent_type IS
    'Tipo de consentimento: terms, privacy, cookies, marketing';

COMMENT ON COLUMN consent_logs.consent_version IS
    'Versão do documento que foi aceito (ex: 1.0, 2.0)';

COMMENT ON COLUMN consent_logs.consent_action IS
    'Ação: accepted (aceitou), rejected (rejeitou), revoked (revogou)';

COMMENT ON COLUMN consent_logs.ip_address IS
    'Endereço IP do usuário no momento do consentimento (evidência)';

COMMENT ON COLUMN consent_logs.user_agent IS
    'Browser e dispositivo usado (User-Agent string)';

COMMENT ON COLUMN consent_logs.device_info IS
    'Informações adicionais do dispositivo em formato JSON';

COMMENT ON COLUMN consent_logs.consented_at IS
    'Data e hora em que o consentimento foi dado';

COMMENT ON COLUMN consent_logs.revoked_at IS
    'Data e hora em que o consentimento foi revogado (se aplicável)';

COMMENT ON COLUMN consent_logs.revocation_reason IS
    'Motivo da revogação do consentimento';

COMMENT ON FUNCTION register_consent(UUID, VARCHAR, VARCHAR, INET, TEXT, JSONB) IS
    'Registra um novo consentimento do usuário';

COMMENT ON FUNCTION revoke_consent(UUID, VARCHAR, TEXT) IS
    'Revoga um consentimento previamente dado';

COMMENT ON FUNCTION has_active_consent(UUID, VARCHAR, VARCHAR) IS
    'Verifica se usuário tem consentimento ativo para determinado tipo';

-- ============================================
-- EXEMPLO DE USO
-- ============================================

/*
-- Registrar consentimento de termos
SELECT register_consent(
    'user-uuid-here'::UUID,
    'terms',
    '1.0',
    '192.168.1.1'::INET,
    'Mozilla/5.0...',
    '{"platform": "web", "screen": "1920x1080"}'::JSONB
);

-- Registrar consentimento de privacidade
SELECT register_consent(
    'user-uuid-here'::UUID,
    'privacy',
    '1.0'
);

-- Verificar se tem consentimento ativo
SELECT has_active_consent('user-uuid-here'::UUID, 'terms');

-- Revogar consentimento
SELECT revoke_consent(
    'user-uuid-here'::UUID,
    'marketing',
    'Não quero mais receber e-mails promocionais'
);

-- Buscar todos os consentimentos de um usuário
SELECT *
FROM consent_logs
WHERE user_id = 'user-uuid-here'::UUID
ORDER BY consented_at DESC;
*/

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

SELECT
    'consent_logs table created successfully!' as status,
    (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'consent_logs') as total_indexes,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'consent_logs') as total_policies,
    (SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%consent%') as helper_functions;

-- ============================================
-- SCRIPT CONCLUÍDO
-- ============================================
-- Tabela de logs de consentimento criada com sucesso!
-- Execute este script no SQL Editor do Supabase
-- ============================================
