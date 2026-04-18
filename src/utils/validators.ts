// ============================================================
// Shafar — Validadores BR v2.0
// ============================================================

/** Valida email */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida telefone brasileiro (celular ou fixo) — aceita qualquer DDD.
 * Aceita formato mascarado: (11) 99999-9999 ou apenas dígitos.
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Celular: 11 dígitos (DDD + 9 dígitos começando com 9)
  if (cleaned.length === 11) {
    const ddd = parseInt(cleaned.slice(0, 2));
    return ddd >= 11 && ddd <= 99 && cleaned[2] === '9';
  }
  // Fixo: 10 dígitos
  if (cleaned.length === 10) {
    const ddd = parseInt(cleaned.slice(0, 2));
    return ddd >= 11 && ddd <= 99;
  }
  return false;
}

/**
 * Valida CPF com cálculo de dígitos verificadores.
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false; // Todos os dígitos iguais

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned.charAt(i)) * (10 - i);
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned.charAt(i)) * (11 - i);
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

/**
 * Valida CNPJ com cálculo de dígitos verificadores.
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const calcDigit = (base: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += parseInt(base[i]) * weights[i];
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calcDigit(cleaned.slice(0, 12), weights1);
  if (d1 !== parseInt(cleaned[12])) return false;

  const d2 = calcDigit(cleaned.slice(0, 13), weights2);
  if (d2 !== parseInt(cleaned[13])) return false;

  return true;
}

/**
 * Valida CPF ou CNPJ automaticamente pelo comprimento.
 */
export function isValidCPFCNPJ(value: string): boolean {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 11) return isValidCPF(cleaned);
  if (cleaned.length === 14) return isValidCNPJ(cleaned);
  return false;
}

/** Valida se string não está vazia */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/** Valida se valor é maior que zero */
export function isPositive(value: number): boolean {
  return value > 0;
}

/** Valida URL */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/** Valida se data é futura */
export function isFutureDate(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Valida senha forte.
 * Mínimo 8 caracteres, pelo menos uma letra e um número.
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
}


