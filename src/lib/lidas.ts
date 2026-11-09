import { useCallback, useEffect, useState } from 'react';

/**
 * Guarda no próprio navegador quais leituras da grade a pessoa marcou como lidas.
 * Não há backend: a marcação vale só para este aparelho/navegador.
 */
export function useLidas(ciclo: number) {
  const chave = `constelacao:lidas:ciclo-${ciclo}`;
  const [lidas, setLidas] = useState<Set<string>>(() => ler(chave));

  useEffect(() => {
    try {
      localStorage.setItem(chave, JSON.stringify([...lidas]));
    } catch {
      /* modo privado ou armazenamento bloqueado: segue sem salvar */
    }
  }, [chave, lidas]);

  const alternar = useCallback((id: string) => {
    setLidas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }, []);

  return { lidas, alternar };
}

function ler(chave: string): Set<string> {
  try {
    const bruto = localStorage.getItem(chave);
    return new Set(bruto ? (JSON.parse(bruto) as string[]) : []);
  } catch {
    return new Set();
  }
}
