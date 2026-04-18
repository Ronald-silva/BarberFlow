import { useState, useCallback, ChangeEvent } from 'react';
import { maskPhone, maskCPF, maskCNPJ, maskCPFCNPJ, maskCurrency } from '../utils/formatters';
import { isValidPhone, isValidCPF, isValidCNPJ, isValidCPFCNPJ } from '../utils/validators';

export type MaskType = 'phone' | 'cpf' | 'cnpj' | 'cpfCnpj' | 'currency' | 'none';

interface UseMaskOptions {
  mask: MaskType;
  initialValue?: string;
  onChange?: (raw: string, masked: string) => void;
}

interface UseMaskReturn {
  value: string;
  rawValue: string;
  isValid: boolean | null; // null = não preenchido ainda
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setValue: (raw: string) => void;
  reset: () => void;
}

const maskFns: Record<MaskType, (v: string) => string> = {
  phone: maskPhone,
  cpf: maskCPF,
  cnpj: maskCNPJ,
  cpfCnpj: maskCPFCNPJ,
  currency: maskCurrency,
  none: (v) => v,
};

const validFns: Partial<Record<MaskType, (v: string) => boolean>> = {
  phone: isValidPhone,
  cpf: isValidCPF,
  cnpj: isValidCNPJ,
  cpfCnpj: isValidCPFCNPJ,
};

export function useMask({ mask, initialValue = '', onChange }: UseMaskOptions): UseMaskReturn {
  const applyMask = useCallback((raw: string) => maskFns[mask](raw), [mask]);

  const [value, setValue_] = useState<string>(() => applyMask(initialValue));

  const getRaw = useCallback(
    (masked: string) => {
      if (mask === 'currency') {
        // Raw = apenas dígitos para moeda
        return masked.replace(/\D/g, '');
      }
      return masked.replace(/\D/g, '');
    },
    [mask]
  );

  const rawValue = getRaw(value);

  const isValid: boolean | null = (() => {
    if (!rawValue) return null;
    const validator = validFns[mask];
    if (!validator) return null;
    return validator(rawValue);
  })();

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const masked = applyMask(e.target.value);
      setValue_(masked);
      const raw = getRaw(masked);
      onChange?.(raw, masked);
    },
    [applyMask, getRaw, onChange]
  );

  const setValueExternal = useCallback(
    (raw: string) => {
      setValue_(applyMask(raw));
    },
    [applyMask]
  );

  const reset = useCallback(() => setValue_(''), []);

  return {
    value,
    rawValue,
    isValid,
    onChange: handleChange,
    setValue: setValueExternal,
    reset,
  };
}
