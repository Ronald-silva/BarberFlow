// Funções de LocalStorage com type safety

/**
 * Salva item no localStorage
 */
export function setItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error);
  }
}

/**
 * Recupera item do localStorage
 */
export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error(`Erro ao recuperar ${key} do localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Remove item do localStorage
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Erro ao remover ${key} do localStorage:`, error);
  }
}

/**
 * Limpa todo localStorage
 */
export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Erro ao limpar localStorage:', error);
  }
}

/**
 * Verifica se item existe no localStorage
 */
export function hasItem(key: string): boolean {
  return localStorage.getItem(key) !== null;
}
