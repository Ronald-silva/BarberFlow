import { supabase } from './supabase';

/**
 * Tipos de consentimento LGPD
 */
export type ConsentType = 'terms' | 'privacy' | 'cookies' | 'marketing';

/**
 * Ação de consentimento
 */
export type ConsentAction = 'accepted' | 'rejected' | 'revoked';

/**
 * Versões dos documentos legais
 * IMPORTANTE: Atualizar quando houver mudanças nos documentos
 */
export const DOCUMENT_VERSIONS = {
  terms: '1.0',
  privacy: '1.0',
  cookies: '1.0',
  marketing: '1.0',
};

/**
 * Interface para log de consentimento
 */
interface ConsentLog {
  userId: string;
  consentType: ConsentType;
  consentVersion?: string;
  consentAction?: ConsentAction;
}

/**
 * Obtém informações do dispositivo do usuário
 */
function getDeviceInfo() {
  return {
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    maxTouchPoints: navigator.maxTouchPoints,
    hardwareConcurrency: navigator.hardwareConcurrency,
  };
}

/**
 * Registra um consentimento no banco de dados
 *
 * @param params - Parâmetros do consentimento
 * @returns ID do registro criado ou null em caso de erro
 */
export async function logConsent({
  userId,
  consentType,
  consentVersion,
  consentAction = 'accepted',
}: ConsentLog): Promise<string | null> {
  try {
    // Usar versão padrão se não fornecida
    const version = consentVersion || DOCUMENT_VERSIONS[consentType];

    // Obter informações do navegador
    const userAgent = navigator.userAgent;
    const deviceInfo = getDeviceInfo();

    // Inserir log de consentimento
    const { data, error } = await supabase
      .from('consent_logs')
      .insert({
        user_id: userId,
        consent_type: consentType,
        consent_version: version,
        consent_action: consentAction,
        // IP será preenchido por Edge Function (backend)
        // Frontend não consegue obter IP real devido a NAT/proxies
        ip_address: null,
        user_agent: userAgent,
        device_info: deviceInfo,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[ConsentLogger] Erro ao registrar consentimento:', error);
      // Não bloquear cadastro por erro de log
      // Apenas registrar no console para debugging
      return null;
    }

    console.log('[ConsentLogger] Consentimento registrado:', {
      id: data.id,
      type: consentType,
      version,
      action: consentAction,
    });

    return data.id;
  } catch (err) {
    console.error('[ConsentLogger] Erro inesperado ao registrar consentimento:', err);
    // Não bloquear cadastro por erro de log
    return null;
  }
}

/**
 * Registra múltiplos consentimentos de uma vez
 * Útil durante o cadastro (termos + privacidade + cookies)
 *
 * @param userId - ID do usuário
 * @param consentTypes - Array de tipos de consentimento
 */
export async function logMultipleConsents(
  userId: string,
  consentTypes: ConsentType[]
): Promise<void> {
  try {
    // Registrar todos os consentimentos em paralelo
    await Promise.all(
      consentTypes.map(type =>
        logConsent({
          userId,
          consentType: type,
        })
      )
    );

    console.log('[ConsentLogger] Múltiplos consentimentos registrados:', consentTypes);
  } catch (err) {
    console.error('[ConsentLogger] Erro ao registrar múltiplos consentimentos:', err);
    // Não bloquear cadastro por erro de log
  }
}

/**
 * Revoga um consentimento previamente dado
 *
 * @param userId - ID do usuário
 * @param consentType - Tipo de consentimento a revogar
 * @param reason - Motivo da revogação (opcional)
 */
export async function revokeConsent(
  userId: string,
  consentType: ConsentType,
  reason?: string
): Promise<boolean> {
  try {
    // Chamar função RPC do Supabase para revogar
    const { data, error } = await supabase.rpc('revoke_consent', {
      p_user_id: userId,
      p_consent_type: consentType,
      p_revocation_reason: reason || null,
    });

    if (error) {
      console.error('[ConsentLogger] Erro ao revogar consentimento:', error);
      return false;
    }

    console.log('[ConsentLogger] Consentimento revogado:', {
      type: consentType,
      success: data,
    });

    return data as boolean;
  } catch (err) {
    console.error('[ConsentLogger] Erro inesperado ao revogar consentimento:', err);
    return false;
  }
}

/**
 * Verifica se usuário tem consentimento ativo
 *
 * @param userId - ID do usuário
 * @param consentType - Tipo de consentimento
 * @param version - Versão específica (opcional)
 */
export async function hasActiveConsent(
  userId: string,
  consentType: ConsentType,
  version?: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('has_active_consent', {
      p_user_id: userId,
      p_consent_type: consentType,
      p_consent_version: version || null,
    });

    if (error) {
      console.error('[ConsentLogger] Erro ao verificar consentimento:', error);
      return false;
    }

    return data as boolean;
  } catch (err) {
    console.error('[ConsentLogger] Erro inesperado ao verificar consentimento:', err);
    return false;
  }
}

/**
 * Obtém histórico de consentimentos do usuário
 *
 * @param userId - ID do usuário
 */
export async function getUserConsentHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('consent_logs')
      .select('*')
      .eq('user_id', userId)
      .order('consented_at', { ascending: false });

    if (error) {
      console.error('[ConsentLogger] Erro ao buscar histórico:', error);
      return [];
    }

    return data;
  } catch (err) {
    console.error('[ConsentLogger] Erro inesperado ao buscar histórico:', err);
    return [];
  }
}

/**
 * Verifica se precisa re-consentir (versão de documento mudou)
 *
 * @param userId - ID do usuário
 * @param consentType - Tipo de consentimento
 */
export async function needsReConsent(
  userId: string,
  consentType: ConsentType
): Promise<boolean> {
  try {
    const currentVersion = DOCUMENT_VERSIONS[consentType];
    const hasConsent = await hasActiveConsent(userId, consentType, currentVersion);

    // Precisa re-consentir se não tem consentimento na versão atual
    return !hasConsent;
  } catch (err) {
    console.error('[ConsentLogger] Erro ao verificar necessidade de re-consentimento:', err);
    // Em caso de erro, assumir que precisa re-consentir (segurança)
    return true;
  }
}
