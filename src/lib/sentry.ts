// Configuração do Sentry para monitoramento de erros
import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';

function isValidConfiguredDsn(dsn: string | undefined): dsn is string {
  if (!dsn) return false;
  const normalized = dsn.trim();
  if (!normalized) return false;

  // Ignore common placeholder values from .env.example/templates
  const placeholderTokens = ['seu_sentry_dsn_aqui', 'your_sentry_dsn_here', '<sentry_dsn>'];
  if (placeholderTokens.some((token) => normalized.toLowerCase().includes(token))) {
    return false;
  }

  return /^https?:\/\/.+@.+\/\d+$/i.test(normalized);
}

export function initSentry() {
  // Só inicializar Sentry em produção ou se DSN estiver configurado
  if (!isValidConfiguredDsn(SENTRY_DSN)) {
    if (import.meta.env.DEV) {
      console.debug('[Sentry] ignorado: defina VITE_SENTRY_DSN para ativar em dev/prod.');
    }
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,

      // Percentual de sessões para rastreamento de performance
      tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

      // Replay de sessões com erros
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],

      // Filtrar eventos sensíveis
      beforeSend(event, hint) {
        // Não enviar erros em desenvolvimento
        if (ENVIRONMENT === 'development') {
          console.log('Sentry Event (dev):', event);
          return null;
        }

        // Filtrar informações sensíveis
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }

        return event;
      },

      // Ignorar erros conhecidos
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Network request failed',
      ],
    });

    console.log(`✅ Sentry inicializado (${ENVIRONMENT})`);
  } catch (error) {
    console.warn('🔕 Sentry desabilitado por DSN inválido:', error);
  }
}

const sentryEnabled = isValidConfiguredDsn(SENTRY_DSN);

// Helper para capturar exceções manualmente
export function captureSentryException(error: unknown, context?: Record<string, any>) {
  if (!sentryEnabled) return;

  Sentry.captureException(error, {
    contexts: { custom: context },
  });
}

// Helper para capturar mensagens
export function captureSentryMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (!sentryEnabled) return;

  Sentry.captureMessage(message, level);
}

// Helper para setar contexto do usuário
export function setSentryUser(user: { id: string; email?: string; username?: string } | null) {
  if (!sentryEnabled) return;

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

// Helper para adicionar breadcrumb personalizado
export function addSentryBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  if (!sentryEnabled) return;

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}
