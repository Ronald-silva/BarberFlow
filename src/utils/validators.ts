// Funções de validação

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida telefone brasileiro (celular)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 11 && cleaned.startsWith('11');
}

/**
 * Valida CPF
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false; // Todos os dígitos iguais

  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

/**
 * Valida se string não está vazia
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Valida se valor é maior que zero
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Valida URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida se data é futura
 */
export function isFutureDate(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Valida senha forte
 * Mínimo 8 caracteres, pelo menos uma letra e um número
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasLetter && hasNumber;
}
