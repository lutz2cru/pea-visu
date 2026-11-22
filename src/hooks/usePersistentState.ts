import { useEffect, useState } from 'react';

/**
 * useState mémorisé dans le localStorage du navigateur.
 * Si le stockage est indisponible (navigation privée, données effacées…), l'état fonctionne normalement sans persistance.
 */
export function usePersistentState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      // valeur illisible ou stockage bloqué : on repart de la valeur initiale
    }
    return typeof initial === 'function' ? (initial as () => T)() : initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // stockage indisponible : la préférence ne sera simplement pas mémorisée
    }
  }, [key, value]);

  return [value, setValue] as const;
}
