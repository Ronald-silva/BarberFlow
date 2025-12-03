// Funções de formatação

/**
 * Formata valor em centavos para real brasileiro
 * @param cents - Valor em centavos
 * @returns String formatada (ex: "R$ 49,90")
 */
export function formatCurrency(cents: number): string {
  const reais = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
}

/**
 * Formata telefone brasileiro
 * @param phone - Telefone com DDD (ex: "11999999999")
 * @returns String formatada (ex: "(11) 99999-9999")
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

/**
 * Formata telefone para formato internacional
 * @param phone - Telefone com DDD (ex: "11999999999")
 * @returns String formatada (ex: "+5511999999999")
 */
export function formatPhoneInternational(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return `+55${cleaned}`;
}

/**
 * Formata duração em minutos para texto legível
 * @param minutes - Duração em minutos
 * @returns String formatada (ex: "1h 30min")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Formata CPF
 * @param cpf - CPF sem formatação
 * @returns String formatada (ex: "123.456.789-00")
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) {
    return cpf;
  }

  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

/**
 * Trunca texto com reticências
 * @param text - Texto a ser truncado
 * @param maxLength - Comprimento máximo
 * @returns Texto truncado
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Formata slug para URL amigável
 * @param text - Texto a ser convertido
 * @returns Slug formatado
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
}
