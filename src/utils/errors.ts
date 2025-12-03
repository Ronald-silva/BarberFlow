// Tratamento de erros

/**
 * Classe customizada para erros de validação
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Classe customizada para erros de autenticação
 */
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Classe customizada para erros de autorização
 */
export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Classe customizada para erros de API
 */
export class APIError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
  }
}

/**
 * Extrai mensagem de erro legível de diferentes tipos de erro
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Ocorreu um erro inesperado';
}

/**
 * Registra erro no console (em dev) ou serviço de logging (em prod)
 */
export function logError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);
  const prefix = context ? `[${context}]` : '';

  console.error(`${prefix} Erro:`, error);

  // Enviar para Sentry em produção
  const env = import.meta.env as any;
  if (env.PROD) {
    // Lazy import para evitar carregar Sentry em dev
    import('../lib/sentry').then(({ captureSentryException }) => {
      captureSentryException(error, { context });
    });
  }
}

/**
 * Retorna mensagem de erro amigável baseada no tipo
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof AuthenticationError) {
    return 'Erro de autenticação. Por favor, faça login novamente.';
  }

  if (error instanceof AuthorizationError) {
    return 'Você não tem permissão para realizar esta ação.';
  }

  if (error instanceof APIError) {
    if (error.statusCode === 404) {
      return 'Recurso não encontrado.';
    }
    if (error.statusCode === 500) {
      return 'Erro no servidor. Tente novamente mais tarde.';
    }
    return error.message;
  }

  return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
}
