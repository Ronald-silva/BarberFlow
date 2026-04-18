// ============================================================
// Shafar — Formatadores BR v2.0
// Moeda, datas, documentos e telefones em padrão brasileiro
// ============================================================

// --------------- MOEDA ---------------

/**
 * Formata valor em REAIS (não centavos) para Real Brasileiro.
 * @example formatBRL(49.9) → "R$ 49,90"
 */
export function formatBRL(reais: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
}

/**
 * Formata valor em centavos para Real Brasileiro (mantido por compatibilidade).
 * @example formatCurrency(4990) → "R$ 49,90"
 */
export function formatCurrency(cents: number): string {
  return formatBRL(cents / 100);
}

/**
 * Parseia string mascarada de moeda para número (em reais).
 * @example parseBRL("R$ 49,90") → 49.9
 */
export function parseBRL(masked: string): number {
  const cleaned = masked.replace(/[R$\s.]/g, '').replace(',', '.');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

// --------------- TELEFONE ---------------

/**
 * Formata telefone celular ou fixo com DDD.
 * @example formatPhone("11999999999") → "(11) 99999-9999"
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
 * Aplica máscara progressiva de telefone conforme o usuário digita.
 * Aceita tanto celular (11 dígitos) quanto fixo (10 dígitos).
 */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Formata telefone para formato internacional (+55).
 */
export function formatPhoneInternational(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return `+55${cleaned}`;
}

// --------------- DOCUMENTOS ---------------

/**
 * Aplica máscara progressiva de CPF: NNN.NNN.NNN-NN
 */
export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Formata CPF já completo: NNN.NNN.NNN-NN
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

/**
 * Aplica máscara progressiva de CNPJ: NN.NNN.NNN/NNNN-NN
 */
export function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Formata CNPJ já completo: NN.NNN.NNN/NNNN-NN
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
}

/**
 * Aplica máscara progressiva de CPF ou CNPJ — detecta automaticamente pelo comprimento.
 */
export function maskCPFCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  // CPF enquanto tiver <= 11 dígitos
  if (digits.length <= 11) return maskCPF(digits);
  // CNPJ a partir de 12 dígitos
  return maskCNPJ(digits);
}

/**
 * Formata CPF ou CNPJ já completo — detecta automaticamente.
 */
export function formatCPFCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 11) return formatCPF(cleaned);
  if (cleaned.length === 14) return formatCNPJ(cleaned);
  return value;
}

// --------------- MOEDA — MÁSCARA INPUT ---------------

/**
 * Aplica máscara de moeda BRL ao digitar (ex.: "R$ 0,00").
 * Mantém centavos à direita e desloca para esquerda a cada dígito.
 */
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits || digits === '0' || digits === '00') return 'R$ 0,00';
  const number = parseInt(digits, 10) / 100;
  return formatBRL(number);
}

// --------------- DATAS ---------------

/**
 * Formata data ISO para padrão brasileiro.
 * @example formatDateBR("2026-04-18") → "18/04/2026"
 */
export function formatDateBR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formata data e hora em padrão brasileiro.
 * @example formatDateTimeBR("2026-04-18T15:30:00") → "18/04/2026 às 15:30"
 */
export function formatDateTimeBR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(',', ' às');
}

// --------------- DURAÇÃO ---------------

/**
 * Formata duração em minutos para texto legível.
 * @example formatDuration(90) → "1h 30min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
}

// --------------- TEXTO ---------------

/**
 * Trunca texto com reticências.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Converte texto para slug URL-friendly.
 * @example slugify("Navalha Dourada") → "navalha-dourada"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}


